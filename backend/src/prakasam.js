import Database from "better-sqlite3";
import fs from "node:fs";
import path from "node:path";

const dbPath=process.env.PRAKASAM_DB_PATH||path.resolve(process.cwd(),"data/railway_prakasam.db");
let db=null;
function getDb(){
  if(!fs.existsSync(dbPath)) return null;
  if(!db) db=new Database(dbPath,{readonly:true});
  return db;
}
export function prakasamHealth(){
  const d=getDb(); if(!d) return {enabled:false,available:false,path:dbPath};
  const count=t=>d.prepare(`select count(*) n from ${t}`).get().n;
  return {enabled:true,available:true,district:"Prakasam",data_source:"TEMPORARY_TRIAL_DATABASE",simulated:true,
    tables:{stations:count("stations"),gates:count("railway_gates"),trains:count("trains"),schedules:count("schedules"),
      live_train_states:count("live_train_states"),gate_events:count("gate_events")}};
}
export function prakasamLiveTrains(){
  const d=getDb(); if(!d) return {live:false,trains:[],source:null,status:"unavailable"};
  const rows=d.prepare(`select l.train_number,l.lat,l.lng,l.speed,l.heading,l.current_status,l.last_station_code,l.next_station_code,l.delay_minutes,l.data_source,l.last_updated_at
    from live_train_states l order by l.last_updated_at desc`).all();
  return {live:false,simulation:true,district:"Prakasam",source:"TEMPORARY_TRIAL_DATABASE",last_updated:new Date().toISOString(),trains:rows};
}
export function prakasamTrainStatus(number){
  const d=getDb(); if(!d) return {live:false,status:"unavailable",source:null};
  const train=d.prepare("select * from trains where number=?").get(number);
  const state=d.prepare("select * from live_train_states where train_number=?").get(number);
  const schedule=d.prepare("select * from schedules where train_number=? order by id").all(number);
  if(!train) return {live:false,status:"not_found",source:"TEMPORARY_TRIAL_DATABASE"};
  return {live:false,simulation:Boolean(state),source:"TEMPORARY_TRIAL_DATABASE",train,state:state||null,schedule};
}
export function prakasamGate(gateCode){
  const d=getDb(); if(!d) return null;
  const gate=d.prepare("select * from railway_gates where gate_code=?").get(gateCode);
  if(!gate) return null;
  const trains=d.prepare(`select t.* from trains t join railway_gate_trains m on m.train_number=t.number where m.gate_code=?`).all(gateCode);
  const events=d.prepare("select * from gate_events where gate_code=? order by id desc").all(gateCode);
  return {gate,trains,events,source:"TEMPORARY_TRIAL_DATABASE",simulation:true};
}
