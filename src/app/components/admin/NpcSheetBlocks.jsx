"use client";

import { useState } from "react";
import {
  CheckCircle2,
  Pencil,
  Plus,
  Shield,
  Sparkles,
  Trash2,
} from "lucide-react";
import { Card, SectionHeader } from "../ui";
import { AbilityFormModal } from "../habilidades/AbilityFormModal";
import { TIPOS_HABILIDADE, calcularProgressoTreino } from "../../../lib/abilities";
import { calculateModifier } from "../../../lib/modifiers";

export const NPC_ATTR_KEYS = ["FOR", "DES", "CON", "SAB", "ESP", "CAR", "INT"];
export const NPC_ATTR_LABELS = {
  FOR: "Força",
  DES: "Destreza",
  CON: "Constituição",
  SAB: "Sabedoria",
  ESP: "Espírito",
  CAR: "Carisma",
  INT: "Inteligência",
};

export const NPC_ATTR_DEFAULTS = Object.fromEntries(NPC_ATTR_KEYS.map((key) => [key, 10]));

/** Grid dos 7 atributos com modificador ao vivo (mesma convenção da ficha do herói). */
export function NpcAttributesCard({ attributes, onChange }) {
  const current = { ...NPC_ATTR_DEFAULTS, ...(attributes || {}) };
  return (
    <Card className="space-y-3">
      <SectionHeader title="Atributos do NPC" subtitle="Mesma regra da ficha do herói" icon={<Shield size={16} />} />
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 lg:grid-cols-7">
        {NPC_ATTR_KEYS.map((key) => {
          const value = Math.max(1, Math.min(30, Number(current[key]) || 10));
          const mod = calculateModifier(value);
          return (
            <label key={key} className="text-center text-[10px] font-bold uppercase tracking-wide text-muted-foreground" title={NPC_ATTR_LABELS[key]}>
              {key}
              <input
                type="number"
                min={1}
                max={30}
                value={value}
                onChange={(event) => onChange(key, Math.max(1, Math.min(30, Math.floor(Number(event.target.value) || 10))))}
                aria-label={NPC_ATTR_LABELS[key]}
                className="mt-1 min-h-12 w-full rounded-lg border border-border bg-input-background text-center font-mono text-lg font-bold text-foreground outline-none focus:border-primary"
              />
              <span className={`mt-1 block font-mono text-[10px] ${mod >= 0 ? "text-emerald-400" : "text-rose-400"}`}>
                {mod >= 0 ? "+" : ""}{mod}
              </span>
            </label>
          );
        })}
      </div>
    </Card>
  );
}

/** Habilidades do NPC no mesmo esquema do herói (tipo, custo, nível, fórmula…). */
export function NpcAbilitiesCard({ abilities, onChange }) {
  const [modal, setModal] = useState({ isOpen: false, ability: null });
  const list = Array.isArray(abilities) ? abilities : [];

  const openAdd = () => setModal({ isOpen: true, ability: null });
  const openEdit = (ability) => setModal({ isOpen: true, ability });
  const remove = (id) => onChange(list.filter((ability) => ability.id !== id));

  const handleSave = (abilityData) => {
    if (modal.ability) {
      onChange(
        list.map((ability) =>
          ability.id === modal.ability.id
            ? { ...ability, ...abilityData, id: ability.id, updatedAt: new Date().toISOString() }
            : ability
        )
      );
    } else {
      const ability = {
        id: typeof crypto !== "undefined" && crypto.randomUUID ? crypto.randomUUID() : `npc-ab-${Date.now()}`,
        category: "criada",
        masteryLevel: "aprendiz",
        isTraining: false,
        approvalStatus: "aprovada",
        submittedBy: "mestre",
        requestedAt: new Date().toISOString(),
        ...abilityData,
      };
      onChange([...list, ability]);
    }
    setModal({ isOpen: false, ability: null });
  };

  return (
    <Card>
      <div className="flex items-center justify-between border-b border-border pb-3">
        <SectionHeader title="Habilidades do NPC" subtitle="Mesmo esquema da ficha do herói" icon={<Sparkles size={16} />} />
        <button
          type="button"
          onClick={openAdd}
          className="flex min-h-9 items-center gap-1.5 rounded-lg border border-primary/40 bg-primary/10 px-3 text-xs font-bold text-primary hover:bg-primary/20"
        >
          <Plus size={14} /> Adicionar Habilidade
        </button>
      </div>

      <div className="mt-4 space-y-2">
        {list.length === 0 && (
          <p className="rounded-xl border border-dashed border-border p-4 text-center text-xs italic text-muted-foreground">
            Nenhuma habilidade cadastrada. Forje técnicas, magias e habilidades passivas como em um herói.
          </p>
        )}
        {list.map((ability) => {
          const tipo = TIPOS_HABILIDADE[ability.type] || TIPOS_HABILIDADE.ativa;
          const progresso = calcularProgressoTreino(ability.trainingHours || 0);
          return (
            <div key={ability.id} className="rounded-xl border border-border bg-secondary/40 p-3">
              <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-1.5">
                    <span className={`inline-flex items-center gap-1 rounded-md border px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider ${tipo.badge}`}>
                      {tipo.nome}
                    </span>
                    <h4 className="font-serif text-sm font-bold text-foreground">{ability.name}</h4>
                    <span className="inline-flex items-center gap-1 rounded-md border border-emerald-500/40 bg-emerald-950/50 px-2 py-0.5 text-[9px] font-semibold uppercase tracking-wider text-emerald-300">
                      <CheckCircle2 size={10} /> Aprovada
                    </span>
                  </div>
                  <p className="mt-1 line-clamp-2 text-[11px] text-muted-foreground">{ability.description || "Sem descrição."}</p>
                  <div className="mt-1.5 flex flex-wrap items-center gap-2 font-mono text-[10px] text-zinc-500">
                    <span>Nível req. {ability.reqLevel ?? 1}</span>
                    <span>· {ability.cost || "—"}</span>
                    <span>· {ability.attr || "ESP"}</span>
                    {ability.rollFormula && <span>· {ability.rollFormula}</span>}
                    {ability.damageType && <span>· {ability.damageType}</span>}
                    <span>· Treino {ability.trainingHours || 0}h ({progresso.grauAtual?.nome || "Aprendiz"})</span>
                  </div>
                </div>
                <div className="flex shrink-0 items-center gap-1.5">
                  <button
                    type="button"
                    onClick={() => openEdit(ability)}
                    className="flex min-h-9 items-center gap-1.5 rounded-lg border border-primary/45 bg-primary/15 px-2.5 text-[11px] font-bold text-primary transition hover:bg-primary/25"
                    aria-label={`Editar ${ability.name}`}
                  >
                    <Pencil size={13} /> Editar
                  </button>
                  <button
                    type="button"
                    onClick={() => remove(ability.id)}
                    className="flex min-h-9 items-center justify-center rounded-lg border border-rose-500/40 p-2 text-rose-300/90 transition hover:bg-rose-950/40 hover:text-rose-200"
                    aria-label={`Remover ${ability.name}`}
                  >
                    <Trash2 size={15} />
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <AbilityFormModal
        isOpen={modal.isOpen}
        ability={modal.ability}
        initialLevel={modal.ability?.reqLevel || 1}
        assignToLevel={null}
        isMaster
        onClose={() => setModal({ isOpen: false, ability: null })}
        onSave={handleSave}
      />
    </Card>
  );
}

