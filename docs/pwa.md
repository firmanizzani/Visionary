# Installing Visionary AI

Open the workspace sidebar and click the account identity (avatar/name). Choose
**Install app** from the panel above it. The sign-out control remains separate.

- Chrome/Edge: the action immediately calls `navigator.install()` when available,
  otherwise a captured `beforeinstallprompt` event opens the native prompt. No
  instructions are shown before a supported native installer. Cancellation leaves
  the action available without an extra instruction panel.
  When neither mechanism is available, it explains where to find installation in
  the browser menu. Instructions replace the action instead of repeating it above.
- iPhone/iPad: open the site in Safari, choose **Share → Add to Home Screen**, keep
  **Open as Web App** enabled if shown, and tap **Add**. Safari uses this manual flow.
- In standalone mode or after installation is confirmed, the account panel shows
  **App installed** instead of another install action. Browsers do not universally
  report installations made in other browser profiles or on other devices.

The manifest starts at `/dashboard`, uses a stable root ID, and includes 192px,
512px, maskable, and Apple touch icons based on the existing brand mark. No new
backend service, environment variable, or paid provider is required.

The browser tab favicon follows the user's saved Light/Dark selection, including
initial page load and changes made in another tab. Browser/window theme color
follows that same selection. Installed Home Screen/desktop icons and the Apple
touch icon retain the fixed dark brand identity; the manifest URL stays stable.

## Offline and updates

The production service worker is registered by SvelteKit. It precaches only the
small offline page, manifest and app icons; visited immutable JS/CSS/font files
may then be cached. It never caches API responses, private photos or model files.
Existing model storage remains managed by the detection pipeline. Installation
does not automatically download the roughly 90 MB of model weights.

An offline navigation displays a reconnect page with **Try again**. This PWA does
not promise offline sign-in, saved history, or first-time model loading. A failed
API request remains a failed request rather than being replaced by cached private
data. New service workers wait for existing tabs/windows to close, so an update
does not replace code during a running camera session. Only old caches with the
`visionary-shell-` prefix are deleted on activation.

## Verification

Use the production build, not the Vite development server, to test the worker:

```powershell
# Terminal 1, from frontend; backend needs to allow this local frontend origin.
$env:BACKEND_ORIGIN='http://127.0.0.1:8005'
npm run build
npm run preview -- --port 5195 --strictPort

# Terminal 2, from frontend
$env:TEST_BASE_URL='http://127.0.0.1:5195'
$env:TEST_PWA_BUILD='1'
npx playwright test e2e/pwa.spec.ts
npx tsc -p src/service-worker/tsconfig.json --noEmit
```

The PWA suite covers retained install events across client navigation, account-menu
keyboard/outside-click behavior, both themes at phone width, Safari instructions,
installed-state behavior, real worker activation, offline/reconnect navigation,
cache exclusions, and Chrome manifest/installability checks in a persistent profile.
Native install acceptance is simulated; no operating-system app is installed by
the test. Physical iPhone installation and camera use remain device acceptance checks.
