# booking/models.py
from django.db import models
from django.conf import settings
from core.models import Club, Court


class Slot(models.Model):
    """30-min atomic slot"""
    court = models.ForeignKey(Court, on_delete=models.CASCADE, related_name="slots")
    service_date = models.DateField()
    start_at = models.DateTimeField()
    end_at = models.DateTimeField()
    dow = models.PositiveSmallIntegerField(default=0)   # 0=Mon..6=Sun
    price_coins = models.PositiveIntegerField(default=50)

    class Meta:
        unique_together = (("court", "start_at"),)
        indexes = [models.Index(fields=["court", "service_date"])]

    def __str__(self):
        return f"{self.court} {self.start_at.isoformat()}"


class SlotStatus(models.Model):
    """One status record per Slot"""
    STATUS = (
        ("available", "available"),
        ("booked", "booked"),
        ("maintenance", "maintenance"),
    )
    # IMPORTANT: use string ref and a non-conflicting related_name
    slot = models.OneToOneField('booking.Slot', on_delete=models.CASCADE, related_name='slot_status')
    status = models.CharField(max_length=20, choices=STATUS, default="available")
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        verbose_name = "Slot Status"
        verbose_name_plural = "Slot Statuses"

    def __str__(self):
        return f"Slot {self.slot_id} - {self.status}"


class Booking(models.Model):
    STATUS = (
        ("pending", "pending"),
        ("confirmed", "confirmed"),
        ("checked_in", "checked_in"),
        ("cancelled", "cancelled"),
        ("completed", "completed"),
        ("no_show", "no_show"),
    )

    booking_no = models.CharField(max_length=24, unique=True)
    user = models.ForeignKey(settings.AUTH_USER_MODEL, null=True, blank=True,
                             on_delete=models.SET_NULL, related_name="bookings")
    club = models.ForeignKey(Club, on_delete=models.PROTECT, related_name="bookings")
    court = models.ForeignKey(Court, on_delete=models.PROTECT, related_name="bookings")
    slot = models.ForeignKey("Slot", null=True, blank=True, on_delete=models.SET_NULL, related_name="bookings")

    status = models.CharField(max_length=20, choices=STATUS, default="confirmed")
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return self.booking_no


class BookingSlot(models.Model):
    booking = models.ForeignKey(Booking, on_delete=models.CASCADE, related_name="booking_slots")
    slot = models.OneToOneField(Slot, on_delete=models.CASCADE, related_name="booked_by")  # unique per slot

    class Meta:
        indexes = [models.Index(fields=["booking"])]

    def __str__(self):
        return f"{self.booking.booking_no} → slot {self.slot_id}"