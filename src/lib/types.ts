/** Contrato de dados compartilhado entre site público e painel administrativo (demonstração). */

export const CATEGORIAS = [
  "Moda feminina",
  "Moda masculina",
  "Moda infantil",
  "Moda praia e fitness",
  "Calçados",
  "Bolsas e acessórios",
  "Joias e bijuterias",
  "Beleza e cosméticos",
  "Artesanato",
  "Casa e decoração",
  "Serviços",
  "Alimentação",
  "Outros",
] as const;
export type Categoria = (typeof CATEGORIAS)[number];

/** Todas as dimensões impressas na planta (ALT 17), em metros, da menor para a maior área. "1,5x1" = módulo de feirinha. */
export const DIMENSOES_ESTANDE = [
  "1,5x1",
  "2x2",
  "2x3",
  "3x2",
  "2x4",
  "4x2",
  "3x3",
  "3x4",
  "4x3",
  "4x4",
  "5x4",
  "6x4",
  "6,5x4",
  "7x4",
  "8x4",
  "6,5x5",
  "6x6",
  "8x5",
  "7x6",
  "8x6",
  "9x6",
  "Não sei / quero orientação",
] as const;

export const STATUS_LOJISTA = ["novo", "em_contato", "em_negociacao", "aprovado", "recusado"] as const;
export type StatusLojista = (typeof STATUS_LOJISTA)[number];
export const STATUS_LOJISTA_ROTULO: Record<StatusLojista, string> = {
  novo: "Novo",
  em_contato: "Em contato",
  em_negociacao: "Em negociação",
  aprovado: "Aprovado",
  recusado: "Recusado",
};

export interface Lojista {
  id: string;
  criadoEm: string; // ISO
  responsavel: string;
  marca: string;
  whatsapp: string; // apenas dígitos
  email: string;
  instagram?: string;
  categoria: Categoria;
  cidade: string;
  uf: string;
  dimensao: string;
  estandeInteresse?: string; // id do estande no mapa (ex.: "E-142")
  observacoes?: string;
  consentimento: true;
  status: StatusLojista;
  notas: { em: string; texto: string }[];
  demo?: boolean; // registro fictício de demonstração
}

export interface Visitante {
  id: string;
  criadoEm: string;
  nome: string;
  contato: string; // e-mail (minúsculo) ou WhatsApp (dígitos) — chave de deduplicação
  consentimento: true;
  compareceu?: string; // ISO — check-in efetivo, separado da confirmação
  demo?: boolean;
}

/** Status administrativo do estande. Sem dados oficiais, o padrão é "sem_informacao". */
export const STATUS_ESTANDE = ["sem_informacao", "disponivel", "em_negociacao", "reservado", "vendido"] as const;
export type StatusEstande = (typeof STATUS_ESTANDE)[number];

/**
 * Leitura pública do status (legenda do mapa 2D/3D e indicadores).
 * Cinza = não confirmado · Verde = disponível · Amarelo = em análise/reserva provisória · Vermelho = ocupado.
 * Fonte ÚNICA de rótulos e cores — use em mapa, 3D e admin.
 */
export type GrupoStatus = "nao_confirmado" | "disponivel" | "em_analise" | "ocupado";
export const GRUPO_DO_STATUS: Record<StatusEstande, GrupoStatus> = {
  sem_informacao: "nao_confirmado",
  disponivel: "disponivel",
  em_negociacao: "em_analise",
  reservado: "em_analise",
  vendido: "ocupado",
};
export const GRUPOS_STATUS: { id: GrupoStatus; rotulo: string; cor: string; corTexto: string }[] = [
  { id: "disponivel", rotulo: "Disponível", cor: "#3f9b6b", corTexto: "#24603f" },
  { id: "em_analise", rotulo: "Em análise / reserva provisória", cor: "#e2b33c", corTexto: "#7a5a0b" },
  { id: "ocupado", rotulo: "Ocupado", cor: "#c8463f", corTexto: "#8f2a24" },
  { id: "nao_confirmado", rotulo: "Não confirmado", cor: "#a7a29b", corTexto: "#5c5853" },
];
export const STATUS_ESTANDE_ROTULO: Record<StatusEstande, string> = {
  sem_informacao: "Não confirmado",
  disponivel: "Disponível",
  em_negociacao: "Em negociação (em análise)",
  reservado: "Reserva provisória",
  vendido: "Ocupado / contratado",
};

export interface HistoricoEstande {
  estandeId: string;
  de: StatusEstande;
  para: StatusEstande;
  em: string;
  por: string;
}
