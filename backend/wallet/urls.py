from django.urls import path
from wallet.views import WalletBalanceView
from .views import WalletMeView

urlpatterns = [
    path("wallet/balance/", WalletBalanceView.as_view(), name="wallet-balance"),
    path("me/", WalletMeView.as_view(), name="wallet-me"),

#     path("wallet/add-coin/", AddCoinView.as_view(), name="wallet-add-coin"),
]
