import {test} from 'node:test';
import assert from 'node:assert/strict';
import {validateDeployment} from './check-deployment.mjs';
test('accepts an HTTPS backend origin with same-origin browser API paths',()=>{
 assert.deepEqual(validateDeployment({BACKEND_ORIGIN:'https://api.example.com',PUBLIC_API_BASE_URL:'/api/v1'}),[]);
});
test('rejects absent/local/template origins and cross-site browser API URLs',()=>{
 for(const value of ['', 'http://127.0.0.1:8001','https://YOUR-BACKEND.vercel.app','https://api.example.com/api/v1','https://user:pass@api.example.com'])assert.ok(validateDeployment({BACKEND_ORIGIN:value}).length);
 assert.ok(validateDeployment({BACKEND_ORIGIN:'https://api.example.com',PUBLIC_API_BASE_URL:'https://api.example.com/api/v1'}).length);
});
