"use client";

/**
 * Scroll suave com Lenis — padrão da Biblioteca Unitrix
 * (ref.: iron-man-main/src/components/providers/SmoothScrollProvider.tsx).
 * Adaptações: desligado com prefers-reduced-motion e em toque (Safari iOS usa scroll nativo),
 * reage a mudanças dessas preferências, compensa o header nas âncoras internas e move o foco
 * para o destino; áreas com [data-lenis-prevent] (mapa, menu) ficam isoladas.
 */
import Lenis from "lenis";
import { useEffect } from "react";

const OFFSET_HEADER = -84;

export default function SmoothScroll() {
  useEffect(() => {
    const mqReduz = window.matchMedia("(prefers-reduced-motion: reduce)");
    const mqToque = window.matchMedia("(pointer: coarse)");
    let lenis: Lenis | null = null;
    let raf = 0;

    const onClick = (ev: MouseEvent) => {
      if (!lenis) return;
      const a = (ev.target as HTMLElement).closest?.("a[href*='#']") as HTMLAnchorElement | null;
      if (!a) return;
      const url = new URL(a.href, window.location.href);
      if (url.pathname !== window.location.pathname || !url.hash) return;
      const alvo = document.querySelector(decodeURIComponent(url.hash)) as HTMLElement | null;
      if (!alvo) return;
      ev.preventDefault();
      lenis.scrollTo(alvo, { offset: OFFSET_HEADER, duration: 1.1 });
      history.pushState(null, "", url.hash);
      if (!alvo.hasAttribute("tabindex")) alvo.setAttribute("tabindex", "-1");
      alvo.focus({ preventScroll: true });
    };

    const parar = () => {
      cancelAnimationFrame(raf);
      lenis?.destroy();
      lenis = null;
      document.documentElement.style.scrollBehavior = "";
    };

    const iniciar = () => {
      if (lenis || mqReduz.matches || mqToque.matches) return;
      lenis = new Lenis({ lerp: 0.1, smoothWheel: true, syncTouch: false });
      document.documentElement.style.scrollBehavior = "auto";
      const loop = (t: number) => {
        lenis?.raf(t);
        raf = requestAnimationFrame(loop);
      };
      raf = requestAnimationFrame(loop);
    };

    const avaliar = () => (mqReduz.matches || mqToque.matches ? parar() : iniciar());

    avaliar();
    document.addEventListener("click", onClick);
    mqReduz.addEventListener("change", avaliar);
    mqToque.addEventListener("change", avaliar);

    return () => {
      document.removeEventListener("click", onClick);
      mqReduz.removeEventListener("change", avaliar);
      mqToque.removeEventListener("change", avaliar);
      parar();
    };
  }, []);

  return null;
}
