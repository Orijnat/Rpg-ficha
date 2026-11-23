"use client";

import { useEffect, useRef, useState } from "react";
import { LoaderCircle, Swords, X } from "lucide-react";
import { useStableCallback } from "../../../hooks/useStableCallback";

const TIPOS_ENCONTRO = [
  { id: "combate", label: "Combate Tático" },
  { id: "social", label: "Desafio Social / Negociação" },
  { id: "exploracao", label: "Exploração / Armadilhas" },
];

/**
 * Modal "Forjar Encontro" (Sala de Guerra): cadastro do encontro — nome, tipo,
 * recompensa de XP total e tesouro. Ao confirmar, delega o submit ao mestre via
 * onSubmit (que conhece campanha/token) e, em caso de sucesso, dispara onCreated
 * com o encontro criado para o fluxo de alocação de participantes.
 */
export default function CreateEncounterModal({ isOpen, onClose, onSubmit, onCreated }) {
  const dialogRef = useRef(null);

  if (!isOpen) return null;

  return <CreateEncounterBody dialogRef={dialogRef} onClose={onClose} onSubmit={onSubmit} onCreated={onCreated} />;
}

function CreateEncounterBody({ dialogRef, onClose, onSubmit, onCreated }) {
  const stableOnClose = useStableCallback(onClose);
  const submittingRef = useRef(false);
  const [submitting, setSubmitting] = useState(false);
  const [nome, setNome] = useState("");
  const [tipo, setTipo] = useState("combate");
  const [xp, setXp] = useState(100);
  const [tesouro, setTesouro] = useState("");
  const [error, setError] = useState("");

  // Foco inicial + Escape + focus trap simples (mesmo padrão do ConfirmDialog)
  useEffect(() => {
    const dialog = dialogRef.current;
    const focusable = dialog?.querySelectorAll(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
    );
    const first = focusable?.[0];
    first?.focus();

    const handleKeyDown = (event) => {
      if (event.key === "Escape" && !submittingRef.current) {
        event.stopPropagation();
        stableOnClose();
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
  }, [dialogRef, stableOnClose]);

  const handleCancel = () => {
    if (submittingRef.current) return;
    onClose();
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (submittingRef.current) return;
    if (!nome.trim()) {
      setError("O nome do encontro é obrigatório.");
      return;
    }
    setError("");
    setSubmitting(true);
    submittingRef.current = true;
    try {
      const result = await onSubmit({
        nome: nome.trim(),
        tipo,
        xp: Number(xp) || 0,
        tesouro: tesouro.trim(),
      });
      if (!result?.ok) {
        setError(result?.message || "Falha ao forjar o encontro.");
        return;
      }
      setNome("");
      setTipo("combate");
      setXp(100);
      setTesouro("");
      setError("");
      onCreated?.(result.created);
      onClose();
    } catch (err) {
      setError(err?.message || "Falha ao forjar o encontro.");
    } finally {
      submittingRef.current = false;
      setSubmitting(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 p-4 backdrop-blur-sm animate-in fade-in-50"
      onClick={() => {
        if (!submittingRef.current) handleCancel();
      }}
    >
      <div
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby="create-encontro-title"
        className="relative flex max-h-[92vh] w-full max-w-2xl flex-col overflow-hidden rounded-2xl border border-primary/40 bg-card shadow-2xl shadow-black/70"
        onClick={(event) => event.stopPropagation()}
      >
        {/* Cabeçalho */}
        <div className="flex items-start justify-between gap-3 border-b border-border px-5 py-4">
          <div className="flex items-center gap-3">
            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-primary/50 bg-primary/15 text-primary">
              <Swords size={20} />
            </span>
            <div>
              <h2 id="create-encontro-title" className="font-cinzel text-base font-black text-foreground">
                Forjar Encontro
              </h2>
              <p className="mt-0.5 text-[11px] text-muted-foreground">
                Defina o nome, o tipo e as recompensas do novo confronto.
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={handleCancel}
            disabled={submitting}
            aria-label="Fechar"
            className="rounded-lg p-1.5 text-muted-foreground transition hover:bg-secondary hover:text-foreground disabled:opacity-40"
          >
            <X size={18} />
          </button>
        </div>

        {/* Formulário */}
        <form onSubmit={handleSubmit} className="flex min-h-0 flex-1 flex-col">
          <div data-lenis-prevent className="overflow-y-auto px-5 py-4">
            <div className="grid gap-4 sm:grid-cols-[1.5fr_1fr]">
              <div>
                <label htmlFor="create-encontro-nome" className="block text-xs font-bold uppercase text-muted-foreground">
                  Nome do Encontro *
                </label>
                <input
                  id="create-encontro-nome"
                  type="text"
                  required
                  value={nome}
                  onChange={(e) => setNome(e.target.value)}
                  placeholder="Ex.: Emboscada nas Ruínas Antigas"
                  className="mt-1 min-h-10 w-full rounded border border-border bg-input-background px-3 text-xs text-foreground outline-none focus:border-primary"
                />
              </div>

              <div>
                <label htmlFor="create-encontro-tipo" className="block text-xs font-bold uppercase text-muted-foreground">
                  Tipo de Encontro
                </label>
                <select
                  id="create-encontro-tipo"
                  value={tipo}
                  onChange={(e) => setTipo(e.target.value)}
                  className="mt-1 min-h-10 w-full rounded border border-border bg-input-background px-3 text-xs text-foreground outline-none focus:border-primary"
                >
                  {TIPOS_ENCONTRO.map((t) => (
                    <option key={t.id} value={t.id}>
                      {t.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="mt-4 grid gap-4 sm:grid-cols-[1fr_1fr]">
              <div>
                <label htmlFor="create-encontro-xp" className="block text-xs font-bold uppercase text-muted-foreground">
                  XP Total do Encontro
                </label>
                <input
                  id="create-encontro-xp"
                  type="number"
                  min="0"
                  value={xp}
                  onChange={(e) => setXp(Number(e.target.value))}
                  title="Total do encontro: dividido igualmente entre os heróis da iniciativa"
                  className="mt-1 min-h-10 w-full rounded border border-border bg-input-background px-3 text-xs text-foreground outline-none focus:border-primary"
                />
              </div>

              <div>
                <label htmlFor="create-encontro-tesouro" className="block text-xs font-bold uppercase text-muted-foreground">
                  Tesouro
                </label>
                <input
                  id="create-encontro-tesouro"
                  type="text"
                  value={tesouro}
                  onChange={(e) => setTesouro(e.target.value)}
                  placeholder="Ex.: 500 pe / artefato lendário"
                  className="mt-1 min-h-10 w-full rounded border border-border bg-input-background px-3 text-xs text-foreground outline-none focus:border-primary"
                />
              </div>
            </div>
          </div>

          {/* Rodapé */}
          <div className="border-t border-border px-5 py-3.5">
            <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
              <button
                type="button"
                onClick={handleCancel}
                disabled={submitting}
                className="h-10 rounded-lg border border-border px-4 text-xs font-bold uppercase tracking-wider text-muted-foreground transition hover:text-foreground disabled:opacity-40"
              >
                Cancelar
              </button>
              <button
                type="submit"
                disabled={submitting}
                className="flex h-10 items-center justify-center gap-2 rounded-lg bg-primary px-4 text-xs font-bold uppercase tracking-wider text-primary-foreground transition hover:brightness-110 active:scale-95 disabled:cursor-not-allowed disabled:opacity-40"
              >
                {submitting ? <LoaderCircle size={15} className="animate-spin" /> : <Swords size={15} />}
                {submitting ? "Forjando…" : "Forjar Encontro"}
              </button>
            </div>
            {error && (
              <p role="alert" className="mt-2 rounded-lg border border-rose-500/40 bg-rose-950/30 px-3 py-1.5 text-center text-[11px] text-rose-300">
                {error}
              </p>
            )}
          </div>
        </form>
      </div>
    </div>
  );
}
