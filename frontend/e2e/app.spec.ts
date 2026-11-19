import {test,expect} from '@playwright/test';
import path from 'node:path';
import {writeFileSync,mkdirSync} from 'node:fs';
import {execFileSync} from 'node:child_process';
const fixture=path.resolve('../ml/fixtures/bus.jpg');

async function captureStudio(page:import('@playwright/test').Page,name:string){
 mkdirSync('../.taste-skill/studio-account',{recursive:true});
 if(name==='history')await expect.poll(()=>page.locator('.history-image img').evaluateAll(images=>images.every(i=>(i as HTMLImageElement).complete&&(i as HTMLImageElement).naturalWidth>0)),{timeout:30000}).toBe(true);
 await page.mouse.move(0,0);
 for(const theme of ['dark','light']){
  await page.getByLabel('Color theme',{exact:true}).first().selectOption(theme);
  for(const width of [1440,390]){
   await page.setViewportSize({width,height:1000});await page.evaluate(()=>{scrollTo(0,0);return document.fonts.ready;});
   expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true);
   await page.screenshot({path:`../.taste-skill/studio-account/${name}-${theme}-${width}.png`,fullPage:true,animations:'disabled'});
  }
 }
 await page.setViewportSize({width:1440,height:1000});await page.getByLabel('Color theme',{exact:true}).first().selectOption('dark');
}

