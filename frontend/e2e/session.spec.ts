import {test,expect,chromium} from '@playwright/test';
import {mkdtempSync,rmSync} from 'node:fs';
import {execFileSync} from 'node:child_process';
import path from 'node:path';

test('persistent login survives browser restart and an expired access token',async({baseURL})=>{
 const profile=mkdtempSync(path.resolve('test-results/session-profile-'));
 let context=await chromium.launchPersistentContext(profile,{channel:'chrome',headless:true});
 const email=`browser-check-${Date.now()}@example.com`,password='Browser-check-pass-123';
 let userId='';
 try{
  let page=await context.newPage();
  await page.goto(`${baseURL}/register`);
  const registered=await context.request.post(`${baseURL}/api/v1/auth/register`,{
   headers:{Origin:baseURL!},data:{full_name:'Browser verification',email,password,confirm_password:password}
  });
  expect(registered.status()).toBe(201);userId=(await registered.json()).user.id;
  const cookies=await context.cookies();
  expect(cookies.find(c=>c.name==='visionary_refresh')!.expires).toBeGreaterThan(Date.now()/1000+86400);
  // Simulate returning after the short-lived access cookie has expired.
  await context.clearCookies({name:'visionary_access'});
  await context.close();
  context=await chromium.launchPersistentContext(profile,{channel:'chrome',headless:true});
  page=await context.newPage();
  await page.goto(`${baseURL}/dashboard`);
  await expect(page.getByRole('heading',{name:'Overview',exact:true})).toBeVisible();
  await expect(page.locator('.metrics strong').first()).toHaveText('0');
  await expect(page.getByRole('button',{name:'Sign out',exact:true})).toBeVisible();

  // A settings outage must not turn a valid restored account into a guest.
  await page.route('**/api/v1/users/settings',route=>route.fulfill({status:503,json:{detail:'Temporarily unavailable'}}));
  await page.reload();
  await expect(page.getByRole('heading',{name:'Overview',exact:true})).toBeVisible();
  await expect(page.getByRole('button',{name:'Sign out',exact:true})).toBeVisible();
  await page.unroute('**/api/v1/users/settings');
  await page.route('**/api/v1/auth/me',route=>route.fulfill({status:503,json:{detail:'Temporarily unavailable'}}));
  await page.reload();
  await expect(page.getByRole('heading',{name:"Let's reconnect.",exact:true})).toBeVisible();
  await page.unroute('**/api/v1/auth/me');
  await page.getByRole('button',{name:'Retry',exact:true}).click();
  await expect(page.getByRole('heading',{name:'Overview',exact:true})).toBeVisible();
  await page.getByRole('button',{name:'Sign out',exact:true}).click();
  await expect(page).toHaveURL(`${baseURL}/`);
  await page.goto(`${baseURL}/login`);
  await page.getByLabel('Email address',{exact:true}).fill(email);
  await page.getByLabel('Password',{exact:true}).fill(password);
  await page.getByRole('button',{name:'Sign in',exact:true}).click();
  await expect(page.getByRole('heading',{name:'Overview',exact:true})).toBeVisible();
  await page.reload();
  await expect(page.getByRole('button',{name:'Sign out',exact:true})).toBeVisible();
 }finally{
  await context.close();rmSync(profile,{recursive:true,force:true});
  if(userId)execFileSync(path.resolve('.venv/Scripts/python.exe'),['tests/cleanup_browser.py',userId],{cwd:path.resolve('../backend'),env:{...process.env,PYTHONPATH:'.'},stdio:'pipe'});
 }
});
