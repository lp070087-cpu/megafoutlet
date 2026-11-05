"use client";

import { useEffect, useState } from "react";

/** Início do evento: 20/11/2026, 10h (horário de Brasília). */
const INICIO = Date.parse("2026-11-20T10:00:00-03:00");
const FIM = Date.parse("2026-11-24T22:00:00-03:00");

function partes(agora: number) {
  const ms = Math.max(0, INICIO - agora);
  return {
    dias: Math.floor(ms / 86_400_000),
    horas: Math.floor((ms / 3_600_000) % 24),
    minutos: Math.floor((ms / 60_000) % 60),
    segundos: Math.floor((ms / 1000) % 60),
  };
}

export default function Contagem({ tom = "claro" }: { tom?: "claro" | "escuro" }) {
  const [agora, setAgora] = useState<number | null>(null);
  useEffect(() => {
    const tick = () => setAgora(Date.now());
    tick();
    const id = window.setInterval(tick, 1000);
    return () => window.clearInterval(id);
  }, []);

  const p = partes(agora ?? INICIO - 1);
  const estado = agora === null ? "carregando" : agora >= FIM ? "encerrado" : agora >= INICIO ? "aovivo" : "antes";
  const itens = [
    { v: p.dias, r: "dias" },
    { v: p.horas, r: "horas" },
    { v: p.minutos, r: "min" },
    { v: p.segundos, r: "seg" },
  ];
  const borda = tom === "escuro" ? "border-ivory/15" : "border-line";
  const sub = tom === "escuro" ? "text-ivory/60" : "text-muted";

  if (estado === "aovivo") return <p className="font-display text-3xl">Acontecendo agora · até 24 de novembro, 22h</p>;
  if (estado === "encerrado") return <p className="font-display text-3xl">Edição encerrada. Obrigado pela visita!</p>;

  return (
    <div role="timer" aria-live="off" aria-label={`Faltam ${p.dias} dias e ${p.horas} horas para o início do evento`}>
      <ol className={`grid grid-cols-4 divide-x ${tom === "escuro" ? "divide-ivory/15" : "divide-line"} border-y ${borda}`}>
        {itens.map((i) => (
          <li key={i.r} className="flex flex-col items-center py-4 sm:py-5">
            <span className={`font-display text-[clamp(2rem,6vw,3.5rem)] leading-none tabular-nums tracking-tight ${agora === null ? "opacity-0" : ""}`} suppressHydrationWarning>
              {String(i.v).padStart(2, "0")}
            </span>
            <span className={`mt-2 text-[10px] font-semibold uppercase tracking-[0.2em] ${sub}`}>{i.r}</span>
          </li>
        ))}
      </ol>
    </div>
  );
}
