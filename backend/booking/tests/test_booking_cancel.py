from django.test import TestCase
from rest_framework.test import APIClient
from django.utils import timezone
from datetime import timedelta
from booking.models import Booking, BookingSlot, Slot, SlotStatus, Club, Court
from wallet.models import Wallet
from django.contrib.auth import get_user_model

User = get_user_model()

class TestBookingCancel(TestCase):
    def setUp(self):
        self.client = APIClient()

        # ✅ เพิ่ม email ให้ user ทุกตัว
        self.user = User.objects.create_user(
            username="stud",
            email="stud_cancel@example.com",
            password="1234",
            role="student"
        )
        self.manager = User.objects.create_user(
            username="mgr",
            email="mgr_cancel@example.com",
            password="1234",
            role="manager"
        )

        self.client.force_authenticate(user=self.user)

        # ✅ ลบ address= ออก (Club ไม่มี field นี้แล้ว)
        self.club = Club.objects.create(name="KU Club")
        self.court = Court.objects.create(name="Court 1", club=self.club)

        self.slot = Slot.objects.create(
            court=self.court,
            service_date=timezone.localdate() + timedelta(days=3),
            start_at=timezone.now() + timedelta(days=3, hours=1),
            end_at=timezone.now() + timedelta(days=3, hours=2),
            price_coins=100,
        )

        SlotStatus.objects.create(slot=self.slot, status="booked")

        self.booking = Booking.objects.create(
            booking_no="BK-123456",
            user=self.user,
            club=self.club,
            court=self.court,
            status="confirmed",
            booking_date=timezone.localdate() + timedelta(days=3),
        )

        BookingSlot.objects.create(booking=self.booking, slot=self.slot)
        Wallet.objects.create(user=self.user, balance=500)

    def test_booking_cancel_success(self):
        res = self.client.post(f"/api/bookings/{self.booking.booking_no}/cancel/")
        self.assertEqual(res.status_code, 200)
        self.assertEqual(res.data["detail"], "Booking cancelled successfully")
        self.assertEqual(res.data["refund_amount"], 100)

    def test_booking_cancel_no_permission(self):
        other_user = User.objects.create_user(
            username="hacker",
            email="hacker_cancel@example.com",
            password="1234",
            role="student"
        )
        self.client.force_authenticate(user=other_user)
        res = self.client.post(f"/api/bookings/{self.booking.booking_no}/cancel/")
        self.assertEqual(res.status_code, 403)
