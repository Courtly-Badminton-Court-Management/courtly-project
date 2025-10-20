from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import WalletBalanceView, CoinLedgerViewSet, TopupRequestViewSet

router = DefaultRouter()
router.register(r"wallet/ledger", CoinLedgerViewSet, basename="wallet-ledger")
router.register(r"wallet/topups", TopupRequestViewSet, basename="wallet-topups")

urlpatterns = [
    # Balance endpoint used by the header
    path("wallet/balance/", WalletBalanceView.as_view(), name="wallet-balance"),
    # Router endpoints for ledger & topups
    path("", include(router.urls)),
]
