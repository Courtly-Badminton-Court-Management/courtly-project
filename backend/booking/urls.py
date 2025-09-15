# booking/urls.py
from rest_framework.routers import DefaultRouter
from .views import SlotViewSet, BookingViewSet, BookingUIMockView
from django.urls import path

router = DefaultRouter()
router.register(r"slots", SlotViewSet, basename="slot")
router.register(r"bookings", BookingViewSet, basename="booking")

urlpatterns = router.urls + [
    path("booking-ui/", BookingUIMockView.as_view(), name="booking-ui"),
]