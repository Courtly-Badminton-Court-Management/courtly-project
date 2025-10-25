from rest_framework.routers import DefaultRouter
from django.urls import path
from .views import (
    SlotViewSet, BookingViewSet,
    BookingCreateView, BookingHistoryView,
    BookingCancelView, SlotStatusUpdateView,
    BookingAllView
)

router = DefaultRouter()
router.register(r"slots", SlotViewSet, basename="slot")
router.register(r"bookings-admin", BookingViewSet, basename="booking-admin")

urlpatterns = [
    # Create a new booking (POST)
    path("booking/", BookingCreateView.as_view(), name="booking-create"),

    # All bookings list (GET) (ADMIN)
    path("bookings/", BookingAllView.as_view(), name="booking-all"),

    # Get booking detail
    path("bookings/<str:booking_no>/", BookingViewSet.as_view({"get": "retrieve"}), name="booking-detail"),

    # Cancel booking
    path("bookings/<str:booking_no>/cancel/", BookingCancelView.as_view(), name="booking-cancel"),

    # Booking history
    path("my-booking/", BookingHistoryView.as_view(), name="booking-history"),

    # Update slot status
    path("slots/<int:slot_id>/set-status/<str:new_status>/", SlotStatusUpdateView.as_view(), name="set-slot-status"),
] + router.urls
