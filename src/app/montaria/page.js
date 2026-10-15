"use client";

import { Footprints, Heart, Shield, Sparkles } from "lucide-react";
import { useCharacter } from "../context/CharacterContext";
import { Card, EditableNumber, EditableText, HPBar, SectionHeader } from "../components/ui";

export default function MontariaPage() {
  const { data, upd } = useCharacter();

  const hp = data.mountHP ?? 20;
  const hpMax = data.mountHPMax ?? 20;
  const hpPct = Math.round((hp / hpMax) * 100);

  const applyDamage = (amount) => {
    upd("mountHP", Math.max(0, hp - amount));
  };

  const applyHeal = (amount) => {
    upd("mountHP", Math.min(hpMax, hp + amount));
  };

  const restoreFull = () => {
    upd("mountHP", hpMax);
  };

  return (
    <div className="space-y-4">
      <Card>
        <SectionHeader title="Ficha da Montaria" icon={<Footprints size={14} />} />

        <div className="space-y-6">
          {/* Nome da Montaria */}
          <div className="flex flex-col gap-1 sm:flex-row sm:items-center">
            <span className="w-24 text-xs font-bold uppercase tracking-wider text-[#8a7355]">
              Montaria:
            </span>
            <div className="flex-1 rounded-xl border border-white/5 bg-white/[0.02] px-3 py-2">
              <EditableText
                value={data.mountName}
                onChange={(value) => upd("mountName", value)}
                className="text-base font-bold text-[#f5e9d7]"
                placeholder="Ex: Fantasma Negro, Alce Real, Corcel de Guerra..."
              />
            </div>
          </div>

          {/* Painel de Pontos de Vida (HP) */}
          <div className="rounded-xl border border-white/10 bg-white/[0.02] p-4">
            <div className="mb-3 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Heart size={16} className="text-rose-400" />
                <span className="text-xs font-bold uppercase tracking-wider text-[#f5e9d7]">
                  Vitalidade da Montaria
                </span>
              </div>
              <span className="font-mono text-xs font-semibold text-[#8a7355]">
                {hpPct}%
              </span>
            </div>

            <HPBar hp={hp} max={hpMax} />

            <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex items-center gap-2 text-sm">
                <span className="text-xs uppercase text-[#8a7355]">Vida:</span>
                <EditableNumber
                  value={hp}
                  onChange={(value) => upd("mountHP", value)}
                  className="font-mono text-lg font-bold text-[#f5e9d7]"
                  min={0}
                  max={hpMax}
                />
                <span className="text-[#8a7355]">/</span>
                <EditableNumber
                  value={hpMax}
                  onChange={(value) => upd("mountHPMax", value)}
                  className="font-mono text-sm text-[#8a7355]"
                  min={1}
                />
              </div>

              {/* Botões Rápidos de Dano e Cura */}
              <div className="flex flex-wrap items-center gap-1.5">
                <button
                  onClick={() => applyDamage(5)}
                  className="rounded-lg bg-rose-950/40 px-2.5 py-1 text-xs font-bold text-rose-300 border border-rose-800/40 hover:bg-rose-900/50 active:scale-95"
                >
                  -5
                </button>
                <button
                  onClick={() => applyDamage(1)}
                  className="rounded-lg bg-rose-950/40 px-2.5 py-1 text-xs font-bold text-rose-300 border border-rose-800/40 hover:bg-rose-900/50 active:scale-95"
                >
                  -1
                </button>
                <button
                  onClick={() => applyHeal(1)}
                  className="rounded-lg bg-emerald-950/40 px-2.5 py-1 text-xs font-bold text-emerald-300 border border-emerald-800/40 hover:bg-emerald-900/50 active:scale-95"
                >
                  +1
                </button>
                <button
                  onClick={() => applyHeal(5)}
                  className="rounded-lg bg-emerald-950/40 px-2.5 py-1 text-xs font-bold text-emerald-300 border border-emerald-800/40 hover:bg-emerald-900/50 active:scale-95"
                >
                  +5
                </button>
                <button
                  onClick={restoreFull}
                  className="flex items-center gap-1 rounded-lg border border-[#d69a3d]/40 bg-[#d69a3d]/15 px-2.5 py-1 text-xs font-semibold text-[#d69a3d] hover:bg-[#d69a3d]/25 active:scale-95"
                >
                  <Sparkles size={12} /> Restaurar Max
                </button>
              </div>
            </div>
          </div>

          {/* Anotações e Equipamentos da Montaria */}
          <div>
            <span className="mb-2 block text-xs font-bold uppercase tracking-wider text-[#8a7355]">
              Anotações, Sela & Equipamentos
            </span>
            <div className="rounded-xl border border-white/5 bg-white/[0.02] p-3">
              <EditableText
                value={data.mountNotes}
                onChange={(value) => upd("mountNotes", value)}
                className="w-full text-sm text-[#e8d5b0]"
                multiline
                placeholder="Raça, velocidade de deslocamento, capacidade de carga dos alforjes, bônus de investida..."
              />
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
}
