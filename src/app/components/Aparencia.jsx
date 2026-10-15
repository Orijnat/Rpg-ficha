"use client";

import React from "react";
import { useCharacter } from "../context/CharacterContext";
import { EditableText, SectionHeader } from "./ui";

export default function Aparencia() {
  const { data, upd } = useCharacter();

  return (
    <div className="h-full">
      <SectionHeader title="Aparência" />
      <div className="grid gap-2 text-sm sm:grid-cols-2">
        {[
          ["Idade", "age"],
          ["Olhos", "eyes"],
          ["Altura", "height"],
          ["Cor da Pele", "skin"],
          ["Peso", "weight"],
          ["Cabelo", "hair"],
        ].map(([label, key]) => (
          <div key={key} className="flex items-start gap-2">
            <span className="w-24 shrink-0 font-serif text-[11px] text-muted-foreground">{label}</span>
            <EditableText
              value={data[key]}
              onChange={(value) => upd(key, value)}
              className="text-sm text-foreground"
            />
          </div>
        ))}

        <div className="mt-3 flex items-start gap-2 border-t border-white/10 pt-3 sm:col-span-2">
          <span className="w-24 shrink-0 font-serif text-[11px] text-muted-foreground">Aparência</span>
          <EditableText
            value={data.appearance}
            onChange={(value) => upd("appearance", value)}
            className="text-sm text-foreground"
            multiline
          />
        </div>
      </div>
    </div>
  );
}