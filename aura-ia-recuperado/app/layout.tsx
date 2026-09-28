import type { Metadata } from "next";
import localFont from "next/font/local";
import "./globals.css";
const display = localFont({
  src: "../public/fonts/Syne-Variable.ttf",
  variable: "--font-display",
  display: "swap",
  weight: "400 800",
});
const body = localFont({
  src: "../public/fonts/Manrope-Variable.ttf",
  variable: "--font-body",
  display: "swap",
  weight: "200 800",
});
export const metadata: Metadata = {
  title: "AURA IA — Inteligência que conversa com você",
  description:
    "Um novo espaço para suas ideias. Converse, crie e descubra com a Aura.",
  icons: { icon: "/favicon.svg" },
};
export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="pt-BR" className={`dark ${display.variable} ${body.variable}`}>
      <body>{children}</body>
    </html>
  );
}
