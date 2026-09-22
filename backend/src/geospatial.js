import dotenv from "dotenv";dotenv.config();
const routeBase=(process.env.ROUTING_API_URL||"https://router.project-osrm.org").replace(/\/$/,"");
export async function route(start,destination){
 const u=`${routeBase}/route/v1/driving/${start.longitude},${start.latitude};${destination.longitude},${destination.latitude}?overview=full&geometries=geojson`;
 const r=await fetch(u,{headers:{"User-Agent":"RAILCUE/1.0"}});if(!r.ok)throw Object.assign(new Error("ROUTING_UNAVAILABLE"),{code:"ROUTING_UNAVAILABLE",status:503});
 const d=await r.json();if(!d.routes?.length)throw Object.assign(new Error("NO_ROUTE"),{code:"NO_ROUTE",status:404});
 return {geometry:d.routes[0].geometry,distance_m:d.routes[0].distance,duration_s:d.routes[0].duration,source:"OSRM",data_state:"MAPPED"};
}
export function trainGateEta(distanceKm,speedKmh){if(!(distanceKm>=0)||!(speedKmh>0))return null;return Math.round((distanceKm/speedKmh)*60);}
