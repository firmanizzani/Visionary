import {test,expect,chromium} from '@playwright/test';
import {mkdtempSync,rmSync} from 'node:fs';
import path from 'node:path';
import {chooseTheme} from './helpers';

test.beforeEach(async({page})=>{
 await page.addInitScript(()=>Object.defineProperty(navigator,'install',{value:undefined,configurable:true}));
 await page.route('**/api/v1/**',route=>route.fulfill({status:401,json:{detail:'Not authenticated'}}));
});

test('account menu retains the landing install prompt and hides the install action after acceptance',async({page})=>{
 await page.goto('/');await page.locator('html[data-app-ready=true]').waitFor();
 await page.evaluate(()=>{
  const event=new Event('beforeinstallprompt',{cancelable:true});
  Object.assign(event,{prompt:async()=>{(window as Window&{promptCount?:number}).promptCount=1;},userChoice:Promise.resolve({outcome:'accepted'})});
  window.dispatchEvent(event);
 });
 await page.getByRole('link',{name:'Try live detection',exact:true}).click();
 await expect(page.getByRole('heading',{name:'Live detection',exact:true})).toBeVisible();
 const install=page.getByRole('button',{name:'Install app',exact:true});
 await expect(install).toHaveCount(0);
 await page.getByRole('button',{name:'Open account options'}).click();
 await expect(install).toBeVisible();
 await install.click();await expect(install).toHaveCount(0);
 expect(await page.evaluate(()=>(window as Window&{promptCount?:number}).promptCount)).toBe(1);
});

test('manual installation instructions fit phone navigation in both themes and dismiss cleanly',async({page})=>{
 await page.setViewportSize({width:390,height:844});
 await page.goto('/dashboard');await page.locator('html[data-app-ready=true]').waitFor();
 for(const theme of ['dark','light']){
  await chooseTheme(page,theme);
  await page.getByRole('button',{name:'Open menu',exact:true}).click();
  await page.getByRole('button',{name:'Open account options'}).click();
  await page.getByRole('button',{name:'Install app',exact:true}).click();
  await expect(page.getByRole('status')).toContainText('install icon');
  await expect(page.getByRole('button',{name:'Install app',exact:true})).toHaveCount(0);
  await expect(page.getByRole('link',{name:'Profile & settings',exact:true})).toBeVisible();
  expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true);
  await page.screenshot({path:`../.taste-skill/pwa-mobile-${theme}.png`,fullPage:true});
  await page.getByRole('button',{name:'Close install instructions'}).click();
  await expect(page.locator('#install-app-help')).toHaveCount(0);
  await page.keyboard.press('Escape');
  await expect(page.getByRole('region',{name:'Account options'})).toHaveCount(0);
  await expect(page.getByRole('button',{name:'Close menu',exact:true})).toBeVisible();
  await page.getByRole('button',{name:'Close menu',exact:true}).click();
 }
});

test('iPhone gets Add to Home Screen guidance and an installed app hides the action',async({browser,baseURL})=>{
 const context=await browser.newContext({baseURL,userAgent:'Mozilla/5.0 (iPhone; CPU iPhone OS 18_0 like Mac OS X) AppleWebKit/605.1.15 Version/18.0 Mobile Safari/604.1'});
 const page=await context.newPage();
 await page.addInitScript(()=>Object.defineProperty(navigator,'install',{value:undefined,configurable:true}));
 await page.route('**/api/v1/**',route=>route.fulfill({status:401,json:{detail:'Not authenticated'}}));
 await page.goto('/dashboard');await page.locator('html[data-app-ready=true]').waitFor();
 await page.getByRole('button',{name:'Open account options'}).click();
 await page.getByRole('button',{name:'Install app',exact:true}).click();
 await expect(page.getByRole('status')).toContainText('In Safari, tap Share, then Add to Home Screen');
 await page.evaluate(()=>window.dispatchEvent(new Event('appinstalled')));
 await expect(page.getByRole('button',{name:'Install app',exact:true})).toHaveCount(0);
 await context.close();
});

test('account options close on outside interaction, keyboard Escape and navigation',async({page})=>{
 await page.goto('/dashboard');await page.locator('html[data-app-ready=true]').waitFor();
 const trigger=page.getByRole('button',{name:'Open account options'}),panel=page.getByRole('region',{name:'Account options'});
 await trigger.click();await expect(panel).toBeVisible();
 await expect(page.getByRole('button',{name:'Install app',exact:true})).toBeFocused();
 await page.keyboard.press('Escape');await expect(panel).toHaveCount(0);await expect(trigger).toBeFocused();
 await trigger.click();await page.getByRole('heading',{name:'Your personal workspace.'}).click();await expect(panel).toHaveCount(0);
 await trigger.click();await page.getByRole('link',{name:'Image detection',exact:true}).click();await expect(panel).toHaveCount(0);
});

