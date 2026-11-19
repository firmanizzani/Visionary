# Visionary AI

Browser-based object detection, instance segmentation and counting with SvelteKit, TypeScript,
Tailwind, shadcn-style Svelte components/Bits UI, Lucide, ONNX Runtime Web and FastAPI.
Production metadata is stored in Neon PostgreSQL and photos use authenticated Cloudinary storage.
No AI inference runs on the backend. No Docker or external AI API is used.

## Run locally

Requirements: Node 22+, Python 3.11/3.12, Neon and Cloudinary credentials.

1. In `backend`, create a virtual environment: `python -m venv .venv`.
2. Activate it and run `pip install -r requirements.txt`.
3. Copy `backend/.env.example` to `backend/.env` and configure real credentials and a random JWT secret.
4. Run `alembic upgrade head` from `backend`.
5. Run `uvicorn app.main:app --host 127.0.0.1 --port 8000` from `backend`.
6. In `frontend`, run `npm ci`, then `npm run dev`. Open **http://127.0.0.1:5173**.
7. Prepare the model using the instructions in `ml/README.md`. The exported file belongs in
   `frontend/static/models/yolov8n-seg.onnx` and is available to both camera and image modes.

For this workspace, a backend development environment was provisioned at
`frontend/.venv`; use its `Scripts/python.exe` to run backend commands if desired.
The real backend `.env` is ignored by Git and never imported into the frontend.
Use the localhost hostname consistently: cookies and CSRF origins must match `FRONTEND_URL`.

## Checks

```sh
cd frontend
npm run check
npm test
npm run build
cd ../backend
python -m pytest -q
```

Backend unit/integration tests use an isolated SQLite schema and a storage adapter stub to test failure paths;
they never use fake detections in the product. `python tests/smoke_services.py` with `PYTHONPATH=.`
runs a real Neon + Cloudinary create/save/private-delivery/delete flow and removes its own temporary resources.
See `docs/testing.md` for browser tests and the latest verification status.

## Architecture and operation

- `frontend/`: public site, auth, protected workspace, detection worker, canvas renderer, API client.
- `backend/`: REST API, Argon2id/JWT/rotating sessions, SQLAlchemy models, migrations, storage integration.
- `ml/`: reproducible export, comparison, optional training/evaluation and model provenance.
- `docs/`: deployment, verification, security and design decisions.

The worker accepts one image at a time. Live frames are capped at 1280px, uploaded images at 1920px.
The model uses a fixed 640px input. Live snapshots save the same canvas that produced the displayed prediction.
Visualization and thresholds reuse decoded results. Explicit saves upload compressed JPEG directly to Cloudinary
using a server-issued signature; the API verifies storage identity, format, size and dimensions before committing metadata.
Durable upload intents and a deletion outbox let reconciliation recover interrupted saves/deletes.

Run `python reconcile.py` hourly using your scheduler. This is required to clean orphan uploads and retry
failed image deletions. API documentation: http://127.0.0.1:8000/docs.

Deployment instructions: `docs/deployment.md`. Model license obligations: `ml/README.md`.
