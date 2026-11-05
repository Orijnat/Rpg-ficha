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
} from "lucide-react";
import { useCharacter } from "../context/CharacterContext";
import { useDice } from "../context/DiceContext";
import { Card, SectionHeader } from "../components/ui";
import { AbilityCard } from "../components/habilidades/AbilityCard";
import { AbilityFormModal } from "../components/habilidades/AbilityFormModal";
import {
  DEFAULT_ABILITIES,
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
    trainAbility,
    setAbilityTrainingFocus,
    updExtra,
  } = useCharacter();

  const { executeRoll } = useDice();

  const [activeTab, setActiveTab] = useState("todas"); // "todas" | "por-nivel" | "treino" | "magias" | "ativas" | "passivas"
  const [searchTerm, setSearchTerm] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingAbility, setEditingAbility] = useState(null);

  const characterLevel = Math.max(1, Number(data.level) || 1);
  const abilities = data.abilities && data.abilities.length > 0 ? data.abilities : DEFAULT_ABILITIES;

  const peMax = Number(data.dadosExtras?.peMax ?? 10);
  const peCurrent = Number(data.dadosExtras?.peCurrent ?? 10);

  // Habilidade atualmente em foco de treino
  const activeTrainingAbility = useMemo(() => {
    return abilities.find((h) => h.isTraining) || null;
  }, [abilities]);

  // Contadores
  const stats = useMemo(() => {
    let unlocked = 0;
    let locked = 0;
    let inTraining = 0;

    for (const h of abilities) {
      if (isHabilidadeDesbloqueada(h, characterLevel)) {
        unlocked++;
      } else {
        locked++;
      }
      if ((h.trainingHours || 0) > 0 || h.isTraining) {
        inTraining++;
      }
    }

    return { total: abilities.length, unlocked, locked, inTraining };
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
    if (!activeTrainingAbility) return;

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

  const handleOpenCreateModal = () => {
    setEditingAbility(null);
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (ability) => {
    setEditingAbility(ability);
    setIsModalOpen(true);
  };

  const handleSaveAbility = (abilityData) => {
    if (editingAbility) {
      updAbility(editingAbility.id, abilityData);
    } else {
      addAbility(abilityData);
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
              <span>Nova Habilidade</span>
            </button>
          </div>
        </div>

        {/* Resumo Rápido de Estatísticas */}
        <div className="mt-4 flex flex-wrap items-center gap-3 border-t border-white/10 pt-3 text-xs">
          <span className="text-muted-foreground">
            Total de Habilidades: <strong className="text-foreground">{stats.total}</strong>
          </span>
          <span className="text-emerald-400">
            • Desbloqueadas: <strong>{stats.unlocked}</strong>
          </span>
          <span className="text-amber-400">
            • Em Treino: <strong>{stats.inTraining}</strong>
          </span>
          {stats.locked > 0 && (
            <span className="text-zinc-500">
              • Bloqueadas por Nível: <strong>{stats.locked}</strong>
            </span>
          )}
        </div>
      </Card>

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
          <button
            type="button"
            onClick={() => setActiveTab("por-nivel")}
            className={`flex items-center gap-1 rounded-lg px-3 py-1.5 text-xs font-medium transition ${
              activeTab === "por-nivel"
                ? "bg-amber-500/20 text-amber-300 shadow-sm"
                : "text-zinc-400 hover:text-zinc-200"
            }`}
          >
            <Layers size={13} />
            Por Nível
          </button>
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
            Em Treinamento ({stats.inTraining})
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
        <div className="space-y-6">
          {gruposNivel.map((grupo) => (
            <div key={grupo.nivel} className="space-y-3">
              {/* Cabeçalho da Faixa de Nível */}
              <div className="flex items-center gap-3">
                <div
                  className={`flex h-8 w-8 items-center justify-center rounded-xl border font-serif text-sm font-bold ${
                    grupo.desbloqueado
                      ? "border-amber-500/60 bg-amber-500/20 text-amber-300"
                      : "border-zinc-800 bg-zinc-900 text-zinc-500"
                  }`}
                >
                  {grupo.nivel}
                </div>
                <div className="flex items-center gap-2">
                  <h2 className="font-serif text-base font-bold text-zinc-200">
                    Nível {grupo.nivel}
                  </h2>
                  <span
                    className={`rounded-md border px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider ${
                      grupo.desbloqueado
                        ? "border-emerald-500/40 bg-emerald-950/40 text-emerald-300"
                        : "border-zinc-800 bg-zinc-900/60 text-zinc-500"
                    }`}
                  >
                    {grupo.desbloqueado
                      ? "Poderes Despertados"
                      : `Requer Nível ${grupo.nivel}`}
                  </span>
                </div>
                <div className="h-px flex-1 bg-zinc-800/80" />
              </div>

              {/* Grid de Habilidades daquele Nível */}
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
                {grupo.habilidades.map((ability) => (
                  <AbilityCard
                    key={ability.id}
                    ability={ability}
                    characterLevel={characterLevel}
                    onEdit={handleOpenEditModal}
                    onDelete={handleDeleteAbility}
                    onTrain={trainAbility}
                    onToggleTraining={setAbilityTrainingFocus}
                  />
                ))}
              </div>
            </div>
          ))}

          {gruposNivel.length === 0 && (
            <div className="rounded-2xl border border-zinc-800 bg-zinc-950/40 p-12 text-center text-zinc-500">
              <p className="text-sm">Nenhuma habilidade encontrada para o termo pesquisado.</p>
            </div>
          )}
        </div>
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
                  onEdit={handleOpenEditModal}
                  onDelete={handleDeleteAbility}
                  onTrain={trainAbility}
                  onToggleTraining={setAbilityTrainingFocus}
                />
              ))}
            </div>
          ) : (
            <div className="rounded-2xl border border-zinc-800 bg-zinc-950/40 p-12 text-center text-zinc-500 space-y-2">
              <BookOpen size={32} className="mx-auto text-zinc-600" />
              <p className="text-sm font-medium">Nenhuma habilidade encontrada.</p>
              <p className="text-xs text-zinc-600">
                Altere os filtros de busca ou crie uma nova habilidade clicando no botão acima.
              </p>
            </div>
          )}
        </div>
      )}

      {/* Modal de Criação / Edição */}
      <AbilityFormModal
        isOpen={isModalOpen}
        ability={editingAbility}
        onClose={() => setIsModalOpen(false)}
        onSave={handleSaveAbility}
      />
    </div>
  );
}
