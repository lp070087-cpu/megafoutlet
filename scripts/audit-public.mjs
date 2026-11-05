import fs from "node:fs";
import path from "node:path";
const failures=[];
for(const p of ['src/data/oficial','public/planta','private-mapping']) if(fs.existsSync(p)) failures.push(p);
function walk(dir,checkContent=false){
 if(!fs.existsSync(dir))return;
 for(const entry of fs.readdirSync(dir,{withFileTypes:true})){
  const p=path.join(dir,entry.name);
  if(entry.isSymbolicLink()) { failures.push(`${p}: link não permitido`); continue; }
  if(entry.isDirectory()){walk(p,checkContent);continue;}
  if(/\.pdf$|^\.env/i.test(entry.name))failures.push(p);
  if(checkContent&&/\.(js|json|html|css|map)$/.test(p)){
   const content=fs.readFileSync(p,'utf8');
   if(content.includes('official-occurrence-')||content.includes('mapping-review.json'))failures.push(`${p}: marcador privado`);
  }
 }
}
for(const p of ['src','public','docs'])walk(p);
walk('.next/static',true);walk('.next/server',true);
if(failures.length){console.error(JSON.stringify(failures));process.exitCode=1;}else console.log('Auditoria: nenhuma fonte privada, PDF, .env ou marcador de extração oficial encontrado nos caminhos examinados.');
