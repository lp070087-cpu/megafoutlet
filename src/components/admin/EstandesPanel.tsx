"use client";

import { useState } from "react";
import Mapa3DCard from "@/components/mapa3d/Mapa3DCard";
import { AVISO_PLANTA } from "@/data/evento";
import { ESTANDES, rotuloEstande } from "@/data/planta";
import { alterarStatusEstande, historicoEstandes, statusEstandes } from "@/lib/demo-store";
import { STATUS_ESTANDE, type StatusEstande } from "@/lib/types";
import { useAdminStore, useFeedback } from "./useAdminStore";
import {
  buttonClass,
  dateLabel,
  EmptyState,
  Feedback,
  inputClass,
  Metric,
  Modal,
  PageHeading,
  panelClass,
  primaryClass,
  standLabels,
} from "./ui";

interface PendingChange {
  id: string;
  from: StatusEstande;
  to: StatusEstande;
}

const series = {
  principal: "Estandes principais",
  feirinha: "Feirinha",
  alimentacao: "Alimentação",
};
const dimensions = [...new Set(ESTANDES.map(item => item.dimensao))].sort();
const sectors = [...new Set(ESTANDES.map(item => item.setor))].sort();

export function EstandesPanel() {
  const store = useAdminStore();
  const [visualizacao, setVisualizacao] = useState<"lista" | "3d">("lista");
  const { feedback, run } = useFeedback();
  const [serie, setSerie] = useState("");
  const [dimension, setDimension] = useState("");
  const [sector, setSector] = useState("");
  const [query, setQuery] = useState("");
  const [limit, setLimit] = useState(24);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [pending, setPending] = useState<PendingChange | null>(null);
  const selected = ESTANDES.find(item => item.id === selectedId);
  const needle = query.trim().toLocaleLowerCase("pt-BR");
  const currentStatus = (id: string) => store.estandes[id] ?? "sem_informacao";
  const interests = new Map<string, number>();
  for (const lojista of store.lojistas) {
    if (lojista.estandeInteresse) {
      interests.set(lojista.estandeInteresse, (interests.get(lojista.estandeInteresse) ?? 0) + 1);
    }
  }
  const filtered = ESTANDES.filter(item =>
    (!serie || item.serie === serie)
    && (!dimension || item.dimensao === dimension)
    && (!sector || item.setor === sector)
    && (!needle || item.id.toLocaleLowerCase("pt-BR").includes(needle)),
  );
  const withoutInfo = ESTANDES.filter(item => currentStatus(item.id) === "sem_informacao").length;
  const stale = pending !== null && currentStatus(pending.id) !== pending.from;

  function confirmChange() {
    if (!pending) return;
    const change = pending;
    const success = run(
      () => {
        if ((statusEstandes()[change.id] ?? "sem_informacao") !== change.from) {
          throw new Error("Status alterado em outra aba");
        }
        alterarStatusEstande(change.id, change.to, "Administrador (demo)");
      },
      () => statusEstandes()[change.id] === change.to
        && historicoEstandes().some(item => item.estandeId === change.id && item.de === change.from && item.para === change.to),
      `Status local de ${change.id} alterado para ${standLabels[change.to]}. Histórico registrado.`,
    );
    if (success) setPending(null);
  }

  return (
    <>
      <PageHeading
        title="Estandes"
        description="A planta é uma referência. Sem ação administrativa, o status é sempre “Sem informação”. Interesse de lojista não representa reserva, disponibilidade ou venda. As alterações deste painel são apenas locais."
      />
      <p className="mb-6 text-xs leading-6 text-muted">{AVISO_PLANTA}</p>
      <div className="mb-8 grid gap-4 sm:grid-cols-3">
        <Metric label="Espaços na planta" value={ESTANDES.length} />
        <Metric label="Sem informação" value={withoutInfo} hint="Padrão, sem disponibilidade presumida" />
        <Metric
          label="Com interesse"
          value={ESTANDES.filter(item => interests.has(item.id)).length}
          hint="Interesses registrados neste navegador"
        />
      </div>
      <div className="mb-6 flex gap-2" role="group" aria-label="Visualiza??o dos estandes">
        <button
          type="button"
          className={buttonClass}
          aria-pressed={visualizacao === "lista"}
          onClick={() => setVisualizacao("lista")}
        >
          Lista
        </button>
        <button
          type="button"
          className={buttonClass}
          aria-pressed={visualizacao === "3d"}
          onClick={() => setVisualizacao("3d")}
        >
          Mapa 3D
        </button>
      </div>
      {visualizacao === "3d" ? (
        <Mapa3DCard
          modoAdmin
          onSolicitarAlteracaoStatus={(estande, to) => {
            const from = currentStatus(estande.id);
            if (to !== from) setPending({ id: estande.id, from, to });
          }}
        />
      ) : (
        <>
      <div className="mb-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <div>
          <label htmlFor="estande-busca" className="mb-2 block text-sm font-semibold">Código do espaço</label>
          <input
            id="estande-busca"
            type="search"
            value={query}
            onChange={event => { setQuery(event.target.value); setLimit(24); }}
            placeholder="Ex.: E-142"
            className={inputClass}
          />
        </div>
        <div>
          <label htmlFor="estande-serie" className="mb-2 block text-sm font-semibold">Série</label>
          <select
            id="estande-serie"
            value={serie}
            onChange={event => { setSerie(event.target.value); setLimit(24); }}
            className={inputClass}
          >
            <option value="">Todas as séries</option>
            {Object.entries(series).map(([value, label]) => <option key={value} value={value}>{label}</option>)}
          </select>
        </div>
        <div>
          <label htmlFor="estande-dimensao" className="mb-2 block text-sm font-semibold">Dimensão</label>
          <select
            id="estande-dimensao"
            value={dimension}
            onChange={event => { setDimension(event.target.value); setLimit(24); }}
            className={inputClass}
          >
            <option value="">Todas as dimensões</option>
            {dimensions.map(value => <option key={value}>{value}</option>)}
          </select>
        </div>
        <div>
          <label htmlFor="estande-setor" className="mb-2 block text-sm font-semibold">Setor</label>
          <select
            id="estande-setor"
            value={sector}
            onChange={event => { setSector(event.target.value); setLimit(24); }}
            className={inputClass}
          >
            <option value="">Todos os setores</option>
            {sectors.map(value => <option key={value}>{value}</option>)}
          </select>
        </div>
      </div>
      <p role="status" className="mb-5 text-sm text-muted">{filtered.length} espaços encontrados</p>
      {!pending && <Feedback {...feedback} />}
      {!filtered.length ? (
        <EmptyState
          title={ESTANDES.length ? "Nenhum espaço com esses filtros" : "A planta ainda não tem espaços cadastrados"}
        >
          {ESTANDES.length ? "Revise código, série, dimensão ou setor." : "Aguarde a atualização oficial da planta. Nenhuma disponibilidade é presumida."}
        </EmptyState>
      ) : (
        <ul className="grid gap-4 xl:grid-cols-2">
          {filtered.slice(0, limit).map(item => (
            <li key={item.id} className={panelClass}>
              <div className="flex flex-wrap items-start justify-between gap-3">
                <h2 className="text-sm font-semibold">{rotuloEstande(item)}</h2>
                <span className="text-xs text-muted">{item.id}</span>
              </div>
              <p className="mt-3 text-xs leading-6 text-muted">{series[item.serie]} · {item.setor}</p>
              <p className="mt-3 text-sm">{interests.get(item.id) ?? 0} interessados</p>
              <label htmlFor={`status-${item.id}`} className="mb-2 mt-5 block text-xs font-semibold">
                Status administrativo local
              </label>
              <select
                id={`status-${item.id}`}
                className={inputClass}
                value={currentStatus(item.id)}
                onChange={event => {
                  const to = event.target.value as StatusEstande;
                  if (to !== currentStatus(item.id)) setPending({ id: item.id, from: currentStatus(item.id), to });
                }}
              >
                {STATUS_ESTANDE.map(value => <option key={value} value={value}>{standLabels[value]}</option>)}
              </select>
              <button type="button" onClick={() => setSelectedId(item.id)} className={`${buttonClass} mt-4`}>
                Ver histórico<span className="sr-only"> de {item.id}</span>
              </button>
            </li>
          ))}
        </ul>
      )}
      {filtered.length > limit && (
        <button type="button" onClick={() => setLimit(limit + 24)} className={`${buttonClass} mt-5`}>
          Mostrar mais espaços ({filtered.length - limit} restantes)
        </button>
      )}

        </>
      )}
      <section className={`${panelClass} mt-8`}>
        <h2 className="font-display text-2xl">Últimas alterações de status</h2>
        {!store.historico.length ? (
          <p className="mt-4 text-sm leading-7 text-muted">
            Nenhuma alteração administrativa registrada neste navegador.
          </p>
        ) : (
          <ol className="mt-5 divide-y divide-line">
            {store.historico.slice(0, 10).map((item, index) => (
              <li key={`${item.em}-${item.estandeId}-${index}`} className="py-4 text-sm leading-7">
                <p><strong>{item.estandeId}</strong> · {standLabels[item.de]} → {standLabels[item.para]}</p>
                <p className="text-xs text-muted">{dateLabel(item.em, true)}</p>
              </li>
            ))}
          </ol>
        )}
      </section>
      {selected && (
        <Modal title={`Histórico de ${selected.id}`} onClose={() => setSelectedId(null)} drawer>
          <p className="font-semibold">{rotuloEstande(selected)}</p>
          <p className="mt-3 text-sm leading-7 text-muted">
            {selected.setor} · {standLabels[currentStatus(selected.id)]}
          </p>
          <p className="mt-3 text-sm">
            {interests.get(selected.id) ?? 0} interessados. Isso não garante reserva.
          </p>
          {selected.observacao && <p className="mt-4 text-sm leading-7 text-muted">{selected.observacao}</p>}
          <h3 className="mt-8 font-display text-2xl">Alterações administrativas</h3>
          {!store.historico.some(item => item.estandeId === selected.id) ? (
            <p className="mt-4 text-sm leading-7 text-muted">
              Nenhuma alteração. O status inicial é “Sem informação”.
            </p>
          ) : (
            <ol className="mt-5 space-y-5">
              {store.historico.filter(item => item.estandeId === selected.id).map((item, index) => (
                <li key={`${item.em}-${index}`} className="border-l-2 border-line pl-4 text-sm leading-7">
                  <p>{standLabels[item.de]} → {standLabels[item.para]}</p>
                  <p className="mt-1 text-xs text-muted">{dateLabel(item.em, true)} · {item.por}</p>
                </li>
              ))}
            </ol>
          )}
        </Modal>
      )}
      {pending && (
        <Modal title="Confirmar alteração de status?" onClose={() => setPending(null)}>
          <p className="text-sm leading-7">
            Espaço <strong>{pending.id}</strong>: de <strong>{standLabels[pending.from]}</strong> para <strong>{standLabels[pending.to]}</strong>.
          </p>
          <p className="mt-4 text-sm leading-7 text-muted">
            A alteração será registrada no histórico local. Confirme que esta é a ação desejada.
            O painel demonstrativo não confirma condições comerciais com a organização.
          </p>
          {stale && <p role="alert" className="mt-4 text-sm text-danger">
            O status mudou em outra aba. Cancele e revise o status atual antes de continuar.
          </p>}
          <Feedback {...feedback} />
          <div className="mt-7 flex flex-wrap gap-3">
            <button type="button" className={buttonClass} onClick={() => setPending(null)}>Cancelar</button>
            <button type="button" className={primaryClass} disabled={stale} onClick={confirmChange}>
              Confirmar alteração local
            </button>
          </div>
        </Modal>
      )}
    </>
  );
}
