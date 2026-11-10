"use client";

import { useState, useEffect } from "react";
import { Dices, LockKeyhole } from "lucide-react";
import { calculateModifier, formatModifier } from "../../lib/modifiers";
import { useDice } from "../context/DiceContext";

export function modifier(score) {
  return formatModifier(calculateModifier(score));
}


export function uid() {
  return Math.random().toString(36).slice(2);
}

export function HPBar({ hp, max }) {
  const current = Number(hp) || 0;
  const maximum = Math.max(1, Number(max) || 1);
  const pct = Math.max(0, Math.min(100, (current / maximum) * 100));
  const isCritical = pct <= 25;

  const bgStyle =
    pct > 50
      ? "linear-gradient(90deg, #15803d 0%, #22c55e 50%, #4ade80 100%)"
      : pct > 25
        ? "linear-gradient(90deg, #b45309 0%, var(--primary) 50%, #fde047 100%)"
        : "linear-gradient(90deg, #881337 0%, #e11d48 50%, #fb7185 100%)";

  const glowShadow =
    pct > 50
      ? "0 0 14px rgba(34, 197, 94, 0.55), inset 0 1px 2px rgba(255,255,255,0.4)"
      : pct > 25
        ? "0 0 14px rgba(216, 155, 56, 0.5), inset 0 1px 2px rgba(255,255,255,0.4)"
        : "0 0 16px rgba(225, 29, 72, 0.75), inset 0 1px 2px rgba(255,255,255,0.5)";

  return (
    <div className="alchemy-vial relative h-3.5 w-full">
      <div
        className={`h-full rounded-full transition-all duration-300 ease-out${isCritical ? " pulsing-danger" : ""}`}
        style={{
          width: `${pct}%`,
          background: bgStyle,
          boxShadow: glowShadow,
        }}
      />
      <div className="alchemy-vial-glass" />
    </div>
  );
}

function toSafeString(v) {
  if (typeof v === "string") return v;
  if (v === null || v === undefined) return "";
  if (typeof v === "number") return String(v);
  if (typeof v === "object") {
    try {
      return JSON.stringify(v, null, 2);
    } catch {
      return String(v);
    }
  }
  return String(v);
}

export function EditableText({
  value,
  onChange,
  className = "",
  multiline = false,
  placeholder = "—",
  disabled = false,
  label = "Texto editável",
}) {
  const [editing, setEditing] = useState(false);
  const safeValue = toSafeString(value);
  const [draft, setDraft] = useState(safeValue);

  useEffect(() => {
    setDraft(toSafeString(value));
  }, [value]);

  const commit = () => {
    onChange(draft);
    setEditing(false);
  };

  if (disabled) {
    return (
      <span
        className={`cursor-not-allowed opacity-80 ${className}`}
        title="Campo bloqueado pelo narrador"
      >
        {safeValue || <span className="italic text-muted-foreground">{placeholder}</span>}
      </span>
    );
  }

  if (!editing) {
    return (
      <span
        role="button"
        tabIndex={0}
        aria-label={`Editar ${label}: ${safeValue || placeholder}`}
        className={`cursor-pointer rounded transition-colors duration-150 hover:text-primary focus-visible:ring-2 focus-visible:ring-primary focus-visible:outline-none ${className}`}
        onClick={() => {
          setDraft(safeValue);
          setEditing(true);
        }}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            setDraft(safeValue);
            setEditing(true);
          }
        }}
      >
        {safeValue || <span className="italic text-muted-foreground">{placeholder}</span>}
      </span>
    );
  }

  if (multiline) {
    return (
      <textarea
        autoFocus
        aria-label={label}
        className={`w-full resize-none rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-foreground shadow-sm outline-none transition focus:border-primary focus:ring-2 focus:ring-ring/20 ${className}`}
        value={draft}
        rows={4}
        onBlur={commit}
        onChange={(event) => setDraft(event.target.value)}
      />
    );
  }

  return (
    <input
      autoFocus
      aria-label={label}
      className={`w-full rounded-lg border border-white/10 bg-white/5 px-2 py-1 text-foreground shadow-sm outline-none transition focus:border-primary focus:ring-2 focus:ring-ring/20 ${className}`}
      value={draft}
      onBlur={commit}
      onChange={(event) => setDraft(event.target.value)}
      onKeyDown={(event) => event.key === "Enter" && commit()}
    />
  );
}

