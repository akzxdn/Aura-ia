import type { Metadata } from "next";
import "./globals.css";
export const metadata: Metadata = {title:"AURA IA — Inteligência que conversa com você",description:"Um novo espaço para suas ideias. Converse, crie e descubra com a Aura.",icons:{icon:"/favicon.svg"}};
export default function RootLayout({children}:Readonly<{children:React.ReactNode}>){return <html lang="pt-BR" className="dark"><body>{children}</body></html>}
