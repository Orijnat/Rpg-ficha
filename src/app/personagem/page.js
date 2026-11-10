"use client";

import { Check, CloudOff, Crown, LoaderCircle, RefreshCw, Sparkles, Sword, TriangleAlert, Package } from "lucide-react";
import Link from "next/link";
import { useCharacter } from "../context/CharacterContext";
import { Card, EditableText, SectionHeader, StatBox } from "../components/ui";
import Aparencia from "../components/Aparencia";
import Pericia from "../components/Pericia";
import RecursosCombate from "../components/RecursosCombate";
import { calculateCapacity } from "../../lib/modifiers";
import { DEFAULT_ABILITIES, isHabilidadeDesbloqueada } from "../../lib/abilities";

export default function Personagem() {
  const { data, upd, syncStatus, syncError, retrySync } = useCharacter();
  const capacity = calculateCapacity(data);
  const abilities = Array.isArray(data.abilities) ? data.abilities : [];
  const characterLevel = Math.max(1, Number(data.level) || 1);
  const activeTraining = abilities.find((h) => h.isTraining && (h.approvalStatus || "aprovada") === "aprovada");
  const unlockedCount = abilities.filter((h) => isHabilidadeDesbloqueada(h, characterLevel) && (h.approvalStatus || "aprovada") === "aprovada").length;

  const syncLabels = {
    idle: null,
    saving: { label: "Salvando...", Icon: LoaderCircle, className: "text-primary" },
    saved: { label: "Salvo", Icon: Check, className: "text-emerald-400" },
    offline: { label: "Salvo localmente", Icon: CloudOff, className: "text-amber-300" },
    error: { label: "Falha ao sincronizar", Icon: TriangleAlert, className: "text-rose-300" },
    conflict: { label: "Conflito: revisão necessária", Icon: TriangleAlert, className: "text-amber-300" },
  };
  const syncIndicator = syncLabels[syncStatus];

  return (
    <div className="space-y-5">
      {/* Folio Header do Personagem */}
      <Card className="p-5 sm:p-7">
        <div className="flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
          <div className="min-w-0">
            <div className="mb-2 flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.3em] text-primary">
              <Crown size={14} />
              Registro do aventureiro
            </div>
            <h2 className="font-cinzel text-3xl sm:text-5xl font-black tracking-tight text-foreground">
              <EditableText value={data.name} onChange={(value) => upd("name", value)} label="Nome do aventureiro" />
            </h2>
            <p className="mt-2 flex items-center gap-2 font-journal text-sm sm:text-base italic text-muted-foreground">
              <Sparkles size={14} className="text-primary" />
              Um novo capítulo aguarda ser inscrito neste códice.
            </p>
          </div>
          <div className="flex flex-col gap-2.5 sm:items-end">
            {syncIndicator && (
              <span className={`flex items-center gap-1.5 text-[10px] font-semibold uppercase tracking-wider ${syncIndicator.className}`} role="status" aria-live="polite">
                <syncIndicator.Icon size={13} className={syncStatus === "saving" ? "animate-spin" : ""} />
                {syncIndicator.label}
                {(syncStatus === "error" || syncStatus === "conflict") && (
                  <button type="button" onClick={retrySync} className="ml-1 inline-flex min-h-8 items-center gap-1 rounded px-2 text-[10px] underline underline-offset-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary" aria-label="Tentar sincronizar novamente">
                    <RefreshCw size={11} aria-hidden="true" /> Tentar novamente
                  </button>
                )}
              </span>
            )}
            <div className="grid grid-cols-2 gap-2 sm:min-w-56">
              <div className="medallion-plate rounded-xl p-2.5 text-center">
                <span className="block font-cinzel text-[10px] uppercase tracking-wider text-muted-foreground">Nível</span>
                <span className="font-cinzel text-xl sm:text-2xl font-black text-primary font-tabular">{data.level || 1}</span>
              </div>
              <div className="medallion-plate rounded-xl p-2.5 text-center">
                <span className="block font-cinzel text-[10px] uppercase tracking-wider text-muted-foreground">Ofício / Classe</span>
                <EditableText value={data.customClass || data.job || "Aventureiro"} onChange={(value) => upd("customClass", value)} className="font-cinzel text-xs sm:text-sm font-bold text-foreground" label="Classe ou ofício" />
              </div>
            </div>
          </div>
        </div>

        {/* Barra resumida de Carga do Inventário */}
        <div className="mt-5 flex flex-wrap items-center justify-between gap-2 border-t border-primary/20 pt-3.5 text-xs">
          <Link
            href="/inventario"
            className="flex items-center gap-2 font-medium text-muted-foreground hover:text-primary transition"
          >
            <Package size={14} className="text-primary" />
            <span className="font-cinzel text-[11px] uppercase tracking-wider">Carga da Mochila:</span>
            <strong className={`font-mono font-tabular ${capacity.isOverloaded ? "text-rose-400" : "text-foreground"}`}>
              {capacity.carried} / {capacity.max} unidades
            </strong>
            {capacity.isOverloaded && (
              <span className="wax-seal bg-rose-950/70 text-rose-300 border border-rose-500/50">
                Sobrecarregado!
              </span>
            )}
          </Link>
          <div className="relative h-2 w-32 sm:w-44 overflow-hidden rounded-full border border-white/10 bg-black/60 p-0.5">
            <div
              className={`h-full rounded-full transition-all duration-300 ${
                capacity.isOverloaded
                  ? "bg-rose-500 shadow-[0_0_8px_#f43f5e]"
                  : capacity.percentage > 80
                  ? "bg-amber-400 shadow-[0_0_8px_#fbbf24]"
                  : "bg-primary shadow-[0_0_8px_var(--primary)]"
              }`}
              style={{ width: `${capacity.percentage}%` }}
            />
          </div>
        </div>

        {/* Atalho de Habilidades & Treinamento */}
        <div className="mt-3 flex flex-wrap items-center justify-between gap-2 border-t border-primary/15 pt-3 text-xs">
          <Link
            href="/habilidades"
            className="flex items-center gap-2 font-medium text-muted-foreground hover:text-primary transition"
          >
            <Sparkles size={14} className="text-amber-400" />
            <span className="font-cinzel text-[11px] uppercase tracking-wider">Grimório de Habilidades:</span>
            <strong className="text-foreground font-tabular">
              {unlockedCount} / {abilities.length} despertadas
            </strong>
            {activeTraining && (
              <span className="wax-seal bg-amber-500/20 text-amber-300 border border-amber-400/40">
                🎯 Treino: {activeTraining.name} ({activeTraining.trainingHours || 0}h)
              </span>
            )}
          </Link>
          <Link
            href="/habilidades"
            className="font-cinzel text-[11px] font-bold text-primary underline underline-offset-4 hover:text-primary/80 transition"
          >
            Ver Grimório Completo →
          </Link>
        </div>
      </Card>

      {/* Atributos Fundamentais */}
      <Card>
        <SectionHeader
          title="Atributos Fundamentais"
          subtitle="Os 7 pilares arcanos que definem suas rolagens d20"
          icon={<Sword size={15} />}
        />
        <div className="grid grid-cols-4 gap-2 sm:grid-cols-7 sm:gap-3">
          {["FOR", "DES", "CON", "SAB", "ESP", "CAR", "INT"].map((attr) => (
            <StatBox key={attr} label={attr} value={data[attr]} onChange={(value) => upd(attr, value)} />
          ))}
        </div>
      </Card>

      {/* Seção de Vitalidade & Recursos Especiais */}
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <Card className="border-rose-500/30 bg-gradient-to-br from-rose-950/20 via-card to-card">
          <BarraHp />
        </Card>
        <Card>
          <RecursosCombate />
        </Card>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <Card><Aparencia /></Card>
        <Card><Pericia /></Card>
      </div>
    </div>
  );
}
