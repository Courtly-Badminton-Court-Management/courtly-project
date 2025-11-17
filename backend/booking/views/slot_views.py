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
    """

    raw_club = request.query_params.get("club")
    month_str = request.query_params.get("month")

    # Sanitize month: allow formats like "2025-11/" → "2025-11"
    if month_str:
        month_str = month_str.rstrip("/").strip()

    # Validate club ID
    try:
        club_id = int(raw_club)
    except (TypeError, ValueError):
        return Response({"detail": "club must be an integer id"}, status=400)

    # Validate clean month format
    if not month_str or len(month_str) != 7 or "-" not in month_str:
        return Response({"detail": "month is required as YYYY-MM"}, status=400)

    try:
        y, m = map(int, month_str.split("-"))
    except ValueError:
        return Response({"detail": "invalid month format, use YYYY-MM"}, status=400)

    first_day = date(y, m, 1)
    last_day = date(y, m, calendar.monthrange(y, m)[1])

    # Fetch all slots in this club + month
    qs = (
        Slot.objects
        .select_related("court", "slot_status")
        .filter(
            court__club_id=club_id,
            service_date__gte=first_day,
            service_date__lte=last_day
        )
        .order_by("service_date", "court_id", "start_at")
    )

    by_day = {}

    for s in qs:
        day_key = s.service_date.strftime("%d-%m-%y")
        status_val = getattr(getattr(s, "slot_status", None), "status", "available")

        if day_key not in by_day:
            by_day[day_key] = {
                "total": 0,
                "available": 0,
                "slots": []
            }

        by_day[day_key]["total"] += 1

        if status_val in ["available", "expired"]:
            by_day[day_key]["available"] += 1

        if status_val == "available":
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

        available_percent = (
            round(info["available"] / info["total"], 2)
            if info["total"] > 0 else 0.0
        )

        days_payload.append({
            "date": day_key,
            "available_percent": available_percent,
            "available_slots": info["slots"],
        })

    return Response({
        "month": first_day.strftime("%m-%y"),
        "days": days_payload,
    })


# ─────────────────────────────────────────────────────────────────────────────
# 2) SlotViewSet
# ─────────────────────────────────────────────────────────────────────────────
class SlotViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = Slot.objects.all().select_related("court", "slot_status")
    serializer_class = SlotSerializer
    permission_classes = [permissions.AllowAny]

    @action(detail=False, url_path="month-view", methods=["GET"])
    def month_view(self, request):
        """
        GET /api/month-view/?club=1&month=2025-11
        """

        raw_club = request.query_params.get("club")
        month_str = request.query_params.get("month")
        raw_day = request.query_params.get("day")

        # Sanitize month: allow formats like "2025-11/" → "2025-11"
        if month_str:
            month_str = month_str.rstrip("/").strip()

        # Validate club
        try:
            club_id = int(raw_club)
        except (TypeError, ValueError):
            return Response({"detail": "club must be an integer id"}, status=400)

        # Validate month
        if not month_str or len(month_str) != 7 or "-" not in month_str:
            return Response({"detail": "month is required as YYYY-MM"}, status=400)

        try:
            y, m = map(int, month_str.split("-"))
        except ValueError:
            return Response({"detail": "invalid month format, use YYYY-MM"}, status=400)

        first_day = date(y, m, 1)
        last_day = date(y, m, calendar.monthrange(y, m)[1])
        today = timezone.localdate()

        if last_day < today:
            return Response({"detail": "Cannot view past months."}, status=400)

        # Optional day filter
        day_filter = None
        if raw_day:
            try:
                day_filter = int(raw_day)
                if not (1 <= day_filter <= last_day.day):
                    raise ValueError
            except ValueError:
                return Response({"detail": "day must be valid"}, status=400)

        qs = (
            Slot.objects
            .select_related("court", "slot_status")
            .filter(
                court__club_id=club_id,
                service_date__gte=max(first_day, today),
                service_date__lte=last_day,
            )
            .order_by("service_date", "court_id", "start_at")
        )

        if day_filter:
            qs = qs.filter(service_date__day=day_filter)

        tz = timezone.get_current_timezone()
        by_day = {}

        for s in qs:
            day_key = s.service_date.strftime("%d-%m-%y")
            by_day.setdefault(day_key, {})[str(s.id)] = {
                "status": getattr(getattr(s, "slot_status", None), "status", "available"),
                "start_time": timezone.localtime(s.start_at, tz).strftime("%H:%M"),
                "end_time": timezone.localtime(s.end_at, tz).strftime("%H:%M"),
                "court": s.court_id,
                "court_name": s.court.name,
                "price_coin": s.price_coins,
            }

        payload = {
            "month": first_day.strftime("%m-%y"),
            "days": [
                {"date": d, "booking_slots": slots}
                for d, slots in by_day.items()
            ],
        }
        payload["days"].sort(key=lambda x: datetime.strptime(x["date"], "%d-%m-%y"))

        return Response(payload)

    @action(detail=False, methods=["POST"], url_path="slots-list")
    def slots_list(self, request):
        """
        POST /api/slots/slots-list/
        Body: {
            "slot_list": ["25188", "25189"]
        }
        """

        if not request.data:
            return Response({"detail": "Request body cannot be empty"}, status=400)

        ser = SlotListRequestSerializer(data=request.data)
        ser.is_valid(raise_exception=True)

        slot_ids = ser.validated_data["slot_list"]

        if not slot_ids:
            return Response({"detail": "slot_list cannot be empty"}, status=400)

        try:
            slot_ids = [int(sid) for sid in slot_ids]
        except:
            return Response({"detail": "slot_list must contain integers"}, status=400)

        qs = (
            Slot.objects
            .select_related("court", "slot_status")
            .filter(id__in=slot_ids)
            .order_by("start_at")
        )

        if not qs.exists():
            return Response({"detail": "No slots found"}, status=404)

        items = []
        for s in qs:
            items.append({
                "slot_status": getattr(getattr(s, "slot_status", None), "status", "available"),
                "service_date": s.service_date.strftime("%Y-%m-%d"),
                "start_time": timezone.localtime(s.start_at).strftime("%H:%M"),
                "end_time": timezone.localtime(s.end_at).strftime("%H:%M"),
                "court": s.court_id,
                "court_name": s.court.name,
                "price_coin": s.price_coins,
            })

        return Response({"slot_items": items}, status=200)

