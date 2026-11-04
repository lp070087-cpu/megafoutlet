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
