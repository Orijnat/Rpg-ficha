"use client";

import { useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Coins, FileText, Footprints, Home, Package, ScrollText, Users } from "lucide-react";
import "./globals.css";
import { CharacterProvider, useCharacter } from "./context/CharacterContext";
import { EditableText, HPBar } from "./components/ui";
import Cabecalho from "./components/Cabecalho";

const TABS = [
  { id: "personagem", label: "Personagem", icon: <ScrollText size={15} /> },
  { id: "inventario", label: "Inventário", icon: <Package size={15} /> },
  { id: "contratos", label: "Contratos", icon: <FileText size={15} /> },
  { id: "mundo", label: "Mundo", icon: <Users size={15} /> },
  { id: "banco", label: "Banco", icon: <Coins size={15} /> },
  { id: "quarto", label: "Quarto", icon: <Home size={15} /> },
  { id: "montaria", label: "Montaria", icon: <Footprints size={15} /> },
  { id: "admin", label: "Admin", icon: <Users size={15} /> },
];

function AppChrome({ children }) {
  const pathname = usePathname();
  const { data, upd } = useCharacter();

  useEffect(() => {
    document.title = "Coração da Montanha";
  }, []);

  return (
    <div className="relative min-h-screen overflow-hidden bg-[#0b0d12] text-[#e8d5b0]" style={{ fontFamily: "'Inter', sans-serif" }}>
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(214,154,61,0.13),transparent_35%),radial-gradient(circle_at_top_right,rgba(120,97,255,0.08),transparent_30%),linear-gradient(180deg,rgba(255,255,255,0.02),transparent_18%)]" />
      <div className="pointer-events-none absolute -left-24 top-24 h-72 w-72 rounded-full bg-[#d69a3d]/10 blur-3xl" />
      <div className="pointer-events-none absolute right-0 top-80 h-96 w-96 rounded-full bg-[#4f8f6b]/10 blur-3xl" />

     <Cabecalho/>

      <nav className="sticky top-[93px] z-10 border-b border-white/10 bg-[#0b0d12]/70 backdrop-blur-xl">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
          <div className="no-scrollbar flex overflow-x-auto rounded-2xl border border-white/10 bg-white/[0.03] px-1 py-1">
            {TABS.map((item) => {
              const href = `/${item.id}`;
              const active = pathname === href;

              return (
                <Link
                  key={item.id}
                  href={href}
                  className={`flex items-center gap-2 whitespace-nowrap rounded-xl px-3 py-2 text-xs font-medium transition-all sm:px-4 ${
                    active
                      ? "bg-[#d69a3d] text-[#17140f] shadow-md shadow-[#d69a3d]/20"
                      : "text-[#a98b68] hover:bg-white/[0.04] hover:text-[#f5e9d7]"
                  }`}
                >
                  {item.icon}
                  <span className="hidden sm:inline">{item.label}</span>
                </Link>
              );
            })}
          </div>
        </div>
      </nav>

      <main className="relative mx-auto max-w-6xl px-4 py-6 sm:px-6 lg:px-8 lg:py-8">{children}</main>

      <style>{`
        .custom-scroll::-webkit-scrollbar { width: 4px; }
        .custom-scroll::-webkit-scrollbar-track { background: transparent; }
        .custom-scroll::-webkit-scrollbar-thumb { background: rgba(201,134,42,0.3); border-radius: 2px; }
        .no-scrollbar::-webkit-scrollbar { display: none; }
        .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
      `}</style>
    </div>
  );
}

export default function RootLayout({ children }) {
  return (
    <html lang="pt-BR" className="h-full antialiased">
      <body className="flex min-h-full flex-col">
        <CharacterProvider>
          <AppChrome>{children}</AppChrome>
        </CharacterProvider>
      </body>
    </html>
  );
}
