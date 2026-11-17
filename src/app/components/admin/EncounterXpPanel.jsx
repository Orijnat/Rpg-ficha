"use client";

import { Star, Sparkles, Trophy, Lock } from "lucide-react";
import { Card, SectionHeader } from "../ui";
import { calculateLevelFromXP } from "../../../lib/modifiers";
import { getEncounterXpReward } from "../../../lib/encounter";

/**
 * Painel de recompensa de XP do encontro (Sala de Guerra do Mestre).
 * - Define/ajusta o XP que a party vai receber.
 * - Mostra o progresso de cada herói presente para o próximo nível.
 * - "Distribuir XP" aplica a recompensa no XP de cada herói no encontro.
 */
export function EncounterXpPanel({ encounter, heroes, onDistribute, distributing, onFinalizeEncounter }) {
  const reward = getEncounterXpReward(encounter);
  const distributedAt = encounter?.dadosExtras?.xpDistribuidoEm || null;

  const initiative = encounter?.dadosExtras?.iniciativa || [];
  const heroCombatants = initiative.filter((c) => c.type === "Herói");
  const partySize = heroCombatants.length;
  const perHero = partySize > 0 ? Math.floor(reward / partySize) : 0;
  const participants = heroCombatants.map((c) => {
    const charId = String(c.id).replace(/^pc-/, "");
    const hero = (heroes || []).find((h) => String(h.id) === charId) || null;
    const xp = Number(hero?.xp) || 0;
    const levelInfo = calculateLevelFromXP(xp);
    return { id: charId, name: hero?.name || c.name, xp, ...levelInfo };
  });

  const canDistribute = reward > 0 && participants.length > 0 && !distributing;

  return (
    <Card>
      <SectionHeader title="XP do Encontro" icon={<Star size={16} />} />
      <p className="mt-1 text-xs text-muted-foreground">
        XP definido apenas na criação do encontro. É dividido igualmente entre os heróis presentes na iniciativa{perHero > 0 ? ` (${perHero} XP cada)` : ""}.
      </p>

      {/* XP total (definido na criação, somente leitura) */}
      <div className="mt-3 flex items-center justify-between gap-3 rounded-xl border border-amber-500/30 bg-amber-950/20 px-4 py-3">
        <div className="flex items-center gap-2.5">
          <Lock size={14} className="shrink-0 text-amber-400" />
          <div>
            <span className="block text-[9px] font-bold uppercase tracking-[0.25em] text-amber-500/80">XP total do encontro</span>
            <span className="font-mono text-lg font-black text-amber-300">{reward.toLocaleString("pt-BR")} XP</span>
          </div>
        </div>
        <span className="text-right text-[10px] font-bold uppercase leading-tight text-muted-foreground">
          {perHero > 0 ? (
            <>÷ {partySize} herói(s)<br /><span className="text-amber-300">{perHero} XP cada</span></>
          ) : (
            <>Nenhum herói<br />na iniciativa</>
          )}
        </span>
      </div>

      {/* Progresso de cada herói no encontro */}
      {participants.length === 0 ? (
        <p className="mt-3 rounded-lg border border-dashed border-border px-3 py-3 text-center text-[11px] text-muted-foreground">
          Nenhum herói no encontro ainda. Adicione heróis à iniciativa para ver o progresso de XP deles.
        </p>
      ) : (
        <ul className="mt-3 space-y-2">
          {participants.map((p) => (
            <li key={p.id} className="rounded-lg border border-primary/15 bg-primary/[0.04] px-3 py-2">
              <div className="flex items-center justify-between gap-2 text-xs">
                <span className="truncate font-semibold text-foreground">{p.name}</span>
                <span className="shrink-0 font-mono text-[10px] text-muted-foreground">
                  Nv {p.level} · {p.currentXP.toLocaleString("pt-BR")}
                  {p.nextLevelXP !== null && (
                    <> / {p.nextLevelXP.toLocaleString("pt-BR")} XP ({p.progress}%)</>
                  )}
                </span>
              </div>
              <div
                className="mt-1.5 h-1.5 w-full overflow-hidden rounded-full bg-zinc-800/80"
                role="progressbar"
                aria-valuenow={p.currentXP}
                aria-valuemin={0}
                aria-valuemax={p.nextLevelXP ?? p.currentXP}
                aria-label={`Progresso de XP de ${p.name}`}
              >
                <div
                  className="h-full rounded-full bg-gradient-to-r from-amber-800 via-amber-600 to-amber-400 transition-all duration-500"
                  style={{ width: `${p.nextLevelXP === null ? 100 : p.progress}%` }}
                />
              </div>
              <p className="mt-1 text-[9px] uppercase tracking-wider text-muted-foreground">
                {p.nextLevelXP === null
                  ? "Nível máximo"
                  : `Faltam ${(p.nextLevelXP - p.currentXP).toLocaleString("pt-BR")} XP para o nível ${p.level + 1}`
                  + (perHero > 0 ? ` · +${perHero} com esta vitória` : "")}
              </p>
            </li>
          ))}
        </ul>
      )}

      {/* Distribuir */}
      <button
        type="button"
        disabled={!canDistribute}
        onClick={onDistribute}
        className="mt-3 flex h-11 w-full items-center justify-center gap-2 rounded-lg border border-amber-500/50 bg-amber-500/15 text-xs font-bold uppercase tracking-wider text-amber-300 transition hover:bg-amber-500/25 active:scale-95 disabled:cursor-not-allowed disabled:opacity-40"
      >
        <Sparkles size={15} />
        {distributing
          ? "Distribuindo…"
          : distributedAt
            ? "XP distribuído — distribuir novamente"
            : perHero > 0
              ? `Distribuir ${perHero} XP para cada herói (total ${reward})`
              : "Distribuir XP para a party"}
      </button>
      {onFinalizeEncounter && encounter?.ativo !== false && (
        <>
          <button
            type="button"
            onClick={onFinalizeEncounter}
            className="mt-2 flex h-10 w-full items-center justify-center gap-2 rounded-lg border border-amber-500/50 bg-amber-500/15 text-[10px] font-bold uppercase tracking-wider text-amber-300 transition hover:bg-amber-500/25 active:scale-95"
            title="Abre o desfecho completo: quem recebe XP, quanto e vitória/derrota/fuga de cada herói"
          >
            <Trophy size={12} />
            Finalizar Encontro
          </button>
        </>
      )}
      {distributedAt && (
        <p className="mt-1.5 text-center text-[9px] uppercase tracking-wider text-emerald-400/80">
          XP distribuído em {new Date(distributedAt).toLocaleString("pt-BR")}
        </p>
      )}
    </Card>
  );
}
