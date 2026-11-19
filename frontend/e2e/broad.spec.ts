import {test,expect} from '@playwright/test';
import path from 'node:path';
import {mkdirSync,writeFileSync,existsSync} from 'node:fs';
test('recognizes broader everyday categories through the actual browser pipeline',async({page})=>{
 test.skip(!existsSync(path.resolve('../ml/checks/user-glasses.png')),'Local user regression image is intentionally not distributed.');
 test.setTimeout(240000);mkdirSync('../.taste-skill/broad',{recursive:true});
 const errors:string[]=[];page.on('pageerror',e=>errors.push(e.message));
 await page.goto('/detect/image');await page.locator('html[data-app-ready=true]').waitFor();
 const samples=[['user-glasses.png',/spectacles|sunglasses|eyeglasses/],['wallet.jpg',/wallet/],['lamp.jpg',/lamp|spotlight/],['perfume.jpg',/perfume/]] as const;
 const report:unknown[]=[];
 for(const [file,expected] of samples){
  await page.locator('input[type=file]').setInputFiles(path.resolve('../ml/checks',file));
  await page.getByRole('button',{name:'Detect objects',exact:true}).click();
  await expect(page.getByText('Analysis complete',{exact:true})).toBeVisible({timeout:150000});
  const labels=await page.locator('.object-counts').innerText();console.log('BROAD RESULT',file,labels.replaceAll('\n',' '));
  report.push({file,labels});
  await page.screenshot({path:`../.taste-skill/broad/${file}.png`,fullPage:true});
  writeFileSync('../.taste-skill/broad/results.json',JSON.stringify(report,null,2));
  await expect(page.locator('.object-counts')).toContainText(expected);
 }
 expect(errors).toEqual([]);
});
