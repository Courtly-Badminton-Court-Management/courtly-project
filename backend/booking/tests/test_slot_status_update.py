from django.test import TestCase
from rest_framework.test import APIClient
from booking.models import SlotStatus, Slot, Court, Club
from django.utils import timezone
from datetime import timedelta
from django.contrib.auth import get_user_model

User = get_user_model()

class TestSlotStatusUpdate(TestCase):
    def setUp(self):
        self.client = APIClient()
        # ✅ เพิ่ม email เพื่อไม่ให้ชน unique constraint
        self.manager = User.objects.create_user(
            username="mgr",
            email="mgr_status@example.com",
            password="1234",
            role="manager"
        )
        self.client.force_authenticate(user=self.manager)

        # ✅ ลบ address ออก (Club ไม่มี field นี้แล้ว)
        self.club = Club.objects.create(name="KU Club")
        self.court = Court.objects.create(name="Court 1", club=self.club)
        self.slot = Slot.objects.create(
            court=self.court,
            service_date=timezone.localdate() + timedelta(days=2),
            start_at=timezone.now() + timedelta(days=2, hours=1),
            end_at=timezone.now() + timedelta(days=2, hours=2),
            price_coins=50,
        )
        self.slot_status = SlotStatus.objects.create(slot=self.slot, status="available")

    def test_slot_status_update_success(self):
        res = self.client.post(f"/api/slots/{self.slot.id}/set-status/booked/")
        self.assertEqual(res.status_code, 200)
        self.assertIn("Slot", res.data["detail"])

    def test_invalid_status_transition(self):
        self.slot_status.status = "booked"
        self.slot_status.save()
        res = self.client.post(f"/api/slots/{self.slot.id}/set-status/available/")
        self.assertEqual(res.status_code, 400)
        self.assertIn("Cannot change", res.data["detail"])
