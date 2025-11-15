# **Courtly API Documentation**

### Badminton Court Management and Booking System

**Base URL:**

```
https://backend.courtlyeasy.app/
```


---

## **1. POST /api/auth/register**

**Authentication Requirement:**
Not required

**Related Frontend:**

* Player Registration Page

**Description:**
Creates a new user account.
The backend validates matching passwords, unique email/username, and acceptance of terms.

**Query Parameters:**
None

---

### **Request Payload Example**

```json
{
  "username": "TheLastTester",
  "email": "lasttester@example.com",
  "firstname": "Hoshitsuki",
  "lastname": "Hokori",
  "password": "Courtly_123",
  "confirm": "Courtly_123",
  "accept": true
}
```

### **Response Example**

**Success:**

```json
{ "status": "ok" }
```

**Failure Example:**

```json
{ "error": "Email is already taken." }
```

### **Field Descriptions**

| Field       | Type    | Description                                  |
| ----------- | ------- | -------------------------------------------- |
| `username`  | string  | Desired username for login                   |
| `email`     | string  | Must be unique; used for authentication      |
| `firstname` | string  | User’s first name                            |
| `lastname`  | string  | User’s last name                             |
| `password`  | string  | User password (must meet security rules)     |
| `confirm`   | string  | Must match `password`                        |
| `accept`    | boolean | Must be `true` (Terms & Conditions accepted) |

---

## **2. POST /api/auth/login**

**Authentication Requirement:**
Not required

**Related Frontend:**

* Login Page

**Description:**
Authenticates the user using email and password and returns JWT access and refresh tokens.
Also returns the user’s profile and wallet balance.

**Query Parameters:**
None

---

### **Request Payload Example**

```json
{
  "email": "sprint4Tester@example.com",
  "password": "Courtly_123"
}
```

### **Response Example**

```json
{
    "refresh": "eyJh...GjAs",
    "access": "eyJh...APDI",
    "firstLogin": false,
    "user": {
        "id": 38,
        "username": "sprint4Tester",
        "email": "sprint4Tester@example.com",
        "firstname": "sprint4",
        "lastname": "Tester",
        "role": "player",
        "coinBalance": 0,
        "avatarKey": null,
        "lastLogin": "2025-11-15 06:59:07"
    }
}
```

### **Field Descriptions**

| Field              | Type           | Description                                           |
| ------------------ | -------------- | ----------------------------------------------------- |
| `refresh`          | string         | JWT refresh token used to generate new access tokens  |
| `access`           | string         | JWT access token required for authenticated endpoints |
| `firstLogin`       | boolean        | Indicates if this is the user's first time logging in |
| `user`             | object         | Authenticated user information                        |
| `user.id`          | number         | User ID                                               |
| `user.username`    | string         | Username                                              |
| `user.email`       | string         | Email used for login                                  |
| `user.role`        | string         | User role (`player`, `manager`)                       |
| `user.coinBalance` | number         | Current CL Coin balance                               |
| `user.avatarKey`   | string or null | Selected avatar filename                              |
| `user.lastLogin`   | string         | Last login timestamp                                  |

---

## **3. POST /api/auth/token/refresh**

**Authentication Requirement:**
Not required (uses refresh token)

**Related Frontend:**

* Token Refresh Handler
* Auto-login logic

**Description:**
Generates a new access token using a valid refresh token.

**Query Parameters:**
None

---

### **Request Payload Example**

```json
{
  "refresh": "string"
}
```

### **Response Example**

```json
{
  "access": "string"
}
```

### **Field Descriptions**

| Field     | Type   | Description                             |
| --------- | ------ | --------------------------------------- |
| `refresh` | string | Valid refresh token obtained from login |
| `access`  | string | Newly issued access token               |

---

## **4. GET /api/auth/me**

**Authentication Requirement:**
Required (player or manager)

**Related Frontend:**

* Player Homepage
* Wallet Page
* Profile Page
* Manager Dashboard

**Description:**
Returns the authenticated user’s profile and wallet information.

**Query Parameters:**
None

---

### **Response Example**

```json
{
    "id": 46,
    "username": "TheLastTester",
    "email": "lasttester@example.com",
    "firstname": "Hoshitsuki",
    "lastname": "Hokori",
    "avatarKey": null,
    "role": "player",
    "balance": 1000,
    "lastLogin": "2025-11-15 07:03:31"
}
```

### **Field Descriptions**

