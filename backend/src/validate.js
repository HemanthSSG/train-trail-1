import {z} from "zod";
export const coords=z.object({latitude:z.coerce.number().gte(-90).lte(90),longitude:z.coerce.number().gte(-180).lte(180)});
export const nearbySchema=coords.extend({radius:z.coerce.number().positive().max(100000).default(25000)});
export const journeySchema=z.object({start:coords,destination:coords});
export const trainNumber=z.string().trim().min(1).max(20).regex(/^[A-Za-z0-9_-]+$/);
export function parse(schema,input){const r=schema.safeParse(input);if(!r.success){const e=new Error("Invalid request parameters");e.status=400;e.code="INVALID_REQUEST";throw e;}return r.data;}
