"use client";

import { Plus, Skull, Trash2, Users } from "lucide-react";
import { useCharacter } from "../context/CharacterContext";
import { Card, EditableText, SectionHeader } from "../components/ui";

export default function MundoPage() {
  const { data, addPerson, removePerson, updPerson } = useCharacter();

  return (
    <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
      {["players", "npcs"].map((listKey) => {
        const isPlayers = listKey === "players";
        const list = data?.[listKey] || [];

        return (
          <Card key={listKey}>
            <div className="mb-4 flex items-center justify-between">
              <SectionHeader
                title={isPlayers ? "Companheiros da Mesa" : "NPCs & Contatos"}
                subtitle={
                  isPlayers
                    ? "Aliados de jornada e aventureiros do grupo"
                    : "Figuras notórias, mercadores e informantes do mundo"
                }
                icon={isPlayers ? <Users size={15} /> : <Skull size={15} />}
              />
              <button
                type="button"
                onClick={() => addPerson(listKey)}
                className="flex min-h-9 items-center gap-1 rounded-xl border border-primary/40 bg-primary/10 px-3 py-1 font-cinzel text-xs font-bold text-primary transition-all hover:bg-primary/20 hover:text-foreground active:scale-95 shadow-sm"
                title={isPlayers ? "Adicionar jogador" : "Adicionar NPC"}
              >
                <Plus size={13} />
                <span>Adicionar</span>
              </button>
            </div>

            {list.length === 0 ? (
              <div className="rounded-xl border border-dashed border-primary/20 p-6 text-center font-journal text-xs italic text-muted-foreground">
                {isPlayers
                  ? "Nenhum companheiro registrado nesta comitiva."
                  : "Nenhum contato ou NPC registrado ainda."}
              </div>
            ) : (
              <div className="space-y-2">
                {list.map((person) => (
                  <div
                    key={person.id}
                    className="group flex items-start gap-3 rounded-xl border border-transparent p-2.5 transition-all hover:border-primary/20 hover:bg-secondary/40"
                  >
                    <div className="flex-1 space-y-1 min-w-0">
                      <EditableText
                        value={person.name}
                        onChange={(value) => updPerson(listKey, person.id, { name: value })}
                        className="font-cinzel text-sm font-bold text-foreground block"
                        label="Nome"
                      />
                      <EditableText
                        value={person.note}
                        onChange={(value) => updPerson(listKey, person.id, { note: value })}
                        className="font-journal text-xs italic text-muted-foreground block"
                        placeholder="Adicionar nota ou vínculo..."
                        label="Notas"
                      />
                    </div>
                    <button
                      type="button"
                      onClick={() => removePerson(listKey, person.id)}
                      className="rounded-lg p-1.5 text-muted-foreground opacity-60 transition-all group-hover:opacity-100 hover:bg-destructive/20 hover:text-destructive active:scale-95"
                      title="Remover"
                    >
                      <Trash2 size={13} />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </Card>
        );
      })}
    </div>
  );
}
