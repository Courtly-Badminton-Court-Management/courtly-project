from django.urls import path
from .views import (
    RegisterView,
    LoginView,
    TokenRefreshView,
    MeView,
    AddCoinView,
    UserDetailView,
)

urlpatterns = [
    # Auth
    path("auth/register/", RegisterView.as_view(), name="accounts-register"),
    path("auth/login/", LoginView.as_view(), name="accounts-login"),
    path("auth/token/refresh/", TokenRefreshView.as_view(), name="token-refresh"),

    # ✅ Player (current user)
    path("auth/me/", MeView.as_view(), name="accounts-me"),

    # ✅ Manager (view another user's profile)
    path("<int:user_id>/", UserDetailView.as_view(), name="accounts-user-detail"),

    # Coins
    path("auth/coins/add/", AddCoinView.as_view(), name="accounts-add-coin"),
]
