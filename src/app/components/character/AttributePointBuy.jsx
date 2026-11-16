"use client";

import { POINT_BUY_POOL, POINT_BUY_MIN, POINT_BUY_MAX, pointBuyCost, getRaceBonuses } from "../../../lib/races";
import { ATTRIBUTE_LABELS } from "../../../lib/modifiers";

const ATTRS = ["FOR", "DES", "CON", "SAB", "ESP", "CAR", "INT"];

/**
 * Atributos base por point buy (27 pontos, 8–15) com bônus racial aplicados ao vivo.
 * Controlado: o pai guarda `base` (valores sem bônus) e deriva o total = base + bônus racial.
 */
export function AttributePointBuy({ base, raceId, onChange }) {
  const bonuses = getRaceBonuses(raceId);
  const spent = ATTRS.reduce((total, attr) => total + pointBuyCost(base[attr]), 0);
  const remaining = POINT_BUY_POOL - spent;

  const bump = (attr, delta) => {
    const current = Number(base[attr]) || POINT_BUY_MIN;
    const next = Math.min(POINT_BUY_MAX, Math.max(POINT_BUY_MIN, current + delta));
    if (next === current) return;
    if (delta > 0 && remaining - (pointBuyCost(next) - pointBuyCost(current)) < 0) return;
    onChange({ ...base, [attr]: next });
  };

  return (
    <div>
      <div className="flex items-center justify-between gap-2">
        <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-[var(--theme-subtitle)]">
          Atributos <span className="normal-case opacity-70">(point buy)</span>
        </span>
        <span
          className={`rounded-md border px-2 py-0.5 font-mono text-[10px] font-bold ${
            remaining === 0
              ? "border-emerald-500/40 bg-emerald-500/10 text-emerald-300"
              : remaining < 0
                ? "border-rose-500/40 bg-rose-500/10 text-rose-300"
                : "border-amber-500/40 bg-amber-500/10 text-amber-300"
          }`}
        >
          {remaining} {remaining === 1 ? "ponto" : "pontos"} restantes
        </span>
      </div>

      <div className="mt-2 grid grid-cols-7 gap-1.5">
        {ATTRS.map((attr) => {
          const value = Number(base[attr]) || POINT_BUY_MIN;
          const bonus = Number(bonuses[attr]) || 0;
          const total = value + bonus;
          return (
            <div
              key={attr}
              className="flex flex-col items-center gap-1 rounded-lg border border-[#4a3d2a]/60 bg-[#0f0d0a]/60 px-1 py-2"
              title={`${ATTRIBUTE_LABELS[attr] || attr}: base ${value}${bonus ? ` + ${bonus} racial` : ""} = ${total}`}
            >
              <span className="text-[9px] font-bold uppercase tracking-wider text-[var(--theme-subtitle)]">
                {attr}
              </span>
              <button
                type="button"
                onClick={() => bump(attr, 1)}
                disabled={value >= POINT_BUY_MAX || remaining - (pointBuyCost(value + 1) - pointBuyCost(value)) < 0}
                className="flex h-5 w-6 items-center justify-center rounded border border-[#4a3d2a]/60 text-[10px] text-[var(--theme-accent)] transition hover:border-[var(--theme-accent)]/60 disabled:cursor-not-allowed disabled:opacity-25"
                aria-label={`Aumentar ${attr}`}
              >
                +
              </button>
              <span className="font-mono text-sm font-bold leading-none text-[#f1e7d2]">{total}</span>
              <span className="text-[8px] leading-none text-muted-foreground">
                {base[attr]}{bonus > 0 ? `+${bonus}` : ""}
              </span>
              <button
                type="button"
                onClick={() => bump(attr, -1)}
                disabled={value <= POINT_BUY_MIN}
                className="flex h-5 w-6 items-center justify-center rounded border border-[#4a3d2a]/60 text-[10px] text-[var(--theme-subtitle)] transition hover:border-[var(--theme-accent)]/60 disabled:cursor-not-allowed disabled:opacity-25"
                aria-label={`Diminuir ${attr}`}
              >
                −
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
}
