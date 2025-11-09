# backend/wallet/serializers.py
from rest_framework import serializers
from .models import CoinLedger, TopupRequest


class WalletBalanceSerializer(serializers.Serializer):
    balance = serializers.IntegerField(read_only=True)


class CoinLedgerSerializer(serializers.ModelSerializer):
    class Meta:
        model = CoinLedger
        fields = ["id", "type", "amount", "ref_booking", "created_at"]


class TopupRequestCreateSerializer(serializers.ModelSerializer):
    slip_path = serializers.ImageField(write_only=True)
    slip_url = serializers.SerializerMethodField(read_only=True)

    class Meta:
        model = TopupRequest
        fields = [
            "id",
            "amount_thb",
            "coins",
            "transfer_date",
            "transfer_time",
            "slip_path",
            "slip_url",
            "status",
            "created_at",
        ]
        read_only_fields = ["coins", "status", "created_at", "slip_url"]

    def validate_amount_thb(self, v: int):
        if v < 100:
            raise serializers.ValidationError("Minimum top-up is 100 THB.")
        return v

    def validate(self, attrs):
        slip = attrs.get("slip_path")
        if slip:
            max_bytes = 5 * 1024 * 1024
            if slip.size > max_bytes:
                raise serializers.ValidationError({"slip_path": "Slip image must be ≤ 5 MB."})
            if not slip.content_type or not slip.content_type.startswith("image/"):
                raise serializers.ValidationError({"slip_path": "Slip must be an image file."})
        return attrs

    def create(self, validated_data):
        user = self.context["request"].user
        validated_data["user"] = user
        validated_data["coins"] = validated_data["amount_thb"]
        return TopupRequest.objects.create(**validated_data)

    def get_slip_url(self, obj):
        return obj.slip_path.url if obj.slip_path else None


class TopupRequestListSerializer(serializers.ModelSerializer):
    username = serializers.CharField(source="user.username", read_only=True)
    slip_url = serializers.SerializerMethodField()

    class Meta:
        model = TopupRequest
        fields = [
            "id",
            "username",
            "amount_thb",
            "coins",
            "transfer_date",
            "transfer_time",
            "slip_url",
            "status",
            "created_at",
        ]
        read_only_fields = fields

    def get_slip_url(self, obj):
        return obj.slip_path.url if obj.slip_path else None
