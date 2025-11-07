from rest_framework.routers import DefaultRouter
from django.urls import path
from .views import (
    SlotViewSet, BookingViewSet,
    BookingCreateView, BookingHistoryView,
    BookingCancelView, SlotStatusUpdateView, BookingWalkinView,
    BookingAllView, SlotBulkStatusUpdateView
)

# ────────────── Router setup ──────────────
router = DefaultRouter()
router.register(r"slots", SlotViewSet, basename="slot")
router.register(r"bookings-admin", BookingViewSet, basename="booking-admin")

# ────────────── Explicit SlotViewSet actions ──────────────
slot_list = SlotViewSet.as_view({"get": "list"})
slot_month_view = SlotViewSet.as_view({"get": "month_view"})

# ────────────── URL patterns ──────────────
urlpatterns = [
    # Create a new booking (POST)
    path("booking/", BookingCreateView.as_view(), name="booking-create"),

    # All bookings list (GET) (ADMIN)
    path("bookings/", BookingAllView.as_view(), name="booking-all"),

    # Walk-in booking (Manager)
    path("booking/walkin/", BookingWalkinView.as_view(), name="booking-walkin"),

    # Get booking detail
    path("bookings/<str:booking_no>/", BookingViewSet.as_view({"get": "retrieve"}), name="booking-detail"),

    # Cancel booking
    path("bookings/<str:booking_no>/cancel/", BookingCancelView.as_view(), name="booking-cancel"),

    # Booking history
    path("my-booking/", BookingHistoryView.as_view(), name="booking-history"),

    # Update slot status (individuals)
    path("slots/<int:slot_id>/set-status/<str:new_status>/", SlotStatusUpdateView.as_view(), name="set-slot-status"),

    # Call all slot statuses
    path("slots/update-status/", SlotBulkStatusUpdateView.as_view(), name="slot-bulk-status-update"),

    # Explicit month-view
    path("slots/month-view/", slot_month_view, name="slot-month-view"),
]


# ────────────── Include router URLs ──────────────
urlpatterns += router.urls
