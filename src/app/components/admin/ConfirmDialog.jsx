"use client";

import { useState } from "react";
import { AlertTriangle, ShieldAlert, X } from "lucide-react";

export default function ConfirmDialog({
  isOpen,
  title = "Confirmar ação sensível",
  message = "Esta alteração tem efeito permanente e será registrada em auditoria.",
  confirmText = "Confirmar e Executar",
  cancelText = "Cancelar",
  dangerLevel = "danger",
  requireTypedText = null,
  onConfirm,
  onCancel,
}) {
  const [typedValue, setTypedValue] = useState("");

  if (!isOpen) return null;

  const isDanger = dangerLevel === "danger";
  const canConfirm = !requireTypedText || typedValue.trim().toLowerCase() === requireTypedText.trim().toLowerCase();

  const handleConfirm = () => {
    if (!canConfirm) return;
    onConfirm();
    setTypedValue("");
  };

  const handleCancel = () => {
    setTypedValue("");
    onCancel();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-md">
      <div className="relative w-full max-w-md rounded-2xl border-2 border-primary/50 bg-[#0f1118] p-6 shadow-2xl shadow-black/80">
        <button
          type="button"
          onClick={handleCancel}
          className="absolute right-4 top-4 rounded-lg p-1.5 text-muted-foreground hover:bg-white/10 hover:text-foreground"
        >
          <X size={18} />
        </button>

        <div className="flex items-center gap-3">
          <div
            className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border ${
              isDanger
                ? "border-rose-500/50 bg-rose-950/40 text-rose-400"
                : "border-amber-500/50 bg-amber-950/40 text-amber-400"
            }`}
          >
            {isDanger ? <ShieldAlert size={22} /> : <AlertTriangle size={22} />}
          </div>
          <div>
            <h3 className="font-serif text-lg font-black uppercase tracking-wider text-foreground">
              {title}
            </h3>
            <span className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
              Auditoria ativa do sistema
            </span>
          </div>
        </div>

        <p className="mt-4 font-serif text-sm leading-relaxed text-muted-foreground">
          {message}
        </p>

        {requireTypedText && (
          <div className="mt-4 rounded-lg border border-border bg-input-background p-3">
            <label className="block text-xs font-semibold text-muted-foreground">
              Para prosseguir, digite exatamente{" "}
              <strong className="text-foreground">&quot;{requireTypedText}&quot;</strong>:
            </label>
            <input
              type="text"
              value={typedValue}
              onChange={(e) => setTypedValue(e.target.value)}
              placeholder={requireTypedText}
              className="mt-2 min-h-10 w-full rounded-md border border-border bg-black/50 px-3 text-sm text-foreground outline-none focus:border-primary"
            />
          </div>
        )}

        <div className="mt-6 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
          <button
            type="button"
            onClick={handleCancel}
            className="min-h-11 rounded-lg border border-border bg-secondary px-4 py-2 text-xs font-bold uppercase tracking-wider text-secondary-foreground transition hover:border-primary/50 active:scale-95"
          >
            {cancelText}
          </button>
          <button
            type="button"
            disabled={!canConfirm}
            onClick={handleConfirm}
            className={`min-h-11 rounded-lg px-4 py-2 text-xs font-black uppercase tracking-wider text-white transition active:scale-95 disabled:cursor-not-allowed disabled:opacity-40 ${
              isDanger
                ? "bg-rose-600 shadow-lg shadow-rose-950 hover:bg-rose-500"
                : "bg-primary shadow-lg shadow-primary/30 hover:brightness-110"
            }`}
          >
            {confirmText}
          </button>
        </div>
      </div>
    </div>
  );
}
