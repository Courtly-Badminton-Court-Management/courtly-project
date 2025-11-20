# booking/views/manager_views.py
from django.db import transaction
from django.utils import timezone
from rest_framework import permissions, status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response

from ..models import Slot, SlotStatus, Booking, BookingSlot, Club
from ..serializers import BookingCreateSerializer
from .utils import gen_booking_no, combine_dt, calculate_able_to_cancel


# ─────────────────────────────────────────────────────────────────────────────
#  Walk-in (Manager only): POST /api/booking/walkin/
# ─────────────────────────────────────────────────────────────────────────────
@api_view(["POST"])
@permission_classes([permissions.IsAuthenticated])
@transaction.atomic
def booking_walkin_view(request):
    role = getattr(request.user, "role", None)
    if role != "manager":
        return Response({"detail": "Only manager can create walk-in booking"}, status=403)

    ser = BookingCreateSerializer(data=request.data)
    ser.is_valid(raise_exception=True)

    club_id = ser.validated_data.get("club")
    items = ser.validated_data.get("items", [])

    if not club_id:
        return Response({"detail": "club is required"}, status=400)
    if not Club.objects.filter(id=club_id).exists():
        return Response({"detail": "Club not found"}, status=404)
    if not items:
        return Response({"detail": "No slot items provided"}, status=400)

    customer_name = request.data.get("customer_name", "Walk-in Customer")
    contact_method = request.data.get("contact_method", "Walk-in (no contact)")
    contact_detail = request.data.get("contact_detail", None)

    first_item = items[0]
    first_date = first_item.get("date")
    first_court = first_item.get("court")
    if not first_date or not first_court:
        return Response({"detail": "items[].date and items[].court are required"}, status=400)
    if first_date < timezone.localdate():
        return Response({"detail": f"Cannot book for a past date: {first_date}"}, status=400)

    booking = Booking.objects.create(
        booking_no=gen_booking_no(),
        user=request.user,  # created by manager
        club_id=club_id,
        court_id=first_court,
        status="walkin",
        booking_date=first_date,
        total_cost=0,
        customer_name=customer_name,
        contact_method=contact_method,
        contact_detail=contact_detail,
    )

    total_cost = 0
    created_slots = []

    for it in items:
        court_id = it["court"]
        d = it["date"]
        start_dt = combine_dt(d, it["start"])
        end_dt = combine_dt(d, it["end"])

        # query matching slots in that range
        slots = (
            Slot.objects
            .select_related("slot_status")
            .filter(
                court_id=court_id,
                service_date=d,
                start_at__gte=timezone.make_naive(start_dt),
                end_at__lte=timezone.make_naive(end_dt),
            )
            .order_by("start_at")
        )

        if not slots:
            return Response({"detail": f"No slots found for court {court_id} @ {d}"}, status=400)

        for s in slots:
            if not hasattr(s, "slot_status"):
                SlotStatus.objects.create(slot=s, status="available")
                s.refresh_from_db()

            if s.slot_status.status != "available":
                return Response(
                    {"detail": f"Slot {s.id} not available", "status": s.slot_status.status},
                    status=409,
                )

            BookingSlot.objects.create(booking=booking, slot=s)
            SlotStatus.objects.update_or_create(slot=s, defaults={"status": "walkin"})
            total_cost += s.price_coins
            created_slots.append(s.id)

    booking.total_cost = total_cost
    booking.save(update_fields=["total_cost", "customer_name", "contact_method", "contact_detail"])

    return Response(
        {
            "ok": True,
            "booking": {
                "booking_no": booking.booking_no,
                "club": club_id,
                "court": first_court,
                "customer_name": booking.customer_name,
                "contact_method": booking.contact_method,
                "contact_detail": booking.contact_detail,
                "status": "walkin",
                "slots": created_slots,
                "total_cost": total_cost,
            },
        },
        status=201,
    )


# ─────────────────────────────────────────────────────────────────────────────
#  Bulk status update (Manager only): POST /api/slots/update-status/
# ─────────────────────────────────────────────────────────────────────────────
@api_view(["POST"])
@permission_classes([permissions.IsAuthenticated])
@transaction.atomic
def slot_bulk_status_update_view(request):
    role = getattr(request.user, "role", None)
    if role != "manager":
        return Response({"detail": "Only managers can change status."}, status=403)

    items = request.data.get("items", [])
    if not items or not isinstance(items, list):
        return Response({"detail": "items must be a list of {slot, status}"}, status=400)

    # UPDATED transitions
    allowed_transitions = {
        "available": ["maintenance", "walkin", "booked", "expired"],
        "booked": ["checkin", "noshow"],
        "upcoming": ["checkin", "noshow"],  # <-- new
        "walkin": ["checkin", "noshow"],
        "checkin": ["endgame"],
        "maintenance": ["available"],
    }

    updated, errors = [], []

    for it in items:
        slot_id = it.get("slot")
        new_status = it.get("status")

        if not slot_id or not new_status:
            errors.append({"slot": slot_id, "detail": "Missing slot or status"})
            continue

        try:
            ss = SlotStatus.objects.select_related("slot").get(slot_id=slot_id)
        except SlotStatus.DoesNotExist:
            errors.append({"slot": slot_id, "detail": "Slot not found"})
            continue

        if new_status not in dict(SlotStatus.STATUS):
            errors.append({"slot": slot_id, "detail": "Invalid status"})
            continue

        if new_status not in allowed_transitions.get(ss.status, []):
            errors.append({"slot": slot_id, "detail": f"Cannot change from {ss.status} → {new_status}"})
            continue

        ss.status = new_status
        ss.save(update_fields=["status", "updated_at"])

        booking_slot = BookingSlot.objects.filter(slot=ss.slot).select_related("booking").first()
        if booking_slot and booking_slot.booking:
            booking_slot.booking.status = new_status
            booking_slot.booking.save(update_fields=["status"])

        updated.append({"slot_id": slot_id, "new_status": new_status})

    return Response({"detail": "Bulk update complete", "updated": updated, "errors": errors}, status=200)


