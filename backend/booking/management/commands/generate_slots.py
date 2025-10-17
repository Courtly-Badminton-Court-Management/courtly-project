from django.core.management.base import BaseCommand
from booking.models import Court, Slot, SlotStatus
from core.models import Club
from datetime import datetime, timedelta, time
from django.utils import timezone


class Command(BaseCommand):
    help = "Generate 30-min booking slots for a given club and date range (Asia/Bangkok)"

    def add_arguments(self, parser):
        parser.add_argument("--club", type=int, required=True, help="Club ID")
        parser.add_argument("--start", type=str, required=True, help="Start date (YYYY-MM-DD)")
        parser.add_argument("--end", type=str, required=True, help="End date (YYYY-MM-DD)")

    def handle(self, *args, **options):
        club_id = options["club"]
        start_date = datetime.strptime(options["start"], "%Y-%m-%d").date()
        end_date = datetime.strptime(options["end"], "%Y-%m-%d").date()

        # ✅ ตรวจสอบ club
        try:
            club = Club.objects.get(id=club_id)
        except Club.DoesNotExist:
            self.stderr.write(self.style.ERROR(f"❌ Club {club_id} not found"))
            return

        # 🕙 เวลาทำการ 10:00–22:00
        open_time = time(10, 0)
        close_time = time(22, 0)

        # ✅ ดึง court ทั้งหมดใน club (ใช้ club_id เพื่อป้องกัน instance mismatch)
        courts = Court.objects.filter(club_id=club.id).order_by("id")
        if not courts.exists():
            self.stderr.write(self.style.ERROR(f"❌ No courts found for club {club.name}"))
            return

        tz = timezone.get_current_timezone()  # จะเป็น Asia/Bangkok
        created = 0

        self.stdout.write(self.style.WARNING(f"🧩 Starting slot generation for {club.name} ({courts.count()} courts)..."))

        # ✅ loop court ทั้งหมด
        for court in courts:
            self.stdout.write(f"➡️ Generating slots for {court.name} (id={court.id})")
            d = start_date
            while d <= end_date:
                # ✅ สร้าง datetime timezone-aware
                start_dt = timezone.make_aware(datetime.combine(d, open_time), tz)
                end_dt = timezone.make_aware(datetime.combine(d, close_time), tz)

                # 🧹 ลบ slot เดิมในวันนั้นก่อน (ป้องกันซ้ำหรือ timezone mismatch)
                Slot.objects.filter(court=court, service_date=d).delete()

                # ✅ วนสร้าง slot ทุก 30 นาที
                current_time = start_dt
                while current_time < end_dt:
                    slot = Slot.objects.create(
                        court=court,
                        service_date=d,
                        start_at=current_time,
                        end_at=current_time + timedelta(minutes=30),
                        price_coins=100,
                    )
                    SlotStatus.objects.create(slot=slot, status="available")
                    created += 1
                    current_time += timedelta(minutes=30)

                d += timedelta(days=1)

        self.stdout.write(self.style.SUCCESS(
            f"✅ Created {created} slots for club {club.name} (Asia/Bangkok timezone)"
        ))
