from django.contrib.auth.models import AbstractUser
from django.db import models


class User(AbstractUser):
    """
    Courtly custom user:
    - Keep AbstractUser fields (username, first_name, last_name, etc.)
    - Make email unique
    - Add 'accept' (terms & privacy)
    """
    email = models.EmailField(unique=True)

    class Role(models.TextChoices):
        PLAYER = "player", "Player"
        MANAGER = "manager", "Manager"

    role = models.CharField(
        max_length=16,
        choices=Role.choices,
        default=Role.PLAYER,
    )
    accept = models.BooleanField(default=False)

    def __str__(self):
        return f"{self.username} ({self.role})"
