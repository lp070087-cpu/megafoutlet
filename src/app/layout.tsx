import type { Metadata, Viewport } from "next";
import localFont from "next/font/local";
import "./globals.css";
import SmoothScroll from "@/components/motion/SmoothScroll";

const manrope = localFont({
  src: "./fonts/manrope-latin.woff2",
  weight: "200 800",
  variable: "--font-manrope",
  display: "swap",
});

const bodoni = localFont({
  src: [
    { path: "./fonts/bodoni-moda-latin.woff2", weight: "400 900", style: "normal" },
    { path: "./fonts/bodoni-moda-latin-italic.woff2", weight: "400 900", style: "italic" },
  ],
  variable: "--font-bodoni",
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    default: "Mega Fashion Outlet · 20 a 24 de novembro de 2026 · Olinda",
    template: "%s · Mega Fashion Outlet",
  },
  description:
    "Mega Fashion Outlet — moda, beleza, artesanato e serviços. 20 a 24 de novembro de 2026, das 10h às 22h, no Centro de Convenções de Pernambuco, Olinda.",
};

export const viewport: Viewport = {
  themeColor: "#faf7f2",
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="pt-BR" className={`${manrope.variable} ${bodoni.variable} h-full antialiased`}>
      <body className="min-h-full flex flex-col">
        <SmoothScroll />
        {children}
      </body>
    </html>
  );
}
