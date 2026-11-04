"use client";

import { useState } from "react";
import { listarVisitantes, normalizarContato, registrarComparecimento } from "@/lib/demo-store";
import { uniqueVisitors, useAdminStore, useFeedback } from "./useAdminStore";
import {
  buttonClass,
  dateLabel,
  EmptyState,
  Feedback,
  inputClass,
  maskContact,
  maskName,
  Metric,
  Modal,
  PageHeading,
} from "./ui";

export function VisitantesPanel() {
  const { visitantes } = useAdminStore();
  const { feedback, run } = useFeedback();
  const [query, setQuery] = useState("");
  const [attendanceFilter, setAttendanceFilter] = useState("");
  const [selectedContact, setSelectedContact] = useState<string | null>(null);
  const [limit, setLimit] = useState(20);
  const unique = uniqueVisitors(visitantes);
  const attended = unique.visitantes.filter(item => item.compareceu).length;
  const needle = query.trim().toLocaleLowerCase("pt-BR");
  const filtered = [...unique.visitantes].filter(item =>
    (!needle || [item.nome, item.contato].some(value => value.toLocaleLowerCase("pt-BR").includes(needle)))
    && (!attendanceFilter || (attendanceFilter === "presente" ? !!item.compareceu : !item.compareceu)),
  ).sort((a, b) => b.criadoEm.localeCompare(a.criadoEm));
  const selected = unique.visitantes.find(item => normalizarContato(item.contato) === selectedContact);

  function attendance(contact: string, present: boolean) {
    const key = normalizarContato(contact);
    const records = visitantes.filter(item => normalizarContato(item.contato) === key);
    run(
      () => records.forEach(item => registrarComparecimento(item.id, present)),
      () => {
        const saved = listarVisitantes().filter(item => normalizarContato(item.contato) === key);
        return saved.length === records.length && saved.every(item => !!item.compareceu === present);
      },
      present ? "Comparecimento efetivo registrado. A confirmação de presença foi preservada." : "Marcação de comparecimento removida. A confirmação de presença foi preservada.",
    );
  }

  return (
    <>
      <PageHeading
        title="Visitantes"
        description="Confirmação de presença é intenção de comparecer, não ingresso. O comparecimento efetivo é marcado separadamente. A lista agrupa contatos normalizados para evitar contagem duplicada."
      />
      <div className="mb-8 grid gap-4 sm:grid-cols-3">
        <Metric label="Confirmados únicos" value={unique.visitantes.length} />
        <Metric label="Compareceram" value={attended} />
        <Metric label="Ainda sem comparecimento" value={unique.visitantes.length - attended} />
      </div>
      <p className="mb-6 border-l-2 border-rose pl-4 text-sm leading-7 text-muted">
        Deduplicação ativa por WhatsApp (dígitos) ou e-mail (sem espaços externos e em minúsculas).
        {" "}{visitantes.length} registros locais · {unique.visitantes.length} contatos únicos · {unique.duplicates} duplicados agrupados.
        Novas confirmações com o mesmo contato são bloqueadas pelo formulário.
      </p>
      <div className="mb-5 grid gap-4 sm:grid-cols-[minmax(0,2fr)_minmax(0,1fr)]">
        <div>
          <label htmlFor="visitante-busca" className="mb-2 block text-sm font-semibold">
            Buscar nome ou contato
          </label>
          <input
            id="visitante-busca"
            type="search"
            value={query}
            onChange={event => { setQuery(event.target.value); setLimit(20); }}
            className={inputClass}
          />
        </div>
        <div>
          <label htmlFor="visitante-filtro" className="mb-2 block text-sm font-semibold">
            Comparecimento
          </label>
          <select
            id="visitante-filtro"
            value={attendanceFilter}
            onChange={event => { setAttendanceFilter(event.target.value); setLimit(20); }}
            className={inputClass}
          >
            <option value="">Todos</option>
            <option value="presente">Comparecimento registrado</option>
            <option value="ausente">Sem comparecimento registrado</option>
          </select>
        </div>
      </div>
      <p role="status" className="mb-5 text-sm text-muted">{filtered.length} contatos encontrados</p>
      {!selected && <Feedback {...feedback} />}
      {!filtered.length ? (
        <EmptyState
          title={visitantes.length ? "Nenhum visitante com esses filtros" : "A lista ainda está vazia"}
        >
          Revise os filtros ou carregue os dados fictícios para explorar a demonstração.
        </EmptyState>
      ) : (
        <ul className="divide-y divide-line border border-line bg-paper">
          {filtered.slice(0, limit).map(item => (
            <li key={item.id} className="grid gap-4 p-5 xl:grid-cols-[minmax(0,1fr)_auto_auto] xl:items-center">
              <div className="min-w-0">
                <h2 className="break-words text-sm font-semibold">{item.demo ? item.nome : maskName(item.nome)}</h2>
                <p className="mt-2 text-xs leading-6 text-muted">
                  {maskContact(item.contato)} · Confirmado em {dateLabel(item.criadoEm)}
                </p>
                <p className="text-xs leading-6 text-muted">
                  {item.compareceu ? `Comparecimento: ${dateLabel(item.compareceu, true)}` : "Sem comparecimento registrado"}
                </p>
                {(unique.counts.get(normalizarContato(item.contato)) ?? 0) > 1 && (
                  <p className="text-xs font-semibold text-rose-deep">
                    {unique.counts.get(normalizarContato(item.contato))} registros agrupados pelo mesmo contato
                  </p>
                )}
                {item.demo && <span className="text-xs font-semibold text-rose-deep">Dado fictício</span>}
              </div>
              <button
                type="button"
                className={buttonClass}
                onClick={() => setSelectedContact(normalizarContato(item.contato))}
              >
                Ver detalhe
              </button>
              <button
                type="button"
                className={buttonClass}
                onClick={() => attendance(item.contato, !item.compareceu)}
                aria-label={`${item.compareceu ? "Remover" : "Registrar"} comparecimento de ${item.demo ? item.nome : "visitante com nome mascarado"}`}
              >
                {item.compareceu ? "Desfazer comparecimento" : "Registrar comparecimento"}
              </button>
            </li>
          ))}
        </ul>
      )}
      {filtered.length > limit && (
        <button type="button" className={`${buttonClass} mt-5`} onClick={() => setLimit(limit + 20)}>
          Mostrar mais visitantes ({filtered.length - limit} restantes)
        </button>
      )}
      {selected && (
        <Modal title="Detalhe do visitante" onClose={() => setSelectedContact(null)} drawer>
          <p className="mb-6 text-xs leading-6 text-muted">
            Dados completos para uso restrito da organização. {selected.demo ? "Registro fictício." : "Registro local do formulário."}
          </p>
          <dl className="space-y-5 text-sm">
            {[
              ["Nome", selected.nome], ["Contato", selected.contato],
              ["Confirmação", dateLabel(selected.criadoEm, true)],
              ["Comparecimento efetivo", selected.compareceu ? dateLabel(selected.compareceu, true) : "Não registrado"],
              ["Consentimento", selected.consentimento ? "Registrado" : "Não registrado"],
              ["Registros deste contato", String(unique.counts.get(normalizarContato(selected.contato)) ?? 1)],
            ].map(([label, value]) => (
              <div key={label} className="border-b border-line pb-4">
                <dt className="text-xs text-muted">{label}</dt>
                <dd className="mt-2 break-words leading-7">{value}</dd>
              </div>
            ))}
          </dl>
          <Feedback {...feedback} />
          <button
            type="button"
            className={`${buttonClass} mt-7`}
            onClick={() => attendance(selected.contato, !selected.compareceu)}
          >
            {selected.compareceu ? "Desfazer comparecimento" : "Registrar comparecimento efetivo"}
          </button>
          <p className="mt-5 text-xs leading-7 text-muted">
            A ação atualiza todos os registros agrupados deste contato. A confirmação de presença não é removida e não equivale a ingresso.
          </p>
        </Modal>
      )}
    </>
  );
}
