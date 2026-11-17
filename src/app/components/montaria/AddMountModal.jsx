"use client";

import { useEffect, useRef, useState } from "react";
import { Footprints, X } from "lucide-react";

const inputClass =
  "h-9 w-full rounded-lg border border-[#4a3d2a]/60 bg-[#0f0d0a]/60 px-3 text-xs text-[#f1e7d2] outline-none placeholder:text-[#6b5a3e]/60 focus:border-[var(--theme-accent)]/60";
const labelClass =
  "flex flex-col gap-1.5 text-[10px] font-semibold uppercase tracking-wider text-[#cbb288]";

const ESPECIE_SUGESTOES = [
  "Corcel de estribo",
  "Alce Real",
  "Lobo de Pântano",
  "Grifo jovem",
  "Quimera dos Montes",
  "Dragão jovem",
  "Hipogrifo",
  "Cervo de bronze",
];

/**
 * Modal de cadastro de montaria.
 * Nome (obrigatório), espécie (com sugestões), PV atual e máximo e anotações.
 * A cópia só entra na ficha quando o mestre confirma a criação.
 */
export function AddMountModal({ open, onClose, onAdd }) {
  if (!open) return null;
  return <AddMountDialog onClose={onClose} onAdd={onAdd} />;
}

function AddMountDialog({ onClose, onAdd }) {
  const [name, setName] = useState("");
  const [species, setSpecies] = useState("");
  const [hpMax, setHpMax] = useState(20);
  const [hp, setHp] = useState(20);
  const [hpMaxTouched, setHpMaxTouched] = useState(false);
  const [notes, setNotes] = useState("");
  const dialogRef = useRef(null);
  const nameRef = useRef(null);

  useEffect(() => {
    nameRef.current?.focus();
    const handleKeyDown = (event) => {
      if (event.key === "Escape") {
        event.stopPropagation();
        onClose();
      }
    };
    document.addEventListener("keydown", handleKeyDown, true);
    return () => document.removeEventListener("keydown", handleKeyDown, true);
  }, [onClose]);

  const trimmedName = name.trim();
  const canSubmit = trimmedName.length > 0 && Number(hpMax) >= 1 && Number(hp) >= 0;

  const handleMaxChange = (value) => {
    const max = Math.max(1, Math.floor(Number(value) || 1));
    setHpMax(max);
    // Montaria nova nasce com PV cheio; se o mestre já editou o PV atual, respeita o valor dele.
    if (!hpMaxTouched) setHp(max);
    setHpMaxTouched(true);
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    if (!canSubmit) return;
    onAdd({
      name: trimmedName,
      species: species.trim(),
      hp: Math.min(Math.max(0, Math.floor(Number(hp) || 0)), Math.max(1, Math.floor(Number(hpMax) || 1))),
      hpMax: Math.max(1, Math.floor(Number(hpMax) || 1)),
      notes: notes.trim(),
    });
    onClose();
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-md"
      role="presentation"
      onClick={onClose}
    >
      <form
        onSubmit={handleSubmit}
        className="relative flex max-h-[90vh] w-full max-w-lg flex-col overflow-hidden rounded-2xl border border-[#6b5a3e]/60 bg-[#16120d] text-[#f1e7d2] shadow-2xl shadow-black/80"
        role="dialog"
        aria-modal="true"
        aria-labelledby="add-mount-modal-title"
        ref={dialogRef}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Cabeçalho */}
        <div className="flex items-center justify-between border-b border-white/10 bg-white/[0.02] px-5 py-4">
          <div className="flex items-center gap-2">
            <span className="flex h-8 w-8 items-center justify-center rounded-lg border border-[var(--theme-accent)]/30 bg-[var(--theme-accent)]/10 text-[var(--theme-accent)]">
              <Footprints size={16} />
            </span>
            <div>
              <h3 id="add-mount-modal-title" className="text-sm font-semibold tracking-wide text-[#f5efdf]">
                Adotar Montaria
              </h3>
              <p className="text-[11px] text-[#cbb288]">Companheiro de viagem &amp; combate</p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Fechar"
            className="rounded-lg p-1.5 text-[#cbb288] transition-colors hover:bg-white/10 hover:text-[#f5efdf]"
          >
            <X size={18} />
          </button>
        </div>

        {/* Corpo */}
        <div data-lenis-prevent className="flex-1 overflow-y-auto px-5 py-4">
          <label className={labelClass}>
            Nome da montaria *
            <input
              ref={nameRef}
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Ex.: Fantasma Negro, Alce Real..."
              maxLength={80}
              required
              className={inputClass}
            />
          </label>

          <label className={`mt-3 ${labelClass}`}>
            Espécie
            <input
              type="text"
              list="mount-species-suggestions"
              value={species}
              onChange={(e) => setSpecies(e.target.value)}
              placeholder="Ex.: Corcel negro, lobo cinzento..."
              maxLength={80}
              className={inputClass}
            />
            <datalist id="mount-species-suggestions">
              {ESPECIE_SUGESTOES.map((entry) => (
                <option key={entry} value={entry} />
              ))}
            </datalist>
          </label>

          <div className="mt-3 grid grid-cols-2 gap-3">
            <label className={labelClass}>
              PV máximo
              <input
                type="number"
                inputMode="numeric"
                min={1}
                max={999}
                value={hpMax}
                onChange={(e) => handleMaxChange(e.target.value)}
                className={`${inputClass} font-mono text-center`}
              />
            </label>
            <label className={labelClass}>
              PV atual
              <input
                type="number"
                inputMode="numeric"
                min={0}
                max={Math.max(1, Number(hpMax) || 1)}
                value={hp}
                onChange={(e) => setHp(Math.max(0, Math.floor(Number(e.target.value) || 0)))}
                className={`${inputClass} font-mono text-center`}
              />
            </label>
          </div>

          <label className={`mt-3 ${labelClass}`}>
            Anotações
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Sela, temperamento, cicatrizes, onde foi obtida..."
              maxLength={500}
              rows={3}
              className="w-full resize-none rounded-lg border border-[#4a3d2a]/60 bg-[#0f0d0a]/60 px-3 py-2 text-xs text-[#f1e7d2] outline-none placeholder:text-[#6b5a3e]/60 focus:border-[var(--theme-accent)]/60"
            />
          </label>
        </div>

        {/* Rodapé */}
        <div className="border-t border-white/10 bg-white/[0.02] px-5 py-3.5">
          <div className="flex items-center justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="rounded-xl border border-white/10 px-4 py-2 text-[11px] font-bold uppercase tracking-wider text-[#cbb288] transition hover:bg-white/5 hover:text-[#e8d5b0]"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={!canSubmit}
              className="rounded-xl border border-[var(--theme-accent)] bg-[var(--theme-accent)] px-5 py-2 font-serif text-[11px] font-bold uppercase tracking-wider text-[#17140f] transition hover:brightness-110 active:scale-95 disabled:cursor-not-allowed disabled:opacity-50"
            >
              Adotar montaria
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}
