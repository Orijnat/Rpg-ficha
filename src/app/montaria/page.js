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
        <SectionHeader
          title="Ficha da Montaria"
          subtitle="Companheiro de viagem, corcel de guerra ou criatura alada"
          icon={<Footprints size={15} />}
        />

        <div className="space-y-6">
          {/* Nome da Montaria */}
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
            <span className="w-28 font-cinzel text-xs font-bold uppercase tracking-wider text-muted-foreground">
              Montaria:
            </span>
            <div className="flex-1 rounded-xl border border-primary/25 bg-background/50 px-3.5 py-2.5">
              <EditableText
                value={data.mountName}
                onChange={(value) => upd("mountName", value)}
                className="font-cinzel text-base sm:text-lg font-bold text-foreground"
                placeholder="Ex: Fantasma Negro, Alce Real, Corcel de Guerra..."
                label="Nome da montaria"
              />
            </div>
          </div>

          {/* Painel de Pontos de Vida (HP) */}
          <div className="rounded-2xl border border-primary/20 bg-background/60 p-4 sm:p-5 shadow-inner">
            <div className="mb-3 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Heart size={16} className="text-rose-400" />
                <span className="font-cinzel text-xs font-bold uppercase tracking-wider text-foreground">
                  Vitalidade da Montaria
                </span>
              </div>
              <span className="font-mono text-xs font-bold text-muted-foreground font-tabular">
                {hpPct}%
              </span>
            </div>

            <HPBar hp={hp} max={hpMax} />

            <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex items-center gap-2 text-sm">
                <span className="font-cinzel text-xs uppercase text-muted-foreground">Vida:</span>
                <EditableNumber
                  value={hp}
                  onChange={(value) => upd("mountHP", value)}
                  className="font-mono text-lg font-bold text-foreground font-tabular"
                  min={0}
                  max={hpMax}
                  label="PV Atual da Montaria"
                />
                <span className="text-muted-foreground">/</span>
                <EditableNumber
                  value={hpMax}
                  onChange={(value) => upd("mountHPMax", value)}
                  className="font-mono text-sm text-muted-foreground font-tabular"
                  min={1}
                  label="PV Máximo da Montaria"
                />
              </div>

              {/* Botões Rápidos de Dano e Cura */}
              <div className="flex flex-wrap items-center gap-1.5">
                <button
                  type="button"
                  onClick={() => applyDamage(5)}
                  className="rounded-lg bg-rose-950/40 px-2.5 py-1 text-xs font-bold text-rose-300 border border-rose-500/30 hover:bg-rose-900/60 active:scale-95 transition"
                  title="Dano -5"
                >
                  -5
                </button>
                <button
                  type="button"
                  onClick={() => applyDamage(1)}
                  className="rounded-lg bg-rose-950/40 px-2.5 py-1 text-xs font-bold text-rose-300 border border-rose-500/30 hover:bg-rose-900/60 active:scale-95"
                  title="Dano -1"
                >
                  -1
                </button>
                <button
                  type="button"
                  onClick={() => applyHeal(1)}
                  className="rounded-lg bg-emerald-950/40 px-2.5 py-1 text-xs font-bold text-emerald-300 border border-emerald-500/30 hover:bg-emerald-900/60 active:scale-95"
                  title="Cura +1"
                >
                  +1
                </button>
                <button
                  type="button"
                  onClick={() => applyHeal(5)}
                  className="rounded-lg bg-emerald-950/40 px-2.5 py-1 text-xs font-bold text-emerald-300 border border-emerald-500/30 hover:bg-emerald-900/60 active:scale-95"
                  title="Cura +5"
                >
                  +5
                </button>
                <button
                  type="button"
                  onClick={restoreFull}
                  className="flex items-center gap-1 rounded-xl border border-primary/50 bg-primary/20 px-3 py-1 font-cinzel text-xs font-bold text-primary hover:bg-primary/30 active:scale-95 transition shadow-sm"
                >
                  <Sparkles size={12} /> Restaurar Max
                </button>
              </div>
            </div>
          </div>

          {/* Anotações e Equipamentos da Montaria */}
          <div>
            <span className="mb-2 block font-cinzel text-xs font-bold uppercase tracking-wider text-muted-foreground">
              Anotações, Sela & Alforjes
            </span>
            <div className="rounded-xl border border-primary/20 bg-background/50 p-3.5">
              <EditableText
                value={data.mountNotes}
                onChange={(value) => upd("mountNotes", value)}
                className="w-full font-journal text-sm sm:text-base leading-relaxed text-foreground"
                multiline
                placeholder="Raça, velocidade de deslocamento, capacidade de carga dos alforjes, bônus de investida..."
                label="Notas da montaria"
              />
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
}
