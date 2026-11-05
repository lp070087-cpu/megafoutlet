"use client";

import FiltrosMapa from "@/components/mapa/FiltrosMapa";
import { correspondeFiltro, FILTROS_INICIAIS, type FiltrosMapa as Filtros } from "@/lib/filtros-mapa";


import dynamic from "next/dynamic";
import Link from "next/link";
import { createPortal } from "react-dom";
import { useCallback, useEffect, useId, useMemo, useRef, useState } from "react";
import { ESTANDES, type Estande } from "@/data/planta";
import { GRUPOS_STATUS, type StatusEstande } from "@/lib/types";
import { useStatusEstandes } from "@/lib/useStatusEstandes";
import { AVISO_ILUSTRATIVO, MODO_DEMO, PLANTA_ILUSTRATIVA } from "@/lib/ambiente";
import { Fallback2D, LimiteCena, SkeletonCena } from "./EstadosCena";
import { PainelEstande } from "./PainelEstande";
import { enquadramento, type ComandoCamera } from "./geometria";

/** Setores derivados dos próprios dados (funciona com a planta ilustrativa e com a oficial). */
const SETORES = (() => {
  const mapa = new Map<string, Estande[]>();
  for (const e of ESTANDES) mapa.set(e.setor, [...(mapa.get(e.setor) ?? []), e]);
  return [...mapa.entries()]
    // setores de estandes primeiro; feirinha e alimentação ao final
    .sort((a, b) => Number(a[1][0].serie !== "principal") - Number(b[1][0].serie !== "principal") || a[0].localeCompare(b[0], "pt-BR"))
    .map(([nome, itens]) => ({ nome, itens, alvo: enquadramento(itens) }));
})();
const normalizar = (s: string) => s.trim().toLowerCase().replace(/[\s-]/g, "").replace(/^0+(?=\d)/, "");

const Cena = dynamic(() => import("./CenaPavilhao"), {
  ssr: false,
  loading: () => <SkeletonCena />,
});
const toolClass = "inline-flex min-h-11 min-w-11 shrink-0 items-center whitespace-nowrap justify-center rounded-full border border-line bg-paper px-3 text-xs font-semibold text-graphite transition-colors hover:bg-sand disabled:opacity-40";

export interface Mapa3DCardProps {
  estandeInicial?: string;
  className?: string;
  modoAdmin?: boolean;
  filtrosExternos?: Filtros;
  onFiltrosChange?: (filtros: Filtros) => void;
  onSelecionarEstande?: (estande: Estande | null) => void;
  onSolicitarAlteracaoStatus?: (estande: Estande, status: StatusEstande) => void;
}

