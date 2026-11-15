"use client";

import { useEffect, useRef } from "react";
import { Minus, X } from "lucide-react";

/**
 * Janela flutuante redimensionável com arraste pelo cabeçalho.
 * O conteúdo (children) é montado uma vez; fechar desmonta.
 */
export default function FloatingWindow({ title, icon, win, onClose, onFocus, onMove, onResize, onMinimize, children }) {
  const dragRef = useRef(null); // { mode: "move"|"resize", pointerId, startX, startY, origX, origY, origW, origH }

  useEffect(() => {
    const handlePointerMove = (event) => {
      const drag = dragRef.current;
      if (!drag) return;
      const dx = event.clientX - drag.startX;
      const dy = event.clientY - drag.startY;
      if (drag.mode === "move") {
        const maxX = window.innerWidth - 80;
        const maxY = window.innerHeight - 80;
        onMove(
          Math.max(0, Math.min(maxX, drag.origX + dx)),
          Math.max(0, Math.min(maxY, drag.origY + dy))
        );
      } else {
        onResize(
          Math.max(280, Math.min(window.innerWidth - 16, drag.origW + dx)),
          Math.max(240, Math.min(window.innerHeight - 16, drag.origH + dy))
        );
      }
    };
    const handlePointerUp = () => {
      dragRef.current = null;
      document.body.style.userSelect = "";
    };
    window.addEventListener("pointermove", handlePointerMove);
    window.addEventListener("pointerup", handlePointerUp);
    return () => {
      window.removeEventListener("pointermove", handlePointerMove);
      window.removeEventListener("pointerup", handlePointerUp);
    };
  }, [onMove, onResize]);

  const beginMove = (event) => {
    if (event.target.closest("button")) return; // não arrasta ao clicar em botões do header
    onFocus();
    dragRef.current = { mode: "move", startX: event.clientX, startY: event.clientY, origX: win.x, origY: win.y };
    document.body.style.userSelect = "none";
  };
  const beginResize = (event) => {
    event.preventDefault();
    event.stopPropagation();
    onFocus();
    dragRef.current = { mode: "resize", startX: event.clientX, startY: event.clientY, origW: win.w, origH: win.h };
    document.body.style.userSelect = "none";
  };

  if (win.minimized) return null;

  return (
    <div
      role="dialog"
      aria-modal="false"
      aria-label={title}
      className="absolute flex flex-col overflow-hidden rounded-2xl border border-primary/40 bg-card/95 shadow-[0_24px_80px_rgba(0,0,0,0.75),0_0_40px_color-mix(in_srgb,var(--primary)_12%,transparent)] backdrop-blur-xl"
      style={{ left: win.x, top: win.y, width: win.w, height: win.h, zIndex: win.z }}
      onPointerDown={onFocus}
    >
      <div
        className="flex cursor-move select-none items-center justify-between gap-2 border-b border-primary/20 bg-gradient-to-r from-primary/15 via-primary/5 to-transparent px-3 py-2"
        onPointerDown={beginMove}
      >
        <div className="flex min-w-0 items-center gap-2 font-cinzel text-[11px] font-bold uppercase tracking-wider text-primary">
          <span className="text-primary">{icon}</span>
          <span className="truncate">{title}</span>
        </div>
        <div className="flex shrink-0 items-center gap-1">
          <button
            type="button"
            onClick={onMinimize}
            className="rounded-md border border-white/10 bg-white/5 p-1.5 text-muted-foreground transition hover:text-foreground"
            title="Minimizar"
            aria-label="Minimizar janela"
          >
            <Minus size={12} />
          </button>
          <button
            type="button"
            onClick={onClose}
            className="rounded-md border border-white/10 bg-white/5 p-1.5 text-muted-foreground transition hover:border-rose-500/40 hover:text-rose-300"
            title="Fechar"
            aria-label="Fechar janela"
          >
            <X size={12} />
          </button>
        </div>
      </div>
      <div className="custom-scroll min-h-0 flex-1 overflow-auto p-2">{children}</div>
      {/* Alça de redimensionar (canto inferior direito) */}
      <button
        type="button"
        onPointerDown={beginResize}
        className="absolute bottom-0.5 right-0.5 h-6 w-6 cursor-nwse-resize touch-none rounded-br-2xl text-muted-foreground/60 transition hover:text-primary"
        aria-label="Arrastar para redimensionar"
        title="Arrastar para redimensionar"
      >
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-full w-full">
          <path d="M21 3 L3 21 M15 21 L21 15 M9 21 L21 9" strokeLinecap="round" />
        </svg>
      </button>
    </div>
  );
}
