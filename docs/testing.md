# Verification

## Session restoration (19 November 2026)

The session browser regression uses a separate persistent Chrome profile and an ephemeral
test account. It closes Chrome with only the persistent refresh cookie remaining, opens
Chrome again with that profile, and verifies the authenticated dashboard without signing
in again. This passed before and after the fix: cookie persistence itself worked locally.
The reproduced failure was a settings API outage incorrectly clearing the restored user;
the same test failed before the fix and passed afterward. A temporary auth-service outage
now offers Retry and successfully restores the account when the service returns.

Session loading shares one request, ignores stale responses after login/logout, and renews
expired access tokens through the API's shared refresh request. Unit tests cover those races,
service errors, and invalid login credentials. Tokens remain in HttpOnly cookies. Backend
local settings are `COOKIE_SECURE=false`, `COOKIE_SAMESITE=lax`, with a seven-day refresh
cookie by default. No `frontend/.env` is needed for the default same-origin `/api/v1` proxy.
Use the same hostname each time: localhost and 127.0.0.1 have separate browser cookie stores.

## Auth, local origins, and direct theme toggle (19 November 2026)

The full application suite passed **10 Playwright scenarios** on the production build. After
the last CSS-only adjustment to center the shorter login form, the rebuilt production output
passed all **3 auth/theme scenarios** again. Svelte check reported **0 errors, 0 warnings**;
**10 frontend unit tests** and **6 backend tests** passed (one upstream AnyIO deprecation warning).

Login is vertically centered against the open illustration composition on desktop; registration
retains its approved top alignment. Field widths match between pages. The dedicated layout test
asserts those different alignments at 1440/1024px, checks single-column layouts at 768/390px in
both themes, and exercises password visibility and mismatched-password validation. The auth
inspector reports **0 FAIL**; the 29px phone title is an intentional hierarchy choice. Both pages
use the same canonical auth stylesheet and no large enclosing or nested cards.

The header now offers Login for guests; the theme icon toggles Light/Dark directly with no menu
or System choice. Browser tests verify persistence and migration of an older System preference
into a saved explicit theme. The auth illustration (`auth-objects.webp`, 98,998 bytes) contains
three everyday objects. The explanatory caption was removed at the user's request; the image
and its sample annotations remain illustrative rather than live model output. No camera/lens
asset or private screenshot is used in the application.

The backend permits localhost and 127.0.0.1 aliases only for the same configured local HTTP
frontend port when secure cookies are disabled. CORS, request origin validation, and refresh
use the same list. Tests verify registration/login/refresh at both aliases, continued CSRF
requirements, rejection of external origins/different ports/schemes, and exact production
origins. A real browser flow through localhost:5173 also passed account creation, save, history,
analytics, logout and login. Local API was restarted with this fix; credentials were unchanged.

## Vision Studio redesign (19 November 2026)

Final Node production build: **8 Playwright scenarios passed** (1.2 minutes), including a new
theme/responsive scenario. Svelte check: **0 errors, 0 warnings**; **10 frontend unit tests passed**.
The font-only dependency change reported zero known npm vulnerabilities. Backend/model code and
database schema were unchanged.

Theme coverage verifies Dark by default, persistence after reload, System following live OS
appearance changes, navigation across public/workspace pages, and the sample annotation toggle.
Dark and Light captures cover landing, login, image detection, and docs at 1440/768/390px, plus
account dashboard/history/detail/analytics/settings at desktop and phone widths. All tested pages
remain within the viewport. History captures wait for successful image delivery rather than
accepting an unloaded image as visual evidence.

The real-service flow checks that a successful save refreshes recent snapshots, then verifies
history, private image detail, analytics, settings, delete, logout and login. Camera tests check
that live video continues with non-empty overlays and that object thumbnail canvases contain
actual pixels. The multi-item and single-item recognition regressions still pass.

The workspace inspector reported 0 FAIL (one content-driven column-height warning). The landing
inspector reported 0 FAIL with `still-page` explicitly allowed: the functional sample annotation
toggle and user-started camera replace decorative automatic motion. Remaining font-role/video
warnings and the intentional unequal workspace column heights are documented in `DESIGN.md`.
Screenshots were visually reviewed; the implementation follows the approved direction with an
existing global theme/account header, not a claim of pixel-perfect mockup reproduction.

Illustrative marketing photo: `frontend/static/images/studio-desk.webp`, generated for this
project, 199,528 bytes. It is never used in place of a user's camera frame or saved snapshot.
No private regression photos or screenshots are included in the commit.

## Camera playback and multiple-item update (19 November 2026)

Final Node production build passed all **7 Playwright scenarios** (1.6 minutes), including
the existing real-service account/save/history flow and both new camera scenarios. Svelte check
reported **0 errors, 0 warnings**, and all **10 frontend unit tests passed**.

