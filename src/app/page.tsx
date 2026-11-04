import Image from "next/image";
import { ArrowUpRight, Images, Play } from "lucide-react";
import Header from "@/components/site/Header";
import Footer from "@/components/site/Footer";
import Hero from "@/components/site/Hero";
import Faq from "@/components/site/Faq";
import { Botao } from "@/components/ui/Botao";
import { Contador, Grupo, Item, Revelar } from "@/components/motion/Animacoes";
import Mapa3DCard from "@/components/mapa3d/Mapa3DCard";
import { AREAS_PLANTA, AVISO_PLANTA, EVENTO, HISTORICO_IMPRENSA, PUBLICACOES_OFICIAIS } from "@/data/evento";
import { ESTANDES } from "@/data/planta";

const wrap = "mx-auto max-w-7xl px-5 lg:px-10";
const eyebrow = "text-[11px] font-semibold uppercase tracking-[0.22em] text-rose-deep";
const titulo = "font-display text-[clamp(2.4rem,6vw,4.25rem)] leading-[0.98] tracking-[-0.015em]";

const principais = ESTANDES.filter((e) => e.serie === "principal").length;
const feirinha = ESTANDES.filter((e) => e.serie === "feirinha").length;

const BENEFICIOS = [
  {
    t: "Cinco dias de vitrine",
    d: "De 20 a 24 de novembro, das 10h às 22h, em um outlet que reúne moda, beleza, artesanato e serviços no mesmo espaço.",
  },
  {
    t: "Espaço do tamanho da sua marca",
    d: "A planta prevê estandes de 2 × 2 m a 9 × 6 m e módulos de feirinha. Escolha no mapa e indique seu interesse.",
  },
  {
    t: "Conversa direta com a organização",
    d: "Valores, disponibilidade e condições são tratados diretamente com a organização, pelos canais oficiais.",
  },
];

