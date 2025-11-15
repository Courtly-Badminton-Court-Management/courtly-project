
# **Courtly API Documentation**

### Badminton Court Management and Booking System

**Base URL:**

```text
https://backend.courtlyeasy.app/
```

---

# API Overview & Master Summary

### **Endpoint Summary Table**

| No. | Method | Endpoint                            | Short Description                                            | Auth Required | Roles that can call it   |
| --- | ------ | ----------------------------------- | ------------------------------------------------------------ | ------------- | ------------------------ |
| 1   | POST   | `/api/auth/register`                | Register a new user account                                  | No            | Visitor                  |
| 2   | POST   | `/api/auth/login`                   | Log in with email & password, get JWT tokens + profile       | No            | Visitor                  |
| 3   | POST   | `/api/auth/token/refresh`           | Refresh access token using a refresh token                   | Yes           | Player, Manager          |
| 4   | GET    | `/api/auth/me`                      | Get current authenticated user profile                       | Yes           | Player, Manager          |
| 5   | GET    | `/api/auth/{user_id}`               | Get profile of a specific user                               | Yes           | Manager                  |
| 6   | POST   | `/api/auth/me`                      | Update current user profile                                  | Yes           | Player, Manager          |
| 7   | GET    | `/api/month-view`                   | Get monthly slot overview with full slot map & statuses      | No            | Visitor, Player, Manager |
| 8   | GET    | `/api/available-slots`              | Get monthly availability summary (percentage + sample slots) | No            | Visitor, Player, Manager |
| 9   | GET    | `/api/slots/{slot_id}`              | Get details of a single slot                                 | Yes           | Player, Manager          |
| 10  | POST   | `/api/slots/slots-list`             | Get details of multiple slots by ID                          | Yes           | Player, Manager          |
| 11  | POST   | `/api/slots/status`                 | Bulk update slot status (available / maintenance, etc.)      | Yes           | Manager                  |
| 12  | POST   | `/api/booking`                      | Create a booking (player online booking or manager walk-in)  | Yes           | Player, Manager          |
| 13  | GET    | `/api/booking/{booking_id}`         | Get full booking details (including all booked slots)        | Yes           | Player, Manager          |
| 14  | POST   | `/api/booking/{booking_id}/cancel`  | Cancel a booking and trigger refund logic                    | Yes           | Player, Manager          |
| 15  | POST   | `/api/booking/{booking_id}/checkin` | Mark a booking as checked-in                                 | Yes           | Manager                  |
| 16  | GET    | `/api/bookings/`                    | Get a lightweight list of all bookings                       | Yes           | Manager                  |
| 17  | GET    | `/api/my-booking/`                  | Get the current player’s own booking history                 | Yes           | Player                   |
| 18  | GET    | `/api/bookings/upcoming`            | Get all upcoming confirmed bookings in the system            | Yes           | Manager                  |
| 19  | GET    | `/api/my-booking/upcoming`          | Get upcoming confirmed bookings for the current player       | Yes           | Player                   |
| 20  | GET    | `/api/wallet/balance`               | Get wallet balance (coins, THB, and ledger count)            | Yes           | Player                   |
| 21  | GET    | `/api/wallet/ledger`                | Get wallet ledger (coin transaction history)                 | Yes           | Player, Manager          |
| 22  | GET    | `/api/wallet/ledger/export-csv`     | Export wallet ledger as CSV                                  | Yes           | Player, Manager          |
| 23  | POST   | `/api/wallet/topups`                | Create a coin top-up request (with transfer slip)            | Yes           | Player                   |
| 24  | GET    | `/api/wallet/topups`                | List top-up requests                                         | Yes           | Player, Manager          |
| 25  | POST   | `/api/wallet/topups/{id}/approve`   | Approve a top-up request and credit coins                    | Yes           | Manager                  |
| 26  | POST   | `/api/wallet/topups/{id}/reject`    | Reject a top-up request                                      | Yes           | Manager                  |

> * `token/refresh` itself does not require an access token, but it does require a valid **refresh token** in the request body.

---

### **Access Matrix by Role**

