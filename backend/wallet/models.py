# backend/wallet/models.py
from django.db import models
from django.conf import settings
from django.core.files.storage import default_storage  # ✅ import เพิ่ม
from booking.models import Booking


class CoinLedger(models.Model):
    """(topup/capture/refund)"""
    TYPE = (("topup", "topup"), ("capture", "capture"), ("refund", "refund"))
    user = models.ForeignKey(
        settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name="coin_ledger"
    )
    type = models.CharField(max_length=16, choices=TYPE)
    amount = models.IntegerField(help_text="+ เข้า (topup/refund), - ออก (capture)")
    ref_booking = models.ForeignKey(
        Booking, null=True, blank=True, on_delete=models.SET_NULL, related_name="ledger_entries"
    )
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        indexes = [models.Index(fields=["user", "created_at"])]

    def __str__(self):
        return f"{self.user.username} | {self.type} | {self.amount}"


class TopupRequest(models.Model):
    STATUS_PENDING = "pending"
    STATUS_APPROVED = "approved"
    STATUS_REJECTED = "rejected"
    STATUS_CHOICES = [
        (STATUS_PENDING, "Pending"),
        (STATUS_APPROVED, "Approved"),
        (STATUS_REJECTED, "Rejected"),
    ]

    user = models.ForeignKey(
        settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name="topups"
    )
    amount_thb = models.PositiveIntegerField()
    coins = models.PositiveIntegerField(default=0)
    transfer_date = models.DateField(null=True, blank=True)
    transfer_time = models.TimeField(null=True, blank=True)

    # ✅ ใช้ default_storage เพื่อบังคับให้ทุกครั้งใช้ S3Storage (DigitalOcean Spaces)
    slip_path = models.ImageField(
        upload_to="wallet/slips/%Y/%m/%d/",
        max_length=255,
        null=True,
        blank=True,
        storage=default_storage,  # ✅ ตรงนี้สำคัญ
    )

    status = models.CharField(
        max_length=16, choices=STATUS_CHOICES, default=STATUS_PENDING
    )
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ["-created_at"]

    def __str__(self):
        return f"Topup {self.id} - {self.user.username} ({self.status})"


class Wallet(models.Model):
    user = models.OneToOneField(settings.AUTH_USER_MODEL, on_delete=models.CASCADE)
    balance = models.IntegerField(default=0)

    def __str__(self):
        return f"{self.user.username} - {self.balance} coins"
