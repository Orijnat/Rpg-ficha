"use client";

import { useEffect } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  ArrowRight,
  BookOpen,
  Calendar,
  Coins,
  Compass,
  Crown,
  FileText,
  Footprints,
  Home,
  LayoutDashboard,
  Package,
  ScrollText,
  Skull,
  Sparkles,
  Store,
  Swords,
  User,
  Users,
} from "lucide-react";
import { useAuth } from "../app/context/AuthContext";
import Cabecalho from "../app/components/Cabecalho";
import DiceModal from "../app/components/dice/DiceModal";
import DiceFloatingTrigger from "../app/components/dice/DiceFloatingTrigger";

const PLAYER_TABS = [
  { id: "personagem", href: "/personagem", label: "Personagem", icon: <ScrollText size={16} /> },
  { id: "habilidades", href: "/habilidades", label: "Habilidades", icon: <Sparkles size={16} /> },
  { id: "inventario", href: "/inventario", label: "Inventário", icon: <Package size={16} /> },
  { id: "contratos", href: "/contratos", label: "Contratos", icon: <FileText size={16} /> },
  { id: "anotacoes", href: "/anotacoes", label: "Diário", icon: <BookOpen size={16} /> },
  { id: "mundo", href: "/mundo", label: "Mundo", icon: <Compass size={16} /> },
  { id: "banco", href: "/banco", label: "Banco", icon: <Coins size={16} /> },
  { id: "quarto", href: "/quarto", label: "Quarto", icon: <Home size={16} /> },
  { id: "montaria", href: "/montaria", label: "Montaria", icon: <Footprints size={16} /> },
  { id: "perfil", href: "/perfil", label: "Perfil", icon: <User size={16} /> },
];

const MASTER_NAV_ITEMS = [
  { id: "painel", href: "/admin", label: "Painel", icon: <LayoutDashboard size={16} /> },
  { id: "campanhas", href: "/admin/campanhas", label: "Campanhas", icon: <Users size={16} /> },
  { id: "mercado", href: "/admin/mercado", label: "Mercado", icon: <Store size={16} /> },
  { id: "npcs", href: "/admin/npcs", label: "Bestiário (NPCs)", icon: <Skull size={16} /> },
  { id: "personagens", href: "/admin/personagens", label: "Ameaças & Heróis", icon: <ScrollText size={16} /> },
  { id: "encontros", href: "/admin/encontros", label: "Encontros", icon: <Swords size={16} /> },
  { id: "mapas", href: "/admin/mapas", label: "Mapas & Névoa", icon: <Compass size={16} /> },
  { id: "notas", href: "/admin/notas", label: "Segredos & Notas", icon: <FileText size={16} /> },
  { id: "sessoes", href: "/admin/sessoes", label: "Sessões & Cenas", icon: <Calendar size={16} /> },
];

