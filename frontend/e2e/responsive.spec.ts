import {test,expect} from '@playwright/test';
import {mkdirSync,writeFileSync} from 'node:fs';
import {chooseTheme} from './helpers';

const labels=['water bottle','remote control','very-long-category-name-without-spaces-for-layout-verification'];
const objects=labels.map((object_name,class_id)=>({object_name,class_id,confidence:.87,bounding_box:[40+class_id*200,40,200+class_id*200,300],segmentation_data:null}));
const snapshot={id:'responsive-demo',source_type:'image',detected_at:'2026-11-19T10:00:00Z',model_version:'YOLOE26s-MobileCLIP2-S0-browser-verification',confidence_threshold:.5,total_objects:3,width:1586,height:992,image_url:'/images/studio-desk.webp',objects};
const summary={total_detections:1234567,total_objects:3456789,unique_categories:1227,average_confidence:.87,most_detected:labels[2]};

async function seed(page:import('@playwright/test').Page){
 await page.route('**/api/v1/**',route=>{
  const path=new URL(route.request().url()).pathname;
  let json:unknown;
  if(path.endsWith('/auth/me'))json={id:'responsive-account',full_name:'Alex Morgan With A Longer Profile Name',email:'long-email-for-responsive-verification@example.com',created_at:'2026-11-19T00:00:00Z'};
  else if(path.endsWith('/users/settings'))json={confidence_threshold:.5,visualization_mode:'both',show_confidence:true,preferred_camera:null};
  else if(path.endsWith('/dashboard/overview'))json={...summary,recent:[snapshot]};
  else if(path.endsWith('/analytics/summary'))json=summary;
  else if(path.endsWith('/analytics/activity'))json=[{date:new Date().toISOString().slice(0,10),count:3}];
  else if(path.endsWith('/analytics/objects'))json=labels.map((label,i)=>({label,count:3-i}));
  else if(path.endsWith('/analytics/sources'))json=[{label:'image',count:3},{label:'camera',count:1}];
  else if(path.endsWith('/detections/responsive-demo'))json=snapshot;
  else if(path.endsWith('/detections'))json={items:[snapshot],total:30,pages:2};
  else return route.fulfill({status:404,json:{detail:'Not found'}});
  return route.fulfill({json});
 });
}

test('responsive audit with populated screens and long content',async({page})=>{
 test.setTimeout(180000);await seed(page);await page.emulateMedia({reducedMotion:'reduce'});
 const errors:string[]=[];page.on('pageerror',e=>errors.push(e.message));
 const failures:unknown[]=[];mkdirSync('../.taste-skill/responsive',{recursive:true});
 for(const route of ['/','/about','/login','/register','/dashboard','/detect/live','/detect/image','/history','/history/responsive-demo','/analytics','/settings']){
  await page.goto(route);await page.locator('html[data-app-ready=true]').waitFor();
  await expect(page.locator('h1')).toBeVisible();
  if(['/dashboard','/history','/analytics','/settings','/history/responsive-demo'].includes(route))await expect(page.locator('.loading-state')).toHaveCount(0);
  for(const mode of ['dark','light']){
   await chooseTheme(page,mode);
   for(const width of [320,360,390,430,540,600,700,720,768,900,1024,1050,1440]){
    await page.setViewportSize({width,height:900});await page.evaluate(()=>{scrollTo(0,0);return document.fonts.ready;});
    const issue=await page.evaluate(()=>({width:innerWidth,scroll:document.documentElement.scrollWidth,wide:Array.from(document.querySelectorAll('main *')).filter(n=>{const r=n.getBoundingClientRect();return r.width>0&&r.right>innerWidth+2&&!(n instanceof SVGElement)&&!n.closest('.object-study,.sample-photo,.overlay');}).slice(0,8).map(n=>({tag:n.tagName,class:n.className,text:n.textContent?.slice(0,55)}))}));
    if(issue.scroll>width)failures.push({route,mode,...issue});
    if([320,390,768,1440].includes(width)&&(mode==='dark'||width===390))await page.screenshot({path:`../.taste-skill/responsive/${route.replaceAll('/','-')||'home'}-${mode}-${width}.png`,fullPage:true,animations:'disabled'});
   }
  }
 }
 writeFileSync('../.taste-skill/responsive/findings.json',JSON.stringify({failures,errors},null,2));
 expect(errors).toEqual([]);expect(failures).toEqual([]);
});

test('mobile workspace menu closes after settings navigation',async({page})=>{
 test.setTimeout(30000);
 await seed(page);await page.setViewportSize({width:390,height:844});await page.goto('/dashboard');
 await page.locator('html[data-app-ready=true]').waitFor();
 await page.getByRole('button',{name:'Open menu',exact:true}).click();
 await expect(page.locator('.workspace aside')).toHaveClass(/open/);
 await page.screenshot({path:'../.taste-skill/responsive/menu-portrait.png',animations:'disabled'});
 await page.getByRole('link',{name:'Profile & settings',exact:true}).click();
 await expect(page).toHaveURL(/\/settings$/);
 await expect(page.locator('.workspace aside')).not.toHaveClass(/open/);
 await page.getByRole('button',{name:'Open menu',exact:true}).click();
 await expect(page.getByRole('button',{name:'Close menu',exact:true})).toBeFocused();
 await page.keyboard.press('Escape');
 await expect(page.getByRole('button',{name:'Open menu',exact:true})).toBeFocused();
 await expect(page.locator('.workspace-body')).not.toHaveAttribute('inert');
 await page.getByRole('button',{name:'Open menu',exact:true}).click();
 await page.getByRole('button',{name:'Close navigation',exact:true}).click({position:{x:350,y:400}});
 await expect(page.locator('.workspace aside')).not.toHaveClass(/open/);
});

test('touch navigation and native confidence slider work in a phone viewport',async({browser})=>{
 const context=await browser.newContext({viewport:{width:390,height:844},isMobile:true,hasTouch:true,deviceScaleFactor:2});
 try{
  const page=await context.newPage();await seed(page);await page.goto('/settings');
  await page.locator('html[data-app-ready=true]').waitFor();
  const slider=page.locator('#default-confidence');await slider.scrollIntoViewIfNeeded();
  const box=(await slider.boundingBox())!;
  const cdp=await context.newCDPSession(page);
  await cdp.send('Input.dispatchTouchEvent',{type:'touchStart',touchPoints:[{x:box.x+box.width*.5,y:box.y+box.height*.5}]});
  await cdp.send('Input.dispatchTouchEvent',{type:'touchMove',touchPoints:[{x:box.x+box.width*.8,y:box.y+box.height*.5}]});
  await cdp.send('Input.dispatchTouchEvent',{type:'touchEnd',touchPoints:[]});
  expect(Number(await slider.inputValue())).toBeGreaterThan(.5);
  await page.evaluate(()=>scrollTo(0,0));await page.getByRole('button',{name:'Open menu',exact:true}).tap();
  await page.getByRole('link',{name:'Detection history',exact:true}).tap();await expect(page).toHaveURL(/\/history$/);
  await expect(page.locator('.workspace aside')).not.toHaveClass(/open/);
  await page.setViewportSize({width:844,height:390});await page.getByRole('button',{name:'Open menu',exact:true}).tap();
  await page.getByRole('button',{name:'Sign out',exact:true}).scrollIntoViewIfNeeded();
  await expect(page.getByRole('button',{name:'Sign out',exact:true})).toBeInViewport();
  await page.screenshot({path:'../.taste-skill/responsive/menu-landscape.png',animations:'disabled'});
 }finally{await context.close();}
});
