from django.test import TestCase
from rest_framework.test import APIClient
from booking.models import SlotStatus, Slot, Court, Club
from django.utils import timezone
from datetime import timedelta
from django.contrib.auth import get_user_model

User = get_user_model()

class TestSlotBulkStatusUpdate(TestCase):
    def setUp(self):
        self.client = APIClient()
        self.manager = User.objects.create_user(
            username="mgr",
            email="mgr_bulk@example.com",
            password="1234",
            role="manager"
        )
        self.client.force_authenticate(user=self.manager)

        self.club = Club.objects.create(name="BulkClub")
        self.court = Court.objects.create(name="Court 1", club=self.club)

        self.slot1 = Slot.objects.create(
            court=self.court,
            service_date=timezone.localdate() + timedelta(days=2),
            start_at=timezone.now() + timedelta(days=2, hours=1),
            end_at=timezone.now() + timedelta(days=2, hours=2),
            price_coins=50,
        )
        self.slot2 = Slot.objects.create(
            court=self.court,
            service_date=timezone.localdate() + timedelta(days=2),
            start_at=timezone.now() + timedelta(days=2, hours=3),
            end_at=timezone.now() + timedelta(days=2, hours=4),
            price_coins=50,
        )
        SlotStatus.objects.create(slot=self.slot1, status="available")
        SlotStatus.objects.create(slot=self.slot2, status="available")

    def test_bulk_update_success(self):
        payload = {
            "items": [
                {"slot": self.slot1.id, "status": "booked"},
                {"slot": self.slot2.id, "status": "maintenance"},
            ]
        }
        res = self.client.post("/api/slots/update-status/", payload, format="json")
        self.assertEqual(res.status_code, 200)
        self.assertEqual(res.data["detail"], "Bulk update complete")
