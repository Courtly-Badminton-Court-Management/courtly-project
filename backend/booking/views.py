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
from wallet.models import CoinLedger, Wallet


# ───────────────────────── helpers ─────────────────────────
def gen_booking_no() -> str:
    """Generate booking number like BK-7F2C9E1A23"""
    return f"BK-{uuid.uuid4().hex[:10].upper()}"


def combine_dt(d: date, t) -> datetime:
    """Combine date and time into timezone-aware datetime."""
    if isinstance(t, str):
        t = datetime.strptime(t, "%H:%M").time()
    dt = datetime.combine(d, t)
    if timezone.is_naive(dt):
        dt = timezone.make_aware(dt, timezone.get_current_timezone())
    return dt


def calculate_able_to_cancel(first_slot):
    """Return True if cancellation is allowed (>24h before start)."""
    slot_start = first_slot.slot.start_at
    slot_local = timezone.localtime(slot_start)
    return timezone.now() <= slot_local - timedelta(hours=24)


# ─────────────────────── Slot (read-only) ───────────────────────
class SlotViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = Slot.objects.all()
    serializer_class = SlotSerializer
    permission_classes = [permissions.AllowAny]

    @action(detail=False, url_path="month-view", methods=["GET"])
    def month_view(self, request):
        """
        GET /api/slots/month-view?club=1&month=2025-09
        """
        raw_club = request.query_params.get("club")
        month_str = request.query_params.get("month")  # YYYY-MM

        try:
            club_id = int(raw_club)
        except (TypeError, ValueError):
            return Response({"detail": "club must be an integer id"}, status=400)

        if not month_str or len(month_str) != 7 or "-" not in month_str:
            return Response({"detail": "month is required as YYYY-MM"}, status=400)

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

        tz = timezone.get_current_timezone()
        by_day = {}

        for s in qs:
            day_key = s.service_date.strftime("%d-%m-%y")
            start_local = timezone.localtime(s.start_at, tz)
            end_local = timezone.localtime(s.end_at, tz)

            slot_key = str(s.id)
            status_val = getattr(getattr(s, "slot_status", None), "status", "available")
            by_day.setdefault(day_key, {})[slot_key] = {
                "status": status_val,
                "start_time": start_local.strftime("%H:%M"),
                "end_time": end_local.strftime("%H:%M"),
                "court": s.court_id,
                "courtName": s.court.name,
            }

        payload = {
            "month": first_day.strftime("%m-%y"),
            "days": [{"date": d, "slotList": slots} for d, slots in by_day.items()],
        }
        payload["days"].sort(key=lambda x: datetime.strptime(x["date"], "%d-%m-%y"))
        return Response(payload)


# ─────────────────────── Booking CRUD ───────────────────────
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


