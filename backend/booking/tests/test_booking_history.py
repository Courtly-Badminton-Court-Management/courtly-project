from django.test import TestCase
from rest_framework.test import APIClient
from django.utils import timezone
from booking.models import Booking, Club, Court
from django.contrib.auth import get_user_model

User = get_user_model()

class TestBookingHistory(TestCase):
    def setUp(self):
        self.client = APIClient()

        # ✅ เพิ่ม email ให้ user ป้องกัน unique constraint error
        self.user = User.objects.create_user(
            username="carol",
            email="carol_history@example.com",
            password="1234",
            role="student"
        )
        self.client.force_authenticate(user=self.user)

        self.club = Club.objects.create(name="TestClub")
        self.court = Court.objects.create(name="C1", club=self.club)

        Booking.objects.create(
            booking_no="BK-HISTORY",
            user=self.user,
            club=self.club,
            court=self.court,
            status="booked",
            booking_date=timezone.localdate()
        )

    def test_get_my_booking_history(self):
        resp = self.client.get("/api/my-booking/")
        self.assertEqual(resp.status_code, 200)
        self.assertIn("results", resp.json())