| Endpoint / Behaviour                                          | Visitor | Player | Manager |
| ------------------------------------------------------------- | :-----: | :----: | :-----: |
| Register / Login (`/api/auth/register`, `/login`)             |    ✓    |   ✓    |    ✓    |
| Token refresh                                                 |         |   ✓    |    ✓    |
| Get / update own profile                                      |         |   ✓    |    ✓    |
| Get other user’s profile                                      |         |        |    ✓    |
| Month view / availability (`/month-view`, `/available-slots`) |    ✓    |   ✓    |    ✓    |
| Slot details / slots-list                                     |         |   ✓    |    ✓    |
| Change slot status (`/slots/status`)                          |         |        |    ✓    |
| Create booking                                                |         |   ✓    |    ✓    |
| View booking detail                                           |         |   ✓    |    ✓    |
| Cancel booking                                                |         |   ✓    |    ✓    |
| Check-in booking                                              |         |        |    ✓    |
| Get all bookings / upcoming system-wide                       |         |        |    ✓    |
| Get own bookings / own upcoming                               |         |   ✓    |         |
| Wallet balance / ledger / export                              |         |   ✓    |         |
| Create top-up                                                 |         |   ✓    |         |
| List top-ups                                                  |         |   ✓    |    ✓    |
| Approve / reject top-up                                       |         |        |    ✓    |



---

### **Slot Status Reference**

#### Slot Status Summary

| Slot Status   | High-level meaning                                                           |
| ------------- | ---------------------------------------------------------------------------- |
| `available`   | Free and open for booking.                                                   |
| `booked`      | Booked by a player through the system.                                       |
| `walkin`      | Booked manually on-site by a manager (walk-in customer).                     |
| `playing`     | Player or walk-in customer has checked in and is currently playing.          |
| `maintenance` | Court is under maintenance; slot cannot be booked.                           |
| `ended`       | Checked-in booking for this slot has finished.                               |
| `expired`     | Slot time has passed without any booking.                                    |
| `noshow`      | Slot was booked (player or walk-in) but no one checked in before start time. |

#### Detailed Behaviour by Role

**`available`**

* **Meaning**: The slot is currently free and open for booking.
* **Player**:

  * Can click this slot to create a booking.
* **Manager**:

  * Can mark slot as **Maintenance**.
  * Can mark slot as **Walk-in** (creates on-site booking).
  * Can mark as **Walk-in + Check-in** directly (walk-in customer already on court).
* **System**:

  * No automatic transitions.

---

**`booked`**

* **Meaning**: A player has booked this slot through the online system.
* **Player**:

  * Cannot click or modify this slot on the grid.
* **Manager**:

  * Can mark this slot as **Check-in** when the player arrives.
  * Can cancel the booking via the booking endpoints (not from the slot grid directly).
* **System**:

  * If the slot’s start/end time passes and there is **no Check-in**, the slot automatically becomes **`noshow`**.

---

**`walkin`**

* **Meaning**: The slot has been manually booked by the manager for an on-site customer.
* **Player**:

  * Sees this as a **booked (red)** slot and cannot click it.
* **Manager**:

  * Must record customer name and phone number in the walk-in booking (for internal tracking).
  * Can later mark this booking as **Check-in** (which moves the slot to `playing`).
* **System**:

  * If the time passes and no Check-in is recorded, slot automatically becomes **`noshow`**.

---

**`playing`**

* **Meaning**: The player (or walk-in customer) has arrived and started playing on this slot.
* **Player**:

  * Cannot click or modify this slot.
* **Manager**:

  * Can only set this status **manually** by checking in from an existing `booked` or `walkin` booking.
  * Cannot freely set `playing` from other statuses.
* **System**:

  * When playtime ends, slot automatically changes to **`ended`**.

---

**`maintenance`**

* **Meaning**: The court is under maintenance and temporarily not bookable.
* **Player**:

  * Cannot click or book this slot.
* **Manager**:

  * Can toggle this slot back to **`available`** when maintenance is completed.
* **System**:

  * No automatic transitions.

---

**`ended`**

* **Meaning**: The playtime has finished for a previously checked-in booking.
* **Player**:

  * Cannot click or modify this slot.
* **Manager**:

  * Cannot change this status directly (read-only, for history).
* **System**:

  * Automatically set when a **checked-in** booking reaches the end time of this slot.

---

**`expired`**

* **Meaning**: The slot has passed its time without being booked at all.
* **Player**:

  * Cannot click or book this slot (out of date).
* **Manager**:

  * Cannot change this status (read-only history).
* **System**:

  * Automatically set when the current time passes a slot that was **never booked**.

---

**`noshow`**

