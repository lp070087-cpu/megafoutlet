"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useRef, useState, type ReactNode } from "react";
import Header from "@/components/site/Header";
import Footer from "@/components/site/Footer";
import { EVENTO } from "@/data/evento";
import { limparDemo } from "@/lib/demo-store";
import { ADMIN_KEYS, seedDemo } from "./seed";
import { useAdminStore } from "./useAdminStore";
import { buttonClass, Feedback, Modal, primaryClass } from "./ui";

const links = [
  { href: "/admin", label: "Visão geral" },
  { href: "/admin/lojistas", label: "Lojistas" },
  { href: "/admin/visitantes", label: "Visitantes" },
  { href: "/admin/estandes", label: "Estandes" },
];

export function AdminShell({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const [entered, setEntered] = useState(false);
  const [confirmClear, setConfirmClear] = useState(false);
  const [feedback, setFeedback] = useState({ text: "", error: false });
  const headingRef = useRef<HTMLElement>(null);
  const store = useAdminStore();

  function enter() {
    setEntered(true);
    requestAnimationFrame(() => headingRef.current?.focus());
  }

  function loadSeed() {
    try {
      const result = seedDemo();
      setFeedback({
        text: `Carga fictícia: ${result.lojistas} lojistas e ${result.visitantes} visitantes adicionados. Registros existentes preservados. Nenhum status de estande foi alterado.`,
        error: false,
      });
    } catch {
      setFeedback({ text: "Não foi possível carregar os dados. Verifique o armazenamento local do navegador.", error: true });
    }
  }

  function clear() {
    try {
      limparDemo();
      if (Object.values(ADMIN_KEYS).some(key => localStorage.getItem(key) !== null)) {
        throw new Error("Limpeza não confirmada");
      }
      setFeedback({ text: "Dados locais removidos: cadastros, status e histórico de estandes.", error: false });
    } catch {
      setFeedback({ text: "Não foi possível confirmar a limpeza completa. Verifique o armazenamento do navegador.", error: true });
    }
    setConfirmClear(false);
  }

  function navigation(mobile = false) {
    return links.map(({ href, label }) => (
      <Link
        key={href}
        href={href}
        aria-current={pathname === href ? "page" : undefined}
        className={`${mobile ? "flex min-h-14 min-w-0 flex-1 items-center justify-center px-1 text-[11px]" : "flex min-h-12 items-center border-b border-line px-3 text-sm"} ${pathname === href ? "bg-rose-soft font-semibold text-rose-deep" : "hover:bg-sand"}`}
      >
        {label}
      </Link>
    ));
  }

  return (
    <div className="min-h-dvh pt-14 [&>header]:top-14">
      <div
        className="fixed inset-x-0 top-0 z-50 flex h-14 items-center justify-center bg-graphite px-4 text-center text-xs font-semibold leading-5 text-white"
        role="note"
      >
        Ambiente de demonstração — dados locais deste navegador
      </div>
      <Header />
      {!entered ? (
        <main id="conteudo" className="mx-auto max-w-2xl px-5 py-16 sm:py-24">
          <p className="text-xs uppercase tracking-[0.18em] text-rose-deep">{EVENTO.nome}</p>
          <h1 className="mt-5 font-display text-4xl leading-tight tracking-tight sm:text-5xl">
            Acesso administrativo (demonstração)
          </h1>
          <p className="mt-6 leading-8 text-muted">
            Explore o painel com dados fictícios ou com os cadastros locais deste navegador.
            Esta tela não é uma autenticação e não protege dados.
          </p>
          <p className="mt-4 text-sm font-semibold leading-7">
            A versão de produção exige autenticação, controle de acesso e armazenamento seguro no servidor.
            Não utilize dados pessoais reais nesta demonstração.
          </p>
          <button type="button" className={`${primaryClass} mt-8`} onClick={enter}>
            Entrar no modo demonstração
          </button>
        </main>
      ) : (
        <div
          className="mx-auto grid max-w-[1440px] gap-8 px-4 py-8 pb-28 lg:grid-cols-[210px_minmax(0,1fr)] lg:px-8 lg:pb-12"
        >
          <aside className="hidden lg:block">
            <div className="sticky top-40">
              <p className="mb-6 text-xs uppercase tracking-[0.18em] text-muted">Painel local</p>
              <nav aria-label="Administração">{navigation()}</nav>
              <p className="mt-8 text-xs leading-6 text-muted">
                Edição {EVENTO.edicao}. Nenhum dado deste painel é enviado à organização.
              </p>
              <button
                type="button"
                onClick={() => setEntered(false)}
                className="mt-4 min-h-11 text-sm underline underline-offset-4"
              >
                Sair da demonstração
              </button>
            </div>
          </aside>
          <main id="conteudo" ref={headingRef} tabIndex={-1} className="min-w-0">
            <div className="mb-8 border-b border-line pb-6">
              <div className="flex flex-wrap gap-3">
                <button type="button" onClick={loadSeed} className={buttonClass}>
                  Carregar dados fictícios de demonstração
                </button>
                <button type="button" onClick={() => setConfirmClear(true)} className={buttonClass}>
                  Limpar dados
                </button>
                <button
                  type="button"
                  className={`${buttonClass} lg:hidden`}
                  onClick={() => setEntered(false)}
                >
                  Sair
                </button>
              </div>
              <p className="mt-3 text-xs leading-6 text-muted">
                Carga de 25 lojistas e 60 visitantes fictícios, sem duplicar a carga anterior.
                A limpeza remove todos os dados locais, inclusive cadastros feitos pelos formulários.
              </p>
              {!store.storageAvailable && (
                <p role="alert" className="mt-3 text-sm text-danger">
                  O navegador bloqueou o armazenamento local. As alterações podem não ser salvas.
                </p>
              )}
              <Feedback {...feedback} />
            </div>
            {children}
          </main>
          <nav
            aria-label="Administração móvel"
            className="fixed inset-x-0 bottom-0 z-40 flex border-t border-line bg-paper pb-[env(safe-area-inset-bottom)] lg:hidden"
          >
            {navigation(true)}
          </nav>
        </div>
      )}
      <Footer />
      {confirmClear && (
        <Modal title="Limpar todos os dados locais?" onClose={() => setConfirmClear(false)}>
          <p className="text-sm leading-7 text-muted">
            Esta ação remove lojistas, visitantes, status e histórico de estandes deste navegador,
            incluindo cadastros que não são fictícios. Não pode ser desfeita pelo painel.
          </p>
          <div className="mt-7 flex flex-wrap gap-3">
            <button type="button" className={buttonClass} onClick={() => setConfirmClear(false)}>
              Cancelar
            </button>
            <button type="button" className={primaryClass} onClick={clear}>
              Confirmar limpeza dos dados locais
            </button>
          </div>
        </Modal>
      )}
    </div>
  );
}
