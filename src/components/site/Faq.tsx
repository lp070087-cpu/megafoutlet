"use client";

import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { Plus } from "lucide-react";
import { useId, useState } from "react";
import { EVENTO } from "@/data/evento";
import { MODO_DEMO } from "@/lib/ambiente";

// Conteúdo: Codex 1 (respostas sem dados não oficiais). Acordeão animado: Claude Code.
const PERGUNTAS = [
  {
    grupo: "Para lojistas",
    p: "Como faço para expor?",
    r: MODO_DEMO
      ? "No site oficial, o caminho será enviar seu interesse pela página Seja um expositor para que a organização retorne. Nesta demonstração, os dados ficam apenas neste navegador e não chegam à organização: para participar agora, fale com a organização pelos canais oficiais. O envio não garante reserva de estande."
      : "Escolha um espaço no mapa e fale com a organização pelo WhatsApp oficial, na página Seja um expositor. Valores, disponibilidade e confirmação são tratados exclusivamente pela organização.",
  },
  {
    grupo: "Para lojistas",
    p: "Posso escolher o estande?",
    r: "Você pode indicar um espaço de preferência no mapa interativo. A disponibilidade e a confirmação são feitas exclusivamente pela organização.",
  },
  {
    grupo: "Para lojistas",
    p: "Quais são os valores e as condições de participação?",
    r: "Consulte a organização para preços, disponibilidade, montagem, documentação e condições comerciais.",
  },
  {
    grupo: "Para visitantes",
    p: "Quando e onde acontece?",
    r: `${EVENTO.datas.rotulo}, das ${EVENTO.horario}, no ${EVENTO.local.nome}. ${EVENTO.local.endereco}.`,
  },
  {
    grupo: "Para visitantes",
    p: "A confirmação de presença é um ingresso?",
    r: "Não. É apenas uma intenção de comparecer. Para informações sobre entrada, valores ou regras de acesso, consulte a organização.",
  },
  {
    grupo: "Para visitantes",
    p: "Há informações sobre estacionamento e acessibilidade?",
    r: "Consulte a organização para orientações oficiais sobre estacionamento, acessibilidade e serviços disponíveis nesta edição.",
  },
];

export default function Faq() {
  const [aberta, setAberta] = useState<number | null>(0);
  const base = useId();
  const reduz = useReducedMotion();

  return (
    <ul className="border-t border-line">
      {PERGUNTAS.map((q, i) => {
        const on = aberta === i;
        const idBotao = `${base}-b${i}`;
        const idPainel = `${base}-p${i}`;
        return (
          <li key={q.p} className="border-b border-line">
            <h3>
              <button
                id={idBotao}
                type="button"
                aria-expanded={on}
                aria-controls={idPainel}
                onClick={() => setAberta(on ? null : i)}
                className="group flex min-h-20 w-full items-center justify-between gap-6 py-5 text-left"
              >
                <span>
                  <span className="mb-1.5 block text-[10px] font-semibold uppercase tracking-[0.2em] text-muted">{q.grupo}</span>
                  <span className="text-[17px] font-semibold leading-snug text-ink transition-colors group-hover:text-rose-deep">{q.p}</span>
                </span>
                <span
                  aria-hidden
                  className={`grid size-10 shrink-0 place-items-center rounded-full border transition-[transform,background-color,border-color,color] duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] ${
                    on ? "rotate-45 border-rose bg-rose text-white" : "border-line text-ink group-hover:border-ink/40"
                  }`}
                >
                  <Plus className="size-4" />
                </span>
              </button>
            </h3>
            <AnimatePresence initial={false}>
              {on && (
                <motion.div
                  id={idPainel}
                  role="region"
                  aria-labelledby={idBotao}
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: "auto", opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: reduz ? 0 : 0.45, ease: [0.22, 1, 0.36, 1] }}
                  className="overflow-hidden"
                >
                  <div className="max-w-2xl pb-7 pr-14 text-[15px] leading-7 text-muted">
                    <p>{q.r}</p>
                    <a
                      className="mt-3 inline-flex min-h-11 items-center gap-1 text-sm font-semibold text-rose-deep underline decoration-rose/40 underline-offset-4 hover:decoration-rose"
                      href={EVENTO.linktree}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      Falar com a organização <span aria-hidden>↗</span>
                      <span className="sr-only"> (abre em nova aba)</span>
                    </a>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </li>
        );
      })}
    </ul>
  );
}
