"use client";

import { useState, useMemo } from "react";
import {
  Sparkles,
  Plus,
  Search,
  Zap,
  Lock,
  Flame,
  Award,
  Dices,
  Layers,
  Crown,
  BookOpen,
  Filter,
  Clock,
  CheckCircle2,
  XCircle,
  AlertCircle,
  Send,
} from "lucide-react";
import { useCharacter } from "../context/CharacterContext";
import { useDice } from "../context/DiceContext";
import { useAuth } from "../context/AuthContext";
import { Card, SectionHeader } from "../components/ui";
import { AbilityCard } from "../components/habilidades/AbilityCard";
import { AbilityFormModal } from "../components/habilidades/AbilityFormModal";
import { LevelProgressionGrid } from "../components/habilidades/LevelProgressionGrid";
import {
  agruparPorNivel,
  calcularProgressoTreino,
  isHabilidadeDesbloqueada,
} from "../../lib/abilities";

export default function HabilidadesPage() {
  const {
    data,
    addAbility,
    removeAbility,
    updAbility,
    approveAbility,
    rejectAbility,
    trainAbility,
    setAbilityTrainingFocus,
    assignLevelAbility,
    unassignLevelAbility,
    updExtra,
  } = useCharacter();

  const { isMaster } = useAuth();
  const { executeRoll } = useDice();

  const [activeTab, setActiveTab] = useState("por-nivel"); // "por-nivel" | "todas" | "pendentes" | "aprovadas" | "rejeitadas" | "treino" | "magias" | "ativas" | "passivas"
  const [searchTerm, setSearchTerm] = useState("");
  const [modalConfig, setModalConfig] = useState({
    isOpen: false,
    ability: null,
    initialLevel: 1,
    assignToLevel: null,
  });

  const characterLevel = Math.max(1, Number(data.level) || 1);
  const abilities = Array.isArray(data.abilities) ? data.abilities : [];
  const levelAbilities = data.levelAbilities || data.dadosExtras?.levelAbilities || {};

  const peMax = Number(data.dadosExtras?.peMax ?? 10);
  const peCurrent = Number(data.dadosExtras?.peCurrent ?? 10);

  // Habilidade atualmente em foco de treino (apenas habilidades aprovadas)
  const activeTrainingAbility = useMemo(() => {
    return (
      abilities.find(
        (h) => h.isTraining && (h.approvalStatus || "aprovada") === "aprovada"
      ) || null
    );
  }, [abilities]);

  // Contadores
  const stats = useMemo(() => {
    let unlocked = 0;
    let locked = 0;
    let inTraining = 0;
    let pending = 0;
    let rejected = 0;
    let approved = 0;

    for (const h of abilities) {
      const status = h.approvalStatus || "aprovada";
      if (status === "pendente") pending++;
      else if (status === "rejeitada") rejected++;
      else approved++;

      if (isHabilidadeDesbloqueada(h, characterLevel)) {
        unlocked++;
      } else {
        locked++;
      }
      if ((h.trainingHours || 0) > 0 || h.isTraining) {
        inTraining++;
      }
    }

    return { total: abilities.length, unlocked, locked, inTraining, pending, rejected, approved };
  }, [abilities, characterLevel]);

  // Filtros de habilidades
  const filteredAbilities = useMemo(() => {
    return abilities.filter((h) => {
      // Filtro de texto
      const matchesSearch =
        h.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (h.description && h.description.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (h.damageType && h.damageType.toLowerCase().includes(searchTerm.toLowerCase()));

      if (!matchesSearch) return false;

      // Filtro de status de aprovação
      if (activeTab === "pendentes") {
        return (h.approvalStatus || "aprovada") === "pendente";
      }
      if (activeTab === "rejeitadas") {
        return h.approvalStatus === "rejeitada";
      }
      if (activeTab === "aprovadas") {
        return (h.approvalStatus || "aprovada") === "aprovada";
      }

      // Filtro de aba
      if (activeTab === "treino") {
        return (h.trainingHours || 0) > 0 || h.isTraining;
      }
      if (activeTab === "magias") {
        return h.type === "magia";
      }
      if (activeTab === "ativas") {
        return h.type === "ativa";
      }
      if (activeTab === "passivas") {
        return h.type === "passiva" || h.type === "reacao";
      }

      return true;
    });
  }, [abilities, searchTerm, activeTab]);

  // Agrupamento por nível para a aba "por-nivel"
  const gruposNivel = useMemo(() => {
    return agruparPorNivel(
      abilities.filter((h) =>
        h.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (h.description && h.description.toLowerCase().includes(searchTerm.toLowerCase()))
      ),
      characterLevel
    );
  }, [abilities, characterLevel, searchTerm]);

  // Rolar teste de treino (teste d20 de atributo que concede horas bônus de treino)
  const handleRollTrainingSession = () => {
    if (!activeTrainingAbility || (activeTrainingAbility.approvalStatus || "aprovada") !== "aprovada") {
      alert("Apenas habilidades aprovadas pelo Mestre podem ser treinadas.");
      return;
    }

    const attrKey = activeTrainingAbility.attr || "ESP";
    const attrVal = data[attrKey] ?? 10;
    const attrMod = Math.floor((attrVal - 10) / 2);

    const roll = executeRoll({
      sides: 20,
      mode: "normal",
      modifier: attrMod,
      label: `Sessão de Treino: ${activeTrainingAbility.name} (Teste de ${attrKey})`,
    });

    // Horas ganhas baseadas no resultado do teste
    // Crítico 20: 5h, 15+: 3h, 10+: 2h, <10: 1h
    let horasGanhas = 1;
    if (roll.naturalRoll === 20 || roll.total >= 20) {
      horasGanhas = 5;
    } else if (roll.total >= 15) {
      horasGanhas = 3;
    } else if (roll.total >= 10) {
      horasGanhas = 2;
    }

    trainAbility(activeTrainingAbility.id, horasGanhas);
  };

  const handleOpenCreateModal = (ability = null, initialLevel = 1, assignToLevel = null) => {
    setModalConfig({
      isOpen: true,
      ability: ability || null,
      initialLevel: initialLevel || 1,
      assignToLevel: assignToLevel || null,
    });
  };

  const handleOpenEditModal = (ability) => {
    setModalConfig({
      isOpen: true,
      ability,
      initialLevel: ability?.reqLevel || 1,
      assignToLevel: null,
    });
  };

  const handleSaveAbility = (abilityData) => {
    if (modalConfig.ability) {
      updAbility(modalConfig.ability.id, abilityData, isMaster);
    } else {
      addAbility(abilityData, isMaster);
    }
  };

  const handleDeleteAbility = (id) => {
    if (confirm("Deseja realmente remover esta habilidade?")) {
      removeAbility(id);
    }
  };

  return (
    <div className="space-y-5">
      {/* Banner Principal no Estilo Dark Fantasy */}
      <Card className="bg-gradient-to-br from-card via-card/85 to-amber-950/20 p-5 sm:p-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <div className="mb-2 flex items-center gap-2 text-[10px] font-semibold uppercase tracking-[0.25em] text-primary">
              <Crown size={13} />
              Grimório do Herói & Evolução
            </div>
            <h1 className="font-serif text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
              Habilidades & Treinamento
            </h1>
            <p className="mt-1 text-xs text-muted-foreground">
              Desperte técnicas arcanas, artes marciais por nível e aperfeiçoe sua maestria através do treino.
            </p>
          </div>

          {/* Badges de Nível e PE */}
          <div className="flex flex-wrap items-center gap-2 sm:justify-end">
            <div className="rounded-xl border border-white/10 bg-background/50 px-3 py-2 text-center">
              <span className="block text-[10px] uppercase tracking-wider text-muted-foreground">
                Nível do Herói
              </span>
              <span className="font-serif text-lg font-bold text-amber-400">
                Nível {characterLevel}
              </span>
            </div>

            <div className="rounded-xl border border-white/10 bg-background/50 px-3 py-2 text-center">
              <span className="block text-[10px] uppercase tracking-wider text-muted-foreground">
                Energia (PE)
              </span>
              <span className="font-mono text-lg font-bold text-sky-400">
                {peCurrent} / {peMax}
              </span>
            </div>

            <button
              type="button"
              onClick={handleOpenCreateModal}
              className="flex items-center gap-2 rounded-xl border border-primary/50 bg-primary/20 px-4 py-2.5 text-xs font-bold text-primary shadow-lg transition hover:bg-primary/30 active:scale-95"
            >
              <Plus size={15} />
              <span>{isMaster ? "Forjar Habilidade" : "Propor Nova Habilidade"}</span>
            </button>
          </div>
        </div>

        {/* Resumo Rápido de Estatísticas */}
        <div className="mt-4 flex flex-wrap items-center gap-3 border-t border-white/10 pt-3 text-xs">
          <span className="text-muted-foreground">
            Total de Habilidades: <strong className="text-foreground">{stats.total}</strong>
          </span>
          <span className="text-emerald-400">
            • Aprovadas: <strong>{stats.approved}</strong>
          </span>
          {stats.pending > 0 && (
            <span className="text-amber-400 font-bold flex items-center gap-1">
              • Pendentes: <strong>{stats.pending}</strong>
            </span>
          )}
          {stats.rejected > 0 && (
            <span className="text-rose-400 font-bold flex items-center gap-1">
              • Rejeitadas: <strong>{stats.rejected}</strong>
            </span>
          )}
          <span className="text-sky-400">
            • Em Treino: <strong>{stats.inTraining}</strong>
          </span>
          {stats.locked > 0 && (
            <span className="text-zinc-500">
              • Bloqueadas por Nível: <strong>{stats.locked}</strong>
            </span>
          )}
        </div>
      </Card>

      {/* Alerta / Banner de Moderação de Habilidades Pendentes */}
      {stats.pending > 0 && (
        <div
          className={`flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 rounded-2xl border p-4 shadow-lg backdrop-blur-sm ${
            isMaster
              ? "border-amber-500/50 bg-amber-950/40 text-amber-200"
              : "border-amber-500/30 bg-amber-950/20 text-amber-300"
          }`}
        >
          <div className="flex items-center gap-3">
            <div
              className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border ${
                isMaster
                  ? "border-amber-500/50 bg-amber-500/20 text-amber-400"
                  : "border-amber-500/30 bg-amber-500/10 text-amber-400"
              }`}
            >
              {isMaster ? <Crown size={18} /> : <Clock size={18} />}
            </div>
            <div>
              <h4 className="font-serif text-sm font-bold text-amber-300">
                {isMaster
                  ? `Moderação do Mestre: ${stats.pending} ${
                      stats.pending === 1 ? "Solicitação Pendente" : "Solicitações Pendentes"
                    }`
                  : `Aguardando Avaliação: ${stats.pending} ${
                      stats.pending === 1 ? "Habilidade Pendente" : "Habilidades Pendentes"
                    }`}
              </h4>
              <p className="text-xs text-muted-foreground mt-0.5">
                {isMaster
                  ? "O jogador enviou propostas de habilidades que requerem seu parecer, balanceamento ou aprovação."
                  : "Suas propostas foram enviadas ao Mestre e aguardam revisão antes da liberação nos combates."}
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={() => setActiveTab("pendentes")}
            className="self-start sm:self-center shrink-0 rounded-xl border border-amber-500/60 bg-amber-500/25 px-3 py-1.5 text-xs font-bold text-amber-200 hover:bg-amber-500/40 transition active:scale-95"
          >
            Ver Pendentes ({stats.pending})
          </button>
        </div>
      )}

      {/* Banner de Destaque: Foco de Treino Ativo */}
      {activeTrainingAbility && (
        <Card className="border-amber-500/40 bg-gradient-to-r from-amber-950/20 via-zinc-950/80 to-zinc-950/80 p-4">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-start gap-3">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-amber-500/50 bg-amber-500/20 text-amber-400 shadow-[0_0_12px_rgba(245,158,11,0.25)]">
                <Award size={20} />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-amber-400">
                    🎯 Habilidade em Foco de Treinamento
                  </span>
                  <span className="rounded bg-amber-500/20 px-1.5 py-0.5 text-[9px] font-bold text-amber-300">
                    {activeTrainingAbility.type}
                  </span>
                </div>
                <h3 className="font-serif text-base font-bold text-zinc-100">
                  {activeTrainingAbility.name}
                </h3>
                <p className="text-xs text-zinc-400 line-clamp-1">
                  {activeTrainingAbility.description}
                </p>
              </div>
            </div>

            {/* Ações de Treino */}
            <div className="flex flex-wrap items-center gap-2">
              <button
                type="button"
                onClick={() => trainAbility(activeTrainingAbility.id, 1)}
                className="flex items-center gap-1.5 rounded-lg border border-zinc-700 bg-zinc-800 px-3 py-2 text-xs font-bold text-zinc-200 transition hover:border-amber-500 hover:text-amber-300 active:scale-95"
              >
                +1h Treino
              </button>
              <button
                type="button"
                onClick={() => trainAbility(activeTrainingAbility.id, 5)}
                className="flex items-center gap-1.5 rounded-lg border border-zinc-700 bg-zinc-800 px-3 py-2 text-xs font-bold text-zinc-200 transition hover:border-amber-500 hover:text-amber-300 active:scale-95"
              >
                +5h Intenso
              </button>
              <button
                type="button"
                onClick={handleRollTrainingSession}
                title="Rola um teste de atributo para simular uma sessão de treino e conceder progresso proporcional ao resultado"
                className="flex items-center gap-1.5 rounded-lg border border-amber-500/60 bg-amber-500/25 px-3 py-2 text-xs font-bold text-amber-300 transition hover:bg-amber-500/35 active:scale-95 shadow-sm"
              >
                <Dices size={14} />
                <span>Rolar Sessão de Treino</span>
              </button>
            </div>
          </div>
        </Card>
      )}

      {/* Controles de Navegação e Busca */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        {/* Abas de Filtro */}
        <div className="flex flex-wrap items-center gap-1.5 rounded-xl border border-zinc-800 bg-zinc-950/60 p-1">
          {/* Aba de Destaque: Níveis 1 ao 20 */}
          <button
            type="button"
            onClick={() => setActiveTab("por-nivel")}
            className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-semibold transition ${
              activeTab === "por-nivel"
                ? "bg-amber-500/25 text-amber-300 border border-amber-500/50 shadow-sm"
                : "text-zinc-300 hover:text-amber-300"
            }`}
          >
            <Layers size={13} />
            <span>Níveis 1 a 20</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab("todas")}
            className={`rounded-lg px-3 py-1.5 text-xs font-medium transition ${
              activeTab === "todas"
                ? "bg-amber-500/20 text-amber-300 shadow-sm"
                : "text-zinc-400 hover:text-zinc-200"
            }`}
          >
            Todas ({abilities.length})
          </button>

          {/* Aba de Pendentes com Contador */}
          <button
            type="button"
            onClick={() => setActiveTab("pendentes")}
            className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-medium transition ${
              activeTab === "pendentes"
                ? "bg-amber-500/25 text-amber-300 border border-amber-500/50 shadow-sm font-bold"
                : "text-zinc-400 hover:text-zinc-200"
            }`}
          >
            <Clock size={12} />
            <span>Pendentes</span>
            {stats.pending > 0 && (
              <span className="rounded-full bg-amber-500/30 px-1.5 py-0.2 text-[10px] font-bold text-amber-300 animate-pulse">
                {stats.pending}
              </span>
            )}
          </button>

          {/* Aba de Aprovadas */}
          <button
            type="button"
            onClick={() => setActiveTab("aprovadas")}
            className={`flex items-center gap-1 rounded-lg px-3 py-1.5 text-xs font-medium transition ${
              activeTab === "aprovadas"
                ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 shadow-sm font-bold"
                : "text-zinc-400 hover:text-zinc-200"
            }`}
          >
            <CheckCircle2 size={12} />
            <span>Aprovadas ({stats.approved})</span>
          </button>

          {/* Aba de Rejeitadas (se houver) */}
          {stats.rejected > 0 && (
            <button
              type="button"
              onClick={() => setActiveTab("rejeitadas")}
              className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-medium transition ${
                activeTab === "rejeitadas"
                  ? "bg-rose-500/20 text-rose-300 border border-rose-500/40 shadow-sm font-bold"
                  : "text-rose-400/70 hover:text-rose-300"
              }`}
            >
              <XCircle size={12} />
              <span>Rejeitadas ({stats.rejected})</span>
            </button>
          )}

          <button
            type="button"
            onClick={() => setActiveTab("treino")}
            className={`flex items-center gap-1 rounded-lg px-3 py-1.5 text-xs font-medium transition ${
              activeTab === "treino"
                ? "bg-amber-500/20 text-amber-300 shadow-sm"
                : "text-zinc-400 hover:text-zinc-200"
            }`}
          >
            <Award size={13} />
            Em Treino ({stats.inTraining})
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("magias")}
            className={`rounded-lg px-3 py-1.5 text-xs font-medium transition ${
              activeTab === "magias"
                ? "bg-amber-500/20 text-amber-300 shadow-sm"
                : "text-zinc-400 hover:text-zinc-200"
            }`}
          >
            Magias & Sinais
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("ativas")}
            className={`rounded-lg px-3 py-1.5 text-xs font-medium transition ${
              activeTab === "ativas"
                ? "bg-amber-500/20 text-amber-300 shadow-sm"
                : "text-zinc-400 hover:text-zinc-200"
            }`}
          >
            Ações
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("passivas")}
            className={`rounded-lg px-3 py-1.5 text-xs font-medium transition ${
              activeTab === "passivas"
                ? "bg-amber-500/20 text-amber-300 shadow-sm"
                : "text-zinc-400 hover:text-zinc-200"
            }`}
          >
            Passivas & Reações
          </button>
        </div>

        {/* Campo de Busca */}
        <div className="relative min-w-64">
          <Search
            size={14}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500"
          />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Buscar por nome, elemento ou dano..."
            className="w-full rounded-xl border border-zinc-800 bg-zinc-950/80 py-2 pl-9 pr-3 text-xs text-zinc-200 placeholder:text-zinc-600 focus:border-amber-500 focus:outline-none"
          />
        </div>
      </div>

      {/* Conteúdo Principal: Exibição por Nível OU Grade Padrão */}
      {activeTab === "por-nivel" ? (
        <LevelProgressionGrid
          characterLevel={characterLevel}
          abilities={abilities}
          levelAbilities={levelAbilities}
          isMaster={isMaster}
          onAssign={assignLevelAbility}
          onUnassign={unassignLevelAbility}
          onOpenCreateModal={(ability, initialLevel, assignToLevel) =>
            handleOpenCreateModal(ability, initialLevel, assignToLevel)
          }
          onEditAbility={handleOpenEditModal}
          onTrain={trainAbility}
        />
      ) : (
        /* Visualização em Grade Padrão */
        <div>
          {filteredAbilities.length > 0 ? (
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
              {filteredAbilities.map((ability) => (
                <AbilityCard
                  key={ability.id}
                  ability={ability}
                  characterLevel={characterLevel}
                  isMaster={isMaster}
                  onEdit={handleOpenEditModal}
                  onDelete={handleDeleteAbility}
                  onTrain={trainAbility}
                  onToggleTraining={setAbilityTrainingFocus}
                  onApprove={approveAbility}
                  onReject={rejectAbility}
                />
              ))}
            </div>
          ) : (
            <div className="rounded-2xl border border-zinc-800 bg-zinc-950/40 p-12 text-center text-zinc-500 space-y-3">
              <BookOpen size={36} className="mx-auto text-zinc-600" />
              <div className="space-y-1">
                <p className="text-sm font-semibold text-zinc-300">
                  Nenhuma habilidade encontrada neste filtro.
                </p>
                <p className="text-xs text-zinc-500 max-w-md mx-auto">
                  Como jogador, você deve forjar suas habilidades e submetê-las para análise do Mestre.
                  Após aprovadas, você poderá treiná-las e utilizá-las em combate.
                </p>
              </div>

              <div className="flex flex-wrap items-center justify-center gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => handleOpenCreateModal(null, characterLevel)}
                  className="flex items-center gap-1.5 rounded-xl border border-primary/40 bg-primary/20 px-3.5 py-2 text-xs font-bold text-primary hover:bg-primary/30 transition active:scale-95"
                >
                  <Plus size={14} />
                  <span>{isMaster ? "Forjar Nova Habilidade" : "Propor Nova Habilidade"}</span>
                </button>
                <button
                  type="button"
                  onClick={() => setActiveTab("por-nivel")}
                  className="flex items-center gap-1.5 rounded-xl border border-zinc-800 bg-zinc-900 px-3.5 py-2 text-xs font-semibold text-zinc-300 hover:text-amber-300 transition"
                >
                  <Layers size={14} />
                  <span>Acessar Progressão Nível 1 a 20</span>
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Modal de Criação / Edição */}
      <AbilityFormModal
        isOpen={modalConfig.isOpen}
        ability={modalConfig.ability}
        initialLevel={modalConfig.initialLevel}
        assignToLevel={modalConfig.assignToLevel}
        isMaster={isMaster}
        onClose={() => setModalConfig((prev) => ({ ...prev, isOpen: false }))}
        onSave={handleSaveAbility}
      />
    </div>
  );
}
