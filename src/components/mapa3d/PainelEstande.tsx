"use client";

import dynamic from "next/dynamic";
import Link from "next/link";
import { useEffect, useId, useRef } from "react";
import { motion, useReducedMotion } from "motion/react";
import type { Estande } from "@/data/planta";
import { GRUPOS_STATUS, STATUS_ESTANDE, STATUS_ESTANDE_ROTULO, type GrupoStatus, type StatusEstande } from "@/lib/types";
import { ALTURA_ESTANDE, dimensoes } from "./geometria";
import { PLANTA_ILUSTRATIVA } from "@/lib/ambiente";
import { LimiteCena } from "./EstadosCena";

const Miniatura = dynamic(() => import("./MiniaturaEstande"), {
  ssr: false,
  loading: () => <div role="status" className="h-full bg-sand p-5 text-xs text-muted">Preparando escala do estande…</div>,
});

interface Props {
  estande: Estande;
  status: StatusEstande;
  grupo: GrupoStatus;
  modoAdmin: boolean;
  miniaturaDisponivel?: boolean;
  onFechar: () => void;
  onSolicitarAlteracaoStatus?: (estande: Estande, status: StatusEstande) => void;
}

export function PainelEstande({ estande, status, grupo, modoAdmin, miniaturaDisponivel = true, onFechar, onSolicitarAlteracaoStatus }: Props) {
  const ref = useRef<HTMLElement>(null);
  const id = useId();
  const reduced = useReducedMotion();
  const medidas = dimensoes(estande.dimensao);
  const info = GRUPOS_STATUS.find(item => item.id === grupo);
  const label = (value: number | null) => value === null ? "Não informada" : `${value.toLocaleString("pt-BR")} m`;

  useEffect(() => { ref.current?.focus(); }, [estande.id]);

  return (
    <motion.aside
      ref={ref}
      data-lenis-prevent
      role="dialog"
      aria-modal="false"
      aria-labelledby={`${id}-titulo`}
      tabIndex={-1}
      initial={{ opacity: 0, y: reduced ? 0 : 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: reduced ? 0 : 0.25 }}
      className="absolute inset-x-3 bottom-3 z-20 max-h-[68%] overflow-y-auto overscroll-contain rounded-2xl border border-line bg-paper p-5 shadow-lg lg:inset-y-3 lg:left-auto lg:w-80 lg:max-h-none"
    >
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-[10px] uppercase tracking-[0.18em] text-muted">{estande.id}</p>
          <h4 id={`${id}-titulo`} className="mt-1 font-display text-3xl">{PLANTA_ILUSTRATIVA ? "Espaço" : "Estande"} {estande.numero}</h4>
        </div>
        <button type="button" onClick={onFechar} aria-label="Fechar detalhes do estande" className="min-h-11 min-w-11 rounded-full border border-line text-lg">×</button>
      </div>
      <p className="mt-3 flex items-center gap-2 text-xs font-semibold" style={{ color: info?.corTexto }}>
        <span aria-hidden="true" className="size-2.5 shrink-0 rounded-full" style={{ backgroundColor: info?.cor }} />
        {info?.rotulo}
      </p>
      <figure className="mt-5">
        <div className="h-40 overflow-hidden rounded-xl bg-sand">
          {miniaturaDisponivel && medidas.largura && medidas.profundidade ? (
            <LimiteCena fallback={<p className="p-4 text-xs text-muted">Escala descrita nas dimensões abaixo.</p>}>
              <Miniatura largura={medidas.largura} profundidade={medidas.profundidade} />
            </LimiteCena>
          ) : <p className="p-4 text-xs text-muted">{miniaturaDisponivel ? "Dimensões não informadas para a miniatura." : "Miniatura 3D indisponível neste navegador. Consulte as dimensões abaixo."}</p>}
        </div>
        <figcaption className="mt-2 text-[10px] leading-5 text-muted">Volume ilustrativo de {ALTURA_ESTANDE.toLocaleString("pt-BR", { minimumFractionDigits: 2 })} m de altura. Figura humana de 1,70 m para escala. Não representa o projeto de montagem.</figcaption>
      </figure>
      <dl className="mt-5 grid grid-cols-2 gap-x-4 gap-y-4 text-xs">
        <div><dt className="text-muted">Largura</dt><dd className="mt-1 font-semibold">{label(medidas.largura)}</dd></div>
        <div><dt className="text-muted">Profundidade</dt><dd className="mt-1 font-semibold">{label(medidas.profundidade)}</dd></div>
        <div className="col-span-2"><dt className="text-muted">{PLANTA_ILUSTRATIVA ? "Formato (ilustrativo)" : "Dimensões conforme a planta"}</dt><dd className="mt-1">{estande.dimensao.replace("x", " × ")} m</dd></div>
        <div><dt className="text-muted">Área</dt><dd className="mt-1 font-semibold">{estande.areaM2 === null ? "Não informada" : `${estande.areaM2.toLocaleString("pt-BR")} m²`}</dd></div>
        <div><dt className="text-muted">Localização</dt><dd className="mt-1 leading-5">{estande.setor}</dd></div>
      </dl>
      {estande.observacao && <p className="mt-4 rounded-xl bg-ivory p-3 text-xs leading-6">{estande.observacao}</p>}
      {modoAdmin ? (
        <div className="mt-5 border-t border-line pt-4">
          <label htmlFor={`${id}-status`} className="mb-2 block text-xs font-semibold">Status administrativo local</label>
          <select
            id={`${id}-status`}
            value={status}
            disabled={!onSolicitarAlteracaoStatus}
            onChange={event => {
              const next = event.target.value as StatusEstande;
              if (next !== status) onSolicitarAlteracaoStatus?.(estande, next);
            }}
            className="min-h-11 w-full rounded-xl border border-line bg-paper px-3 text-sm focus:border-rose disabled:opacity-50"
          >
            {STATUS_ESTANDE.map(value => <option key={value} value={value}>{STATUS_ESTANDE_ROTULO[value]}</option>)}
          </select>
          <p className="mt-2 text-[11px] leading-5 text-muted">A mudança só será gravada depois da confirmação administrativa. Ambiente de demonstração.</p>
        </div>
      ) : grupo === "ocupado" ? (
        <p className="mt-5 rounded-xl bg-sand p-3 text-xs leading-6">Este espaço está ocupado. Explore outros estandes ou consulte a organização.</p>
      ) : (
        <Link href={`/expositor?estande=${encodeURIComponent(estande.id)}`} className="mt-5 flex min-h-12 items-center justify-center rounded-full bg-rose px-4 py-3 text-center text-xs font-semibold text-white hover:bg-rose-deep">
          {PLANTA_ILUSTRATIVA ? "Quero expor neste setor ↗" : "Tenho interesse neste estande ↗"}
        </Link>
      )}
      <p className="mt-3 text-[11px] leading-5 text-muted">Demonstrar interesse não reserva nem compra um estande. Confirmação exclusiva da organização.</p>
    </motion.aside>
  );
}
