"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { LoaderCircle, Trophy, X } from "lucide-react";
import { calculateLevelFromXP } from "../../../lib/modifiers";

/**
 * Modal "Finalizar Encontro" (Sala de Guerra): o mestre marca quem ganha
 * e quem NÃO ganha o XP do encontro. O XP é o Total do encontro, dividido
 * igualmente entre os heróis na iniciativa.
 *
 * Props:
 * - isOpen, onClose: controle do modal
 * - encounter: encontro ativo (iniciativa + recursos.xp)
 * - heroes: lista atualizada de fichas (para XP/nível atuais)
 * - onFinalize: (rows) => Promise<{ ok, message? }> — aplica o XP, encerra o
 *   encontro e registra no log; em erro, o modal exibe a mensagem.
 */
export default function FinalizarEncounterModal({ isOpen, onClose, encounter, heroes, onFinalize }) {
  const dialogRef = useRef(null);
  const submittingRef = useRef(false);
  const combatants = useMemo(function heroesInEncounter() {
    const list = encounter?.dadosExtras?.iniciativa || [];
    return list
      .filter((c) => c.type === "Herói")
      .map((c) => {
        const charId = String(c.id).replace(/^pc-/, "");
        const hero = (heroes || []).find((h) => String(h.id) === charId) || null;
        const currentXp = Number(hero?.xp ?? c.xp ?? 0) || 0;
        return {
          id: charId,
          name: hero?.name || c.name || "Herói",
          currentXp,
          level: calculateLevelFromXP(currentXp).level,
        };
      });
  }, [encounter?.dadosExtras?.iniciativa, heroes]);
  const reward = Math.max(0, Math.floor(Number(encounter?.recursos?.xp) || 0));
  const partySize = combatants.length;
  const perHero = partySize > 0 ? Math.floor(reward / partySize) : 0;
  const encounterKey = `${encounter?.id}:${isOpen ? "open" : "closed"}`;

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 p-4 backdrop-blur-sm animate-in fade-in-50"
      role="presentation"
      onClick={() => {
        if (!submittingRef.current) onClose();
      }}
    >
      <FinalizeBody
        key={encounterKey}
        dialogRef={dialogRef}
        submittingRef={submittingRef}
        encounter={encounter}
        combatants={combatants}
        reward={reward}
        perHero={perHero}
        partySize={partySize}
        onClose={onClose}
        onFinalize={onFinalize}
      />
    </div>
  );
}

