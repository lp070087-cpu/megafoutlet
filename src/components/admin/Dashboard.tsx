"use client";

import Link from "next/link";
import { useId } from "react";
import { ESTANDES } from "@/data/planta";
import { CATEGORIAS, STATUS_LOJISTA_ROTULO, type Lojista, type Visitante } from "@/lib/types";
import { uniqueVisitors, useAdminStore } from "./useAdminStore";
import { dateLabel, EmptyState, maskName, Metric, PageHeading, panelClass } from "./ui";

const dayKey = (value: string) => {
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? "" : new Intl.DateTimeFormat("sv-SE", { timeZone: "America/Recife" }).format(date);
};

function DailyChart({ lojistas, visitantes }: { lojistas: Lojista[]; visitantes: Visitante[] }) {
  const id = useId();
  if (!lojistas.length && !visitantes.length) {
    return <EmptyState title="O próximo cadastro começa a curva">
      Carregue a demonstração ou faça um cadastro nos formulários públicos.
    </EmptyState>;
  }
  const today = new Date(`${dayKey(new Date().toISOString())}T12:00:00Z`);
  const days = Array.from({ length: 14 }, (_, index) => {
    const date = new Date(today);
    date.setUTCDate(date.getUTCDate() - 13 + index);
    const key = dayKey(date.toISOString());
    return {
      key,
      label: key.slice(5).split("-").reverse().join("/"),
      lojistas: lojistas.filter(item => dayKey(item.criadoEm) === key).length,
      visitantes: visitantes.filter(item => dayKey(item.criadoEm) === key).length,
    };
  });
  const max = Math.max(1, ...days.flatMap(day => [day.lojistas, day.visitantes]));
  const points = (field: "lojistas" | "visitantes") => days.map((day, index) =>
    `${42 + index * 42},${182 - (day[field] / max) * 150}`,
  ).join(" ");

  return (
    <>
      <div className="mb-4 flex flex-wrap gap-5 text-xs">
        <span className="text-rose-deep">━ Lojistas</span>
        <span className="text-graphite">┄ Visitantes únicos</span>
      </div>
      <svg
        viewBox="0 0 640 220"
        role="img"
        aria-labelledby={`${id}-title ${id}-desc`}
        className="h-auto w-full"
      >
        <title id={`${id}-title`}>Cadastros diários nos últimos 14 dias</title>
        <desc id={`${id}-desc`}>
          Linhas para lojistas e visitantes únicos, com escala de zero a {max}. A tabela abaixo contém todos os valores.
        </desc>
        {[0, 0.5, 1].map(fraction => (
          <g key={fraction}>
            <line x1="42" x2="600" y1={182 - fraction * 150} y2={182 - fraction * 150} stroke="var(--line)" />
            <text x="28" y={186 - fraction * 150} textAnchor="end" fontSize="11" fill="var(--muted)">
              {Number((max * fraction).toFixed(1))}
            </text>
          </g>
        ))}
        <polyline points={points("lojistas")} fill="none" stroke="var(--rose-deep)" strokeWidth="3" />
        <polyline
          points={points("visitantes")}
          fill="none"
          stroke="var(--graphite)"
          strokeWidth="3"
          strokeDasharray="6 4"
        />
        {days.filter((_, index) => index % 3 === 0 || index === 13).map(day => (
          <text
            key={day.key}
            x={42 + days.indexOf(day) * 42}
            y="210"
            textAnchor="middle"
            fontSize="11"
            fill="var(--muted)"
          >
            {day.label}
          </text>
        ))}
      </svg>
      <details className="mt-3 text-sm">
        <summary className="min-h-11 cursor-pointer py-3 underline underline-offset-4">
          Ver tabela do gráfico
        </summary>
        <table className="w-full text-left text-xs">
          <caption className="sr-only">Cadastros por dia, no fuso de Pernambuco</caption>
          <thead>
            <tr>
              <th scope="col" className="py-3">Dia</th><th scope="col">Lojistas</th><th scope="col">Visitantes únicos</th>
            </tr>
          </thead>
          <tbody>{days.map(day => (
            <tr key={day.key} className="border-t border-line">
              <th scope="row" className="py-2 font-normal">{day.label}</th>
              <td>{day.lojistas}</td>
              <td>{day.visitantes}</td>
            </tr>
          ))}</tbody>
        </table>
      </details>
    </>
  );
}

