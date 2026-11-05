import type { ReactNode } from "react";
import { notFound } from "next/navigation";
import { MODO_DEMO } from "@/lib/ambiente";
import { AdminShell } from "@/components/admin/AdminShell";
import type { Metadata } from "next";

export const metadata: Metadata = { title: "Painel (demonstração)", robots: { index: false, follow: false } };

export default function AdminLayout({ children }: { children: ReactNode }) {
  // Painel de DEMONSTRAÇÃO: dados fictícios + cadastros deste navegador. Com NEXT_PUBLIC_MODO_DEMO=0, responde 404.
  if (!MODO_DEMO) notFound();
  return <AdminShell>{children}</AdminShell>;
}
