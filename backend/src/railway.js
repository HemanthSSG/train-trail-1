import {query} from "./db.js";
import {classifyFeature} from "./classifier.js";
export async function nearbyStations(latitude,longitude,radius){
 const r=await query(`select id,name,station_code,city,district,state,railway_zone,source,source_id,verified,ST_Y(geom::geometry) latitude,ST_X(geom::geometry) longitude,ST_Distance(geom,ST_SetSRID(ST_MakePoint($2,$1),4326)::geography) distance from railway_stations where verified=true and ST_DWithin(geom,ST_SetSRID(ST_MakePoint($2,$1),4326)::geography,$3) order by distance limit 100`,[latitude,longitude,radius]);
 return r.rows.map(x=>({...x,category:"railway_station",railway_symbol:true,confidence:"high"}));
}
export async function nearbyCrossings(latitude,longitude,radius){
 const r=await query(`select id,name,gate_number,source,source_id,verified,ST_Y(geom::geometry) latitude,ST_X(geom::geometry) longitude,ST_Distance(geom,ST_SetSRID(ST_MakePoint($2,$1),4326)::geography) distance from railway_gates where verified=true and ST_DWithin(geom,ST_SetSRID(ST_MakePoint($2,$1),4326)::geography,$3) order by distance limit 200`,[latitude,longitude,radius]);
 return r.rows.map(x=>({...x,category:"railway_gate",railway_symbol:true,status:"unknown",live_status_available:false,confidence:"high"}));
}
export async function importOsmAround(latitude,longitude,radius,overpassUrl){
 const q=`[out:json][timeout:45];(node(around:${radius},${latitude},${longitude})["railway"="station"];node(around:${radius},${latitude},${longitude})["railway"="level_crossing"];node(around:${radius},${latitude},${longitude})["crossing"="railway"];);out center tags;`;
 const res=await fetch(overpassUrl+"?data="+encodeURIComponent(q),{headers:{"User-Agent":"RAILCUE/1.0"}});
 if(!res.ok) throw new Error("OSM_OVERPASS_UNAVAILABLE");
 return res.json();
}
