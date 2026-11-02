# TERMINUS

> **Every vulnerability has an end.**  
> AI-assisted code security review and dependency vulnerability intelligence.

TERMINUS is a MERN-stack security workspace. Users can create an account, scan dependency manifests, upload supported source files, review security findings, track remediation, and export reports.

## Capabilities

- React + Vite application with a two-tone neo-brutalist dark/light interface.
- Sign-in and registration with bcrypt password hashing and JWT sessions.
- Workspace-scoped scans and findings when MongoDB is configured.
- Empty first-run dashboard: metrics and charts populate from actual scans, not seeded sample data.
- Dependency scanning for npm `package.json` and Python `requirements.txt`, with optional OSV.dev lookups.
- Source upload and review for HTML, Python, C/C++, JavaScript/TypeScript, Java, PHP, Go, Ruby, Rust, and shell files (250 KB limit).
- Optional OpenAI model review through the server-side Responses API.
- Local pattern-based static checks when no AI key is configured.
- Findings inventory, severity breakdown, scan activity, status workflow, scan history, and JSON report export.

## Architecture

```
React + Vite
  ├── Authentication and dashboard
  ├── Manifest scan and source-file upload
  └── Findings / reports / remediation workflow
          │ REST + JWT
          ▼
Node.js + Express
  ├── bcrypt + JWT authentication
  ├── Safe manifest parser + OSV.dev (optional)
  ├── Source static checks
  └── OpenAI Responses API (optional, server-side key)
          │
          ▼
MongoDB / Mongoose (persistent mode)
```

## Requirements

- Node.js 20+ (Node 22 LTS recommended)
- npm 10+
- MongoDB 7+ for persistent accounts and scan history (optional for local demonstration)
- OpenAI API key for model-powered code review (optional)
- Internet access for live OSV lookups (optional)

## Quick start

```bash
npm install
cp .env.example .env
npm run dev
```

Frontend: http://localhost:5173  
API health: http://localhost:5000/api/health

After pulling updates, run `npm install` again so the new server dependencies are installed.

## Environment configuration

Set these values in the root `.env` file:

| Variable | Purpose |
|---|---|
| `PORT` | API port (default 5000) |
| `MONGODB_URI` | MongoDB connection string; enables persistent accounts and scan history |
| `JWT_SECRET` | Long, random secret used to sign sessions; change before any deployment |
| `OPENAI_API_KEY` | Optional server-side API key for AI code review |
| `OPENAI_MODEL` | Optional model name (default `gpt-4.1-mini`) |
| `CLIENT_ORIGIN` | Allowed frontend origin |
| `OSV_API_URL` | OSV query endpoint |
| `ENABLE_LIVE_OSV` | Enable live dependency lookups (default false) |
| `VITE_API_URL` | Frontend API base URL |

Never commit API keys, database credentials, or production JWT secrets.

## Authentication modes

- With `MONGODB_URI`, user accounts are persisted and passwords are stored as bcrypt hashes. Scan and finding records are scoped to the authenticated user.
- Without MongoDB, registration and login use an in-memory demonstration account store. Accounts and scan history reset when the server restarts. This mode is for local demos only, not production.

## Source code review

1. Sign in and open **AI assistant**.
2. Upload a supported source file (maximum 250 KB).
3. Select **Run security review**.
4. If `OPENAI_API_KEY` is configured, TERMINUS sends the source text to the configured model through the backend. The key is never sent to the browser.
5. Without a model key, local pattern-based checks run and the UI labels the result as static analysis.
6. Review findings, evidence, line references (when available), and suggested remediation.

Uploaded source is treated as untrusted text. TERMINUS does not compile, execute, install, or run uploaded code. Avoid uploading secrets, private keys, credentials, or proprietary code unless you have approval to send it to the configured AI provider.

AI and static-analysis findings can be incomplete or incorrect. They are security-review assistance, not proof that a project is safe. Validate findings and fixes with tests and qualified review.

## Dependency scanning

- npm: upload or paste a `package.json` dependency manifest.
- Python: upload or paste a `requirements.txt` dependency manifest.
- OSV.dev lookups are optional and disabled by default. Set `ENABLE_LIVE_OSV=true` to enable them.
- A missing advisory result does not mean a dependency is secure.

## API

| Method | Endpoint | Purpose |
|---|---|---|
| POST | `/api/auth/register` | Create account |
| POST | `/api/auth/login` | Sign in |
| GET | `/api/health` | Service and AI configuration status |
| GET | `/api/dashboard` | Authenticated workspace metrics |
| GET | `/api/scans` | Authenticated scan history |
| POST | `/api/scans` | Dependency manifest scan |
| GET | `/api/findings` | Authenticated findings |
| PATCH | `/api/findings/:id/status` | Update finding status |
| POST | `/api/code/analyze` | Authenticated source-file review |

Protected endpoints require `Authorization: Bearer <token>`.

## Current limitations

- The no-MongoDB mode is ephemeral and intended only for local demonstration.
- The local static analyser uses targeted patterns; it is not a full compiler, SAST engine, or semantic code analysis system.
- Model-based analysis requires a valid provider key and network access.
- Uploaded source review is currently request-based; very large repositories and multi-file project archives are not supported.
- No sandbox execution, dependency installation, exploit simulation, or automated code modification is performed.
- Production deployment still requires rate limiting, CSRF/session strategy review, audit logging, secure secret management, monitoring, and security testing.

## Academic project alignment

TERMINUS supports UN SDGs 9 (Industry, Innovation and Infrastructure), 10 (Reduced Inequalities), and 16 (Peace, Justice and Strong Institutions) by making software risk information more accessible and actionable.
