import type { Estande } from "@/data/planta";
import type { StatusEstande } from "./types";

export interface FiltrosMapa { setor: string; dimensao: string; status: string }
export const FILTROS_INICIAIS: FiltrosMapa = { setor: "", dimensao: "", status: "" };
export function correspondeFiltro(e: Estande, filtros: FiltrosMapa, status: StatusEstande) {
  return (!filtros.setor || e.setor === filtros.setor)
    && (!filtros.dimensao || e.dimensao === filtros.dimensao)
    && (!filtros.status || status === filtros.status);
}
