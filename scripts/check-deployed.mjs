// Read-only checks after both Vercel projects have their real production URLs.
const values=Object.fromEntries(process.argv.slice(2).reduce((pairs,value,index,args)=>value.startsWith('--')?[...pairs,[value.slice(2),args[index+1]]]:pairs,[]));
try{
 const frontend=new URL(values.frontend),backend=new URL(values.backend);
 if([frontend,backend].some(url=>url.protocol!=='https:'||url.username||url.password||url.pathname!=='/'))throw Error('Provide --frontend and --backend as HTTPS origins without paths.');
 for(const [label,url] of [['backend',new URL('/api/v1/health',backend)],['frontend API proxy',new URL('/api/v1/health',frontend)]]){
  const response=await fetch(url,{signal:AbortSignal.timeout(60000)});
  if(!response.ok||(await response.json()).status!=='ok')throw Error(label+' health check failed.');
  console.log('PASS '+label+' health');
 }
 const cors=await fetch(new URL('/api/v1/auth/login',backend),{method:'OPTIONS',headers:{Origin:frontend.origin,'Access-Control-Request-Method':'POST','Access-Control-Request-Headers':'content-type,x-csrf-token'},signal:AbortSignal.timeout(30000)});
 if(!cors.ok||cors.headers.get('access-control-allow-origin')!==frontend.origin)throw Error('Backend FRONTEND_URL does not match the frontend production origin.');
 console.log('PASS production origin configuration');
 const auth=await fetch(new URL('/api/v1/auth/me',frontend),{signal:AbortSignal.timeout(30000)});
 if(auth.status!==401)throw Error('Expected an unauthenticated API response through the proxy.');
 console.log('PASS same-origin authentication route');
 console.log('Deployment checks passed. Complete a real sign-in, camera/photo and saved-snapshot check in your browser.');
}catch(error){console.error(error instanceof Error?error.message:'Deployment check failed.');process.exitCode=1;}
