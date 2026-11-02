# TERMINUS

> **Every vulnerability has an end.**  
> AI-assisted software dependency vulnerability detection and risk assessment.

TERMINUS is a MERN-stack project prototype that helps developers inspect third-party software dependencies, identify known vulnerabilities, prioritise remediation, and understand findings through an explainable security workspace.

## Project goals and SDG alignment

- **SDG 9 — Industry, Innovation and Infrastructure:** improve digital infrastructure resilience by identifying vulnerable components.
- **SDG 10 — Reduced Inequalities:** make dependency-security information understandable and accessible to smaller teams and student developers.
- **SDG 16 — Peace, Justice and Strong Institutions:** support trustworthy digital services through traceable findings and transparent risk assessments.

## Implementation

- React + Vite dashboard with neo-brutalist / glassmorphism styling.
- Express REST API and Node.js backend.
- MongoDB/Mongoose persistence when `MONGODB_URI` is configured; demo mode works without MongoDB.
- Safe dependency manifest parsing for npm `package.json` and Python `requirements.txt`.
- Optional OSV.dev vulnerability lookups.
- Risk scoring, severity filters, scan history, finding details, status updates, and JSON export.
- Seeded demo findings for first-launch review.
- A rule-based explainability panel with remediation guidance; live LLM integration is a planned extension, not enabled in this review build.
- MongoDB persistence is optional; without a MongoDB URI, scan data lives in server memory and resets when the API restarts.

**Current MVP boundaries:** the profile/workspace is a review UI, not a user account system. Authentication, role-based access control, live LLM calls, CI integration, and repository OAuth are not implemented in this build.

> **Prototype disclaimer:** demo records are clearly labelled. No result from OSV does not guarantee a package is safe. TERMINUS is an aid, not a certification or substitute for a complete security review.

## Architecture

```
TERMINUS/
├── client/                 # React + Vite frontend
│   └── src/
│       ├── lib/api.js
│       ├── App.jsx
│       ├── main.jsx
│       └── styles.css
├── server/                 # Node.js + Express backend
│   └── src/
│       ├── config/
│       ├── models/
│       ├── routes/
│       └── services/
├── .env.example
├── package.json
└── README.md
```

**Request flow:** React UI → Express REST API → manifest parser → OSV.dev (optional) → MongoDB (optional) → dashboard.

## Requirements

- Node.js 20+ (Node 22 LTS recommended)
- npm 10+
- MongoDB 7+ (optional for local demo; required for persistent data)
- Internet access for live OSV lookups

## Quick start

```bash
npm install
cp .env.example .env
npm run dev
```

Open the frontend at http://localhost:5173 and API health at http://localhost:5000/api/health.

On Windows PowerShell, use `Copy-Item .env.example .env` instead of `cp`.

Set `MONGODB_URI` in `.env` to enable persistence. Without it, the API uses in-memory demo data. The root `.env` is shared by the Express and Vite workspaces.

## Environment variables

| Variable | Purpose | Default |
|---|---|---|
| `PORT` | Express port | `5000` |
| `MONGODB_URI` | MongoDB connection | unset (demo mode) |
| `CLIENT_ORIGIN` | Allowed frontend origin | `http://localhost:5173` |
| `OSV_API_URL` | OSV query endpoint | `https://api.osv.dev/v1/query` |
| `ENABLE_LIVE_OSV` | Enable live OSV lookups | `false` |
| `VITE_API_URL` | Frontend API base URL | `http://localhost:5000/api` |

Never commit credentials or production secrets.

## API

| Method | Endpoint | Purpose |
|---|---|---|
| GET | `/api/health` | Service/database health |
| GET | `/api/dashboard` | Dashboard metrics |
| GET | `/api/scans` | Scan history |
| GET | `/api/scans/:id` | Scan details |
| POST | `/api/scans` | Submit dependency manifest |
| GET | `/api/findings` | Findings inventory |
| PATCH | `/api/findings/:id/status` | Update finding workflow status |

Example:

```bash
curl -X POST http://localhost:5000/api/scans \
  -H "Content-Type: application/json" \
  -d '{"projectName":"Review demo","ecosystem":"npm","fileName":"package.json","manifest":"{\"dependencies\":{\"lodash\":\"4.17.20\"}}"}'
```

## Scanner safety and accuracy

1. Dependency manifests are parsed as data. TERMINUS does not install packages, execute scripts, or run uploaded code.
2. Live OSV queries are disabled by default. Set `ENABLE_LIVE_OSV=true` to enable them.
3. Keep uploads small and restrict public API exposure before deployment.
4. Only scan software you own or have permission to assess.
5. OSV results are advisory. Validate affected version ranges and exploitability in your application context.
6. AI-generated explanations are guidance, not authoritative verdicts. Review fixes and run tests.

## Review walkthrough

1. Run the app and open the overview dashboard.
2. Inspect severity distribution and project posture.
3. Open **New scan**, paste a sample `package.json` or `requirements.txt`, and submit.
4. Open a finding to inspect advisory details and remediation guidance.
5. Change finding status and export a JSON report.
6. Explain the boundary between seeded demo records and live OSV-backed results.

## Development scripts

- `npm run dev` — run frontend and backend concurrently.
- `npm run dev:client` — run only Vite.
- `npm run dev:server` — run only Express.
- `npm run build` — production-build frontend.
- `npm run start` — start API server.

## Future roadmap

- GitHub App integration with least-privilege repository permissions.
- More lockfile ecosystems and transitive dependency analysis.
- CVSS enrichment and reachability-aware prioritisation.
- Scheduled rescans, notification workflows, and audit records.
- Hardened authentication and role-based access control.
- Consent-based AI summaries using a server-side model provider.
- CI integration to flag newly introduced vulnerable dependencies.

## Technology references

- [React](https://react.dev/) · [Vite](https://vite.dev/)
- [Node.js](https://nodejs.org/) · [Express](https://expressjs.com/)
- [MongoDB](https://www.mongodb.com/docs/) · [Mongoose](https://mongoosejs.com/docs/)
- [OSV API](https://google.github.io/osv.dev/api/)
- [OWASP Top 10](https://owasp.org/www-project-top-ten/)

## Academic project note

TERMINUS is a semester project aligned with UN SDGs 9, 10, and 16. This version is a demonstrable prototype. Production readiness additionally requires hardened authentication, authorization, upload isolation, monitoring, security testing, and deployment-specific controls.
