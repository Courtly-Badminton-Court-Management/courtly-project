# .\backend\wallet\serializers.py

from rest_framework import serializers
from .models import CoinLedger, TopupRequest

class WalletBalanceSerializer(serializers.Serializer):
    """Simple serializer for returning the computed coin balance."""
    balance = serializers.IntegerField(read_only=True)


class CoinLedgerSerializer(serializers.ModelSerializer):
    """Transaction history rows for the table in the UI."""
    class Meta:
        model = CoinLedger
        fields = ["id", "type", "amount", "ref_booking", "created_at"]


class TopupRequestCreateSerializer(serializers.ModelSerializer):
    """
    Used when a user submits a top-up via UI.
    - Player provides amount_thb, transfer_date, transfer_time, and uploads slip_path (image).
    - Backend sets coins 1:1 with THB and status=pending.
    """
    # Make intent explicit (DRF handles ImageField with multipart/form-data)
    slip_path = serializers.ImageField(write_only=True)

    class Meta:
        model = TopupRequest
        fields = [
            "id",
            "amount_thb",
            "coins",
            "transfer_date",
            "transfer_time",
            "slip_path",
            "status",
            "created_at",
        ]
        read_only_fields = ["coins", "status", "created_at"]

    def validate_amount_thb(self, v: int):
        if v < 100:
            raise serializers.ValidationError("Minimum top-up is 100 THB.")
        return v

    def validate(self, attrs):
        """
        Light sanity checks for transfer date/time and slip file.
        """
        slip = attrs.get("slip_path")
        if slip:
            # ~5MB limit example; tune as needed for Courtly
            max_bytes = 5 * 1024 * 1024
            if slip.size > max_bytes:
                raise serializers.ValidationError({"slip_path": "Slip image must be ≤ 5 MB."})
            if not slip.content_type or not slip.content_type.startswith("image/"):
                raise serializers.ValidationError({"slip_path": "Slip must be an image file."})
        return attrs

    def create(self, validated_data):
        # Attach current user and set coins (1 THB = 1 coin).
        user = self.context["request"].user
        validated_data["user"] = user
        validated_data["coins"] = validated_data["amount_thb"]
        # status stays default "pending"
        return TopupRequest.objects.create(**validated_data)


class TopupRequestListSerializer(serializers.ModelSerializer):
    """List/retrieve serializer shown to both players and manager."""
    user_display_name = serializers.CharField(source="user.username", read_only=True)
    user_email = serializers.EmailField(source="user.email", read_only=True)
    slip_path = serializers.SerializerMethodField()

    class Meta:
        model = TopupRequest
        fields = [
            "id",
            "user",
            "user_display_name",
            "user_email",
            "amount_thb",
            "coins",
            "transfer_date",
            "transfer_time",
            "slip_path",
            "status",
            "created_at",
        ]
        read_only_fields = fields

    def get_slip_path(self, obj):
        """Return full URL for uploaded slip image."""
        request = self.context.get("request")
        if obj.slip_path and hasattr(obj.slip_path, "url"):
            url = obj.slip_path.url
            if request:
                return request.build_absolute_uri(url)
            return url
        return None
