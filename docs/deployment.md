# Deployment

Use two Vercel projects from this repository. Do not deploy the ML environment or local secrets.

## Frontend

Root directory: `frontend`, framework SvelteKit, install `npm ci`, build `npm run build`.
Vercel uses `@sveltejs/adapter-vercel`; local builds use `adapter-node` because Windows
may deny Vercel's output symlinks. Both are SvelteKit adapters for the same application.
Keep both generated model directories, binary shards, label prototypes, manifests, and license files under `static/models/` in the build source.
The default model configuration is generated in `src/lib/ai/model.json` and `verifier.json`; deploy them together with their matching assets. PUBLIC_MODEL_URL is only an optional override for a detector with the same hash.

Recommended: proxy `/api/v1/*` to the backend using a Vercel external rewrite, with
`PUBLIC_API_BASE_URL=/api/v1`. Put this rewrite in `frontend/vercel.json` with the actual backend hostname:

```json
{"source":"/api/v1/:path*","destination":"https://YOUR-BACKEND.vercel.app/api/v1/:path*"}
```

The same-origin proxy allows HttpOnly, Secure, SameSite=Lax host cookies without cross-site
third-party cookie restrictions. Set `FRONTEND_URL` to the frontend's exact HTTPS origin.
For a separate cross-site API hostname, use `COOKIE_SAMESITE=none` and `COOKIE_SECURE=true`,
and consider browser third-party-cookie restrictions. Prefer a shared site/proxy instead.

## Backend

Root directory: `backend`. `vercel.json` routes requests to `api/index.py` using the Python runtime.
Configure the variables listed in `.env.example` in Vercel's environment settings.
Use Neon pooled PostgreSQL connection URLs with TLS; SQLAlchemy accepts both
`postgresql://` and `postgresql+psycopg://`. Set `COOKIE_SECURE=true` in production.
Use a random secret at least 32 characters long, never a frontend public variable.
Do not change the JWT secret on every deployment; rotating it deliberately revokes sessions.

Run `alembic upgrade head` manually in a controlled environment before serving a new schema.
No migrations run automatically at app startup. Neon pool: 3 connections plus 2 overflow per instance.
Cloudinary resources use delivery type `authenticated`, short-lived signed original download URLs,
an upload signature, owner-bound upload intents and server-side asset verification.

## Scheduled cleanup

The backend Vercel configuration includes a daily cron at 03:00 UTC. Set `CRON_SECRET`
in Vercel; Vercel sends it as the bearer token for `/api/v1/internal/reconcile`.
For shorter retention of interrupted uploads, run `python reconcile.py` hourly from a
trusted scheduler, or call the protected endpoint with that secret using your scheduler.
It deletes expired uncommitted uploads and retries the durable storage deletion queue.
Allow an hour beyond upload-intent expiry before cleanup so an in-flight save can finish.
Expired sessions and old rate buckets are cleaned too. Monitor failures and Cloudinary quota.
The endpoint processes at most 100 orphan uploads and 100 deletion jobs per invocation;
monitor the backlog and increase scheduler frequency within your hosting plan if needed.

## Launch checks

Verify HTTPS camera permission, ONNX and WASM download/CORS, account refresh after reload,
private image access, owner isolation, save idempotency, delete reconciliation, and mobile layout.
Model/runtime downloads are tens of MB and only start on demand. Review current Vercel build,
function, request and bandwidth limits; Neon compute/connection limits; and Cloudinary storage,
delivery and transformation usage in each provider dashboard before launch. Account limits vary.
No public deployment is created automatically by the local build.

This model selection is for non-commercial research. The MobileCLIP2 weight license is included in its asset directory. Download size is about 90 MB, so test memory/latency and cache behavior on each target device.
