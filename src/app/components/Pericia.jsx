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
              className={`group flex items-center justify-between rounded-xl border px-2.5 py-2 transition-all ${
                skill.trained
                  ? "border-primary/30 bg-primary/10"
                  : "border-transparent hover:border-primary/20 hover:bg-secondary/40"
              }`}
            >
              {/* Checkbox de Treinado */}
              <div className="flex items-center gap-2.5 min-w-0">
                <button
                  type="button"
                  role="checkbox"
                  aria-checked={skill.trained}
                  aria-label={`Perícia ${skill.name} (${skill.attr}): ${skill.trained ? "treinada" : "não treinada"}`}
                  onClick={() => updSkill(index, { trained: !skill.trained })}
                  className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-md border transition-all ${
                    skill.trained
                      ? "border-primary bg-primary text-primary-foreground shadow-sm shadow-primary/30"
                      : "border-border/80 bg-background/60 hover:border-primary/60"
                  }`}
                  title={skill.trained ? "Perícia Treinada (clique para desmarcar)" : "Marcar como Treinada"}
                >
                  {skill.trained ? <Check size={12} strokeWidth={3} /> : null}
                </button>

                <span
                  className={`truncate text-xs transition-colors ${
                    skill.trained ? "font-cinzel font-bold text-foreground" : "text-muted-foreground group-hover:text-foreground"
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
                className="flex items-center gap-1.5 rounded-lg border border-primary/25 bg-primary/10 px-2.5 py-1 font-mono text-xs font-bold text-primary transition-all hover:border-primary/60 hover:bg-primary/20 hover:text-foreground active:scale-95 font-tabular"
                title={`Rolar teste de ${skill.name} (${skillInfo.formatted})`}
                aria-label={`Rolar teste de ${skill.name} (${skillInfo.formatted})`}
              >
                <Dices size={12} className="opacity-70 transition-transform group-hover:rotate-12 group-hover:opacity-100" />
                <span>{skillInfo.formatted}</span>
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
}