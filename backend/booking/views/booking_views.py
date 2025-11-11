# /api/booking/, /api/bookings/, /api/my-bookings/, /api/booking/<id>/
# booking/views/booking_views.py
from django.db import transaction, DatabaseError
from ..models import Slot, SlotStatus, Booking, BookingSlot
from core.models import Club
from wallet.models import Wallet, CoinLedger
from datetime import datetime, timedelta
from django.utils import timezone
from ..serializers import BookingCreateSerializer
from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response
from rest_framework import status, permissions
from .utils import gen_booking_no, calculate_able_to_cancel


# ─────────────────────────────────────────────────────────────────────────────
# 4) GET /api/booking/<booking_id>/   (Authenticated: Manager or Owner)
# ─────────────────────────────────────────────────────────────────────────────
@api_view(["GET"])
@permission_classes([permissions.IsAuthenticated])
def booking_detail_view(request, booking_no: str):
    try:
        b = Booking.objects.select_related("user").get(booking_no=booking_no)
    except Booking.DoesNotExist:
        return Response({"detail": "Not found"}, status=404)

    user_role = getattr(request.user, "role", None)
    if b.user != request.user and user_role not in ["manager", "admin"]:
        return Response({"detail": "Forbidden"}, status=403)

    slots = (
        BookingSlot.objects.filter(booking=b)
        .select_related("slot", "slot__court", "slot__slot_status")
        .order_by("slot__start_at")
    )
    tz = timezone.get_current_timezone()

    # Build booking_slots dict keyed by slot_id
    booking_slots = {}
    for s in slots:
        slot = s.slot
        status_val = getattr(getattr(slot, "slot_status", None), "status", "available")
        booking_slots[str(slot.id)] = {
            "slot_status": status_val,
            "service_date": slot.service_date.strftime("%Y-%m-%d"),
            "start_time": timezone.localtime(slot.start_at, tz).strftime("%H:%M"),
            "end_time": timezone.localtime(slot.end_at, tz).strftime("%H:%M"),
            "court": slot.court_id,
            "court_name": slot.court.name,
            "price_coin": slot.price_coins,
        }

    created_local = timezone.localtime(b.created_at, tz)
    payload = {
        "created_date": created_local.strftime("%Y-%m-%d %H:%M"),
        "booking_id": b.booking_no,
        "owner_id": b.user_id if b.user_id else None,
        "owner_username": b.user.username if b.user_id else (b.customer_name or "Unknown"),
        "booking_method": getattr(b, "booking_method", "Courtly Website"),
        "owner_contact": getattr(b, "contact_detail", None),
        "total_cost": b.total_cost or 0,
        "payment_method": getattr(b, "payment_method", "coin"),
        "booking_date": b.booking_date.strftime("%Y-%m-%d") if b.booking_date else None,
        "booking_status": b.status,
        "able_to_cancel": False,  # detail pageไม่ต้องคำนวณซ้ำ (คำนวนใน list)
        "booking_slots": booking_slots,
    }
    return Response(payload, status=200)


# ─────────────────────────────────────────────────────────────────────────────
# 6) POST /api/booking/  (Authenticated)
#    - Wallet capture (coin) + status confirmed
# ─────────────────────────────────────────────────────────────────────────────
@api_view(["POST"])
@permission_classes([permissions.IsAuthenticated])
@transaction.atomic
def booking_create_view(request):
    ser = BookingCreateSerializer(data=request.data)
    ser.is_valid(raise_exception=True)

    club_id = ser.validated_data.get("club")
    slots_in = ser.validated_data.get("slots", [])
    booking_method = ser.validated_data.get("booking_method") or "Courtly Website"
    owner_username = ser.validated_data.get("owner_username") or request.user.username
    owner_contact = ser.validated_data.get("owner_contact") or request.user.email
    payment_method = ser.validated_data.get("payment_method") or "coin"

    if not club_id:
        return Response({"detail": "club is required"}, status=400)
    if not slots_in or not isinstance(slots_in, list):
        return Response({"detail": "slots must be a non-empty list"}, status=400)

    # Validate club
    if not Club.objects.filter(id=club_id).exists():
        return Response({"detail": "Club not found"}, status=404)

    # Fetch slots
    qs = (
        Slot.objects
        .filter(id__in=slots_in)
        .select_related("court", "slot_status")
        .order_by("start_at")
    )
    if not qs.exists():
        return Response({"detail": "No valid slots found"}, status=404)

    first_slot = qs.first()
    booking = Booking.objects.create(
        booking_no=gen_booking_no(),
        user=request.user,
        club_id=club_id,
        court_id=first_slot.court_id,
        booking_date=first_slot.service_date,
        status="confirmed",
        booking_method=booking_method,
        customer_name=owner_username,
        contact_method="Courtly Website",
        contact_detail=owner_contact,
        payment_method=payment_method,
    )

    total_cost = 0
    created_slot_ids = []
    for s in qs:
        status_val = getattr(getattr(s, "slot_status", None), "status", "available")
        if status_val != "available":
            return Response(
                {"detail": f"Slot {s.id} not available", "status": status_val}, status=409
            )
        BookingSlot.objects.create(booking=booking, slot=s)
        SlotStatus.objects.update_or_create(slot=s, defaults={"status": "booked"})
        total_cost += s.price_coins
        created_slot_ids.append(s.id)

    # Wallet capture (coin)
    wallet, _ = Wallet.objects.get_or_create(user=request.user, defaults={"balance": 0})
    if wallet.balance < total_cost:
        return Response(
            {"detail": "Insufficient balance", "required": total_cost, "balance": wallet.balance},
            status=402,
        )
    wallet.balance -= total_cost
    wallet.save(update_fields=["balance"])
    CoinLedger.objects.create(user=request.user, type="capture", amount=-total_cost, ref_booking=booking)

    booking.total_cost = total_cost
    booking.save(update_fields=["total_cost"])

    return Response(
        {
            "booking_id": booking.booking_no,
            "message": "Booking created successfully",
            "total_cost": total_cost,
            "status": "booked",
        },
        status=201,
    )


