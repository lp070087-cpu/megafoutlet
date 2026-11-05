"use client";

import Link from "next/link";
import { ArrowRight, Maximize2, Minus, Plus, Search, X } from "lucide-react";
import { useId, useMemo, useRef, useState } from "react";
import { ESTANDES, getEstande, type Estande } from "@/data/planta";
import { ACESSOS, AREAS_ESPECIAIS, PAVILHAO } from "@/data/areas";
import { useStatusEstandes } from "@/lib/useStatusEstandes";
import { GRUPOS_STATUS, STATUS_ESTANDE, STATUS_ESTANDE_ROTULO, type StatusEstande } from "@/lib/types";
import { AVISO_ILUSTRATIVO, MODO_DEMO, PLANTA_ILUSTRATIVA } from "@/lib/ambiente";
import { correspondeFiltro, FILTROS_INICIAIS } from "@/lib/filtros-mapa";
import FiltrosMapa from "./FiltrosMapa";

/** Desenho vetorial do pavilhão ILUSTRATIVO (sem imagem da planta oficial). */
function PavilhaoIlustrativo() {
  return (
    <g aria-hidden>
      <rect x={PAVILHAO.x} y={PAVILHAO.y} width={PAVILHAO.w} height={PAVILHAO.h} fill="var(--paper)" stroke="var(--line)" strokeWidth={3} rx={4} />
      {AREAS_ESPECIAIS.map((a) => (
        <g key={a.id}>
          <rect x={a.x} y={a.y} width={a.w} height={a.h} fill="var(--sand)" stroke="var(--line)" strokeWidth={1} rx={2} />
          <text x={a.x + a.w / 2} y={a.y + a.h / 2} textAnchor="middle" dominantBaseline="middle" fontSize={Math.min(13, a.w / 7)} fill="#5e5852" style={{ fontFamily: "var(--font-sans)" }}>
            {a.nome}
          </text>
        </g>
      ))}
      {ACESSOS.map((a) => (
        <g key={a.id}>
          <circle cx={a.x} cy={a.y} r={9} fill={a.tipo === "entrada" ? "var(--rose)" : "#527264"} />
          <text x={a.x} y={a.y + (a.y > PAVILHAO.y + PAVILHAO.h - 2 ? 26 : -16)} textAnchor="middle" fontSize={12} fill="#3b3734" style={{ fontFamily: "var(--font-sans)" }}>
            {a.rotulo}
          </text>
        </g>
      ))}
      <text x={PAVILHAO.x + 14} y={PAVILHAO.y + PAVILHAO.h - 14} fontSize={13} fontWeight={700} fill="#a03f53" style={{ fontFamily: "var(--font-sans)", letterSpacing: "0.12em" }}>
        DEMONSTRAÇÃO ILUSTRATIVA · NÃO OFICIAL
      </text>
    </g>
  );
}

/* ---------------------------------------------------------------- filtros */
type FiltroId = "todos" | "compactos" | "medios" | "amplos" | "feirinha" | "alimentacao";
const FILTROS: { id: FiltroId; rotulo: string; teste: (e: Estande) => boolean }[] = [
  { id: "todos", rotulo: "Todos", teste: () => true },
  { id: "compactos", rotulo: "Até 6 m²", teste: (e) => e.serie === "principal" && (e.areaM2 ?? 0) <= 6 },
  { id: "medios", rotulo: "9 a 16 m²", teste: (e) => e.serie === "principal" && (e.areaM2 ?? 0) > 6 && (e.areaM2 ?? 0) <= 16 },
  { id: "amplos", rotulo: "Acima de 16 m²", teste: (e) => e.serie === "principal" && (e.areaM2 ?? 0) > 16 },
  { id: "feirinha", rotulo: "Feirinha", teste: (e) => e.serie === "feirinha" },
  { id: "alimentacao", rotulo: "Alimentação", teste: (e) => e.serie === "alimentacao" },
];

const SERIE_ROTULO: Record<Estande["serie"], string> = {
  principal: PLANTA_ILUSTRATIVA ? "Espaço" : "Estande",
  feirinha: "Feirinha",
  alimentacao: "Praça de alimentação",
};

