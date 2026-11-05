import { existsSync } from "node:fs";
import type { NextConfig } from "next";

/**
 * Planta: ver src/lib/ambiente.ts.
 * O repositório contém somente a planta ILUSTRATIVA (src/data/planta.ts e areas.ts).
 * A planta oficial fica em src/data/oficial/ (fora do Git) e só entra no build quando o arquivo
 * existe E (desenvolvimento local OU NEXT_PUBLIC_PLANTA_DETALHADA=1).
 */
const oficialDisponivel = existsSync("./src/data/oficial/planta.ts") && existsSync("./src/data/oficial/areas.ts");
const plantaOficial =
  oficialDisponivel && (process.env.NEXT_PUBLIC_PLANTA_DETALHADA === "1" || process.env.NODE_ENV !== "production");

const nextConfig: NextConfig = {
  cacheComponents: true,
  partialPrefetching: true,
  env: { NEXT_PUBLIC_PLANTA_OFICIAL: plantaOficial ? "1" : "0" },
  images: plantaOficial ? undefined : { localPatterns: [{ pathname: "/brand/**" }] },
  turbopack: {
    rules: {
      "*.css": {
        loaders: ["@tailwindcss/turbopack"],
        as: "*.css",
      },
    },
    resolveAlias: plantaOficial
      ? {
          "@/data/planta": "./src/data/oficial/planta.ts",
          "@/data/areas": "./src/data/oficial/areas.ts",
        }
      : {},
  },
};

export default nextConfig;
