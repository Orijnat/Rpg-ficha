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
  { id: "personagem", href: "/personagem", label: "Personagem", icon: <ScrollText size={15} /> },
  { id: "habilidades", href: "/habilidades", label: "Habilidades", icon: <Sparkles size={15} /> },
  { id: "inventario", href: "/inventario", label: "Inventário", icon: <Package size={15} /> },
  { id: "contratos", href: "/contratos", label: "Contratos", icon: <FileText size={15} /> },
  { id: "anotacoes", href: "/anotacoes", label: "Diário", icon: <BookOpen size={15} /> },
  { id: "mundo", href: "/mundo", label: "Mundo", icon: <Users size={15} /> },
  { id: "banco", href: "/banco", label: "Banco", icon: <Coins size={15} /> },
  { id: "quarto", href: "/quarto", label: "Quarto", icon: <Home size={15} /> },
  { id: "montaria", href: "/montaria", label: "Montaria", icon: <Footprints size={15} /> },
  { id: "perfil", href: "/perfil", label: "Perfil", icon: <User size={15} /> },
];

const MASTER_TABS = [
  { id: "painel", href: "/admin", label: "Painel", icon: <LayoutDashboard size={15} /> },
  { id: "campanhas", href: "/admin/campanhas", label: "Campanhas", icon: <Users size={15} /> },
  { id: "mercado", href: "/admin/mercado", label: "Mercado", icon: <Store size={15} /> },
  { id: "npcs", href: "/admin/npcs", label: "Bestiário (NPCs)", icon: <Skull size={15} /> },
  { id: "personagens", href: "/admin/personagens", label: "Ameaças & Heróis", icon: <ScrollText size={15} /> },
  { id: "encontros", href: "/admin/encontros", label: "Encontros", icon: <Swords size={15} /> },
  { id: "mapas", href: "/admin/mapas", label: "Mapas & Névoa", icon: <Compass size={15} /> },
  { id: "notas", href: "/admin/notas", label: "Segredos & Notas", icon: <FileText size={15} /> },
  { id: "sessoes", href: "/admin/sessoes", label: "Sessões & Cenas", icon: <Calendar size={15} /> },
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
          aria-label={isMaster ? "Navegação do Mestre" : "Navegação da ficha"}
          className="sticky top-[88px] z-10 border-b border-border/70 bg-background/80 py-2 backdrop-blur-xl lg:fixed lg:inset-y-0 lg:left-0 lg:top-0 lg:z-30 lg:w-64 lg:border-b-0 lg:border-r lg:bg-card/75 lg:px-4 lg:py-6 lg:shadow-xl lg:overflow-y-auto custom-scroll"
        >
          {/* Topo exclusivo da sidebar no desktop com estética Dark Fantasy */}
          <div className="mb-4 hidden items-center gap-3 border-b border-border/60 px-2 pb-5 lg:flex">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-primary/40 bg-primary/10 text-primary shadow-[0_0_15px_rgba(214,154,61,0.25)]">
              {isMaster ? <Crown size={20} /> : <ScrollText size={20} />}
            </div>
            <div>
              <h2 className="font-serif text-sm font-bold tracking-wider text-foreground">Grimorium</h2>
              <p className="text-[10px] uppercase tracking-widest text-muted-foreground">
                {isMaster ? "Câmara do Mestre" : "Grimório Digital"}
              </p>
            </div>
          </div>

          <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:max-w-none lg:px-0">
            <div className="no-scrollbar flex overflow-x-auto gap-1 lg:flex-col lg:gap-1.5 lg:overflow-visible">
              {(isMaster ? MASTER_TABS : PLAYER_TABS).map((item) => {
                const active =
                  item.href === "/admin"
                    ? pathname === "/admin"
                    : pathname === item.href || (item.href !== "/" && pathname?.startsWith(item.href));

                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    aria-current={active ? "page" : undefined}
                    className={`flex min-h-11 items-center gap-2.5 whitespace-nowrap rounded-xl px-3 py-2 text-xs font-medium transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary sm:px-4 ${
                      active
                        ? "bg-primary text-primary-foreground shadow-md shadow-primary/25 font-semibold"
                        : "text-muted-foreground hover:bg-primary/10 hover:text-foreground"
                    }`}
                  >
                    {item.icon}
                    <span className="hidden sm:inline lg:inline">{item.label}</span>
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
