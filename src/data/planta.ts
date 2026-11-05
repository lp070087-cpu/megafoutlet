/**
 * PLANTA ILUSTRATIVA — demonstração, NÃO é a planta oficial do evento.
 *
 * A planta oficial (versão "para aprovação") ainda não tem divulgação pública autorizada pela
 * organização. Este módulo gera uma distribuição fictícia de espaços para demonstrar a experiência
 * do mapa 2D/3D. Totais por tipo seguem o resumo agregado (src/data/resumo-planta.ts), mas
 * POSIÇÕES, NUMERAÇÃO, SETORES E FORMATOS SÃO ILUSTRATIVOS.
 *
 * A planta oficial fica em src/data/oficial/ (fora do controle de versão) e só substitui este
 * módulo quando o arquivo existe e NEXT_PUBLIC_PLANTA_DETALHADA=1 (ver next.config.ts).
 */

export type SerieEstande = "principal" | "alimentacao" | "feirinha";

export interface Estande {
  id: string;
  numero: string;
  serie: SerieEstande;
  dimensao: string; // "LxP" em metros
  areaM2: number | null;
  setor: string;
  x: number;
  y: number;
  w: number;
  h: number;
  cor: string;
  observacao?: string;
}

/** Mesmo sistema de coordenadas usado pelo mapa (pontos; 11,04 pt ≈ 1 m). */
export const PLANTA = { largura: 1191, altura: 1684 } as const;
export const PT_POR_METRO = 11.04;

/** Origem do pavilhão ilustrativo, em pontos. Dimensões do pavilhão: 84 × 112 m. */
export const ORIGEM = { x: 160, y: 290 } as const;
export const PAVILHAO_M = { largura: 84, profundidade: 112 } as const;

const pt = (m: number) => Math.round(m * PT_POR_METRO * 100) / 100;

interface Setor {
  letra: string;
  nome: string;
  cor: string;
  rect: [number, number, number, number]; // x0, y0, x1, y1 em metros
  formato: [number, number]; // largura × profundidade
  quantidade: number;
}

/** Quatro setores fictícios; a soma (247) acompanha o total de estandes numerados do resumo. */
const SETORES: Setor[] = [
  { letra: "A", nome: "Setor A", cor: "#d9b8be", rect: [4, 4, 40, 42], formato: [3, 3], quantidade: 70 },
  { letra: "B", nome: "Setor B", cor: "#d3c6b4", rect: [44, 4, 80, 42], formato: [2, 2], quantidade: 66 },
  { letra: "C", nome: "Setor C", cor: "#bfcac3", rect: [4, 70, 40, 106], formato: [4, 4], quantidade: 42 },
  { letra: "D", nome: "Setor D", cor: "#dccfae", rect: [44, 70, 80, 106], formato: [3, 2], quantidade: 69 },
];

function gerarSetor(s: Setor): Estande[] {
  const [x0, y0, x1, y1] = s.rect;
  const [w, d] = s.formato;
  const grupo = 6; // estandes por bloco antes de um corredor transversal de 3 m
  // posições x de uma fileira
  const xs: number[] = [];
  for (let x = x0, n = 0; x + w <= x1 + 1e-6; n++) {
    xs.push(x);
    x += w;
    if ((n + 1) % grupo === 0) x += 3;
  }
  const porIlha = xs.length * 2;
  const ilhas = Math.ceil(s.quantidade / porIlha);
  const sobra = y1 - y0 - ilhas * 2 * d;
  const corredor = ilhas > 1 ? sobra / (ilhas - 1) : 0;
  const lista: Estande[] = [];
  for (let i = 0; i < ilhas && lista.length < s.quantidade; i++) {
    const y = y0 + i * (2 * d + corredor);
    for (let fila = 0; fila < 2; fila++) {
      for (const x of xs) {
        if (lista.length >= s.quantidade) break;
        const n = String(lista.length + 1).padStart(2, "0");
        lista.push({
          id: `${s.letra}-${n}`,
          numero: `${s.letra}${n}`,
          serie: "principal",
          dimensao: `${w}x${d}`,
          areaM2: w * d,
          setor: s.nome,
          x: pt(ORIGEM.x / PT_POR_METRO + x),
          y: pt(ORIGEM.y / PT_POR_METRO + y + fila * d),
          w: pt(w),
          h: pt(d),
          cor: s.cor,
          observacao: "Espaço ilustrativo — posição e formato fictícios.",
        });
      }
    }
  }
  return lista;
}

function modulos(prefixo: string, serie: SerieEstande, setor: string, cor: string, itens: [number, number][], w: number, d: number): Estande[] {
  return itens.map(([x, y], i) => {
    const n = String(i + 1).padStart(2, "0");
    return {
      id: `${prefixo}-${n}`,
      numero: `${prefixo}${n}`,
      serie,
      dimensao: `${String(w).replace(".", ",")}x${d}`,
      areaM2: w * d,
      setor,
      x: pt(ORIGEM.x / PT_POR_METRO + x),
      y: pt(ORIGEM.y / PT_POR_METRO + y),
      w: pt(w),
      h: pt(d),
      cor,
      observacao: "Espaço ilustrativo — posição fictícia.",
    };
  });
}

/** 8 módulos de alimentação (3 × 4 m) e 20 de feirinha (1,5 × 1 m), como no resumo. */
const ALIMENTACAO = modulos("P", "alimentacao", "Praça de alimentação", "#e2ad86",
  Array.from({ length: 8 }, (_, i) => [56 + i * 3, 56] as [number, number]), 3, 4);
const FEIRINHA = modulos("F", "feirinha", "Feirinha", "#e6d3ad",
  Array.from({ length: 20 }, (_, i) => [56 + (i % 10) * 1.5, 48 + Math.floor(i / 10) * 3] as [number, number]), 1.5, 1);

export const ESTANDES: Estande[] = [...SETORES.flatMap(gerarSetor), ...ALIMENTACAO, ...FEIRINHA];

export const getEstande = (id: string | null | undefined) => (id ? ESTANDES.find((e) => e.id === id) : undefined);

export const rotuloEstande = (e: Estande) =>
  `${e.serie === "alimentacao" ? "Módulo de alimentação " : e.serie === "feirinha" ? "Módulo de feirinha " : "Espaço "}${e.numero} · ${e.dimensao.replace("x", " × ")} m (ilustrativo)`;
