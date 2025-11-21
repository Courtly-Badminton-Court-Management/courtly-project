# gen_booking_no, combine_dt, calculate_able_to_cancel
# booking/views/utils.py
import uuid
import calendar
from datetime import date, datetime, timedelta

from django.utils import timezone


def gen_booking_no() -> str:
    """Generate a unique booking number, e.g., BK-7F2C9E1A23."""
    return f"BK-{uuid.uuid4().hex[:10].upper()}"


def combine_dt(d: date, t) -> datetime:
    """Combine a date and time object/HH:MM string into tz-aware datetime (current TZ)."""
    if isinstance(t, str):
        t = datetime.strptime(t, "%H:%M").time()
    dt = datetime.combine(d, t)
    if timezone.is_naive(dt):
        dt = timezone.make_aware(dt, timezone.get_current_timezone())
    return dt


def calculate_able_to_cancel(first_slot):
    """Check if booking can be cancelled (more than 24 hours before start)."""
    if not first_slot or not first_slot.slot or not hasattr(first_slot.slot, "slot_status"):
        return False

    if first_slot.slot.slot_status.status == "cancelled":
        return False

    slot_start = first_slot.slot.start_at
    slot_local = timezone.localtime(slot_start)
    return timezone.now() <= slot_local - timedelta(hours=24)
