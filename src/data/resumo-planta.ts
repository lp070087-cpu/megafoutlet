/**
 * Resumo PÚBLICO da planta oficial (ALT 17): somente totais e faixas, calculados a partir de
 * src/data/planta.ts e src/data/areas.ts. Não contém posições, numeração nem desenho da planta,
 * e pode ser exibido enquanto a divulgação da planta detalhada não for autorizada.
 * Atualize junto com a planta. ARQUIVO SOB RESPONSABILIDADE DO CLAUDE CODE.
 */

export const RESUMO_PLANTA = {
  total: 275,
  estandes: 247,
  alimentacao: 8,
  feirinha: 20,
  /** Faixa de dimensões dos estandes numerados, em metros. */
  menor: "2 × 2 m",
  maior: "9 × 6 m",
  areaMinimaM2: 4,
  areaMaximaM2: 54,
  /** Quantidade de formatos diferentes de estande na planta. */
  formatos: 20,
  /** Formatos mais frequentes (estandes numerados). */
  formatosFrequentes: [
    { dimensao: "2 × 2 m", quantidade: 66 },
    { dimensao: "3 × 3 m", quantidade: 57 },
    { dimensao: "4 × 4 m", quantidade: 42 },
    { dimensao: "3 × 2 m", quantidade: 26 },
  ],
  modulos: [
    { nome: "Praça de alimentação", dimensao: "3 × 4 m", quantidade: 8 },
    { nome: "Módulos de feirinha", dimensao: "1,5 × 1 m", quantidade: 20 },
  ],
  alas: [
    { nome: "Ala do Portão C", estandes: 74 },
    { nome: "Ala do Portão D", estandes: 9 },
    { nome: "Ala do Portão E", estandes: 82 },
    { nome: "Ala do Portão F", estandes: 82 },
  ],
  /** Estruturas do evento, como rotuladas na planta. */
  estruturas: [
    { nome: "Espaço Kids", dimensao: "16 × 12 m" },
    { nome: "Stand institucional", dimensao: "18 × 11 m" },
    { nome: "Praça de alimentação (mesas)", dimensao: "24 × 4 m" },
    { nome: "Palco", dimensao: "6 × 4 m" },
    { nome: "Café", dimensao: "7,5 × 4 m" },
    { nome: "Imprensa", dimensao: "6 × 3 m" },
    { nome: "Lounges", dimensao: "3 espaços" },
  ],
  acessos: ["Portão C · Entrada", "Portão D", "Portão E", "Portão F"],
} as const;
