import traceback
import uuid
import calendar
from datetime import date, datetime, timedelta

from django.conf import settings
from django.db import connection, transaction, DatabaseError
from django.utils import timezone

from rest_framework import viewsets, permissions, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.views import APIView

from .models import Slot, SlotStatus, Booking, BookingSlot, Court, Club
from .serializers import SlotSerializer, BookingSerializer, BookingCreateSerializer
from wallet.models import CoinLedger, Wallet


# ────────────────────────────── Helper Functions ──────────────────────────────
def gen_booking_no() -> str:
    """Generate a unique booking number, e.g., BK-7F2C9E1A23."""
    return f"BK-{uuid.uuid4().hex[:10].upper()}"


def combine_dt(d: date, t) -> datetime:
    """Combine a date and time object into a timezone-aware datetime."""
    if isinstance(t, str):
        t = datetime.strptime(t, "%H:%M").time()
    dt = datetime.combine(d, t)
    if timezone.is_naive(dt):
        dt = timezone.make_aware(dt, timezone.get_current_timezone())
    return dt


def calculate_able_to_cancel(first_slot):
    """Check if booking can be cancelled (more than 24 hours before start)."""
    slot_start = first_slot.slot.start_at
    slot_local = timezone.localtime(slot_start)
    return timezone.now() <= slot_local - timedelta(hours=24)


# ────────────────────────────── Slot (Read-only) ──────────────────────────────
class SlotViewSet(viewsets.ReadOnlyModelViewSet):
    """
    ViewSet for viewing court slots.

    Endpoints:
      • GET /api/slots/                     — List all slots
      • GET /api/slots/month-view?club=1&month=YYYY-MM
    """
    queryset = Slot.objects.all()
    serializer_class = SlotSerializer
    permission_classes = [permissions.AllowAny]

    @action(detail=False, url_path="month-view", methods=["GET"])
    def month_view(self, request):
        """
        Retrieve all slots for a given club and month.
        Example:
            GET /api/slots/month-view?club=1&month=2025-09
        """
        raw_club = request.query_params.get("club")
        month_str = request.query_params.get("month")

        # Validate club parameter
        try:
            club_id = int(raw_club)
        except (TypeError, ValueError):
            return Response({"detail": "club must be an integer id"}, status=400)

        # Validate month format
        if not month_str or len(month_str) != 7 or "-" not in month_str:
            return Response({"detail": "month is required as YYYY-MM"}, status=400)

        y, m = map(int, month_str.split("-"))
        first_day = date(y, m, 1)
        last_day = date(y, m, calendar.monthrange(y, m)[1])
        today = timezone.localdate()

        if last_day < today:
            return Response({"detail": "Cannot view past months."}, status=400)

        # Query slots for given month and club
        qs = (
            Slot.objects
            .select_related("court", "court__club", "slot_status")
            .filter(
                court__club_id=club_id,
                service_date__gte=max(first_day, today),
                service_date__lte=last_day,
            )
            .order_by("service_date", "court_id", "start_at")
        )

        # Group slots by date
        tz = timezone.get_current_timezone()
        by_day = {}

        for s in qs:
            day_key = s.service_date.strftime("%d-%m-%y")
            start_local = timezone.localtime(s.start_at, tz)
            end_local = timezone.localtime(s.end_at, tz)
            status_val = getattr(getattr(s, "slot_status", None), "status", "available")

            by_day.setdefault(day_key, {})[str(s.id)] = {
                "status": status_val,
                "start_time": start_local.strftime("%H:%M"),
                "end_time": end_local.strftime("%H:%M"),
                "court": s.court_id,
                "court_name": s.court.name,
                "price_coin": s.price_coins
            }

        payload = {
            "month": first_day.strftime("%m-%y"),
            "days": [{"date": d, "booking_slots": slots} for d, slots in by_day.items()],
        }
        payload["days"].sort(key=lambda x: datetime.strptime(x["date"], "%d-%m-%y"))
        return Response(payload)


# ────────────────────────────── Booking CRUD ──────────────────────────────
class BookingViewSet(viewsets.ModelViewSet):
    """
    CRUD operations for Booking.
    Supports lookup by booking_no instead of primary key.
    """
    queryset = Booking.objects.all()
    serializer_class = BookingSerializer
    permission_classes = [permissions.IsAuthenticated]
    lookup_field = "booking_no"

    @action(detail=True, methods=["delete"])
    def cancel(self, request, booking_no=None):
        """Cancel a booking by marking it as 'cancelled'."""
        booking = self.get_object()
        booking.status = "cancelled"
        booking.save(update_fields=["status"])
        return Response({"status": "cancelled"})


