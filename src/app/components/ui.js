"use client";

import { useState } from "react";

export function modifier(score) {
  const mod = Math.floor((score - 10) / 2);
  return mod >= 0 ? `+${mod}` : `${mod}`;
}

export function uid() {
  return Math.random().toString(36).slice(2);
}

export function HPBar({ hp, max }) {
  const pct = Math.max(0, Math.min(100, (hp / max) * 100));
  const color = pct > 60 ? "#4f8f6b" : pct > 30 ? "#d69a3d" : "#b24a3d";

  return (
    <div className="h-3 w-full overflow-hidden rounded-full border border-white/10 bg-white/5 shadow-inner">
      <div
        className="h-full rounded-full shadow-[0_0_18px_rgba(214,154,61,0.25)] transition-all duration-300"
        style={{ width: `${pct}%`, backgroundColor: color }}
      />
    </div>
  );
}

export function EditableText({ value, onChange, className = "", multiline = false, placeholder = "—" }) {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(value);

  const commit = () => {
    onChange(draft);
    setEditing(false);
  };

  if (!editing) {
    return (
      <span
        className={`cursor-pointer transition-colors duration-150 hover:text-[#f0bf67] ${className}`}
        onClick={() => {
          setDraft(value);
          setEditing(true);
        }}
      >
        {value || <span className="italic text-[#8a7355]">{placeholder}</span>}
      </span>
    );
  }

  if (multiline) {
    return (
      <textarea
        autoFocus
        className={`w-full resize-none rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-[#f1e7d2] shadow-sm outline-none transition focus:border-[#d69a3d] focus:ring-2 focus:ring-[#d69a3d]/20 ${className}`}
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
      className={`w-full rounded-lg border border-white/10 bg-white/5 px-2 py-1 text-[#f1e7d2] shadow-sm outline-none transition focus:border-[#d69a3d] focus:ring-2 focus:ring-[#d69a3d]/20 ${className}`}
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
        className={`cursor-pointer transition-colors hover:text-[#c9862a] ${className}`}
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
      className={`w-16 rounded border border-[#c9862a] bg-[#241c13] px-1 text-center text-[#e8d5b0] ${className}`}
      value={draft}
      onBlur={commit}
      onChange={(event) => setDraft(event.target.value)}
      onKeyDown={(event) => event.key === "Enter" && commit()}
    />
  );
}

export function SectionHeader({ title, icon }) {
  return (
    <div className="mb-4 flex items-center gap-3">
      {icon ? <span className="text-[#d69a3d]">{icon}</span> : null}
      <h3 className="text-[11px] font-semibold uppercase tracking-[0.24em] text-[#f0bf67]">{title}</h3>
      <div className="h-px flex-1 bg-gradient-to-r from-[#d69a3d]/40 via-[#d69a3d]/10 to-transparent" />
    </div>
  );
}

export function Card({ children, className = "" }) {
  return (
    <div className={`rounded-2xl border border-white/10 bg-white/[0.04] p-5 shadow-[0_18px_60px_rgba(0,0,0,0.28)] backdrop-blur-sm ${className}`}>
      {children}
    </div>
  );
}

export function StatBox({ label, value, onChange }) {
  return (
    <div className="flex min-w-[64px] flex-col items-center gap-1 rounded-xl border border-white/10 bg-white/[0.03] p-3 shadow-sm">
      <span className="text-[10px] uppercase tracking-[0.22em] text-[#a98b68]">{label}</span>
      <EditableNumber
        value={value}
        onChange={onChange}
        className="text-center text-xl font-semibold text-[#f5e9d7]"
        min={1}
        max={30}
      />
      <span className="font-mono text-xs text-[#d69a3d]">{modifier(value)}</span>
    </div>
  );
}