const fmtDim = (d: string) => d.replace("x", " × ") + " m";
const fmtArea = (a: number | null) => (a == null ? "—" : `${a.toLocaleString("pt-BR", { maximumFractionDigits: 2 })} m²`);


/** A moldura e os estandes compartilham o mesmo sistema de coordenadas do SVG. */
const ENQUADRAMENTO = {
  x: PAVILHAO.x - 14,
  y: PAVILHAO.y - 24,
  w: PAVILHAO.w + 28,
  h: PAVILHAO.h + 54,
};
const proporcao = ENQUADRAMENTO.w / ENQUADRAMENTO.h;
const botao = "inline-flex min-h-11 items-center justify-center gap-2 rounded-xl border border-line bg-paper px-3 py-2 text-sm font-medium text-ink hover:border-rose hover:text-rose-deep disabled:opacity-40";

export default function MapaInterativo({ estandeInicial, onSolicitarAlteracaoStatus }: {
  estandeInicial?: string;
  onSolicitarAlteracaoStatus?: (estande: Estande, status: StatusEstande) => void;
}) {
  const uid = useId();
  const dialogRef = useRef<HTMLDialogElement>(null);
  const detalheRef = useRef<HTMLButtonElement>(null);
  const retornoFoco = useRef<HTMLElement | null>(null);
  const gesto = useRef<{ x: number; y: number; esquerda: number; topo: number; moveu: boolean } | null>(null);
  const [telaCheia, setTelaCheia] = useState(false);
  const [zoom, setZoom] = useState(1);
  const [selecionadoId, setSelecionadoId] = useState<string | null>(getEstande(estandeInicial)?.id ?? null);
  const [filtros, setFiltros] = useState(FILTROS_INICIAIS);
  const [filtro, setFiltro] = useState<FiltroId>("todos");
  const [busca, setBusca] = useState("");
  const [ativoIdx, setAtivoIdx] = useState(0);
  const [lista, setLista] = useState(false);
  const [modoCor, setModoCor] = useState<"planta" | "status">("planta");
  const st = useStatusEstandes();
  const selecionado = getEstande(selecionadoId);
  const corGrupo = (id: string) => GRUPOS_STATUS.find(g => g.id === st.grupoDe(id))!;
  const filtrados = useMemo(() => {
    const teste = FILTROS.find(f => f.id === filtro)!.teste;
    return ESTANDES.filter(e => teste(e) && correspondeFiltro(e, filtros, st.statusDe(e.id)));
  }, [filtro, filtros, st]);
  const visiveis = useMemo(() => new Set(filtrados.map(e => e.id)), [filtrados]);
  const resultados = useMemo(() => {
    const normalizar = (s: string) => s.trim().toLowerCase().replace(/-/g, "").replace(/^0+(?=\d)/, "");
    const q = normalizar(busca);
    return q ? filtrados.filter(e => normalizar(e.numero).startsWith(q)
      || normalizar(e.id).startsWith(q) || e.dimensao.includes(q) || normalizar(e.setor).includes(q)).slice(0, 8) : [];
  }, [busca, filtrados]);
  const grupos = useMemo(() => {
    const m = new Map<string, Estande[]>();
    for (const e of filtrados) {
      const itens = m.get(e.setor);
      if (itens) itens.push(e);
      else m.set(e.setor, [e]);
    }
    return [...m.entries()].sort((a, b) => a[0].localeCompare(b[0], "pt-BR"));
  }, [filtrados]);

  function selecionar(id: string) {
    if (!retornoFoco.current) retornoFoco.current = document.activeElement as HTMLElement | null;
    setSelecionadoId(id);
    requestAnimationFrame(() => {
      detalheRef.current?.focus({ preventScroll: true });
      if (!dialogRef.current?.open) detalheRef.current?.closest('[role="dialog"]')?.scrollIntoView({ block: "nearest" });
    });
  }

  function fecharDetalhe() {
    setSelecionadoId(null);
    retornoFoco.current?.focus({ preventScroll: true });
    retornoFoco.current = null;
  }

  function escolherResultado(e: Estande) {
    selecionar(e.id);
    setBusca("");
    setAtivoIdx(0);
    setLista(false);
  }

  function abrirTelaCheia() {
    gesto.current = null;
    setZoom(1);
    setTelaCheia(true);
    dialogRef.current?.showModal();
    requestAnimationFrame(() => dialogRef.current?.querySelector<HTMLButtonElement>("[data-fechar-mapa]")?.focus());
  }

  function planta(ampliada = false) {
    return (
      <svg
        viewBox={`${ENQUADRAMENTO.x} ${ENQUADRAMENTO.y} ${ENQUADRAMENTO.w} ${ENQUADRAMENTO.h}`}
        className="mx-auto block h-auto"
        style={{ width: ampliada ? `${zoom * 100}%` : "100%", maxWidth: ampliada ? `calc((100dvh - 10rem) * ${proporcao * zoom})` : undefined }}
        role="img"
        aria-label="Planta ilustrativa em 2D"
        data-planta={ampliada ? "ampliada" : "card"}
      >
        <PavilhaoIlustrativo />
        {ESTANDES.map(e => {
          const ativo = visiveis.has(e.id);
          const selecionado = e.id === selecionadoId;
          return (
            <g key={e.id}>
              <rect
                data-estande={e.id}
                x={e.x} y={e.y} width={e.w} height={e.h} rx={1}
                fill={selecionado ? "var(--rose)" : modoCor === "status" ? corGrupo(e.id).cor : e.cor}
                opacity={ativo ? 1 : 0.16}
                stroke={selecionado ? "var(--rose-deep)" : "var(--graphite)"}
                strokeWidth={selecionado ? 2 : 0.7}
                vectorEffect="non-scaling-stroke"
                className={ativo ? "cursor-pointer hover:stroke-rose-deep hover:stroke-2" : "pointer-events-none"}
                onClick={ativo ? () => selecionar(e.id) : undefined}
              />
              {ampliada && zoom >= 2 && ativo && (
                <text x={e.x + e.w / 2} y={e.y + e.h / 2} textAnchor="middle" dominantBaseline="middle"
                  fontSize={Math.min(12, e.w / 3)} fill={selecionado ? "white" : "var(--ink)"} pointerEvents="none">
                  {e.numero}
                </text>
              )}
            </g>
          );
        })}
      </svg>
    );
  }

  const detalhe = selecionado && (
    <div
      role={telaCheia ? "region" : "dialog"}
      aria-labelledby={`${uid}-estande`}
      onKeyDown={event => {
        if (event.key === "Escape" && !telaCheia) {
          event.preventDefault();
          fecharDetalhe();
        }
      }}
      className="rounded-2xl border border-line bg-paper p-4 sm:p-5"
    >
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-rose-deep">{SERIE_ROTULO[selecionado.serie]}</p>
                  <h2 id={`${uid}-estande`} className="mt-1 font-display text-4xl leading-none tracking-tight">
                    Nº {selecionado.numero}
                  </h2>
                </div>
                <button
                  type="button"
                  onClick={fecharDetalhe}
                  ref={detalheRef}
                  aria-label="Fechar detalhes do estande"
                  className="-mr-2 -mt-2 grid size-11 place-items-center rounded-full text-muted transition-colors hover:bg-ivory hover:text-ink"
                >
                  <X aria-hidden className="size-5" />
                </button>
              </div>

              <dl className="mt-5 grid grid-cols-2 gap-px overflow-hidden rounded-2xl border border-line bg-line text-sm">
                {[
                  ["Dimensões", fmtDim(selecionado.dimensao)],
                  ["Área", fmtArea(selecionado.areaM2)],
                  ["Setor", selecionado.setor],
                  [
                    "Status",
                    <span key="s" className="inline-flex items-center gap-1.5">
                      <span className="size-2.5 shrink-0 rounded-full" style={{ background: corGrupo(selecionado.id).cor }} />
                      {corGrupo(selecionado.id).rotulo}
                    </span>,
                  ],
                ].map(([k, v]) => (
                  <div key={String(k)} className="min-w-0 bg-paper px-3 py-3 sm:px-4">
                    <dt className="text-[11px] uppercase tracking-[0.14em] text-muted">{k}</dt>
                    <dd className="mt-1 font-medium">{v}</dd>
                  </div>
                ))}
              </dl>

              {selecionado.observacao && (
                <p className="mt-3 rounded-xl bg-rose-soft px-3 py-2 text-xs leading-relaxed text-rose-deep">{selecionado.observacao}</p>
              )}

              <p className="mt-4 text-xs leading-relaxed text-muted">
                A disponibilidade deste espaço é confirmada exclusivamente pela organização. Manifestar interesse não garante reserva.
              </p>

              {onSolicitarAlteracaoStatus ? (
                <label className="mt-4 block text-sm font-medium">
                  Status administrativo local
                  <select
                    value={st.statusDe(selecionado.id)}
                    onChange={event => {
                      const status = event.target.value as StatusEstande;
                      if (status !== st.statusDe(selecionado.id)) {
                        dialogRef.current?.close();
                        onSolicitarAlteracaoStatus(selecionado, status);
                      }
                    }}
                    className="mt-1.5 min-h-12 w-full rounded-xl border border-line bg-paper px-3"
                  >
                    {STATUS_ESTANDE.map(status => <option key={status} value={status}>{STATUS_ESTANDE_ROTULO[status]}</option>)}
                  </select>
                </label>
              ) : st.grupoDe(selecionado.id) === "ocupado" ? (
                <p className="mt-4 rounded-full border border-line px-6 py-3 text-center text-sm text-muted">
                  {MODO_DEMO ? "Espaço marcado como ocupado (status de demonstração deste navegador)" : "Espaço indicado como ocupado"}
                </p>
              ) : (
                <Link
                  href={`/expositor?estande=${encodeURIComponent(selecionado.id)}`}
                  className="group mt-4 flex min-h-12 items-center justify-between rounded-full bg-rose px-6 text-sm font-semibold text-white transition-colors hover:bg-rose-deep"
                >
                  Tenho interesse neste espaço
                  <ArrowRight aria-hidden className="size-4 transition-transform duration-300 group-hover:translate-x-1" />
                </Link>
              )}

    </div>
  );

  return (
    <section aria-labelledby={`${uid}-titulo`} className="min-w-0 rounded-3xl border border-line bg-paper">
      <div className="space-y-4 p-4 sm:p-6">
        <h2 id={`${uid}-titulo`} className="font-display text-3xl tracking-tight text-ink">Mapa 2D dos espaços</h2>
        <div className="relative w-full sm:max-w-lg">
          <label htmlFor={`${uid}-busca`} className="mb-1.5 block text-sm font-medium text-ink">
            Buscar estande
          </label>
          <div className="relative"><Search aria-hidden className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted" />
          <input
            id={`${uid}-busca`}
            type="search"
            inputMode="search"
            autoComplete="off"
            placeholder="Ex.: A12 ou Setor B"
            value={busca}
            onChange={(e) => {
              setBusca(e.target.value);
              setAtivoIdx(0);
            }}
            onKeyDown={(e) => {
              if (e.key === "ArrowDown" && resultados.length) {
                e.preventDefault();
                setAtivoIdx((i) => (i + 1) % resultados.length);
              } else if (e.key === "ArrowUp" && resultados.length) {
                e.preventDefault();
                setAtivoIdx((i) => (i - 1 + resultados.length) % resultados.length);
              } else if (e.key === "Enter" && resultados[ativoIdx]) {
                e.preventDefault();
                escolherResultado(resultados[ativoIdx]);
              } else if (e.key === "Escape") {
                setBusca("");
              }
            }}
            aria-activedescendant={resultados[ativoIdx] ? `${uid}-opcao-${resultados[ativoIdx].id}` : undefined}
            role="combobox"
            aria-controls={resultados.length ? `${uid}-resultados` : undefined}
            aria-expanded={resultados.length > 0}
            aria-autocomplete="list"
            className="min-h-12 w-full rounded-xl border border-line bg-paper pl-9 pr-4 text-sm outline-none transition-colors placeholder:text-muted/80 focus:border-rose"
          /></div>
          {resultados.length > 0 && (
            <ul
              id={`${uid}-resultados`}
              role="listbox"
              aria-label="Resultados da busca"
              className="absolute inset-x-0 top-[calc(100%+6px)] z-30 overflow-hidden rounded-2xl border border-line bg-paper py-1 shadow-[0_12px_32px_-16px_rgba(29,27,26,0.25)]"
            >
              {resultados.map((e, i) => (
                <li key={e.id} id={`${uid}-opcao-${e.id}`} role="option" aria-selected={i === ativoIdx}>
                  <button
                    type="button"
                    tabIndex={-1}
                    onMouseDown={(ev) => ev.preventDefault()}
                    onClick={() => escolherResultado(e)}
                    className={`flex min-h-11 w-full items-center justify-between gap-3 px-4 text-left text-sm hover:bg-rose-soft ${i === ativoIdx ? "bg-rose-soft" : ""}`}
                  >
                    <span>
                      <span className="font-semibold">{SERIE_ROTULO[e.serie]} {e.numero}</span>
                      <span className="text-muted"> · {fmtDim(e.dimensao)}</span>
                    </span>
                    <span className="truncate text-xs text-muted">{e.setor}</span>
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
        <FiltrosMapa value={filtros} total={filtrados.length} onChange={value => { setFiltros(value); setAtivoIdx(0); setSelecionadoId(null); }}
          onClear={() => { setFiltros(FILTROS_INICIAIS); setFiltro("todos"); setBusca(""); setAtivoIdx(0); setSelecionadoId(null); }}
        />
        <details className="rounded-xl border border-line">
          <summary className="min-h-11 cursor-pointer px-3 py-2.5 text-sm font-medium">Filtros rápidos e cores</summary>
          <div className="flex flex-wrap gap-2 border-t border-line p-3" role="group" aria-label="Filtrar por formato">
            {FILTROS.map(f => (
              <button key={f.id} type="button" aria-pressed={filtro === f.id} onClick={() => { setFiltro(f.id); setAtivoIdx(0); setSelecionadoId(null); }}
                className={`${botao} aria-pressed:border-rose aria-pressed:bg-rose-soft`}>{f.rotulo}</button>
            ))}
          </div>
          <div className="flex flex-wrap gap-2 px-3 pb-3" role="group" aria-label="Cor dos espaços">
            <button type="button" aria-pressed={modoCor === "planta"} onClick={() => setModoCor("planta")}
              className={`${botao} aria-pressed:border-rose aria-pressed:bg-rose-soft`}>Cores por setor</button>
            <button type="button" aria-pressed={modoCor === "status"} onClick={() => setModoCor("status")}
              className={`${botao} aria-pressed:border-rose aria-pressed:bg-rose-soft`}>Status</button>
          </div>
        </details>
        <div className="flex flex-wrap items-center gap-2">
          <button type="button" onClick={abrirTelaCheia} className={botao}><Maximize2 aria-hidden className="size-4" />Ver mapa em tela cheia</button>
          <button type="button" aria-expanded={lista} onClick={() => setLista(!lista)} className={botao}>{lista ? "Ocultar lista" : "Lista de espaços"}</button>
        </div>
        <div className="mx-auto w-full max-w-[34rem] rounded-xl border border-line bg-paper">{planta()}</div>
        {!telaCheia && detalhe}
        {lista && (
          <aside className="max-h-80 overflow-auto rounded-xl border border-line" aria-label="Lista de espaços" data-lenis-prevent>
            {!grupos.length && <p className="p-3 text-sm text-muted">Nenhum espaço corresponde aos filtros.</p>}
            {grupos.map(([setor, itens]) => (
              <div key={setor}>
                <h2 className="sticky top-0 z-10 border-b border-line bg-paper/95 px-5 py-3 text-[11px] font-semibold uppercase tracking-[0.18em] text-muted backdrop-blur">
                  {setor} <span className="font-normal">· {itens.length}</span>
                </h2>
                <ul className="divide-y divide-line">
                  {itens.map((e) => (
                    <li key={e.id}>
                      <button
                        type="button"
                        onClick={() => escolherResultado(e)}
                        aria-current={e.id === selecionadoId ? "true" : undefined}
                        className={`flex min-h-12 w-full items-center gap-2 px-3 sm:gap-3 sm:px-5 text-left text-sm transition-colors hover:bg-ivory ${
                          e.id === selecionadoId ? "bg-rose-soft" : ""
                        }`}
                      >
                        <span aria-hidden className="size-3 shrink-0 rounded-[3px] ring-1 ring-ink/15" style={{ background: e.cor }} />
                        <span className="min-w-10 font-semibold tabular-nums">{e.numero}</span>
                        <span className="flex-1 text-muted">{fmtDim(e.dimensao)}</span>
                        <span className="text-xs tabular-nums text-muted">{fmtArea(e.areaM2)}</span>
                      </button>
                    </li>
                  ))}
                </ul>
              </div>
            ))}

          </aside>
        )}
        <ul className="flex flex-wrap gap-x-4 gap-y-2 text-xs text-muted" aria-label="Indicadores de disponibilidade">
          {GRUPOS_STATUS.map(g => (
            <li key={g.id} className="flex items-center gap-1.5">
              <span aria-hidden className="size-2.5 shrink-0 rounded-full" style={{ background: g.cor }} />
              <strong className="tabular-nums text-ink">{st.contagem[g.id]}</strong> {g.rotulo}
            </li>
          ))}
        </ul>
        <p className="text-xs leading-relaxed text-muted">{AVISO_ILUSTRATIVO}</p>
      </div>

      <dialog ref={dialogRef} aria-labelledby={`${uid}-tela-cheia`}
        className="fixed inset-0 m-0 h-dvh max-h-none w-screen max-w-none bg-paper text-ink backdrop:bg-ink/50 open:flex open:flex-col"
        onClose={() => { setTelaCheia(false); gesto.current = null; }}>
        {telaCheia && (
          <>
            <header className="flex flex-wrap items-center justify-between gap-2 border-b border-line px-3 pt-[max(0.75rem,env(safe-area-inset-top))] pb-3 sm:px-5">
              <h2 id={`${uid}-tela-cheia`} className="font-display text-xl sm:text-2xl">Mapa em tela cheia</h2>
              <div className="flex flex-wrap gap-2" role="group" aria-label="Controles de ampliação">
                <button type="button" aria-label="Reduzir mapa" disabled={zoom <= 1} onClick={() => setZoom(z => Math.max(1, z - 0.5))} className={botao}><Minus aria-hidden className="size-4" /></button>
                <button type="button" aria-label="Ampliar mapa" disabled={zoom >= 5} onClick={() => setZoom(z => Math.min(5, z + 0.5))} className={botao}><Plus aria-hidden className="size-4" /></button>
                <button type="button" data-fechar-mapa onClick={() => dialogRef.current?.close()} className={botao}><X aria-hidden className="size-4" />Fechar tela cheia</button>
              </div>
            </header>
            <div
              tabIndex={0}
              aria-label="Planta ampliável. Use as barras de rolagem ou arraste o mapa ampliado."
              data-lenis-prevent
              className={`min-h-0 flex-1 overflow-auto overscroll-contain p-3 ${zoom > 1 ? "cursor-grab active:cursor-grabbing" : ""}`}
              onPointerDown={event => {
                if (zoom === 1 || event.pointerType !== "mouse" || event.button !== 0) return;
                const el = event.currentTarget;
                gesto.current = { x: event.clientX, y: event.clientY, esquerda: el.scrollLeft, topo: el.scrollTop, moveu: false };
              }}
              onPointerMove={event => {
                const g = gesto.current;
                if (!g || !(event.buttons & 1)) return;
                const dx = event.clientX - g.x;
                const dy = event.clientY - g.y;
                if (!g.moveu && Math.hypot(dx, dy) < 5) return;
                const el = event.currentTarget;
                if (!g.moveu) el.setPointerCapture(event.pointerId);
                g.moveu = true;
                el.scrollLeft = g.esquerda - dx;
                el.scrollTop = g.topo - dy;
              }}
              onPointerUp={() => { gesto.current = null; }}
              onPointerCancel={() => { gesto.current = null; }}
            >
              {planta(true)}
              {detalhe && <div className="sticky bottom-0 left-0 mx-auto w-full max-w-md">{detalhe}</div>}
            </div>
          </>
        )}
      </dialog>
    </section>
  );
}