function FinalizeBody({ dialogRef, submittingRef, encounter, combatants, reward, perHero, partySize, onClose, onFinalize }) {
  const [selected, setSelected] = useState(() => new Set(combatants.map((c) => c.id)));
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);

  const includedCount = combatants.filter((c) => selected.has(c.id)).length;
  const totalXp = includedCount * perHero;

  useEffect(() => {
    const dialog = dialogRef.current;
    const focusable = dialog?.querySelectorAll(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
    );
    focusable?.[0]?.focus();

    const handleKeyDown = (event) => {
      if (event.key === "Escape" && !submittingRef.current) {
        event.stopPropagation();
        onClose();
        return;
      }
      if (event.key === "Tab" && focusable && focusable.length > 0) {
        const list = Array.from(focusable);
        const firstEl = list[0];
        const lastEl = list[list.length - 1];
        const active = document.activeElement;
        if (event.shiftKey && active === firstEl) {
          event.preventDefault();
          lastEl.focus();
        } else if (!event.shiftKey && active === lastEl) {
          event.preventDefault();
          firstEl.focus();
        }
      }
    };
    document.addEventListener("keydown", handleKeyDown, true);
    return () => document.removeEventListener("keydown", handleKeyDown, true);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const toggle = (id) => {
    setSelected((current) => {
      const next = new Set(current);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const selectAll = () => setSelected(new Set(combatants.map((c) => c.id)));
  const selectNone = () => setSelected(new Set());

  const handleConfirm = async () => {
    if (submitting) return;
    setSubmitting(true);
    setError(null);
    submittingRef.current = true;
    try {
      const rows = combatants.map((c) => ({
        id: c.id,
        name: c.name,
        outcome: "vitoria",
        included: selected.has(c.id),
        xp: selected.has(c.id) ? perHero : 0,
      }));
      const result = await onFinalize(rows);
      if (!result?.ok) {
        setError(result?.message || "Não foi possível finalizar o encontro.");
        setSubmitting(false);
        submittingRef.current = false;
        return;
      }
      onClose();
    } catch (err) {
      setError(err?.message || "Falha ao finalizar o encontro.");
      setSubmitting(false);
      submittingRef.current = false;
    }
  };

  return (
    <div
      ref={dialogRef}
      role="dialog"
      aria-modal="true"
      aria-labelledby="finalizar-encontro-title"
      className="flex max-h-[86vh] w-full max-w-md flex-col overflow-hidden rounded-2xl border border-amber-500/40 bg-card shadow-2xl shadow-black/80"
      onClick={(event) => event.stopPropagation()}
    >
      {/* Cabeçalho */}
      <div className="flex items-start justify-between gap-3 border-b border-border px-5 py-4">
        <div className="flex items-center gap-3">
          <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-amber-500/50 bg-amber-500/15 text-amber-300">
            <Trophy size={20} />
          </span>
          <div>
            <h2 id="finalizar-encontro-title" className="font-cinzel text-base font-black text-foreground">
              Finalizar Encontro
            </h2>
            <p className="mt-0.5 text-[11px] text-muted-foreground">
              {encounter?.nome ? `"${encounter.nome}" — ` : ""}quem ganha XP e quem não ganha.
            </p>
          </div>
        </div>
        <button
          type="button"
          onClick={() => !submitting && onClose()}
          disabled={submitting}
          className="rounded-lg p-1.5 text-muted-foreground transition hover:bg-secondary hover:text-foreground disabled:opacity-40"
          aria-label="Fechar"
        >
          <X size={18} />
        </button>
      </div>

      {/* Resumo do rateio */}
      <div className="border-b border-border px-5 py-2 text-center text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground">
        XP do encontro: <span className="text-amber-300">{reward.toLocaleString("pt-BR")}</span>
        <span className="mx-2 text-muted-foreground/50">·</span>
        ÷ {partySize} herói(s) = <span className="text-amber-300">{perHero.toLocaleString("pt-BR")} XP cada</span>
      </div>

      {/* Ações rápidas */}
      <div className="flex flex-wrap items-center gap-2 border-b border-border px-5 py-2.5 text-[10px] font-bold uppercase tracking-wider">
        <span className="text-muted-foreground">Recebem XP:</span>
        <button
          type="button"
          onClick={selectAll}
          className="rounded-md border border-emerald-500/40 bg-emerald-500/10 px-2 py-1 text-emerald-300 transition hover:bg-emerald-500/20"
        >
          Todos
        </button>
        <button
          type="button"
          onClick={selectNone}
          className="rounded-md border border-rose-500/40 bg-rose-500/10 px-2 py-1 text-rose-300 transition hover:bg-rose-500/20"
        >
          Nenhum
        </button>
      </div>

      {/* Lista de heróis */}
      <div data-lenis-prevent className="max-h-[46vh] flex-1 space-y-2.5 overflow-y-auto px-5 py-4">
        {combatants.length === 0 ? (
          <p className="py-8 text-center text-xs text-muted-foreground">
            Nenhum herói no encontro (adicione heróis à iniciativa antes de finalizar).
          </p>
        ) : (
          combatants.map((c) => {
            const included = selected.has(c.id);
            return (
              <label
                key={c.id}
                className={`flex cursor-pointer items-center justify-between gap-3 rounded-xl border p-3 transition-colors ${
                  included ? "border-primary/25 bg-primary/[0.04]" : "border-border bg-secondary/30 opacity-80"
                }`}
              >
                <div className="min-w-0">
                  <p className="truncate text-sm font-semibold text-foreground">{c.name}</p>
                  <p className="font-mono text-[10px] text-muted-foreground">
                    Nv {c.level} · {Number(c.currentXp || 0).toLocaleString("pt-BR")} XP
                  </p>
                </div>
                <div className="flex shrink-0 items-center gap-2">
                  <span className={`font-mono text-[11px] font-bold ${included ? "text-amber-300" : "text-muted-foreground/50"}`}>
                    {included ? `+${perHero} XP` : "0 XP"}
                  </span>
                  <input
                    type="checkbox"
                    checked={included}
                    onChange={() => toggle(c.id)}
                    className="h-5 w-5 accent-emerald-500"
                    aria-label={`${c.name} recebe XP`}
                  />
                </div>
              </label>
            );
          })
        )}
      </div>

      {/* Rodapé */}
      <div className="border-t border-border px-5 py-3.5">
        <p className="text-center font-mono text-[10px] uppercase tracking-wider text-muted-foreground">
          {includedCount} herói(s) recebem XP · total {totalXp.toLocaleString("pt-BR")} XP
        </p>
        {error && (
          <p role="alert" className="mt-2 rounded-lg border border-rose-500/40 bg-rose-950/30 px-3 py-1.5 text-center text-[11px] text-rose-300">
            {error}
          </p>
        )}
        <div className="mt-2.5 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
          <button
            type="button"
            onClick={() => !submitting && onClose()}
            disabled={submitting}
            className="h-10 rounded-lg border border-border px-4 text-xs font-bold uppercase tracking-wider text-muted-foreground transition hover:text-foreground disabled:opacity-40"
          >
            Cancelar
          </button>
          <button
            type="button"
            onClick={handleConfirm}
            disabled={submitting}
            className="flex h-10 items-center justify-center gap-2 rounded-lg border border-emerald-500/50 bg-emerald-500/15 px-5 text-xs font-bold uppercase tracking-wider text-emerald-300 transition hover:bg-emerald-500/25 active:scale-95 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {submitting ? <LoaderCircle size={14} className="animate-spin" /> : <Trophy size={14} />}
            Encerrar Encontro
          </button>
        </div>
      </div>
    </div>
  );
}
