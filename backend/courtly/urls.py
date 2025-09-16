from django.urls import path, include
from rest_framework.routers import DefaultRouter
from booking.views import SlotViewSet, BookingViewSet, BookingCreateView

router = DefaultRouter()
router.register(r"slots", SlotViewSet, basename="slot")
router.register(r"bookings-admin", BookingViewSet, basename="booking-admin")

urlpatterns = [
    path("api/bookings/", BookingCreateView.as_view(), name="booking-create"),
    path("api/", include(router.urls)),
]
