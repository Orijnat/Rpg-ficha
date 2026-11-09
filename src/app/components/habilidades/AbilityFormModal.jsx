"use client";

import { useState, useEffect } from "react";
import { X, Sparkles, Flame, Shield, Zap, Sword, Save, Send, AlertCircle, Crown, CheckCircle2 } from "lucide-react";
import { TIPOS_HABILIDADE, STATUS_APROVACAO } from "../../../lib/abilities";

export function AbilityFormModal({
  isOpen,
  ability = null,
  initialLevel = 1,
  assignToLevel = null,
  isMaster = false,
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
    approvalStatus: "pendente",
    masterFeedback: "",
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
        approvalStatus: ability.approvalStatus || (isMaster ? "aprovada" : "pendente"),
        masterFeedback: ability.masterFeedback || "",
      });
    } else {
      setFormData({
        name: "",
        type: "ativa",
        reqLevel: Math.max(1, Number(initialLevel) || 1),
        cost: "2 PE",
        attr: "FOR",
        rollFormula: "",
        damageType: "",
        range: "Corpo a corpo",
        description: "",
        trainingHours: 0,
        isTraining: false,
        approvalStatus: isMaster ? "aprovada" : "pendente",
        masterFeedback: "",
      });
    }
  }, [ability, isOpen, isMaster, initialLevel]);

  if (!isOpen) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.name.trim()) return;

    onSave({
      ...(ability ? { id: ability.id } : {}),
      ...formData,
      reqLevel: Math.max(1, parseInt(formData.reqLevel, 10) || 1),
      trainingHours: Math.max(0, parseInt(formData.trainingHours, 10) || 0),
      resubmit: !isMaster, // sinaliza re-submissão para aprovação se for jogador
      ...(assignToLevel ? { assignToLevel: Number(assignToLevel) } : {}),
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-in fade-in duration-200">
      <div
        className="w-full max-w-lg max-h-[90vh] overflow-y-auto custom-scroll rounded-2xl border border-primary/40 bg-zinc-950 p-6 shadow-2xl space-y-4"
        style={{ fontFamily: "inherit" }}
      >
        {/* Cabeçalho do Modal */}
        <div className="flex items-center justify-between border-b border-zinc-800 pb-3">
          <div className="flex items-center gap-2">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl border border-primary/40 bg-primary/20 text-primary">
              <Sparkles size={18} />
            </div>
            <div>
              <h2 className="font-serif text-lg font-bold text-zinc-100 flex items-center gap-2">
                <span>{ability ? "Editar Habilidade" : "Nova Proposta de Habilidade"}</span>
                {isMaster && (
                  <span className="rounded-full bg-primary/20 border border-primary/40 px-2 py-0.2 text-[9px] font-bold text-primary flex items-center gap-1">
                    <Crown size={10} /> Mestre
                  </span>
                )}
              </h2>
              <p className="text-xs text-zinc-400">
                {isMaster
                  ? "Crie, ajuste ou balanceie a técnica como narrador"
                  : "Forje sua técnica e submeta para análise do Mestre da mesa"}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-1.5 text-zinc-400 hover:bg-zinc-800 hover:text-zinc-200 transition"
            aria-label="Fechar"
          >
            <X size={18} />
          </button>
        </div>

        {/* Alerta Informativo para o Jogador */}
        {!isMaster && (
          <div className="flex items-start gap-2.5 rounded-xl border border-amber-500/30 bg-amber-950/20 p-3 text-xs text-amber-200/90">
            <AlertCircle size={16} className="text-amber-400 shrink-0 mt-0.5" />
            <p>
              <strong>Atenção:</strong> Como jogador, ao salvar esta habilidade, ela será enviada
              como uma <strong>solicitação pendente</strong> para o Mestre da campanha aprovar,
              balancear ou orientar alterações antes de entrar em combate.
            </p>
          </div>
        )}

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
                className="w-full rounded-xl border border-zinc-800 bg-zinc-900/80 px-3 py-2 text-zinc-100 placeholder:text-zinc-600 focus:border-primary focus:outline-none"
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
                className="w-full rounded-xl border border-zinc-800 bg-zinc-900/80 px-3 py-2 font-mono text-zinc-100 focus:border-primary focus:outline-none"
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
                className="w-full rounded-xl border border-zinc-800 bg-zinc-900/80 px-3 py-2 text-zinc-100 focus:border-primary focus:outline-none"
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
                className="w-full rounded-xl border border-zinc-800 bg-zinc-900/80 px-3 py-2 text-zinc-100 focus:border-primary focus:outline-none"
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
                className="w-full rounded-xl border border-zinc-800 bg-zinc-900/80 px-3 py-2 text-zinc-100 placeholder:text-zinc-600 focus:border-primary focus:outline-none"
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
                className="w-full rounded-xl border border-zinc-800 bg-zinc-900/80 px-3 py-2 font-mono text-zinc-100 placeholder:text-zinc-600 focus:border-primary focus:outline-none"
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
                className="w-full rounded-xl border border-zinc-800 bg-zinc-900/80 px-3 py-2 text-zinc-100 placeholder:text-zinc-600 focus:border-primary focus:outline-none"
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
                className="w-full rounded-xl border border-zinc-800 bg-zinc-900/80 px-3 py-2 text-zinc-100 placeholder:text-zinc-600 focus:border-primary focus:outline-none"
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
              className="w-full rounded-xl border border-zinc-800 bg-zinc-900/80 px-3 py-2 text-zinc-100 placeholder:text-zinc-600 focus:border-primary focus:outline-none"
            />
          </div>

          {/* Controle do Mestre: Status de Aprovação e Feedback */}
          {isMaster && (
            <div className="rounded-xl border border-primary/30 bg-primary/10 p-3.5 space-y-3">
              <div className="flex items-center gap-1.5 text-xs font-serif font-bold text-primary">
                <Crown size={14} />
                <span>Painel de Moderação do Mestre</span>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="font-semibold uppercase tracking-wider text-zinc-300">
                    Status de Aprovação
                  </label>
                  <select
                    value={formData.approvalStatus}
                    onChange={(e) => setFormData({ ...formData, approvalStatus: e.target.value })}
                    className="w-full rounded-xl border border-zinc-700 bg-zinc-900 px-3 py-2 text-zinc-100 focus:border-primary focus:outline-none font-bold"
                  >
                    <option value="aprovada">✅ Aprovada para Uso</option>
                    <option value="pendente">⏳ Pendente de Avaliação</option>
                    <option value="rejeitada">❌ Rejeitada</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="font-semibold uppercase tracking-wider text-zinc-300">
                    Parecer / Justificativa para o Jogador
                  </label>
                  <input
                    type="text"
                    value={formData.masterFeedback}
                    onChange={(e) => setFormData({ ...formData, masterFeedback: e.target.value })}
                    placeholder="Ex: Aprovada com custo ajustado para 2 PE."
                    className="w-full rounded-xl border border-zinc-700 bg-zinc-900 px-3 py-2 text-zinc-100 placeholder:text-zinc-500 focus:border-primary focus:outline-none"
                  />
                </div>
              </div>
            </div>
          )}

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
              className="w-full rounded-xl border border-zinc-800 bg-zinc-900/80 px-3 py-2 font-mono text-zinc-100 focus:border-primary focus:outline-none"
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
              className="flex items-center gap-2 rounded-xl border border-primary/50 bg-primary/20 px-5 py-2 font-semibold text-primary hover:bg-primary/30 active:scale-95 transition shadow-md"
            >
              {isMaster ? <Save size={14} /> : <Send size={14} />}
              <span>
                {isMaster
                  ? ability
                    ? "Salvar Modificações"
                    : "Forjar Habilidade"
                  : ability
                  ? "Salvar & Reenviar ao Mestre"
                  : "Enviar Solicitação ao Mestre"}
              </span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
