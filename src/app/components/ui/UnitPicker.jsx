"use client";

/**
 * Seletor de quantidade unidade por unidade.
 * Renderiza uma fileira de "pips" numerados (1..N): clicar no pip N seleciona N unidades;
 * clicar de novo no último pip selecionado devolve uma unidade (N-1).
 * Para pilhas maiores que `pipLimit`, exibe um campo numérico para entrada exata.
 */
export function UnitPicker({ value, max, onChange, label = "Quantidade", pipLimit = 24 }) {
  const safeMax = Math.max(1, Math.floor(Number(max) || 1));
  const amount = Math.min(Math.max(1, Math.floor(Number(value) || 1)), safeMax);
  const shown = Math.min(safeMax, pipLimit);

  const handlePip = (n) => {
    onChange(n === amount ? n - 1 : n);
  };

  return (
    <div className="flex flex-col gap-1.5">
      <div className="flex flex-wrap items-center gap-1" role="group" aria-label={label}>
        {Array.from({ length: shown }, (_, i) => {
          const n = i + 1;
          const filled = n <= amount;
          return (
            <button
              key={n}
              type="button"
              onClick={() => handlePip(n)}
              aria-pressed={n === amount}
              aria-label={`${n} ${n === 1 ? "unidade" : "unidades"}`}
              className={`flex h-7 w-7 items-center justify-center rounded-md border font-mono text-[10px] font-bold transition active:scale-90 ${
                filled
                  ? "border-[var(--theme-accent)]/60 bg-[var(--theme-accent)]/25 text-[var(--theme-accent)] shadow-[0_0_6px_rgba(216,155,56,0.35)]"
                  : "border-white/10 bg-white/[0.03] text-[var(--theme-subtitle)] hover:border-[var(--theme-accent)]/40 hover:text-[var(--theme-accent)]"
              }`}
            >
              {n}
            </button>
          );
        })}
        {safeMax > shown && (
          <span className="px-1 text-[10px] font-semibold text-[var(--theme-subtitle)]">
            +{safeMax - shown}
          </span>
        )}
      </div>
      <div className="flex items-center justify-between gap-2">
        <span className="text-[10px] uppercase tracking-wider text-[var(--theme-subtitle)]">
          {amount} de {safeMax} {safeMax === 1 ? "unidade" : "unidades"}
        </span>
        {safeMax > shown && (
          <input
            type="number"
            min={1}
            max={safeMax}
            value={amount}
            onChange={(e) => onChange(e.target.value)}
            aria-label={`${label} (entrada exata)`}
            className="h-7 w-16 rounded-md border border-white/10 bg-white/[0.03] text-center font-mono text-[10px] text-[var(--theme-title)] outline-none focus:border-[var(--theme-accent)]/60"
          />
        )}
      </div>
    </div>
  );
}
