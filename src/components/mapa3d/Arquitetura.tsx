"use client";

import { useEffect, useLayoutEffect, useMemo, useRef } from "react";
import { useThree, type ThreeEvent } from "@react-three/fiber";
import { BufferAttribute, BufferGeometry, CanvasTexture, Color, InstancedMesh, Object3D, SRGBColorSpace } from "three";
import { ESTANDES, type Estande } from "@/data/planta";
import { AREAS_ESPECIAIS } from "@/data/areas";
import { ALTURA_ESTANDE, PISO, volume } from "./geometria";

type Caixa = { x: number; y: number; z: number; w: number; h: number; d: number; cor: string; indice?: number };
const BRANCO = "#f2f3f1";

/** Acabamentos cenográficos; não são medidas técnicas nem dados de ocupação. */
export function frenteEstande(e: Estande) {
  // Fileiras geminadas abrem para corredores opostos, nunca para o vizinho.
  return ESTANDES.some(outro => outro.id !== e.id && Math.abs(outro.x - e.x) < 0.1 && Math.abs(outro.y - e.y - e.h) < 0.1) ? -1 : 1;
}

function Lote({ caixas, onSelecionar, onHover }: { caixas: Caixa[]; onSelecionar?: (e: Estande) => void; onHover?: (index: number | null) => void }) {
  const ref = useRef<InstancedMesh>(null);
  const { invalidate } = useThree();
  useLayoutEffect(() => {
    const dummy = new Object3D(), cor = new Color();
    caixas.forEach((c, i) => {
      dummy.position.set(c.x, c.y, c.z);
      dummy.scale.set(c.w, c.h, c.d);
      dummy.updateMatrix();
      ref.current?.setMatrixAt(i, dummy.matrix);
      ref.current?.setColorAt(i, cor.set(c.cor));
    });
    if (ref.current) {
      ref.current.instanceMatrix.needsUpdate = true;
      if (ref.current.instanceColor) ref.current.instanceColor.needsUpdate = true;
      ref.current.computeBoundingSphere();
    }
    invalidate();
  }, [caixas, invalidate]);
  function click(event: ThreeEvent<MouseEvent>) {
    const indice = caixas[event.instanceId ?? -1]?.indice;
    if (indice === undefined || event.delta > 4) return;
    event.stopPropagation(); onSelecionar?.(ESTANDES[indice]);
  }
  return <instancedMesh ref={ref} args={[undefined, undefined, caixas.length]} castShadow receiveShadow onClick={click}
    onPointerMove={e => { const i = caixas[e.instanceId ?? -1]?.indice; if (i !== undefined) { e.stopPropagation(); onHover?.(i); } }} onPointerOut={() => onHover?.(null)}>
    <boxGeometry /><meshStandardMaterial roughness={0.78} metalness={0.02} />
  </instancedMesh>;
}

/** Numeração em um único atlas local, sem fontes ou imagens externas. */
function Numeros({ visiveis }: { visiveis: Set<string> }) {
  const { texture, geometry } = useMemo(() => {
    const canvas = document.createElement("canvas");
    const cols = 16, cellW = 128, cellH = 64, rows = Math.ceil(ESTANDES.length / cols);
    canvas.width = cols * cellW; canvas.height = rows * cellH;
    const ctx = canvas.getContext("2d")!;
    ctx.textAlign = "center"; ctx.textBaseline = "middle"; ctx.font = "bold 36px Arial";
    const pos: number[] = [], uv: number[] = [];
    ESTANDES.forEach((e, i) => {
      const col = i % cols, row = Math.floor(i / cols);
      ctx.fillStyle = "#ffffff"; ctx.fillRect(col * cellW, row * cellH, cellW, cellH);
      ctx.fillStyle = "#243449"; ctx.fillText(e.numero, col * cellW + cellW / 2, row * cellH + cellH / 2);
      if (!visiveis.has(e.id)) return;
      const r = volume(e), s = Math.min(1.05, r.largura * 0.72), d = s / 2;
      const z = r.z + frenteEstande(e) * r.profundidade * 0.32;
      const corners = [[r.x-s/2,z+d/2],[r.x+s/2,z+d/2],[r.x+s/2,z-d/2],[r.x-s/2,z-d/2]];
      const coords = [[col/cols,1-(row+1)/rows],[(col+1)/cols,1-(row+1)/rows],[(col+1)/cols,1-row/rows],[col/cols,1-row/rows]];
      for (const j of [0,1,2,0,2,3]) { pos.push(corners[j][0],0.185,corners[j][1]); uv.push(...coords[j]); }
    });
    const geometry = new BufferGeometry();
    geometry.setAttribute("position",new BufferAttribute(new Float32Array(pos),3));
    geometry.setAttribute("uv",new BufferAttribute(new Float32Array(uv),2)); geometry.computeVertexNormals();
    const texture = new CanvasTexture(canvas); texture.colorSpace = SRGBColorSpace; texture.anisotropy = 4;
    return { texture, geometry };
  }, [visiveis]);
  useEffect(() => () => { texture.dispose(); geometry.dispose(); }, [texture, geometry]);
  return <mesh geometry={geometry} raycast={() => null}><meshBasicMaterial map={texture} toneMapped={false} /></mesh>;
}

