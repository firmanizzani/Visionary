import {defineConfig} from '@playwright/test';
export default defineConfig({testDir:'./e2e',timeout:180000,workers:1,use:{baseURL:process.env.TEST_BASE_URL||'http://127.0.0.1:5173',channel:'chrome',headless:true,launchOptions:{args:['--use-fake-ui-for-media-stream','--use-fake-device-for-media-stream','--disable-gpu']}},reporter:[['list']],outputDir:'test-results'});
