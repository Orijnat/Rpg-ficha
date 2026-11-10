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

  const bgStyle =
    pct > 50
      ? "linear-gradient(90deg, #15803d 0%, #22c55e 100%)"
      : pct > 25
        ? "linear-gradient(90deg, #b45309 0%, var(--primary) 100%)"
        : "linear-gradient(90deg, #991b1b 0%, #ef4444 100%)";

  return (
    <div className="relative h-3 w-full overflow-hidden rounded-full border border-white/15 bg-black/60 shadow-inner">
      <div
        className="h-full rounded-full transition-all duration-300 ease-out"
        style={{
          width: `${pct}%`,
          background: bgStyle,
          boxShadow: pct > 25 ? "0 0 10px rgba(34, 197, 94, 0.3)" : "0 0 10px rgba(239, 68, 68, 0.4)",
        }}
      />
      <div className="pointer-events-none absolute inset-x-0 top-0 h-1 bg-gradient-to-b from-white/25 to-transparent rounded-t-full" />
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
      aria-valuemin={min}
      aria-valuemax={max}
      aria-invalid={invalid}
      className={`w-16 rounded border border-primary bg-muted px-1 text-center text-foreground outline-none focus:ring-2 focus:ring-primary ${className}`}
      value={draft}
      onBlur={commit}
      onChange={(event) => setDraft(event.target.value)}
      onKeyDown={(event) => event.key === "Enter" && commit()}
    />
  );
}

export function SectionHeader({ title, icon, subtitle }) {
  return (
    <div className="mb-4 sm:mb-5 border-b border-primary/25 pb-3">
      <div className="flex items-center gap-3">
        {icon ? (
          <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-primary/40 bg-primary/10 text-primary shadow-[0_0_15px_color-mix(in_srgb,var(--primary)_20%,transparent)]">
            {icon}
          </span>
        ) : null}
        <div className="min-w-0 flex-1">
          <h3 className="font-cinzel text-xs sm:text-sm font-bold uppercase tracking-[0.24em] text-foreground">
            {title}
          </h3>
          {subtitle && (
            <p className="font-journal text-xs italic text-muted-foreground">{subtitle}</p>
          )}
        </div>
        <div className="hidden h-px w-14 bg-gradient-to-r from-primary/35 via-primary/10 to-transparent sm:block" />
        <span className="h-2 w-2 rotate-45 border border-primary/60 bg-primary/20" />
      </div>
    </div>
  );
}

export function Card({ children, className = "", variant = "grimoire" }) {
  const cardClass = variant === "war-room" ? "war-room-card" : "grimoire-card";
  return (
    <div
      className={`${cardClass} bracket-corners interactive-lift relative overflow-hidden rounded-2xl p-5 shadow-[0_20px_45px_rgba(0,0,0,0.38)] transition-all ${className}`}
    >
      {children}
    </div>
  );
}

export function StatBox({ label, value, onChange }) {
  const { promptRoll } = useDice();
  const mod = calculateModifier(value);
  const formattedMod = formatModifier(mod);
  const isPositive = mod > 0;
  const isNegative = mod < 0;

  return (
    <div className="medallion-plate group relative flex min-w-[70px] sm:min-w-[76px] flex-col items-center rounded-xl p-2.5 sm:p-3 shadow-md">
      {/* Rótulo do Atributo */}
      <span className="font-cinzel text-[10px] sm:text-[11px] font-bold uppercase tracking-[0.2em] text-primary/90">
        {label}
      </span>

      {/* Botão de Rolagem com Modificador em Destaque */}
      <button
        type="button"
        onClick={() => promptRoll(`Teste de ${label}`, mod)}
        className="my-1.5 flex w-full flex-col items-center justify-center rounded-lg border border-primary/25 bg-primary/10 py-1 transition-all group-hover:border-primary/60 group-hover:bg-primary/20 active:scale-95 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-primary"
        title={`Rolar teste de ${label} (${formattedMod})`}
        aria-label={`Rolar teste de ${label} com modificador ${formattedMod}`}
      >
        <span
          className={`font-cinzel text-lg sm:text-xl font-black leading-none tracking-tight font-tabular ${
            isPositive
              ? "text-primary"
              : isNegative
                ? "text-rose-400"
                : "text-foreground"
          }`}
        >
          {formattedMod}
        </span>
        <span className="mt-0.5 flex items-center gap-1 text-[9px] uppercase tracking-wider text-muted-foreground group-hover:text-primary transition-colors">
          <Dices size={10} className="opacity-70 group-hover:rotate-12 transition-transform" />
          <span>rolar</span>
        </span>
      </button>

      {/* Valor Base Editável */}
      <div className="flex items-center gap-1 text-[11px] text-muted-foreground/80">
        <span className="text-[9px] uppercase tracking-wider opacity-60">Base:</span>
        <EditableNumber
          value={value}
          onChange={onChange}
          className="font-mono text-xs font-semibold text-foreground/90 hover:text-primary"
          min={1}
          max={30}
          label={`Pontos de ${label}`}
        />
      </div>
    </div>
  );
}
