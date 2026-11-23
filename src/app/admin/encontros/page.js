"use client";

import { useEffect, useState } from "react";
import {
  Clock,
  Dices,
  Flame,
  HeartPulse,
  History,
  Play,
  Plus,
  RotateCcw,
  Shield,
  ShieldAlert,
  Skull,
  Swords,
  Trash2,
  Trophy,
  Users,
  X,
} from "lucide-react";
import { Card, SectionHeader } from "../../components/ui";
import ConfirmDialog from "../../components/admin/ConfirmDialog";
import { BattleLogEntryRow } from "../../components/batalha/BattleLogPanel";
import {
  createEncounter,
  deleteEncounter,
  fetchCharacterFromBackend,
  listBattleLog,
  listCampaigns,
  listCharacters,
  listEncounters,
  listNpcs,
  updateCharacterOnBackend,
  updateEncounter,
} from "../../../lib/api";
import { normalizeLegacyBattleLogEntry } from "../../../lib/battleLog";
import { CONDITIONS_LIST, advanceTurn, applyHealthChange } from "../../../lib/modifiers";
import { rollDice } from "../../../lib/dice";
import { getEncounterXpReward } from "../../../lib/encounter";
import { EncounterXpPanel } from "../../components/admin/EncounterXpPanel";
import FinalizarEncounterModal from "../../components/admin/FinalizarEncounterModal";
import { useAuth } from "../../context/AuthContext";

