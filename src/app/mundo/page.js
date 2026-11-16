"use client";

import { useEffect, useState } from "react";
import { BookOpenText, Plus, Shield, Skull, Trash2, Users } from "lucide-react";
import { useCharacter } from "../context/CharacterContext";
import { useAuth } from "../context/AuthContext";
import { Card, EditableText, HPBar, SectionHeader } from "../components/ui";
import { listCampaigns, listCharacters, listCampaignNpcs } from "../../lib/api";

export default function MundoPage() {
  const { data, addPerson, removePerson, updPerson } = useCharacter();
  const { token, isMaster } = useAuth();
  const [sharedNpcs, setSharedNpcs] = useState([]);
  const [sharedHeroes, setSharedHeroes] = useState([]);

  // Fichas compartilhadas pelo mestre com a mesa (somente leitura)
  useEffect(() => {
    if (!token) return;
    let cancelled = false;
    async function loadShared() {
      try {
        const campaigns = await listCampaigns(token);
        const campIds = (Array.isArray(campaigns) ? campaigns : []).map((c) => c.id);
        if (campIds.length === 0) {
          if (!cancelled) { setSharedNpcs([]); setSharedHeroes([]); }
          return;
        }
        const [npcLists, heroLists] = await Promise.all([
          Promise.all(campIds.map((id) => listCampaignNpcs(id, token).catch(() => []))),
          Promise.all(campIds.map((id) => listCharacters(token).catch(() => []))),
        ]);
        if (cancelled) return;
        const npcs = npcLists.flat().filter((n) => n?.dadosExtras?.sharedWithPlayers === true);
        const heroes = heroLists.flat().filter((c) => c?.dadosExtras?.sharedWithPlayers === true && c?.userId && c.readOnly !== false);
        setSharedNpcs(npcs);
        setSharedHeroes(heroes);
      } catch {
        if (!cancelled) { setSharedNpcs([]); setSharedHeroes([]); }
      }
    }
    loadShared();
    return () => { cancelled = true; };
  }, [token]);

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

      {(sharedNpcs.length > 0 || sharedHeroes.length > 0) && (
        <Card className="sm:col-span-2">
          <div className="mb-4 flex items-center justify-between">
            <SectionHeader
              title="Fichas Compartilhadas pelo Mestre"
              subtitle="Conteúdo da mesa visível apenas nesta campanha (somente leitura)"
              icon={<BookOpenText size={15} />}
            />
          </div>

          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            {sharedHeroes.map((hero) => (
              <div key={`hero-${hero.id}`} className="rounded-xl border border-amber-400/30 bg-amber-500/10 p-4">
                <div className="flex items-center gap-2">
                  <Shield size={16} className="text-amber-400" />
                  <div>
                    <strong className="font-cinzel text-sm text-foreground">{hero.name}</strong>
                    <p className="font-journal text-xs italic text-muted-foreground">
                      Herói · {hero.customClass || hero.job || ""} · Nível {hero.level || 1}
                    </p>
                  </div>
                </div>
                <div className="mt-2">
                  <HPBar hp={hero.hp ?? 10} max={hero.hpMax ?? 10} />
                  <p className="mt-1 text-right font-mono text-[10px] text-muted-foreground">{hero.hp ?? 10}/{hero.hpMax ?? 10} PV</p>
                </div>
              </div>
            ))}

            {sharedNpcs.map((npc) => (
              <div key={`npc-${npc.id}`} className="rounded-xl border border-purple-400/30 bg-purple-500/10 p-4">
                <div className="flex items-center gap-2">
                  <Skull size={16} className="text-purple-300" />
                  <div>
                    <strong className="font-cinzel text-sm text-foreground">{npc.nome}</strong>
                    <p className="font-journal text-xs italic text-muted-foreground">
                      {npc.papel || "NPC"} · {npc.dadosExtras?.status || "Ativo"}
                    </p>
                  </div>
                </div>
                <div className="mt-2">
                  <HPBar hp={npc.hp ?? npc.hpMax ?? 10} max={npc.hpMax ?? npc.hp ?? 10} />
                  <p className="mt-1 text-right font-mono text-[10px] text-muted-foreground">{npc.hp ?? 10}/{npc.hpMax ?? 10} PV</p>
                </div>
              </div>
            ))}
          </div>
        </Card>
      )}
    </div>
  );
}
