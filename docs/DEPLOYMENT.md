# Deployment Guide

## Frontend: Vercel

1. Set root directory to `frontend`.
2. Build command: `npm run build`.
3. Output directory: `dist`.
4. Add environment variables:
   - `VITE_API_URL=https://your-api.example.com/api`
   - `VITE_SOCKET_URL=https://your-api.example.com`

## Backend: Render Or AWS

1. Set root directory to `backend`.
2. Start command: `npm start`.
3. Add environment variables from `backend/.env.example`.
4. Configure persistent disk or object storage for uploaded files in production.
5. Set `CLIENT_URL` to the deployed Vercel **origin** (e.g. `https://your-app.vercel.app`, not a path like `/login`). For local dev hitting production API, use a comma-separated list: `http://localhost:5173,https://your-app.vercel.app` (no spaces).

## Database: MongoDB Atlas

1. Create an Atlas cluster.
2. Create a database user.
3. Add the backend host to the network access list.
4. Set `MONGODB_URI` in the backend environment.

## Security API Keys

The app runs without external API keys using local heuristics. For production-grade detection, configure:

- `VIRUSTOTAL_API_KEY`
- `GOOGLE_SAFE_BROWSING_API_KEY`
