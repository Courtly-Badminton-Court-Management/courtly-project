from django.contrib.auth import get_user_model
from django.contrib.auth.password_validation import validate_password
from rest_framework import serializers

User = get_user_model()


class RegisterSerializer(serializers.ModelSerializer):
    firstname = serializers.CharField(source="first_name")
    lastname = serializers.CharField(source="last_name")
    confirm = serializers.CharField(write_only=True)
    password = serializers.CharField(write_only=True, min_length=8)

    class Meta:
        model = User
        fields = [
            "username",
            "email",
            "firstname",
            "lastname",
            "password",
            "confirm",
            "accept",
        ]

    def validate(self, attrs):
        if attrs["password"] != attrs["confirm"]:
            raise serializers.ValidationError({"confirm": "Passwords do not match"})
        if not attrs.get("accept"):
            raise serializers.ValidationError({"accept": "You must accept the terms"})
        validate_password(attrs["password"])
        return attrs

    def create(self, validated_data):
        password = validated_data.pop("password")
        validated_data.pop("confirm")
        user = User(**validated_data)
        user.set_password(password)
        user.save()
        return user


class MeSerializer(serializers.ModelSerializer):
    firstname = serializers.CharField(source="first_name")
    lastname  = serializers.CharField(source="last_name")

    class Meta:
        model = User
        fields = ["id", "username", "email", "firstname", "lastname", "accept"]
