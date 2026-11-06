"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import {
  Clock,
  Copy,
  ExternalLink,
  Filter,
  HeartPulse,
  Plus,
  ScrollText,
  Search,
  Shield,
  ShieldAlert,
  Skull,
  Sparkles,
  Trash2,
  Users,
} from "lucide-react";
import { Card, SectionHeader } from "../../components/ui";
import ConfirmDialog from "../../components/admin/ConfirmDialog";
import {
  deleteCharacterOnBackend,
  deleteNpc,
  duplicateNpc,
  listCharacters,
  listNpcs,
} from "../../../lib/api";
import { useAuth } from "../../context/AuthContext";

export default function PersonagensAdmin() {
  const { token, isMaster, inspectCharacter } = useAuth();

  const [heroes, setHeroes] = useState([]);
  const [npcs, setNpcs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Filtros e busca
  const [activeTab, setActiveTab] = useState("todos"); // 'todos' | 'jogadores' | 'npcs'
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedTag, setSelectedTag] = useState("todas");
  const [statusFilter, setStatusFilter] = useState("todos"); // 'todos' | 'vivos' | 'inconscientes' | 'derrotados'
  const [sortBy, setSortBy] = useState("recent"); // 'recent' | 'nome_asc' | 'nome_desc' | 'hp_desc' | 'hp_asc'

  // Confirmações
  const [itemToDelete, setItemToDelete] = useState(null); // { type: 'hero'|'npc', id, name }
  const [duplicateTarget, setDuplicateTarget] = useState(null); // npc to duplicate
  const [variantSuffix, setVariantSuffix] = useState(" (Elite)");
  const [variantHpMultiplier, setVariantHpMultiplier] = useState(1.5);
  const [duplicating, setDuplicating] = useState(false);

  const loadData = async () => {
    setLoading(true);
    setError("");
    try {
      const [charsData, npcsData] = await Promise.all([
        listCharacters(token).catch(() => []),
        listNpcs({}, token).catch(() => []),
      ]);
      setHeroes(Array.isArray(charsData) ? charsData : []);
      setNpcs(Array.isArray(npcsData) ? npcsData : []);
    } catch (err) {
      setError(err.message || "Erro ao carregar dados.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isMaster) {
      loadData();
    }
  }, [isMaster, token]);

  // Lista de tags únicas dos NPCs
  const availableTags = useMemo(() => {
    const tagsSet = new Set();
    npcs.forEach((npc) => {
      const npcTags = npc.dadosExtras?.tags || [];
      if (Array.isArray(npcTags)) {
        npcTags.forEach((t) => tagsSet.add(t));
      }
    });
    return Array.from(tagsSet);
  }, [npcs]);

  // Unificação e filtragem
  const filteredItems = useMemo(() => {
    let combined = [];

    if (activeTab === "todos" || activeTab === "jogadores") {
      combined.push(
        ...heroes.map((h) => ({
          ...h,
          entryType: "hero",
          displayName: h.name,
          displaySubtitle: `${h.job || "Aventureiro"} · Nível ${h.level || 1}`,
          hp: Number(h.hp || 0),
          hpMax: Number(h.hpMax || 1),
          tags: [],
          status: Number(h.hp || 0) <= 0 ? "Inconsciente" : "Ativo",
          lastModifiedBy: h.dadosExtras?.lastModifiedBy,
          lastModifiedAt: h.dadosExtras?.lastModifiedAt,
        }))
      );
    }

    if (activeTab === "todos" || activeTab === "npcs") {
      combined.push(
        ...npcs.map((n) => ({
          ...n,
          entryType: "npc",
          displayName: n.nome,
          displaySubtitle: `${n.papel || "NPC / Ameaça"} · ${n.dadosExtras?.attitude || "Hostil"}`,
          hp: Number(n.hp || 0),
          hpMax: Number(n.hpMax || 1),
          tags: n.dadosExtras?.tags || [],
          status: n.dadosExtras?.status || "Ativo",
          lastModifiedBy: n.dadosExtras?.lastModifiedBy,
          lastModifiedAt: n.dadosExtras?.lastModifiedAt,
        }))
      );
    }

    // Busca textual
    if (searchTerm.trim()) {
      const q = searchTerm.trim().toLowerCase();
      combined = combined.filter(
        (item) =>
          item.displayName.toLowerCase().includes(q) ||
          item.displaySubtitle.toLowerCase().includes(q) ||
          item.tags.some((t) => t.toLowerCase().includes(q)) ||
          item.owner?.username?.toLowerCase().includes(q)
      );
    }

    // Filtro por Tag
    if (selectedTag !== "todas") {
      combined = combined.filter((item) =>
        item.tags.some((t) => t.toLowerCase() === selectedTag.toLowerCase())
      );
    }

    // Filtro por Status
    if (statusFilter === "vivos") {
      combined = combined.filter((item) => item.hp > 0 && item.status !== "Derrotado");
    } else if (statusFilter === "inconscientes") {
      combined = combined.filter((item) => item.hp <= 0 || item.status === "Inconsciente");
    } else if (statusFilter === "derrotados") {
      combined = combined.filter((item) => item.status === "Derrotado");
    }

    // Ordenação
    combined.sort((a, b) => {
      if (sortBy === "nome_asc") return a.displayName.localeCompare(b.displayName);
      if (sortBy === "nome_desc") return b.displayName.localeCompare(a.displayName);
      if (sortBy === "hp_desc") return b.hp - a.hp;
      if (sortBy === "hp_asc") return a.hp - b.hp;
      // 'recent' fallback
      const dateA = new Date(a.updatedAt || a.updated_at || a.lastModifiedAt || 0).getTime();
      const dateB = new Date(b.updatedAt || b.updated_at || b.lastModifiedAt || 0).getTime();
      return dateB - dateA;
    });

    return combined;
  }, [heroes, npcs, activeTab, searchTerm, selectedTag, statusFilter, sortBy]);

  const confirmDelete = async () => {
    if (!itemToDelete) return;
    try {
      if (itemToDelete.type === "hero") {
        await deleteCharacterOnBackend(itemToDelete.id, token);
      } else {
        await deleteNpc(itemToDelete.id, token);
      }
      setItemToDelete(null);
      loadData();
    } catch (err) {
      setError(err.message);
      setItemToDelete(null);
    }
  };

  const handleDuplicateNpc = async () => {
    if (!duplicateTarget) return;
    setDuplicating(true);
    try {
      await duplicateNpc(
        duplicateTarget.id,
        {
          variantSuffix,
          hpMultiplier: Number(variantHpMultiplier),
          addTags: ["Variante", "Elite"],
        },
        token
      );
      setDuplicateTarget(null);
      loadData();
    } catch (err) {
      setError(err.message);
    } finally {
      setDuplicating(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Cabeçalho */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between border-b-2 border-primary/40 pb-4">
        <div>
          <span className="text-[10px] font-bold uppercase tracking-[0.3em] text-primary">
            Câmara do Mestre · Registro Geral
          </span>
          <h1 className="mt-1 font-serif text-3xl font-black uppercase tracking-wider text-foreground">
            Jogadores & Ameaças
          </h1>
          <p className="text-xs text-muted-foreground">
            Gerencie personagens de jogadores e o catálogo completo de NPCs e monstros da mesa.
          </p>
        </div>

        <div className="flex flex-wrap gap-2">
          <Link
            href="/admin/personagens/new"
            className="flex min-h-11 items-center gap-1.5 rounded-lg border-2 border-primary/50 bg-primary/20 px-3.5 text-xs font-bold uppercase tracking-wider text-primary hover:bg-primary/30"
          >
            <Plus size={15} /> Novo Herói
          </Link>
          <Link
            href="/admin/npcs/new"
            className="flex min-h-11 items-center gap-1.5 rounded-lg bg-primary px-4 text-xs font-serif font-bold uppercase tracking-wider text-primary-foreground shadow-lg shadow-primary/20 hover:brightness-110 active:scale-95"
          >
            <Skull size={15} /> Novo NPC / Monstro
          </Link>
        </div>
      </div>

      {error && (
        <div className="border border-destructive/40 bg-destructive/10 p-4 text-sm text-destructive-foreground">
          {error}
        </div>
      )}

      {/* Controles de Filtro, Busca e Abas */}
      <Card className="space-y-4">
        {/* Abas Superiores */}
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border pb-3">
          <div className="flex gap-2">
            {[
              { id: "todos", label: "Todos", count: heroes.length + npcs.length, icon: ScrollText },
              { id: "jogadores", label: "Jogadores / Heróis", count: heroes.length, icon: Users },
              { id: "npcs", label: "NPCs & Monstros", count: npcs.length, icon: Skull },
            ].map((tab) => {
              const Icon = tab.icon;
              const active = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-2 rounded-xl px-3.5 py-2 text-xs font-bold uppercase tracking-wider transition ${
                    active
                      ? "bg-primary text-primary-foreground shadow-md shadow-primary/25"
                      : "border border-border bg-secondary/40 text-muted-foreground hover:border-primary/40 hover:text-foreground"
                  }`}
                >
                  <Icon size={14} />
                  <span>{tab.label}</span>
                  <span
                    className={`rounded-full px-2 py-0.2 text-[10px] ${
                      active ? "bg-black/25 text-primary-foreground" : "bg-black/40 text-muted-foreground"
                    }`}
                  >
                    {tab.count}
                  </span>
                </button>
              );
            })}
          </div>

          {/* Ordenação */}
          <div className="flex items-center gap-2 text-xs">
            <span className="text-muted-foreground uppercase font-semibold">Ordenar:</span>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="rounded-lg border border-border bg-input-background px-2.5 py-1.5 text-xs text-foreground outline-none focus:border-primary"
            >
              <option value="recent">Mais Recentes</option>
              <option value="nome_asc">Nome (A - Z)</option>
              <option value="nome_desc">Nome (Z - A)</option>
              <option value="hp_desc">Maior PV</option>
              <option value="hp_asc">Menor PV</option>
            </select>
          </div>
        </div>

        {/* Linha de Busca e Filtros Avançados */}
        <div className="grid gap-3 sm:grid-cols-[1fr_160px_160px]">
          {/* Campo de Busca */}
          <div className="relative">
            <Search size={15} className="absolute left-3 top-3 text-muted-foreground" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Buscar por nome, classe, dono ou tag..."
              className="h-10 w-full rounded-lg border border-border bg-input-background pl-9 pr-3 text-xs text-foreground outline-none focus:border-primary"
            />
          </div>

          {/* Filtro por Status */}
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="h-10 rounded-lg border border-border bg-input-background px-3 text-xs text-foreground outline-none focus:border-primary"
          >
            <option value="todos">Status: Todos</option>
            <option value="vivos">Apenas Vivos / Ativos</option>
            <option value="inconscientes">Inconscientes (0 PV)</option>
            <option value="derrotados">Derrotados / Mortos</option>
          </select>

          {/* Filtro por Tags (para NPCs) */}
          <select
            value={selectedTag}
            onChange={(e) => setSelectedTag(e.target.value)}
            className="h-10 rounded-lg border border-border bg-input-background px-3 text-xs text-foreground outline-none focus:border-primary"
          >
            <option value="todas">Tags: Todas</option>
            {availableTags.map((tag) => (
              <option key={tag} value={tag}>
                Tag: {tag}
              </option>
            ))}
          </select>
        </div>
      </Card>

      {/* Listagem */}
      <div>
        {loading ? (
          <div className="py-12 text-center text-sm text-muted-foreground">
            Consultando registros da campanha...
          </div>
        ) : filteredItems.length === 0 ? (
          <Card className="py-12 text-center text-muted-foreground">
            <p className="font-serif text-base">Nenhum combatente encontrado com os filtros atuais.</p>
            <p className="mt-1 text-xs">Tente ajustar a busca ou cadastre um novo personagem.</p>
          </Card>
        ) : (
          <div className="grid gap-3 sm:grid-cols-2">
            {filteredItems.map((item) => {
              const isNpc = item.entryType === "npc";
              const isDead = item.hp <= 0 || item.status === "Derrotado";
              const lastMod = item.lastModifiedBy;
              const lastModAt = item.lastModifiedAt;

              return (
                <div
                  key={`${item.entryType}-${item.id}`}
                  className="relative flex flex-col justify-between rounded-xl border-2 border-border bg-card/95 p-4 transition-all hover:border-primary/50 hover:shadow-lg"
                >
                  <div>
                    {/* Topo do Card */}
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-center gap-3">
                        {/* Avatar ou Ícone */}
                        {isNpc && item.dadosExtras?.avatar ? (
                          <img
                            src={item.dadosExtras.avatar}
                            alt={item.displayName}
                            className="h-11 w-11 shrink-0 rounded-lg border border-primary/40 object-cover"
                          />
                        ) : (
                          <div
                            className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-lg border ${
                              isNpc
                                ? "border-accent/40 bg-accent/15 text-accent"
                                : "border-primary/40 bg-primary/15 text-primary"
                            }`}
                          >
                            {isNpc ? <Skull size={20} /> : <Shield size={20} />}
                          </div>
                        )}

                        <div>
                          <div className="flex items-center gap-2">
                            <h3 className="font-serif font-black text-foreground">
                              {item.displayName}
                            </h3>
                            <span
                              className={`rounded px-1.5 py-0.2 text-[9px] font-bold uppercase tracking-wider ${
                                isNpc
                                  ? "border border-accent/40 bg-accent/20 text-accent"
                                  : "border border-primary/40 bg-primary/20 text-primary"
                              }`}
                            >
                              {isNpc ? "NPC" : "Herói"}
                            </span>
                            {isDead && (
                              <span className="rounded border border-rose-500/40 bg-rose-950/40 px-1.5 py-0.2 text-[9px] font-bold uppercase text-rose-400">
                                0 PV
                              </span>
                            )}
                          </div>
                          <p className="text-xs text-muted-foreground">{item.displaySubtitle}</p>
                          {item.owner && (
                            <p className="text-[10px] text-muted-foreground">
                              Jogador: <strong className="text-foreground">{item.owner.username}</strong>
                            </p>
                          )}
                        </div>
                      </div>

                      {/* PV */}
                      <div className="text-right">
                        <div className="flex items-center gap-1 font-mono text-sm font-bold text-foreground">
                          <HeartPulse size={14} className={isDead ? "text-rose-500" : "text-emerald-400"} />
                          <span>
                            {item.hp}/{item.hpMax}
                          </span>
                        </div>
                        {isNpc && item.dadosExtras?.ca && (
                          <span className="text-[10px] text-muted-foreground">
                            CA {item.dadosExtras.ca}
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Tags do NPC */}
                    {isNpc && item.tags.length > 0 && (
                      <div className="mt-2.5 flex flex-wrap gap-1">
                        {item.tags.map((t) => (
                          <span
                            key={t}
                            className="rounded-full border border-border bg-secondary/80 px-2 py-0.2 text-[9px] font-medium text-muted-foreground"
                          >
                            {t}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Rodapé e Ações */}
                  <div className="mt-4 border-t border-border/80 pt-3">
                    {/* Quem alterou e quando */}
                    {lastMod && (
                      <p className="mb-2 flex items-center gap-1 text-[10px] text-muted-foreground">
                        <Clock size={11} className="text-primary" />
                        Alterado por <strong className="text-foreground">{lastMod.name}</strong> em{" "}
                        {lastModAt ? new Date(lastModAt).toLocaleDateString("pt-BR") : "recente"}
                      </p>
                    )}

                    <div className="flex items-center justify-between gap-2">
                      <div className="flex items-center gap-2">
                        {isNpc ? (
                          <>
                            <Link
                              href={`/admin/npcs/${item.id}`}
                              className="rounded-lg border border-primary/40 bg-primary/10 px-2.5 py-1 text-xs font-semibold text-primary transition hover:bg-primary/20"
                            >
                              Editar Ficha
                            </Link>
                            <button
                              type="button"
                              onClick={() => {
                                setDuplicateTarget(item);
                                setVariantSuffix(" (Elite)");
                                setVariantHpMultiplier(1.5);
                              }}
                              className="rounded-lg border border-border bg-secondary px-2 py-1 text-xs text-muted-foreground hover:border-primary hover:text-foreground"
                              title="Duplicar e criar variante"
                            >
                              <Copy size={13} />
                            </button>
                          </>
                        ) : (
                          <>
                            <button
                              type="button"
                              onClick={() => inspectCharacter(item.id)}
                              className="flex items-center gap-1.5 rounded-lg border border-primary/50 bg-primary px-3 py-1.5 text-xs font-bold text-primary-foreground shadow-md shadow-primary/20 hover:brightness-110 active:scale-95 transition"
                            >
                              <ScrollText size={13} />
                              <span>Acessar Ficha Completa</span>
                            </button>
                            <Link
                              href={`/admin/personagens/${item.id}/ficha`}
                              target="_blank"
                              rel="noreferrer"
                              className="flex items-center gap-1 rounded-lg border border-border bg-secondary px-2.5 py-1 text-xs text-muted-foreground hover:border-primary hover:text-foreground"
                              title="Visão Administrativa Rápida"
                            >
                              <span>Visão Rápida</span>
                              <ExternalLink size={10} />
                            </Link>
                            <Link
                              href={`/admin/personagens/${item.id}`}
                              className="rounded-lg border border-border bg-secondary px-2.5 py-1 text-xs text-muted-foreground hover:border-primary hover:text-foreground"
                              title="Editar configurações"
                            >
                              Editar
                            </Link>
                          </>
                        )}
                      </div>

                      <button
                        type="button"
                        onClick={() =>
                          setItemToDelete({
                            type: item.entryType,
                            id: item.id,
                            name: item.displayName,
                          })
                        }
                        className="rounded p-1.5 text-muted-foreground transition hover:bg-destructive/15 hover:text-destructive"
                        title="Excluir"
                      >
                        <Trash2 size={15} />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Modal de Duplicação Rápida de NPC */}
      {duplicateTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-md">
          <div className="w-full max-w-md rounded-2xl border-2 border-primary/50 bg-[#0f1118] p-6 shadow-2xl">
            <h3 className="font-serif text-lg font-bold uppercase text-foreground">
              Duplicar &quot;{duplicateTarget.displayName}&quot;
            </h3>
            <p className="mt-1 text-xs text-muted-foreground">
              Gera um clone independente para você usar como guarda, lacaio ou variante de elite.
            </p>

            <div className="mt-4 space-y-3">
              <div>
                <label className="block text-xs font-semibold text-muted-foreground">
                  Sufixo do Nome:
                </label>
                <input
                  type="text"
                  value={variantSuffix}
                  onChange={(e) => setVariantSuffix(e.target.value)}
                  className="mt-1 min-h-10 w-full rounded border border-border bg-input-background px-3 text-sm text-foreground outline-none focus:border-primary"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-muted-foreground">
                  Multiplicador de PV ({variantHpMultiplier}x ={" "}
                  {Math.round(duplicateTarget.hpMax * variantHpMultiplier)} PV):
                </label>
                <input
                  type="range"
                  min="0.5"
                  max="3"
                  step="0.1"
                  value={variantHpMultiplier}
                  onChange={(e) => setVariantHpMultiplier(Number(e.target.value))}
                  className="mt-2 w-full accent-primary"
                />
              </div>
            </div>

            <div className="mt-6 flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setDuplicateTarget(null)}
                className="rounded-lg border border-border px-4 py-2 text-xs font-bold uppercase text-muted-foreground hover:bg-secondary"
              >
                Cancelar
              </button>
              <button
                type="button"
                disabled={duplicating}
                onClick={handleDuplicateNpc}
                className="rounded-lg bg-primary px-4 py-2 text-xs font-bold uppercase text-primary-foreground hover:brightness-110 disabled:opacity-50"
              >
                {duplicating ? "Clonando..." : "Criar Variante"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Confirmação Solene de Exclusão com Auditoria */}
      <ConfirmDialog
        isOpen={Boolean(itemToDelete)}
        title={`Excluir ${itemToDelete?.type === "hero" ? "Herói" : "NPC"} "${itemToDelete?.name}"?`}
        message={`Esta ação removerá permanentemente o ${
          itemToDelete?.type === "hero" ? "personagem do jogador" : "NPC do mestre"
        } de todas as tabelas. O evento será registrado com identificação e carimbo temporal na auditoria da campanha.`}
        requireTypedText={itemToDelete?.name}
        onConfirm={confirmDelete}
        onCancel={() => setItemToDelete(null)}
      />
    </div>
  );
}