test('supported native install opens directly from a user click without an instruction panel',async({page})=>{
 await page.goto('/dashboard');await page.locator('html[data-app-ready=true]').waitFor();
 await page.evaluate(()=>Object.defineProperty(navigator,'install',{configurable:true,value:async()=>{
  (window as Window&{nativeUserActivation?:boolean}).nativeUserActivation=navigator.userActivation.isActive;
 }}));
 await page.getByRole('button',{name:'Open account options'}).click();
 await page.getByRole('button',{name:'Install app',exact:true}).click();
 expect(await page.evaluate(()=>(window as Window&{nativeUserActivation?:boolean}).nativeUserActivation)).toBe(true);
 await expect(page.getByText('App installed',{exact:true})).toBeVisible();
 await expect(page.locator('#install-app-help')).toHaveCount(0);
});

test('native cancellation adds no instructions; browser rejection provides a single recovery panel',async({page})=>{
 await page.goto('/dashboard');await page.locator('html[data-app-ready=true]').waitFor();
 await page.evaluate(()=>Object.defineProperty(navigator,'install',{configurable:true,value:async()=>{throw new DOMException('Cancelled','AbortError');}}));
 await page.getByRole('button',{name:'Open account options'}).click();
 await page.getByRole('button',{name:'Install app',exact:true}).click();
 await expect(page.getByRole('button',{name:'Install app',exact:true})).toBeEnabled();
 await expect(page.locator('#install-app-help')).toHaveCount(0);
 await page.evaluate(()=>Object.defineProperty(navigator,'install',{configurable:true,value:async()=>{throw new DOMException('Not permitted','SecurityError');}}));
 await page.getByRole('button',{name:'Install app',exact:true}).click();
 await expect(page.getByRole('status')).toContainText('The install window could not open');
 await expect(page.getByRole('button',{name:'Install app',exact:true})).toHaveCount(0);
 await page.getByRole('button',{name:'Close install instructions'}).click();
 await expect(page.getByRole('button',{name:'Install app',exact:true})).toBeFocused();
});

test('production manifest, service worker and offline recovery exclude private API and model caches',async({page,context})=>{
 test.skip(process.env.TEST_PWA_BUILD!=='1','Requires a built production preview with a real service worker.');
 await page.route('**/api/v1/health',route=>route.fulfill({status:200,json:{status:'ok'}}));
 await page.goto('/dashboard');await page.locator('html[data-app-ready=true]').waitFor();
 const manifest=await (await page.request.get('/manifest.webmanifest')).json();
 expect(manifest.name).toBe('Visionary AI');expect(manifest.display).toBe('standalone');expect(manifest.start_url).toBe('/dashboard');
 for(const icon of manifest.icons){const response=await page.request.get(icon.src);expect(response.ok()).toBe(true);expect(response.headers()['content-type']).toContain('image/png');}
 expect(manifest.icons.some((icon:{purpose:string})=>icon.purpose==='maskable')).toBe(true);
 await page.evaluate(async()=>{await navigator.serviceWorker.ready;});
 await expect.poll(()=>page.evaluate(()=>Boolean(navigator.serviceWorker.controller))).toBe(true);
 await page.evaluate(async()=>{await fetch('/api/v1/health');await fetch('/models/yoloe-26s-seg-lvis-v2/manifest.json');});
 const cached=await page.evaluate(async()=>{
  const names=(await caches.keys()).filter(name=>name.startsWith('visionary-shell-'));
  return (await Promise.all(names.map(async name=>(await (await caches.open(name)).keys()).map(request=>new URL(request.url).pathname)))).flat();
 });
 expect(cached).toContain('/offline.html');expect(cached.some(path=>path.startsWith('/api/')||path.startsWith('/models/'))).toBe(false);
 await context.setOffline(true);
 await page.goto('/dashboard');await expect(page.getByRole('heading',{name:'You’re offline.'})).toBeVisible();
 await context.setOffline(false);
 await page.getByRole('link',{name:'Try again'}).click();await page.locator('html[data-app-ready=true]').waitFor();
 await expect(page.getByRole('heading',{name:'Your personal workspace.'})).toBeVisible();
});

test('Chrome reports no manifest or installability errors outside incognito mode',async({baseURL})=>{
 test.skip(process.env.TEST_PWA_BUILD!=='1','Requires a built production preview.');
 const profile=mkdtempSync(path.resolve('test-results/pwa-profile-'));
 const context=await chromium.launchPersistentContext(profile,{channel:'chrome',headless:true});
 try{
  const page=await context.newPage();
  await page.route('**/api/v1/**',route=>route.fulfill({status:401,json:{detail:'Not authenticated'}}));
  await page.goto(`${baseURL}/dashboard`);await page.locator('html[data-app-ready=true]').waitFor();
  await page.evaluate(async()=>{await navigator.serviceWorker.ready;});
  const cdp=await context.newCDPSession(page);
  const manifest=await cdp.send('Page.getAppManifest');expect(manifest.errors).toEqual([]);
  await expect.poll(async()=>(await cdp.send('Page.getInstallabilityErrors')).installabilityErrors,{timeout:15000}).toEqual([]);
 }finally{await context.close();rmSync(profile,{recursive:true,force:true});}
});
