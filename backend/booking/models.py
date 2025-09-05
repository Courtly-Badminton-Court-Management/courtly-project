from django.db import models
from django.conf import settings
from core.models import Club, Court

class Slot(models.Model):
    """30-min atomic slot"""
    court = models.ForeignKey(Court, on_delete=models.CASCADE, related_name="slots")
    service_date = models.DateField()
    start_at = models.DateTimeField()
    end_at = models.DateTimeField()

    class Meta:
        # ห้ามสร้าง slot ซ้ำเวลาเดียวกันในคอร์ทเดียวกัน
        unique_together = (("court", "start_at"),)
        indexes = [models.Index(fields=["court", "service_date"])]

    def __str__(self):
        return f"{self.court} {self.start_at.isoformat()}"

class Booking(models.Model):
    """การจอง – มี Slot id (อ้าง slot เริ่มต้น) และกัน double-booking ผ่าน BookingSlot"""
    STATUS = (
        ("pending", "pending"),
        ("confirmed", "confirmed"),
        ("checked_in", "checked_in"),
        ("cancelled", "cancelled"),
        ("completed", "completed"),
        ("no_show", "no_show"),
    )

    booking_no = models.CharField(max_length=24, unique=True)
    user = models.ForeignKey(settings.AUTH_USER_MODEL, null=True, blank=True,
                             on_delete=models.SET_NULL, related_name="bookings")   # nullable for walk-in
    club = models.ForeignKey(Club, on_delete=models.PROTECT, related_name="bookings")
    court = models.ForeignKey(Court, on_delete=models.PROTECT, related_name="bookings")

    # "Slot id" ตามสคีมา: อ้าง slot แรก (สะดวกต่อการค้น/ออกรายงาน)
    slot = models.ForeignKey("Slot", null=True, blank=True, on_delete=models.SET_NULL, related_name="bookings")

    status = models.CharField(max_length=20, choices=STATUS, default="confirmed")
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return self.booking_no

class BookingSlot(models.Model):
    """
    mapping booking ↔ slot
    - กำหนด UNIQUE(slot_id) เพื่อป้องกันจองชนกันที่ระดับ DB
      ใช้ OneToOneField แทนการใส่ unique=True บน ForeignKey
    """
    booking = models.ForeignKey(Booking, on_delete=models.CASCADE, related_name="booking_slots")
    slot = models.OneToOneField(Slot, on_delete=models.CASCADE, related_name="booked_by")  # = UNIQUE(slot_id)

    class Meta:
        unique_together = (("booking", "slot"),)
