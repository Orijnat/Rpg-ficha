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
    <div>
      <SectionHeader
        title="Perícias"
        subtitle="19 perícias canônicas do sistema d20"
        icon={<Dices size={14} />}
      />
      <div className="custom-scroll max-h-84 space-y-1.5 overflow-y-auto pr-1">
        {data.skills.map((skill, index) => {
          const skillInfo = calculateSkillBonus(skill, data);

          return (
            <div
              key={skill.name}
              className="group flex items-center justify-between rounded-lg border border-transparent px-2 py-2 transition-all hover:border-primary/20 hover:bg-primary/5"
            >
              {/* Checkbox de Treinado */}
              <div className="flex items-center gap-2.5">
                <button
                  type="button"
                  role="checkbox"
                  aria-checked={skill.trained}
                  aria-label={`Perícia ${skill.name} (${skill.attr}): ${skill.trained ? "treinada" : "não treinada"}`}
                  onClick={() => updSkill(index, { trained: !skill.trained })}
                  className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-md border transition-colors ${
                    skill.trained
                      ? "border-[#d69a3d] bg-[#d69a3d] text-[#0f0d0a]"
                      : "border-white/20 hover:border-[#d69a3d]"
                  }`}
                  title={skill.trained ? "Perícia Treinada" : "Marcar como Treinada"}
                >
                  {skill.trained ? <Check size={11} strokeWidth={3} /> : null}
                </button>

                <span
                  className={`text-xs font-medium transition-colors ${
                    skill.trained ? "text-[#f5e9d7]" : "text-[#a98b68]"
                  }`}
                >
                  {skill.name}
                </span>

                <span className="shrink-0 rounded border border-primary/20 bg-primary/10 px-1.5 py-0.5 font-cinzel text-[10px] font-bold text-primary/80">
                  {skill.attr}
                </span>
              </div>

              {/* Gatilho de Rolagem com Bônus Dinâmico */}
              <button
                type="button"
                onClick={() => promptRoll(skill.name, skillInfo.total)}
                className="flex items-center gap-1.5 rounded-md border border-white/5 bg-white/[0.02] px-2 py-0.5 font-mono text-xs font-bold text-[#d69a3d] transition-all hover:border-[#d69a3d]/50 hover:bg-[#d69a3d]/15 hover:text-[#fdf6e7] active:scale-95"
                title={`Rolar teste de ${skill.name} (${skillInfo.formatted})`}
              >
                <Dices size={12} className="opacity-60 transition-transform group-hover:rotate-12 group-hover:opacity-100" />
                <span>{skillInfo.formatted}</span>
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
}
