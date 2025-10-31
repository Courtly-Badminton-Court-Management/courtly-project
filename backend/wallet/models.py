# backend/wallet/models.py
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
    STATUS_PENDING = "pending"
    STATUS_APPROVED = "approved"
    STATUS_REJECTED = "rejected"
    STATUS_CHOICES = [
        (STATUS_PENDING, "Pending"),
        (STATUS_APPROVED, "Approved"),
        (STATUS_REJECTED, "Rejected"),
    ]

    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name="topups")
    amount_thb = models.PositiveIntegerField()
    coins = models.PositiveIntegerField(default=0)
    transfer_date = models.DateField(null=True,
                                     blank=True)
    transfer_time = models.TimeField(null=True,
                                     blank=True)
    slip_path = models.ImageField(upload_to="wallet/slips/%Y/%m/%d/",
                                  max_length=255,
                                  null=True, blank=True)

    status = models.CharField(max_length=16, choices=STATUS_CHOICES, default=STATUS_PENDING)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ["-created_at"]


class Wallet(models.Model):
    user = models.OneToOneField(settings.AUTH_USER_MODEL, on_delete=models.CASCADE)
    balance = models.IntegerField(default=1000)  # ✅ default 1000 coins
    def __str__(self):
        return f"{self.user.username} - {self.balance} coins"