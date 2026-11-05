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

Os formulários demonstrativos gravam apenas no `localStorage` do navegador e oferecem os canais oficiais. O envio à organização é feito pelo usuário no canal escolhido. Use `NEXT_PUBLIC_MODO_DEMO=0` no build para exibir apenas os canais oficiais.

O painel `/admin` responde 404 em produção por padrão e em todos os builds Vercel. A simulação funciona em desenvolvimento e pode ser ativada para testes de build local com `MEGA_ADMIN_DEMO_LOCAL=1`. Use somente dados fictícios.

## Planta: ilustrativa (pública) × oficial (local)

A planta oficial (ALT 17, "para aprovação") **não tem divulgação autorizada** e não é versionada:

- `src/data/planta.ts` e `src/data/areas.ts` — **planta ilustrativa** gerada por código: 247 espaços em 4 setores fictícios + 8 módulos de alimentação + 20 de feirinha (totais do resumo agregado), posições e numeração fictícias, sempre rotuladas "Demonstração ilustrativa · não oficial".
- A planta oficial fica em uma ferramenta privada separada. O build público rejeita a presença desses arquivos ou a tentativa de ativar dados detalhados (ver `next.config.ts`).
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
MEGA_ADMIN_DEMO_LOCAL=1 npm run build
npm run test:e2e     # build local demonstrativo (desktop + mobile, inclui axe)
E2E_DEMO=0 npm run test:e2e   # exige build com NEXT_PUBLIC_MODO_DEMO=0
E2E_BASE_URL=https://... npm run test:e2e   # testa uma URL publicada
```

## Para uso real das inscrições

Implementar antes de reativar formulários/admin em produção: banco (ex.: Neon/Postgres), API com validação no servidor, autenticação administrativa, controle de acesso, proteção contra spam, política de privacidade e consentimento LGPD, e exportação auditada.
