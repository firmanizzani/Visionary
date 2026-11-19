import {test,expect} from '@playwright/test';
import {mkdirSync} from 'node:fs';
import {chooseTheme} from './helpers';

test('login balances vertically while registration stays aligned in both themes',async({page})=>{
 const errors:string[]=[];page.on('pageerror',e=>errors.push(e.message));
 mkdirSync('../.taste-skill/auth-final',{recursive:true});
 const loginWidths=new Map<string,number>();
 for(const route of ['login','register']){
  await page.goto('/'+route);await page.locator('html[data-app-ready=true]').waitFor();
  await expect(page.locator('.auth-art img')).toHaveCount(1);
  for(const appearance of ['dark','light']){
   await chooseTheme(page,appearance);
   for(const width of [1440,1024,768,390]){
    await page.setViewportSize({width,height:1000});await page.evaluate(()=>{scrollTo(0,0);return document.fonts.ready;});
    expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true);
    if(width>=1024){
     const bounds=await page.evaluate(()=>{const a=document.querySelector('.auth-story')!.getBoundingClientRect(),b=document.querySelector('.auth-form')!.getBoundingClientRect(),art=document.querySelector('.auth-art')!.getBoundingClientRect(),heading=document.querySelector('.auth-form-title h1')!.getBoundingClientRect();return {top:a.top-b.top,bottom:a.bottom-b.bottom,centers:(a.top+a.bottom-b.top-b.bottom)/2,artHeading:art.top-heading.top,formWidth:b.width};});
     const key=`${appearance}-${width}`;
     if(route==='login'){
      expect(Math.abs(bounds.centers)).toBeLessThanOrEqual(1);
      expect(bounds.top).toBeLessThan(-40);loginWidths.set(key,bounds.formWidth);
     }else{
      expect([bounds.top,bounds.bottom,bounds.artHeading].every(n=>Math.abs(n)<=1)).toBe(true);
      expect(Math.abs(bounds.formWidth-loginWidths.get(key)!)).toBeLessThanOrEqual(1);
     }
    }else await expect(page.locator('.auth-story')).toBeHidden();
    await page.screenshot({path:`../.taste-skill/auth-final/${route}-${appearance}-${width}.png`,fullPage:true,animations:'disabled'});
   }
  }
 }
 await page.getByLabel('Full name',{exact:true}).fill('Layout verification');
 await page.getByLabel('Email address',{exact:true}).fill('layout@example.com');
 await page.getByLabel('Password',{exact:true}).fill('Strong-password-123');
 await page.getByLabel('Confirm password',{exact:true}).fill('Different-password-123');
 await page.getByRole('button',{name:'Show password',exact:true}).click();
 await expect(page.getByLabel('Password',{exact:true})).toHaveAttribute('type','text');
 await page.getByRole('button',{name:'Hide password',exact:true}).click();
 await page.getByRole('button',{name:'Create account',exact:true}).click();
 await expect(page.getByRole('alert')).toContainText('Passwords do not match');
 expect(errors).toEqual([]);
});
