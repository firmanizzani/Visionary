import {test,expect} from '@playwright/test';
import {mkdirSync} from 'node:fs';
import {chooseTheme} from './helpers';

test('public navigation stays visible and connects About, categories, and Privacy',async({page})=>{
 const errors:string[]=[];page.on('pageerror',e=>errors.push(e.message));
 await page.setViewportSize({width:1440,height:1000});await page.goto('/');
 const navigation=page.getByRole('navigation',{name:'Main navigation',exact:true});
 await expect(navigation.locator('.public-links a')).toHaveText(['Home','Features','How it works','About']);
 await navigation.getByRole('link',{name:'Features',exact:true}).click();
 await expect(navigation.getByRole('link',{name:'Features',exact:true})).toHaveAttribute('aria-current','location');
 await expect(navigation.getByRole('link',{name:'Home',exact:true})).not.toHaveAttribute('aria-current');
 await navigation.getByRole('link',{name:'How it works',exact:true}).click();
 await expect(navigation.getByRole('link',{name:'How it works',exact:true})).toHaveAttribute('aria-current','location');
 await page.goBack();
 await expect(navigation.getByRole('link',{name:'Features',exact:true})).toHaveAttribute('aria-current','location').catch(async error=>{
  console.log('Back navigation state',await page.evaluate(()=>({hash:location.hash,y:scrollY,features:document.getElementById('features')?.getBoundingClientRect().top,how:document.getElementById('how-it-works')?.getBoundingClientRect().top,active:document.querySelector('[aria-current]')?.textContent})));
  throw error;
 });
 await page.goForward();
 await expect(navigation.getByRole('link',{name:'How it works',exact:true})).toHaveAttribute('aria-current','location');
 await page.goBack();
 await expect(navigation.getByRole('link',{name:'Features',exact:true})).toHaveAttribute('aria-current','location');
 // Scroll manually without changing the URL; active navigation must follow the content.
 await page.evaluate(()=>document.getElementById('how-it-works')!.scrollIntoView({block:'start'}));
 await expect(navigation.getByRole('link',{name:'How it works',exact:true})).toHaveAttribute('aria-current','location');
 await page.evaluate(()=>document.getElementById('features')!.scrollIntoView({block:'start'}));
 await expect(navigation.getByRole('link',{name:'Features',exact:true})).toHaveAttribute('aria-current','location');
 await page.evaluate(()=>scrollTo(0,0));
 await expect(navigation.getByRole('link',{name:'Home',exact:true})).toHaveAttribute('aria-current','page');
 await page.locator('.site-footer').scrollIntoViewIfNeeded();
 expect(await navigation.evaluate(node=>Math.round(node.getBoundingClientRect().top))).toBe(0);
 await navigation.getByRole('link',{name:'About',exact:true}).click();
 await expect(page).toHaveURL(/\/about$/);await expect(page.getByRole('heading',{level:1})).toHaveText('About Visionary.');
 await expect(page.getByRole('link',{name:'Try it with a photo',exact:true})).toHaveCount(0);
 await expect(page.locator('.workspace')).toHaveCount(0);
 await expect(navigation.getByRole('link',{name:'About',exact:true})).toHaveAttribute('aria-current','page');
 await page.getByRole('navigation',{name:'Learn',exact:true}).getByRole('link',{name:'Privacy',exact:true}).click();
 await expect(page).toHaveURL(/\/about#privacy$/);
 await expect.poll(()=>page.locator('#privacy').evaluate(node=>node.getBoundingClientRect().top)).toBeGreaterThanOrEqual(96);
 await page.getByLabel('Search categories',{exact:true}).fill('wallet');
 await expect(page.locator('.category-list')).toContainText('wallet');
 await page.getByLabel('Search categories',{exact:true}).fill('not-an-object-name-xyz');
 await expect(page.locator('.category-list')).toContainText('No matching category');
 await page.goto('/docs');await expect(page).toHaveURL(/\/about$/);
 await page.goto('/dashboard');await expect(page.getByRole('link',{name:'Help & model guide',exact:true})).toHaveCount(0);
 expect(errors).toEqual([]);
});

test('public pages fit both themes and mobile menu links return to landing sections',async({page})=>{
 mkdirSync('../.taste-skill/public-navigation',{recursive:true});
 for(const route of ['/','/about']){
  await page.goto(route);await page.locator('html[data-app-ready=true]').waitFor();
  for(const mode of ['dark','light']){
   await chooseTheme(page,mode);
   for(const width of [1440,768,390]){
    await page.setViewportSize({width,height:1000});await page.evaluate(()=>document.fonts.ready);
    expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true);
    await page.screenshot({path:`../.taste-skill/public-navigation/${route==='/'?'home':'about'}-${mode}-${width}.png`,fullPage:true,animations:'disabled'});
   }
  }
 }
 const toggle=page.getByRole('button',{name:'Toggle navigation',exact:true});
 await page.locator('#privacy').scrollIntoViewIfNeeded();await toggle.click();
 await expect(toggle).toHaveAttribute('aria-expanded','true');
 await page.getByRole('navigation',{name:'Main navigation',exact:true}).getByRole('link',{name:'Features',exact:true}).click();
 await expect(page).toHaveURL(/\/#features$/);await expect(toggle).toHaveAttribute('aria-expanded','false');
 await expect(page.locator('.public-links a[href="#features"]')).toHaveAttribute('aria-current','location');
 await expect.poll(()=>page.locator('#features').evaluate(node=>node.getBoundingClientRect().top)).toBeGreaterThanOrEqual(82);
 await expect(page.getByRole('link',{name:'Privacy',exact:true})).toHaveAttribute('href','/about#privacy');
});
