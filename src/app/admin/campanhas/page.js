"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  Ban,
  Check,
  CheckCircle,
  Copy,
  Crown,
  ExternalLink,
  History,
  Link2,
  Lock,
  Plus,
  RotateCcw,
  ScrollText,
  Share2,
  Shield,
  Trash2,
  Unlock,
  UserCheck,
  UserMinus,
  Users,
} from "lucide-react";
import { Card, SectionHeader } from "../../components/ui";
import ConfirmDialog from "../../components/admin/ConfirmDialog";
import {
  createCampaign,
  deleteCampaign,
  fetchCampaignAudit,
  generateInviteLink,
  listCampaignMembers,
  listCampaigns,
  removeCampaignMember,
  updateCampaignById,
  updateCampaignMember,
} from "../../../lib/api";
import { useAuth } from "../../context/AuthContext";

export default function AdminCampanhasPage() {
  const { token, isMaster, user } = useAuth();

  const [campaigns, setCampaigns] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [successMsg, setSuccessMsg] = useState("");

  // Criação de nova campanha
  const [isCreating, setIsCreating] = useState(false);
  const [novoNome, setNovoNome] = useState("");
  const [novaDescricao, setNovaDescricao] = useState("");
  const [novoEstado, setNovoEstado] = useState("planejamento");

  // Gestão de membros
  const [selectedCampaignForMembers, setSelectedCampaignForMembers] = useState(null);
  const [members, setMembers] = useState([]);
  const [loadingMembers, setLoadingMembers] = useState(false);

  // Auditoria
  const [auditLogs, setAuditLogs] = useState([]);
  const [auditCampaign, setAuditCampaign] = useState(null);
  const [loadingAudit, setLoadingAudit] = useState(false);

  // Exclusão
  const [campaignToDelete, setCampaignToDelete] = useState(null);

  // Cópia de código e link de convite
  const [copiedCode, setCopiedCode] = useState("");
  const [copiedLink, setCopiedLink] = useState("");
  const [copiedMsg, setCopiedMsg] = useState("");

  const handleCopyCode = (code) => {
    navigator.clipboard.writeText(code);
    setCopiedCode(code);
    setTimeout(() => setCopiedCode(""), 2500);
  };

  const handleCopyLink = (code) => {
    const link = generateInviteLink(code);
    navigator.clipboard.writeText(link);
    setCopiedLink(code);
    setTimeout(() => setCopiedLink(""), 2500);
  };

  const handleCopyMessage = (camp) => {
    const link = generateInviteLink(camp.codigoConvite);
    const mestreNome = user?.username || camp.proprietario?.username || "Mestre";
    const msg = `⚔️ *Convocação para a Mesa de RPG — Grimorium* ⚔️\n` +
      `O Mestre ${mestreNome} está convidando você para a campanha "${camp.nome}".\n` +
      `Clique no link abaixo para criar sua conta e entrar diretamente na mesa:\n` +
      `🔗 ${link}\n` +
      `(Código da Mesa: ${camp.codigoConvite})`;
    navigator.clipboard.writeText(msg);
    setCopiedMsg(camp.codigoConvite);
    setTimeout(() => setCopiedMsg(""), 2500);
  };

  const loadCampaigns = async () => {
    setLoading(true);
    setError("");
    try {
      const data = await listCampaigns(token);
      setCampaigns(Array.isArray(data) ? data : []);
    } catch (err) {
      setError(err.message || "Erro ao carregar campanhas.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isMaster) {
      loadCampaigns();
    }
  }, [isMaster, token]);

  const handleCreate = async (e) => {
    e.preventDefault();
    if (!novoNome.trim()) return;
    try {
      await createCampaign(
        {
          nome: novoNome.trim(),
          descricao: novaDescricao.trim(),
          estado: novoEstado,
        },
        token
      );
      setNovoNome("");
      setNovaDescricao("");
      setIsCreating(false);
      setSuccessMsg("Campanha forjada com sucesso!");
      loadCampaigns();
    } catch (err) {
      setError(err.message);
    }
  };

  const openMembersModal = async (campaign) => {
    setSelectedCampaignForMembers(campaign);
    setLoadingMembers(true);
    try {
      const data = await listCampaignMembers(campaign.id, token);
      setMembers(Array.isArray(data) ? data : []);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoadingMembers(false);
    }
  };

  const handleChangeMemberRole = async (userId, newRole) => {
    try {
      await updateCampaignMember(selectedCampaignForMembers.id, userId, { papel: newRole }, token);
      const updated = await listCampaignMembers(selectedCampaignForMembers.id, token);
      setMembers(updated);
    } catch (err) {
      setError(err.message);
    }
  };

  const handleToggleBlockMember = async (userId, currentBlocked) => {
    try {
      await updateCampaignMember(
        selectedCampaignForMembers.id,
        userId,
        { bloqueado: !currentBlocked },
        token
      );
      const updated = await listCampaignMembers(selectedCampaignForMembers.id, token);
      setMembers(updated);
    } catch (err) {
      setError(err.message);
    }
  };

  const handleKickMember = async (userId) => {
    try {
      await removeCampaignMember(selectedCampaignForMembers.id, userId, token);
      const updated = await listCampaignMembers(selectedCampaignForMembers.id, token);
      setMembers(updated);
    } catch (err) {
      setError(err.message);
    }
  };

  const openAuditModal = async (campaign) => {
    setAuditCampaign(campaign);
    setLoadingAudit(true);
    try {
      const data = await fetchCampaignAudit(campaign.id, token);
      setAuditLogs(Array.isArray(data) ? data : []);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoadingAudit(false);
    }
  };

  const handleDeleteCampaign = async () => {
    if (!campaignToDelete) return;
    try {
      await deleteCampaign(campaignToDelete.id, token);
      setCampaignToDelete(null);
      setSuccessMsg("Campanha removida com sucesso.");
      loadCampaigns();
    } catch (err) {
      setError(err.message);
      setCampaignToDelete(null);
    }
  };

  if (!isMaster) return null;

  return (
    <div className="space-y-6">
      {/* Cabeçalho */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between border-b-2 border-primary/40 pb-4">
        <div>
          <span className="text-[10px] font-bold uppercase tracking-[0.3em] text-primary">
            Câmara do Mestre · Soberania de Campanhas
          </span>
          <h1 className="mt-1 font-serif text-3xl font-black uppercase tracking-wider text-foreground">
            Gerenciamento de Campanhas
          </h1>
          <p className="text-xs text-muted-foreground">
            Crie mundos, gere códigos de convite para jogadores, gerencie membros e consulte auditoria.
          </p>
        </div>

        <button
          type="button"
          onClick={() => setIsCreating(!isCreating)}
          className="flex min-h-11 items-center gap-2 rounded-lg bg-primary px-4 font-serif text-xs font-bold uppercase tracking-wider text-primary-foreground shadow-lg shadow-primary/20 hover:brightness-110 active:scale-95"
        >
          <Plus size={15} /> Nova Campanha
        </button>
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

      {/* Formulário de Criação Rápida */}
      {isCreating && (
        <Card className="border-2 border-primary/50 bg-gradient-to-br from-card to-primary/5">
          <SectionHeader title="Forjar Nova Campanha" icon={<Crown size={16} />} />
          <form onSubmit={handleCreate} className="mt-4 space-y-4">
            <div className="grid gap-4 sm:grid-cols-[1.5fr_1fr]">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-muted-foreground">
                  Nome da Campanha *
                </label>
                <input
                  type="text"
                  required
                  value={novoNome}
                  onChange={(e) => setNovoNome(e.target.value)}
                  placeholder="Ex.: Crônicas de Glenor: O Eclipse de Sangue"
                  className="mt-1 min-h-11 w-full rounded-lg border border-border bg-input-background px-3 text-sm text-foreground outline-none focus:border-primary"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-muted-foreground">
                  Estado Inicial
                </label>
                <select
                  value={novoEstado}
                  onChange={(e) => setNovoEstado(e.target.value)}
                  className="mt-1 min-h-11 w-full rounded-lg border border-border bg-input-background px-3 text-sm text-foreground outline-none focus:border-primary"
                >
                  <option value="planejamento">Planejamento</option>
                  <option value="ativa">Ativa</option>
                  <option value="pausada">Pausada</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-muted-foreground">
                Sinopse / Descrição
              </label>
              <textarea
                rows={3}
                value={novaDescricao}
                onChange={(e) => setNovaDescricao(e.target.value)}
                placeholder="Breve resumo da premissa para os jogadores..."
                className="mt-1 w-full rounded-lg border border-border bg-input-background p-3 text-sm text-foreground outline-none focus:border-primary"
              />
            </div>

            <div className="flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setIsCreating(false)}
                className="rounded-lg border border-border px-4 py-2 text-xs font-bold uppercase text-muted-foreground hover:bg-secondary"
              >
                Cancelar
              </button>
              <button
                type="submit"
                className="rounded-lg bg-primary px-5 py-2 text-xs font-bold uppercase text-primary-foreground hover:brightness-110 active:scale-95"
              >
                Forjar Campanha
              </button>
            </div>
          </form>
        </Card>
      )}

      {/* Lista de Campanhas */}
      <div>
        {loading ? (
          <div className="py-12 text-center text-sm text-muted-foreground">Carregando campanhas...</div>
        ) : campaigns.length === 0 ? (
          <Card className="py-12 text-center text-muted-foreground">
            <Crown size={32} className="mx-auto text-primary opacity-40 mb-2" />
            <p className="font-serif text-lg text-foreground font-bold">Nenhuma campanha cadastrada ainda.</p>
            <p className="mt-1 text-xs">Clique no botão acima para criar sua primeira campanha.</p>
          </Card>
        ) : (
          <div className="grid gap-4 md:grid-cols-2">
            {campaigns.map((camp) => {
              const isOwner = camp.proprietarioId === user?.id;
              const memberCount = camp.membrosCampanha?.length || 1;

              return (
                <Card
                  key={camp.id}
                  className="flex flex-col justify-between border-2 border-border/80 transition hover:border-primary/50"
                >
                  <div>
                    {/* Topo do card */}
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <div className="flex items-center gap-2">
                          <h3 className="font-serif text-lg font-black uppercase text-foreground">
                            {camp.nome}
                          </h3>
                          <span
                            className={`rounded px-2 py-0.2 text-[9px] font-bold uppercase tracking-wider ${
                              camp.estado === "ativa"
                                ? "border border-emerald-500/40 bg-emerald-950/40 text-emerald-300"
                                : camp.estado === "pausada"
                                ? "border border-amber-500/40 bg-amber-950/40 text-amber-300"
                                : "border border-border bg-secondary text-muted-foreground"
                            }`}
                          >
                            {camp.estado}
                          </span>
                        </div>
                        <p className="mt-1 text-xs text-muted-foreground line-clamp-2">
                          {camp.descricao || "Sem descrição narrativa cadastrada."}
                        </p>
                      </div>

                      {/* Código de convite com botão copiar */}
                      <div className="rounded-xl border border-primary/40 bg-primary/10 p-2 text-right">
                        <span className="block text-[9px] font-bold uppercase tracking-widest text-primary">
                          Código de Convite
                        </span>
                        <div className="mt-1 flex items-center gap-1.5 font-mono text-sm font-black text-foreground">
                          <span>{camp.codigoConvite}</span>
                          <button
                            type="button"
                            onClick={() => handleCopyCode(camp.codigoConvite)}
                            className="rounded p-1 text-primary hover:bg-primary/20"
                            title="Copiar código para enviar aos jogadores"
                          >
                            {copiedCode === camp.codigoConvite ? (
                              <Check size={14} className="text-emerald-400" />
                            ) : (
                              <Copy size={14} />
                            )}
                          </button>
                        </div>
                      </div>
                    </div>

                    {/* Metadados da campanha */}
                    <div className="mt-4 flex flex-wrap items-center gap-4 text-xs text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <Users size={13} className="text-primary" />
                        <strong>{memberCount}</strong> {memberCount === 1 ? "membro" : "membros"}
                      </span>
                      <span>
                        Mestre: <strong>{camp.proprietario?.username || "Você"}</strong>
                      </span>
                    </div>

                    {/* Painel de Convite da Mesa */}
                    <div className="mt-4 rounded-xl border border-primary/35 bg-primary/5 p-3">
                      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                        <div>
                          <span className="text-[10px] font-bold uppercase tracking-wider text-primary flex items-center gap-1">
                            <Link2 size={13} /> Link & Convite da Mesa
                          </span>
                          <p className="text-[11px] text-muted-foreground mt-0.5">
                            Envie aos jogadores para que vinculem a conta a esta mesa ao se cadastrar.
                          </p>
                        </div>
                        <div className="flex items-center gap-1.5 self-start sm:self-center">
                          <span className="font-mono text-xs font-black rounded bg-background/90 border border-border px-2.5 py-1 text-foreground">
                            {camp.codigoConvite}
                          </span>
                          <button
                            type="button"
                            onClick={() => handleCopyCode(camp.codigoConvite)}
                            className="flex items-center gap-1 rounded bg-secondary px-2 py-1 text-[11px] font-bold text-foreground hover:bg-secondary/80 transition"
                            title="Copiar código alfanumérico"
                          >
                            {copiedCode === camp.codigoConvite ? (
                              <Check size={12} className="text-emerald-400" />
                            ) : (
                              <Copy size={12} />
                            )}
                            <span>{copiedCode === camp.codigoConvite ? "Copiado!" : "Código"}</span>
                          </button>
                        </div>
                      </div>

                      <div className="mt-2.5 flex flex-wrap gap-2 pt-2 border-t border-primary/20">
                        <button
                          type="button"
                          onClick={() => handleCopyLink(camp.codigoConvite)}
                          className="flex items-center gap-1.5 rounded-lg border border-primary/50 bg-primary/20 px-3 py-1.5 text-xs font-bold text-primary hover:bg-primary/30 transition active:scale-95"
                          title="Copiar URL completa do convite para a área de transferência"
                        >
                          {copiedLink === camp.codigoConvite ? (
                            <Check size={13} className="text-emerald-400" />
                          ) : (
                            <Link2 size={13} />
                          )}
                          <span>{copiedLink === camp.codigoConvite ? "Link Copiado!" : "Copiar Link de Convite"}</span>
                        </button>

                        <button
                          type="button"
                          onClick={() => handleCopyMessage(camp)}
                          className="flex items-center gap-1.5 rounded-lg border border-border bg-secondary/80 px-3 py-1.5 text-xs font-medium text-foreground hover:bg-secondary transition active:scale-95"
                          title="Copiar texto formatado para enviar no Discord ou WhatsApp"
                        >
                          {copiedMsg === camp.codigoConvite ? (
                            <Check size={13} className="text-emerald-400" />
                          ) : (
                            <Share2 size={13} className="text-primary" />
                          )}
                          <span>{copiedMsg === camp.codigoConvite ? "Mensagem Copiada!" : "Texto p/ Discord / WhatsApp"}</span>
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Ações da Campanha */}
                  <div className="mt-5 flex flex-wrap items-center justify-between border-t border-border pt-3">
                    <div className="flex flex-wrap items-center gap-2">
                      <button
                        type="button"
                        onClick={() => openMembersModal(camp)}
                        className="flex items-center gap-1.5 rounded-lg border border-primary/40 bg-primary/10 px-3 py-1.5 text-xs font-semibold text-primary transition hover:bg-primary/20"
                      >
                        <Users size={13} /> Gerenciar Membros
                      </button>
                      <button
                        type="button"
                        onClick={() => openAuditModal(camp)}
                        className="flex items-center gap-1.5 rounded-lg border border-border bg-secondary px-3 py-1.5 text-xs font-semibold text-muted-foreground hover:border-primary hover:text-foreground"
                      >
                        <History size={13} /> Auditoria
                      </button>
                    </div>

                    {isOwner && (
                      <button
                        type="button"
                        onClick={() => setCampaignToDelete(camp)}
                        className="rounded p-1.5 text-muted-foreground hover:bg-destructive/15 hover:text-destructive"
                        title="Excluir campanha"
                      >
                        <Trash2 size={15} />
                      </button>
                    )}
                  </div>
                </Card>
              );
            })}
          </div>
        )}
      </div>

      {/* Modal de Gestão de Membros */}
      {selectedCampaignForMembers && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-md">
          <div className="w-full max-w-2xl rounded-2xl border-2 border-primary/50 bg-[#0f1118] p-6 shadow-2xl max-h-[85vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-border pb-3">
              <div>
                <h3 className="font-serif text-lg font-bold uppercase text-foreground">
                  Membros · {selectedCampaignForMembers.nome}
                </h3>
                <p className="text-xs text-muted-foreground">
                  Gerencie papéis, bloqueios e permissões de acesso dos jogadores.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setSelectedCampaignForMembers(null)}
                className="rounded-lg p-1.5 text-muted-foreground hover:bg-secondary"
              >
                ✕
              </button>
            </div>

            <div className="mt-4">
              {loadingMembers ? (
                <div className="py-8 text-center text-xs text-muted-foreground">Carregando membros...</div>
              ) : members.length === 0 ? (
                <p className="py-8 text-center text-xs text-muted-foreground">
                  Nenhum jogador entrou com o código ainda.
                </p>
              ) : (
                <div className="space-y-2.5">
                  {members.map((m) => {
                    const isCampOwner = m.usuarioId === selectedCampaignForMembers.proprietarioId;

                    return (
                      <div
                        key={m.usuarioId}
                        className={`flex flex-col gap-2 rounded-xl border p-3 sm:flex-row sm:items-center sm:justify-between ${
                          m.bloqueado
                            ? "border-rose-500/30 bg-rose-950/20 opacity-70"
                            : "border-border bg-secondary/40"
                        }`}
                      >
                        <div>
                          <div className="flex items-center gap-2">
                            <strong className="text-sm font-semibold text-foreground">
                              {m.usuario?.username || "Jogador"}
                            </strong>
                            {isCampOwner && (
                              <span className="rounded bg-primary/25 px-1.5 py-0.2 text-[9px] font-bold uppercase text-primary border border-primary">
                                Proprietário
                              </span>
                            )}
                            {m.bloqueado && (
                              <span className="rounded bg-rose-500/25 px-1.5 py-0.2 text-[9px] font-bold uppercase text-rose-400 border border-rose-500/40">
                                Bloqueado
                              </span>
                            )}
                          </div>
                          <p className="text-[11px] text-muted-foreground">{m.usuario?.email}</p>

                          {/* Herói vinculado ao jogador */}
                          {m.usuario?.characters && m.usuario.characters.length > 0 ? (
                            <div className="mt-1.5 flex flex-wrap items-center gap-2">
                              {m.usuario.characters.map((hero) => (
                                <div key={hero.id} className="flex items-center gap-1.5 bg-background/50 border border-primary/30 rounded-lg px-2 py-1">
                                  <Shield size={12} className="text-primary" />
                                  <span className="text-xs font-semibold text-foreground">
                                    {hero.name}
                                  </span>
                                  <span className="text-[10px] text-muted-foreground">
                                    ({hero.job || "Aventureiro"} · Nv {hero.level || 1})
                                  </span>
                                  <Link
                                    href={`/admin/personagens/${hero.id}/ficha`}
                                    target="_blank"
                                    rel="noreferrer"
                                    className="ml-1 inline-flex items-center gap-1 rounded bg-primary/20 border border-primary/40 px-1.5 py-0.5 text-[10px] font-bold uppercase text-primary hover:bg-primary/30 transition"
                                    title="Abrir Ficha do Jogador"
                                  >
                                    <span>Ficha</span>
                                    <ExternalLink size={10} />
                                  </Link>
                                </div>
                              ))}
                            </div>
                          ) : (
                            <p className="mt-1 text-[10px] italic text-muted-foreground">
                              Nenhum personagem registrado nesta conta ainda.
                            </p>
                          )}
                        </div>

                        {!isCampOwner && (
                          <div className="flex items-center gap-2">
                            {/* Papel */}
                            <select
                              value={m.papel}
                              onChange={(e) => handleChangeMemberRole(m.usuarioId, e.target.value)}
                              className="rounded border border-border bg-input-background px-2 py-1 text-xs text-foreground outline-none focus:border-primary"
                            >
                              <option value="jogador">Jogador</option>
                              <option value="mestre">Co-Mestre</option>
                              <option value="observador">Observador</option>
                            </select>

                            {/* Bloquear / Desbloquear */}
                            <button
                              type="button"
                              onClick={() => handleToggleBlockMember(m.usuarioId, m.bloqueado)}
                              className={`rounded p-1.5 transition ${
                                m.bloqueado
                                  ? "bg-emerald-950/40 text-emerald-400 hover:bg-emerald-900/60"
                                  : "bg-amber-950/40 text-amber-400 hover:bg-amber-900/60"
                              }`}
                              title={m.bloqueado ? "Desbloquear jogador" : "Bloquear jogador"}
                            >
                              {m.bloqueado ? <Unlock size={14} /> : <Lock size={14} />}
                            </button>

                            {/* Remover / Expulsar */}
                            <button
                              type="button"
                              onClick={() => handleKickMember(m.usuarioId)}
                              className="rounded p-1.5 text-muted-foreground hover:bg-rose-950/40 hover:text-rose-400"
                              title="Expulsar da campanha"
                            >
                              <UserMinus size={14} />
                            </button>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Modal de Auditoria */}
      {auditCampaign && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-md">
          <div className="w-full max-w-3xl rounded-2xl border-2 border-primary/50 bg-[#0f1118] p-6 shadow-2xl max-h-[85vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-border pb-3">
              <div>
                <h3 className="font-serif text-lg font-bold uppercase text-foreground">
                  Trilha de Auditoria · {auditCampaign.nome}
                </h3>
                <p className="text-xs text-muted-foreground">
                  Registro imutável de eventos sensíveis, alterações e exclusões.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setAuditCampaign(null)}
                className="rounded-lg p-1.5 text-muted-foreground hover:bg-secondary"
              >
                ✕
              </button>
            </div>

            <div className="mt-4">
              {loadingAudit ? (
                <div className="py-8 text-center text-xs text-muted-foreground">Consultando registros...</div>
              ) : auditLogs.length === 0 ? (
                <p className="py-8 text-center text-xs text-muted-foreground">
                  Nenhum evento registrado até o momento.
                </p>
              ) : (
                <div className="space-y-2">
                  {auditLogs.map((log) => (
                    <div
                      key={log.id}
                      className="rounded-lg border border-border/80 bg-secondary/30 p-2.5 text-xs"
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-mono font-bold text-primary">{log.acao}</span>
                        <span className="text-[10px] text-muted-foreground">
                          {new Date(log.created_at || log.createdAt).toLocaleString("pt-BR")}
                        </span>
                      </div>
                      <div className="mt-1 text-muted-foreground">
                        Entidade: <strong className="text-foreground">{log.entidade}</strong>
                        {log.usuario && (
                          <> · Autor: <strong className="text-foreground">{log.usuario.username}</strong></>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Confirmação de Exclusão com Auditoria */}
      <ConfirmDialog
        isOpen={Boolean(campaignToDelete)}
        title={`Excluir campanha "${campaignToDelete?.nome}"?`}
        message="Esta ação é irreversível. Todos os NPCs, notas, encontros e mapas associados a esta campanha serão apagados permanentemente."
        requireTypedText={campaignToDelete?.nome}
        onConfirm={handleDeleteCampaign}
        onCancel={() => setCampaignToDelete(null)}
      />
    </div>
  );
}