export function ModulosArquitetonicos({ visiveis, corDe, onSelecionar, onHover }: {
  visiveis: Set<string>; corDe: (e: Estande, i: number) => string;
  onSelecionar: (e: Estande) => void; onHover: (i: number | null) => void;
}) {
  const caixas = useMemo(() => {
    const out: Caixa[] = [];
    ESTANDES.forEach((e, indice) => {
      if (!visiveis.has(e.id)) return;
      const r = volume(e), w = r.largura - 0.06, d = r.profundidade - 0.06, frente = frenteEstande(e);
      const cor = corDe(e, indice), t = 0.10, h = e.serie === "feirinha" ? 1.9 : ALTURA_ESTANDE;
      const add = (x:number,y:number,z:number,w:number,h:number,d:number,cor:string) => out.push({x:r.x+x,y,z:r.z+z,w,h,d,cor,indice});
      add(0,0.08,0,w,0.16,d,"#e0e2e0");
      add(0,h/2+0.16,-frente*(d-t)/2,w,h,t,BRANCO);
      add(-(w-t)/2,h/2+0.16,0,t,h,d,BRANCO);
      add((w-t)/2,h/2+0.16,0,t,h,d,BRANCO);
      // Testeira aberta, fascia de setor e rodapé: o volume permanece vazado.
      add(0,h+0.08,frente*(d-t)/2,w,0.24,t*1.4,cor);
      add(0,h-0.16,-frente*(d-t)/2,w-t*2,0.28,t*1.2,cor);
      add(0,0.19,frente*(d-0.22)/2,w-t*2,0.06,0.20,cor);
      // Balcão e expositor em madeira, sempre dentro do espaço cadastrado.
      const bw = Math.min(0.95,w*0.42), bd = Math.min(0.42,d*0.25);
      add(-w*0.18,0.63,-frente*d*0.12,bw,0.9,bd,"#bba58c");
      add(-w*0.18,1.10,-frente*d*0.12,bw+0.04,0.06,bd+0.04,BRANCO);
      if (e.serie !== "feirinha") {
        add(w*0.23,0.9,-frente*d*0.28,Math.min(0.65,w*0.24),1.45,0.20,"#d2d5d4");
        add(w*0.23,1.1,-frente*d*0.28,Math.min(0.68,w*0.26),0.07,0.35,BRANCO);
      }
    }); return out;
  }, [visiveis, corDe]);
  return <><Lote caixas={caixas} onSelecionar={onSelecionar} onHover={onHover} /><Numeros visiveis={visiveis} /></>;
}

