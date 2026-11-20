import {test,expect} from '@playwright/test';
import {mkdirSync} from 'node:fs';

test('English category suggestions support keyboard selection and dismissal',async({page})=>{
 await page.goto('/about#categories');await page.locator('html[data-app-ready=true]').waitFor();
 const search=page.getByRole('combobox',{name:'Search categories',exact:true});
 await expect(page.locator('main')).not.toContainText(/kacamata|dompet|lampu|parfum\./i);
 await search.fill('wal');await expect(page.getByRole('option',{name:'wallet',exact:true})).toBeVisible();
 const walletIndex=(await page.getByRole('option').allTextContents()).indexOf('wallet');
 for(let index=0;index<=walletIndex;index++)await search.press('ArrowDown');
 await expect(search).toHaveAttribute('aria-activedescendant',`category-option-${walletIndex}`);
 await search.press('Enter');await expect(search).toHaveValue('wallet');await expect(search).toHaveAttribute('aria-expanded','false');
 await expect(page.locator('.category-list')).toContainText('wallet');
 await search.fill('glasses');await expect(page.getByRole('option',{name:'sunglasses',exact:true})).toBeVisible();
 await search.press('Escape');await expect(search).toHaveAttribute('aria-expanded','false');
 await search.fill('not-a-supported-object-xyz');await expect(page.locator('.category-list')).toContainText('No matching category');
});

test('phone users can tap suggestions without horizontal overflow',async({browser,baseURL})=>{
 const context=await browser.newContext({viewport:{width:320,height:844},isMobile:true,hasTouch:true});
 try{
  const page=await context.newPage();await page.goto(`${baseURL}/about#categories`);await page.locator('html[data-app-ready=true]').waitFor();
  const search=page.getByRole('combobox',{name:'Search categories',exact:true});
  await search.tap();await expect(page.getByRole('option',{name:'wallet',exact:true})).toBeVisible();
  await search.fill('perfume');await expect(page.getByRole('option',{name:'perfume bottle',exact:true})).toBeVisible();
  mkdirSync('../.taste-skill/responsive',{recursive:true});await page.screenshot({path:'../.taste-skill/responsive/category-suggestions-mobile.png',fullPage:true});
  await page.getByRole('option',{name:'perfume bottle',exact:true}).tap();
  await expect(search).toHaveValue('perfume bottle');await expect(search).toHaveAttribute('aria-expanded','false');
  expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true);
 }finally{await context.close();}
});
