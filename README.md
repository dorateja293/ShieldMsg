# SentinelChat (ShieldMsg)

**SentinelChat** is a full-stack MERN application that combines WhatsApp-style direct messaging with a social feed, friend graph, and a security layer that scores links and file attachments before users open them. The repository is published as [ShieldMsg on GitHub](https://github.com/dorateja293/ShieldMsg).

---

## Highlights

- **Authentication** — JWT access, bcrypt password hashing, protected routes.
- **Real-time chat** — Socket.IO one-to-one threads, typing indicators, read receipts, optional attachments.
- **Threat awareness** — URL extraction, heuristics, optional VirusTotal / Google Safe Browsing integration; file metadata and verdicts surfaced in the UI.
- **Social surface** — Profiles, friend requests, notifications, and a home feed.
- **Operations** — Structured API errors, health endpoint, rate limiting, Helmet, and deployment notes for Vercel + Render + MongoDB Atlas.

---

## Tech Stack

| Layer | Technologies |
|--------|----------------|
| **Frontend** | React 19, Vite, Tailwind CSS v4, React Router, Axios, Socket.IO client |
| **Backend** | Node.js, Express 5, Socket.IO, Mongoose, Multer, Zod, cookie-parser |
| **Data** | MongoDB (Atlas or self-hosted) |
| **Tooling** | npm workspaces, Vitest, Docker Compose (optional local MongoDB) |

---

## Repository Layout

```text
ShieldMsg/
├── frontend/          # Vite + React SPA
├── backend/           # Express API + Socket.IO server
├── docs/              # Architecture, API, deployment
├── docker-compose.yml # Optional local MongoDB
└── package.json       # Workspace scripts (dev, build, test)
```

---

## Prerequisites

- **Node.js** 20+ (LTS recommended)
- **npm** 10+
- **MongoDB** — connection string ready (Atlas or local)

---

## Quick Start (Local)

From the repository root:

```bash
npm install
```

**1. Environment files**

Copy the examples and edit values (especially `JWT_SECRET` and `MONGODB_URI`):

```bash
# macOS / Linux / Git Bash
cp backend/.env.example backend/.env
cp frontend/.env.example frontend/.env
```

```powershell
# Windows PowerShell
Copy-Item backend\.env.example backend\.env
Copy-Item frontend\.env.example frontend\.env
```

**2. MongoDB**

- **Docker (optional):** `docker compose up -d` then set `MONGODB_URI=mongodb://127.0.0.1:27017/sentinelchat` in `backend/.env`.
- **Windows native MongoDB:** prefer `mongodb://127.0.0.1:27017/sentinelchat` instead of `localhost` if you see connection issues.

**3. Run both apps**

```bash
npm run dev
```

| Service | URL |
|---------|-----|
| Frontend (Vite) | [http://localhost:5173](http://localhost:5173) |
| Backend API | [http://localhost:5000](http://localhost:5000) |
| Health check | [http://localhost:5000/api/health](http://localhost:5000/api/health) |

---

## NPM Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Runs frontend and backend in parallel (watch mode). |
| `npm run build` | Builds all workspaces that define a `build` script. |
| `npm run test` | Runs Vitest in each workspace. |
| `npm start` | Starts the backend only (`node server.js`) — suitable for production process managers. |

Workspace-specific scripts live in `frontend/package.json` and `backend/package.json`.

---

## Environment Variables

### Backend (`backend/.env`)

| Variable | Purpose |
|----------|---------|
| `MONGODB_URI` | MongoDB connection string (**required**). |
| `JWT_SECRET` | Signing secret; must be at least 16 characters. |
| `JWT_EXPIRES_IN` | Token lifetime (default `7d`). |
| `PORT` | HTTP port (Render and other hosts often inject this). |
| `CLIENT_URL` | Allowed browser origin(s) for CORS and Socket.IO. Use a **comma-separated** list for local + Vercel (no spaces). Example: `http://localhost:5173,https://your-app.vercel.app`. |
| `VIRUSTOTAL_API_KEY` / `GOOGLE_SAFE_BROWSING_API_KEY` | Optional external scanners. |
| `MAX_FILE_SIZE_MB` | Upload cap (default `25`). |

### Frontend (`frontend/.env`)

| Variable | Purpose |
|----------|---------|
| `VITE_API_URL` | REST base URL, must end with `/api` (e.g. `http://localhost:5000/api`). |
| `VITE_SOCKET_URL` | Socket.IO origin **without** `/api` (e.g. `http://localhost:5000`). |

Never commit real `.env` files. This repository ignores them via `.gitignore`.

---

## Deployment

Production deployment is documented step by step in **[docs/DEPLOYMENT.md](docs/DEPLOYMENT.md)** (Vercel for the SPA, Render or similar for Node, MongoDB Atlas for data).

Summary:

1. Provision **MongoDB Atlas** and set `MONGODB_URI` on the host.
2. Deploy **backend** with `npm start`, set secrets and `CLIENT_URL` to your **exact** frontend origin (scheme + host, no path).
3. Deploy **frontend** with `npm run build`, set `VITE_API_URL` and `VITE_SOCKET_URL` to your public API host.

Additional design and endpoint detail: [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md) · [docs/API.md](docs/API.md).

---

## Security Notes

- Rotate `JWT_SECRET` for every environment; use long random values.
- Restrict Atlas IP access in production; avoid `0.0.0.0/0` unless you understand the tradeoff.
- Uploaded files on ephemeral hosts (e.g. free Render) are lost on restarts unless you add persistent disk or object storage—see the deployment guide.

---

## One-line summary

Full-stack MERN app with JWT authentication, Socket.IO messaging, MongoDB persistence, secure uploads, automated link and file threat scoring, and an admin security dashboard.

---

## Contributing

Issues and pull requests are welcome against [dorateja293/ShieldMsg](https://github.com/dorateja293/ShieldMsg). Please keep changes focused, run `npm run test` before submitting, and avoid committing secrets or local `uploads/` data.

---

## Acknowledgment

SentinelChat is built as a learning and portfolio MERN project demonstrating secure messaging patterns, real-time collaboration, and defensive UX around potentially unsafe content.
