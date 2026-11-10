"use client";

import React from "react";
import { Shield } from "lucide-react";
import { SectionHeader, HPBar, EditableNumber } from "./ui";
import { useCharacter } from "../context/CharacterContext";
import { useAuth } from "../context/AuthContext";

export default function BarrraHp() {
  const { data, upd } = useCharacter();
  const { isMaster } = useAuth();

  const hp = Number(data.hp) || 0;
  const hpMax = Math.max(1, Number(data.hpMax) || 1);
  const pct = Math.round((hp / hpMax) * 100);

  const statusLabel =
    pct <= 0
      ? "Inconsciente (0 PV)"
      : pct <= 25
      ? "À beira da morte!"
      : pct <= 50
      ? "Ferido em combate"
      : "Íntegro";

  const statusColor =
    pct <= 25 ? "text-rose-400" : pct <= 50 ? "text-amber-400" : "text-emerald-400";

  return (
    <div>
      <div className="flex items-center justify-between mb-1">
        <SectionHeader
          title="Pontos de Vida"
          subtitle="Reserva vital contra ferimentos letais"
          icon={<Shield size={14} />}
        />
      </div>

      <div className="mb-3 flex items-center gap-2 sm:gap-3">
        <button
          type="button"
          aria-label="Reduzir 1 ponto de vida"
          className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-rose-500/40 bg-rose-950/40 font-mono text-lg font-bold text-rose-300 transition-all hover:bg-rose-900/60 active:scale-95"
          onClick={() => upd("hp", Math.max(0, hp - 1))}
          title="Dano -1 PV"
        >
          −
        </button>
        <div className="flex-1">
          <HPBar hp={hp} max={hpMax} />
        </div>
        <button
          type="button"
          aria-label="Recuperar 1 ponto de vida"
          className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-emerald-500/40 bg-emerald-950/40 font-mono text-lg font-bold text-emerald-300 transition-all hover:bg-emerald-900/60 active:scale-95"
          onClick={() => upd("hp", Math.min(hpMax, hp + 1))}
          title="Cura +1 PV"
        >
          +
        </button>
      </div>

      <div className="flex flex-wrap items-center justify-between gap-2 text-xs">
        <div className="flex items-center gap-1.5">
          <span className="font-cinzel text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
            Vitalidade:
          </span>
          <EditableNumber
            value={hp}
            onChange={(value) => upd("hp", value)}
            className="font-mono text-sm font-bold text-foreground font-tabular"
            min={0}
            max={hpMax}
            label="PV Atual"
          />
          <span className="text-muted-foreground font-mono">/</span>
          <EditableNumber
            value={hpMax}
            onChange={(value) => upd("hpMax", value)}
            className="font-mono text-sm font-bold text-muted-foreground font-tabular"
            min={1}
            disabled={!isMaster}
            label="HP Máximo"
          />
          <span className="text-[10px] text-muted-foreground uppercase tracking-wider font-cinzel">PV</span>
        </div>

        <span className={`wax-seal bg-black/40 border border-white/10 ${statusColor}`}>
          {statusLabel}
        </span>
      </div>
    </div>
  );
}