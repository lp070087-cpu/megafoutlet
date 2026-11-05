/**
 * MODO DEMONSTRAÇÃO (padrão, inclusive no site publicado).
 *
 * Ainda não existe backend seguro (banco, autenticação, LGPD). Por isso:
 * - formulários validam os campos, mas NÃO enviam dados à organização: o cadastro fica somente
 *   neste navegador (localStorage) e o visitante pode encaminhar a mensagem pelo WhatsApp oficial;
 * - o painel /admin é uma demonstração com dados fictícios e os cadastros deste navegador —
 *   não há acesso a dados de outras pessoas.
 *
 * Para desligar (formulários viram atalhos para os canais oficiais e /admin responde 404),
 * faça o build com NEXT_PUBLIC_MODO_DEMO=0.
 */
export const MODO_DEMO = process.env.NEXT_PUBLIC_MODO_DEMO !== "0";

/**
 * Planta OFICIAL (numeração, coordenadas e dimensões por estande, imagem da planta).
 *
 * A divulgação pública da planta ainda não foi autorizada pela organização. Ela fica fora do
 * Git (src/data/oficial/) e só é usada quando existe localmente e o build é de desenvolvimento
 * ou tem NEXT_PUBLIC_PLANTA_DETALHADA=1 (calculado em next.config.ts).
 *
 * Sem ela, o site usa a PLANTA ILUSTRATIVA (src/data/planta.ts): mesma experiência 2D/3D,
 * claramente identificada como demonstração não oficial.
 */
export const PLANTA_DETALHADA = process.env.NEXT_PUBLIC_PLANTA_OFICIAL === "1";
export const PLANTA_ILUSTRATIVA = !PLANTA_DETALHADA;

/** Aviso exibido junto a qualquer visualização da planta ilustrativa. */
export const AVISO_ILUSTRATIVO =
  "Demonstração ilustrativa, não oficial: posições, numeração e formatos são fictícios. A planta oficial e a disponibilidade dos espaços são informadas exclusivamente pela organização.";
