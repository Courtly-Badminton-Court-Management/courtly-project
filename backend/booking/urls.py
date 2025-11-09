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
)

router = DefaultRouter()
router.register(r"slots", SlotViewSet, basename="slot")

urlpatterns = [
    # ── Public ──
    path("available-slots/", available_slots_month_view, name="available-slots"),

    # ── SlotViewSet ──
    path("", include(router.urls)),

    # ── Booking ──
    path("booking/", booking_create_view, name="booking-create"),
    path("booking/<str:booking_no>/", booking_detail_view, name="booking-detail"),
    path("bookings/", bookings_all_view, name="bookings-all"),
    path("my-bookings/", bookings_my_view, name="bookings-my"),
    path("bookings/<str:booking_no>/cancel/", booking_cancel_view, name="booking-cancel"),

    # ── Manager-only ──
    path("booking/walkin/", booking_walkin_view, name="booking-walkin"),
    path("slots/update-status/", slot_bulk_status_update_view, name="slots-bulk-status"),
]
