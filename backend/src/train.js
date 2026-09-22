import dotenv from "dotenv";
import {query} from "./db.js";
dotenv.config();
const base=process.env.TRAIN_API_BASE_URL;
const trial=String(process.env.PRAKASAM_TRIAL_DATA||"false").toLowerCase()==="true";
function headers(){const h={"Accept":"application/json","User-Agent":"RAILCUE/1.0"};if(process.env.TRAIN_API_KEY)h[process.env.TRAIN_API_AUTH_HEADER||"x-api-key"]=process.env.TRAIN_API_KEY;return h;}
async function trialStatus(number){
 const r=await query(`select t.train_number,t.train_name,t.origin,t.destination,p.latitude,p.longitude,p.speed,p.heading,p.current_station,p.next_station,p.delay,p.timestamp from trains t left join lateral (select * from train_positions p where p.train_id=t.id order by p.timestamp desc limit 1) p on true where t.train_number=$1`,[number]);
 if(!r.rows.length)return {live:false,status:"not_found",source:"PRAKASAM_TRIAL_DATA",last_updated:null,data_state:"TRIAL"};
 const x=r.rows[0];
 return {live:false,status:"SIMULATED",train_number:x.train_number,train_name:x.train_name,origin:x.origin,destination:x.destination,latitude:x.latitude,longitude:x.longitude,speed:x.speed,heading:x.heading,current_station:x.current_station,next_station:x.next_station,delay_minutes:x.delay,last_updated:x.timestamp,source:"PRAKASAM_TRIAL_DATA",data_state:"TRIAL"};
}
export async function trainStatus(number){
 if(trial)return trialStatus(number);
 if(!base)return {live:false,status:"unavailable",source:null,last_updated:null,reason:"No verified live train API configured"};
 const u=base.replace(/\\/$/,"")+"/trains/"+encodeURIComponent(number)+"/status";
 const c=new AbortController(),t=setTimeout(()=>c.abort(),10000);
 try{const r=await fetch(u,{headers:headers(),signal:c.signal});if(!r.ok)throw new Error("TRAIN_API_HTTP_"+r.status);const d=await r.json();return {...d,live:Boolean(d.live),source:d.source||"verified_api",last_updated:d.last_updated||new Date().toISOString()};}
 catch(e){return {live:false,status:"unavailable",source:"verified_api",last_updated:new Date().toISOString(),reason:e.name==="AbortError"?"timeout":"external_api_error"}}
 finally{clearTimeout(t);}
}
export async function liveTrains(){
 if(!trial)return {live:false,trains:[],source:base?"verified_api":null,last_updated:new Date().toISOString(),status:base?"api_unavailable":"unavailable"};
 const r=await query(`select t.train_number,t.train_name,t.origin,t.destination,p.latitude,p.longitude,p.speed,p.heading,p.current_station,p.next_station,p.delay,p.timestamp from trains t join lateral (select * from train_positions p where p.train_id=t.id order by p.timestamp desc limit 1) p on true order by t.train_number`);
 return {live:false,status:"SIMULATED",source:"PRAKASAM_TRIAL_DATA",data_state:"TRIAL",last_updated:new Date().toISOString(),trains:r.rows.map(x=>({...x,delay_minutes:x.delay,last_updated:x.timestamp}))};
}
