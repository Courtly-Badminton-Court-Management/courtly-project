from django.core.management.base import BaseCommand
from django.utils import timezone
from datetime import timedelta
from booking.models import Slot, SlotStatus, BookingSlot


class Command(BaseCommand):
    help = "Auto-update slot and booking statuses based on real-time logic"

    def handle(self, *args, **kwargs):
        now = timezone.now()
        updated = 0

        slots = Slot.objects.select_related("slot_status").all()
        for slot in slots:
            st = slot.slot_status
            start_time = timezone.localtime(slot.start_at)
            end_time = timezone.localtime(slot.end_at)

            # Slot is available and has passed -> mark expired
            if st.status == "available" and end_time < now:
                st.status = "expired"
                st.save(update_fields=["status", "updated_at"])
                updated += 1
                continue

            # Slot is booked or walk-in and player never checked in -> mark no_show
            if st.status in ["booked", "walkin"] and start_time < now and end_time < now:
                st.status = "no_show"
                st.save(update_fields=["status", "updated_at"])

                bs = BookingSlot.objects.filter(slot=slot).select_related("booking").first()
                if bs:
                    bs.booking.status = "no_show"
                    bs.booking.save(update_fields=["status"])
                updated += 1
                continue

            # Slot was check-in and time ended -> mark endgame
            if st.status == "checkin" and end_time < now:
                st.status = "endgame"
                st.save(update_fields=["status", "updated_at"])

                bs = BookingSlot.objects.filter(slot=slot).select_related("booking").first()
                if bs:
                    bs.booking.status = "endgame"
                    bs.booking.save(update_fields=["status"])
                updated += 1

        self.stdout.write(self.style.SUCCESS(f"Updated {updated} slot statuses"))
