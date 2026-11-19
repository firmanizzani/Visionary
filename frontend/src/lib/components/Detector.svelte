<script lang="ts">
 import { onDestroy, onMount, untrack } from 'svelte';
 import { env } from '@lib/env';
 import { Video, Image as ImageIcon, Upload, Scan, Play, Square, SwitchCamera, ArrowUpRight, Save, X, SlidersHorizontal, ShieldCheck, Layers, Box, AlertCircle, Check, LoaderCircle } from 'lucide-svelte';
 import Button from './ui/button.svelte';import Overlay from './Overlay.svelte';
 import { initialize, infer } from '@lib/ai/client';import { countObjects } from '@lib/ai/math';
 import { api,json } from '@lib/api';import {user,settings,sessionReady} from '@lib/session';
 import type { DetectedObject, Mode } from '@lib/types';
 let {live=false}=$props();
 let status=$state('Model loads when you start'),error=$state(''),success=$state(''),busy=$state(false),saving=$state(false),running=$state(false),dragging=$state(false),imageUrl=$state(''),width=$state(0),height=$state(0),objects=$state<DetectedObject[]>([]),threshold=$state(.5),mode=$state<Mode>('both'),showConfidence=$state(true),latency=$state(0),processed=$state(false),modelReady=$state(false),devices=$state<MediaDeviceInfo[]>([]),device=$state(''),facing=$state<'environment'|'user'>('environment');
 let video=$state<HTMLVideoElement>(undefined!), fileInput:HTMLInputElement;
 let stream:MediaStream|null=null,frame:HTMLCanvasElement|null=null,sourceImage:ImageBitmap|null=null,timer:ReturnType<typeof setTimeout>,generation=0,key=crypto.randomUUID(),detectedAt='';
 let visible=$derived(objects.filter(o=>o.confidence>=threshold));let counts=$derived(countObjects(objects,threshold));
 onMount(()=>{threshold=$settings.confidence_threshold;mode=$settings.visualization_mode;showConfidence=$settings.show_confidence;device=$settings.preferred_camera||'';});
 $effect(()=>{if($sessionReady)untrack(()=>{threshold=$settings.confidence_threshold;mode=$settings.visualization_mode;showConfidence=$settings.show_confidence;device=$settings.preferred_camera||'';});});
 onDestroy(()=>{stop();sourceImage?.close();if(imageUrl)URL.revokeObjectURL(imageUrl);});
 $effect(()=>{threshold;key=crypto.randomUUID();success='';});
 async function loadModel(){status='Preparing AI runtime…';await initialize(s=>status=s);modelReady=true;}
 function stop(){generation++;running=false;clearTimeout(timer);stream?.getTracks().forEach(t=>t.stop());stream=null;if(video)video.srcObject=null;}
 async function start(){error='';success='';busy=true;const g=++generation;
  try{
   if(!navigator.mediaDevices?.getUserMedia)throw new Error('Camera access requires HTTPS or localhost and a supported browser.');
   const next=await navigator.mediaDevices.getUserMedia({video:device?{deviceId:{exact:device},width:{ideal:1280},height:{ideal:720}}:{facingMode:facing,width:{ideal:1280},height:{ideal:720}},audio:false});
   if(g!==generation){next.getTracks().forEach(t=>t.stop());return;}stream=next;video.srcObject=stream;await video.play();running=true;
   devices=(await navigator.mediaDevices.enumerateDevices()).filter(d=>d.kind==='videoinput');await loadModel();if(g===generation)loop(g);
  }catch(e){stop();error=e instanceof DOMException&&e.name==='NotAllowedError'?'Camera permission was denied. Allow camera access in your browser settings and try again.':(e as Error).message;}finally{busy=false;}
 }
 async function loop(g:number){if(!running||g!==generation)return;
  try{
   const c=document.createElement('canvas'),scale=Math.min(1,1280/video.videoWidth);c.width=Math.round(video.videoWidth*scale);c.height=Math.round(video.videoHeight*scale);c.getContext('2d')!.drawImage(video,0,0,c.width,c.height);
   const timestamp=new Date().toISOString();const result=await infer(await createImageBitmap(c));
   if(g!==generation)return;
   frame=c;width=c.width;height=c.height;objects=result.objects;latency=result.latency;processed=true;detectedAt=timestamp;key=crypto.randomUUID();
   if(imageUrl)URL.revokeObjectURL(imageUrl);imageUrl=URL.createObjectURL(await new Promise<Blob>(resolve=>c.toBlob(b=>resolve(b!),'image/jpeg',.9)));
   timer=setTimeout(()=>loop(g),Math.max(0,250-result.latency));
  }catch(e){if(g===generation){error=(e as Error).message;stop();}}
 }
 async function switchCamera(){const restart=running;stop();if(devices.length>1){const current=devices.findIndex(d=>d.deviceId===device);device=devices[(current+1)%devices.length].deviceId;}else{device='';facing=facing==='environment'?'user':'environment';}if(restart)await start();}
 async function selectFile(file?:File){if(!file)return;error='';success='';
  if(!['image/jpeg','image/png','image/webp'].includes(file.type)){error='Choose a JPG, PNG, or WebP image.';return;}
  if(file.size>10*1024*1024){error='This image exceeds 10 MB. Choose a smaller file.';return;}
  try{sourceImage?.close();sourceImage=await createImageBitmap(file,{imageOrientation:'from-image'});if(sourceImage.width*sourceImage.height>40_000_000){sourceImage.close();sourceImage=null;throw new Error('Image resolution is too large. Use an image below 40 megapixels.');}
   const scale=Math.min(1,1920/Math.max(sourceImage.width,sourceImage.height));const c=document.createElement('canvas');c.width=Math.round(sourceImage.width*scale);c.height=Math.round(sourceImage.height*scale);c.getContext('2d')!.drawImage(sourceImage,0,0,c.width,c.height);sourceImage.close();sourceImage=await createImageBitmap(c);frame=c;width=c.width;height=c.height;
   if(imageUrl)URL.revokeObjectURL(imageUrl);imageUrl=URL.createObjectURL(await new Promise<Blob>(r=>c.toBlob(b=>r(b!),'image/jpeg',.9)));objects=[];processed=false;latency=0;key=crypto.randomUUID();
  }catch(e){error=(e as Error).message;}
 }
 async function analyze(){if(!frame)return;busy=true;error='';success='';try{await loadModel();const result=await infer(await createImageBitmap(frame));objects=result.objects;latency=result.latency;processed=true;detectedAt=new Date().toISOString();key=crypto.randomUUID();}catch(e){error=(e as Error).message;}finally{busy=false;}}
 function clear(){if(busy)return;sourceImage?.close();sourceImage=null;frame=null;URL.revokeObjectURL(imageUrl);imageUrl='';objects=[];processed=false;}
 async function save(){if(!frame||!processed||saving)return;if(!$user){location.href='/login';return;}
  saving=true;error='';success='';
  // Capture immutable image + metadata before awaiting any network operation.
  const snapshot=frame, savedObjects=JSON.parse(JSON.stringify(visible)) as DetectedObject[],savedThreshold=threshold,savedKey=key,savedAt=detectedAt;
  try{
   const blob=await new Promise<Blob>((resolve,reject)=>snapshot.toBlob(b=>b?resolve(b):reject(new Error('Cannot prepare snapshot')),'image/jpeg',.86));
   if(blob.size>3_000_000)throw new Error('Compressed image is too large to save. Try a smaller image.');
   const signed=await api('/storage/uploads',{method:'POST'});const form=new FormData();
   for(const k of ['timestamp','public_id','type','overwrite','allowed_formats','signature','api_key'])form.append(k,String(signed[k]));form.append('file',blob,'snapshot.jpg');
   const upload=await fetch(`https://api.cloudinary.com/v1_1/${signed.cloud_name}/image/upload`,{method:'POST',body:form});
   if(!upload.ok)throw new Error('Private image upload failed. Please try again.');
   await api('/detections',json('POST',{upload_id:signed.upload_id,idempotency_key:savedKey,source_type:live?'camera':'image',model_version:env.PUBLIC_MODEL_VERSION||'yolov8n-seg-coco-640-v1',confidence_threshold:savedThreshold,width:snapshot.width,height:snapshot.height,detected_at:savedAt,objects:savedObjects}));
   success='Snapshot saved to your private history.';
  }catch(e){error=(e as Error).message;}finally{saving=false;}
 }
