import pytz
from django.contrib.auth import get_user_model
from django.utils import timezone
from rest_framework import generics, permissions, serializers, status
from rest_framework.response import Response
from rest_framework.views import APIView

from rest_framework_simplejwt.views import TokenObtainPairView, TokenRefreshView as DRFTokenRefresh
from rest_framework_simplejwt.serializers import TokenObtainPairSerializer

from .serializers import RegisterSerializer, MeSerializer, AddCoinSerializer
from wallet.models import Wallet

User = get_user_model()


# --- REGISTER ---
class RegisterView(generics.CreateAPIView):
    """
    POST /api/auth/register/
    Body accepts: username, email, password, confirm, firstname, lastname, accept
    (serializer maps firstname/lastname -> first_name/last_name)
    """
    queryset = User.objects.all()
    serializer_class = RegisterSerializer
    permission_classes = [permissions.AllowAny]


# --- LOGIN (JWT) ---
class CourtlyTokenObtainPairSerializer(TokenObtainPairSerializer):
    """
    Accepts either {"username","password"} or {"email","password"}.
    Makes 'username' optional so posting only email works.
    Also updates last_login and returns { firstLogin, user }.
    """

    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        # add email as optional input field
        self.fields["email"] = serializers.EmailField(required=False, allow_blank=False)
        # make username optional (so request without username passes field validation)
        self.fields[self.username_field].required = False

    def validate(self, attrs):
        # Resolve username from email if provided (and username omitted)
        email = self.initial_data.get("email")
        username = self.initial_data.get(self.username_field)

        if email and not username:
            try:
                u = User.objects.get(email=email)
            except User.DoesNotExist:
                raise serializers.ValidationError({"email": "No user with this email"})
            # set the username field so parent validate() can authenticate normally
            attrs[self.username_field] = getattr(u, User.USERNAME_FIELD, u.username)

        # Delegate to SimpleJWT to generate tokens (this sets self.user)
        data = super().validate(attrs)

        # At this point, self.user is the authenticated user
        user = self.user
        first_login = user.last_login is None

        # Update last_login now
        user.last_login = timezone.now()
        user.save(update_fields=["last_login"])

        # ✅ Localize and format time
        bangkok_tz = pytz.timezone("Asia/Bangkok")
        local_time = timezone.localtime(user.last_login, bangkok_tz)
        formatted_time = local_time.strftime("%Y-%m-%d %H:%M:%S")

        # Include user info with formatted time
        data["firstLogin"] = first_login
        data["user"] = {
            "id": user.id,
            "username": user.username,
            "email": user.email,
            "firstname": user.first_name,
            "lastname": user.last_name,
            "role": getattr(user, "role", "player"),
            "coinBalance": getattr(user, "coin_balance", 0),
            "avatarKey": getattr(user, "avatar_key", None),
            "lastLogin": formatted_time,
        }
        return data

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
    Returns: {access, refresh, firstLogin, user}
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
        user = request.user
        # Ensure wallet exists
        wallet, _ = Wallet.objects.get_or_create(user=user, defaults={"balance": 1000})

        data = MeSerializer(user).data
        data["role"] = getattr(user, "role", "player")
        data["balance"] = wallet.balance

        # ✅ Format lastLogin in Asia/Bangkok time (human-friendly)
        if user.last_login:
            bangkok_tz = pytz.timezone("Asia/Bangkok")
            local_time = timezone.localtime(user.last_login, bangkok_tz)
            data["lastLogin"] = local_time.strftime("%Y-%m-%d %H:%M:%S")
        else:
            data["lastLogin"] = None

        return Response(data, status=status.HTTP_200_OK)

    # ✅ Allow updating minimal fields (avatarKey, names if needed)
    def patch(self, request):
        ser = MeSerializer(instance=request.user, data=request.data, partial=True)
        ser.is_valid(raise_exception=True)
        ser.save()
        return Response(ser.data, status=status.HTTP_200_OK)

    def post(self, request):
        ser = MeSerializer(instance=request.user, data=request.data, partial=True)
        ser.is_valid(raise_exception=True)
        ser.save()
        return Response(ser.data, status=status.HTTP_200_OK)


class AddCoinView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request):
        ser = AddCoinSerializer(data=request.data, context={"request": request})
        ser.is_valid(raise_exception=True)
        user = ser.save()
        return Response({"ok": True, "new_balance": user.coin_balance}, status=status.HTTP_200_OK)


# ────────────────────────────── USER DETAIL ──────────────────────────────
class UserDetailView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request, user_id):
        try:
            user = User.objects.get(id=user_id)
        except User.DoesNotExist:
            return Response({"detail": "User not found."}, status=status.HTTP_404_NOT_FOUND)

        wallet, _ = Wallet.objects.get_or_create(user=user, defaults={"balance": 1000})
        data = MeSerializer(user).data
        data["role"] = getattr(user, "role", "player")
        data["balance"] = wallet.balance

        # ✅ Localized formatted time
        if user.last_login:
            bangkok_tz = pytz.timezone("Asia/Bangkok")
            local_time = timezone.localtime(user.last_login, bangkok_tz)
            data["lastLogin"] = local_time.strftime("%Y-%m-%d %H:%M:%S")
        else:
            data["lastLogin"] = None

        return Response(data, status=status.HTTP_200_OK)
