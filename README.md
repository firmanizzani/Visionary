# Visionary AI

Identify, inspect, and count everyday objects using your camera or a photo.

Visionary AI highlights objects with bounding boxes and segmentation masks, shows
what it finds, and lets you save detections in a private workspace. Recognition runs
in your browser; account services handle saved snapshots, history, and analytics.

**[Open Visionary AI](https://visionary-ai-web.vercel.app/)**

## What you can do

| Feature | How it works |
| --- | --- |
| **Live detection** | Start your camera and see verified detections appear automatically while the video keeps playing. Switch between available cameras and stop to inspect the last analyzed frame. |
| **Image detection** | Upload a JPG, PNG, or WebP image up to 10 MB, then analyze its objects. |
| **Visual results** | Choose boxes, masks, or both. Inspect object thumbnails, category counts, confidence scores, and individual predictions. |
| **Detection controls** | Adjust the confidence threshold and show or hide confidence labels. The threshold filters results without requiring another scan. |
| **Private snapshots** | Sign in to save an analyzed image together with its detections. Revisit its overlays or delete the snapshot later. |
| **Detection history** | Browse saved snapshots, search object labels, filter camera versus image uploads, and open snapshot details. |
| **Overview and analytics** | Review saved-detection totals, object categories, activity, and camera/image sources. Filter analytics by time period. |
| **Profile and preferences** | Edit your name, change your password, and save default detection and camera preferences. |
| **Installable PWA** | Install Visionary AI from the account menu and launch it from your Home Screen or desktop. |
| **Mobile and theme support** | Use responsive navigation and controls on smaller screens. Switch directly between light and dark mode; your choice and browser favicon stay in sync. |

You can try camera and image detection **without an account**. Sign in to save
snapshots and use your personal history, analytics, and preferences.

## How to use it

1. Open the website and choose **Live detection** or **Image detection**.
2. Allow camera access and press **Start camera**, or choose a photo and press
   **Detect objects**.
3. Inspect the labels, counts, and overlays. Adjust the display settings if needed.
4. Sign in and choose **Save snapshot** to keep that analyzed image and its results.
5. Open **Detection history** to revisit a snapshot, or **Analytics** to explore
   patterns in your saved detections.

Live scanning updates automatically: you do not need to move the confidence slider
to trigger a result. Counts describe the analyzed frame, rather than a running
total of unique objects across the camera session.

## Object recognition

The current model vocabulary contains **1,227 category names**, including people,
vehicles, animals, and everyday items such as wallets, sunglasses, and perfume bottles.
The About page includes a searchable category guide with suggestions.

Recognition combines **YOLOE-26s** object detection and instance segmentation with
**MobileCLIP2-S0** label verification. Live results appear progressively as regions
are verified. Stable regions can briefly reuse verified labels, while their boxes,
scores, and masks come from the latest analyzed frame.

The first scan downloads and prepares the models. Startup and update speed depend
on your connection, browser, device, and scene. Overlays can trail moving objects.
A supported category is not a guarantee of a correct detection, and confidence
scores should not be treated as calibrated probabilities of label correctness.

## Privacy and saved data

- Camera frames and selected photos are analyzed on your device, inside the browser.
- Images are uploaded only when you explicitly save a snapshot.
- Saved images use authenticated Cloudinary storage; account information and
  detection metadata are stored in Neon PostgreSQL.
- Saved history and analytics belong to the signed-in account. Analytics count
  saved detections, not everything viewed through the camera.

More detail is available in the website's [About → Privacy section](https://visionary-ai-web.vercel.app/about#privacy).

## Install the app

In the workspace sidebar, click your **account name or avatar**, then **Install app**.

- **Supported desktop/Android browsers:** the action opens the browser's installer
  when an installation API is available. Otherwise, it displays browser-specific help.
- **iPhone/iPad:** open the site in Safari and choose **Share → Add to Home Screen**.
  Keep **Open as Web App** enabled if shown, then tap **Add**.

Installation does not make every feature available offline. Offline navigation
shows a reconnect page; signing in, saving or viewing snapshots, and downloading
models for the first time need an internet connection. The installed app icon keeps
its fixed dark brand identity, independently of the website's selected theme.

See the [PWA guide](docs/pwa.md) for installation and update behavior.

## Run or deploy your own instance

Local development requires **Node.js 24.x**, **Python 3.12**, and configured Neon
and Cloudinary accounts. Follow the [local development guide](docs/local-development.md)
for setup and startup commands.

For Vercel, use **two projects** with `frontend` and `backend` as their respective
Root Directories. The exported browser models are already included in
`frontend/static/models/`: the `ml` folder is for optional model export, evaluation,
or training and does **not** need to be deployed.

Follow the [deployment guide](docs/deployment.md) for environment variables, HTTPS
origins, secure cookies, migrations, and scheduled cleanup. Local `.env` files are
private and do not automatically populate Vercel's environment settings.

## Technology

| Area | Stack |
| --- | --- |
| Interface | SvelteKit, TypeScript, Tailwind CSS, Bits UI, Lucide |
| Browser recognition | ONNX Runtime Web, WebGPU where supported, WebAssembly fallback |
| Account and storage API | FastAPI, SQLAlchemy, Argon2, JWT-based sessions |
| Persistent storage | Neon PostgreSQL and Cloudinary |
| Hosting | Separate frontend and backend Vercel projects |

## Documentation

| Guide | Contents |
| --- | --- |
| [Local development](docs/local-development.md) | Requirements, environment files, startup, and checks |
| [Deployment](docs/deployment.md) | Vercel setup, production configuration, and cleanup |
| [PWA](docs/pwa.md) | Installation, offline behavior, icons, and updates |
| [Testing](docs/testing.md) | Verification results, browser coverage, and device-testing limits |
| [Scanning performance](docs/scanning-performance.md) | Progressive results, label reuse, and local timing comparisons |
| [Design](DESIGN.md) | Visual identity, responsive layouts, and interaction guidelines |
| [Browser models](ml/README.md) | Model exports, vocabulary, evaluation, and upstream licenses |

## Model licenses

The bundled MobileCLIP2 verifier weights use the **Apple Machine Learning Research
Model license for non-commercial research**. YOLOE/Ultralytics models and tooling
have their own upstream license terms. This project does not relicense those assets.
See [model sources and licenses](ml/README.md#licenses) and the license files shipped
alongside the browser models.
