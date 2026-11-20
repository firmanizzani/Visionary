export function validateDeployment(env){
 const errors=[];
 try{const u=new URL(env.BACKEND_ORIGIN||'');if(u.protocol!=='https:'||u.username||u.password||u.pathname!=='/'||u.search||u.hash||/YOUR-|localhost|127\.0\.0\.1/i.test(u.hostname))throw Error();}catch{errors.push('Set BACKEND_ORIGIN to the actual backend HTTPS origin, without /api/v1.');}
 if(env.PUBLIC_API_BASE_URL&&env.PUBLIC_API_BASE_URL!=='/api/v1')errors.push('PUBLIC_API_BASE_URL must be /api/v1 so authentication cookies stay on the frontend origin.');
 return errors;
}
if(process.env.VERCEL||process.argv.includes('--production')){
 const errors=validateDeployment(process.env);
 if(errors.length){console.error('Deployment configuration is incomplete:\n'+errors.map(error=>' - '+error).join('\n'));process.exitCode=1;}
 else console.log('Frontend deployment configuration passed.');
}
