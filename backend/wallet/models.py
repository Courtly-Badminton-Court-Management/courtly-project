from django.db import models
from django.conf import settings
from booking.models import Booking
from django.db import models
from django.conf import settings


class CoinLedger(models.Model):
    """(topup/capture/refund)"""
    TYPE = (("topup", "topup"), ("capture", "capture"), ("refund", "refund"))

    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name="coin_ledger")
    type = models.CharField(max_length=16, choices=TYPE)  # topup / capture / refund
    amount = models.IntegerField(help_text="+ เข้า (topup/refund), - ออก (capture)")
    ref_booking = models.ForeignKey(Booking, null=True, blank=True,
                                    on_delete=models.SET_NULL, related_name="ledger_entries")
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        indexes = [models.Index(fields=["user", "created_at"])]


class TopupRequest(models.Model):
    STATUS = (("pending", "pending"), ("approved", "approved"), ("rejected", "rejected"))

    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name="topup_requests")
    amount_thb = models.IntegerField()
    coins = models.IntegerField()
    slip_path = models.TextField()
    status = models.CharField(max_length=16, choices=STATUS, default="pending")
    created_at = models.DateTimeField(auto_now_add=True)


class Wallet(models.Model):
    user = models.OneToOneField(settings.AUTH_USER_MODEL, on_delete=models.CASCADE)
    balance = models.IntegerField(default=1000)  # ✅ default 1000 coins

    def __str__(self):
        return f"{self.user.username} - {self.balance} coins"
