import Image from "next/image";
import Link from "next/link";
import { EVENTO, whatsappLink } from "@/data/evento";
import { MODO_DEMO, PLANTA_ILUSTRATIVA } from "@/lib/ambiente";

const link = "inline-flex min-h-11 items-center text-sm text-ink/80 transition-colors hover:text-rose-deep";

export function Footer() {
  return (
    <footer className="border-t border-line bg-sand">
      <div className="mx-auto max-w-7xl px-5 pb-8 pt-14 lg:px-10">
        <div className="grid gap-10 md:grid-cols-12">
          <div className="md:col-span-4">
            <Image src="/brand/logo-mega-fashion.png" alt="Mega Fashion Outlet" width={1525} height={636} sizes="200px" className="h-auto w-44" />
            <p className="mt-5 max-w-xs text-sm leading-6 text-muted">
              {EVENTO.slogan}. {EVENTO.datas.rotulo}, das {EVENTO.horario}.
            </p>
          </div>
          <nav aria-label="Navegação do rodapé" className="md:col-span-3">
            <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-muted">Apresentação</p>
            <ul className="mt-3 grid">
              <li><Link className={link} href="/#evento">O evento</Link></li>
              <li><Link className={link} href="/#lojistas">Para lojistas</Link></li>
              <li><Link className={link} href="/mapa">Mapa 2D e 3D</Link></li>
              <li><Link className={link} href="/#atracoes">Atrações</Link></li>
              <li><Link className={link} href="/#faq">Perguntas frequentes</Link></li>
            </ul>
          </nav>
          <nav aria-label="Participação" className="md:col-span-2">
            <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-muted">Participe</p>
            <ul className="mt-3 grid">
              <li><Link className={link} href="/expositor">Seja expositor</Link></li>
              <li><Link className={link} href="/visitante">Sou visitante</Link></li>
              <li><a className={link} href={EVENTO.local.mapsUrl} target="_blank" rel="noopener noreferrer">Como chegar ↗</a></li>
            </ul>
          </nav>
          <div className="md:col-span-3">
            <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-muted">Canais oficiais</p>
            <ul className="mt-3 grid">
              <li><a className={link} href={EVENTO.instagram.url} target="_blank" rel="noopener noreferrer">Instagram {EVENTO.instagram.usuario} ↗</a></li>
              <li><a className={link} href={EVENTO.linktree} target="_blank" rel="noopener noreferrer">Linktree oficial ↗</a></li>
              <li><a className={link} href={whatsappLink(EVENTO.whatsappExpositores[0])} target="_blank" rel="noopener noreferrer">WhatsApp para expositores ↗</a></li>
            </ul>
            <address className="mt-4 text-sm not-italic leading-6 text-muted">
              {EVENTO.local.nome}
              <br />
              {EVENTO.local.endereco}
            </address>
          </div>
        </div>
        <div className="mt-12 flex flex-col justify-between gap-4 border-t border-line pt-6 text-xs leading-5 text-muted sm:flex-row sm:items-center">
          <p className="max-w-2xl">
            {MODO_DEMO ? "Ambiente de demonstração: formulários não enviam dados à organização. " : ""}
            {PLANTA_ILUSTRATIVA ? "Mapa 3D ilustrativo, não oficial. " : ""}
            Informações conforme canais oficiais do evento; programação e planta sujeitas a alterações pela organização.
          </p>
          <div className="flex shrink-0 items-center gap-5">
            {MODO_DEMO && <Link className="inline-flex min-h-11 items-center underline underline-offset-4" href="/admin">Painel (demonstração)</Link>}
            <span>Apresentação desenvolvida pela Unitrix</span>
          </div>
        </div>
      </div>
    </footer>
  );
}

export default Footer;
