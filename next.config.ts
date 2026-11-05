import type { NextConfig } from "next";

/**
 * Planta detalhada: ver src/lib/ambiente.ts. No build público, os módulos com a planta
 * (numeração, dimensões e coordenadas) são trocados por versões vazias e o otimizador de
 * imagens só aceita a pasta da marca, para que nada da planta oficial seja publicado.
 */
const plantaDetalhada =
  process.env.NEXT_PUBLIC_PLANTA_DETALHADA === "1" || process.env.NODE_ENV !== "production";

const nextConfig: NextConfig = {
  cacheComponents: true,
  partialPrefetching: true,
  images: plantaDetalhada ? undefined : { localPatterns: [{ pathname: "/brand/**" }] },
  turbopack: {
    rules: {
      "*.css": {
        loaders: ["@tailwindcss/turbopack"],
        as: "*.css",
      },
    },
    resolveAlias: plantaDetalhada
      ? {}
      : {
          "@/data/planta": "./src/data/publico/planta.ts",
          "@/data/areas": "./src/data/publico/areas.ts",
        },
  },
};

export default nextConfig;
