"use client";

import React from "react";
import { SectionHeader, EditableText } from "./ui";
import { useCharacter } from "../context/CharacterContext";

export default function Anotacoes() {
  const { data, upd } = useCharacter();

  return (
    <div>
      <SectionHeader title="Anotações" />
      <EditableText
        value={data.notes}
        onChange={(value) => upd("notes", value)}
        className="w-full text-sm text-[#e8d5b0]"
        multiline
        placeholder="Escreva suas anotações aqui..."
      />
    </div>
  );
}