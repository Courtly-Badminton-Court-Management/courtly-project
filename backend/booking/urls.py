# booking/urls.py
from django.urls import path, include
from rest_framework.routers import DefaultRouter

from .views.slot_views import SlotViewSet, available_slots_month_view
from .views.booking_views import (
    booking_create_view,
    bookings_all_view,
    bookings_my_view,
    booking_detail_view,
    booking_cancel_view, my_booking_upcoming_view,
)
from .views.manager_views import (
    booking_walkin_view,
    slot_bulk_status_update_view,
    booking_checkin_view,
    slot_simple_status_update_view, bookings_upcoming_view,
)

router = DefaultRouter()
router.register(r"slots", SlotViewSet, basename="slot")

urlpatterns = [
    # ────────────────────────────────
    # Public
    # ────────────────────────────────
    path("available-slots/", available_slots_month_view, name="available-slots"),
    path("month-view/", SlotViewSet.as_view({"get": "month_view"}), name="month-view"),

    # ────────────────────────────────
    # Manager-only Slot endpoints
    # MUST BE BEFORE router to avoid override
    # ────────────────────────────────
    path("slots/status/", slot_simple_status_update_view, name="slot-simple-status-update"),
    path("slots/update-status/", slot_bulk_status_update_view, name="slots-bulk-status"),

    # ADD THIS (correct placement)
    path("slots/slots-list/", SlotViewSet.as_view({"post": "slots_list"}), name="slots-list"),

    # ────────────────────────────────
    # Booking Endpoints
    # ────────────────────────────────
    path("booking/walkin/", booking_walkin_view, name="booking-walkin"),
    path("booking/<str:booking_no>/checkin/", booking_checkin_view, name="booking-checkin"),

    path("booking/", booking_create_view, name="booking-create"),
    path("booking/<str:booking_no>/", booking_detail_view, name="booking-detail"),
    path("bookings/", bookings_all_view, name="bookings-all"),
    path("my-booking/", bookings_my_view, name="bookings-my"),
    path("booking/<str:booking_no>/cancel/", booking_cancel_view, name="booking-cancel"),

    path("bookings/upcoming/", bookings_upcoming_view, name="bookings-upcoming"),
    path("my-booking/upcoming/", my_booking_upcoming_view, name="my-booking-upcoming"),


    # ────────────────────────────────
    # Router (must be last)
    # ────────────────────────────────
    path("", include(router.urls)),
]