| Field       | Type           | Description                 |
| ----------- | -------------- | --------------------------- |
| `id`        | number         | User ID                     |
| `username`  | string         | Username                    |
| `email`     | string         | User’s email                |
| `firstname` | string         | User’s first name           |
| `lastname`  | string         | User’s last name            |
| `avatarKey` | string or null | Avatar filename             |
| `role`      | string         | User role                   |
| `balance`   | number         | Current wallet coin balance |
| `lastLogin` | string         | Timestamp of last login     |

---

## **5. GET /api/auth/`{user_id}`**

**Authentication Requirement:**
Manager only

**Related Frontend:**

* Manager Check-in Panel
* Manager Booking Detail Modal

**Description:**
Retrieves profile data for any player.
Used by managers when verifying booking ownership during check-in.

**Query Parameters:**
user_id

---

### **Response Example**

```json
{
    "id": 46,
    "username": "TheLastTester",
    "email": "lasttester@example.com",
    "firstname": "Hoshitsuki",
    "lastname": "Hokori",
    "avatarKey": null,
    "role": "player",
    "balance": 1000,
    "lastLogin": "2025-11-15 07:03:31"
}
```

### **Field Descriptions**

Same schema as `/api/auth/me`.

---

## **6. POST /api/auth/me**

**Authentication Requirement:**
Required

**Related Frontend:**

* Player Profile → Edit Profile Page

**Description:**
Updates the authenticated user’s profile.
Used for changing name, email, or avatar.

**Query Parameters:**
None

---

### **Request Payload Example**

```json
{
  "id": 46,
  "username": "TheLastTester",
  "email": "lasttester@example.com",
  "firstname": "Hoshitsuki",
  "lastname": "Hokori",
  "avatarKey": "profile1.png"
}
```

### **Response Example**

```json
{ "status": "ok" }
```

### **Field Descriptions**

| Field       | Type   | Description              |
| ----------- | ------ | ------------------------ |
| `id`        | number | User ID (immutable)      |
| `username`  | string | New or existing username |
| `email`     | string | Updated email            |
| `firstname` | string | Updated first name       |
| `lastname`  | string | Updated last name        |
| `avatarKey` | string | Avatar image filename    |

---
---

## **7. GET /month-view?club=`<club_id>`&month=`<YYYY-MM>`**

**Authentication Requirement:**
Not required

**Related Frontend:**

* Player Homepage (Calendar View)
* Manager Dashboard (Monthly Slot Overview)
* Manager Control Page

**Description:**
Returns the full slot map for each day in the requested month, including all slot IDs and their statuses.
This endpoint allows both the player and manager to view court availability, booked slots, expired slots, and maintenance schedules for each day.

**Query Parameters:**

| Parameter | Type    | Required | Description                               |
| --------- | ------- | -------- | ----------------------------------------- |
| `club`    | integer | Yes      | Club ID                                   |
| `month`   | string  | Yes      | Month in format `YYYY-MM` (e.g., 2025-11) |

---

### **Response Example**

```json
{
  "month": "11-25",
  "days": [
    {
      "date": "01-11-25",
      "slot_list": {
        "24403": {
          "status": "expired",
          "start_time": "10:00",
          "end_time": "10:30",
          "court": 1,
          "court_name": "Court 1",
          "price_coin": 100
        },
        "24404": {
          "status": "expired",
          "start_time": "10:30",
          "end_time": "11:00",
          "court": 1,
          "court_name": "Court 1",
          "price_coin": 100
        }
      }
    }
  ]
}
```

### **Field Descriptions**

| Field        | Type   | Description                               |
| ------------ | ------ | ----------------------------------------- |
| `month`      | string | Returned month (`MM-YY`)                  |
| `days`       | array  | List of days with slot mappings           |
| `date`       | string | Date in `DD-MM-YY`                        |
| `slot_list`  | object | Dictionary of slot_id → slot_details      |
| `status`     | string | Slot status (`available`, `booked`, etc.) |
| `start_time` | string | Slot start time                           |
| `end_time`   | string | Slot end time                             |
| `court`      | number | Court number                              |
| `court_name` | string | Court display name                        |
| `price_coin` | number | Slot price in CL Coins                    |

---

## **8. GET /available-slots?club=`<club_id>`&month=`<YYYY-MM>`**

**Authentication Requirement:**
Not required

**Related Frontend:**

* Player Homepage (Availability Summary Panel)
* Manager Dashboard (Availability Preview)

**Description:**
Returns simplified availability information for each day in the month.
Includes percentage availability and example available slots for each day.

**Query Parameters:**