export default function AdminEncontrosPage() {
  const { token, isMaster } = useAuth();

  const [campaigns, setCampaigns] = useState([]);
  const [selectedCampaignId, setSelectedCampaignId] = useState("");
  const [encounters, setEncounters] = useState([]);
  const [heroes, setHeroes] = useState([]);
  const [npcs, setNpcs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [successMsg, setSuccessMsg] = useState("");

  // Criação
  const [isCreating, setIsCreating] = useState(false);
  const [novoNome, setNovoNome] = useState("");
  const [novoTipo, setNovoTipo] = useState("combate");
  const [novoXp, setNovoXp] = useState(100);
  const [novoTesouro, setNovoTesouro] = useState("");

  // Encontro ativo sendo conduzido
  const [activeEncounter, setActiveEncounter] = useState(null);

  // Exclusão
  const [encounterToDelete, setEncounterToDelete] = useState(null);

  const [openConditionPickerId, setOpenConditionPickerId] = useState(null);
  const [distributing, setDistributing] = useState(false);
  const [confirmDistribute, setConfirmDistribute] = useState(false);
  const [finalizeOpen, setFinalizeOpen] = useState(false);

  // Log persistente da batalha: entradas marcadas pelo encontro a que pertencem,
  // para nunca renderizar eventos do encontro anterior enquanto a carga está em curso
  const [battleLogState, setBattleLogState] = useState({ encounterId: null, entradas: null });

  const fetchBattleLog = async (campId, encounterId, { silent = false } = {}) => {
    if (!campId || !encounterId) return;
    try {
      const data = await listBattleLog(campId, { encontroId: encounterId, limit: 200 }, token);
      setBattleLogState({ encounterId, entradas: Array.isArray(data?.entradas) ? data.entradas : [] });
    } catch (err) {
      if (!silent) {
        console.warn("Log de batalha indisponível, usando histórico legado:", err?.message || err);
        setBattleLogState({ encounterId, entradas: null }); // null = servidor indisponível → fallback legado
      }
    }
  };

  useEffect(() => {
    if (!isMaster) return;
    listCampaigns(token)
      .then((camps) => {
        setCampaigns(camps || []);
        if (camps && camps.length > 0) {
          setSelectedCampaignId(camps[0].id);
        }
      })
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));

    listCharacters(token).then((data) => setHeroes(data || [])).catch(() => {});
    listNpcs({}, token).then((data) => setNpcs(data || [])).catch(() => {});
  }, [isMaster, token]);

  const loadEncounters = async (campId) => {
    if (!campId) return;
    try {
      const data = await listEncounters(campId, token);
      const list = Array.isArray(data) ? data : [];
      setEncounters(list);
      const active = list.find((e) => e.ativo) || list[0] || null;
      setActiveEncounter(active);
    } catch (err) {
      setError(err.message);
    }
  };

  useEffect(() => {
    if (selectedCampaignId) {
      loadEncounters(selectedCampaignId);
    }
  }, [selectedCampaignId]);

  // Polling leve do log da batalha enquanto o encontro está aberto
  useEffect(() => {
    if (!selectedCampaignId || !activeEncounter?.id) return undefined;
    fetchBattleLog(selectedCampaignId, activeEncounter.id);
    const id = window.setInterval(
      () => fetchBattleLog(selectedCampaignId, activeEncounter.id, { silent: true }),
      5000
    );
    return () => window.clearInterval(id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedCampaignId, activeEncounter?.id]);

  const handleCreateEncounter = async (e) => {
    e.preventDefault();
    if (!novoNome.trim()) return;
    if (!selectedCampaignId) {
      setError("Selecione ou crie uma campanha antes de forjar o encontro.");
      return;
    }
    try {
      const created = await createEncounter(
        selectedCampaignId,
        {
          nome: novoNome.trim(),
          tipo: novoTipo,
          ativo: true,
          recursos: { xp: Number(novoXp), tesouro: novoTesouro.trim() },
        },
        token
      );
      setNovoNome("");
      setIsCreating(false);
      setSuccessMsg("Encontro forjado com sucesso.");
      loadEncounters(selectedCampaignId);
      setActiveEncounter(created);
    } catch (err) {
      setError(err.message);
    }
  };

  const syncEncounterUpdate = async (patch, logMsg = null, logTipo = "sistema") => {
    if (!activeEncounter) return;
    try {
      const updated = await updateEncounter(
        activeEncounter.id,
        {
          ...patch,
          novoEventoLog: logMsg,
          tipoEventoLog: logTipo,
        },
        token
      );
      setActiveEncounter(updated);
      setEncounters((prev) => prev.map((e) => (e.id === updated.id ? updated : e)));
      fetchBattleLog(selectedCampaignId, updated.id, { silent: true });
    } catch (err) {
      setError(err.message);
    }
  };

  const handleAddHeroToEncounter = (char) => {
    const list = activeEncounter.dadosExtras?.iniciativa || [];
    const combatantId = `pc-${char.id}`;
    if (list.some((item) => item.id === combatantId)) return;

    const newList = [
      ...list,
      {
        id: combatantId,
        name: char.name,
        type: "Herói",
        hp: char.hp,
        hpMax: char.hpMax,
        initiative: 0,
        conditions: [],
      },
    ];

    syncEncounterUpdate(
      { dadosExtras: { ...(activeEncounter.dadosExtras || {}), iniciativa: newList } },
      `Herói ${char.name} entrou no combate.`,
      "entrada"
    );
  };

  const handleAddNpcToEncounter = (npc) => {
    const list = activeEncounter.dadosExtras?.iniciativa || [];
    const combatantId = `npc-${npc.id}-${list.length + 1}`;

    const newList = [
      ...list,
      {
        id: combatantId,
        name: npc.nome,
        type: "NPC",
        hp: npc.hp,
        hpMax: npc.hpMax,
        initiative: Number(npc.dadosExtras?.iniciativa || 0),
        conditions: [],
      },
    ];

    syncEncounterUpdate(
      { dadosExtras: { ...(activeEncounter.dadosExtras || {}), iniciativa: newList } },
      `Ameaça ${npc.nome} posicionada no campo de batalha.`,
      "entrada"
    );
  };

  const handleAdjustHp = (combatantId, delta) => {
    const list = activeEncounter.dadosExtras?.iniciativa || [];
    const item = list.find((c) => c.id === combatantId);
    if (!item) return;

    const res = applyHealthChange(item.hp, item.hpMax || 10, delta);
    const updatedList = list.map((c) => (c.id === combatantId ? { ...c, hp: res.currentHp } : c));

    syncEncounterUpdate(
      { dadosExtras: { ...(activeEncounter.dadosExtras || {}), iniciativa: updatedList } },
      `${item.name} sofreu ${delta < 0 ? `${Math.abs(delta)} de dano` : `${delta} de cura`} (PV: ${res.currentHp}/${item.hpMax}).`,
      delta < 0 ? "dano" : "cura"
    );
  };

  const handleToggleCondition = (combatantId, condId) => {
    const list = activeEncounter.dadosExtras?.iniciativa || [];
    const item = list.find((c) => c.id === combatantId);
    if (!item) return;

    const conds = item.conditions || [];
    const has = conds.includes(condId);
    const updatedConds = has ? conds.filter((c) => c !== condId) : [...conds, condId];
    const updatedList = list.map((c) => (c.id === combatantId ? { ...c, conditions: updatedConds } : c));

    syncEncounterUpdate(
      { dadosExtras: { ...(activeEncounter.dadosExtras || {}), iniciativa: updatedList } },
      `${has ? "Removida condição" : "Aplicada condição"} ${condId} em ${item.name}.`,
      "condicao"
    );
  };

  const handleRollAllInitiatives = () => {
    const list = activeEncounter.dadosExtras?.iniciativa || [];
    const updated = list.map((item) => {
      const roll = rollDice({ sides: 20, label: `Iniciativa: ${item.name}` });
      return { ...item, initiative: roll.total };
    });

    updated.sort((a, b) => Number(b.initiative) - Number(a.initiative));

    syncEncounterUpdate(
      {
        dadosExtras: {
          ...(activeEncounter.dadosExtras || {}),
          iniciativa: updated,
          activeTurnIndex: 0,
        },
      },
      "Iniciativa rolada para todos os combatentes e reordenada.",
      "iniciativa"
    );
  };

  const handleAdvance = () => {
    const list = activeEncounter.dadosExtras?.iniciativa || [];
    if (!list.length) return;

    const currentIndex = activeEncounter.dadosExtras?.activeTurnIndex || 0;
    const currentRound = activeEncounter.dadosExtras?.combatRound || 1;
    const next = advanceTurn(list, currentIndex, currentRound);

    syncEncounterUpdate(
      {
        dadosExtras: {
          ...(activeEncounter.dadosExtras || {}),
          activeTurnIndex: next.turnIndex,
          combatRound: next.round,
        },
      },
      `Avançado para o turno de ${list[next.turnIndex]?.name} (Rodada ${next.round}).`,
      "turno"
    );
  };

  const handleDistributeXp = async () => {
    if (!activeEncounter) return;
    const reward = getEncounterXpReward(activeEncounter);
    if (reward <= 0) {
      setConfirmDistribute(false);
      setError("Defina uma recompensa de XP maior que zero.");
      return;
    }
    const combatants = (activeEncounter.dadosExtras?.iniciativa || []).filter((c) => c.type === "Herói");
    if (combatants.length === 0) {
      setConfirmDistribute(false);
      setError("Nenhum herói no encontro para receber XP.");
      return;
    }
    const perHero = Math.floor(reward / combatants.length);
    setDistributing(true);
    setError("");
    try {
      const heroIds = combatants.map((combatant) => String(combatant.id).replace(/^pc-/, ""));
      const freshes = await Promise.all(
        heroIds.map((heroId) => fetchCharacterFromBackend(heroId, token).catch(() => null))
      );
      const missingIndex = freshes.findIndex((hero) => !hero);
      if (missingIndex !== -1) {
        setError(`Não foi possível ler o XP atual de ${combatants[missingIndex]?.name || "um herói"}. Nada foi alterado.`);
        setConfirmDistribute(false);
        return;
      }
      const awarded = [];
      const awardedNewXp = new Map();
      for (const [index, combatant] of combatants.entries()) {
        const charId = heroIds[index];
        const freshHero = freshes[index];
        const currentXp = Number(freshHero.xp ?? freshHero.experiencia) || 0;
        const newXp = currentXp + perHero;
        await updateCharacterOnBackend(charId, { xp: newXp }, token);
        awarded.push({ id: charId, name: freshHero.name || combatant.name });
        awardedNewXp.set(String(charId), newXp);
      }
      if (awardedNewXp.size > 0) {
        setHeroes((prev) =>
          prev.map((h) => (awardedNewXp.has(String(h.id)) ? { ...h, xp: awardedNewXp.get(String(h.id)) } : h))
        );
      }
      const names = awarded.map((h) => h.name).join(", ") || "nenhum herói encontrado";
      await syncEncounterUpdate(
        { dadosExtras: { ...(activeEncounter.dadosExtras || {}), xpDistribuidoEm: new Date().toISOString() } },
        `Recompensa de ${reward} XP (total) distribuída — ${perHero} XP por herói — para: ${names}.`,
        "recursos"
      );
      setSuccessMsg(`${reward} XP (total) dividido em ${perHero} XP para cada um dos ${awarded.length} herói(s).`);
      setConfirmDistribute(false);
    } catch (err) {
      setError(err.message || "Falha ao distribuir XP.");
      setConfirmDistribute(false);
    } finally {
      setDistributing(false);
    }
  };

  const handleFinalizeEncounter = async (rows) => {
    if (!activeEncounter) return { ok: false, message: "Nenhum encontro ativo." };
    setError("");
    try {
      const xpRows = rows.filter((row) => row.included && Math.max(0, Math.floor(Number(row.xp) || 0)) > 0);
      const freshes = await Promise.all(
        xpRows.map((row) => fetchCharacterFromBackend(row.id, token).catch(() => null))
      );
      const missingIndex = freshes.findIndex((hero) => !hero);
      if (missingIndex !== -1) {
        return {
          ok: false,
          message: `Não foi possível ler o XP atual de ${xpRows[missingIndex]?.name || "um herói"}. Nada foi alterado.`,
        };
      }
      const freshById = new Map(xpRows.map((row, index) => [String(row.id), freshes[index]]));
      const vitoria = [];
      const derrota = [];
      const fuga = [];
      const xpGained = new Map();
      for (const row of rows) {
        if (row.outcome === "derrota") derrota.push(row.name);
        else if (row.outcome === "fuga") fuga.push(row.name);
        else vitoria.push(row.name);
        const amount = Math.max(0, Math.floor(Number(row.xp) || 0));
        const hero = freshById.get(String(row.id));
        if (hero && row.included && amount > 0) {
          const currentXp = Number(hero.xp ?? hero.experiencia) || 0;
          const newXp = currentXp + amount;
          await updateCharacterOnBackend(hero.id, { xp: newXp }, token);
          xpGained.set(String(hero.id), newXp);
        }
      }
      if (xpGained.size > 0) {
        setHeroes((prev) => prev.map((h) => (xpGained.has(String(h.id)) ? { ...h, xp: xpGained.get(String(h.id)) } : h)));
      }
      const summary = rows
        .map((row) =>
          row.outcome === "vitoria"
            ? `${row.name} +${row.xp} XP`
            : row.outcome === "derrota"
              ? `${row.name} (derrota)`
              : `${row.name} (fugiu)`
        )
        .join("; ");
      const detalhes = [`Encontro "${activeEncounter.nome}" finalizado. ${summary}.`];
      if (derrota.length > 0) detalhes.push(`Derrota: ${derrota.join(", ")}.`);
      if (fuga.length > 0) detalhes.push(`Fugiram: ${fuga.join(", ")}.`);
      const updated = await updateEncounter(
        activeEncounter.id,
        {
          ativo: false,
          dadosExtras: {
            ...(activeEncounter.dadosExtras || {}),
            ...(xpGained.size > 0 ? { xpDistribuidoEm: new Date().toISOString() } : {}),
            finalizadoEm: new Date().toISOString(),
            resultado: {
              vitoria,
              derrota,
              fuga,
              xpPorHeroi: Object.fromEntries(rows.map((row) => [row.name, row.included ? row.xp : 0])),
            },
          },
          novoEventoLog: detalhes.join(" "),
          tipoEventoLog: "recursos",
        },
        token
      );
      setActiveEncounter(updated);
      setEncounters((prev) => prev.map((encounterItem) => (encounterItem.id === updated.id ? updated : encounterItem)));
      fetchBattleLog(selectedCampaignId, updated.id, { silent: true });
      setSuccessMsg(
        xpGained.size > 0
          ? `Encontro finalizado — ${xpGained.size} herói(s) receberam XP.`
          : "Encontro finalizado sem distribuição de XP."
      );
      return { ok: true };
    } catch (err) {
      return { ok: false, message: err?.message || "Falha ao finalizar o encontro." };
    }
  };

  const handleDeleteEncounter = async () => {
    if (!encounterToDelete) return;
    try {
      await deleteEncounter(encounterToDelete.id, token);
      setEncounterToDelete(null);
      setSuccessMsg("Encontro removido com sucesso.");
      loadEncounters(selectedCampaignId);
    } catch (err) {
      setError(err.message);
      setEncounterToDelete(null);
    }
  };

  if (!isMaster) return null;

  const currentInitiative = activeEncounter?.dadosExtras?.iniciativa || [];
  const currentRound = activeEncounter?.dadosExtras?.combatRound || 1;
  const currentTurnIndex = activeEncounter?.dadosExtras?.activeTurnIndex || 0;
  const legacyCombatLog = (activeEncounter?.dadosExtras?.logHistorico || []).map(
    normalizeLegacyBattleLogEntry
  );
  // Prefere o log persistido no servidor; cai no legado (JSONB) enquanto ele não responde
  const battleLog =
    activeEncounter?.id && battleLogState.encounterId === activeEncounter.id
      ? battleLogState.entradas
      : null;
  const combatLog = battleLog?.length ? battleLog : legacyCombatLog;

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between border-b-2 border-primary/40 pb-4">
        <div>
          <span className="text-[10px] font-bold uppercase tracking-[0.3em] text-primary">
            Câmara do Mestre · Sala de Guerra Tática
          </span>
          <h1 className="mt-1 font-serif text-3xl font-black uppercase tracking-wider text-foreground">
            Encontros, Condições & Histórico
          </h1>
          <p className="text-xs text-muted-foreground">
            Gerencie rodadas, iniciativa sincronizada, condições ativas e histórico de alterações em tempo real.
          </p>
        </div>

        <div className="flex items-center gap-2">
          {campaigns.length > 0 && (
            <select
              value={selectedCampaignId}
              onChange={(e) => setSelectedCampaignId(e.target.value)}
              className="h-10 rounded-lg border border-border bg-input-background px-3 text-xs text-foreground outline-none focus:border-primary"
            >
              {campaigns.map((c) => (
                <option key={c.id} value={c.id}>
                  Campanha: {c.nome}
                </option>
              ))}
            </select>
          )}

          <button
            type="button"
            onClick={() => setIsCreating(!isCreating)}
            className="flex min-h-10 items-center gap-1.5 rounded-lg bg-primary px-3.5 text-xs font-bold uppercase tracking-wider text-primary-foreground hover:brightness-110 active:scale-95 shadow-md shadow-primary/20"
          >
            <Plus size={14} /> Novo Encontro
          </button>
        </div>
      </div>

      {successMsg && (
        <div className="border border-emerald-500/40 bg-emerald-950/20 p-3 text-sm text-emerald-300">
          {successMsg}
        </div>
      )}
      {error && (
        <div className="border border-destructive/40 bg-destructive/10 p-4 text-sm text-destructive-foreground">
          {error}
        </div>
      )}

      {/* Formulário de Criação de Encontro */}
      {isCreating && (
        <Card className="border-2 border-primary/40">
          <SectionHeader title="Criar Encontro Tático" icon={<Swords size={16} />} />
          <form onSubmit={handleCreateEncounter} className="mt-4 space-y-4">
            <div className="grid gap-4 sm:grid-cols-[1.5fr_1fr_1fr]">
              <div>
                <label className="block text-xs font-bold uppercase text-muted-foreground">
                  Nome do Encontro *
                </label>
                <input
                  type="text"
                  required
                  value={novoNome}
                  onChange={(e) => setNovoNome(e.target.value)}
                  placeholder="Ex.: Emboscada nas Ruínas Antigas"
                  className="mt-1 min-h-10 w-full rounded border border-border bg-input-background px-3 text-xs text-foreground outline-none focus:border-primary"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase text-muted-foreground">
                  Tipo de Encontro
                </label>
                <select
                  value={novoTipo}
                  onChange={(e) => setNovoTipo(e.target.value)}
                  className="mt-1 min-h-10 w-full rounded border border-border bg-input-background px-3 text-xs text-foreground outline-none focus:border-primary"
                >
                  <option value="combate">Combate Tático</option>
                  <option value="social">Desafio Social / Negociação</option>
                  <option value="exploracao">Exploração / Armadilhas</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase text-muted-foreground">
                  XP Total do Encontro
                </label>
                <input
                  type="number"
                  min="0"
                  value={novoXp}
                  onChange={(e) => setNovoXp(Number(e.target.value))}
                  title="Total do encontro: dividido igualmente entre os heróis da iniciativa"

                  className="mt-1 min-h-10 w-full rounded border border-border bg-input-background px-3 text-xs text-foreground outline-none focus:border-primary"
                />
              </div>
            </div>

            <div className="flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setIsCreating(false)}
                className="rounded border border-border px-3 py-1.5 text-xs text-muted-foreground hover:bg-secondary"
              >
                Cancelar
              </button>
              <button
                type="submit"
                className="rounded bg-primary px-4 py-1.5 text-xs font-bold uppercase text-primary-foreground hover:brightness-110"
              >
                Criar Encontro
              </button>
            </div>
          </form>
        </Card>
      )}

      {/* Seletor de Encontro Ativo */}
      <div className="flex flex-wrap items-center gap-2">
        <span className="text-xs font-bold uppercase text-muted-foreground">Encontros:</span>
        {encounters.map((enc) => (
          <button
            key={enc.id}
            type="button"
            onClick={() => setActiveEncounter(enc)}
            className={`rounded-xl px-3 py-1.5 text-xs font-bold uppercase transition ${
              activeEncounter?.id === enc.id
                ? "bg-primary text-primary-foreground shadow-md shadow-primary/20"
                : "border border-border bg-secondary/50 text-muted-foreground hover:border-primary/40 hover:text-foreground"
            }`}
          >
            {enc.nome}
          </button>
        ))}
      </div>

      {activeEncounter ? (
        <div className="grid gap-6 lg:grid-cols-[1.3fr_0.7fr]">
          {/* Coluna 1: Rastreador de Iniciativa, Rodadas e Condições */}
          <div className="space-y-4">
            <Card className="border-2 border-primary/30">
              <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border pb-3">
                <div className="flex items-center gap-3">
                  <SectionHeader title={activeEncounter.nome} icon={<Swords size={16} />} />
                  <span className="rounded-full border border-primary/40 bg-primary/15 px-2.5 py-0.5 font-serif text-xs font-bold text-primary">
                    Rodada {currentRound}
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={handleRollAllInitiatives}
                    className="flex min-h-9 items-center gap-1.5 rounded-lg border border-primary/40 bg-primary/10 px-3 text-xs font-semibold text-primary hover:bg-primary/20"
                  >
                    <Dices size={14} /> Rolar Todos
                  </button>
                  <button
                    type="button"
                    onClick={handleAdvance}
                    className="flex min-h-9 items-center gap-1.5 rounded-lg bg-primary px-3 text-xs font-bold uppercase text-primary-foreground hover:brightness-110 active:scale-95 shadow-sm shadow-primary/20"
                  >
                    <Play size={13} /> Avançar Turno
                  </button>
                  {activeEncounter.ativo !== false ? (
                    <button
                      type="button"
                      onClick={() => setFinalizeOpen(true)}
                      className="flex min-h-9 items-center gap-1.5 rounded-lg border border-amber-500/60 bg-amber-500/20 px-3 text-xs font-bold uppercase text-amber-200 transition hover:bg-amber-500/30 active:scale-95"
                      title="Quem recebe XP, quanto e o desfecho de cada herói — encerra o encontro"
                    >
                      <Trophy size={13} /> Finalizar
                    </button>
                  ) : (
                    <span className="flex min-h-9 items-center gap-1.5 rounded-lg border border-emerald-500/40 bg-emerald-500/10 px-3 text-[10px] font-bold uppercase tracking-wider text-emerald-300">
                      <Trophy size={13} /> Finalizado
                    </span>
                  )}
                </div>
              </div>

              {/* Inclusão Rápida no Combate */}
              <div className="mt-4 border-b border-border/70 pb-3">
                <p className="mb-2 text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                  Adicionar ao Encontro:
                </p>
                <div className="flex flex-wrap gap-1.5">
                  {heroes.map((h) => (
                    <button
                      key={h.id}
                      type="button"
                      onClick={() => handleAddHeroToEncounter(h)}
                      className="rounded border border-primary/30 bg-primary/10 px-2 py-0.5 text-xs text-primary hover:bg-primary/20"
                    >
                      + {h.name}
                    </button>
                  ))}
                  {npcs.map((n) => (
                    <button
                      key={n.id}
                      type="button"
                      onClick={() => handleAddNpcToEncounter(n)}
                      className="rounded border border-accent/30 bg-accent/10 px-2 py-0.5 text-xs text-accent hover:bg-accent/20"
                    >
                      + {n.nome}
                    </button>
                  ))}
                </div>
              </div>

              {/* Lista de Combatentes */}
              <div className="mt-4 space-y-2.5">
                {currentInitiative.length === 0 ? (
                  <p className="py-8 text-center text-xs text-muted-foreground">
                    Nenhum combatente na iniciativa. Adicione acima ou aguarde os jogadores enviarem de suas fichas.
                  </p>
                ) : (
                  currentInitiative.map((c, index) => {
                    const isActive = index === (currentTurnIndex % currentInitiative.length);
                    const isNpc = c.type === "NPC";
                    const isDead = Number(c.hp || 0) <= 0;
                    const itemConditions = Array.isArray(c.conditions) ? c.conditions : [];
                    const isPickerOpen = openConditionPickerId === c.id;

                    return (
                      <div
                        key={c.id}
                        className={`rounded-xl border-2 p-3 transition-all ${
                          isActive
                            ? "border-primary bg-primary/15 shadow-lg shadow-primary/15"
                            : "border-border bg-secondary/40"
                        }`}
                      >
                        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                          <div className="flex items-center gap-3">
                            <span
                              className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg font-serif text-xs font-bold ${
                                isActive
                                  ? "bg-primary text-primary-foreground"
                                  : "border border-border bg-background text-muted-foreground"
                              }`}
                            >
                              {index + 1}
                            </span>
                            <div>
                              <div className="flex items-center gap-2">
                                <strong className="text-sm font-semibold text-foreground">
                                  {c.name}
                                </strong>
                                <span
                                  className={`rounded px-1.5 py-0.2 text-[10px] font-bold uppercase ${
                                    isNpc ? "bg-accent/20 text-accent" : "bg-primary/20 text-primary"
                                  }`}
                                >
                                  {c.type}
                                </span>
                                {isActive && (
                                  <span className="rounded bg-primary/20 px-1.5 py-0.2 text-[10px] font-bold text-primary">
                                    Turno Ativo
                                  </span>
                                )}
                              </div>
                              {/* Chips de Condições */}
                              <div className="mt-1 flex flex-wrap gap-1">
                                {itemConditions.map((condId) => (
                                  <button
                                    key={condId}
                                    type="button"
                                    onClick={() => handleToggleCondition(c.id, condId)}
                                    className="rounded bg-rose-950/40 px-1.5 py-0.2 text-[10px] font-semibold text-rose-300 border border-rose-500/30 hover:bg-rose-900/60"
                                  >
                                    {condId} ×
                                  </button>
                                ))}
                                <button
                                  type="button"
                                  onClick={() =>
                                    setOpenConditionPickerId(isPickerOpen ? null : c.id)
                                  }
                                  className="rounded border border-border px-1.5 py-0.2 text-[10px] text-muted-foreground hover:border-primary"
                                >
                                  + Condição
                                </button>
                              </div>
                            </div>
                          </div>

                          {/* Ajustes de PV */}
                          <div className="flex items-center gap-2">
                            <div className="flex items-center gap-1 font-mono text-xs font-semibold mr-2">
                              <HeartPulse size={13} className={isDead ? "text-rose-500" : "text-emerald-400"} />
                              <span>
                                {c.hp}/{c.hpMax}
                              </span>
                            </div>

                            <div className="flex items-center gap-0.5">
                              <button
                                type="button"
                                onClick={() => handleAdjustHp(c.id, -5)}
                                className="rounded px-1.5 py-0.5 text-[10px] font-bold text-rose-400 hover:bg-rose-500/20"
                              >
                                -5
                              </button>
                              <button
                                type="button"
                                onClick={() => handleAdjustHp(c.id, -1)}
                                className="rounded px-1.5 py-0.5 text-[10px] font-bold text-rose-400 hover:bg-rose-500/20"
                              >
                                -1
                              </button>
                              <button
                                type="button"
                                onClick={() => handleAdjustHp(c.id, 1)}
                                className="rounded px-1.5 py-0.5 text-[10px] font-bold text-emerald-400 hover:bg-emerald-500/20"
                              >
                                +1
                              </button>
                              <button
                                type="button"
                                onClick={() => handleAdjustHp(c.id, 5)}
                                className="rounded px-1.5 py-0.5 text-[10px] font-bold text-emerald-400 hover:bg-emerald-500/20"
                              >
                                +5
                              </button>
                            </div>
                          </div>
                        </div>

                        {/* Picker de Condições */}
                        {isPickerOpen && (
                          <div className="mt-3 border-t border-border pt-2 flex flex-wrap gap-1">
                            {CONDITIONS_LIST.map((cond) => {
                              const active = itemConditions.includes(cond.id);
                              return (
                                <button
                                  key={cond.id}
                                  type="button"
                                  onClick={() => handleToggleCondition(c.id, cond.id)}
                                  className={`rounded px-1.5 py-0.5 text-[10px] transition ${
                                    active
                                      ? "bg-rose-600 text-white font-bold"
                                      : "border border-border bg-secondary text-muted-foreground hover:border-primary"
                                  }`}
                                >
                                  {active ? `✓ ${cond.name}` : cond.name}
                                </button>
                              );
                            })}
                          </div>
                        )}
                      </div>
                    );
                  })
                )}
              </div>
            </Card>
          </div>

          {/* Coluna 2: Recompensa de XP + Histórico de Alterações em Tempo Real (Combat Log) */}
          <div className="flex flex-col gap-4">
            <EncounterXpPanel
              encounter={activeEncounter}
              heroes={heroes}
              onDistribute={() => setConfirmDistribute(true)}
              distributing={distributing}
              onFinalizeEncounter={() => setFinalizeOpen(true)}
            />
            <Card className="h-full max-h-[600px] flex flex-col justify-between">
              <div>
                <SectionHeader title="Histórico de Alterações" icon={<History size={16} />} />
                <p className="mt-1 text-xs text-muted-foreground">
                  Eventos, dano, condições e iniciativas registradas no combate.
                </p>

                <div data-lenis-prevent className="mt-4 space-y-2 max-h-[420px] overflow-y-auto pr-1">
                  {combatLog.length === 0 ? (
                    <p className="py-8 text-center text-xs text-muted-foreground">
                      Nenhum evento registrado ainda.
                    </p>
                  ) : (
                    combatLog.slice().reverse().map((entry) => (
                      <BattleLogEntryRow key={entry.id} entry={entry} dense />
                    ))
                  )}
                </div>
              </div>

              <div className="mt-4 border-t border-border pt-2 flex justify-between items-center text-xs text-muted-foreground">
                <span>{combatLog.length} eventos no log</span>
                <button
                  type="button"
                  onClick={() => setEncounterToDelete(activeEncounter)}
                  className="text-rose-400 hover:underline"
                >
                  Excluir Encontro
                </button>
              </div>
            </Card>
          </div>
        </div>
      ) : null}

      {/* Modal de Finalização do Encontro */}
      <FinalizarEncounterModal
        isOpen={finalizeOpen}
        onClose={() => setFinalizeOpen(false)}
        encounter={activeEncounter}
        heroes={heroes}
        onFinalize={handleFinalizeEncounter}
      />

      {/* Confirmação de Distribuição de XP */}
      <ConfirmDialog
        isOpen={confirmDistribute}
        title={`Distribuir ${getEncounterXpReward(activeEncounter)} XP para a party?`}
        message={`Cada herói presente no encontro (${(activeEncounter?.dadosExtras?.iniciativa || []).filter((c) => c.type === "Herói").map((c) => c.name).join(", ") || "nenhum"}) receberá ${Math.floor(getEncounterXpReward(activeEncounter) / Math.max(1, (activeEncounter?.dadosExtras?.iniciativa || []).filter((c) => c.type === "Herói").length))} XP na ficha (total do encontro dividido). Esta ação não pode ser desfeita automaticamente.`}
        confirmText="Distribuir XP"
        cancelText="Cancelar"
        dangerLevel="warning"
        onConfirm={handleDistributeXp}
        onCancel={() => setConfirmDistribute(false)}
      />

      {/* Confirmação de Exclusão */}
      <ConfirmDialog
        isOpen={Boolean(encounterToDelete)}
        title={`Excluir encontro "${encounterToDelete?.nome}"?`}
        message="O encontro e todo o seu histórico de combate serão excluídos da campanha."
        onConfirm={handleDeleteEncounter}
        onCancel={() => setEncounterToDelete(null)}
      />
    </div>
  );
}
