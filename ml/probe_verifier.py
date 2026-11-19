"""Evaluate independent image-text label verification on actual failure examples."""
import json
from pathlib import Path
import torch
torch.set_num_threads(4)
from PIL import Image
import mobileclip
from probe_broad import vocabulary

if __name__=='__main__':
    model,_,preprocess=mobileclip.create_model_and_transforms('mobileclip_s0',pretrained='mobileclip_s0.pt')
    model.eval();tokenizer=mobileclip.get_tokenizer('mobileclip_s0');labels=vocabulary()
    cache=Path('checks/verifier-text.pt')
    with torch.inference_mode():
        if cache.exists():text=torch.load(cache)
        else:
            text=torch.cat([model.encode_text(tokenizer(['a photo of a '+name for name in labels[i:i+32]])) for i in range(0,len(labels),32)])
            text=text/text.norm(dim=-1,keepdim=True);torch.save(text,cache)
        for name in ['user-glasses','wallet','lamp','perfume']:
            path=Path('checks')/(name+('.png' if name=='user-glasses' else '.jpg'))
            image=Image.open(path).convert('RGB')
            image=preprocess(image).unsqueeze(0);embedding=model.encode_image(image);embedding/=embedding.norm(dim=-1,keepdim=True)
            cosine=embedding@text.T;values,indices=cosine.topk(5)
            print(name,[(labels[int(i)],round(float(v),4)) for i,v in zip(indices[0],values[0])],flush=True)
