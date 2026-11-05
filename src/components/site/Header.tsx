"use client";

/**
 * Header do site.
 * Base: Codex 1. Refinamento (Claude Code): estado "rolado" com vidro fosco
 * (padrão da Biblioteca Unitrix, ref.: vivence-joias-main/components/Header — .header.scrolled),
 * hambúrguer animado no topo direito, menu mobile animado que fecha ao selecionar,
 * bloqueio de rolagem e Escape para fechar.
 */
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { useEffect, useRef, useState } from "react";
import { EVENTO } from "@/data/evento";

const LINKS = [
  ["O evento", "/#evento"],
  ["Lojistas", "/#lojistas"],
  ["Mapa 3D", "/#mapa"],
  ["Atrações", "/#atracoes"],
  ["Visitantes", "/#visitantes"],
  ["FAQ", "/#faq"],
] as const;

const EASE = [0.22, 1, 0.36, 1] as const;

export function Header() {
  const [aberto, setAberto] = useState(false);
  const [rolado, setRolado] = useState(false);
  const botao = useRef<HTMLButtonElement>(null);
  const cabecalho = useRef<HTMLElement>(null);
  const menu = useRef<HTMLElement>(null);
  const pathname = usePathname();
  const reduz = useReducedMotion();

  useEffect(() => {
    const onScroll = () => setRolado(window.scrollY > 24);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // trava a rolagem da página com o menu aberto
  useEffect(() => {
    if (!aberto) return;
    const anterior = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    // contém o foco no menu: o restante da página fica inerte enquanto ele está aberto
    const irmaos = [...(cabecalho.current?.parentElement?.children ?? [])].filter(
      (el) => el !== cabecalho.current && el instanceof HTMLElement,
    ) as HTMLElement[];
    irmaos.forEach((el) => el.setAttribute("inert", ""));
    requestAnimationFrame(() => menu.current?.querySelector<HTMLElement>("a")?.focus());
    const btn = botao.current;
    const menuEl = menu.current;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setAberto(false);
        botao.current?.focus();
      }
    };
    // ao passar para o layout desktop (xl), o menu móvel deixa de existir: fecha e libera a rolagem
    const mq = window.matchMedia("(min-width: 1280px)");
    const onMq = () => mq.matches && setAberto(false);
    window.addEventListener("keydown", onKey);
    mq.addEventListener("change", onMq);
    return () => {
      document.body.style.overflow = anterior;
      irmaos.forEach((el) => el.removeAttribute("inert"));
      // devolve o foco ao botão se ele estava dentro do menu que está fechando (ou se perdeu)
      const ativoEl = document.activeElement;
      if (btn && (!ativoEl || ativoEl === document.body || menuEl?.contains(ativoEl))) btn.focus();
      window.removeEventListener("keydown", onKey);
      mq.removeEventListener("change", onMq);
    };
  }, [aberto]);

  const fechar = () => setAberto(false);
  const ativo = (href: string) => (href === "/mapa" ? pathname === "/mapa" : false);

  return (
    <header
      ref={cabecalho}
      className={`sticky top-0 z-50 pt-[env(safe-area-inset-top)] transition-[background-color,border-color,box-shadow] duration-500 ${
        rolado || aberto
          ? "border-b border-line/80 bg-ivory/85 shadow-[0_8px_30px_-24px_rgba(29,27,26,0.4)] backdrop-blur-xl"
          : "border-b border-transparent bg-ivory"
      }`}
    >
      <a
        href="#conteudo"
        className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-3 focus:z-[60] focus:rounded-full focus:bg-ink focus:px-5 focus:py-3 focus:text-ivory"
      >
        Pular para o conteúdo
      </a>

      <div
        className={`mx-auto flex max-w-7xl items-center justify-between gap-5 px-5 transition-[padding] duration-500 lg:px-10 ${
          rolado ? "py-2" : "py-3 lg:py-4"
        }`}
      >
        <Link href="/" aria-label="Mega Fashion Outlet — início" onClick={fechar} className="flex min-h-11 items-center">
          <Image
            src="/brand/logo-mega-fashion.png"
            alt="Mega Fashion Outlet"
            width={1525}
            height={636}
            sizes="168px"
            priority
            className={`h-auto transition-[width] duration-500 ${rolado ? "w-28 sm:w-32" : "w-32 sm:w-40"}`}
          />
        </Link>

        <nav aria-label="Navegação principal" className="hidden items-center gap-1 xl:flex">
          {LINKS.map(([rotulo, href]) => (
            <Link
              key={rotulo}
              href={href}
              aria-current={ativo(href) ? "page" : undefined}
              className="group relative inline-flex min-h-11 items-center px-3 text-[13px] font-medium text-ink/80 transition-colors hover:text-ink aria-[current=page]:text-ink"
            >
              {rotulo}
              <span
                aria-hidden
                className="absolute inset-x-3 bottom-2 h-px origin-left scale-x-0 bg-rose transition-transform duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:scale-x-100 group-aria-[current=page]:scale-x-100"
              />
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-2">
          <Link
            href="/expositor"
            className="hidden min-h-11 items-center rounded-full bg-rose px-5 text-sm font-semibold text-white transition-colors hover:bg-rose-deep sm:inline-flex"
          >
            Quero ser expositor
          </Link>

          <button
            ref={botao}
            type="button"
            aria-expanded={aberto}
            aria-controls="menu-mobile"
            aria-label={aberto ? "Fechar menu" : "Abrir menu"}
            onClick={() => setAberto((v) => !v)}
            className="relative grid size-11 place-items-center rounded-full border border-line bg-paper xl:hidden"
          >
            <span aria-hidden className="relative block h-3 w-5">
              <span
                className={`absolute left-0 h-[1.5px] w-5 bg-ink transition-transform duration-300 ${aberto ? "top-1.5 rotate-45" : "top-0"}`}
              />
              <span
                className={`absolute left-0 top-1.5 h-[1.5px] w-5 bg-ink transition-opacity duration-200 ${aberto ? "opacity-0" : "opacity-100"}`}
              />
              <span
                className={`absolute left-0 h-[1.5px] w-5 bg-ink transition-transform duration-300 ${aberto ? "top-1.5 -rotate-45" : "top-3"}`}
              />
            </span>
          </button>
        </div>
      </div>

      <AnimatePresence>
        {aberto && (
          <motion.nav
            id="menu-mobile"
            ref={menu}
            aria-label="Navegação móvel"
            initial={reduz ? { opacity: 0 } : { opacity: 0, clipPath: "inset(0 0 100% 0)" }}
            animate={reduz ? { opacity: 1 } : { opacity: 1, clipPath: "inset(0 0 0% 0)" }}
            exit={reduz ? { opacity: 0 } : { opacity: 0, clipPath: "inset(0 0 100% 0)" }}
            transition={{ duration: 0.5, ease: EASE }}
            className="absolute inset-x-0 top-full h-[calc(100dvh-100%)] overflow-y-auto bg-ivory px-5 pb-[max(24px,env(safe-area-inset-bottom))] xl:hidden"
            data-lenis-prevent
          >
            <motion.ul
              className="mx-auto max-w-7xl"
              initial="oculto"
              animate="visivel"
              variants={{ visivel: { transition: { staggerChildren: 0.05, delayChildren: 0.12 } } }}
            >
              {LINKS.map(([rotulo, href], i) => (
                <motion.li
                  key={rotulo}
                  variants={{
                    oculto: reduz ? { opacity: 0 } : { opacity: 0, y: 16 },
                    visivel: { opacity: 1, y: 0, transition: { duration: 0.5, ease: EASE } },
                  }}
                  className="border-b border-line"
                >
                  <Link
                    href={href}
                    onClick={fechar}
                    className="flex min-h-16 items-baseline justify-between font-display text-[2rem] leading-none tracking-tight"
                  >
                    {rotulo}
                    <span className="font-sans text-xs tabular-nums text-muted">{String(i + 1).padStart(2, "0")}</span>
                  </Link>
                </motion.li>
              ))}
            </motion.ul>
            <div className="mx-auto mt-8 max-w-7xl space-y-3">
              <Link
                href="/expositor"
                onClick={fechar}
                className="flex min-h-13 items-center justify-center rounded-full bg-rose px-6 py-4 font-semibold text-white"
              >
                Quero ser expositor
              </Link>
              <Link
                href="/visitante"
                onClick={fechar}
                className="flex min-h-13 items-center justify-center rounded-full border border-ink/20 px-6 py-4 font-semibold"
              >
                Sou visitante
              </Link>
              <p className="pt-4 text-center text-xs text-muted">
                {EVENTO.datas.rotulo} · {EVENTO.horario}
              </p>
            </div>
          </motion.nav>
        )}
      </AnimatePresence>
    </header>
  );
}

export default Header;
