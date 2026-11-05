"use client";
import { useId } from "react";
import { ESTANDES } from "@/data/planta";
import { STATUS_ESTANDE, STATUS_ESTANDE_ROTULO } from "@/lib/types";
import { FILTROS_INICIAIS, type FiltrosMapa as Filtros } from "@/lib/filtros-mapa";

export default function FiltrosMapa({ value, onChange, total }: {
  value: Filtros; onChange: (value: Filtros) => void; total: number;
}) {
  const id = useId();
  const campos = [
    { key: "setor", nome: "Setor", opcoes: [...new Set(ESTANDES.map(e => e.setor))].map(v => [v, v]) },
    { key: "dimensao", nome: "Dimensão", opcoes: [...new Set(ESTANDES.map(e => e.dimensao))].map(v => [v, `${v.replace("x", " × ")} m`]) },
    { key: "status", nome: "Disponibilidade", opcoes: STATUS_ESTANDE.map(v => [v, STATUS_ESTANDE_ROTULO[v]]) },
  ] as const;
  return <div className="flex flex-wrap items-end gap-3 border-b border-line px-4 py-3 sm:px-6" aria-label="Filtros do mapa">
    {campos.map(c => <div key={c.key} className="flex min-w-0 flex-1 flex-col gap-1 text-xs text-muted sm:flex-none">
      <label htmlFor={`${id}-${c.key}`}>{c.nome}</label>
      <select id={`${id}-${c.key}`} value={value[c.key]} onChange={e => onChange({ ...value, [c.key]: e.target.value })} className="min-h-11 max-w-full rounded-xl border border-line bg-paper px-2 text-sm text-ink">
        <option value="">Todos</option>
        {c.opcoes.map(([v, rotulo]) => <option key={v} value={v}>{rotulo}</option>)}
      </select>
    </div>)}
    <button type="button" onClick={() => onChange(FILTROS_INICIAIS)} className="min-h-11 rounded-full border border-line px-3 text-xs">Limpar filtros</button>
    <p role="status" className="py-3 text-xs text-muted">{total} espaços encontrados</p>
  </div>;
}
