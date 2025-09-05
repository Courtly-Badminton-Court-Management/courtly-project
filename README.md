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
- Google Cloud or Heroku:contentReference[oaicite:12]{index=12}

---

## ⚡ Getting Started

### 1. Clone repo
```bash
git clone https://github.com/Courtly-Badminton-Court-Managment/courtly-project
cd courtly-project
````

---

### 2. Run Frontend

```bash
cd frontend
npm install     # or npm ci
npm run dev
```

👉 Default: `http://localhost:3000`

---

### 3. Run Backend

```bash
cd backend
python -m venv .venv
.\.venv\Scripts\Activate.ps1   # Windows PowerShell
pip install -r requirements.txt
python manage.py migrate
python manage.py runserver
```

👉 Default: `http://localhost:8000`

---

### 4. Run with Docker (optional)

```bash
docker-compose up --build
```

This will start:

* Backend on `localhost:8000`
* Frontend on `localhost:3000`

---

## 📖 Documentation

* Project Proposal: [Project Proposal PDF](https://drive.google.com/file/d/12xOk2idmqJrXaWnmxFgaFw4w6hojjo8z/view?usp=sharing)
* Jira Board: [Courtly Jira](https://courtly-badminton.atlassian.net/jira/software/projects/SCRUM/boards/1)
* GitHub Org: [Courtly-Badminton-Court-Managment](https://github.com/Courtly-Badminton-Court-Managment)

---

## 👥 Our Team

* **Grace** — Nichakorn Chanajitpairee (6410545452)
* **Cream** — Parichaya Yangsiri (6410545517)
* **Proud** — Ratchaprapa Chattrakulrak (6410545576)
* **Kat** — Katharina Viik (6810041788)

---

## 📬 Contact

* Email: [courtly.project@gmail.com](mailto:courtly.project@gmail.com)
* GitHub: [Courtly Organization](https://github.com/Courtly-Badminton-Court-Managment)

---


