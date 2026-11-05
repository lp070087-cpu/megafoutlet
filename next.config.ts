import { existsSync } from "node:fs";
import type { NextConfig } from "next";

/**
 * Planta: ver src/lib/ambiente.ts.
 * O repositório contém somente a planta ILUSTRATIVA (src/data/planta.ts e areas.ts).
 * A planta oficial pertence à ferramenta privada, fora desta aplicação.
 * Nem desenvolvimento nem variáveis de ambiente podem incorporá-la aqui.
 */
if (existsSync("./src/data/oficial") || existsSync("./public/planta") || process.env.NEXT_PUBLIC_PLANTA_DETALHADA === "1") {
  throw new Error("Build público bloqueado: utilize a ferramenta privada separada para os dados oficiais.");
}

const nextConfig: NextConfig = {
  cacheComponents: true,
  partialPrefetching: true,
  env: { NEXT_PUBLIC_PLANTA_OFICIAL: "0" },
  images: { localPatterns: [{ pathname: "/brand/**" }] },
  // Webpack can compile the same CSS when Turbopack workers cannot start.
  webpack(config) {
    config.module.rules.push({ test: /globals\.css$/, enforce: "pre", use: ["@tailwindcss/turbopack"] });
    return config;
  },
  turbopack: {
    rules: {
      "*.css": {
        loaders: ["@tailwindcss/turbopack"],
        as: "*.css",
      },
    },
  },
};

export default nextConfig;