export default function Home() {
  return (
    <>
      <Header />
      <main id="conteudo">
        <Hero />

        {/* 01 — O EVENTO ------------------------------------------------------- */}
        <section id="evento" className={`${wrap} scroll-mt-24 py-24 lg:py-32`}>
          <div className="grid gap-12 lg:grid-cols-12">
            <Revelar className="lg:col-span-5">
              <p className={eyebrow}>01 · O evento</p>
              <h2 className={`${titulo} mt-5`}>
                Marcas, encontros.
                <br />
                <em className="font-normal text-rose">Novas possibilidades.</em>
              </h2>
            </Revelar>
            <div className="space-y-6 text-[17px] leading-8 text-muted lg:col-span-6 lg:col-start-7">
              <Revelar>
                <p>
                  O <span className="text-ink">{EVENTO.nome}</span> reúne {EVENTO.segmentos.join(", ").toLowerCase()} no{" "}
                  {EVENTO.local.nome}, em {EVENTO.local.cidade}. São cinco dias, das {EVENTO.horario}, para apresentar sua marca
                  a um público que vem para comprar.
                </p>
              </Revelar>
              <Revelar atraso={0.1}>
                <p>Para quem expõe, uma oportunidade de mostrar produtos, conversar com visitantes e criar conexões com outras marcas.</p>
              </Revelar>
            </div>
          </div>

          <Grupo as="ul" className="mt-16 grid gap-px overflow-hidden rounded-3xl border border-line bg-line md:grid-cols-3">
            {BENEFICIOS.map((b, i) => (
              <Item as="li" key={b.t} className="group bg-paper p-8 transition-colors duration-500 hover:bg-ivory lg:p-10">
                <span className="font-display text-sm italic text-rose">{String(i + 1).padStart(2, "0")}</span>
                <h3 className="mt-8 font-display text-[1.7rem] leading-tight tracking-tight">{b.t}</h3>
                <p className="mt-4 text-[15px] leading-7 text-muted">{b.d}</p>
              </Item>
            ))}
          </Grupo>

          {/* Histórico */}
          <div className="mt-20 grid gap-10 lg:grid-cols-12">
            <Revelar className="lg:col-span-4">
              <p className={eyebrow}>Trajetória</p>
              <p className="mt-5 font-display text-[clamp(4rem,10vw,7rem)] leading-none tracking-tight text-ink">
                <Contador valor={EVENTO.edicoesAnteriores.length} />
              </p>
              <p className="mt-3 max-w-xs text-sm leading-6 text-muted">
                edições anteriores registradas nos destaques oficiais do Instagram, de {EVENTO.edicoesAnteriores[0]} a{" "}
                {EVENTO.edicoesAnteriores.at(-1)}.
              </p>
            </Revelar>
            <Grupo className="space-y-5 lg:col-span-7 lg:col-start-6">
              {HISTORICO_IMPRENSA.map((h) => (
                <Item key={h.fonte}>
                  <blockquote className="border-l-2 border-rose py-1 pl-6">
                    <p className="font-display text-2xl leading-snug tracking-tight text-ink">{h.texto}</p>
                    <cite className="mt-3 block text-xs not-italic uppercase tracking-[0.16em] text-muted">{h.fonte}</cite>
                  </blockquote>
                </Item>
              ))}
              <Item>
                <ul className="flex flex-wrap gap-2 pt-3" aria-label="Edições nos destaques oficiais">
                  {EVENTO.edicoesAnteriores.map((e) => (
                    <li key={e} className="rounded-full border border-line px-3.5 py-1.5 text-xs tabular-nums text-muted">
                      {e}
                    </li>
                  ))}
                </ul>
              </Item>
            </Grupo>
          </div>
        </section>

        {/* 02 — ESTRUTURA ------------------------------------------------------ */}
        <section id="estrutura" className="scroll-mt-24 border-y border-line bg-paper py-24 lg:py-32">
          <div className={wrap}>
            <div className="flex flex-col justify-between gap-8 md:flex-row md:items-end">
              <Revelar>
                <p className={eyebrow}>02 · Estrutura da feira</p>
                <h2 className={`${titulo} mt-5`}>
                  Espaço para <em className="font-normal text-rose">acontecer.</em>
                </h2>
              </Revelar>
              <Revelar atraso={0.1}>
                <Botao href="/mapa" variante="secundario">
                  Explorar o mapa
                </Botao>
              </Revelar>
            </div>

            <Grupo as="ul" className="mt-14 grid gap-px overflow-hidden rounded-3xl border border-line bg-line sm:grid-cols-2 lg:grid-cols-4">
              {AREAS_PLANTA.map((a, i) => (
                <Item as="li" key={a.id} className="group relative bg-paper p-7 transition-colors duration-500 hover:bg-rose-soft/60">
                  <span className="text-xs tabular-nums text-rose-deep">{String(i + 1).padStart(2, "0")}</span>
                  <h3 className="mt-10 font-display text-2xl leading-tight tracking-tight">{a.nome}</h3>
                  <p className="mt-3 text-sm leading-6 text-muted">{a.detalhe}</p>
                  <span
                    aria-hidden
                    className="absolute inset-x-7 bottom-0 h-px origin-left scale-x-0 bg-rose transition-transform duration-700 ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:scale-x-100"
                  />
                </Item>
              ))}
            </Grupo>
            <p className="mt-6 max-w-4xl text-xs leading-6 text-muted">{AVISO_PLANTA}</p>
          </div>
        </section>

        {/* MAPA (chamada) ------------------------------------------------------- */}
        <section aria-labelledby="mapa-chamada" className="relative overflow-hidden bg-graphite text-ivory">
          <div className={`${wrap} grid items-center gap-12 py-24 lg:grid-cols-[minmax(0,0.85fr)_minmax(0,1.15fr)] lg:py-28`}>
            <div className="relative z-10">
              <Revelar>
                <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-rose-soft">Mapa interativo</p>
                <h2 id="mapa-chamada" className={`${titulo} mt-5`}>
                  Escolha o seu <em className="font-normal text-rose-soft">lugar</em> na feira.
                </h2>
                <p className="mt-6 max-w-md text-[17px] leading-8 text-ivory/70">
                  Navegue pela planta oficial, amplie, veja número, dimensões e localização de cada espaço — e indique o seu
                  preferido no cadastro.
                </p>
              </Revelar>
              <Grupo as="ul" className="mt-10 grid max-w-md grid-cols-2 gap-6 border-t border-ivory/15 pt-8">
                <Item as="li">
                  <p className="font-display text-5xl leading-none">
                    <Contador valor={principais} />
                  </p>
                  <p className="mt-2 text-xs text-ivory/60">estandes numerados</p>
                </Item>
                <Item as="li">
                  <p className="font-display text-5xl leading-none">
                    <Contador valor={feirinha} />
                  </p>
                  <p className="mt-2 text-xs text-ivory/60">módulos de feirinha mapeados</p>
                </Item>
              </Grupo>
              <Revelar atraso={0.2} className="mt-10">
                <Botao href="/mapa" variante="claro">
                  Abrir o mapa dos estandes
                </Botao>
              </Revelar>
            </div>
            <Revelar atraso={0.1} className="relative">
              <Mapa3DCard />
            </Revelar>
          </div>
        </section>

        {/* 03 — GALERIA --------------------------------------------------------- */}
        <section id="galeria" className={`${wrap} scroll-mt-24 py-24 lg:py-32`}>
          <div className="flex flex-col justify-between gap-6 md:flex-row md:items-end">
            <Revelar>
              <p className={eyebrow}>03 · Galeria</p>
              <h2 className={`${titulo} mt-5`}>
                Cada edição, <em className="font-normal text-rose">uma história.</em>
              </h2>
            </Revelar>
            <Revelar atraso={0.1} className="max-w-sm text-sm leading-6 text-muted">
              Fotos e vídeos serão publicados aqui após autorização da organização. Enquanto isso, acompanhe as publicações oficiais.
            </Revelar>
          </div>

          <Grupo as="ul" className="mt-14 grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-3">
            {PUBLICACOES_OFICIAIS.map((p, i) => (
              <Item as="li" key={p.url} className={i === 0 ? "col-span-2 row-span-2 lg:col-span-1" : ""}>
                <a
                  href={p.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={`group relative flex h-full flex-col justify-between overflow-hidden rounded-3xl border border-line p-5 transition-colors duration-500 sm:p-6 ${
                    i % 3 === 0 ? "bg-rose-soft" : i % 3 === 1 ? "bg-sand" : "bg-paper"
                  } ${i === 0 ? "min-h-[22rem] sm:min-h-[28rem]" : "min-h-48 sm:min-h-56"}`}
                >
                  <Image
                    src="/brand/logo-mega-fashion.png"
                    alt=""
                    width={1525}
                    height={636}
                    sizes="200px"
                    className="pointer-events-none absolute -right-6 bottom-6 w-[70%] opacity-[0.07] transition-transform duration-700 ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:-translate-x-2 group-hover:scale-105 motion-reduce:transition-none"
                  />
                  <span className="flex flex-wrap items-center justify-between gap-x-3 gap-y-1 text-[11px] font-semibold uppercase tracking-[0.16em] text-ink/70">
                    <span className="inline-flex items-center gap-2">
                      {p.tipo === "Reel" ? <Play aria-hidden className="size-3.5" /> : <Images aria-hidden className="size-3.5" />} {p.tipo}
                    </span>
                    <span className="tabular-nums">{p.data}</span>
                  </span>
                  <span className="relative">
                    <span className="block text-xs text-muted">Aguardando mídia oficial autorizada</span>
                    <span className="mt-2 inline-flex items-center gap-1.5 text-sm font-semibold text-ink">
                      Ver no Instagram
                      <ArrowUpRight
                        aria-hidden
                        className="size-4 transition-transform duration-500 group-hover:-translate-y-0.5 group-hover:translate-x-0.5"
                      />
                    </span>
                    <span className="sr-only"> — publicação oficial de {p.data} (abre em nova aba)</span>
                  </span>
                </a>
              </Item>
            ))}
          </Grupo>
        </section>

        {/* 04 — LOCALIZAÇÃO ----------------------------------------------------- */}
        <section id="localizacao" className="scroll-mt-24 border-t border-line bg-sand/60 py-24 lg:py-32">
          <div className={`${wrap} grid gap-12 lg:grid-cols-12 lg:items-center`}>
            <Revelar className="lg:col-span-5">
              <p className={eyebrow}>04 · Localização</p>
              <h2 className={`${titulo} mt-5`}>
                Nos encontramos <em className="font-normal text-rose">em Olinda.</em>
              </h2>
              <dl className="mt-10 grid grid-cols-2 gap-x-6 gap-y-6 border-t border-line pt-8 text-[15px]">
                <div className="col-span-2">
                  <dt className="text-[11px] font-semibold uppercase tracking-[0.18em] text-muted">Local</dt>
                  <dd className="mt-1.5 text-lg text-ink">{EVENTO.local.nome}</dd>
                  <dd className="mt-1 text-muted">{EVENTO.local.endereco}</dd>
                </div>
                <div>
                  <dt className="text-[11px] font-semibold uppercase tracking-[0.18em] text-muted">Datas</dt>
                  <dd className="mt-1.5 text-ink">{EVENTO.datas.rotulo}</dd>
                </div>
                <div>
                  <dt className="text-[11px] font-semibold uppercase tracking-[0.18em] text-muted">Horário</dt>
                  <dd className="mt-1.5 text-ink">{EVENTO.horario}</dd>
                </div>
              </dl>
              <div className="mt-10">
                <Botao href={EVENTO.local.mapsUrl} externo icone="diagonal">
                  Como chegar
                </Botao>
              </div>
            </Revelar>
            <Revelar atraso={0.15} className="lg:col-span-7">
              <div className="overflow-hidden rounded-[28px] border border-line bg-paper p-2">
                <iframe
                  src={EVENTO.local.mapsEmbed}
                  title={`Mapa de localização: ${EVENTO.local.nome}`}
                  loading="lazy"
                  referrerPolicy="no-referrer-when-downgrade"
                  className="block aspect-[4/3] w-full rounded-[22px] border-0 bg-sand"
                />
              </div>
            </Revelar>
          </div>
        </section>

        {/* 05 — FAQ ------------------------------------------------------------- */}
        <section id="faq" className={`${wrap} scroll-mt-24 py-24 lg:py-32`}>
          <div className="grid gap-12 lg:grid-cols-12">
            <Revelar className="lg:col-span-4">
              <p className={eyebrow}>05 · Perguntas frequentes</p>
              <h2 className={`${titulo} mt-5`}>
                Vamos tirar <em className="font-normal text-rose">suas dúvidas.</em>
              </h2>
              <p className="mt-6 max-w-xs text-sm leading-6 text-muted">
                Não encontrou sua resposta? Fale com a organização pelos canais oficiais.
              </p>
            </Revelar>
            <div className="lg:col-span-7 lg:col-start-6">
              <Faq />
            </div>
          </div>
        </section>

        {/* CTA final ------------------------------------------------------------ */}
        <section className="px-3 pb-3 sm:px-5 sm:pb-5">
          <div className="relative overflow-hidden rounded-[32px] bg-rose px-6 py-20 text-center text-white sm:py-28">
            <Revelar>
              <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-white/80">Faça parte desta edição</p>
              <h2 className="mx-auto mt-5 max-w-3xl font-display text-[clamp(2.6rem,7vw,5.25rem)] leading-[0.95] tracking-[-0.02em]">
                Sua marca no <em className="font-normal">maior outlet</em> de PE.
              </h2>
              <p className="mx-auto mt-6 max-w-lg text-[17px] leading-8 text-white/85">
                Escolha o espaço no mapa e fale com a organização pelos canais oficiais para confirmar a participação.
              </p>
              <div className="mt-10 flex flex-col items-center justify-center gap-3 sm:flex-row">
                <Botao href="/expositor" variante="claro">
                  Quero ser expositor
                </Botao>
                <Botao href="/mapa" variante="secundario" className="border-white/40 text-white hover:border-ivory">
                  Ver o mapa
                </Botao>
              </div>
            </Revelar>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
