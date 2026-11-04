"use client";

import { useState, useSyncExternalStore } from "react";
import {
  historicoEstandes,
  listarLojistas,
  listarVisitantes,
  normalizarContato,
  statusEstandes,
  subscribe,
} from "@/lib/demo-store";
import type { HistoricoEstande, Lojista, StatusEstande, Visitante } from "@/lib/types";
import { ADMIN_KEYS } from "./seed";

interface AdminSnapshot {
  lojistas: Lojista[];
  visitantes: Visitante[];
  estandes: Record<string, StatusEstande>;
  historico: HistoricoEstande[];
  storageAvailable: boolean;
}

const EMPTY: AdminSnapshot = {
  lojistas: [],
  visitantes: [],
  estandes: {},
  historico: [],
  storageAvailable: true,
};
let signature: string | undefined;
let cached: AdminSnapshot = EMPTY;

function getSnapshot(): AdminSnapshot {
  try {
    const next = JSON.stringify(Object.values(ADMIN_KEYS).map(key => localStorage.getItem(key)));
    if (next !== signature) {
      signature = next;
      cached = {
        lojistas: listarLojistas(),
        visitantes: listarVisitantes(),
        estandes: statusEstandes(),
        historico: historicoEstandes(),
        storageAvailable: true,
      };
    }
  } catch {
    if (cached.storageAvailable) {
      signature = undefined;
      cached = { ...EMPTY, storageAvailable: false };
    }
  }
  return cached;
}

const getServerSnapshot = () => EMPTY;

export function useAdminStore() {
  return useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
}

export function uniqueVisitors(visitantes: Visitante[]) {
  const records = new Map<string, Visitante>();
  const counts = new Map<string, number>();
  for (const visitante of visitantes) {
    const key = normalizarContato(visitante.contato);
    counts.set(key, (counts.get(key) ?? 0) + 1);
    const previous = records.get(key);
    // Em dados legados duplicados, preserve o registro com comparecimento.
    if (!previous || (!previous.compareceu && visitante.compareceu)) records.set(key, visitante);
  }
  return { visitantes: [...records.values()], counts, duplicates: visitantes.length - records.size };
}

export function useFeedback() {
  const [feedback, setFeedback] = useState({ text: "", error: false });
  function run(action: () => void, verify: () => boolean, message: string) {
    try {
      action();
      if (!verify()) throw new Error("Gravação não confirmada");
      setFeedback({ text: message, error: false });
      return true;
    } catch {
      setFeedback({
        text: "Não foi possível confirmar a gravação local. Verifique o armazenamento do navegador e tente novamente.",
        error: true,
      });
      return false;
    }
  }
  return { feedback, run };
}
