from rest_framework import serializers
from django.utils import timezone
from datetime import datetime
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
    Serializer for Slot model.
    Converts start_at and end_at to local time (HH:MM format).
    Includes slot_status, court name, and price_coin.
    """
    slot_status = serializers.SerializerMethodField()
    start_time = serializers.SerializerMethodField()
    end_time = serializers.SerializerMethodField()
    court = serializers.IntegerField(source="court_id")
    court_name = serializers.CharField(source="court.name")
    price_coin = serializers.IntegerField(source="price_coins")
    booking_id = serializers.SerializerMethodField()

    class Meta:
        model = Slot
        fields = [
            "id",
            "slot_status",
            "service_date",
            "start_time",
            "end_time",
            "court",
            "court_name",
            "price_coin",
            "booking_id",
        ]

    def get_slot_status(self, obj):
        if hasattr(obj, "slot_status") and obj.slot_status:
            return obj.slot_status.status
        return "available"

    def get_start_time(self, obj):
        return timezone.localtime(obj.start_at).strftime("%H:%M")

    def get_end_time(self, obj):
        return timezone.localtime(obj.end_at).strftime("%H:%M")

    def get_booking_id(self, obj):
        bs = BookingSlot.objects.filter(slot=obj).select_related("booking").first()
        if bs and bs.booking and bs.booking.status not in ["cancelled"]:
            return bs.booking.booking_no
        return None


# ────────────────────────────── Slot List Request ──────────────────────────────
class SlotListRequestSerializer(serializers.Serializer):
    """Used in POST /api/slots/slots-list/"""
    slot_list = serializers.ListField(
        child=serializers.CharField(), allow_empty=False
    )


# ────────────────────────────── BookingSlot Serializer ──────────────────────────────
class BookingSlotSerializer(serializers.ModelSerializer):
    """Intermediate serializer for Slot inside a Booking."""
    slot_status = serializers.SerializerMethodField()
    start_time = serializers.SerializerMethodField()
    end_time = serializers.SerializerMethodField()
    court = serializers.IntegerField(source="slot.court_id")
    court_name = serializers.CharField(source="slot.court.name")
    price_coin = serializers.IntegerField(source="slot.price_coins")

    class Meta:
        model = BookingSlot
        fields = [
            "slot_id",
            "slot_status",
            "service_date",
            "start_time",
            "end_time",
            "court",
            "court_name",
            "price_coin",
        ]

    slot_id = serializers.IntegerField(source="slot.id")
    service_date = serializers.DateField(source="slot.service_date", format="%Y-%m-%d")

    def get_slot_status(self, obj):
        return getattr(getattr(obj.slot, "slot_status", None), "status", "available")

    def get_start_time(self, obj):
        return timezone.localtime(obj.slot.start_at).strftime("%H:%M")

    def get_end_time(self, obj):
        return timezone.localtime(obj.slot.end_at).strftime("%H:%M")


# ────────────────────────────── Booking Serializer ──────────────────────────────
class BookingSerializer(serializers.ModelSerializer):
    """
    Serializer for Booking summary.
    Includes readable club/court name and slot details.
    """
    owner_username = serializers.CharField(source="user.username", read_only=True)
    club_name = serializers.CharField(source="club.name", read_only=True)
    court_name = serializers.CharField(source="court.name", read_only=True)
    booking_slots = BookingSlotSerializer(source="booking_slots.all", many=True, read_only=True)

    class Meta:
        model = Booking
        fields = [
            "booking_no",
            "status",
            "owner_username",
            "club_name",
            "court_name",
            "total_cost",
            "booking_date",
            "created_at",
            "booking_slots",
        ]


# ────────────────────────────── BookingItem Serializer ──────────────────────────────
class BookingItemSerializer(serializers.Serializer):
    """
    Represents a single booking item (one court + time range).
    Supports multiple input date/time formats.
    """
    court = serializers.IntegerField()
    date = serializers.CharField()
    start = serializers.CharField()
    end = serializers.CharField()

    def validate(self, data):
        """Validate flexible date/time formats."""
        # Parse date
        try:
            try:
                data["date"] = datetime.strptime(data["date"], "%Y-%m-%d").date()
            except ValueError:
                data["date"] = datetime.strptime(data["date"], "%d %b %Y").date()
        except Exception:
            raise serializers.ValidationError({"date": "Invalid date format (use YYYY-MM-DD or DD Mon YYYY)"})

        # Parse time
        try:
            try:
                data["start"] = datetime.strptime(data["start"], "%H:%M").time()
                data["end"] = datetime.strptime(data["end"], "%H:%M").time()
            except ValueError:
                data["start"] = datetime.strptime(data["start"], "%I:%M %p").time()
                data["end"] = datetime.strptime(data["end"], "%I:%M %p").time()
        except Exception:
            raise serializers.ValidationError({"time": "Invalid time format (use HH:MM or HH:MM AM/PM)"})

        if data["start"] >= data["end"]:
            raise serializers.ValidationError("Start time must be before end time.")
        return data


# ────────────────────────────── BookingCreate Serializer ──────────────────────────────
class BookingCreateSerializer(serializers.Serializer):
    """
    Used for both Player (slots list) and Manager (items list) booking creation.
    Supports both 'slots' and 'booking_slots' for flexibility.

    Example (Player):
      {
        "club": 1,
        "booking_method": "Courtly Website",
        "slots": [24115, 24116]
      }

    Example (Manager Walk-in):
      {
        "club": 1,
        "items": [{"court": 3, "date": "2025-11-09", "start": "12:00", "end": "12:30"}]
      }

    Example (Alternate naming):
      {
        "club": 1,
        "booking_method": "Phone Call",
        "booking_slots": ["25188", "25189"]
      }
    """
    club = serializers.IntegerField()
    booking_method = serializers.CharField(required=False, default="Courtly Website")
    owner_username = serializers.CharField(required=False, allow_blank=True)
    owner_contact = serializers.CharField(required=False, allow_blank=True)
    payment_method = serializers.CharField(required=False, default="coin")

    # For player booking
    slots = serializers.ListField(
        child=serializers.IntegerField(), required=False, allow_empty=False
    )
    booking_slots = serializers.ListField(
        child=serializers.IntegerField(), required=False, allow_empty=False
    )

    # For manager walk-in booking
    items = BookingItemSerializer(many=True, required=False)

    def validate(self, data):
        """Ensure that either slots, booking_slots, or items is provided."""
        slots = data.get("slots") or data.get("booking_slots")
        items = data.get("items")

        if not slots and not items:
            raise serializers.ValidationError("Either 'slots' or 'items' must be provided.")

        # Normalize slots
        if slots:
            data["slots"] = [int(s) for s in slots]
        elif items:
            data["items"] = items

        return data


# ────────────────────────────── BookingHistory Serializer ──────────────────────────────
class BookingHistorySerializer(serializers.ModelSerializer):
    """Booking history including all related slot details."""
    booking_slots = BookingSlotSerializer(source="booking_slots.all", many=True)

    class Meta:
        model = Booking
        fields = [
            "booking_no",
            "status",
            "created_at",
            "total_cost",
            "booking_date",
            "booking_slots",
        ]
