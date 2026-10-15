"use client";

import { BookOpen, Compass } from "lucide-react";
import Anotacoes from "../components/Anotacoes";

export default function AnotacoesPage() {
  return (
    <div className="space-y-5">
      <div className="rounded-2xl border border-primary/20 bg-card/70 p-5 shadow-[0_18px_60px_rgba(0,0,0,0.24)] sm:p-6">
        <div className="flex items-center gap-2 text-[10px] font-semibold uppercase tracking-[0.3em] text-primary">
          <Compass size={14} />
          Arquivo de campanha
        </div>
        <h1 className="mt-2 flex items-center gap-3 font-serif text-3xl font-bold text-foreground sm:text-4xl">
          <BookOpen className="text-primary" />
          Diário de campanha
        </h1>
        <p className="mt-2 max-w-2xl text-sm text-muted-foreground">
          Registre pistas, magias, mapas e memórias da jornada como páginas de um diário.
        </p>
      </div>
      <Anotacoes />
    </div>
  );
}
