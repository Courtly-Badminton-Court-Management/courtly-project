# 🎾 Courtly Backend API Documentation

**Version:** v1.2  
**Framework:** Django REST Framework (DRF)  
**Base URL:** `http://localhost:8001/api/`

---

## 🧩 Authentication (`/api/auth/`)

### 1. Register
**POST** `/api/auth/register/`  
**Auth:** ❌ None
```json
{
  "username": "cream",
  "email": "cream@example.com",
  "password": "123456",
  "confirm": "123456",
  "firstname": "Cream",
  "lastname": "Creamz",
  "accept": true
}
```
**Response (201)**
```json
{
  "id": 1,
  "username": "cream",
  "email": "cream@example.com"
}
```
---

### 2. Login
**POST** `/api/auth/login/`  
**Auth:** ❌ None  
Accepts either `{username,password}` or `{email,password}`
```json
{
  "access": "<jwt_token>",
  "refresh": "<refresh_token>"
}
```
---

### 3. Refresh Token
**POST** `/api/auth/token/refresh/`  
**Auth:** ❌ None
```json
{ "refresh": "<refresh_token>" }
```
**Response**
```json
{ "access": "<new_access_token>" }
```
---

### 4. Get My Profile
**GET** `/api/auth/me/`  
**Auth:** ✅ Required
```json
{
  "id": 1,
  "username": "cream",
  "email": "cream@example.com",
  "role": "player",
  "balance": 1000
}
```
---

### 5. Get User Profile by ID
**GET** `/api/auth/me/<user_id>/`  
**Auth:** ✅ Required
```json
{
  "id": 38,
  "username": "sprint4Tester",
  "email": "sprint4Tester@example.com",
  "firstname": "sprint4",
  "lastname": "Tester",
  "avatarKey": null,
  "role": "player",
  "balance": 6800,
  "lastLogin": "2025-11-08T18:57:32.647424+00:00"
}
```
---

### 6. Add Coins
**POST** `/api/auth/add-coins/`  
**Auth:** ✅ Required
```json
{ "amount": 200 }
```
**Response**
```json
{ "ok": true, "new_balance": 1200 }
```
---

## 🎾 Booking & Slots (`/api/slots/` and `/api/bookings/`)

### 1. Get Monthly Available Slots
**GET** `/api/available-slots/?club=<club_id>&month=<YYYY-MM>`  
**Auth:** ❌ None
```json
{
  "month": "11-25",
  "days": [
    {
      "date": "01-11-25",
      "available_percent": 0.97,
      "available_slots": [
        {
          "slot_status": "available",
          "service_date": "2025-11-01",
          "start_time": "10:30",
          "end_time": "11:00",
          "court": 1,
          "court_name": "Court 1",
          "price_coin": 100
        }
      ]
    }
  ]
}
```
---

### 2. Get Monthly Slots (Alternative)
**GET** `/api/slots/month-view?club=1&month=2025-09`
```json
{
  "month": "09-25",
  "days": [
    {
      "date": "01-09-25",
      "slotList": {
        "12": {
          "status": "available",
          "start_time": "10:00",
          "end_time": "10:30",
          "court": 4,
          "courtName": "Court A"
        }
      }
    }
  ]
}
```
---

### 3. Get Slot Detail
**GET** `/api/slots/<slot_id>/`
```json
{
  "slot_status": "booked",
  "service_date": "2025-10-25",
  "start_time": "17:00",
  "end_time": "17:30",
  "court": 3,
  "court_name": "Court 3",
  "price_coin": 100,
  "booking_id": "BK-01D82793F7"
}
```
---

### 4. Get Multiple Slot Details
**POST** `/api/slots/slots-list/`
```json
{
  "slot_list": ["25188", "25189"]
}
```
**Response**
```json
{
  "slot_items": [
    {
      "slot_status": "available",
      "service_date": "2025-12-03",
      "start_time": "18:30",
      "end_time": "19:00",
      "court": 1,
      "court_name": "Court 1",
      "price_coin": 100
    },
    {
      "slot_status": "available",
      "service_date": "2025-12-03",
      "start_time": "19:00",
      "end_time": "19:30",
      "court": 1,
      "court_name": "Court 1",
      "price_coin": 100
    }
  ]
}
```
---

### 5. Create Booking
**POST** `/api/booking/`  
**Auth:** ✅ Required

#### Player Example
```json
{
  "club": 1,
  "booking_method": "Courtly Website",
  "owner_username": "test2",
  "owner_contact": "test2@example.com",
  "payment_method": "coin",
  "slots": ["24115", "24116"]
}
```
#### Manager Example
```json
{
  "club": 1,
  "booking_method": "Phone Call",
  "owner_username": "Proud",
  "owner_contact": "0936888850",
  "payment_method": "mobile-banking",
  "booking_slots": ["25188", "25189"]
}
```
**Response**
```json
{
  "booking_id": "BK-01D82793F7",
  "message": "Booking created successfully",
  "total_cost": 300,
  "status": "confirmed"
}
```
---

### 6. Get Booking Detail
**GET** `/api/booking/<booking_id>/`
```json
{
  "created_date": "2025-11-09 11:58",
  "booking_id": "BK-53DBD0E748",
  "owner_id": 20,
  "owner_username": "test2",
  "booking_method": "Courtly Website",
  "owner_contact": "test2@example.com",
  "total_cost": 200,
  "payment_method": "coin",
  "booking_date": "2025-10-20",
  "booking_status": "confirmed",
  "able_to_cancel": false,
  "booking_slots": {
    "24115": {
      "slot_status": "booked",
      "service_date": "2025-10-20",
      "start_time": "10:00",
      "end_time": "10:30",
      "court": 1,
      "court_name": "Court 1",
      "price_coin": 100
    },
    "24116": {
      "slot_status": "booked",
      "service_date": "2025-10-20",
      "start_time": "10:30",
      "end_time": "11:00",
      "court": 1,
      "court_name": "Court 1",
      "price_coin": 100
    }
  }
}
```
---

