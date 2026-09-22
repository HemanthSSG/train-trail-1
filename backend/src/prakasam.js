import Database from "better-sqlite3";
import fs from "node:fs";
import path from "node:path";

const dbPath=process.env.PRAKASAM_DB_PATH||path.resolve(process.cwd(),"railway_prakasam.db");
let db=null;
function getDb(){
  if(!fs.existsSync(dbPath)) return null;
  if(!db) db=new Database(dbPath,{readonly:true});
  return db;
}
const qid=s=>"`"+String(s).replaceAll("`","``")+"`";
const hav=(a,b,c,d)=>{const R=6371,rad=x=>x*Math.PI/180, p1=rad(a),p2=rad(c),dp=rad(c-a),dl=rad(d-b);const x=Math.sin(dp/2)**2+Math.cos(p1)*Math.cos(p2)*Math.sin(dl/2)**2;return R*2*Math.atan2(Math.sqrt(x),Math.sqrt(1-x));};
const pick=(row,names)=>names.find(n=>row[n]!=null);
function tableColumns(d,t){try{return d.prepare(`pragma table_info(${qid(t)})`).all().map(x=>x.name)}catch{return[]}}
function firstTable(d,names){const tables=d.prepare("select name from sqlite_master where type='table'").all().map(x=>x.name);return names.find(x=>tables.includes(x))||null}
function rowsAsObjects(d,t){return d.prepare(`select * from ${qid(t)}`).all()}
function pointFrom(row){
  const lat=pick(row,["lat","latitude","gate_lat","train_lat"]); const lng=pick(row,["lng","lon","longitude","gate_lng","train_lng"]);
  return lat!=null&&lng!=null?{latitude:Number(lat),longitude:Number(lng)}:null;
}
function gateRows(d){
  const t=firstTable(d,["railway_gates","gates","railway_gate"]); if(!t)return [];
  return rowsAsObjects(d,t).map(r=>{const p=pointFrom(r);return {...r,_id:r.id??r.gate_id??r.gate_number??r.gate_code,_code:r.gate_code??r.gate_number??r.ref??r.id,_point:p};}).filter(x=>x._point);
}
function trainRows(d){
  const t=firstTable(d,["live_train_states","train_positions","live_trains"]); if(!t)return [];
  return rowsAsObjects(d,t).map(r=>{const p=pointFrom(r);return {...r,_trainNumber:String(r.train_number??r.number??r.train_no??r.train_id??""),_point:p,_speed:Number(r.speed??r.speed_kmh??0),_updated:r.last_updated_at??r.timestamp??r.updated_at??null};}).filter(x=>x._point&&x._trainNumber);
}
function routePointDistance(point,geometry){
  const coords=geometry?.coordinates||[]; let best=Infinity,index=-1;
  for(let i=0;i<coords.length;i++){const [lng,lat]=coords[i];const d=hav(point.latitude,point.longitude,lat,lng);if(d<best){best=d;index=i;}}
  return {distanceKm:best,index};
}
function mappingForTrain(d,trainNumber){
  const t=firstTable(d,["railway_gate_trains","gate_train_map","train_gate_mappings","train_gate_relationships"]); if(!t)return new Set();
  const cols=tableColumns(d,t); const trainCol=["train_number","train_no","train_id"].find(x=>cols.includes(x)); const gateCol=["gate_id","gate_code","gate_number"].find(x=>cols.includes(x));
  if(!trainCol||!gateCol)return new Set();
  const value=String(trainNumber); const rows=d.prepare(`select ${qid(gateCol)} v from ${qid(t)} where cast(${qid(trainCol)} as text)=?`).all(value);
  return new Set(rows.map(x=>String(x.v)));
}
export function prakasamHealth(){
  const d=getDb(); if(!d) return {enabled:false,available:false,path:dbPath};
  const count=t=>{try{return d.prepare(`select count(*) n from ${qid(t)}`).get().n}catch{return null}};
  return {enabled:true,available:true,district:"Prakasam",data_source:"TEMPORARY_TRIAL_DATABASE",simulated:true,
    tables:{stations:count("stations"),gates:count("railway_gates"),trains:count("trains"),schedules:count("schedules"),live_train_states:count("live_train_states"),gate_events:count("gate_events")}};
}
export function prakasamLiveTrains(){
  const d=getDb(); if(!d)return {live:false,trains:[],source:null,status:"unavailable"};
  const rows=trainRows(d).map(({_trainNumber,_point,_speed,_updated,...r})=>({...r,train_number:_trainNumber,latitude:_point.latitude,longitude:_point.longitude,speed:_speed,last_updated_at:_updated}));
  return {live:false,simulation:true,district:"Prakasam",source:"TEMPORARY_TRIAL_DATABASE",last_updated:new Date().toISOString(),trains:rows};
}
export function prakasamTrainStatus(number){
  const d=getDb(); if(!d)return {live:false,status:"unavailable",source:null};
  const trainsTable=firstTable(d,["trains","train"]); const schedulesTable=firstTable(d,["schedules","train_schedules"]);
  const train=trainsTable?d.prepare(`select * from ${qid(trainsTable)} where cast(number as text)=? or cast(train_number as text)=?`).get(number,number):null;
  const states=trainRows(d).filter(x=>x._trainNumber===String(number));
  const schedule=schedulesTable?d.prepare(`select * from ${qid(schedulesTable)} where cast(train_number as text)=?`).all(number):[];
  if(!train&&!states.length)return {live:false,status:"not_found",source:"TEMPORARY_TRIAL_DATABASE"};
  return {live:false,simulation:true,source:"TEMPORARY_TRIAL_DATABASE",train:train||null,state:states[0]||null,schedule};
}
export function prakasamGate(gateCode){
  const d=getDb(); if(!d)return null;
  const gates=gateRows(d); const gate=gates.find(x=>String(x._code)===String(gateCode)||String(x._id)===String(gateCode)); if(!gate)return null;
  const trains=prakasamLiveTrains().trains;
  const approaching=trains.map(t=>{const distanceKm=hav(t.latitude,t.longitude,gate._point.latitude,gate._point.longitude);return {...t,distance_to_gate_km:Number(distanceKm.toFixed(3)),eta_minutes:t.speed>0?Math.max(0,Math.round(distanceKm/t.speed*60)):null};}).sort((a,b)=>(a.distance_to_gate_km??Infinity)-(b.distance_to_gate_km??Infinity));
  return {gate,trains:approaching,events:[],source:"TEMPORARY_TRIAL_DATABASE",simulation:true,physical_gate_status:"UNKNOWN"};
}
export function prakasamRailRun({user,routeGeometry}){
  const d=getDb(); if(!d)return {available:false,district:"Prakasam",gates:[],trains:[]};
  const gates=gateRows(d), trains=trainRows(d);
  const routeGates=gates.map(g=>{const rp=routePointDistance(g._point,routeGeometry);return {...g,route_distance_km:Number(rp.distanceKm.toFixed(3)),route_index:rp.index};})
    .filter(g=>g.route_distance_km<=Number(process.env.PRAKASAM_GATE_ROUTE_MATCH_KM||0.5)).sort((a,b)=>a.route_index-b.route_index);
  const resultGates=routeGates.map(g=>{
    const candidates=trains.map(t=>{
      const distanceKm=hav(t._point.latitude,t._point.longitude,g._point.latitude,g._point.longitude);
      const eta=t._speed>0?Math.round(distanceKm/t._speed*60):null;
      const associated=mappingForTrain(d,t._trainNumber);
      const mapped=associated.has(String(g._id))||associated.has(String(g._code));
      return {train_number:t._trainNumber,latitude:t._point.latitude,longitude:t._point.longitude,speed_kmh:t._speed,distance_to_gate_km:Number(distanceKm.toFixed(3)),eta_minutes:eta,mapped_to_gate:mapped,last_updated_at:t._updated};
    }).filter(t=>t.mapped_to_gate||t.distance_to_gate_km<=Number(process.env.PRAKASAM_TRAIN_GATE_RADIUS_KM||15))
      .sort((a,b)=>(a.eta_minutes??Infinity)-(b.eta_minutes??Infinity));
    const next=candidates[0]||null;
    return {gate_id:g._id,gate_code:g._code,name:g.name??g.gate_name??null,latitude:g._point.latitude,longitude:g._point.longitude,
      route_distance_km:g.route_distance_km,train_count:candidates.length,approaching_trains:candidates,
      predicted_gate_status:next?.eta_minutes!=null&&next.eta_minutes<=5?"CLOSING_SOON":"NO_TRAIN_WITHIN_THRESHOLD",
      physical_gate_status:"UNKNOWN",status_note:"Prediction only; train GPS does not prove physical gate state."};
  });
  return {available:true,district:"Prakasam",simulation:true,source:"TEMPORARY_TRIAL_DATABASE",user,route_gate_count:resultGates.length,gates:resultGates,
    trains:prakasamLiveTrains().trains.map(t=>({train_number:t.train_number,latitude:t.latitude,longitude:t.longitude,speed:t.speed,last_updated_at:t.last_updated_at}))};
}
