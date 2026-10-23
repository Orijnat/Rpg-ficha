"use client";

import { Check, CloudOff, Crown, LoaderCircle, Sparkles, Sword, TriangleAlert, Package } from "lucide-react";
import Link from "next/link";
import { useCharacter } from "../context/CharacterContext";
import { Card, EditableText, SectionHeader, StatBox } from "../components/ui";
import Aparencia from "../components/Aparencia";
import Pericia from "../components/Pericia";
import BarraHp from "../components/BarrraHp";
import RecursosCombate from "../components/RecursosCombate";
import { calculateCapacity } from "../../lib/modifiers";

export default function Personagem() {
  const { data, upd, syncStatus } = useCharacter();
  const capacity = calculateCapacity(data);

  const syncLabels = {
    idle: null,
    saving: { label: "Salvando...", Icon: LoaderCircle, className: "text-primary" },
    saved: { label: "Salvo", Icon: Check, className: "text-emerald-400" },
    offline: { label: "Salvo localmente", Icon: CloudOff, className: "text-amber-300" },
    error: { label: "Falha ao sincronizar", Icon: TriangleAlert, className: "text-rose-300" },
  };
  const syncIndicator = syncLabels[syncStatus];

  return (
    <div className="space-y-5">
      <Card className="bg-gradient-to-br from-card via-card/80 to-primary/5 p-5 sm:p-6">
        <div className="flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
          <div className="min-w-0">
            <div className="mb-2 flex items-center gap-2 text-[10px] font-semibold uppercase tracking-[0.3em] text-primary">
              <Crown size={13} />
              Registro do aventureiro
            </div>
            <h2 className="font-serif text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
              <EditableText value={data.name} onChange={(value) => upd("name", value)} />
            </h2>
            <p className="mt-2 flex items-center gap-2 text-sm text-muted-foreground">
              <Sparkles size={14} className="text-primary" />
              Um novo capítulo aguarda ser escrito.
            </p>
          </div>
          <div className="flex flex-col gap-2 sm:items-end">
            {syncIndicator && (
              <span className={`flex items-center gap-1.5 text-[10px] font-semibold uppercase tracking-wider ${syncIndicator.className}`} role="status">
                <syncIndicator.Icon size={13} className={syncStatus === "saving" ? "animate-spin" : ""} />
                {syncIndicator.label}
              </span>
            )}
            <div className="grid grid-cols-2 gap-2 sm:min-w-52">
              <div className="rounded-xl border border-white/10 bg-background/40 p-3">
                <span className="block text-[10px] uppercase tracking-wider text-muted-foreground">Nível</span>
                <span className="font-serif text-xl font-bold text-foreground">{data.level || 1}</span>
              </div>
              <div className="rounded-xl border border-white/10 bg-background/40 p-3">
                <span className="block text-[10px] uppercase tracking-wider text-muted-foreground">Ofício</span>
                <EditableText value={data.customClass || data.job || "Aventureiro"} onChange={(value) => upd("customClass", value)} className="font-serif text-sm font-semibold text-foreground" />
              </div>
            </div>
          </div>
        </div>

        {/* Barra resumida de Carga do Inventário */}
        <div className="mt-4 flex flex-wrap items-center justify-between gap-2 border-t border-white/10 pt-3 text-xs">
          <Link
            href="/inventario"
            className="flex items-center gap-1.5 font-medium text-muted-foreground hover:text-primary transition"
          >
            <Package size={13} className="text-primary" />
            <span>Carga da Mochila:</span>
            <strong className={`font-mono ${capacity.isOverloaded ? "text-rose-400" : "text-foreground"}`}>
              {capacity.carried} / {capacity.max} unidades
            </strong>
            {capacity.isOverloaded && (
              <span className="rounded bg-rose-500/20 px-1.5 py-0.5 text-[10px] font-bold text-rose-300">
                Sobrecarregado!
              </span>
            )}
          </Link>
          <div className="h-1.5 w-32 overflow-hidden rounded-full border border-white/10 bg-background/60">
            <div
              className={`h-full transition-all duration-300 ${
                capacity.isOverloaded
                  ? "bg-rose-500"
                  : capacity.percentage > 80
                  ? "bg-amber-400"
                  : "bg-primary"
              }`}
              style={{ width: `${capacity.percentage}%` }}
            />
          </div>
        </div>
      </Card>

      <Card>
        <SectionHeader title="Atributos" icon={<Sword size={14} />} />
        <div className="grid grid-cols-4 gap-2 sm:grid-cols-7">
          {["FOR", "DES", "CON", "SAB", "ESP", "CAR", "INT"].map((attr) => (
            <StatBox key={attr} label={attr} value={data[attr]} onChange={(value) => upd(attr, value)} />
          ))}
        </div>
      </Card>

      {/* Seção de Vitalidade & Recursos Especiais */}
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <Card className="border-rose-400/20 bg-gradient-to-r from-rose-950/20 via-card/75 to-card/75">
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
