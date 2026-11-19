# Vision Studio

Approved direction: 19 November 2026. Visionary AI is a personal/research computer-vision
workspace. Its principal task is to identify and inspect objects from a camera or photo, then
save meaningful snapshots privately. Product behavior is defined in `prd.md` and `prompt.md`.

## Visual world

Use neutral graphite surfaces and cyan detection/action accents. Dark is the default; Light and
System are first-class choices stored locally per browser. The theme bootstrap runs before paint.
System follows the OS preference, including changes while the page is open. Manrope is self-hosted
through Fontsource, with distinct heading, body, metadata, and numeric hierarchy.

Tokens live in `frontend/src/studio.css`; structural styles in `app.css`; the studio's component
and responsive treatment in `studio-overrides.css`. Use semantic tokens rather than page-specific
literal colors. Dark: background #171717, surface #202020, raised #292929, text #f5f5f5,
secondary #b3b8b8, border #3b3e3e, accent #32c8c2. Light uses pearl backgrounds and a darker
teal accent so text and controls remain readable. Keep borders quiet, corners 8–16px, and
resting surfaces flat. Avoid glow, decorative grids, glass, scan loops, or page-entry choreography.

## Surfaces

- Landing (Persuade): a large photographic sample and a clear camera/upload choice. Sample
  annotations are explicitly illustrative, can be hidden, and never download models or start
  inference. The vocabulary count is generated from the actual model manifest.
- Detection (Operate): camera/photo is the largest work region. Video and detection overlay remain
  one live view. A right rail prioritizes results, with real crop thumbnails and category counts,
  followed by detection settings. Thumbnails come from the immutable analyzed frame, not the live
  video or a replacement photo. Save stores the same analyzed image and metadata together.
- Recent snapshots: real account-owned data only; guests and empty accounts receive clear empty
  states. Refresh after a successful save. No fabricated history, usage, or detection statistics.
- Dashboard/analytics (Operate): genuine totals, activity, and recent photographs; charts use a
  single data hue. History emphasizes photo previews, readable metadata, search, and source filters.
- Auth/settings/docs: the same surfaces, input language, theme control, and type hierarchy. Auth
  uses the project's illustrative photograph; forms and privacy explanations remain functional.

The approved mockup is a visual direction, not a flattened interface asset. The implemented shell
retains a global header for theme/account access and adapts the proposed layout to existing routes.
The result list groups categories and shows a crop from the first visible instance, with the count
covering all visible instances. Full individual predictions remain available below it.

## Responsive behavior and quality

Desktop uses a 232px sidebar and camera/result columns. Navigation folds at 1050px; the rail
reflows below the camera on small screens. At phone width, results precede settings. Preserve
camera controls, save, keyboard focus, and native labeled controls in both themes. Primary
controls are at least 42px tall, and phone controls use 44px targets. Supporting metadata can
be 11–12px; object names and task controls have stronger hierarchy. Respect reduced motion.

Check Dark/Light/System persistence, OS changes, example annotations, camera playback with live
overlays, multiple objects, exact-frame saving, history/detail/analytics/settings, and logout.
Inspect real pages at 1440, 768, and 390px. The two independent camera/result columns have
content-driven heights; do not stretch an empty panel solely to align its bottom edge.

Landing inspection deliberately allows `still-page`: the annotation toggle supplies interaction,
and camera video starts only after an explicit user action in the workspace. No decorative video
or automatic motion is added to compete with inference or consume additional bandwidth. The
remaining font-size-count warning reflects display, heading, body, data, and brand roles across
responsive breakpoints. The workspace's unequal-column-height warning is intentional, as above.

## Asset provenance

`frontend/static/images/studio-desk.webp` is an AI-generated illustrative desk photograph made
for this redesign using Imagegen. The WebP is 199,528 bytes. It is used for marketing and auth,
never as a substitute for user camera frames or saved images. All annotation controls and page
text are real UI. No private regression image or user screenshot is published.

Skills applied: Frontend Design, UI Taste, design-taste frontend, Impeccable craft guidance, and
Imagegen. Impeccable's executable context engine was unavailable; project context was read
directly. No executable Impeccable audit or pixel-perfect fidelity claim is made.