</script>
<div class="page-title"><div><h1>{live?'Live detection':'Image detection'}</h1><p>{live?'A little intelligence for everything in view.':'A new perspective on the photos you choose.'}</p></div><a class="btn outline" href={live?'/detect/image':'/detect/live'}>{#if live}<ImageIcon size={16}/>Upload image{:else}<Video size={16}/>Use camera{/if}<ArrowUpRight size={14}/></a></div>
<div class="detection-layout"><section class="detection-workbench"><div class="panel-heading"><div><span class:online={running||processed} class="status-dot"></span><strong>{live?'Camera workspace':'Image workspace'}</strong></div><span>{running?'Camera active':processed?'Analysis complete':live?'Camera off':'Ready to explore'}</span></div>
 <div class="viewport" class:has-image={!!imageUrl} class:dragging ondragover={e=>{e.preventDefault();dragging=true;}} ondragleave={()=>dragging=false} ondrop={e=>{e.preventDefault();dragging=false;if(!live)selectFile(e.dataTransfer?.files[0]);}} role="region" aria-label={live?'Camera preview':'Image upload workspace'}>
  {#if live}<video bind:this={video} autoplay muted playsinline class:preview-hidden={processed} aria-label="Live camera preview"></video>{/if}
  {#if imageUrl}<div class="analyzed-image"><img src={imageUrl} alt={live?'Analyzed camera frame':'Selected image'} width={width} height={height}/>{#if processed}<Overlay {objects} {width} {height} {mode} {threshold} {showConfidence}/>{/if}</div>{:else if !running}<div class="viewport-empty"><div class="reticle"><Scan size={65} strokeWidth={1}/>{#if live}<Video size={23}/>{:else}<ImageIcon size={23}/>{/if}</div><h2>{live?'See what’s in front of you.':'Every image has a story.'}</h2><p>{live?'Start your camera to detect, segment, and count objects. Everything happens on your device.':'Drop your image here, or browse your files to discover the objects inside.'}</p>{#if live}<Button onclick={start} disabled={busy}><Play size={16}/>{busy?'Getting ready…':'Start camera'}</Button>{:else}<Button onclick={()=>fileInput.click()}><Upload size={16}/>Choose an image</Button><small>JPG, PNG, or WebP · Up to 10 MB</small>{/if}</div>{/if}
  {#if busy}<div class="processing-indicator" role="status"><LoaderCircle class="spin" size={17}/>{status}</div>{/if}
  {#if imageUrl&&!live}<button class="image-remove icon-btn" onclick={clear} disabled={busy||saving} aria-label="Remove image"><X size={16}/></button>{/if}
 </div>
 <input class="visually-hidden" type="file" accept="image/jpeg,image/png,image/webp" bind:this={fileInput} onchange={e=>{selectFile(e.currentTarget.files?.[0]);e.currentTarget.value='';}}/>
 <div class="viewport-toolbar"><div>{#if live}<Button variant={running?'outline':'default'} onclick={running?stop:start} disabled={busy&&!running}>{#if running}<Square size={14}/>Stop camera{:else}<Play size={14}/>{busy?'Preparing…':'Start camera'}{/if}</Button><button class="btn ghost" onclick={switchCamera} disabled={busy} aria-label="Switch camera"><SwitchCamera size={18}/><span>Switch</span></button>{:else}<Button onclick={analyze} disabled={!imageUrl||busy}>{#if busy}<LoaderCircle size={16} class="spin"/>{:else}<Scan size={16}/>{/if}{busy?'Analyzing…':'Detect objects'}</Button><button class="btn ghost" onclick={()=>fileInput.click()} disabled={busy}><Upload size={16}/><span>Replace image</span></button>{/if}</div><button class="btn outline" onclick={save} disabled={!processed||saving||busy}><Save size={16}/>{saving?'Saving…':$user?'Save snapshot':'Sign in to save'}</button></div>
 <div class="inference-strip"><span>{@render CpuIcon()}{modelReady?'YOLOv8n-seg': 'YOLOv8n-seg · 80 classes'}</span><span>{latency?`${Math.round(latency)} ms inference`:'Browser-based inference'}</span>{#if processed}<span>{width} × {height}</span>{/if}</div>
 {#if error}<div class="notice error" role="alert"><AlertCircle size={17}/>{error}</div>{/if}{#if success}<div class="notice success" role="status"><Check size={17}/>{success}<a href="/history">View history →</a></div>{/if}
 {#if live&&processed}<p class="frame-notice">Showing the latest analyzed frame so masks and boxes stay aligned. Counts describe this frame, not unique objects across the session.</p>{/if}
 </section>
 <div class="detection-rail"><section class="panel controls-panel"><div class="panel-heading"><h2><SlidersHorizontal size={17}/>Detection settings</h2></div><div class="panel-content"><label class="range-label" for="threshold">Confidence threshold <strong>{Math.round(threshold*100)}%</strong></label><input id="threshold" type="range" min="0.1" max="0.95" step="0.05" bind:value={threshold}/><div class="range-ends"><span>10% · More results</span><span>95% · More selective</span></div><p class="field-help">Only predictions above this threshold appear.</p><label for="mode">Visualization</label><div class="segmented" id="mode">{#each [{value:'box',label:'Boxes'},{value:'mask',label:'Masks'},{value:'both',label:'Both'}] as m}<button class:chosen={mode===m.value} onclick={()=>mode=m.value as Mode}>{m.label}</button>{/each}</div><label class="checkbox-row"><span>Show confidence scores</span><input type="checkbox" bind:checked={showConfidence}/></label>{#if live&&devices.length>1}<label for="camera">Camera<select id="camera" bind:value={device} onchange={()=>{if(running){stop();start();}}}>{#each devices as d}<option value={d.deviceId}>{d.label||'Camera'}</option>{/each}</select></label>{/if}</div></section>
 <section class="panel results-panel"><div class="panel-heading"><h2>Detected objects</h2><span class="count-pill">{visible.length}</span></div>{#if visible.length}<div class="results-summary"><strong>{visible.length}</strong><span>objects in this {live?'frame':'image'}<small>{Object.keys(counts).length} categories identified</small></span></div><div class="object-counts">{#each Object.entries(counts) as [label,count]}<div><span class="object-dot"></span><span>{label}</span><strong>{count}</strong></div>{/each}</div><details><summary>Individual predictions</summary>{#each visible as o}<div class="prediction"><span>{o.object_name}</span><span>{(o.confidence*100).toFixed(1)}%</span></div>{/each}</details>{:else}<div class="results-empty"><Layers size={26} strokeWidth={1.3}/><strong>{processed?'No objects above threshold':'A clearer picture awaits'}</strong><p>{processed?'Lower the confidence threshold or try a different view.':live?'Start your camera to see detected objects and live counts here.':'Analyze an image to see its objects, confidence, and counts.'}</p></div>{/if}</section>
 <div class="local-note"><ShieldCheck size={19}/><div><strong>Your view stays yours.</strong><p>AI runs on your device. Images only leave your browser when you save a snapshot.</p></div></div></div></div>
<div class="detection-bottom"><div><Box size={18}/><span><strong>80 everyday categories</strong>People, vehicles, animals, and more.</span></div><div><Layers size={18}/><span><strong>Beyond bounding boxes</strong>Pixel-level instance segmentation.</span></div><a href="/docs">About the model <ArrowUpRight size={15}/></a></div>
{#snippet CpuIcon()}<span class="mini-chip">AI</span>{/snippet}
