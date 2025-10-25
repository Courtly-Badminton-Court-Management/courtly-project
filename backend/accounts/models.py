from django.contrib.auth.models import AbstractUser
from django.db import models


class User(AbstractUser):
    """
    Courtly custom user:
    - Keep AbstractUser fields (username, first_name, last_name, etc.)
    - Make email unique
    - Add role, accept, coin_balance
    - Add avatar_key (stores avatar file name, e.g., "neo-happy.png")
    """
    email = models.EmailField(unique=True)

    class Role(models.TextChoices):
        PLAYER = "player", "Player"
        MANAGER = "manager", "Manager"

    role = models.CharField(max_length=16, choices=Role.choices, default=Role.PLAYER)
    accept = models.BooleanField(default=False)

    coin_balance = models.PositiveIntegerField(default=0)

    # ✅ store file name only (no validation; FE/graphic controls file set)
    avatar_key = models.CharField(max_length=128, null=True, blank=True, default=None)

    def add_coins(self, amount: int):
        self.coin_balance += amount
        self.save(update_fields=["coin_balance"])

    def deduct_coins(self, amount: int):
        if self.coin_balance < amount:
            raise ValueError("Insufficient coins")
        self.coin_balance -= amount
        self.save(update_fields=["coin_balance"])

    def __str__(self):
        return f"{self.username} ({self.role})"
