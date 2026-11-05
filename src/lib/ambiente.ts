/**
 * Modo demonstração: formulários gravam no localStorage, painel /admin sem autenticação real,
 * status de estandes editáveis localmente. NÃO é seguro para dados reais.
 *
 * - Desenvolvimento (`next dev`): ativo.
 * - Produção: DESATIVADO por padrão. Só ativa com NEXT_PUBLIC_MODO_DEMO=1 no build
 *   (usado apenas em testes automatizados locais).
 *
 * Com o modo desativado, /admin responde 404 e /expositor e /visitante direcionam
 * para os canais oficiais da organização, sem coletar dados pessoais.
 */
export const MODO_DEMO = process.env.NEXT_PUBLIC_MODO_DEMO === "1" || process.env.NODE_ENV !== "production";

/**
 * Planta detalhada (imagem oficial, numeração, coordenadas e dimensões por estande, mapa 2D/3D).
 *
 * A divulgação pública da planta ainda não foi autorizada pela organização. Por isso:
 * - Desenvolvimento (`next dev`): ativa.
 * - Produção: DESATIVADA por padrão. Só ativa com NEXT_PUBLIC_PLANTA_DETALHADA=1 no build
 *   (ambientes protegidos: preview com autenticação da Vercel, testes locais).
 *
 * Desativada, o build substitui `@/data/planta` e `@/data/areas` por módulos vazios
 * (ver next.config.ts), bloqueia `/planta/*` (src/proxy.ts) e exibe somente o resumo agregado
 * de `@/data/resumo-planta`, sem posições nem numeração.
 */
export const PLANTA_DETALHADA =
  process.env.NEXT_PUBLIC_PLANTA_DETALHADA === "1" || process.env.NODE_ENV !== "production";
