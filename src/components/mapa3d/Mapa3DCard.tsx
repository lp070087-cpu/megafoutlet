"use client";

import dynamic from "next/dynamic";
import Link from "next/link";
import { createPortal } from "react-dom";
import { useCallback, useEffect, useId, useRef, useState } from "react";
import { ESTANDES, type Estande } from "@/data/planta";
import { GRUPOS_STATUS, type StatusEstande } from "@/lib/types";
import { useStatusEstandes } from "@/lib/useStatusEstandes";
import { MODO_DEMO } from "@/lib/ambiente";
import { Fallback2D, LimiteCena, SkeletonCena } from "./EstadosCena";
import { PainelEstande } from "./PainelEstande";
import type { ComandoCamera } from "./geometria";

const Cena = dynamic(() => import("./CenaPavilhao"), {
  ssr: false,
  loading: () => <SkeletonCena />,
});
const toolClass = "inline-flex min-h-11 min-w-11 items-center justify-center rounded-full border border-line bg-paper px-3 text-xs font-semibold text-graphite transition-colors hover:bg-sand disabled:opacity-40";

export interface Mapa3DCardProps {
  className?: string;
  modoAdmin?: boolean;
  onSelecionarEstande?: (estande: Estande | null) => void;
  onSolicitarAlteracaoStatus?: (estande: Estande, status: StatusEstande) => void;
}

export default function Mapa3DCard({
  className = "",
  modoAdmin = false,
  onSelecionarEstande,
  onSolicitarAlteracaoStatus,
}: Mapa3DCardProps) {
  const root = useRef<HTMLElement>(null);
  const fullscreenButton = useRef<HTMLButtonElement>(null);
  const id = useId();
  const [webgl, setWebgl] = useState<boolean | null>(null);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [coresPlanta, setCoresPlanta] = useState(false);
  const [cssFull, setCssFull] = useState(false);
  const [placeholderHeight, setPlaceholderHeight] = useState(0);
  const [nativeFull, setNativeFull] = useState(false);
  const [comando, setComando] = useState<ComandoCamera>({ tipo: "geral", sequencia: 0 });
  const status = useStatusEstandes();
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
        'a[href],button:not([disabled]),select:not([disabled]),[tabindex="0"]',
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
  function close() {
    setSelectedId(null);
    onSelecionarEstande?.(null);
    requestAnimationFrame(() => root.current?.focus());
  }
  function camera(tipo: ComandoCamera["tipo"]) {
    setComando(previous => ({ tipo, sequencia: previous.sequencia + 1 }));
  }

  const card = (
    <article
      ref={root}
      aria-labelledby={`${id}-titulo`}
      tabIndex={-1}
      onKeyDown={event => {
        if (event.key !== "Escape") return;
        if (selected) { event.stopPropagation(); close(); }
        else if (cssFull) { event.stopPropagation(); setCssFull(false); }
      }}
      className={`${cssFull ? "fixed inset-0 z-[100]" : "relative"} ${full ? "flex h-dvh w-full flex-col" : "overflow-hidden rounded-[28px]"} border border-line bg-ivory text-ink ${className}`}
    >
      <header className="shrink-0 border-b border-line px-4 py-4 sm:px-6">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-rose-deep">Planta interativa · 3D</p>
            <h3 id={`${id}-titulo`} className="mt-1 font-display text-2xl tracking-tight">Explore o pavilhão.</h3>
          </div>
          <Link href="/mapa" className="inline-flex min-h-11 items-center text-xs font-semibold underline underline-offset-4">Ver planta 2D ↗</Link>
        </div>
        <div className="mt-4 flex flex-wrap items-center gap-2" role="group" aria-label="Controles da visualização 3D">
          <button type="button" className={toolClass} disabled={webgl !== true} onClick={() => camera("geral")} aria-label="Restaurar visão geral do pavilhão">Visão geral</button>
          <button type="button" className={toolClass} disabled={webgl !== true} onClick={() => camera("ampliar")} aria-label="Ampliar mapa 3D">+</button>
          <button type="button" className={toolClass} disabled={webgl !== true} onClick={() => camera("reduzir")} aria-label="Reduzir mapa 3D">−</button>
          <button type="button" className={toolClass} aria-pressed={!coresPlanta} onClick={() => setCoresPlanta(false)}>Ver status</button>
          <button type="button" className={toolClass} aria-pressed={coresPlanta} onClick={() => setCoresPlanta(true)}>Cores da planta</button>
          <button ref={fullscreenButton} type="button" className={`${toolClass} sm:ml-auto`} onClick={toggleFullscreen} aria-label={full ? "Sair da tela cheia" : "Abrir mapa 3D em tela cheia"} aria-pressed={full}>
            {full ? "Sair da tela cheia" : "Tela cheia"}
          </button>
        </div>
      </header>
      <div className={`relative isolate ${full ? "min-h-0 flex-1" : "h-[520px] sm:h-[600px]"}`} aria-label="Pavilhão em perspectiva tridimensional">
        {webgl === null ? <SkeletonCena /> : webgl === false ? <Fallback2D /> : (
          <LimiteCena fallback={<Fallback2D />}>
            <Cena selecionado={selectedId} coresPlanta={coresPlanta} comando={comando} onSelecionar={select} onFalha={fail} />
          </LimiteCena>
        )}
        {selected && webgl === true && (
          <PainelEstande
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
        <p className="mt-2 text-[10px] leading-5 text-muted">
          {coresPlanta ? "Cores da planta representam a legenda original, não a disponibilidade. " : MODO_DEMO ? "Status de demonstração, locais deste navegador. " : "Disponibilidade confirmada exclusivamente pela organização. "}
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