| Parameter | Type    | Required | Description               |
| --------- | ------- | -------- | ------------------------- |
| `club`    | integer | Yes      | Club ID                   |
| `month`   | string  | Yes      | Month in `YYYY-MM` format |

---

### **Response Example**

```json
{
  "month": "10-25",
  "days": [
    {
      "date": "01-10-25",
      "available_percent": 0.38,
      "available_slots": [
        {
          "slot_status": "available",
          "service_date": "2025-10-01",
          "start_time": "17:00",
          "end_time": "17:30",
          "court": 3,
          "court_name": "Court 3",
          "price_coin": 100
        }
      ]
    }
  ]
}
```

### **Field Descriptions**

| Field               | Type              | Description                                 |
| ------------------- | ----------------- | ------------------------------------------- |
| `available_percent` | number            | Ratio of available slots (0–1) for that day |
| `available_slots`   | array of SlotItem | Example available slots for the day         |
| `date`              | string            | Date in format `DD-MM-YY`                   |

---

## **9. GET /slots/`{slot_id}`**

**Authentication Requirement:**
Required

**Related Frontend:**

* Player Booking History (Detail Modal and PDF)
* Manager Log (Slot Detail in Booking Modal)

**Description:**
Retrieves complete details of a slot, including its time range, court information, price, and booking status.

**Query Parameters:**
None

---

### **Response Example**

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

### **Field Descriptions**

| Field          | Type           | Description                        |
| -------------- | -------------- | ---------------------------------- |
| `slot_status`  | string         | Slot status                        |
| `service_date` | string         | Date of the slot                   |
| `start_time`   | string         | Slot starting time                 |
| `end_time`     | string         | Slot ending time                   |
| `court`        | number         | Court number                       |
| `court_name`   | string         | Court name                         |
| `price_coin`   | number         | Slot price in CL Coins             |
| `booking_id`   | string or null | Booking ID, or `null` if available |

---

## **10. POST /slots/slots-list**

**Authentication Requirement:**
Required

**Related Frontend:**

* Player Homepage (Upcoming Modal)
* Player Booking History (View Detail, PDF)
* Manager Log Page (Booking Detail Modal)

**Description:**
Retrieves full slot details for a list of slot IDs.
Used when a booking contains multiple slots.

**Query Parameters:**
None

---

### **Request Payload Example**

```json
{
  "slot_list": ["25188", "25189"]
}
```

### **Response Example**

```json
{
  "slot_items": [
    {
      "slot_status": "available",
      "service_date": "2025-10-25",
      "start_time": "17:00",
      "end_time": "17:30",
      "court": 3,
      "court_name": "Court 3",
      "price_coin": 100
    }
  ]
}
```

### **Field Descriptions**

| Field        | Type              | Description           |
| ------------ | ----------------- | --------------------- |
| `slot_list`  | array of string   | Slot IDs requested    |
| `slot_items` | array of SlotItem | Detailed slot objects |

---

## **11. POST /slots/status**

**Authentication Requirement:**
Required (Manager only)

**Related Frontend:**

* Manager Control Page (Slot Status Change UI)

**Description:**
Updates the status of multiple slots, typically switching between `available` and `maintenance`.

**Query Parameters:**
None

---

### **Request Payload Example**

**Set to maintenance**

```json
{
  "slots": ["25188", "25189"],
  "changed_to": "maintenance"
}
```

**Set back to available**

```json
{
  "slots": ["25188", "25189"],
  "changed_to": "available"
}
```

### **Response Example**

```json
{
  "updated_count": 2,
  "new_status": "maintenance",
  "message": "Slot statuses updated successfully."
}
```

### **Field Descriptions**

| Field           | Type            | Description                             |
| --------------- | --------------- | --------------------------------------- |
| `slots`         | array of string | Slot IDs to update                      |
| `changed_to`    | string          | New status (`maintenance`, `available`) |
| `updated_count` | number          | Number of updated slots                 |
| `new_status`    | string          | Status applied to all slots             |
| `message`       | string          | Operation summary message               |


---
---

## **12. POST /api/booking**

**Authentication Requirement:**
Required

**Related Frontend:**

* Player Booking Summary Modal (confirm booking)
* Manager Control Page (Walk-in booking)

**Description:**
Creates a new booking for the selected slots.
The system validates slot availability and calculates the total cost automatically.

**Query Parameters:**
None

---

### **Request Payload Example (Player Site)**

