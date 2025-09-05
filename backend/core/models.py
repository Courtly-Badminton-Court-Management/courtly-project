from django.db import models

class Club(models.Model):
    name = models.CharField(max_length=120)
    # tz = models.CharField(max_length=64, null=True, blank=True)

class Court(models.Model):
    club = models.ForeignKey(Club, on_delete=models.CASCADE, related_name="courts")
    name = models.CharField(max_length=64)