### 7. Booking Lists
#### GET `/api/bookings/` (All Bookings)
#### GET `/api/my-bookings/` (Player History)
```json
[
  {
    "booking_id": "BK-41488D12A3",
    "created_date": "2025-11-08 22:22",
    "total_cost": 200,
    "booking_date": "2025-11-09",
    "booking_status": "confirmed",
    "able_to_cancel": false,
    "owner_id": 38
  },
  {
    "booking_id": "BK-1F473400EB",
    "created_date": "2025-11-08 20:43",
    "total_cost": 200,
    "booking_date": "2025-11-10",
    "booking_status": "cancelled",
    "able_to_cancel": false,
    "owner_id": 42
  }
]
```
---

### 8. Cancel Booking (Refund)
**POST** `/api/bookings/<booking_id>/cancel/`
```json
{
  "detail": "Booking cancelled successfully, refund issued",
  "refund_amount": 60,
  "new_balance": 1000,
  "cancelled_by": "cream@example.com",
  "role": "player"
}
```
---

## 💰 Wallet (`/api/wallet/`)

### 1. Get Wallet Balance
**GET** `/api/wallet/balance/`
```json
{
  "balance_thb": "500.00",
  "coins": 500,
  "entries": 12
}
```
---

### 2. Transaction History (Ledger)
**GET** `/api/wallet/ledger/`
```json
{
  "count": 2,
  "results": [
    {
      "id": 260,
      "type": "topup",
      "amount": 200,
      "ref_booking": null,
      "created_at": "2025-10-26T00:26:34.915094+07:00"
    },
    {
      "id": 257,
      "type": "capture",
      "amount": -100,
      "ref_booking": 294,
      "created_at": "2025-10-25T10:31:08.995632+07:00"
    }
  ]
}
```
---

### 3. Export Ledger (CSV)
**GET** `/api/wallet/ledger/export-csv/`  
`Content-Disposition: attachment; filename="wallet_transactions.csv"`
---

### 4. Create Top-Up (Player)
**POST** `/api/wallet/topups/`
```bash
curl -X POST "http://127.0.0.1:8001/api/wallet/topups/" -H "Authorization: Bearer $PLAYER_TOKEN" -F "amount_thb=200" -F "transfer_date=2025-10-26" -F "transfer_time=14:45:00" -F "slip_path=@slip.png;type=image/png"
```
**Response**
```json
{
  "id": 1,
  "amount_thb": "200.00",
  "status": "pending",
  "slip_path": "http://127.0.0.1:8001/media/slips/slip_1.png",
  "created_at": "2025-10-26T07:45:00Z"
}
```
---

### 5. List Top-Ups
**GET** `/api/wallet/topups/`
```json
[
  {
    "id": 1,
    "player": "test2@example.com",
    "amount_thb": "200.00",
    "status": "pending",
    "slip_path": "http://127.0.0.1:8001/media/slips/slip_1.png",
    "created_at": "2025-10-26T07:45:00Z"
  }
]
```
---

### 6. Approve or Reject Top-Up (Manager)
**POST** `/api/wallet/topups/{id}/approve/`
```json
{ "detail": "Top-up approved." }
```
**POST** `/api/wallet/topups/{id}/reject/`
```json
{ "detail": "Top-up rejected." }
```
---

## 🧪 Testing Flow

| Step | Action | Endpoint |
|------|---------|-----------|
| 1 | Player login | `/api/auth/login/` |
| 2 | Create top-up | `/api/wallet/topups/` |
| 3 | Manager login | `/api/auth/login/` |
| 4 | Approve top-up | `/api/wallet/topups/{id}/approve/` |
| 5 | Check balance | `/api/wallet/balance/` |
| 6 | Verify ledger | `/api/wallet/ledger/` |
---

## ⚙️ Schema & Developer Info

| Endpoint | Description |
|-----------|-------------|
| `/api/schema/` | OpenAPI YAML |
| `/api/schema.json` | OpenAPI JSON |
| `/api/schema/swagger-ui/` | Swagger UI |
| `/api/schema/redoc/` | Redoc UI |
---

## ⚠️ Error Codes

| Code | Meaning |
|------|----------|
| 400 | Invalid request data |
| 401 | Unauthorized |
| 402 | Insufficient coins |
| 403 | No permission |
| 404 | Resource not found |
| 409 | Slot not available |
| 500 | Server / DB error |
---

## 🔐 Auth Header Format

```
Authorization: Bearer <access_token>
```
---

## 🧠 Coin Logic Summary

- New wallet auto-created with **1000 coins**
- Booking deducts coins automatically
- Cancelling booking refunds coins
- All actions recorded in **CoinLedger**
---

## 🧾 Changelog

| Version | Date | Notes |
|----------|------|-------|
| v1.0 | 2025-09 | Initial Auth, Wallet, Booking |
| v1.1 | 2025-10 | Added CSV Export, Refund |
| v1.2 | 2025-11 | Added Manager endpoints, Slot queries, Health check |
---

### 🧱 Maintainers
**Courtly Backend Team** — `Django + DRF + PostgreSQL`  
> Report issues on [Courtly-Badminton-Court-Management](https://github.com/Courtly-Badminton-Court-Management)