export function Dashboard() {
  const { lojistas, visitantes } = useAdminStore();
  const unique = uniqueVisitors(visitantes).visitantes;
  const attendance = unique.filter(item => item.compareceu).length;
  const interests = new Map<string, number>();
  for (const lojista of lojistas) {
    if (lojista.estandeInteresse) {
      interests.set(lojista.estandeInteresse, (interests.get(lojista.estandeInteresse) ?? 0) + 1);
    }
  }
  const recent = [...lojistas].sort((a, b) => b.criadoEm.localeCompare(a.criadoEm)).slice(0, 6);
  const categories = CATEGORIAS.map(category => ({
    category,
    count: lojistas.filter(item => item.categoria === category).length,
  }));

  return (
    <>
      <PageHeading
        title="Visão geral"
        description="Uma leitura dos registros deste navegador. Os números de demonstração não representam o evento real nem reservas confirmadas."
      />
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <Metric label="Lojistas" value={lojistas.length} hint="Solicitações de interesse" />
        <Metric
          label="Estandes de interesse"
          value={interests.size}
          hint="Espaços distintos citados; sem reserva"
        />
        <Metric
          label="Visitantes confirmados"
          value={unique.length}
          hint="Contatos únicos; intenção de comparecer"
        />
        <Metric label="Comparecimento efetivo" value={attendance} hint="Marcado separadamente no painel" />
      </div>
      <div className="mt-6 grid gap-6 xl:grid-cols-[minmax(0,1.5fr)_minmax(0,1fr)]">
        <section className={panelClass}>
          <h2 className="mb-6 font-display text-2xl">Evolução diária de cadastros</h2>
          <DailyChart lojistas={lojistas} visitantes={unique} />
        </section>
        <section className={panelClass}>
          <h2 className="mb-6 font-display text-2xl">Lojistas por categoria</h2>
          {!lojistas.length ? (
            <EmptyState title="Categorias ainda sem registros">
              As solicitações serão agrupadas aqui.
            </EmptyState>
          ) : (
            <ul className="space-y-4">
              {categories.filter(item => item.count > 0).map(({ category, count }) => (
                <li key={category}>
                  <div className="flex justify-between gap-4 text-xs">
                    <span>{category}</span><strong>{count}</strong>
                  </div>
                  <div className="mt-2 h-1 bg-sand" aria-hidden="true">
                    <div className="h-1 bg-rose" style={{ width: `${count / lojistas.length * 100}%` }} />
                  </div>
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>
      <div className="mt-6 grid gap-6 xl:grid-cols-2">
        <section className={panelClass}>
          <h2 className="font-display text-2xl">Solicitações recentes</h2>
          {!recent.length ? (
            <div className="mt-6">
              <EmptyState title="Nenhuma solicitação ainda">Os próximos interesses aparecerão aqui.</EmptyState>
            </div>
          ) : (
            <ul className="mt-4 divide-y divide-line">
              {recent.map(item => (
                <li key={item.id} className="flex flex-wrap items-center justify-between gap-3 py-4 text-sm">
                  <div>
                    <p className="font-semibold">{item.demo ? item.marca : maskName(item.marca)}</p>
                    <p className="mt-1 text-xs text-muted">
                      {dateLabel(item.criadoEm)}{item.demo ? " · Fictício" : " · Dados mascarados"}
                    </p>
                  </div>
                  <span className="text-xs text-muted">{STATUS_LOJISTA_ROTULO[item.status]}</span>
                </li>
              ))}
            </ul>
          )}
          <Link
            href="/admin/lojistas"
            className="mt-4 inline-flex min-h-11 items-center text-sm text-rose-deep underline"
          >
            Gerenciar lojistas →
          </Link>
        </section>
        <section className={panelClass}>
          <h2 className="font-display text-2xl">Interesse por estande</h2>
          {!interests.size ? (
            <div className="mt-6">
              <EmptyState title="Sem espaços de interesse">
                Interesse não representa disponibilidade ou reserva.
              </EmptyState>
            </div>
          ) : (
            <ul className="mt-4 divide-y divide-line">
              {[...interests.entries()].sort((a, b) => b[1] - a[1]).slice(0, 6).map(([id, count]) => (
                <li key={id} className="flex justify-between gap-4 py-4 text-sm">
                  <span>{ESTANDES.some(item => item.id === id) ? id : `${id} · fora da planta atual`}</span>
                  <span>{count} {count === 1 ? "interessado" : "interessados"}</span>
                </li>
              ))}
            </ul>
          )}
          <Link
            href="/admin/estandes"
            className="mt-4 inline-flex min-h-11 items-center text-sm text-rose-deep underline"
          >
            Gerenciar estandes →
          </Link>
        </section>
      </div>
    </>
  );
}
