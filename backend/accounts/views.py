# accounts/views.py
from django.contrib.auth import get_user_model
from rest_framework import generics, permissions, serializers
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework_simplejwt.views import TokenObtainPairView, TokenRefreshView as DRFTokenRefresh
from rest_framework_simplejwt.serializers import TokenObtainPairSerializer
from .serializers import RegisterSerializer, MeSerializer

User = get_user_model()


# --- REGISTER ---
class RegisterView(generics.CreateAPIView):
    """
    POST /api/auth/register/
    Body accepts: username, email, password, confirm, firstname, lastname, accept
    (serializer mapittaa firstname/lastname -> first_name/last_name)
    """
    queryset = User.objects.all()
    serializer_class = RegisterSerializer
    permission_classes = [permissions.AllowAny]


# --- LOGIN (JWT) ---


class CourtlyTokenObtainPairSerializer(TokenObtainPairSerializer):
    """
    Accepts either {"username","password"} or {"email","password"}.
    Makes 'username' optional so posting only email works.
    """
    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        # add email as optional input field
        self.fields["email"] = serializers.EmailField(required=False, allow_blank=False)
        # make username optional (so request without username passes field validation)
        self.fields[self.username_field].required = False

    def validate(self, attrs):
        # If client sent email (and omitted username), resolve username
        email = self.initial_data.get("email")
        username = self.initial_data.get(self.username_field)

        if email and not username:
            try:
                u = User.objects.get(email=email)
            except User.DoesNotExist:
                raise serializers.ValidationError({"email": "No user with this email"})
            # set the username field so parent validate() can authenticate normally
            attrs[self.username_field] = getattr(u, User.USERNAME_FIELD, u.username)

        # Delegate to SimpleJWT to generate tokens
        return super().validate(attrs)

    @classmethod
    def get_token(cls, user):
        token = super().get_token(user)
        # Optional convenience claims for Courtly frontend
        token["username"] = user.username
        token["email"] = user.email or ""
        token["firstname"] = user.first_name or ""
        token["lastname"] = user.last_name or ""
        token["role"] = getattr(user, "role", "player")
        return token



class LoginView(TokenObtainPairView):
    """
    POST /api/auth/login/ with {username,password} or {email,password}
    Returns: {access, refresh}
    """
    permission_classes = [permissions.AllowAny]
    serializer_class = CourtlyTokenObtainPairSerializer


# --- TOKEN REFRESH ---
class TokenRefreshView(DRFTokenRefresh):
    permission_classes = [permissions.AllowAny]


# --- ME ---
class MeView(APIView):
    permission_classes = [permissions.IsAuthenticated]
    def get(self, request):
        data = MeSerializer(request.user).data
        # include role if your User has it; otherwise default
        data["role"] = getattr(request.user, "role", "player")
        return Response(data)