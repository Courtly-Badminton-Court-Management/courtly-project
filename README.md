# 🏸 Courtly — Badminton Court Management & Booking System (Monorepo)

Courtly is a **Badminton Court Management and Booking System** designed to modernize the way players in Thailand book courts.  
This repo is structured as a **monorepo**, containing both the **frontend** (Next.js) and **backend** (Django REST API).  

---

## 📂 Repository Structure

```

courtly-project/
├─ frontend/   # Next.js (App Router) + Tailwind + TanStack Query
├─ backend/    # Django REST Framework + PostgreSQL
├─ docker-compose.yml  # optional: run full stack locally (not exist)
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

For venue managers, this leads to **high manual workload** and **limited visibility** into demand patterns:contentReference[oaicite:0]{index=0}.

---

## 👥 Stakeholders

- **Players (End-users):** Want to view, and book available courts.  
- **Court Managers/Owners:** Manage schedules, pricing, availability, and payments:contentReference[oaicite:1]{index=1}.

---

## 🚀 MVP Scope (Single Club)

- Month/Day availability view
- Booking slot (multi-slot selection)
- Cancellation with CL Coin refund policy
- CL Coin top-up via slip (manager approval)
- Check-in & real-time slot status updates
- Downloadable booking confirmation (PDF)
- Manager console for schedules, closures, maintenance, walk-ins, top-up approvals, and slip logs

---

## 📝 User Stories (Highlights)

### For Players
- **Registration & Account (EPIC A):** Sign up, email verification, login/logout, forgot password, profile:contentReference[oaicite:3]{index=3}.
- **Visitor Mode (EPIC V):** Month/Day slot view without login, with CTA to register:contentReference[oaicite:4]{index=4}.
- **Availability & Booking (EPIC B):** Multi-slot selection, booking with CL Coins, cancellation policy, booking history & PDF:contentReference[oaicite:5]{index=5}.
- **Wallet & CL Coins (EPIC C):** View balance, top-up via slip, auto-deduct on booking, auto-refund on cancellation:contentReference[oaicite:6]{index=6}.

### For Managers
- **Court & Schedule Management (EPIC M):** Opening hours, closures, auto-generate slots, calendar views:contentReference[oaicite:7]{index=7}.
- **Check-in & Status Management (EPIC S):** Check-in by booking no./phone, slot maintenance, walk-ins, real-time status:contentReference[oaicite:8]{index=8}.
- **Top-up & Wallet Ops (EPIC T):** Approve/reject slips, audit logs:contentReference[oaicite:9]{index=9}.
- **Pricing & Promotions (EPIC P, optional):** Price rules, happy hours, discount codes:contentReference[oaicite:10]{index=10}.
- **Reports & Analytics (EPIC N, optional):** Booking dashboards, heatmaps, coin reports:contentReference[oaicite:11]{index=11}.

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
- DigitalOcean

---

## ⚡ Getting Started

### 1. Clone repo
```bash
git clone https://github.com/Courtly-Badminton-Court-Managment/courtly-project
````


### 2. Environment Setup

#### Option A: Run with Cloud Postgres (DigitalOcean)

1. Request the `.env` file and connection details from the team.
2. Create a `.env` file at the project root using the structure in `.env.example.docker-compose-postgres-on-cloud`
3. Start the project:

   ```bash
   docker compose -f docker-compose-postgres-on-cloud.yml up --build
   ```
4. Open **pgAdmin** at [http://localhost:5050](http://localhost:5050), then:

   * Add a new server
   * Fill in the connection details (host, port, username, password, database)
   * Save

⚠️ **Note:** The real `.env` file and server credentials are private and must be requested from the team.

---

#### Option B: Run Locally (for testing)

1. Create a `.env` file at the project root by copying: ` .env.example`

2. Update the database settings in `backend/courtly/settings.py`

   Example local database config:

   ```python
    DATABASES = {
        "default": dj_database_url.parse(database_url, conn_max_age=60),
        }
   ```
3. Start the project:

   ```bash
   docker compose up --build
   ```



### 3. Local URLs (when running)

* **Frontend (Next.js)** → [http://localhost:3001](http://localhost:3001)
* **Backend (Django REST)** → [http://localhost:8001](http://localhost:8001)
* **pgAdmin** → [http://localhost:5050](http://localhost:5050)

---
## 📖 Documentation

* Project Proposal: [Project Proposal PDF](https://drive.google.com/file/d/12xOk2idmqJrXaWnmxFgaFw4w6hojjo8z/view?usp=sharing)
* Jira Board: [Courtly Jira](https://courtly-badminton.atlassian.net/jira/software/projects/SCRUM/boards/1)
* GitHub Org: [Courtly-Badminton-Court-Managment](https://github.com/Courtly-Badminton-Court-Management)
* 🎥 Presentation Video: [Presentation Video on Youtube](https://www.youtube.com/playlist?list=PLy2euUO-1ED_5BwWGAM6IQy1v_EnQUnwQ)

---

## 👥 Our Team Members

* **Grace** — Nichakorn Chanajitpairee (6410545452)
* **Cream** — Parichaya Yangsiri (6410545517)
* **Proud** — Ratchaprapa Chattrakulrak (6410545576)
* **Kat** — Katharina Viik (6810041788)

---

## 📬 Contact

* Email: [courtly.project@gmail.com](mailto:courtly.project@gmail.com)
* GitHub: [Courtly Organization](https://github.com/Courtly-Badminton-Court-Management)

---

