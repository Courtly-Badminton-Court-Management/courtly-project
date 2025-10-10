# booking/views.py

from pathlib import Path
import uuid
import calendar
from datetime import date, datetime, timedelta

from django.conf import settings
from django.db import connection, transaction, DatabaseError
from django.utils import timezone
from django.views.generic import TemplateView

from rest_framework import viewsets, permissions, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.views import APIView

from .models import Slot, SlotStatus, Booking, BookingSlot, Court, Club
from .serializers import SlotSerializer, BookingSerializer, BookingCreateSerializer
from django.db import models
from wallet.models import CoinLedger
from wallet.models import Wallet
from .serializers import BookingHistorySerializer

# ───────────────────────── helpers ─────────────────────────
def gen_booking_no() -> str:
    # 12 ตัวอ่านง่าย เช่น BK-7F2C9E1A23
    return f"BK-{uuid.uuid4().hex[:10].upper()}"


def combine_dt(d: date, t) -> datetime:
    """รวม date + time ให้เป็น aware datetime ตาม TIME_ZONE ของโปรเจกต์"""
    dt = datetime.combine(d, t)
    if timezone.is_naive(dt):
        dt = timezone.make_aware(dt, timezone.get_current_timezone())
    return dt


# ─────────────────────── Slot (read-only) ───────────────────────
class SlotViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = Slot.objects.all()
    serializer_class = SlotSerializer
    permission_classes = [permissions.AllowAny]

    @action(detail=False, url_path="month-view", methods=["GET"])
    def month_view(self, request):
        """
        GET /api/slots/month-view?club=1&month=2025-09
        Response:
        {
          "month":"09-25",
          "days":[{"date":"01-09-25","slotList":{"<slotId>":{...}}}, ...]
        }
        """
        # validate params
        raw_club = request.query_params.get("club")
        month_str = request.query_params.get("month")  # YYYY-MM
        try:
            club_id = int(raw_club)
        except (TypeError, ValueError):
            return Response({"detail": "club must be an integer id"}, status=400)
        if not month_str or len(month_str) != 7 or "-" not in month_str:
            return Response({"detail": "month is required as YYYY-MM"}, status=400)

        # first/last day of month
        y, m = map(int, month_str.split("-"))
        first_day = date(y, m, 1)
        last_day = date(y, m, calendar.monthrange(y, m)[1])

        qs = (
            Slot.objects
            .select_related("court", "court__club", "slot_status")
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
            status_val = getattr(getattr(s, "slot_status", None), "status", "available")
            by_day.setdefault(day_key, {})[slot_key] = {
                "status": status_val,
                "start_time": s.start_at.strftime("%H:%M"),
                "end_time": s.end_at.strftime("%H:%M"),
                "court": s.court_id,
                "courtName": s.court.name,
            }

        payload = {
            "month": first_day.strftime("%m-%y"),
            "days": [{"date": d, "slotList": slots} for d, slots in by_day.items()],
        }
        payload["days"].sort(key=lambda x: datetime.strptime(x["date"], "%d-%m-%y"))
        return Response(payload)


# ─────────────────────── Booking (CRUD) ───────────────────────
class BookingViewSet(viewsets.ModelViewSet):
    queryset = Booking.objects.all()
    serializer_class = BookingSerializer
    permission_classes = [permissions.IsAuthenticated]

    @action(detail=True, methods=["delete"])
    def cancel(self, request, pk=None):
        booking = self.get_object()
        booking.status = "cancelled"
        booking.save(update_fields=["status"])
        return Response({"status": "cancelled"})


class BookingUIMockView(TemplateView):
    template_name = "booking/mock.html"


# # ─────────────────────── Create booking ───────────────────────

class BookingCreateView(APIView):
    """
    POST /api/bookings/
    payload:
    {
      "club": 1,
      "items": [
        {"court":4,"date":"2025-09-05","start":"10:00","end":"12:00"},
        {"court":5,"date":"2025-09-05","start":"14:00","end":"15:00"}
      ]
    }
    """

    permission_classes = [permissions.IsAuthenticated]

    @transaction.atomic
    def post(self, request):
        try:
            ser = BookingCreateSerializer(data=request.data)
            ser.is_valid(raise_exception=True)
            club_id = ser.validated_data["club"]
            items = ser.validated_data["items"]

            # ตรวจ club
            try:
                Club.objects.only("id").get(id=club_id)
            except Club.DoesNotExist:
                return Response({"detail": "Club not found"}, status=404)

            if not items:
                return Response({"detail": "No items to book"}, status=400)

            # ใช้ court ของ item แรกเป็น primary court
            first_court_id = items[0]["court"]

            booking = Booking.objects.create(
                booking_no=gen_booking_no(),
                user=request.user,          # ✅ ผูกกับ user
                club_id=club_id,
                court_id=first_court_id,
                status="confirmed",
            )

            total_slots = 0
            total_cost = 0
            created_slots = []

            for it in items:
                court_id = it["court"]
                d = it["date"]
                start_t = it["start"]
                end_t = it["end"]

                # court exist?
                try:
                    Court.objects.only("id").get(id=court_id)
                except Court.DoesNotExist:
                    return Response({"detail": f"Court {court_id} not found"}, status=404)

                start_dt = combine_dt(d, start_t)
                end_dt = combine_dt(d, end_t)
                if start_dt >= end_dt:
                    return Response({"detail": "Invalid time range"}, status=400)

                base_qs = Slot.objects.filter(
                    court_id=court_id,
                    service_date=d,
                    start_at__gte=start_dt,
                    end_at__lte=end_dt,
                ).order_by("start_at")

                if connection.vendor == "postgresql" and connection.features.has_select_for_update:
                    locked_ids = list(base_qs.select_for_update(of=("self",)).values_list("id", flat=True))
                else:
                    locked_ids = list(base_qs.values_list("id", flat=True))

                slots_qs = Slot.objects.filter(id__in=locked_ids).select_related("slot_status").order_by("start_at")
                slots = list(slots_qs)
                if not slots:
                    return Response({"detail": f"No slots found for court {court_id} in range"}, status=400)

                # check available
                not_available = [
                    s.id for s in slots
                    if not getattr(s, "slot_status", None) or s.slot_status.status != "available"
                ]
                if not_available:
                    return Response(
                        {"detail": "Some slots are not available", "slot_ids": not_available},
                        status=409,
                    )

                for slot in slots:
                    # ✅ คิดราคา slot
                    total_cost += slot.price_coins

                for s in slots:
                    BookingSlot.objects.create(booking=booking, slot=s)
                    if getattr(s, "slot_status", None):
                        s.slot_status.status = "booked"
                        s.slot_status.save(update_fields=["status", "updated_at"])
                    else:
                        SlotStatus.objects.create(slot=s, status="booked")

                created_slots.extend([s.id for s in slots])
                total_slots += len(slots)

            # ✅ Wallet check
            wallet, _ = Wallet.objects.get_or_create(user=request.user, defaults={"balance": 1000})

            if wallet.balance < total_cost:
                return Response(
                    {"detail": "Not enough coins", "required": total_cost, "balance": wallet.balance},
                    status=402,
                )

            # ✅ หัก coin และ log
            wallet.balance -= total_cost
            wallet.save(update_fields=["balance"])

            CoinLedger.objects.create(
                user=request.user,
                type="capture",
                amount=-total_cost,
                ref_booking=booking
            )

            new_balance = wallet.balance

            return Response(
    {
        "ok": True,
        "booking": {
            "id": booking.id,                # ✅ NEW: booking id
            "booking_no": booking.booking_no,
            "club": club_id,
            "court": first_court_id,
            "slots": created_slots,
        },
        # ✅ NEW: เผื่อ FE บางจุดยังอ่านจาก res.bookings
        "bookings": [
            {
                "id": booking.id,
                "booking_no": booking.booking_no,
            }
        ],
        "total_slots": total_slots,
        "total_cost": total_cost,
        "new_balance": new_balance,
    },
    status=status.HTTP_201_CREATED,
)

        except DatabaseError as e:
            return Response({"detail": f"Database error: {e.__class__.__name__}", "message": str(e)}, status=500)
        except Exception as e:
            return Response({"detail": str(e)}, status=400)


class BookingHistoryView(APIView):
    """
    GET /api/history/
    ดึง booking ของ user ที่ login อยู่
    """

    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        qs = Booking.objects.filter(user=request.user).order_by("-created_at")[:50]
        data = []
        for b in qs:
            slots = BookingSlot.objects.filter(booking=b).select_related("slot", "slot__court")
            slot_data = [
                {
                    "slot": s.slot.id,
                    "slot__court": s.slot.court.id,
                    "slot__service_date": str(s.slot.service_date),
                    "slot__start_at": s.slot.start_at.strftime("%H:%M"),
                    "slot__end_at": s.slot.end_at.strftime("%H:%M"),
                }
                for s in slots
            ]
            data.append({
                "booking_no": b.booking_no,
                "status": b.status,
                "created_at": b.created_at.strftime("%Y-%m-%d %H:%M"),
                "slots": slot_data,
            })
        return Response({"results": data})


class BookingAllView(APIView):
    # permission_classes = [permissions.IsAdminUser]  # ✅ only admin
    # permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        qs = Booking.objects.all().select_related("user").order_by("-created_at")[:200]
        data = []
        for b in qs:
            slots = BookingSlot.objects.filter(booking=b).select_related("slot", "slot__court")
            slot_data = [
                {
                    "slot": s.slot.id,
                    "slot__court": s.slot.court.id,
                    "slot__service_date": s.slot.service_date,
                    "slot__start_at": s.slot.start_at.strftime("%H:%M"),
                    "slot__end_at": s.slot.end_at.strftime("%H:%M"),
                }
                for s in slots
            ]
            data.append({
                "booking_no": b.booking_no,
                "user": b.user.email if b.user else None,   # ✅ show user
                "status": b.status,
                "created_at": b.created_at.strftime("%Y-%m-%d %H:%M"),
                "slots": slot_data,
            })
        return Response(data)