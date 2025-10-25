from django.urls import path
from .views import (
    RegisterView,
    LoginView,
    TokenRefreshView,
    MeView,
    AddCoinView,
)

urlpatterns = [
    # Auth
    path("auth/register/", RegisterView.as_view(), name="accounts-register"),
    path("auth/login/", LoginView.as_view(), name="accounts-login"),
    path("auth/token/refresh/", TokenRefreshView.as_view(), name="token-refresh"),

    # Me
    path("me", MeView.as_view(), name="accounts-me"),

    # Coins (legacy)
    path("coins/add", AddCoinView.as_view(), name="accounts-add-coin"),
]
