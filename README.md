# SentinelChat

SentinelChat is an AI-powered secure social media and real-time messaging platform with automatic threat detection for links and files.

It combines a modern WhatsApp Web and Discord-style interface with a cybersecurity engine that scans message links, uploaded files, and social posts before users interact with them.

## Features

- JWT authentication with bcrypt password hashing.
- User profiles, friend requests, notifications, home feed, and real-time chat.
- One-to-one messaging over Socket.io with typing indicators, timestamps, and read metadata.
- Secure upload pipeline for images, PDFs, APKs, ZIP files, and DOCX files.
- Automatic URL extraction and scanning.
- File hashing with SHA-256 and malware lookup support.
- AI-style phishing detection for suspicious domains, URL entropy, subdomain abuse, and social-engineering keywords.
- Threat labels: safe, suspicious, dangerous.
- Dangerous content hiding, disabled downloads, and warning confirmations.
- Admin security dashboard with threat analytics and charts.

## Tech Stack

Frontend:

- React.js
- TailwindCSS
- React Router
- Axios
- Socket.io-client

Backend:

- Node.js
- Express.js
- Socket.io
- JWT Authentication
- bcrypt
- Multer

Database:

- MongoDB with Mongoose

Security APIs:

- VirusTotal API
- Google Safe Browsing API

## Project Structure

```text
sentinelchat/
  frontend/
    src/
      components/
      pages/
      context/
      hooks/
      services/
      layouts/
      utils/
      App.js
  backend/
    controllers/
    routes/
    models/
    middleware/
    services/
    sockets/
    utils/
    config/
    server.js
  docs/
  README.md
```

## Getting Started

```bash
npm install
docker compose up -d
copy backend\\.env.example backend\\.env
copy frontend\\.env.example frontend\\.env
npm run dev
```

Frontend: `http://localhost:5173`
Backend: `http://localhost:5000`

For local MongoDB on Windows, prefer `mongodb://127.0.0.1:27017/sentinelchat` in `backend/.env`.

## Scripts

```bash
npm run dev
npm run build
npm run test
```

## Documentation

- [Architecture](docs/ARCHITECTURE.md)
- [API](docs/API.md)
- [Deployment](docs/DEPLOYMENT.md)

## Resume Summary

Built SentinelChat, a MERN-based secure social media and real-time messaging platform with JWT authentication, Socket.io messaging, MongoDB persistence, secure file uploads, automated link/file threat detection, and an admin cybersecurity analytics dashboard.
