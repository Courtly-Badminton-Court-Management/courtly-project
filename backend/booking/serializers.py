# booking/serializers.py
from rest_framework import serializers
from .models import Slot, Booking, BookingSlot, SlotStatus


class SlotStatusSerializer(serializers.ModelSerializer):
    class Meta:
        model = SlotStatus
        fields = ["status", "updated_at"]


class SlotSerializer(serializers.ModelSerializer):
    slot_status = SlotStatusSerializer(read_only=True)

    class Meta:
        model = Slot
        fields = ["id", "court", "service_date", "start_at", "end_at", "price_coins", "slot_status"]


class BookingSerializer(serializers.ModelSerializer):
    class Meta:
        model = Booking
        fields = ["id", "booking_no", "club", "court", "slot", "status", "created_at"]