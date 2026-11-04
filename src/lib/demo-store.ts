"use client";
/**
 * Armazenamento de DEMONSTRAÇÃO (localStorage do navegador).
 * NÃO é solução de produção: dados ficam apenas neste navegador, sem backend,
 * autenticação, validação no servidor, antispam ou controles LGPD.
 */
import type { HistoricoEstande, Lojista, StatusEstande, StatusLojista, Visitante } from "./types";

const KEYS = {
  lojistas: "mfo.demo.lojistas.v1",
  visitantes: "mfo.demo.visitantes.v1",
  estandes: "mfo.demo.estandes.v1",
  historico: "mfo.demo.estandes-historico.v1",
} as const;

const EVENT = "mfo-demo-store";

function read<T>(key: string, fallback: T): T {
  if (typeof window === "undefined") return fallback;
  try {
    const raw = window.localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : fallback;
  } catch {
    return fallback;
  }
}

function write<T>(key: string, value: T) {
  try {
    window.localStorage.setItem(key, JSON.stringify(value));
    window.dispatchEvent(new Event(EVENT));
  } catch {
    /* armazenamento indisponível (modo privado, cota) */
  }
}

export function subscribe(cb: () => void) {
  window.addEventListener(EVENT, cb);
  window.addEventListener("storage", cb);
  return () => {
    window.removeEventListener(EVENT, cb);
    window.removeEventListener("storage", cb);
  };
}

const uid = () =>
  typeof crypto !== "undefined" && "randomUUID" in crypto ? crypto.randomUUID() : Math.random().toString(36).slice(2);

export const normalizarContato = (v: string) => {
  const t = v.trim().toLowerCase();
  return t.includes("@") ? t : t.replace(/\D/g, "");
};

// ---------- Lojistas ----------
export function listarLojistas(): Lojista[] {
  return read<Lojista[]>(KEYS.lojistas, []);
}

export function criarLojista(dados: Omit<Lojista, "id" | "criadoEm" | "status" | "notas">): Lojista {
  const novo: Lojista = { ...dados, id: uid(), criadoEm: new Date().toISOString(), status: "novo", notas: [] };
  write(KEYS.lojistas, [novo, ...listarLojistas()]);
  return novo;
}

export function atualizarStatusLojista(id: string, status: StatusLojista) {
  write(KEYS.lojistas, listarLojistas().map((l) => (l.id === id ? { ...l, status } : l)));
}

export function adicionarNotaLojista(id: string, texto: string) {
  const nota = { em: new Date().toISOString(), texto };
  write(KEYS.lojistas, listarLojistas().map((l) => (l.id === id ? { ...l, notas: [...l.notas, nota] } : l)));
}

// ---------- Visitantes ----------
export function listarVisitantes(): Visitante[] {
  return read<Visitante[]>(KEYS.visitantes, []);
}

/** Retorna { duplicado: true } se o contato já confirmou presença. */
export function confirmarVisitante(nome: string, contato: string): { visitante: Visitante; duplicado: boolean } {
  const chave = normalizarContato(contato);
  const existentes = listarVisitantes();
  const achado = existentes.find((v) => v.contato === chave);
  if (achado) return { visitante: achado, duplicado: true };
  const novo: Visitante = { id: uid(), criadoEm: new Date().toISOString(), nome: nome.trim(), contato: chave, consentimento: true };
  write(KEYS.visitantes, [novo, ...existentes]);
  return { visitante: novo, duplicado: false };
}

export function registrarComparecimento(id: string, presente: boolean) {
  write(
    KEYS.visitantes,
    listarVisitantes().map((v) => (v.id === id ? { ...v, compareceu: presente ? new Date().toISOString() : undefined } : v)),
  );
}

// ---------- Estandes (status administrativo) ----------
export function statusEstandes(): Record<string, StatusEstande> {
  return read<Record<string, StatusEstande>>(KEYS.estandes, {});
}

export function historicoEstandes(): HistoricoEstande[] {
  return read<HistoricoEstande[]>(KEYS.historico, []);
}

export function alterarStatusEstande(estandeId: string, para: StatusEstande, por = "Administrador (demo)") {
  const atual = statusEstandes();
  const de = atual[estandeId] ?? "sem_informacao";
  if (de === para) return;
  write(KEYS.estandes, { ...atual, [estandeId]: para });
  write(KEYS.historico, [{ estandeId, de, para, em: new Date().toISOString(), por }, ...historicoEstandes()]);
}

// ---------- Demonstração ----------
export function limparDemo() {
  Object.values(KEYS).forEach((k) => {
    try {
      window.localStorage.removeItem(k);
    } catch {}
  });
  window.dispatchEvent(new Event(EVENT));
}
