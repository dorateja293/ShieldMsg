# Deployment Guide

## Frontend: Vercel

1. Set root directory to `frontend`.
2. Build command: `npm run build`.
3. Output directory: `dist`.
4. Add environment variables:
   - `VITE_API_URL` — your Render **HTTPS** API host, with or without `/api` (e.g. `https://your-api.onrender.com` or `https://your-api.onrender.com/api`). The build normalizes a missing `/api` suffix.
   - `VITE_SOCKET_URL` — same host **without** `/api` (e.g. `https://your-api.onrender.com`). Optional if you only set `VITE_API_URL`; the client derives the socket URL from it.

**Important:** Vite bakes `VITE_*` variables in at **build** time. After changing them in Vercel, trigger a **new deployment** (rebuild).

## Backend: Render or AWS

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

## Troubleshooting: login or API fails after deploy

1. **Wrong API URL** — Open the browser devtools **Network** tab on login. The request should go to `https://<your-backend>/api/auth/login`. If you see `localhost:5000` or a wrong host, fix `VITE_API_URL` on Vercel and **redeploy**.
2. **CORS** — If the console shows a CORS error, on Render set `CLIENT_URL` to the **exact** frontend origin: `https://your-app.vercel.app` (no `/login`). Use `www` vs non-`www` consistently. For Preview deployments, add each preview origin to `CLIENT_URL` or comma-separate them with Production.
3. **HTTPS only** — The Vercel app is HTTPS; `VITE_API_URL` must use `https://` for your Render URL, not `http://`.
4. **MongoDB** — If Atlas IP allowlist or `MONGODB_URI` is wrong, the server may still boot but login can return 500. Check Render **Logs** for Mongo errors.
5. **Render sleep** — The first request after idle can take 30–60s; wait and retry once.

## Security API Keys

The app runs without external API keys using local heuristics. For production-grade detection, configure:

- `VIRUSTOTAL_API_KEY`
- `GOOGLE_SAFE_BROWSING_API_KEY`
