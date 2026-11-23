"use client";

import { useEffect, useRef, useState } from "react";
import { Archive, X } from "lucide-react";
import { useStableCallback } from "../../../hooks/useStableCallback";

/**
 * Modal "Guardar no Banco" a partir do inventário.
 * Escolhe a quantidade (1..qty do item) e deposita no primeiro espaço livre do cofre.
 */
export function DepositToBankModal({ item, freeSlots, onClose, onConfirm }) {
  if (!item) return null;
  return <DepositDialog item={item} freeSlots={freeSlots} onClose={onClose} onConfirm={onConfirm} />;
}

function DepositDialog({ item, freeSlots, onClose, onConfirm }) {
  const maxQty = Math.max(1, Number(item.qty ?? item.quantidade) || 1);
  const [qtyInput, setQtyInput] = useState(String(maxQty));
  const dialogRef = useRef(null);
  const qtyRef = useRef(null);
  const stableOnClose = useStableCallback(onClose);
  const hasSpace = freeSlots > 0;
  const amount = Math.min(Math.max(1, Math.floor(Number(qtyInput) || 1)), maxQty);

  useEffect(() => {
    qtyRef.current?.focus();
    qtyRef.current?.select();
    const handleKeyDown = (event) => {
      if (event.key === "Escape") {
        event.stopPropagation();
        stableOnClose();
      }
    };
    document.addEventListener("keydown", handleKeyDown, true);
    return () => document.removeEventListener("keydown", handleKeyDown, true);
  }, [stableOnClose]);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-md" role="presentation" onClick={onClose}>
      <div
        className="relative w-full max-w-sm overflow-hidden rounded-2xl border border-[#6b5a3e]/60 bg-[#16120d] text-[#f1e7d2] shadow-2xl shadow-black/80"
        role="dialog"
        aria-modal="true"
        aria-labelledby="deposit-bank-modal-title"
        ref={dialogRef}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between border-b border-white/10 bg-white/[0.02] px-5 py-4">
          <div className="flex items-center gap-2">
            <span className="flex h-8 w-8 items-center justify-center rounded-lg border border-[var(--theme-accent)]/30 bg-[var(--theme-accent)]/10 text-[var(--theme-accent)]">
              <Archive size={16} />
            </span>
            <div>
              <h3 id="deposit-bank-modal-title" className="text-sm font-semibold tracking-wide text-[#f5efdf]">
                Guardar no Banco
              </h3>
              <p className="text-[11px] text-[#cbb288]">
                {hasSpace ? `${freeSlots} espaço${freeSlots === 1 ? "" : "s"} livre${freeSlots === 1 ? "" : "s"} no cofre` : "Cofre cheio"}
              </p>
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

        <div className="px-5 py-4">
          <p className="truncate text-sm font-semibold text-[#f5efdf]">{item.name}</p>
          <p className="mt-0.5 text-[11px] text-[#cbb288]">
            {maxQty}× na mochila{Number(item.weight) > 0 ? ` · ${Number(item.weight)} kg cada` : ""}
          </p>

          <label className="mt-4 flex flex-col gap-1.5 text-[10px] font-semibold uppercase tracking-wider text-[#cbb288]">
            Quantidade que deseja deixar no banco
            <input
              type="number"
              min={1}
              max={maxQty}
              ref={qtyRef}
              value={qtyInput}
              onChange={(e) => setQtyInput(e.target.value)}
              onFocus={(e) => e.target.select()}
              aria-label="Quantidade que deseja deixar no banco"
              className="h-11 w-full rounded-lg border border-[#4a3d2a]/60 bg-[#0f0d0a]/60 px-3 text-center font-mono text-sm text-[#f1e7d2] outline-none focus:border-[var(--theme-accent)]/60"
            />
            <span className="text-[9px] font-normal normal-case text-[#cbb288]">
              Máximo: {maxQty} {maxQty === 1 ? "unidade" : "unidades"}
            </span>
          </label>

          <button
            type="button"
            disabled={!hasSpace}
            onClick={() => onConfirm(amount)}
            className="mt-4 flex h-10 w-full items-center justify-center gap-2 rounded-lg border border-[var(--theme-accent)]/50 bg-[var(--theme-accent)]/15 px-4 text-xs font-bold uppercase tracking-wider text-[var(--theme-accent)] transition hover:bg-[var(--theme-accent)]/25 active:scale-95 disabled:cursor-not-allowed disabled:opacity-40"
          >
            <Archive size={14} />
            {hasSpace ? `Guardar ${amount > 1 ? `${amount}× ` : ""}no Banco` : "Banco cheio"}
          </button>
          {!hasSpace && (
            <p className="mt-2 text-center text-[10px] text-rose-300">
              Todos os espaços do cofre estão ocupados. Devolva um item pelo Banco para liberar espaço.
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
