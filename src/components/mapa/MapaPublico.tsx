import { ArrowUpRight } from "lucide-react";
import Link from "next/link";
import { RESUMO_PLANTA } from "@/data/resumo-planta";
import { EVENTO } from "@/data/evento";

/**
 * Apresentação pública dos espaços da feira, usada enquanto a planta detalhada não tem
 * divulgação autorizada (ver PLANTA_DETALHADA em src/lib/ambiente.ts).
 * Mostra apenas totais e faixas — sem desenho, posições ou numeração dos estandes.
 */
export default function MapaPublico() {
  const r = RESUMO_PLANTA;
  const maiorAla = Math.max(...r.alas.map((a) => a.estandes));

  return (
    <section aria-labelledby="espacos-titulo" className="mx-auto w-full max-w-7xl px-4 pb-20 sm:px-6 lg:px-10">
      <h2 id="espacos-titulo" className="sr-only">Espaços de exposição</h2>

      <dl className="grid grid-cols-2 border-y border-line lg:grid-cols-4">
        {[
          { v: r.total, r: "espaços na planta" },
          { v: r.estandes, r: "estandes numerados" },
          { v: r.alimentacao, r: "módulos de alimentação" },
          { v: r.feirinha, r: "módulos de feirinha" },
        ].map((item, i) => (
          <div
            key={item.r}
            className={`py-6 pr-4 sm:py-8 ${i % 2 === 1 ? "border-l border-line pl-4 sm:pl-6" : ""} ${i >= 2 ? "border-t border-line lg:border-t-0" : ""} ${i === 2 ? "lg:border-l lg:pl-6" : ""}`}
          >
            <dt className="text-[11px] font-semibold uppercase tracking-[0.18em] text-muted">{item.r}</dt>
            <dd className="mt-2 font-display text-4xl tabular-nums tracking-tight text-graphite sm:text-5xl">{item.v}</dd>
          </div>
        ))}
      </dl>

      <div className="mt-12 grid gap-10 lg:grid-cols-12 lg:gap-12">
        <div className="lg:col-span-7">
          <h3 className="font-display text-2xl tracking-tight sm:text-3xl">Formatos de estande</h3>
          <p className="mt-3 max-w-xl text-[15px] leading-relaxed text-muted">
            A planta prevê {r.formatos} formatos, de {r.menor} ({r.areaMinimaM2} m²) a {r.maior} ({r.areaMaximaM2} m²). Os mais
            frequentes:
          </p>
          <ul className="mt-6 grid gap-3 sm:grid-cols-2">
            {r.formatosFrequentes.map((f) => (
              <li key={f.dimensao} className="flex items-baseline justify-between rounded-2xl border border-line bg-paper px-5 py-4">
                <span className="font-display text-xl tracking-tight">{f.dimensao}</span>
                <span className="text-sm tabular-nums text-muted">{f.quantidade} estandes</span>
              </li>
            ))}
            {r.modulos.map((m) => (
              <li key={m.nome} className="flex items-baseline justify-between gap-4 rounded-2xl border border-line bg-paper px-5 py-4">
                <span>
                  <span className="block font-display text-xl tracking-tight">{m.dimensao}</span>
                  <span className="text-xs text-muted">{m.nome}</span>
                </span>
                <span className="text-sm tabular-nums text-muted">{m.quantidade} módulos</span>
              </li>
            ))}
          </ul>

          <h3 className="mt-12 font-display text-2xl tracking-tight sm:text-3xl">Distribuição por ala</h3>
          <ul className="mt-6 space-y-4">
            {r.alas.map((a) => (
              <li key={a.nome}>
                <div className="flex items-baseline justify-between text-sm">
                  <span className="font-medium text-ink">{a.nome}</span>
                  <span className="tabular-nums text-muted">{a.estandes} estandes</span>
                </div>
                <div aria-hidden="true" className="mt-2 h-1.5 rounded-full bg-sand">
                  <div className="h-full rounded-full bg-graphite" style={{ width: `${(a.estandes / maiorAla) * 100}%` }} />
                </div>
              </li>
            ))}
          </ul>
        </div>

        <aside className="lg:col-span-5">
          <div className="rounded-2xl border border-line bg-paper p-6 sm:p-8">
            <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-rose-deep">Planta detalhada</p>
            <p className="mt-3 font-display text-2xl leading-snug tracking-tight">
              Numeração, localização e disponibilidade são informadas pela organização.
            </p>
            <p className="mt-3 text-sm leading-relaxed text-muted">
              Fale com a equipe do {EVENTO.nome} para receber a planta e conhecer os espaços livres. Envio de interesse não
              garante reserva.
            </p>
            <Link
              href="/expositor"
              className="group mt-6 inline-flex min-h-12 items-center gap-2 rounded-full bg-rose px-6 text-sm font-semibold text-white transition-colors hover:bg-rose-deep focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-rose"
            >
              Quero expor
              <ArrowUpRight aria-hidden="true" className="size-4 transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
            </Link>
          </div>

          <div className="mt-8">
            <h3 className="text-[11px] font-semibold uppercase tracking-[0.18em] text-muted">Estruturas do evento</h3>
            <ul className="mt-3 divide-y divide-line border-y border-line">
              {r.estruturas.map((e) => (
                <li key={e.nome} className="flex items-baseline justify-between gap-4 py-3 text-sm">
                  <span className="text-ink">{e.nome}</span>
                  <span className="tabular-nums text-muted">{e.dimensao}</span>
                </li>
              ))}
            </ul>
            <p className="mt-4 text-xs leading-relaxed text-muted">
              Acessos: {r.acessos.join(" · ")}. Planta sujeita a alterações pela organização.
            </p>
          </div>
        </aside>
      </div>
    </section>
  );
}