export function Edificio() {
  const caixas = useMemo(() => {
    const out: Caixa[] = [];
    const add = (x:number,y:number,z:number,w:number,h:number,d:number,cor:string) => out.push({x,y,z,w,h,d,cor});
    // Laje espessa, piso mineral e paredes de corte sem cobertura.
    add(0,-0.55,0,PISO.largura+0.8,1.1,PISO.profundidade+0.8,"#c1c7ce");
    add(0,-0.04,0,PISO.largura,0.12,PISO.profundidade,"#dce0e4");
    for (const side of [-1,1]) {
      add(side*(PISO.largura/2),1.6,0,0.22,3.2,PISO.profundidade,"#f0f1ef");
      // Borda frontal rebaixada em corte para não ocultar a maquete.
      add(0,side===1?0.35:1.6,side*PISO.profundidade/2,PISO.largura,side===1?0.7:3.2,0.22,"#f0f1ef");
    }
    // Tapetes de circulação somente em faixas livres, derivadas dos footprints existentes.
    const rects = [...ESTANDES,...AREAS_ESPECIAIS].map(volume);
    for (const axis of ["x","z"] as const) {
      const extent = axis === "x" ? PISO.largura : PISO.profundidade;
      const intervals = rects.map(r => { const len=axis==="x"?r.largura:r.profundidade; return [r[axis]-len/2,r[axis]+len/2]; }).sort((a,b)=>a[0]-b[0]);
      let edge = -extent/2;
      for (const [start,end] of [...intervals,[extent/2,extent/2]]) {
        const gap = start-edge;
        if (gap >= 1.5) {
          const width = Math.min(2.8,gap-0.6), center=(edge+start)/2;
          add(axis==="x"?center:0,0.035,axis==="z"?center:0,axis==="x"?width:PISO.largura-0.4,0.035,axis==="z"?width:PISO.profundidade-0.4,"#3c66a0");
        }
        edge=Math.max(edge,end);
      }
    }
    // Juntas do piso mineral (sem alterar corredores ou coordenadas dos estandes).
    for (let x=-PISO.largura/2+4;x<PISO.largura/2;x+=4) add(x,0.023,0,0.018,0.008,PISO.profundidade,"#cbd0d5");
    for (let z=-PISO.profundidade/2+4;z<PISO.profundidade/2;z+=4) add(0,0.023,z,PISO.largura,0.008,0.018,"#cbd0d5");
    return out;
  }, []);
  return <Lote caixas={caixas} />;
}

export function MobiliarioComum() {
  const caixas = useMemo(() => {
    const out: Caixa[]=[];
    AREAS_ESPECIAIS.forEach(area => {
      const r=volume(area);
      const add=(x:number,y:number,z:number,w:number,h:number,d:number,cor:string)=>out.push({x:r.x+x,y,z:r.z+z,w,h,d,cor});
      if (area.tipo === "palco") {
        for(let n=0;n<3;n++) add(0,0.15+n*0.12,r.profundidade/2+0.3-n*0.3,r.largura*0.7,0.3+n*0.24,0.3,"#aeb4bb");
        add(0,1.8,-r.profundidade/2+0.2,r.largura,3.6,0.18,"#485565");
      } else if (["cafe","alimentacao","lounge"].includes(area.tipo)) {
        for(let x=-r.largura/2+1.3;x<r.largura/2-0.5;x+=2.7) {
          add(x,0.95,0,1.1,0.12,0.9,"#f6f4ef"); add(x,0.5,0,0.15,0.9,0.15,"#737c83");
          for(const s of [-1,1]) {add(x,0.52,s*0.85,0.46,0.14,0.45,"#b5a184");add(x,0.8,s*1.02,0.46,0.6,0.08,"#b5a184");}
        }
      } else {
        add(0,1.65,-r.profundidade/2+0.12,r.largura,2.6,0.18,BRANCO);
        add(-r.largura/2+0.12,1.65,0,0.18,2.6,r.profundidade,BRANCO);
        add(r.largura*0.2,0.95,0,Math.min(3,r.largura*0.6),1.2,0.7,"#c4b09a");
      }
      // Jardineiras ilustrativas, contidas nas áreas comuns.
      for (const s of [-1,1]) { add(s*(r.largura/2-0.5),0.58,r.profundidade/2-0.5,0.6,0.8,0.6,"#a6a39a"); add(s*(r.largura/2-0.5),1.23,r.profundidade/2-0.5,0.8,0.65,0.8,"#7e9476"); }
    }); return out;
  }, []);
  return <Lote caixas={caixas} />;
}
