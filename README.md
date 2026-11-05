# Mega Fashion Outlet 2026 — Apresentação comercial

Site de apresentação do **Mega Fashion Outlet** (20 a 24 de novembro de 2026, 10h às 22h, Centro de Convenções de Pernambuco, Olinda – PE), desenvolvido pela Unitrix.

## Stack

Next.js 16 (App Router) · React 19 · TypeScript · Tailwind CSS v4 · Motion · Lenis · Three.js / React Three Fiber / Drei · Zod · Playwright.

## Rotas

| Rota | Conteúdo |
|---|---|
| `/` | Landing: hero, contagem regressiva, evento, destaques, lojistas, estrutura e modalidades, mapa 3D, atrações, visitantes, localização, FAQ, CTA |
| `/mapa` | Mapa interativo 3D e 2D (busca, setores, lista acessível, zoom, redefinir câmera) — `?estande=<id>` abre um espaço no 2D |
| `/expositor` | Formulário de interesse do expositor — `?estande=<id>` traz o espaço escolhido no mapa |
| `/visitante` | Formulário de intenção de visita |
| `/admin/*` | Painel de demonstração (dados fictícios + cadastros deste navegador) |

## Modo demonstração (padrão)

Não há backend seguro (banco, autenticação, LGPD). Por isso, também no site publicado:

- formulários validam os campos e mostram estados de envio/sucesso/erro, mas **não enviam dados à organização**: o registro fica só no `localStorage` do navegador, com atalho para o WhatsApp oficial;
- `/admin` é uma demonstração sem acesso a dados de outras pessoas (`noindex`).

Build com `NEXT_PUBLIC_MODO_DEMO=0` desliga formulários (viram atalhos para canais oficiais) e faz `/admin` responder 404. Ver `src/lib/ambiente.ts`.

## Planta: ilustrativa (pública) × oficial (local)

A planta oficial (ALT 17, "para aprovação") **não tem divulgação autorizada** e não é versionada:

- `src/data/planta.ts` e `src/data/areas.ts` — **planta ilustrativa** gerada por código: 247 espaços em 4 setores fictícios + 8 módulos de alimentação + 20 de feirinha (totais do resumo agregado), posições e numeração fictícias, sempre rotuladas "Demonstração ilustrativa · não oficial".
- `src/data/oficial/` e `public/planta/` — planta oficial, **somente local** (`.gitignore`). Usada em `next dev` ou em build com `NEXT_PUBLIC_PLANTA_DETALHADA=1` quando os arquivos existem (ver `next.config.ts`).
- `src/data/resumo-planta.ts` — totais agregados (sem posições).
- `src/data/evento.ts` — informações verificadas com fonte, incluindo os destaques da edição de novembro/2026.

Preços, disponibilidade, patrocinadores e horários de atrações **não** foram inventados.

## Comandos

```bash
npm install
npm run dev          # http://localhost:3000 (modo demonstração)
npm run typecheck
npm run lint
npm run build
npm run test:unit    # dados da planta e contrato de status
npm run test:e2e     # Playwright contra o build de produção (desktop + mobile, inclui axe)
E2E_DEMO=0 npm run test:e2e   # exige build com NEXT_PUBLIC_MODO_DEMO=0
E2E_BASE_URL=https://... npm run test:e2e   # testa uma URL publicada
```

## Para uso real das inscrições

Implementar antes de reativar formulários/admin em produção: banco (ex.: Neon/Postgres), API com validação no servidor, autenticação administrativa, controle de acesso, proteção contra spam, política de privacidade e consentimento LGPD, e exportação auditada.
