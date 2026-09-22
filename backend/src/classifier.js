const railwayStation=new Set(["station"]);
const railwayGate=new Set(["level_crossing"]);
export function classifyFeature(feature={}){
  const t=feature.tags||feature.properties||{};
  const railway=String(t.railway||"").toLowerCase();
  const crossing=String(t.crossing||"").toLowerCase();
  const highway=String(t.highway||"").toLowerCase();
  const junction=String(t.junction||"").toLowerCase();
  const name=String(t.name||"").trim();
  if(railwayStation.has(railway)) return {name,category:"railway_station",railway_symbol:true,railway_name:name||"Railway Station",confidence:"high",reason:"OSM railway=station"};
  if(railwayGate.has(railway)||crossing==="level_crossing"||(railway==="crossing"&&(crossing==="railway"||crossing==="level_crossing"))) return {name,category:"railway_gate",railway_symbol:true,railway_name:name||"Mapped Railway Gate",confidence:"high",reason:"Physical railway level-crossing metadata"};
  if(highway) return {name,category:["motorway","trunk","primary","secondary","tertiary"].includes(highway)?"highway":"road",railway_symbol:false,railway_name:null,confidence:"high",reason:"Mapped physical road feature"};
  if(junction||String(t.place||"").toLowerCase()==="junction") return {name,category:"junction",railway_symbol:false,railway_name:null,confidence:"high",reason:"Mapped physical junction"};
  return {name,category:"unknown",railway_symbol:false,railway_name:null,confidence:"low",reason:"Insufficient physical metadata"};
}
export const isRailway=c=>["railway_station","railway_gate","railway_crossing"].includes(c?.category)&&c.railway_symbol===true;
