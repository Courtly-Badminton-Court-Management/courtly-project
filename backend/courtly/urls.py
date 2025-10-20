from django.urls import path, include
from rest_framework.routers import DefaultRouter
from booking.views import SlotViewSet, BookingViewSet, BookingCreateView
from django.contrib import admin
from accounts.views import RegisterView, LoginView, MeView
from rest_framework_simplejwt.views import TokenRefreshView
from drf_spectacular.views import SpectacularAPIView, SpectacularRedocView, SpectacularSwaggerView
from rest_framework.renderers import JSONRenderer
from booking.views import BookingAllView

# Custom view to serve JSON schema
class SpectacularJSONAPIView(SpectacularAPIView):
    renderer_classes = [JSONRenderer]

from core.views import PlayerHomeData, ManagerDashboardData
from django.urls import path, include

router = DefaultRouter(router.register(r"slots", SlotViewSet, basename="slot")
router.register(r"bookings-admin", BookingViewSet, basename="booking-admin")

urlpatterns = [
    # path("api/bookings/", BookingCreateView.as_view(), name="booking-create"),
    path("api/", include("booking.urls")),
    path("api/", include(router.urls)),
    path("admin/", admin.site.urls),
    path("api/wallet/", include("wallet.urls")),

    # Auth
    path("api/auth/register/", RegisterView.as_view(), name="register"),
    path("api/auth/login/",    LoginView.as_view(),    name="login"),
    path("api/auth/token/refresh/", TokenRefreshView.as_view(), name="token-refresh"),
    path("api/auth/me/",       MeView.as_view(),       name="me")

    # Schema endpoints
    path('api/schema/', SpectacularAPIView.as_view(), name='schema'),  # Default (YAML)
    path('api/schema.json', SpectacularJSONAPIView.as_view(), name='schema-json'),  # JSON
    path('api/schema/swagger-ui/', SpectacularSwaggerView.as_view(url_name='schema'), name='swagger-ui'),
    path('api/schema/redoc/', SpectacularRedocView.as_view(url_name='schema'), name='redoc'),
    path("api/auth/", include("accounts.urls")),
    path("api/", include("wallet.urls")),
    # Neutral app paths
    path("api/app/home/", PlayerHomeData.as_view(), name="app-home"),
    path("api/app/dashboard/", ManagerDashboardData.as_view(), name="app-dashboard"),
]
