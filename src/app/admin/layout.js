"use client";

import Link from "next/link";
import { Crown, LayoutDashboard, ScrollText } from "lucide-react";
import { useAuth } from "../context/AuthContext";

export default function AdminLayout({ children }) {
  const { isMaster } = useAuth();
  return (
    <div className="mx-auto max-w-6xl px-4 py-6 sm:px-6 lg:px-8">
      <div className="mb-6 flex flex-col gap-4 border-b-2 border-primary/35 pb-4 sm:flex-row sm:items-center sm:justify-between">
        <h2 className="flex items-center gap-3 font-serif text-xl font-black uppercase tracking-wider text-foreground">
          <Crown className="text-primary" />
          Câmara do Mestre
        </h2>
        {isMaster && <nav className="flex gap-2">
          <Link href="/admin" className="flex min-h-11 items-center gap-2 border border-primary/30 bg-secondary px-3 py-2 text-sm text-secondary-foreground hover:border-primary hover:text-primary">
            <LayoutDashboard size={15} /> Painel
          </Link>
          <Link href="/admin/personagens" className="flex min-h-11 items-center gap-2 border border-primary/30 bg-secondary px-3 py-2 text-sm text-secondary-foreground hover:border-primary hover:text-primary">
            <ScrollText size={15} /> Personagens
          </Link>
        </nav>}
      </div>
      <div>{children}</div>
    </div>
  );
}
