"use client";

import React from "react";
import {
  Shield,
  Zap,
  Skull,
  Award,
  Dices,
  Flame,
  HeartPulse,
} from "lucide-react";
import { SectionHeader, EditableNumber } from "./ui";
import { useCharacter } from "../context/CharacterContext";
import { useDice } from "../context/DiceContext";
import { calculateInitiative, calculateModifier } from "../../lib/modifiers";

export default function RecursosCombate() {
  const { data, updExtra } = useCharacter();
  const { executeRoll, promptRoll } = useDice();

  const extras = data.dadosExtras || {};

  // PE (Pontos de Energia)
  const peMax = Math.max(0, Number(extras.peMax ?? 0));
  const peCurrent = Math.max(0, Number(extras.peCurrent ?? 0));
  const pePercent = peMax > 0 ? Math.min(100, Math.round((peCurrent / peMax) * 100)) : 0;

  // Insanidade
  const insanityMax = Math.max(0, Number(extras.insanityMax ?? 0));
  const insanityCurrent = Math.max(0, Number(extras.insanityCurrent ?? 0));
  const insanityPercent = insanityMax > 0 ? Math.min(100, Math.round((insanityCurrent / insanityMax) * 100)) : 0;

  // BP (Bônus de Proficiência / Bravura)
  const bpMax = Math.max(0, Number(extras.bpMax ?? 0));
  const bpCurrent = Math.max(0, Number(extras.bpCurrent ?? 0));

  // CA e Iniciativa
  const armorClass = Number(extras.armorClass ?? 10);
  const initiativeData = calculateInitiative(data);
  const hitDie = extras.hitDie || "1d10";

  // Rolar Iniciativa (d20 + modificador de iniciativa)
  const handleRollInitiative = () => {
    executeRoll({
      sides: 20,
      modifier: initiativeData.total,
      label: `Iniciativa (${initiativeData.formatted})`,
    });
  };

  // Rolar Dado de Vida para descanso/cura
  const handleRollHitDie = () => {
    const match = hitDie.match(/(\d+)?d(\d+)([+-]\d+)?/i);
    const count = match && match[1] ? parseInt(match[1], 10) : 1;
    const sides = match && match[2] ? parseInt(match[2], 10) : 10;
    const conMod = calculateModifier(data.CON ?? 10);

    executeRoll({
      sides,
      count,
      modifier: conMod,
      label: `Dado de Vida (${hitDie} + CON ${conMod >= 0 ? "+" + conMod : conMod})`,
    });
  };

  return (
    <div className="space-y-4">
      {/* Grade de Defesa, Iniciativa e Dado de Vida */}
      <div className="grid grid-cols-3 gap-2 sm:gap-3">
        {/* Classe de Armadura (CA) */}
        <div className="flex flex-col items-center justify-center rounded-xl border border-white/10 bg-background/50 p-3 text-center shadow-inner">
          <div className="flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
            <Shield size={12} className="text-amber-400" />
            <span>CA</span>
          </div>
          <EditableNumber
            value={armorClass}
            onChange={(val) => updExtra("armorClass", val)}
            className="mt-1 font-serif text-2xl font-black text-foreground"
            min={0}
            max={99}
          />
          <span className="text-[9px] text-muted-foreground uppercase">Armadura</span>
        </div>

        {/* Iniciativa com Rolagem Rápida */}
        <div className="flex flex-col items-center justify-center rounded-xl border border-white/10 bg-background/50 p-3 text-center shadow-inner group">
          <div className="flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
            <Flame size={12} className="text-primary" />
            <span>Iniciativa</span>
          </div>
          <div className="mt-1 flex items-center justify-center gap-1">
            <span className="font-serif text-2xl font-black text-foreground">
              {initiativeData.formatted}
            </span>
            <button
              type="button"
              onClick={handleRollInitiative}
              className="rounded-lg border border-primary/30 bg-primary/10 p-1.5 text-primary hover:bg-primary/25 active:scale-95 transition"
              title={`Rolar Iniciativa (d20 ${initiativeData.formatted})`}
            >
              <Dices size={14} />
            </button>
          </div>
          <span className="text-[9px] text-muted-foreground uppercase">DES + Bônus</span>
        </div>

        {/* Dado de Vida com Rolagem de Cura */}
        <div className="flex flex-col items-center justify-center rounded-xl border border-white/10 bg-background/50 p-3 text-center shadow-inner">
          <div className="flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
            <HeartPulse size={12} className="text-rose-400" />
            <span>Dado Vida</span>
          </div>
          <div className="mt-1 flex items-center justify-center gap-1">
            <span className="font-serif text-lg font-black text-foreground truncate max-w-[4rem]">
              {hitDie}
            </span>
            <button
              type="button"
              onClick={handleRollHitDie}
              className="rounded-lg border border-rose-400/30 bg-rose-950/30 p-1.5 text-rose-300 hover:bg-rose-900/40 active:scale-95 transition"
              title={`Rolar Cura com Dado de Vida (${hitDie})`}
            >
              <Dices size={14} />
            </button>
          </div>
          <span className="text-[9px] text-muted-foreground uppercase">Descanso</span>
        </div>
      </div>

      {/* Barras de Recursos: PE, Insanidade e BP */}
      <div className="space-y-3 rounded-xl border border-white/10 bg-background/40 p-3.5">
        <SectionHeader title="Recursos Especiais & Vigor" icon={<Zap size={14} />} />

        {/* PE - Pontos de Energia */}
        <div>
          <div className="mb-1.5 flex items-center justify-between text-xs">
            <span className="flex items-center gap-1 font-serif font-bold text-sky-400">
              <Zap size={13} />
              Pontos de Energia (PE)
            </span>
            <div className="flex items-center gap-1 font-mono text-xs">
              <EditableNumber
                value={peCurrent}
                onChange={(val) => updExtra("peCurrent", val)}
                className="font-bold text-sky-300"
                min={0}
              />
              <span className="text-muted-foreground">/</span>
              <EditableNumber
                value={peMax}
                onChange={(val) => updExtra("peMax", val)}
                className="text-muted-foreground"
                min={0}
              />
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => updExtra("peCurrent", Math.max(0, peCurrent - 1))}
              className="flex h-7 w-7 items-center justify-center rounded border border-sky-500/30 bg-sky-950/30 text-xs font-bold text-sky-300 hover:bg-sky-900/50 active:scale-95"
              title="Gastar 1 PE"
            >
              −
            </button>
            <div className="h-3 flex-1 overflow-hidden rounded-full border border-sky-500/20 bg-background/80">
              <div
                className="h-full bg-gradient-to-r from-sky-600 to-cyan-400 transition-all duration-300"
                style={{ width: `${pePercent}%` }}
              />
            </div>
            <button
              type="button"
              onClick={() => updExtra("peCurrent", peMax > 0 ? Math.min(peMax, peCurrent + 1) : peCurrent + 1)}
              className="flex h-7 w-7 items-center justify-center rounded border border-sky-500/30 bg-sky-950/30 text-xs font-bold text-sky-300 hover:bg-sky-900/50 active:scale-95"
              title="Recuperar 1 PE"
            >
              +
            </button>
          </div>
        </div>

        {/* Insanidade */}
        <div>
          <div className="mb-1.5 flex items-center justify-between text-xs">
            <span className="flex items-center gap-1 font-serif font-bold text-purple-400">
              <Skull size={13} />
              Insanidade
            </span>
            <div className="flex items-center gap-1 font-mono text-xs">
              <EditableNumber
                value={insanityCurrent}
                onChange={(val) => updExtra("insanityCurrent", val)}
                className="font-bold text-purple-300"
                min={0}
              />
              <span className="text-muted-foreground">/</span>
              <EditableNumber
                value={insanityMax}
                onChange={(val) => updExtra("insanityMax", val)}
                className="text-muted-foreground"
                min={0}
              />
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => updExtra("insanityCurrent", Math.max(0, insanityCurrent - 1))}
              className="flex h-7 w-7 items-center justify-center rounded border border-purple-500/30 bg-purple-950/30 text-xs font-bold text-purple-300 hover:bg-purple-900/50 active:scale-95"
              title="Reduzir 1 de Insanidade"
            >
              −
            </button>
            <div className="h-3 flex-1 overflow-hidden rounded-full border border-purple-500/20 bg-background/80">
              <div
                className="h-full bg-gradient-to-r from-purple-800 to-fuchsia-600 transition-all duration-300"
                style={{ width: `${insanityPercent}%` }}
              />
            </div>
            <button
              type="button"
              onClick={() => updExtra("insanityCurrent", insanityMax > 0 ? Math.min(insanityMax, insanityCurrent + 1) : insanityCurrent + 1)}
              className="flex h-7 w-7 items-center justify-center rounded border border-purple-500/30 bg-purple-950/30 text-xs font-bold text-purple-300 hover:bg-purple-900/50 active:scale-95"
              title="Ganhar 1 de Insanidade"
            >
              +
            </button>
          </div>
        </div>

        {/* BP - Bônus de Proficiência / Bravura */}
        <div className="flex items-center justify-between rounded-lg border border-amber-500/20 bg-amber-950/10 px-3 py-2">
          <div className="flex items-center gap-2 text-xs">
            <Award size={14} className="text-amber-400" />
            <span className="font-serif font-bold text-amber-300">Bônus de Proficiência (BP)</span>
          </div>
          <div className="flex items-center gap-1 font-mono text-xs">
            <EditableNumber
              value={bpCurrent}
              onChange={(val) => updExtra("bpCurrent", val)}
              className="font-bold text-amber-300"
              min={0}
            />
            {bpMax > 0 && (
              <>
                <span className="text-muted-foreground">/</span>
                <EditableNumber
                  value={bpMax}
                  onChange={(val) => updExtra("bpMax", val)}
                  className="text-muted-foreground"
                  min={0}
                />
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
