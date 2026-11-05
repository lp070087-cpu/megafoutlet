/** Data-free validator. All coordinates share the same unit and top-left origin. */
export interface CaixaMapa { id: string; numero?: string; x: number; y: number; w: number; h: number; larguraM?: number | null; profundidadeM?: number | null; rotacao?: number }
export interface PendenciaGeometrica { tipo: string; ids: string[]; detalhe: string }
function poligono(r: CaixaMapa) {
  const a=(r.rotacao??0)*Math.PI/180,c=Math.cos(a),s=Math.sin(a);
  return [[-r.w/2,-r.h/2],[r.w/2,-r.h/2],[r.w/2,r.h/2],[-r.w/2,r.h/2]].map(([x,y])=>({x:r.x+r.w/2+x*c-y*s,y:r.y+r.h/2+x*s+y*c}));
}
function sobrepoe(a: CaixaMapa,b: CaixaMapa) {
  const pa=poligono(a),pb=poligono(b);
  for(const p of [pa,pb]) for(let i=0;i<4;i++) {
    const q=p[(i+1)%4],axis={x:-(q.y-p[i].y),y:q.x-p[i].x};
    const aa=pa.map(v=>v.x*axis.x+v.y*axis.y),bb=pb.map(v=>v.x*axis.x+v.y*axis.y);
    if(Math.min(...aa)>=Math.max(...bb)-1e-7||Math.min(...bb)>=Math.max(...aa)-1e-7)return false;
  }
  return true;
}
export function validarGeometria(espacos: CaixaMapa[],limite: CaixaMapa,corredores: CaixaMapa[]=[]) {
  const pendencias: PendenciaGeometrica[]=[],numeros=new Map<string,string[]>(),ids=new Set<string>();
  const validos=espacos.filter(e=>[e.x,e.y,e.w,e.h,e.rotacao??0].every(Number.isFinite)&&e.w>0&&e.h>0);
  for(const e of espacos) {
    if(ids.has(e.id))pendencias.push({tipo:"id_duplicado",ids:[e.id],detalhe:"Identificador interno repetido"});
    ids.add(e.id);
    if(e.numero)numeros.set(e.numero,[...(numeros.get(e.numero)??[]),e.id]);
    if(!validos.includes(e)){pendencias.push({tipo:"geometria_invalida",ids:[e.id],detalhe:"Coordenadas ou tamanho inválidos"});continue;}
    if(!((e.larguraM??0)>0&&(e.profundidadeM??0)>0))pendencias.push({tipo:"dimensoes_ausentes",ids:[e.id],detalhe:"Não inferir dimensões sem evidência"});
    if(poligono(e).some(p=>p.x<limite.x-0.01||p.y<limite.y-0.01||p.x>limite.x+limite.w+0.01||p.y>limite.y+limite.h+0.01))pendencias.push({tipo:"fora_limite",ids:[e.id],detalhe:"Fora do limite documentado"});
    for(const c of corredores)if(sobrepoe(e,c))pendencias.push({tipo:"conflito_corredor",ids:[e.id,c.id],detalhe:"Revisar circulação; não comercializar"});
  }
  for(const [numero,ocorrencias]of numeros)if(ocorrencias.length>1)pendencias.push({tipo:"numero_duplicado",ids:ocorrencias,detalhe:`Número ${numero}: preservar ocorrências distintas`});
  for(let i=0;i<validos.length;i++)for(let j=i+1;j<validos.length;j++)if(sobrepoe(validos[i],validos[j]))pendencias.push({tipo:"sobreposicao",ids:[validos[i].id,validos[j].id],detalhe:"Revisar interseção geométrica"});
  return pendencias;
}
