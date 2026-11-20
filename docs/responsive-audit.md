# Responsive audit — 19 November 2026

Completed and extended on 20 November 2026 with English category suggestions and a regression
fix for rapid same-page Back/Forward navigation. Scrollspy now derives its state from the
actual viewport; section-history traversal restores its anchor before the indicator changes.
The rapid navigation regression passed ten consecutive runs after the fix.

Scope: preserve Vision Studio while checking public pages, auth, populated workspace screens,
navigation, forms, charts, saved-image overlays, errors and touch controls. No production
account data is used for layout fixtures. Impeccable's executable context engine was already
unavailable in this session; the audit uses direct source review and browser verification.

## Findings addressed

| Severity | Finding | Change |
| --- | --- | --- |
| P1 | Signed-in public header exceeded 320–390px widths. | Compact Dashboard action on phones; the text-only Login keeps its approved proportions. |
| P1 | Large counters expanded mobile statistics columns. | Explicit minimum-zero grid columns, wrapped values, and one-column statistics below 380px. |
| P2 | Mobile drawer lacked backdrop, keyboard dismissal, background isolation and reliable route cleanup. | Added backdrop, Escape, focus containment/restoration, inert background, route dismissal, body-scroll lock, and a scrollable dynamic-height sidebar. |
| P2 | Long overlay labels could draw from a negative x-coordinate and disappear beyond the image edge. | Fit labels to image width, preserve confidence when possible, and clamp the label background within the image. Full names remain in the object list. |
| P2 | Compact controls and input type sizes were inconsistent on phones. | Raised primary workspace actions/segmented controls to 44px, kept text fields/selects at 16px, and enlarged native range hit areas. |
| P3 | History pagination wrapped awkwardly at 320px. | Reduced gaps/padding and kept its page indicator on one line. |

## Coverage

- Eleven routes: home, About, login, registration, dashboard, live detection, image detection,
  history, snapshot details, analytics and settings.
- Thirteen CSS widths: 320, 360, 390, 430, 540, 600, 700, 720, 768, 900, 1024, 1050 and 1440px.
- Both themes: **286 route/theme/width combinations**, including populated data, million-scale
  totals, long names and long category labels. No document overflow or uncaught page errors
  remained in the final matrix. Representative screenshots were visually reviewed.
- Real-service flow: ephemeral account creation/login, saved snapshot upload, image delivery,
  history/details, analytics, settings and logout. Test accounts/assets are cleaned up.
- Actual ONNX inference: bus/person fixture, glasses, wallet, lamp, perfume, and multiple
  objects in one camera frame. Simulated camera playback and overlay behavior are also tested.
- Synthesized touch in Chromium: native confidence-slider drag, menu tap/navigation and a
  short landscape viewport with access to the bottom account controls.
- Keyboard: Escape, focus restoration, background inert state and outside dismissal.
- Category search: English-only guidance, genuine supported suggestions, popular categories,
  Arrow Up/Down and Enter selection, Escape dismissal, touch selection, and a 320px viewport.
- Nineteen frontend unit tests (including narrow overlay labels), six backend tests, and
  nineteen full browser scenarios passed. Svelte check reported zero errors and warnings;
  production build completed. Production UI regressions are recorded in `testing.md`.

## Assessment and limits

Manual technical assessment: accessibility 3/4, performance 3/4, theming 3/4, responsive
behavior 3/4, implementation integrity 4/4 (**16/20**). This is not an automated WCAG
certification or an executable Impeccable detector result. Browser emulation and synthesized
touch do not establish physical iPhone/Android camera performance, Safari keyboard behavior,
OS permission prompts, or hardware WebGPU throughput. Those need device acceptance checks.
One backend warning comes from the upstream AnyIO/Starlette test client, not the app.
