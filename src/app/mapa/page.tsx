import type { Metadata } from "next";
import { Suspense } from "react";
import ExploradorMapa from "@/components/mapa/ExploradorMapa";
import { ESTANDES } from "@/data/planta";
import { EVENTO } from "@/data/evento";
import Header from "@/components/site/Header";
import Footer from "@/components/site/Footer";
import { AVISO_ILUSTRATIVO, PLANTA_ILUSTRATIVA } from "@/lib/ambiente";

export const metadata: Metadata = {
  title: "Mapa dos estandes",
  description: PLANTA_ILUSTRATIVA
    ? "Demonstração ilustrativa em 2D e 3D da estrutura de exposição do Mega Fashion Outlet 2026. Planta oficial sob consulta à organização."
    : "Explore a planta da Mega Fashion Outlet 2026 e manifeste interesse em um espaço de exposição.",
};

type Params = Promise<Record<string, string | string[] | undefined>>;

/** Lê ?estande= dentro de um limite de Suspense (exigência do Next 16 para não bloquear o prerender). */
async function ExploradorComParametros({ searchParams }: { searchParams: Params }) {
  const { estande, vista } = await searchParams;
  return <ExploradorMapa vistaInicial={vista === "2d" ? "2d" : undefined} estandeInicial={typeof estande === "string" ? estande : undefined} />;
}

const principais = ESTANDES.filter((e) => e.serie === "principal").length;
const feirinha = ESTANDES.filter((e) => e.serie === "feirinha").length;

export default function MapaPage({ searchParams }: { searchParams: Params }) {
  return (
    <>
      <Header />
      <main id="conteudo" className="flex-1">
        <header className="mx-auto w-full max-w-7xl px-4 pb-8 pt-12 sm:px-6 lg:px-10 lg:pt-16">
          <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-rose-deep">
            {PLANTA_ILUSTRATIVA ? "Mapa interativo · demonstração" : "Planta do evento"} · {EVENTO.datas.rotulo}
          </p>
          <div className="mt-4 grid gap-6 lg:grid-cols-[1.2fr_1fr] lg:items-end">
            <h1 id="mapa-titulo" className="font-display text-[clamp(2.4rem,6vw,4.5rem)] leading-[0.95] tracking-tight">
              Escolha o seu <em className="text-rose">espaço</em> na feira
            </h1>
            <p className="max-w-md text-[15px] leading-relaxed text-muted">
              {PLANTA_ILUSTRATIVA
                ? `Explore em 3D ou 2D como a estrutura do ${EVENTO.local.nome} se organiza em setores, com ${principais} espaços de exposição e ${feirinha} módulos de feirinha.`
                : `Navegue pela planta oficial do ${EVENTO.local.nome}. São ${principais} estandes numerados e ${feirinha} módulos de feirinha, com dimensões e localização conforme o projeto enviado pela organização.`}
            </p>
          </div>
          {PLANTA_ILUSTRATIVA && (
            <p role="note" className="mt-6 max-w-3xl rounded-2xl border border-rose/30 bg-rose-soft/50 px-4 py-3 text-xs font-medium leading-6 text-rose-deep">
              {AVISO_ILUSTRATIVO}
            </p>
          )}
        </header>
        <Suspense fallback={<ExploradorMapa />}>
          <ExploradorComParametros searchParams={searchParams} />
        </Suspense>
      </main>
      <Footer />
    </>
  );
}
