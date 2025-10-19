# booking/serializers.py
from rest_framework import serializers
from .models import Slot, Booking, BookingSlot, SlotStatus


class SlotStatusSerializer(serializers.ModelSerializer):
    class Meta:
        model = SlotStatus
        fields = ["status", "updated_at"]


class SlotSerializer(serializers.ModelSerializer):
    slot_status = SlotStatusSerializer(read_only=True)
    start_time = serializers.SerializerMethodField()
    end_time = serializers.SerializerMethodField()

    class Meta:
        model = Slot
        # ✅ เปลี่ยนจาก start_at, end_at → start_time, end_time
        fields = ["id", "court", "service_date", "start_time", "end_time", "price_coins", "slot_status"]

    def get_start_time(self, obj):
        # ✅ แปลง timezone → Asia/Bangkok และแสดงเฉพาะ "HH:MM"
        return obj.start_at.astimezone().strftime("%H:%M")

    def get_end_time(self, obj):
        return obj.end_at.astimezone().strftime("%H:%M")


class BookingSerializer(serializers.ModelSerializer):
    # Show related names instead of IDs
    user = serializers.CharField(source="user.username", read_only=True)
    club_name = serializers.CharField(source="club.name", read_only=True)
    court_name = serializers.CharField(source="court.name", read_only=True)

    # Include nested slot info from BookingSlot
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
        # Query all BookingSlot linked to this booking
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


class BookingItemSerializer(serializers.Serializer):
    court = serializers.IntegerField()
    date = serializers.CharField()   # 👈 แก้เป็น CharField เพื่อให้รับได้หลาย format
    start = serializers.CharField()
    end = serializers.CharField()

    def validate(self, data):
        from datetime import datetime

        # 🔹 แปลง date
        try:
            # รองรับหลายรูปแบบ
            try:
                data["date"] = datetime.strptime(data["date"], "%Y-%m-%d").date()
            except ValueError:
                data["date"] = datetime.strptime(data["date"], "%d %b %Y").date()  # "18 Oct 2025"
        except Exception:
            raise serializers.ValidationError({"date": "Invalid date format (use YYYY-MM-DD or DD Mon YYYY)"})

        # 🔹 แปลง time
        try:
            try:
                data["start"] = datetime.strptime(data["start"], "%H:%M").time()
                data["end"] = datetime.strptime(data["end"], "%H:%M").time()
            except ValueError:
                data["start"] = datetime.strptime(data["start"], "%I:%M %p").time()  # "12:00 PM"
                data["end"] = datetime.strptime(data["end"], "%I:%M %p").time()
        except Exception:
            raise serializers.ValidationError({"time": "Invalid time format (use HH:MM or HH:MM AM/PM)"})

        # 🔹 ตรวจ start < end
        if data["start"] >= data["end"]:
            raise serializers.ValidationError("start time must be before end time")

        return data

class BookingCreateSerializer(serializers.Serializer):
    club = serializers.IntegerField()
    items = BookingItemSerializer(many=True)

    def validate(self, data):
        # ตรวจว่า start < end ทุกชิ้น
        for it in data["items"]:
            if it["start"] >= it["end"]:
                raise serializers.ValidationError("start time must be before end time")
        return data


class BookingSlotSerializer(serializers.ModelSerializer):
    class Meta:
        model = BookingSlot
        fields = ["slot", "slot__court", "slot__service_date", "slot__start_at", "slot__end_at"]


class BookingHistorySerializer(serializers.ModelSerializer):
    slots = BookingSlotSerializer(source="bookingslot_set", many=True)

    class Meta:
        model = Booking
        fields = ["booking_no", "status", "created_at", "slots"]