# ─────────────────────────────────────────────────────────────────────────────
#  Check-in Booking (Manager only): POST /api/booking/<booking_no>/checkin/
# ─────────────────────────────────────────────────────────────────────────────
@api_view(["POST"])
@permission_classes([permissions.IsAuthenticated])
@transaction.atomic
def booking_checkin_view(request, booking_no):
    """
    Manager performs check-in:
      - Booking.status → "checkin"
      - All SlotStatus for this booking → "playing"
    """

    role = getattr(request.user, "role", None)
    if role != "manager":
        return Response({"detail": "Only managers can perform check-in."}, status=403)

    # Step 1: Retrieve booking
    try:
        booking = Booking.objects.get(booking_no=booking_no)
    except Booking.DoesNotExist:
        return Response({"detail": "Booking not found."}, status=404)

    # Step 2: Validate blocked states
    if booking.status in ["cancelled", "endgame", "noshow"]:
        return Response(
            {"detail": f"Cannot check-in a booking that is already '{booking.status}'."},
            status=400,
        )

    # Step 3: Allowed check-in statuses
    # Spec: upcoming + walkin
    ALLOWED_CHECKIN = ["upcoming", "walkin"]

    if booking.status not in ALLOWED_CHECKIN:
        return Response(
            {"detail": f"Cannot check-in from status '{booking.status}'. Only upcoming or walkin allowed."},
            status=400,
        )

    # Step 4: Update booking status
    booking.status = "checkin"
    booking.save(update_fields=["status"])

    # Step 5: Update all related slot statuses → playing
    booking_slots = BookingSlot.objects.filter(booking=booking).select_related("slot")
    updated_slots = []

    for bs in booking_slots:
        try:
            ss = SlotStatus.objects.get(slot=bs.slot)
            ss.status = "playing"  # ← SPEC: change slot state to playing after check-in
            ss.save(update_fields=["status", "updated_at"])
            updated_slots.append(str(ss.slot.id))
        except SlotStatus.DoesNotExist:
            continue

    return Response(
        {
            "booking_id": booking.booking_no,
            "status": "checked_in",
            "updated_slots": updated_slots,
            "message": "Booking checked in successfully."
        },
        status=200,
    )


@api_view(["POST"])
@permission_classes([permissions.IsAuthenticated])
@transaction.atomic
def slot_simple_status_update_view(request):
    """
    Simple bulk slot status update.
    """

    role = getattr(request.user, "role", None)
    if role != "manager":
        return Response({"detail": "Only managers can change slot status."}, status=403)

    # Validate request format using serializer
    from ..serializers import SlotStatusUpdateSerializer

    ser = SlotStatusUpdateSerializer(data=request.data)
    ser.is_valid(raise_exception=True)

    slots = ser.validated_data["slots"]
    changed_to = ser.validated_data["changed_to"]

    # Make sure all slots are numeric
    try:
        slots = [int(s) for s in slots]
    except Exception:
        return Response({"detail": "All slot IDs must be numeric strings or integers."}, status=400)

    allowed_map = {
        "available": ["maintenance"],
        "maintenance": ["available"],
    }

    updated_count = 0
    errors = []

    for slot_id in slots:
        try:
            ss = SlotStatus.objects.select_related("slot").get(slot_id=slot_id)
        except SlotStatus.DoesNotExist:
            errors.append({"slot": slot_id, "detail": "Slot not found"})
            continue

        if ss.status not in allowed_map[changed_to]:
            errors.append({
                "slot": slot_id,
                "detail": f"Cannot change from {ss.status} → {changed_to}"
            })
            continue

        ss.status = changed_to
        ss.save(update_fields=["status", "updated_at"])
        updated_count += 1

    return Response(
        {
            "updated_count": updated_count,
            "new_status": changed_to,
            "message": "Slot statuses updated successfully.",
            "errors": errors,
        },
        status=200
    )


@api_view(["GET"])
@permission_classes([permissions.IsAuthenticated])
def bookings_upcoming_view(request):
    """Managers — Get upcoming confirmed bookings only."""
    role = getattr(request.user, "role", "player")
    if role not in ["manager", "admin"]:
        return Response({"detail": "Forbidden"}, status=403)

    today = timezone.localdate()

    qs = (
        Booking.objects
        .filter(status="confirmed", booking_date__gte=today)
        .select_related("user")
        .order_by("booking_date", "created_at")
    )

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

        created_local = timezone.localtime(b.created_at, tz)

        data.append({
            "booking_id": b.booking_no,
            "created_date": created_local.strftime("%Y-%m-%d %H:%M"),
            "total_cost": int(b.total_cost or 0),
            "booking_date": b.booking_date.strftime("%Y-%m-%d"),
            "booking_status": b.status,
            "able_to_cancel": able_to_cancel,
            "owner_id": b.user_id if b.user_id else None,
        })

    return Response(data, status=200)
