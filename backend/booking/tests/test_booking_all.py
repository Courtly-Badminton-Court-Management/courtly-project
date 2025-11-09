from django.test import TestCase
from rest_framework.test import APIClient
from django.utils import timezone
from booking.models import Booking, Club, Court
from django.contrib.auth import get_user_model

User = get_user_model()

class TestBookingAll(TestCase):
    def setUp(self):
        self.client = APIClient()
        self.manager = User.objects.create_user(
            username="manager",
            email="manager_all@example.com",
            password="1234",
            role="manager"
        )
        self.client.force_authenticate(user=self.manager)

        self.club = Club.objects.create(name="ClubAll")

        self.court = Court.objects.create(name="CourtAll", club=self.club)
        Booking.objects.create(
            booking_no="BK-ALL",
            user=self.manager,
            club=self.club,
            court=self.court,
            status="booked",
            booking_date=timezone.localdate()
        )

    def test_get_all_bookings(self):
        resp = self.client.get("/api/bookings/")
        self.assertEqual(resp.status_code, 200)
        self.assertIn("results", resp.json())
