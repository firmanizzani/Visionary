import {test,expect} from '@playwright/test';
import {mkdirSync,existsSync,readFileSync} from 'node:fs';
import path from 'node:path';

test('camera keeps playing with visible detection overlays during slow inference',async({page})=>{
 const errors:string[]=[];page.on('pageerror',e=>errors.push(e.message));
 // Deliberately slow model: playback must remain independent of result delivery.
 await page.route(/inference\.worker.*\.(?:js|ts)(?:\?.*)?$/,route=>route.fulfill({contentType:'text/javascript',body:`
  self.onmessage=async({data})=>{
   if(data.type==='init'){postMessage({type:'ready',provider:'wasm'});return;}
   if(data.type==='infer'){
    await new Promise(r=>setTimeout(r,1800));data.bitmap.close();
    postMessage({type:'result',id:data.id,latency:1800,objects:[
     {class_id:0,object_name:'person',confidence:.9,bounding_box:[40,40,180,180]},
     {class_id:1,object_name:'wallet',confidence:.8,bounding_box:[220,40,340,180]}
    ]});
   }
  };
 `}));
 await page.goto('/detect/live');await page.locator('html[data-app-ready=true]').waitFor();
 await page.getByRole('button',{name:'Start camera',exact:true}).first().click();
 const video=page.getByLabel('Live camera preview');
 await expect(page.getByRole('button',{name:'Stop camera'})).toBeVisible();
 const time=await video.evaluate((v:HTMLVideoElement)=>v.currentTime);
 const frames=await video.evaluate((v:HTMLVideoElement)=>v.getVideoPlaybackQuality().totalVideoFrames);
 await expect(page.locator('.object-counts')).toContainText('wallet');
 await expect(page.locator('.count-pill')).toHaveText('2');
 await expect(page.locator('.object-thumbnail')).toHaveCount(2);
 expect(await page.locator('.object-thumbnail').evaluateAll(nodes=>nodes.every(node=>{const c=node as HTMLCanvasElement;return c.width>0&&c.getContext('2d')!.getImageData(0,0,c.width,c.height).data.some((value,i)=>i%4===3&&value>0);}))).toBe(true);
 await expect(video).toBeVisible();await expect(page.locator('.live-camera')).not.toHaveClass(/preview-hidden/);
 expect(await video.evaluate((v:HTMLVideoElement)=>v.currentTime)).toBeGreaterThan(time+1);
 expect(await video.evaluate((v:HTMLVideoElement)=>v.getVideoPlaybackQuality().totalVideoFrames)).toBeGreaterThan(frames+5);
 await expect(page.getByLabel('Analyzed camera frame')).toHaveCount(0);
 await expect(page.locator('.live-camera .detection-overlay')).toBeVisible();
 expect(await page.locator('.live-camera .detection-overlay').evaluate((c:HTMLCanvasElement)=>c.getContext('2d')!.getImageData(0,0,c.width,c.height).data.some((v,i)=>i%4===3&&v>0))).toBe(true);
 const overlayTime=await video.evaluate((v:HTMLVideoElement)=>v.currentTime);
 await expect.poll(()=>video.evaluate((v:HTMLVideoElement)=>v.currentTime)).toBeGreaterThan(overlayTime+.5);
 mkdirSync('../.taste-skill/camera',{recursive:true});
 for(const width of [1440,768,390]){
  await page.setViewportSize({width,height:900});
  expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true);
  const bounds=await page.evaluate(()=>{const v=document.querySelector('video')!.getBoundingClientRect(),o=document.querySelector('.live-camera .detection-overlay')!.getBoundingClientRect();return [v.x-o.x,v.y-o.y,v.width-o.width,v.height-o.height];});
  expect(bounds.every(d=>Math.abs(d)<1)).toBe(true);
  await page.screenshot({path:`../.taste-skill/camera/live-${width}.png`,fullPage:true,animations:'disabled'});
 }
 await expect(page.getByRole('button',{name:'Analyzed frame',exact:true})).toHaveCount(0);
 const track=await video.evaluateHandle((v:HTMLVideoElement)=>(v.srcObject as MediaStream).getVideoTracks()[0]);
 await page.getByRole('button',{name:'Stop camera'}).click();
 expect(await track.evaluate(t=>t.readyState)).toBe('ended');
 await expect(page.getByLabel('Analyzed camera frame')).toBeVisible();
 await page.getByRole('button',{name:'Start camera',exact:true}).click();
 await expect(video).toBeVisible();await expect(page.locator('.live-camera')).not.toHaveClass(/preview-hidden/);
 await expect(page.locator('.live-camera .detection-overlay')).toBeVisible();
 await page.getByRole('button',{name:'Stop camera'}).click();
 expect(errors).toEqual([]);
});

test('real camera pipeline recognizes several objects in one frame',async({page})=>{
 const fixture=path.resolve('../ml/checks/multi-items.jpg');
 test.skip(!existsSync(fixture),'Local regression images are intentionally not distributed.');
 await page.addInitScript((dataUrl)=>{
  navigator.mediaDevices.getUserMedia=async()=>{
   const image=new Image();image.src=dataUrl;await image.decode();
   const canvas=document.createElement('canvas');canvas.width=image.width;canvas.height=image.height;
   const draw=()=>canvas.getContext('2d')!.drawImage(image,0,0);
   draw();const timer=setInterval(draw,100),stream=canvas.captureStream(30);
   stream.getVideoTracks()[0].addEventListener('ended',()=>clearInterval(timer));return stream;
  };
 },'data:image/jpeg;base64,'+readFileSync(fixture).toString('base64'));
 await page.goto('/detect/live');await page.locator('html[data-app-ready=true]').waitFor();
 await page.getByRole('button',{name:'Start camera',exact:true}).first().click();
 await expect(page.locator('.live-camera .detection-overlay')).toBeVisible({timeout:150000});
 console.log('MULTI DEFAULT:',await page.locator('.object-counts').allTextContents());
 await expect(page.locator('.object-counts')).toContainText('wallet');
 await expect(page.locator('.object-counts')).toContainText('sunglasses');
 await expect(page.locator('.object-counts')).toContainText('perfume');
 await expect(page.locator('.count-pill')).toHaveText('3');
 await page.locator('#threshold').fill('0.35');
 console.log('MULTI LOW:',await page.locator('.object-counts').allTextContents());
 await page.getByRole('button',{name:'Stop camera'}).click();
 mkdirSync('../.taste-skill/camera',{recursive:true});
 await page.screenshot({path:'../.taste-skill/camera/multiple-objects.png',fullPage:true,animations:'disabled'});
 await expect(page.locator('.object-counts')).toContainText('spotlight');
 await expect(page.locator('.count-pill')).toHaveText('4');
});