# ────────────────────────────── Create Booking ──────────────────────────────
class BookingCreateView(APIView):
    """
    Create a new booking.

    Endpoint:
      POST /api/booking/
    """
    permission_classes = [permissions.IsAuthenticated]

    @transaction.atomic
    def post(self, request):
        try:
            # -------------------- Validate Input --------------------
            ser = BookingCreateSerializer(data=request.data)
            ser.is_valid(raise_exception=True)
            club_id = ser.validated_data["club"]
            items = ser.validated_data["items"]

            if not items:
                return Response({"detail": "No items to book"}, status=400)

            # -------------------- Check Club --------------------
            if not Club.objects.filter(id=club_id).exists():
                return Response({"detail": "Club not found"}, status=404)

            first_court_id = items[0]["court"]
            first_date = items[0]["date"]
            today = timezone.localdate()

            if first_date < today:
                return Response({"detail": f"Cannot book for a past date: {first_date}"}, status=400)

            # -------------------- Create Booking --------------------
            booking = Booking.objects.create(
                booking_no=gen_booking_no(),
                user=request.user,
                club_id=club_id,
                court_id=first_court_id,
                status="confirmed",
                booking_date=first_date,
            )

            total_cost = 0
            created_slots = []

            # -------------------- Loop through booking items --------------------
            for it in items:
                court_id = it["court"]
                d = it["date"]

                if d < today:
                    return Response({"detail": f"Cannot book for a past date: {d}"}, status=400)

                start_dt = combine_dt(d, it["start"])
                end_dt = combine_dt(d, it["end"])

                # 🔧 Fix timezone-aware vs naive datetime
                if timezone.is_aware(start_dt):
                    start_dt = timezone.make_naive(start_dt)
                if timezone.is_aware(end_dt):
                    end_dt = timezone.make_naive(end_dt)

                if start_dt >= end_dt:
                    return Response({"detail": "Invalid time range"}, status=400)

                # -------------------- Find slots --------------------
                base_qs = Slot.objects.filter(
                    court_id=court_id,
                    service_date=d,
                    start_at__gte=start_dt,
                    end_at__lte=end_dt,
                ).order_by("start_at")

                # Use row-level lock if available
                if connection.vendor == "postgresql" and connection.features.has_select_for_update:
                    locked_ids = list(base_qs.select_for_update(of=("self",)).values_list("id", flat=True))
                else:
                    locked_ids = list(base_qs.values_list("id", flat=True))

                slots = list(Slot.objects.filter(id__in=locked_ids).select_related("slot_status"))
                if not slots:
                    return Response({"detail": f"No slots found for court {court_id}"}, status=400)

                # -------------------- Check slot availability --------------------
                for s in slots:
                    if hasattr(s, "booked_by"):
                        return Response({"detail": f"Slot {s.id} already booked"}, status=409)
                    if hasattr(s, "slot_status") and s.slot_status.status != "available":
                        return Response(
                            {"detail": f"Slot {s.id} not available", "status": s.slot_status.status},
                            status=409,
                        )

                # -------------------- Create booking-slot relation --------------------
                for s in slots:
                    total_cost += s.price_coins
                    BookingSlot.objects.create(booking=booking, slot=s)
                    SlotStatus.objects.update_or_create(
                        slot=s, defaults={"status": "booked"}
                    )
                    created_slots.append(s.id)

            # -------------------- Wallet & Coin deduction --------------------
            wallet, _ = Wallet.objects.get_or_create(user=request.user, defaults={"balance": 1000})
            if wallet.balance < total_cost:
                return Response(
                    {"detail": "Not enough coins", "required": total_cost, "balance": wallet.balance},
                    status=402,
                )

            wallet.balance -= total_cost
            wallet.save(update_fields=["balance"])
            CoinLedger.objects.create(
                user=request.user,
                type="capture",
                amount=-total_cost,
                ref_booking=booking,
            )

            booking.total_cost = total_cost
            booking.save(update_fields=["total_cost"])

            # -------------------- Success --------------------
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
                    "total_cost": total_cost,
                    "new_balance": wallet.balance,
                },
                status=201,
            )

        except DatabaseError as e:
            traceback.print_exc()
            return Response(
                {"detail": "Database error", "error": str(e.__class__.__name__), "message": str(e)},
                status=500,
            )
        except Exception as e:
            traceback.print_exc()
            return Response({"detail": str(e)}, status=400)


# ────────────────────────────── Booking History (User) ──────────────────────────────

class BookingHistoryView(APIView):
    """List the last 50 bookings of the logged-in user.
     Endpoint:
    GET /api/my-booking/"""
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        qs = Booking.objects.filter(user=request.user).order_by("-created_at")[:50]
        data = []

        for b in qs:
            slots = BookingSlot.objects.filter(booking=b).select_related("slot", "slot__court", "slot__slot_status")
            first_slot = slots.first()
            able_to_cancel = calculate_able_to_cancel(first_slot) if first_slot else False

            booking_slots = {}
            for s in slots:
                slot_obj = s.slot
                status_val = getattr(getattr(slot_obj, "slot_status", None), "status", "available")
                booking_slots[str(slot_obj.id)] = {
                    "status": status_val,
                    "start_time": slot_obj.start_at.strftime("%H:%M"),
                    "end_time": slot_obj.end_at.strftime("%H:%M"),
                    "court": slot_obj.court_id,
                    "court_name": slot_obj.court.name,
                    "price_coin": slot_obj.price_coins,
                }

            data.append({
                "created_date": b.created_at.strftime("%Y-%m-%d %H:%M"),
                "booking_id": b.booking_no,
                "user": request.user.username,
                "total_cost": f"{b.total_cost} coins" if b.total_cost else None,
                "booking_date": b.booking_date.strftime("%Y-%m-%d") if b.booking_date else None,
                "booking_status": b.status,
                "able_to_cancel": able_to_cancel,
                "booking_slots": booking_slots,
            })

        return Response({"results": data})


