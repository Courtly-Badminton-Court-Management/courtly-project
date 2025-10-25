from rest_framework.routers import DefaultRouter
from .views import CoinLedgerViewSet, TopupRequestViewSet, WalletBalanceView
from django.urls import path

router = DefaultRouter()
router.register(r"ledger", CoinLedgerViewSet, basename="wallet-ledger")
router.register(r"topups", TopupRequestViewSet, basename="wallet-topup")

urlpatterns = [
    path("balance/", WalletBalanceView.as_view(), name="wallet-balance"),
]
urlpatterns += router.urls
