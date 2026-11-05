/**
 * Substituto PÚBLICO de `@/data/planta`, usado no build quando a planta detalhada não está
 * autorizada (ver next.config.ts e src/lib/ambiente.ts). Mesma API, sem nenhum estande,
 * para que numeração, dimensões e coordenadas não cheguem ao pacote publicado.
 */
import type { Estande } from "../planta";

export type { Estande, SerieEstande } from "../planta";

export const PLANTA = { largura: 1191, altura: 1684 } as const;
export const PT_POR_METRO = 11.04;
export const ESTANDES: Estande[] = [];

/** Sem planta detalhada publicada, nenhum identificador corresponde a um estande. */
export const getEstande = (id: string | null | undefined): Estande | undefined => ESTANDES.find((e) => e.id === id);

export const rotuloEstande = (e: Estande) =>
  `${e.serie === "alimentacao" ? "Praça de alimentação " : e.serie === "feirinha" ? "Feirinha " : "Estande "}${e.numero} · ${e.dimensao.replace("x", " × ")} m`;
