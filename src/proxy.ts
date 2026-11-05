import { NextResponse } from "next/server";
import { PLANTA_DETALHADA } from "@/lib/ambiente";

/**
 * Bloqueia os arquivos da planta oficial (public/planta/*) enquanto a divulgação
 * detalhada não for autorizada. Ver src/lib/ambiente.ts.
 */
export function proxy() {
  if (PLANTA_DETALHADA) return NextResponse.next();
  return new NextResponse("Not found", { status: 404, headers: { "cache-control": "no-store" } });
}

export const config = {
  matcher: "/planta/:path*",
};
