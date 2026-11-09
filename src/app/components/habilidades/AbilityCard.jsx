"use client";

import { useState } from "react";
import {
  Sparkles,
  Lock,
  Flame,
  Shield,
  Zap,
  Sword,
  Dices,
  Edit2,
  Trash2,
  Star,
  Award,
  ChevronDown,
  ChevronUp,
  Clock,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  RotateCcw,
} from "lucide-react";
import {
  TIPOS_HABILIDADE,
  STATUS_APROVACAO,
  calcularProgressoTreino,
  isHabilidadeDesbloqueada,
} from "../../../lib/abilities";
import { useDice } from "../../context/DiceContext";
import { useCharacter } from "../../context/CharacterContext";

/**
 * Card de Habilidade com Suporte a Fluxo de Aprovação do Mestre
 */
export function AbilityCard({
  ability,
  characterLevel = 1,
  isMaster = false,
  onEdit,
  onDelete,
  onTrain,
  onToggleTraining,
  onApprove,
  onReject,
}) {
  const [expanded, setExpanded] = useState(false);
  const [rejectPromptOpen, setRejectPromptOpen] = useState(false);
  const [rejectReason, setRejectReason] = useState("");

  const { executeRoll, promptRoll } = useDice();
  const { data } = useCharacter();

  const isUnlocked = isHabilidadeDesbloqueada(ability, characterLevel);
  const tipo = TIPOS_HABILIDADE[ability.type] || TIPOS_HABILIDADE.ativa;
  const progresso = calcularProgressoTreino(ability.trainingHours || 0);
  const grau = progresso.grauAtual;

  const approvalStatus = ability.approvalStatus || "aprovada";
  const statusMeta = STATUS_APROVACAO[approvalStatus] || STATUS_APROVACAO.aprovada;
  const isPending = approvalStatus === "pendente";
  const isRejected = approvalStatus === "rejeitada";
  const isApproved = approvalStatus === "aprovada";

  // Ícone temático do tipo
  const renderTipoIcon = () => {
    switch (ability.type) {
      case "magia":
        return <Flame size={13} className="text-purple-400" />;
      case "passiva":
        return <Shield size={13} className="text-emerald-400" />;
      case "reacao":
        return <Zap size={13} className="text-sky-400" />;
      default:
        return <Sword size={13} className="text-amber-400" />;
    }
  };

  // Disparar rolagem de efeito/dano
  const handleRoll = () => {
    if (!isUnlocked) return;

    if (!isApproved) {
      alert("Esta habilidade ainda está aguardando a aprovação do Mestre para ser utilizada.");
      return;
    }

    const formula = ability.rollFormula?.trim();
    if (formula && formula.includes("d")) {
      const match = formula.match(/^(\d+)d(\d+)([+-]\d+)?/i);
      if (match) {
        const count = parseInt(match[1], 10);
        const sides = parseInt(match[2], 10);
        const mod = match[3] ? parseInt(match[3], 10) : 0;
        executeRoll({
          sides,
          count,
          modifier: mod,
          label: `${ability.name} (${ability.damageType || "Efeito"})`,
        });
        return;
      }
    }

    const attrKey = ability.attr || "ESP";
    const attrVal = data[attrKey] ?? 10;
    const attrMod = Math.floor((attrVal - 10) / 2);
    promptRoll(`${ability.name} (Teste de ${attrKey})`, attrMod);
  };

  const handleConfirmReject = () => {
    if (onReject) {
      onReject(ability.id, rejectReason || "Habilidade incompatível com a mesa.");
    }
    setRejectPromptOpen(false);
    setRejectReason("");
  };

  return (
    <div
      className={`group relative flex flex-col justify-between rounded-xl border p-4 transition-all duration-200 ${
        isRejected
          ? "border-rose-900/60 bg-rose-950/20"
          : isPending
          ? "border-amber-500/50 bg-amber-950/15 shadow-sm"
          : isUnlocked
          ? "border-zinc-800/80 bg-zinc-950/70 shadow-md hover:border-amber-500/40 hover:bg-zinc-900/60"
          : "border-zinc-800/40 bg-zinc-950/30 opacity-75 backdrop-blur-[2px]"
      }`}
    >
      {/* Topo do Card: Tipo, Nível, Status de Aprovação & Ações */}
      <div>
        <div className="flex items-center justify-between gap-2 border-b border-zinc-800/60 pb-2.5">
          <div className="flex flex-wrap items-center gap-1.5">
            {/* Tipo */}
            <span
              className={`inline-flex items-center gap-1 rounded-md border px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider ${tipo.badge}`}
            >
              {renderTipoIcon()}
              {tipo.nome}
            </span>

            {/* Badge de Nível */}
            <span
              className={`inline-flex items-center gap-1 rounded-md border px-2 py-0.5 text-[10px] font-bold ${
                isUnlocked
                  ? "border-emerald-500/40 bg-emerald-950/40 text-emerald-300"
                  : "border-rose-500/40 bg-rose-950/40 text-rose-300"
              }`}
            >
              {isUnlocked ? <Sparkles size={10} /> : <Lock size={10} />}
              Nível {ability.reqLevel || 1}
              {!isUnlocked && " (Bloqueada)"}
            </span>

            {/* Badge de Aprovação do Mestre */}
            {isPending && (
              <span className="inline-flex items-center gap-1 rounded-md border border-amber-500/50 bg-amber-950/60 px-2 py-0.5 text-[10px] font-bold text-amber-300 animate-pulse">
                <Clock size={10} />
                Pendente
              </span>
            )}
            {isRejected && (
              <span className="inline-flex items-center gap-1 rounded-md border border-rose-500/50 bg-rose-950/60 px-2 py-0.5 text-[10px] font-bold text-rose-300">
                <XCircle size={10} />
                Rejeitada
              </span>
            )}
          </div>

          {/* Ações Rápidas de Edição, Foco e Exclusão */}
          <div className="flex items-center gap-1">
            {isApproved && isUnlocked && onToggleTraining && (
              <button
                type="button"
                onClick={() => onToggleTraining(ability.id)}
                title={
                  ability.isTraining
                    ? "Remover do foco de treino"
                    : "Definir como foco de treino atual"
                }
                className={`flex h-7 w-7 items-center justify-center rounded-lg border transition ${
                  ability.isTraining
                    ? "border-amber-500/80 bg-amber-500/20 text-amber-300 shadow-[0_0_8px_rgba(245,158,11,0.3)]"
                    : "border-zinc-800 text-zinc-500 hover:border-zinc-700 hover:text-zinc-300"
                }`}
              >
                <Star
                  size={13}
                  className={ability.isTraining ? "fill-amber-400" : ""}
                />
              </button>
            )}

            {onEdit && (
              <button
                type="button"
                onClick={() => onEdit(ability)}
                title="Editar habilidade"
                className="flex h-7 w-7 items-center justify-center rounded-lg border border-zinc-800/80 text-zinc-500 transition hover:border-zinc-700 hover:text-zinc-300"
              >
                <Edit2 size={12} />
              </button>
            )}

            {onDelete && (
              <button
                type="button"
                onClick={() => onDelete(ability.id)}
                title="Excluir habilidade"
                className="flex h-7 w-7 items-center justify-center rounded-lg border border-zinc-800/80 text-zinc-500 transition hover:border-rose-500/50 hover:text-rose-400"
              >
                <Trash2 size={12} />
              </button>
            )}
          </div>
        </div>

        {/* Título e Custo */}
        <div className="mt-3 flex items-start justify-between gap-2">
          <div>
            <h3 className="font-serif text-base font-bold tracking-tight text-zinc-100 group-hover:text-amber-300 transition-colors">
              {ability.name}
            </h3>
            {ability.damageType && (
              <span className="text-[11px] text-zinc-400">
                {ability.damageType}
                {ability.range && ` • ${ability.range}`}
              </span>
            )}
          </div>

          {ability.cost && (
            <span className="shrink-0 rounded-lg border border-sky-500/30 bg-sky-950/40 px-2 py-1 font-mono text-xs font-bold text-sky-300">
              {ability.cost}
            </span>
          )}
        </div>

        {/* Alerta de Pendente / Rejeitada */}
        {isPending && !isMaster && (
          <div className="mt-2 rounded-lg border border-amber-500/30 bg-amber-950/20 p-2 text-[11px] text-amber-300/90 flex items-center gap-1.5">
            <Clock size={12} className="shrink-0 text-amber-400" />
            <span>Aguardando avaliação do Mestre para liberação em combate.</span>
          </div>
        )}

        {isRejected && (
          <div className="mt-2 rounded-lg border border-rose-500/40 bg-rose-950/40 p-2.5 text-xs text-rose-300 space-y-1">
            <div className="flex items-center gap-1.5 font-bold text-rose-200">
              <AlertTriangle size={13} />
              <span>Rejeitada pelo Mestre</span>
            </div>
            {ability.masterFeedback && (
              <p className="text-[11px] text-rose-300/90 italic">
                "{ability.masterFeedback}"
              </p>
            )}
            <button
              type="button"
              onClick={() => onEdit(ability)}
              className="mt-1 inline-flex items-center gap-1 rounded bg-rose-500/20 border border-rose-500/40 px-2 py-0.5 text-[10px] font-bold text-rose-200 hover:bg-rose-500/30 transition"
            >
              <RotateCcw size={10} />
              <span>Ajustar Proposta e Reenviar</span>
            </button>
          </div>
        )}

        {/* Descrição com sanfona/expandir se longa */}
        <p className="mt-2 text-xs leading-relaxed text-zinc-400">
          {expanded || (ability.description && ability.description.length < 130)
            ? ability.description
            : `${ability.description?.slice(0, 130)}...`}
        </p>

        {ability.description && ability.description.length >= 130 && (
          <button
            type="button"
            onClick={() => setExpanded(!expanded)}
            className="mt-1 flex items-center gap-1 text-[11px] font-semibold text-amber-400 hover:text-amber-300 transition"
          >
            {expanded ? (
              <>
                <span>Recolher</span>
                <ChevronUp size={12} />
              </>
            ) : (
              <>
                <span>Ler descrição completa</span>
                <ChevronDown size={12} />
              </>
            )}
          </button>
        )}
      </div>

      {/* PAINEL DE MODERAÇÃO EXCLUSIVO DO MESTRE PARA HABILIDADES PENDENTES */}
      {isMaster && isPending && (
        <div className="mt-3 rounded-xl border border-amber-500/40 bg-amber-950/30 p-2.5 space-y-2">
          <div className="flex items-center justify-between text-xs font-bold text-amber-300">
            <span className="flex items-center gap-1">
              <Clock size={12} />
              Solicitação do Jogador
            </span>
            <span className="text-[10px] text-muted-foreground">Parecer do Mestre</span>
          </div>

          {rejectPromptOpen ? (
            <div className="space-y-1.5 pt-1">
              <input
                type="text"
                value={rejectReason}
                onChange={(e) => setRejectReason(e.target.value)}
                placeholder="Motivo da recusa (ex: reduza o dano para 1d8)..."
                className="w-full rounded-lg border border-rose-500/40 bg-zinc-900 px-2.5 py-1 text-xs text-zinc-100 placeholder:text-zinc-600 focus:outline-none focus:border-rose-400"
                autoFocus
              />
              <div className="flex items-center justify-end gap-1.5">
                <button
                  type="button"
                  onClick={() => setRejectPromptOpen(false)}
                  className="rounded px-2 py-0.5 text-[10px] font-semibold text-zinc-400 hover:text-zinc-200"
                >
                  Cancelar
                </button>
                <button
                  type="button"
                  onClick={handleConfirmReject}
                  className="rounded bg-rose-600 px-2.5 py-0.5 text-[10px] font-bold text-white hover:bg-rose-500"
                >
                  Confirmar Recusa
                </button>
              </div>
            </div>
          ) : (
            <div className="flex items-center gap-2 pt-1">
              <button
                type="button"
                onClick={() => onApprove && onApprove(ability.id)}
                className="flex-1 flex items-center justify-center gap-1 rounded-lg border border-emerald-500/50 bg-emerald-950/60 py-1.5 text-xs font-bold text-emerald-300 hover:bg-emerald-900/60 transition active:scale-95 shadow-sm"
              >
                <CheckCircle2 size={13} />
                <span>Aprovar</span>
              </button>

              <button
                type="button"
                onClick={() => onEdit && onEdit(ability)}
                className="flex items-center justify-center gap-1 rounded-lg border border-zinc-700 bg-zinc-800/80 px-2.5 py-1.5 text-xs font-semibold text-zinc-200 hover:bg-zinc-700 transition"
                title="Editar e balancear antes de aprovar"
              >
                <Edit2 size={12} />
                <span>Editar</span>
              </button>

              <button
                type="button"
                onClick={() => setRejectPromptOpen(true)}
                className="flex items-center justify-center gap-1 rounded-lg border border-rose-500/40 bg-rose-950/40 px-2.5 py-1.5 text-xs font-bold text-rose-300 hover:bg-rose-900/50 transition active:scale-95"
              >
                <XCircle size={13} />
                <span>Negar</span>
              </button>
            </div>
          )}
        </div>
      )}

      {/* Rodapé: Grau de Maestria, Treino e Ação de Rolagem */}
      <div className="mt-4 border-t border-zinc-800/60 pt-3 space-y-2.5">
        {/* Barra de Progresso do Treino */}
        <div>
          <div className="flex items-center justify-between text-[11px]">
            <div className="flex items-center gap-1">
              <span className={`font-semibold ${grau.cor}`}>{grau.nome}</span>
              <span className="text-zinc-500 font-mono text-[10px]">
                ({ability.trainingHours || 0}h)
              </span>
            </div>
            <span className="text-[10px] text-zinc-400">
              {progresso.isMax
                ? "Maestria Máxima"
                : `+${progresso.horasFaltantes}h para ${progresso.proximoGrau?.nome}`}
            </span>
          </div>

          <div className="mt-1 h-1.5 w-full overflow-hidden rounded-full border border-zinc-800 bg-zinc-900">
            <div
              className={`h-full transition-all duration-300 ${
                progresso.isMax
                  ? "bg-purple-500"
                  : progresso.porcentagem > 50
                  ? "bg-amber-400"
                  : "bg-primary"
              }`}
              style={{ width: `${progresso.porcentagem}%` }}
            />
          </div>
        </div>

        {/* Botões de Ação de Rodapé */}
        <div className="flex items-center justify-between gap-2 pt-1">
          {/* Botão de Treino Rápido (+1h) */}
          {isUnlocked && isApproved && onTrain && !progresso.isMax ? (
            <button
              type="button"
              onClick={() => onTrain(ability.id, 1)}
              className="flex items-center gap-1 rounded-lg border border-amber-500/30 bg-amber-500/10 px-2.5 py-1 text-xs font-semibold text-amber-300 hover:bg-amber-500/20 active:scale-95 transition"
              title="Dedicar 1 hora de treino prático a esta habilidade"
            >
              <Award size={12} />
              <span>+1h Treino</span>
            </button>
          ) : (
            <span className="text-[10px] text-zinc-500 font-serif italic">
              {isApproved ? grau.bonus : "Aguardando aprovação"}
            </span>
          )}

          {/* Gatilho de Rolagem de Combate */}
          <button
            type="button"
            onClick={handleRoll}
            disabled={!isUnlocked || !isApproved}
            className={`flex items-center gap-1.5 rounded-lg border px-3 py-1 font-mono text-xs font-bold transition-all active:scale-95 ${
              isUnlocked && isApproved
                ? "border-primary/50 bg-primary/20 text-primary hover:border-primary hover:bg-primary hover:text-primary-foreground shadow-sm cursor-pointer"
                : "border-zinc-800 bg-zinc-900/50 text-zinc-600 cursor-not-allowed"
            }`}
            title={
              !isApproved
                ? "Habilidade ainda aguardando aprovação do Mestre"
                : !isUnlocked
                ? `Requer Nível ${ability.reqLevel}`
                : `Rolar ativação de ${ability.name}`
            }
          >
            <Dices size={13} />
            <span>{ability.rollFormula || "Ativar"}</span>
          </button>
        </div>
      </div>
    </div>
  );
}
