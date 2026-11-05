import type { Metadata } from "next";
import { Suspense } from "react";
import MapaInterativo from "@/components/mapa/MapaInterativo";
import { ESTANDES } from "@/data/planta";
import { EVENTO } from "@/data/evento";
import Header from "@/components/site/Header";
import Footer from "@/components/site/Footer";
import MapaPublico from "@/components/mapa/MapaPublico";
import { RESUMO_PLANTA } from "@/data/resumo-planta";
import { PLANTA_DETALHADA } from "@/lib/ambiente";

export const metadata: Metadata = {
  title: PLANTA_DETALHADA ? "Mapa dos estandes" : "Espaços de exposição",
  description: PLANTA_DETALHADA
    ? "Explore a planta da Mega Fashion Outlet 2026 e manifeste interesse em um espaço de exposição."
    : "Formatos e quantidades de espaços da Mega Fashion Outlet 2026. Planta detalhada sob consulta à organização.",
};

type Params = Promise<Record<string, string | string[] | undefined>>;

/** Lê ?estande= dentro de um limite de Suspense (exigência do Next 16 para não bloquear o prerender). */
async function MapaComParametros({ searchParams }: { searchParams: Params }) {
  const { estande } = await searchParams;
  return <MapaInterativo estandeInicial={typeof estande === "string" ? estande : undefined} />;
}

export default function MapaPage({ searchParams }: { searchParams: Params }) {
  if (!PLANTA_DETALHADA) {
    return (
      <>
        <Header />
        <main id="conteudo" className="flex-1">
          <header className="mx-auto w-full max-w-7xl px-4 pb-10 pt-12 sm:px-6 lg:px-10 lg:pt-16">
            <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-rose-deep">Espaços da feira · {EVENTO.datas.rotulo}</p>
            <div className="mt-4 grid gap-6 lg:grid-cols-[1.2fr_1fr] lg:items-end">
              <h1 id="mapa-titulo" className="font-display text-[clamp(2.4rem,6vw,4.5rem)] leading-[0.95] tracking-tight">
                Encontre o <em className="text-rose">espaço</em> da sua marca
              </h1>
              <p className="max-w-md text-[15px] leading-relaxed text-muted">
                São {RESUMO_PLANTA.total} espaços no {EVENTO.local.nome}, conforme a planta oficial. A planta detalhada é
                apresentada pela organização a quem deseja expor.
              </p>
            </div>
          </header>
          <MapaPublico />
        </main>
        <Footer />
      </>
    );
  }

  const principais = ESTANDES.filter((e) => e.serie === "principal").length;
  const feirinha = ESTANDES.filter((e) => e.serie === "feirinha").length;

  return (
    <>
      <Header />
      <main id="conteudo" className="flex-1">
        <header className="mx-auto w-full max-w-7xl px-4 pb-8 pt-12 sm:px-6 lg:px-10 lg:pt-16">
          <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-rose-deep">Planta do evento · {EVENTO.datas.rotulo}</p>
          <div className="mt-4 grid gap-6 lg:grid-cols-[1.2fr_1fr] lg:items-end">
            <h1 id="mapa-titulo" className="font-display text-[clamp(2.4rem,6vw,4.5rem)] leading-[0.95] tracking-tight">
              Escolha o seu <em className="text-rose">espaço</em> na feira
            </h1>
            <p className="max-w-md text-[15px] leading-relaxed text-muted">
              Navegue pela planta oficial do {EVENTO.local.nome}. São {principais} estandes numerados e {feirinha} módulos de
              feirinha, com dimensões e localização conforme o projeto enviado pela organização.
            </p>
          </div>
        </header>
        <Suspense fallback={<MapaInterativo />}>
          <MapaComParametros searchParams={searchParams} />
        </Suspense>
      </main>
      <Footer />
    </>
  );
}
