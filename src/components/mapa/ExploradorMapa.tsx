import MapaInterativo from "./MapaInterativo";

export default function ExploradorMapa({ estandeInicial }: { estandeInicial?: string }) {
  return (
    <div className="mx-auto w-full max-w-5xl px-4 pb-12 sm:px-6">
      <MapaInterativo estandeInicial={estandeInicial} />
    </div>
  );
}
