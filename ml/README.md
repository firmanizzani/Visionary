# Browser models

Visionary AI now combines **YOLOE-26s instance segmentation** with **MobileCLIP2-S0 label matching**.
The fixed vocabulary contains **1,227 category names**: LVIS's 1,203 object names (first synonyms),
missing COCO categories, and a few everyday electronics/toiletry categories. `probe_broad.vocabulary()`
is the reproducible source. `frontend/src/lib/ai/model.json` and `verifier.json` carry identical labels.
Do not append names to these files manually: embeddings and YOLO class indices must be regenerated together.

## Reproduce

Use a separate Python 3.12 environment in `ml`; never deploy it with FastAPI.

```sh
python -m venv .venv
# Activate the environment, then:
pip install -r requirements.txt
python export_model.py --checkpoint yoloe-26s-seg.pt
python export_verifier.py
python validate_model.py fixtures/bus.jpg fixtures/zidane.jpg
```

The YOLOE export downloads the official checkpoint and text encoder on first use. Prompt embeddings
are prepared offline, so browsers do not run a text encoder. The verifier uses OpenCLIP's
`MobileCLIP2-S0` / `dfndr2b` checkpoint, reparameterized for inference. It averages normalized text
embeddings for three standard templates before normalizing again. Model sources and weight hashes
are recorded in the generated manifests. All prototype vectors are actual model outputs.

YOLOE input: `[1,3,640,640]`, RGB, float32, 0–1, centered letterbox with pad 114.
Raw outputs: `[1,1263,8400]` = xywh + 1,227 class scores + 32 mask coefficients,
and `[1,32,160,160]` mask prototypes. Export is static float32 ONNX opset 17.
With the pinned Ultralytics version, `nms=None` selects raw one-to-many output; `nms=False`
selects a different end-to-end branch and must not be substituted without changing the decoder.
The decoder reads class count, input size and mask channels from the manifest and validates shapes.

MobileCLIP2 image input: `[1,3,256,256]`, RGB float32 0–1, zero mean/unit std.
Output is a normalized 512-dimensional vector. Region crops are letterboxed. Ambiguous secondary
matches require label stability under a small expansion of the same region. Text prototypes with
cosine similarity >= .95 can corroborate closely related names. The leading region may use global
context only when high-score proposals do not cover spatially separate items. Scores compare
against the shipped normalized prototype matrix. Contained component proposals are suppressed and
overlapping competing labels are consolidated; spatially separate instances remain separate.
High-confidence people and common vehicles retain their YOLO labels to avoid replacing a person's
label with a clothing/background category. Up to 20 region proposals and masks are examined per frame.

Camera playback uses the native video surface, independently of inference, with the latest detection
overlay in the same aspect-ratio container. There is one live view, with no Analyzed frame selector.
Overlays may trail moving objects and expire 3-10 seconds after their last result, depending on latency.
Stop retains the last immutable analyzed snapshot with aligned overlays; saving always uses that snapshot.
Frames are sampled at a maximum long edge of 960px, with one inference in flight. Live results
are published progressively as regions are verified. Spatially and visually stable regions can
reuse label metadata for up to three uses or ten seconds; geometry, confidence, and masks always
come from the current frame. Scheduling targets a 200ms interval with a minimum 16ms pause after
a completed frame. JPEG encoding happens on save rather than on every analyzed frame.
See [scanning performance](../docs/scanning-performance.md) for the implementation and local measurements.

Localization confidence and label cosine similarity are separate measurements. Neither is a calibrated
probability that a name is correct. Close alternatives are marked uncertain. Similarity thresholds are
heuristics validated on the regression cases; no dataset-wide accuracy claim is made.

## Assets and integrity

Both ONNX models total about 89 MB, plus about 2.5 MB of text prototypes. Export splits weights into
24 MiB files under `frontend/static/models/` so each GitHub file stays below the file-size limit.
Each part and each complete model has a SHA-256 checksum. The browser verifies cached and downloaded
bytes before creating sessions. This prevents stale YOLOv8 assets being decoded with new category names.
Default deployment uses bundled shards. `PUBLIC_MODEL_URL` may override the detector only with a
complete ONNX file whose hash matches `model.json`. Version metadata for saved scans includes verifier
and prototype identity. Legacy snapshots reconstruct their saved overlays without loading any model.

## Evaluation and limits

`validate_model.py` compares PyTorch/ONNX detections and mask IoU on identical letterboxed images.
`export_verifier.py` verifies the image encoder's ONNX/PyTorch numerical parity before publishing assets.
Actual browser regression tests cover the user's glasses failure, wallet, desk lamp, perfume, people,
and a bus. Local user images are intentionally ignored by Git. See `docs/testing.md` for results.
Pretrained inference is not custom training; no user image was used to fit weights or embeddings.
The earlier `evaluate.py` remains a legacy YOLOv8 dataset-training utility, not the new export path.

## Licenses

YOLOE/Ultralytics checkpoints and tooling: AGPL-3.0, official source
https://github.com/ultralytics/assets/releases/tag/v8.4.0.
MobileCLIP2 weights: **Apple Machine Learning Research Model license, non-commercial research only**.
This selection is for the user's confirmed research/task/personal scope, not a commercial deployment.
Apple source and model license texts are included alongside the verifier assets. Source:
https://github.com/apple-aiml-research/ml-mobileclip and the official `timm/MobileCLIP2-S0-OpenCLIP` checkpoint.
Commercial use requires a suitable model/license selection; this repository does not relicense upstream weights.
