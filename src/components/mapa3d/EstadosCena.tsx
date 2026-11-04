"use client";

import Image from "next/image";
import Link from "next/link";
import { Component, type ReactNode } from "react";

export function SkeletonCena() {
  return (
    <div role="status" className="flex h-full min-h-96 flex-col items-center justify-center bg-sand px-6 text-center">
      <div aria-hidden="true" className="grid grid-cols-5 gap-2 opacity-40 motion-safe:animate-pulse">
        {Array.from({ length: 20 }, (_, index) => (
          <span key={index} className="h-5 w-7 rounded-sm border border-line bg-paper sm:h-7 sm:w-10" />
        ))}
      </div>
      <p className="mt-7 font-display text-2xl text-graphite">Preparando seu olhar sobre a feira.</p>
      <p className="mt-2 text-xs text-muted">A visualização 3D carrega ao se aproximar desta seção.</p>
    </div>
  );
}

export function Fallback2D() {
  return (
    <div className="flex h-full min-h-96 flex-col items-center justify-center gap-5 bg-sand p-6 text-center">
      <div className="relative h-56 w-full max-w-sm">
        <Image
          src="/planta/planta-oficial.webp"
          alt="Planta oficial do Mega Fashion Outlet, disponível no mapa 2D"
          fill
          sizes="(max-width: 640px) 90vw, 384px"
          className="object-contain"
        />
      </div>
      <p className="max-w-md text-sm leading-6 text-muted">A visualização 3D não está disponível neste navegador. Você pode consultar a planta e os espaços no mapa 2D.</p>
      <Link href="/mapa" className="inline-flex min-h-12 items-center rounded-full bg-rose px-6 text-sm font-semibold text-white hover:bg-rose-deep">
        Abrir planta 2D →
      </Link>
    </div>
  );
}

export class LimiteCena extends Component<{
  children: ReactNode;
  fallback: ReactNode;
}, { falhou: boolean }> {
  state = { falhou: false };

  static getDerivedStateFromError() {
    return { falhou: true };
  }

  render() {
    return this.state.falhou ? this.props.fallback : this.props.children;
  }
}
