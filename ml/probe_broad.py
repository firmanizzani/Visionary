"""Evaluate candidate vocabularies on supplied failure cases, without changing production assets."""
import argparse
import json
from pathlib import Path
import yaml
import ultralytics
from ultralytics import YOLOE
import torch
torch.set_num_threads(4)

def vocabulary():
    path=Path(ultralytics.__file__).parent/'cfg/datasets/lvis.yaml'
    names=yaml.safe_load(path.read_text(encoding='utf-8'))['names']
    labels=[name.split('/')[0].strip() for name in names.values()]
    # Include every previous COCO category for compatibility of everyday coverage.
    coco=yaml.safe_load((path.parent/'coco.yaml').read_text(encoding='utf-8'))['names']
    for name in list(coco.values())+['perfume bottle','desk lamp','smartphone','power bank','charger','earbuds','headphones','USB cable','computer monitor']:
        if name not in labels:labels.append(name)
    return labels

if __name__=='__main__':
    p=argparse.ArgumentParser();p.add_argument('--checkpoint',default='yoloe-26s-seg.pt');p.add_argument('images',nargs='+');args=p.parse_args()
    labels=vocabulary();print('Preparing',len(labels),'class embeddings',flush=True);model=YOLOE(args.checkpoint)
    profile=Path(args.checkpoint).with_suffix('.npz')
    if profile.exists():model.load_prompt_embeddings(profile)
    else:model.set_classes(labels,model.model.get_text_pe(labels,batch=16))
    print('Vocabulary ready; evaluating',flush=True)
    model.save_prompt_embeddings(str(Path(args.checkpoint).with_suffix('.npz')))
    report=[]
    for image in args.images:
        result=model.predict(image,conf=.1,iou=.45,device='cpu',verbose=False)[0]
        rows=[{'label':result.names[int(c)],'confidence':round(float(conf),4),'box':box.tolist()} for c,conf,box in zip(result.boxes.cls,result.boxes.conf,result.boxes.xyxy)]
        print(image,json.dumps(rows));report.append({'image':image,'objects':rows})
    Path('checks/'+Path(args.checkpoint).stem+'-probe.json').write_text(json.dumps({'model':args.checkpoint,'classes':len(labels),'results':report},indent=2))
