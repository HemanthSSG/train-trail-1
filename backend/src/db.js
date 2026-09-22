import pg from "pg";
import dotenv from "dotenv";
dotenv.config();
const {Pool}=pg;
export const pool=new Pool({connectionString:process.env.DATABASE_URL});
export async function query(text,params){return pool.query(text,params);}
export async function dbHealth(){const r=await query("select 1 as ok");return r.rows[0].ok===1;}
