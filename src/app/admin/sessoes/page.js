"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import {
  Calendar,
  Check,
  CheckCircle2,
  Clock,
  Crown,
  FileText,
  Gift,
  History,
  ListTodo,
  LoaderCircle,
  NotebookPen,
  Plus,
  Save,
  Sparkles,
  Trash2,
} from "lucide-react";
import { Card, SectionHeader } from "../../components/ui";
import ConfirmDialog from "../../components/admin/ConfirmDialog";
import {
  createGameSession,
  deleteGameSession,
  fetchCharacterFromBackend,
  listCampaigns,
  listCharacters,
  listGameSessions,
  updateCharacterOnBackend,
  updateGameSession,
} from "../../../lib/api";
import { useAuth } from "../../context/AuthContext";

const ESTADO_SESSAO = {
  planejada: { label: "Planejada", cls: "border-sky-500/40 bg-sky-500/10 text-sky-300" },
  em_andamento: { label: "Em Andamento", cls: "border-amber-500/40 bg-amber-500/10 text-amber-300" },
  concluida: { label: "Concluída", cls: "border-emerald-500/40 bg-emerald-500/10 text-emerald-300" },
  cancelada: { label: "Cancelada", cls: "border-rose-500/40 bg-rose-500/10 text-rose-300" },
};

function estadoMeta(estado) {
  return ESTADO_SESSAO[estado] ?? { label: estado || "Planejada", cls: "border-border text-muted-foreground" };
}

function SessionNotesField({ session, onSave }) {
  const [texto, setTexto] = useState(session.resumo ?? "");
  const [saving, setSaving] = useState(false);
  const dirty = texto !== (session.resumo ?? "");

  const handleSave = async () => {
    setSaving(true);
    try {
      await onSave(session, texto);
    } finally {
      setSaving(false);
    }
  };

  const saveRef = useRef(handleSave);
  useEffect(() => {
    saveRef.current = handleSave;
  });

  useEffect(() => {
    if (!dirty) return;
    const timer = setTimeout(() => {
      saveRef.current();
    }, 900);
    return () => clearTimeout(timer);
  }, [texto, dirty]);

  return (
    <div className="rounded-xl border border-primary/25 bg-background/40 p-3">
      <div className="mb-2 flex items-center justify-between gap-2">
        <label className="flex items-center gap-1.5 font-serif text-xs font-bold uppercase tracking-wider text-primary" htmlFor={`notas-${session.id}`}>
          <NotebookPen size={13} className="text-primary" /> O que aconteceu na sessão?
        </label>
        <button
          type="button"
          onClick={handleSave}
          disabled={!dirty || saving}
          className="flex min-h-9 items-center gap-1.5 rounded-lg border border-primary/40 bg-primary/10 px-2.5 text-[10px] font-bold uppercase tracking-wider text-primary transition hover:bg-primary/20 disabled:cursor-not-allowed disabled:opacity-40"
        >
          {saving ? <LoaderCircle size={12} className="animate-spin" /> : <Save size={12} />}
          Salvar registro
        </button>
      </div>
      <textarea
        id={`notas-${session.id}`}
        value={texto}
        onChange={(e) => setTexto(e.target.value)}
        rows={3}
        placeholder="Resumo do que rolou na mesa: cenas marcantes, decisões tomadas, XP pago, recados dos heróis..."
        className="w-full resize-none rounded-lg border border-border bg-input-background px-3 py-2 text-xs text-foreground outline-none placeholder:text-muted-foreground/60 focus:border-primary"
      />
    </div>
  );
}

