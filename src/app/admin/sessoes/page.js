"use client";

import { useEffect, useState } from "react";
import {
  Calendar,
  Check,
  CheckCircle2,
  Clock,
  Crown,
  FileText,
  Gift,
  ListTodo,
  Plus,
  Save,
  Sparkles,
  Trash2,
} from "lucide-react";
import { Card, SectionHeader } from "../../components/ui";
import ConfirmDialog from "../../components/admin/ConfirmDialog";
import {
  fetchCampaignById,
  listCampaigns,
  updateCampaignById,
} from "../../../lib/api";
import { useAuth } from "../../context/AuthContext";

export default function AdminSessoesPage() {
  const { token, isMaster } = useAuth();

  const [campaigns, setCampaigns] = useState([]);
  const [selectedCampaignId, setSelectedCampaignId] = useState("");
  const [campaign, setCampaign] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [successMsg, setSuccessMsg] = useState("");

  // Criação de sessão
  const [isCreating, setIsCreating] = useState(false);
  const [sessionNum, setSessionNum] = useState(1);
  const [sessionTitle, setSessionTitle] = useState("");
  const [sessionDate, setSessionDate] = useState("");
  const [cenas, setCenas] = useState([
    { id: "c-1", titulo: "Cena 1: A Chegada à Estalagem", descricao: "O grupo chega fustigado pela chuva fria." },
  ]);
  const [objetivos, setObjetivos] = useState([
    { id: "o-1", texto: "Encontrar o mensageiro da coroa", concluido: false },
    { id: "o-2", texto: "Decifrar o selo da carta lacrada", concluido: false },
  ]);
  const [recompensaXp, setRecompensaXp] = useState(250);
  const [recompensaTesouro, setRecompensaTesouro] = useState("50 peças de prata e uma poção de cura");
  const [resumoPosJogo, setResumoPosJogo] = useState("");

  // Exclusão
  const [sessionToDeleteIndex, setSessionToDeleteIndex] = useState(null);

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
      const data = await fetchCampaignById(campId, token);
      setCampaign(data);
      const sessoes = data?.dadosExtras?.sessoes || [];
      setSessionNum(sessoes.length + 1);
    } catch (err) {
      setError(err.message);
    }
  };

  useEffect(() => {
    if (selectedCampaignId) {
      loadCampaign(selectedCampaignId);
    }
  }, [selectedCampaignId]);

  const sessoes = campaign?.dadosExtras?.sessoes || [];

  const handleSaveNewSession = async (e) => {
    e.preventDefault();
    if (!sessionTitle.trim()) return;

    const novaSessao = {
      id: `session-${Date.now()}`,
      numero: Number(sessionNum),
      titulo: sessionTitle.trim(),
      data: sessionDate || new Date().toISOString().split("T")[0],
      cenas,
      objetivos,
      recompensas: {
        xp: Number(recompensaXp),
        tesouro: recompensaTesouro.trim(),
      },
      resumoPosJogo,
      status: "planejada",
    };

    const updatedSessoes = [...sessoes, novaSessao];

    try {
      await updateCampaignById(
        selectedCampaignId,
        {
          dadosExtras: {
            ...(campaign.dadosExtras || {}),
            sessoes: updatedSessoes,
          },
        },
        token
      );
      setSessionTitle("");
      setIsCreating(false);
      setSuccessMsg("Sessão planejada com sucesso.");
      loadCampaign(selectedCampaignId);
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
      await updateCampaignById(
        selectedCampaignId,
        {
          dadosExtras: {
            ...(campaign.dadosExtras || {}),
            sessoes: updated,
          },
        },
        token
      );
      setCampaign((prev) => ({
        ...prev,
        dadosExtras: { ...(prev.dadosExtras || {}), sessoes: updated },
      }));
    } catch (err) {
      setError(err.message);
    }
  };

  const deleteSession = async () => {
    if (sessionToDeleteIndex == null) return;
    const updated = sessoes.filter((_, idx) => idx !== sessionToDeleteIndex);
    try {
      await updateCampaignById(
        selectedCampaignId,
        {
          dadosExtras: {
            ...(campaign.dadosExtras || {}),
            sessoes: updated,
          },
        },
        token
      );
      setSessionToDeleteIndex(null);
      setSuccessMsg("Sessão removida.");
      loadCampaign(selectedCampaignId);
    } catch (err) {
      setError(err.message);
      setSessionToDeleteIndex(null);
    }
  };

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
                  Recompensa de XP Prevista
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

      {/* Lista de Sessões */}
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
                    <span className="rounded-full border border-primary/40 bg-primary/10 px-2.5 py-0.5 text-xs font-bold text-primary">
                      {objsConcluidos}/{totalObjs} Objetivos Concluídos
                    </span>
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

                {/* Recompensas da Sessão */}
                {sessao.recompensas && (
                  <div className="rounded-lg border border-primary/30 bg-primary/5 p-3 flex flex-wrap items-center justify-between text-xs">
                    <span className="flex items-center gap-1.5 text-primary font-bold">
                      <Gift size={14} /> Recompensas da Sessão:
                    </span>
                    <div className="flex items-center gap-4 text-muted-foreground">
                      <span>XP: <strong className="text-foreground font-mono">+{sessao.recompensas.xp}</strong></span>
                      {sessao.recompensas.tesouro && (
                        <span>Tesouro: <strong className="text-foreground">{sessao.recompensas.tesouro}</strong></span>
                      )}
                    </div>
                  </div>
                )}
              </Card>
            );
          })
        )}
      </div>

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
