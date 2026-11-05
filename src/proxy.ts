import { NextResponse, type NextRequest } from "next/server";
import { ADMIN_DEMO } from "@/lib/ambiente";

/** Bloqueia os caminhos privados antes de iniciar a resposta da página. */
export function proxy(request: NextRequest) {
  const path = request.nextUrl.pathname;
  if (ADMIN_DEMO && (path === "/admin" || path.startsWith("/admin/"))) return NextResponse.next();
  return new NextResponse("Not found", { status: 404, headers: { "cache-control": "no-store" } });
}

export const config = {
  matcher: ["/planta/:path*", "/admin/:path*"],
};
