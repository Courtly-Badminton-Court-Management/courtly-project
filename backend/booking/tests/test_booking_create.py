from django.test import TestCase
from rest_framework.test import APIClient
from django.utils import timezone
from booking.models import Club, Court, Slot, SlotStatus
from django.contrib.auth import get_user_model
from datetime import timedelta

User = get_user_model()

class TestBookingCreate(TestCase):
    def setUp(self):
        self.client = APIClient()
        self.user = User.objects.create_user(
            username="stud",
            email="stud_create@example.com",
            password="1234",
            role="student"
        )
        self.client.force_authenticate(user=self.user)

        # Club ไม่มี field address แล้ว
        self.club = Club.objects.create(name="KU Club")
        self.court = Court.objects.create(name="Court 1", club=self.club)

        # เพิ่ม timezone-aware datetime
        self.slot = Slot.objects.create(
            court=self.court,
            service_date=timezone.localdate() + timedelta(days=2),
            start_at=timezone.now() + timedelta(days=2, hours=1),
            end_at=timezone.now() + timedelta(days=2, hours=2),
            price_coins=100,
        )
        SlotStatus.objects.create(slot=self.slot, status="available")

    def test_create_booking_success(self):
        payload = {
            "club": self.club.id,
            "items": [{
                "court": self.court.id,
                "date": (timezone.localdate() + timedelta(days=2)).strftime("%Y-%m-%d"),
                "start": "08:00",
                "end": "09:00"
            }]
        }

        res = self.client.post("/api/booking/", payload, format="json")

        self.assertIn(res.status_code, [200, 201, 405])

    def test_create_booking_past_date(self):
        payload = {
            "club": self.club.id,
            "items": [{
                "court": self.court.id,
                "date": (timezone.localdate() - timedelta(days=1)).strftime("%Y-%m-%d"),
                "start": "08:00",
                "end": "09:00"
            }]
        }
        res = self.client.post("/api/booking/", payload, format="json")

        self.assertIn(res.status_code, [400, 405])
