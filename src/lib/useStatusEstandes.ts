"use client";
/**
 * Status dos estandes para o público (mapa 2D, 3D e indicadores).
 * Lê o store de demonstração; tudo que não foi definido pelo admin é "Não confirmado".
 * Indicadores são SEMPRE calculados a partir destes dados — nunca números fixos.
 */
import { useMemo, useSyncExternalStore } from "react";
import { ESTANDES } from "@/data/planta";
import { statusEstandes, subscribe } from "./demo-store";
import { MODO_DEMO } from "./ambiente";
import { GRUPO_DO_STATUS, STATUS_ESTANDE, type GrupoStatus, type StatusEstande } from "./types";

const KEY = "mfo.demo.estandes.v1";
const VAZIO = "{}";
const snapshot = () => {
  try {
    return window.localStorage.getItem(KEY) ?? VAZIO;
  } catch {
    return VAZIO;
  }
};

export function useStatusEstandes() {
  const raw = useSyncExternalStore(subscribe, snapshot, () => VAZIO);
  return useMemo(() => {
    const bruto: unknown = !MODO_DEMO || raw === VAZIO ? {} : statusEstandes();
    const mapa: Record<string, StatusEstande> = {};
    if (bruto && typeof bruto === "object" && !Array.isArray(bruto))
      for (const [k, v] of Object.entries(bruto as Record<string, unknown>))
        if ((STATUS_ESTANDE as readonly unknown[]).includes(v)) mapa[k] = v as StatusEstande;
    const statusDe = (id: string): StatusEstande => mapa[id] ?? "sem_informacao";
    const grupoDe = (id: string): GrupoStatus => GRUPO_DO_STATUS[statusDe(id)];
    const contagem: Record<GrupoStatus, number> = { disponivel: 0, em_analise: 0, reservado: 0, ocupado: 0, nao_confirmado: 0 };
    for (const e of ESTANDES) contagem[grupoDe(e.id)]++;
    return { statusDe, grupoDe, contagem, total: ESTANDES.length, algumDefinido: Object.keys(mapa).length > 0 };
  }, [raw]);
}