export function EditableNumber({
  value,
  onChange,
  className = "",
  min,
  max,
  disabled = false,
  label = "Valor numérico",
}) {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(String(value));
  const [invalid, setInvalid] = useState(false);

  const commit = () => {
    const parsed = Number(draft);

    if (draft.trim() !== "" && Number.isInteger(parsed) && Number.isFinite(parsed)) {
      const clamped =
        min !== undefined
          ? Math.max(min, max !== undefined ? Math.min(max, parsed) : parsed)
          : max !== undefined
            ? Math.min(max, parsed)
            : parsed;

      onChange(clamped);
      setInvalid(false);
    } else {
      setDraft(String(value));
      setInvalid(true);
    }

    setEditing(false);
  };

  if (disabled) {
    return (
      <span
        className={`inline-flex items-center gap-1 cursor-not-allowed opacity-75 ${className}`}
        title="Campo bloqueado pelo narrador (apenas o mestre pode alterar)"
        aria-disabled="true"
      >
        <LockKeyhole size={11} aria-hidden="true" />
        {value}
      </span>
    );
  }

  if (!editing) {
    return (
      <span
        role="button"
        tabIndex={0}
        aria-disabled="false"
        aria-label={`Editar ${label}: ${value}`}
        className={`cursor-pointer rounded transition-colors hover:text-primary focus-visible:ring-2 focus-visible:ring-primary focus-visible:outline-none ${className}`}
        onClick={() => {
          setDraft(String(value));
          setEditing(true);
        }}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            setDraft(String(value));
            setEditing(true);
          }
        }}
      >
        {value}
      </span>
    );
  }

  return (
    <input
      autoFocus
      type="number"
      min={min}
      max={max}
      step="1"
      aria-label={label}
      aria-invalid={invalid}
      className="w-14 max-w-full rounded-md border border-primary/70 bg-black/95 px-1 py-0.5 text-center font-cinzel font-black text-amber-200 text-lg sm:text-xl outline-none focus:ring-2 focus:ring-primary font-tabular shadow-inner mx-auto block"
      value={draft}
      onBlur={commit}
      onChange={(event) => setDraft(event.target.value)}
      onKeyDown={(event) => event.key === "Enter" && commit()}
    />
  );
}

export function SectionHeader({ title, icon, subtitle }) {
  return (
    <div className="mb-4 sm:mb-5 border-b border-primary/30 pb-3">
      <div className="flex items-center gap-3">
        {icon ? (
          <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-primary/60 bg-gradient-to-b from-primary/25 to-primary/5 text-primary shadow-[0_0_20px_color-mix(in_srgb,var(--primary)_35%,transparent)] transition-transform hover:scale-110">
            {icon}
          </span>
        ) : null}
        <div className="min-w-0 flex-1">
          <h3 className="font-cinzel text-xs sm:text-sm font-bold uppercase tracking-[0.24em] text-foreground flex items-center gap-2">
            <span>{title}</span>
            <span className="text-[10px] text-primary/60 hidden sm:inline">✦</span>
          </h3>
          {subtitle && (
            <p className="font-journal text-xs italic text-muted-foreground/90 mt-0.5">{subtitle}</p>
          )}
        </div>
        <div className="hidden h-px w-20 bg-gradient-to-r from-primary/60 via-primary/20 to-transparent sm:block" />
        <span className="h-2 w-2 rotate-45 border border-primary/80 bg-primary/40 shadow-[0_0_8px_var(--primary)]" />
      </div>
    </div>
  );
}

export function Card({ children, className = "", variant = "grimoire" }) {
  const cardClass = variant === "war-room" ? "war-room-card" : "grimoire-card";
  return (
    <div
      className={`${cardClass} bracket-corners interactive-lift relative overflow-hidden rounded-2xl p-5 sm:p-6 shadow-[0_20px_50px_rgba(0,0,0,0.5)] transition-all ${className}`}
    >
      {children}
    </div>
  );
}

