"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import {
  BookOpen,
  Check,
  ChevronRight,
  Clock3,
  Copy,
  Crown,
  Dices,
  HeartPulse,
  Link2,
  Play,
  Plus,
  RotateCcw,
  ScrollText,
  Shield,
  ShieldAlert,
  Skull,
  Sparkles,
  Swords,
  Trash2,
  Users,
  X,
} from "lucide-react";
import { Card, SectionHeader } from "../components/ui";
import { useAuth } from "../context/AuthContext";
import {
  fetchCampaignData,
  generateInviteLink,
  getApiBaseUrl,
  getStoredToken,
  listCampaigns,
  listCharacters,
  updateCampaignData,
} from "../../lib/api";
import { CONDITIONS_LIST, applyHealthChange, advanceTurn } from "../../lib/modifiers";
import { rollDice } from "../../lib/dice";

const STORAGE_KEY = "rpg-gm-dashboard";

const defaultTable = {
  sessionTitle: "Próxima sessão",
  sessionNotes: "",
  combatRound: 1,
  activeTurnIndex: 0,
  initiative: [],
  npcs: [
    { id: "npc-1", name: "Novo NPC", role: "A definir", hp: 10, hpMax: 10 },
  ],
};

function normalizeTable(value) {
  const source = value && typeof value === "object" ? value : {};
  return {
    ...defaultTable,
    ...source,
    sessionTitle: source.sessionTitle ?? source.tituloSessao ?? defaultTable.sessionTitle,
    sessionNotes: source.sessionNotes ?? source.anotacoesSessao ?? defaultTable.sessionNotes,
    combatRound: Math.max(1, Number(source.combatRound) || 1),
    activeTurnIndex: Math.max(0, Number(source.activeTurnIndex) || 0),
    npcs: Array.isArray(source.npcs) ? source.npcs : defaultTable.npcs,
    initiative: Array.isArray(source.initiative)
      ? source.initiative
      : Array.isArray(source.iniciativa)
        ? source.iniciativa
        : defaultTable.initiative,
  };
}

