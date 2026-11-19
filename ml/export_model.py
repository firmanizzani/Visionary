"""Reproducible YOLOv8 segmentation browser export. Never run in production backend."""
import hashlib
import json
import shutil
from pathlib import Path
from ultralytics import YOLO
import onnx

ROOT=Path(__file__).resolve().parents[1]
def export():
    model=YOLO('yolov8n-seg.pt')
    path=model.export(format='onnx',imgsz=640,opset=17,simplify=True,dynamic=False,half=False,nms=False,device='cpu')
    graph=onnx.load(path);onnx.checker.check_model(graph)
    dest=ROOT/'frontend/static/models';dest.mkdir(parents=True,exist_ok=True)
    shutil.copyfile(path,dest/'yolov8n-seg.onnx')
    metadata={'name':'YOLOv8n-seg','version':'yolov8n-seg-coco-640-v1','license':'AGPL-3.0','source':'https://github.com/ultralytics/assets','input':[1,3,640,640],'outputs':[[1,116,8400],[1,32,160,160]],'opset':17,'sha256':hashlib.sha256(Path(path).read_bytes()).hexdigest(),'classes':model.names}
    (dest/'metadata.json').write_text(json.dumps(metadata,indent=2))
    (ROOT/'ml/model-metadata.json').write_text(json.dumps(metadata,indent=2))
    print('Exported verified static YOLOv8n-seg ONNX:',metadata['sha256'])
if __name__=='__main__':export()
