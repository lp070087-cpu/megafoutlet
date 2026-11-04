"use client";

import { useState, type FormEvent } from "react";
import { adicionarNotaLojista, atualizarStatusLojista, listarLojistas } from "@/lib/demo-store";
import {
  CATEGORIAS,
  STATUS_LOJISTA,
  STATUS_LOJISTA_ROTULO,
  type Lojista,
  type StatusLojista,
} from "@/lib/types";
import { useAdminStore, useFeedback } from "./useAdminStore";
import {
  buttonClass,
  dateLabel,
  EmptyState,
  Feedback,
  inputClass,
  maskContact,
  maskName,
  Modal,
  PageHeading,
  primaryClass,
} from "./ui";

// Neutraliza fórmulas de planilha também quando precedidas por espaços.
export function csvCell(value: unknown) {
  const text = String(value ?? "");
  const safe = /^\s*[=+\-@]/.test(text) || /^[\t\r\n]/.test(text) ? `'${text}` : text;
  return `"${safe.replaceAll('"', '""')}"`;
}

function downloadCsv(records: Lojista[]) {
  const headers = [
    "ID", "Cadastro", "Responsável", "Marca", "WhatsApp", "E-mail", "Instagram",
    "Categoria", "Cidade", "UF", "Dimensão", "Estande de interesse", "Status",
    "Observações", "Consentimento", "Fictício",
  ];
  const rows = records.map(item => [
    item.id, item.criadoEm, item.responsavel, item.marca, item.whatsapp, item.email,
    item.instagram, item.categoria, item.cidade, item.uf, item.dimensao,
    item.estandeInteresse, STATUS_LOJISTA_ROTULO[item.status], item.observacoes,
    item.consentimento ? "Sim" : "Não", item.demo ? "Sim" : "Não",
  ]);
  const csv = "\uFEFF" + [headers, ...rows].map(row => row.map(csvCell).join(";")).join("\r\n");
  const url = URL.createObjectURL(new Blob([csv], { type: "text/csv;charset=utf-8;" }));
  const link = document.createElement("a");
  link.href = url;
  link.download = "lojistas-demonstracao.csv";
  document.body.appendChild(link);
  link.click();
  link.remove();
  window.setTimeout(() => URL.revokeObjectURL(url), 1000);
}

