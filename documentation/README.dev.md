# Courtly Project – Development Guide

Getting the Courtly project running locally is pretty straightforward with Docker Compose. Here's everything you need to know.

## Getting Started

First, grab the code:

```bash
git clone git@github.com:Courtly-Badminton-Court-Management/courtly-project.git
cd courtly-project
```

## Running Everything

Fire up all the services:

```bash
docker compose up -d
```

When you're done:

```bash
docker compose down
```

If you've changed a Dockerfile or added dependencies, rebuild:

```bash
docker compose build
```

## What's Running

**Database (Postgres)**
- Postgres 16 running on port 5432
- Your data sticks around in the `courtly_pgdata` volume

**Backend (Django)**
- Django dev server on port 8001 (maps to 8000 inside the container)
- Your code changes reload automatically thanks to the mounted `./backend` folder
- Waits for the database to be ready before starting

**Frontend (Next.js)**
- Next.js dev server on port 3001 (maps to 3000 inside)
- Live reloading works with the mounted `./frontend` folder
- Dependencies live in their own volume so your local folder stays clean

**pgAdmin**
- Database management UI at http://localhost:5050
- Login details come from your `.env` file

## How the File System Works

We use two types of mounts:

**Your code** (syncs with the container):
- `./backend` → Django code
- `./frontend` → Next.js code

**Container-only stuff** (stays isolated):
- `courtly_pgdata` → Database files
- `frontend_node_modules` → npm packages
- `pgadmin_data` → pgAdmin configuration

This way your code changes immediately, but you don't get weird cross-platform dependency issues.

## Adding New Packages

### Frontend Dependencies

Install it locally first (helps with VS Code autocomplete):

```bash
cd frontend
npm install <package-name>
```

Then refresh the container's dependencies:

```bash
docker compose down -v frontend
docker compose up -d frontend
```

This rebuilds the container's `node_modules` with Linux-compatible versions while keeping your editor happy.

### Backend Dependencies

Add the package to `backend/requirements.txt`, then:

```bash
docker compose build backend
docker compose up -d backend
```

The new package gets installed when the image rebuilds.

## Accessing Everything

- **Frontend**: http://localhost:3001
- **Backend API**: http://localhost:8001  
- **Database Admin**: http://localhost:5050

## Troubleshooting

Check what's happening in the logs:

```bash
docker compose logs -f backend
docker compose logs -f frontend
```

Nuclear option (removes everything including your database):

```bash
docker compose down -v
```

---

That's it! You get hot reloading for both frontend and backend, your database persists between restarts, and everything stays nicely organized.