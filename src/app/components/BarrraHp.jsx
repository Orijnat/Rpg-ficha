"use client";

import React from "react";
import { Shield } from "lucide-react";
import { SectionHeader, HPBar, EditableNumber } from "./ui";
import { useCharacter } from "../context/CharacterContext";

export default function BarrraHp() {
  const { data, upd } = useCharacter();

  return (
    <div>
      <SectionHeader title="Pontos de Vida" icon={<Shield size={14} />} />
      <div className="mb-3 flex items-center gap-3">
        <button
          className="flex h-9 w-9 items-center justify-center rounded-lg border border-destructive/40 bg-destructive/20 text-lg text-foreground transition-all hover:bg-destructive/40 active:scale-95"
          onClick={() => upd("hp", Math.max(0, data.hp - 1))}
        >
          −
        </button>
        <div className="flex-1">
          <HPBar hp={data.hp} max={data.hpMax} />
        </div>
        <button
          className="flex h-9 w-9 items-center justify-center rounded-lg border border-emerald-400/30 bg-emerald-900/40 text-lg text-foreground transition-all hover:bg-emerald-800/60 active:scale-95"
          onClick={() => upd("hp", Math.min(data.hpMax, data.hp + 1))}
        >
          +
        </button>
      </div>
      <div className="flex items-center gap-2 text-sm">
        <span className="font-serif text-xs font-semibold uppercase tracking-wider text-muted-foreground">Vitalidade</span>
        <EditableNumber value={data.hp} onChange={(value) => upd("hp", value)} className="font-bold text-foreground" min={0} max={data.hpMax} />
        <span className="text-muted-foreground">/</span>
        <EditableNumber value={data.hpMax} onChange={(value) => upd("hpMax", value)} className="text-muted-foreground" min={1} />
      </div>
    </div>
  );
}