# ────────────────────────────── All Bookings (Admin/Manager) ──────────────────────────────
class BookingAllView(APIView):
    """List all recent bookings (for admin or manager view).
    GET /api/bookings/
    """

    def get(self, request):
        qs = Booking.objects.all().select_related("user").order_by("-created_at")[:200]
        data = []

        for b in qs:
            slots = BookingSlot.objects.filter(booking=b).select_related("slot", "slot__court", "slot__slot_status")
            first_slot = slots.first()
            able_to_cancel = calculate_able_to_cancel(first_slot) if first_slot else False

            # --- booking_slots เป็น dict keyed by slot_id ---
            booking_slots = {}
            for s in slots:
                slot_obj = s.slot
                status_val = getattr(getattr(slot_obj, "slot_status", None), "status", "available")
                booking_slots[str(slot_obj.id)] = {
                    "status": status_val,
                    "start_time": slot_obj.start_at.strftime("%H:%M"),
                    "end_time": slot_obj.end_at.strftime("%H:%M"),
                    "court": slot_obj.court_id,
                    "court_name": slot_obj.court.name,
                    "price_coin": slot_obj.price_coins,
                }

            data.append({
                "created_date": b.created_at.strftime("%Y-%m-%d %H:%M"),
                "booking_id": b.booking_no,
                "user": b.user.username if b.user else None,
                "total_cost": f"{b.total_cost} coins" if b.total_cost else None,
                "booking_date": b.booking_date.strftime("%Y-%m-%d") if b.booking_date else None,
                "booking_status": b.status,
                "able_to_cancel": able_to_cancel,
                "booking_slots": booking_slots,
            })

        return Response({"results": data})


# ────────────────────────────── Cancel Booking ──────────────────────────────
class BookingCancelView(APIView):
    """
    Cancel a booking using its booking_no.

    Endpoint:
      POST /api/bookings/<booking_no>/cancel/
    """
    permission_classes = [permissions.IsAuthenticated]

    @transaction.atomic
    def post(self, request, booking_no):
        try:
            booking = Booking.objects.get(booking_no=booking_no)
        except Booking.DoesNotExist:
            return Response({"detail": "Booking not found"}, status=404)

        # Check permissions
        user_role = getattr(request.user, "role", None)
        if booking.user != request.user and user_role != "manager":
            return Response({"detail": "No permission to cancel"}, status=403)

        if booking.status == "cancelled":
            return Response({"detail": "Already cancelled"}, status=400)

        # Check timing
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

        # Process refund
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


# ────────────────────────────── Slot Status Update ──────────────────────────────
class SlotStatusUpdateView(APIView):
    """
    Manually change a slot’s status (manager-only).

    Endpoint:
      POST /api/slots/<slot_id>/set-status/<new_status>/
    """
    permission_classes = [permissions.IsAuthenticated]

    @transaction.atomic
    def post(self, request, slot_id, new_status):
        user_role = getattr(request.user, "role", None)
        if user_role != "manager":
            return Response({"detail": "Only managers can change status."}, status=403)

        try:
            slot_status = SlotStatus.objects.select_related("slot").get(slot_id=slot_id)
        except SlotStatus.DoesNotExist:
            return Response({"detail": "Slot not found"}, status=404)

        allowed_transitions = {
            "available": ["maintenance", "walkin", "booked", "expired"],
            "booked": ["checkin", "noshow"],
            "walkin": ["checkin", "noshow"],
            "checkin": ["endgame"],
            "maintenance": ["available"],
        }

        if new_status not in dict(SlotStatus.STATUS):
            return Response({"detail": "Invalid status"}, status=400)

        if new_status not in allowed_transitions.get(slot_status.status, []):
            return Response({"detail": f"Cannot change from {slot_status.status} → {new_status}"}, status=400)

        slot_status.status = new_status
        slot_status.save(update_fields=["status", "updated_at"])

        # Update linked booking status (if exists)
        bs = BookingSlot.objects.filter(slot=slot_status.slot).first()
        if bs:
            bs.booking.status = new_status
            bs.booking.save(update_fields=["status"])

        return Response({
            "detail": f"Slot {slot_id} status updated to {new_status}",
            "slot_id": slot_id,
            "new_status": new_status,
        }, status=200)
