"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { DoorOpen, LoaderCircle, Skull, Trophy, X } from "lucide-react";
import { calculateLevelFromXP } from "../../../lib/modifiers";

const OUTCOMES = [
  { id: "vitoria", label: "Vitória", Icon: Trophy, activeClass: "border-emerald-500/60 bg-emerald-500/15 text-emerald-300" },
  { id: "derrota", label: "Derrota", Icon: Skull, activeClass: "border-rose-500/60 bg-rose-500/15 text-rose-300" },
  { id: "fuga", label: "Fugiu", Icon: DoorOpen, activeClass: "border-amber-500/60 bg-amber-500/15 text-amber-300" },
];

function clampXp(value) {
  const n = Math.floor(Number(value));
  if (!Number.isFinite(n) || n < 0) return 0;
  return Math.min(n, 1_000_000);
}

/**
 * Modal "Finalizar Encontro" (Sala de Guerra): o mestre seleciona quais heróis
 * receberam XP, quanto cada um recebe e o desfecho de cada um
 * (Vitória / Derrota / Fuga). Quem perdeu ou fugiu recebe 0 XP por padrão.
 * Ao confirmar, o encontro é marcado como finalizado (ativo = false) e a
 * distribuição entra no log da batalha.
 *
 * Props:
 * - isOpen, onClose: controle do modal
 * - encounter: encontro ativo (initiative + recursos.xp)
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
  const encounterKey = `${encounter?.id}:${isOpen ? "open" : "closed"}`;

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 p-4 backdrop-blur-sm animate-in fade-in-50"
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
        onClose={onClose}
        onFinalize={onFinalize}
      />
    </div>
  );
}

function FinalizeBody({ dialogRef, submittingRef, encounter, combatants, reward, onClose, onFinalize }) {
  const perHero = combatants.length > 0 ? Math.floor(reward / combatants.length) : 0;
  const [rows, setRows] = useState(() =>
    combatants.map((c) => ({ ...c, outcome: "vitoria", included: true, xp: perHero }))
  );
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);

  const totalXp = rows.reduce((sum, row) => sum + (row.included ? clampXp(row.xp) : 0), 0);
  const includedCount = rows.filter((row) => row.included && clampXp(row.xp) > 0).length;

  // Foco inicial + Escape + focus trap simples (mesmo padrão do ConfirmDialog)
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

  const setOutcome = (id, outcome) => {
    setRows((current) =>
      current.map((row) => {
        if (row.id !== id) return row;
        if (outcome === "vitoria") {
          return { ...row, outcome, included: true, xp: perHero };
        }
        // Derrota/Fuga: sem XP por padrão — o mestre pode reativar ou editar abaixo
        return { ...row, outcome, included: false, xp: 0 };
      })
    );
  };

  const toggleIncluded = (id) => {
    setRows((current) =>
      current.map((row) => {
        if (row.id !== id) return row;
        const included = !row.included;
        return { ...row, included, xp: included ? (clampXp(row.xp) || perHero) : 0 };
      })
    );
  };

  const setXp = (id, value) => {
    const xp = clampXp(value);
    setRows((current) =>
      current.map((row) =>
        row.id === id ? { ...row, xp, included: xp > 0 } : row
      )
    );
  };

  const setAll = (outcome) => {
    setRows((current) =>
      current.map((row) =>
        outcome === "vitoria"
          ? { ...row, outcome, included: true, xp: perHero }
          : { ...row, outcome, included: false, xp: 0 }
      )
    );
  };

  const handleConfirm = async () => {
    if (submitting) return;
    setSubmitting(true);
    setError(null);
    submittingRef.current = true;
    try {
      const result = await onFinalize(
        rows.map((row) => ({
          id: row.id,
          name: row.name,
          outcome: row.outcome,
          included: row.included,
          xp: row.included ? clampXp(row.xp) : 0,
        }))
      );
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
      className="flex max-h-[92vh] w-full max-w-lg flex-col overflow-hidden rounded-2xl border border-amber-500/30 bg-card shadow-2xl shadow-black/70"
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
              {encounter?.nome ? `"${encounter.nome}" — ` : ""}quem ganha XP, quanto e o desfecho de cada herói. O encontro é encerrado (sai da iniciativa).
            </p>
          </div>
        </div>
        <button
          type="button"
          onClick={() => !submitting && onClose()}
          disabled={submitting}
          aria-label="Fechar"
          className="rounded-lg p-1.5 text-muted-foreground transition hover:bg-secondary hover:text-foreground disabled:opacity-40"
        >
          <X size={18} />
        </button>
      </div>

      {/* Ações rápidas */}
      <div className="flex flex-wrap items-center gap-2 border-b border-border px-5 py-2.5 text-[10px] font-bold uppercase tracking-wider">
        <span className="text-muted-foreground">Todos:</span>
        <button type="button" onClick={() => setAll("vitoria")} className="rounded-md border border-emerald-500/40 bg-emerald-500/10 px-2 py-1 text-emerald-300 transition hover:bg-emerald-500/20">
          Vitória +{perHero}
        </button>
        <button type="button" onClick={() => setAll("derrota")} className="rounded-md border border-rose-500/40 bg-rose-500/10 px-2 py-1 text-rose-300 transition hover:bg-rose-500/20">
          Derrota (0 XP)
        </button>
        <button type="button" onClick={() => setAll("fuga")} className="rounded-md border border-amber-500/40 bg-amber-500/10 px-2 py-1 text-amber-300 transition hover:bg-amber-500/20">
          Fugiu (0 XP)
        </button>
      </div>

      {/* Lista de heróis */}
      <div data-lenis-prevent className="max-h-[46vh] flex-1 space-y-2.5 overflow-y-auto px-5 py-4">
        {rows.length === 0 ? (
          <p className="py-8 text-center text-xs text-muted-foreground">
            Nenhum herói no encontro (adicione heróis à iniciativa antes de finalizar).
          </p>
        ) : (
          rows.map((row) => {
            const included = row.included && clampXp(row.xp) > 0;
            return (
              <div
                key={row.id}
                className={`rounded-xl border p-3 transition-colors ${
                  included ? "border-primary/25 bg-primary/[0.04]" : "border-border bg-secondary/30 opacity-80"
                }`}
              >
                <div className="flex items-center justify-between gap-2">
                  <div className="min-w-0">
                    <p className="truncate text-sm font-semibold text-foreground">{row.name}</p>
                    <p className="font-mono text-[10px] text-muted-foreground">
                      Nv {row.level} · {Number(row.currentXp || 0).toLocaleString("pt-BR")} XP
                    </p>
                  </div>
                  <label className="flex shrink-0 cursor-pointer items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                    <input
                      type="checkbox"
                      checked={row.included}
                      onChange={() => toggleIncluded(row.id)}
                      className="h-4 w-4 accent-emerald-500"
                      aria-label={`${row.name} recebe XP`}
                    />
                    Recebe XP
                  </label>
                </div>
                <div className="mt-2 flex flex-wrap items-center justify-between gap-2">
                  <div className="flex gap-1.5" role="group" aria-label={`Desfecho de ${row.name}`}>
                    {OUTCOMES.map(({ id, label, Icon, activeClass }) => {
                      const active = row.outcome === id;
                      return (
                        <button
                          key={id}
                          type="button"
                          onClick={() => setOutcome(row.id, id)}
                          aria-pressed={active}
                          title={label}
                          className={`flex items-center gap-1 rounded-lg border px-2 py-1.5 text-[10px] font-bold uppercase tracking-wider transition active:scale-95 ${
                            active ? activeClass : "border-border text-muted-foreground hover:text-foreground"
                          }`}
                        >
                          <Icon size={12} />
                          <span className="hidden sm:inline">{label}</span>
                        </button>
                      );
                    })}
                  </div>
                  <label className="flex shrink-0 items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                    XP
                    <input
                      type="number"
                      min={0}
                      value={row.xp}
                      onChange={(e) => setXp(row.id, e.target.value)}
                      className="h-8 w-20 rounded-lg border border-border bg-input-background px-2 text-center font-mono text-xs text-foreground outline-none focus:border-primary disabled:opacity-50"
                      aria-label={`XP para ${row.name}`}
                    />
                  </label>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Rodapé */}
      <div className="border-t border-border px-5 py-3.5">
        <p className="text-center text-[9px] uppercase tracking-[0.2em] text-muted-foreground">
          XP do encontro: {reward.toLocaleString("pt-BR")}
          {combatants.length > 0 && <> ÷ {combatants.length} herói(s) = <strong className="text-amber-400">{perHero.toLocaleString("pt-BR")} XP cada</strong></>}
        </p>
        <p className="mt-0.5 text-center font-mono text-[10px] uppercase tracking-wider text-muted-foreground">
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
            className="flex h-10 items-center justify-center gap-2 rounded-lg border border-amber-500/60 bg-amber-500/20 px-4 text-xs font-bold uppercase tracking-wider text-amber-200 transition hover:bg-amber-500/30 active:scale-95 disabled:cursor-not-allowed disabled:opacity-40"
          >
            {submitting ? <LoaderCircle size={15} className="animate-spin" /> : <Trophy size={15} />}
            {submitting ? "Finalizando…" : "Finalizar Encontro"}
          </button>
        </div>
      </div>
    </div>
  );
}
