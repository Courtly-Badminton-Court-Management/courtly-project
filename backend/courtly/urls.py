from django.contrib import admin
from django.urls import path, include
from rest_framework.routers import DefaultRouter
from booking.views import SlotViewSet, BookingViewSet, BookingCreateView

# DRF Router
router = DefaultRouter()
router.register(r"slots", SlotViewSet, basename="slot")
router.register(r"bookings-admin", BookingViewSet, basename="booking-admin")

urlpatterns = [
    # Django admin
    path("admin/", admin.site.urls),

    # Auth endpoints (accounts app)
    path("api/auth/", include("accounts.urls")),

    # Booking API (custom create)
    path("api/bookings/", BookingCreateView.as_view(), name="booking-create"),

    # Router-based endpoints (slots, bookings-admin)
    path("api/", include(router.urls)),
]
