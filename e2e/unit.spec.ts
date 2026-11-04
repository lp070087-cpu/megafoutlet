/** Testes unitários dos dados extraídos da planta e do contrato de status (sem navegador). */
import { expect, test } from "@playwright/test";
import { ESTANDES, PLANTA, PT_POR_METRO, getEstande } from "../src/data/planta";
import { ACESSOS, AREAS_ESPECIAIS, PAVILHAO } from "../src/data/areas";
import { DIMENSOES_ESTANDE, GRUPO_DO_STATUS, GRUPOS_STATUS, STATUS_ESTANDE } from "../src/lib/types";

const dims = (d: string) => d.replace(/,/g, ".").split("x").map(Number);

test("planta: 275 espaços com ids únicos e séries esperadas", () => {
  expect(ESTANDES).toHaveLength(275);
  expect(new Set(ESTANDES.map((e) => e.id)).size).toBe(ESTANDES.length);
  const series = Object.groupBy(ESTANDES, (e) => e.serie);
  expect(series.principal).toHaveLength(247);
  expect(series.feirinha).toHaveLength(20);
  expect(series.alimentacao).toHaveLength(8);
});

test("planta: números repetidos no PDF ficam preservados e sinalizados", () => {
  for (const n of ["229", "241", "244", "246"]) {
    const ocorrencias = ESTANDES.filter((e) => e.serie === "principal" && e.numero === n);
    expect(ocorrencias.length, `número ${n}`).toBeGreaterThanOrEqual(2);
    for (const e of ocorrencias) expect(e.observacao).toMatch(/repetido/i);
  }
});

test("planta: geometria confere com a dimensão impressa (tolerância de 1,2 m)", () => {
  const fora = ESTANDES.filter((e) => {
    const [a, b] = dims(e.dimensao);
    const w = e.w / PT_POR_METRO;
    const h = e.h / PT_POR_METRO;
    return Math.min(Math.abs(w - a) + Math.abs(h - b), Math.abs(w - b) + Math.abs(h - a)) > 1.2;
  });
  expect(fora.map((e) => `${e.id} ${e.dimensao}`)).toEqual([]);
});

test("planta: área em m² = largura × profundidade", () => {
  for (const e of ESTANDES) {
    const [a, b] = dims(e.dimensao);
    expect(e.areaM2, e.id).toBeCloseTo(a * b, 2);
  }
});

test("planta: todos os espaços dentro da página e do pavilhão", () => {
  for (const e of ESTANDES) {
    expect(e.x).toBeGreaterThanOrEqual(PAVILHAO.x);
    expect(e.y).toBeGreaterThanOrEqual(PAVILHAO.y);
    expect(e.x + e.w).toBeLessThanOrEqual(PAVILHAO.x + PAVILHAO.w);
    expect(e.y + e.h).toBeLessThanOrEqual(PAVILHAO.y + PAVILHAO.h);
    expect(e.x + e.w).toBeLessThanOrEqual(PLANTA.largura);
  }
});

test("formulário: toda dimensão de estande da planta está entre as opções", () => {
  for (const e of ESTANDES) expect(DIMENSOES_ESTANDE as readonly string[]).toContain(e.dimensao);
});

test("getEstande: busca por id e trata ausentes", () => {
  expect(getEstande("E-142")?.dimensao).toBe("3x3");
  expect(getEstande("X-999")).toBeUndefined();
  expect(getEstande(null)).toBeUndefined();
});

test("status: todo status mapeia para um grupo com cor e rótulo", () => {
  for (const s of STATUS_ESTANDE) {
    const g = GRUPOS_STATUS.find((x) => x.id === GRUPO_DO_STATUS[s]);
    expect(g, s).toBeDefined();
  }
  expect(GRUPO_DO_STATUS.sem_informacao).toBe("nao_confirmado");
});

test("áreas especiais e acessos extraídos da planta", () => {
  const nomes = AREAS_ESPECIAIS.map((a) => a.tipo);
  for (const t of ["kids", "palco", "lounge", "cafe", "alimentacao", "institucional"]) expect(nomes).toContain(t);
  expect(ACESSOS.filter((a) => a.tipo === "portao").map((a) => a.id).sort()).toEqual(["portao-c", "portao-d", "portao-e", "portao-f"]);
});