* **Meaning**: A player or walk-in had an upcoming booking for this slot but did not check in.
* **Player**:

  * Cannot click or modify this slot.
* **Manager**:

  * Cannot modify this status, but can view it for record-keeping and reports.
* **System**:

  * Automatically set when a `booked` or `walkin` slot reaches the start time + play window without a Check-in.

---

### **Booking Status Flow**

#### Booking Status Summary

Booking status is tracked at **booking level**, while each booking also controls a set of **slot statuses**.

| Booking Status | When it is used                                                            | Relationship to slot statuses                                     |
| -------------- | -------------------------------------------------------------------------- | ----------------------------------------------------------------- |
| `Upcoming`     | Immediately after a player or manager creates a booking.                   | Slots become `booked` (player) or `walkin` (manager).             |
| `Cancelled`    | Player or manager cancels the booking (respecting policy, e.g. ≥24h).      | Slots are released back to `available`; refund logic is executed. |
| `Check-in`     | Manager confirms that the customer has arrived for an upcoming booking.    | Slots in this booking move from `booked`/`walkin` to `playing`.   |
| `Endgame`      | A checked-in booking has fully finished playing (all slots finished).      | All slots in this booking move to `ended`.                        |
| `No-Show`      | An upcoming booking reaches the end of its slot time without any Check-in. | All slots in this booking move to `noshow`.                       |

#### Flow and Related Endpoints

* **Upcoming**

  * Trigger: A new booking is created.
  * Slots:

    * Player booking → slots set to `booked`.
    * Manager walk-in booking → slots set to `walkin`.
  * Endpoint:

    * `POST /api/booking`

* **Cancelled**

  * Trigger: Player or manager cancels an upcoming booking (subject to policy).
  * Slots:

    * All slots in the booking are returned to `available`.
    * Booking record still remembers which slots were previously booked.
  * Endpoint:

    * `POST /api/booking/{booking_id}/cancel`

* **Check-in**

  * Trigger: Manager marks that the player (or walk-in customer) has arrived at the venue.
  * Slots:

    * All slots in this booking change to `playing`.
  * Endpoint:

    * `POST /api/booking/{booking_id}/checkin`

* **Endgame**

  * Trigger: A checked-in booking reaches the end time of its **last slot**.
  * Slots:

    * All slots in the booking automatically change from `playing` to `ended`.
  * Endpoint:

    * System-driven (no explicit API call from frontend).

* **No-Show**

  * Trigger: An upcoming booking reaches the end time of its **last slot** without any Check-in.
  * Slots:

    * All slots in the booking automatically change to `noshow`.
  * Endpoint:

    * System-driven (no explicit API call from frontend).

---

### **Wallet Transaction Types**

Coin transactions in the wallet ledger:

| Field `type` | Meaning                            | Typical source                                          |
| ------------ | ---------------------------------- | ------------------------------------------------------- |
| `topup`      | Coins added to the player’s wallet | Manager approves a top-up request                       |
| `capture`    | Coins deducted from the wallet     | Player confirms a booking paid with coins               |
| `refund`     | Coins returned back to the wallet  | Booking is cancelled within policy and refund is issued |

Top-up request statuses (for `/api/wallet/topups`):

| Status     | Meaning                                         |
| ---------- | ----------------------------------------------- |
| `pending`  | Waiting for manager review / approval           |
| `approved` | Coins have been credited to the player’s wallet |
| `rejected` | Request was rejected; no coins are added        |

---

### **Error Response Format (Global)**

Common response shapes used across endpoints:

1. **Validation / business errors**

   ```json
   {
     "error": "Email is already taken."
   }
   ```

   * Used for form-like errors (registration, booking rules, etc.).
   * Usually returned with HTTP status `400`.

2. **Generic success / info messages**

   ```json
   {
     "detail": "Top-up approved."
   }
   ```

   * Used for simple confirmations or failure messages, often with `200`, `201`, `4xx` depending on context.

Recommended HTTP codes (for documentation & implementation):

| Code | Typical meaning                           |
| ---- | ----------------------------------------- |
| 200  | Successful request                        |
| 201  | Resource created (e.g. booking, top-up)   |
| 400  | Bad request / validation error            |
| 401  | Not authenticated (missing/invalid token) |
| 403  | Forbidden (role does not have permission) |
| 404  | Resource not found                        |
| 500  | Unexpected server error                   |

---

# Auth & User APIs

## 1. POST /api/auth/register

