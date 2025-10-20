from django.contrib.auth import get_user_model
from django.urls import reverse
from rest_framework.test import APITestCase, APIClient
from rest_framework import status
from wallet.models import TopupRequest, CoinLedger


class WalletFlowTests(APITestCase):
    """
    End-to-end flow:
    - player creates topup
    - manager lists all + approves
    - player balance and ledger update
    """

    def setUp(self):
        User = get_user_model()
        # Create player and manager
        self.player = User.objects.create_user(
            username="player1", email="player1@example.com", password="Str0ngPass!234"
        )
        self.manager = User.objects.create_user(
            username="manager1", email="manager1@example.com", password="Str0ngPass!234"
        )
        # Tag as manager
        if hasattr(self.manager, "role"):
            self.manager.role = "manager"
            self.manager.save()
        self.manager.is_staff = True
        self.manager.save()

        self.player_client = APIClient()
        self.manager_client = APIClient()

        # If you use JWT, replace login with token auth;
        # For simplicity here we use force_authenticate:
        self.player_client.force_authenticate(self.player)
        self.manager_client.force_authenticate(self.manager)

    def test_topup_approve_flow(self):
        # Player submits topup
        create_url = "/api/wallet/topups/"
        payload = {"amount_thb": 200, "slip_path": "https://example.com/slip.jpg"}
        res = self.player_client.post(create_url, payload, format="json")
        self.assertEqual(res.status_code, status.HTTP_201_CREATED, res.data)
        topup_id = res.data["id"]

        # Player sees only own requests
        res_my = self.player_client.get(create_url)
        self.assertEqual(res_my.status_code, status.HTTP_200_OK)
        self.assertEqual(len(res_my.data), 1)
        self.assertEqual(res_my.data[0]["status"], "pending")

        # Manager sees all requests
        res_all = self.manager_client.get(create_url)
        self.assertEqual(res_all.status_code, status.HTTP_200_OK)
        self.assertGreaterEqual(len(res_all.data), 1)

        # Manager approves
        approve_url = f"/api/wallet/topups/{topup_id}/approve/"
        res_appr = self.manager_client.post(approve_url)
        self.assertEqual(res_appr.status_code, status.HTTP_200_OK, res_appr.data)

        # Topup status changed
        t = TopupRequest.objects.get(id=topup_id)
        self.assertEqual(t.status, "approved")

        # Ledger has a positive entry
        ledger = CoinLedger.objects.filter(user=self.player).order_by("-created_at")
        self.assertEqual(ledger.count(), 1)
        self.assertEqual(ledger.first().type, "topup")
        self.assertEqual(ledger.first().amount, 200)

        # Balance endpoint shows 200
        balance_url = "/api/wallet/balance/"
        res_bal = self.player_client.get(balance_url)
        self.assertEqual(res_bal.status_code, status.HTTP_200_OK)
        self.assertEqual(int(res_bal.data["balance"]), 200)

    def test_reject_does_not_credit(self):
        # Player submits topup
        res = self.player_client.post("/api/wallet/topups/", {
            "amount_thb": 300, "slip_path": "https://example.com/slip2.jpg"
        }, format="json")
        self.assertEqual(res.status_code, status.HTTP_201_CREATED)
        topup_id = res.data["id"]

        # Manager rejects
        res_rej = self.manager_client.post(f"/api/wallet/topups/{topup_id}/reject/")
        self.assertEqual(res_rej.status_code, status.HTTP_200_OK)

        # Status updated
        t = TopupRequest.objects.get(id=topup_id)
        self.assertEqual(t.status, "rejected")

        # No ledger entry nor balance increment
        self.assertEqual(CoinLedger.objects.filter(user=self.player).count(), 0)
        res_bal = self.player_client.get("/api/wallet/balance/")
        self.assertEqual(int(res_bal.data["balance"]), 0)

    def test_permissions(self):
        # Player creates a topup
        res = self.player_client.post("/api/wallet/topups/", {
            "amount_thb": 150, "slip_path": "https://example.com/slip3.jpg"
        }, format="json")
        topup_id = res.data["id"]

        # Player cannot approve their own request
        res_player_approve = self.player_client.post(f"/api/wallet/topups/{topup_id}/approve/")
        self.assertEqual(res_player_approve.status_code, status.HTTP_403_FORBIDDEN)

        # Manager can approve
        res_mgr_approve = self.manager_client.post(f"/api/wallet/topups/{topup_id}/approve/")
        self.assertEqual(res_mgr_approve.status_code, status.HTTP_200_OK)



