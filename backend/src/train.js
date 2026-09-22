import dotenv from "dotenv";dotenv.config();
const base=process.env.TRAIN_API_BASE_URL;
function headers(){const h={"Accept":"application/json","User-Agent":"RAILCUE/1.0"};if(process.env.TRAIN_API_KEY)h[process.env.TRAIN_API_AUTH_HEADER||"x-api-key"]=process.env.TRAIN_API_KEY;return h;}
export async function trainStatus(number){
 if(!base)return {live:false,status:"unavailable",source:null,last_updated:null,reason:"No verified live train API configured"};
 const u=base.replace(/\/$/,"")+"/trains/"+encodeURIComponent(number)+"/status";
 const c=new AbortController(),t=setTimeout(()=>c.abort(),10000);
 try{const r=await fetch(u,{headers:headers(),signal:c.signal});if(!r.ok)throw new Error("TRAIN_API_HTTP_"+r.status);const d=await r.json();return {...d,live:Boolean(d.live),source:d.source||"verified_api",last_updated:d.last_updated||new Date().toISOString()};}
 catch(e){return {live:false,status:"unavailable",source:"verified_api",last_updated:new Date().toISOString(),reason:e.name==="AbortError"?"timeout":"external_api_error"}}
 finally{clearTimeout(t);}
}
export async function liveTrains(){return {live:false,trains:[],source:base?"verified_api":null,last_updated:new Date().toISOString(),status:base?"api_unavailable":"unavailable"};}
