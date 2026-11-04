/**
 * Dados VERIFICADOS do evento. Não adicione informações sem fonte.
 * Fontes (consultadas em 04/11/2026):
 *  [IG]  Instagram oficial https://www.instagram.com/megafashionoutlet/ (bio do perfil)
 *  [PDF] Planta "MEGA NOVEMBRO 29 10 2026 ALT 17.pdf" — enviada pela organização (versão PARA APROVAÇÃO)
 *  [LT]  https://linktr.ee/megafashion.outlet (botões "Garanta seu Stand!"; página rotulada "Edição 2025.1")
 *  [DP]  Diário de Pernambuco, 11/2025 e 05/2025 (edições anteriores)
 */

export const EVENTO = {
  nome: "Mega Fashion Outlet",
  edicao: "2026.2",
  slogan: "Maior outlet de PE", // [IG]
  segmentos: ["Moda", "Beleza", "Artesanato", "Serviços"], // [IG]
  datas: { inicio: "2026-11-20", fim: "2026-11-24", rotulo: "20 a 24 de novembro de 2026" }, // [IG][PDF]
  horario: "10h às 22h", // [IG]
  local: {
    nome: "Centro de Convenções de Pernambuco",
    cidade: "Olinda – PE",
    endereco: "Av. Professor Andrade Bezerra, s/n — Salgadinho, Olinda – PE",
    mapsUrl:
      "https://www.google.com/maps/search/?api=1&query=Centro+de+Conven%C3%A7%C3%B5es+de+Pernambuco+Olinda",
    mapsEmbed:
      "https://www.google.com/maps?q=Centro+de+Conven%C3%A7%C3%B5es+de+Pernambuco,+Olinda&output=embed",
  },
  instagram: { usuario: "@megafashionoutlet", url: "https://www.instagram.com/megafashionoutlet/", seguidores: "107 mil" }, // [IG]
  linktree: "https://linktr.ee/megafashion.outlet", // [IG][LT]
  /** Números publicados no Linktree oficial nos botões "Garanta seu Stand!". A página estava rotulada "Edição 2025.1": confirmar vigência com a organização. */
  whatsappExpositores: ["5581999791317", "5581988685582", "5581998082587", "5581996452339"].map((n) => n), // [LT]
  /** Edições listadas nos destaques do Instagram. */
  edicoesAnteriores: ["2022.1", "2022.2", "2023.1", "2023.2", "2024.1", "2024.2", "2025.1", "2025.2", "2026.1"], // [IG]
} as const;

/** Publicações oficiais do perfil @megafashionoutlet (verificadas em 04/11/2026). Apenas links — mídia não é baixada nem embutida. */
export const PUBLICACOES_OFICIAIS = [
  { url: "https://www.instagram.com/megafashionoutlet/reel/DfUkVvspu4u/", tipo: "Reel", data: "04/11/2026" },
  { url: "https://www.instagram.com/megafashionoutlet/reel/DfTH6Rxp-_t/", tipo: "Reel", data: "03/11/2026" },
  { url: "https://www.instagram.com/megafashionoutlet/reel/DfSTLUBpq5I/", tipo: "Reel", data: "03/11/2026" },
  { url: "https://www.instagram.com/megafashionoutlet/reel/DfKbE5VJ2fr/", tipo: "Reel", data: "31/10/2026" },
  { url: "https://www.instagram.com/megafashionoutlet/reel/DehbfiYpVfw/", tipo: "Reel", data: "15/10/2026" },
  { url: "https://www.instagram.com/megafashionoutlet/p/DZONGhKlBDB/", tipo: "Carrossel", data: "05/06/2026" },
] as const;

/** Fatos de edições anteriores divulgados pela imprensa. Sempre exibir como "edições anteriores". */
export const HISTORICO_IMPRENSA = [
  { texto: "Edição de maio de 2025 reuniu cerca de 250 marcas.", fonte: "Diário de Pernambuco, maio/2025" },
  { texto: "Edição de novembro de 2025 aconteceu de 20 a 24/11, das 10h às 22h, no Centro de Convenções.", fonte: "Diário de Pernambuco, nov/2025" },
] as const;

/** Áreas identificadas na planta [PDF]. Dimensões em metros conforme o desenho. */
export const AREAS_PLANTA = [
  { id: "estandes", nome: "Estandes comerciais", detalhe: "247 estandes numerados na planta, de 2×2 m a 9×6 m, além de módulos de feirinha. A legenda da planta indica 59 módulos de feirinha (1×2 m); 20 módulos numerados (1,5×1 m) aparecem no entorno do lounge." },
  { id: "kids", nome: "Espaço Kids", detalhe: "Área de 16×12 m." },
  { id: "alimentacao", nome: "Praça de alimentação", detalhe: "Área de 24×4 m com 8 espaços de 3×4 m." },
  { id: "palco", nome: "Palco", detalhe: "6×4 m." },
  { id: "lounges", nome: "Lounges", detalhe: "Lounges de 8×7 m e 8×5 m, além de lounge 6×1,5 m." },
  { id: "cafe", nome: "Café", detalhe: "7,5×4 m." },
  { id: "institucional", nome: "Stand institucional", detalhe: "18×11 m, com área de imprensa (6×3 m)." },
  { id: "acessos", nome: "Portões e corredores", detalhe: "Portões C, D, E e F; ruas de circulação de 2 m a 5,5 m; saídas de emergência sinalizadas." },
] as const;

export const AVISO_PLANTA =
  "Planta de referência em versão para aprovação (ALT 17, 29/10/2026). Sujeita a alterações pela organização, Bombeiros e Cecon. A disponibilidade dos espaços é confirmada exclusivamente pela organização.";

export const whatsappLink = (numero: string, texto = "Olá, quero participar do Mega Fashion!") =>
  `https://wa.me/${numero}?text=${encodeURIComponent(texto)}`;
