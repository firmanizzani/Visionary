# Live detection responsiveness

The camera preview and inference already ran separately. The remaining latency
came from waiting for detection plus every crop-verification pass (up to 20
proposals) before publishing any result. The confidence slider only filters the
current results; it does not start inference. No change to the default 50% threshold
or confidence scores is used to make the scanner appear faster.

Live frames now publish verified regions incrementally, while verification of the
remaining candidates continues. Early previews withhold small contained component
regions until the larger candidate is resolved, avoiding a bottle cap briefly
appearing as an additional item. Final results still use the complete consolidation
step. Image uploads continue to return their final result together.

For stable live regions, a bounded worker-memory cache reuses only label metadata.
A hit requires the same detector proposal class, at least 0.75 box IoU, and a mean
RGB difference no greater than 8/255 in a 16×16 region sample. Entries expire after
10 seconds or three reuses and reset for a new camera session or resolution.
Rejected background regions can also be reused briefly. Current-frame boxes,
confidence scores and segmentation masks are never taken from this cache.

The verifier no longer computes a full-scene embedding when it cannot be used
(established geometry classes, multiple independent regions, or a cache hit).
The next live frame starts without the previous fixed 100 ms minimum pause, while
fast runs retain a 200 ms target interval. Results and saved metadata refer to the
same immutable captured frame, including partial verified results. A stopped or
replaced camera session ignores late updates from its older frame.

## Local comparison, 20 November 2026

Chrome headless, GPU disabled, actual ONNX/WASM models, the same static multi-item
camera fixture, and the untouched 50% threshold:

| Observation | Previous build | Updated build |
| --- | --- | --- |
| First visible verified result, including model preparation | 18.9 s | 4.9 s |
| Wallet, perfume bottle and sunglasses visible together | 18.9 s | 6.0 s |
| First complete frame inference | 14.4 s | 8.0 s |
| Next two complete stable-scene frames | Not sampled | 1.03 s, 1.04 s |

These are individual local fixture runs, not averages, a universal FPS promise or
a physical-phone benchmark. Weights were served locally; a first visit on mobile
data may spend additional time downloading models. Movement, lighting changes,
cache expiry, different objects and device hardware require fresh verification.

Regression coverage includes early results at 50% without any slider interaction,
camera playback during slow inference, real multi-item camera recognition, crop
cache rejection/expiry, component suppression, image inference and exact-frame
snapshot saving. Browser scenarios use a simulated camera; physical phone checks
remain device acceptance work.
