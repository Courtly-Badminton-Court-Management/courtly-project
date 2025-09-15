from .models import Booking
from .serializers import BookingSerializer
from rest_framework import viewsets, permissions
# optional mock UI view
from django.views.generic import TemplateView
from .models import Slot
from .serializers import SlotSerializer
from datetime import date, datetime
import calendar
from rest_framework.decorators import action
from rest_framework.response import Response


class SlotViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = Slot.objects.all()
    serializer_class = SlotSerializer
    permission_classes = [permissions.AllowAny]

    @action(detail=False, url_path="month-view")
    def month_view(self, request):
        """
        GET /api/slots/month-view?club=1&month=2025-09
        -> {
             "month": "09-25",
             "days": [ { "date": "01-09-25", "slotList": { "<slotId>": {...} } }, ... ]
           }
        """
        club_id = request.query_params.get("club")
        month_str = request.query_params.get("month")  # YYYY-MM

        if not (club_id and month_str):
            return Response({"detail": "club and month are required (month=YYYY-MM)"}, status=400)

        # first/last day of month
        y, m = map(int, month_str.split("-"))
        first_day = date(y, m, 1)
        last_day = date(y, m, calendar.monthrange(y, m)[1])

        qs = (
            Slot.objects
            .select_related("court", "court__club", "slot_status")  # keep if OneToOne name is slot_status
            .filter(
                court__club_id=club_id,
                service_date__gte=first_day,
                service_date__lte=last_day,
            )
            .order_by("service_date", "court_id", "start_at")
        )

        # group by day → { "DD-MM-YY": { slotId: {...} } }
        by_day = {}
        for s in qs:
            day_key = s.service_date.strftime("%d-%m-%y")
            slot_key = str(s.id)
            status = getattr(getattr(s, "slot_status", None), "status", "available")

            by_day.setdefault(day_key, {})[slot_key] = {
                "status": status,
                "start_time": s.start_at.strftime("%H:%M"),
                "end_time": s.end_at.strftime("%H:%M"),
                # optional extra (ISO datetimes) — uncomment if you want them:
                # "start_at": s.start_at.isoformat(),
                # "end_at":   s.end_at.isoformat(),
                "court": s.court_id,
                "courtName": s.court.name,
            }

        payload = {
            "month": first_day.strftime("%m-%y"),
            "days": [{"date": d, "slotList": slots} for d, slots in by_day.items()],
        }
        payload["days"].sort(key=lambda x: datetime.strptime(x["date"], "%d-%m-%y"))
        return Response(payload)


class BookingViewSet(viewsets.ModelViewSet):
    queryset = Booking.objects.all()
    serializer_class = BookingSerializer
    permission_classes = [permissions.IsAuthenticated]

    @action(detail=True, methods=["delete"])
    def cancel(self, request, pk=None):
        booking = self.get_object()
        booking.status = "cancelled"
        booking.save()
        return Response({"status": "cancelled"})


class BookingUIMockView(TemplateView):
    template_name = "booking/mock.html"