# ─────────────────────── Create Booking ───────────────────────
class BookingCreateView(APIView):
    """
    POST /api/bookings/
    payload:
    {
      "club": 1,
      "items": [
        {"court":4,"date":"2025-10-18","start":"12:00","end":"13:00"}
      ]
    }
    """
    permission_classes = [permissions.IsAuthenticated]

    @transaction.atomic
    def post(self, request):
        try:
            print("📦 RAW DATA:", request.data)
            ser = BookingCreateSerializer(data=request.data)
            ser.is_valid(raise_exception=False)

            if ser.errors:
                print("❌ Serializer errors:", ser.errors)
                return Response(
                    {"detail": "Serializer validation failed", "errors": ser.errors},
                    status=status.HTTP_400_BAD_REQUEST
                )

            ser.is_valid(raise_exception=True)
            club_id = ser.validated_data["club"]
            items = ser.validated_data["items"]

            try:
                Club.objects.only("id").get(id=club_id)
            except Club.DoesNotExist:
                return Response({"detail": "Club not found"}, status=404)

            if not items:
                return Response({"detail": "No items to book"}, status=400)

            first_court_id = items[0]["court"]
            first_date = items[0]["date"]

            booking = Booking.objects.create(
                booking_no=gen_booking_no(),
                user=request.user,
                club_id=club_id,
                court_id=first_court_id,
                status="confirmed",
                booking_date=first_date,
            )

            total_slots = 0
            total_cost = 0
            created_slots = []

            for it in items:
                court_id = it["court"]
                d = it["date"]
                start_t = it["start"]
                end_t = it["end"]

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

                slots = list(Slot.objects.filter(id__in=locked_ids).select_related("slot_status"))
                if not slots:
                    print(f"❌ No slots found for court {court_id}, date={d}, range={start_t}-{end_t}")
                    return Response(
                        {"detail": f"No slots found for court {court_id} in range"},
                        status=400,
                    )

                not_available = [s.id for s in slots if getattr(s, "slot_status", None) and s.slot_status.status != "available"]
                if not_available:
                    print(f"⚠️ Some slots not available: {not_available}")
                    return Response(
                        {"detail": "Some slots are not available", "slot_ids": not_available},
                        status=409,
                    )

                for slot in slots:
                    total_cost += slot.price_coins

                for s in slots:
                    BookingSlot.objects.create(booking=booking, slot=s)
                    if hasattr(s, "slot_status"):
                        s.slot_status.status = "booked"
                        s.slot_status.save(update_fields=["status", "updated_at"])
                    else:
                        SlotStatus.objects.create(slot=s, status="booked")

                created_slots.extend([s.id for s in slots])
                total_slots += len(slots)

            wallet, _ = Wallet.objects.get_or_create(user=request.user, defaults={"balance": 1000})
            if wallet.balance < total_cost:
                print("💰 Not enough coins:", wallet.balance, "<", total_cost)
                return Response(
                    {"detail": "Not enough coins", "required": total_cost, "balance": wallet.balance},
                    status=402,
                )

            wallet.balance -= total_cost
            wallet.save(update_fields=["balance"])
            CoinLedger.objects.create(user=request.user, type="capture", amount=-total_cost, ref_booking=booking)

            booking.total_cost = total_cost
            booking.save(update_fields=["total_cost"])

            print(f"✅ Booking created: {booking.booking_no}, cost={total_cost}, slots={created_slots}")

            return Response(
                {
                    "ok": True,
                    "booking": {
                        "id": booking.id,
                        "booking_no": booking.booking_no,
                        "club": club_id,
                        "court": first_court_id,
                        "slots": created_slots,
                    },
                    "total_slots": total_slots,
                    "total_cost": total_cost,
                    "new_balance": wallet.balance,
                },
                status=status.HTTP_201_CREATED,
            )

        except DatabaseError as e:
            print("💥 DatabaseError:", e)
            return Response(
                {"detail": f"Database error: {e.__class__.__name__}", "message": str(e)},
                status=500,
            )
        except Exception as e:
            print("💥 Exception:", e)
            return Response({"detail": str(e)}, status=400)


# ─────────────────────── Booking History (Player) ───────────────────────
class BookingHistoryView(APIView):
    """
    GET /api/history/
    """
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        qs = Booking.objects.filter(user=request.user).order_by("-created_at")[:50]
        data = []

        for b in qs:
            slots = BookingSlot.objects.filter(booking=b).select_related("slot", "slot__court")
            first_slot = slots.first()
            able_to_cancel = calculate_able_to_cancel(first_slot) if first_slot else False

            slot_data = [
                {
                    "slot_id": s.slot.id,
                    "court_name": s.slot.court.name,
                    "service_date": s.slot.service_date.strftime("%Y-%m-%d"),
                    "start_time": s.slot.start_at.strftime("%H:%M"),
                    "end_time": s.slot.end_at.strftime("%H:%M"),
                }
                for s in slots
            ]

            data.append({
                "created_date": b.created_at.strftime("%Y-%m-%d %H:%M"),
                "booking_id": b.booking_no,
                "username": b.user.username if b.user else None,
                "email": b.user.email if b.user else None,
                "total_cost": f"{b.total_cost} coins" if b.total_cost else None,
                "booking_date": b.booking_date.strftime("%Y-%m-%d") if b.booking_date else None,
                "status": b.status,
                "able_to_cancel": able_to_cancel,
                "slots": slot_data,
            })
        return Response({"results": data})


