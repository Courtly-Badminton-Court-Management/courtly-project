# booking/urls.py
from django.urls import path, include
from rest_framework.routers import DefaultRouter

from .views.slot_views import SlotViewSet, available_slots_month_view
from .views.booking_views import (
    booking_create_view,
    bookings_all_view,
    bookings_my_view,
    booking_detail_view,
    booking_cancel_view,
)
from .views.manager_views import (
    booking_walkin_view,
    slot_bulk_status_update_view,
    booking_checkin_view,
    slot_simple_status_update_view,
)

# ────────────── SlotViewSet (Router) ──────────────
router = DefaultRouter()
router.register(r"slots", SlotViewSet, basename="slot")

urlpatterns = [
    # ────────────────────────────────
    # Public
    # ────────────────────────────────
    path("available-slots/", available_slots_month_view, name="available-slots"),
    path("slots/month-view/", SlotViewSet.as_view({"get": "month_view"}), name="slot-month-view"),

    # ────────────────────────────────
    # Manager-only (Custom Slot Endpoints)
    # MUST BE BEFORE ROUTER to avoid override
    # ────────────────────────────────
    path("slots/status/", slot_simple_status_update_view, name="slot-simple-status-update"),
    path("slots/update-status/", slot_bulk_status_update_view, name="slots-bulk-status"),

    # ────────────────────────────────
    # Manager-only Booking Endpoints
    # ────────────────────────────────
    path("booking/walkin/", booking_walkin_view, name="booking-walkin"),
    path("booking/<str:booking_no>/checkin/", booking_checkin_view, name="booking-checkin"),

    # ────────────────────────────────
    # Player + Manager Booking Endpoints
    # ────────────────────────────────
    path("booking/", booking_create_view, name="booking-create"),
    path("booking/<str:booking_no>/", booking_detail_view, name="booking-detail"),
    path("bookings/", bookings_all_view, name="bookings-all"),
    path("my-bookings/", bookings_my_view, name="bookings-my"),
    path("bookings/<str:booking_no>/cancel/", booking_cancel_view, name="booking-cancel"),

    # ────────────────────────────────
    # SlotViewSet Router
    # ────────────────────────────────
    path("", include(router.urls)),
]
