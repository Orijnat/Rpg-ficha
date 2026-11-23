// RestControls.jsx – UI para Descanso Curto e Longo
// Integrado com applyShortRest / applyLongRest de src/lib/modifiers.js
// Recebe: character (dados completos), updateCharacter (callback para persistir).

"use client";

import React, { useState } from "react";
import { Moon, Sun, Sparkles, Loader2 } from "lucide-react";
import { applyShortRest, applyLongRest } from "../../lib/modifiers";

/**
 * Props:
 * - character: objeto completo do personagem (data do CharacterContext)
 * - updateCharacter: async (patch: { hp?, peCurrent?, insanityCurrent? }) => void
 * - onRest: optional callback(result) chamado após o descanso bem-sucedido
 */
export default function RestControls({ character, updateCharacter, onRest }) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleRest = async (type) => {
    setLoading(true);
    setError(null);
    try {
      if (type === "short") {
        const result = applyShortRest(character);
        const currentHp = Math.max(0, Number(character?.hp ?? 0));
        const hpMax = Math.max(1, Number(character?.hpMax ?? 1));
        const newHp = Math.min(hpMax, currentHp + result.hpHealed);
        const currentPe = Number(character?.dadosExtras?.peCurrent ?? 0);
        const peMax = Number(character?.dadosExtras?.peMax ?? 0);
        const newPe = peMax > 0 ? Math.min(peMax, currentPe + result.peRestored) : currentPe + result.peRestored;

        if (updateCharacter) {
          await updateCharacter({
            hp: newHp,
            peCurrent: newPe,
            description: result.description,
            type: "short",
            result,
          });
        }
        if (onRest) onRest({ type: "short", result, newHp, newPe });
      } else {
        const result = applyLongRest(character);
        const hpMax = Math.max(1, Number(character?.hpMax ?? 1));
        const peMax = Number(character?.dadosExtras?.peMax ?? 0);
        const insanityCurrent = Number(character?.dadosExtras?.insanityCurrent ?? 0);
        const newInsanity = Math.max(0, insanityCurrent - result.insanityReduced);

        if (updateCharacter) {
          await updateCharacter({
            hp: hpMax,
            peCurrent: peMax,
            insanityCurrent: newInsanity,
            description: result.description,
            type: "long",
            result,
          });
        }
        if (onRest) onRest({ type: "long", result, newHp: hpMax, newPe: peMax, newInsanity });
      }
    } catch (e) {
      console.error("[RestControls] Erro ao aplicar descanso:", e);
      setError(e?.message ?? "Erro ao aplicar descanso");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
      {/* Descanso Curto */}
      <div className="medallion-plate flex flex-col justify-between rounded-xl p-4 sm:p-5">
        <div>
          <div className="flex items-center gap-2 font-cinzel text-sm font-bold text-foreground">
            <Sun size={17} className="text-codex-400" />
            <span>Descanso Curto (1 hora)</span>
          </div>
          <p className="mt-2 font-journal text-xs sm:text-sm italic leading-relaxed text-muted-foreground">
            Pausa breve para respirar e meditar. Recupera dado de vida + CON em PV e restaura 25% dos PE.
          </p>
        </div>
        <button
          type="button"
          disabled={loading}
          onClick={() => handleRest("short")}
          className="mt-4 flex items-center justify-center gap-2 rounded-xl border border-primary/50 bg-primary/20 py-2.5 font-cinzel text-xs font-bold uppercase tracking-wider text-primary transition hover:bg-primary/30 active:scale-95 shadow-md shadow-primary/15 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? <Loader2 size={14} className="animate-spin" /> : <Sparkles size={14} />}
          Realizar Descanso Curto
        </button>
      </div>

      {/* Descanso Longo */}
      <div className="medallion-plate flex flex-col justify-between rounded-xl p-4 sm:p-5">
        <div>
          <div className="flex items-center gap-2 font-cinzel text-sm font-bold text-foreground">
            <Moon size={17} className="text-indigo-400" />
            <span>Descanso Longo (8 horas)</span>
          </div>
          <p className="mt-2 font-journal text-xs sm:text-sm italic leading-relaxed text-muted-foreground">
            Uma noite de sono profundo em segurança. Restaura 100% de PV e PE e reduz 1 ponto de Insanidade.
          </p>
        </div>
        <button
          type="button"
          disabled={loading}
          onClick={() => handleRest("long")}
          className="mt-4 flex items-center justify-center gap-2 rounded-xl border border-indigo-400/50 bg-indigo-500/20 py-2.5 font-cinzel text-xs font-bold uppercase tracking-wider text-indigo-300 transition hover:bg-indigo-500/30 active:scale-95 shadow-md shadow-indigo-500/20 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? <Loader2 size={14} className="animate-spin" /> : <Sparkles size={14} />}
          Realizar Descanso Longo
        </button>
      </div>

      {error && (
        <div className="col-span-full rounded-lg border border-red-500/40 bg-red-950/30 px-3 py-2 text-xs text-red-400">
          {error}
        </div>
      )}
    </div>
  );
}
