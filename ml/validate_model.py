"""Compare PyTorch and ONNX boxes, confidence and segmentation on identical letterboxed images."""
import argparse
import json
from pathlib import Path
import numpy as np
import onnxruntime as ort
from ultralytics import YOLOE
from ultralytics.utils.ops import process_mask
from ultralytics.utils.nms import non_max_suppression
import torch

def validate(images):
    root=Path(__file__).resolve().parents[1]
    torch.set_num_threads(4)
    manifest=json.loads((root/'ml/model-metadata.json').read_text())
    model=YOLOE(manifest['name']+'.pt');model.load_prompt_embeddings(manifest['name']+'.npz');model.model.eval()
    session=ort.InferenceSession(manifest['name']+'.onnx',providers=['CPUExecutionProvider'])
    nc=len(manifest['labels'])
    reports=[]
    for path in images:
        # Both backends receive the exact same normalized, square input.
        from PIL import Image
        image=Image.open(path).convert('RGB');w,h=image.size;r=min(640/w,640/h);nw,nh=round(w*r),round(h*r)
        canvas=Image.new('RGB',(640,640),(114,114,114));canvas.paste(image.resize((nw,nh)),((640-nw)//2,(640-nh)//2))
        x=np.asarray(canvas).transpose(2,0,1)[None].astype(np.float32)/255
        with torch.no_grad():
            raw=model.model(torch.from_numpy(x))
        pt_pred=raw[0]
        def tensors(value):
            if isinstance(value,torch.Tensor):return [value]
            if isinstance(value,dict):return [t for v in value.values() for t in tensors(v)]
            if isinstance(value,(tuple,list)):return [t for v in value for t in tensors(v)]
            return []
        pt_pred=next(t for t in tensors(raw) if list(t.shape)==manifest['outputs'][0])
        pt_proto=next(t for t in tensors(raw) if list(t.shape)==[1,32,160,160])
        outputs=session.run(None,{session.get_inputs()[0].name:x})
        det=next(o for o in outputs if o.ndim==3);proto=next(o for o in outputs if o.ndim==4)
        a=non_max_suppression(pt_pred.clone(),conf_thres=.5,iou_thres=.45,nc=nc)[0]
        b=non_max_suppression(torch.from_numpy(det),conf_thres=.5,iou_thres=.45,nc=nc)[0]
        if len(a)!=len(b):raise AssertionError(f'{path}: detection counts differ: {len(a)} vs {len(b)}')
        masks=[]
        if len(a):
            np.testing.assert_allclose(a[:,:6].numpy(),b[:,:6].numpy(),rtol=.005,atol=.1)
            ma=process_mask(pt_proto[0],a[:,6:],a[:,:4],(640,640),upsample=True)
            mb=process_mask(torch.from_numpy(proto[0]),b[:,6:],b[:,:4],(640,640),upsample=True)
            for p,q in zip(ma.bool(),mb.bool()):
                iou=((p&q).sum()/torch.clamp((p|q).sum(),min=1)).item();masks.append(iou)
                assert iou>.98,f'Mask IoU too low: {iou}'
        reports.append({'image':str(path),'objects':len(a),'min_mask_iou':min(masks) if masks else None,'status':'passed'})
    (root/'ml/validation-report.json').write_text(json.dumps(reports,indent=2));print(json.dumps(reports,indent=2))
if __name__=='__main__':
    parser=argparse.ArgumentParser();parser.add_argument('images',nargs='+');validate(parser.parse_args().images)
