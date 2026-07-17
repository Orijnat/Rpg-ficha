"use client";

import { Home } from "lucide-react";
import { useCharacter } from "../context/CharacterContext";
import { Card, EditableText, SectionHeader } from "../components/ui";

export default function QuartoPage() {
  const { data, upd } = useCharacter();

  return (
    <div className="space-y-4">
      <Card>
        <SectionHeader title="Quarto" icon={<Home size={14} />} />
        <EditableText
          value={data.roomNotes}
          onChange={(value) => upd("roomNotes", value)}
          className="w-full text-sm text-[#e8d5b0]"
          multiline
          placeholder="Itens, descrição e notas do quarto..."
        />
      </Card>
    </div>
  );
}