```json
{
  "club": 1,
  "booking_method": "courtly-website",
  "owner_username": "test2",
  "owner_contact": "test2@example.com",
  "payment_method": "coin",
  "slots": ["24115", "24116"]
}
```

### **Request Payload Example (Manager Walk-in)**

```json
{
  "club": 1,
  "booking_method": "phone-call",
  "owner_username": "Proud",
  "owner_contact": "0936888850",
  "payment_method": "mobile-banking",
  "booking_slots": ["25188", "25189"]
}
```

---

### **Response Example**

```json
{ "status": "ok" }
```

*(or error message if fail)*

---

### **Field Descriptions**

| Field            | Type          | Description                                       |
| ---------------- | ------------- | ------------------------------------------------- |
| `club`           | number        | Club ID for booking                               |
| `booking_method` | string        | Booking channel (`courtly-website`, `phone-call`) |
| `owner_username` | string        | Name/username of the customer                     |
| `owner_contact`  | string        | Email or phone number                             |
| `payment_method` | string        | `coin`, `mobile-banking`                          |
| `slots`          | array<string> | Slot IDs (player)                                 |
| `booking_slots`  | array<string> | Slot IDs (manager walk-in)                        |

---

## **13. GET /api/booking/{booking_id}**

**Authentication Requirement:**
Required (Booking owner or Manager)

**Related Frontend:**

* Player Homepage (Upcoming Modal)
* Player Booking History (Detail Modal + PDF Receipt)
* Manager Log Page (Booking Detail Modal + PDF)

**Description:**
Returns **full booking details**, including all slot information.
This endpoint replaces the need to call `/slots/slots-list` for display.

**Query Parameters:**
None

---

### **Response Example**

```json
{
  "created_date": "2025-10-19 16:42",
  "booking_id": "BK-01D82793F7",
  "owner_id": 1,
  "owner_username": "test2",
  "booking_method": "courtly-website",
  "owner_contact": "test2@example.com",
  "total_cost": 300,
  "payment_method": "coin",
  "booking_date": "2025-10-25",
  "booking_status": "confirmed",
  "able_to_cancel": false,
  "booking_slots": {
    "25188": {
      "slot_status": "booked",
      "service_date": "2025-10-25",
      "start_time": "17:00",
      "end_time": "17:30",
      "court": 3,
      "court_name": "Court 3",
      "price_coin": 100,
      "booking_id": "BK-01D82793F7"
    },
    "25189": {
      "slot_status": "booked",
      "service_date": "2025-10-25",
      "start_time": "17:30",
      "end_time": "18:00",
      "court": 3,
      "court_name": "Court 3",
      "price_coin": 100,
      "booking_id": "BK-01D82793F7"
    }
  }
}
```

---

### **Field Descriptions**

| Field            | Type    | Description                                        |
| ---------------- | ------- | -------------------------------------------------- |
| `created_date`   | string  | Timestamp of booking creation                      |
| `booking_id`     | string  | Booking reference ID                               |
| `owner_id`       | number  | User ID of booking owner                           |
| `owner_username` | string  | Owner username                                     |
| `owner_contact`  | string  | Owner contact                                      |
| `booking_method` | string  | Booking channel                                    |
| `total_cost`     | number  | Total cost in CL Coins                             |
| `payment_method` | string  | `coin` or `mobile-banking`                         |
| `booking_date`   | string  | Service date                                       |
| `booking_status` | string  | `confirmed`, `cancelled`, `end_game`, `checked_in` |
| `able_to_cancel` | boolean | Whether the cancellation button should be shown    |
| `booking_slots`  | object  | Slot map keyed by slot_id                          |

---


## **14. POST /api/booking/{booking_id}/cancel**

**Authentication Requirement:**
Required (Player or Manager)

**Related Frontend:**

* Player History Page (Cancel Button)
* Manager Log Page (Cancel from admin panel)

**Description:**
Cancels a booking.
If cancellation is before the 24-hour policy window, the system refunds CL Coins.

**Query Parameters:**
None

**Payload:**
None

---

### **Response Example**

```json
{
  "booking_id": "BK-01D82793F7",
  "status": "cancelled",
  "refund_coins": 300,
  "message": "Booking cancelled and refund processed successfully."
}
```

---

### **Field Descriptions**

| Field          | Type   | Description       |
| -------------- | ------ | ----------------- |
| `booking_id`   | string | Booking reference |
| `status`       | string | `cancelled`       |
| `refund_coins` | number | Amount refunded   |
| `message`      | string | Summary message   |

---


## **15. POST /api/booking/{booking_id}/checkin**