export function LojistasPanel() {
  const { lojistas } = useAdminStore();
  const { feedback, run } = useFeedback();
  const [query, setQuery] = useState("");
  const [status, setStatus] = useState("");
  const [category, setCategory] = useState("");
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [note, setNote] = useState("");
  const [exportRecords, setExportRecords] = useState<Lojista[] | null>(null);
  const [exportError, setExportError] = useState("");
  const [limit, setLimit] = useState(20);
  const selected = lojistas.find(item => item.id === selectedId);
  const needle = query.trim().toLocaleLowerCase("pt-BR");
  const filtered = [...lojistas].filter(item =>
    (!status || item.status === status)
    && (!category || item.categoria === category)
    && (!needle || [item.marca, item.responsavel, item.email, item.whatsapp]
      .some(value => value.toLocaleLowerCase("pt-BR").includes(needle))),
  ).sort((a, b) => b.criadoEm.localeCompare(a.criadoEm));

  function updateStatus(value: StatusLojista) {
    if (!selected) return;
    run(
      () => atualizarStatusLojista(selected.id, value),
      () => listarLojistas().find(item => item.id === selected.id)?.status === value,
      "Status do lojista atualizado. Isso não altera o status do estande.",
    );
  }

  function addNote(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const text = note.trim();
    if (!selected || !text) return;
    const count = selected.notas.length;
    if (run(
      () => adicionarNotaLojista(selected.id, text),
      () => {
        const saved = listarLojistas().find(item => item.id === selected.id);
        return saved?.notas.length === count + 1 && saved.notas.at(-1)?.texto === text;
      },
      "Observação adicionada ao histórico do lojista.",
    )) setNote("");
  }

  function exportCsv() {
    if (!exportRecords) return;
    try {
      downloadCsv(exportRecords);
      setExportRecords(null);
      setExportError("");
    } catch {
      setExportError("Não foi possível gerar o arquivo CSV neste navegador.");
    }
  }

  return (
    <>
      <PageHeading
        title="Lojistas"
        description="Acompanhe solicitações de interesse. Os dados pessoais ficam mascarados na listagem e completos somente no detalhe. Aprovar uma solicitação não reserva um estande."
      />
      <div className="mb-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <div className="sm:col-span-2 xl:col-span-2">
          <label htmlFor="lojista-busca" className="mb-2 block text-sm font-semibold">
            Buscar marca, responsável ou contato
          </label>
          <input
            id="lojista-busca"
            type="search"
            value={query}
            onChange={event => { setQuery(event.target.value); setLimit(20); }}
            className={inputClass}
          />
        </div>
        <div>
          <label htmlFor="lojista-status" className="mb-2 block text-sm font-semibold">Status</label>
          <select
            id="lojista-status"
            value={status}
            onChange={event => { setStatus(event.target.value); setLimit(20); }}
            className={inputClass}
          >
            <option value="">Todos os status</option>
            {STATUS_LOJISTA.map(value => <option key={value} value={value}>{STATUS_LOJISTA_ROTULO[value]}</option>)}
          </select>
        </div>
        <div>
          <label htmlFor="lojista-categoria" className="mb-2 block text-sm font-semibold">Categoria</label>
          <select
            id="lojista-categoria"
            value={category}
            onChange={event => { setCategory(event.target.value); setLimit(20); }}
            className={inputClass}
          >
            <option value="">Todas as categorias</option>
            {CATEGORIAS.map(value => <option key={value}>{value}</option>)}
          </select>
        </div>
      </div>
      <div className="mb-5 flex flex-wrap items-center justify-between gap-4">
        <p role="status" className="text-sm text-muted">
          {filtered.length} de {lojistas.length} solicitações
        </p>
        <button
          type="button"
          className={buttonClass}
          disabled={!filtered.length}
          onClick={() => { setExportError(""); setExportRecords([...filtered]); }}
        >
          Exportar resultados em CSV
        </button>
      </div>
      {!selected && <Feedback {...feedback} />}
      {!filtered.length ? (
        <EmptyState
          title={lojistas.length ? "Nenhuma solicitação com esses filtros" : "Nenhum lojista cadastrado"}
        >
          {lojistas.length ? "Revise sua busca ou selecione outras categorias e status." : "Carregue os dados fictícios para explorar o painel ou envie um interesse pelo formulário público."}
        </EmptyState>
      ) : (
        <ul className="divide-y divide-line border border-line bg-paper">
          {filtered.slice(0, limit).map(item => (
            <li
              key={item.id}
              className="grid gap-4 p-5 md:grid-cols-[minmax(0,1.3fr)_minmax(0,1fr)_auto] md:items-center"
            >
              <div className="min-w-0">
                <h2 className="break-words text-sm font-semibold">
                  {item.demo ? item.marca : maskName(item.marca)}
                </h2>
                <p className="mt-2 text-xs leading-6 text-muted">
                  {maskName(item.responsavel)} · {item.categoria}
                  <br />{maskContact(item.whatsapp)} · {maskContact(item.email)}
                </p>
                {item.demo && <span className="mt-1 inline-block text-xs font-semibold text-rose-deep">Dado fictício</span>}
              </div>
              <div className="text-xs leading-6 text-muted">
                <p className="font-semibold text-ink">{STATUS_LOJISTA_ROTULO[item.status]}</p>
                <p>{item.estandeInteresse ? `Interesse: ${item.estandeInteresse}` : "Sem estande indicado"}</p>
                <p>{dateLabel(item.criadoEm)}</p>
              </div>
              <button
                type="button"
                className={buttonClass}
                onClick={() => { setSelectedId(item.id); setNote(""); }}
              >
                Ver detalhe<span className="sr-only"> de {item.demo ? item.marca : "solicitação mascarada"}</span>
              </button>
            </li>
          ))}
        </ul>
      )}
      {filtered.length > limit && (
        <button type="button" className={`${buttonClass} mt-5`} onClick={() => setLimit(limit + 20)}>
          Mostrar mais solicitações ({filtered.length - limit} restantes)
        </button>
      )}
      {selected && (
        <Modal title="Detalhe do lojista" onClose={() => setSelectedId(null)} drawer>
          <p className="mb-5 text-xs leading-6 text-muted">
            Dados completos para uso restrito da organização. {selected.demo ? "Registro fictício." : "Registro local do formulário."}
          </p>
          <dl className="grid gap-4 text-sm">
            {[
              ["Responsável", selected.responsavel], ["Marca", selected.marca],
              ["WhatsApp", selected.whatsapp], ["E-mail", selected.email],
              ["Instagram", selected.instagram || "Não informado"], ["Categoria", selected.categoria],
              ["Cidade / UF", `${selected.cidade} / ${selected.uf}`], ["Dimensão desejada", selected.dimensao],
              ["Estande de interesse", selected.estandeInteresse || "Não informado"],
              ["Cadastro", dateLabel(selected.criadoEm, true)],
              ["Consentimento", selected.consentimento ? "Registrado" : "Não registrado"],
              ["Observações do cadastro", selected.observacoes || "Não informadas"],
            ].map(([label, value]) => (
              <div key={label} className="border-b border-line pb-3">
                <dt className="text-xs text-muted">{label}</dt>
                <dd className="mt-1 whitespace-pre-wrap break-words leading-7">{value}</dd>
              </div>
            ))}
          </dl>
          <div className="mt-7">
            <label htmlFor="detalhe-status" className="mb-2 block text-sm font-semibold">
              Status da solicitação
            </label>
            <select
              id="detalhe-status"
              className={inputClass}
              value={selected.status}
              onChange={event => updateStatus(event.target.value as StatusLojista)}
            >
              {STATUS_LOJISTA.map(value => <option key={value} value={value}>{STATUS_LOJISTA_ROTULO[value]}</option>)}
            </select>
          </div>
          <Feedback {...feedback} />
          <form onSubmit={addNote} className="mt-7">
            <label htmlFor="lojista-nota" className="mb-2 block text-sm font-semibold">
              Adicionar observação interna
            </label>
            <textarea
              id="lojista-nota"
              value={note}
              onChange={event => setNote(event.target.value)}
              maxLength={2000}
              required
              rows={4}
              className={inputClass}
            />
            <button type="submit" disabled={!note.trim()} className={`${primaryClass} mt-3`}>
              Salvar observação
            </button>
          </form>
          <h3 className="mt-8 font-display text-2xl">Histórico de observações</h3>
          {!selected.notas.length ? <p className="mt-3 text-sm text-muted">Nenhuma observação interna.</p> : (
            <ol className="mt-4 space-y-4">
              {[...selected.notas].reverse().map((item, index) => (
                <li key={`${item.em}-${index}`} className="border-l-2 border-line pl-4">
                  <p className="text-xs text-muted">{dateLabel(item.em, true)}</p>
                  <p className="mt-2 whitespace-pre-wrap break-words text-sm leading-7">{item.texto}</p>
                </li>
              ))}
            </ol>
          )}
        </Modal>
      )}
      {exportRecords && (
        <Modal title="Exportar dados pessoais?" onClose={() => setExportRecords(null)}>
          <p className="font-semibold">Uso restrito à organização.</p>
          <p className="mt-4 text-sm leading-7 text-muted">
            O CSV conterá dados completos, sem máscaras, de {exportRecords.length} solicitações selecionadas pelos filtros no momento da exportação.
            Confirme que está autorizado a tratar e guardar essas informações.
          </p>
          {exportError && <p role="alert" className="mt-4 text-sm text-danger">{exportError}</p>}
          <div className="mt-7 flex flex-wrap gap-3">
            <button type="button" onClick={() => setExportRecords(null)} className={buttonClass}>
              Cancelar
            </button>
            <button type="button" onClick={exportCsv} className={primaryClass}>
              Confirmar exportação dos dados pessoais
            </button>
          </div>
        </Modal>
      )}
    </>
  );
}
