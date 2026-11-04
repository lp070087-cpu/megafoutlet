# Mega Fashion Outlet 2026 — Briefing técnico (Unitrix)

Coordenação: **Claude Code**. Execução: **Codex 1**. Qualidade: **Codex 2**.
Projeto: `C:\Users\55819\Desktop\Unitrix-Maestri-Teste\mega-fashion-outlet` (Next.js 16 App Router, React 19, TS, Tailwind v4, `motion`, `lucide-react`, `zod`).

> Next.js 16 tem mudanças de API. Antes de usar APIs do framework, consulte `node_modules/next/dist/docs/` (ver `AGENTS.md`).

## Regras inegociáveis
- Use somente dados de `src/data/evento.ts` (verificados, com fonte). **Não invente** preços, disponibilidade, número de participantes, regras, contatos, depoimentos ou fotos.
- Onde faltar informação oficial: texto "Consulte a organização" + link de WhatsApp/Instagram oficiais.
- Formulário enviado ≠ estande reservado. Confirmação de presença ≠ ingresso.
- Armazenamento: `src/lib/demo-store.ts` (localStorage, **somente demonstração**). Exiba aviso discreto de "ambiente de demonstração" nos formulários e no painel.
- Nenhum dado pessoal em páginas públicas.
- Não altere arquivos de outro responsável (tabela abaixo). Precisa mudar algo compartilhado? Peça ao Claude Code.
- Não rode `npm install` de novos pacotes sem pedir. Sem push/deploy.

## Responsáveis por arquivo
| Área | Rota | Responsável | Arquivos |
|---|---|---|---|
| Fundação (tokens, layout, dados, store, tipos) | — | Claude Code | `src/app/globals.css`, `src/app/layout.tsx`, `src/data/*`, `src/lib/*` |
| Mapa interativo | `/mapa` | Claude Code | `src/app/mapa/**`, `src/components/mapa/**` |
| Landing | `/` | Codex 1 | `src/app/page.tsx`, `src/components/site/**` |
| Seja um expositor | `/expositor` | Codex 1 | `src/app/expositor/**`, `src/components/forms/**` |
| Confirmar presença | `/visitante` | Codex 1 | `src/app/visitante/**` (reusa `components/forms`) |
| Painel admin (demo) | `/admin/**` | Codex 2 | `src/app/admin/**`, `src/components/admin/**` |

Header/Footer do site: Codex 1 (`src/components/site/Header.tsx`, `Footer.tsx`). O mapa e o admin os importam.

## Identidade visual
- Logo oficial: `/brand/logo-mega-fashion.png` (1525×636, fundo transparente, extraída da planta oficial). **Não recriar, recolorir, distorcer ou cortar.** Use `next/image` com proporção 1525/636.
- Cores (tokens Tailwind): `ivory` fundo, `paper` superfícies, `sand`/`line` divisões, `ink` texto, `graphite` (cor da marca), `muted` texto secundário, `rose` (cor da marca #C34F66) acentos/CTA, `rose-deep` hover, `rose-soft` realces.
- Tipografia: `font-display` (Bodoni Moda) para títulos editoriais grandes, com itálico pontual; `font-sans` (Manrope) para interface e texto. Títulos com `tracking-tight`; rótulos pequenos em caixa alta com `tracking-[0.18em]`.
- Estilo: editorial de moda, muito espaço em branco, grid de 12 colunas, linhas finas (`border-line`), raio 2xl no máximo em cards, sombras quase imperceptíveis. **Evitar**: gradientes chamativos, roxo, cards gigantes, glassmorphism, emojis, ícones em excesso.
- Movimento (`motion/react`): entradas com fade + translate 12–24 px, `ease-out-soft`, 0.5–0.8 s, stagger curto; microinterações em botões (seta desliza, sublinhado). Sempre respeitar `useReducedMotion()`.
- Mobile first. Testar 360, 390 (iPhone), 768, 1024, 1440. Alvos de toque ≥ 44 px. `safe-area-inset` no header fixo.

## Conteúdo verificado (resumo; fonte única: `src/data/evento.ts`)
- 20 a 24 de novembro de 2026, 10h às 22h — Centro de Convenções de Pernambuco, Olinda (Av. Prof. Andrade Bezerra, s/n).
- "Maior outlet de PE" — moda, beleza, artesanato e serviços. Instagram @megafashionoutlet (107 mil seguidores).
- Edições desde 2022 (destaques 2022.1 → 2026.1). Imprensa: ~250 marcas em maio/2025.
- Participação de lojistas: botões "Garanta seu Stand!" no Linktree oficial → 4 WhatsApps (confirmar vigência).
- Planta: estandes 2×2 a 8×6 m, 59 módulos de feirinha 1×2, Espaço Kids 16×12, praça de alimentação 24×4, palco 6×4, lounges, café 7,5×4, stand institucional 18×11, imprensa, portões C/D/E/F.

## Mídia
Fotos/vídeos do Instagram **não** podem ser baixados nem embutidos sem autorização da organização. Na galeria use: (1) placeholders elegantes claramente rotulados "Aguardando mídia oficial autorizada" e (2) links para os Reels/destaques oficiais no Instagram. Nada de imagens de banco ou geradas por IA representando o evento.

## Integração mapa ↔ formulário
- `/mapa` leva a `/expositor?estande=<id>` (ex.: `E-142`). O formulário deve ler `estande`, buscar com `getEstande()` de `@/data/planta` e mostrar o espaço escolhido (com opção de remover).
- O admin usa `ESTANDES` de `@/data/planta` + `statusEstandes()`/`alterarStatusEstande()` do store.
