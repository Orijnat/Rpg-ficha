"use client";

import React from "react";
import { Check, Dices } from "lucide-react";
import { SectionHeader } from "./ui";
import { useCharacter } from "../context/CharacterContext";
import { useDice } from "../context/DiceContext";
import { calculateSkillBonus } from "../../lib/modifiers";

export default function Pericia() {
  const { data, updSkill } = useCharacter();
  const { promptRoll } = useDice();

  return (
    <div>
      <SectionHeader title="Perícias" icon={<Dices size={14} />} />
      <div className="custom-scroll max-h-80 space-y-1 overflow-y-auto pr-1">
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

                <span className="rounded bg-white/[0.04] px-1.5 py-0.5 font-mono text-[10px] text-[#8a7355]">
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