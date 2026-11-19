"""Optional dataset evaluation and fine tuning, isolated from production."""
import argparse
from ultralytics import YOLO
parser=argparse.ArgumentParser();parser.add_argument('--data',default='coco8-seg.yaml');parser.add_argument('--train',action='store_true');parser.add_argument('--epochs',type=int,default=30)
args=parser.parse_args();model=YOLO('yolov8n-seg.pt')
if args.train:model.train(data=args.data,epochs=args.epochs,imgsz=640)
print(model.val(data=args.data,imgsz=640))