### Description

Creates a new user account.
The backend validates matching passwords, unique email/username, and acceptance of terms.

**Authentication Requirement:** Not required

**Related Frontend:**

* Player Registration Page

**Query Parameters:**
None

### Request Payload Example

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

### Response Example

**Success**

```json
{
  "status": "ok"
}
```

**Failure (example)**

```json
{
  "error": "Email is already taken."
}
```

### Field Descriptions

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

## 2. POST /api/auth/login

### Description

Authenticates the user using email and password and returns JWT access & refresh tokens, plus user profile and wallet balance.

**Authentication Requirement:** Not required

**Related Frontend:**

* Login Page

**Query Parameters:**
None

### Request Payload Example

```json
{
  "email": "sprint4Tester@example.com",
  "password": "Courtly_123"
}
```

### Response Example

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

### Field Descriptions

| Field              | Type           | Description                                           |
| ------------------ | -------------- | ----------------------------------------------------- |
| `refresh`          | string         | JWT refresh token used to generate new access tokens  |
| `access`           | string         | JWT access token required for authenticated endpoints |
| `firstLogin`       | boolean        | Indicates if this is the user's first time logging in |
| `user`             | object         | Authenticated user information                        |
| `user.id`          | number         | User ID                                               |
| `user.username`    | string         | Username                                              |
| `user.email`       | string         | Email used for login                                  |
| `user.firstname`   | string         | First name                                            |
| `user.lastname`    | string         | Last name                                             |
| `user.role`        | string         | User role (`player`, `manager`)                       |
| `user.coinBalance` | number         | Current CL Coin balance                               |
| `user.avatarKey`   | string or null | Selected avatar filename                              |
| `user.lastLogin`   | string         | Last login timestamp                                  |

---

## 3. POST /api/auth/token/refresh

### Description

Generates a new access token using a valid refresh token.

**Authentication Requirement:** Not required (uses refresh token in body)

**Related Frontend:**

* Token refresh handler
* Auto-login / token rotation logic

**Query Parameters:**
None

### Request Payload Example

```json
{
  "refresh": "string"
}
```

### Response Example

```json
{
  "access": "string"
}
```

### Field Descriptions

| Field     | Type   | Description                             |
| --------- | ------ | --------------------------------------- |
| `refresh` | string | Valid refresh token obtained from login |
| `access`  | string | Newly issued access token               |

---

## 4. GET /api/auth/me

### Description

Returns the authenticated user’s profile and wallet information (balance).

**Authentication Requirement:** Required (Player or Manager)

**Related Frontend:**

* Player Homepage
* Wallet Page
* Profile Page
* Manager Dashboard

**Query Parameters:**
None

### Response Example

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

### Field Descriptions

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

## 5. GET /api/auth/`{user_id}`

### Description

Retrieves profile data for any player.
Used by managers when verifying booking ownership during check-in.

**Authentication Requirement:** Required (Manager only)

**Related Frontend:**

* Manager Check-in Panel
* Manager Booking Detail Modal

**Path Parameters:**

| Name      | Type   | Required | Description    |
| --------- | ------ | -------- | -------------- |
| `user_id` | number | Yes      | Target user ID |

**Query Parameters:**
None

### Response Example

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

### Field Descriptions

Same schema as `GET /api/auth/me`.

---

## 6. POST /api/auth/me

### Description

Updates the authenticated user’s profile (name, email, avatar).

**Authentication Requirement:** Required

**Related Frontend:**

* Player Profile → Edit Profile Page

**Query Parameters:**
None

### Request Payload Example

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

### Response Example

```json
{
  "status": "ok"
}
```

### Field Descriptions

| Field       | Type   | Description              |
| ----------- | ------ | ------------------------ |
| `id`        | number | User ID (immutable)      |
| `username`  | string | New or existing username |
| `email`     | string | Updated email            |
| `firstname` | string | Updated first name       |
| `lastname`  | string | Updated last name        |
| `avatarKey` | string | Avatar image filename    |

---

# Calendar & Slot APIs

## 7. GET /api/month-view?club=`{club_id}`&month=`{YYYY-MM}`

### Description

Returns the full slot map for each day in the requested month, including all slot IDs and their statuses.
Used by both player and manager sides for month view.

**Authentication Requirement:** Not required

**Related Frontend:**

* Player Homepage (Calendar View)
* Manager Dashboard (Monthly Slot Overview)
* Manager Control Page

