"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { Search, Swords, Users, X } from "lucide-react";
import { normalizeSearchText } from "../../../lib/search";

const FILTROS_TIPO = [
  { id: "todos", label: "Todos" },
  { id: "hero", label: "Heróis" },
  { id: "npc", label: "NPCs" },
];

/**
 * Modal "Alocar Participantes" (Sala de Guerra): após o encontro ser criado (ou
 * durante a sessão), o mestre seleciona os heróis e NPCs que farão parte do
 * encontro. Suporta filtros de busca por nome e por tipo (Todos / Heróis / NPCs)
 * e apenas os selecionados são alocados à iniciativa do encontro.
 */
export default function EncounterParticipantsModal({ isOpen, onClose, encounter, heroes, npcs, onAddHero, onAddNpc }) {
  const dialogRef = useRef(null);
  const [query, setQuery] = useState("");
  const [typeFilter, setTypeFilter] = useState("todos");
  const [selectedKeys, setSelectedKeys] = useState(() => new Set());

  const combatientes = useMemo(() => encounter?.dadosExtras?.iniciativa || [], [encounter]);

  const isHeroAdded = (heroId) =>
    combatientes.some((c) => c.type === "Herói" && c.id === `pc-${String(heroId)}`);
  const isNpcAdded = (npcId) =>
    combatientes.some((c) => c.type === "NPC" && String(c.id).startsWith(`npc-${String(npcId)}-`));

  const normalizedQuery = normalizeSearchText(query);

  const visibleHeroes = useMemo(() => {
    const list = Array.isArray(heroes) ? heroes : [];
    const filtered = list.filter((h) => {
      const matchesType = typeFilter === "todos" || typeFilter === "hero";
      const matchesQuery = !normalizedQuery || normalizeSearchText(h?.name).includes(normalizedQuery);
      return matchesType && matchesQuery;
    });
    return filtered.sort((a, b) => String(a?.name || "").localeCompare(String(b?.name || ""), "pt-BR"));
  }, [heroes, typeFilter, normalizedQuery]);

  const visibleNpcs = useMemo(() => {
    const list = Array.isArray(npcs) ? npcs : [];
    const filtered = list.filter((n) => {
      const matchesType = typeFilter === "todos" || typeFilter === "npc";
      const matchesQuery = !normalizedQuery ||
        normalizeSearchText(n?.nome).includes(normalizedQuery) ||
        (Array.isArray(n?.dadosExtras?.tags) && n.dadosExtras.tags.some((tag) => normalizeSearchText(tag).includes(normalizedQuery)));
      return matchesType && matchesQuery;
    });
    return filtered.sort((a, b) => String(a?.nome || "").localeCompare(String(b?.nome || ""), "pt-BR"));
  }, [npcs, typeFilter, normalizedQuery]);

  useEffect(() => {
    if (!isOpen) return undefined;
    const dialog = dialogRef.current;
    const focusable = dialog?.querySelectorAll(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
    );
    const first = focusable?.[0];
    first?.focus();

    const handleKeyDown = (event) => {
      if (event.key === "Escape") {
        event.stopPropagation();
        onClose();
        return;
      }
      if (event.key === "Tab" && focusable && focusable.length > 0) {
        const list = Array.from(focusable);
        const firstEl = list[0];
        const lastEl = list[list.length - 1];
        const active = document.activeElement;
        if (event.shiftKey && active === firstEl) {
          event.preventDefault();
          lastEl.focus();
        } else if (!event.shiftKey && active === lastEl) {
          event.preventDefault();
          firstEl.focus();
        }
      }
    };
    document.addEventListener("keydown", handleKeyDown, true);
    return () => document.removeEventListener("keydown", handleKeyDown, true);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const toggleSelection = (key, item, type) => {
    const added = type === "hero" ? isHeroAdded(item.id) : isNpcAdded(item.id);
    if (added) return;
    setSelectedKeys((prev) => {
      const next = new Set(prev);
      if (next.has(key)) next.delete(key);
      else next.add(key);
      return next;
    });
  };

  const allHeroes = Array.isArray(heroes) ? heroes : [];
  const allNpcs = Array.isArray(npcs) ? npcs : [];
  const selectedHeroes = allHeroes.filter((h) => selectedKeys.has(`hero:${h.id}`));
  const selectedNpcs = allNpcs.filter((n) => selectedKeys.has(`npc:${n.id}`));
  const selectedCount = selectedHeroes.length + selectedNpcs.length;

  const handleAddSelected = async () => {
    for (const hero of selectedHeroes) {
      await onAddHero?.(hero);
    }
    for (const npc of selectedNpcs) {
      await onAddNpc?.(npc);
    }
    setSelectedKeys(new Set());
    onClose();
  };

  const handleCancel = () => {
    onClose();
  };

  const renderParticipantRow = (key, type, item, name, hp, hpMax) => {
    const added = type === "hero" ? isHeroAdded(item.id) : isNpcAdded(item.id);
    const isSelected = selectedKeys.has(key) && !added;
    const Icon = type === "hero" ? Users : Swords;
    return (
      <li key={key}>
        <button
          type="button"
          disabled={added}
          onClick={() => toggleSelection(key, item, type)}
          aria-pressed={isSelected}
          className={`flex w-full items-center gap-3 rounded-xl border p-2.5 text-left transition active:scale-[0.99] disabled:cursor-not-allowed disabled:opacity-50 ${
            isSelected
              ? "border-primary/60 bg-primary/10"
              : "border-border bg-secondary/40 hover:border-primary/40"
          }`}
        >
          <span
            className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-md border text-[10px] font-black ${
              isSelected ? "border-primary bg-primary text-primary-foreground" : "border-border bg-background text-muted-foreground"
            }`}
          >
            {isSelected ? "✓" : ""}
          </span>
          <Icon size={14} className="shrink-0 text-primary/70" />
          <span className="min-w-0 flex-1">
            <span className="block truncate text-sm font-semibold text-foreground">{name}</span>
            <span className="block text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
              {type === "hero" ? "Herói" : "NPC"} · PV {Number(hp) || 0}/{Number(hpMax) || 0}
            </span>
          </span>
        </button>
      </li>
    );
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 p-4 backdrop-blur-sm animate-in fade-in-50"
      onClick={handleCancel}
    >
      <div
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby="alocar-participantes-title"
        className="relative flex max-h-[92vh] w-full max-w-2xl flex-col overflow-hidden rounded-2xl border border-primary/40 bg-card shadow-2xl shadow-black/70"
        onClick={(event) => event.stopPropagation()}
      >
        {/* Cabeçalho */}
        <div className="flex items-start justify-between gap-3 border-b border-border px-5 py-4">
          <div className="flex items-center gap-3">
            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-primary/50 bg-primary/15 text-primary">
              <Users size={20} />
            </span>
            <div>
              <h2 id="alocar-participantes-title" className="font-cinzel text-base font-black text-foreground">
                Alocar Participantes
              </h2>
              <p className="mt-0.5 text-[11px] text-muted-foreground">
                {encounter?.nome ? `"${encounter.nome}" — ` : ""}escolha os heróis e NPCs que farão parte do encontro.
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={handleCancel}
            aria-label="Fechar"
            className="rounded-lg p-1.5 text-muted-foreground transition hover:bg-secondary hover:text-foreground disabled:opacity-40"
          >
            <X size={18} />
          </button>
        </div>

        {/* Filtros */}
        <div className="border-b border-border px-5 py-3">
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
            <div className="relative flex-1">
              <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
              <input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Buscar por nome…"
                aria-label="Buscar participante por nome"
                className="min-h-10 w-full rounded-lg border border-border bg-input-background pl-9 pr-3 text-xs text-foreground outline-none focus:border-primary"
              />
            </div>
            <div className="flex items-center gap-1 rounded-lg border border-border bg-secondary/50 p-1" role="group" aria-label="Filtrar por tipo">
              {FILTROS_TIPO.map((f) => (
                <button
                  key={f.id}
                  type="button"
                  onClick={() => setTypeFilter(f.id)}
                  aria-pressed={typeFilter === f.id}
                  className={`flex-1 rounded-md px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider transition active:scale-95 ${
                    typeFilter === f.id
                      ? "bg-primary text-primary-foreground"
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  {f.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Lista de participantes */}
        <div data-lenis-prevent className="max-h-[46vh] flex-1 space-y-3 overflow-y-auto px-5 py-4">
          {visibleHeroes.length === 0 && visibleNpcs.length === 0 ? (
            <p className="py-8 text-center text-xs text-muted-foreground">
              Nenhum participante encontrado. Ajuste os filtros de busca ou cadastre heróis/NPCs primeiro.
            </p>
          ) : null}

          {visibleHeroes.length > 0 ? (
            <div className="space-y-1.5">
              <p className="text-[10px] font-bold uppercase tracking-[0.25em] text-muted-foreground">Heróis</p>
              <ul className="space-y-1.5">{visibleHeroes.map((h) => renderParticipantRow(`hero:${h.id}`, "hero", h, h?.name, h?.hp, h?.hpMax))}</ul>
            </div>
          ) : null}

          {visibleNpcs.length > 0 ? (
            <div className="space-y-1.5">
              <p className="text-[10px] font-bold uppercase tracking-[0.25em] text-muted-foreground">NPCs</p>
              <ul className="space-y-1.5">{visibleNpcs.map((n) => renderParticipantRow(`npc:${n.id}`, "npc", n, n?.nome, n?.hp, n?.hpMax))}</ul>
            </div>
          ) : null}
        </div>

        {/* Rodapé */}
        <div className="border-t border-border px-5 py-3.5">
          <div className="flex flex-col-reverse gap-2 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
              {selectedCount > 0
                ? `${selectedCount} participante(s) selecionado(s)`
                : `${combatientes.length} participante(s) alocado(s) no encontro`}
            </p>
            <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
              <button
                type="button"
                onClick={handleCancel}
                className="h-10 rounded-lg border border-border px-4 text-xs font-bold uppercase tracking-wider text-muted-foreground transition hover:text-foreground"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={handleAddSelected}
                disabled={selectedCount === 0}
                className="flex h-10 items-center justify-center gap-2 rounded-lg bg-primary px-4 text-xs font-bold uppercase tracking-wider text-primary-foreground transition hover:brightness-110 active:scale-95 disabled:cursor-not-allowed disabled:opacity-40"
              >
                <Swords size={15} />
                Adicionar ao Encontro
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
