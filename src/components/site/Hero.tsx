"use client";

import Image from "next/image";
import { motion, useReducedMotion, useScroll, useTransform } from "motion/react";
import { useRef, useState } from "react";
import { Pause, Play } from "lucide-react";
import { EVENTO } from "@/data/evento";
import { ESTANDES } from "@/data/planta";
import { Botao } from "@/components/ui/Botao";
import { Contador, EASE, LinhaMascara } from "@/components/motion/Animacoes";

const totalEspacos = ESTANDES.length;
const horasPorDia = 12; // 10h às 22h
const dias = 5; // 20 a 24/11

export default function Hero() {
  const ref = useRef<HTMLElement>(null);
  const reduz = useReducedMotion();
  const [faixaPausada, setFaixaPausada] = useState(false);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start start", "end start"] });
  const yPlanta = useTransform(scrollYProgress, [0, 1], reduz ? [0, 0] : [0, 120]);
  const yCartao = useTransform(scrollYProgress, [0, 1], reduz ? [0, 0] : [0, -60]);
  const escalaPlanta = useTransform(scrollYProgress, [0, 1], reduz ? [1, 1] : [1.06, 1.16]);

  const surgir = (atraso: number) =>
    reduz
      ? { initial: { opacity: 0 }, animate: { opacity: 1 }, transition: { duration: 0.3, delay: atraso * 0.3 } }
      : { initial: { opacity: 0, y: 22 }, animate: { opacity: 1, y: 0 }, transition: { duration: 0.9, ease: EASE, delay: atraso } };

  return (
    <section ref={ref} aria-labelledby="hero-titulo" className="relative overflow-hidden">
      <div className="mx-auto grid max-w-7xl gap-12 px-5 pb-16 pt-10 sm:pt-14 lg:grid-cols-12 lg:gap-10 lg:px-10 lg:pb-24 lg:pt-16">
        {/* Texto */}
        <div className="relative z-10 lg:col-span-7 lg:pt-6">
          <motion.p {...surgir(0.05)} className="flex flex-wrap items-center gap-x-3 gap-y-1 text-[11px] font-semibold uppercase tracking-[0.22em] text-rose-deep">
            <span>Edição {EVENTO.edicao}</span>
            <span aria-hidden className="h-px w-8 bg-rose/50" />
            <span>{EVENTO.local.cidade}</span>
          </motion.p>

          <h1 id="hero-titulo" className="mt-6 font-display text-[clamp(3rem,10.5vw,7.25rem)] leading-[0.92] tracking-[-0.02em] text-ink">
            <LinhaMascara atraso={0.12}>O maior outlet</LinhaMascara>
            <LinhaMascara atraso={0.24}>
              de <em className="font-normal text-rose">Pernambuco</em>
            </LinhaMascara>
          </h1>

          <motion.p {...surgir(0.5)} className="mt-7 max-w-xl text-[17px] leading-relaxed text-muted sm:text-lg">
            {EVENTO.segmentos.slice(0, -1).join(", ")} e {EVENTO.segmentos.at(-1)?.toLowerCase()} reunidos no{" "}
            <span className="text-ink">{EVENTO.local.nome}</span>. Apresente sua marca a quem vem para comprar.
          </motion.p>

          <motion.div {...surgir(0.62)} className="mt-9 flex flex-col gap-3 sm:flex-row">
            <Botao href="/expositor">Quero ser expositor</Botao>
            <Botao href="/visitante" variante="secundario">
              Sou visitante
            </Botao>
          </motion.div>

          {/* Indicadores */}
          <motion.dl {...surgir(0.78)} className="mt-14 grid max-w-xl grid-cols-3 border-t border-line pt-6">
            {[
              { v: dias, s: "", r: "dias de evento" },
              { v: horasPorDia, s: "h", r: "por dia, 10h às 22h" },
              { v: totalEspacos, s: "", r: "espaços na planta" },
            ].map((x) => (
              <div key={x.r} className="flex flex-col-reverse pr-3">
                <dt className="mt-1 text-xs leading-snug text-muted">{x.r}</dt>
                <dd className="font-display text-[clamp(2rem,5vw,3rem)] leading-none tracking-tight text-ink">
                  <Contador valor={x.v} sufixo={x.s} />
                </dd>
              </div>
            ))}
          </motion.dl>
        </div>

        {/* Composição visual */}
        <div className="relative lg:col-span-5">
          <div className="relative mx-auto aspect-[4/5] w-full max-w-[460px]">
            {/* bloco da cor da marca */}
            <motion.div
              aria-hidden
              initial={reduz ? { opacity: 0 } : { opacity: 0, scale: 0.92 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 1.1, ease: EASE, delay: 0.1 }}
              className="absolute inset-y-[6%] right-0 w-[78%] rounded-[28px] bg-rose"
            />
            {/* recorte da planta oficial */}
            <motion.div
              initial={reduz ? { opacity: 0 } : { opacity: 0, x: -24 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 1.1, ease: EASE, delay: 0.25 }}
              className="absolute left-0 top-0 h-[62%] w-[70%] overflow-hidden rounded-[22px] border border-line bg-paper shadow-[0_30px_60px_-40px_rgba(29,27,26,0.55)]"
            >
              <motion.div style={{ y: yPlanta, scale: escalaPlanta }} className="absolute inset-[-12%]">
                <Image
                  src="/planta/planta-oficial.webp"
                  alt="Detalhe da planta oficial do evento"
                  fill
                  sizes="(max-width: 1024px) 70vw, 330px"
                  priority
                  className="object-cover object-[52%_38%]"
                />
              </motion.div>
              <span className="absolute bottom-3 left-3 rounded-full bg-paper/90 px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.18em] backdrop-blur">
                Planta do evento
              </span>
            </motion.div>
            {/* cartão com a logo */}
            <motion.div style={{ y: yCartao }} className="absolute bottom-0 right-[6%] w-[74%]">
              <motion.div
                initial={reduz ? { opacity: 0 } : { opacity: 0, y: 40 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 1.1, ease: EASE, delay: 0.4 }}
                className="rounded-[22px] border border-line bg-paper p-6 shadow-[0_40px_80px_-50px_rgba(29,27,26,0.6)] sm:p-7"
              >
                <Image
                  src="/brand/logo-mega-fashion.png"
                  alt="Logo oficial Mega Fashion Outlet"
                  width={1525}
                  height={636}
                  priority
                  sizes="(max-width: 1024px) 60vw, 300px"
                  className="h-auto w-full"
                />
                <div className="mt-6 flex items-end justify-between gap-4 border-t border-line pt-5">
                  <div>
                    <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-muted">Anote na agenda</p>
                    <p className="mt-1.5 font-display text-2xl leading-tight sm:text-[1.7rem]">20 — 24 nov</p>
                  </div>
                  <p className="text-right text-xs leading-snug text-muted">
                    2026
                    <br />
                    {EVENTO.horario}
                  </p>
                </div>
              </motion.div>
            </motion.div>
          </div>
        </div>
      </div>

      {/* Faixa de segmentos */}
      <div className="relative overflow-hidden border-y border-line bg-sand/70 py-4" aria-label={`Segmentos: ${EVENTO.segmentos.join(", ")}`}>
        <button
          type="button"
          onClick={() => setFaixaPausada((v) => !v)}
          aria-pressed={faixaPausada}
          aria-label={faixaPausada ? "Retomar animação da faixa" : "Pausar animação da faixa"}
          className="absolute right-3 top-1/2 z-10 grid size-11 -translate-y-1/2 place-items-center rounded-full border border-line bg-ivory/90 text-ink backdrop-blur transition-colors hover:text-rose-deep motion-reduce:hidden"
        >
          {faixaPausada ? <Play aria-hidden className="size-4" /> : <Pause aria-hidden className="size-4" />}
        </button>
        <div
          className="flex w-max motion-safe:animate-[faixa_38s_linear_infinite]"
          style={{ animationPlayState: faixaPausada ? "paused" : "running" }}
          aria-hidden
        >
          {[0, 1].map((k) => (
            <div key={k} className="flex shrink-0 items-center">
              {Array.from({ length: 3 }).flatMap((_, r) =>
                EVENTO.segmentos.map((s) => (
                  <span key={`${k}-${r}-${s}`} className="flex items-center gap-8 pr-8 font-display text-2xl italic text-graphite sm:text-3xl">
                    {s}
                    <span className="size-1.5 rounded-full bg-rose" />
                  </span>
                )),
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
