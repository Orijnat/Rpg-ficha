"use client";

import { useState, useEffect } from "react";
import { Dices } from "lucide-react";
import { calculateModifier, formatModifier } from "../../lib/modifiers";
import { useDice } from "../context/DiceContext";

export function modifier(score) {
  return formatModifier(calculateModifier(score));
}


export function uid() {
  return Math.random().toString(36).slice(2);
}

export function HPBar({ hp, max }) {
  const pct = Math.max(0, Math.min(100, (hp / max) * 100));
  const color = pct > 60 ? "#4f8f6b" : pct > 30 ? "var(--primary)" : "#b24a3d";

  return (
    <div className="h-3 w-full overflow-hidden rounded-full border border-white/10 bg-white/5 shadow-inner">
      <div
        className="h-full rounded-full shadow-[0_0_18px_color-mix(in_srgb,var(--primary)_25%,transparent)] transition-all duration-300"
        style={{ width: `${pct}%`, backgroundColor: color }}
      />
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

export function EditableText({ value, onChange, className = "", multiline = false, placeholder = "—" }) {
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

  if (!editing) {
    return (
      <span
        className={`cursor-pointer transition-colors duration-150 hover:text-primary ${className}`}
        onClick={() => {
          setDraft(safeValue);
          setEditing(true);
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
      className={`w-full rounded-lg border border-white/10 bg-white/5 px-2 py-1 text-foreground shadow-sm outline-none transition focus:border-primary focus:ring-2 focus:ring-ring/20 ${className}`}
      value={draft}
      onBlur={commit}
      onChange={(event) => setDraft(event.target.value)}
      onKeyDown={(event) => event.key === "Enter" && commit()}
    />
  );
}

export function EditableNumber({ value, onChange, className = "", min, max }) {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(String(value));

  const commit = () => {
    const parsed = Number.parseInt(draft, 10);

    if (!Number.isNaN(parsed)) {
      const clamped =
        min !== undefined
          ? Math.max(min, max !== undefined ? Math.min(max, parsed) : parsed)
          : max !== undefined
            ? Math.min(max, parsed)
            : parsed;

      onChange(clamped);
    }

    setEditing(false);
  };

  if (!editing) {
    return (
      <span
        className={`cursor-pointer transition-colors hover:text-primary ${className}`}
        onClick={() => {
          setDraft(String(value));
          setEditing(true);
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
      className={`w-16 rounded border border-primary bg-muted px-1 text-center text-foreground ${className}`}
      value={draft}
      onBlur={commit}
      onChange={(event) => setDraft(event.target.value)}
      onKeyDown={(event) => event.key === "Enter" && commit()}
    />
  );
}

export function SectionHeader({ title, icon }) {
  return (
    <div className="mb-5 flex items-center gap-3 border-b-2 border-primary/30 pb-3">
      {icon ? (
        <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border-2 border-primary/50 bg-primary/15 text-primary shadow-[0_0_18px_color-mix(in_srgb,var(--primary)_18%,transparent)]">
          {icon}
        </span>
      ) : null}
      <h3 className="font-serif text-sm font-bold uppercase tracking-[0.24em] text-primary">{title}</h3>
      <div className="h-px flex-1 bg-gradient-to-r from-primary/45 via-primary/15 to-transparent" />
      <span className="h-3 w-3 rotate-45 border-2 border-primary/60 bg-background" />
    </div>
  );
}

export function Card({ children, className = "" }) {
  return (
    <div className={`ornate-frame relative overflow-hidden rounded-sm border-2 border-primary/35 bg-card/95 p-5 shadow-[0_20px_45px_rgba(0,0,0,0.42)] before:pointer-events-none before:absolute before:inset-x-5 before:top-2 before:h-0.5 before:bg-gradient-to-r before:from-transparent before:via-primary before:to-transparent ${className}`}>
      {children}
    </div>
  );
}

export function StatBox({ label, value, onChange }) {
  const { promptRoll } = useDice();
  const mod = calculateModifier(value);
  const formattedMod = formatModifier(mod);

  return (
    <div className="group relative flex min-w-[68px] flex-col items-center gap-1 rounded-xl border border-white/10 bg-background/45 p-3 shadow-sm transition-all hover:-translate-y-0.5 hover:border-primary/50 hover:bg-primary/5">
      <span className="font-serif text-[10px] font-bold uppercase tracking-[0.22em] text-muted-foreground">{label}</span>
      <EditableNumber
        value={value}
        onChange={onChange}
        className="text-center text-xl font-bold text-foreground"
        min={1}
        max={30}
      />
      <button
        onClick={() => promptRoll(`Teste de ${label}`, mod)}
        className="mt-0.5 flex items-center gap-1 rounded-md border border-white/5 bg-white/[0.02] px-2 py-0.5 font-mono text-xs font-semibold text-primary transition-all hover:border-primary/50 hover:bg-primary/15 hover:text-foreground active:scale-95"
        title={`Rolar teste de ${label} (${formattedMod})`}
      >
        <Dices size={11} className="opacity-60 group-hover:opacity-100" />
        <span>{formattedMod}</span>
      </button>
    </div>
  );
}
