import type { ReactNode } from "react";
import { notFound } from "next/navigation";
import { ADMIN_DEMO } from "@/lib/ambiente";
import { AdminShell } from "@/components/admin/AdminShell";
import type { Metadata } from "next";

export const metadata: Metadata = { title: "Painel (demonstração)", robots: { index: false, follow: false } };

export default function AdminLayout({ children }: { children: ReactNode }) {
  if (!ADMIN_DEMO) notFound();
  return <AdminShell>{children}</AdminShell>;
}
