# 🏸 Courtly — Badminton Court Management & Booking System (Monorepo)
A modern, real-time badminton court booking system used by both Players & Managers.

**Courtly** is designed to replace the old system of phone calls and Facebook DMs with a self-service online platform. It supports real-time availability, multi-slot booking, wallet & top-up system, and a full manager console for daily operations.

---

## 📂 Repository Structure

```

courtly-project/
├─ frontend/   # Next.js (App Router) + Tailwind + TanStack Query
├─ backend/    # Django REST Framework + PostgreSQL
├─ docker-compose.yml  # run full stack locally
├─ docker-compose-postgres-on-cloud.yml  # run full stack with db cloud
└─ README.md   # this file

```

---

## 🎯 Background

In Thailand, most badminton courts still rely on **phone calls** or **Facebook Page DMs** for bookings.  
This causes problems such as:
- Slow back-and-forth communication
- Uncertainty about availability
- Double bookings
- Scattered proof of payment

For venue managers, this leads to **high manual workload** and **limited visibility** into demand patterns.

---

## 👥 Stakeholders

- **Players (End-users):** Want to view, and book available courts.  
- **Court Managers/Owners:** Manage schedules, pricing, availability, and payments.

---

## 🚀 Our Feature

- Month/Day availability view
- Booking slot (multi-slot selection)
- Cancellation with CL Coin refund policy
- CL Coin top-up via slip (manager approval)
- Check-in & real-time slot status updates
- Downloadable booking confirmation (PDF)


---

## 📝 User Stories (Highlights)

### For Players
- **Registration & Account (EPIC A):** Sign up, login/logout, profile.
- **Visitor Mode (EPIC V):** Month/Day slot view without login, with CTA to register.
- **Availability & Booking (EPIC B):** Multi-slot selection, booking with CL Coins, cancellation policy, booking history & PDF.
- **Wallet & CL Coins (EPIC C):** View balance, top-up via slip, auto-deduct on booking, auto-refund on cancellation.

### For Managers
- **Court & Schedule Management (EPIC M):** auto-generate slots, calendar views.
- **Check-in & Status Management (EPIC S):** Check-in by booking no./phone, slot maintenance, walk-ins, real-time status.
- **Top-up & Wallet Ops (EPIC T):** Approve/reject slips, audit logs.


---

## 🛠️ Technology Stack

**Frontend**
- Next.js (App Router)
- Tailwind CSS
- TanStack Query

**Backend**
- Django REST Framework
- PostgreSQL

**Deployment**
- DockerHub
- Digital Ocean (for all production service)
  - DO App Platform (for deploy Both Frontend and Backend)
  - DO Databases (for deploy postgreSQL)
  - DO Space Object Storage (for store slip images)

<img width="2143" height="1133" alt="image" src="https://github.com/user-attachments/assets/aefe8e22-c20f-438b-952a-d2391464d814" />


---

## ⚡ Getting Started

### 1. Clone repo
```bash
git clone https://github.com/Courtly-Badminton-Court-Managment/courtly-project
````


### 2. Environment Setup

#### 🌥️ Option A: Run with Cloud Database PostgresSQL

1. Request the `.env` file and connection details from the team.
2. Create a `.env` file at the project root using the structure in `.env.example.docker-compose-postgres-on-cloud`. for connect cloud db
3. Create another `.env` file at the backend folder for cloud image storage space credentials.
 

3. Start the project:

   ```bash
   docker compose -f docker-compose-postgres-on-cloud.yml up --build
   ```
4. Open **pgAdmin** at [http://localhost:5050](http://localhost:5050), then:

   * Add a new server
   * Fill in the connection details (host, port, username, password, database)
   * Save

> **Note:** The `.env` file and server credentials are private and must be requested from the team (last page of private documentation: **_senior.pdf_**).



#### 🖥️ Option B: Run Locally (for testing)

1. Create a `.env` file at the project root by copying: ` .env.example`. We've included a pre-configured template for local testing. You just need to copy it to a `.env` file.

   ```bash
   cp .env.local.example .env
   ```

   > **Note:** The `.env` file comes with default database credentials that match our `docker-compose.yml`.
   >
   >   * **Image Uploads:** If you want to test uploading profile/slip images, you'll need to add your DigitalOcean Spaces keys.
   >   * **No Keys?** No problem. You can leave them blank; the app will run fine, but image uploads will just fail gracefully.


2. Spin up the containers

   Run the following to build and start the Frontend, Backend, Database, and Scheduler.

   ```bash
   docker compose -f docker-compose.local.yml up -d --build
   ```

    *Give it about 10-15 seconds for the Database to fully initialize.*


3. Populate Demo Data (Important\!)

    Since you're starting with a fresh database, the app will be empty. We wrote a helper script to set up a test club ("Courtly Arena") with 6 courts and **automatically generate booking slots for the next 7 days**.

   Run this once the containers are up:

   ```bash
   chmod +x generate_weekly_slots.sh
   ./generate_weekly_slots.sh
   ```




### 3. Local URLs (when running)

* **Frontend (Next.js)** → [http://localhost:3001](http://localhost:3001)
* **Backend (Django REST)** → [http://localhost:8001](http://localhost:8001)
* **pgAdmin** → [http://localhost:5050](http://localhost:5050)

---

## 🌥️ Public Deployment

Courtly is fully deployed and ready to use.

| Service                | URL                                                                |
| ---------------------- | ------------------------------------------------------------------ |
| **Frontend (Web App)** | [https://courtlyeasy.app](https://courtlyeasy.app)                 |
| **Backend API**        | [https://backend.courtlyeasy.app](https://backend.courtlyeasy.app) |


## 📖 Documentation

* Project Documentation: [Project Proposal](https://docs.google.com/document/d/1GTUfvFuz0-BakMo8qoCyeXMFQkgDXW2m0fMjVoUGdTc/edit?usp=sharing)
* Jira Board: [Courtly Jira](https://courtly-project.atlassian.net/jira/software/projects/COURTLY/boards/1)
* GitHub Org: [Courtly-Badminton-Court-Managment](https://github.com/Courtly-Badminton-Court-Management)
* 🎥 Presentation Video: [Presentation Video on Youtube](https://www.youtube.com/playlist?list=PLy2euUO-1ED_5BwWGAM6IQy1v_EnQUnwQ)

---

## 👥 Our Team Members
* **Kat** — Katharina Viik (6810041788)
`Backend  Developer and Tester`

* **Grace** — Nichakorn Chanajitpairee (6410545452)
`UX/UI Designer & Frontend  Developer`


* **Cream** — Parichaya Yangsiri (6410545517)
`Main Backend  Developer`

* **Proud** — Ratchaprapa Chattrakulrak (6410545576)
`PM/PO & Main Frontend Developer`


---

## 📬 Contact

* Email: [courtly.project@gmail.com](mailto:courtly.project@gmail.com)
* GitHub: [Courtly Organization](https://github.com/Courtly-Badminton-Court-Management)

---

