# backend/wallet/views.py
from django.db import transaction
from django.db.models import Sum
from django.http import HttpResponse
from django.shortcuts import get_object_or_404
from django.utils.encoding import smart_str
import csv

from rest_framework import viewsets, mixins, status
from rest_framework.decorators import action
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework.parsers import MultiPartParser, FormParser

from .models import CoinLedger, TopupRequest
from .serializers import (
    WalletBalanceSerializer,
    CoinLedgerSerializer,
    TopupRequestCreateSerializer,
    TopupRequestListSerializer,
)
from .permissions import IsManager


class WalletBalanceView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        """
        Return REAL wallet balance using CoinLedger as the source of truth.
        (Wallet.balance is ignored to prevent mismatch issues)
        """
        ledger_sum = (
            CoinLedger.objects.filter(user=request.user)
            .aggregate(s=Sum("amount"))
            .get("s") or 0
        )

        return Response({"balance": int(ledger_sum)})


class CoinLedgerViewSet(mixins.ListModelMixin, viewsets.GenericViewSet):
    serializer_class = CoinLedgerSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        qs = CoinLedger.objects.select_related("ref_booking").order_by("-created_at")
        if IsManager().has_permission(self.request, self):
            user_id = self.request.query_params.get("user")
            return qs.filter(user_id=user_id) if user_id else qs
        return qs.filter(user=self.request.user)

    @action(detail=False, methods=["get"], url_path="export-csv")
    def export_csv(self, request):
        qs = self.get_queryset().select_related("user")
        resp = HttpResponse(content_type="text/csv; charset=utf-8")
        resp["Content-Disposition"] = 'attachment; filename="wallet_transactions.csv"'
        resp.write("\ufeff")
        writer = csv.writer(resp)
        writer.writerow(["Reference ID", "Username", "Amount", "Date", "Type", "Status"])
        for row in qs:
            writer.writerow([
                row.id,
                smart_str(getattr(row.user, "username", "")),
                row.amount,
                row.created_at.strftime("%d %b %Y, %H:%M"),
                row.type.capitalize(),
                "Approved",
            ])
        return resp


class TopupRequestViewSet(viewsets.ModelViewSet):
    permission_classes = [IsAuthenticated]
    parser_classes = [MultiPartParser, FormParser]

    def get_queryset(self):
        qs = TopupRequest.objects.select_related("user").order_by("-created_at")
        if IsManager().has_permission(self.request, self):
            user_id = self.request.query_params.get("user")
            status_q = self.request.query_params.get("status")
            if user_id:
                qs = qs.filter(user_id=user_id)
            if status_q in {"pending", "approved", "rejected"}:
                qs = qs.filter(status=status_q)
            return qs
        return qs.filter(user=self.request.user)

    def get_serializer_class(self):
        if self.action == "create":
            return TopupRequestCreateSerializer
        return TopupRequestListSerializer

    def get_serializer_context(self):
        """Ensure request is passed to serializer for building URLs."""
        context = super().get_serializer_context()
        context.update({"request": self.request})
        return context

    @transaction.atomic
    @action(detail=True, methods=["post"], permission_classes=[IsManager])
    def approve(self, request, pk=None):
        topup = (
            TopupRequest.objects.select_for_update()
            .select_related("user")
            .filter(pk=pk)
            .first()
        )
        topup = get_object_or_404(TopupRequest, pk=pk) if topup is None else topup

        if topup.status != "pending":
            return Response({"detail": "This request was already processed."},
                            status=status.HTTP_400_BAD_REQUEST)

        # 1) Update topup status
        topup.status = "approved"
        topup.save(update_fields=["status"])

        # 2) Create ledger entry
        ledger = CoinLedger.objects.create(
            user=topup.user,
            type="topup",
            amount=topup.coins,
            ref_booking=None
        )

        # 3) Sync Wallet.balance to match with ledger
        from django.db.models import Sum
        from .models import Wallet

        ledger_sum = (
                CoinLedger.objects.filter(user=topup.user)
                .aggregate(s=Sum("amount"))
                .get("s") or 0
        )

        wallet, _ = Wallet.objects.get_or_create(user=topup.user)
        wallet.balance = ledger_sum
        wallet.save(update_fields=["balance"])

        # 4) Return response
        data = TopupRequestListSerializer(topup, context={"request": request}).data
        data["ledger_id"] = ledger.id
        return Response(data, status=status.HTTP_200_OK)

    @transaction.atomic
    @action(detail=True, methods=["post"], permission_classes=[IsManager])
    def reject(self, request, pk=None):
        topup = TopupRequest.objects.select_for_update().filter(pk=pk).first()
        topup = get_object_or_404(TopupRequest, pk=pk) if topup is None else topup
        if topup.status != "pending":
            return Response({"detail": "This request was already processed."},
                            status=status.HTTP_400_BAD_REQUEST)

        topup.status = "rejected"
        topup.save(update_fields=["status"])
        return Response(TopupRequestListSerializer(topup, context={"request": request}).data,
                        status=status.HTTP_200_OK)
