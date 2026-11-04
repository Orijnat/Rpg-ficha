"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import {
  Clock,
  Copy,
  Crown,
  ExternalLink,
  Filter,
  HeartPulse,
  Plus,
  RefreshCw,
  Search,
  Shield,
  ShieldAlert,
  Skull,
  Sparkles,
  Sword,
  Tag,
  Trash2,
  Users,
} from "lucide-react";
import { Card, SectionHeader } from "../../components/ui";
import ConfirmDialog from "../../components/admin/ConfirmDialog";
import {
  deleteNpc,
  duplicateNpc,
  listNpcs,
} from "../../../lib/api";
import { useAuth } from "../../context/AuthContext";

export default function NpcCataloguePage() {
  const { token, isMaster } = useAuth();

  const [npcs, setNpcs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [refreshing, setRefreshing] = useState(false);

  // Filtros e busca
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedTag, setSelectedTag] = useState("todas");
  const [attitudeFilter, setAttitudeFilter] = useState("todos"); // 'todos' | 'Aliado' | 'Neutro' | 'Hostil' | 'Chefe'
  const [statusFilter, setStatusFilter] = useState("todos"); // 'todos' | 'Ativo' | 'Inconsciente' | 'Derrotado' | 'Fugiu'
  const [sortBy, setSortBy] = useState("recent"); // 'recent' | 'nome_asc' | 'nome_desc' | 'hp_desc' | 'hp_asc'

  // Modal de exclusão
  const [npcToDelete, setNpcToDelete] = useState(null);

  // Modal de duplicação / variante
  const [duplicateTarget, setDuplicateTarget] = useState(null);
  const [variantSuffix, setVariantSuffix] = useState(" (Elite)");
  const [variantHpMultiplier, setVariantHpMultiplier] = useState(1.5);
  const [duplicating, setDuplicating] = useState(false);

  const loadData = async () => {
    setLoading(true);
    setError("");
    try {
      const data = await listNpcs({}, token).catch(() => []);
      setNpcs(Array.isArray(data) ? data : []);
    } catch (err) {
      setError(err.message || "Erro ao carregar catálogo de NPCs.");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    if (isMaster) {
      loadData();
    }
  }, [isMaster, token]);

  const handleRefresh = () => {
    setRefreshing(true);
    loadData();
  };

  // Coleta todas as tags únicas dos NPCs
  const availableTags = useMemo(() => {
    const tagsSet = new Set();
    npcs.forEach((npc) => {
      const tags = npc.dadosExtras?.tags;
      if (Array.isArray(tags)) {
        tags.forEach((t) => tagsSet.add(t));
      }
    });
    return Array.from(tagsSet).sort();
  }, [npcs]);

  // Aplicação de filtros e ordenação
  const filteredNpcs = useMemo(() => {
    return npcs
      .filter((npc) => {
        // Filtro de atitude
        if (attitudeFilter !== "todos") {
          const atitude = npc.dadosExtras?.attitude || "Neutro";
          if (atitude !== attitudeFilter) return false;
        }

        // Filtro de status
        if (statusFilter !== "todos") {
          const status = npc.dadosExtras?.status || (npc.hp > 0 ? "Ativo" : "Derrotado");
          if (status !== statusFilter) return false;
        }

        // Filtro por tag
        if (selectedTag !== "todas") {
          const tags = npc.dadosExtras?.tags || [];
          if (!tags.includes(selectedTag)) return false;
        }

        // Busca textual
        if (searchTerm.trim()) {
          const term = searchTerm.toLowerCase();
          const nameMatch = (npc.nome || "").toLowerCase().includes(term);
          const roleMatch = (npc.papel || "").toLowerCase().includes(term);
          const tagsMatch = (npc.dadosExtras?.tags || []).some((t) =>
            t.toLowerCase().includes(term)
          );
          if (!nameMatch && !roleMatch && !tagsMatch) return false;
        }

        return true;
      })
      .sort((a, b) => {
        if (sortBy === "nome_asc") return (a.nome || "").localeCompare(b.nome || "");
        if (sortBy === "nome_desc") return (b.nome || "").localeCompare(a.nome || "");
        if (sortBy === "hp_desc") return (b.hpMax || b.hp || 0) - (a.hpMax || a.hp || 0);
        if (sortBy === "hp_asc") return (a.hpMax || a.hp || 0) - (b.hpMax || b.hp || 0);
        return new Date(b.updatedAt || b.createdAt || 0) - new Date(a.updatedAt || a.createdAt || 0);
      });
  }, [npcs, attitudeFilter, statusFilter, selectedTag, searchTerm, sortBy]);

  // Ação de exclusão confirmada
  const handleConfirmDelete = async () => {
    if (!npcToDelete) return;
    try {
      await deleteNpc(npcToDelete.id, token);
      setNpcs((prev) => prev.filter((item) => item.id !== npcToDelete.id));
      setNpcToDelete(null);
    } catch (err) {
      alert(err.message || "Falha ao excluir NPC.");
    }
  };

  // Ação de duplicação / variante confirmada
  const handleConfirmDuplicate = async () => {
    if (!duplicateTarget) return;
    setDuplicating(true);
    try {
      const duplicated = await duplicateNpc(
        duplicateTarget.id,
        {
          suffix: variantSuffix,
          hpMultiplier: Number(variantHpMultiplier) || 1,
        },
        token
      );
      setNpcs((prev) => [duplicated, ...prev]);
      setDuplicateTarget(null);
    } catch (err) {
      alert(err.message || "Erro ao duplicar NPC.");
    } finally {
      setDuplicating(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Cabeçalho da Seção */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between border-b border-border/40 pb-4">
        <div>
          <span className="text-[10px] font-bold uppercase tracking-[0.3em] text-primary">
            Bestiário & Criaturas
          </span>
          <h1 className="font-serif text-2xl font-black uppercase tracking-wider text-foreground">
            Catálogo de NPCs & Ameaças
          </h1>
          <p className="text-xs text-muted-foreground mt-0.5">
            Cadastre, categorize com tags, duplique variantes e gerencie monstros fora do escopo de heróis.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleRefresh}
            disabled={refreshing}
            className="flex items-center gap-1.5 rounded-lg border border-border bg-secondary/50 px-3 py-2 text-xs font-semibold text-foreground transition hover:bg-secondary"
            title="Recarregar catálogo"
          >
            <RefreshCw size={14} className={refreshing ? "animate-spin text-primary" : ""} />
            <span>Atualizar</span>
          </button>

          <Link
            href="/admin/npcs/new"
            className="flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-xs font-bold uppercase tracking-wider text-primary-foreground shadow-lg shadow-primary/20 transition hover:bg-primary/90"
          >
            <Plus size={16} />
            <span>Novo NPC Dedicado</span>
          </Link>
        </div>
      </div>

      {error && (
        <div className="rounded-lg border border-red-500/30 bg-red-950/20 p-3 text-xs text-red-300">
          {error}
        </div>
      )}

      {/* Barra de Filtros e Busca */}
      <Card className="border-border bg-card/60 p-4">
        <div className="grid grid-cols-1 gap-3 md:grid-cols-12">
          {/* Busca Textual */}
          <div className="relative md:col-span-4">
            <Search className="absolute left-3 top-2.5 text-muted-foreground" size={16} />
            <input
              type="text"
              placeholder="Buscar por nome, papel ou tag..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full rounded-lg border border-border bg-background py-2 pl-9 pr-3 text-xs text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none"
            />
          </div>

          {/* Filtro por Atitude */}
          <div className="md:col-span-2">
            <select
              value={attitudeFilter}
              onChange={(e) => setAttitudeFilter(e.target.value)}
              className="w-full rounded-lg border border-border bg-background px-3 py-2 text-xs text-foreground focus:border-primary focus:outline-none"
            >
              <option value="todos">Atitude: Todas</option>
              <option value="Hostil">Hostil ⚔️</option>
              <option value="Chefe">Chefe 👑</option>
              <option value="Neutro">Neutro ⚖️</option>
              <option value="Aliado">Aliado 🛡️</option>
            </select>
          </div>

          {/* Filtro por Status */}
          <div className="md:col-span-2">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full rounded-lg border border-border bg-background px-3 py-2 text-xs text-foreground focus:border-primary focus:outline-none"
            >
              <option value="todos">Status: Todos</option>
              <option value="Ativo">Ativo</option>
              <option value="Inconsciente">Inconsciente</option>
              <option value="Derrotado">Derrotado</option>
              <option value="Fugiu">Fugiu</option>
            </select>
          </div>

          {/* Filtro por Tag */}
          <div className="md:col-span-2">
            <select
              value={selectedTag}
              onChange={(e) => setSelectedTag(e.target.value)}
              className="w-full rounded-lg border border-border bg-background px-3 py-2 text-xs text-foreground focus:border-primary focus:outline-none"
            >
              <option value="todas">Tags: Todas</option>
              {availableTags.map((tag) => (
                <option key={tag} value={tag}>
                  #{tag}
                </option>
              ))}
            </select>
          </div>

          {/* Ordenação */}
          <div className="md:col-span-2">
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="w-full rounded-lg border border-border bg-background px-3 py-2 text-xs text-foreground focus:border-primary focus:outline-none"
            >
              <option value="recent">Mais Recentes</option>
              <option value="hp_desc">Maior PV</option>
              <option value="hp_asc">Menor PV</option>
              <option value="nome_asc">Nome (A - Z)</option>
              <option value="nome_desc">Nome (Z - A)</option>
            </select>
          </div>
        </div>
      </Card>

      {/* Lista / Grid de NPCs */}
      {loading ? (
        <div className="flex h-48 items-center justify-center rounded-xl border border-dashed border-border bg-card/20">
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <RefreshCw size={16} className="animate-spin text-primary" />
            <span>Consultando bestiário e catálogo de ameaças...</span>
          </div>
        </div>
      ) : filteredNpcs.length === 0 ? (
        <div className="flex flex-col items-center justify-center gap-3 rounded-xl border border-dashed border-border bg-card/20 py-12 text-center">
          <Skull size={32} className="text-muted-foreground/40" />
          <p className="text-sm font-semibold text-foreground">Nenhum NPC encontrado</p>
          <p className="max-w-md text-xs text-muted-foreground">
            {searchTerm || selectedTag !== "todas" || attitudeFilter !== "todos"
              ? "Tente ajustar os filtros ou termos de pesquisa acima."
              : "Cadastre seu primeiro NPC dedicado para povoar as sessões e combates."}
          </p>
          <Link
            href="/admin/npcs/new"
            className="mt-2 inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-xs font-bold uppercase tracking-wider text-primary-foreground transition hover:bg-primary/90"
          >
            <Plus size={14} />
            <span>Cadastrar Criatura</span>
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {filteredNpcs.map((npc) => {
            const hpCurrent = npc.hp ?? 10;
            const hpTotal = npc.hpMax ?? 10;
            const hpPercent = Math.max(0, Math.min(100, Math.round((hpCurrent / hpTotal) * 100)));
            const ca = npc.dadosExtras?.ca ?? 10;
            const init = npc.dadosExtras?.iniciativa ?? 0;
            const attitude = npc.dadosExtras?.attitude || "Neutro";
            const tags = Array.isArray(npc.dadosExtras?.tags) ? npc.dadosExtras.tags : [];
            const avatarUrl = npc.dadosExtras?.avatar || "";
            const isBoss = attitude === "Chefe" || tags.includes("Chefe");

            const attitudeColors = {
              Hostil: "bg-red-500/10 text-red-400 border-red-500/30",
              Chefe: "bg-purple-500/10 text-purple-400 border-purple-500/30",
              Neutro: "bg-amber-500/10 text-amber-400 border-amber-500/30",
              Aliado: "bg-emerald-500/10 text-emerald-400 border-emerald-500/30",
            };

            return (
              <Card
                key={npc.id}
                className={`flex flex-col justify-between overflow-hidden border p-4 transition-all duration-200 hover:border-primary/50 hover:shadow-lg ${
                  isBoss ? "border-purple-500/40 bg-purple-950/10" : "border-border bg-card/80"
                }`}
              >
                <div>
                  {/* Topo do Card com Avatar e Atitude */}
                  <div className="flex items-start gap-3">
                    <div className="relative h-12 w-12 shrink-0 overflow-hidden rounded-xl border border-border bg-secondary/80">
                      {avatarUrl ? (
                        <img
                          src={avatarUrl}
                          alt={npc.nome}
                          className="h-full w-full object-cover"
                        />
                      ) : (
                        <div className="flex h-full w-full items-center justify-center text-muted-foreground">
                          {isBoss ? <Crown size={20} className="text-purple-400" /> : <Skull size={20} />}
                        </div>
                      )}
                    </div>

                    <div className="min-w-0 flex-1">
                      <div className="flex items-center justify-between gap-1">
                        <span
                          className={`inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider ${
                            attitudeColors[attitude] || attitudeColors.Neutro
                          }`}
                        >
                          {attitude}
                        </span>
                        <span className="text-[10px] font-mono text-muted-foreground">
                          CA {ca}
                        </span>
                      </div>

                      <h3 className="truncate font-serif text-base font-bold text-foreground">
                        {npc.nome}
                      </h3>
                      <p className="truncate text-xs text-muted-foreground">{npc.papel || "Inimigo"}</p>
                    </div>
                  </div>

                  {/* Barra de PV */}
                  <div className="mt-3 space-y-1">
                    <div className="flex justify-between text-[11px] font-mono text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <HeartPulse size={12} className="text-red-400" />
                        <span>PV:</span>
                      </span>
                      <span className="font-semibold text-foreground">
                        {hpCurrent} / {hpTotal}
                      </span>
                    </div>
                    <div className="h-1.5 w-full overflow-hidden rounded-full bg-secondary">
                      <div
                        className={`h-full transition-all duration-300 ${
                          hpPercent > 50
                            ? "bg-emerald-500"
                            : hpPercent > 20
                            ? "bg-amber-500"
                            : "bg-red-500"
                        }`}
                        style={{ width: `${hpPercent}%` }}
                      />
                    </div>
                  </div>

                  {/* Tags */}
                  {tags.length > 0 && (
                    <div className="mt-3 flex flex-wrap gap-1">
                      {tags.map((t) => (
                        <span
                          key={t}
                          className="rounded-md border border-border/60 bg-secondary/50 px-1.5 py-0.5 text-[10px] font-medium text-muted-foreground"
                        >
                          #{t}
                        </span>
                      ))}
                    </div>
                  )}

                  {/* Metadados de Auditoria */}
                  {npc.dadosExtras?.lastModifiedAt && (
                    <div className="mt-3 flex items-center gap-1 text-[10px] text-muted-foreground/70">
                      <Clock size={11} className="text-primary/70" />
                      <span className="truncate">
                        Modificado em {new Date(npc.dadosExtras.lastModifiedAt).toLocaleDateString("pt-BR")}
                      </span>
                    </div>
                  )}
                </div>

                {/* Rodapé com Ações */}
                <div className="mt-4 flex items-center justify-between border-t border-border/40 pt-3">
                  <div className="flex items-center gap-1">
                    {/* Botão Duplicar / Criar Variante */}
                    <button
                      onClick={() => {
                        setDuplicateTarget(npc);
                        setVariantSuffix(" (Elite)");
                        setVariantHpMultiplier(1.5);
                      }}
                      className="flex items-center gap-1 rounded-md border border-border/80 bg-secondary/40 px-2 py-1 text-[11px] font-medium text-foreground transition hover:bg-secondary"
                      title="Duplicar ou criar variante tática deste NPC"
                    >
                      <Copy size={13} className="text-primary" />
                      <span>Variante</span>
                    </button>

                    {/* Botão Excluir Solene */}
                    <button
                      onClick={() => setNpcToDelete(npc)}
                      className="rounded-md p-1.5 text-muted-foreground transition hover:bg-red-950/30 hover:text-red-400"
                      title="Excluir NPC com confirmação solene"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>

                  <Link
                    href={`/admin/npcs/${npc.id}`}
                    className="inline-flex items-center gap-1 rounded-md bg-secondary px-2.5 py-1 text-xs font-semibold text-foreground transition hover:bg-primary hover:text-primary-foreground"
                  >
                    <span>Editar</span>
                    <ExternalLink size={12} />
                  </Link>
                </div>
              </Card>
            );
          })}
        </div>
      )}

      {/* Modal de Duplicação e Variantes Táticas */}
      {duplicateTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-xl border border-primary/40 bg-card p-6 shadow-2xl">
            <div className="flex items-center gap-3 border-b border-border/40 pb-3">
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary/10 text-primary">
                <Sparkles size={20} />
              </div>
              <div>
                <h3 className="font-serif text-base font-black text-foreground">
                  Gerar Variante Tática
                </h3>
                <p className="text-xs text-muted-foreground">
                  Baseado em: <strong>{duplicateTarget.nome}</strong>
                </p>
              </div>
            </div>

            <div className="mt-4 space-y-4">
              <div>
                <label className="block text-xs font-semibold text-foreground">
                  Sufixo do Nome
                </label>
                <input
                  type="text"
                  value={variantSuffix}
                  onChange={(e) => setVariantSuffix(e.target.value)}
                  placeholder="Ex: (Elite), Alfa, Espectral"
                  className="mt-1 w-full rounded-lg border border-border bg-background px-3 py-2 text-xs text-foreground focus:border-primary focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-foreground">
                  Multiplicador de Pontos de Vida (PV)
                </label>
                <div className="mt-1 flex items-center gap-3">
                  <input
                    type="range"
                    min="0.5"
                    max="3.0"
                    step="0.1"
                    value={variantHpMultiplier}
                    onChange={(e) => setVariantHpMultiplier(parseFloat(e.target.value))}
                    className="flex-1 accent-primary"
                  />
                  <span className="w-12 text-right font-mono text-xs font-bold text-primary">
                    {variantHpMultiplier.toFixed(1)}x
                  </span>
                </div>
                <p className="mt-1 text-[11px] text-muted-foreground">
                  Novo PV Estimado:{" "}
                  <strong className="text-foreground">
                    {Math.round((duplicateTarget.hpMax || duplicateTarget.hp || 10) * variantHpMultiplier)}
                  </strong>
                </p>
              </div>
            </div>

            <div className="mt-6 flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setDuplicateTarget(null)}
                disabled={duplicating}
                className="rounded-lg border border-border px-3 py-1.5 text-xs font-semibold text-muted-foreground hover:bg-secondary hover:text-foreground"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={handleConfirmDuplicate}
                disabled={duplicating}
                className="flex items-center gap-1.5 rounded-lg bg-primary px-4 py-1.5 text-xs font-bold text-primary-foreground hover:bg-primary/90"
              >
                {duplicating ? (
                  <RefreshCw size={13} className="animate-spin" />
                ) : (
                  <Copy size={13} />
                )}
                <span>{duplicating ? "Duplicando..." : "Criar Variante"}</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal de Confirmação Solene de Exclusão */}
      <ConfirmDialog
        isOpen={Boolean(npcToDelete)}
        title="Expurgar Ameaça do Catálogo"
        message={`Você está prestes a excluir definitivamente o NPC "${npcToDelete?.nome}". Esta ação não pode ser desfeita.`}
        confirmText="Sim, Expurgar NPC"
        cancelText="Preservar Criatura"
        dangerLevel="danger"
        requireTyping={false}
        onConfirm={handleConfirmDelete}
        onClose={() => setNpcToDelete(null)}
      />
    </div>
  );
}
