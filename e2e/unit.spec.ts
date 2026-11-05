/** Testes unitários dos dados da planta (ilustrativa, versionada) e do contrato de status (sem navegador). */
import { expect, test } from "@playwright/test";
import { ESTANDES, PLANTA, PT_POR_METRO, getEstande, rotuloEstande } from "../src/data/planta";
import { AREAS_ESPECIAIS, PAVILHAO } from "../src/data/areas";
import { RESUMO_PLANTA } from "../src/data/resumo-planta";
import { DIMENSOES_ESTANDE, GRUPO_DO_STATUS, GRUPOS_STATUS, STATUS_ESTANDE } from "../src/lib/types";

const dims = (d: string) => d.replace(/,/g, ".").split("x").map(Number);
type R = { x: number; y: number; w: number; h: number };
const sobrepoe = (a: R, b: R) => a.x < b.x + b.w - 0.01 && b.x < a.x + a.w - 0.01 && a.y < b.y + b.h - 0.01 && b.y < a.y + a.h - 0.01;

test("planta ilustrativa: totais por tipo acompanham o resumo agregado", () => {
  expect(ESTANDES).toHaveLength(RESUMO_PLANTA.total);
  expect(new Set(ESTANDES.map((e) => e.id)).size).toBe(ESTANDES.length);
  const series = Object.groupBy(ESTANDES, (e) => e.serie);
  expect(series.principal).toHaveLength(RESUMO_PLANTA.estandes);
  expect(series.feirinha).toHaveLength(RESUMO_PLANTA.feirinha);
  expect(series.alimentacao).toHaveLength(RESUMO_PLANTA.alimentacao);
});

test("planta ilustrativa: todo espaço é identificado como ilustrativo", () => {
  for (const e of ESTANDES) expect(e.observacao, e.id).toMatch(/ilustrativ/i);
  expect(rotuloEstande(ESTANDES[0])).toMatch(/ilustrativo/);
});

test("planta: geometria confere com a dimensão (tolerância de 0,1 m)", () => {
  const fora = ESTANDES.filter((e) => {
    const [a, b] = dims(e.dimensao);
    const w = e.w / PT_POR_METRO;
    const h = e.h / PT_POR_METRO;
    return Math.min(Math.abs(w - a) + Math.abs(h - b), Math.abs(w - b) + Math.abs(h - a)) > 0.1;
  });
  expect(fora.map((e) => `${e.id} ${e.dimensao}`)).toEqual([]);
});

test("planta: área em m² = largura × profundidade", () => {
  for (const e of ESTANDES) {
    const [a, b] = dims(e.dimensao);
    expect(e.areaM2, e.id).toBeCloseTo(a * b, 2);
  }
});

test("planta: espaços e áreas dentro do pavilhão e sem sobreposição", () => {
  const todos: (R & { id: string })[] = [...ESTANDES, ...AREAS_ESPECIAIS];
  for (const e of todos) {
    expect(e.x, e.id).toBeGreaterThanOrEqual(PAVILHAO.x);
    expect(e.y, e.id).toBeGreaterThanOrEqual(PAVILHAO.y);
    expect(e.x + e.w, e.id).toBeLessThanOrEqual(PAVILHAO.x + PAVILHAO.w);
    expect(e.y + e.h, e.id).toBeLessThanOrEqual(PAVILHAO.y + PAVILHAO.h);
    expect(e.x + e.w).toBeLessThanOrEqual(PLANTA.largura);
  }
  const colisoes: string[] = [];
  for (let i = 0; i < todos.length; i++)
    for (let j = i + 1; j < todos.length; j++) if (sobrepoe(todos[i], todos[j])) colisoes.push(`${todos[i].id} × ${todos[j].id}`);
  expect(colisoes).toEqual([]);
});

test("formulário: toda dimensão de espaço está entre as opções", () => {
  for (const e of ESTANDES) expect(DIMENSOES_ESTANDE as readonly string[]).toContain(e.dimensao);
});

test("getEstande: busca por id e trata ausentes", () => {
  expect(getEstande("A-12")?.dimensao).toBe("3x3");
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

test("áreas especiais do resumo presentes na demonstração", () => {
  const nomes = AREAS_ESPECIAIS.map((a) => a.tipo);
  for (const t of ["kids", "palco", "lounge", "cafe", "alimentacao", "institucional"]) expect(nomes).toContain(t);
});
