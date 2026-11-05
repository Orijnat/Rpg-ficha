"use client";

import { useEffect } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { BookOpen, Coins, FileText, Footprints, Home, Package, ScrollText, User, Users } from "lucide-react";
import { useAuth } from "../app/context/AuthContext";
import Cabecalho from "../app/components/Cabecalho";
import DiceModal from "../app/components/dice/DiceModal";
import DiceFloatingTrigger from "../app/components/dice/DiceFloatingTrigger";

const TABS = [
  { id: "personagem", label: "Personagem", icon: <ScrollText size={15} /> },
  { id: "inventario", label: "Inventário", icon: <Package size={15} /> },
  { id: "contratos", label: "Contratos", icon: <FileText size={15} /> },
  { id: "anotacoes", label: "Diário", icon: <BookOpen size={15} /> },
  { id: "mundo", label: "Mundo", icon: <Users size={15} /> },
  { id: "banco", label: "Banco", icon: <Coins size={15} /> },
  { id: "quarto", label: "Quarto", icon: <Home size={15} /> },
  { id: "montaria", label: "Montaria", icon: <Footprints size={15} /> },
  { id: "perfil", label: "Perfil", icon: <User size={15} /> },
  { id: "admin", label: "Admin", icon: <Users size={15} /> },
];

export default function AppShell({ children }) {
  const pathname = usePathname();
  const router = useRouter();
  const { isMaster, isAuthenticated, loading } = useAuth();

  const isAuthRoute = pathname === "/login" || pathname === "/registro";
  const isLandingPage = pathname === "/";
  const isStandaloneSheet = Boolean(pathname?.includes("/admin/personagens/") && pathname?.endsWith("/ficha"));
  const hideNavigation = isAuthRoute || isLandingPage || isStandaloneSheet;

  useEffect(() => {
    document.title = "Coração da Montanha";
  }, []);

  useEffect(() => {
    if (loading) return;

    if (!isAuthenticated && !isAuthRoute && pathname !== "/") {
      router.replace("/login");
    } else if (isAuthenticated && isAuthRoute) {
      router.replace(isMaster ? "/admin" : "/personagem");
    }
  }, [loading, isAuthenticated, isAuthRoute, isMaster, pathname, router]);

  return (
    <div
      className="relative min-h-screen overflow-hidden text-[var(--theme-body)] transition-colors duration-300"
      style={{
        backgroundColor: "var(--theme-bg, #0b0d12)",
        fontFamily: "'Inter', sans-serif",
      }}
    >
      <div
        className="pointer-events-none absolute inset-0 transition-opacity duration-500"
        style={{
          background:
            "radial-gradient(circle at top left, var(--theme-glow-1, rgba(214,154,61,0.13)), transparent 35%), radial-gradient(circle at top right, var(--theme-glow-2, rgba(120,97,255,0.08)), transparent 30%), linear-gradient(180deg, rgba(255,255,255,0.02), transparent 18%)",
        }}
      />
      <div
        className="pointer-events-none absolute -left-24 top-24 h-72 w-72 rounded-full blur-3xl transition-colors duration-500"
        style={{ backgroundColor: "var(--theme-glow-1, rgba(214,154,61,0.1))" }}
      />
      <div
        className="pointer-events-none absolute right-0 top-80 h-96 w-96 rounded-full blur-3xl transition-colors duration-500"
        style={{ backgroundColor: "var(--theme-glow-3, rgba(79,143,107,0.1))" }}
      />

      {!hideNavigation && <Cabecalho />}

      {!hideNavigation && (
        <nav aria-label="Navegação da ficha" className="sticky top-[93px] z-10 border-b border-border/70 bg-background/75 py-2 backdrop-blur-xl">
          <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
            <div className="no-scrollbar flex overflow-x-auto rounded-2xl border border-border/70 bg-card/60 p-1 shadow-lg shadow-black/10">
              {TABS.filter((item) => item.id !== "admin" || isMaster).map((item) => {
                const href = `/${item.id}`;
                const active = pathname === href;

                return (
                  <Link
                    key={item.id}
                    href={href}
                    aria-current={active ? "page" : undefined}
                    className={`flex min-h-11 items-center gap-2 whitespace-nowrap rounded-xl px-3 py-2 text-xs font-medium transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary sm:px-4 ${
                      active
                        ? "bg-primary text-primary-foreground shadow-md shadow-primary/25"
                        : "text-muted-foreground hover:bg-primary/10 hover:text-foreground"
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
      )}

      <main
        className={
          isAuthRoute
            ? "relative flex min-h-screen w-full items-center justify-center p-4 sm:p-6"
            : isLandingPage
              ? "relative w-full"
            : isStandaloneSheet
              ? "relative w-full"
              : "relative mx-auto max-w-6xl px-4 py-6 sm:px-6 lg:px-8 lg:py-8"
        }
      >
        {children}
      </main>

      <DiceModal />
      {!hideNavigation && <DiceFloatingTrigger />}

      <style>{`
        .custom-scroll::-webkit-scrollbar { width: 4px; }
        .custom-scroll::-webkit-scrollbar-track { background: transparent; }
        .custom-scroll::-webkit-scrollbar-thumb { background: var(--theme-accent-glow, rgba(201,134,42,0.3)); border-radius: 2px; }
        .no-scrollbar::-webkit-scrollbar { display: none; }
        .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
      `}</style>
    </div>
  );
}
