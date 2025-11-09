

# **Courtly API Documentation**

### Badminton Court Management and Booking System

**Base URL:**

```
https://backend.courtlyeasy.app/
```

---

## **1. GET /available-slots/?club=`<club_id>` &month=`<YYYY-MM>`**

**Authentication:** Not required
**Used by:** Player
**Frontend page:** Player Homepage (calendar and available panel), Manager Dashboard

### **Description**

This endpoint provides monthly court availability for a given club.
Each day in the response includes the percentage of available slots and a sample list of available slot details.

### **Query Parameters**

| Parameter | Type    | Required | Description                                     |
| --------- | ------- | -------- | ----------------------------------------------- |
| `club`    | integer | Yes      | Club ID                                         |
| `month`   | string  | Yes      | Month in the format `YYYY-MM` (e.g., `2025-10`) |

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

| Field               | Type              | Description                                     |
| ------------------- | ----------------- | ----------------------------------------------- |
| `available_percent` | number            | The ratio of available slots (0–1) for that day |
| `available_slots`   | array of SlotItem | Example available slots for the day             |
| `date`              | string            | Date in the format `DD-MM-YY`                   |

---

## **2. GET api/slots/`<slot_id>`/**

**Authentication:** Required
**Used by:** Player, Manager
**Frontend page:** Player History, Manager Log

### **Description**

Retrieves details of a specific slot, including time, court, price, and booking status.

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

| Field                     | Type           | Description                                                          |
| ------------------------- | -------------- | -------------------------------------------------------------------- |
| `slot_status`             | string         | Slot status (`available`, `booked`, `end_game`, `maintenance`, etc.) |
| `service_date`            | string         | Date of the slot (YYYY-MM-DD)                                        |
| `start_time` / `end_time` | string         | Start and end times of the slot                                      |
| `court`                   | integer        | Court number                                                         |
| `court_name`              | string         | Court name                                                           |
| `price_coin`              | number         | Price per slot (1 coin = 1 THB)                                      |
| `booking_id`              | string or null | Booking ID if already booked, otherwise `null`                       |

---

## **3. GET /slots/slots-list/** *(optional)*

**Authentication:** Required
**Used by:** Player, Manager
**Frontend page:** Player Homepage (upcoming modal), Player History (view detail modal and PDF), Manager Log (view detail modal and PDF)

### **Description**

Retrieves detailed information for multiple slots specified by their IDs.
This endpoint remains optional since the updated booking endpoint now embeds slot details directly.

### **Request Example**

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

### **Usage Purpose**

Used only when slot details must be retrieved in bulk, typically for confirmation modals or older booking versions.

---

## **4. GET api/booking/`<booking_id>`/**

**Authentication:** Required (Manager or Booking Owner)
**Used by:** Manager, Player
**Frontend page:**

* Player Homepage (upcoming modal)
* Player History (view detail modal and PDF)
* Manager Log (view detail modal and PDF)

### **Description**

Retrieves complete booking information, including detailed data for each slot.
The `booking_slots` object includes each slot’s details, removing the need for a separate `/slots/slots-list/` call.

### **Response Example**

```json
{
  "created_date": "2025-10-19 16:42",
  "booking_id": "BK-01D82793F7",
  "owner_id": 1,
  "owner_username": "test2",
  "booking_method": "Courtly Website",
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
    },
    "25189": {
      "slot_status": "booked",
      "service_date": "2025-10-25",
      "start_time": "17:30",
      "end_time": "18:00",
      "court": 3,
      "court_name": "Court 3",
      "price_coin": 100,
    }
  }
}
```

### **Field Descriptions**

| Field            | Type    | Description                                         |
| ---------------- | ------- | --------------------------------------------------- |
| `created_date`   | string  | Date and time when the booking was created          |
| `booking_id`     | string  | Unique booking identifier                           |
| `owner_id`       | integer | User ID of the booking owner                        |
| `owner_username` | string  | Username of the booking owner                       |
| `booking_method` | string  | Booking channel (e.g., Courtly Website, Phone Call) |
| `owner_contact`  | string  | Contact information (email or phone)                |
| `total_cost`     | number  | Total cost in CL Coins                              |
| `payment_method` | string  | Payment method used                                 |
| `booking_date`   | string  | Date of the booked session                          |
| `booking_status` | string  | Current booking status                              |
| `able_to_cancel` | boolean | Indicates if cancellation is allowed (24-hour rule) |
| `booking_slots`  | object  | Dictionary of slot objects, keyed by slot ID        |

