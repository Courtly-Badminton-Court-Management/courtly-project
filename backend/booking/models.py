from django.db import models
from django.conf import settings
from core.models import Club, Court


# ────────────────────────────── Slot ──────────────────────────────
class Slot(models.Model):
    """
    Represents a 30-minute atomic time slot for a specific court.
    Each slot is uniquely identified by its court and start time.
    """
    court = models.ForeignKey(Court, on_delete=models.CASCADE, related_name="slots")
    service_date = models.DateField()
    start_at = models.DateTimeField()
    end_at = models.DateTimeField()
    dow = models.PositiveSmallIntegerField(default=0)  # Day of week (0 = Mon ... 6 = Sun)
    price_coins = models.PositiveIntegerField(default=50)  # Cost per slot in coins

    class Meta:
        unique_together = (("court", "start_at"),)
        indexes = [models.Index(fields=["court", "service_date"])]

    def __str__(self):
        return f"{self.court} {self.start_at.isoformat()}"


# ────────────────────────────── Slot Status ──────────────────────────────
class SlotStatus(models.Model):
    """
    Tracks the current state of a Slot.
    Each slot has exactly one status record (1:1 relation).
    """
    STATUS = (
        ("available", "Available"),      # Free to book
        ("booked", "Booked"),            # Reserved by a player
        ("walkin", "Walk-in"),           # Manually booked by a manager
        ("checkin", "Check-in"),         # Player has arrived
        ("endgame", "Endgame"),          # Playtime finished
        ("expired", "Expired"),          # Time passed but unbooked
        ("no_show", "No-Show"),          # Booked but player didn’t check-in
        ("maintenance", "Maintenance"),  # Temporarily unavailable
    )

    slot = models.OneToOneField('booking.Slot', on_delete=models.CASCADE, related_name='slot_status')
    status = models.CharField(max_length=20, choices=STATUS, default="available")
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"Slot {self.slot_id} - {self.status}"


# ────────────────────────────── Booking ──────────────────────────────
class Booking(models.Model):
    """
    Represents a single booking transaction made by a user.
    Each booking can include one or more slots (via BookingSlot).
    """
    STATUS = (
        ("pending", "pending"),        # Created but not confirmed yet
        ("confirmed", "confirmed"),    # Successfully booked
        ("walkin", "walkin"),          # Manually created by a manager
        ("checkin", "checkin"),        # User or walk-in has started playing
        ("endgame", "endgame"),        # Playtime finished
        ("cancelled", "cancelled"),    # Cancelled before playtime
        ("completed", "completed"),    # Successfully finished booking
        ("no_show", "no_show"),        # Player did not show up
    )

    booking_no = models.CharField(max_length=24, unique=True)

    # Relationships
    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        null=True, blank=True,
        on_delete=models.SET_NULL,
        related_name="bookings"
    )
    club = models.ForeignKey(Club, on_delete=models.PROTECT, related_name="bookings")
    court = models.ForeignKey(Court, on_delete=models.PROTECT, related_name="bookings")
    slot = models.ForeignKey("Slot", null=True, blank=True, on_delete=models.SET_NULL, related_name="bookings")

    # Status and timestamps
    status = models.CharField(max_length=20, choices=STATUS, default="confirmed")
    created_at = models.DateTimeField(auto_now_add=True)

    # Extra fields
    total_cost = models.PositiveIntegerField(null=True, blank=True)  # Total cost in coins
    booking_date = models.DateField(null=True, blank=True)           # The actual date of play

    # Manager booking fields
    customer_name = models.CharField(max_length=100, null=True, blank=True)
    contact_method = models.CharField(max_length=50, null=True, blank=True)
    contact_detail = models.CharField(max_length=255, null=True, blank=True)

    def __str__(self):
        return self.booking_no


# ────────────────────────────── BookingSlot ──────────────────────────────
class BookingSlot(models.Model):
    """
    Links a Booking to its corresponding Slot(s).
    Each slot can belong to only one booking (One-to-One with Slot).
    """
    booking = models.ForeignKey(Booking, on_delete=models.CASCADE, related_name="booking_slots")
    slot = models.OneToOneField(Slot, on_delete=models.CASCADE, related_name="booked_by")

    class Meta:
        indexes = [models.Index(fields=["booking"])]

    def __str__(self):
        return f"{self.booking.booking_no} → slot {self.slot_id}"

