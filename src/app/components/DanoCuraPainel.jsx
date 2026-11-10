"use client";

import React, { useState } from "react";
import {
  Heart,
  HeartPulse,
  Sword,
  Sparkles,
  RotateCcw,
  ShieldAlert,
  Flame,
  Check,
  X,
} from "lucide-react";
import { useCharacter } from "../context/CharacterContext";
import { useDice } from "../context/DiceContext";
import { applyHealthChange, calculateModifier } from "../../lib/modifiers";
import { HPBar } from "./ui";

/**
 * Painel interativo de Dano Tomado e Cura Recebida para automatizar
 * o cálculo de aumento e diminuição dos Pontos de Vida (PV).
 *
 * @param {boolean} compact Se true, renderiza layout otimizado para popover/cabeçalho
 * @param {Function} onClose Callback opcional para fechar popover/modal
 */
export default function DanoCuraPainel({ compact = false, onClose = null }) {
  const { data, upd, updExtra } = useCharacter();
  const { executeRoll } = useDice();

  const [amount, setAmount] = useState("");
  const [lastAction, setLastAction] = useState(null);
  const [actionType, setActionType] = useState(null); // 'damage' | 'heal' | 'full'

  const currentHp = Number(data.hp ?? 0);
  const maxHp = Math.max(1, Number(data.hpMax ?? 1));
  const hpPct = Math.round((currentHp / maxHp) * 100);

  // Cores dinâmicas de acordo com o percentual de vida
  const hpColor =
    hpPct > 60
      ? "text-emerald-400"
      : hpPct > 30
      ? "text-amber-300"
      : "text-rose-400";

  // Aplica dano automatizado
  const handleApplyDamage = () => {
    const val = parseInt(amount, 10);
    if (isNaN(val) || val <= 0) return;

    const res = applyHealthChange(currentHp, maxHp, -val);
    upd("hp", res.currentHp);

    setActionType("damage");
    setLastAction({
      text: `Sofreu ${val} de dano (${res.previousHp} ➔ ${res.currentHp} PV)`,
      isDead: res.isDead,
    });
    setAmount("");
  };

  // Aplica cura automatizada
  const handleApplyHeal = () => {
    const val = parseInt(amount, 10);
    if (isNaN(val) || val <= 0) return;

    const res = applyHealthChange(currentHp, maxHp, val);
    upd("hp", res.currentHp);

    setActionType("heal");
    setLastAction({
      text: `Curou ${val} PV (${res.previousHp} ➔ ${res.currentHp} PV)`,
      isFull: res.isFull,
    });
    setAmount("");
  };

  // Cura completa (restaura ao máximo)
  const handleFullHeal = () => {
    if (currentHp >= maxHp) return;
    const diff = maxHp - currentHp;
    upd("hp", maxHp);
    setActionType("full");
    setLastAction({
      text: `Vida totalmente restaurada (+${diff} PV ➔ ${maxHp}/${maxHp})`,
      isFull: true,
    });
    setAmount("");
  };

  // Rolar dado de vida e aplicar diretamente como cura
  const handleRollHitDieHeal = () => {
    const hitDie = data.dadosExtras?.hitDie || "1d10";
    const match = hitDie.match(/(\d+)?d(\d+)([+-]\d+)?/i);
    const count = match && match[1] ? parseInt(match[1], 10) : 1;
    const sides = match && match[2] ? parseInt(match[2], 10) : 10;
    const conMod = calculateModifier(data.CON ?? 10);

    const roll = executeRoll({
      sides,
      count,
      modifier: conMod,
      label: `Cura com Dado de Vida (${hitDie} + CON ${conMod >= 0 ? "+" + conMod : conMod})`,
    });

    if (roll && typeof roll.total === "number") {
      const healAmount = Math.max(1, roll.total);
      const res = applyHealthChange(currentHp, maxHp, healAmount);
      upd("hp", res.currentHp);
      setActionType("heal");
      setLastAction({
        text: `Dado de Vida (${hitDie}) curou +${healAmount} PV (${res.previousHp} ➔ ${res.currentHp}/${maxHp})`,
        isFull: res.isFull,
      });
    }
  };

  // Botões de incremento rápido no montante
  const handleAddAmount = (extra) => {
    const cur = parseInt(amount, 10) || 0;
    setAmount(String(cur + extra));
  };

  return (
    <div
      className={`rounded-2xl border border-white/10 bg-card/95 backdrop-blur-md shadow-2xl transition-all ${
        compact ? "p-3.5 max-w-sm w-full space-y-3" : "p-4 sm:p-5 space-y-4"
      }`}
    >
      {/* Cabeçalho do Painel */}
      <div className="flex items-center justify-between border-b border-white/10 pb-2.5">
        <div className="flex items-center gap-2">
          <div className="flex h-7 w-7 items-center justify-center rounded-lg border border-primary/40 bg-primary/20 text-primary">
            <HeartPulse size={15} />
          </div>
          <div>
            <h4 className="font-serif text-sm font-bold text-foreground leading-none">
              Gestão de Vitalidade
            </h4>
            <p className="text-[10px] text-muted-foreground mt-0.5">
              Automatize dano tomado e cura recebida
            </p>
          </div>
        </div>

        {onClose && (
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-1 text-muted-foreground hover:bg-white/10 hover:text-foreground"
            aria-label="Fechar painel"
          >
            <X size={14} />
          </button>
        )}
      </div>

      {/* Indicador Atual de Pontos de Vida */}
      <div className="flex items-center justify-between rounded-xl border border-white/10 bg-background/50 p-2.5">
        <div className="flex items-center gap-2">
          <Heart size={16} className={hpColor} />
          <div>
            <span className="text-[10px] uppercase font-bold tracking-wider text-muted-foreground block">
              Vitalidade Atual
            </span>
            <div className="flex items-baseline gap-1 font-mono text-base font-black">
              <span className={hpColor}>{currentHp}</span>
              <span className="text-muted-foreground text-xs font-normal">/</span>
              <span className="text-foreground text-xs">{maxHp} PV</span>
            </div>
          </div>
        </div>

        <div className="text-right">
          <span className={`font-mono text-sm font-bold ${hpColor}`}>{hpPct}%</span>
          <div className="w-20 sm:w-28 mt-1">
            <HPBar hp={currentHp} max={maxHp} />
          </div>
        </div>
      </div>

      {/* Campo Numérico com Botões de Ação Rápida */}
      <div className="space-y-2">
        <label className="block text-[11px] font-semibold text-muted-foreground">
          Valor do Dano ou da Cura:
        </label>
        <div className="flex items-center gap-2">
          <input
            type="number"
            min={1}
            max={999}
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && amount) {
                handleApplyDamage();
              }
            }}
            placeholder="Ex: 14"
            className="flex-1 rounded-xl border border-white/15 bg-background/80 px-3 py-2 text-center font-mono text-base font-bold text-foreground placeholder:text-muted-foreground/50 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
          />
          {amount && (
            <button
              type="button"
              onClick={() => setAmount("")}
              className="rounded-lg border border-white/10 bg-white/5 px-2.5 py-2 text-xs font-semibold text-muted-foreground hover:text-foreground"
              title="Limpar valor"
            >
              Limpar
            </button>
          )}
        </div>

        {/* Atalhos de Valores Rápidos (+1, +5, +10, +20) */}
        <div className="flex items-center gap-1.5 pt-0.5">
          <span className="text-[10px] uppercase font-bold text-muted-foreground mr-1">
            Atalhos:
          </span>
          {[1, 5, 10, 20].map((val) => (
            <button
              key={val}
              type="button"
              onClick={() => handleAddAmount(val)}
              className="flex-1 rounded-lg border border-white/10 bg-background/40 py-1 font-mono text-xs font-bold text-foreground transition hover:border-primary/50 hover:bg-primary/10 active:scale-95"
            >
              +{val}
            </button>
          ))}
        </div>
      </div>

      {/* Botões Principais: TOMAR DANO e RECEBER CURA */}
      <div className="grid grid-cols-2 gap-2.5 pt-1">
        {/* Tomar Dano */}
        <button
          type="button"
          onClick={handleApplyDamage}
          disabled={!amount || parseInt(amount, 10) <= 0}
          className="flex min-h-10 items-center justify-center gap-1.5 rounded-xl border border-rose-500/40 bg-rose-950/40 px-3 py-2 font-serif text-xs font-bold text-rose-300 shadow-md transition-all hover:bg-rose-900/60 hover:border-rose-400 active:scale-95 disabled:opacity-40 disabled:cursor-not-allowed"
          title="Subtrair dano automaticamente da vida atual"
        >
          <Sword size={14} className="text-rose-400 shrink-0" />
          <span>Tomar Dano</span>
        </button>

        {/* Receber Cura */}
        <button
          type="button"
          onClick={handleApplyHeal}
          disabled={!amount || parseInt(amount, 10) <= 0 || currentHp >= maxHp}
          className="flex min-h-10 items-center justify-center gap-1.5 rounded-xl border border-emerald-500/40 bg-emerald-950/40 px-3 py-2 font-serif text-xs font-bold text-emerald-300 shadow-md transition-all hover:bg-emerald-900/60 hover:border-emerald-400 active:scale-95 disabled:opacity-40 disabled:cursor-not-allowed"
          title="Somar cura automaticamente à vida atual (limitada ao máximo)"
        >
          <Sparkles size={14} className="text-emerald-400 shrink-0" />
          <span>Receber Cura</span>
        </button>
      </div>

      {/* Ações Especiais / Descanso */}
      <div className="flex flex-wrap items-center justify-between gap-2 border-t border-white/10 pt-2.5 text-xs">
        <button
          type="button"
          onClick={handleFullHeal}
          disabled={currentHp >= maxHp}
          className="flex items-center gap-1 rounded-lg border border-emerald-500/30 bg-emerald-950/20 px-2.5 py-1 text-[11px] font-semibold text-emerald-300 hover:bg-emerald-900/40 transition active:scale-95 disabled:opacity-40 disabled:cursor-not-allowed"
          title="Recupera todos os pontos de vida ao máximo"
        >
          <RotateCcw size={12} />
          <span>Cura Total ({maxHp} PV)</span>
        </button>

        <button
          type="button"
          onClick={handleRollHitDieHeal}
          disabled={currentHp >= maxHp}
          className="flex items-center gap-1 rounded-lg border border-primary/30 bg-primary/15 px-2.5 py-1 text-[11px] font-semibold text-primary hover:bg-primary/25 transition active:scale-95 disabled:opacity-40 disabled:cursor-not-allowed"
          title="Rola o dado de vida do herói com CON e aplica diretamente como cura"
        >
          <Flame size={12} />
          <span>Dado de Vida ({data.dadosExtras?.hitDie || "1d10"})</span>
        </button>
      </div>

      {/* Feedback Visual e Alertas da Última Ação */}
      {lastAction && (
        <div
          className={`rounded-xl border p-2.5 text-xs transition-all animate-in fade-in-50 ${
            actionType === "damage"
              ? lastAction.isDead
                ? "border-rose-600 bg-rose-950/70 text-rose-200"
                : "border-rose-500/30 bg-rose-950/30 text-rose-300"
              : "border-emerald-500/30 bg-emerald-950/30 text-emerald-300"
          }`}
          role="status"
          aria-live="polite"
        >
          <div className="flex items-start gap-2">
            {actionType === "damage" ? (
              <ShieldAlert size={15} className="text-rose-400 shrink-0 mt-0.5" />
            ) : (
              <Check size={15} className="text-emerald-400 shrink-0 mt-0.5" />
            )}
            <div>
              <p className="font-semibold">{lastAction.text}</p>
              {lastAction.isDead && (
                <p className="text-[11px] font-bold text-rose-400 mt-0.5">
                  ⚠️ Personagem caiu a 0 PV! Inconsciente e precisando de salvaguardas contra a morte.
                </p>
              )}
              {lastAction.isFull && (
                <p className="text-[10px] text-emerald-400/80 mt-0.5">
                  ✨ Pontos de vida no limite máximo.
                </p>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