function loadTable() {
  if (typeof window === "undefined") return defaultTable;
  try {
    const saved = window.localStorage.getItem(STORAGE_KEY);
    return saved ? normalizeTable(JSON.parse(saved)) : defaultTable;
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
  const { isMaster, loading: authLoading, inspectCharacter } = useAuth();
  const [openConditionPickerId, setOpenConditionPickerId] = useState(null);

  // Múltiplas mesas / campanhas do mestre
  const [campaigns, setCampaigns] = useState([]);
  const [selectedCampaignId, setSelectedCampaignId] = useState("");
  const [copiedInvite, setCopiedInvite] = useState(false);

  useEffect(() => {
    if (authLoading || !isMaster) return;
    fetchCampaignData(getStoredToken())
      .then((campaign) => setTable(normalizeTable(campaign)))
      .catch(() => setTable(loadTable()))
      .finally(() => setCampaignLoaded(true));

    listCharacters(getStoredToken())
      .then((chars) => setCharacters(Array.isArray(chars) ? chars : []))
      .catch((error) => setCharacterError(error.message))
      .finally(() => setLoadingCharacters(false));

    listCampaigns(getStoredToken())
      .then((camps) => {
        const list = Array.isArray(camps) ? camps : [];
        setCampaigns(list);
      })
      .catch(() => {});
  }, [authLoading, isMaster]);

  const activeCampaign = useMemo(() => {
    return campaigns.find((c) => c.id === selectedCampaignId) || null;
  }, [campaigns, selectedCampaignId]);

  const displayedCharacters = useMemo(() => {
    if (!selectedCampaignId) return characters;
    return characters.filter((character) => character.campanhaId === selectedCampaignId);
  }, [characters, selectedCampaignId]);

  const handleCopyInvite = () => {
    if (!activeCampaign?.codigoConvite) return;
    const link = generateInviteLink(activeCampaign.codigoConvite);
    navigator.clipboard.writeText(link);
    setCopiedInvite(true);
    setTimeout(() => setCopiedInvite(false), 2500);
  };

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
  const activeCharacters = useMemo(
    () => displayedCharacters.filter((character) => character.hp > 0),
    [displayedCharacters]
  );

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
    const hp = entry.hp ?? entry.hpMax ?? 10;
    const hpMax = entry.hpMax ?? entry.hp ?? 10;
    updateTable({
      initiative: [
        ...table.initiative,
        {
          ...entry,
          initiative: 0,
          hp,
          hpMax,
          conditions: entry.conditions || [],
        },
      ],
    });
  };

  const updateInitiative = (id, patch) => {
    updateTable({
      initiative: table.initiative
        .map((item) => (item.id === id ? { ...item, ...patch } : item))
        .sort((a, b) => Number(b.initiative) - Number(a.initiative)),
    });
  };

  const removeFromInitiative = (id) => {
    updateTable({
      initiative: table.initiative.filter((item) => item.id !== id),
    });
  };

  // Turno e rodadas de combate
  const handleAdvanceTurn = () => {
    if (!table.initiative.length) return;
    const next = advanceTurn(table.initiative, table.activeTurnIndex, table.combatRound);
    updateTable({ activeTurnIndex: next.turnIndex, combatRound: next.round });
  };

  const handleResetCombat = () => {
    updateTable({
      initiative: [],
      combatRound: 1,
      activeTurnIndex: 0,
    });
  };

  // Ajuste rápido de PV (dano ou cura)
  const adjustCombatantHp = (id, delta) => {
    const item = table.initiative.find((c) => c.id === id);
    if (!item) return;
    const res = applyHealthChange(item.hp, item.hpMax ?? item.hp ?? 10, delta);
    updateInitiative(id, { hp: res.currentHp });
  };

  // Rolar iniciativa para todos
  const rollAllInitiatives = () => {
    const updated = table.initiative.map((item) => {
      let mod = 0;
      if (item.type === "Herói") {
        const rawChar = characters.find((c) => `pc-${c.id}` === item.id);
        if (rawChar?.DES) {
          mod = Math.floor((Number(rawChar.DES) - 10) / 2);
        }
      }
      const roll = rollDice({ sides: 20, modifier: mod, label: `Iniciativa: ${item.name}` });
      return {
        ...item,
        initiative: roll.total,
      };
    });

    updated.sort((a, b) => Number(b.initiative) - Number(a.initiative));
    updateTable({ initiative: updated, activeTurnIndex: 0 });
  };

  // Alternar condição
  const toggleCombatantCondition = (combatantId, conditionId) => {
    const item = table.initiative.find((c) => c.id === combatantId);
    if (!item) return;
    const conditions = Array.isArray(item.conditions) ? item.conditions : [];
    const exists = conditions.includes(conditionId);
    const updated = exists ? conditions.filter((c) => c !== conditionId) : [...conditions, conditionId];
    updateInitiative(combatantId, { conditions: updated });
  };

  return (
    <div className="space-y-5">
      {!authLoading && !isMaster && (
        <Card>
          <h1 className="font-serif text-xl font-bold text-foreground">Acesso reservado ao mestre</h1>
          <p className="mt-2 text-sm text-muted-foreground">Este painel contém informações privadas da campanha e não está disponível para jogadores.</p>
          <Link href="/login" className="mt-4 inline-flex min-h-11 items-center rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground">
            Ir para o login
          </Link>
        </Card>
      )}
      {isMaster && (
      <>
      {campaignError && <p className="border border-destructive/30 bg-destructive/10 p-3 text-sm text-destructive-foreground">{campaignError}</p>}
      <div className="war-room-card bracket-corners rounded-2xl border border-primary/40 p-5 sm:p-7 shadow-[0_20px_50px_rgba(0,0,0,0.5)]">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <div className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.32em] text-primary">
              <Crown size={14} className="text-amber-400" />
              Soberania do Narrador
            </div>
            <h1 className="mt-1 font-cinzel text-2xl sm:text-4xl font-black uppercase tracking-[0.08em] text-foreground">
              Sala de Guerra
            </h1>
            <p className="mt-1.5 max-w-2xl font-journal text-sm sm:text-base italic text-muted-foreground">
              Conduza o combate tático em tempo real, gerencie ameaças e orquestre o próximo capítulo da mesa.
            </p>
          </div>
          <Link
            href="/admin/personagens/new"
            className="flex min-h-11 items-center justify-center gap-2 rounded-xl border border-primary/50 bg-primary/20 px-4 py-2 font-cinzel text-xs font-bold uppercase tracking-wider text-primary transition hover:bg-primary/30 active:scale-95 shadow-md shadow-primary/15"
          >
            <Plus size={15} />
            Novo herói
          </Link>
        </div>

        {/* Barra de Múltiplas Mesas / Campanhas & Convite Rápido */}
        <div className="mt-5 flex flex-wrap items-center justify-between gap-3 rounded-xl border border-primary/25 bg-primary/10 p-3 sm:p-3.5">
          <div className="flex flex-wrap items-center gap-2.5">
            <span className="font-cinzel text-xs font-bold uppercase tracking-wider text-primary flex items-center gap-1.5">
              <Crown size={14} className="text-amber-400" /> Mesa Ativa:
            </span>
            <select
              value={selectedCampaignId}
              onChange={(e) => setSelectedCampaignId(e.target.value)}
              className="min-h-9 rounded-lg border border-primary/40 bg-background/95 px-3 py-1 font-cinzel text-xs font-bold text-foreground outline-none focus:border-primary shadow-inner"
            >
              <option value="">Todas as Mesas ({characters.length} heróis)</option>
              {campaigns.map((camp) => (
                <option key={camp.id} value={camp.id}>
                  {camp.nome} ({camp.estado})
                </option>
              ))}
            </select>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {activeCampaign ? (
              <>
                <button
                  type="button"
                  onClick={handleCopyInvite}
                  className="flex min-h-9 items-center gap-1.5 rounded-lg border border-amber-400/50 bg-amber-500/15 px-3 py-1 font-cinzel text-xs font-bold text-amber-300 hover:bg-amber-500/25 transition active:scale-95 shadow-sm"
                  title="Copiar link de convite desta mesa para enviar aos jogadores"
                >
                  {copiedInvite ? <Check size={13} className="text-emerald-400" /> : <Link2 size={13} />}
                  <span>{copiedInvite ? "Link Copiado!" : `Copiar Convite (${activeCampaign.codigoConvite})`}</span>
                </button>
                <Link
                  href="/admin/campanhas"
                  className="flex min-h-9 items-center gap-1 rounded-lg border border-border bg-secondary/80 px-2.5 py-1 text-xs text-muted-foreground hover:text-foreground transition"
                >
                  Gerenciar
                </Link>
              </>
            ) : (
              <Link
                href="/admin/campanhas"
                className="flex min-h-9 items-center gap-1.5 rounded-lg border border-primary/40 bg-primary/15 px-3 py-1 font-cinzel text-xs font-bold text-primary hover:bg-primary/25 transition"
              >
                <Plus size={13} /> Gerenciar Campanhas & Convites
              </Link>
            )}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        {[
          ["Heróis vivos", activeCharacters.length, Users, "text-emerald-400"],
          ["Personagens", displayedCharacters.length, ScrollText, "text-primary"],
          ["NPCs preparados", table.npcs.length, Skull, "text-rose-400"],
          ["Na iniciativa", table.initiative.length, Swords, "text-amber-400"],
        ].map(([label, value, Icon, colorClass]) => (
          <Card key={label} variant="war-room" className="p-4 sm:p-5">
            <div className="flex items-center justify-between">
              <span className="font-cinzel text-[10px] font-bold uppercase tracking-wider text-muted-foreground">{label}</span>
              <Icon size={17} className={colorClass} />
            </div>
            <strong className="mt-2 block font-cinzel text-3xl font-bold text-foreground font-tabular">{value}</strong>
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
            Salvo automaticamente neste navegador e no backend.
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

      {/* Rastreador de Iniciativa e Combate Tático */}
      <Card variant="war-room">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-primary/20 pb-4">
          <div>
            <div className="flex items-center gap-2">
              <SectionHeader title="Iniciativa do Encontro" icon={<Dices size={16} />} />
              {table.initiative.length > 0 && (
                <span className="rounded-full border border-amber-400/50 bg-amber-500/15 px-3 py-0.5 font-cinzel text-xs font-bold text-amber-300 shadow-sm">
                  Rodada {table.combatRound || 1}
                </span>
              )}
            </div>
            <p className="font-journal text-xs italic text-muted-foreground">
              Ordem dos combatentes, pontos de vida em tempo real e condições ativas da batalha.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {table.initiative.length > 0 && (
              <>
                <button
                  type="button"
                  onClick={rollAllInitiatives}
                  className="flex min-h-10 items-center gap-1.5 rounded-xl border border-primary/40 bg-primary/10 px-3.5 py-1.5 font-cinzel text-xs font-bold text-primary transition hover:bg-primary/20 active:scale-95"
                  title="Rola 1d20 para todos os combatentes e reordena"
                >
                  <Dices size={14} /> Rolar Todos
                </button>
                <button
                  type="button"
                  onClick={handleAdvanceTurn}
                  className="flex min-h-10 items-center gap-1.5 rounded-xl border border-amber-400/60 bg-amber-500/25 px-4 py-1.5 font-cinzel text-xs font-bold uppercase tracking-wider text-amber-200 transition hover:bg-amber-500/35 active:scale-95 shadow-md shadow-amber-500/20"
                >
                  <Play size={13} /> Avançar Turno
                </button>
              </>
            )}
            <button
              type="button"
              onClick={handleResetCombat}
              className="flex min-h-10 items-center gap-1.5 rounded-xl border border-border bg-secondary/80 px-3 py-1.5 text-xs font-semibold text-muted-foreground transition hover:border-destructive/40 hover:text-destructive active:scale-95"
            >
              <RotateCcw size={13} /> Limpar
            </button>
          </div>
        </div>

        {/* Adicionar participantes ao combate */}
        <div className="mt-4">
          <p className="mb-2 font-cinzel text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
            Adicionar à iniciativa:
          </p>
          <div className="flex flex-wrap gap-2">
            {displayedCharacters.map((character) => (
              <button
                key={character.id}
                type="button"
                onClick={() =>
                  addToInitiative({
                    id: `pc-${character.id}`,
                    name: character.name,
                    type: "Herói",
                    hp: character.hp,
                    hpMax: character.hpMax,
                  })
                }
                className="flex min-h-9 items-center gap-1.5 rounded-xl border border-primary/30 bg-primary/10 px-3 py-1 text-xs font-semibold text-primary transition hover:border-primary/60 hover:bg-primary/20 active:scale-95"
              >
                <Shield size={12} /> + {character.name}
              </button>
            ))}
            {table.npcs.map((npc) => (
              <button
                key={npc.id}
                type="button"
                onClick={() =>
                  addToInitiative({
                    ...npc,
                    type: "NPC",
                    hpMax: npc.hpMax || npc.hp || 10,
                  })
                }
                className="flex min-h-9 items-center gap-1.5 rounded-xl border border-rose-500/30 bg-rose-950/20 px-3 py-1 text-xs font-semibold text-rose-300 transition hover:border-rose-500/60 hover:bg-rose-900/30 active:scale-95"
              >
                <Skull size={12} /> + {npc.name}
              </button>
            ))}
          </div>
        </div>

        {/* Lista de Combatentes */}
        {table.initiative.length === 0 ? (
          <div className="mt-6 rounded-2xl border-2 border-dashed border-primary/20 p-8 text-center font-journal text-sm italic text-muted-foreground bg-primary/[0.02]">
            Nenhum combatente na arena. Adicione heróis ou NPCs acima para orquestrar os turnos de combate.
          </div>
        ) : (
          <div className="mt-5 space-y-2.5">
            {table.initiative.map((item, index) => {
              const isActiveTurn = index === (table.activeTurnIndex % table.initiative.length);
              const isNpc = item.type === "NPC";
              const hp = Number(item.hp) || 0;
              const hpMax = Math.max(1, Number(item.hpMax) || hp || 1);
              const hpPct = Math.min(100, Math.max(0, Math.round((hp / hpMax) * 100)));
              const isDead = hp <= 0;
              const isConditionPickerOpen = openConditionPickerId === item.id;
              const itemConditions = Array.isArray(item.conditions) ? item.conditions : [];

              return (
                <div
                  key={item.id}
                  className={`relative rounded-xl border p-3.5 transition-all ${
                    isActiveTurn
                      ? "border-amber-400/80 bg-gradient-to-r from-amber-500/15 via-card to-card shadow-[0_0_24px_rgba(245,158,11,0.2)] ring-1 ring-amber-400/50"
                      : "border-border/80 bg-secondary/40 hover:bg-secondary/60"
                  }`}
                >
                  <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                    {/* Identidade e Turno */}
                    <div className="flex items-center gap-3 min-w-0">
                      <div
                        className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-xl font-cinzel text-sm font-black ${
                          isActiveTurn
                            ? "bg-amber-400 text-black font-extrabold shadow-md shadow-amber-400/30"
                            : "border border-border bg-background text-muted-foreground"
                        }`}
                      >
                        {index + 1}
                      </div>

                      <div className="min-w-0">
                        <div className="flex items-center gap-2">
                          <strong className="truncate font-cinzel text-sm font-bold text-foreground">
                            {item.name}
                          </strong>
                          <span
                            className={`rounded-md px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-wider ${
                              isNpc
                                ? "bg-rose-950/40 text-rose-300 border border-rose-500/30"
                                : "bg-primary/20 text-primary border border-primary/40"
                            }`}
                          >
                            {item.type}
                          </span>
                          {isActiveTurn && (
                            <span className="animate-pulse rounded-md bg-amber-400/25 px-2 py-0.5 text-[9px] font-extrabold uppercase tracking-widest text-amber-300 border border-amber-400/60 shadow-sm">
                              Turno Ativo
                            </span>
                          )}
                          {isDead && (
                            <span className="rounded-md bg-rose-500/25 px-1.5 py-0.5 text-[9px] font-bold uppercase text-rose-300 border border-rose-500/40">
                              0 PV
                            </span>
                          )}
                        </div>

                        {/* Chips de Condições */}
                        <div className="mt-1.5 flex flex-wrap items-center gap-1.5">
                          {itemConditions.map((condId) => {
                            const cond = CONDITIONS_LIST.find((c) => c.id === condId);
                            if (!cond) return null;
                            return (
                              <button
                                key={condId}
                                type="button"
                                onClick={() => toggleCombatantCondition(item.id, condId)}
                                className="wax-seal bg-rose-950/60 text-rose-200 border border-rose-500/40 hover:bg-rose-900/80 transition"
                                title={`${cond.description} (clique para remover)`}
                              >
                                <span>{cond.name}</span>
                                <X size={10} className="opacity-70 hover:opacity-100" />
                              </button>
                            );
                          })}

                          <button
                            type="button"
                            onClick={() =>
                              setOpenConditionPickerId(isConditionPickerOpen ? null : item.id)
                            }
                            className="inline-flex items-center gap-1 rounded-full border border-primary/30 bg-primary/10 px-2 py-0.5 text-[9px] font-semibold text-primary/90 hover:bg-primary/20 hover:text-foreground transition"
                          >
                            <Plus size={9} /> Condição
                          </button>
                        </div>
                      </div>
                    </div>

                    {/* Controles de Iniciativa e PV */}
                    <div className="flex flex-wrap items-center gap-3">
                      {/* Entrada de Iniciativa */}
                      <label className="flex items-center gap-1 text-[11px] font-semibold text-muted-foreground font-cinzel">
                        <span>INI:</span>
                        <input
                          type="number"
                          value={item.initiative}
                          onChange={(e) =>
                            updateInitiative(item.id, { initiative: Number(e.target.value) })
                          }
                          className="h-8 w-14 rounded-lg border border-primary/40 bg-input-background px-1 text-center font-mono text-xs font-bold text-foreground outline-none focus:border-primary"
                        />
                      </label>

                      {/* Controle Rápido de PV com botões táteis */}
                      <div className="flex items-center gap-1.5 rounded-xl border border-border bg-background/90 px-2.5 py-1 shadow-inner">
                        <HeartPulse size={13} className={isDead ? "text-rose-500 animate-pulse" : "text-emerald-400"} />
                        <span className="font-mono text-xs font-bold text-foreground mr-1.5 font-tabular">
                          {item.hp}/{item.hpMax}
                        </span>

                        <div className="flex items-center gap-1">
                          <button
                            type="button"
                            onClick={() => adjustCombatantHp(item.id, -5)}
                            className="rounded-md bg-rose-950/50 border border-rose-500/30 px-1.5 py-0.5 text-[10px] font-bold text-rose-300 hover:bg-rose-900/70 active:scale-95 transition"
                            title="Dano -5"
                          >
                            -5
                          </button>
                          <button
                            type="button"
                            onClick={() => adjustCombatantHp(item.id, -1)}
                            className="rounded-md bg-rose-950/50 border border-rose-500/30 px-1.5 py-0.5 text-[10px] font-bold text-rose-300 hover:bg-rose-900/70 active:scale-95 transition"
                            title="Dano -1"
                          >
                            -1
                          </button>
                          <button
                            type="button"
                            onClick={() => adjustCombatantHp(item.id, +1)}
                            className="rounded-md bg-emerald-950/50 border border-emerald-500/30 px-1.5 py-0.5 text-[10px] font-bold text-emerald-300 hover:bg-emerald-900/70 active:scale-95 transition"
                            title="Cura +1"
                          >
                            +1
                          </button>
                          <button
                            type="button"
                            onClick={() => adjustCombatantHp(item.id, +5)}
                            className="rounded-md bg-emerald-950/50 border border-emerald-500/30 px-1.5 py-0.5 text-[10px] font-bold text-emerald-300 hover:bg-emerald-900/70 active:scale-95 transition"
                            title="Cura +5"
                          >
                            +5
                          </button>
                        </div>
                      </div>

                      {/* Remover Combatente */}
                      <button
                        type="button"
                        onClick={() => removeFromInitiative(item.id)}
                        className="rounded-lg p-2 text-muted-foreground hover:bg-destructive/20 hover:text-destructive active:scale-95 transition"
                        title="Remover da iniciativa"
                      >
                        <Trash2 size={13} />
                      </button>
                    </div>
                  </div>

                  {/* Popover Seletor de Condições */}
                  {isConditionPickerOpen && (
                    <div className="mt-3 border-t border-primary/20 pt-2.5">
                      <p className="mb-1.5 font-cinzel text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                        Aplicar condição tática:
                      </p>
                      <div className="flex flex-wrap gap-1.5">
                        {CONDITIONS_LIST.map((cond) => {
                          const active = itemConditions.includes(cond.id);
                          return (
                            <button
                              key={cond.id}
                              type="button"
                              onClick={() => toggleCombatantCondition(item.id, cond.id)}
                              className={`wax-seal transition ${
                                active
                                  ? "bg-rose-600 text-white font-black shadow-md border-rose-400"
                                  : "border border-border bg-secondary/80 text-muted-foreground hover:border-primary/50 hover:text-foreground"
                              }`}
                              title={cond.description}
                            >
                              {active ? `✓ ${cond.name}` : cond.name}
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </Card>

      <Card>
        <SectionHeader title="Heróis da campanha" icon={<Users size={15} />} />
        {loadingCharacters && <p className="text-sm text-muted-foreground">Carregando personagens...</p>}
        {characterError && <p className="border border-destructive/30 bg-destructive/10 p-3 text-sm text-destructive-foreground">{characterError}</p>}
        {!loadingCharacters && !characterError && displayedCharacters.length === 0 && <p className="text-sm text-muted-foreground">Nenhum personagem encontrado para esta mesa.</p>}
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {displayedCharacters.map((character) => (
            <div
              key={character.id}
              className="border-2 border-border bg-secondary/60 p-4 transition hover:border-primary/60 hover:bg-primary/10 rounded-xl flex flex-col justify-between"
            >
              <div>
                <div className="flex items-start justify-between gap-2">
                  <strong className="font-serif text-base text-foreground">{character.name}</strong>
                  {(character.owner?.username || character.user?.username) && (
                    <span className="text-[10px] text-muted-foreground">
                      Jogador: <strong className="text-foreground">{character.owner?.username || character.user?.username}</strong>
                    </span>
                  )}
                </div>
                <p className="mt-1 text-xs text-muted-foreground">{character.job || "Aventureiro"} · Nível {character.level || 1}</p>
                <div className="mt-3 flex items-center gap-1.5 text-xs text-primary">
                  <HeartPulse size={13} /> {character.hp}/{character.hpMax} PV
                </div>
              </div>

              <div className="mt-4 pt-3 border-t border-border/80 flex items-center justify-between gap-2">
                <button
                  type="button"
                  onClick={() => inspectCharacter(character.id)}
                  className="flex items-center gap-1 rounded bg-primary px-2.5 py-1 text-xs font-bold text-primary-foreground hover:brightness-110 active:scale-95 transition"
                >
                  <ScrollText size={12} />
                  <span>Acessar Ficha</span>
                </button>
                <Link
                  href={`/admin/personagens/${character.id}/ficha`}
                  target="_blank"
                  rel="noreferrer"
                  className="text-[10px] text-muted-foreground hover:text-foreground underline"
                  title="Visão Administrativa Rápida"
                >
                  Visão Rápida ↗
                </Link>
              </div>
            </div>
          ))}
        </div>
      </Card>
      </>
      )}
    </div>
  );
}
