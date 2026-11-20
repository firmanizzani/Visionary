# Vercel deployment

This repository uses **two Vercel projects** from the same GitHub repository. The ML training/export folder is not deployed. The frontend ships the already-exported detector/verifier shards from `static/models/`; inference stays in the browser.

Only `.env` and `.env.example` are used in each application folder. `.env` is private, ignored by Git, and excluded from Vercel source uploads. Local `.env` files do not automatically configure a Git-based Vercel deployment: import/copy their values into the appropriate project's Environment Variables.

## Project settings

| Setting | Frontend project | Backend project |
| --- | --- | --- |
| Root Directory | `frontend` | `backend` |
| Framework | SvelteKit | FastAPI |
| Runtime | Node.js 24.x | Python 3.12 |
| Install | `npm ci` | Automatic Python install from `pyproject.toml` |
| Build | `npm run build` | FastAPI preset; leave custom Build Command unset |
| Entrypoint | SvelteKit adapter | `app.main:app` in `pyproject.toml` |

The backend uses the current FastAPI preset and a single Python function, with a 60-second limit and a daily cleanup cron. The frontend's `prebuild` rejects missing, local, or placeholder production backend origins. Do not set a static Output Directory or deploy from the repository root.

The backend's `pyproject.toml` declares every runtime dependency as well as the entrypoint.
Keep its dependency list aligned with `requirements.txt` (checked by the backend tests).
`uv.lock` pins the resolved project dependencies for repeatable Vercel installations.
A tool-only `pyproject.toml` can select project installation without installing the packages
listed separately in `requirements.txt`; that produced a deployed `No module named 'fastapi'`
error. Leave the backend Install Command override off and redeploy without the previous
build cache after updating this configuration.

The correction was checked with a fresh `uv sync --no-dev` environment: importing
`app.main` with production configuration and requesting `/api/v1/health` both passed.
The backend test suite passed 9 tests. Cloud deployment still needs a new build to
pick up these files; redeploying an older commit will retain the missing dependency.

## Frontend environment

Import `frontend/.env`, then set these values in the **frontend** Vercel project:

| Variable | Production value |
| --- | --- |
| `PUBLIC_API_BASE_URL` | `/api/v1` |
| `BACKEND_ORIGIN` | The actual backend production HTTPS origin, without `/api/v1` or another path |
| `PUBLIC_MODEL_URL` | Optional; leave empty to use the bundled models |

Do not add Neon, Cloudinary, JWT, or cron secrets to frontend variables. `BACKEND_ORIGIN` is declared server-only using SvelteKit 3 environment modules. All browser API requests use `/api/v1/*`; the deployed SvelteKit server endpoint forwards them to FastAPI. This is the same endpoint used in local development, not a development-only Vite proxy. Cookie paths, separate Set-Cookie headers, CSRF, error statuses, and same-origin redirects are preserved. Authentication responses are not cached.

Keep the two model directories, shards, label prototypes, manifests and license files under `frontend/static/models/`. No Python, PyTorch, `ml/.venv`, training dataset, or model server is needed in the frontend or backend deployments.

## Backend environment

Import `backend/.env` into the **backend** project. Existing Neon, Cloudinary, JWT and cron values can be reused; never regenerate the JWT secret on each deployment.

| Variable | Production setting |
| --- | --- |
| `DATABASE_URL` | Existing Neon pooled PostgreSQL URL with TLS (`sslmode=require`) |
| `JWT_SECRET_KEY` | Existing stable secret, at least 32 characters |
| `ACCESS_TOKEN_EXPIRE_MINUTES` | `15` |
| `REFRESH_TOKEN_EXPIRE_DAYS` | `7` |
| `CLOUDINARY_CLOUD_NAME` | Existing value |
| `CLOUDINARY_API_KEY` | Existing value |
| `CLOUDINARY_API_SECRET` | Existing value |
| `FRONTEND_URL` | The exact frontend production HTTPS origin, without a path |
| `COOKIE_SECURE` | `true` (override the local file's `false`) |
| `COOKIE_SAMESITE` | `lax` |
| `CRON_SECRET` | Existing stable secret, at least 32 characters |

Vercel sets `VERCEL=1`; application startup then validates HTTPS, secure cookies, database TLS, and required credentials. Locally, keep HTTP loopback URLs and `COOKIE_SECURE=false`. Production values belong in Vercel, so local login keeps working.

## Deployment order

1. Create/import both projects with the Root Directories above. Get the frontend's assigned production domain from project settings.
2. Configure backend variables, including that frontend HTTPS origin, and deploy the backend. Its production `/api/v1/health` should return JSON with `status: ok`.
3. Set frontend `BACKEND_ORIGIN` to the backend's production origin and deploy the frontend. Use the production URL, not a protected Vercel Preview URL.
4. If the final frontend domain differs, update backend `FRONTEND_URL` and redeploy the backend. Any environment change requires a new deployment.
5. Before serving a new schema, run `alembic upgrade head` from `backend` in a controlled environment. No migrations run at startup. The existing local Neon database was already on migration 002; confirm the target database separately.
6. Run the read-only checks below, then sign in and save/delete a test snapshot in the production browser.

Do not allow wildcard origins. Preview deployments need a backend configured for their exact frontend origin (prefer stable preview domains or separate preview projects). A production backend deliberately accepts only its configured production frontend origin.

## Verification commands

From `frontend`:

```
npm ci
npm run check
npm test
npm run test:deployment
npm run build
```

`npm run check:deployment` validates **production** frontend values; with a local loopback `.env`, it should reject that origin until production overrides are supplied. Vercel runs that validation automatically before its build.

From `backend` in a Python environment:

```
python -m pip install -r requirements-dev.txt
python check_deployment.py
python -m pytest tests/test_api.py tests/test_deployment_config.py -q
alembic current
```

`python check_deployment.py --production` checks production overrides without printing secrets. Leave `.env` local; supply production overrides through the process environment or Vercel settings.

After actual deployment, from the repository root:

```
node scripts/check-deployed.mjs --frontend https://YOUR-FRONTEND.vercel.app --backend https://YOUR-BACKEND.vercel.app
```

These checks verify both health endpoints, API proxy routing, the allowed frontend origin, and unauthenticated API behavior. They do not replace a real sign-in/camera/save acceptance check.

## Scheduled cleanup and limits

The backend runs `/api/v1/internal/reconcile` daily at 03:00 UTC. Vercel sends `CRON_SECRET` as a bearer token. The task retries stored-image deletion, removes expired uncommitted uploads, sessions, and old rate buckets. For additional cleanup runs use a trusted scheduler with the same secret. Check provider quotas in each dashboard.

User images upload directly to private Cloudinary storage, not through the frontend function. API JSON requests are capped at 2 MB. Model downloads are static frontend assets of about 90 MB plus label data and start only on demand. The selected verifier is for the user's noncommercial research use; its license remains bundled.

No cloud project or production deployment is created by a local build. Actual project URLs and Vercel account settings cannot be filled before the projects exist. Windows may disallow the directory symlinks emitted by the Vercel adapter; the deployment output can be checked locally using equivalent workspace-contained directory junctions. Vercel's Linux build uses the unmodified adapter.