export default function AdminSessoesPage() {
  const { token, isMaster } = useAuth();

  const [campaigns, setCampaigns] = useState([]);
  const [selectedCampaignId, setSelectedCampaignId] = useState("");
  const [sessoes, setSessoes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [successMsg, setSuccessMsg] = useState("");

  // Criação de sessão
  const [isCreating, setIsCreating] = useState(false);
  const [sessionNum, setSessionNum] = useState(1);
  const [sessionTitle, setSessionTitle] = useState("");
  const [sessionDate, setSessionDate] = useState("");
  const [cenas, setCenas] = useState([
    { id: "c-1", titulo: "", descricao: "", concluido: false },
  ]);
  const [objetivos, setObjetivos] = useState([
    { id: "o-1", texto: "", concluido: false, tipo: "principal" },
  ]);
  const [recompensaXp, setRecompensaXp] = useState(250);
  const [recompensaTesouro, setRecompensaTesouro] = useState("50 peças de prata e uma poção de cura");
  const [resumoPosJogo, setResumoPosJogo] = useState("");

  const criarCenaVazia = () => ({
    id: `c-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
    titulo: "",
    descricao: "",
    concluido: false,
  });

  const criarObjetivoVazio = () => ({
    id: `o-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
    texto: "",
    concluido: false,
    tipo: "principal",
  });

  const adicionarCena = () => setCenas((prev) => [...prev, criarCenaVazia()]);

  const atualizarCena = (id, patch) =>
    setCenas((prev) => prev.map((cena) => (cena.id === id ? { ...cena, ...patch } : cena)));

  const removerCena = (id) => setCenas((prev) => prev.filter((cena) => cena.id !== id));

  const adicionarObjetivo = () =>
    setObjetivos((prev) => [...prev, criarObjetivoVazio()]);

  const atualizarObjetivo = (id, patch) =>
    setObjetivos((prev) =>
      prev.map((objetivo) => (objetivo.id === id ? { ...objetivo, ...patch } : objetivo))
    );

  const removerObjetivo = (id) =>
    setObjetivos((prev) => prev.filter((objetivo) => objetivo.id !== id));

  // Exclusão
  const [sessionToDeleteIndex, setSessionToDeleteIndex] = useState(null);
  const [sessionToCloseId, setSessionToCloseId] = useState(null);
  const [xpConfirm, setXpConfirm] = useState(null);
  const [distributingXpId, setDistributingXpId] = useState(null);
  const [view, setView] = useState("sessoes"); // sessoes | timeline

  const normalizeSession = (session) => ({
    ...session,
    data: session.dataAgendada,
    cenas: session.dadosExtras?.cenas || [],
    objetivos: (session.dadosExtras?.objetivos || []).map((objetivo, index) => ({
      ...objetivo,
      id: objetivo.id || `${session.id}-objetivo-${index}`,
      texto: objetivo.texto ?? objetivo.descricao ?? "",
    })),
    recompensas: session.dadosExtras?.recompensas || {},
  });

  useEffect(() => {
    if (!isMaster) return;
    listCampaigns(token)
      .then((camps) => {
        const list = Array.isArray(camps) ? camps : [];
        setCampaigns(list);
        if (list.length > 0) {
          setSelectedCampaignId(list[0].id);
        }
      })
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, [isMaster, token]);

  const loadCampaign = async (campId) => {
    if (!campId) return;
    try {
      const data = await listGameSessions(campId, token);
      const normalized = (Array.isArray(data) ? data : []).map(normalizeSession);
      normalized.sort((a, b) => (Number(a.numero) || 0) - (Number(b.numero) || 0));
      setSessoes(normalized);
      setSessionNum(normalized.length + 1);
    } catch (err) {
      setError(err.message);
    }
  };

  useEffect(() => {
    if (selectedCampaignId) {
      loadCampaign(selectedCampaignId);
    }
  }, [selectedCampaignId]);

  const handleSaveNewSession = async (e) => {
    e.preventDefault();
    if (!sessionTitle.trim()) return;

    const cenasPayload = cenas
      .map((cena, i) => ({
        titulo: (cena.titulo || "").trim(),
        descricao: (cena.descricao || "").trim(),
        ordem: i + 1,
        concluido: Boolean(cena.concluido),
      }))
      .filter((cena) => cena.titulo || cena.descricao);

    const objetivosPayload = objetivos
      .map((objetivo) => ({
        descricao: (objetivo.texto || "").trim(),
        concluido: Boolean(objetivo.concluido),
        tipo: objetivo.tipo || "principal",
      }))
      .filter((objetivo) => objetivo.descricao);

    try {
      await createGameSession(
        selectedCampaignId,
        {
          titulo: sessionTitle.trim(),
          numero: Number(sessionNum),
          dataAgendada: sessionDate || new Date().toISOString().split("T")[0],
          estado: "planejada",
          resumo: resumoPosJogo,
          cenas: cenasPayload,
          objetivos: objetivosPayload,
          recompensas: {
            xp: Number(recompensaXp),
            tesouro: recompensaTesouro.trim(),
          },
        },
        token
      );
      setSessionTitle("");
      setSessionDate("");
      setResumoPosJogo("");
      setRecompensaXp(250);
      setRecompensaTesouro("50 peças de prata e uma poção de cura");
      setCenas([{ id: "c-1", titulo: "", descricao: "", concluido: false }]);
      setObjetivos([{ id: "o-1", texto: "", concluido: false, tipo: "principal" }]);
      setIsCreating(false);
      setSuccessMsg("Sessão planejada com sucesso.");
      await loadCampaign(selectedCampaignId);
    } catch (err) {
      setError(err.message);
    }
  };

  const prepareXpDistribution = async (sessao) => {
    const total = Math.max(0, Math.floor(Number(sessao.recompensas?.xp) || 0));
    if (total <= 0) {
      setError("Defina a recompensa de XP da sessão maior que zero antes de distribuir.");
      return;
    }
    if (!selectedCampaignId) return;
    setError("");
    try {
      const heroes = (await listCharacters(token, selectedCampaignId)) || [];
      if (heroes.length === 0) {
        setError("Nenhum herói nesta campanha para receber XP.");
        return;
      }
      const perHero = Math.floor(total / heroes.length);
      setXpConfirm({ sessao, heroes, perHero, total });
    } catch (err) {
      setError(err.message);
    }
  };

  const confirmXpDistribution = async () => {
    const pending = xpConfirm;
    if (!pending) return;
    const { sessao, heroes, perHero, total } = pending;
    setDistributingXpId(sessao.id);
    setError("");
    try {
      const freshes = await Promise.all(
        heroes.map((hero) => fetchCharacterFromBackend(hero.id, token).catch(() => null))
      );
      const missingIndex = freshes.findIndex((hero) => !hero);
      if (missingIndex !== -1) {
        setError(`Não foi possível ler o XP atual de ${heroes[missingIndex]?.name || "um herói"}. Nada foi alterado.`);
        setDistributingXpId(null);
        return;
      }
      for (const [index, hero] of heroes.entries()) {
        const currentXp = Number(freshes[index].xp ?? freshes[index].experiencia) || 0;
        await updateCharacterOnBackend(hero.id, { xp: currentXp + perHero }, token);
      }
      const recompensas = {
        ...(sessao.recompensas || {}),
        xpDistribuidoEm: new Date().toISOString(),
      };
      await updateGameSession(sessao.id, { recompensas }, token);
      setXpConfirm(null);
      setSuccessMsg(`${total} XP da sessão dividido em ${perHero} XP para cada um dos ${heroes.length} heróis.`);
      await loadCampaign(selectedCampaignId);
    } catch (err) {
      setError(err.message);
    } finally {
      setDistributingXpId(null);
    }
  };

  const closeSession = async () => {
    if (!sessionToCloseId) return;
    try {
      await updateGameSession(sessionToCloseId, { estado: "concluida" }, token);
      setSessionToCloseId(null);
      setSuccessMsg("Sessão encerrada — marcada como concluída (nada foi excluído).");
      await loadCampaign(selectedCampaignId);
    } catch (err) {
      setError(err.message);
      setSessionToCloseId(null);
    }
  };

  const saveSessionNotes = async (session, texto) => {
    try {
      await updateGameSession(session.id, { resumo: texto }, token);
      setSuccessMsg("Registro do mestre salvo.");
      await loadCampaign(selectedCampaignId);
    } catch (err) {
      setError(err.message);
    }
  };

  const toggleObjective = async (sessionIndex, objId) => {
    const updated = [...sessoes];
    const sessao = { ...updated[sessionIndex] };
    sessao.objetivos = sessao.objetivos.map((o) =>
      o.id === objId ? { ...o, concluido: !o.concluido } : o
    );
    updated[sessionIndex] = sessao;

    try {
      await updateGameSession(sessao.id, {
        objetivos: sessao.objetivos.map(({ id, texto, ...objetivo }) => ({
          ...objetivo,
          descricao: texto,
        })),
      }, token);
      setSessoes(updated);
    } catch (err) {
      setError(err.message);
    }
  };

  const deleteSession = async () => {
    if (sessionToDeleteIndex == null) return;
    const session = sessoes[sessionToDeleteIndex];
    try {
      await deleteGameSession(session.id, token);
      setSessionToDeleteIndex(null);
      setSuccessMsg("Sessão removida.");
      await loadCampaign(selectedCampaignId);
    } catch (err) {
      setError(err.message);
      setSessionToDeleteIndex(null);
    }
  };

  const timelineGroups = useMemo(() => {
    const events = [];
    for (const sessao of sessoes) {
      for (const ev of sessao.dadosExtras?.registro || []) {
        if (!ev?.timestamp || !ev?.evento) continue;
        const date = new Date(ev.timestamp);
        if (Number.isNaN(date.getTime())) continue;
        events.push({
          ...ev,
          date,
          numero: sessao.numero,
          titulo: sessao.titulo,
        });
      }
    }
    events.sort((a, b) => b.date.getTime() - a.date.getTime());
    const groups = [];
    const byDay = new Map();
    for (const ev of events) {
      const key = ev.date.toDateString();
      if (!byDay.has(key)) {
        const group = { key, label: ev.date.toLocaleDateString("pt-BR", { day: "2-digit", month: "long", year: "numeric" }), items: [] };
        byDay.set(key, group);
        groups.push(group);
      }
      byDay.get(key).items.push(ev);
    }
    return groups;
  }, [sessoes]);

  if (!isMaster) return null;

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between border-b-2 border-primary/40 pb-4">
        <div>
          <span className="text-[10px] font-bold uppercase tracking-[0.3em] text-primary">
            Câmara do Mestre · Crônicas & Cenas
          </span>
          <h1 className="mt-1 font-serif text-3xl font-black uppercase tracking-wider text-foreground">
            Sessões, Cenas & Recompensas
          </h1>
          <p className="text-xs text-muted-foreground">
            Estruture encontros, checklist de objetivos da mesa, recompensas de experiência e diário pós-sessão.
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

          <div className="flex items-center gap-1 rounded-lg border border-border bg-input-background p-1">
            <button
              type="button"
              onClick={() => setView("sessoes")}
              aria-pressed={view === "sessoes"}
              className={`flex min-h-9 items-center gap-1.5 rounded-md px-2.5 text-[10px] font-bold uppercase tracking-wider transition ${
                view === "sessoes" ? "bg-primary text-primary-foreground shadow" : "text-muted-foreground hover:text-foreground"
              }`}
            >
              <Calendar size={12} /> Sessões
            </button>
            <button
              type="button"
              onClick={() => setView("timeline")}
              aria-pressed={view === "timeline"}
              className={`flex min-h-9 items-center gap-1.5 rounded-md px-2.5 text-[10px] font-bold uppercase tracking-wider transition ${
                view === "timeline" ? "bg-primary text-primary-foreground shadow" : "text-muted-foreground hover:text-foreground"
              }`}
            >
              <History size={12} /> Linha do Tempo
            </button>
          </div>

          <button
            type="button"
            onClick={() => setIsCreating(!isCreating)}
            className="flex min-h-10 items-center gap-1.5 rounded-lg bg-primary px-3.5 text-xs font-bold uppercase tracking-wider text-primary-foreground hover:brightness-110 active:scale-95 shadow-md shadow-primary/20"
          >
            <Plus size={14} /> Planejar Sessão
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

      {/* Planejar Nova Sessão */}
      {isCreating && (
        <Card className="border-2 border-primary/40">
          <SectionHeader title="Planejar Próxima Sessão" icon={<Calendar size={16} />} />
          <form onSubmit={handleSaveNewSession} className="mt-4 space-y-4">
            <div className="grid gap-4 sm:grid-cols-[100px_1fr_180px]">
              <div>
                <label className="block text-xs font-bold uppercase text-muted-foreground">
                  Número #
                </label>
                <input
                  type="number"
                  min="1"
                  value={sessionNum}
                  onChange={(e) => setSessionNum(Number(e.target.value))}
                  className="mt-1 min-h-10 w-full rounded border border-border bg-input-background text-center font-mono text-sm text-foreground outline-none focus:border-primary"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase text-muted-foreground">
                  Título da Sessão *
                </label>
                <input
                  type="text"
                  required
                  value={sessionTitle}
                  onChange={(e) => setSessionTitle(e.target.value)}
                  placeholder="Ex.: Capítulo 4: As Profundezas da Cripta"
                  className="mt-1 min-h-10 w-full rounded border border-border bg-input-background px-3 text-xs text-foreground outline-none focus:border-primary"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase text-muted-foreground">
                  Data Prevista
                </label>
                <input
                  type="date"
                  value={sessionDate}
                  onChange={(e) => setSessionDate(e.target.value)}
                  className="mt-1 min-h-10 w-full rounded border border-border bg-input-background px-3 text-xs text-foreground outline-none focus:border-primary"
                />
              </div>
            </div>

            {/* Recompensas */}
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className="block text-xs font-bold uppercase text-muted-foreground">
                  Recompensa de XP Total da Sessão
                </label>
                <input
                  type="number"
                  min="0"
                  value={recompensaXp}
                  onChange={(e) => setRecompensaXp(Number(e.target.value))}
                  className="mt-1 min-h-10 w-full rounded border border-border bg-input-background px-3 text-xs text-foreground outline-none focus:border-primary"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase text-muted-foreground">
                  Tesouro & Itens Especiais
                </label>
                <input
                  type="text"
                  value={recompensaTesouro}
                  onChange={(e) => setRecompensaTesouro(e.target.value)}
                  placeholder="Moedas, pergaminhos ou relíquias..."
                  className="mt-1 min-h-10 w-full rounded border border-border bg-input-background px-3 text-xs text-foreground outline-none focus:border-primary"
                />
              </div>
            </div>

            {/* Cenas Planejadas */}
            <div className="space-y-2">
              <div className="flex items-center justify-between gap-2">
                <h4 className="flex items-center gap-1.5 font-serif text-xs font-bold uppercase tracking-wider text-muted-foreground">
                  <FileText size={13} className="text-primary" /> Cenas Planejadas
                </h4>
                <button
                  type="button"
                  onClick={adicionarCena}
                  className="flex min-h-9 items-center gap-1 rounded-lg border border-primary/40 bg-primary/10 px-2.5 text-[10px] font-bold uppercase tracking-wider text-primary transition hover:bg-primary/20"
                >
                  <Plus size={12} /> Adicionar Cena
                </button>
              </div>
              <div className="space-y-2">
                {cenas.map((cena, cenaIdx) => (
                  <div key={cena.id} className="space-y-2 rounded-lg border border-border bg-secondary/40 p-2.5">
                    <div className="flex items-center gap-2">
                      <span className="shrink-0 font-mono text-[10px] font-bold uppercase text-muted-foreground">
                        Cena {cenaIdx + 1}
                      </span>
                      <input
                        type="text"
                        value={cena.titulo}
                        onChange={(e) => atualizarCena(cena.id, { titulo: e.target.value })}
                        placeholder="Ex.: A Chegada à Estalagem"
                        className="min-h-9 w-full rounded-lg border border-border bg-input-background px-3 text-xs text-foreground outline-none placeholder:text-muted-foreground/60 focus:border-primary"
                      />
                      <button
                        type="button"
                        onClick={() => removerCena(cena.id)}
                        className="rounded-lg p-2 text-muted-foreground transition hover:text-destructive"
                        title="Remover cena"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                    <textarea
                      value={cena.descricao}
                      onChange={(e) => atualizarCena(cena.id, { descricao: e.target.value })}
                      rows={2}
                      placeholder="O que acontece nesta cena, o que os heróis enfrentam, o que descobre..."
                      className="w-full resize-none rounded-lg border border-border bg-input-background px-3 py-2 text-xs text-foreground outline-none placeholder:text-muted-foreground/60 focus:border-primary"
                    />
                  </div>
                ))}
              </div>
            </div>

            {/* Objetivos da Mesa */}
            <div className="space-y-2">
              <div className="flex items-center justify-between gap-2">
                <h4 className="flex items-center gap-1.5 font-serif text-xs font-bold uppercase tracking-wider text-muted-foreground">
                  <ListTodo size={13} className="text-primary" /> Objetivos da Mesa
                </h4>
                <button
                  type="button"
                  onClick={adicionarObjetivo}
                  className="flex min-h-9 items-center gap-1 rounded-lg border border-primary/40 bg-primary/10 px-2.5 text-[10px] font-bold uppercase tracking-wider text-primary transition hover:bg-primary/20"
                >
                  <Plus size={12} /> Adicionar Objetivo
                </button>
              </div>
              <div className="space-y-2">
                {objetivos.map((objetivo) => (
                  <div key={objetivo.id} className="flex items-center gap-2">
                    <input
                      type="text"
                      value={objetivo.texto}
                      onChange={(e) => atualizarObjetivo(objetivo.id, { texto: e.target.value })}
                      placeholder="Ex.: Encontrar o mensageiro da coroa"
                      className="min-h-9 w-full rounded-lg border border-border bg-input-background px-3 text-xs text-foreground outline-none placeholder:text-muted-foreground/60 focus:border-primary"
                    />
                    <button
                      type="button"
                      onClick={() => removerObjetivo(objetivo.id)}
                      className="shrink-0 rounded-lg p-2 text-muted-foreground transition hover:text-destructive"
                      title="Remover objetivo"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                ))}
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
                Salvar Sessão
              </button>
            </div>
          </form>
        </Card>
      )}

      {/* Linha do Tempo da Campanha (log geral) */}
      {view === "timeline" && (
        <div className="space-y-4">
          {timelineGroups.length === 0 ? (
            <Card className="py-12 text-center text-muted-foreground">
              <History size={28} className="mx-auto text-primary opacity-40 mb-2" />
              <p className="font-serif text-base text-foreground font-bold">Nada registrado por aqui ainda.</p>
              <p className="mt-1 text-xs">Encerrar sessões, concluir objetivos e criar sessões geram entradas na linha do tempo.</p>
            </Card>
          ) : (
            timelineGroups.map((group) => (
              <div key={group.key} className="rounded-2xl border border-primary/20 bg-card/60">
                <div className="flex items-center gap-2 border-b border-border/80 bg-primary/5 px-4 py-2">
                  <span className="flex h-7 w-7 items-center justify-center rounded-lg border border-primary/40 bg-primary/10">
                    <History size={14} className="text-primary" />
                  </span>
                  <h2 className="font-serif text-xs font-bold uppercase tracking-[0.2em] text-foreground">{group.label}</h2>
                </div>
                <ul className="divide-y divide-border/60">
                  {group.items.map((ev, i) => (
                    <li key={`${ev.date.toISOString()}-${i}`} className="flex flex-wrap items-baseline gap-x-3 gap-y-1 px-4 py-2.5 text-xs">
                      <span className="w-12 shrink-0 font-mono text-[11px] text-primary">
                        {ev.date.toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" })}
                      </span>
                      <span className="rounded border border-border bg-secondary/60 px-1.5 py-0.5 font-mono text-[9px] uppercase text-muted-foreground">
                        Sessão #{ev.numero}
                      </span>
                      {ev.autor && (
                        <span className="font-semibold text-foreground">{ev.autor}</span>
                      )}
                      <span className="w-full sm:w-auto sm:flex-1 text-muted-foreground">{ev.evento}</span>
                    </li>
                  ))}
                </ul>
              </div>
            ))
          )}
        </div>
      )}

      {/* Lista de Sessões */}
      {view === "sessoes" && (
      <div className="space-y-4">
        {sessoes.length === 0 ? (
          <Card className="py-12 text-center text-muted-foreground">
            <Calendar size={28} className="mx-auto text-primary opacity-40 mb-2" />
            <p className="font-serif text-base text-foreground font-bold">Nenhuma sessão registrada nesta campanha.</p>
            <p className="mt-1 text-xs">Clique no botão acima para planejar o próximo capítulo.</p>
          </Card>
        ) : (
          sessoes.map((sessao, sIdx) => {
            const objsConcluidos = (sessao.objetivos || []).filter((o) => o.concluido).length;
            const totalObjs = (sessao.objetivos || []).length;

            return (
              <Card key={sessao.id || sIdx} className="space-y-4 border-2 border-border/80">
                <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between border-b border-border/80 pb-3">
                  <div className="flex items-center gap-3">
                    <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-primary font-serif font-black text-primary-foreground shadow-md">
                      #{sessao.numero}
                    </span>
                    <div>
                      <h3 className="font-serif text-lg font-black uppercase text-foreground">
                        {sessao.titulo}
                      </h3>
                      <span className="text-[11px] text-muted-foreground flex items-center gap-1">
                        <Clock size={12} className="text-primary" /> Data: {sessao.data || "Não agendada"}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <span className={`rounded-full border px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider ${estadoMeta(sessao.estado).cls}`}>
                      {estadoMeta(sessao.estado).label}
                    </span>
                    <span className="rounded-full border border-primary/40 bg-primary/10 px-2.5 py-0.5 text-xs font-bold text-primary">
                      {objsConcluidos}/{totalObjs} Objetivos Concluídos
                    </span>
                    {sessao.estado !== "concluida" && (
                      <button
                        type="button"
                        onClick={() => setSessionToCloseId(sessao.id)}
                        className="flex min-h-9 items-center gap-1 rounded-lg border border-emerald-500/40 bg-emerald-500/10 px-2.5 text-[10px] font-bold uppercase tracking-wider text-emerald-300 transition hover:bg-emerald-500/20"
                        title="Marca a sessão como concluída (nada é excluído)"
                      >
                        <CheckCircle2 size={13} />
                        Encerrar
                      </button>
                    )}
                    <button
                      type="button"
                      onClick={() => setSessionToDeleteIndex(sIdx)}
                      className="rounded p-1 text-muted-foreground hover:text-destructive"
                      title="Excluir sessão"
                    >
                      <Trash2 size={15} />
                    </button>
                  </div>
                </div>

                {/* Cenas e Objetivos */}
                <div className="grid gap-4 md:grid-cols-2">
                  {/* Cenas */}
                  <div>
                    <h4 className="font-serif text-xs font-bold uppercase tracking-wider text-muted-foreground mb-2 flex items-center gap-1.5">
                      <FileText size={13} className="text-primary" /> Cenas Planejadas
                    </h4>
                    <div className="space-y-2">
                      {(sessao.cenas || []).map((cena, cIdx) => (
                        <div key={cena.id || cIdx} className="rounded-lg border border-border bg-secondary/40 p-2.5 text-xs">
                          <strong className="text-foreground font-semibold">{cena.titulo}</strong>
                          <p className="mt-1 text-muted-foreground">{cena.descricao}</p>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Checklist de Objetivos */}
                  <div>
                    <h4 className="font-serif text-xs font-bold uppercase tracking-wider text-muted-foreground mb-2 flex items-center gap-1.5">
                      <ListTodo size={13} className="text-primary" /> Objetivos da Mesa
                    </h4>
                    <div className="space-y-1.5">
                      {(sessao.objetivos || []).map((obj) => (
                        <button
                          key={obj.id}
                          type="button"
                          onClick={() => toggleObjective(sIdx, obj.id)}
                          className={`w-full flex items-center gap-2 rounded-lg border p-2 text-left text-xs transition ${
                            obj.concluido
                              ? "border-emerald-500/40 bg-emerald-950/20 text-emerald-300 line-through"
                              : "border-border bg-secondary/50 text-foreground hover:border-primary/40"
                          }`}
                        >
                          <CheckCircle2
                            size={14}
                            className={obj.concluido ? "text-emerald-400" : "text-muted-foreground"}
                          />
                          <span>{obj.texto}</span>
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Registro do que aconteceu na sessão */}
                <SessionNotesField key={sessao.id} session={sessao} onSave={saveSessionNotes} />

                {/* Recompensas da Sessão */}
                {sessao.recompensas && (
                  <div className="rounded-lg border border-primary/30 bg-primary/5 p-3 space-y-2 text-xs">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <span className="flex items-center gap-1.5 text-primary font-bold uppercase tracking-wider">
                        <Gift size={14} /> Recompensa de XP da Sessão
                      </span>
                      {sessao.recompensas.xpDistribuidoEm ? (
                        <span className="rounded-full border border-emerald-500/40 bg-emerald-500/10 px-2 py-0.5 text-[9px] font-bold uppercase tracking-wider text-emerald-300">
                          Distribuída em {new Date(sessao.recompensas.xpDistribuidoEm).toLocaleString("pt-BR")}
                        </span>
                      ) : (
                        <span className="rounded-full border border-amber-500/40 bg-amber-500/10 px-2 py-0.5 text-[9px] font-bold uppercase tracking-wider text-amber-300">
                          XP ainda não distribuído
                        </span>
                      )}
                    </div>
                    <div className="flex flex-wrap items-center justify-between gap-3">
                      <div className="flex flex-wrap items-center gap-4 text-muted-foreground">
                        <span>Total: <strong className="font-mono text-foreground">{Number(sessao.recompensas.xp || 0).toLocaleString("pt-BR")} XP</strong></span>
                        {sessao.recompensas.tesouro && (
                          <span>Tesouro: <strong className="text-foreground">{sessao.recompensas.tesouro}</strong></span>
                        )}
                      </div>
                      <button
                        type="button"
                        onClick={() => prepareXpDistribution(sessao)}
                        disabled={distributingXpId === sessao.id || !sessao.recompensas?.xp}
                        className="flex min-h-9 items-center gap-1.5 rounded-lg border border-amber-500/50 bg-amber-500/15 px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider text-amber-300 transition hover:bg-amber-500/25 active:scale-95 disabled:cursor-not-allowed disabled:opacity-40"
                        title="Divide o total do XP da sessão igualmente entre os heróis da campanha"
                      >
                        {distributingXpId === sessao.id ? (
                          <LoaderCircle size={13} className="animate-spin" />
                        ) : (
                          <Sparkles size={13} />
                        )}
                        Distribuir XP da sessão
                      </button>
                    </div>
                  </div>
                )}
              </Card>
            );
          })
        )}
      </div>

      )}

      {/* Confirmação de Distribuição de XP */}
      <ConfirmDialog
        isOpen={Boolean(xpConfirm)}
        title="Distribuir recompensa de XP da sessão?"
        message={xpConfirm ? `${xpConfirm.total} XP serão divididos igualmente entre ${xpConfirm.heroes.length} herói(s) da campanha — ${xpConfirm.perHero} XP para cada. Não pode ser desfeito.` : ""}
        confirmText="Distribuir XP"
        onConfirm={confirmXpDistribution}
        onCancel={() => setXpConfirm(null)}
      />

      {/* Confirmação de Encerrar */}
      <ConfirmDialog
        isOpen={Boolean(sessionToCloseId)}
        title="Encerrar esta sessão?"
        message="A sessão será apenas marcada como concluída — nada é excluído, e o registro aparece na Linha do Tempo."
        confirmText="Encerrar sessão"
        onConfirm={closeSession}
        onCancel={() => setSessionToCloseId(null)}
      />

      {/* Confirmação de Exclusão */}
      <ConfirmDialog
        isOpen={sessionToDeleteIndex != null}
        title="Excluir registro da sessão?"
        message="O planejamento, cenas e checklist de objetivos serão removidos do diário da campanha."
        onConfirm={deleteSession}
        onCancel={() => setSessionToDeleteIndex(null)}
      />
    </div>
  );
}
