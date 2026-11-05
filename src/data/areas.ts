/**
 * ÁREAS DO PAVILHÃO ILUSTRATIVO — demonstração, NÃO é a planta oficial (ver src/data/planta.ts).
 * Nomes e dimensões das estruturas seguem o resumo agregado; as posições são fictícias.
 */
import { ORIGEM, PAVILHAO_M, PT_POR_METRO } from "./planta";

export type TipoArea =
  | "kids"
  | "palco"
  | "lounge"
  | "cafe"
  | "alimentacao"
  | "institucional"
  | "imprensa"
  | "apoio"
  | "sanitario";

export interface AreaEspecial {
  id: string;
  nome: string;
  tipo: TipoArea;
  dimensao?: string;
  x: number;
  y: number;
  w: number;
  h: number;
  precisao: "planta" | "aproximada";
}

export interface Acesso {
  id: string;
  rotulo: string;
  tipo: "portao" | "entrada" | "saida" | "emergencia";
  x: number;
  y: number;
}

const pt = (m: number) => Math.round(m * PT_POR_METRO * 100) / 100;
/** Retângulo em metros (a partir do canto do pavilhão) convertido para pontos. */
const r = (x: number, y: number, w: number, h: number) => ({
  x: pt(ORIGEM.x / PT_POR_METRO + x),
  y: pt(ORIGEM.y / PT_POR_METRO + y),
  w: pt(w),
  h: pt(h),
});

export const AREAS_ESPECIAIS: AreaEspecial[] = [
  { id: "kids", nome: "Espaço Kids", tipo: "kids", dimensao: "16x12", ...r(4, 48, 16, 12), precisao: "aproximada" },
  { id: "institucional", nome: "Stand institucional", tipo: "institucional", dimensao: "18x11", ...r(24, 48, 18, 11), precisao: "aproximada" },
  { id: "imprensa", nome: "Imprensa", tipo: "imprensa", dimensao: "6x3", ...r(24, 61, 6, 3), precisao: "aproximada" },
  { id: "lounge", nome: "Lounge", tipo: "lounge", dimensao: "8x7", ...r(46, 48, 8, 7), precisao: "aproximada" },
  { id: "palco", nome: "Palco", tipo: "palco", dimensao: "6x4", ...r(46, 59, 6, 4), precisao: "aproximada" },
  { id: "cafe", nome: "Café", tipo: "cafe", dimensao: "7,5x4", ...r(72, 47, 7.5, 4), precisao: "aproximada" },
  { id: "alimentacao-mesas", nome: "Praça de alimentação (mesas)", tipo: "alimentacao", dimensao: "24x4", ...r(56, 61, 24, 4), precisao: "aproximada" },
];

export const PAVILHAO = { ...r(0, 0, PAVILHAO_M.largura, PAVILHAO_M.profundidade), precisao: "aproximada" as const };

const p = (x: number, y: number) => ({ x: pt(ORIGEM.x / PT_POR_METRO + x), y: pt(ORIGEM.y / PT_POR_METRO + y) });

export const ACESSOS: Acesso[] = [
  { id: "entrada", rotulo: "Entrada (ilustrativa)", tipo: "entrada", ...p(42, PAVILHAO_M.profundidade) },
  { id: "saida-oeste", rotulo: "Saída (ilustrativa)", tipo: "saida", ...p(0, 44) },
  { id: "saida-leste", rotulo: "Saída (ilustrativa)", tipo: "saida", ...p(PAVILHAO_M.largura, 44) },
];

export const RUAS: { x: number; y: number; largura: string }[] = [];
