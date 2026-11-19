"""Reproducible broad-vocabulary YOLOE browser export. Never run in production backend."""
import argparse
from functools import partial
import hashlib
import json
import shutil
from pathlib import Path
from ultralytics import YOLOE
import torch
import onnx
from probe_broad import vocabulary

ROOT=Path(__file__).resolve().parents[1]
def export(checkpoint):
    torch.set_num_threads(4)
    torch.onnx.export=partial(torch.onnx.export,dynamo=False)
    model=YOLOE(checkpoint)
    profile=Path(checkpoint).with_suffix('.npz')
    if profile.exists():model.load_prompt_embeddings(profile)
    else:
        labels=vocabulary();model.set_classes(labels,model.model.get_text_pe(labels,batch=16));model.save_prompt_embeddings(profile)
    # nms=None explicitly exports raw one-to-many predictions in the pinned Ultralytics version.
    # nms=False selects the newer end-to-end branch and changes the tensor layout.
    path=model.export(format='onnx',imgsz=640,opset=17,simplify=True,dynamic=False,nms=None,device='cpu')
    graph=onnx.load(path);onnx.checker.check_model(graph)
    shapes=[[d.dim_value for d in o.type.tensor_type.shape.dim] for o in graph.graph.output]
    labels=list(model.names.values());head=model.model.model[-1];channels=int(head.nm)
    assert shapes==[[1,4+len(labels)+channels,8400],[1,channels,160,160]],shapes
    version=Path(checkpoint).stem+'-lvis-v2';dest=ROOT/'frontend/static/models'/version;dest.mkdir(parents=True,exist_ok=True)
    payload=Path(path).read_bytes();parts=[]
    # Each shard stays below GitHub's file-size limit; no paid CDN or AI service is needed.
    for i,start in enumerate(range(0,len(payload),24*1024*1024)):
        data=payload[start:start+24*1024*1024];name=f'weights-{i:02d}.bin';(dest/name).write_bytes(data)
        parts.append({'file':name,'bytes':len(data),'sha256':hashlib.sha256(data).hexdigest()})
    metadata={'name':Path(checkpoint).stem,'version':version,'baseUrl':f'/models/{version}/','license':'AGPL-3.0','source':'https://github.com/ultralytics/assets/releases/tag/v8.4.0','inputSize':640,'maskChannels':channels,'outputs':shapes,'opset':17,'sha256':hashlib.sha256(payload).hexdigest(),'bytes':len(payload),'parts':parts,'labels':labels}
    for target in [dest/'manifest.json',ROOT/'ml/model-metadata.json',ROOT/'frontend/src/lib/ai/model.json']:
        target.write_text(json.dumps(metadata,indent=2),encoding='utf-8')
    print('Exported',len(labels),'categories;',len(payload),'bytes;',len(parts),'shards;',metadata['sha256'])
if __name__=='__main__':
    p=argparse.ArgumentParser();p.add_argument('--checkpoint',default='yoloe-26m-seg.pt');export(p.parse_args().checkpoint)
