import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "@/contexts/AuthContext";
import { CondominioProvider } from "@/contexts/CondominioContext";
import { TooltipProvider } from "@/components/ui/tooltip";

const inter = Inter({ subsets: ["latin"], variable: "--font-sans" });

export const metadata: Metadata = {
  title: "CondoGest - Sistema de Gestão Condominial",
  description: "Sistema completo de gestão condominial com módulo financeiro e Kanban integrados. Gerencie seu condomínio de forma moderna e eficiente.",
  keywords: ["condomínio", "gestão", "financeiro", "kanban", "administração", "saas"],
  authors: [{ name: "CondoGest" }],
  openGraph: {
    title: "CondoGest - Sistema de Gestão Condominial",
    description: "Sistema completo de gestão condominial com módulo financeiro e Kanban integrados.",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-BR" suppressHydrationWarning>
      <body className={`${inter.variable} font-sans antialiased`}>
        <AuthProvider>
          <CondominioProvider>
            <TooltipProvider>
              {children}
            </TooltipProvider>
          </CondominioProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