test('public pages, responsive layout and camera cleanup',async({page,context})=>{
 await page.goto('/');await page.locator('html[data-app-ready=true]').waitFor();await expect(page.getByRole('heading',{level:1})).toHaveText("See what's in front of you.");
 await page.getByRole('link',{name:'Try live detection'}).click();await expect(page.getByRole('heading',{name:'Live detection',exact:true})).toBeVisible();
 await page.getByRole('button',{name:'Start camera',exact:true}).first().click();
 await expect(page.getByRole('button',{name:'Stop camera'})).toBeVisible({timeout:120000});
 await page.getByRole('button',{name:'Stop camera'}).click();
 await expect.poll(()=>page.locator('video').evaluate((v:HTMLVideoElement)=>v.srcObject===null)).toBeTruthy();
 for(const width of [1440,768,390]){await page.setViewportSize({width,height:900});await page.goto('/detect/image');await page.locator('html[data-app-ready=true]').waitFor();await expect(page.getByRole('heading',{name:'Image detection',exact:true})).toBeVisible();expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true);mkdirSync('../.taste-skill/browser',{recursive:true});await page.screenshot({path:`../.taste-skill/browser/detection-${width}.png`,fullPage:true});}
 await page.setViewportSize({width:390,height:844});await page.getByRole('button',{name:'Open menu'}).click();await expect(page.getByRole('link',{name:'Analytics',exact:true})).toBeVisible();await page.getByRole('button',{name:'Close menu'}).click();
});
test('real local ONNX segmentation, thresholds, mode reuse and upload validation',async({page})=>{
 const errors:string[]=[];page.on('pageerror',e=>errors.push(e.message));
 await page.goto('/detect/image');await page.locator('html[data-app-ready=true]').waitFor();
 const input=page.locator('input[type=file]');
 await input.setInputFiles({name:'bad.txt',mimeType:'text/plain',buffer:Buffer.from('not an image')});await expect(page.getByRole('alert')).toContainText('JPG');
 await input.setInputFiles({name:'large.jpg',mimeType:'image/jpeg',buffer:Buffer.alloc(10*1024*1024+1)});await expect(page.getByRole('alert')).toContainText('10 MB');
 await input.setInputFiles(fixture);await expect(page.getByAltText('Selection for object detection')).toBeVisible();
 await page.getByRole('button',{name:'Detect objects',exact:true}).click();
 await expect(page.getByText('Analysis complete',{exact:true})).toBeVisible({timeout:150000});
 await expect(page.locator('.results-summary>strong')).not.toHaveText('0');
 await expect(page.locator('.object-counts')).toContainText('person');
 await expect(page.locator('.object-counts')).toContainText('bus');
 const count=Number(await page.locator('.results-summary>strong').textContent());expect(count).toBeGreaterThanOrEqual(4);
 for(const name of ['Boxes','Masks','Both']){await page.getByRole('button',{name,exact:true}).click();await expect(page.getByText('Analysis complete',{exact:true})).toBeVisible();}
 await page.locator('#threshold').fill('0.95');await expect(page.locator('.count-pill')).toHaveText('0');
 await page.locator('#threshold').fill('0.5');await expect(page.locator('.count-pill')).toHaveText(String(count));
 await page.screenshot({path:'../.taste-skill/browser/inference.png',fullPage:true});
 expect(errors).toEqual([]);
});
test('denied camera permission is actionable',async({browser})=>{
 const context=await browser.newContext({permissions:[]});const page=await context.newPage();
 await page.addInitScript(()=>{navigator.mediaDevices.getUserMedia=async()=>{throw new DOMException('Denied','NotAllowedError');};});
 await page.goto('/detect/live');await page.locator('html[data-app-ready=true]').waitFor();await page.getByRole('button',{name:'Start camera',exact:true}).first().click();await expect(page.getByRole('alert')).toContainText('permission was denied');await context.close();
});
test('real account, image save, history, detail, analytics, settings and logout',async({page})=>{
 const email=`browser-check-${Date.now()}@example.com`,password='Browser-check-pass-123';let userId='';
 page.on('response',async r=>{if(r.url().endsWith('/auth/register')&&r.status()===201)userId=(await r.json()).user.id;});
 page.on('pageerror',e=>console.log('BROWSER ERROR',e.message));
 page.on('requestfailed',r=>console.log('FAILED REQUEST',r.url(),r.failure()?.errorText));
 try{
  await page.goto('/register');await page.locator('html[data-app-ready=true]').waitFor();
  await page.getByLabel('Full name',{exact:true}).fill('Browser verification');await page.getByLabel('Email address').fill(email);await page.getByLabel('Password',{exact:true}).fill(password);await page.getByLabel('Confirm password').fill(password);await page.getByRole('button',{name:'Create account',exact:true}).click();
  await expect(page).toHaveURL(/dashboard/);await expect(page.locator('.metrics strong').first()).toHaveText('0');await captureStudio(page,'overview-empty');
  await page.reload();await page.locator('html[data-app-ready=true]').waitFor();await expect(page.getByRole('heading',{name:'Overview',exact:true})).toBeVisible();
  await page.getByRole('link',{name:'Image detection',exact:true}).click();await page.locator('input[type=file]').setInputFiles(fixture);await page.getByRole('button',{name:'Detect objects',exact:true}).click();await expect(page.getByText('Analysis complete',{exact:true})).toBeVisible({timeout:150000});
  await page.getByRole('button',{name:'Save snapshot',exact:true}).click();await page.waitForTimeout(2000);console.log('SAVE STATE',await page.locator('.notice').allTextContents(),await page.locator('.viewport-toolbar').innerText());await expect(page.getByRole('status')).toContainText('Snapshot saved',{timeout:30000});await expect(page.locator('.snapshot-strip a')).toHaveCount(1);
  await page.getByRole('link',{name:'Detection history',exact:true}).click();await expect(page.locator('.history-card')).toHaveCount(1);await captureStudio(page,'history');await page.locator('.history-card').first().click();await expect(page.getByRole('heading',{name:'Snapshot details'})).toBeVisible();await expect(page.locator('.detail-image img')).toBeVisible();await expect.poll(()=>page.locator('.detail-image img').evaluate((i:HTMLImageElement)=>i.complete&&i.naturalWidth>0)).toBeTruthy();
  await page.getByRole('button',{name:'Masks',exact:true}).click();await page.screenshot({path:'../.taste-skill/browser/saved-detail.png',fullPage:true});await captureStudio(page,'detail');
  await page.getByRole('link',{name:'Analytics',exact:true}).click();await expect(page.locator('.metrics strong').first()).toHaveText('1');await expect(page.locator('.analytics-grid')).toContainText('person');await page.screenshot({path:'../.taste-skill/browser/analytics.png',fullPage:true});await captureStudio(page,'analytics');
  await page.getByRole('link',{name:'Profile & settings',exact:true}).click();await captureStudio(page,'settings');await page.getByLabel('Full name',{exact:true}).fill('Updated verification');await page.getByRole('button',{name:'Save profile',exact:true}).click();await expect(page.getByRole('status')).toContainText('profile');
  await page.getByLabel('Visualization mode').selectOption('mask');await page.getByRole('button',{name:'Save preferences',exact:true}).click();await expect(page.getByRole('status')).toContainText('preferences');
  await page.getByRole('link',{name:'Detection history',exact:true}).click();await page.locator('.history-card').first().click();await page.getByRole('button',{name:'Delete snapshot',exact:true}).click();await page.getByRole('dialog').getByRole('button',{name:'Delete snapshot',exact:true}).click();await expect(page).toHaveURL(/\/history$/);await expect(page.locator('.history-card')).toHaveCount(0);
  await page.getByRole('button',{name:'Sign out',exact:true}).click();await expect(page).toHaveURL(/\/$/);await page.goto('/dashboard');await page.locator('html[data-app-ready=true]').waitFor();await expect(page.getByRole('heading',{name:'Your personal workspace.'})).toBeVisible();
  await page.goto('/login');await page.locator('html[data-app-ready=true]').waitFor();await page.getByLabel('Email address').fill(email);await page.getByLabel('Password',{exact:true}).fill(password);await page.getByRole('button',{name:'Sign in',exact:true}).click();await expect(page).toHaveURL(/dashboard/);await expect(page.locator('.metrics strong').first()).toHaveText('0');
 }finally{if(userId)execFileSync(path.resolve('.venv/Scripts/python.exe'),['tests/cleanup_browser.py',userId],{cwd:path.resolve('../backend'),env:{...process.env,PYTHONPATH:'.'},stdio:'pipe'});}
});
