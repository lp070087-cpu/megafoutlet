"use client";

import { ESTANDES } from "@/data/planta";
import { listarLojistas, listarVisitantes, normalizarContato } from "@/lib/demo-store";
import { CATEGORIAS, STATUS_LOJISTA, type Lojista, type Visitante } from "@/lib/types";

// Contrato local compartilhado com demo-store.ts. Não contém dados de produção.
export const ADMIN_KEYS = {
  lojistas: "mfo.demo.lojistas.v1",
  visitantes: "mfo.demo.visitantes.v1",
  estandes: "mfo.demo.estandes.v1",
  historico: "mfo.demo.estandes-historico.v1",
} as const;

export function seedDemo() {
  const now = new Date();
  function dateFor(index: number) {
    const date = new Date(now);
    date.setDate(date.getDate() - (index % 14));
    return date.toISOString();
  }

  const existingLojistas = listarLojistas();
  const existingVisitantes = listarVisitantes();
  const lojistas: Lojista[] = Array.from({ length: 25 }, (_, index) => {
    const number = String(index + 1).padStart(2, "0");
    return {
      id: `demo-lojista-${number}`,
      criadoEm: dateFor(index),
      responsavel: `Pessoa Fictícia ${number}`,
      marca: `Loja Exemplo ${number}`,
      whatsapp: `000000000${number}`, // DDD 00 inválido: não é um telefone real.
      email: `loja.exemplo${number}@demo.local`,
      instagram: "",
      categoria: CATEGORIAS[index % CATEGORIAS.length],
      cidade: "Cidade Exemplo",
      uf: "PE",
      dimensao: ESTANDES[index % Math.max(1, ESTANDES.length)]?.dimensao ?? "2x2",
      estandeInteresse: index % 4 === 0
        ? undefined
        : ESTANDES[index % Math.max(1, Math.min(12, ESTANDES.length))]?.id,
      observacoes: "Registro fictício para demonstração. Não representa uma marca real.",
      consentimento: true,
      status: STATUS_LOJISTA[index % STATUS_LOJISTA.length],
      notas: [],
      demo: true,
    };
  });
  const visitantes: Visitante[] = Array.from({ length: 60 }, (_, index) => {
    const number = String(index + 1).padStart(2, "0");
    return {
      id: `demo-visitante-${number}`,
      criadoEm: dateFor(index),
      nome: `Visitante Fictício ${number}`,
      contato: `visitante.exemplo${number}@demo.local`,
      consentimento: true,
      compareceu: index % 3 === 0 ? now.toISOString() : undefined,
      demo: true,
    };
  });

  const newLojistas = lojistas.filter(candidate =>
    !existingLojistas.some(item => item.id === candidate.id),
  );
  const contacts = new Set(existingVisitantes.map(item => normalizarContato(item.contato)));
  const newVisitantes = visitantes.filter(candidate =>
    !existingVisitantes.some(item => item.id === candidate.id)
    && !contacts.has(normalizarContato(candidate.contato)),
  );

  const previousLojistas = localStorage.getItem(ADMIN_KEYS.lojistas);
  const previousVisitantes = localStorage.getItem(ADMIN_KEYS.visitantes);
  try {
    localStorage.setItem(ADMIN_KEYS.lojistas, JSON.stringify([...newLojistas, ...existingLojistas]));
    localStorage.setItem(ADMIN_KEYS.visitantes, JSON.stringify([...newVisitantes, ...existingVisitantes]));
  } catch (error) {
    // Evita deixar uma carga parcial se o navegador recusar a segunda escrita.
    for (const [key, value] of [
      [ADMIN_KEYS.lojistas, previousLojistas],
      [ADMIN_KEYS.visitantes, previousVisitantes],
    ] as const) {
      try {
        if (value === null) localStorage.removeItem(key);
        else localStorage.setItem(key, value);
      } catch { /* O erro original será apresentado ao operador. */ }
    }
    throw error;
  } finally {
    window.dispatchEvent(new Event("mfo-demo-store"));
  }
  return { lojistas: newLojistas.length, visitantes: newVisitantes.length };
}
