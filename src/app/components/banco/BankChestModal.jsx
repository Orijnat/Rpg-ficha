"use client";

import { useEffect, useRef, useState } from "react";
import { Package, Search, X, Archive, Undo2 } from "lucide-react";

/**
 * Modal de cofre do Banco de Azedarack.
 * - Espaço vazio: lista os itens do inventário para guardá-los no slot.
 * - Espaço ocupado: mostra o item guardado e permite devolvê-lo ao inventário.
 */
export function BankChestModal({ slotIndex, slot, inventory, onClose, onDeposit, onWithdraw }) {
  const isOpen = slotIndex !== null && slotIndex !== undefined;
  if (!isOpen) return null;
  return (
    <ChestDialog
      key={slotIndex}
      slotIndex={slotIndex}
      slot={slot}
      inventory={inventory}
      onClose={onClose}
      onDeposit={onDeposit}
      onWithdraw={onWithdraw}
    />
  );
}

function ChestDialog({ slotIndex, slot, inventory, onClose, onDeposit, onWithdraw }) {
  const [search, setSearch] = useState("");
  const dialogRef = useRef(null);
  const occupied = Boolean(slot?.item);

  useEffect(() => {
    const closeButton = dialogRef.current?.querySelector("button");
    closeButton?.focus();
    const handleKeyDown = (event) => {
      if (event.key === "Escape") {
        event.stopPropagation();
        onClose();
      }
    };
    document.addEventListener("keydown", handleKeyDown, true);
    return () => document.removeEventListener("keydown", handleKeyDown, true);
  }, [onClose]);

  const term = search.trim().toLowerCase();
  const filtered = (inventory || []).filter((item) =>
    !term || (item.name || "").toLowerCase().includes(term)
  );

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-md" role="presentation" onClick={onClose}>
      <div
        className="relative flex max-h-[85vh] w-full max-w-md flex-col overflow-hidden rounded-2xl border border-[#6b5a3e]/60 bg-[#16120d] text-[#f1e7d2] shadow-2xl shadow-black/80"
        role="dialog"
        aria-modal="true"
        aria-labelledby="bank-chest-modal-title"
        ref={dialogRef}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Cabeçalho */}
        <div className="flex items-center justify-between border-b border-white/10 bg-white/[0.02] px-5 py-4">
          <div className="flex items-center gap-2">
            <span className="flex h-8 w-8 items-center justify-center rounded-lg border border-[var(--theme-accent)]/30 bg-[var(--theme-accent)]/10 text-[var(--theme-accent)]">
              <Archive size={16} />
            </span>
            <div>
              <h3 id="bank-chest-modal-title" className="text-sm font-semibold tracking-wide text-[var(--theme-title)]">
                {occupied ? "Espaço Ocupado" : "Guardar no Banco"}
              </h3>
              <p className="text-[11px] text-[var(--theme-subtitle)]">
                Cofre de Azedarack · Espaço {slotIndex + 1}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            aria-label="Fechar"
            className="rounded-lg p-1.5 text-[var(--theme-subtitle)] transition-colors hover:bg-white/10 hover:text-[var(--theme-title)]"
          >
            <X size={18} />
          </button>
        </div>

        {occupied ? (
          /* ── Estado ocupado: devolver ao inventário ── */
          <div className="px-5 py-5">
            <div className="flex items-center gap-3 rounded-xl border border-white/10 bg-white/[0.03] p-3">
              <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border border-[var(--theme-accent)]/30 bg-[var(--theme-accent)]/10 text-[var(--theme-accent)]">
                <Package size={18} />
              </span>
              <div className="min-w-0">
                <p className="truncate text-sm font-semibold text-[var(--theme-title)]">{slot.item}</p>
                <p className="text-[11px] text-[var(--theme-subtitle)]">
                  {Number(slot.qty) > 1 ? `${slot.qty} unidades` : "1 unidade"}
                  {Number(slot.weight) > 0 ? ` · ${Number(slot.weight)} kg cada` : ""}
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={() => {
                onWithdraw(slotIndex);
                onClose();
              }}
              className="mt-4 flex w-full items-center justify-center gap-2 rounded-lg border border-[var(--theme-accent)]/50 bg-[var(--theme-accent)]/10 px-4 py-2.5 text-xs font-bold uppercase tracking-wider text-[var(--theme-accent)] transition hover:bg-[var(--theme-accent)]/20"
            >
              <Undo2 size={14} />
              Devolver ao Inventário
            </button>
          </div>
        ) : (
          /* ── Estado vazio: escolher do inventário ── */
          <>
            <div className="border-b border-white/5 px-5 py-3">
              <div className="group relative">
                <span className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 text-[#6b5a3e] transition group-focus-within:text-[var(--theme-accent)]">
                  <Search size={14} />
                </span>
                <input
                  type="text"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Buscar item no inventário..."
                  aria-label="Buscar item no inventário"
                  autoFocus
                  className="w-full rounded-lg border border-[#4a3d2a]/60 bg-[#0f0d0a]/60 py-2 pl-9 pr-3 text-xs text-[#f1e7d2] outline-none placeholder:text-[#6b5a3e]/60 focus:border-[var(--theme-accent)]/60"
                />
              </div>
            </div>

            <div data-lenis-prevent className="flex-1 overflow-y-auto px-3 py-2">
              {filtered.length === 0 ? (
                <p className="px-3 py-8 text-center text-xs text-[var(--theme-subtitle)]">
                  {term ? "Nenhum item encontrado com esse nome." : "Seu inventário está vazio."}
                </p>
              ) : (
                <ul className="space-y-1">
                  {filtered.map((item) => (
                    <li key={item.id}>
                      <button
                        type="button"
                        onClick={() => {
                          onDeposit(slotIndex, item.id);
                          onClose();
                        }}
                        className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-left transition hover:bg-[var(--theme-accent)]/10 focus:outline-none focus:ring-1 focus:ring-[var(--theme-accent)]/40"
                      >
                        <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md border border-white/10 bg-white/5 text-[var(--theme-accent)]">
                          <Package size={14} />
                        </span>
                        <span className="min-w-0 flex-1">
                          <span className="block truncate text-xs font-semibold text-[var(--theme-title)]">
                            {item.name}
                          </span>
                          <span className="text-[10px] text-[var(--theme-subtitle)]">
                            {Number(item.qty) > 0 ? `${item.qty}×` : "1×"}
                            {Number(item.weight) > 0 ? ` · ${Number(item.weight)} kg` : ""}
                          </span>
                        </span>
                        <span className="shrink-0 text-[10px] font-bold uppercase tracking-wider text-[var(--theme-accent)]/80">
                          Guardar
                        </span>
                      </button>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
