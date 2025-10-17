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
    dow = models.PositiveSmallIntegerField(default=0)  # 0=Mon..6=Sun
    price_coins = models.PositiveIntegerField(default=50)

    class Meta:
        unique_together = (("court", "start_at"),)
        indexes = [models.Index(fields=["court", "service_date"])]

    def __str__(self):
        return f"{self.court} {self.start_at.isoformat()}"


class SlotStatus(models.Model):
    STATUS = (
        ("available", "Available"),  # Free to book
        ("booked", "Booked"),  # Booked by a player
        ("walkin", "Walk-in"),  # Booked manually by manager
        ("checkin", "Check-in"),  # Player arrived and started playing
        ("endgame", "Endgame"),  # Playtime finished
        ("expired", "Expired"),  # Past time but unbooked
        ("no_show", "No-Show"),  # Booked but player didn’t check-in
        ("maintenance", "Maintenance"),  # Temporarily unavailable
    )

    slot = models.OneToOneField('booking.Slot', on_delete=models.CASCADE, related_name='slot_status')
    status = models.CharField(max_length=20, choices=STATUS, default="available")
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"Slot {self.slot_id} - {self.status}"


class Booking(models.Model):
    STATUS = (
        ("pending", "pending"),  # created but not confirmed
        ("confirmed", "confirmed"),  # booked successfully
        ("walkin", "walkin"),  # created manually by manager
        ("checkin", "checkin"),  # user or walk-in started playing
        ("endgame", "endgame"),  # playtime finished
        ("cancelled", "cancelled"),  # cancelled before playtime
        ("completed", "completed"),  # booking finished successfully
        ("no_show", "no_show"),  # player did not show up
    )

    booking_no = models.CharField(max_length=24, unique=True)
    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        null=True, blank=True,
        on_delete=models.SET_NULL,
        related_name="bookings"
    )
    club = models.ForeignKey(Club, on_delete=models.PROTECT, related_name="bookings")
    court = models.ForeignKey(Court, on_delete=models.PROTECT, related_name="bookings")
    slot = models.ForeignKey("Slot", null=True, blank=True, on_delete=models.SET_NULL, related_name="bookings")

    status = models.CharField(max_length=20, choices=STATUS, default="confirmed")
    created_at = models.DateTimeField(auto_now_add=True)

    # ✅ two new fields
    total_cost = models.PositiveIntegerField(null=True, blank=True)  # total coins cost
    booking_date = models.DateField(null=True, blank=True)  # actual booked play date

    def __str__(self):
        return self.booking_no


class BookingSlot(models.Model):
    booking = models.ForeignKey(Booking, on_delete=models.CASCADE, related_name="booking_slots")
    slot = models.OneToOneField(Slot, on_delete=models.CASCADE, related_name="booked_by")  # unique per slot

    class Meta:
        indexes = [models.Index(fields=["booking"])]

    def __str__(self):
        return f"{self.booking.booking_no} → slot {self.slot_id}"
