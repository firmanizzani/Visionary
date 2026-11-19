import {test,expect} from '@playwright/test';

test('landing entrances finish, annotations toggle, and Home works on desktop and mobile',async({page})=>{
 const modelRequests:string[]=[];
 page.on('request',r=>{if(/\.onnx|\/models\/.*part/.test(r.url()))modelRequests.push(r.url());});
 await page.addInitScript(()=>{
  (window as any).entrances=0;
  const animate=Element.prototype.animate;
  Element.prototype.animate=function(...args){(window as any).entrances++;return animate.apply(this,args);};
 });
 await page.setViewportSize({width:1440,height:1000});
 await page.goto('/');
 await expect(page.getByRole('link',{name:'Home',exact:true})).toHaveAttribute('aria-current','page');
 await expect.poll(()=>page.evaluate(()=>(window as any).entrances)).toBeGreaterThan(0);
 const initial=await page.evaluate(()=>(window as any).entrances);
 await page.locator('.studio-vocabulary').scrollIntoViewIfNeeded();
 await expect.poll(()=>page.evaluate(()=>(window as any).entrances)).toBeGreaterThan(initial);
 await expect.poll(()=>page.evaluate(()=>document.getAnimations().filter(a=>a.playState==='running').length)).toBe(0);
 await page.getByRole('link',{name:'Home',exact:true}).click();
 await expect.poll(()=>page.evaluate(()=>scrollY)).toBe(0);
 await page.getByRole('button',{name:'Hide boxes',exact:true}).click();
 await expect(page.locator('.sample-box')).toHaveCount(0);
 await page.getByRole('button',{name:'Show boxes',exact:true}).click();
 await expect(page.locator('.sample-box')).toHaveCount(4);
 await page.setViewportSize({width:390,height:844});
 const toggle=page.getByRole('button',{name:'Toggle navigation',exact:true});
 await toggle.click();await expect(toggle).toHaveAttribute('aria-expanded','true');
 await expect(page.getByRole('link',{name:'Home',exact:true})).toBeVisible();
 await page.getByRole('link',{name:'Capabilities',exact:true}).click();
 await expect(toggle).toHaveAttribute('aria-expanded','false');
 await expect(page).toHaveURL(/#features$/);
 expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true);
 expect(modelRequests).toEqual([]);
});

test('reduced motion keeps the landing page static and readable',async({page})=>{
 await page.emulateMedia({reducedMotion:'reduce'});
 await page.goto('/');await page.locator('html[data-app-ready=true]').waitFor();
 await expect(page.getByRole('heading',{level:1})).toBeVisible();
 await expect(page.locator('.sample-box')).toHaveCount(4);
 await page.locator('.final-cta').scrollIntoViewIfNeeded();
 expect(await page.evaluate(()=>document.getAnimations().length)).toBe(0);
 await expect(page.locator('.final-cta .btn')).toBeVisible();
});

test('landing content and primary links remain available without JavaScript',async({browser,baseURL})=>{
 const context=await browser.newContext({javaScriptEnabled:false,viewport:{width:1440,height:1000}});
 try{
  const page=await context.newPage();await page.goto(baseURL!);
  await expect(page.getByRole('heading',{level:1})).toBeVisible();
  await expect(page.getByRole('link',{name:'Try live detection',exact:true})).toHaveAttribute('href','/detect/live');
  await expect(page.locator('.studio-feature-list')).toBeVisible();
 }finally{await context.close();}
});
