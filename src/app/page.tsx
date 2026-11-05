import Image from "next/image";
import { ArrowUpRight, Images, Play } from "lucide-react";
import Header from "@/components/site/Header";
import Footer from "@/components/site/Footer";
import Hero from "@/components/site/Hero";
import Faq from "@/components/site/Faq";
import Contagem from "@/components/site/Contagem";
import { Botao } from "@/components/ui/Botao";
import { Contador, Grupo, Item, Revelar } from "@/components/motion/Animacoes";
import Mapa3DCard from "@/components/mapa3d/Mapa3DCard";
import {
  AREAS_PLANTA,
  AVISO_PLANTA,
  DESTAQUES_EDICAO,
  EVENTO,
  HISTORICO_IMPRENSA,
  PUBLICACOES_OFICIAIS,
  whatsappLink,
} from "@/data/evento";
import { RESUMO_PLANTA } from "@/data/resumo-planta";
import { PLANTA_DETALHADA, PLANTA_ILUSTRATIVA } from "@/lib/ambiente";

const wrap = "mx-auto max-w-7xl px-5 lg:px-10";
const eyebrow = "text-[11px] font-semibold uppercase tracking-[0.22em] text-rose-deep";
const titulo = "font-display text-[clamp(2.3rem,6vw,4.25rem)] leading-[0.98] tracking-[-0.015em]";

const BENEFICIOS_LOJISTA = [
  {
    t: "Cinco dias de vitrine",
    d: "De 20 a 24 de novembro, das 10h às 22h: doze horas por dia diante de um público que vem para comprar.",
  },
  {
    t: "Um público que já conhece o Mega",
    d: `Nove edições desde 2022 e uma comunidade de ${EVENTO.instagram.seguidores} seguidores no Instagram oficial.`,
  },
  {
    t: "Espaço do tamanho da sua marca",
    d: `Estandes de ${RESUMO_PLANTA.menor} a ${RESUMO_PLANTA.maior}, em ${RESUMO_PLANTA.formatos} formatos, além de módulos de feirinha e de alimentação.`,
  },
  {
    t: "Atrações que trazem gente",
    d: "Shows, baile anos 80, desfile pet, pagode e Espaço Kids mantêm o fluxo de visitantes ao longo do dia.",
  },
];

const MODALIDADES = [
  {
    t: "Estandes compactos",
    faixa: "2 × 2 m a 3 × 2 m",
    d: "Para marcas que querem presença objetiva e boa circulação de clientes.",
    q: RESUMO_PLANTA.formatosFrequentes.filter((f) => ["2 × 2 m", "3 × 2 m"].includes(f.dimensao)).reduce((s, f) => s + f.quantidade, 0),
  },
  {
    t: "Estandes médios",
    faixa: "3 × 3 m a 4 × 4 m",
    d: "Espaço para vitrine, provador ou atendimento com mais conforto.",
    q: RESUMO_PLANTA.formatosFrequentes.filter((f) => ["3 × 3 m", "4 × 4 m"].includes(f.dimensao)).reduce((s, f) => s + f.quantidade, 0),
  },
  {
    t: "Estandes amplos",
    faixa: `até ${RESUMO_PLANTA.maior}`,
    d: "Para operações maiores, lançamentos e experiências de marca.",
    q: null,
  },
  {
    t: "Feirinha e alimentação",
    faixa: "módulos 1,5 × 1 m e 3 × 4 m",
    d: "Para artesanato, pequenos negócios e operações de alimentação.",
    q: RESUMO_PLANTA.feirinha + RESUMO_PLANTA.alimentacao,
  },
];

