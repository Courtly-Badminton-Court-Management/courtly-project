from django.db import models
from django.conf import settings
from core.models import Club, Court

class BusinessHour(models.Model):
    club = models.ForeignKey(Club, on_delete=models.CASCADE, related_name="business_hours")
    dow = models.IntegerField(help_text="Day of Week: 0=Mon .. 6=Sun")
    open_time = models.TimeField()
    close_time = models.TimeField()

    class Meta:
        unique_together = (("club", "dow"),)

class Closure(models.Model):
    """Store club closure information (full day off)"""
    club = models.ForeignKey(Club, on_delete=models.CASCADE, related_name="closures")
    date = models.DateField()
    reason = models.TextField(blank=True)

    class Meta:
        unique_together = (("club", "date"),)

class MaintenanceBlock(models.Model):
    """Time period when the court is closed for maintenance or unavailable"""
    court = models.ForeignKey(Court, on_delete=models.CASCADE, related_name="maintenance_blocks")
    start_at = models.DateTimeField()
    end_at = models.DateTimeField()
    reason = models.TextField(blank=True)

class AuditLog(models.Model):
    """Log of who did what, on which object, and when"""
    actor_user = models.ForeignKey(settings.AUTH_USER_MODEL, null=True, blank=True,
                                   on_delete=models.SET_NULL, related_name="audit_actions")
    action = models.CharField(max_length=64)        # booking.create, booking.cancel, topup.approve, topup.reject
    subject_type = models.CharField(max_length=64)  # 'Booking', 'TopupRequest', ...
    subject_id = models.BigIntegerField()
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        indexes = [
            models.Index(fields=["subject_type", "subject_id"]),
            models.Index(fields=["created_at"]),
        ]
