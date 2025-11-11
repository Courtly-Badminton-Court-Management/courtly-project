# booking/views/slot_views.py
import calendar
from datetime import date, datetime, timedelta

from django.utils import timezone
from rest_framework import permissions, status, viewsets
from rest_framework.decorators import action, api_view, permission_classes
from rest_framework.response import Response

from ..models import Slot, SlotStatus
from ..serializers import SlotSerializer, SlotListRequestSerializer


# ─────────────────────────────────────────────────────────────────────────────
# 1) /available-slots/?club=&month=YYYY-MM  (AllowAny)
# ─────────────────────────────────────────────────────────────────────────────
@api_view(["GET"])
@permission_classes([permissions.AllowAny])
def available_slots_month_view(request):
    """
    Public calendar: GET /available-slots/?club=<id>&month=YYYY-MM
    Response fields must match doc: available_percent (0-1), available_slots[], date: DD-MM-YY
    """
    raw_club = request.query_params.get("club")
    month_str = request.query_params.get("month")

    try:
        club_id = int(raw_club)
    except (TypeError, ValueError):
        return Response({"detail": "club must be an integer id"}, status=400)

    if not month_str or len(month_str) != 7 or "-" not in month_str:
        return Response({"detail": "month is required as YYYY-MM"}, status=400)

    try:
        y, m = map(int, month_str.split("-"))
    except ValueError:
        return Response({"detail": "invalid month format, use YYYY-MM"}, status=400)

    first_day = date(y, m, 1)
    last_day = date(y, m, calendar.monthrange(y, m)[1])

    qs = (
        Slot.objects
        .select_related("court", "slot_status")
        .filter(court__club_id=club_id, service_date__gte=first_day, service_date__lte=last_day)
        .order_by("service_date", "court_id", "start_at")
    )

    by_day = {}
    for s in qs:
        day_key = s.service_date.strftime("%d-%m-%y")
        status_val = getattr(getattr(s, "slot_status", None), "status", "available")
        if day_key not in by_day:
            by_day[day_key] = {"total": 0, "available": 0, "slots": []}
        by_day[day_key]["total"] += 1
        if status_val == "available":
            by_day[day_key]["available"] += 1
            by_day[day_key]["slots"].append({
                "slot_status": status_val,
                "service_date": s.service_date.isoformat(),
                "start_time": timezone.localtime(s.start_at).strftime("%H:%M"),
                "end_time": timezone.localtime(s.end_at).strftime("%H:%M"),
                "court": s.court_id,
                "court_name": s.court.name,
                "price_coin": s.price_coins,
            })

    days_payload = []
    for day_key in sorted(by_day.keys(), key=lambda x: datetime.strptime(x, "%d-%m-%y")):
        info = by_day[day_key]
        total = info["total"]
        available_ratio = round(info["available"] / total, 2) if total > 0 else 0.0
        days_payload.append({
            "date": day_key,  # DD-MM-YY
            "available_percent": available_ratio,
            "available_slots": info["slots"],
        })

    return Response({
        "month": first_day.strftime("%m-%y"),
        "days": days_payload,
    })


