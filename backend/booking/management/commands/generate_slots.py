from django.core.management.base import BaseCommand
from datetime import date, datetime, timedelta
from django.utils.timezone import make_aware, get_current_timezone
from core.models import Court
from ops.models import BusinessHour
from booking.models import Slot

class Command(BaseCommand):
    help = "Generate 30-min slots from BusinessHour for a date range (inclusive)."

    def add_arguments(self, parser):
        parser.add_argument("--start", required=True, help="YYYY-MM-DD")
        parser.add_argument("--end",   required=True, help="YYYY-MM-DD")
        parser.add_argument("--club",  type=int, help="Club ID (optional). If omitted, generate for all clubs having BusinessHour.")

    def handle(self, *args, **opts):
        tz = get_current_timezone()
        d0 = date.fromisoformat(opts["start"])
        d1 = date.fromisoformat(opts["end"])
        days = (d1 - d0).days + 1

        bh_qs = BusinessHour.objects.all()
        if opts.get("club"):
            bh_qs = bh_qs.filter(club_id=opts["club"])

        created = 0
        for i in range(days):
            d = d0 + timedelta(days=i)
            dow = d.weekday()
            # business hours ที่ตรงกับวันในสัปดาห์นั้น
            for bh in bh_qs.filter(dow=dow).select_related("club"):
                # ทุกคอร์ทของคลับนั้น
                for court in Court.objects.filter(club=bh.club).only("id","club_id","name"):
                    # วนเป็นช่วง 30 นาที
                    start_dt = datetime.combine(d, bh.open_time)
                    end_dt   = datetime.combine(d, bh.close_time)

                    start_dt = make_aware(start_dt, tz)
                    end_dt   = make_aware(end_dt, tz)

                    cur = start_dt
                    while cur < end_dt:
                        nxt = min(cur + timedelta(minutes=30), end_dt)
                        _, ok = Slot.objects.get_or_create(
                            court=court,
                            service_date=d,
                            start_at=cur,
                            end_at=nxt,
                            defaults={"status": "available", "dow": dow, "price_coins": 50},
                        )
                        created += int(ok)
                        cur = nxt

        self.stdout.write(self.style.SUCCESS(f"Created {created} slots"))