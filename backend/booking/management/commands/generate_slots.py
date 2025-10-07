from django.core.management.base import BaseCommand
from booking.models import Court, Slot, SlotStatus
from core.models import Club
from datetime import datetime, timedelta, time


class Command(BaseCommand):
    help = "Generate 30-min booking slots for a given club and date range"

    def add_arguments(self, parser):
        parser.add_argument("--club", type=int, required=True, help="Club ID")
        parser.add_argument("--start", type=str, required=True, help="Start date (YYYY-MM-DD)")
        parser.add_argument("--end", type=str, required=True, help="End date (YYYY-MM-DD)")

    def handle(self, *args, **options):
        club_id = options["club"]
        start_date = datetime.strptime(options["start"], "%Y-%m-%d").date()
        end_date = datetime.strptime(options["end"], "%Y-%m-%d").date()

        try:
            club = Club.objects.get(id=club_id)
        except Club.DoesNotExist:
            self.stderr.write(self.style.ERROR(f"Club {club_id} not found"))
            return

        # เวลาทำการ (10:00–19:00 → slot สุดท้ายจบที่ 19:30)
        open_time = time(10, 0)
        close_time = time(19, 0)

        courts = Court.objects.filter(club=club)
        if not courts.exists():
            self.stderr.write(self.style.ERROR(f"No courts found for club {club.name}"))
            return

        created = 0
        for court in courts:
            d = start_date
            while d <= end_date:
                current_time = datetime.combine(d, open_time)
                end_of_day = datetime.combine(d, close_time)

                while current_time < end_of_day:
                    slot, is_created = Slot.objects.get_or_create(
                        court=court,
                        service_date=d,
                        start_at=current_time,
                        end_at=current_time + timedelta(minutes=30),
                        defaults={"price_coins": 100},
                    )

                    if is_created:
                        # สร้าง SlotStatus ให้เป็น available โดย default
                        SlotStatus.objects.create(slot=slot, status="available")
                        created += 1

                    current_time += timedelta(minutes=30)

                d += timedelta(days=1)

        self.stdout.write(self.style.SUCCESS(f"Created {created} slots for club {club.name}"))
