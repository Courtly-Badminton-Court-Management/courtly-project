from .models import Booking
from .serializers import BookingSerializer
from rest_framework import viewsets, permissions
# optional mock UI view
from django.views.generic import TemplateView
from .models import Slot
from .serializers import SlotSerializer
from datetime import date, datetime
import calendar
from rest_framework.decorators import action
from rest_framework.response import Response


class SlotViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = Slot.objects.all()
    serializer_class = SlotSerializer
    permission_classes = [permissions.AllowAny]

    @action(detail=False, url_path="month-view")
    def month_view(self, request):
        """
        GET /api/slots/month-view?club=1&month=2025-09
        -> {
             "month": "09-25",
             "days": [ { "date": "01-09-25", "slotList": { "<slotId>": {...} } }, ... ]
           }
        """
        club_id = request.query_params.get("club")
        month_str = request.query_params.get("month")  # YYYY-MM

        if not (club_id and month_str):
            return Response({"detail": "club and month are required (month=YYYY-MM)"}, status=400)

        # first/last day of month
        y, m = map(int, month_str.split("-"))
        first_day = date(y, m, 1)
        last_day = date(y, m, calendar.monthrange(y, m)[1])

        qs = (
            Slot.objects
            .select_related("court", "court__club", "slot_status")  # keep if OneToOne name is slot_status
            .filter(
                court__club_id=club_id,
                service_date__gte=first_day,
                service_date__lte=last_day,
            )
            .order_by("service_date", "court_id", "start_at")
        )

        # group by day → { "DD-MM-YY": { slotId: {...} } }
        by_day = {}
        for s in qs:
            day_key = s.service_date.strftime("%d-%m-%y")
            slot_key = str(s.id)
            status = getattr(getattr(s, "slot_status", None), "status", "available")

            by_day.setdefault(day_key, {})[slot_key] = {
                "status": status,
                "start_time": s.start_at.strftime("%H:%M"),
                "end_time": s.end_at.strftime("%H:%M"),
                # optional extra (ISO datetimes) — uncomment if you want them:
                # "start_at": s.start_at.isoformat(),
                # "end_at":   s.end_at.isoformat(),
                "court": s.court_id,
                "courtName": s.court.name,
            }

        payload = {
            "month": first_day.strftime("%m-%y"),
            "days": [{"date": d, "slotList": slots} for d, slots in by_day.items()],
        }
        payload["days"].sort(key=lambda x: datetime.strptime(x["date"], "%d-%m-%y"))
        return Response(payload)


class BookingViewSet(viewsets.ModelViewSet):
    queryset = Booking.objects.all()
    serializer_class = BookingSerializer
    permission_classes = [permissions.IsAuthenticated]

    @action(detail=True, methods=["delete"])
    def cancel(self, request, pk=None):
        booking = self.get_object()
        booking.status = "cancelled"
        booking.save()
        return Response({"status": "cancelled"})


class BookingUIMockView(TemplateView):
    template_name = "booking/mock.html"

# booking/views.py
import uuid
from datetime import datetime, timedelta
from django.db import transaction
from django.utils import timezone
from django.conf import settings
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status

from .serializers import BookingCreateSerializer
from .models import Slot, SlotStatus, Booking, BookingSlot, Court, Club


def gen_booking_no() -> str:
    # 12 ตัวอ่านง่าย เช่น BK-7F2C9E1A23
    return f"BK-{uuid.uuid4().hex[:10].upper()}"

def combine_dt(d, t):
    """รวม date + time ให้เป็น aware datetime ตาม TIME_ZONE ของโปรเจกต์"""
    dt = datetime.combine(d, t)
    if timezone.is_naive(dt):
        dt = timezone.make_aware(dt, timezone.get_current_timezone())
    return dt

class BookingCreateView(APIView):
    """
    รับ payload:
    {
      "club": 1,
      "items": [
        {"court":4,"date":"2025-09-05","start":"10:00","end":"12:00"}
      ]
    }
    - ล็อกแถว slot ที่เกี่ยวข้องด้วย select_for_update
    - ตรวจว่า slot ทุกตัว status=available
    - สร้าง Booking + BookingSlot
    - อัปเดต SlotStatus เป็น booked
    """
    @transaction.atomic
    def post(self, request):
        ser = BookingCreateSerializer(data=request.data)
        ser.is_valid(raise_exception=True)
        club_id = ser.validated_data["club"]
        items   = ser.validated_data["items"]

        # ตรวจ club/court มีจริง
        try:
            Club.objects.only("id").get(id=club_id)
        except Club.DoesNotExist:
            return Response({"detail": "Club not found"}, status=404)

        created = []
        total_slots = 0

        for it in items:
            court_id = it["court"]
            date     = it["date"]
            start_t  = it["start"]
            end_t    = it["end"]

            # court must exist and belong to club (ถ้า Court มี FK ไป Club ให้เช็คด้วย; ถ้าไม่มีก็ข้าม)
            try:
                Court.objects.only("id").get(id=court_id)
            except Court.DoesNotExist:
                return Response({"detail": f"Court {court_id} not found"}, status=404)

            start_dt = combine_dt(date, start_t)
            end_dt   = combine_dt(date, end_t)

            if start_dt >= end_dt:
                return Response({"detail": "Invalid time range"}, status=400)

            # ดึง slot 30 นาทีทั้งหมดของ court ช่วงนี้ แล้วล็อกสำหรับเขียน
            slots_qs = (
                Slot.objects
                .select_for_update()   # กันชนกันการจองพร้อมกัน
                .filter(
                    court_id=court_id,
                    service_date=date,
                    start_at__gte=start_dt,
                    end_at__lte=end_dt,
                )
                .select_related("slot_status")
                .order_by("start_at")
            )

            slots = list(slots_qs)

            if not slots:
                return Response({"detail": f"No slots found for court {court_id} in range"}, status=400)

            # ตรวจทุก slot ต้องว่าง
            not_available = [s.id for s in slots if not hasattr(s, "slot_status") or s.slot_status.status != "available"]
            if not_available:
                return Response(
                    {"detail": f"Some slots are not available", "slot_ids": not_available},
                    status=409
                )

            # สร้าง Booking + BookingSlot แล้ว mark เป็น booked
            booking = Booking.objects.create(
                booking_no=gen_booking_no(),
                user=request.user if request.user.is_authenticated else None,
                club_id=club_id,
                court_id=court_id,
                slot=slots[0],              # อ้าง slot แรกเป็น representative
                status="confirmed",
            )

            for s in slots:
                BookingSlot.objects.create(booking=booking, slot=s)
                # อัปเดตสถานะ
                if hasattr(s, "slot_status"):
                    s.slot_status.status = "booked"
                    s.slot_status.save(update_fields=["status", "updated_at"])
                else:
                    SlotStatus.objects.create(slot=s, status="booked")

            created.append({
                "booking_no": booking.booking_no,
                "court": court_id,
                "date": str(date),
                "start": start_t.strftime("%H:%M"),
                "end": end_t.strftime("%H:%M"),
                "slots": [s.id for s in slots],
            })
            total_slots += len(slots)

        return Response(
            {"ok": True, "bookings": created, "total_slots": total_slots},
            status=status.HTTP_201_CREATED
        )
