import type { Metadata } from "next";
import { Suspense } from "react";
import Header from "@/components/site/Header";
import Footer from "@/components/site/Footer";
import { ExhibitorForm } from "@/components/forms/RegistrationForm";
import { Grupo, Item, Revelar } from "@/components/motion/Animacoes";
import { EVENTO } from "@/data/evento";
import { MODO_DEMO } from "@/lib/ambiente";
import CanaisOficiais from "@/components/site/CanaisOficiais";

export const metadata: Metadata = {
  title: "Seja um expositor",
  description: "Envie seu interesse em expor no Mega Fashion Outlet, de 20 a 24 de novembro de 2026, no Centro de Convenções de Pernambuco.",
};

type Params = Promise<Record<string, string | string[] | undefined>>;

async function CanaisComEstande({ searchParams }: { searchParams: Params }) {
  const { estande } = await searchParams;
  return <CanaisOficiais tipo="expositor" estandeId={typeof estande === "string" ? estande : undefined} />;
}

const ETAPAS = [
  {
    titulo: MODO_DEMO ? "Envie seu interesse" : "Fale com a organização",
    texto: MODO_DEMO ? "Conte sobre sua marca e o espaço que procura." : "Pelo WhatsApp oficial, conte sobre sua marca e o espaço que procura.",
  },
  {
    titulo: "A organização entra em contato",
    texto: "Converse sobre disponibilidade e condições de participação.",
  },
  {
    titulo: "Negociação e confirmação",
    texto: "A negociação e a confirmação são feitas exclusivamente pela organização.",
  },
];

function EtapasParticipacao() {
  return (
    <Grupo className="mt-9">
      <ol className="divide-y divide-line border-y border-line">
        {ETAPAS.map((etapa, index) => (
          <Item key={etapa.titulo} as="li" className="flex gap-5 py-6">
            <span className="font-display text-3xl text-rose" aria-hidden="true">
              0{index + 1}
            </span>
            <div>
              <h2 className="text-sm font-semibold">{etapa.titulo}</h2>
              <p className="mt-2 text-sm leading-6 text-muted">{etapa.texto}</p>
            </div>
          </Item>
        ))}
      </ol>
    </Grupo>
  );
}

export default function ExpositorPage({ searchParams }: { searchParams: Params }) {
  return (
    <>
      <Header />
      <main
        id="conteudo"
        className="mx-auto grid w-full max-w-7xl gap-10 px-5 py-12 md:grid-cols-12 lg:gap-16 lg:px-10 lg:py-20"
      >
        <Revelar className="md:col-span-5">
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-rose-deep">
            Sua marca · {EVENTO.edicao}
          </p>
          <h1 className="mt-5 font-display text-5xl leading-tight tracking-tight lg:text-7xl">
            Seja um<br />
            <em className="font-normal text-rose">expositor.</em>
          </h1>
          <p className="mt-6 text-base leading-8 text-muted">
            Apresente sua marca no {EVENTO.nome}. Envie seu interesse e conheça
            as possibilidades de participação com a organização.
          </p>
          <EtapasParticipacao />
          {MODO_DEMO && (
            <p className="mt-6 text-xs leading-6 text-muted">
              Na demonstração, o formulário não envia dados à organização.
              Ao concluir, use o atalho para o WhatsApp oficial.
            </p>
          )}
        </Revelar>
        <Revelar className="md:col-span-7" atraso={0.1}>
          {MODO_DEMO ? (
            <Suspense fallback={
              <p role="status" className="p-8">Carregando formulário de interesse…</p>
            }>
              <ExhibitorForm />
            </Suspense>
          ) : (
            <Suspense fallback={<CanaisOficiais tipo="expositor" />}>
              <CanaisComEstande searchParams={searchParams} />
            </Suspense>
          )}
        </Revelar>
      </main>
      <Footer />
    </>
  );
}
