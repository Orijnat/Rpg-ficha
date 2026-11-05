"use client";

import { useState, useEffect } from "react";
import { X, Sparkles, Flame, Shield, Zap, Sword, Save } from "lucide-react";
import { TIPOS_HABILIDADE } from "../../../lib/abilities";

export function AbilityFormModal({
  isOpen,
  ability,
  onClose,
  onSave,
}) {
  const [formData, setFormData] = useState({
    name: "",
    type: "ativa",
    reqLevel: 1,
    cost: "2 PE",
    attr: "FOR",
    rollFormula: "",
    damageType: "",
    range: "Corpo a corpo",
    description: "",
    trainingHours: 0,
    isTraining: false,
  });

  useEffect(() => {
    if (ability) {
      setFormData({
        name: ability.name || "",
        type: ability.type || "ativa",
        reqLevel: Number(ability.reqLevel) || 1,
        cost: ability.cost || "2 PE",
        attr: ability.attr || "FOR",
        rollFormula: ability.rollFormula || "",
        damageType: ability.damageType || "",
        range: ability.range || "Corpo a corpo",
        description: ability.description || "",
        trainingHours: Number(ability.trainingHours) || 0,
        isTraining: Boolean(ability.isTraining),
      });
    } else {
      setFormData({
        name: "",
        type: "ativa",
        reqLevel: 1,
        cost: "2 PE",
        attr: "FOR",
        rollFormula: "",
        damageType: "",
        range: "Corpo a corpo",
        description: "",
        trainingHours: 0,
        isTraining: false,
      });
    }
  }, [ability, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.name.trim()) return;

    onSave({
      ...(ability ? { id: ability.id } : {}),
      ...formData,
      reqLevel: Math.max(1, parseInt(formData.reqLevel, 10) || 1),
      trainingHours: Math.max(0, parseInt(formData.trainingHours, 10) || 0),
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div
        className="w-full max-w-lg overflow-hidden rounded-2xl border border-amber-500/30 bg-zinc-950 p-6 shadow-2xl space-y-4"
        style={{ fontFamily: "inherit" }}
      >
        {/* Cabeçalho do Modal */}
        <div className="flex items-center justify-between border-b border-zinc-800 pb-3">
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg border border-amber-500/30 bg-amber-500/10 text-amber-400">
              <Sparkles size={16} />
            </div>
            <div>
              <h2 className="font-serif text-lg font-bold text-zinc-100">
                {ability ? "Editar Habilidade" : "Nova Habilidade"}
              </h2>
              <p className="text-xs text-zinc-400">
                Forje ou aprimore as técnicas e feitiços do seu herói
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-1 text-zinc-400 hover:bg-zinc-800 hover:text-zinc-200 transition"
          >
            <X size={18} />
          </button>
        </div>

        {/* Formulário */}
        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          {/* Nome e Nível */}
          <div className="grid grid-cols-3 gap-3">
            <div className="col-span-2 space-y-1">
              <label className="font-semibold uppercase tracking-wider text-zinc-300">
                Nome da Habilidade *
              </label>
              <input
                type="text"
                required
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="Ex: Golpe Flamejante"
                className="w-full rounded-xl border border-zinc-800 bg-zinc-900/80 px-3 py-2 text-zinc-100 placeholder:text-zinc-600 focus:border-amber-500 focus:outline-none"
              />
            </div>
            <div className="space-y-1">
              <label className="font-semibold uppercase tracking-wider text-zinc-300">
                Nível Mínimo
              </label>
              <input
                type="number"
                min={1}
                max={20}
                value={formData.reqLevel}
                onChange={(e) => setFormData({ ...formData, reqLevel: e.target.value })}
                className="w-full rounded-xl border border-zinc-800 bg-zinc-900/80 px-3 py-2 font-mono text-zinc-100 focus:border-amber-500 focus:outline-none"
              />
            </div>
          </div>

          {/* Tipo e Atributo Chave */}
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="font-semibold uppercase tracking-wider text-zinc-300">
                Tipo de Habilidade
              </label>
              <select
                value={formData.type}
                onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                className="w-full rounded-xl border border-zinc-800 bg-zinc-900/80 px-3 py-2 text-zinc-100 focus:border-amber-500 focus:outline-none"
              >
                <option value="ativa">Ação Ativa</option>
                <option value="magia">Sinal / Magia</option>
                <option value="passiva">Passiva</option>
                <option value="reacao">Reação</option>
              </select>
            </div>
            <div className="space-y-1">
              <label className="font-semibold uppercase tracking-wider text-zinc-300">
                Atributo Vinculado
              </label>
              <select
                value={formData.attr}
                onChange={(e) => setFormData({ ...formData, attr: e.target.value })}
                className="w-full rounded-xl border border-zinc-800 bg-zinc-900/80 px-3 py-2 text-zinc-100 focus:border-amber-500 focus:outline-none"
              >
                <option value="FOR">FOR (Força)</option>
                <option value="DES">DES (Destreza)</option>
                <option value="CON">CON (Constituição)</option>
                <option value="SAB">SAB (Sabedoria)</option>
                <option value="ESP">ESP (Espírito)</option>
                <option value="CAR">CAR (Carisma)</option>
                <option value="INT">INT (Inteligência)</option>
              </select>
            </div>
          </div>

          {/* Custo de PE / Ação e Fórmula de Dados */}
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="font-semibold uppercase tracking-wider text-zinc-300">
                Custo de Ativação
              </label>
              <input
                type="text"
                value={formData.cost}
                onChange={(e) => setFormData({ ...formData, cost: e.target.value })}
                placeholder="Ex: 2 PE, 1 Ação, Passiva"
                className="w-full rounded-xl border border-zinc-800 bg-zinc-900/80 px-3 py-2 text-zinc-100 placeholder:text-zinc-600 focus:border-amber-500 focus:outline-none"
              />
            </div>
            <div className="space-y-1">
              <label className="font-semibold uppercase tracking-wider text-zinc-300">
                Fórmula de Rolagem (Opcional)
              </label>
              <input
                type="text"
                value={formData.rollFormula}
                onChange={(e) => setFormData({ ...formData, rollFormula: e.target.value })}
                placeholder="Ex: 2d6+3 ou 1d10"
                className="w-full rounded-xl border border-zinc-800 bg-zinc-900/80 px-3 py-2 font-mono text-zinc-100 placeholder:text-zinc-600 focus:border-amber-500 focus:outline-none"
              />
            </div>
          </div>

          {/* Tipo de Dano/Efeito e Alcance */}
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="font-semibold uppercase tracking-wider text-zinc-300">
                Elemento / Tipo de Efeito
              </label>
              <input
                type="text"
                value={formData.damageType}
                onChange={(e) => setFormData({ ...formData, damageType: e.target.value })}
                placeholder="Ex: Fogo, Cortante, Defesa Arcana"
                className="w-full rounded-xl border border-zinc-800 bg-zinc-900/80 px-3 py-2 text-zinc-100 placeholder:text-zinc-600 focus:border-amber-500 focus:outline-none"
              />
            </div>
            <div className="space-y-1">
              <label className="font-semibold uppercase tracking-wider text-zinc-300">
                Alcance / Área
              </label>
              <input
                type="text"
                value={formData.range}
                onChange={(e) => setFormData({ ...formData, range: e.target.value })}
                placeholder="Ex: Corpo a corpo, 10 metros, Cone"
                className="w-full rounded-xl border border-zinc-800 bg-zinc-900/80 px-3 py-2 text-zinc-100 placeholder:text-zinc-600 focus:border-amber-500 focus:outline-none"
              />
            </div>
          </div>

          {/* Descrição Detalhada */}
          <div className="space-y-1">
            <label className="font-semibold uppercase tracking-wider text-zinc-300">
              Descrição do Efeito
            </label>
            <textarea
              rows={3}
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Descreva detalhadamente o efeito narrativo, condições aplicadas e mecânicas da habilidade..."
              className="w-full rounded-xl border border-zinc-800 bg-zinc-900/80 px-3 py-2 text-zinc-100 placeholder:text-zinc-600 focus:border-amber-500 focus:outline-none"
            />
          </div>

          {/* Horas de Treinamento Inicial */}
          <div className="space-y-1">
            <label className="font-semibold uppercase tracking-wider text-zinc-300">
              Horas de Treino Investidas (0 a 100)
            </label>
            <input
              type="number"
              min={0}
              max={100}
              value={formData.trainingHours}
              onChange={(e) => setFormData({ ...formData, trainingHours: e.target.value })}
              className="w-full rounded-xl border border-zinc-800 bg-zinc-900/80 px-3 py-2 font-mono text-zinc-100 focus:border-amber-500 focus:outline-none"
            />
          </div>

          {/* Botões do Rodapé */}
          <div className="flex items-center justify-end gap-2 border-t border-zinc-800 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="rounded-xl border border-zinc-800 px-4 py-2 font-semibold text-zinc-400 hover:bg-zinc-800 hover:text-zinc-200 transition"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="flex items-center gap-2 rounded-xl border border-amber-500/50 bg-amber-500/20 px-5 py-2 font-semibold text-amber-300 hover:bg-amber-500/30 active:scale-95 transition"
            >
              <Save size={14} />
              <span>{ability ? "Salvar Alterações" : "Forjar Habilidade"}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
