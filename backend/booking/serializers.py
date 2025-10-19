from rest_framework import serializers
from .models import Slot, Booking, BookingSlot, SlotStatus


# ────────────────────────────── SlotStatus Serializer ──────────────────────────────
class SlotStatusSerializer(serializers.ModelSerializer):
    """Serializer for SlotStatus — shows current slot status and last update time."""
    class Meta:
        model = SlotStatus
        fields = ["status", "updated_at"]


# ────────────────────────────── Slot Serializer ──────────────────────────────
class SlotSerializer(serializers.ModelSerializer):
    """
    Serializer for the Slot model.
    - Converts start_at and end_at to local time (HH:MM format).
    - Includes the related SlotStatus.
    """
    slot_status = SlotStatusSerializer(read_only=True)
    start_time = serializers.SerializerMethodField()
    end_time = serializers.SerializerMethodField()

    class Meta:
        model = Slot
        fields = ["id", "court", "service_date", "start_time", "end_time", "price_coins", "slot_status"]

    def get_start_time(self, obj):
        """Return slot start time in 'HH:MM' format (Asia/Bangkok)."""
        return obj.start_at.astimezone().strftime("%H:%M")

    def get_end_time(self, obj):
        """Return slot end time in 'HH:MM' format (Asia/Bangkok)."""
        return obj.end_at.astimezone().strftime("%H:%M")


# ────────────────────────────── Booking Serializer ──────────────────────────────
class BookingSerializer(serializers.ModelSerializer):
    """
    Serializer for Booking.
    - Shows readable names (user, club, court) instead of numeric IDs.
    - Includes nested slot details under 'slots'.
    """
    user = serializers.CharField(source="user.username", read_only=True)
    club_name = serializers.CharField(source="club.name", read_only=True)
    court_name = serializers.CharField(source="court.name", read_only=True)
    slots = serializers.SerializerMethodField()

    class Meta:
        model = Booking
        fields = [
            "booking_no",
            "status",
            "user",
            "club_name",
            "court_name",
            "total_cost",
            "booking_date",
            "created_at",
            "slots",
        ]

    def get_slots(self, obj):
        """Return a list of all slots belonging to this booking."""
        slots = BookingSlot.objects.filter(booking=obj).select_related("slot", "slot__court")
        data = []
        for s in slots:
            data.append({
                "slot_id": s.slot.id,
                "service_date": s.slot.service_date.strftime("%Y-%m-%d"),
                "start_time": s.slot.start_at.astimezone().strftime("%H:%M"),
                "end_time": s.slot.end_at.astimezone().strftime("%H:%M"),
                "court_name": s.slot.court.name,
            })
        return data


# ────────────────────────────── BookingItem Serializer ──────────────────────────────
class BookingItemSerializer(serializers.Serializer):
    """
    Represents a single booking item (one court and time range).
    Supports flexible date/time input formats.
    """
    court = serializers.IntegerField()
    date = serializers.CharField()   # Accepts multiple date formats
    start = serializers.CharField()
    end = serializers.CharField()

    def validate(self, data):
        from datetime import datetime

        # Parse date (supports 'YYYY-MM-DD' or 'DD Mon YYYY')
        try:
            try:
                data["date"] = datetime.strptime(data["date"], "%Y-%m-%d").date()
            except ValueError:
                data["date"] = datetime.strptime(data["date"], "%d %b %Y").date()  # e.g. "18 Oct 2025"
        except Exception:
            raise serializers.ValidationError({"date": "Invalid date format (use YYYY-MM-DD or DD Mon YYYY)"})

        # Parse time (supports 'HH:MM' or 'HH:MM AM/PM')
        try:
            try:
                data["start"] = datetime.strptime(data["start"], "%H:%M").time()
                data["end"] = datetime.strptime(data["end"], "%H:%M").time()
            except ValueError:
                data["start"] = datetime.strptime(data["start"], "%I:%M %p").time()  # e.g. "12:00 PM"
                data["end"] = datetime.strptime(data["end"], "%I:%M %p").time()
        except Exception:
            raise serializers.ValidationError({"time": "Invalid time format (use HH:MM or HH:MM AM/PM)"})

        # Ensure start time < end time
        if data["start"] >= data["end"]:
            raise serializers.ValidationError("Start time must be before end time.")

        return data


# ────────────────────────────── BookingCreate Serializer ──────────────────────────────
class BookingCreateSerializer(serializers.Serializer):
    """Serializer used when creating a booking (multiple booking items)."""
    club = serializers.IntegerField()
    items = BookingItemSerializer(many=True)

    def validate(self, data):
        """Validate that all booking items have start < end."""
        for it in data["items"]:
            if it["start"] >= it["end"]:
                raise serializers.ValidationError("Start time must be before end time.")
        return data


# ────────────────────────────── BookingSlot Serializer ──────────────────────────────
class BookingSlotSerializer(serializers.ModelSerializer):
    """Serializer for the intermediate BookingSlot model (booking ↔ slot relation)."""
    class Meta:
        model = BookingSlot
        fields = ["slot", "slot__court", "slot__service_date", "slot__start_at", "slot__end_at"]


# ────────────────────────────── BookingHistory Serializer ──────────────────────────────
class BookingHistorySerializer(serializers.ModelSerializer):
    """
    Serializer for booking history (used in /api/history/).
    Includes slot details for each booking.
    """
    slots = BookingSlotSerializer(source="bookingslot_set", many=True)

    class Meta:
        model = Booking
        fields = ["booking_no", "status", "created_at", "slots"]
