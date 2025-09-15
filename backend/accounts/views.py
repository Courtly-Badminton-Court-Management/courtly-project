# accounts/views.py
from django.contrib.auth import get_user_model
from rest_framework import generics, permissions
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework_simplejwt.views import TokenObtainPairView
from rest_framework_simplejwt.serializers import TokenObtainPairSerializer

from .serializers import RegisterSerializer, MeSerializer

User = get_user_model()


class RegisterView(generics.CreateAPIView):
    queryset = User.objects.all()
    serializer_class = RegisterSerializer
    permission_classes = [permissions.AllowAny]


class CourtlyTokenObtainPairSerializer(TokenObtainPairSerializer):
    """Customize JWT payload for frontend convenience."""
    @classmethod
    def get_token(cls, user):
        token = super().get_token(user)
        token["username"] = user.username
        token["email"] = user.email or ""
        token["firstname"] = user.first_name or ""
        token["lastname"] = user.last_name or ""
        return token


class LoginView(TokenObtainPairView):
    serializer_class = CourtlyTokenObtainPairSerializer


class MeView(APIView):
    permission_classes = [permissions.IsAuthenticated]
    def get(self, request):
        return Response(MeSerializer(request.user).data)

