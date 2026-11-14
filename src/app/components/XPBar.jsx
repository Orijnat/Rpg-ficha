"use client";

import { useState, useRef, useEffect } from "react";
import { Star } from "lucide-react";
import { useCharacter } from "../context/CharacterContext";
import { calculateLevelFromXP } from "../../lib/modifiers";

/**
 * XPBar — Barra de progresso de XP/Nível estilo Dark Fantasy.
 * Usa calculateLevelFromXP de src/lib/modifiers.js.
 * Integra ao CharacterContext via upd("xp", ...).
 */
export default function XPBar() {
  const { data, upd } = useCharacter();

  // Lê XP de data.xp com fallback para dadosExtras.xp
  const rawXP = data.xp ?? data.dadosExtras?.xp ?? 0;
  const { level, currentXP, nextLevelXP, xpForCurrent, progress } =
    calculateLevelFromXP(rawXP);

  const [editing, setEditing] = useState(false);
  const [inputVal, setInputVal] = useState(String(currentXP));
  const inputRef = useRef(null);

  // Foca o input quando entra em modo de edição
  useEffect(() => {
    if (editing && inputRef.current) {
      inputRef.current.focus();
      inputRef.current.select();
    }
  }, [editing]);

  const startEdit = () => {
    setInputVal(String(currentXP));
    setEditing(true);
  };

  const commitEdit = () => {
    const parsed = Math.max(0, Number(inputVal) || 0);
    upd("xp", parsed);
    setEditing(false);
  };

  const handleKey = (e) => {
    if (e.key === "Enter") commitEdit();
    if (e.key === "Escape") setEditing(false);
  };

  const isMaxLevel = nextLevelXP === null;
  const barWidth = `${progress}%`;

  return (
    <div className="w-full" aria-label={`XP: Nível ${level}`}>
      {/* Rótulo */}
      <div className="flex items-center justify-between mb-0.5">
        <span className="flex items-center gap-1 font-cinzel text-[9px] font-bold uppercase tracking-[0.22em] text-amber-400/80">
          <Star size={9} className="text-amber-400 drop-shadow-[0_0_4px_#f59e0b]" />
          Nível {level}
          {isMaxLevel && (
            <span className="ml-1 text-amber-300 tracking-widest">✦ Máximo</span>
          )}
        </span>

        {/* Clique para editar XP */}
        {editing ? (
          <div className="flex items-center gap-1">
            <input
              ref={inputRef}
              type="number"
              min="0"
              value={inputVal}
              onChange={(e) => setInputVal(e.target.value)}
              onBlur={commitEdit}
              onKeyDown={handleKey}
              className="w-20 rounded border border-amber-500/50 bg-zinc-900/80 px-1.5 py-0.5 font-mono text-[10px] text-amber-200 outline-none focus:border-amber-400 focus:ring-1 focus:ring-amber-400/30"
              aria-label="Editar XP atual"
            />
            <button
              type="button"
              onClick={commitEdit}
              className="rounded border border-amber-500/40 bg-amber-900/40 px-1.5 py-0.5 font-cinzel text-[9px] font-bold text-amber-300 hover:bg-amber-800/60 active:scale-95 transition"
            >
              OK
            </button>
          </div>
        ) : (
          <button
            type="button"
            onClick={startEdit}
            title="Clique para editar XP"
            className="group font-mono text-[9px] text-amber-300/70 hover:text-amber-200 transition-colors cursor-pointer"
            aria-label="Editar XP atual"
          >
            <span className="text-amber-400 font-bold group-hover:text-amber-300">
              {currentXP.toLocaleString("pt-BR")}
            </span>
            {!isMaxLevel && (
              <span className="text-muted-foreground">
                {" "}
                / {nextLevelXP.toLocaleString("pt-BR")}{" "}
                <span className="text-amber-500/60">({progress}%)</span>
              </span>
            )}
            <span className="ml-1 font-cinzel text-amber-500/40 group-hover:text-amber-400/60 text-[8px] uppercase">
              XP ✎
            </span>
          </button>
        )}
      </div>

      {/* Trilho da barra */}
      <div
        className="relative h-1.5 w-full overflow-hidden rounded-full bg-zinc-800/80 border border-amber-900/40 shadow-inner"
        role="progressbar"
        aria-valuenow={currentXP}
        aria-valuemin={xpForCurrent}
        aria-valuemax={nextLevelXP ?? currentXP}
        aria-label={`Progresso de XP: ${progress}%`}
      >
        {/* Preenchimento animado */}
        <div
          className="h-full rounded-full transition-all duration-700 ease-out"
          style={{
            width: barWidth,
            background:
              "linear-gradient(90deg, #78350f 0%, #d97706 40%, #fbbf24 80%, #fef08a 100%)",
            boxShadow: progress > 0
              ? "0 0 6px rgba(251,191,36,0.55), 0 0 2px rgba(255,220,100,0.3)"
              : "none",
          }}
        />
        {/* Brilho sobreposto */}
        {progress > 0 && (
          <div
            className="absolute inset-y-0 left-0 rounded-full pointer-events-none"
            style={{
              width: barWidth,
              background:
                "linear-gradient(180deg, rgba(255,255,255,0.18) 0%, transparent 100%)",
            }}
          />
        )}
      </div>
    </div>
  );
}
