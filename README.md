# Mega Fashion Outlet 2026 — Apresentação comercial

Site de apresentação do **Mega Fashion Outlet** (20 a 24 de novembro de 2026, 10h às 22h, Centro de Convenções de Pernambuco, Olinda – PE), desenvolvido pela Unitrix.

## Stack

Next.js 16 (App Router) · React 19 · TypeScript · Tailwind CSS v4 · Motion · Lenis · Three.js / React Three Fiber / Drei · Zod · Playwright.

## Rotas

| Rota | Conteúdo |
|---|---|
| `/` | Landing: hero, evento, estrutura, mapa 3D interativo, galeria, localização, FAQ |
| `/mapa` | Planta 2D interativa (zoom, busca, filtros, lista acessível, status) — `?estande=<id>` abre um espaço |
| `/expositor` | Seja um expositor — `?estande=<id>` traz o espaço escolhido no mapa |
| `/visitante` | Informações / confirmação de presença |
| `/admin/*` | Painel administrativo (somente no modo demonstração) |

## Modo demonstração × produção

O projeto ainda **não tem backend** (banco, autenticação, antispam, LGPD). Por isso:

- **Produção (padrão do `next build`)**: `/admin` responde 404; `/expositor` e `/visitante` encaminham para os canais oficiais da organização (WhatsApp com o estande escolhido na mensagem, Linktree, Instagram) e **não coletam dados pessoais**. Todos os estandes aparecem como "não confirmado".
- **Demonstração** (`next dev`, ou build com `NEXT_PUBLIC_MODO_DEMO=1`): formulários e painel funcionam com `localStorage` **deste navegador** — não é armazenamento de produção.

Ver `src/lib/ambiente.ts`.

## Dados e fontes

- `src/data/planta.ts` — 275 espaços extraídos do PDF vetorial da planta (ALT 17, 29/10/2026, "para aprovação"), com número, dimensão e geometria. Números repetidos no PDF (229, 241, 244, 246) foram preservados e sinalizados.
- `src/data/areas.ts` — áreas especiais, portões e circulação da planta (algumas marcadas como aproximadas).
- `src/data/evento.ts` — informações verificadas, com fonte (Instagram oficial, Linktree, imprensa).
- `scripts/planta/` — scripts de extração (dependem de `pdfjs-dist` e `@napi-rs/canvas`, não incluídos nas dependências do site).
- Logo oficial recortada da planta enviada pela organização (`public/brand`).

Disponibilidade dos espaços, preços e regras **não** foram inventados: só a organização pode informá-los.

## Comandos

```bash
npm install
npm run dev          # http://localhost:3000 (modo demonstração)
npm run typecheck
npm run lint
npm run build
npm run test:unit    # dados da planta e contrato de status
npm run test:e2e     # Playwright contra o build de produção (desktop + mobile, inclui axe)
E2E_DEMO=1 npm run test:e2e   # exige build com NEXT_PUBLIC_MODO_DEMO=1
E2E_BASE_URL=https://... npm run test:e2e   # testa uma URL publicada
```

## Para uso real das inscrições

Implementar antes de reativar formulários/admin em produção: banco (ex.: Neon/Postgres), API com validação no servidor, autenticação administrativa, controle de acesso, proteção contra spam, política de privacidade e consentimento LGPD, e exportação auditada.