export function StatBox({ label, value, onChange }) {
  const { promptRoll } = useDice();
  const numValue = Math.max(1, Math.min(30, Number(value) || 10));
  const mod = calculateModifier(numValue);
  const formattedMod = formatModifier(mod);
  const isPositive = mod > 0;
  const isNegative = mod < 0;

  const handleDecrement = (e) => {
    e.stopPropagation();
    onChange(Math.max(1, numValue - 1));
  };

  const handleIncrement = (e) => {
    e.stopPropagation();
    onChange(Math.min(30, numValue + 1));
  };

  return (
    <div className="medallion-plate group relative flex min-w-[76px] sm:min-w-[84px] flex-col items-center rounded-xl p-2 sm:p-2.5 shadow-md transition-all">
      {/* 1. Rótulo do Atributo */}
      <span className="font-cinzel text-[10px] sm:text-[11px] font-bold uppercase tracking-[0.24em] text-primary/95 drop-shadow-[0_1px_2px_rgba(0,0,0,0.8)]">
        {label}
      </span>

      {/* 2. VALOR DO ATRIBUTO EM DESTAQUE PRINCIPAL (Ordem Invertida) */}
      <div className="my-1 flex items-center justify-between w-full px-0.5">
        <button
          type="button"
          onClick={handleDecrement}
          aria-label={`Diminuir ${label}`}
          title={`Diminuir ${label} (-1)`}
          className="flex h-6 w-5 shrink-0 items-center justify-center rounded border border-primary/25 bg-gradient-to-b from-primary/15 to-primary/5 text-xs font-black text-muted-foreground hover:bg-primary/25 hover:text-primary hover:border-primary/50 active:scale-90 transition-all cursor-pointer"
        >
          −
        </button>

        <div className="flex-1 text-center px-0.5">
          <EditableNumber
            value={numValue}
            onChange={onChange}
            className="font-cinzel text-2xl sm:text-3xl font-black gold-gradient-text tracking-tight font-tabular cursor-pointer hover:scale-110 transition-transform block"
            min={1}
            max={30}
            label={`Pontos de ${label}`}
          />
        </div>

        <button
          type="button"
          onClick={handleIncrement}
          aria-label={`Aumentar ${label}`}
          title={`Aumentar ${label} (+1)`}
          className="flex h-6 w-5 shrink-0 items-center justify-center rounded border border-primary/25 bg-gradient-to-b from-primary/15 to-primary/5 text-xs font-black text-muted-foreground hover:bg-primary/25 hover:text-primary hover:border-primary/50 active:scale-90 transition-all cursor-pointer"
        >
          +
        </button>
      </div>

      {/* 3. BÔNUS / MODIFICADOR VISÍVEL (Selo de Rolagem do d20) */}
      <button
        type="button"
        onClick={() => promptRoll(`Teste de ${label}`, mod)}
        className={`w-full mt-0.5 flex items-center justify-center gap-1 rounded-lg border py-1 px-1.5 transition-all group/btn active:scale-95 shadow-sm cursor-pointer ${
          isPositive
            ? "border-emerald-500/40 bg-gradient-to-b from-emerald-950/60 to-emerald-900/30 text-emerald-300 hover:border-emerald-400 hover:shadow-[0_0_12px_rgba(16,185,129,0.4)]"
            : isNegative
              ? "border-rose-500/40 bg-gradient-to-b from-rose-950/60 to-rose-900/30 text-rose-300 hover:border-rose-400 hover:shadow-[0_0_12px_rgba(244,63,94,0.4)]"
              : "border-primary/30 bg-gradient-to-b from-primary/15 to-primary/5 text-foreground hover:border-primary/60 hover:shadow-[0_0_10px_color-mix(in_srgb,var(--primary)_30%,transparent)]"
        }`}
        title={`Rolar d20 com Bônus de ${label} (${formattedMod})`}
        aria-label={`Rolar teste de ${label} com bônus ${formattedMod}`}
      >
        <Dices size={12} className="shrink-0 text-primary opacity-80 group-hover/btn:rotate-45 transition-transform" />
        <span className="font-mono text-xs sm:text-sm font-black tracking-tight font-tabular">
          {formattedMod}
        </span>
      </button>
    </div>
  );
}
