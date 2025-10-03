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
    user = serializers.PrimaryKeyRelatedField(read_only=True)

    class Meta:
        model = Booking
        fields = [
            "id",
            "booking_no",
            "club",
            "court",
            "slot",
            "status",
            "created_at",
            "user",   # ✅ include user_id
        ]



class BookingItemSerializer(serializers.Serializer):
    court = serializers.IntegerField()
    date = serializers.DateField()   # "YYYY-MM-DD"
    start = serializers.TimeField()  # "HH:MM"
    end = serializers.TimeField()  # "HH:MM"

class BookingCreateSerializer(serializers.Serializer):
    club = serializers.IntegerField()
    items = BookingItemSerializer(many=True)

    def validate(self, data):
        # ตรวจว่า start < end ทุกชิ้น
        for it in data["items"]:
            if it["start"] >= it["end"]:
                raise serializers.ValidationError("start time must be before end time")
        return data