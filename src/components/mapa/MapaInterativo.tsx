"use client";

import Image from "next/image";
import Link from "next/link";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { ArrowRight, List, Map as MapIcon, Maximize2, Minus, Plus, Search, X } from "lucide-react";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { ESTANDES, PLANTA, type Estande } from "@/data/planta";
import { AVISO_PLANTA } from "@/data/evento";
import { useStatusEstandes } from "@/lib/useStatusEstandes";
import { GRUPOS_STATUS } from "@/lib/types";
import { MODO_DEMO } from "@/lib/ambiente";

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
  principal: "Estande",
  feirinha: "Feirinha",
  alimentacao: "Praça de alimentação",
};

const fmtDim = (d: string) => d.replace("x", " × ") + " m";
const fmtArea = (a: number | null) => (a == null ? "—" : `${a.toLocaleString("pt-BR", { maximumFractionDigits: 2 })} m²`);

/* Área útil do pavilhão (exclui margens, legenda e carimbo da planta) */
const ENQUADRAMENTO = { x: 175, y: 150, w: 935, h: 1490 };
const MIN_ESCALA = 0.35;
const MAX_ESCALA = 9;

type Vista = { s: number; tx: number; ty: number };

export default function MapaInterativo({ estandeInicial }: { estandeInicial?: string }) {
  const reduzir = useReducedMotion();
  const palcoRef = useRef<HTMLDivElement>(null);
  const [vista, setVista] = useState<Vista>({ s: 0.5, tx: 0, ty: 0 });
  const [animando, setAnimando] = useState(false);
  const [selecionadoId, setSelecionadoId] = useState<string | null>(
    estandeInicial && ESTANDES.some((e) => e.id === estandeInicial) ? estandeInicial : null,
  );
  const [filtro, setFiltro] = useState<FiltroId>("todos");
  const [busca, setBusca] = useState("");
  const [modo, setModo] = useState<"mapa" | "lista">("mapa");
  const [hoverId, setHoverId] = useState<string | null>(null);
  const [ativoIdx, setAtivoIdx] = useState(0);
  const [modoCor, setModoCor] = useState<"planta" | "status">("status");
  const st = useStatusEstandes();
  const corGrupo = (id: string) => GRUPOS_STATUS.find((g) => g.id === st.grupoDe(id))!;
  const detalheRef = useRef<HTMLButtonElement>(null);
  const retornoFoco = useRef<HTMLElement | null>(null);

  /** Seleciona um espaço guardando onde estava o foco (para devolvê-lo ao fechar). */
  const selecionar = useCallback((id: string | null) => {
    if (id) {
      if (!retornoFoco.current) retornoFoco.current = document.activeElement as HTMLElement | null;
      setSelecionadoId(id);
      requestAnimationFrame(() => detalheRef.current?.focus({ preventScroll: true }));
    } else {
      setSelecionadoId(null);
      const alvo = retornoFoco.current;
      retornoFoco.current = null;
      if (alvo && document.contains(alvo) && alvo.offsetParent !== null) alvo.focus({ preventScroll: true });
      else palcoRef.current?.focus({ preventScroll: true });
    }
  }, []);

  const selecionado = useMemo(() => ESTANDES.find((e) => e.id === selecionadoId) ?? null, [selecionadoId]);
  const testeFiltro = FILTROS.find((f) => f.id === filtro)!.teste;
  const visiveis = useMemo(() => new Set(ESTANDES.filter(testeFiltro).map((e) => e.id)), [testeFiltro]);

  const resultados = useMemo(() => {
    const q = busca.trim().toLowerCase().replace(/^0+(?=\d)/, "");
    if (!q) return [];
    return ESTANDES.filter((e) => {
      const n = e.numero.toLowerCase().replace(/^0+(?=\d)/, "");
      return n.startsWith(q) || e.dimensao.includes(q) || e.setor.toLowerCase().includes(q);
    }).slice(0, 8);
  }, [busca]);

  /* ----------------------------------------------------------- vista */
  const limitar = useCallback((v: Vista): Vista => {
    const el = palcoRef.current;
    if (!el) return v;
    const { width: cw, height: ch } = el.getBoundingClientRect();
    const s = Math.min(MAX_ESCALA, Math.max(MIN_ESCALA, v.s));
    // mantém ao menos 30% do pavilhão dentro da área visível
    const minTx = cw * 0.3 - (ENQUADRAMENTO.x + ENQUADRAMENTO.w) * s;
    const maxTx = cw * 0.7 - ENQUADRAMENTO.x * s;
    const minTy = ch * 0.3 - (ENQUADRAMENTO.y + ENQUADRAMENTO.h) * s;
    const maxTy = ch * 0.7 - ENQUADRAMENTO.y * s;
    return { s, tx: Math.min(maxTx, Math.max(minTx, v.tx)), ty: Math.min(maxTy, Math.max(minTy, v.ty)) };
  }, []);

  const enquadrar = useCallback(
    (r: { x: number; y: number; w: number; h: number }, folga = 24, maxS = MAX_ESCALA, animar = true) => {
      const el = palcoRef.current;
      if (!el) return;
      const { width: cw, height: ch } = el.getBoundingClientRect();
      const s = Math.min(maxS, Math.min((cw - folga * 2) / r.w, (ch - folga * 2) / r.h));
      setAnimando(animar && !reduzir);
      setVista(limitar({ s, tx: cw / 2 - (r.x + r.w / 2) * s, ty: ch / 2 - (r.y + r.h / 2) * s }));
    },
    [limitar, reduzir],
  );

  const ajustarTudo = useCallback((animar = true) => enquadrar(ENQUADRAMENTO, 16, MAX_ESCALA, animar), [enquadrar]);

  const zoomEm = useCallback(
    (fator: number, cx?: number, cy?: number, animar = false) => {
      const el = palcoRef.current;
      if (!el) return;
      const r = el.getBoundingClientRect();
      const px = cx ?? r.width / 2;
      const py = cy ?? r.height / 2;
      setAnimando(animar && !reduzir);
      setVista((v) => {
        const s = Math.min(MAX_ESCALA, Math.max(MIN_ESCALA, v.s * fator));
        const k = s / v.s;
        return limitar({ s, tx: px - (px - v.tx) * k, ty: py - (py - v.ty) * k });
      });
    },
    [limitar, reduzir],
  );

  const focarEstande = useCallback(
    (e: Estande) => {
      const lado = Math.max(e.w, e.h) * 7;
      enquadrar({ x: e.x + e.w / 2 - lado / 2, y: e.y + e.h / 2 - lado / 2, w: lado, h: lado }, 24, 5);
    },
    [enquadrar],
  );

  // enquadramento inicial e ao redimensionar
  useEffect(() => {
    const el = palcoRef.current;
    if (!el) return;
    const inicial = ESTANDES.find((e) => e.id === selecionadoId);
    if (inicial) focarEstande(inicial);
    else ajustarTudo(false);
    const ro = new ResizeObserver(() => setVista((v) => limitar(v)));
    ro.observe(el);
    return () => ro.disconnect();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  /* ------------------------------------------------- gestos (pan / pinça / roda) */
  const ponteiros = useRef(new Map<number, { x: number; y: number }>());
  const gesto = useRef<{ dist: number; moveu: number } | null>(null);

  useEffect(() => {
    const el = palcoRef.current;
    if (!el) return;
    const onWheel = (ev: WheelEvent) => {
      ev.preventDefault();
      const r = el.getBoundingClientRect();
      const fator = Math.exp(-ev.deltaY * (ev.ctrlKey ? 0.01 : 0.0018));
      zoomEm(fator, ev.clientX - r.left, ev.clientY - r.top);
    };
    el.addEventListener("wheel", onWheel, { passive: false });
    return () => el.removeEventListener("wheel", onWheel);
  }, [zoomEm]);

  const onPointerDown = (ev: React.PointerEvent) => {
    if (ev.pointerType === "mouse" && ev.button !== 0) return;
    ponteiros.current.set(ev.pointerId, { x: ev.clientX, y: ev.clientY });
    gesto.current = { dist: 0, moveu: gesto.current?.moveu ?? 0 };
    if (ponteiros.current.size === 1) gesto.current.moveu = 0;
    setAnimando(false);
  };

  const onPointerMove = (ev: React.PointerEvent) => {
    const anterior = ponteiros.current.get(ev.pointerId);
    if (!anterior) return;
    const atual = { x: ev.clientX, y: ev.clientY };
    const pts = [...ponteiros.current.values()];
    if (ponteiros.current.size === 1) {
      const dx = atual.x - anterior.x;
      const dy = atual.y - anterior.y;
      if (gesto.current) gesto.current.moveu += Math.abs(dx) + Math.abs(dy);
      if ((gesto.current?.moveu ?? 0) > 4) {
        (ev.currentTarget as HTMLElement).setPointerCapture?.(ev.pointerId);
        setVista((v) => limitar({ ...v, tx: v.tx + dx, ty: v.ty + dy }));
      }
    } else if (ponteiros.current.size === 2) {
      const outro = pts.find((p) => p !== anterior)!;
      const d0 = Math.hypot(anterior.x - outro.x, anterior.y - outro.y);
      const d1 = Math.hypot(atual.x - outro.x, atual.y - outro.y);
      const r = palcoRef.current!.getBoundingClientRect();
      const cx = (atual.x + outro.x) / 2 - r.left;
      const cy = (atual.y + outro.y) / 2 - r.top;
      if (d0 > 0) zoomEm(d1 / d0, cx, cy);
      if (gesto.current) gesto.current.moveu += 10;
    }
    ponteiros.current.set(ev.pointerId, atual);
  };

  const onPointerUp = (ev: React.PointerEvent) => {
    ponteiros.current.delete(ev.pointerId);
  };

  const clicarEstande = (e: Estande) => {
    if ((gesto.current?.moveu ?? 0) > 6) return; // foi arraste, não toque
    selecionar(e.id);
  };

  const onKeyDown = (ev: React.KeyboardEvent) => {
    const passo = 60;
    const mapa: Record<string, () => void> = {
      ArrowLeft: () => setVista((v) => limitar({ ...v, tx: v.tx + passo })),
      ArrowRight: () => setVista((v) => limitar({ ...v, tx: v.tx - passo })),
      ArrowUp: () => setVista((v) => limitar({ ...v, ty: v.ty + passo })),
      ArrowDown: () => setVista((v) => limitar({ ...v, ty: v.ty - passo })),
      "+": () => zoomEm(1.3, undefined, undefined, true),
      "=": () => zoomEm(1.3, undefined, undefined, true),
      "-": () => zoomEm(1 / 1.3, undefined, undefined, true),
      "0": () => ajustarTudo(),
      Escape: () => selecionar(null),
    };
    const fn = mapa[ev.key];
    if (fn) {
      ev.preventDefault();
      setAnimando(false);
      fn();
    }
  };

  const escolherResultado = (e: Estande) => {
    selecionar(e.id);
    setBusca("");
    setAtivoIdx(0);
    setModo("mapa");
    if (!visiveis.has(e.id)) setFiltro("todos");
    requestAnimationFrame(() => focarEstande(e));
  };

  /* ---------------------------------------------------------- lista agrupada */
  const grupos = useMemo(() => {
    const m = new Map<string, Estande[]>();
    for (const e of ESTANDES) if (visiveis.has(e.id)) m.set(e.setor, [...(m.get(e.setor) ?? []), e]);
    return [...m.entries()].sort((a, b) => a[0].localeCompare(b[0], "pt-BR"));
  }, [visiveis]);

  const total = visiveis.size;

  return (
    <section aria-labelledby="mapa-titulo" className="relative">
      {/* Indicadores de disponibilidade — calculados do store (nunca números fixos) */}
      <div className="flex flex-col gap-3 border-t border-line px-4 py-4 sm:px-6 lg:flex-row lg:items-center lg:justify-between lg:px-10">
        <ul className="grid grid-cols-2 gap-x-6 gap-y-2 sm:flex sm:flex-wrap" aria-label="Indicadores de disponibilidade">
          {GRUPOS_STATUS.map((g) => (
            <li key={g.id} className="flex items-center gap-2 text-sm">
              <span aria-hidden className="size-2.5 rounded-full" style={{ background: g.cor }} />
              <span className="font-semibold tabular-nums">{st.contagem[g.id]}</span>
              <span className="text-muted">{g.rotulo}</span>
            </li>
          ))}
        </ul>
        <div className="flex items-center gap-3">
          {!st.algumDefinido && (
            <p className="text-xs text-muted">{MODO_DEMO ? "Status de demonstração, salvos neste navegador. Nenhum status oficial informado pela organização." : "Disponibilidade ainda não informada pela organização. Consulte os canais oficiais."}</p>
          )}
          <div className="flex shrink-0 rounded-full border border-line bg-paper p-0.5" role="group" aria-label="Cor dos espaços">
            {(
              [
                ["status", "Status"],
                ["planta", "Cores da planta"],
              ] as const
            ).map(([id, rotulo]) => (
              <button
                key={id}
                type="button"
                aria-pressed={modoCor === id}
                onClick={() => setModoCor(id)}
                className={`h-11 rounded-full px-4 text-xs font-medium transition-colors ${
                  modoCor === id ? "bg-ink text-ivory" : "text-ink hover:text-rose-deep"
                }`}
              >
                {rotulo}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Barra de ferramentas */}
      <div className="flex flex-col gap-3 border-y border-line bg-paper/80 px-4 py-3 backdrop-blur sm:px-6 lg:flex-row lg:items-center lg:justify-between lg:px-10">
        <div className="relative w-full lg:max-w-xs">
          <label htmlFor="busca-estande" className="sr-only">
            Buscar estande por número, dimensão ou setor
          </label>
          <Search aria-hidden className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted" />
          <input
            id="busca-estande"
            type="search"
            inputMode="search"
            autoComplete="off"
            placeholder="Buscar nº do estande, ex.: 142"
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
            aria-activedescendant={resultados[ativoIdx] ? `opcao-${resultados[ativoIdx].id}` : undefined}
            role="combobox"
            aria-controls="busca-resultados"
            aria-expanded={resultados.length > 0}
            aria-autocomplete="list"
            className="h-11 w-full rounded-full border border-line bg-paper pl-9 pr-4 text-sm outline-none transition-colors placeholder:text-muted/80 focus:border-rose"
          />
          {resultados.length > 0 && (
            <ul
              id="busca-resultados"
              role="listbox"
              aria-label="Resultados da busca"
              className="absolute inset-x-0 top-[calc(100%+6px)] z-30 overflow-hidden rounded-2xl border border-line bg-paper py-1 shadow-[0_12px_32px_-16px_rgba(29,27,26,0.25)]"
            >
              {resultados.map((e, i) => (
                <li key={e.id} id={`opcao-${e.id}`} role="option" aria-selected={i === ativoIdx}>
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

        <div className="-mx-4 flex gap-2 overflow-x-auto px-4 pb-1 [scrollbar-width:none] sm:mx-0 sm:px-0 lg:pb-0" role="group" aria-label="Filtrar espaços">
          {FILTROS.map((f) => (
            <button
              key={f.id}
              type="button"
              aria-pressed={filtro === f.id}
              onClick={() => setFiltro(f.id)}
              className={`h-11 shrink-0 rounded-full border px-4 text-xs font-medium tracking-wide transition-colors ${
                filtro === f.id ? "border-ink bg-ink text-ivory" : "border-line bg-paper text-ink hover:border-ink/40"
              }`}
            >
              {f.rotulo}
            </button>
          ))}
        </div>

        <div className="flex items-center justify-between gap-3 lg:justify-end">
          <p className="text-xs text-muted" aria-live="polite">
            <span className="font-semibold text-ink">{total}</span> espaços exibidos
          </p>
          <div className="flex rounded-full border border-line bg-paper p-0.5" role="group" aria-label="Modo de visualização">
            {(
              [
                ["mapa", "Mapa", MapIcon],
                ["lista", "Lista", List],
              ] as const
            ).map(([id, rotulo, Icone]) => (
              <button
                key={id}
                type="button"
                aria-pressed={modo === id}
                onClick={() => setModo(id)}
                className={`flex h-11 min-w-11 items-center gap-1.5 rounded-full px-3.5 text-xs font-medium transition-colors ${
                  modo === id ? "bg-rose text-white" : "text-ink hover:text-rose-deep"
                }`}
              >
                <Icone aria-hidden className="size-3.5" />
                {rotulo}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="relative lg:grid lg:grid-cols-[minmax(0,1fr)_380px]">
        {/* ----------------------------------------------------------- MAPA */}
        <div className={modo === "lista" ? "hidden lg:block" : ""}>
          <div
            ref={palcoRef}
            data-lenis-prevent
            tabIndex={0}
            role="application"
            aria-roledescription="mapa interativo"
            aria-label="Planta do evento. Arraste para mover, use a roda do mouse ou gesto de pinça para ampliar. Teclado: setas movem, + e − ampliam, 0 enquadra tudo."
            onPointerDown={onPointerDown}
            onPointerMove={onPointerMove}
            onPointerUp={onPointerUp}
            onPointerCancel={onPointerUp}
            onPointerLeave={onPointerUp}
            onKeyDown={onKeyDown}
            className="relative h-[clamp(520px,calc(100dvh-210px),940px)] cursor-grab touch-none select-none overflow-hidden bg-[#f3efe8] outline-none active:cursor-grabbing focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-rose"
          >
            <div
              className="absolute left-0 top-0 origin-top-left will-change-transform"
              style={{
                width: PLANTA.largura,
                height: PLANTA.altura,
                transform: `translate3d(${vista.tx}px, ${vista.ty}px, 0) scale(${vista.s})`,
                transition: animando ? "transform 650ms cubic-bezier(0.22, 1, 0.36, 1)" : "none",
              }}
              onTransitionEnd={() => setAnimando(false)}
            >
              <Image
                src="/planta/planta-oficial.webp"
                alt="Planta baixa oficial do evento Mega Fashion Outlet 2026 no Centro de Convenções de Pernambuco"
                width={PLANTA.largura}
                height={PLANTA.altura}
                unoptimized
                priority
                draggable={false}
                className="pointer-events-none absolute inset-0 h-full w-full"
              />
              <svg
                viewBox={`0 0 ${PLANTA.largura} ${PLANTA.altura}`}
                width={PLANTA.largura}
                height={PLANTA.altura}
                className="absolute inset-0"
                aria-hidden
              >
                {/* véu suave para dar destaque aos espaços filtrados */}
                {filtro !== "todos" && <rect x={0} y={0} width={PLANTA.largura} height={PLANTA.altura} fill="#faf7f2" opacity={0.55} pointerEvents="none" />}
                {ESTANDES.map((e) => {
                  const ativo = visiveis.has(e.id);
                  const sel = e.id === selecionadoId;
                  const hov = e.id === hoverId;
                  return (
                    <rect
                      key={e.id}
                      x={e.x}
                      y={e.y}
                      width={e.w}
                      height={e.h}
                      rx={0.6}
                      fill={sel || hov ? "#c34f66" : !ativo ? "transparent" : modoCor === "status" ? corGrupo(e.id).cor : filtro !== "todos" ? e.cor : "transparent"}
                      fillOpacity={sel ? 0.5 : hov ? 0.25 : modoCor === "status" ? 0.5 : 1}
                      stroke={sel ? "#a03f53" : hov ? "#c34f66" : ativo && (modoCor === "status" || filtro !== "todos") ? "#1d1b1a" : "transparent"}
                      strokeWidth={sel ? 2.2 : hov ? 1.4 : 0.6}
                      vectorEffect="non-scaling-stroke"
                      className={ativo ? "cursor-pointer" : "pointer-events-none"}
                      onPointerEnter={() => setHoverId(e.id)}
                      onPointerLeave={() => setHoverId((h) => (h === e.id ? null : h))}
                      onClick={() => clicarEstande(e)}
                    />
                  );
                })}
                {selecionado && (
                  <rect
                    x={selecionado.x - 3}
                    y={selecionado.y - 3}
                    width={selecionado.w + 6}
                    height={selecionado.h + 6}
                    rx={2}
                    fill="none"
                    stroke="#c34f66"
                    strokeWidth={1.2}
                    strokeDasharray="3 3"
                    vectorEffect="non-scaling-stroke"
                    pointerEvents="none"
                    className={reduzir ? "" : "animate-pulse"}
                  />
                )}
              </svg>
            </div>

            {/* Legenda */}
            <div className="pointer-events-none absolute left-4 top-4 hidden rounded-2xl border border-line bg-paper/92 px-4 py-3 text-[11px] leading-5 text-ink/80 shadow-[0_8px_24px_-16px_rgba(29,27,26,0.35)] backdrop-blur md:block">
              <p className="mb-1.5 font-semibold uppercase tracking-[0.16em] text-muted">Legenda</p>
              <p className="flex items-center gap-2">
                <span className="size-3 rounded-[3px] border-2 border-rose-deep bg-rose/40" /> Espaço selecionado
              </p>
              <p className="flex items-center gap-2">
                <span className="size-3 rounded-[3px] border border-rose bg-rose/15" /> Ao apontar
              </p>
              {modoCor === "status" ? (
                GRUPOS_STATUS.map((g) => (
                  <p key={g.id} className="flex items-center gap-2">
                    <span className="size-3 rounded-[3px] ring-1 ring-ink/10" style={{ background: g.cor }} /> {g.rotulo}
                  </p>
                ))
              ) : (
                <p className="flex items-center gap-2">
                  <span className="flex">
                    {["#f48a8e", "#f8f6b0", "#adddf7", "#d7ebd2"].map((c) => (
                      <span key={c} className="size-3 rounded-[3px] ring-1 ring-ink/10" style={{ background: c }} />
                    ))}
                  </span>
                  Cores da planta oficial
                </p>
              )}
            </div>

            {/* Controles de zoom */}
            <div className="absolute bottom-4 left-4 flex flex-col overflow-hidden rounded-2xl border border-line bg-paper/95 shadow-[0_8px_24px_-14px_rgba(29,27,26,0.35)] backdrop-blur" role="group" aria-label="Controles do mapa">
              {(
                [
                  ["mais", "Ampliar", Plus],
                  ["menos", "Reduzir", Minus],
                  ["tudo", "Enquadrar planta inteira", Maximize2],
                ] as const
              ).map(([acao, rotulo, Icone]) => (
                <button
                  key={acao}
                  type="button"
                  data-acao={acao}
                  onClick={() => {
                    if (acao === "mais") zoomEm(1.4, undefined, undefined, true);
                    else if (acao === "menos") zoomEm(1 / 1.4, undefined, undefined, true);
                    else ajustarTudo();
                  }}
                  aria-label={rotulo}
                  title={rotulo}
                  className="grid size-11 place-items-center border-b border-line text-ink transition-colors last:border-b-0 hover:bg-rose-soft hover:text-rose-deep"
                >
                  <Icone aria-hidden className="size-4" />
                </button>
              ))}
            </div>

            <p className="pointer-events-none absolute right-4 top-4 hidden rounded-full bg-paper/90 px-3 py-1.5 text-[11px] text-muted backdrop-blur sm:block">
              Toque em um estande para ver os detalhes
            </p>
          </div>
        </div>

        {/* ----------------------------------------------------------- LISTA (mobile: alterna; desktop: painel lateral quando nada selecionado) */}
        <aside className={`border-line bg-paper lg:border-l ${modo === "lista" ? "" : "hidden lg:block"}`} aria-label="Lista de espaços">
          <div data-lenis-prevent className="h-full max-h-[clamp(520px,calc(100dvh-210px),940px)] overflow-y-auto overscroll-contain">
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
                        className={`flex min-h-12 w-full items-center gap-3 px-5 text-left text-sm transition-colors hover:bg-ivory ${
                          e.id === selecionadoId ? "bg-rose-soft" : ""
                        }`}
                      >
                        <span aria-hidden className="size-3 shrink-0 rounded-[3px] ring-1 ring-ink/15" style={{ background: e.cor }} />
                        <span className="w-14 font-semibold tabular-nums">{e.numero}</span>
                        <span className="flex-1 text-muted">{fmtDim(e.dimensao)}</span>
                        <span className="text-xs tabular-nums text-muted">{fmtArea(e.areaM2)}</span>
                      </button>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </aside>

        {/* ----------------------------------------------------------- DETALHE */}
        <AnimatePresence>
          {selecionado && (
            <motion.div
              key={selecionado.id}
              role="dialog"
              aria-modal="false"
              aria-labelledby="estande-titulo"
              onKeyDown={(ev) => {
                if (ev.key === "Escape") {
                  ev.stopPropagation();
                  selecionar(null);
                }
              }}
              initial={reduzir ? { opacity: 0 } : { opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              exit={reduzir ? { opacity: 0 } : { opacity: 0, y: 16 }}
              transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
              className="fixed inset-x-3 bottom-[max(12px,env(safe-area-inset-bottom))] z-40 rounded-3xl border border-line bg-paper p-5 shadow-[0_24px_60px_-28px_rgba(29,27,26,0.45)] sm:inset-x-auto sm:right-6 sm:w-[360px] lg:absolute lg:bottom-auto lg:right-5 lg:top-5"
            >
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-rose-deep">{SERIE_ROTULO[selecionado.serie]}</p>
                  <h2 id="estande-titulo" className="mt-1 font-display text-4xl leading-none tracking-tight">
                    Nº {selecionado.numero}
                  </h2>
                </div>
                <button
                  type="button"
                  onClick={() => selecionar(null)}
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
                    <span key="s" className="inline-flex items-center gap-2">
                      <span className="size-3 rounded-full" style={{ background: corGrupo(selecionado.id).cor }} />
                      {corGrupo(selecionado.id).rotulo}
                    </span>,
                  ],
                ].map(([k, v]) => (
                  <div key={String(k)} className="bg-paper px-4 py-3">
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

              {st.grupoDe(selecionado.id) === "ocupado" ? (
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
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <p className="px-4 py-4 text-xs leading-relaxed text-muted sm:px-6 lg:px-10">{AVISO_PLANTA}</p>
    </section>
  );
}
