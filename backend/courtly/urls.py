from django.contrib import admin
from django.urls import path, include
from rest_framework.routers import DefaultRouter
from rest_framework_simplejwt.views import TokenRefreshView
from rest_framework.renderers import JSONRenderer
from drf_spectacular.views import (
    SpectacularAPIView,
    SpectacularRedocView,
    SpectacularSwaggerView,
)
from django.conf import settings
from django.conf.urls.static import static
from booking.views import SlotViewSet, BookingViewSet
from accounts.views import RegisterView, LoginView, MeView
from core.views import PlayerHomeData, ManagerDashboardData

# ✅ Router setup
router = DefaultRouter()
router.register(r"slots", SlotViewSet, basename="slot")
router.register(r"bookings-admin", BookingViewSet, basename="booking-admin")

# ✅ Custom JSON schema view
class SpectacularJSONAPIView(SpectacularAPIView):
    renderer_classes = [JSONRenderer]


urlpatterns = [
    path("admin/", admin.site.urls),

    # --- App routers ---
    path("api/", include(router.urls)),
    path("api/", include("booking.urls")),
    path("api/wallet/", include("wallet.urls")),
    path("api/auth/", include("accounts.urls")),

    # --- Auth endpoints ---
    path("api/auth/register/", RegisterView.as_view(), name="register"),
    path("api/auth/login/", LoginView.as_view(), name="login"),
    path("api/auth/token/refresh/", TokenRefreshView.as_view(), name="token-refresh"),
    path("api/auth/me/", MeView.as_view(), name="me"),

    # --- API schema & docs ---
    path("api/schema/", SpectacularAPIView.as_view(), name="schema"),  # YAML
    path("api/schema.json", SpectacularJSONAPIView.as_view(), name="schema-json"),  # JSON
    path("api/schema/swagger-ui/", SpectacularSwaggerView.as_view(url_name="schema"), name="swagger-ui"),
    path("api/schema/redoc/", SpectacularRedocView.as_view(url_name="schema"), name="redoc"),

    # --- Neutral app paths ---
    path("api/app/home/", PlayerHomeData.as_view(), name="app-home"),
    path("api/app/dashboard/", ManagerDashboardData.as_view(), name="app-dashboard"),
] + static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)