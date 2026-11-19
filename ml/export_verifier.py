"""Export MobileCLIP image encoder and fixed text prototypes; no text encoder ships to browsers."""
import hashlib
import json
from pathlib import Path
import numpy as np
import torch
import mobileclip
import open_clip
from mobileclip.modules.common.mobileone import reparameterize_model
from probe_broad import vocabulary

ROOT=Path(__file__).resolve().parents[1]
class ImageEncoder(torch.nn.Module):
    def __init__(self,model):super().__init__();self.model=model
    def forward(self,image):
        features=self.model.encode_image(image)
        return features/torch.clamp(features.norm(dim=-1,keepdim=True),min=1e-8)

def export():
    torch.set_num_threads(4)
    model,_,_=open_clip.create_model_and_transforms('MobileCLIP2-S0',pretrained='dfndr2b',image_mean=(0,0,0),image_std=(1,1,1),cache_dir='checks/cache');model.eval()
    model=reparameterize_model(model)
    labels=vocabulary();tokenizer=open_clip.get_tokenizer('MobileCLIP2-S0')
    templates=['a photo of a {}','a close-up photo of a {}','a photo of the {}']
    with torch.inference_mode():
        views=[]
        for template in templates:
            features=torch.cat([model.encode_text(tokenizer([template.format(name) for name in labels[i:i+32]])) for i in range(0,len(labels),32)])
            views.append(features/features.norm(dim=-1,keepdim=True))
        text=torch.stack(views).mean(0);text=text/text.norm(dim=-1,keepdim=True)
    encoder=ImageEncoder(model).eval()
    # Remove the unused text tower before tracing the image path.
    encoder.model.text_encoder=torch.nn.Identity()
    destination=ROOT/'frontend/static/models/mobileclip2-s0-v1';destination.mkdir(parents=True,exist_ok=True)
    path=Path('mobileclip2-s0-image.onnx')
    torch.onnx.export(encoder,torch.zeros(1,3,256,256),str(path),input_names=['image'],output_names=['embedding'],opset_version=17,dynamo=False)
    import onnx
    graph=onnx.load(path);onnx.checker.check_model(graph)
    import onnxruntime as ort
    session=ort.InferenceSession(str(path),providers=['CPUExecutionProvider'])
    x=np.random.default_rng(42).random((1,3,256,256),dtype=np.float32)
    with torch.inference_mode():expected=encoder(torch.from_numpy(x)).numpy()
    actual=session.run(None,{'image':x})[0];np.testing.assert_allclose(expected,actual,atol=1e-4,rtol=1e-3)
    weights=path.read_bytes();parts=[]
    for i,start in enumerate(range(0,len(weights),24*1024*1024)):
        data=weights[start:start+24*1024*1024];name=f'weights-{i:02d}.bin';(destination/name).write_bytes(data);parts.append({'file':name,'bytes':len(data),'sha256':hashlib.sha256(data).hexdigest()})
    embeddings=text.cpu().numpy().astype('<f4').tobytes();(destination/'text-embeddings.bin').write_bytes(embeddings)
    metadata={'name':'MobileCLIP2-S0','baseUrl':'/models/mobileclip2-s0-v1/','inputSize':256,'embeddingSize':text.shape[1],'sha256':hashlib.sha256(weights).hexdigest(),'bytes':len(weights),'parts':parts,'textFile':'text-embeddings.bin','textSha256':hashlib.sha256(embeddings).hexdigest(),'templates':templates,'labels':labels,'license':'Apple Model License','source':'https://github.com/apple-aiml-research/ml-mobileclip'}
    (destination/'manifest.json').write_text(json.dumps(metadata,indent=2));(ROOT/'frontend/src/lib/ai/verifier.json').write_text(json.dumps(metadata,indent=2));print('Exported image verifier',len(weights),'bytes; parity passed')
if __name__=='__main__':export()