# ─────────────────────────────────────────────────────────────────────────────
# 7) GET /api/bookings/ (manager/admin = all) & GET /api/my-bookings/ (owner only)
# ─────────────────────────────────────────────────────────────────────────────
@api_view(["GET"])
@permission_classes([permissions.IsAuthenticated])
def bookings_all_view(request):
    """Managers/Admins — Get all bookings in the system."""
    role = getattr(request.user, "role", "player")
    if role not in ["manager", "admin"]:
        return Response({"detail": "Forbidden"}, status=403)

    qs = Booking.objects.all().select_related("user").order_by("-created_at")[:200]
    tz = timezone.get_current_timezone()
    data = []

    for b in qs:
        slots = (
            BookingSlot.objects.filter(booking=b)
            .select_related("slot", "slot__slot_status")
            .order_by("slot__start_at")
        )
        first_slot = slots.first()
        able_to_cancel = calculate_able_to_cancel(first_slot) if first_slot else False
        if b.status == "cancelled":
            able_to_cancel = False

        created_local = timezone.localtime(b.created_at, tz)
        data.append({
            "booking_id": b.booking_no,
            "created_date": created_local.strftime("%Y-%m-%d %H:%M"),
            "total_cost": int(b.total_cost or 0),
            "booking_date": b.booking_date.strftime("%Y-%m-%d") if b.booking_date else None,
            "booking_status": b.status,
            "able_to_cancel": able_to_cancel,
            "owner_id": b.user_id if b.user_id else None,
        })

    return Response(data, status=200)


@api_view(["GET"])
@permission_classes([permissions.IsAuthenticated])
def bookings_my_view(request):
    """Players — Get bookings belonging to the current user."""
    qs = Booking.objects.filter(user=request.user).order_by("-created_at")[:50]
    tz = timezone.get_current_timezone()
    data = []

    for b in qs:
        slots = (
            BookingSlot.objects.filter(booking=b)
            .select_related("slot", "slot__slot_status")
            .order_by("slot__start_at")
        )
        first_slot = slots.first()
        able_to_cancel = calculate_able_to_cancel(first_slot) if first_slot else False
        if b.status == "cancelled":
            able_to_cancel = False

        created_local = timezone.localtime(b.created_at, tz)
        data.append({
            "booking_id": b.booking_no,
            "created_date": created_local.strftime("%Y-%m-%d %H:%M"),
            "total_cost": int(b.total_cost or 0),
            "booking_date": b.booking_date.strftime("%Y-%m-%d") if b.booking_date else None,
            "booking_status": b.status,
            "able_to_cancel": able_to_cancel,
            "owner_id": b.user_id,
        })

    return Response(data, status=200)


# ─────────────────────────────────────────────────────────────────────────────
#  Cancel: POST /api/bookings/<booking_no>/cancel/
# ─────────────────────────────────────────────────────────────────────────────
@api_view(["POST"])
@permission_classes([permissions.IsAuthenticated])
@transaction.atomic
def booking_cancel_view(request, booking_no: str):
    try:
        booking = Booking.objects.get(booking_no=booking_no)
    except Booking.DoesNotExist:
        return Response({"detail": "Booking not found"}, status=404)

    role = getattr(request.user, "role", None)
    if booking.user != request.user and role != "manager":
        return Response({"detail": "No permission to cancel"}, status=403)

    if booking.status == "cancelled":
        return Response({"detail": "Already cancelled", "able_to_cancel": False}, status=400)

    slots = (
        BookingSlot.objects.filter(booking=booking)
        .select_related("slot", "slot__court", "slot__slot_status")
    )
    if not slots.exists():
        return Response({"detail": "No slot info found"}, status=400)

    # 24h rule
    first_slot = slots.first()
    if not calculate_able_to_cancel(first_slot):
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

    # Refund + set slot available
    refund = 0
    for bs in slots:
        s = bs.slot
        refund += getattr(s, "price_coins", 0)
        if hasattr(s, "slot_status") and s.slot_status:
            s.slot_status.status = "available"
            s.slot_status.save(update_fields=["status", "updated_at"])
        else:
            SlotStatus.objects.create(slot=s, status="available")

    # Keep BookingSlot relations (history)
    booking.status = "cancelled"
    booking.save(update_fields=["status"])

    wallet, _ = Wallet.objects.get_or_create(user=booking.user, defaults={"balance": 0})
    wallet.balance += refund
    wallet.save(update_fields=["balance"])
    CoinLedger.objects.create(user=booking.user, type="refund", amount=refund, ref_booking=booking)

    tz = timezone.get_current_timezone()
    slot_data = []
    for bs in slots:
        s = bs.slot
        slot_data.append({
            "slot_id": s.id,
            "court": s.court_id,
            "court_name": s.court.name,
            "start_time": timezone.localtime(s.start_at, tz).strftime("%H:%M"),
            "end_time": timezone.localtime(s.end_at, tz).strftime("%H:%M"),
            "price_coin": s.price_coins,
            "slot_status": getattr(getattr(s, "slot_status", None), "status", "available"),
        })

    return Response(
        {
            "detail": "Booking cancelled successfully",
            "booking_no": booking.booking_no,
            "refund_amount": refund,
            "booking_status": "cancelled",
            "booking_slots": slot_data,
            "new_balance": wallet.balance,
            "able_to_cancel": False,
        },
        status=200,
    )