# ─────────────────────────────────────────────────────────────────────────────
# 2) /api/slots/<slot_id>/ (Authenticated)  + 3) /api/slots/slots-list/ (POST)
# ─────────────────────────────────────────────────────────────────────────────
class SlotViewSet(viewsets.ReadOnlyModelViewSet):
    """
    /api/slots/<pk>/ : detail
    /api/slots/slots-list/ : POST { "slot_list": ["25188","25189"] }
    """
    queryset = Slot.objects.all().select_related("court", "slot_status")
    serializer_class = SlotSerializer
    permission_classes = [permissions.AllowAny]

    def retrieve(self, request, pk=None):
        try:
            slot = self.get_queryset().get(pk=pk)
        except Slot.DoesNotExist:
            return Response({"detail": "Not found"}, status=404)

        # Map fields to match doc for detail
        data = {
            "slot_status": getattr(getattr(slot, "slot_status", None), "status", "available"),
            "service_date": slot.service_date.strftime("%Y-%m-%d"),
            "start_time": timezone.localtime(slot.start_at).strftime("%H:%M"),
            "end_time": timezone.localtime(slot.end_at).strftime("%H:%M"),
            "court": slot.court_id,
            "court_name": slot.court.name,
            "price_coin": slot.price_coins,
            "booking_id": SlotSerializer(slot).data.get("booking_id"),  # reuse logic
        }
        return Response(data, status=200)

    @action(detail=False, methods=["POST"], url_path="slots-list")
    def slots_list(self, request):
        """
        POST /api/slots/slots-list/
        Body: { "slot_list": ["25188", "25189"] }
        """
        ser = SlotListRequestSerializer(data=request.data)
        ser.is_valid(raise_exception=True)
        slot_ids = ser.validated_data["slot_list"]

        # cast to int safely
        try:
            slot_ids = [int(sid) for sid in slot_ids]
        except Exception:
            return Response({"detail": "All slot IDs must be integers or numeric strings"}, status=400)

        qs = self.get_queryset().filter(id__in=slot_ids).order_by("start_at")
        if not qs.exists():
            return Response({"detail": "No slots found"}, status=404)

        slot_items = []
        for s in qs:
            slot_items.append({
                "slot_status": getattr(getattr(s, "slot_status", None), "status", "available"),
                "service_date": s.service_date.strftime("%Y-%m-%d"),
                "start_time": timezone.localtime(s.start_at).strftime("%H:%M"),
                "end_time": timezone.localtime(s.end_at).strftime("%H:%M"),
                "court": s.court_id,
                "court_name": s.court.name,
                "price_coin": s.price_coins,
            })
        return Response({"slot_items": slot_items}, status=200)

    @action(detail=False, url_path="month-view", methods=["GET"])
    def month_view(self, request):
        """
        Retrieve all slots for a given club and month.
        Example:
            GET /api/slots/month-view?club=1&month=2025-09
        """
        raw_club = request.query_params.get("club")
        month_str = request.query_params.get("month")

        # Validate club parameter
        try:
            club_id = int(raw_club)
        except (TypeError, ValueError):
            return Response({"detail": "club must be an integer id"}, status=400)

        # Validate month format
        if not month_str or len(month_str) != 7 or "-" not in month_str:
            return Response({"detail": "month is required as YYYY-MM"}, status=400)

        y, m = map(int, month_str.split("-"))
        first_day = date(y, m, 1)
        last_day = date(y, m, calendar.monthrange(y, m)[1])
        today = timezone.localdate()

        if last_day < today:
            return Response({"detail": "Cannot view past months."}, status=400)

        # Query slots for given month and club
        qs = (
            Slot.objects
            .select_related("court", "court__club", "slot_status")
            .filter(
                court__club_id=club_id,
                service_date__gte=max(first_day, today),
                service_date__lte=last_day,
            )
            .order_by("service_date", "court_id", "start_at")
        )

        # Group slots by date
        tz = timezone.get_current_timezone()
        by_day = {}

        for s in qs:
            day_key = s.service_date.strftime("%d-%m-%y")
            start_local = timezone.localtime(s.start_at, tz)
            end_local = timezone.localtime(s.end_at, tz)
            status_val = getattr(getattr(s, "slot_status", None), "status", "available")

            by_day.setdefault(day_key, {})[str(s.id)] = {
                "status": status_val,
                "start_time": start_local.strftime("%H:%M"),
                "end_time": end_local.strftime("%H:%M"),
                "court": s.court_id,
                "court_name": s.court.name,
                "price_coin": s.price_coins
            }

        payload = {
            "month": first_day.strftime("%m-%y"),
            "days": [{"date": d, "booking_slots": slots} for d, slots in by_day.items()],
        }
        payload["days"].sort(key=lambda x: datetime.strptime(x["date"], "%d-%m-%y"))
        return Response(payload)


