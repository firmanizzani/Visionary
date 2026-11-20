import {test,expect} from '@playwright/test';
import {mkdirSync} from 'node:fs';
import {chooseTheme} from './helpers';

test('object breakdown combines counts and shares, expands, and fits narrow screens',async({page})=>{
 const objects=[{label:'chair',count:5},{label:'person',count:10},{label:'beret',count:2},{label:'curtain',count:1},{label:'water bottle',count:1},{label:'remote control',count:1}];
 await page.route('**/api/v1/**',route=>{
  const url=new URL(route.request().url()),path=url.pathname;
  const empty=url.searchParams.get('days')==='7';
  let json:unknown;
  if(path.endsWith('/auth/me'))json={id:'analytics-preview',full_name:'Analytics Preview',email:'preview@example.com'};
  else if(path.endsWith('/users/settings'))json={confidence_threshold:.5,visualization_mode:'both',show_confidence:true};
  else if(path.endsWith('/analytics/summary'))json={total_detections:empty?0:4,total_objects:empty?0:20,unique_categories:empty?0:6,average_confidence:empty?0:.9,most_detected:empty?null:'person'};
  else if(path.endsWith('/analytics/objects'))json=empty?[]:objects;
  else if(path.endsWith('/analytics/activity'))json=empty?[]:[{date:new Date().toISOString().slice(0,10),count:4}];
  else if(path.endsWith('/analytics/sources'))json=empty?[]:[{label:'image',count:3},{label:'camera',count:1}];
  else return route.fulfill({status:404,json:{detail:'Not found'}});
  return route.fulfill({json});
 });
 await page.goto('/analytics');
 const panel=page.getByRole('region',{name:'Detected objects',exact:true});
 await expect(panel.getByRole('row')).toHaveCount(6);
 await expect(panel.getByRole('columnheader',{name:'Percentage',exact:true})).toBeVisible();
 await expect(page.getByRole('heading',{name:'Category distribution',exact:true})).toHaveCount(0);
 const person=panel.getByRole('row').nth(1);
 await expect(person).toHaveText(/person\s*10\s*50.0%/);
 await expect(person.locator('.category-bar>span')).toHaveAttribute('style',/width: 50%/);
 await panel.getByRole('button',{name:'View all 6'}).click();
 await expect(panel.getByRole('row')).toHaveCount(7);
 await panel.getByRole('button',{name:'Show top 5'}).focus();
 await page.keyboard.press('Enter');
 await expect(panel.getByRole('row')).toHaveCount(6);
 mkdirSync('../.taste-skill/analytics',{recursive:true});
 for(const theme of ['dark','light']){
  await chooseTheme(page,theme);
  for(const width of [1440,768,390,320]){
   await page.setViewportSize({width,height:1000});
   await page.evaluate(()=>document.fonts.ready);
   await expect(panel).toBeVisible();
   expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true);
   await panel.screenshot({path:`../.taste-skill/analytics/objects-${theme}-${width}.png`,animations:'disabled'});
   if(theme==='dark'&&width===1440)await page.screenshot({path:'../.taste-skill/analytics/desktop.png',fullPage:true,animations:'disabled'});
  }
 }
 await page.getByRole('combobox',{name:'Analytics period'}).selectOption('7');
 await expect(panel).toContainText('Save a detection to see object counts and percentages.');
 await expect(panel.getByRole('button')).toHaveCount(0);
 await expect(panel).not.toContainText(/NaN|Infinity/);
});
