"use client";

import React, { useMemo, useState } from "react";
import {
  Check,
  Dices,
  Filter,
  Search,
  Sparkles,
  X,
  Plus,
  Minus,
  RotateCcw,
  BookOpen,
} from "lucide-react";
import { SectionHeader } from "./ui";
import { useCharacter } from "../context/CharacterContext";
import { useDice } from "../context/DiceContext";
import {
  calculateSkillBonus,
  calculateModifier,
  ensureCanonicalSkills,
  DEFAULT_SKILLS,
  ATTRIBUTES,
  ATTRIBUTE_LABELS,
} from "../../lib/modifiers";

// Cores temáticas para cada atributo base
const ATTR_BADGES = {
  FOR: {
    label: "Força",
    border: "border-rose-500/30",
    text: "text-rose-300",
    bg: "bg-rose-500/10",
    activeBg: "bg-rose-500/20",
  },
  DES: {
    label: "Destreza",
    border: "border-amber-500/30",
    text: "text-amber-300",
    bg: "bg-amber-500/10",
    activeBg: "bg-amber-500/20",
  },
  CON: {
    label: "Constituição",
    border: "border-orange-500/30",
    text: "text-orange-300",
    bg: "bg-orange-500/10",
    activeBg: "bg-orange-500/20",
  },
  SAB: {
    label: "Sabedoria",
    border: "border-emerald-500/30",
    text: "text-emerald-300",
    bg: "bg-emerald-500/10",
    activeBg: "bg-emerald-500/20",
  },
  ESP: {
    label: "Espírito",
    border: "border-cyan-500/30",
    text: "text-cyan-300",
    bg: "bg-cyan-500/10",
    activeBg: "bg-cyan-500/20",
  },
  CAR: {
    label: "Carisma",
    border: "border-fuchsia-500/30",
    text: "text-fuchsia-300",
    bg: "bg-fuchsia-500/10",
    activeBg: "bg-fuchsia-500/20",
  },
  INT: {
    label: "Inteligência",
    border: "border-blue-500/30",
    text: "text-blue-300",
    bg: "bg-blue-500/10",
    activeBg: "bg-blue-500/20",
  },
};

