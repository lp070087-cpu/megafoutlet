/**
 * Substituto PÚBLICO de `@/data/areas` (ver src/data/publico/planta.ts). Sem posições.
 */
import type { AreaEspecial, Acesso } from "../areas";

export type { AreaEspecial, Acesso, TipoArea } from "../areas";

export const AREAS_ESPECIAIS: AreaEspecial[] = [];
export const PAVILHAO = { x: 0, y: 0, w: 1, h: 1, precisao: "aproximada" as const };
export const ACESSOS: Acesso[] = [];
export const RUAS: { x: number; y: number; largura: string }[] = [];