The previous live view hid the video after the first result and replaced it with periodic still
images. Camera preview now remains native video while AI analyzes separate snapshots. Detection boxes and
masks are drawn directly over live video in a shared aspect-ratio container. There is one camera
view with no Analyzed frame selector. Stop retains the analyzed snapshot and restart returns to
live video. Stale overlays expire without stopping playback. No per-result JPEG encoding is performed on the main thread.

The slow-worker camera regression delays each result by 1.8s and checks that native playback time
and decoded frame count keep advancing, that the video remains shown after results, and that
non-empty overlay pixels are drawn over video, overlay/video bounds match within one pixel at
widths 1440/768/390, and stop/restart works. Video time also advances after overlays appear. It tests playback independence,
not physical webcam FPS or a real-time AI throughput guarantee.

Overlay text scales to a minimum of 12 CSS pixels at the rendered canvas size; box strokes also
account for display scaling. This keeps labels readable when the 960px frame is shown on a phone.

The actual model camera regression composes the four ignored local examples into one frame
(`ml/prepare_camera_fixture.py`) and supplies it via a canvas MediaStream. At 50%, wallet, perfume
bottle, and sunglasses appear. At 35%, spotlight also appears, one result per item. This composed
fixture is a targeted regression, not a natural-scene accuracy benchmark. Four region consolidation
tests cover separate/overlapping instances, synonym duplicates, contained components, and retention
of items held by a person. The full frontend suite now has 10 tests.

Existing app design is retained (framed-sheet, seed 1525734396). Browser inspection reports 0 FAIL;
existing small secondary text and marginal shell text contrast remain warnings. The removed view selector is verified absent. Screenshots of the working camera are checked at
all three widths. Inference can still take seconds on WASM; overlapping/small objects remain difficult,
and suppression heuristics can remove a legitimate item contained inside another item.

## Broad-vocabulary update (19 November 2026)

The scanner now uses YOLOE-26s plus MobileCLIP2-S0 with 1,227 fixed text prototypes.
The original 80-class decoder was replaced by a manifest-driven contract; the backend
accepts larger class IDs and stores label similarity/margin separately from proposal confidence.
Migration 002 adds nullable verification fields without invalidating old snapshots.

Final production verification: **5 Playwright scenarios passed**, including real Neon/Cloudinary
registration, save, signed image delivery, history, analytics, settings, deletion, and logout/login.
The four everyday examples each produced one expected label: sunglasses, wallet, spotlight (lamp),
and perfume bottle. Existing bus/person recognition, camera lifecycle/denial, upload validation,
and responsive layouts also passed. Svelte check reported **0 errors and 0 warnings**;
**6 frontend tests passed** and the Node production build completed. Neon is at **002 (head)**.

Current unit coverage: 6 frontend tests, including non-COCO class/coefficient decoding and
duplicate suppression; 4 backend scenarios, including extended category schema bounds.
PyTorch/ONNX geometry/mask parity passed on 6 images: bus, zidane, the user glasses example,
wallet, lamp, and perfume. Minimum reconstructed mask IoU was 0.999985. The image verifier's
ONNX/PyTorch output parity is checked during export.

The actual browser regression uses the user's screenshot crop locally and three Wikimedia
examples. It checks that glasses, wallet, spotlight/lamp, and perfume are recognized through
the complete ONNX pipeline. These fixtures are in ignored `ml/checks/`, and that specific
test is skipped if they are absent. No private screenshot is published. The ordinary bus/person
test remains active to prevent a broader vocabulary from breaking existing scene recognition.

Known limits: this is not a 1,227-class benchmark. A category list is not an accuracy guarantee.
Image-text matching may confuse similar objects; close alternatives are marked, ambiguous
secondary matches are suppressed, and only the leading uncertain region may use global context.
Proposal confidence is not the certainty of the final semantic label. Up to 20 proposals are
examined per frame. Physical Android/iPhone and hardware WebGPU remain unverified.
The model license selection is for the user's confirmed non-commercial research/task/personal use.

Local reference images (test-only; not distributed): wallet — Auckland Museum collection,
CC BY 4.0, https://commons.wikimedia.org/wiki/File:Wallet_(AM_1969.3-5).jpg;
lamp — ViajeroExtraviado, CC0, https://commons.wikimedia.org/wiki/File:Black_desk_lamp.jpg;
perfume — Santeri Viinamäki, CC BY-SA 4.0,
https://commons.wikimedia.org/wiki/File:Perfume_glass_bottle.jpg.

The sections below describe the original v1 baseline; see this section and the current generated
validation report for v2 rather than interpreting the old 80-class results as a broad accuracy claim.

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
