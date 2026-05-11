# SentinelChat Architecture

SentinelChat is a MERN social media and real-time messaging platform with a built-in cybersecurity pipeline.

```text
React + Tailwind UI
        |
Axios + Socket.io-client
        |
Express API + Socket.io Gateway
        |
MongoDB Atlas / Local MongoDB
        |
Threat Detection Services
```

## Core Backend Modules

- `controllers`: HTTP request handling.
- `routes`: REST API boundaries.
- `models`: Mongoose schemas and indexes.
- `middleware`: JWT auth, upload validation, rate limiting, error handling.
- `services`: link scanning, file scanning, phishing detection, message processing.
- `sockets`: real-time messaging and presence.
- `utils`: shared helpers such as link extraction and threat classification.

## Threat Pipeline

1. Message is sent through REST or Socket.io.
2. Links are extracted from message text.
3. URLs are scored with local heuristics, AI-style phishing signals, VirusTotal, and Google Safe Browsing when keys are configured.
4. Uploaded files are validated, hashed with SHA-256, and checked with local file rules plus VirusTotal hash lookup.
5. Results are normalized into `safe`, `suspicious`, or `dangerous`.
6. The message is stored with security metadata.
7. Dangerous content is hidden or blocked in the UI.

## Threat Levels

- 0-30: safe
- 31-70: suspicious
- 71-100: dangerous

## Scalability Notes

- MongoDB indexes are defined on users, messages, friendships, notifications, and threat logs.
- Chat history endpoints support pagination.
- React routes are lazy-loaded.
- Socket delivery tracks active users in memory for local development. Production can replace this with Redis adapter support.
