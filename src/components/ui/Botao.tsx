import Link from "next/link";
import type { ComponentProps, ReactNode } from "react";
import { ArrowRight, ArrowUpRight } from "lucide-react";

/**
 * Botão-link com microinterações: preenchimento que varre da esquerda,
 * brilho diagonal e seta que desliza (padrão de CTA da Biblioteca Unitrix,
 * ref.: vivence-joias-main/components/Hero/Hero.module.css — .cta, .ctaShine).
 */
type Variante = "primario" | "secundario" | "claro";

const base =
  "group/botao relative isolate inline-flex min-h-12 items-center justify-center gap-3 overflow-hidden rounded-full px-7 text-sm font-semibold tracking-wide transition-[color,border-color,transform] duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] active:scale-[0.98]";

const variantes: Record<Variante, string> = {
  primario: "bg-rose text-white before:bg-ink",
  secundario: "border border-ink/20 text-ink hover:text-ivory hover:border-ink before:bg-ink",
  claro: "bg-ivory text-ink hover:text-white before:bg-rose",
};

const preenchimento =
  "before:absolute before:inset-0 before:-z-10 before:origin-left before:scale-x-0 before:rounded-full before:transition-transform before:duration-500 before:ease-[cubic-bezier(0.22,1,0.36,1)] hover:before:scale-x-100 motion-reduce:before:transition-none";

export function Botao({
  href,
  children,
  variante = "primario",
  externo,
  icone = "seta",
  className = "",
  ...rest
}: {
  href: string;
  children: ReactNode;
  variante?: Variante;
  externo?: boolean;
  icone?: "seta" | "diagonal" | "nenhum";
  className?: string;
} & Omit<ComponentProps<typeof Link>, "href" | "children" | "className">) {
  const Icone = icone === "diagonal" ? ArrowUpRight : ArrowRight;
  const conteudo = (
    <>
      <span>{children}</span>
      {icone !== "nenhum" && (
        <Icone
          aria-hidden
          className="size-4 transition-transform duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] group-hover/botao:translate-x-1 motion-reduce:transition-none"
        />
      )}
      <span
        aria-hidden
        className="pointer-events-none absolute inset-y-0 -left-full w-1/2 -skew-x-12 bg-white/25 opacity-0 group-hover/botao:animate-[brilho_0.7s_ease-out] group-hover/botao:opacity-100 motion-reduce:hidden"
      />
    </>
  );
  const cls = `${base} ${preenchimento} ${variantes[variante]} ${className}`;
  if (externo)
    return (
      <a
        href={href}
        target="_blank"
        rel="noopener noreferrer"
        className={cls}
        aria-label={rest["aria-label"]}
        title={rest.title}
        onClick={rest.onClick as React.MouseEventHandler<HTMLAnchorElement> | undefined}
      >
        {conteudo}
        <span className="sr-only"> (abre em nova aba)</span>
      </a>
    );
  return (
    <Link href={href} className={cls} {...rest}>
      {conteudo}
    </Link>
  );
}
