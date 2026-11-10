"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "../context/AuthContext";

export default function AdminLayout({ children }) {
  const { isMaster, loading, isAuthenticated } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && (!isAuthenticated || !isMaster)) {
      router.replace(isAuthenticated ? "/" : "/login");
    }
  }, [loading, isAuthenticated, isMaster, router]);

  if (loading || !isAuthenticated || !isMaster) return null;

  return (
    <div className="mx-auto max-w-7xl px-2 py-4 sm:px-4 lg:px-6">
      {/* Barra de Navegação Tática da Câmara do Mestre */}
      <div className="mb-6 rounded-2xl border border-primary/30 bg-card/90 p-2 shadow-[0_12px_36px_rgba(0,0,0,0.4)] backdrop-blur-md">
        <div className="flex items-center justify-between px-3 py-1.5 border-b border-primary/15 mb-1.5">
          <div className="flex items-center gap-2">
            <span className="flex h-5 w-5 items-center justify-center rounded bg-amber-500/20 text-amber-400">
              <Crown size={12} />
            </span>
            <span className="font-cinzel text-[10px] font-bold uppercase tracking-[0.22em] text-amber-300">
              Console de Comando do Mestre
            </span>
          </div>
          <span className="font-journal text-xs italic text-muted-foreground hidden sm:inline">
            Gestão da mesa, encontros e crônicas
          </span>
        </div>

        <nav aria-label="Módulos da Câmara do Mestre" className="no-scrollbar flex overflow-x-auto gap-1">
          {NAV_ITEMS.map((item) => {
            const Icon = item.icon;
            const active = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                aria-current={active ? "page" : undefined}
                className={`flex shrink-0 items-center gap-2 rounded-xl px-3 py-2 text-xs font-semibold tracking-wider transition-all focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-primary ${
                  active
                    ? "border border-primary/60 bg-primary text-primary-foreground font-bold shadow-md shadow-primary/25"
                    : "text-muted-foreground hover:bg-primary/10 hover:text-foreground"
                }`}
              >
                <Icon size={14} className={active ? "text-primary-foreground" : "text-primary/70"} />
                <span className="font-cinzel">{item.label}</span>
              </Link>
            );
          })}
        </nav>
      </div>

      <div className="relative">{children}</div>
    </div>
  );
}
