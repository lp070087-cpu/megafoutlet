import Link from "next/link";
import { EVENTO } from "@/data/evento";
import { MODO_DEMO } from "@/lib/ambiente";
export function Footer() {
  return <footer className="border-t border-line bg-sand"><div className="mx-auto max-w-7xl px-5 py-12 lg:px-10">
    <div className="flex flex-col justify-between gap-8 md:flex-row"><div><p className="font-display text-3xl">{EVENTO.nome}</p><p className="mt-3 text-sm text-muted">{EVENTO.datas.rotulo} · {EVENTO.local.cidade}</p></div><nav aria-label="Redes e contatos oficiais" className="flex flex-wrap gap-6"><a className="flex min-h-11 items-center text-sm underline underline-offset-4" href={EVENTO.instagram.url} target="_blank" rel="noopener noreferrer">Instagram ↗</a><a className="flex min-h-11 items-center text-sm underline underline-offset-4" href={EVENTO.linktree} target="_blank" rel="noopener noreferrer">Linktree oficial ↗</a></nav></div>
    <div className="mt-10 flex flex-col justify-between gap-4 border-t border-line pt-6 text-xs text-muted sm:flex-row">{MODO_DEMO ? (<><p>Ambiente de demonstração. Cadastros salvos somente neste navegador.</p><Link className="inline-flex min-h-11 items-center underline underline-offset-4" href="/admin">Área administrativa</Link></>) : (<p>Informações conforme canais oficiais do evento. Planta sujeita a alterações pela organização.</p>)}</div>
  </div></footer>;
}
export default Footer;