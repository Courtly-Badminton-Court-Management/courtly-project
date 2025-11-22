
# 🏸 Courtly — Badminton Court Management System

Welcome to **Courtly**. We built this project to modernize how badminton courts are booked in Thailand. The goal was to replace the old-school method of phone calls and Facebook DMs with a real-time, self-service web app.

This is a **monorepo** that houses our entire stack:

  * **Frontend:** Next.js (App Router), Tailwind, TanStack Query
  * **Backend:** Django REST Framework, PostgreSQL
  * **DevOps:** Docker Compose for easy local development

-----

## ⚡️ Getting Started (Local Dev)

We’ve containerized everything, so you don't need to install Python or Node locally to run the app. You just need **Docker** and **Git**.

### 1\. Clone the repo

```bash
git clone https://github.com/Courtly-Badminton-Court-Managment/courtly-project
cd courtly-project
```

### 2\. Set up your environment

We've included a pre-configured template for local testing. You just need to copy it to a `.env` file.

```bash
cp .env.local.example .env
```

> **Note:** The `.env` file comes with default database credentials that match our `docker-compose.yml`.
>
>   * **Image Uploads:** If you want to test uploading profile/slip images, you'll need to add your DigitalOcean Spaces keys.
>   * **No Keys?** No problem. You can leave them blank; the app will run fine, but image uploads will just fail gracefully.

### 3\. Spin up the containers

Run the following to build and start the Frontend, Backend, Database, and Scheduler.

```bash
docker compose up -d --build
```

*Give it about 10-15 seconds for the Database to fully initialize.*

### 4\. Populate Demo Data (Important\!)

Since you're starting with a fresh database, the app will be empty. We wrote a helper script to set up a test club ("Courtly Arena") with 6 courts and **automatically generate booking slots for the next 7 days**.

Run this once the containers are up:

```bash
chmod +x generate_weekly_slots.sh
./generate_weekly_slots.sh
```

-----

## 🌐 Where to access the app

Once everything is running, here are the local URLs:

| Service | URL | Description |
| :--- | :--- | :--- |
| **Frontend** | [http://localhost:3001](https://www.google.com/search?q=http://localhost:3001) | Main app for Players & Managers |
| **Backend API** | [http://localhost:8001](https://www.google.com/search?q=http://localhost:8001) | API Root |
| **Admin Panel** | [http://localhost:8001/admin](https://www.google.com/search?q=http://localhost:8001/admin) | Django Admin (Superuser control) |

-----

## 📂 Project Structure

Here is a quick overview of how we organized the code:

```text
courtly-project/
├── backend/                  # Django API
│   ├── booking/              # Booking logic & management commands
│   ├── core/                 # User auth & Club models
│   ├── wallet/               # CL Coin & Transaction logic
│   └── Dockerfile
├── frontend/                 # Next.js Application
│   ├── src/app/              # App Router pages (Manager/Player/Visitor)
│   └── Dockerfile
├── docker-compose.yml        # Orchestration for local dev
├── generate_weekly_slots.sh  # Script to populate dummy data
└── README.md
```

-----

## 🛠️ The Stack

We chose these technologies to balance performance and developer experience:

  * **Frontend:** Next.js 14, TypeScript, Tailwind CSS, TanStack Query (for state management).
  * **Backend:** Python 3.12, Django 5, DRF.
  * **Database:** PostgreSQL 16.
  * **Deployment:** Docker, DigitalOcean (App Platform & Spaces).

-----

## 🎯 What can it do?

**For Players:**

  * Check real-time court availability (Month/Day views).
  * Book multiple slots in one go.
  * Top-up "CL Coins" via bank slip transfer.
  * View booking history and download receipts as PDFs.

**For Managers:**

  * Dashboard view of daily bookings and revenue.
  * Control slots (Auto-generate, close for maintenance, handle walk-ins).
  * Approve or reject top-up requests.
  * QR Code check-in system.

-----

## 👥 The Team

This project was developed by:

  * **Grace** — Nichakorn Chanajitpairee
  * **Cream** — Parichaya Yangsiri
  * **Proud** — Ratchaprapa Chattrakulrak
  * **Kat** — Katharina Viik

**Links:**

  * [GitHub Organization](https://github.com/Courtly-Badminton-Court-Management)
  * [Jira Board](https://courtly-project.atlassian.net/jira/software/projects/COURTLY/boards/1)
  * [Presentation Video](https://www.youtube.com/playlist?list=PLy2euUO-1ED_5BwWGAM6IQy1v_EnQUnwQ)

Questions? Reach us at [courtly.project@gmail.com](mailto:courtly.project@gmail.com).