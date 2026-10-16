"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import {
  BookOpen,
  Clock3,
  Crown,
  Dices,
  HeartPulse,
  Plus,
  ScrollText,
  Shield,
  Skull,
  Swords,
  Trash2,
  Users,
} from "lucide-react";
import { Card, SectionHeader } from "../components/ui";
import { useAuth } from "../context/AuthContext";
import { fetchCampaignData, getStoredToken, updateCampaignData } from "../../lib/api";

const STORAGE_KEY = "rpg-gm-dashboard";

const defaultTable = {
  sessionTitle: "Próxima sessão",
  sessionNotes: "",
  initiative: [],
  npcs: [
    { id: "npc-1", name: "Novo NPC", role: "A definir", hp: 10, hpMax: 10 },
  ],
};

function loadTable() {
  if (typeof window === "undefined") return defaultTable;
  try {
    const saved = window.localStorage.getItem(STORAGE_KEY);
    return saved ? { ...defaultTable, ...JSON.parse(saved) } : defaultTable;
  } catch {
    return defaultTable;
  }
}

export default function AdminIndex() {
  const [table, setTable] = useState(defaultTable);
  const [characters, setCharacters] = useState([]);
  const [loadingCharacters, setLoadingCharacters] = useState(true);
  const [characterError, setCharacterError] = useState("");
  const [campaignLoaded, setCampaignLoaded] = useState(false);
  const [campaignError, setCampaignError] = useState("");
  const { isMaster, loading: authLoading } = useAuth();

  useEffect(() => {
    if (authLoading || !isMaster) return;
    fetchCampaignData(getStoredToken())
      .then(setTable)
      .catch(() => setTable(loadTable()))
      .finally(() => setCampaignLoaded(true));
    fetch("/api/characters", { headers: { Authorization: `Bearer ${getStoredToken()}` } })
      .then(async (response) => {
        if (!response.ok) throw new Error("Não foi possível carregar os personagens.");
        return response.json();
      })
      .then(setCharacters)
      .catch((error) => setCharacterError(error.message))
      .finally(() => setLoadingCharacters(false));
  }, [authLoading, isMaster]);

  useEffect(() => {
    if (!campaignLoaded || !isMaster) return;
    const timer = setTimeout(() => {
      updateCampaignData(table, getStoredToken()).catch((error) => {
        setCampaignError(error.message);
        window.localStorage.setItem(STORAGE_KEY, JSON.stringify(table));
      });
    }, 700);
    return () => clearTimeout(timer);
  }, [table, campaignLoaded, isMaster]);

  const updateTable = (patch) => setTable((current) => ({ ...current, ...patch }));
  const activeCharacters = useMemo(() => characters.filter((character) => character.hp > 0), [characters]);

  const addNpc = () => {
    updateTable({
      npcs: [
        ...table.npcs,
        { id: `npc-${Date.now()}`, name: "Novo inimigo", role: "A definir", hp: 10, hpMax: 10 },
      ],
    });
  };

  const updateNpc = (id, patch) => {
    updateTable({ npcs: table.npcs.map((npc) => (npc.id === id ? { ...npc, ...patch } : npc)) });
  };

  const removeNpc = (id) => updateTable({ npcs: table.npcs.filter((npc) => npc.id !== id) });

  const addToInitiative = (entry) => {
    if (table.initiative.some((item) => item.id === entry.id)) return;
    updateTable({ initiative: [...table.initiative, { ...entry, initiative: 0, hp: entry.hp ?? entry.hpMax ?? 10 }] });
  };

  const updateInitiative = (id, patch) => {
    updateTable({
      initiative: table.initiative
        .map((item) => (item.id === id ? { ...item, ...patch } : item))
        .sort((a, b) => Number(b.initiative) - Number(a.initiative)),
    });
  };

  return (
    <div className="space-y-5">
      {!authLoading && !isMaster && (
        <Card>
          <h1 className="font-serif text-xl font-bold text-foreground">Acesso reservado ao mestre</h1>
          <p className="mt-2 text-sm text-muted-foreground">Este painel contém informações privadas da campanha e não está disponível para jogadores.</p>
          <Link href="/personagem" className="mt-4 inline-flex min-h-11 items-center rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground">
            Voltar para minha ficha
          </Link>
        </Card>
      )}
      {isMaster && (
      <>
      {campaignError && <p className="border border-destructive/30 bg-destructive/10 p-3 text-sm text-destructive-foreground">{campaignError}</p>}
      <div className="guild-plaque ornate-frame border-2 border-primary/45 bg-card/95 p-5 shadow-[0_18px_50px_rgba(0,0,0,0.4)] sm:p-7">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <div className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.32em] text-primary">
              <Crown size={14} />
              Câmara do mestre
            </div>
            <h1 className="mt-2 font-serif text-3xl font-black uppercase tracking-[0.12em] text-foreground sm:text-4xl">
              Sala de Guerra
            </h1>
            <p className="mt-2 max-w-2xl font-serif text-base text-muted-foreground">
              Prepare encontros, acompanhe heróis e conduza o próximo capítulo da campanha.
            </p>
          </div>
          <Link href="/admin/personagens/new" className="flex min-h-11 items-center justify-center gap-2 rounded-lg border-2 border-primary/50 bg-primary px-4 py-2 text-xs font-bold uppercase tracking-wider text-primary-foreground transition hover:brightness-110 active:scale-95">
            <Plus size={15} />
            Novo herói
          </Link>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        {[
          ["Heróis vivos", activeCharacters.length, Users],
          ["Personagens", characters.length, ScrollText],
          ["NPCs preparados", table.npcs.length, Skull],
          ["Na iniciativa", table.initiative.length, Swords],
        ].map(([label, value, Icon]) => (
          <Card key={label} className="p-4">
            <div className="flex items-center justify-between">
              <span className="font-serif text-[10px] font-bold uppercase tracking-wider text-muted-foreground">{label}</span>
              <Icon size={17} className="text-primary" />
            </div>
            <strong className="mt-2 block font-serif text-3xl text-foreground">{value}</strong>
          </Card>
        ))}
      </div>

      <div className="grid gap-5 xl:grid-cols-[1.1fr_0.9fr]">
        <Card>
          <SectionHeader title="Preparação da sessão" icon={<BookOpen size={15} />} />
          <label className="block text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            Título
            <input
              value={table.sessionTitle}
              onChange={(event) => updateTable({ sessionTitle: event.target.value })}
              className="mt-2 min-h-11 w-full rounded-lg border-2 border-border bg-input-background px-3 text-sm text-foreground outline-none transition focus:border-primary"
            />
          </label>
          <label className="mt-4 block text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            Segredos, cenas e lembretes
            <textarea
              value={table.sessionNotes}
              onChange={(event) => updateTable({ sessionNotes: event.target.value })}
              rows={8}
              placeholder="O que precisa acontecer nesta sessão?"
              className="mt-2 w-full resize-y rounded-lg border-2 border-border bg-input-background p-3 text-sm leading-6 text-foreground outline-none transition focus:border-primary"
            />
          </label>
          <p className="mt-2 flex items-center gap-2 text-[11px] text-muted-foreground">
            <Clock3 size={13} />
            Salvo automaticamente neste navegador.
          </p>
        </Card>

        <Card>
          <div className="flex items-start justify-between gap-3">
            <SectionHeader title="NPCs e ameaças" icon={<Skull size={15} />} />
            <button type="button" onClick={addNpc} className="flex min-h-11 items-center gap-1 rounded-lg border border-primary/40 bg-primary/10 px-2.5 text-xs font-bold text-primary transition hover:bg-primary/20 active:scale-95">
              <Plus size={14} /> NPC
            </button>
          </div>
          <div className="space-y-2">
            {table.npcs.map((npc) => (
              <div key={npc.id} className="grid grid-cols-[1fr_75px_28px] items-center gap-2 border-b border-border pb-2">
                <div>
                  <input value={npc.name} onChange={(event) => updateNpc(npc.id, { name: event.target.value })} className="w-full bg-transparent text-sm font-semibold text-foreground outline-none" />
                  <input value={npc.role} onChange={(event) => updateNpc(npc.id, { role: event.target.value })} className="w-full bg-transparent text-xs text-muted-foreground outline-none" />
                </div>
                <label className="flex items-center gap-1 text-xs text-muted-foreground">
                  <HeartPulse size={13} className="text-destructive" />
                  <input type="number" value={npc.hp} onChange={(event) => updateNpc(npc.id, { hp: Number(event.target.value) })} className="w-12 rounded border border-border bg-input-background px-1 py-1 text-center text-foreground" />
                </label>
                <button type="button" onClick={() => removeNpc(npc.id)} className="rounded p-2 text-destructive transition hover:bg-destructive/15" title="Remover NPC">
                  <Trash2 size={14} />
                </button>
              </div>
            ))}
          </div>
        </Card>
      </div>

      <Card>
        <div className="flex flex-wrap items-center justify-between gap-3">
          <SectionHeader title="Iniciativa do encontro" icon={<Dices size={15} />} />
          <button type="button" onClick={() => updateTable({ initiative: [] })} className="flex min-h-11 items-center gap-2 rounded-lg border border-border bg-secondary px-3 py-2 text-xs font-semibold text-secondary-foreground transition hover:border-primary/40 hover:text-primary">
            Limpar combate
          </button>
        </div>
        <div className="mb-4 flex flex-wrap gap-2">
          {characters.map((character) => (
            <button key={character.id} type="button" onClick={() => addToInitiative({ id: `pc-${character.id}`, name: character.name, type: "Herói", hp: character.hp, hpMax: character.hpMax })} className="flex min-h-11 items-center gap-2 rounded-lg border border-primary/30 bg-primary/10 px-3 py-2 text-xs font-semibold text-primary transition hover:bg-primary/20 active:scale-95">
              <Shield size={13} /> + {character.name}
            </button>
          ))}
          {table.npcs.map((npc) => (
            <button key={npc.id} type="button" onClick={() => addToInitiative({ ...npc, type: "NPC" })} className="flex min-h-11 items-center gap-2 rounded-lg border border-accent/30 bg-accent/10 px-3 py-2 text-xs font-semibold text-accent transition hover:bg-accent/20 active:scale-95">
              <Skull size={13} /> + {npc.name}
            </button>
          ))}
        </div>
        {table.initiative.length === 0 ? (
          <div className="rounded-lg border-2 border-dashed border-border p-8 text-center text-sm text-muted-foreground">
            Adicione heróis ou NPCs para montar a ordem do combate.
          </div>
        ) : (
          <div className="space-y-2">
            {table.initiative.map((item, index) => (
              <div key={item.id} className="grid grid-cols-[36px_1fr_90px_80px] items-center gap-3 border-2 border-border bg-secondary/60 p-2.5">
                <span className="font-serif text-lg font-bold text-primary">{index + 1}</span>
                <div>
                  <strong className="block text-sm text-foreground">{item.name}</strong>
                  <span className="text-[10px] uppercase tracking-wider text-muted-foreground">{item.type}</span>
                </div>
                <label className="text-[10px] text-muted-foreground">
                  INI
                  <input type="number" value={item.initiative} onChange={(event) => updateInitiative(item.id, { initiative: Number(event.target.value) })} className="mt-1 w-full border border-border bg-input-background px-2 py-1 text-center text-foreground" />
                </label>
                <label className="text-[10px] text-muted-foreground">
                  PV
                  <input type="number" value={item.hp} onChange={(event) => updateInitiative(item.id, { hp: Number(event.target.value) })} className="mt-1 w-full border border-border bg-input-background px-2 py-1 text-center text-foreground" />
                </label>
              </div>
            ))}
          </div>
        )}
      </Card>

      <Card>
        <SectionHeader title="Heróis da campanha" icon={<Users size={15} />} />
        {loadingCharacters && <p className="text-sm text-muted-foreground">Carregando personagens...</p>}
        {characterError && <p className="border border-destructive/30 bg-destructive/10 p-3 text-sm text-destructive-foreground">{characterError}</p>}
        {!loadingCharacters && !characterError && characters.length === 0 && <p className="text-sm text-muted-foreground">Nenhum personagem encontrado.</p>}
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {characters.map((character) => (
            <Link key={character.id} href={`/admin/personagens/${character.id}`} className="border-2 border-border bg-secondary/60 p-4 transition hover:border-primary/60 hover:bg-primary/10">
              <strong className="font-serif text-base text-foreground">{character.name}</strong>
              <p className="mt-1 text-xs text-muted-foreground">{character.job || "Aventureiro"} · Nível {character.level || 1}</p>
              <div className="mt-3 flex items-center gap-2 text-xs text-primary"><HeartPulse size={13} /> {character.hp}/{character.hpMax} PV</div>
            </Link>
          ))}
        </div>
      </Card>
      </>
      )}
    </div>
  );
}