---

## **5. GET api/auth/me/`<user_id>`/**

**Authentication:** Required
**Used by:** Player, Manager
**Frontend page:** User Profile Page, Manager Check-in Page

### **Description**

Returns the profile information of the authenticated user.

### **Response Example**

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

## **6. POST api/booking/**

**Authentication:** Required
**Used by:** Player, Manager
**Frontend page:** Booking Summary Modal (Player), Manager Booking Control (Walk-in form)

### **Description**

Creates a new booking using the specified slot IDs. The system verifies slot availability and automatically calculates total cost.

### **Request Example – Player Side**

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

### **Request Example – Manager Side**

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

### **Response Example**

```json
{
  "booking_id": "BK-01D82793F7",
  "message": "Booking created successfully",
  "total_cost": 300,
  "status": "confirmed"
}
```

### **Behavior Notes**

* The system calculates the total cost automatically based on selected slots.
* If the user’s wallet balance is insufficient, an `"Insufficient balance"` error is returned.
* Upon success, coins are automatically deducted from the user’s wallet.

---

## **7. GET /bookings/** and **GET /my-bookings/**

**Authentication:** Required
**Used by:** Manager, Player
**Frontend page:**

* Manager Dashboard (All Bookings Overview)
* Player Booking History Page

### **Description**

Fetches booking records depending on user role.

* Managers receive all bookings in the system.
* Players receive only their own bookings.

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
  },
  {
    "booking_id": "BK-01D82793F8",
    "created_date": "2025-10-20 13:21",
    "total_cost": 200,
    "booking_date": "2025-10-26",
    "booking_status": "cancelled",
    "able_to_cancel": false,
    "owner_id": 38
  }
]
```

### **Purpose**

Displays booking records and their statuses on player and manager interfaces.
Common statuses include: `booked`, `cancelled`, `end_game`, `checked_in`.

---

## **8. Data Model Definitions**

### **SlotItem**

```ts
{
  slot_status: "available" | "booked" | "maintenance" | "end_game" | "walk_in",
  service_date: string,
  start_time: string,
  end_time: string,
  court: number,
  court_name: string,
  price_coin: number,
  booking_id?: string | null
}
```

### **BookingRow**

```ts
{
  created_date: string,
  booking_id: string,
  owner_id: number,
  owner_username: string,
  total_cost: number,
  booking_date: string,
  booking_status: string,
  able_to_cancel: boolean,
  booking_slots: Record<string, SlotItem>
}
```

---

## **9. System Policies**

| Policy                  | Description                                                                                                                                             |
| ----------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Cancellation Policy** | Users can cancel a booking at least 24 hours before the scheduled time to receive a full CL Coin refund.                                                |
| **CL Coin Wallet**      | Internal payment currency used for all bookings (1 coin = 1 THB). Automatically deducted or refunded according to booking actions.                      |
| **Slot Generation**     | The system automatically generates 30-minute slots for each court based on configured opening hours.                                                    |
| **Access Control**      | Guests have read-only access to the month view. Players can make bookings and manage their wallet. Managers can approve, cancel, and check in bookings. |
| **Booking Receipt**     | Each confirmed booking can be exported as a downloadable PDF receipt.                                                                                   |

---

## **10. Summary of Usage**

| User Role   | Relevant Endpoints                          | Primary Functions                                          |
| ----------- | ------------------------------------------- | ---------------------------------------------------------- |
| **Guest**   | `/available-slots/`, `/slots/<id>/`         | View availability and slot details                         |
| **Player**  | `/booking/`, `/my-bookings/`, `/me/`        | Book courts, view booking history, manage wallet           |
| **Manager** | `/bookings/`, `/booking/<id>/`, `/me/<id>/` | Manage all bookings, perform check-in, review user details |

---

Would you like me to now extend this documentation with **Wallet & Top-up APIs** (for CL Coin system) and **Manager Control APIs** (check-in, maintenance, walk-in booking) — written in the same formal structure and formatting as above?
