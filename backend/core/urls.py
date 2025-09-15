from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import ClubViewSet, CourtViewSet

router = DefaultRouter()
router.register(r"clubs", ClubViewSet, basename="club")
router.register(r"courts", CourtViewSet, basename="court")

urlpatterns = [
    path("", include(router.urls)),
]