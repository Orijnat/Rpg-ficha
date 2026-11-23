"use client";

import { useEffect, useRef, useState } from "react";
import { Package, Search, X, Archive, Undo2, Check } from "lucide-react";
import { useStableCallback } from "../../../hooks/useStableCallback";

/**
 * Modal de cofre do Banco de Azedarack.
 * - Espaço vazio: lista o inventário; selecione um item e escolha a quantidade a guardar.
 * - Espaço ocupado: mostra o item guardado e permite devolver (total ou parcial) ao inventário.
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
  const [selectedId, setSelectedId] = useState(null);
  const [depositQtyInput, setDepositQtyInput] = useState("1");
  const [withdrawQtyInput, setWithdrawQtyInput] = useState(() => String(Math.max(1, Number(slot?.qty) || 1)));
  const dialogRef = useRef(null);
  const stableOnClose = useStableCallback(onClose);
  const occupied = Boolean(slot?.item);

  useEffect(() => {
    const closeButton = dialogRef.current?.querySelector("button");
    closeButton?.focus();
    const handleKeyDown = (event) => {
      if (event.key === "Escape") {
        event.stopPropagation();
        stableOnClose();
      }
    };
    document.addEventListener("keydown", handleKeyDown, true);
    return () => document.removeEventListener("keydown", handleKeyDown, true);
  }, [stableOnClose]);

  const term = search.trim().toLowerCase();
  const filtered = (inventory || []).filter((item) =>
    !term || (item.name || "").toLowerCase().includes(term)
  );
  const selectedItem = selectedId ? (inventory || []).find((item) => item.id === selectedId) || null : null;
  const selectedMax = selectedItem ? Math.max(1, Number(selectedItem.qty ?? selectedItem.quantidade) || 1) : 1;
  const depositAmount = Math.min(Math.max(1, Math.floor(Number(depositQtyInput) || 1)), selectedMax);

  const slotQty = Math.max(1, Number(slot?.qty) || 1);
  const withdrawAmount = Math.min(Math.max(1, Math.floor(Number(withdrawQtyInput) || 1)), slotQty);

  const handleSelect = (item) => {
    setSelectedId(item.id);
    setDepositQtyInput(String(Math.max(1, Number(item.qty ?? item.quantidade) || 1)));
  };

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
          /* ── Estado ocupado: devolver ao inventário (total ou parcial) ── */
          <div className="px-5 py-5">
            <div className="flex items-center gap-3 rounded-xl border border-white/10 bg-white/[0.03] p-3">
              <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border border-[var(--theme-accent)]/30 bg-[var(--theme-accent)]/10 text-[var(--theme-accent)]">
                <Package size={18} />
              </span>
              <div className="min-w-0">
                <p className="truncate text-sm font-semibold text-[var(--theme-title)]">{slot.item}</p>
                <p className="text-[11px] text-[var(--theme-subtitle)]">
                  {slotQty > 1 ? `${slotQty} unidades` : "1 unidade"}
                  {Number(slot.weight) > 0 ? ` · ${Number(slot.weight)} kg cada` : ""}
                </p>
              </div>
            </div>
            {slotQty > 1 && (
              <label className="mt-4 flex flex-col gap-1.5 text-[10px] font-semibold uppercase tracking-wider text-[var(--theme-subtitle)]">
                Quantidade que deseja retirar
                <input
                  type="number"
                  min={1}
                  max={slotQty}
                  value={withdrawQtyInput}
                  onChange={(e) => setWithdrawQtyInput(e.target.value)}
                  onFocus={(e) => e.target.select()}
                  aria-label="Quantidade que deseja retirar"
                  className="h-11 w-full rounded-lg border border-[#4a3d2a]/60 bg-[#0f0d0a]/60 px-3 text-center font-mono text-sm text-[#f1e7d2] outline-none focus:border-[var(--theme-accent)]/60"
                />
                <span className="text-[9px] font-normal normal-case text-[var(--theme-subtitle)]">
                  Máximo: {slotQty} {slotQty === 1 ? "unidade" : "unidades"}
                </span>
              </label>
            )}
            <button
              type="button"
              onClick={() => {
                onWithdraw(slotIndex, withdrawAmount);
                onClose();
              }}
              className="mt-4 flex w-full items-center justify-center gap-2 rounded-lg border border-[var(--theme-accent)]/50 bg-[var(--theme-accent)]/10 px-4 py-2.5 text-xs font-bold uppercase tracking-wider text-[var(--theme-accent)] transition hover:bg-[var(--theme-accent)]/20"
            >
              <Undo2 size={14} />
              Devolver {withdrawAmount > 1 ? `${withdrawAmount}× ` : ""}ao Inventário
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
                  {filtered.map((item) => {
                    const itemQty = Math.max(1, Number(item.qty ?? item.quantidade) || 1);
                    const isSelected = selectedId === item.id;
                    return (
                      <li key={item.id}>
                        <button
                          type="button"
                          onClick={() => handleSelect(item)}
                          aria-pressed={isSelected}
                          className={`flex w-full items-center gap-3 rounded-lg px-3 py-2 text-left transition focus:outline-none focus:ring-1 focus:ring-[var(--theme-accent)]/40 ${
                            isSelected ? "bg-[var(--theme-accent)]/15 ring-1 ring-[var(--theme-accent)]/50" : "hover:bg-[var(--theme-accent)]/10"
                          }`}
                        >
                          <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md border border-white/10 bg-white/5 text-[var(--theme-accent)]">
                            <Package size={14} />
                          </span>
                          <span className="min-w-0 flex-1">
                            <span className="block truncate text-xs font-semibold text-[var(--theme-title)]">
                              {item.name}
                            </span>
                            <span className="text-[10px] text-[var(--theme-subtitle)]">
                              {itemQty}×
                              {Number(item.weight) > 0 ? ` · ${Number(item.weight)} kg cada` : ""}
                            </span>
                          </span>
                          {isSelected && <Check size={14} className="shrink-0 text-[var(--theme-accent)]" aria-hidden="true" />}
                        </button>
                      </li>
                    );
                  })}
                </ul>
              )}
            </div>

            {/* Rodapé: quantidade + confirmar depósito */}
            <div className="border-t border-white/10 bg-white/[0.02] px-5 py-3">
              {selectedItem ? (
                <div className="flex flex-col gap-2.5">
                  <label className="flex flex-col gap-1.5 text-[10px] font-semibold uppercase tracking-wider text-[var(--theme-subtitle)]">
                    Quantidade que deseja deixar no banco
                    <input
                      type="number"
                      min={1}
                      max={selectedMax}
                      value={depositQtyInput}
                      onChange={(e) => setDepositQtyInput(e.target.value)}
                      onFocus={(e) => e.target.select()}
                      aria-label="Quantidade que deseja deixar no banco"
                      className="h-11 w-full rounded-lg border border-[#4a3d2a]/60 bg-[#0f0d0a]/60 px-3 text-center font-mono text-sm text-[#f1e7d2] outline-none focus:border-[var(--theme-accent)]/60"
                    />
                    <span className="text-[9px] font-normal normal-case text-[var(--theme-subtitle)]">
                      Máximo: {selectedMax} {selectedMax === 1 ? "unidade" : "unidades"}
                    </span>
                  </label>
                  <button
                    type="button"
                    onClick={() => {
                      onDeposit(slotIndex, selectedItem.id, depositAmount);
                      onClose();
                    }}
                    className="flex h-9 w-full items-center justify-center gap-1.5 rounded-lg border border-[var(--theme-accent)]/50 bg-[var(--theme-accent)]/15 px-4 text-xs font-bold uppercase tracking-wider text-[var(--theme-accent)] transition hover:bg-[var(--theme-accent)]/25 active:scale-95"
                  >
                    <Archive size={14} />
                    Guardar {depositAmount > 1 ? `${depositAmount}×` : ""}
                  </button>
                </div>
              ) : (
                <p className="text-center text-[10px] uppercase tracking-wider text-[var(--theme-subtitle)]">
                  Selecione um item acima para guardar
                </p>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
