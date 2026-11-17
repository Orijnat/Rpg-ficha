"use client";

import { useEffect, useMemo, useState } from "react";
import { Footprints, Heart, Plus, Skull, Sparkles, Trash2 } from "lucide-react";
import { useCharacter } from "../context/CharacterContext";
import { Card, EditableNumber, EditableText, HPBar, SectionHeader } from "../components/ui";
import { AddMountModal } from "../components/montaria/AddMountModal";
import { applyHealthChange } from "../../lib/modifiers";

function uid() {
  const cryptoObj = typeof globalThis !== "undefined" ? globalThis.crypto : undefined;
  if (cryptoObj?.getRandomValues) {
    const bytes = new Uint8Array(8);
    cryptoObj.getRandomValues(bytes);
    return Array.from(bytes, (b) => b.toString(16).padStart(2, "0")).join("");
  }
  return `${Date.now().toString(36)}${Math.random().toString(36).slice(2)}`;
}

function fromLegacy(data) {
  if (!data?.mountName) return null;
  return {
    id: "legacy-mount",
    name: data.mountName,
    species: "",
    hp: Number(data.mountHP ?? 20),
    hpMax: Number(data.mountHPMax ?? 20),
    notes: data.mountNotes ?? "",
    alive: (Number(data.mountHP ?? 20) > 0),
  };
}

