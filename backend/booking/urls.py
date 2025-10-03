from rest_framework.routers import DefaultRouter
from django.urls import path
from .views import SlotViewSet, BookingViewSet, BookingUIMockView, BookingCreateView, BookingHistoryView

router = DefaultRouter()
router.register(r"slots", SlotViewSet, basename="slot")
router.register(r"bookings-admin", BookingViewSet, basename="booking-admin")

urlpatterns = [
    path("bookings/", BookingCreateView.as_view(), name="booking-create"),
    path("history/", BookingHistoryView.as_view(), name="booking-history"),
] + router.urls

