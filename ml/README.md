# Model development

Model: **Ultralytics YOLOv8n-seg**, pretrained COCO, 80 classes. Source weights:
https://github.com/ultralytics/assets (official Ultralytics release download, `yolov8n-seg.pt`).
The Ultralytics toolchain and weights are AGPL-3.0; review redistribution/source disclosure
obligations or obtain an appropriate enterprise license from Ultralytics for proprietary deployment.
This repository does not assert a different license for the model.

Use a separate Python 3.12 environment here. Never include this environment in the backend deployment.

```sh
python -m venv .venv
# activate the environment, then:
pip install -r requirements.txt
python export_model.py
python validate_model.py path/to/image1.jpg path/to/image2.jpg
python evaluate.py --data coco8-seg.yaml
# Optional fine tuning:
python evaluate.py --train --data your-dataset.yaml --epochs 30
```

Export: float32, opset 17, static batch 1, 640 × 640 RGB, no embedded NMS, no dynamic axes.
Input: `[1,3,640,640]`, normalized 0–1, pad 114, centered letterbox.
Outputs: `[1,116,8400]` (xywh + 80 class scores + 32 mask coefficients),
`[1,32,160,160]` segmentation prototypes. Decoder rejects other output contracts.
Class-aware NMS uses IoU .45, minimum decoding confidence .1, max 100 detections.
Masks are sigmoid-thresholded at .5, cropped to boxes and encoded as RLE in original aspect ratio.
Export generates metadata with SHA-256 and labels alongside the model.

`validate_model.py` feeds identical letterboxed images to PyTorch and ONNX Runtime CPU,
compares class/box/confidence outputs and checks reconstructed masks exceed .98 IoU.
It writes `validation-report.json`. Browser performance and parity are separate checks.
For browser or CDN deployment keep model URL, model version and metadata together, use a
versioned filename if replacing weights, and set MIME `application/octet-stream` plus a cache policy.
The browser caches the model by URL and the worker is reused across detection routes.
No universal FPS or cross-device compatibility claim is made.
