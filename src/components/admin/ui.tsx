"use client";

import { useEffect, useId, useRef, type ReactNode } from "react";
import { STATUS_ESTANDE_ROTULO } from "@/lib/types";

export const buttonClass = "inline-flex min-h-11 items-center justify-center border border-line bg-paper px-4 py-2 text-sm font-semibold transition-colors hover:bg-sand disabled:cursor-not-allowed disabled:opacity-50";
export const primaryClass = "inline-flex min-h-11 items-center justify-center bg-rose px-5 py-3 text-sm font-semibold text-white transition-colors hover:bg-rose-deep disabled:cursor-not-allowed disabled:opacity-50";
export const inputClass = "min-h-11 w-full min-w-0 border border-line bg-paper px-3 py-2 text-base";
export const panelClass = "min-w-0 border border-line bg-paper p-5 sm:p-7";
export const standLabels = STATUS_ESTANDE_ROTULO;

export function dateLabel(value: string, includeTime = false) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "Data não informada";
  return new Intl.DateTimeFormat("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    ...(includeTime ? { hour: "2-digit", minute: "2-digit" } as const : {}),
    timeZone: "America/Recife",
  }).format(date);
}

export function maskContact(value: string) {
  if (value.includes("@")) {
    const [name, domain] = value.split("@");
    return `${name.slice(0, 1)}•••@${domain.slice(0, 1)}•••`;
  }
  const digits = value.replace(/\D/g, "");
  return digits.length >= 4 ? `•• •••••-${digits.slice(-4)}` : "••••";
}

export function maskName(value: string) {
  const words = value.trim().split(/\s+/);
  return `${words[0]?.slice(0, 1) ?? ""}•••${words.length > 1 ? ` ${words.at(-1)?.slice(0, 1)}•••` : ""}`;
}

export function PageHeading({ title, description }: { title: string; description: string }) {
  return (
    <div className="mb-8">
      <p className="text-xs font-semibold uppercase tracking-[0.18em] text-rose-deep">
        Gestão local · demonstração
      </p>
      <h1 className="mt-3 font-display text-4xl tracking-tight sm:text-5xl">{title}</h1>
      <p className="mt-4 max-w-3xl text-sm leading-7 text-muted">{description}</p>
    </div>
  );
}

export function EmptyState({ title, children }: { title: string; children?: ReactNode }) {
  return (
    <div className="border border-dashed border-line px-5 py-12 text-center">
      <h2 className="font-display text-2xl">{title}</h2>
      <div className="mx-auto mt-3 max-w-md text-sm leading-7 text-muted">{children}</div>
    </div>
  );
}

export function Metric({ label, value, hint }: { label: string; value: number; hint?: string }) {
  return (
    <div className={panelClass}>
      <p className="text-xs uppercase tracking-widest text-muted">{label}</p>
      <p className="mt-3 font-display text-4xl tabular-nums">{value}</p>
      {hint && <p className="mt-2 text-xs leading-5 text-muted">{hint}</p>}
    </div>
  );
}

export function Feedback({ text, error }: { text: string; error: boolean }) {
  if (!text) return null;
  return (
    <p
      role={error ? "alert" : "status"}
      className={`my-4 text-sm leading-6 ${error ? "text-danger" : "text-success"}`}
    >
      {text}
    </p>
  );
}

export function Modal({ title, children, onClose, drawer = false }: {
  title: string;
  children: ReactNode;
  onClose: () => void;
  drawer?: boolean;
}) {
  const ref = useRef<HTMLDialogElement>(null);
  const titleId = useId();
  useEffect(() => {
    const dialog = ref.current;
    const previouslyFocused = document.activeElement;
    dialog?.showModal();
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      dialog?.close();
      document.body.style.overflow = previousOverflow;
      if (previouslyFocused instanceof HTMLElement && previouslyFocused.isConnected) previouslyFocused.focus();
    };
  }, []);

  return (
    <dialog
      ref={ref}
      aria-labelledby={titleId}
      onCancel={event => { event.preventDefault(); onClose(); }}
      className={drawer
        ? "fixed inset-y-0 left-auto right-0 m-0 h-dvh max-h-none w-full max-w-xl overflow-y-auto border-l border-line bg-ivory p-5 text-ink backdrop:bg-ink/40 sm:p-8"
        : "fixed inset-0 m-auto max-h-[90dvh] w-[calc(100%_-_2rem)] max-w-lg overflow-y-auto border border-line bg-ivory p-6 text-ink backdrop:bg-ink/40 sm:p-8"}
    >
      <div className="mb-6 flex items-start justify-between gap-5">
        <h2 id={titleId} className="font-display text-3xl tracking-tight">{title}</h2>
        <button type="button" onClick={onClose} className={buttonClass} aria-label="Fechar painel">
          Fechar
        </button>
      </div>
      {children}
    </dialog>
  );
}
