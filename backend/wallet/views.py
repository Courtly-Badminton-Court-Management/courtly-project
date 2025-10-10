# wallet/views.py
from django.db import models
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from .models import CoinLedger
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import permissions
from .models import Wallet

class WalletBalanceView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        balance = CoinLedger.objects.filter(user=request.user).aggregate(total=models.Sum("amount"))["total"] or 0
        return Response({"balance": balance})


class WalletMeView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        wallet, _ = Wallet.objects.get_or_create(user=request.user, defaults={"balance": 1000})
        return Response({"balance": wallet.balance})