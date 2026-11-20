# Vision Studio

Approved direction: 19 November 2026. Visionary AI is a personal/research computer-vision
workspace. Its principal task is to identify and inspect objects from a camera or photo, then
save meaningful snapshots privately. Product behavior is defined in `prd.md` and `prompt.md`.

## Visual world

Use neutral graphite surfaces and cyan detection/action accents. Dark is the default; a single icon toggles directly between Light and Dark, stored locally
per browser. The theme bootstrap runs before paint.
There is no System menu option; an existing System preference is migrated once to the current
resolved Light/Dark value. Manrope is self-hosted
through Fontsource, with distinct heading, body, metadata, and numeric hierarchy.

Tokens live in `frontend/src/studio.css`; structural styles in `app.css`; the studio's component
and responsive treatment in `studio-overrides.css`. Use semantic tokens rather than page-specific
literal colors. Dark: background #171717, surface #202020, raised #292929, text #f5f5f5,
secondary #b3b8b8, border #3b3e3e, accent #32c8c2. Light uses pearl backgrounds and a darker
teal accent so text and controls remain readable. Keep borders quiet, corners 8–16px, and
resting surfaces flat. Avoid glow, decorative grids, glass, and scan loops. The public landing
page uses finite, staggered entrances and illustrative annotation reveals at the user's request.
Workspace pages retain immediate rendering; reduced motion keeps the landing page static.

## Surfaces

- Landing (Persuade): a large photographic sample and a clear camera/upload choice. Sample
  annotations are explicitly illustrative, can be hidden, and never download models or start
  inference. Visitors can isolate Plant, Cup, Book, or Keyboard annotations and restore all
  four with native buttons. The vocabulary count is generated from the actual model manifest.
  Features use concise linked rows; the privacy explanation opens into a horizontal sequence
  on desktop and a vertical sequence on phones. The closing action is left-aligned.
- Public navigation is shared with About: Home, Features, How it works, and About. It stays
  visible while scrolling, with a solid background and anchor offsets below the header.
  Active colors follow the route, selected hash, and the section reached while scrolling,
  including browser Back/Forward. Passive scroll events schedule one animation frame only
  when needed; the tracker is cleaned up when leaving the landing page.
  The footer groups Explore/Learn links, gives Privacy a direct destination, and adapts to
  two link columns on phones. About is a public information page at `/about`; `/docs` redirects
  there for old bookmarks. Plain explanations come first, technical details are expandable,
  category search remains available, and Privacy has its own `#privacy` anchor. No detection
  CTA appears in the About introduction. The workspace sidebar omits the former help-guide item.
  Category search uses English guidance and an accessible suggestion list drawn only from
  supported model names. Popular categories are offered on focus; typing narrows suggestions,
  with keyboard and touch selection. Do not add language-specific example aliases to the UI.
- Detection (Operate): camera/photo is the largest work region. Video and detection overlay remain
  one live view. A right rail prioritizes results, with real crop thumbnails and category counts,
  followed by detection settings. Thumbnails come from the immutable analyzed frame, not the live
  video or a replacement photo. Save stores the same analyzed image and metadata together.
- Recent snapshots: real account-owned data only; guests and empty accounts receive clear empty
  states. Refresh after a successful save. No fabricated history, usage, or detection statistics.
- Dashboard/analytics (Operate): genuine totals, activity, and recent photographs; charts use a
  single data hue. History emphasizes photo previews, readable metadata, search, and source filters.
- Auth/settings/docs: the same surfaces, input language, theme control, and type hierarchy. Auth
  uses an open, cardless two-column composition with a transparent illustration of everyday
  objects, small sample annotations, and consistently sized fields. Registration is top-aligned;
  the shorter login form is vertically centered against the left composition. The desk
  photograph is reserved for marketing. Fields retain labels and leading icons; forms and
  privacy explanations remain functional.

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

Check one-click Dark/Light persistence, migration of legacy System choices, example annotations, camera playback with live
overlays, multiple objects, exact-frame saving, history/detail/analytics/settings, and logout.
Inspect real pages at 1440, 768, and 390px. The two independent camera/result columns have
content-driven heights; do not stretch an empty panel solely to align its bottom edge.
The responsive regression matrix also covers 320–1440px at breakpoint boundaries in both
themes with populated data. Below 380px, metrics become a single column so large counts and
long names remain readable. Mobile workspace navigation acts as a dismissible modal drawer:
background inert, keyboard focus contained/restored, body scroll locked, and contents scrollable
within the dynamic viewport. Public Dashboard navigation uses a compact phone treatment.

Landing inspection deliberately allows `still-page`: the annotation toggle supplies interaction,
and camera video starts only after an explicit user action in the workspace. No decorative video
or automatic motion is added to compete with inference or consume additional bandwidth. The
remaining font-size-count warning reflects display, heading, body, data, and brand roles across
responsive breakpoints. The workspace's unequal-column-height warning is intentional, as above.

## Asset provenance

`frontend/static/images/studio-desk.webp` is an AI-generated illustrative desk photograph made
for this redesign using Imagegen. The WebP is 199,528 bytes. It is used for marketing,
never as a substitute for user camera frames or saved images. All annotation controls and page
text are real UI. No private regression image or user screenshot is published.

Skills applied: Frontend Design, UI Taste, design-taste frontend, Impeccable craft guidance, and
Imagegen. Impeccable's executable context engine was unavailable; project context was read
directly. No executable Impeccable audit or pixel-perfect fidelity claim is made.

`frontend/static/images/auth-objects.webp` is a separate AI-generated transparent illustration
of headphones, a book, and a cup (98,998 bytes). Auth annotations are illustrative HTML, not
model results. Auth layout has one canonical stylesheet (`frontend/src/auth.css`) so old card
and flex rules cannot distort its columns. There is no photographic desk panel or camera/lens
product image on login/register. The main header has Login for guests and Dashboard for signed-in
users; camera/photo exploration remains available from the landing hero.