**Authentication Requirement:**
Required (Manager only)

**Related Frontend:**

* Manager Log Page (Check-in Button)

**Description:**
Marks a booking as “checked-in”.
All associated slots become “playing” or “end_game” depending on the logic.

**Query Parameters:**
None

**Payload:**
None

---

### **Response Example**

```json
{
  "booking_id": "BK-01D82793F7",
  "status": "checked_in",
  "updated_slots": ["25188", "25189"],
  "message": "Booking checked in successfully."
}
```

---

### **Field Descriptions**

| Field           | Type   | Description       |
| --------------- | ------ | ----------------- |
| `booking_id`    | string | Target booking ID |
| `status`        | string | `checked_in`      |
| `updated_slots` | array  | Slot IDs updated  |
| `message`       | string | Operation result  |

---


## **16. GET /api/bookings/**

*(Manager only – full system booking table)*

**Authentication Requirement:**
Required (Manager)

**Related Frontend:**

* Manager Log → Booking Table

**Description:**
Returns the **lightweight list** of all bookings in the system.
Used for listing before loading detailed booking info using GET `/api/booking/{booking_id}`.

**Query Parameters:**
None

---

### **Response Example**

```json
[
  {
    "booking_id": "BK-01D82793F7",
    "created_date": "2025-10-19 16:42",
    "total_cost": 300,
    "booking_date": "2025-10-25",
    "booking_status": "confirmed",
    "able_to_cancel": false,
    "owner_id": 38
  }
]
```

---

### **Field Descriptions**

| Field            | Type    | Description               |
| ---------------- | ------- | ------------------------- |
| `booking_id`     | string  | Booking ID                |
| `created_date`   | string  | Created at timestamp      |
| `total_cost`     | number  | Total cost of booking     |
| `booking_date`   | string  | Service date              |
| `booking_status` | string  | Current status            |
| `able_to_cancel` | boolean | Whether cancel is allowed |
| `owner_id`       | number  | User ID of booking owner  |

---
---

## **17. GET /api/my-booking/**

*(Player only – their own booking history)*

**Authentication Requirement:**
Required (Player)

**Related Frontend:**

* Player Booking History Page

**Description:**
Returns a lightweight list of bookings belonging to the current authenticated player.

### **Response Example**

*(Same structure as /api/bookings/)*

```json
[
  {
    "booking_id": "BK-01D82793F7",
    "created_date": "2025-10-19 16:42",
    "total_cost": 300,
    "booking_date": "2025-10-25",
    "booking_status": "confirmed",
    "able_to_cancel": false,
    "owner_id": 38
  }
]
```

---

---

## **18. GET /api/bookings/upcoming  and  GET /api/my-booking/upcoming**

**Authentication Requirement:**
Required

* `GET /api/bookings/upcoming` → Manager only
* `GET /api/my-booking/upcoming` → Player only

**Related Frontend:**

* Player Homepage (Upcoming Booking Modal)
* Manager Dashboard (Upcoming Sessions)

**Description:**
Returns only the **confirmed** bookings whose booking date is **≥ today**.
Used for homepage reminders and upcoming session panels.

### **Response Example**

```json
[
  {
    "booking_id": "BK-01D82793F7",
    "created_date": "2025-10-19 16:42",
    "total_cost": 300,
    "booking_date": "2025-10-25",
    "booking_status": "confirmed",
    "able_to_cancel": false,
    "owner_id": 38
  }
]
```

### **Additional Filtering Behavior**

| Condition                     | Behavior |
| ----------------------------- | -------- |
| booking_status != "confirmed" | excluded |
| booking_date < today          | excluded |

---

## **19. GET /api/wallet/balance**

**Authentication Requirement:**
Required (Player only)

**Related Frontend:**

* Player Wallet Page (Balance Panel)
* Player Booking Summary Modal (Wallet balance deduction display)

**Description:**
Returns the player’s current CL Coin wallet balance, balance in THB, and number of ledger entries.
Used to show up-to-date wallet status in the user's profile or wallet section.

**Query Parameters:**
None

---

### **Response Example**

```json
{
  "balance_thb": "500.00",
  "coins": 500,
  "entries": 12
}
```

### **Field Descriptions**

| Field         | Type   | Description                                      |
| ------------- | ------ | ------------------------------------------------ |
| `balance_thb` | string | Wallet balance in THB (formatted string)         |
| `coins`       | number | Wallet balance in CL Coins                       |
| `entries`     | number | Total transaction entries recorded in the ledger |

