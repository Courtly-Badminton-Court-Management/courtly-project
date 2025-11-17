from django.core.management.base import BaseCommand
from django.utils import timezone
from datetime import timedelta
from booking.models import Slot, SlotStatus, BookingSlot


class Command(BaseCommand):
    help = "Auto-update slot and booking statuses based on real-time rules"

    def handle(self, *args, **kwargs):
        now = timezone.now()
        updated = 0

        slots = Slot.objects.select_related("slot_status").all()

        for slot in slots:
            st = slot.slot_status
            start = timezone.localtime(slot.start_at)
            end = timezone.localtime(slot.end_at)

            # -----------------------------------------------
            # 1) AVAILABLE → EXPIRED
            # Slot was never booked and its end time has passed.
            # -----------------------------------------------
            if st.status == "available" and end < now:
                st.status = "expired"
                st.save(update_fields=["status", "updated_at"])
                updated += 1
                continue

            # -----------------------------------------------
            # 2) BOOKED / WALK-IN → NO_SHOW
            # Player did not check-in before the start time.
            #
            # Rules:
            #   - Once start time has passed → check if user checked in.
            #   - If not checked-in and end time also passed → mark slot as no_show.
            #   - Booking status also becomes no_show unless it was already checkin/endgame.
            # -----------------------------------------------
            if st.status in ["booked", "walkin"] and start < now:
                # If the slot has completely passed and no check-in happened
                if end < now:
                    st.status = "no_show"
                    st.save(update_fields=["status", "updated_at"])

                bs = BookingSlot.objects.filter(slot=slot).select_related("booking").first()
                if bs:
                    # Only update booking if still in an "upcoming" state
                    if bs.booking.status not in ["checkin", "endgame"]:
                        bs.booking.status = "no_show"
                        bs.booking.save(update_fields=["status"])

                updated += 1
                continue

            # -----------------------------------------------
            # 3) CHECK-IN → ENDGAME
            # Player has checked in, and the slot end time has passed.
            #
            # Booking status becomes endgame only when this slot is the
            # final slot of the entire booking.
            # -----------------------------------------------
            if st.status == "checkin" and end < now:
                st.status = "endgame"
                st.save(update_fields=["status", "updated_at"])

                bs = BookingSlot.objects.filter(slot=slot).select_related("booking").first()
                if bs:
                    # Determine whether this slot is the last slot of the booking
                    last_slot = (
                        BookingSlot.objects.filter(booking=bs.booking)
                        .select_related("slot")
                        .order_by("-slot__end_at")
                        .first()
                    )
                    if last_slot and last_slot.slot.id == slot.id:
                        bs.booking.status = "endgame"
                        bs.booking.save(update_fields=["status"])

                updated += 1

        self.stdout.write(self.style.SUCCESS(f"Updated {updated} slot statuses"))