export default function MontariaPage() {
  const { data, updExtra } = useCharacter();

  // Lista canônica de montarias vive em dadosExtras.mounts (pode não existir)
  const storedMounts = data?.dadosExtras?.mounts;
  const hasStored = Array.isArray(storedMounts);
  const legacy = useMemo(() => fromLegacy(data), [data]);
  const mounts = hasStored ? storedMounts : (legacy ? [legacy] : []);

  const [selectedId, setSelectedId] = useState(null);
  const [isAddOpen, setIsAddOpen] = useState(false);
  const aliveMounts = mounts.filter((m) => m.alive);

  // Seleciona a primeira montaria viva por padrão
  useEffect(() => {
    if (selectedId && mounts.some((m) => m.id === selectedId)) return;
    const first = aliveMounts[0] || mounts[0];
    setSelectedId(first?.id ?? null);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mounts.length, data?.dadosExtras?.mounts]);

  const selected = mounts.find((m) => m.id === selectedId) || null;

  const writeMounts = (next) => updExtra("mounts", next);

  const handleAddMount = (draft) => {
    const mount = {
      id: uid(),
      name: draft.name,
      species: draft.species,
      hp: draft.hp,
      hpMax: draft.hpMax,
      notes: draft.notes,
      alive: draft.hp > 0,
    };
    writeMounts([...(hasStored ? storedMounts : (legacy ? [legacy] : [])), mount]);
    setSelectedId(mount.id);
  };

  const removeMount = (id) => {
    const base = hasStored ? storedMounts : (legacy ? [legacy] : []);
    writeMounts(base.filter((m) => m.id !== id));
  };

  const patchMount = (id, patch) => {
    const base = hasStored ? storedMounts : (legacy ? [legacy] : []);
    writeMounts(base.map((m) => (m.id === id ? { ...m, ...patch } : m)));
  };

  const damage = (amount) => {
    if (!selected) return;
    const res = applyHealthChange(selected.hp, selected.hpMax || 10, -amount);
    patchMount(selected.id, { hp: res.currentHp, alive: res.currentHp > 0 });
  };

  const heal = (amount) => {
    if (!selected) return;
    const res = applyHealthChange(selected.hp, selected.hpMax || 10, amount);
    patchMount(selected.id, { hp: res.currentHp, alive: res.currentHp > 0 });
  };

  const fullHeal = () => {
    if (!selected) return;
    patchMount(selected.id, { hp: selected.hpMax || 20, alive: true });
  };

  const hpPct = selected ? Math.round((Math.max(0, selected.hp) / Math.max(1, selected.hpMax || 1)) * 100) : 0;

  return (
    <div className="space-y-4">
      <Card>
        <div className="mb-4 flex items-center justify-between border-b border-primary/20 pb-4">
          <SectionHeader
            title="Montarias"
            subtitle="Companheiros de viagem — vivos, feridos ou perdidos"
            icon={<Footprints size={15} />}
          />
          <button
            type="button"
            onClick={() => setIsAddOpen(true)}
            className="flex min-h-9 items-center gap-1.5 rounded-xl border border-primary/40 bg-primary/10 px-3 py-1.5 font-cinzel text-xs font-bold text-primary transition-all hover:bg-primary/20 hover:text-foreground active:scale-95"
          >
            <Plus size={13} />
            <span>Adicionar montaria</span>
          </button>
        </div>

        {/* Seletor de montarias */}
        {mounts.length === 0 ? (
          <div className="rounded-xl border border-dashed border-primary/20 p-8 text-center">
            <Footprints size={28} className="mx-auto text-primary/40" />
            <p className="mt-3 font-journal text-sm italic text-muted-foreground">
              Nenhuma montaria registrada nesta ficha.
            </p>
            <button
              type="button"
              onClick={() => setIsAddOpen(true)}
              className="mt-4 inline-flex min-h-11 items-center gap-2 rounded-xl border border-primary bg-primary px-5 font-cinzel text-xs font-bold uppercase tracking-wider text-primary-foreground transition hover:brightness-110 active:scale-95"
            >
              <Plus size={14} /> Adotar primeira montaria
            </button>
          </div>
        ) : (
          <>
            <div className="flex gap-2 overflow-x-auto pb-2">
              {mounts.map((mount) => {
                const active = mount.id === selectedId;
                return (
                  <button
                    key={mount.id}
                    type="button"
                    onClick={() => setSelectedId(mount.id)}
                    className={`group flex min-w-44 shrink-0 flex-col rounded-xl border p-3 text-left transition-all ${
                      active
                        ? "border-primary/60 bg-primary/15 shadow-[0_0_18px_color-mix(in_srgb,var(--primary)_25%,transparent)]"
                        : "border-border/60 bg-secondary/40 hover:border-primary/40"
                    }`}
                    aria-pressed={active}
                  >
                    <div className="flex items-center gap-2">
                      <span className={`flex h-8 w-8 items-center justify-center rounded-lg border ${mount.alive ? "border-emerald-500/40 bg-emerald-950/40 text-emerald-300" : "border-rose-500/40 bg-rose-950/40 text-rose-300"}`}>
                        {mount.alive ? <Footprints size={15} /> : <Skull size={15} />}
                      </span>
                      <div className="min-w-0">
                        <strong className="block truncate font-cinzel text-xs font-bold text-foreground">{mount.name}</strong>
                        <span className="block truncate font-journal text-[10px] italic text-muted-foreground">
                          {mount.species || "Espécie não informada"}{mount.alive ? "" : " · morta"}
                        </span>
                      </div>
                    </div>
                    <div className="mt-2">
                      <HPBar hp={Math.max(0, mount.hp)} max={Math.max(1, mount.hpMax || 1)} />
                    </div>
                  </button>
                );
              })}
            </div>

            {selected && (
              <div className="mt-4 space-y-5 border-t border-primary/15 pt-5">
                {/* Nome e espécie */}
                <div className="grid grid-cols-1 gap-3 sm:grid-cols-[2fr_1fr]">
                  <div className="rounded-xl border border-primary/25 bg-background/50 px-3.5 py-2.5">
                    <span className="block font-cinzel text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Montaria</span>
                    <EditableText
                      value={selected.name}
                      onChange={(value) => patchMount(selected.id, { name: value })}
                      className="font-cinzel text-base sm:text-lg font-bold text-foreground"
                      placeholder="Ex: Fantasma Negro, Alce Real..."
                      label="Nome da montaria"
                    />
                  </div>
                  <div className="rounded-xl border border-primary/25 bg-background/50 px-3.5 py-2.5">
                    <span className="block font-cinzel text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Espécie</span>
                    <EditableText
                      value={selected.species}
                      onChange={(value) => patchMount(selected.id, { species: value })}
                      className="font-journal text-sm text-foreground"
                      placeholder="Ex: Corcel negro"
                      label="Espécie"
                    />
                  </div>
                </div>

                {/* PV */}
                <div className="rounded-2xl border border-primary/20 bg-background/60 p-4 sm:p-5">
                  <div className="mb-3 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Heart size={16} className="text-rose-400" />
                      <span className="font-cinzel text-xs font-bold uppercase tracking-wider text-foreground">
                        Vitalidade
                      </span>
                    </div>
                    <span className="font-mono text-xs font-bold text-muted-foreground font-tabular">
                      {selected.alive ? `${hpPct}%` : "💀 morta"}
                    </span>
                  </div>

                  <HPBar hp={Math.max(0, selected.hp)} max={Math.max(1, selected.hpMax || 1)} />

                  <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
                    <div className="flex items-center gap-2 text-sm">
                      <span className="font-cinzel text-xs uppercase text-muted-foreground">Vida:</span>
                      <EditableNumber
                        value={selected.hp}
                        onChange={(value) => patchMount(selected.id, { hp: Math.max(0, Number(value) || 0), alive: Number(value) > 0 })}
                        className="font-mono text-lg font-bold text-foreground font-tabular"
                        min={0}
                        max={selected.hpMax}
                        label="PV Atual"
                      />
                      <span className="text-muted-foreground">/</span>
                      <EditableNumber
                        value={selected.hpMax}
                        onChange={(value) => patchMount(selected.id, { hpMax: Math.max(1, Number(value) || 1) })}
                        className="font-mono text-lg font-bold text-muted-foreground font-tabular"
                        min={1}
                        label="PV Máximo"
                      />
                    </div>

                    <div className="flex flex-wrap items-center gap-2">
                      {[1, 5, 10].map((v) => (
                        <button key={`dmg-${v}`} type="button" onClick={() => damage(v)} className="rounded-lg border border-rose-500/40 bg-rose-950/50 px-2 py-1.5 font-mono text-xs font-bold text-rose-300 transition hover:bg-rose-900/70 active:scale-95">
                          −{v}
                        </button>
                      ))}
                      {[1, 5, 10].map((v) => (
                        <button key={`heal-${v}`} type="button" onClick={() => heal(v)} className="rounded-lg border border-emerald-500/40 bg-emerald-950/50 px-2 py-1.5 font-mono text-xs font-bold text-emerald-300 transition hover:bg-emerald-900/70 active:scale-95">
                          +{v}
                        </button>
                      ))}
                      <button type="button" onClick={fullHeal} className="rounded-lg border border-primary/40 bg-primary/15 px-2 py-1.5 font-cinzel text-[10px] font-bold text-primary transition hover:bg-primary/25 active:scale-95" title="Restaurar PV ao máximo">
                        CHEIO
                      </button>
                    </div>
                  </div>
                </div>

                {/* Notas */}
                <div className="rounded-2xl border border-primary/20 bg-background/60 p-4">
                  <span className="block font-cinzel text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Anotações</span>
                  <EditableText
                    value={selected.notes}
                    onChange={(value) => patchMount(selected.id, { notes: value })}
                    className="mt-1 block w-full font-journal text-sm italic text-foreground/90"
                    placeholder="Sela, temperamento, cicatrizes, onde foi obtida..."
                    label="Notas da montaria"
                  />
                </div>

                {/* Ações */}
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <button
                    type="button"
                    onClick={() => patchMount(selected.id, { alive: !selected.alive, hp: selected.alive ? Math.min(selected.hp, selected.hpMax) : Math.max(1, selected.hp) })}
                    className={`flex min-h-10 items-center gap-2 rounded-xl border px-3 py-1.5 font-cinzel text-[11px] font-bold uppercase tracking-wider transition ${
                      selected.alive
                        ? "border-rose-500/40 bg-rose-950/30 text-rose-300 hover:bg-rose-900/50"
                        : "border-emerald-500/40 bg-emerald-950/30 text-emerald-300 hover:bg-emerald-900/50"
                    }`}
                  >
                    {selected.alive ? <Skull size={13} /> : <Sparkles size={13} />}
                    {selected.alive ? "Marcar como morta" : "Reviver"}
                  </button>
                  <button
                    type="button"
                    onClick={() => removeMount(selected.id)}
                    className="flex min-h-10 items-center gap-2 rounded-xl border border-border bg-secondary/60 px-3 py-1.5 font-cinzel text-[11px] font-bold uppercase tracking-wider text-muted-foreground transition hover:border-rose-500/50 hover:text-rose-300 active:scale-95"
                  >
                    <Trash2 size={13} />
                    Despedir montaria
                  </button>
                </div>

                {Number(selected.hp) <= 0 && (
                  <p className="flex items-center gap-2 rounded-xl border border-rose-500/30 bg-rose-950/20 p-3 font-journal text-xs italic text-rose-200">
                    <Skull size={13} className="shrink-0" /> A montaria caiu. Que ela seja lembrada com honra no próximo memorial da guilda.
                  </p>
                )}
              </div>
            )}
          </>
        )}
      </Card>
      <AddMountModal open={isAddOpen} onClose={() => setIsAddOpen(false)} onAdd={handleAddMount} />
    </div>
  );
}
