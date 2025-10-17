from rest_framework.routers import DefaultRouter
from django.urls import path
from .views import SlotViewSet, BookingViewSet, BookingCreateView, BookingHistoryView, BookingCancelView, \
    SlotStatusUpdateView
router = DefaultRouter()
router.register(r"slots", SlotViewSet, basename="slot")
router.register(r"bookings-admin", BookingViewSet, basename="booking-admin")

urlpatterns = [
    path("bookings/", BookingCreateView.as_view(), name="booking-create"),
    path("history/", BookingHistoryView.as_view(), name="booking-history"),
    path("bookings/<str:booking_no>/cancel/", BookingCancelView.as_view(), name="booking-cancel"),
    path("slots/<int:slot_id>/set-status/<str:new_status>/", SlotStatusUpdateView.as_view(), name="set-slot-status"),

] + router.urls

