"use client";

import React from "react";
import { Check } from "lucide-react";
import { SectionHeader } from "./ui";
import { useCharacter } from "../context/CharacterContext";

export default function Pericia() {
  const { data, updSkill } = useCharacter();

  return (
    <div>
      <SectionHeader title="Perícias" />
      <div className="custom-scroll max-h-72 space-y-0.5 overflow-y-auto pr-1">
        {data.skills.map((skill, index) => (
          <div key={skill.name} className="flex items-center gap-2 border-b border-[rgba(201,134,42,0.08)] py-1 last:border-0">
            <button
              onClick={() => updSkill(index, { trained: !skill.trained })}
              className={`flex h-4 w-4 shrink-0 items-center justify-center rounded border transition-colors ${
                skill.trained
                  ? "border-[#c9862a] bg-[#c9862a] text-[#0f0d0a]"
                  : "border-[rgba(201,134,42,0.3)] hover:border-[#c9862a]"
              }`}
            >
              {skill.trained ? <Check size={10} /> : null}
            </button>
            <span className={`flex-1 text-xs ${skill.trained ? "text-[#e8d5b0]" : "text-[#8a7355]"}`}>
              {skill.name}
            </span>
            <span className="w-7 text-center font-mono text-[10px] text-[#8a7355]">{skill.attr}</span>
            {skill.trained ? (
              <span className="w-6 text-right font-bold font-mono text-xs text-[#c9862a]">
                {skill.bonus !== null ? `+${skill.bonus}` : ""}
              </span>
            ) : null}
          </div>
        ))}
      </div>
    </div>
  );
}