export default function Mapa3DCard({
  estandeInicial,
  className = "",
  modoAdmin = false,
  filtrosExternos,
  onFiltrosChange,
  onSelecionarEstande,
  onSolicitarAlteracaoStatus,
}: Mapa3DCardProps) {
  const root = useRef<HTMLElement>(null);
  const fullscreenButton = useRef<HTMLButtonElement>(null);
  const id = useId();
  const [webgl, setWebgl] = useState<boolean | null>(null);
  const [selectedId, setSelectedId] = useState<string | null>(estandeInicial ?? null);
  const [coresPlanta, setCoresPlanta] = useState(PLANTA_ILUSTRATIVA);
  const [cssFull, setCssFull] = useState(false);
  const [placeholderHeight, setPlaceholderHeight] = useState(0);
  const [nativeFull, setNativeFull] = useState(false);
  const [comando, setComando] = useState<ComandoCamera>({ tipo: "geral", sequencia: 0 });
  const [setor, setSetor] = useState<string | null>(null);
  const [busca, setBusca] = useState("");
  const [lista, setLista] = useState(false);
  const [filtrosLocais, setFiltrosLocais] = useState(FILTROS_INICIAIS);
  const filtros = filtrosExternos ?? filtrosLocais;
  const status = useStatusEstandes();
  const filtrados = useMemo(() => ESTANDES.filter(e => correspondeFiltro(e, filtros, status.statusDe(e.id))), [filtros, status]);
  const visiveis = useMemo(() => new Set(filtrados.map(e => e.id)), [filtrados]);
  const resultados = useMemo(() => {
    const q = normalizar(busca);
    if (!q) return [];
    return filtrados.filter(e => normalizar(e.numero).startsWith(q) || normalizar(e.id).startsWith(q) || normalizar(e.setor).includes(q)).slice(0, 6);
  }, [busca, filtrados]);
  const selected = ESTANDES.find(item => item.id === selectedId);
  const full = cssFull || nativeFull;
  const fail = useCallback(() => setWebgl(false), []);

  useEffect(() => {
    let alive = true;
    function prepare() {
      if (!alive) return;
      let available = false;
      try {
        const probe = document.createElement("canvas");
        const context = probe.getContext("webgl2");
        available = !!context;
        context?.getExtension("WEBGL_lose_context")?.loseContext();
      } catch { /* O fallback 2D permanece utilizável sem WebGL. */ }
      setWebgl(available);
    }
    if (!("IntersectionObserver" in window)) {
      queueMicrotask(prepare);
      return () => { alive = false; };
    }
    const observer = new IntersectionObserver(entries => {
      if (entries.some(entry => entry.isIntersecting)) {
        prepare();
        observer.disconnect();
      }
    }, { rootMargin: "240px" });
    if (root.current) observer.observe(root.current);
    return () => { alive = false; observer.disconnect(); };
  }, []);

  useEffect(() => {
    function change() { setNativeFull(document.fullscreenElement === root.current); }
    document.addEventListener("fullscreenchange", change);
    return () => document.removeEventListener("fullscreenchange", change);
  }, []);

  useEffect(() => {
    if (!cssFull) return;
    const previous = document.body.style.overflow;
    const botao = fullscreenButton.current;
    document.body.style.overflow = "hidden";
    botao?.focus();
    function trap(event: KeyboardEvent) {
      if (event.key !== "Tab") return;
      const items = root.current?.querySelectorAll<HTMLElement>(
        'a[href],button:not([disabled]),input:not([disabled]),select:not([disabled]),[tabindex="0"]',
      );
      if (!items?.length) return;
      const first = items[0];
      const last = items[items.length - 1];
      if (event.shiftKey && (document.activeElement === first || document.activeElement === root.current)) {
        event.preventDefault(); last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault(); first.focus();
      }
    }
    document.addEventListener("keydown", trap);
    return () => {
      document.body.style.overflow = previous;
      document.removeEventListener("keydown", trap);
      botao?.focus();
    };
  }, [cssFull]);

  function fallbackFullscreen() {
    setPlaceholderHeight(root.current?.offsetHeight ?? 800);
    setCssFull(true);
  }

  async function toggleFullscreen() {
    if (cssFull) { setCssFull(false); return; }
    if (document.fullscreenElement === root.current) {
      await document.exitFullscreen();
      return;
    }
    try {
      if (!root.current?.requestFullscreen) { fallbackFullscreen(); return; }
      await root.current.requestFullscreen();
      if (document.fullscreenElement !== root.current) fallbackFullscreen();
    } catch { fallbackFullscreen(); }
  }

  function select(estande: Estande) {
    setSelectedId(estande.id);
    onSelecionarEstande?.(estande);
  }
  function focar(alvo: NonNullable<ComandoCamera["alvo"]>) {
    setComando(previous => ({ tipo: "focar", alvo, sequencia: previous.sequencia + 1 }));
  }
  function escolher(estande: Estande) {
    select(estande);
    setSetor(estande.setor);
    setBusca("");
    focar(enquadramento([estande]));
  }
  function irParaSetor(nome: string | null) {
    setSetor(nome);
    const alvo = SETORES.find(s => s.nome === nome)?.alvo;
    if (alvo) focar(alvo); else camera("geral");
  }
  function close() {
    setSelectedId(null);
    onSelecionarEstande?.(null);
    requestAnimationFrame(() => root.current?.focus({ preventScroll: true }));
  }
  function camera(tipo: ComandoCamera["tipo"]) {
    setComando(previous => ({ tipo, sequencia: previous.sequencia + 1 }));
  }

  const card = (
    <article
      ref={root}
      data-lenis-prevent
      aria-labelledby={`${id}-titulo`}
      tabIndex={-1}
      onKeyDown={event => {
        if (event.key !== "Escape") return;
        if (selected) { event.stopPropagation(); close(); }
        else if (cssFull) { event.stopPropagation(); setCssFull(false); }
      }}
      className={`${cssFull ? "fixed inset-0 z-[100]" : "relative"} ${full ? "flex h-dvh w-full flex-col overflow-y-auto overscroll-contain" : "overflow-hidden rounded-[28px]"} border border-line bg-ivory text-ink ${className}`}
    >
      <header className="shrink-0 border-b border-line px-4 py-4 sm:px-6">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <p className="flex flex-wrap items-center gap-2 text-[10px] font-semibold uppercase tracking-[0.18em] text-rose-deep">
              Mapa interativo · 3D
              {PLANTA_ILUSTRATIVA && <span className="rounded-full border border-rose/40 bg-rose-soft px-2 py-0.5 tracking-[0.12em] text-rose-deep">Demonstração ilustrativa · não oficial</span>}
            </p>
            <h3 id={`${id}-titulo`} className="mt-1 font-display text-2xl tracking-tight">Explore os espaços da feira.</h3>
          </div>
          <Link href={`/mapa?vista=2d${selectedId ? `&estande=${encodeURIComponent(selectedId)}` : ""}`} className="inline-flex min-h-11 items-center text-xs font-semibold underline underline-offset-4">Ver em 2D ↗</Link>
        </div>
        <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-center">
          <div className="relative w-full sm:max-w-60">
            <label htmlFor={`${id}-busca`} className="sr-only">Buscar espaço por número ou setor</label>
            <input
              id={`${id}-busca`}
              type="search"
              autoComplete="off"
              value={busca}
              onChange={event => setBusca(event.target.value)}
              onKeyDown={event => {
                if (event.key === "Enter" && resultados[0]) { event.preventDefault(); escolher(resultados[0]); }
                if (event.key === "Escape") setBusca("");
              }}
              placeholder={PLANTA_ILUSTRATIVA ? "Buscar espaço, ex.: A12" : "Buscar estande, ex.: 142"}
              className="h-11 w-full rounded-full border border-line bg-paper px-4 text-sm outline-none placeholder:text-muted/80 focus:border-rose"
            />
            {resultados.length > 0 && (
              <ul aria-label="Resultados da busca" className="absolute inset-x-0 top-[calc(100%+6px)] z-30 overflow-hidden rounded-2xl border border-line bg-paper py-1 shadow-[0_12px_32px_-16px_rgba(29,27,26,0.25)]">
                {resultados.map(e => (
                  <li key={e.id}>
                    <button type="button" onClick={() => escolher(e)} className="flex min-h-11 w-full items-center justify-between gap-3 px-4 text-left text-sm hover:bg-rose-soft">
                      <span className="font-semibold">{e.numero}</span>
                      <span className="truncate text-xs text-muted">{e.setor} · {e.dimensao.replace("x", " × ")} m</span>
                    </button>
                  </li>
                ))}
              </ul>
            )}
            {busca.trim() !== "" && resultados.length === 0 && <p role="status" className="absolute top-[calc(100%+6px)] z-30 rounded-xl border border-line bg-paper px-3 py-2 text-xs text-muted">Nenhum espaço encontrado.</p>}
          </div>
          <div className="-mx-4 flex gap-2 overflow-x-auto px-4 pb-1 [scrollbar-width:none] sm:mx-0 sm:px-0 sm:pb-0" role="group" aria-label="Navegar por setor">
            <button type="button" className={`${toolClass} shrink-0`} aria-pressed={setor === null} onClick={() => irParaSetor(null)}>Todos</button>
            {SETORES.map(s => (
              <button key={s.nome} type="button" className={`${toolClass} shrink-0 whitespace-nowrap`} aria-pressed={setor === s.nome} onClick={() => irParaSetor(s.nome)}>
                {s.nome}
              </button>
            ))}
          </div>
        </div>
        <div className="-mx-4 mt-3 flex items-center gap-2 overflow-x-auto px-4 pb-1 [scrollbar-width:none] sm:mx-0 sm:flex-wrap sm:px-0 sm:pb-0" role="group" aria-label="Controles da visualização 3D">
          <button type="button" className={toolClass} disabled={webgl !== true} onClick={() => camera("geral")} aria-label="Redefinir câmera para a visão geral do pavilhão">Redefinir câmera</button>
          <button type="button" className={toolClass} disabled={webgl !== true} onClick={() => camera("superior")}>Visão superior</button>
          <button type="button" className={toolClass} disabled={webgl !== true} onClick={() => camera("geral")}>Isométrica</button>
          <button type="button" className={toolClass} disabled={webgl !== true} onClick={() => camera("ampliar")} aria-label="Ampliar mapa 3D">+</button>
          <button type="button" className={toolClass} disabled={webgl !== true} onClick={() => camera("reduzir")} aria-label="Reduzir mapa 3D">−</button>
          <button type="button" className={toolClass} aria-pressed={!coresPlanta} onClick={() => setCoresPlanta(false)}>Ver status</button>
          <button type="button" className={toolClass} aria-pressed={coresPlanta} onClick={() => setCoresPlanta(true)}>{PLANTA_ILUSTRATIVA ? "Cores por setor" : "Cores da planta"}</button>
          <button type="button" className={toolClass} aria-pressed={lista} onClick={() => setLista(v => !v)}>Lista</button>
          <button ref={fullscreenButton} type="button" className={`${toolClass} sm:ml-auto`} onClick={toggleFullscreen} aria-label={full ? "Sair da tela cheia" : "Abrir mapa 3D em tela cheia"} aria-pressed={full}>
            {full ? "Sair da tela cheia" : "Tela cheia"}
          </button>
        </div>
        <FiltrosMapa value={filtros} total={filtrados.length} onChange={value => { (onFiltrosChange ?? setFiltrosLocais)(value); setSetor(null); setSelectedId(null); onSelecionarEstande?.(null); }} />
      </header>
      <div className={`relative isolate ${full ? "min-h-72 flex-1" : "h-[min(68svh,500px)] sm:h-[600px]"}`} aria-label="Pavilhão em perspectiva tridimensional">
        {lista && (
          <div data-lenis-prevent className="absolute inset-0 z-20 overflow-y-auto bg-ivory p-4 sm:p-6">
            <p className="text-xs text-muted">Alternativa acessível ao 3D: escolha um espaço para vê-lo no mapa.</p>
            {SETORES.map(s => ({ ...s, itens: s.itens.filter(e => visiveis.has(e.id)) }))
              .filter(s => s.itens.length > 0 && (!setor || s.nome === setor)).map(s => (
              <section key={s.nome} className="mt-5" aria-label={s.nome}>
                <h4 className="text-[11px] font-semibold uppercase tracking-[0.16em] text-muted">{s.nome} · {s.itens.length}</h4>
                <ul className="mt-2 grid grid-cols-3 gap-1.5 sm:grid-cols-6">
                  {s.itens.map(e => (
                    <li key={e.id}>
                      <button type="button" onClick={() => { setLista(false); escolher(e); }} aria-pressed={selectedId === e.id} className="min-h-11 w-full rounded-lg border border-line bg-paper px-2 text-xs font-semibold tabular-nums hover:border-rose aria-pressed:border-rose aria-pressed:bg-rose-soft">
                        {e.numero}
                      </button>
                    </li>
                  ))}
                </ul>
              </section>
            ))}
          </div>
        )}
        {webgl === null ? <SkeletonCena /> : webgl === false ? <Fallback2D /> : (
          <LimiteCena fallback={<Fallback2D />}>
            <Cena visiveis={visiveis} selecionado={selectedId} coresPlanta={coresPlanta} comando={comando} onSelecionar={select} onFalha={fail} />
          </LimiteCena>
        )}
        {selected && (
          <PainelEstande
            miniaturaDisponivel={webgl === true}
            estande={selected}
            status={status.statusDe(selected.id)}
            grupo={status.grupoDe(selected.id)}
            modoAdmin={modoAdmin}
            onFechar={close}
            onSolicitarAlteracaoStatus={onSolicitarAlteracaoStatus}
          />
        )}
      </div>
      <footer className="shrink-0 border-t border-line px-4 py-4 sm:px-6">
        <ul className="flex flex-wrap gap-x-5 gap-y-2" aria-label="Contagem de espaços por status" aria-live="polite">
          {GRUPOS_STATUS.map(grupo => (
            <li key={grupo.id} className="flex items-center gap-2 text-[11px]">
              <span aria-hidden="true" className="size-2.5 rounded-full" style={{ backgroundColor: grupo.cor }} />
              <span>{grupo.rotulo}: <strong>{status.contagem[grupo.id]}</strong></span>
            </li>
          ))}
        </ul>
        {!status.algumDefinido && <p className="mt-3 text-xs font-semibold text-muted">Status ainda não informados pela organização.</p>}
        {PLANTA_ILUSTRATIVA && <p className="mt-2 text-[11px] font-semibold leading-5 text-rose-deep">{AVISO_ILUSTRATIVO}</p>}
        <p className="mt-2 text-[10px] leading-5 text-muted">
          {coresPlanta && PLANTA_ILUSTRATIVA ? "Cores identificam os setores da demonstração. " : coresPlanta ? "Cores da planta representam a legenda original, não a disponibilidade. " : MODO_DEMO ? "Status de demonstração, locais deste navegador. " : "Disponibilidade confirmada exclusivamente pela organização. "}
          Arraste para girar. No toque: um dedo gira; dois deslocam e ampliam. Contorno e áreas identificadas como aproximadas são referenciais. Volumes ilustrativos.
        </p>
      </footer>
    </article>
  );
  // O portal evita que transforms/overflow dos ancestrais recortem o fallback no iPhone.
  return cssFull ? (
    <>
      <div aria-hidden="true" style={{ height: placeholderHeight }} />
      {createPortal(card, document.body)}
    </>
  ) : card;
}
