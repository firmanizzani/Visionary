import {chooseTheme} from './helpers';
import {test,expect} from '@playwright/test';
import {mkdirSync} from 'node:fs';

test('theme switches in one click, persists and keeps public pages usable',async({page})=>{
 const errors:string[]=[];page.on('pageerror',e=>errors.push(e.message));
 await page.goto('/');await page.locator('html[data-app-ready=true]').waitFor();
 await expect(page.locator('html')).toHaveAttribute('data-theme','dark');
 await expect(page.getByRole('link',{name:'Login',exact:true})).toHaveAttribute('href','/login');
 await expect(page.getByRole('button',{name:'Hide boxes',exact:true})).toBeVisible();
 await page.getByRole('button',{name:'Hide boxes',exact:true}).click();
 await expect(page.locator('.sample-box')).toHaveCount(0);
 await page.getByRole('button',{name:'Show boxes',exact:true}).click();
 await expect(page.locator('.sample-box')).toHaveCount(4);
 await chooseTheme(page,'light');
 await expect(page.locator('html')).toHaveAttribute('data-theme','light');
 await page.reload();await page.locator('html[data-app-ready=true]').waitFor();
 await expect(page.getByRole('button',{name:'Switch to dark mode',exact:true})).toBeVisible();
 await expect(page.locator('html')).toHaveAttribute('data-theme','light');
 await page.getByRole('button',{name:'Switch to dark mode',exact:true}).click();
 await expect(page.locator('html')).toHaveAttribute('data-theme','dark');
 await expect(page.getByRole('menu')).toHaveCount(0);
 await page.getByRole('button',{name:'Switch to light mode',exact:true}).click();
 await expect(page.locator('html')).toHaveAttribute('data-theme','light');
 mkdirSync('../.taste-skill/studio',{recursive:true});
 for(const theme of ['dark','light']){
  for(const route of ['/','/login','/detect/image','/docs']){
   await page.goto(route);await page.locator('html[data-app-ready=true]').waitFor();
   await chooseTheme(page,theme);
   for(const width of [1440,768,390]){
    await page.setViewportSize({width,height:1000});await page.evaluate(()=>document.fonts.ready);
    expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true);
    await page.screenshot({path:`../.taste-skill/studio/${route.replaceAll('/','-')||'home'}-${theme}-${width}.png`,fullPage:true,animations:'disabled'});
   }
  }
 }
 expect(errors).toEqual([]);
});

test('an old system preference resolves once into a saved light or dark choice',async({page})=>{
 await page.emulateMedia({colorScheme:'light'});
 await page.addInitScript(()=>localStorage.setItem('visionary-theme','system'));
 await page.goto('/login');await page.locator('html[data-app-ready=true]').waitFor();
 await expect(page.locator('html')).toHaveAttribute('data-theme','light');
 expect(await page.evaluate(()=>localStorage.getItem('visionary-theme'))).toBe('light');
 await page.emulateMedia({colorScheme:'dark'});
 await expect(page.locator('html')).toHaveAttribute('data-theme','light');
 await page.getByRole('button',{name:'Switch to dark mode',exact:true}).click();
 await expect(page.locator('html')).toHaveAttribute('data-theme','dark');
});
