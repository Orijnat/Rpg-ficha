"use client";

import { Plus, Skull, Trash2, Users } from "lucide-react";
import { useCharacter } from "../context/CharacterContext";
import { Card, EditableText, SectionHeader } from "../components/ui";

export default function MundoPage() {
  const { data, addPerson, removePerson, updPerson } = useCharacter();

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
      {["players", "npcs"].map((listKey) => {
        const isPlayers = listKey === "players";

        return (
          <Card key={listKey}>
            <div className="mb-3 flex items-center justify-between">
              <SectionHeader title={isPlayers ? "Jogadores" : "NPCs"} icon={isPlayers ? <Users size={14} /> : <Skull size={14} />} />
              <button onClick={() => addPerson(listKey)} className="flex items-center gap-1 text-xs text-[#c9862a] transition-colors hover:text-[#e8a030]">
                <Plus size={13} />
              </button>
            </div>
            <div className="space-y-2">
              {data[listKey].map((person) => (
                <div key={person.id} className="group flex items-start gap-2 border-b border-[rgba(201,134,42,0.08)] pb-2 last:border-0">
                  <div className="flex-1 space-y-0.5">
                    <EditableText value={person.name} onChange={(value) => updPerson(listKey, person.id, { name: value })} className="text-sm font-medium text-[#e8d5b0]" />
                    <EditableText value={person.note} onChange={(value) => updPerson(listKey, person.id, { note: value })} className="text-xs text-[#8a7355]" placeholder="nota..." />
                  </div>
                  <button onClick={() => removePerson(listKey, person.id)} className="mt-0.5 text-[#8b1a1a] opacity-0 transition-all group-hover:opacity-100 hover:text-[#c02020]">
                    <Trash2 size={12} />
                  </button>
                </div>
              ))}
            </div>
          </Card>
        );
      })}
    </div>
  );
}
