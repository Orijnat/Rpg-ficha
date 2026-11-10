"use client";

import { useEffect } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  BookOpen,
  Coins,
  Compass,
  Crown,
  FileText,
  Footprints,
  Home,
  Package,
  ScrollText,
  Sparkles,
  Swords,
  User,
  Users,
} from "lucide-react";
import { useAuth } from "../app/context/AuthContext";
import Cabecalho from "../app/components/Cabecalho";
import DiceModal from "../app/components/dice/DiceModal";
import DiceFloatingTrigger from "../app/components/dice/DiceFloatingTrigger";

const PLAYER_TABS = [
  { id: "personagem", label: "Personagem", icon: <ScrollText size={16} /> },
  { id: "habilidades", label: "Habilidades", icon: <Sparkles size={16} /> },
  { id: "inventario", label: "Inventário", icon: <Package size={16} /> },
  { id: "contratos", label: "Contratos", icon: <FileText size={16} /> },
  { id: "anotacoes", label: "Diário", icon: <BookOpen size={16} /> },
  { id: "mundo", label: "Mundo", icon: <Compass size={16} /> },
  { id: "banco", label: "Banco", icon: <Coins size={16} /> },
  { id: "quarto", label: "Quarto", icon: <Home size={16} /> },
  { id: "montaria", label: "Montaria", icon: <Footprints size={16} /> },
  { id: "perfil", label: "Perfil", icon: <User size={16} /> },
];

const MASTER_TAB = { id: "admin", label: "Câmara do Mestre", icon: <Crown size={16} /> };

export default function AppShell({ children }) {
  const pathname = usePathname();
  const router = useRouter();
  const { isMaster, isAuthenticated, loading } = useAuth();

  const isAuthRoute = pathname === "/login" || pathname === "/registro";
  const isLandingPage = pathname === "/";
  const isStandaloneSheet = Boolean(pathname?.includes("/admin/personagens/") && pathname?.endsWith("/ficha"));
  const hideNavigation = isAuthRoute || isLandingPage || isStandaloneSheet;

  useEffect(() => {
    document.title = "Grimorium";
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
        <nav
          aria-label="Navegação da ficha"
          className="sticky top-[73px] z-10 border-b border-border/80 bg-background/90 py-2 backdrop-blur-xl lg:fixed lg:inset-y-0 lg:left-0 lg:top-0 lg:z-30 lg:w-64 lg:border-b-0 lg:border-r lg:bg-card/90 lg:px-4 lg:py-6 lg:shadow-2xl"
        >
          {/* Topo exclusivo da sidebar no desktop com estética Dark Fantasy */}
          <div className="mb-5 hidden items-center gap-3 border-b border-primary/20 px-2 pb-5 lg:flex">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl border border-primary/45 bg-primary/10 text-primary shadow-[0_0_18px_color-mix(in_srgb,var(--primary)_25%,transparent)]">
              <ScrollText size={22} />
            </div>
            <div>
              <h2 className="font-cinzel text-base font-bold tracking-wider text-foreground">Grimorium</h2>
              <p className="font-journal text-[11px] italic text-muted-foreground">Códice & Sala de Guerra</p>
            </div>
          </div>

          <div className="mx-auto max-w-6xl px-3 sm:px-6 lg:max-w-none lg:px-0">
            {/* Seção Desktop: Grimório do Jogador */}
            <div className="hidden lg:block mb-2 px-3">
              <span className="font-cinzel text-[9px] font-bold uppercase tracking-[0.25em] text-muted-foreground/75">
                Folio do Jogador
              </span>
            </div>

            <div className="no-scrollbar flex overflow-x-auto gap-1 lg:flex-col lg:gap-1 lg:overflow-visible">
              {PLAYER_TABS.map((item) => {
                const href = `/${item.id}`;
                const active = pathname === href;

                return (
                  <Link
                    key={item.id}
                    href={href}
                    aria-current={active ? "page" : undefined}
                    className={`group flex min-h-11 items-center gap-2.5 whitespace-nowrap rounded-xl px-3 py-2 text-xs font-medium transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary sm:px-3.5 ${
                      active
                        ? "border border-primary/50 bg-primary/20 text-primary font-bold shadow-md shadow-primary/15"
                        : "text-muted-foreground hover:bg-primary/10 hover:text-foreground"
                    }`}
                  >
                    <span className={`transition-transform group-hover:scale-110 ${active ? "text-primary" : "opacity-75"}`}>
                      {item.icon}
                    </span>
                    <span className="font-cinzel tracking-wider">{item.label}</span>
                    {active && (
                      <span className="ml-auto hidden h-1.5 w-1.5 rounded-full bg-primary shadow-[0_0_6px_var(--primary)] lg:block" />
                    )}
                  </Link>
                );
              })}

              {/* Seção do Mestre (quando autenticado como mestre) */}
              {isMaster && (
                <>
                  <div className="my-2 hidden border-t border-primary/20 pt-3 px-3 lg:block">
                    <span className="font-cinzel text-[9px] font-bold uppercase tracking-[0.25em] text-amber-400/90 flex items-center gap-1.5">
                      <Crown size={12} /> Narrador
                    </span>
                  </div>

                  <Link
                    href="/admin"
                    aria-current={pathname?.startsWith("/admin") ? "page" : undefined}
                    className={`group flex min-h-11 items-center gap-2.5 whitespace-nowrap rounded-xl px-3 py-2 text-xs font-bold transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-400 sm:px-3.5 ${
                      pathname?.startsWith("/admin")
                        ? "border border-amber-400/60 bg-amber-500/20 text-amber-300 shadow-md shadow-amber-500/20"
                        : "border border-amber-400/20 text-amber-400/80 hover:bg-amber-500/10 hover:text-amber-300"
                    }`}
                  >
                    <span className="transition-transform group-hover:rotate-6 text-amber-400">
                      {MASTER_TAB.icon}
                    </span>
                    <span className="font-cinzel tracking-wider">{MASTER_TAB.label}</span>
                    {pathname?.startsWith("/admin") && (
                      <span className="ml-auto hidden h-1.5 w-1.5 rounded-full bg-amber-400 shadow-[0_0_6px_#f59e0b] lg:block" />
                    )}
                  </Link>
                </>
              )}
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
              : "relative mx-auto max-w-6xl px-4 py-6 sm:px-6 lg:ml-64 lg:max-w-none lg:px-10 lg:py-8"
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