export default function Home() {
  return (
    <>
      <Header />
      <main id="conteudo">
        <Hero />

        {/* CONTAGEM ------------------------------------------------------------ */}
        <section aria-labelledby="contagem-titulo" className="bg-graphite text-ivory">
          <div className={`${wrap} grid items-center gap-6 py-10 md:grid-cols-[minmax(0,0.8fr)_minmax(0,1.2fr)] md:gap-12 md:py-12`}>
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-rose-soft">Contagem regressiva</p>
              <h2 id="contagem-titulo" className="mt-3 font-display text-[clamp(1.8rem,4vw,2.6rem)] leading-tight tracking-tight">
                Faltam poucos dias para o <em className="font-normal text-rose-soft">Mega.</em>
              </h2>
              <p className="mt-2 text-sm text-ivory/60">
                {EVENTO.datas.rotulo} · {EVENTO.horario}
              </p>
            </div>
            <Contagem tom="escuro" />
          </div>
        </section>

        {/* 01 — O EVENTO ------------------------------------------------------- */}
        <section id="evento" className={`${wrap} scroll-mt-24 py-20 lg:py-28`}>
          <div className="grid gap-10 lg:grid-cols-12 lg:gap-12">
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
                  {EVENTO.local.nome}, em {EVENTO.local.cidade}. São cinco dias, das {EVENTO.horario}, de compras, encontros e
                  programação gratuita para toda a família.
                </p>
              </Revelar>
              <Revelar atraso={0.1}>
                <p>
                  Para quem expõe, é a oportunidade de apresentar produtos a um público que vem para comprar e de criar conexões
                  com outras marcas de Pernambuco.
                </p>
              </Revelar>
            </div>
          </div>

          <div className="mt-16 grid gap-10 border-t border-line pt-12 lg:grid-cols-12">
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

        {/* 02 — DESTAQUES DA EDIÇÃO -------------------------------------------- */}
        <section id="destaques" className="scroll-mt-24 border-y border-line bg-paper py-20 lg:py-28">
          <div className={wrap}>
            <div className="grid gap-10 lg:grid-cols-12 lg:items-end">
              <Revelar className="lg:col-span-7">
                <p className={eyebrow}>02 · Destaques da edição</p>
                <h2 className={`${titulo} mt-5`}>
                  Novembro de 2026, <em className="font-normal text-rose">em grande escala.</em>
                </h2>
              </Revelar>
              <Revelar atraso={0.1} className="lg:col-span-4 lg:col-start-9">
                <p className="text-sm leading-6 text-muted">
                  “Mais de 300 lojas” é o número anunciado na comunicação do evento; não corresponde à quantidade de estandes da
                  planta.
                </p>
              </Revelar>
            </div>
            <Grupo as="dl" className="mt-12 grid grid-cols-2 border-y border-line lg:grid-cols-4">
              {[
                { v: DESTAQUES_EDICAO.lojas.valor, p: "+", s: "", r: DESTAQUES_EDICAO.lojas.rotulo },
                { v: 5, p: "", s: "", r: "dias de evento, 20 a 24/11" },
                { v: 12, p: "", s: "h", r: "por dia, das 10h às 22h" },
                { v: DESTAQUES_EDICAO.atracoes.length, p: "", s: "", r: "experiências na programação" },
              ].map((x, i) => (
                <Item
                  key={x.r}
                  className={`flex flex-col-reverse py-7 pr-4 sm:py-9 ${i % 2 === 1 ? "border-l border-line pl-4 sm:pl-6" : ""} ${i >= 2 ? "border-t border-line lg:border-t-0" : ""} ${i === 2 ? "lg:border-l lg:pl-6" : ""}`}
                >
                  <dt className="mt-2 text-xs leading-snug text-muted">{x.r}</dt>
                  <dd className="font-display text-[clamp(2.6rem,7vw,4.5rem)] leading-none tracking-tight text-ink">
                    {x.p}
                    <Contador valor={x.v} sufixo={x.s} />
                  </dd>
                </Item>
              ))}
            </Grupo>
          </div>
        </section>

        {/* 03 — LOJISTAS ------------------------------------------------------- */}
        <section id="lojistas" className={`${wrap} scroll-mt-24 py-20 lg:py-28`}>
          <div className="flex flex-col justify-between gap-8 md:flex-row md:items-end">
            <Revelar>
              <p className={eyebrow}>03 · Para lojistas e expositores</p>
              <h2 className={`${titulo} mt-5 max-w-3xl`}>
                Sua marca diante de quem <em className="font-normal text-rose">vem para comprar.</em>
              </h2>
            </Revelar>
            <Revelar atraso={0.1} className="flex flex-col gap-3 sm:flex-row">
              <Botao href="/expositor">Quero ser expositor</Botao>
              <Botao href={whatsappLink(EVENTO.whatsappExpositores[0])} externo icone="diagonal" variante="secundario">
                WhatsApp oficial
              </Botao>
            </Revelar>
          </div>
          <Grupo as="ul" className="mt-14 grid gap-px overflow-hidden rounded-3xl border border-line bg-line sm:grid-cols-2 lg:grid-cols-4">
            {BENEFICIOS_LOJISTA.map((b, i) => (
              <Item as="li" key={b.t} className="group relative bg-paper p-7 transition-colors duration-500 hover:bg-ivory lg:p-8">
                <span className="font-display text-sm italic text-rose">{String(i + 1).padStart(2, "0")}</span>
                <h3 className="mt-8 font-display text-[1.6rem] leading-tight tracking-tight">{b.t}</h3>
                <p className="mt-4 text-[15px] leading-7 text-muted">{b.d}</p>
                <span
                  aria-hidden
                  className="absolute inset-x-7 bottom-0 h-px origin-left scale-x-0 bg-rose transition-transform duration-700 ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:scale-x-100"
                />
              </Item>
            ))}
          </Grupo>
          <Revelar>
            <ol className="mt-12 grid gap-6 border-t border-line pt-8 text-sm md:grid-cols-3">
              {[
                ["Envie seu interesse", "Conte sobre sua marca e o formato de espaço que procura."],
                ["Fale com a organização", "Valores, disponibilidade e condições são tratados diretamente com a equipe do evento."],
                ["Confirme sua participação", "A reserva e a confirmação do espaço são feitas exclusivamente pela organização."],
              ].map(([t, d], i) => (
                <li key={t} className="flex gap-4">
                  <span aria-hidden className="font-display text-3xl leading-none text-rose">0{i + 1}</span>
                  <span>
                    <span className="block font-semibold text-ink">{t}</span>
                    <span className="mt-1 block leading-6 text-muted">{d}</span>
                  </span>
                </li>
              ))}
            </ol>
          </Revelar>
        </section>

        {/* 04 — ESTRUTURA E MODALIDADES ---------------------------------------- */}
        <section id="estrutura" className="scroll-mt-24 border-y border-line bg-sand/50 py-20 lg:py-28">
          <div className={wrap}>
            <Revelar>
              <p className={eyebrow}>04 · Estrutura e modalidades</p>
              <h2 className={`${titulo} mt-5`}>
                Espaço para <em className="font-normal text-rose">acontecer.</em>
              </h2>
              <p className="mt-6 max-w-2xl text-[17px] leading-8 text-muted">
                A planta do evento prevê {RESUMO_PLANTA.total} espaços: {RESUMO_PLANTA.estandes} estandes numerados,{" "}
                {RESUMO_PLANTA.alimentacao} módulos de alimentação e {RESUMO_PLANTA.feirinha} módulos de feirinha, além das
                estruturas de apoio e lazer.
              </p>
            </Revelar>
            <Grupo as="ul" className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {MODALIDADES.map((m) => (
                <Item as="li" key={m.t} className="flex flex-col rounded-2xl border border-line bg-paper p-6 transition-[border-color,transform] duration-500 hover:-translate-y-0.5 hover:border-rose/40 motion-reduce:hover:translate-y-0">
                  <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-muted">{m.faixa}</p>
                  <h3 className="mt-6 font-display text-2xl leading-tight tracking-tight">{m.t}</h3>
                  <p className="mt-3 flex-1 text-sm leading-6 text-muted">{m.d}</p>
                  {m.q !== null && <p className="mt-5 border-t border-line pt-4 text-xs tabular-nums text-ink">{m.q} espaços na planta</p>}
                </Item>
              ))}
            </Grupo>
            <div className="mt-14 grid gap-10 lg:grid-cols-12">
              <Revelar className="lg:col-span-4">
                <h3 className="font-display text-2xl tracking-tight">Estruturas do evento</h3>
                <p className="mt-3 text-sm leading-6 text-muted">Conforme a planta do evento, sujeita a alterações pela organização.</p>
              </Revelar>
              <Grupo as="ul" className="divide-y divide-line border-y border-line lg:col-span-8">
                {(PLANTA_DETALHADA ? AREAS_PLANTA.slice(1).map((a) => ({ nome: a.nome, dimensao: a.detalhe })) : RESUMO_PLANTA.estruturas).map((e) => (
                  <Item as="li" key={e.nome} className="flex flex-col gap-1 py-4 text-sm sm:flex-row sm:items-baseline sm:justify-between sm:gap-6">
                    <span className="font-medium text-ink">{e.nome}</span>
                    <span className="text-muted sm:text-right">{e.dimensao}</span>
                  </Item>
                ))}
              </Grupo>
            </div>
            <p className="mt-6 max-w-4xl text-xs leading-6 text-muted">{AVISO_PLANTA}</p>
          </div>
        </section>

        {/* 05 — MAPA 3D -------------------------------------------------------- */}
        <section id="mapa" aria-labelledby="mapa-chamada" className="scroll-mt-20 bg-graphite text-ivory">
          <div className={`${wrap} grid items-start gap-10 py-20 lg:grid-cols-[minmax(0,0.75fr)_minmax(0,1.25fr)] lg:gap-12 lg:py-28`}>
            <div className="lg:sticky lg:top-28">
              <Revelar>
                <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-rose-soft">05 · Mapa interativo 3D</p>
                <h2 id="mapa-chamada" className={`${titulo} mt-5`}>
                  Explore o <em className="font-normal text-rose-soft">pavilhão.</em>
                </h2>
                <p className="mt-6 max-w-md text-[17px] leading-8 text-ivory/70">
                  Gire, aproxime e navegue pelos setores. Toque em um espaço para ver formato, área e localização, e envie seu
                  interesse direto do mapa.
                </p>
                {PLANTA_ILUSTRATIVA && (
                  <p className="mt-5 max-w-md border-l-2 border-rose-soft pl-4 text-xs leading-6 text-ivory/70">
                    Demonstração ilustrativa, não oficial. A planta oficial do evento é apresentada pela organização a quem deseja
                    expor.
                  </p>
                )}
              </Revelar>
              <Grupo as="ul" className="mt-10 grid max-w-md grid-cols-2 gap-6 border-t border-ivory/15 pt-8">
                <Item as="li">
                  <p className="font-display text-5xl leading-none">
                    <Contador valor={RESUMO_PLANTA.estandes} />
                  </p>
                  <p className="mt-2 text-xs text-ivory/60">estandes numerados na planta</p>
                </Item>
                <Item as="li">
                  <p className="font-display text-5xl leading-none">
                    <Contador valor={RESUMO_PLANTA.feirinha} />
                  </p>
                  <p className="mt-2 text-xs text-ivory/60">módulos de feirinha</p>
                </Item>
              </Grupo>
              <Revelar atraso={0.2} className="mt-10">
                <Botao href="/mapa" variante="claro">
                  Abrir mapa completo
                </Botao>
              </Revelar>
            </div>
            <Revelar atraso={0.1} className="relative min-w-0">
              <Mapa3DCard />
            </Revelar>
          </div>
        </section>

        {/* 06 — ATRAÇÕES ------------------------------------------------------- */}
        <section id="atracoes" className={`${wrap} scroll-mt-24 py-20 lg:py-28`}>
          <div className="flex flex-col justify-between gap-6 md:flex-row md:items-end">
            <Revelar>
              <p className={eyebrow}>06 · Atrações e experiências</p>
              <h2 className={`${titulo} mt-5`}>
                Muito além das <em className="font-normal text-rose">compras.</em>
              </h2>
            </Revelar>
            <Revelar atraso={0.1} className="max-w-sm text-sm leading-6 text-muted">
              Programação, dias e horários de cada atração são divulgados pela organização nos canais oficiais.
            </Revelar>
          </div>
          <Grupo as="ul" className="mt-12 grid grid-cols-2 gap-px overflow-hidden rounded-3xl border border-line bg-line lg:grid-cols-4">
            {DESTAQUES_EDICAO.atracoes.map((a, i) => (
              <Item
                as="li"
                key={a.id}
                className={`group relative p-4 transition-colors duration-500 sm:p-7 ${i === 2 ? "bg-rose text-white" : "bg-paper hover:bg-rose-soft/50"}`}
              >
                <span className={`text-xs tabular-nums ${i === 2 ? "text-white/80" : "text-rose-deep"}`}>{String(i + 1).padStart(2, "0")}</span>
                <h3 className="mt-6 font-display text-[1.15rem] leading-tight tracking-tight sm:mt-10 sm:text-[1.55rem]">{a.titulo}</h3>
                <p className={`mt-2 text-xs leading-5 sm:mt-3 sm:text-sm sm:leading-6 ${i === 2 ? "text-white/85" : "text-muted"}`}>{a.texto}</p>
              </Item>
            ))}
          </Grupo>
          <Revelar className="mt-8">
            <Botao href={EVENTO.instagram.url} externo icone="diagonal" variante="secundario">
              Ver programação no Instagram
            </Botao>
          </Revelar>
        </section>

        {/* 07 — VISITANTES ----------------------------------------------------- */}
        <section id="visitantes" className="scroll-mt-24 border-t border-line bg-paper py-20 lg:py-28">
          <div className={`${wrap} grid gap-12 lg:grid-cols-12`}>
            <Revelar className="lg:col-span-5">
              <p className={eyebrow}>07 · Para visitantes</p>
              <h2 className={`${titulo} mt-5`}>
                Programe a sua <em className="font-normal text-rose">visita.</em>
              </h2>
              <p className="mt-6 text-[17px] leading-8 text-muted">
                Moda, beleza, artesanato e serviços com preços de outlet, atrações gratuitas, Espaço Kids e praça de alimentação,
                tudo no mesmo lugar.
              </p>
              <div className="mt-9 flex flex-col gap-3 sm:flex-row">
                <Botao href="/visitante">Quero ir ao Mega</Botao>
                <Botao href={EVENTO.local.mapsUrl} externo icone="diagonal" variante="secundario">
                  Como chegar
                </Botao>
              </div>
            </Revelar>
            <Grupo as="dl" className="grid gap-px self-start overflow-hidden rounded-3xl border border-line bg-line sm:grid-cols-2 lg:col-span-6 lg:col-start-7">
              {[
                ["Quando", EVENTO.datas.rotulo],
                ["Horário", `Das ${EVENTO.horario}, todos os dias`],
                ["Onde", `${EVENTO.local.nome} · ${EVENTO.local.cidade}`],
                ["Para a família", "Espaço Kids gratuito e atrações abertas ao público"],
              ].map(([t, d]) => (
                <Item key={t} className="bg-ivory p-6 sm:p-7">
                  <dt className="text-[11px] font-semibold uppercase tracking-[0.18em] text-muted">{t}</dt>
                  <dd className="mt-3 font-display text-xl leading-snug tracking-tight text-ink">{d}</dd>
                </Item>
              ))}
            </Grupo>
          </div>
        </section>

        {/* 08 — LOCALIZAÇÃO ---------------------------------------------------- */}
        <section id="localizacao" className="scroll-mt-24 border-t border-line bg-sand/60 py-20 lg:py-28">
          <div className={`${wrap} grid gap-12 lg:grid-cols-12 lg:items-center`}>
            <Revelar className="lg:col-span-5">
              <p className={eyebrow}>08 · Localização</p>
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
                  Abrir no Google Maps
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

        {/* GALERIA (publicações oficiais) -------------------------------------- */}
        <section id="galeria" className={`${wrap} scroll-mt-24 py-20 lg:py-28`}>
          <div className="flex flex-col justify-between gap-6 md:flex-row md:items-end">
            <Revelar>
              <p className={eyebrow}>No Instagram</p>
              <h2 className={`${titulo} mt-5`}>
                Cada edição, <em className="font-normal text-rose">uma história.</em>
              </h2>
            </Revelar>
            <Revelar atraso={0.1} className="max-w-sm text-sm leading-6 text-muted">
              Fotos e vídeos serão publicados aqui após autorização da organização. Enquanto isso, acompanhe as publicações oficiais.
            </Revelar>
          </div>

          <Grupo as="ul" className="mt-12 grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-3">
            {PUBLICACOES_OFICIAIS.map((p, i) => (
              <Item as="li" key={p.url} className={i === 0 ? "col-span-2 row-span-2 lg:col-span-1" : ""}>
                <a
                  href={p.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={`group relative flex h-full flex-col justify-between overflow-hidden rounded-3xl border border-line p-5 transition-colors duration-500 sm:p-6 ${
                    i % 3 === 0 ? "bg-rose-soft" : i % 3 === 1 ? "bg-sand" : "bg-paper"
                  } ${i === 0 ? "min-h-[18rem] sm:min-h-[26rem]" : "min-h-44 sm:min-h-52"}`}
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
                      <ArrowUpRight aria-hidden className="size-4 transition-transform duration-500 group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
                    </span>
                    <span className="sr-only"> — publicação oficial de {p.data} (abre em nova aba)</span>
                  </span>
                </a>
              </Item>
            ))}
          </Grupo>
        </section>

        {/* 09 — FAQ ------------------------------------------------------------ */}
        <section id="faq" className="scroll-mt-24 border-t border-line py-20 lg:py-28">
          <div className={`${wrap} grid gap-12 lg:grid-cols-12`}>
            <Revelar className="lg:col-span-4">
              <p className={eyebrow}>09 · Perguntas frequentes</p>
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
              <h2 className="mx-auto mt-5 max-w-3xl font-display text-[clamp(2.4rem,7vw,5.25rem)] leading-[0.95] tracking-[-0.02em]">
                Sua marca no <em className="font-normal">maior outlet</em> de PE.
              </h2>
              <p className="mx-auto mt-6 max-w-lg text-[17px] leading-8 text-white/85">
                Envie seu interesse e fale com a organização pelos canais oficiais para confirmar a participação.
              </p>
              <div className="mt-10 flex flex-col items-center justify-center gap-3 sm:flex-row">
                <Botao href="/expositor" variante="claro">
                  Quero ser expositor
                </Botao>
                <Botao href="/visitante" variante="secundario" className="border-white/40 text-white hover:border-ivory">
                  Sou visitante
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
