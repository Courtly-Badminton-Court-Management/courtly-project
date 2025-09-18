from django.contrib.auth import get_user_model
from django.contrib.auth.password_validation import validate_password
from rest_framework import serializers

User = get_user_model()

class RegisterSerializer(serializers.ModelSerializer):
    # Frontend sends "firstname"/"lastname"; map them to User.first_name/last_name
    firstname = serializers.CharField(source="first_name")
    lastname = serializers.CharField(source="last_name")

    # Not stored on the model; only required for validation/consent
    accept = serializers.BooleanField(write_only=True)

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
        # attrs now contains: username, email, first_name, last_name, password, confirm, accept
        if attrs["password"] != attrs["confirm"]:
            raise serializers.ValidationError({"confirm": "Passwords do not match"})
        if not attrs.get("accept"):
            raise serializers.ValidationError({"accept": "You must accept the terms"})

        # Optionally pass a temp user to password validators (helps with similarity checks)
        temp_user = User(
            username=attrs.get("username"),
            email=attrs.get("email"),
            first_name=attrs.get("first_name"),
            last_name=attrs.get("last_name"),
        )
        validate_password(attrs["password"], user=temp_user)
        return attrs

    def create(self, validated_data):
        # Remove non-model fields before creating the user
        password = validated_data.pop("password")
        validated_data.pop("confirm", None)
        validated_data.pop("accept", None)  # <- important if User has no 'accept'

        user = User(**validated_data)
        user.set_password(password)
        user.save()
        return user


class MeSerializer(serializers.ModelSerializer):
    firstname = serializers.CharField(source="first_name")
    lastname = serializers.CharField(source="last_name")

    class Meta:
        model = User
        fields = ["id", "username", "email", "firstname", "lastname"]
        # If your User model actually has 'accept' and you want to expose it, add it here.