**Query Parameters:**

| Name    | Type    | Required | Description                               |
| ------- | ------- | -------- | ----------------------------------------- |
| `club`  | integer | Yes      | Club ID                                   |
| `month` | string  | Yes      | Month in format `YYYY-MM` (e.g., 2025-11) |

### Response Example

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

### Field Descriptions

| Field              | Type   | Description                               |
| ------------------ | ------ | ----------------------------------------- |
| `month`            | string | Returned month (`MM-YY`)                  |
| `days`             | array  | List of days with slot mappings           |
| `days[].date`      | string | Date in `DD-MM-YY`                        |
| `days[].slot_list` | object | Dictionary of `slot_id` → slot details    |
| `status`           | string | Slot status (`available`, `booked`, etc.) |
| `start_time`       | string | Slot start time                           |
| `end_time`         | string | Slot end time                             |
| `court`            | number | Court number                              |
| `court_name`       | string | Court display name                        |
| `price_coin`       | number | Slot price in CL Coins                    |

---

## 8. GET /api/available-slots?club=`{club_id}`&month=`{YYYY-MM}`

### Description

Returns simplified availability information for each day in the month.
Includes percentage availability and example available slots for each day.

**Authentication Requirement:** Not required

**Related Frontend:**

* Player Homepage (Availability Summary Panel)
* Manager Dashboard (Availability Preview)

**Query Parameters:**

| Name    | Type    | Required | Description               |
| ------- | ------- | -------- | ------------------------- |
| `club`  | integer | Yes      | Club ID                   |
| `month` | string  | Yes      | Month in `YYYY-MM` format |

### Response Example

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

### Field Descriptions

| Field               | Type              | Description                                 |
| ------------------- | ----------------- | ------------------------------------------- |
| `month`             | string            | Returned month (`MM-YY`)                    |
| `days`              | array             | List of day entries                         |
| `days[].date`       | string            | Date in format `DD-MM-YY`                   |
| `available_percent` | number            | Ratio of available slots (0–1) for that day |
| `available_slots`   | array of SlotItem | Example available slots for the day         |

---

## 9. GET /api/slots/`{slot_id}`

### Description

Retrieves complete details of a slot, including its time range, court information, price, and booking status.

**Authentication Requirement:** Required (Player or Manager)

**Related Frontend:**

* Player Booking History (Detail Modal and PDF)
* Manager Log (Slot Detail in Booking Modal)

**Path Parameters:**

| Name      | Type   | Required | Description    |
| --------- | ------ | -------- | -------------- |
| `slot_id` | string | Yes      | Target slot ID |

**Query Parameters:**
None

### Response Example

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

### Field Descriptions

| Field          | Type           | Description                        |
| -------------- | -------------- | ---------------------------------- |
| `slot_status`  | string         | Slot status                        |
| `service_date` | string         | Date of the slot (service date)    |
| `start_time`   | string         | Slot starting time                 |
| `end_time`     | string         | Slot ending time                   |
| `court`        | number         | Court number                       |
| `court_name`   | string         | Court name                         |
| `price_coin`   | number         | Slot price in CL Coins             |
| `booking_id`   | string or null | Booking ID, or `null` if available |

---

## 10. POST /api/slots/slots-list

### Description

Retrieves full slot details for a list of slot IDs.
Used when a booking contains multiple slots.

**Authentication Requirement:** Required (Player or Manager)

**Related Frontend:**

* Player Homepage (Upcoming Modal)
* Player Booking History (View Detail, PDF)
* Manager Log Page (Booking Detail Modal)

**Query Parameters:**
None

### Request Payload Example

```json
{
  "slot_list": ["25188", "25189"]
}
```

