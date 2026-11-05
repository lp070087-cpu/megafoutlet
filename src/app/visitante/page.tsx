import type { Metadata } from "next";
import Header from "@/components/site/Header";
import Footer from "@/components/site/Footer";
import { VisitorForm } from "@/components/forms/RegistrationForm";
import { Revelar } from "@/components/motion/Animacoes";
import { EVENTO } from "@/data/evento";
import { MODO_DEMO } from "@/lib/ambiente";
import CanaisOficiais from "@/components/site/CanaisOficiais";

export const metadata: Metadata = {
  title: "Visitantes",
  description: "Programe sua visita ao Mega Fashion Outlet: 20 a 24 de novembro de 2026, das 10h às 22h, em Olinda.",
};

export default function VisitantePage() {
  return (
    <>
      <Header />
      <main
        id="conteudo"
        className="mx-auto grid w-full max-w-6xl gap-10 px-5 py-12 md:grid-cols-2 lg:gap-16 lg:px-10 lg:py-20"
      >
        <Revelar>
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-rose-deep">
            Nos encontramos no Mega
          </p>
          <h1 className="mt-5 font-display text-5xl leading-tight tracking-tight lg:text-6xl">
            Confirmar minha <em className="font-normal text-rose">presença.</em>
          </h1>
          <p className="mt-6 leading-8 text-muted">
            {EVENTO.segmentos.join(", ")}. {MODO_DEMO
              ? `Registre sua intenção de comparecer ao ${EVENTO.nome}, sem conta ou senha.`
              : `Programe sua visita ao ${EVENTO.nome}.`}
          </p>
          <dl className="mt-8 space-y-5 border-y border-line py-7 text-sm">
            <div>
              <dt className="text-xs uppercase tracking-widest text-muted">Quando</dt>
              <dd className="mt-2">{EVENTO.datas.rotulo} · {EVENTO.horario}</dd>
            </div>
            <div>
              <dt className="text-xs uppercase tracking-widest text-muted">Onde</dt>
              <dd className="mt-2 leading-7">
                {EVENTO.local.nome}<br />
                {EVENTO.local.endereco}
              </dd>
            </div>
          </dl>
          <p className="mt-6 text-sm font-semibold leading-7">
            Esta confirmação é uma intenção de comparecer. Não é ingresso.
          </p>
          <a
            href={EVENTO.linktree}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-3 inline-flex min-h-11 items-center text-sm text-rose-deep underline underline-offset-4"
          >
            Consulte a organização sobre a entrada ↗
          </a>
        </Revelar>
        <Revelar atraso={0.1}>
          {MODO_DEMO ? <VisitorForm /> : <CanaisOficiais tipo="visitante" />}
        </Revelar>
      </main>
      <Footer />
    </>
  );
}