# ─────────────────────── All Bookings (Manager/Admin) ───────────────────────
class BookingAllView(APIView):
    """
    GET /api/all-bookings/
    """
    def get(self, request):
        qs = Booking.objects.all().select_related("user").order_by("-created_at")[:200]
        data = []

        for b in qs:
            slots = BookingSlot.objects.filter(booking=b).select_related("slot", "slot__court")
            first_slot = slots.first()
            able_to_cancel = calculate_able_to_cancel(first_slot) if first_slot else False

            slot_data = [
                {
                    "slot_id": s.slot.id,
                    "court_name": s.slot.court.name,
                    "service_date": s.slot.service_date.strftime("%Y-%m-%d"),
                    "start_time": s.slot.start_at.strftime("%H:%M"),
                    "end_time": s.slot.end_at.strftime("%H:%M"),
                }
                for s in slots
            ]

            data.append({
                "created_date": b.created_at.strftime("%Y-%m-%d %H:%M"),
                "booking_id": b.booking_no,
                "user": b.user.username if b.user else None,
                "total_cost": f"{b.total_cost} coins" if b.total_cost else None,
                "booking_date": b.booking_date.strftime("%Y-%m-%d") if b.booking_date else None,
                "status": b.status,
                "able_to_cancel": able_to_cancel,
                "slots": slot_data,
            })
        return Response(data)


# ─────────────────────── Cancel Booking ───────────────────────
class BookingCancelView(APIView):
    """
    POST /api/bookings/<booking_no>/cancel/
    - Cancel a booking by booking_no (not ID)
    - Refund coins and release slots if cancelled >24 hours before start time
    - Return able_to_cancel: boolean
    """
    permission_classes = [permissions.IsAuthenticated]

    @transaction.atomic
    def post(self, request, booking_no):
        try:
            booking = Booking.objects.get(booking_no=booking_no)
        except Booking.DoesNotExist:
            return Response({"detail": "Booking not found"}, status=404)

        user_role = getattr(request.user, "role", None)
        if booking.user != request.user and user_role != "manager":
            return Response({"detail": "No permission to cancel"}, status=403)

        if booking.status == "cancelled":
            return Response({"detail": "Already cancelled"}, status=400)

        first_slot = (
            BookingSlot.objects.filter(booking=booking)
            .select_related("slot")
            .order_by("slot__service_date", "slot__start_at")
            .first()
        )
        if not first_slot:
            return Response({"detail": "No slot info found"}, status=400)

        able_to_cancel = calculate_able_to_cancel(first_slot)
        if not able_to_cancel:
            slot_local = timezone.localtime(first_slot.slot.start_at)
            return Response(
                {
                    "detail": "Cannot cancel within 24 hours of start time",
                    "able_to_cancel": False,
                    "start_time": slot_local.strftime("%Y-%m-%d %H:%M"),
                    "current_time": timezone.localtime(timezone.now()).strftime("%Y-%m-%d %H:%M"),
                },
                status=400,
            )

        booking_slots = BookingSlot.objects.filter(booking=booking).select_related("slot", "slot__slot_status")
        total_refund = 0
        released_slots = []

        for bs in booking_slots:
            slot = bs.slot
            total_refund += getattr(slot, "price_coins", 0)
            released_slots.append(slot.id)

            if hasattr(slot, "slot_status"):
                slot.slot_status.status = "available"
                slot.slot_status.save(update_fields=["status", "updated_at"])
            else:
                SlotStatus.objects.create(slot=slot, status="available")

        booking.status = "cancelled"
        booking.save(update_fields=["status"])

        wallet, _ = Wallet.objects.get_or_create(user=booking.user, defaults={"balance": 0})
        wallet.balance += total_refund
        wallet.save(update_fields=["balance"])

        CoinLedger.objects.create(
            user=booking.user,
            type="refund",
            amount=total_refund,
            ref_booking=booking,
        )

        slot_local = timezone.localtime(first_slot.slot.start_at)
        return Response(
            {
                "detail": "Booking cancelled successfully",
                "booking_no": booking.booking_no,
                "refund_amount": total_refund,
                "released_slots": released_slots,
                "new_balance": wallet.balance,
                "cancelled_by": request.user.email,
                "role": user_role,
                "able_to_cancel": True,
                "start_time": slot_local.strftime("%Y-%m-%d %H:%M"),
                "current_time": timezone.localtime(timezone.now()).strftime("%Y-%m-%d %H:%M"),
            },
            status=200,
        )