### Response Example

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
    },
    {
      "slot_status": "available",
      "service_date": "2025-10-25",
      "start_time": "17:30",
      "end_time": "18:00",
      "court": 3,
      "court_name": "Court 3",
      "price_coin": 100
    }
  ]
}
```

### Field Descriptions

| Field        | Type              | Description           |
| ------------ | ----------------- | --------------------- |
| `slot_list`  | array of string   | Slot IDs requested    |
| `slot_items` | array of SlotItem | Detailed slot objects |

---

## 11. POST /api/slots/status

### Description

Updates the status of multiple slots, typically switching between `available` and `maintenance`.

**Authentication Requirement:** Required (Manager only)

**Related Frontend:**

* Manager Control Page (Slot Status Change UI)

**Query Parameters:**
None

### Request Payload Example

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

### Response Example

```json
{
  "updated_count": 2,
  "new_status": "maintenance",
  "message": "Slot statuses updated successfully."
}
```

### Field Descriptions

| Field           | Type            | Description                             |
| --------------- | --------------- | --------------------------------------- |
| `slots`         | array of string | Slot IDs to update                      |
| `changed_to`    | string          | New status (`maintenance`, `available`) |
| `updated_count` | number          | Number of updated slots                 |
| `new_status`    | string          | Status applied to all slots             |
| `message`       | string          | Operation summary message               |

---

# Booking APIs

## 12. POST /api/booking

### Description

Creates a new booking for the selected slots.
The system validates slot availability and calculates the total cost automatically.

**Authentication Requirement:** Required

**Related Frontend:**

* Player Booking Summary Modal (confirm booking)
* Manager Control Page (Walk-in booking)

**Query Parameters:**
None

### Request Payload Example (Player site)

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

### Request Payload Example (Manager walk-in)

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

### Response Example

```json
{
  "status": "ok"
}
```

*(Error responses may include `error` or `detail` depending on failure type.)*

### Field Descriptions

| Field            | Type            | Description                                       |
| ---------------- | --------------- | ------------------------------------------------- |
| `club`           | number          | Club ID for booking                               |
| `booking_method` | string          | Booking channel (`courtly-website`, `phone-call`) |
| `owner_username` | string          | Name/username of the customer                     |
| `owner_contact`  | string          | Email or phone number                             |
| `payment_method` | string          | `coin`, `mobile-banking`                          |
| `slots`          | array of string | Slot IDs (player booking)                         |
| `booking_slots`  | array of string | Slot IDs (manager walk-in booking)                |

---

## 13. GET /api/booking/`{booking_id}`

### Description

Returns full booking details, including all slot information.
This endpoint replaces the need to call `/api/slots/slots-list` just for display.

**Authentication Requirement:** Required (Booking owner or Manager)

**Related Frontend:**

* Player Homepage (Upcoming Modal)
* Player Booking History (Detail Modal + PDF Receipt)
* Manager Log Page (Booking Detail Modal + PDF)

**Path Parameters:**

| Name         | Type   | Required | Description |
| ------------ | ------ | -------- | ----------- |
| `booking_id` | string | Yes      | Booking ID  |

**Query Parameters:**
None

### Response Example

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

### Field Descriptions

| Field            | Type    | Description                                        |
| ---------------- | ------- | -------------------------------------------------- |
| `created_date`   | string  | Timestamp of booking creation                      |
| `booking_id`     | string  | Booking reference ID                               |
| `owner_id`       | number  | User ID of booking owner                           |
| `owner_username` | string  | Owner username                                     |
| `owner_contact`  | string  | Owner contact (email/phone)                        |
| `booking_method` | string  | Booking channel                                    |
| `total_cost`     | number  | Total cost in CL Coins                             |
| `payment_method` | string  | `coin` or `mobile-banking`                         |
| `booking_date`   | string  | Service date                                       |
| `booking_status` | string  | `confirmed`, `cancelled`, `end_game`, `checked_in` |
| `able_to_cancel` | boolean | Whether the cancellation button should be shown    |
| `booking_slots`  | object  | Slot map keyed by `slot_id`                        |

---

## 14. POST /api/booking/`{booking_id}`/cancel

### Description

Cancels a booking.
If cancellation is before the 24-hour policy window, the system refunds CL Coins.

**Authentication Requirement:** Required (Player or Manager)

**Related Frontend:**

* Player History Page (Cancel button)
* Manager Log Page (Cancel from admin panel)

**Path Parameters:**

| Name         | Type   | Required | Description |
| ------------ | ------ | -------- | ----------- |
| `booking_id` | string | Yes      | Booking ID  |

**Query Parameters:**
None

**Request Payload:**
None

### Response Example

```json
{
  "booking_id": "BK-01D82793F7",
  "status": "cancelled",
  "refund_coins": 300,
  "message": "Booking cancelled and refund processed successfully."
}
```

### Field Descriptions

| Field          | Type   | Description       |
| -------------- | ------ | ----------------- |
| `booking_id`   | string | Booking reference |
| `status`       | string | `cancelled`       |
| `refund_coins` | number | Amount refunded   |
| `message`      | string | Summary message   |

---

## 15. POST /api/booking/`{booking_id}`/checkin

### Description

Marks a booking as “checked-in”.
All associated slots become playing/end-game according to the system logic.

**Authentication Requirement:** Required (Manager only)

**Related Frontend:**

* Manager Log Page (Check-in button)

**Path Parameters:**

| Name         | Type   | Required | Description       |
| ------------ | ------ | -------- | ----------------- |
| `booking_id` | string | Yes      | Target booking ID |

**Query Parameters:**
None

**Request Payload:**
None

### Response Example

```json
{
  "booking_id": "BK-01D82793F7",
  "status": "checked_in",
  "updated_slots": ["25188", "25189"],
  "message": "Booking checked in successfully."
}
```

### Field Descriptions

| Field           | Type   | Description       |
| --------------- | ------ | ----------------- |
| `booking_id`    | string | Target booking ID |
| `status`        | string | `checked_in`      |
| `updated_slots` | array  | Slot IDs updated  |
| `message`       | string | Operation result  |

---

## 16. GET /api/bookings/

### Description

Returns a lightweight list of **all bookings in the system**.
Used for listing before loading detailed booking info with `GET /api/booking/{booking_id}`.

**Authentication Requirement:** Required (Manager only)

**Related Frontend:**

* Manager Log → Booking Table

**Query Parameters:**
None

### Response Example

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

### Field Descriptions

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

## 17. GET /api/my-booking/

### Description

Returns a lightweight list of bookings belonging to the current authenticated player.

**Authentication Requirement:** Required (Player only)

**Related Frontend:**

* Player Booking History Page

**Query Parameters:**
None

### Response Example

*Same structure as `GET /api/bookings/`*

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

## 18. GET /api/bookings/upcoming

### Description

Returns only the **confirmed** bookings whose booking date is **≥ today** across the entire system.
Used on the manager side for monitoring upcoming sessions.

**Authentication Requirement:** Required (Manager only)

**Related Frontend:**

* Manager Dashboard (Upcoming Sessions)

**Query Parameters:**
None

### Response Example

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

### Additional Filtering Behavior

| Condition                       | Behavior |
| ------------------------------- | -------- |
| `booking_status != "confirmed"` | Excluded |
| `booking_date < today`          | Excluded |

> Response item schema is the same as `GET /api/bookings/`.

---

## 19. GET /api/my-booking/upcoming

### Description

Returns only the **confirmed** upcoming bookings for the **currently authenticated player**, where booking date is **≥ today**.
Used on the player homepage as a reminder of their next sessions.

**Authentication Requirement:** Required (Player only)

**Related Frontend:**

* Player Homepage (Upcoming Booking Modal)

**Query Parameters:**
None

### Response Example

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

### Additional Filtering Behavior

| Condition                       | Behavior |
| ------------------------------- | -------- |
| `booking_status != "confirmed"` | Excluded |
| `booking_date < today`          | Excluded |
| `owner_id != current_user_id`   | Excluded |

> Response item schema is the same as `GET /api/my-booking/`.

---


# Wallet APIs

## 20. GET /api/wallet/balance

### Description

Returns the player’s current CL Coin wallet balance, balance in THB, and number of ledger entries.
Used to show up-to-date wallet status in the user’s wallet/profile sections.

**Authentication Requirement:** Required (Player only)

**Related Frontend:**

* Player Wallet Page (Balance Panel)
* Player Booking Summary Modal (Wallet balance deduction display)

**Query Parameters:**
None

### Response Example

```json
{
  "balance_thb": "500.00",
  "coins": 500,
  "entries": 12
}
```

### Field Descriptions

| Field         | Type   | Description                                      |
| ------------- | ------ | ------------------------------------------------ |
| `balance_thb` | string | Wallet balance in THB (formatted string)         |
| `coins`       | number | Wallet balance in CL Coins                       |
| `entries`     | number | Total transaction entries recorded in the ledger |

---

## 21. GET /api/wallet/ledger

### Description

Returns the player’s wallet ledger (transaction history), sorted by newest first.
Each entry indicates money-in/money-out, including booking captures, refunds, and top-ups.

**Authentication Requirement:** Required (Player only)

**Related Frontend:**

* Player Wallet Page (Transaction History)
* Export CSV button (uses same data source)

**Query Parameters:**
None

### Response Example

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

### Field Descriptions

| Field         | Type           | Description                                           |
| ------------- | -------------- | ----------------------------------------------------- |
| `count`       | number         | Total number of records in the ledger                 |
| `results`     | array          | List of ledger entries                                |
| `id`          | number         | Ledger entry ID                                       |
| `type`        | string         | `topup`, `capture`, `refund`                          |
| `amount`      | number         | Positive (in) or negative (out) coin amount           |
| `ref_booking` | number or null | Booking reference if transaction relates to a booking |
| `created_at`  | string         | Timestamp of transaction                              |

---

## 22. GET /api/wallet/ledger/export-csv

### Description

Generates a downloadable CSV file containing the player’s full transaction history.

**Authentication Requirement:** Required (Player only)

**Related Frontend:**

* Player Wallet Page → “Export CSV” button

**Query Parameters:**
None

### Response Example

**Headers returned by backend:**

```text
Content-Type: text/csv
Content-Disposition: attachment; filename="wallet_transactions.csv"
```

**CSV file includes:**

```text
id,type,amount,ref_booking,created_at
260,topup,200,,2025-10-26T00:26:34.915094+07:00
257,capture,-100,294,2025-10-25T10:31:08.995632+07:00
```

---

## 23. POST /api/wallet/topups

### Description

Creates a new top-up request by submitting transfer information and an image slip.

**Authentication Requirement:** Required (Player only)

**Related Frontend:**

* Player Wallet → Top-up Form (Upload Slip)

**Query Parameters:**
None

### Request Payload Example

> หมายเหตุ: จริง ๆ payload จะเป็น `multipart/form-data` ที่มีไฟล์ slip

```json
{
  "amount_thb": 200,
  "transfer_date": "2025-10-26",
  "transfer_time": "14:45:00",
  "slip_path": <file image>
}
```

### Response Example

```json
{
  "id": 1,
  "amount_thb": "200.00",
  "status": "pending",
  "slip_path": "http://127.0.0.1:8001/media/slips/slip_1.png",
  "created_at": "2025-10-26T07:45:00Z"
}
```

### Field Descriptions

| Field        | Type   | Description                       |
| ------------ | ------ | --------------------------------- |
| `id`         | number | Top-up request ID                 |
| `amount_thb` | string | Requested amount in THB           |
| `status`     | string | `pending`, `approved`, `rejected` |
| `slip_path`  | string | URL to uploaded slip image        |
| `created_at` | string | Timestamp of creation             |

---

## 24. GET /api/wallet/topups

### Description

Returns a list of top-up requests with their status and slip images.

* Player: sees **only their own** requests
* Manager: sees **pending/all** requests depending on backend permission

**Authentication Requirement:** Required

**Related Frontend:**

* Player Wallet → “My Top-ups” list
* Manager Dashboard → Pending Top-up Approval List

**Query Parameters:**
None

### Response Example

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

### Field Descriptions

| Field        | Type   | Description                       |
| ------------ | ------ | --------------------------------- |
| `id`         | number | Top-up request ID                 |
| `player`     | string | Player email/username             |
| `amount_thb` | string | Amount requested                  |
| `status`     | string | `pending`, `approved`, `rejected` |
| `slip_path`  | string | Slip image URL                    |
| `created_at` | string | Creation timestamp                |

---

## 25. POST /api/wallet/topups/`{request_id}`/approve

### Description

Approves a top-up request and immediately updates the player’s coin balance.

**Authentication Requirement:** Required (Manager only)

**Related Frontend:**

* Manager Dashboard → Top-up Approval Modal

**Path Parameters:**

| Name | Type   | Required | Description       |
| ---- | ------ | -------- | ----------------- |
| `id` | number | Yes      | Top-up request ID |

**Query Parameters:**
None

**Request Payload:**
None

### Response Example

```json
{
  "detail": "Top-up approved."
}
```

---

## 26. POST /api/wallet/topups/`{request_id}`/reject

### Description

Rejects a top-up request (no balance added).

**Authentication Requirement:** Required (Manager only)

**Related Frontend:**

* Manager Dashboard → Top-up Approval Modal

**Path Parameters:**

| Name | Type   | Required | Description       |
| ---- | ------ | -------- | ----------------- |
| `id` | number | Yes      | Top-up request ID |

**Query Parameters:**
None

**Request Payload:**
None

### Response Example

```json
{
  "detail": "Top-up rejected."
}
```

