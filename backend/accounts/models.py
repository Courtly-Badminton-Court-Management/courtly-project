from django.contrib.auth.models import AbstractUser
from django.db import models

class User(AbstractUser):
    # ฟิลด์เพิ่มตามที่ต้องการ
    password_hash = models.CharField(max_length=255, blank=True)
    name = models.CharField(max_length=120, blank=True)
    surname = models.CharField(max_length=120, blank=True)
    phone = models.CharField(max_length=32, blank=True)

    def __str__(self):
        return self.username or self.email
