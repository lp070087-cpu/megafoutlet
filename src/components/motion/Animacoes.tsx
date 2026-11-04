"use client";

/**
 * Primitivas de movimento do site.
 * Reveal escalonado adaptado da Biblioteca Unitrix
 * (ref.: iron-man-main/src/components/ui/AnimatedSection.tsx), com suporte a prefers-reduced-motion.
 */
import {
  animate,
  motion,
  useReducedMotion,
  useScroll,
  useTransform,
  type Variants,
} from "motion/react";
import { useEffect, useRef, useState, type ReactNode } from "react";

export const EASE = [0.22, 1, 0.36, 1] as const;

const grupo: Variants = {
  oculto: {},
  visivel: { transition: { staggerChildren: 0.09, delayChildren: 0.04 } },
};

const item: Variants = {
  oculto: { opacity: 0, y: 26 },
  visivel: { opacity: 1, y: 0, transition: { duration: 0.75, ease: EASE } },
};

const itemReduzido: Variants = {
  oculto: { opacity: 0 },
  visivel: { opacity: 1, transition: { duration: 0.3 } },
};

type Props = { children: ReactNode; className?: string; as?: "div" | "section" | "ul" | "li" | "article" };

/** Contêiner que revela os filhos <Item> em sequência ao entrar na tela. */
export function Grupo({ children, className, as = "div", margem = "-80px" }: Props & { margem?: string }) {
  const M = motion[as];
  return (
    <M className={className} variants={grupo} initial="oculto" whileInView="visivel" viewport={{ once: true, margin: margem }}>
      {children}
    </M>
  );
}

export function Item({ children, className, as = "div" }: Props) {
  const reduz = useReducedMotion();
  const M = motion[as];
  return (
    <M className={className} variants={reduz ? itemReduzido : item}>
      {children}
    </M>
  );
}

/** Revelação simples de um bloco. */
export function Revelar({ children, className, atraso = 0 }: { children: ReactNode; className?: string; atraso?: number }) {
  const reduz = useReducedMotion();
  return (
    <motion.div
      className={className}
      initial={reduz ? { opacity: 0 } : { opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-60px" }}
      transition={{ duration: reduz ? 0.3 : 0.8, ease: EASE, delay: atraso }}
    >
      {children}
    </motion.div>
  );
}

/** Linha de título revelada por máscara (texto sobe de dentro de um recorte). */
export function LinhaMascara({ children, atraso = 0, className }: { children: ReactNode; atraso?: number; className?: string }) {
  const reduz = useReducedMotion();
  return (
    <span className={`block overflow-hidden pb-[0.08em] ${className ?? ""}`}>
      <motion.span
        className="block will-change-transform"
        initial={reduz ? { opacity: 0 } : { y: "105%" }}
        animate={reduz ? { opacity: 1 } : { y: "0%" }}
        transition={{ duration: reduz ? 0.3 : 1, ease: EASE, delay: atraso }}
      >
        {children}
      </motion.span>
    </span>
  );
}

/** Número que conta até o valor quando entra na tela. */
export function Contador({ valor, sufixo = "", duracao = 1.6 }: { valor: number; sufixo?: string; duracao?: number }) {
  const ref = useRef<HTMLSpanElement>(null);
  const [visto, setVisto] = useState(false);

  // Observador próprio + verificação imediata: dispara também quando o número já está na tela ao carregar.
  useEffect(() => {
    const el = ref.current;
    if (!el || visto) return;
    const naTela = () => {
      const r = el.getBoundingClientRect();
      return r.bottom > 0 && r.top < window.innerHeight - 20;
    };
    if (naTela()) {
      setVisto(true);
      return;
    }
    const io = new IntersectionObserver((es) => es.some((e) => e.isIntersecting) && setVisto(true), {
      rootMargin: "0px 0px -20px 0px",
    });
    io.observe(el);
    return () => io.disconnect();
  }, [visto]);
  const reduz = useReducedMotion();
  const [atual, setAtual] = useState(0);

  useEffect(() => {
    if (!visto || reduz) return;
    const ctrl = animate(0, valor, { duration: duracao, ease: EASE, onUpdate: (v) => setAtual(Math.round(v)) });
    return () => ctrl.stop();
  }, [visto, reduz, valor, duracao]);

  const exibido = reduz && visto ? valor : atual;
  return (
    <span ref={ref}>
      <span className="sr-only">
        {valor.toLocaleString("pt-BR")}
        {sufixo}
      </span>
      <span aria-hidden>
        {exibido.toLocaleString("pt-BR")}
        {sufixo}
      </span>
    </span>
  );
}

/** Deslocamento vertical sutil conforme o scroll (parallax). */
export function Parallax({ children, className, intensidade = 60 }: { children: ReactNode; className?: string; intensidade?: number }) {
  const ref = useRef<HTMLDivElement>(null);
  const reduz = useReducedMotion();
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start end", "end start"] });
  const y = useTransform(scrollYProgress, [0, 1], reduz ? [0, 0] : [intensidade, -intensidade]);
  return (
    <motion.div ref={ref} style={{ y }} className={className}>
      {children}
    </motion.div>
  );
}
