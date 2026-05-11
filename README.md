# ShieldMsg

ShieldMsg is a secure messaging prototype that scans shared links and files before users open them. It shows immediate safety labels such as Safe, Suspicious, and Dangerous inside the chat experience.

## Features

- Real-time message scanning for URLs and file metadata.
- Threat indicators for phishing-style links, risky domains, URL shorteners, APKs, executable files, macro documents, and deceptive double extensions.
- React messaging UI with safety badges, upload scanning, and sample suspicious messages.
- Express API with typed scan endpoints.
- Reusable TypeScript threat engine with unit tests.

## Tech Stack

- Frontend: React, Vite, TypeScript, Lucide icons.
- Backend: Node.js, Express, Zod.
- Core logic: TypeScript package with Vitest coverage.
- Tooling: npm workspaces, strict TypeScript config.

## Project Structure

```text
ShieldMsg/
  apps/
    api/                  Express scan service
    web/                  React messaging client
  packages/
    threat-engine/         Reusable link and file risk scoring
  docs/                    Architecture and development notes
```

## Getting Started

```bash
npm install
npm run dev
```

The web app runs at `http://localhost:5173`.
The API runs at `http://localhost:4000`.

## Useful Commands

```bash
npm run test
npm run typecheck
npm run build
```

## API Endpoints

- `GET /health`
- `POST /scan/url`
- `POST /scan/file`
- `POST /scan/message`

Example:

```bash
curl -X POST http://localhost:4000/scan/message \
  -H "Content-Type: application/json" \
  -d "{\"text\":\"http://whatsapp-security-update.xyz/install.apk\",\"files\":[]}"
```

## Resume Highlights

- Designed a full-stack secure messaging prototype with real-time threat indicators.
- Built a reusable TypeScript risk-scoring engine for URLs and file metadata.
- Implemented typed REST endpoints with request validation and structured scan responses.
- Created a polished React interface that visualizes content safety directly inside the chat flow.
- Added unit tests for high-risk detection cases and safe-content baselines.

## Security Scope

ShieldMsg is a prototype detection layer based on deterministic heuristics. It is useful for demonstrating cybersecurity-aware product design, risk scoring, and real-time user warnings. A production system should integrate live threat intelligence, sandboxed file analysis, antivirus engines, abuse reporting, authentication, encryption, and audit logging.
