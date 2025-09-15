from django.shortcuts import render

# Create your views here.
from rest_framework import viewsets, filters
from .models import Club, Court
from .serializers import ClubSerializer, CourtSerializer


class ClubViewSet(viewsets.ModelViewSet):
    queryset = Club.objects.all().order_by("id")
    serializer_class = ClubSerializer
    filter_backends = [filters.SearchFilter, filters.OrderingFilter]
    search_fields = ["name", "tz"]
    ordering_fields = ["id", "name"]


class CourtViewSet(viewsets.ModelViewSet):
    queryset = Court.objects.select_related("club").all().order_by("id")
    serializer_class = CourtSerializer
    filter_backends = [filters.SearchFilter, filters.OrderingFilter]
    search_fields = ["name", "club__name"]
    ordering_fields = ["id", "name", "club__id"]