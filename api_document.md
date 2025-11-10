# 🎾 Courtly Backend API Documentation

**Version:** v1.2  
**Framework:** Django REST Framework (DRF)  
**Base URL:** `http://localhost:8001/api/`

---

## 🧩 Authentication (`/api/auth/`)

### 1. Register
**POST** `/api/auth/register/`  
**Auth:** ❌ None

**Request Body**
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

**Response**
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

**Body**
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

**Response**
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

### 5. Add Coins
**POST** `/api/auth/add-coins/`  
**Auth:** ✅ Required

**Body**
```json
{ "amount": 200 }
```

**Response**
```json
{ "ok": true, "new_balance": 1200 }
```

---

## 🎾 Booking & Slots

### 1. Get Monthly Slots
**GET** `/api/slots/month-view?club=1&month=2025-09`  
**Auth:** ❌ None

**Response**
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

### 2. Create Booking
**POST** `/api/bookings/`  
**Auth:** ✅ Required

**Body**
```json
{
  "club": 1,
  "items": [
    { "court": 4, "date": "2025-09-05", "start": "10:00", "end": "12:00" },
    { "court": 5, "date": "2025-09-05", "start": "14:00", "end": "15:00" }
  ]
}
```

**Response (201)**
```json
{
  "ok": true,
  "booking": {
    "id": 12,
    "booking_no": "BK-9F2C7A8D11",
    "club": 1,
    "court": 4,
    "slots": [101, 102, 103]
  },
  "total_slots": 3,
  "total_cost": 60,
  "new_balance": 940
}
```

---

### 3. View Booking History
**GET** `/api/history/`  
**Auth:** ✅ Required

**Response**
```json
{
  "results": [
    {
      "id": 12,
      "booking_no": "BK-9F2C7A8D11",
      "status": "confirmed",
      "created_at": "2025-09-05 10:15",
      "slots": [
        {
          "slot": 101,
          "slot__court": 4,
          "slot__service_date": "2025-09-05",
          "slot__start_at": "10:00",
          "slot__end_at": "10:30"
        }
      ]
    }
  ]
}
```

---

### 4. Cancel Booking (Refund)
**POST** `/api/bookings/<booking_id>/cancel/`  
**Auth:** ✅ Required

**Response**
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

### 5. Admin Booking View
**GET** `/api/bookings-admin/`  
**Auth:** ✅ (Admin/Manager)

---

### 6. All Bookings Summary
**GET** `/api/bookings/all/`  
**Auth:** ✅ Required

---

## 💰 Wallet

### 1. Wallet Summary
**GET** `/api/wallet/balance/`  
**Auth:** ✅ Required (Player or Manager)

**Response**
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
**Auth:** ✅ Required

**Query Parameters**

| Param | Type | Description |
|-------|------|-------------|
| limit | integer | Optional pagination limit |
| offset | integer | Optional pagination offset |

**Response**
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

### 3. Export Transaction History (CSV)
**GET** `/api/wallet/ledger/export-csv/`  
**Auth:** ✅ Required  
**Response:**  
`Content-Disposition: attachment; filename="wallet_transactions.csv"`

---

### 4. Create Top-Up (Player)
**POST** `/api/wallet/topups/`  
**Auth:** ✅ Required (Player only)

**Body (multipart/form-data)**

| Field | Type | Required | Description |
|--------|------|-----------|-------------|
| amount_thb | decimal | ✅ | Amount in THB |
| transfer_date | string (YYYY-MM-DD) | ✅ | Bank transfer date |
| transfer_time | string (HH:MM:SS) | ✅ | Bank transfer time |
| slip_path | file (image/png or image/jpeg) | ✅ | Image of payment slip |

**Example**
```bash
curl -X POST "http://127.0.0.1:8001/api/wallet/topups/"   -H "Authorization: Bearer $PLAYER_TOKEN"   -F "amount_thb=200"   -F "transfer_date=2025-10-26"   -F "transfer_time=14:45:00"   -F "slip_path=@slip.png;type=image/png"
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
**Auth:** ✅ Required

**Response**
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

### 6. Approve Top-Up (Manager)
**POST** `/api/wallet/topups/{id}/approve/`  
**Auth:** ✅ Required (Manager only)

**Response**
```json
{ "detail": "Top-up approved." }
```

---

### 7. Reject Top-Up (Manager)
**POST** `/api/wallet/topups/{id}/reject/`  
**Auth:** ✅ Required (Manager only)

**Response**
```json
{ "detail": "Top-up rejected." }
```

---

## 🧪 Testing Flow

| Step | Action | Endpoint |
|------|---------|-----------|
| 1 | Player login | `/api/auth/login/` |
| 2 | POST top-up | `/api/wallet/topups/` |
| 3 | Manager login | `/api/auth/login/` |
| 4 | Approve top-up | `/api/wallet/topups/{id}/approve/` |
| 5 | Check balance | `/api/wallet/balance/` |
| 6 | Verify ledger | `/api/wallet/ledger/` |

---

## ⚙️ API Schema Endpoints

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

All protected routes require a Bearer token:

```
Authorization: Bearer <access_token>
```

---

## 🧠 Coin Logic Summary

- New wallet auto-created with **1000 coins**  
- Booking deducts coin amount  
- Cancelling booking refunds the full amount  
- All transactions logged in **CoinLedger**

---

## 🪄 Developer Notes

| Key | Value |
|-----|-------|
| Framework | Django REST Framework |
| Auth | JWT (SimpleJWT) |
| Database | PostgreSQL |
| Timezone | Asia/Bangkok |
| Media root | `/media/slips/` |
| Default coin rate | 1 coin = 1 THB |
| Access token expiry | 5 minutes |
| Refresh token expiry | 1 day |
| Rate limit | 100 req/min |

---

## 🧾 Changelog

| Version | Date | Notes |
|----------|------|-------|
| v1.0 | 2025-09 | Initial endpoints (Auth, Wallet, Booking) |
| v1.1 | 2025-10 | Added CSV Export, Booking Refund |
| v1.2 | 2025-11 | Added Manager Maintenance, Admin Stats, Health Check |

---

### 🧱 Maintainers
Courtly Backend Team — `Django + DRF + PostgreSQL`  

> For bug reports or feature suggestions, open an issue on [**Courtly-Badminton-Court-Management**](https://github.com/Courtly-Badminton-Court-Management)
