# ShieldMsg Architecture

## Overview

ShieldMsg uses the MERN stack and separates the user experience, API boundary, persistence layer, and detection logic so each layer can evolve independently.

```text
React client -> Express API -> Threat engine
                    |
                 MongoDB
```

## Frontend

The React app provides a messaging interface where users can paste links, attach files, and see safety labels before sending. Draft content is scanned with a short debounce to keep the experience responsive.

## Backend

The Express service exposes scan endpoints and validates request payloads with Zod. It returns structured scan results that the frontend can render consistently.

## Database

MongoDB stores scan history through Mongoose models. Each record captures the original message text, file metadata, risk level, score, URL results, file results, summary, and creation timestamp. The API falls back to in-memory history when MongoDB is unavailable so the demo remains usable.

## Threat Engine

The threat engine is a reusable JavaScript package. It scores URLs and file metadata using transparent rules:

- Missing HTTPS.
- Shortened URLs.
- Raw IP hostnames.
- Suspicious top-level domains.
- Brand impersonation.
- Executable downloads.
- APK files and executable file extensions.
- Macro-enabled Office documents.
- Double-extension filenames.

## Data Flow

1. A user drafts a message or attaches a file.
2. The web app sends text and file metadata to `/scan/message`.
3. The API extracts links and passes links/files to the threat engine.
4. The engine returns risk scores, reasons, and recommendations.
5. The API saves the scan result in MongoDB.
6. The UI renders Safe, Suspicious, or Dangerous labels in the chat and shows recent scan history.

## Future Enhancements

- Add user accounts and end-to-end encrypted conversations.
- Integrate live reputation APIs such as Google Safe Browsing or VirusTotal.
- Add file hashing and sandbox analysis for uploaded binaries.
- Store scan history for abuse analytics.
- Add reporting workflows for suspicious senders.
