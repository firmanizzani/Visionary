# Verification

## Automated checks

- Frontend: `npm run check` (Svelte/TypeScript), `npm test` (4 numerical tests), `npm run build`.
- Backend: `python -m pytest -q` (3 integration scenarios covering auth, refresh rotation,
  CSRF, revocation, password change, settings, ownership, idempotency, filtering,
  analytics and storage-delete retry). Tests use temporary SQLite and storage stubs.
- Real services: `PYTHONPATH=. python tests/smoke_services.py` creates a temporary Neon user,
  uploads an authenticated Cloudinary image, verifies temporary signed image delivery,
  saves metadata, checks history/detail/analytics/idempotency, deletes and signs out.
  The script removes its resources in `finally`.
- Browser: run the API and frontend at `http://127.0.0.1:5173`, then in `frontend`
  run `npx playwright test`. Chrome must be installed. Tests cover fake device camera
  start/stop, explicit permission denial, responsive widths 1440/768/390, invalid/oversize
  uploads, actual browser ONNX segmentation on the bus fixture, threshold filtering,
  visualization switching, full account/save/history/detail/analytics/settings/delete/logout/login.
  The full-flow test cleans only its exact ephemeral test identity using the backend Python
  environment provisioned at `frontend/.venv`. Adjust that executable path for another OS.
- Model: `ml/.venv/Scripts/python.exe validate_model.py fixtures/bus.jpg fixtures/zidane.jpg`
  from `ml`. PyTorch and ONNX: 4 objects / 3 objects respectively; minimum mask IoU **1.0**
  on both fixtures. The generated report is `ml/validation-report.json`.
- Dependency audit: npm reported zero known vulnerabilities after updating to patched SvelteKit 3.

## Limits of verification

Final production run on 19 November 2026: **4 Playwright scenarios passed**; Svelte check
reported **0 errors, 0 warnings**; **4 frontend numerical tests passed**; **3 backend
integration scenarios passed** (one upstream AnyIO deprecation warning). Production build
completed with the Node adapter. Neon migration revision is **001 (head)**.
Real-service smoke passed, including authenticated delivery and cleanup of its temporary resources.
The production workspace inspector reported **0 FAIL** at all three widths; remaining
visual warnings and the final critique are recorded in `docs/design.md`.

The browser test uses desktop Chrome on Windows with a simulated camera. Image inference
runs on the actual ONNX model using the WASM fallback in headless Chrome. Physical camera
access, real WebGPU hardware, Android Chrome, Edge, and iPhone Safari require their own
device acceptance runs. No universal inference FPS or dataset-wide accuracy is claimed.
The two-image parity check establishes consistency for those fixtures, not a full benchmark.

Production Vercel deployment and its cron invocation require a connected Vercel project.
Local builds use the Node adapter; Vercel selects the Vercel adapter. `.env` is ignored and
the frontend only exposes explicitly prefixed PUBLIC_* settings.

## Manual acceptance on each target device

Use a real camera: grant permission, switch camera, change threshold and mode, save,
stop, navigate away and confirm the OS camera indicator turns off. Open saved history
after session refresh and check mask alignment at portrait/landscape widths. Verify a
private image loads, then delete and verify dashboard/analytics recalculate. Confirm the
camera is still responsive when AI updates slowly. Record browser/device and measured latency.
