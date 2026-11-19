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
5. Run `npm run dev` from `backend` (FastAPI on port 8001; no npm install needed here).
6. In `frontend`, run `npm ci`, then `npm run dev`. Open **http://127.0.0.1:5173**.
7. Prepare the model using the instructions in `ml/README.md`. The exported weight shards and manifests belong in
   `frontend/static/models/` and is available to both camera and image modes.

For this workspace, a backend development environment was provisioned at
`frontend/.venv`; use its `Scripts/python.exe` to run backend commands if desired.
The real backend `.env` is ignored by Git and never imported into the frontend.
Use the localhost hostname consistently: cookies and CSRF origins must match `FRONTEND_URL`.

### Menjalankan lagi di VS Code (Windows)

Buka folder `visionary` di VS Code, lalu buka dua terminal PowerShell.
Terminal pertama untuk backend:

```powershell
cd backend
npm run dev
```

Terminal kedua, mulai dari folder utama `visionary`, untuk frontend:

```powershell
cd frontend
npm run dev
```

Buka http://127.0.0.1:5173. Dokumentasi backend ada di http://127.0.0.1:8001/docs.
Biarkan kedua terminal berjalan; tekan Ctrl+C di masing-masing terminal untuk berhenti.
Jika terminal sudah berada di folder yang benar, cukup jalankan `npm run dev`.
Script backend otomatis memakai `backend/.venv` atau environment yang sudah tersedia di
`frontend/.venv`, jadi tidak perlu aktivasi environment secara manual.
Perintah FastAPI aslinya, dengan environment Python sudah aktif, adalah
`python -m uvicorn app.main:app --host 127.0.0.1 --port 8001`.
`alembic upgrade head` hanya diperlukan saat setup awal atau ada migrasi database baru.
Jika port 5173 sedang dipakai, hentikan frontend sebelumnya dengan Ctrl+C lalu coba lagi.

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
failed image deletions. API documentation: http://127.0.0.1:8001/docs.

Deployment instructions: `docs/deployment.md`. Model license obligations: `ml/README.md`.

## Vision Studio appearance

The interface defaults to Dark, with Light and System available from the theme selector in the
header (and in Profile & settings). The choice is saved in this browser; System follows device
appearance changes. Semantic colors and the visual specification are documented in `DESIGN.md`.

Detection results include crops from the analyzed frame, and recent account snapshots refresh
after a successful save. The landing-page desk photograph and sample annotations are illustrative;
they do not run inference. The WebP photograph adds about 200 KB. Camera frames, user snapshots,
and model downloads retain the same privacy and on-demand behavior as before the redesign.

## Broader object recognition (v2)

The scanner now uses YOLOE-26s plus MobileCLIP2-S0, with 1,227 generated category names, local label verification, integrity-checked cached weights, and uncertainty markers. Run both ML export scripts when regenerating assets. Apply database migration 002 before starting the updated backend. Old snapshots remain viewable without rerunning a model.

The selected verifier weights are licensed for non-commercial research, matching this project's confirmed research/task/personal use. License files ship with the model assets; see ml/README.md for reproducibility and limits.