export default function Pericia() {
  const { data, updSkill, toggleSkillTrained, setSkills } = useCharacter();
  const { promptRoll } = useDice();

  const [searchQuery, setSearchQuery] = useState("");
  const [selectedAttr, setSelectedAttr] = useState("TODOS");
  const [statusFilter, setStatusFilter] = useState("all"); // 'all' | 'trained' | 'untrained'
  const [editingBonusSkill, setEditingBonusSkill] = useState(null);

  // Garante que todas as 19 perícias canônicas existam na lista
  const canonicalSkills = useMemo(() => {
    return ensureCanonicalSkills(data.skills);
  }, [data.skills]);

  // Se o estado atual do personagem tiver menos que 19 perícias, sincroniza suavemente
  React.useEffect(() => {
    if (!Array.isArray(data.skills) || data.skills.length < DEFAULT_SKILLS.length) {
      setSkills(canonicalSkills);
    }
  }, [data.skills, canonicalSkills, setSkills]);

  // Bônus de proficiência/bravura do personagem (BP) ou padrão +2
  const proficiencyBonus = Math.max(2, Number(data.dadosExtras?.bpCurrent || 2));

  // Estatísticas de perícias
  const totalCount = canonicalSkills.length;
  const trainedCount = canonicalSkills.filter((s) => s.trained).length;

  // Filtragem de perícias
  const filteredSkills = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    return canonicalSkills
      .map((skill, originalIndex) => ({ skill, originalIndex }))
      .filter(({ skill }) => {
        // Filtro por Atributo
        if (selectedAttr !== "TODOS" && skill.attr !== selectedAttr) {
          return false;
        }
        // Filtro por Status
        if (statusFilter === "trained" && !skill.trained) {
          return false;
        }
        if (statusFilter === "untrained" && skill.trained) {
          return false;
        }
        // Filtro por Busca de Texto
        if (q) {
          const matchName = skill.name.toLowerCase().includes(q);
          const matchAttr = (skill.attr || "").toLowerCase().includes(q);
          const matchAttrFull = (ATTRIBUTE_LABELS[skill.attr] || "").toLowerCase().includes(q);
          return matchName || matchAttr || matchAttrFull;
        }
        return true;
      });
  }, [canonicalSkills, selectedAttr, statusFilter, searchQuery]);

  // Alterna o treinamento de uma perícia
  const handleToggleTrained = (index, currentTrained) => {
    updSkill(index, { trained: !currentTrained });
  };

  // Atualiza bônus customizado
  const handleUpdateBonus = (index, newBonus) => {
    const num = newBonus === "" || newBonus === null ? null : Number(newBonus);
    updSkill(index, { bonus: isNaN(num) ? null : num });
  };

  // Ações em massa para o filtro atual
  const handleSelectAllVisible = () => {
    filteredSkills.forEach(({ originalIndex, skill }) => {
      if (!skill.trained) {
        updSkill(originalIndex, { trained: true });
      }
    });
  };

  const handleClearAllVisible = () => {
    filteredSkills.forEach(({ originalIndex, skill }) => {
      if (skill.trained) {
        updSkill(originalIndex, { trained: false });
      }
    });
  };

  return (
    <div className="space-y-3.5">
      {/* Cabeçalho da Seção com Resumo e Estatísticas */}
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between border-b border-white/10 pb-3">
        <SectionHeader
          title="Perícias do Sistema (d20)"
          icon={<Dices size={16} className="text-primary" />}
        />
        <div className="flex items-center gap-2 text-xs">
          <span className="rounded-full border border-primary/30 bg-primary/10 px-2.5 py-0.5 font-mono text-[11px] font-bold text-primary">
            {trainedCount} de {totalCount} Treinadas
          </span>
          <span className="text-[11px] text-muted-foreground hidden sm:inline">
            (Bônus Base: +{proficiencyBonus})
          </span>
        </div>
      </div>

      {/* Controles de Busca e Filtros Rápidos */}
      <div className="space-y-2">
        {/* Barra de Pesquisa */}
        <div className="relative">
          <Search
            size={14}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground"
          />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Buscar perícia por nome ou atributo (ex: Furtividade, INT, FOR)..."
            className="w-full rounded-xl border border-white/10 bg-background/60 py-2 pl-9 pr-8 text-xs text-foreground placeholder:text-muted-foreground/60 focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
          />
          {searchQuery && (
            <button
              type="button"
              onClick={() => setSearchQuery("")}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 rounded p-1 text-muted-foreground hover:text-foreground"
              aria-label="Limpar busca"
            >
              <X size={12} />
            </button>
          )}
        </div>

        {/* Filtros por Atributo (Tabs Horizontais com Scroll no Mobile) */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-[11px] custom-scroll">
          <button
            type="button"
            onClick={() => setSelectedAttr("TODOS")}
            className={`shrink-0 rounded-lg px-2.5 py-1 font-semibold transition ${
              selectedAttr === "TODOS"
                ? "bg-primary text-primary-foreground shadow-sm"
                : "border border-white/10 bg-background/40 text-muted-foreground hover:text-foreground hover:border-white/20"
            }`}
          >
            Todas ({totalCount})
          </button>

          {ATTRIBUTES.map((attr) => {
            const attrMeta = ATTR_BADGES[attr] || {};
            const skillsInAttr = canonicalSkills.filter((s) => s.attr === attr);
            const trainedInAttr = skillsInAttr.filter((s) => s.trained).length;
            const isSelected = selectedAttr === attr;

            return (
              <button
                key={attr}
                type="button"
                onClick={() => setSelectedAttr(attr)}
                className={`flex shrink-0 items-center gap-1 rounded-lg px-2.5 py-1 font-mono text-xs transition ${
                  isSelected
                    ? `${attrMeta.activeBg || "bg-primary/20"} ${attrMeta.text || "text-primary"} border ${attrMeta.border || "border-primary"} font-bold`
                    : "border border-white/10 bg-background/40 text-muted-foreground hover:text-foreground"
                }`}
                title={`Filtrar por ${ATTRIBUTE_LABELS[attr] || attr}`}
              >
                <span>{attr}</span>
                <span className="text-[10px] opacity-75">
                  ({trainedInAttr}/{skillsInAttr.length})
                </span>
              </button>
            );
          })}
        </div>

        {/* Filtro de Treinamento e Ações Rápidas */}
        <div className="flex flex-wrap items-center justify-between gap-2 pt-1 text-xs">
          <div className="flex items-center gap-1">
            <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground mr-1">
              Exibir:
            </span>
            <button
              type="button"
              onClick={() => setStatusFilter("all")}
              className={`rounded-md px-2 py-0.5 text-[11px] font-medium transition ${
                statusFilter === "all"
                  ? "bg-white/15 text-foreground font-semibold"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              Todas
            </button>
            <button
              type="button"
              onClick={() => setStatusFilter("trained")}
              className={`rounded-md px-2 py-0.5 text-[11px] font-medium transition ${
                statusFilter === "trained"
                  ? "bg-emerald-500/20 text-emerald-300 font-semibold border border-emerald-500/40"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              Treinadas ({trainedCount})
            </button>
            <button
              type="button"
              onClick={() => setStatusFilter("untrained")}
              className={`rounded-md px-2 py-0.5 text-[11px] font-medium transition ${
                statusFilter === "untrained"
                  ? "bg-amber-500/20 text-amber-300 font-semibold border border-amber-500/40"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              Não Treinadas ({totalCount - trainedCount})
            </button>
          </div>

          {/* Ações em Lote dos Visíveis */}
          <div className="flex items-center gap-1.5">
            <button
              type="button"
              onClick={handleSelectAllVisible}
              className="text-[10px] font-semibold text-primary underline underline-offset-2 hover:text-primary/80"
              title="Marcar todas as perícias listadas como treinadas"
            >
              Treinar todas
            </button>
            <span className="text-muted-foreground text-[10px]">·</span>
            <button
              type="button"
              onClick={handleClearAllVisible}
              className="text-[10px] font-semibold text-muted-foreground hover:text-foreground"
              title="Desmarcar treinamento das perícias listadas"
            >
              Limpar
            </button>
          </div>
        </div>
      </div>

      {/* Lista de Perícias Disponíveis */}
      <div className="custom-scroll max-h-[440px] space-y-1.5 overflow-y-auto pr-1">
        {filteredSkills.length === 0 ? (
          <div className="rounded-xl border border-dashed border-white/15 p-6 text-center text-muted-foreground">
            <BookOpen size={24} className="mx-auto mb-2 opacity-50" />
            <p className="text-xs font-semibold">Nenhuma perícia encontrada com esses filtros.</p>
            <button
              type="button"
              onClick={() => {
                setSearchQuery("");
                setSelectedAttr("TODOS");
                setStatusFilter("all");
              }}
              className="mt-2 text-xs font-semibold text-primary underline underline-offset-2"
            >
              Redefinir filtros
            </button>
          </div>
        ) : (
          filteredSkills.map(({ skill, originalIndex }) => {
            const skillInfo = calculateSkillBonus(skill, data, proficiencyBonus);
            const attrMeta = ATTR_BADGES[skill.attr] || {
              border: "border-white/20",
              text: "text-foreground",
              bg: "bg-white/5",
            };
            const attrMod = calculateModifier(data[skill.attr] ?? 10);
            const isEditingBonus = editingBonusSkill === skill.name;

            return (
              <div
                key={skill.name}
                className={`group flex items-center justify-between rounded-xl border p-2.5 transition-all ${
                  skill.trained
                    ? "border-primary/40 bg-card/90 shadow-sm hover:border-primary/60 hover:bg-card"
                    : "border-white/5 bg-background/40 hover:border-white/15 hover:bg-white/[0.02]"
                }`}
              >
                {/* Lado Esquerdo: Checkbox de Seleção / Treinamento + Nome + Badge Atributo */}
                <div className="flex items-center gap-2.5 min-w-0 flex-1">
                  {/* Botão de Selecionar / Treinar */}
                  <button
                    type="button"
                    role="checkbox"
                    aria-checked={skill.trained}
                    aria-label={`Perícia ${skill.name} (${skill.attr}): ${
                      skill.trained ? "treinada" : "não treinada"
                    }`}
                    onClick={() => handleToggleTrained(originalIndex, skill.trained)}
                    className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-lg border transition-all active:scale-95 ${
                      skill.trained
                        ? "border-primary bg-primary text-primary-foreground shadow-md shadow-primary/20"
                        : "border-white/20 bg-background/60 hover:border-primary/60 text-transparent"
                    }`}
                    title={
                      skill.trained
                        ? "Perícia Treinada (clique para desmarcar)"
                        : "Clique para selecionar e treinar esta perícia"
                    }
                  >
                    <Check size={13} strokeWidth={3} className={skill.trained ? "opacity-100" : "opacity-0"} />
                  </button>

                  {/* Nome da Perícia & Informações de Decomposição */}
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <span
                        className={`truncate text-xs font-semibold transition-colors ${
                          skill.trained ? "text-foreground" : "text-muted-foreground"
                        }`}
                      >
                        {skill.name}
                      </span>

                      {/* Badge do Atributo Base */}
                      <span
                        className={`shrink-0 rounded px-1.5 py-0.2 font-mono text-[10px] font-bold uppercase ${attrMeta.bg} ${attrMeta.text} border ${attrMeta.border}`}
                        title={`${ATTRIBUTE_LABELS[skill.attr] || skill.attr}: ${data[skill.attr] ?? 10} (Modificador: ${attrMod >= 0 ? "+" + attrMod : attrMod})`}
                      >
                        {skill.attr} {attrMod >= 0 ? `+${attrMod}` : attrMod}
                      </span>

                      {/* Badge de Treinada */}
                      {skill.trained && (
                        <span className="hidden sm:inline rounded bg-primary/15 border border-primary/30 px-1.5 py-0.2 text-[9px] font-bold text-primary">
                          Treinada (+{proficiencyBonus})
                        </span>
                      )}
                    </div>

                    {/* Linha explicativa da fórmula */}
                    <div className="text-[10px] text-muted-foreground/75 mt-0.5 flex items-center gap-1">
                      <span>Mod {attrMod >= 0 ? `+${attrMod}` : attrMod}</span>
                      {skill.trained && <span>+ Treino {proficiencyBonus}</span>}
                      {typeof skill.bonus === "number" && (
                        <span className="text-amber-300 font-semibold">
                          + Extra {skill.bonus >= 0 ? `+${skill.bonus}` : skill.bonus}
                        </span>
                      )}
                      <span>= Total {skillInfo.formatted}</span>
                    </div>
                  </div>
                </div>

                {/* Lado Direito: Bônus Customizado Opcional + Gatilho de Rolagem d20 */}
                <div className="flex items-center gap-2 shrink-0 ml-2">
                  {/* Edição Rápida de Bônus Customizado (opcional) */}
                  {isEditingBonus ? (
                    <div className="flex items-center gap-1 rounded-lg border border-primary/40 bg-background/90 p-1">
                      <span className="text-[10px] text-muted-foreground">Bônus:</span>
                      <input
                        type="number"
                        value={skill.bonus ?? ""}
                        placeholder="0"
                        onChange={(e) => handleUpdateBonus(originalIndex, e.target.value)}
                        className="w-12 rounded border border-white/10 bg-black/40 px-1 py-0.5 text-center font-mono text-xs font-bold text-foreground focus:outline-none focus:border-primary"
                        autoFocus
                      />
                      <button
                        type="button"
                        onClick={() => setEditingBonusSkill(null)}
                        className="rounded p-1 text-primary hover:bg-primary/20"
                        title="Concluir edição de bônus"
                      >
                        <Check size={12} />
                      </button>
                    </div>
                  ) : (
                    <button
                      type="button"
                      onClick={() => setEditingBonusSkill(skill.name)}
                      className="hidden sm:flex items-center gap-0.5 rounded px-1.5 py-0.5 text-[10px] text-muted-foreground/60 hover:text-foreground hover:bg-white/5 transition"
                      title="Clique para definir um bônus adicional específico desta perícia"
                    >
                      <span>{typeof skill.bonus === "number" ? `Extra: +${skill.bonus}` : "+Bônus"}</span>
                    </button>
                  )}

                  {/* Gatilho de Rolagem com Dado Facetado d20 */}
                  <button
                    type="button"
                    onClick={() => promptRoll(skill.name, skillInfo.total)}
                    className="flex min-h-8 items-center gap-1.5 rounded-lg border border-primary/40 bg-primary/10 px-2.5 py-1 font-mono text-xs font-bold text-primary transition-all hover:border-primary hover:bg-primary hover:text-primary-foreground active:scale-95 shadow-sm"
                    title={`Rolar d20 para ${skill.name} (${skillInfo.formatted})`}
                  >
                    <Dices
                      size={14}
                      className="transition-transform group-hover:rotate-12 group-hover:scale-110"
                    />
                    <span>{skillInfo.formatted}</span>
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
