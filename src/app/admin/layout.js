"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  Calendar,
  Compass,
  Crown,
  FileText,
  LayoutDashboard,
  ScrollText,
  Skull,
  Store,
  Swords,
  Users,
} from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { useEffect } from "react";

const NAV_ITEMS = [
  { href: "/admin", label: "Painel", icon: LayoutDashboard },
  { href: "/admin/campanhas", label: "Campanhas", icon: Users },
  { href: "/admin/mercado", label: "Mercado", icon: Store },
  { href: "/admin/npcs", label: "Bestiário (NPCs)", icon: Skull },
  { href: "/admin/personagens", label: "Ameaças & Heróis", icon: ScrollText },
  { href: "/admin/encontros", label: "Encontros", icon: Swords },
  { href: "/admin/mapas", label: "Mapas & Névoa", icon: Compass },
  { href: "/admin/notas", label: "Segredos & Notas", icon: FileText },
  { href: "/admin/sessoes", label: "Sessões & Cenas", icon: Calendar },
];

export default function AdminLayout({ children }) {
  const { isMaster, loading, isAuthenticated } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (!loading && (!isAuthenticated || !isMaster)) {
      router.replace(isAuthenticated ? "/" : "/login");
    }
  }, [loading, isAuthenticated, isMaster, router]);

  if (loading || !isAuthenticated || !isMaster) return null;

  return (
    <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
      <div className="mb-6 flex flex-col gap-4 border-b-2 border-primary/35 pb-4">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-primary/50 bg-primary/10 text-primary shadow-md">
              <Crown size={22} />
            </div>
            <div>
              <span className="text-[10px] font-bold uppercase tracking-[0.3em] text-primary">
                Soberania do Narrador
              </span>
              <h2 className="font-serif text-xl font-black uppercase tracking-wider text-foreground">
                Câmara do Mestre
              </h2>
            </div>
          </div>
        </div>

        {/* Barra de Navegação Rápida entre os Módulos do Mestre */}
        <nav className="no-scrollbar flex overflow-x-auto gap-1.5 rounded-xl border border-border bg-secondary/40 p-1.5">
          {NAV_ITEMS.map((item) => {
            const Icon = item.icon;
            const active = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex shrink-0 items-center gap-2 rounded-lg px-3 py-2 text-xs font-bold uppercase tracking-wider transition ${
                  active
                    ? "bg-primary text-primary-foreground shadow-md shadow-primary/20"
                    : "text-muted-foreground hover:bg-secondary hover:text-foreground"
                }`}
              >
                <Icon size={14} />
                <span>{item.label}</span>
              </Link>
            );
          })}
        </nav>
      </div>
      <div>{children}</div>
    </div>
  );
}
