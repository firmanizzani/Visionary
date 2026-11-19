import type {Page} from '@playwright/test';
export async function chooseTheme(page:Page,value:string){
 if(value!=='dark'&&value!=='light')throw new Error(`Unsupported theme: ${value}`);
 if(await page.locator('html').getAttribute('data-theme')!==value){
  await page.getByRole('button',{name:/Switch to (light|dark) mode/}).first().click();
 }
}
