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
} from "lucide-react";
import {
  TIPOS_HABILIDADE,
  calcularProgressoTreino,
  isHabilidadeDesbloqueada,
} from "../../../lib/abilities";
import { useDice } from "../../context/DiceContext";
import { useCharacter } from "../../context/CharacterContext";

/**
 * Card de Habilidade no estilo Dark Fantasy
 * Exibe detalhes, custo de PE, status de desbloqueio por nível e barra de treino.
 */
export function AbilityCard({
  ability,
  characterLevel = 1,
  onEdit,
  onDelete,
  onTrain,
  onToggleTraining,
}) {
  const [expanded, setExpanded] = useState(false);
  const { executeRoll, promptRoll } = useDice();
  const { data, updExtra } = useCharacter();

  const isUnlocked = isHabilidadeDesbloqueada(ability, characterLevel);
  const tipo = TIPOS_HABILIDADE[ability.type] || TIPOS_HABILIDADE.ativa;
  const progresso = calcularProgressoTreino(ability.trainingHours || 0);
  const grau = progresso.grauAtual;

  // Extrair ícone do tipo
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

    // Se a fórmula tiver dados (ex: 2d6+2 ou 1d10), extrai ou rola d20
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

    // Rolagem padrão de ativação d20 com modificador do atributo chave
    const attrKey = ability.attr || "ESP";
    const attrVal = data[attrKey] ?? 10;
    const attrMod = Math.floor((attrVal - 10) / 2);
    promptRoll(`${ability.name} (Teste de ${attrKey})`, attrMod);
  };

  return (
    <div
      className={`group relative flex flex-col justify-between rounded-xl border p-4 transition-all duration-200 ${
        isUnlocked
          ? "border-zinc-800/80 bg-zinc-950/70 shadow-md hover:border-amber-500/40 hover:bg-zinc-900/60"
          : "border-zinc-800/40 bg-zinc-950/30 opacity-75 backdrop-blur-[2px]"
      }`}
    >
      {/* Topo do Card: Tipo, Nível & Ações */}
      <div>
        <div className="flex items-center justify-between gap-2 border-b border-zinc-800/60 pb-2.5">
          <div className="flex flex-wrap items-center gap-1.5">
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
          </div>

          {/* Botão de Foco de Treino & Ações */}
          <div className="flex items-center gap-1">
            {isUnlocked && onToggleTraining && (
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
            className="mt-1 flex items-center gap-1 text-[10px] font-semibold text-amber-400/90 hover:underline"
          >
            {expanded ? (
              <>
                <ChevronUp size={11} /> Ver menos
              </>
            ) : (
              <>
                <ChevronDown size={11} /> Ler descrição completa
              </>
            )}
          </button>
        )}
      </div>

      {/* Seção Inferior: Barra de Treino & Gatilho de Rolagem */}
      <div className="mt-4 border-t border-zinc-800/60 pt-3 space-y-2.5">
        {/* Status de Treinamento */}
        <div className="space-y-1">
          <div className="flex items-center justify-between text-[11px]">
            <span className="flex items-center gap-1 text-zinc-400 font-medium">
              <Award size={12} className={grau.cor} />
              <span>Maestria:</span>
              <strong className={grau.cor}>{grau.nome}</strong>
            </span>
            <span className="font-mono text-[10px] text-zinc-400">
              {progresso.horas}h{" "}
              {progresso.proximoGrau && `/ ${progresso.proximoGrau.horasMinimas}h`}
            </span>
          </div>

          {/* Barra de Progresso de Treino */}
          <div className="h-1.5 w-full overflow-hidden rounded-full border border-white/5 bg-zinc-900">
            <div
              className={`h-full transition-all duration-500 ${
                progresso.isMax
                  ? "bg-purple-500"
                  : grau.id === "veterano"
                  ? "bg-amber-400"
                  : grau.id === "praticante"
                  ? "bg-sky-400"
                  : "bg-zinc-400"
              }`}
              style={{ width: `${progresso.porcentagem}%` }}
            />
          </div>

          <div className="flex items-center justify-between text-[9px] text-zinc-500">
            <span>{grau.bonus}</span>
            {progresso.proximoGrau ? (
              <span>Faltam {progresso.horasFaltantes}h para {progresso.proximoGrau.nome}</span>
            ) : (
              <span className="text-purple-400 font-bold">Maestria Suprema</span>
            )}
          </div>
        </div>

        {/* Botões de Ação: Treinar e Rolar */}
        <div className="flex items-center gap-2 pt-1">
          {/* Botão de Rolagem / Ativação */}
          {isUnlocked ? (
            <button
              type="button"
              onClick={handleRoll}
              className="flex flex-1 items-center justify-center gap-1.5 rounded-lg border border-amber-500/40 bg-amber-500/15 py-2 text-xs font-bold text-amber-300 transition hover:bg-amber-500/25 active:scale-95"
            >
              <Dices size={13} />
              <span>{ability.rollFormula ? `Rolar (${ability.rollFormula})` : "Executar Teste"}</span>
            </button>
          ) : (
            <div className="flex flex-1 items-center justify-center gap-1.5 rounded-lg border border-zinc-800 bg-zinc-900/40 py-2 text-xs font-medium text-zinc-500">
              <Lock size={12} />
              <span>Desbloqueia no Nível {ability.reqLevel}</span>
            </div>
          )}

          {/* Botões Rápidos de Treino */}
          {isUnlocked && onTrain && (
            <div className="flex items-center gap-1">
              <button
                type="button"
                onClick={() => onTrain(ability.id, 1)}
                title="Investir 1 hora de treino"
                className="rounded-lg border border-zinc-700 bg-zinc-800/80 px-2 py-2 text-[11px] font-bold text-zinc-300 transition hover:border-amber-500/50 hover:bg-zinc-700 hover:text-amber-300 active:scale-95"
              >
                +1h
              </button>
              <button
                type="button"
                onClick={() => onTrain(ability.id, 5)}
                title="Investir 5 horas de treino intenso"
                className="rounded-lg border border-zinc-700 bg-zinc-800/80 px-2 py-2 text-[11px] font-bold text-zinc-300 transition hover:border-amber-500/50 hover:bg-zinc-700 hover:text-amber-300 active:scale-95"
              >
                +5h
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
