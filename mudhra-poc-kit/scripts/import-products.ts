import fs from "node:fs";
import path from "node:path";
import { createClient } from "@supabase/supabase-js";

const csvPath = path.resolve(process.argv[2] ?? "data/products.csv");
const text = fs.readFileSync(csvPath, "utf8");

function parseCsv(input: string): string[][] {
  const rows: string[][] = []; let row: string[] = []; let cell = ""; let quoted = false;
  for (let i=0;i<input.length;i++) {
    const ch=input[i], next=input[i+1];
    if (ch==='"' && quoted && next==='"') { cell+='"'; i++; continue; }
    if (ch==='"') { quoted=!quoted; continue; }
    if (ch===',' && !quoted) { row.push(cell); cell=""; continue; }
    if ((ch==='\n' || ch==='\r') && !quoted) { if (ch==='\r' && next==='\n') i++; row.push(cell); if(row.some(Boolean)) rows.push(row); row=[]; cell=""; continue; }
    cell+=ch;
  }
  if(cell.length || row.length) { row.push(cell); rows.push(row); }
  return rows;
}

const rows=parseCsv(text);
const [header,...data]=rows;
const ix=Object.fromEntries(header.map((h,i)=>[h,i]));
const products=data.map(r=>({
  code:r[ix.code], category:r[ix.category], name:r[ix.name]||null, description:r[ix.description]||null,
  material:r[ix.material]||null, capacity:r[ix.capacity]||null,
  colors:(r[ix.colors]||"").split("|").map(s=>s.trim()).filter(Boolean),
  price_inr:r[ix.price_inr] ? Number(r[ix.price_inr]) : null, image_path:r[ix.image_path]||null,
  source_page:r[ix.source_page] ? Number(r[ix.source_page]) : null, data_status:r[ix.data_status]||"needs_review"
}));

const url=process.env.SUPABASE_URL; const key=process.env.SUPABASE_SERVICE_ROLE_KEY;
if(!url || !key) throw new Error("Set SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY");
const supabase=createClient(url,key);
const {error}=await supabase.from("products").upsert(products,{onConflict:"code"});
if(error) throw error;
console.log(`Imported ${products.length} products`);
