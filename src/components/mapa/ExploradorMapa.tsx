"use client";

import { useState } from "react";
import { FILTROS_INICIAIS } from "@/lib/filtros-mapa";
import MapaInterativo from "./MapaInterativo";
import Mapa3DCard from "@/components/mapa3d/Mapa3DCard";

/** Alternância 2D / 3D da página /mapa. O 3D só é carregado quando escolhido. */
export default function ExploradorMapa({ estandeInicial, vistaInicial }: { estandeInicial?: string; vistaInicial?: "2d" | "3d" }) {
  const [filtros, setFiltros] = useState(FILTROS_INICIAIS);
  const [selecionado, setSelecionado] = useState<string | null>(estandeInicial ?? null);
  const [vista, setVista] = useState<"2d" | "3d">(vistaInicial ?? (estandeInicial ? "2d" : "3d"));
  return (
    <>
      <div className="mx-auto flex w-full max-w-7xl items-center gap-3 px-4 pb-5 sm:px-6 lg:px-10">
        <span className="text-[11px] font-semibold uppercase tracking-[0.18em] text-muted">Visualização</span>
        <div className="flex rounded-full border border-line bg-paper p-0.5" role="group" aria-label="Alternar entre mapa 2D e 3D">
          {(["3d", "2d"] as const).map((v) => (
            <button
              key={v}
              type="button"
              aria-pressed={vista === v}
              onClick={() => setVista(v)}
              className={`h-11 min-w-16 rounded-full px-5 text-xs font-semibold uppercase tracking-[0.12em] transition-colors ${
                vista === v ? "bg-ink text-ivory" : "text-ink hover:text-rose-deep"
              }`}
            >
              {v}
            </button>
          ))}
        </div>
      </div>
      {vista === "2d" ? (
        <MapaInterativo estandeInicial={selecionado ?? undefined} onSelecionar={setSelecionado} filtros={filtros} onFiltrosChange={setFiltros} />
      ) : (
        <div className="mx-auto w-full max-w-7xl px-4 pb-16 sm:px-6 lg:px-10">
          <Mapa3DCard estandeInicial={selecionado ?? undefined} onSelecionarEstande={e => setSelecionado(e?.id ?? null)} filtrosExternos={filtros} onFiltrosChange={setFiltros} />
        </div>
      )}
    </>
  );
}
