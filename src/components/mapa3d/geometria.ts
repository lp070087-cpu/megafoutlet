import { PAVILHAO, type TipoArea } from "@/data/areas";
import { PT_POR_METRO } from "@/data/planta";

export const ALTURA_ESTANDE = 1.2;
export const CENTRO = {
  x: PAVILHAO.x + PAVILHAO.w / 2,
  y: PAVILHAO.y + PAVILHAO.h / 2,
};
export const PISO = {
  largura: PAVILHAO.w / PT_POR_METRO,
  profundidade: PAVILHAO.h / PT_POR_METRO,
};
export const DIAGONAL = Math.hypot(PISO.largura, PISO.profundidade);

export function ponto(x: number, y: number): [number, number] {
  return [(x - CENTRO.x) / PT_POR_METRO, (y - CENTRO.y) / PT_POR_METRO];
}

export function volume(rect: { x: number; y: number; w: number; h: number }) {
  const [x, z] = ponto(rect.x + rect.w / 2, rect.y + rect.h / 2);
  return { x, z, largura: rect.w / PT_POR_METRO, profundidade: rect.h / PT_POR_METRO };
}

export function dimensoes(rotulo: string) {
  const [largura, profundidade] = rotulo.toLowerCase().split("x")
    .map(value => Number(value.trim().replace(",", ".")));
  return {
    largura: Number.isFinite(largura) && largura > 0 ? largura : null,
    profundidade: Number.isFinite(profundidade) && profundidade > 0 ? profundidade : null,
  };
}

export const CORES_AREAS: Record<TipoArea, string> = {
  kids: "#d8c4b0",
  palco: "#7c7772",
  lounge: "#b9c1b0",
  cafe: "#b79883",
  alimentacao: "#c6b291",
  institucional: "#b6a6a7",
  imprensa: "#b4bbc1",
  apoio: "#ccc5b9",
  sanitario: "#c3c9c7",
};

export interface ComandoCamera {
  tipo: "geral" | "ampliar" | "reduzir" | "focar";
  sequencia: number;
  /** Para "focar": centro (em metros, coordenadas da cena) e raio aproximado do enquadramento. */
  alvo?: { x: number; z: number; raio: number };
}

/** Enquadramento de um conjunto de retângulos da planta (estande, setor) para a câmera 3D. */
export function enquadramento(rects: { x: number; y: number; w: number; h: number }[]) {
  const x0 = Math.min(...rects.map(r => r.x));
  const y0 = Math.min(...rects.map(r => r.y));
  const x1 = Math.max(...rects.map(r => r.x + r.w));
  const y1 = Math.max(...rects.map(r => r.y + r.h));
  const [x, z] = ponto((x0 + x1) / 2, (y0 + y1) / 2);
  return { x, z, raio: Math.max(4, Math.hypot(x1 - x0, y1 - y0) / PT_POR_METRO / 2) };
}
