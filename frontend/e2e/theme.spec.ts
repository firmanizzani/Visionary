import {test,expect} from '@playwright/test';
import {mkdirSync} from 'node:fs';

test('studio themes persist, follow the system and keep public pages usable',async({page})=>{
 const errors:string[]=[];page.on('pageerror',e=>errors.push(e.message));
 await page.goto('/');await page.locator('html[data-app-ready=true]').waitFor();
 await expect(page.locator('html')).toHaveAttribute('data-theme','dark');
 await expect(page.getByRole('button',{name:'Hide boxes',exact:true})).toBeVisible();
 await page.getByRole('button',{name:'Hide boxes',exact:true}).click();
 await expect(page.locator('.sample-box')).toHaveCount(0);
 await page.getByRole('button',{name:'Show boxes',exact:true}).click();
 await expect(page.locator('.sample-box')).toHaveCount(4);
 await page.getByLabel('Color theme',{exact:true}).selectOption('light');
 await expect(page.locator('html')).toHaveAttribute('data-theme','light');
 await page.reload();await page.locator('html[data-app-ready=true]').waitFor();
 await expect(page.getByLabel('Color theme',{exact:true})).toHaveValue('light');
 await expect(page.locator('html')).toHaveAttribute('data-theme','light');
 await page.emulateMedia({colorScheme:'dark'});await page.getByLabel('Color theme',{exact:true}).selectOption('system');
 await expect(page.locator('html')).toHaveAttribute('data-theme','dark');
 await page.emulateMedia({colorScheme:'light'});await expect(page.locator('html')).toHaveAttribute('data-theme','light');
 mkdirSync('../.taste-skill/studio',{recursive:true});
 for(const theme of ['dark','light']){
  for(const route of ['/','/login','/detect/image','/docs']){
   await page.goto(route);await page.locator('html[data-app-ready=true]').waitFor();
   await page.getByLabel('Color theme',{exact:true}).first().selectOption(theme);
   for(const width of [1440,768,390]){
    await page.setViewportSize({width,height:1000});await page.evaluate(()=>document.fonts.ready);
    expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true);
    await page.screenshot({path:`../.taste-skill/studio/${route.replaceAll('/','-')||'home'}-${theme}-${width}.png`,fullPage:true,animations:'disabled'});
   }
  }
 }
 expect(errors).toEqual([]);
});
