# ShieldMsg Development Plan

ShieldMsg is a secure messaging prototype that detects risky links and files before users open them.

## Phases

1. Project scaffold: monorepo structure, shared TypeScript config, scripts, and documentation.
2. Threat engine: deterministic link and file risk scoring with tests.
3. API service: Express scan endpoints and health checks.
4. Web experience: messaging UI with real-time safety labels and upload scanning.
5. Polish: README, architecture notes, demo instructions, and resume-ready highlights.
6. MERN upgrade: MongoDB persistence, Mongoose models, scan history API, and UI history panel.

## Completed Commit Sequence

- `chore: scaffold ShieldMsg monorepo`
- `feat: add threat scoring engine`
- `feat: expose scan API endpoints`
- `feat: build real-time messaging interface`
- `docs: document architecture and setup`
- `feat: add MongoDB scan persistence`
- `feat: show persisted scan history`
- `docs: describe MERN stack setup`

## Recruiter-Facing Goals

- Clear separation of frontend, backend, and domain logic.
- Type-safe implementation across the stack.
- Test coverage for the core risk-scoring engine.
- Professional commit history that shows incremental delivery.
- Honest security positioning: prototype threat intelligence, not a production antivirus.
