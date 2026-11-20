# Local development

This guide is for running the repository on your machine. For a product overview,
see the [README](../README.md). For hosted configuration, use the
[Vercel deployment guide](deployment.md).

## Requirements

- Node.js **24.x** and npm.
- Python **3.12**.
- A configured Neon PostgreSQL database and Cloudinary account.
- A modern browser with WebAssembly support and permission to use a camera.

The exported model assets already live in `frontend/static/models/`. Normal
application setup does not require installing the `ml` dependencies, training a
model, or running a Python inference server.

## 1. Configure environment files

If they do not already exist, copy `backend/.env.example` to `backend/.env` and
`frontend/.env.example` to `frontend/.env`. Preserve existing configured files.

In `backend/.env`, provide your database URL, Cloudinary credentials, and a stable
random JWT secret of at least 32 characters. Use these local browser settings:

```dotenv
FRONTEND_URL=http://127.0.0.1:5173
COOKIE_SECURE=false
COOKIE_SAMESITE=lax
```

In `frontend/.env`, use:

```dotenv
PUBLIC_API_BASE_URL=/api/v1
BACKEND_ORIGIN=http://127.0.0.1:8001
PUBLIC_MODEL_URL=
```

Leave `PUBLIC_MODEL_URL` empty to use the bundled model shards. Never put database,
Cloudinary secret, JWT, or scheduler credentials in frontend variables. Both real
`.env` files are ignored by Git; only `.env` and `.env.example` are needed.

For production HTTPS deployments, `COOKIE_SECURE` must be `true` and both origin
settings must use the actual deployed HTTPS URLs. Do not copy the local HTTP
settings into Vercel unchanged.

## 2. Start the backend

From the repository root, in a Windows PowerShell terminal:

```powershell
cd backend
py -3.12 -m venv .venv
.\.venv\Scripts\python.exe -m pip install -r requirements.txt
.\.venv\Scripts\python.exe -m alembic upgrade head
npm run dev
```

The backend starts at `http://127.0.0.1:8001`. Its interactive API documentation is
at `http://127.0.0.1:8001/docs`, and `/api/v1/health` returns the health status.

The backend npm command is a small Node launcher; it does not require a backend
`npm install`. It chooses `backend/.venv`, with `frontend/.venv` as a compatibility
fallback for an existing workspace. Creating `backend/.venv` is the recommended
setup for a new checkout.

On macOS/Linux, create the environment with `python3.12 -m venv .venv` and use
`.venv/bin/python` instead of `.venv\Scripts\python.exe`. The same `npm run dev`
launcher supports both platforms.

## 3. Start the frontend

Open another terminal from the repository root:

```powershell
cd frontend
npm ci
npm run dev
```

Open **http://127.0.0.1:5173**. Keep both terminals running; stop each with Ctrl+C.
After the first setup, restart with `npm run dev` from each application folder.
Run database migrations again when the schema changes.

Use the same browser hostname consistently. Local HTTP accepts both `localhost`
and `127.0.0.1` at the configured frontend port, but cookies belong to the hostname
used to sign in. Moving between hostnames can require signing in again. For a
different frontend port, update `FRONTEND_URL`; for a different backend port,
update `BACKEND_ORIGIN` too.

## 4. Run checks

From `frontend`:

```powershell
npm run check
npm test
npm run test:deployment
npm run build
```

From `backend` on Windows:

```powershell
.\.venv\Scripts\python.exe -m pip install -r requirements-dev.txt
.\.venv\Scripts\python.exe check_deployment.py
.\.venv\Scripts\python.exe -m pytest tests/test_api.py tests/test_deployment_config.py -q
```

Backend tests use an isolated SQLite database and storage stubs. Real-service and
browser tests have additional setup, Chrome/fixture requirements, and Python helper
paths; see [testing](testing.md). A production preview is needed to verify the real
service worker; see [PWA verification](pwa.md#verification).

`npm run check:deployment` deliberately validates production URLs and rejects a
local loopback `BACKEND_ORIGIN`. Local `npm run build` works with local settings;
Vercel runs the production guard automatically.