export default function AppShell({ children }) {
  const pathname = usePathname();
  const router = useRouter();
  const {
    isMaster,
    isAuthenticated,
    loading,
    isInspecting,
    activeCharacter,
    activeCharacterId,
    playerCharacters,
    inspectCharacter,
    stopInspecting,
  } = useAuth();

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
      data-theme={isLandingPage ? "amber" : undefined}
      className="relative min-h-screen overflow-hidden text-[var(--theme-body)] transition-colors duration-300"
      style={{
        backgroundColor: isLandingPage ? "#090b0e" : "var(--theme-bg, #0b0d12)",
        color: isLandingPage ? "#ebd9be" : "var(--theme-body, #e8d5b0)",
        fontFamily: "'Inter', sans-serif",
      }}
    >
      <div
        className="pointer-events-none absolute inset-0 transition-opacity duration-500"
        style={{
          background: isLandingPage
            ? "radial-gradient(circle at top left, rgba(214,154,61,0.13), transparent 35%), radial-gradient(circle at top right, rgba(120,97,255,0.08), transparent 30%), linear-gradient(180deg, rgba(255,255,255,0.02), transparent 18%)"
            : "radial-gradient(circle at top left, var(--theme-glow-1, rgba(214,154,61,0.13)), transparent 35%), radial-gradient(circle at top right, var(--theme-glow-2, rgba(120,97,255,0.08)), transparent 30%), linear-gradient(180deg, rgba(255,255,255,0.02), transparent 18%)",
        }}
      />
      <div
        className="pointer-events-none absolute -left-24 top-24 h-72 w-72 rounded-full blur-3xl transition-colors duration-500"
        style={{ backgroundColor: isLandingPage ? "rgba(214,154,61,0.1)" : "var(--theme-glow-1, rgba(214,154,61,0.1))" }}
      />
      <div
        className="pointer-events-none absolute right-0 top-80 h-96 w-96 rounded-full blur-3xl transition-colors duration-500"
        style={{ backgroundColor: isLandingPage ? "rgba(79,143,107,0.1)" : "var(--theme-glow-3, rgba(79,143,107,0.1))" }}
      />

      {!hideNavigation && <Cabecalho />}

      {!hideNavigation && (
        <nav
          aria-label="Navegação da ficha"
          className="sticky top-[73px] z-10 border-b border-primary/25 bg-background/95 py-2 backdrop-blur-2xl lg:fixed lg:inset-y-0 lg:left-0 lg:top-0 lg:z-30 lg:w-64 lg:border-b-0 lg:border-r lg:bg-card/95 lg:px-4 lg:py-6 lg:shadow-[4px_0_35px_rgba(0,0,0,0.85)]"
          style={{
            boxShadow: "4px 0 40px rgba(0,0,0,0.85), inset -1px 0 0 color-mix(in srgb, var(--primary) 22%, transparent)",
            backgroundImage: "radial-gradient(circle at 10% 0%, color-mix(in srgb, var(--primary) 8%, transparent) 0%, transparent 40%)"
          }}
        >
          {/* Topo exclusivo da sidebar no desktop com estética Dark Fantasy */}
          <div className="mb-5 hidden items-center gap-3 border-b border-primary/25 px-2 pb-5 lg:flex">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl border border-primary/60 bg-gradient-to-b from-primary/30 to-primary/10 text-primary shadow-[0_0_22px_color-mix(in_srgb,var(--primary)_40%,transparent)]">
              <ScrollText size={22} className="text-primary drop-shadow-[0_0_8px_var(--primary)]" />
            </div>
            <div>
              <h2 className="font-decorative text-lg font-black tracking-wider gold-gradient-text">Grimorium</h2>
              <p className="font-journal text-xs italic text-amber-100/70">Códice &amp; Sala de Guerra</p>
            </div>
          </div>

          <div className="mx-auto max-w-6xl px-3 sm:px-6 lg:max-w-none lg:px-0">

            {/* ── MESTRE: Exibe módulos do admin na sidebar ── */}
            {isMaster && !isInspecting ? (
              <>
                <div className="hidden lg:block mb-3 px-3">
                  <div className="flex items-center gap-2">
                    <span className="h-1.5 w-1.5 rotate-45 bg-amber-400 shadow-[0_0_6px_#f59e0b]" />
                    <span className="font-cinzel text-[9px] font-bold uppercase tracking-[0.25em] text-amber-300/90 flex items-center gap-1.5">
                      <Crown size={11} className="text-amber-400" /> Câmara do Mestre
                    </span>
                  </div>
                </div>

                <div className="no-scrollbar flex overflow-x-auto gap-1 lg:flex-col lg:gap-1.5 lg:overflow-visible">
                  {MASTER_NAV_ITEMS.map((item) => {
                    const active =
                      item.href === "/admin"
                        ? pathname === "/admin"
                        : pathname?.startsWith(item.href);

                    return (
                      <Link
                        key={item.id}
                        href={item.href}
                        aria-current={active ? "page" : undefined}
                        className={`group flex min-h-11 items-center gap-2.5 whitespace-nowrap rounded-xl px-3.5 py-2.5 text-xs font-medium transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-400 ${
                          active
                            ? "border border-amber-400/70 bg-gradient-to-r from-amber-500/25 via-amber-500/15 to-transparent text-amber-200 font-bold shadow-[0_0_18px_rgba(245,158,11,0.25)]"
                            : "text-muted-foreground hover:bg-amber-500/10 hover:text-amber-100 hover:border-amber-500/20 border border-transparent"
                        }`}
                      >
                        <span className={`transition-transform duration-200 group-hover:scale-110 ${active ? "text-amber-300 drop-shadow-[0_0_8px_#f59e0b]" : "opacity-75"}`}>
                          {item.icon}
                        </span>
                        <span className="font-cinzel tracking-wider">{item.label}</span>
                        {active && (
                          <span className="ml-auto hidden h-2 w-2 rotate-45 bg-amber-400 shadow-[0_0_8px_#f59e0b] lg:block" />
                        )}
                      </Link>
                    );
                  })}
                </div>
              </>
            ) : (
              <>
                {/* ── JOGADOR ou MESTRE inspecionando ficha ── */}
                <div className="hidden lg:block mb-3 px-3">
                  <div className="flex items-center gap-2">
                    <span className="h-1.5 w-1.5 rotate-45 bg-primary shadow-[0_0_6px_var(--primary)]" />
                    <span className="font-cinzel text-[9px] font-bold uppercase tracking-[0.25em] text-primary/90">
                      {isMaster ? "Ficha do Jogador" : "Folio do Jogador"}
                    </span>
                  </div>
                </div>

                <div className="no-scrollbar flex overflow-x-auto gap-1 lg:flex-col lg:gap-1.5 lg:overflow-visible">
                  {PLAYER_TABS.map((item) => {
                    const active = pathname === item.href;

                    return (
                      <Link
                        key={item.id}
                        href={item.href}
                        aria-current={active ? "page" : undefined}
                        className={`group flex min-h-11 items-center gap-2.5 whitespace-nowrap rounded-xl px-3.5 py-2.5 text-xs font-medium transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary ${
                          active
                            ? "border border-primary/70 bg-gradient-to-r from-primary/30 via-primary/15 to-transparent text-primary font-bold shadow-[0_0_20px_color-mix(in_srgb,var(--primary)_30%,transparent)]"
                            : "text-muted-foreground hover:bg-primary/10 hover:text-foreground hover:border-primary/25 border border-transparent"
                        }`}
                      >
                        <span className={`transition-transform duration-200 group-hover:scale-110 ${active ? "text-primary drop-shadow-[0_0_8px_var(--primary)]" : "opacity-75"}`}>
                          {item.icon}
                        </span>
                        <span className="font-cinzel tracking-wider">{item.label}</span>
                        {active && (
                          <span className="ml-auto hidden h-2 w-2 rotate-45 bg-primary shadow-[0_0_8px_var(--primary)] lg:block" />
                        )}
                      </Link>
                    );
                  })}

                  {/* Botão de volta ao painel quando mestre está inspecionando */}
                  {isMaster && isInspecting && (
                    <>
                      <div className="my-2.5 hidden border-t border-amber-400/25 pt-3 px-3 lg:block">
                        <span className="font-cinzel text-[9px] font-bold uppercase tracking-[0.25em] text-amber-400/90 flex items-center gap-1.5">
                          <Crown size={10} /> Mestre
                        </span>
                      </div>
                      <Link
                        href="/admin"
                        className="group flex min-h-11 items-center gap-2.5 whitespace-nowrap rounded-xl px-3.5 py-2 text-xs font-bold transition-all border border-amber-400/40 text-amber-300 hover:bg-amber-500/15 hover:border-amber-400 shadow-[0_0_15px_rgba(245,158,11,0.15)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-400"
                      >
                        <span className="transition-transform group-hover:rotate-12 text-amber-400 drop-shadow-[0_0_8px_#f59e0b]">
                          <Crown size={16} />
                        </span>
                        <span className="font-cinzel tracking-wider">Câmara do Mestre</span>
                      </Link>
                    </>
                  )}
                </div>
              </>
            )}
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
        {isInspecting && !hideNavigation && (
          <div className="mb-6 flex flex-wrap items-center justify-between gap-4 rounded-2xl border-2 border-primary/50 bg-card/95 p-4 shadow-xl backdrop-blur-md">
            <div className="flex items-center gap-3">
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-primary/50 bg-primary/20 text-primary shadow-md">
                <Crown size={22} />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-serif text-xs font-bold uppercase tracking-wider text-primary">
                    Modo Mestre · Inspecionando Ficha do Jogador
                  </span>
                  <span className="rounded-full bg-primary/20 border border-primary/40 px-2 py-0.2 text-[9px] font-bold text-primary animate-pulse">
                    Ao Vivo
                  </span>
                </div>
                <p className="text-xs text-foreground mt-0.5">
                  Visualizando e editando a ficha completa de <strong>{activeCharacter?.name}</strong>{" "}
                  {activeCharacter?.owner?.username && (
                    <span className="text-muted-foreground">
                      (Jogador: <strong className="text-foreground">{activeCharacter.owner.username}</strong>)
                    </span>
                  )}
                </p>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-2.5">
              {playerCharacters.length > 1 && (
                <div className="flex items-center gap-1.5">
                  <span className="text-[10px] font-bold uppercase text-muted-foreground hidden sm:inline">
                    Trocar Herói:
                  </span>
                  <select
                    value={activeCharacterId || ""}
                    onChange={(e) => inspectCharacter(e.target.value, false)}
                    className="min-h-9 rounded-lg border border-primary/40 bg-background/90 px-2.5 py-1 text-xs font-semibold text-foreground outline-none focus:border-primary"
                  >
                    {playerCharacters.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.name} ({c.owner?.username || "Jogador"})
                      </option>
                    ))}
                  </select>
                </div>
              )}

              <button
                type="button"
                onClick={stopInspecting}
                className="flex min-h-9 items-center gap-1.5 rounded-lg border border-border bg-secondary px-3 py-1.5 text-xs font-bold text-foreground hover:border-primary transition active:scale-95"
              >
                <span>Voltar ao Painel do Mestre</span>
                <ArrowRight size={13} />
              </button>
            </div>
          </div>
        )}
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
