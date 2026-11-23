"use client";

import { useState, useEffect, useMemo } from "react";
import { X, BookOpen, Crown, Plus, Trash2, Save, ChevronDown, ChevronUp } from "lucide-react";
import { CLASS_ABILITY_ATTRS } from "../../../lib/classes";

const HIT_DICE = ["1d4", "1d6", "1d8", "1d10", "1d12", "1d20"];
const TIPOS = [
  { id: "magia", nome: "Sinal / Magia" },
  { id: "ativa", nome: "Ação Ativa" },
  { id: "passiva", nome: "Passiva" },
  { id: "reacao", nome: "Reação" },
];

const emptyAbility = (nivel = 1) => ({
  key: `new-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
  nivel,
  nome: "",
  tipo: "ativa",
  custo: "",
  atributo: "ESP",
  formula: "",
  danoTipo: "",
  alcance: "",
  descricao: "",
});

const emptyForm = {
  nome: "",
  dadoDeVida: "1d8",
  atributoPrimario: "FOR",
  atributoSecundario: "CON",
  descricao: "",
  ordem: 0,
  abilities: [],
};

function fromApi(classe) {
  if (!classe) return emptyForm;
  return {
    nome: classe.name ?? "",
    dadoDeVida: String(classe.hitDie ?? "1d8").toLowerCase(),
    atributoPrimario: classe.primaryAttribute ?? "FOR",
    atributoSecundario: classe.secondaryAttribute ?? "CON",
    descricao: classe.description ?? "",
    ordem: Number(classe.ordem) || 0,
    abilities: (Array.isArray(classe.abilities) ? classe.abilities : []).map((ability, index) => ({
      key: ability.id ?? `ab-${index}`,
      nivel: Number(ability.reqLevel ?? ability.nivel) || 1,
      nome: ability.name ?? "",
      tipo: ability.type ?? "ativa",
      custo: ability.cost ?? "",
      atributo: ability.attr ?? "ESP",
      formula: ability.rollFormula ?? ability.formula ?? "",
      danoTipo: ability.damageType ?? ability.danoTipo ?? "",
      alcance: ability.range ?? ability.alcance ?? "",
      descricao: ability.description ?? "",
    })),
  };
}

export default function ClassFormModal({ isOpen, classe = null, onClose, onSave }) {
  const [form, setForm] = useState(emptyForm);
  const [error, setError] = useState("");
  const [expanded, setExpanded] = useState({}); // índice da habilidade com detalhes abertos
  const isEdit = Boolean(classe?.id);

  useEffect(() => {
    if (!isOpen) return;
    setForm(fromApi(classe));
    setError("");
    setExpanded({});
  }, [isOpen, classe]);

  const sortedAbilities = useMemo(
    () => [...form.abilities].sort((a, b) => a.nivel - b.nivel || a.nome.localeCompare(b.nome)),
    [form.abilities]
  );

  if (!isOpen) return null;

  const set = (patch) => setForm((current) => ({ ...current, ...patch }));

  const setAbility = (key, patch) =>
    setForm((current) => ({
      ...current,
      abilities: current.abilities.map((ability) => (ability.key === key ? { ...ability, ...patch } : ability)),
    }));

  const removeAbility = (key) =>
    setForm((current) => ({ ...current, abilities: current.abilities.filter((ability) => ability.key !== key) }));

  const addAbility = () => {
    const highest = form.abilities.reduce((max, ability) => Math.max(max, Number(ability.nivel) || 1), 0);
    const newAbility = emptyAbility(Math.min(20, Math.max(1, highest + 1)));
    setForm((current) => ({ ...current, abilities: [...current.abilities, newAbility] }));
    setExpanded((current) => ({ ...current, [newAbility.key]: true }));
  };

  const handleSave = () => {
    if (!form.nome.trim()) {
      setError("Informe o nome da classe.");
      return;
    }
    const abilities = sortedAbilities
      .map((ability) => ({
        nivel: Math.max(1, Math.min(20, Number(ability.nivel) || 1)),
        nome: String(ability.nome || "").trim(),
        tipo: ability.tipo || "ativa",
        custo: String(ability.custo || "").trim(),
        atributo: ability.atributo || "ESP",
        formula: String(ability.formula || "").trim(),
        danoTipo: String(ability.danoTipo || "").trim(),
        alcance: String(ability.alcance || "").trim(),
        descricao: String(ability.descricao || "").trim(),
      }))
      .filter((ability) => ability.nome);
    onSave({
      nome: form.nome.trim(),
      dadoDeVida: form.dadoDeVida,
      atributoPrimario: form.atributoPrimario || null,
      atributoSecundario: form.atributoSecundario || null,
      descricao: form.descricao.trim(),
      ordem: Number(form.ordem) || 0,
      abilities,
    });
  };

  const inputClass =
    "h-9 w-full rounded-lg border border-zinc-800 bg-zinc-950 px-2.5 text-xs text-zinc-100 outline-none focus:border-codex-500/60 placeholder:text-zinc-600";

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 p-4 backdrop-blur-md animate-in fade-in duration-200">
      <div
        data-lenis-prevent
        role="dialog"
        aria-modal="true"
        aria-label={isEdit ? "Editar classe" : "Nova classe"}
        className="custom-scroll flex max-h-[92vh] w-full max-w-2xl flex-col overflow-y-auto rounded-2xl border border-codex-500/40 bg-zinc-950 p-5 shadow-2xl"
      >
        <div className="flex items-center justify-between border-b border-zinc-800 pb-3">
          <div className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl border border-codex-500/40 bg-codex-500/15 text-codex-300">
              <BookOpen size={18} />
            </div>
            <div>
              <h2 className="flex items-center gap-2 font-serif text-base font-bold text-zinc-100">
                {isEdit ? "Editar Classe" : "Nova Classe"}
                {isEdit && (
                  <span className="flex items-center gap-1 rounded-full border border-codex-500/40 bg-codex-500/15 px-2 py-0.2 text-[9px] font-bold uppercase text-codex-300">
                    <Crown size={10} /> Mestre
                  </span>
                )}
              </h2>
              <p className="text-[11px] text-zinc-500">Catálogo global — qualquer mestre pode editar; a progressão vale para todos os heróis da classe.</p>
            </div>
          </div>
          <button type="button" onClick={onClose} aria-label="Fechar" className="rounded-lg p-1.5 text-zinc-500 transition hover:bg-zinc-800 hover:text-zinc-200">
            <X size={18} />
          </button>
        </div>

        <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2">
          <label className="sm:col-span-2 flex flex-col gap-1 text-[10px] font-bold uppercase tracking-wider text-zinc-500">
            Nome da Classe *
            <input value={form.nome} onChange={(e) => set({ nome: e.target.value })} placeholder="Ex.: Cavaleiro do Eclipse" className={inputClass} autoFocus />
          </label>
          <label className="flex flex-col gap-1 text-[10px] font-bold uppercase tracking-wider text-zinc-500">
            Dado de Vida
            <select value={form.dadoDeVida} onChange={(e) => set({ dadoDeVida: e.target.value })} className={inputClass}>
              {HIT_DICE.map((die) => (
                <option key={die} value={die}>{die}</option>
              ))}
            </select>
          </label>
          <label className="flex flex-col gap-1 text-[10px] font-bold uppercase tracking-wider text-zinc-500">
            Ordem no catálogo
            <input type="number" min={0} max={10000} value={form.ordem} onChange={(e) => set({ ordem: e.target.value })} className={inputClass} />
          </label>
          <label className="flex flex-col gap-1 text-[10px] font-bold uppercase tracking-wider text-zinc-500">
            Atributo Primário
            <select value={form.atributoPrimario} onChange={(e) => set({ atributoPrimario: e.target.value })} className={inputClass}>
              {CLASS_ABILITY_ATTRS.map((attr) => (
                <option key={attr} value={attr}>{attr}</option>
              ))}
            </select>
          </label>
          <label className="flex flex-col gap-1 text-[10px] font-bold uppercase tracking-wider text-zinc-500">
            Atributo Secundário
            <select value={form.atributoSecundario} onChange={(e) => set({ atributoSecundario: e.target.value })} className={inputClass}>
              {CLASS_ABILITY_ATTRS.map((attr) => (
                <option key={attr} value={attr}>{attr}</option>
              ))}
            </select>
          </label>
          <label className="sm:col-span-2 flex flex-col gap-1 text-[10px] font-bold uppercase tracking-wider text-zinc-500">
            Descrição / flavor
            <textarea value={form.descricao} onChange={(e) => set({ descricao: e.target.value })} rows={2} placeholder="O que esta classe representa na mesa?" className="w-full resize-none rounded-lg border border-zinc-800 bg-zinc-950 p-2.5 text-xs leading-snug text-zinc-100 outline-none focus:border-codex-500/60 placeholder:text-zinc-600" />
          </label>
        </div>

        {/* Editor de Habilidades de Nível */}
        <div className="mt-4">
          <div className="flex items-center justify-between border-t border-zinc-800 pt-3">
            <div>
              <h3 className="text-xs font-bold uppercase tracking-wider text-codex-400">Habilidades de Nível (fixas da classe)</h3>
              <p className="text-[10px] text-zinc-500">Desbloqueiam ao herói subir de nível — não passam pela aprovação.</p>
            </div>
            <button type="button" onClick={addAbility} className="flex items-center gap-1.5 rounded-lg border border-codex-500/50 bg-codex-500/15 px-3 py-1.5 text-[11px] font-bold uppercase tracking-wider text-codex-300 transition hover:bg-codex-500/25 active:scale-95">
              <Plus size={13} /> Adicionar
            </button>
          </div>

          {sortedAbilities.length === 0 ? (
            <p className="mt-2 rounded-xl border border-dashed border-zinc-800 bg-zinc-950/60 p-3 text-center text-[11px] text-zinc-500">
              Nenhuma habilidade de nível cadastrada. A classe nasce silenciosa — o mestre escreve a progressão.
            </p>
          ) : (
            <ul className="mt-2 space-y-2">
              {sortedAbilities.map((ability) => {
                const isOpen = Boolean(expanded[ability.key]);
                return (
                  <li key={ability.key} className="rounded-xl border border-zinc-800 bg-zinc-950/80 p-2.5">
                    <div className="flex flex-wrap items-center gap-2">
                      <input
                        type="number"
                        min={1}
                        max={20}
                        value={ability.nivel}
                        onChange={(e) => setAbility(ability.key, { nivel: e.target.value })}
                        aria-label="Nível"
                        className="h-9 w-16 rounded-lg border border-zinc-800 bg-zinc-950 text-center font-mono text-sm font-bold text-codex-300 outline-none focus:border-codex-500/60"
                      />
                      <input
                        value={ability.nome}
                        onChange={(e) => setAbility(ability.key, { nome: e.target.value })}
                        placeholder="Nome da habilidade"
                        className={`${inputClass} min-w-0 flex-1`}
                      />
                      <select value={ability.tipo} onChange={(e) => setAbility(ability.key, { tipo: e.target.value })} className="h-9 rounded-lg border border-zinc-800 bg-zinc-950 px-2 text-[11px] text-zinc-200 outline-none focus:border-codex-500/60">
                        {TIPOS.map((tipo) => (
                          <option key={tipo.id} value={tipo.id}>{tipo.nome}</option>
                        ))}
                      </select>
                      <button type="button" onClick={() => setExpanded((current) => ({ ...current, [ability.key]: !isOpen }))} aria-label={isOpen ? "Ocultar detalhes" : "Mostrar detalhes"} className="rounded-lg p-2 text-zinc-500 hover:bg-zinc-800 hover:text-zinc-200">
                        {isOpen ? <ChevronUp size={15} /> : <ChevronDown size={15} />}
                      </button>
                      <button type="button" onClick={() => removeAbility(ability.key)} aria-label="Remover habilidade" className="rounded-lg p-2 text-zinc-600 transition hover:bg-rose-950/60 hover:text-rose-300">
                        <Trash2 size={15} />
                      </button>
                    </div>
                    {isOpen && (
                      <div className="mt-2 grid grid-cols-2 gap-2 sm:grid-cols-4">
                        <input value={ability.custo} onChange={(e) => setAbility(ability.key, { custo: e.target.value })} placeholder="Custo (ex.: 2 PE)" className={inputClass} />
                        <select value={ability.atributo} onChange={(e) => setAbility(ability.key, { atributo: e.target.value })} className={inputClass}>
                          {CLASS_ABILITY_ATTRS.map((attr) => (
                            <option key={attr} value={attr}>{attr}</option>
                          ))}
                        </select>
                        <input value={ability.formula} onChange={(e) => setAbility(ability.key, { formula: e.target.value })} placeholder="Fórmula (ex.: 1d8+2)" className={inputClass} />
                        <input value={ability.danoTipo} onChange={(e) => setAbility(ability.key, { danoTipo: e.target.value })} placeholder="Tipo de dano" className={inputClass} />
                        <input value={ability.alcance} onChange={(e) => setAbility(ability.key, { alcance: e.target.value })} placeholder="Alcance" className={`${inputClass} col-span-2 sm:col-span-1`} />
                        <textarea value={ability.descricao} onChange={(e) => setAbility(ability.key, { descricao: e.target.value })} rows={2} placeholder="Descrição / efeito" className="col-span-2 resize-none rounded-lg border border-zinc-800 bg-zinc-950 p-2.5 text-[11px] text-zinc-100 outline-none focus:border-codex-500/60 placeholder:text-zinc-600 sm:col-span-3" />
                      </div>
                    )}
                  </li>
                );
              })}
            </ul>
          )}
        </div>

        {error && <p className="mt-2 text-xs font-semibold text-rose-400">{error}</p>}

        <div className="mt-4 flex items-center justify-end gap-2 border-t border-zinc-800 pt-3">
          <button type="button" onClick={onClose} className="rounded-lg border border-zinc-800 px-4 py-2 text-xs font-bold uppercase tracking-wider text-zinc-400 transition hover:bg-zinc-900">
            Cancelar
          </button>
          <button type="button" onClick={handleSave} className="flex min-h-11 items-center gap-2 rounded-lg border border-codex-500/60 bg-codex-500/20 px-5 text-xs font-bold uppercase tracking-wider text-codex-300 transition hover:bg-codex-500/30 active:scale-95">
            <Save size={14} /> Salvar Classe
          </button>
        </div>
      </div>
    </div>
  );
}
