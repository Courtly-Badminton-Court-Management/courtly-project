from django.urls import path, include
from django.contrib import admin
from accounts.views import RegisterView, LoginView, MeView
from rest_framework_simplejwt.views import TokenRefreshView
from drf_spectacular.views import (
    SpectacularAPIView,
    SpectacularRedocView,
    SpectacularSwaggerView,
)
from rest_framework.renderers import JSONRenderer

# Custom JSON schema view
class SpectacularJSONAPIView(SpectacularAPIView):
    renderer_classes = [JSONRenderer]

urlpatterns = [
    # ===== Core APIs =====
    path("api/", include("booking.urls")),
    path("api/wallet/", include("wallet.urls")),

    # ===== Admin =====
    path("admin/", admin.site.urls),

    # ===== Auth =====
    path("api/auth/register/", RegisterView.as_view(), name="register"),
    path("api/auth/login/", LoginView.as_view(), name="login"),
    path("api/auth/token/refresh/", TokenRefreshView.as_view(), name="token-refresh"),
    path("api/auth/me/", MeView.as_view(), name="me"),
    path("api/auth/", include("accounts.urls")),

    # ===== API Schema / Docs =====
    path("api/schema/", SpectacularAPIView.as_view(), name="schema"),
    path("api/schema.json", SpectacularJSONAPIView.as_view(), name="schema-json"),
    path("api/schema/swagger-ui/", SpectacularSwaggerView.as_view(url_name="schema"), name="swagger-ui"),
    path("api/schema/redoc/", SpectacularRedocView.as_view(url_name="schema"), name="redoc"),
]
