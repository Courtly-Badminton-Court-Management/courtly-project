from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from accounts.permissions import IsPlayer, IsManager


class PlayerHomeData(APIView):
    permission_classes = [IsAuthenticated, IsPlayer]

    def get(self, request):
        return Response({"home": "This is player homepage data"})


class ManagerDashboardData(APIView):
    permission_classes = [IsAuthenticated, IsManager]

    def get(self, request):
        return Response({"dashboard": "This is manager dashboard data"})
