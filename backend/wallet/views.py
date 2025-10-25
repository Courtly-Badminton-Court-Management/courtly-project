from django.db import transaction
from django.db.models import Sum
from django.http import HttpResponse
from django.shortcuts import get_object_or_404
from django.utils.encoding import smart_str
import csv

from rest_framework import viewsets, mixins, permissions, status
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
    """
    GET /api/wallet/balance/  -> {"balance": <int>}
    Used by the header chip showing current coins.
    """
    permission_classes = [IsAuthenticated]

    def get(self, request):
        total = (CoinLedger.objects
                 .filter(user=request.user)
                 .aggregate(s=Sum("amount"))["s"]) or 0
        return Response({"balance": int(total)})


class CoinLedgerViewSet(mixins.ListModelMixin, viewsets.GenericViewSet):
    """
    GET /api/wallet/ledger/ -> transaction history.
    - Players see their own rows.
    - Managers can see all, or filter by ?user=<id>.
    Also exposes: GET /api/wallet/ledger/export-csv/ for the "Export CSV" button.
    """
    serializer_class = CoinLedgerSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        qs = CoinLedger.objects.select_related("ref_booking").order_by("-created_at")
        # Manager: can see all and optionally filter by user id.
        if IsManager().has_permission(self.request, self):
            user_id = self.request.query_params.get("user")
            return qs.filter(user_id=user_id) if user_id else qs
        # Player: only own transactions
        return qs.filter(user=self.request.user)

    @action(detail=False, methods=["get"], url_path="export-csv")
    def export_csv(self, request):
        """
        Exports the currently viewable transactions to CSV.
        (If manager passes ?user=<id> it exports that user's rows.)
        Adds BOM for proper UTF-8 display in Excel and includes username.
        """
        qs = self.get_queryset().select_related("user")

        resp = HttpResponse(content_type="text/csv; charset=utf-8")
        resp["Content-Disposition"] = 'attachment; filename="wallet_transactions.csv"'
        # Write BOM so Excel on Windows shows UTF-8 correctly
        resp.write("\ufeff")

        writer = csv.writer(resp)
        writer.writerow(["Reference ID", "Username", "Amount", "Date", "Type", "Status"])

        # For ledger rows, status is always 'Approved' (ledger exists after capture)
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
    """
    Top-up requests:
    - Player:
        POST /api/wallet/topups/   -> create new top-up request (pending)
        GET  /api/wallet/topups/   -> list own requests (pending/history)
    - Manager:
        GET  /api/wallet/topups/   -> list all users' requests (filter ?user=&status=)
        POST /api/wallet/topups/{id}/approve/
        POST /api/wallet/topups/{id}/reject/
    """
    permission_classes = [IsAuthenticated]
    parser_classes = [MultiPartParser, FormParser]  # allow slip image upload

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

    @transaction.atomic
    @action(detail=True, methods=["post"], permission_classes=[IsManager])
    def approve(self, request, pk=None):
        """
        Manager approves the request:
        - Lock row (select_for_update) to avoid double approvals
        - Mark as 'approved'
        - Insert a positive CoinLedger 'topup' row with the coin amount
        - Return the updated TopupRequest plus ledger_id for UI refresh
        """
        # Lock row during transaction
        topup = (TopupRequest.objects
                 .select_for_update()
                 .select_related("user")
                 .filter(pk=pk)
                 .first())
        topup = get_object_or_404(TopupRequest, pk=pk) if topup is None else topup

        if topup.status != "pending":
            return Response({"detail": "This request was already processed."},
                            status=status.HTTP_400_BAD_REQUEST)

        topup.status = "approved"
        topup.save(update_fields=["status"])

        ledger = CoinLedger.objects.create(
            user=topup.user,
            type="topup",
            amount=topup.coins,   # credit coins
            ref_booking=None
        )

        data = TopupRequestListSerializer(topup).data
        data["ledger_id"] = ledger.id
        return Response(data, status=status.HTTP_200_OK)

    @transaction.atomic
    @action(detail=True, methods=["post"], permission_classes=[IsManager])
    def reject(self, request, pk=None):
        """
        Manager rejects the request:
        - Lock row (select_for_update)
        - Mark TopupRequest as 'rejected' (no ledger entry)
        - Return updated object for UI refresh
        """
        topup = (TopupRequest.objects
                 .select_for_update()
                 .filter(pk=pk)
                 .first())
        topup = get_object_or_404(TopupRequest, pk=pk) if topup is None else topup

        if topup.status != "pending":
            return Response({"detail": "This request was already processed."},
                            status=status.HTTP_400_BAD_REQUEST)

        topup.status = "rejected"
        topup.save(update_fields=["status"])
        return Response(TopupRequestListSerializer(topup).data, status=status.HTTP_200_OK)
