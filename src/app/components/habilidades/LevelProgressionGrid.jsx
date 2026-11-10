"use client";

import { useState, useMemo } from "react";
import {
  Sparkles,
  Lock,
  Unlock,
  CheckCircle2,
  Clock,
  XCircle,
  Plus,
  Edit2,
  Trash2,
  Layers,
  Award,
  Dices,
  Flame,
  Shield,
  Zap,
  Sword,
  X,
  Search,
  ArrowRight,
  Filter,
} from "lucide-react";
import {
  TIPOS_HABILIDADE,
  STATUS_APROVACAO,
  calcularProgressoTreino,
  podeTreinarHabilidade,
} from "../../../lib/abilities";
import { useDice } from "../../context/DiceContext";
import { useCharacter } from "../../context/CharacterContext";

/**
 * Grid de Progressão de Habilidades por Nível (Nível 1 ao 20)
 * Permite ao jogador escolher/alocar uma habilidade para cada nível.
 */
export function LevelProgressionGrid({
  characterLevel = 1,
  abilities = [],
  levelAbilities = {},
  isMaster = false,
  onAssign,
  onUnassign,
  onOpenCreateModal,
  onEditAbility,
  onTrain,
}) {
  const { executeRoll, promptRoll } = useDice();
  const { data } = useCharacter();

  const [filterMode, setFilterMode] = useState("todos"); // "todos" | "desbloqueados" | "vazios"
  const [selectorLevel, setSelectorLevel] = useState(null); // nível cujo slot está sendo escolhido
  const [selectorSearch, setSelectorSearch] = useState("");

  const levels = useMemo(() => Array.from({ length: 20 }, (_, i) => i + 1), []);

  // Contadores
  const stats = useMemo(() => {
    let filled = 0;
    let unlockedFilled = 0;

    for (let lvl = 1; lvl <= 20; lvl++) {
      const habId = levelAbilities?.[lvl];
      if (habId && abilities.some((a) => a.id === habId)) {
        filled++;
        if (characterLevel >= lvl) {
          unlockedFilled++;
        }
      }
    }

    return {
      filled,
      empty: 20 - filled,
      unlockedFilled,
      totalUnlockedSlots: Math.min(20, Math.max(1, characterLevel)),
    };
  }, [levelAbilities, abilities, characterLevel]);

  // Níveis filtrados para exibição
  const filteredLevels = useMemo(() => {
    return levels.filter((lvl) => {
      const isUnlocked = characterLevel >= lvl;
      const habId = levelAbilities?.[lvl];
      const isFilled = Boolean(habId && abilities.some((a) => a.id === habId));

      if (filterMode === "desbloqueados") return isUnlocked;
      if (filterMode === "vazios") return !isFilled;
      return true;
    });
  }, [levels, characterLevel, levelAbilities, abilities, filterMode]);

  // Habilidades disponíveis para o seletor
  const selectorAvailableAbilities = useMemo(() => {
    return abilities.filter((h) => {
      const search = selectorSearch.toLowerCase();
      const matchesSearch =
        h.name.toLowerCase().includes(search) ||
        (h.description && h.description.toLowerCase().includes(search)) ||
        (h.type && h.type.toLowerCase().includes(search));
      return matchesSearch;
    });
  }, [abilities, selectorSearch]);

  // Helper de ícone por tipo
  const renderTipoIcon = (type) => {
    switch (type) {
      case "magia":
        return <Flame size={12} className="text-purple-400" />;
      case "passiva":
        return <Shield size={12} className="text-emerald-400" />;
      case "reacao":
        return <Zap size={12} className="text-sky-400" />;
      default:
        return <Sword size={12} className="text-amber-400" />;
    }
  };

  // Gatilho de Rolagem rápida
  const handleRollAbility = (ability) => {
    const isApproved = (ability.approvalStatus || "aprovada") === "aprovada";
    if (!isApproved) {
      alert("Esta habilidade aguarda aprovação do Mestre para ser utilizada.");
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

  return (
    <div className="space-y-5">
      {/* Barra de Progresso e Métricas dos Níveis 1 a 20 */}
      <div className="rounded-2xl border border-zinc-800 bg-zinc-950/70 p-4 sm:p-5 shadow-lg backdrop-blur-sm space-y-4">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <div className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest text-amber-400">
              <Layers size={13} />
              <span>Progressão do Herói • Níveis 1 a 20</span>
            </div>
            <h2 className="font-serif text-lg font-bold text-zinc-100 sm:text-xl">
              Habilidades por Nível de Personagem
            </h2>
            <p className="text-xs text-zinc-400 mt-0.5">
              Escolha e vincule as habilidades forjadas e aprovadas pelo Mestre para cada nível da sua evolução.
            </p>
          </div>

          {/* Badges de Métricas */}
          <div className="flex flex-wrap items-center gap-2">
            <div className="rounded-xl border border-zinc-800 bg-zinc-900/60 px-3 py-1.5 text-center">
              <span className="block text-[9px] uppercase tracking-wider text-zinc-400">
                Slots Preenchidos
              </span>
              <span className="font-mono text-sm font-bold text-amber-300">
                {stats.filled} <span className="text-zinc-500">/ 20</span>
              </span>
            </div>

            <div className="rounded-xl border border-zinc-800 bg-zinc-900/60 px-3 py-1.5 text-center">
              <span className="block text-[9px] uppercase tracking-wider text-zinc-400">
                Despertadas Ativas
              </span>
              <span className="font-mono text-sm font-bold text-emerald-300">
                {stats.unlockedFilled} <span className="text-zinc-500">/ {stats.totalUnlockedSlots}</span>
              </span>
            </div>
          </div>
        </div>

        {/* Barra de Progresso Visual dos 20 Níveis */}
        <div className="space-y-1.5">
          <div className="flex items-center justify-between text-[11px] text-zinc-400 font-mono">
            <span>Nível 1</span>
            <span>Progresso da Jornada ({Math.round((stats.filled / 20) * 100)}%)</span>
            <span>Nível 20</span>
          </div>

          <div className="grid grid-cols-20 gap-1 h-3 rounded-lg bg-zinc-900 border border-zinc-800/80 p-0.5 overflow-hidden">
            {levels.map((lvl) => {
              const isUnlocked = characterLevel >= lvl;
              const habId = levelAbilities?.[lvl];
              const isFilled = Boolean(habId && abilities.some((a) => a.id === habId));

              let bgClass = "bg-zinc-800/50";
              if (isFilled && isUnlocked) {
                bgClass = "bg-amber-400 shadow-[0_0_6px_rgba(245,158,11,0.5)]";
              } else if (isFilled && !isUnlocked) {
                bgClass = "bg-sky-500/80";
              } else if (!isFilled && isUnlocked) {
                bgClass = "bg-emerald-500/30 border border-dashed border-emerald-500/50";
              }

              return (
                <div
                  key={lvl}
                  title={`Nível ${lvl}: ${
                    isFilled ? "Habilidade alocada" : "Slot vazio"
                  } (${isUnlocked ? "Desbloqueado" : "Requer Nível " + lvl})`}
                  className={`h-full rounded-xs transition-colors duration-200 ${bgClass}`}
                />
              );
            })}
          </div>
        </div>

        {/* Filtros da Grade */}
        <div className="flex flex-wrap items-center justify-between gap-2 border-t border-zinc-800/80 pt-3">
          <div className="flex items-center gap-1.5 text-xs">
            <span className="text-[10px] uppercase tracking-wider text-zinc-500 flex items-center gap-1">
              <Filter size={11} /> Filtrar:
            </span>
            <button
              type="button"
              onClick={() => setFilterMode("todos")}
              className={`rounded-lg px-2.5 py-1 text-xs font-semibold transition ${
                filterMode === "todos"
                  ? "bg-amber-500/20 text-amber-300 border border-amber-500/40"
                  : "text-zinc-400 hover:text-zinc-200"
              }`}
            >
              Todos os Níveis (20)
            </button>
            <button
              type="button"
              onClick={() => setFilterMode("desbloqueados")}
              className={`rounded-lg px-2.5 py-1 text-xs font-semibold transition ${
                filterMode === "desbloqueados"
                  ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/40"
                  : "text-zinc-400 hover:text-zinc-200"
              }`}
            >
              Desbloqueados ({stats.totalUnlockedSlots})
            </button>
            <button
              type="button"
              onClick={() => setFilterMode("vazios")}
              className={`rounded-lg px-2.5 py-1 text-xs font-semibold transition ${
                filterMode === "vazios"
                  ? "bg-sky-500/20 text-sky-300 border border-sky-500/40"
                  : "text-zinc-400 hover:text-zinc-200"
              }`}
            >
              Slots Vazios ({stats.empty})
            </button>
          </div>

          <button
            type="button"
            onClick={() => onOpenCreateModal && onOpenCreateModal(null, characterLevel)}
            className="flex items-center gap-1.5 rounded-xl border border-primary/40 bg-primary/20 px-3 py-1.5 text-xs font-bold text-primary hover:bg-primary/30 transition active:scale-95"
          >
            <Plus size={13} />
            <span>{isMaster ? "Forjar Nova Habilidade" : "Propor Nova Habilidade"}</span>
          </button>
        </div>
      </div>

      {/* Grade com os 20 Slots de Nível */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        {filteredLevels.map((lvl) => {
          const isUnlocked = characterLevel >= lvl;
          const assignedId = levelAbilities?.[lvl];
          const ability = assignedId ? abilities.find((a) => a.id === assignedId) : null;

          const tipo = ability ? TIPOS_HABILIDADE[ability.type] || TIPOS_HABILIDADE.ativa : null;
          const progresso = ability ? calcularProgressoTreino(ability.trainingHours || 0) : null;
          const grau = progresso?.grauAtual;
          const approvalStatus = ability?.approvalStatus || "aprovada";
          const isApproved = approvalStatus === "aprovada";
          const isPending = approvalStatus === "pendente";
          const isRejected = approvalStatus === "rejeitada";
          const canTrain = ability ? podeTreinarHabilidade(ability) : false;

          return (
            <div
              key={lvl}
              className={`relative flex flex-col justify-between rounded-xl border p-4 transition-all duration-200 ${
                isUnlocked
                  ? "border-zinc-800 bg-zinc-950/80 shadow-md hover:border-amber-500/40"
                  : "border-zinc-800/40 bg-zinc-950/40 opacity-80 backdrop-blur-[1px]"
              }`}
            >
              {/* Topo do Card do Nível */}
              <div>
                <div className="flex items-center justify-between gap-2 border-b border-zinc-800/60 pb-2.5">
                  <div className="flex items-center gap-2">
                    {/* Badge do Número do Nível */}
                    <div
                      className={`flex h-8 w-8 items-center justify-center rounded-xl border font-serif text-xs font-bold transition ${
                        isUnlocked
                          ? "border-amber-500/60 bg-amber-500/20 text-amber-300 shadow-[0_0_8px_rgba(245,158,11,0.25)]"
                          : "border-zinc-800 bg-zinc-900 text-zinc-500"
                      }`}
                    >
                      {lvl}
                    </div>
                    <div>
                      <span className="font-serif text-sm font-bold text-zinc-200">
                        Nível {lvl}
                      </span>
                      <span className="block text-[10px] text-zinc-400">
                        Slot de Habilidade #{lvl}
                      </span>
                    </div>
                  </div>

                  {/* Status de Desbloqueio do Nível */}
                  <div className="flex items-center gap-1.5">
                    <span
                      className={`inline-flex items-center gap-1 rounded-md border px-2 py-0.5 text-[10px] font-semibold ${
                        isUnlocked
                          ? "border-emerald-500/40 bg-emerald-950/50 text-emerald-300"
                          : "border-zinc-800 bg-zinc-900/60 text-zinc-500"
                      }`}
                    >
                      {isUnlocked ? (
                        <>
                          <Unlock size={10} />
                          Desbloqueado
                        </>
                      ) : (
                        <>
                          <Lock size={10} />
                          Requer Nível {lvl}
                        </>
                      )}
                    </span>
                  </div>
                </div>

                {/* Conteúdo: Habilidade Alocada OU Slot Vazio */}
                {ability ? (
                  <div className="mt-3 space-y-2.5">
                    {/* Linha de Tipos & Status de Aprovação */}
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <div className="flex flex-wrap items-center gap-1.5">
                        <span
                          className={`inline-flex items-center gap-1 rounded-md border px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider ${
                            tipo?.badge || "border-zinc-700 bg-zinc-800 text-zinc-300"
                          }`}
                        >
                          {renderTipoIcon(ability.type)}
                          {tipo?.nome || ability.type}
                        </span>

                        <span
                          className={`inline-flex items-center gap-1 rounded-md border px-2 py-0.5 text-[10px] font-bold ${
                            ability.category === "nivel"
                              ? "border-amber-500/40 bg-amber-950/40 text-amber-300"
                              : "border-purple-500/40 bg-purple-950/40 text-purple-300"
                          }`}
                        >
                          {ability.category === "nivel" ? <Sparkles size={10} /> : <Sword size={10} />}
                          {ability.category === "nivel" ? "Hab. de Nível" : "Criada pelo Jogador"}
                        </span>

                        {ability.cost && (
                          <span className="rounded-md border border-zinc-700 bg-zinc-900/80 px-2 py-0.5 text-[10px] font-mono font-bold text-zinc-300">
                            {ability.cost}
                          </span>
                        )}
                      </div>

                      {/* Badge de Aprovação */}
                      <div>
                        {isPending && (
                          <span className="inline-flex items-center gap-1 rounded-md border border-amber-500/50 bg-amber-950/60 px-2 py-0.5 text-[10px] font-bold text-amber-300 animate-pulse">
                            <Clock size={10} />
                            Pendente de Aprovação
                          </span>
                        )}
                        {isApproved && (
                          <span className="inline-flex items-center gap-1 rounded-md border border-emerald-500/50 bg-emerald-950/60 px-2 py-0.5 text-[10px] font-bold text-emerald-300">
                            <CheckCircle2 size={10} />
                            Aprovada
                          </span>
                        )}
                        {isRejected && (
                          <span className="inline-flex items-center gap-1 rounded-md border border-rose-500/50 bg-rose-950/60 px-2 py-0.5 text-[10px] font-bold text-rose-300">
                            <XCircle size={10} />
                            Rejeitada
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Nome & Descrição */}
                    <div>
                      <h4 className="font-serif text-base font-bold text-zinc-100">
                        {ability.name}
                      </h4>
                      {ability.description && (
                        <p className="mt-1 text-xs text-zinc-400 line-clamp-2">
                          {ability.description}
                        </p>
                      )}
                      {ability.damageType && (
                        <span className="mt-1 inline-block text-[11px] font-mono text-zinc-400">
                          {ability.damageType} {ability.range && `• ${ability.range}`}
                        </span>
                      )}
                    </div>

                    {/* Feedback do Mestre (se houver) */}
                    {ability.masterFeedback && (
                      <div className="rounded-lg border border-amber-500/40 bg-amber-950/30 p-2 text-xs text-amber-200">
                        <strong className="text-[10px] uppercase font-bold text-amber-400 block">
                          Feedback do Mestre:
                        </strong>
                        <p className="text-[11px] mt-0.5">{ability.masterFeedback}</p>
                      </div>
                    )}

                    {/* Barra de Treino e Grau de Maestria */}
                    <div className="rounded-lg border border-zinc-800 bg-zinc-900/60 p-2 space-y-1.5">
                      <div className="flex items-center justify-between text-[11px]">
                        <span className={`font-semibold ${grau?.cor || "text-zinc-300"}`}>
                          Grau: {grau?.nome || "Aprendiz"}{" "}
                          <span className="font-mono text-[10px] text-zinc-500">
                            ({ability.trainingHours || 0}h)
                          </span>
                        </span>
                        <span className="text-[10px] text-zinc-400">
                          {progresso?.isMax
                            ? "Maestria Máxima"
                            : `Faltam ${progresso?.horasFaltantes || 0}h`}
                        </span>
                      </div>
                      <div className="h-1.5 w-full overflow-hidden rounded-full border border-zinc-800 bg-zinc-950">
                        <div
                          className={`h-full transition-all duration-300 ${
                            progresso?.isMax
                              ? "bg-purple-500"
                              : (progresso?.porcentagem || 0) > 50
                              ? "bg-amber-400"
                              : "bg-primary"
                          }`}
                          style={{ width: `${progresso?.porcentagem || 0}%` }}
                        />
                      </div>
                    </div>
                  </div>
                ) : (
                  /* Slot Vazio */
                  <div className="mt-4 rounded-xl border border-dashed border-zinc-800 bg-zinc-950/30 p-4 text-center space-y-3">
                    <p className="text-xs text-zinc-500">
                      Nenhuma habilidade alocada para o Nível {lvl}.
                    </p>
                    <div className="flex flex-wrap items-center justify-center gap-2">
                      <button
                        type="button"
                        onClick={() => {
                          setSelectorSearch("");
                          setSelectorLevel(lvl);
                        }}
                        className="flex items-center gap-1 rounded-lg border border-zinc-700 bg-zinc-800 px-3 py-1.5 text-xs font-semibold text-zinc-200 hover:border-amber-500/50 hover:text-amber-300 transition active:scale-95"
                      >
                        <Layers size={12} />
                        <span>Escolher Habilidade</span>
                      </button>

                      <button
                        type="button"
                        onClick={() =>
                          onOpenCreateModal && onOpenCreateModal(null, lvl, lvl)
                        }
                        className="flex items-center gap-1 rounded-lg border border-primary/40 bg-primary/20 px-3 py-1.5 text-xs font-bold text-primary hover:bg-primary/30 transition active:scale-95"
                      >
                        <Plus size={12} />
                        <span>Forjar para Nvl {lvl}</span>
                      </button>
                    </div>
                  </div>
                )}
              </div>

              {/* Rodapé de Ações do Slot */}
              {ability && (
                <div className="mt-4 border-t border-zinc-800/80 pt-3 flex flex-wrap items-center justify-between gap-2">
                  <div className="flex items-center gap-1.5">
                    {/* Botão de Treino (+1h) - Só para Aprovadas */}
                    {isUnlocked && isApproved && onTrain && !progresso?.isMax ? (
                      <button
                        type="button"
                        onClick={() => onTrain(ability.id, 1)}
                        className="flex items-center gap-1 rounded-lg border border-amber-500/40 bg-amber-500/20 px-2.5 py-1 text-xs font-bold text-amber-300 hover:bg-amber-500/30 active:scale-95 transition"
                        title="Dedicar 1 hora de treino prático a esta habilidade"
                      >
                        <Award size={12} />
                        <span>+1h Treino</span>
                      </button>
                    ) : (
                      <span className="text-[10px] text-zinc-500 font-serif italic">
                        {!isApproved
                          ? "Aguardando aprovação do Mestre para treinar"
                          : !isUnlocked
                          ? `Desbloqueia no Nível ${lvl}`
                          : grau?.bonus}
                      </span>
                    )}

                    {/* Botão de Rolagem / Ativação */}
                    <button
                      type="button"
                      onClick={() => handleRollAbility(ability)}
                      disabled={!isUnlocked || !isApproved}
                      className={`flex items-center gap-1 rounded-lg border px-2.5 py-1 font-mono text-xs font-bold transition-all active:scale-95 ${
                        isUnlocked && isApproved
                          ? "border-primary/50 bg-primary/20 text-primary hover:bg-primary hover:text-primary-foreground shadow-sm cursor-pointer"
                          : "border-zinc-800 bg-zinc-900/40 text-zinc-600 cursor-not-allowed"
                      }`}
                      title={
                        !isApproved
                          ? "Habilidade aguarda aprovação do Mestre"
                          : !isUnlocked
                          ? `Requer Nível ${lvl}`
                          : `Rolar ativação de ${ability.name}`
                      }
                    >
                      <Dices size={12} />
                      <span>{ability.rollFormula || "Ativar"}</span>
                    </button>
                  </div>

                  {/* Gerenciamento do Slot: Editar, Trocar, Desvincular */}
                  <div className="flex items-center gap-1">
                    <button
                      type="button"
                      onClick={() => onEditAbility && onEditAbility(ability)}
                      title="Editar habilidade (re-submete para aprovação do Mestre)"
                      className="flex h-7 w-7 items-center justify-center rounded-lg border border-zinc-800 text-zinc-400 hover:border-zinc-700 hover:text-zinc-200 transition"
                    >
                      <Edit2 size={12} />
                    </button>

                    <button
                      type="button"
                      onClick={() => {
                        setSelectorSearch("");
                        setSelectorLevel(lvl);
                      }}
                      title="Trocar habilidade deste nível"
                      className="flex h-7 w-7 items-center justify-center rounded-lg border border-zinc-800 text-zinc-400 hover:border-amber-500/50 hover:text-amber-300 transition"
                    >
                      <Layers size={12} />
                    </button>

                    <button
                      type="button"
                      onClick={() => onUnassign && onUnassign(lvl)}
                      title={`Desvincular habilidade do Nível ${lvl}`}
                      className="flex h-7 w-7 items-center justify-center rounded-lg border border-zinc-800 text-zinc-400 hover:border-rose-500/50 hover:text-rose-400 transition"
                    >
                      <Trash2 size={12} />
                    </button>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Modal de Seleção de Habilidade para o Nível */}
      {selectorLevel !== null && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-in fade-in duration-200">
          <div className="w-full max-w-lg max-h-[85vh] flex flex-col rounded-2xl border border-zinc-800 bg-zinc-950 p-5 shadow-2xl space-y-4">
            {/* Cabeçalho do Seletor */}
            <div className="flex items-center justify-between border-b border-zinc-800 pb-3">
              <div className="flex items-center gap-2.5">
                <div className="flex h-9 w-9 items-center justify-center rounded-xl border border-amber-500/50 bg-amber-500/20 text-amber-300 font-serif font-bold">
                  {selectorLevel}
                </div>
                <div>
                  <h3 className="font-serif text-base font-bold text-zinc-100">
                    Alocar Habilidade no Nível {selectorLevel}
                  </h3>
                  <p className="text-xs text-zinc-400">
                    Selecione uma técnica do seu grimório ou crie uma nova para este degrau.
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setSelectorLevel(null)}
                className="rounded-lg p-1.5 text-zinc-400 hover:bg-zinc-800 hover:text-zinc-200 transition"
              >
                <X size={18} />
              </button>
            </div>

            {/* Campo de Busca no Seletor */}
            <div className="relative">
              <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500" />
              <input
                type="text"
                value={selectorSearch}
                onChange={(e) => setSelectorSearch(e.target.value)}
                placeholder="Buscar habilidade por nome ou tipo..."
                className="w-full rounded-xl border border-zinc-800 bg-zinc-900 py-2 pl-9 pr-3 text-xs text-zinc-200 placeholder:text-zinc-600 focus:border-amber-500 focus:outline-none"
              />
            </div>

            {/* Lista de Habilidades */}
            <div className="flex-1 overflow-y-auto custom-scroll space-y-2 pr-1 min-h-48 max-h-96">
              {selectorAvailableAbilities.length > 0 ? (
                selectorAvailableAbilities.map((hab) => {
                  const isCurrent = levelAbilities?.[selectorLevel] === hab.id;
                  const isAssignedElsewhere = Object.entries(levelAbilities || {}).find(
                    ([lvl, id]) => id === hab.id && Number(lvl) !== selectorLevel
                  );
                  const isApproved = (hab.approvalStatus || "aprovada") === "aprovada";
                  const isPending = hab.approvalStatus === "pendente";
                  const isRejected = hab.approvalStatus === "rejeitada";

                  return (
                    <div
                      key={hab.id}
                      className={`flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 rounded-xl border p-3 transition ${
                        isCurrent
                          ? "border-amber-500/60 bg-amber-950/30"
                          : "border-zinc-800/80 bg-zinc-900/60 hover:border-zinc-700 hover:bg-zinc-900"
                      }`}
                    >
                      <div className="space-y-1">
                        <div className="flex flex-wrap items-center gap-1.5">
                          <span className="font-serif text-sm font-bold text-zinc-100">
                            {hab.name}
                          </span>
                          <span className="rounded bg-zinc-800 px-1.5 py-0.5 text-[9px] font-bold text-zinc-300">
                            {hab.type}
                          </span>

                          {isPending && (
                            <span className="rounded border border-amber-500/40 bg-amber-950/40 px-1.5 py-0.5 text-[9px] font-bold text-amber-300">
                              Pendente
                            </span>
                          )}
                          {isApproved && (
                            <span className="rounded border border-emerald-500/40 bg-emerald-950/40 px-1.5 py-0.5 text-[9px] font-bold text-emerald-300">
                              Aprovada
                            </span>
                          )}
                          {isRejected && (
                            <span className="rounded border border-rose-500/40 bg-rose-950/40 px-1.5 py-0.5 text-[9px] font-bold text-rose-300">
                              Rejeitada
                            </span>
                          )}
                        </div>

                        {hab.description && (
                          <p className="text-xs text-zinc-400 line-clamp-1">{hab.description}</p>
                        )}

                        {isAssignedElsewhere && (
                          <span className="block text-[10px] text-amber-400/90 italic">
                            * Também alocada no Nível {isAssignedElsewhere[0]}
                          </span>
                        )}
                      </div>

                      {/* Botão de Selecionar */}
                      <button
                        type="button"
                        onClick={() => {
                          if (onAssign) onAssign(selectorLevel, hab.id);
                          setSelectorLevel(null);
                        }}
                        className={`shrink-0 rounded-lg px-3 py-1.5 text-xs font-bold transition active:scale-95 ${
                          isCurrent
                            ? "border border-amber-500/50 bg-amber-500/25 text-amber-300"
                            : "border border-zinc-700 bg-zinc-800 text-zinc-200 hover:border-amber-500 hover:text-amber-300"
                        }`}
                      >
                        {isCurrent ? "Alocada Neste Nível" : "Alocar no Nível " + selectorLevel}
                      </button>
                    </div>
                  );
                })
              ) : (
                <div className="rounded-xl border border-zinc-800 bg-zinc-900/40 p-6 text-center space-y-2">
                  <p className="text-xs text-zinc-400">
                    Nenhuma habilidade encontrada no seu grimório.
                  </p>
                  <p className="text-[11px] text-zinc-600">
                    Como aventureiro, suas habilidades devem ser forjadas por você e submetidas para aprovação do Mestre.
                  </p>
                </div>
              )}
            </div>

            {/* Rodapé do Modal do Seletor */}
            <div className="flex flex-wrap items-center justify-between gap-2 border-t border-zinc-800 pt-3">
              <button
                type="button"
                onClick={() => {
                  const currentLvl = selectorLevel;
                  setSelectorLevel(null);
                  if (onOpenCreateModal) onOpenCreateModal(null, currentLvl, currentLvl);
                }}
                className="flex items-center gap-1.5 rounded-xl border border-primary/40 bg-primary/20 px-3.5 py-2 text-xs font-bold text-primary hover:bg-primary/30 transition active:scale-95"
              >
                <Plus size={14} />
                <span>Forjar Nova Habilidade para Nvl {selectorLevel}</span>
              </button>

              <button
                type="button"
                onClick={() => setSelectorLevel(null)}
                className="rounded-xl border border-zinc-800 bg-zinc-900 px-3.5 py-2 text-xs font-semibold text-zinc-400 hover:text-zinc-200"
              >
                Cancelar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