---

---

## **20. GET /api/wallet/ledger**

**Authentication Requirement:**
Required (Player only)

**Related Frontend:**

* Player Wallet Page (Transaction History)
* Export CSV Button (uses same data source)

**Description:**
Returns the player’s wallet ledger (transaction history), sorted by newest first.
Each entry indicates money-in/money-out, including booking captures, refunds, and top-ups.

**Query Parameters:**
None

---

### **Response Example**

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

### **Field Descriptions**

| Field         | Type           | Description                                           |
| ------------- | -------------- | ----------------------------------------------------- |
| `count`       | number         | Total number of records in the ledger                 |
| `results`     | array          | List of ledger entries                                |
| `id`          | number         | Ledger entry ID                                       |
| `type`        | string         | Transaction type: `topup`, `capture`, `refund`        |
| `amount`      | number         | Positive (in) or negative (out) coin amount           |
| `ref_booking` | number or null | Booking reference if transaction relates to a booking |
| `created_at`  | string         | Timestamp of transaction                              |

---

---

## **21. GET /api/wallet/ledger/export-csv**

**Authentication Requirement:**
Required (Player only)

**Related Frontend:**

* Player Wallet Page → “Export CSV” button

**Description:**
Generates a downloadable CSV file containing the player’s full transaction history.

**Query Parameters:**
None

---

### **Response Example**

**Headers returned by backend:**

```
Content-Type: text/csv
Content-Disposition: attachment; filename="wallet_transactions.csv"
```

**CSV file includes:**

```
id,type,amount,ref_booking,created_at
260,topup,200,,2025-10-26T00:26:34.915094+07:00
257,capture,-100,294,2025-10-25T10:31:08.995632+07:00
```



---

## **22. POST /api/wallet/topups**

**Authentication Requirement:**
Required (Player only)

**Related Frontend:**

* Player Wallet → Top-up Form (Upload Slip)

**Description:**
Creates a new top-up request by submitting transfer information and an image slip.

**Query Parameters:**
None

---
### **Request Payload Example**

```json
{
"amount_thb": 200
"transfer_date": 2025-10-26
"transfer_time": 14:45:00
"slip_path": <file image>
}
```


### **Response Example**

```json
{
  "id": 1,
  "amount_thb": "200.00",
  "status": "pending",
  "slip_path": "http://127.0.0.1:8001/media/slips/slip_1.png",
  "created_at": "2025-10-26T07:45:00Z"
}
```

### **Field Descriptions**

| Field        | Type   | Description                       |
| ------------ | ------ | --------------------------------- |
| `id`         | number | Top-up request ID                 |
| `amount_thb` | string | Requested amount in THB           |
| `status`     | string | `pending`, `approved`, `rejected` |
| `slip_path`  | string | URL to uploaded slip image        |
| `created_at` | string | Timestamp of creation             |

---
---

## **23. GET /api/wallet/topups**

**Authentication Requirement:**
Required

* Player: sees **only their own** top-up requests
* Manager: sees **all pending requests** (depending on backend permissions)

**Related Frontend:**

* Player Wallet → “My Top-ups” list
* Manager Dashboard → Pending Top-up Approval List

**Description:**
Returns a list of top-up requests with their status and slip images.

**Query Parameters:**
None

---

### **Response Example**

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

### **Field Descriptions**

| Field        | Type   | Description               |
| ------------ | ------ | ------------------------- |
| `id`         | number | Top-up request ID         |
| `player`     | string | Player email/username     |
| `amount_thb` | string | Amount requested          |
| `status`     | string | Pending/Approved/Rejected |
| `slip_path`  | string | Slip image URL            |
| `created_at` | string | Creation timestamp        |

---

---

## **24. POST /api/wallet/topups/{id}/approve**

**Authentication Requirement:**
Required (Manager only)

**Related Frontend:**

* Manager Dashboard → Top-up Approval Modal

**Description:**
Approves a top-up request and immediately updates the player’s coin balance.

**Query Parameters:**
None
**Request Payload:**
None

---

### **Response Example**

```json
{ "detail": "Top-up approved." }
```

---

---

## **25. POST /api/wallet/topups/{id}/reject**

**Authentication Requirement:**
Required (Manager only)

**Related Frontend:**

* Manager Dashboard → Top-up Approval Modal

**Description:**
Rejects a top-up request (no balance added).

**Query Parameters:**
None
**Request Payload:**
None

---

### **Response Example**

```json
{ "detail": "Top-up rejected." }
```

---
