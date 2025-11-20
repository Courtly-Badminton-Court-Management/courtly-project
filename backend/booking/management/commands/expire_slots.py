from django.core.management.base import BaseCommand
from django.utils import timezone
from booking.models import Slot, SlotStatus, BookingSlot


class Command(BaseCommand):
    help = "Auto-update slot and booking statuses based on Courtly spec"

    def handle(self, *args, **kwargs):
        now = timezone.now()
        updated = 0

        slots = Slot.objects.select_related("slot_status").all()

        for slot in slots:
            st = slot.slot_status
            start = timezone.localtime(slot.start_at)
            end = timezone.localtime(slot.end_at)

            # ----------------------------------------------------------------------
            # 1) AVAILABLE → EXPIRED
            # ----------------------------------------------------------------------
            if st.status == "available" and end < now:
                st.status = "expired"
                st.save(update_fields=["status", "updated_at"])
                updated += 1
                continue

            # ----------------------------------------------------------------------
            # 2) UPCOMING / BOOKED / WALKIN → NOSHOW
            # (Slot only becomes noshow AFTER end time)
            #
            # Booking noshow only when this is the LAST slot.
            # ----------------------------------------------------------------------
            if st.status in ["upcoming", "booked", "walkin"]:

                # Not yet start → skip
                if start > now:
                    continue

                # Passed start but not end → still waiting for check-in
                if start <= now < end:
                    continue

                # End time passed → NOSHOW
                if end < now:
                    st.status = "noshow"
                    st.save(update_fields=["status", "updated_at"])

                    # update booking ONLY if this is last slot
                    bs = BookingSlot.objects.filter(slot=slot).select_related("booking").first()
                    if bs:
                        last_slot = (
                            BookingSlot.objects.filter(booking=bs.booking)
                            .select_related("slot")
                            .order_by("-slot__end_at")
                            .first()
                        )
                        if last_slot and last_slot.slot.id == slot.id:
                            if bs.booking.status in ["upcoming", "booked", "walkin"]:
                                bs.booking.status = "noshow"
                                bs.booking.save(update_fields=["status"])

                    updated += 1
                    continue

            # ----------------------------------------------------------------------
            # 3) PLAYING → ENDED
            # (Slot must first become playing when manager checks in)
            #
            # Booking → ENDGAME only when the last slot ends.
            # ----------------------------------------------------------------------
            if st.status == "playing" and end < now:
                st.status = "ended"
                st.save(update_fields=["status", "updated_at"])

                bs = BookingSlot.objects.filter(slot=slot).select_related("booking").first()
                if bs:
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
                continue

        self.stdout.write(self.style.SUCCESS(f"Updated {updated} slot statuses"))
