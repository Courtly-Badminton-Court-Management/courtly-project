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
    Used when a user submits a top-up (amount, date/time are captured
    on the slip and the UI; backend records amounts and slip path).
    Coins are computed 1:1 from THB here.
    """
    class Meta:
        model = TopupRequest
        fields = ["id", "amount_thb", "coins", "slip_path", "status", "created_at"]
        read_only_fields = ["coins", "status", "created_at"]

    def validate_amount_thb(self, v: int):
        if v < 100:
            raise serializers.ValidationError("Minimum top-up is 100 THB.")
        return v

    def create(self, validated_data):
        # Attach current user and set coins (1 THB = 1 coin).
        user = self.context["request"].user
        validated_data["user"] = user
        validated_data["coins"] = validated_data["amount_thb"]
        return TopupRequest.objects.create(**validated_data)


class TopupRequestListSerializer(serializers.ModelSerializer):
    """List/retrieve serializer shown to both players and manager."""
    username = serializers.CharField(source="user.username", read_only=True)

    class Meta:
        model = TopupRequest
        fields = [
            "id", "username", "amount_thb", "coins", "slip_path",
            "status", "created_at"
        ]
