import type { ReactNode } from "react";
import { notFound } from "next/navigation";
import { MODO_DEMO } from "@/lib/ambiente";
import { AdminShell } from "@/components/admin/AdminShell";

export default function AdminLayout({ children }: { children: ReactNode }) {
  // Sem autenticação e persistência reais, o painel não é exposto em produção.
  if (!MODO_DEMO) notFound();
  return <AdminShell>{children}</AdminShell>;
}
