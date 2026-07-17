"use client";

import React from "react";
import { useCharacter } from "../context/CharacterContext";
import { EditableText, SectionHeader } from "./ui";

export default function Aparencia() {
  const { data, upd } = useCharacter();

  return (
    <div>
      <SectionHeader title="Aparência" />
      <div className="space-y-1.5 text-sm">
    {[
      ["Idade", "age"],
      ["Olhos", "eyes"],
      ["Altura", "height"],
      ["Cor da Pele", "skin"],
      ["Peso", "weight"],
      ["Cabelo", "hair"],
    ].map(([label, key]) => (
      <div key={key} className="flex items-start gap-2">
        <span
          className="w-24 shrink-0 text-[#8a7355]"
          style={{ fontFamily: "'Cinzel', serif", fontSize: "11px" }}
        >
          {label}
        </span>
        <EditableText
          value={data[key]}
          onChange={(value) => upd(key, value)}
          className="text-sm text-[#e8d5b0]"
        />
      </div>
    ))}

    <div className="flex items-start gap-2">
      <span
        className="w-24 shrink-0 text-[11px] text-[#8a7355]"
        style={{ fontFamily: "'Cinzel', serif" }}
      >
        Aparência
      </span>
      <EditableText
        value={data.appearance}
        onChange={(value) => upd("appearance", value)}
        className="text-sm text-[#e8d5b0]"
        multiline
      />
    </div>
  </div>
</div>
)}