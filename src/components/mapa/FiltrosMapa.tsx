"use client";
import { useId } from "react";
import { ESTANDES } from "@/data/planta";
import { STATUS_ESTANDE, STATUS_ESTANDE_ROTULO } from "@/lib/types";
import { FILTROS_INICIAIS, type FiltrosMapa as Filtros } from "@/lib/filtros-mapa";

export default function FiltrosMapa({ value, onChange, onClear, total }: {
  value: Filtros; onChange: (value: Filtros) => void; onClear?: () => void; total: number;
}) {
  const id = useId();
  const campos = [
    { key: "setor", nome: "Setor", opcoes: [...new Set(ESTANDES.map(e => e.setor))].map(v => [v, v]) },
    { key: "dimensao", nome: "Dimensão", opcoes: [...new Set(ESTANDES.map(e => e.dimensao))].map(v => [v, `${v.replace("x", " × ")} m`]) },
    { key: "status", nome: "Disponibilidade", opcoes: STATUS_ESTANDE.map(v => [v, v === "em_negociacao" ? "Em negociação" : STATUS_ESTANDE_ROTULO[v]]) },
  ] as const;
  return <div className="@container space-y-3" aria-label="Filtros do mapa">
    <div className="grid grid-cols-1 gap-3 @[25rem]:grid-cols-2 @[39rem]:grid-cols-3">
    {campos.map(c => <div key={c.key} className={`flex min-w-0 flex-col gap-1.5 text-sm font-medium text-ink ${c.key === "status" ? "@[25rem]:col-span-2 @[39rem]:col-span-1" : ""}`}>
      <label htmlFor={`${id}-${c.key}`}>{c.nome}</label>
      <select id={`${id}-${c.key}`} value={value[c.key]} onChange={e => onChange({ ...value, [c.key]: e.target.value })} className="min-h-12 w-full min-w-0 rounded-xl border border-line bg-paper px-3 text-sm font-normal text-ink">
        <option value="">Todos</option>
        {c.opcoes.map(([v, rotulo]) => <option key={v} value={v}>{rotulo}</option>)}
      </select>
    </div>)}
    </div>
    <div className="flex flex-wrap items-center gap-x-4 gap-y-2">
      <button type="button" onClick={onClear ?? (() => onChange(FILTROS_INICIAIS))} className="min-h-11 rounded-xl border border-line px-3 text-sm hover:border-rose">Limpar filtros</button>
      <p role="status" className="text-sm text-muted">{total} espaços encontrados</p>
    </div>
  </div>;
}
