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
    # ✅ Get all bookings (admin/manager)
    path("bookings/", BookingAllView.as_view(), name="booking-all"),

    # ✅ Get booking detail by booking_no
    path("bookings/<str:booking_no>/", BookingViewSet.as_view({"get": "retrieve"}), name="booking-detail"),

    # ✅ Create a new booking
    path("bookings/create/", BookingCreateView.as_view(), name="booking-create"),

    # ✅ Cancel a booking
    path("bookings/<str:booking_no>/cancel/", BookingCancelView.as_view(), name="booking-cancel"),

    # ✅ Get booking history (for the logged-in user)
    path("history/", BookingHistoryView.as_view(), name="booking-history"),

    # ✅ Update slot status manually (manager only)
    path("slots/<int:slot_id>/set-status/<str:new_status>/", SlotStatusUpdateView.as_view(), name="set-slot-status"),
] + router.urls
