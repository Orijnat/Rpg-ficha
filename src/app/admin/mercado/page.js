"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import {
  ArrowUpDown,
  Boxes,
  Check,
  ChevronDown,
  ChevronUp,
  Coins,
  Copy,
  Edit2,
  Filter,
  Layers,
  MapPin,
  Package,
  Plus,
  RefreshCw,
  RotateCcw,
  Search,
  Shield,
  Sparkles,
  Store,
  Tag,
  Trash2,
  UserCheck,
  Users,
} from "lucide-react";
import { Card, SectionHeader } from "../../components/ui";
import ConfirmDialog from "../../components/admin/ConfirmDialog";
import MarketItemModal from "../../components/admin/MarketItemModal";
import VendorModal from "../../components/admin/VendorModal";
import {
  CATEGORIAS_ITEM,
  DEFAULT_MARKET_ITEMS,
  MOEDAS,
  RARIDADES,
  REGIOES_CANONICAS,
  VENDEDORES_PADRAO,
  calculateMarketStats,
  createMarketItem,
  filterMarketItems,
  formatItemClipboard,
  formatItemPrice,
  formatItemWeight,
  groupItemsByRegion,
  groupItemsByType,
  groupItemsByVendor,
} from "../../../lib/market";
import { useAuth } from "../../context/AuthContext";

const STORAGE_KEY_ITEMS = "rpg_world_market_data_v1";
const STORAGE_KEY_VENDORS = "rpg_world_market_vendors_v1";

export default function AdminMercadoPage() {
  const { isMaster } = useAuth();

  // Itens e Vendedores
  const [items, setItems] = useState([]);
  const [vendors, setVendors] = useState([]);
  const [isLoaded, setIsLoaded] = useState(false);

  // Modo de exibição: "catalogo" | "regioes" | "vendedores" | "tipos"
  const [activeTab, setActiveTab] = useState("catalogo");

  // Filtros do Catálogo
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedRegion, setSelectedRegion] = useState("todas");
  const [selectedVendor, setSelectedVendor] = useState("todos");
  const [selectedType, setSelectedType] = useState("todos");
  const [selectedRarity, setSelectedRarity] = useState("todas");
  const [stockFilter, setStockFilter] = useState("todos"); // "todos" | "disponivel" | "esgotado"
  const [sortBy, setSortBy] = useState("nome_asc");

  // Modais
  const [isItemModalOpen, setIsItemModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [isVendorModalOpen, setIsVendorModalOpen] = useState(false);
  const [editingVendor, setEditingVendor] = useState(null);

  // Confirmações
  const [itemToDelete, setItemToDelete] = useState(null);
  const [vendorToDelete, setVendorToDelete] = useState(null);
  const [isResetConfirmOpen, setIsResetConfirmOpen] = useState(false);

  // Feedback de cópia
  const [copiedItemId, setCopiedItemId] = useState(null);

  // Carregar dados salvos no localStorage
  useEffect(() => {
    if (typeof window === "undefined") return;
    try {
      const savedItems = window.localStorage.getItem(STORAGE_KEY_ITEMS);
      const savedVendors = window.localStorage.getItem(STORAGE_KEY_VENDORS);

      if (savedItems) {
        const parsed = JSON.parse(savedItems);
        setItems(Array.isArray(parsed) && parsed.length > 0 ? parsed : DEFAULT_MARKET_ITEMS);
      } else {
        setItems(DEFAULT_MARKET_ITEMS);
      }

      if (savedVendors) {
        const parsedV = JSON.parse(savedVendors);
        setVendors(Array.isArray(parsedV) && parsedV.length > 0 ? parsedV : VENDEDORES_PADRAO);
      } else {
        setVendors(VENDEDORES_PADRAO);
      }
    } catch {
      setItems(DEFAULT_MARKET_ITEMS);
      setVendors(VENDEDORES_PADRAO);
    } finally {
      setIsLoaded(true);
    }
  }, []);

  // Salvar alterações
  useEffect(() => {
    if (!isLoaded || typeof window === "undefined") return;
    try {
      window.localStorage.setItem(STORAGE_KEY_ITEMS, JSON.stringify(items));
    } catch (e) {
      console.error("Erro ao salvar itens do mercado:", e);
    }
  }, [items, isLoaded]);

  useEffect(() => {
    if (!isLoaded || typeof window === "undefined") return;
    try {
      window.localStorage.setItem(STORAGE_KEY_VENDORS, JSON.stringify(vendors));
    } catch (e) {
      console.error("Erro ao salvar vendedores do mercado:", e);
    }
  }, [vendors, isLoaded]);

  // Regiões disponíveis (canônicas + customizadas encontradas nos itens e vendedores)
  const availableRegions = useMemo(() => {
    const set = new Set(REGIOES_CANONICAS);
    items.forEach((item) => {
      if (item.regiao) set.add(item.regiao);
    });
    vendors.forEach((vend) => {
      if (vend.regiao) set.add(vend.regiao);
    });
    return Array.from(set);
  }, [items, vendors]);

  // Estatísticas do mercado
  const stats = useMemo(() => calculateMarketStats(items), [items]);

  // Itens filtrados para o catálogo
  const filteredItems = useMemo(() => {
    return filterMarketItems(items, {
      searchTerm,
      selectedRegion,
      selectedVendor,
      selectedType,
      selectedRarity,
      stockFilter,
      sortBy,
    });
  }, [items, searchTerm, selectedRegion, selectedVendor, selectedType, selectedRarity, stockFilter, sortBy]);

  // Agrupamentos
  const itemsByRegion = useMemo(() => groupItemsByRegion(items), [items]);
  const itemsByVendor = useMemo(() => groupItemsByVendor(items), [items]);
  const itemsByType = useMemo(() => groupItemsByType(items), [items]);

  // Ações de Itens
  const handleSaveItem = (itemData) => {
    if (editingItem) {
      setItems((prev) =>
        prev.map((item) => (item.id === editingItem.id ? { ...item, ...itemData } : item))
      );
    } else {
      const newItem = createMarketItem(itemData);
      setItems((prev) => [newItem, ...prev]);
    }
    setIsItemModalOpen(false);
    setEditingItem(null);
  };

  const handleDeleteItem = (id) => {
    setItems((prev) => prev.filter((item) => item.id !== id));
    setItemToDelete(null);
  };

  const handleAdjustStock = (id, delta) => {
    setItems((prev) =>
      prev.map((item) => {
        if (item.id !== id) return item;
        const currentQty = Number(item.quantidade) || 0;
        const newQty = Math.max(0, currentQty + delta);
        return { ...item, quantidade: newQty };
      })
    );
  };

  const handleToggleStockDepleted = (id) => {
    setItems((prev) =>
      prev.map((item) => {
        if (item.id !== id) return item;
        const currentQty = Number(item.quantidade) || 0;
        return { ...item, quantidade: currentQty > 0 ? 0 : 5 };
      })
    );
  };

  const handleCopyItem = (item) => {
    const formatted = formatItemClipboard(item);
    navigator.clipboard.writeText(formatted);
    setCopiedItemId(item.id);
    setTimeout(() => setCopiedItemId(null), 2500);
  };

  // Ações de Vendedores
  const handleSaveVendor = (vendorData) => {
    if (editingVendor) {
      setVendors((prev) =>
        prev.map((vend) => (vend.id === editingVendor.id ? { ...vend, ...vendorData } : vend))
      );
    } else {
      setVendors((prev) => [vendorData, ...prev]);
    }
    setIsVendorModalOpen(false);
    setEditingVendor(null);
  };

  const handleDeleteVendor = (id) => {
    setVendors((prev) => prev.filter((vend) => vend.id !== id));
    setVendorToDelete(null);
  };

  // Restaurar dados de fábrica
  const handleResetToDefault = () => {
    setItems(DEFAULT_MARKET_ITEMS);
    setVendors(VENDEDORES_PADRAO);
    setIsResetConfirmOpen(false);
  };

  const getRarityBadge = (raridade) => {
    const r = RARIDADES.find((item) => item.id === raridade) || RARIDADES[0];
    return (
      <span
        className={`inline-flex items-center gap-1 rounded border px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider ${r.color}`}
      >
        <Sparkles size={10} />
        {r.label}
      </span>
    );
  };

  const getCurrencyBadge = (moeda = "ouro") => {
    const m = MOEDAS.find((c) => c.id === moeda) || MOEDAS[0];
    return (
      <span
        className="font-mono text-xs font-bold"
        style={{ color: m.color }}
      >
        {m.sigla}
      </span>
    );
  };

  return (
    <div className="space-y-6">
      {/* Placa de Destaque / Painel Principal do Mercado */}
      <div className="guild-plaque ornate-frame border-2 border-primary/45 bg-card/95 p-5 shadow-[0_18px_50px_rgba(0,0,0,0.4)] sm:p-7">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <div className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.32em] text-primary">
              <Store size={15} />
              Câmara do Mestre · Comércio & Entrepostos
            </div>
            <h1 className="mt-2 font-serif text-3xl font-black uppercase tracking-[0.12em] text-foreground sm:text-4xl">
              Mercado do Mundo
            </h1>
            <p className="mt-2 max-w-2xl font-serif text-base text-muted-foreground">
              Catálogo de mercadorias, provisões e relíquias das regiões do reino. Controle estoques por vendedor, preços em moedas, pesos e categorias de equipamentos.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={() => {
                setEditingVendor(null);
                setIsVendorModalOpen(true);
              }}
              className="flex min-h-10 items-center justify-center gap-2 rounded-lg border border-primary/40 bg-secondary px-3.5 py-2 text-xs font-bold uppercase tracking-wider text-foreground transition hover:border-primary/60 hover:bg-primary/10 active:scale-95"
            >
              <UserCheck size={14} className="text-primary" />
              + Novo Mercador
            </button>
            <button
              type="button"
              onClick={() => {
                setEditingItem(null);
                setIsItemModalOpen(true);
              }}
              className="flex min-h-10 items-center justify-center gap-2 rounded-lg border-2 border-primary/50 bg-primary px-4 py-2 text-xs font-black uppercase tracking-wider text-primary-foreground shadow-lg shadow-primary/30 transition hover:brightness-110 active:scale-95"
            >
              <Plus size={15} />
              + Novo Item de Mercado
            </button>
          </div>
        </div>

        {/* Indicadores do Mercado */}
        <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-5">
          <div className="rounded-xl border border-primary/20 bg-primary/5 p-3 text-center">
            <span className="block text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
              Itens Cadastrados
            </span>
            <span className="mt-1 font-serif text-2xl font-black text-foreground">
              {stats.totalItens}
            </span>
          </div>

          <div className="rounded-xl border border-primary/20 bg-primary/5 p-3 text-center">
            <span className="block text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
              Regiões Comerciais
            </span>
            <span className="mt-1 font-serif text-2xl font-black text-primary">
              {stats.totalRegioes}
            </span>
          </div>

          <div className="rounded-xl border border-primary/20 bg-primary/5 p-3 text-center">
            <span className="block text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
              Vendedores & Tendas
            </span>
            <span className="mt-1 font-serif text-2xl font-black text-amber-400">
              {stats.totalVendedores}
            </span>
          </div>

          <div className="rounded-xl border border-primary/20 bg-primary/5 p-3 text-center">
            <span className="block text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
              Estoque Global
            </span>
            <span className="mt-1 font-serif text-2xl font-black text-emerald-400">
              {stats.estoqueTotal} un.
            </span>
          </div>

          <div className="rounded-xl border border-primary/20 bg-primary/5 p-3 text-center">
            <span className="block text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
              Itens Esgotados
            </span>
            <span className={`mt-1 font-serif text-2xl font-black ${stats.esgotados > 0 ? "text-rose-400" : "text-muted-foreground"}`}>
              {stats.esgotados}
            </span>
          </div>
        </div>
      </div>

      {/* Navegação entre Modos de Visualização */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border/80 pb-2">
        <div className="flex overflow-x-auto gap-1.5 p-1 rounded-xl border border-border bg-secondary/40">
          {[
            { id: "catalogo", label: "Catálogo & Filtros", icon: Store },
            { id: "regioes", label: "Por Região do Mundo", icon: MapPin },
            { id: "vendedores", label: "Por Vendedor / Tendas", icon: Users },
            { id: "tipos", label: "Por Tipos de Itens", icon: Layers },
          ].map((tab) => {
            const Icon = tab.icon;
            const active = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveTab(tab.id)}
                className={`flex shrink-0 items-center gap-2 rounded-lg px-3.5 py-2 text-xs font-bold uppercase tracking-wider transition ${
                  active
                    ? "bg-primary text-primary-foreground shadow-md shadow-primary/20"
                    : "text-muted-foreground hover:bg-secondary hover:text-foreground"
                }`}
              >
                <Icon size={14} />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        <button
          type="button"
          onClick={() => setIsResetConfirmOpen(true)}
          className="flex items-center gap-1.5 rounded-lg border border-border bg-secondary/60 px-3 py-1.5 text-xs text-muted-foreground hover:border-primary/40 hover:text-foreground transition active:scale-95"
          title="Restaura a lista canônica original de itens e mercadores"
        >
          <RotateCcw size={13} />
          <span>Restaurar Catálogo Padrão</span>
        </button>
      </div>

      {/* ABA 1: CATÁLOGO GERAL COM FILTROS AVANÇADOS */}
      {activeTab === "catalogo" && (
        <div className="space-y-4">
          {/* Barra de Filtros Cruzados */}
          <Card className="p-4">
            <div className="flex flex-col gap-3">
              {/* Linha de Busca */}
              <div className="relative">
                <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground" />
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Buscar itens por nome, efeito, vendedor, região..."
                  className="min-h-11 w-full rounded-xl border border-border bg-input-background pl-10 pr-4 text-sm text-foreground outline-none focus:border-primary"
                />
                {searchTerm && (
                  <button
                    type="button"
                    onClick={() => setSearchTerm("")}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-bold text-muted-foreground hover:text-foreground"
                  >
                    Limpar
                  </button>
                )}
              </div>

              {/* Filtros em Linha: Região, Vendedor, Tipo, Raridade, Estoque, Ordenação */}
              <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-6">
                {/* Região */}
                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-wider text-muted-foreground mb-1">
                    Região
                  </label>
                  <select
                    value={selectedRegion}
                    onChange={(e) => setSelectedRegion(e.target.value)}
                    className="min-h-9 w-full rounded-lg border border-border bg-secondary/80 px-2 text-xs text-foreground outline-none focus:border-primary"
                  >
                    <option value="todas">Todas as Regiões</option>
                    {availableRegions.map((reg) => (
                      <option key={reg} value={reg}>
                        {reg}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Vendedor */}
                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-wider text-muted-foreground mb-1">
                    Vendedor
                  </label>
                  <select
                    value={selectedVendor}
                    onChange={(e) => setSelectedVendor(e.target.value)}
                    className="min-h-9 w-full rounded-lg border border-border bg-secondary/80 px-2 text-xs text-foreground outline-none focus:border-primary"
                  >
                    <option value="todos">Todos os Mercadores</option>
                    {vendors.map((v) => (
                      <option key={v.nome} value={v.nome}>
                        {v.nome}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Tipo de Item */}
                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-wider text-muted-foreground mb-1">
                    Tipo de Item
                  </label>
                  <select
                    value={selectedType}
                    onChange={(e) => setSelectedType(e.target.value)}
                    className="min-h-9 w-full rounded-lg border border-border bg-secondary/80 px-2 text-xs text-foreground outline-none focus:border-primary"
                  >
                    <option value="todos">Todos os Tipos</option>
                    {CATEGORIAS_ITEM.map((tipo) => (
                      <option key={tipo} value={tipo}>
                        {tipo}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Raridade */}
                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-wider text-muted-foreground mb-1">
                    Raridade
                  </label>
                  <select
                    value={selectedRarity}
                    onChange={(e) => setSelectedRarity(e.target.value)}
                    className="min-h-9 w-full rounded-lg border border-border bg-secondary/80 px-2 text-xs text-foreground outline-none focus:border-primary"
                  >
                    <option value="todas">Todas as Raridades</option>
                    {RARIDADES.map((r) => (
                      <option key={r.id} value={r.id}>
                        {r.label}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Filtro de Estoque */}
                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-wider text-muted-foreground mb-1">
                    Estoque
                  </label>
                  <select
                    value={stockFilter}
                    onChange={(e) => setStockFilter(e.target.value)}
                    className="min-h-9 w-full rounded-lg border border-border bg-secondary/80 px-2 text-xs text-foreground outline-none focus:border-primary"
                  >
                    <option value="todos">Todos os Itens</option>
                    <option value="disponivel">Somente em Estoque</option>
                    <option value="esgotado">Somente Esgotados</option>
                  </select>
                </div>

                {/* Ordenação */}
                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-wider text-muted-foreground mb-1">
                    Ordenar Por
                  </label>
                  <select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value)}
                    className="min-h-9 w-full rounded-lg border border-border bg-secondary/80 px-2 text-xs text-foreground outline-none focus:border-primary"
                  >
                    <option value="nome_asc">Nome (A - Z)</option>
                    <option value="nome_desc">Nome (Z - A)</option>
                    <option value="preco_asc">Menor Preço</option>
                    <option value="preco_desc">Maior Preço</option>
                    <option value="peso_asc">Mais Leve</option>
                    <option value="peso_desc">Mais Pesado</option>
                    <option value="qtd_desc">Maior Estoque</option>
                  </select>
                </div>
              </div>
            </div>
          </Card>

          {/* Lista de Itens do Catálogo */}
          {filteredItems.length === 0 ? (
            <div className="rounded-2xl border-2 border-dashed border-border p-10 text-center">
              <Store size={36} className="mx-auto text-muted-foreground/40 mb-3" />
              <h3 className="font-serif text-lg font-bold text-foreground">
                Nenhum item encontrado no mercado
              </h3>
              <p className="mt-1 text-sm text-muted-foreground">
                Tente ajustar os filtros acima ou cadastre um novo item comercial.
              </p>
              <button
                type="button"
                onClick={() => {
                  setSearchTerm("");
                  setSelectedRegion("todas");
                  setSelectedVendor("todos");
                  setSelectedType("todos");
                  setSelectedRarity("todas");
                  setStockFilter("todos");
                }}
                className="mt-4 inline-flex items-center gap-1.5 rounded-lg border border-primary/40 bg-primary/10 px-3 py-1.5 text-xs font-semibold text-primary hover:bg-primary/20"
              >
                Resetar Filtros
              </button>
            </div>
          ) : (
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {filteredItems.map((item) => {
                const isOutOfStock = (Number(item.quantidade) || 0) <= 0;
                const isCopied = copiedItemId === item.id;

                return (
                  <div
                    key={item.id}
                    className={`group relative flex flex-col justify-between rounded-xl border-2 p-4 transition-all ${
                      isOutOfStock
                        ? "border-border/60 bg-secondary/20 opacity-80"
                        : "border-border bg-card hover:border-primary/50 hover:bg-primary/5 shadow-sm"
                    }`}
                  >
                    <div>
                      {/* Topo do Card: Tipo, Raridade e Copiar */}
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex flex-wrap items-center gap-1.5">
                          <span className="rounded bg-secondary px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-muted-foreground border border-border">
                            {item.tipo}
                          </span>
                          {getRarityBadge(item.raridade)}
                        </div>

                        <div className="flex items-center gap-1">
                          <button
                            type="button"
                            onClick={() => handleCopyItem(item)}
                            className="rounded p-1 text-muted-foreground hover:bg-primary/20 hover:text-primary transition"
                            title="Copiar dados formatados do item para o chat ou inventário"
                          >
                            {isCopied ? <Check size={14} className="text-emerald-400" /> : <Copy size={14} />}
                          </button>
                          <button
                            type="button"
                            onClick={() => {
                              setEditingItem(item);
                              setIsItemModalOpen(true);
                            }}
                            className="rounded p-1 text-muted-foreground hover:bg-secondary hover:text-foreground transition"
                            title="Editar item"
                          >
                            <Edit2 size={14} />
                          </button>
                          <button
                            type="button"
                            onClick={() => setItemToDelete(item)}
                            className="rounded p-1 text-muted-foreground hover:bg-destructive/15 hover:text-destructive transition"
                            title="Excluir item"
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>
                      </div>

                      {/* Nome do Item */}
                      <h4 className="mt-2.5 font-serif text-base font-bold text-foreground group-hover:text-primary transition-colors">
                        {item.nome}
                      </h4>

                      {/* Vendedor e Região */}
                      <div className="mt-2 space-y-1 text-xs">
                        <div className="flex items-center gap-1.5 text-muted-foreground">
                          <Store size={13} className="shrink-0 text-primary/70" />
                          <span className="truncate">
                            <strong className="text-foreground">{item.vendedor}</strong>
                          </span>
                        </div>
                        <div className="flex items-center gap-1.5 text-muted-foreground">
                          <MapPin size={13} className="shrink-0 text-amber-500/70" />
                          <span className="truncate">{item.regiao}</span>
                        </div>
                      </div>

                      {/* Descrição e Efeitos */}
                      {item.descricao && (
                        <p className="mt-2.5 rounded-lg border border-border/40 bg-secondary/40 p-2.5 text-xs leading-relaxed text-muted-foreground font-serif">
                          {item.descricao}
                        </p>
                      )}

                      {/* Requisitos */}
                      {item.requisitos && (
                        <div className="mt-2 text-[11px] text-amber-400/90 font-medium">
                          ⚙️ <span className="underline">Requisitos:</span> {item.requisitos}
                        </div>
                      )}
                    </div>

                    {/* Rodapé: Preço, Peso e Controle de Estoque */}
                    <div className="mt-4 pt-3 border-t border-border/70 flex flex-wrap items-center justify-between gap-2">
                      <div className="flex items-center gap-3">
                        {/* Preço */}
                        <div className="flex items-center gap-1">
                          <Coins size={14} className="text-amber-400" />
                          <strong className="font-mono text-sm text-foreground">
                            {item.preco}
                          </strong>
                          {getCurrencyBadge(item.moeda)}
                        </div>

                        {/* Peso */}
                        <div className="flex items-center gap-1 text-xs text-muted-foreground">
                          <span className="font-bold">⚖️</span>
                          <span>{formatItemWeight(item.peso)}</span>
                        </div>
                      </div>

                      {/* Controle Rápido de Estoque */}
                      <div className="flex items-center gap-1.5">
                        <button
                          type="button"
                          onClick={() => handleAdjustStock(item.id, -1)}
                          disabled={item.quantidade <= 0}
                          className="h-6 w-6 rounded border border-border bg-secondary text-xs font-bold text-foreground hover:bg-destructive/20 hover:text-destructive hover:border-destructive/40 disabled:opacity-30 disabled:pointer-events-none transition"
                          title="Diminuir estoque (-1)"
                        >
                          -
                        </button>
                        <span
                          className={`font-mono text-xs font-bold px-1.5 py-0.5 rounded ${
                            isOutOfStock
                              ? "bg-rose-500/20 text-rose-300 border border-rose-500/30"
                              : "bg-primary/10 text-primary border border-primary/20"
                          }`}
                          title={`Estoque atual: ${item.quantidade}`}
                        >
                          {isOutOfStock ? "Esgotado" : `${item.quantidade} un.`}
                        </span>
                        <button
                          type="button"
                          onClick={() => handleAdjustStock(item.id, +1)}
                          className="h-6 w-6 rounded border border-border bg-secondary text-xs font-bold text-foreground hover:bg-emerald-500/20 hover:text-emerald-400 hover:border-emerald-500/40 transition"
                          title="Aumentar estoque (+1)"
                        >
                          +
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* ABA 2: LISTAGEM POR REGIÃO DO MUNDO */}
      {activeTab === "regioes" && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h3 className="font-serif text-lg font-bold text-foreground flex items-center gap-2">
              <MapPin size={18} className="text-primary" />
              Mercados e Feiras por Região do Mundo
            </h3>
            <span className="text-xs text-muted-foreground">
              {availableRegions.length} Regiões cadastradas
            </span>
          </div>

          <div className="space-y-6">
            {availableRegions.map((regiao) => {
              const regItems = itemsByRegion[regiao] || [];
              const regVendors = vendors.filter((v) => v.regiao === regiao);

              return (
                <Card key={regiao} className="p-5">
                  <div className="border-b border-primary/30 pb-3 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                    <div>
                      <div className="flex items-center gap-2">
                        <MapPin size={16} className="text-primary" />
                        <h4 className="font-serif text-base font-bold text-foreground">
                          {regiao}
                        </h4>
                        <span className="rounded-full bg-primary/20 px-2 py-0.5 text-[10px] font-bold text-primary">
                          {regItems.length} {regItems.length === 1 ? "item" : "itens"}
                        </span>
                      </div>
                      <p className="mt-1 text-xs text-muted-foreground">
                        {regVendors.length > 0 ? (
                          <>
                            Comerciantes ativos:{" "}
                            <span className="text-foreground font-semibold">
                              {regVendors.map((v) => v.nome).join(", ")}
                            </span>
                          </>
                        ) : (
                          "Nenhum mercador permanente registrado nesta região."
                        )}
                      </p>
                    </div>

                    <button
                      type="button"
                      onClick={() => {
                        setEditingItem({ regiao });
                        setIsItemModalOpen(true);
                      }}
                      className="self-start sm:self-auto flex items-center gap-1 rounded-lg border border-primary/40 bg-primary/10 px-2.5 py-1 text-xs font-semibold text-primary hover:bg-primary/20"
                    >
                      <Plus size={13} /> + Item nesta Região
                    </button>
                  </div>

                  {regItems.length === 0 ? (
                    <p className="mt-4 text-xs italic text-muted-foreground">
                      Ainda não há mercadorias cadastradas para esta região.
                    </p>
                  ) : (
                    <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                      {regItems.map((item) => (
                        <div
                          key={item.id}
                          className="rounded-lg border border-border bg-secondary/30 p-3 flex flex-col justify-between"
                        >
                          <div>
                            <div className="flex items-center justify-between text-xs">
                              <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                                {item.tipo}
                              </span>
                              {getRarityBadge(item.raridade)}
                            </div>
                            <strong className="mt-1.5 block font-serif text-sm text-foreground">
                              {item.nome}
                            </strong>
                            <div className="mt-1 flex items-center gap-1 text-[11px] text-primary">
                              <Store size={11} />
                              <span>{item.vendedor}</span>
                            </div>
                            {item.descricao && (
                              <p className="mt-2 text-xs text-muted-foreground line-clamp-2 font-serif">
                                {item.descricao}
                              </p>
                            )}
                          </div>

                          <div className="mt-3 pt-2 border-t border-border/60 flex items-center justify-between text-xs">
                            <span className="font-bold text-foreground">
                              {formatItemPrice(item.preco, item.moeda)}
                            </span>
                            <span className="text-muted-foreground font-mono">
                              ⚖️ {formatItemWeight(item.peso)}
                            </span>
                            <span
                              className={`font-mono text-[11px] font-bold px-1.5 py-0.2 rounded ${
                                item.quantidade > 0
                                  ? "bg-primary/15 text-primary"
                                  : "bg-rose-500/20 text-rose-300"
                              }`}
                            >
                              {item.quantidade > 0 ? `${item.quantidade} un.` : "Esgotado"}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </Card>
              );
            })}
          </div>
        </div>
      )}

      {/* ABA 3: LISTAGEM POR VENDEDOR / TENDAS DO MERCADO */}
      {activeTab === "vendedores" && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h3 className="font-serif text-lg font-bold text-foreground flex items-center gap-2">
              <Users size={18} className="text-primary" />
              Tendas e Mercadores do Reino
            </h3>
            <button
              type="button"
              onClick={() => {
                setEditingVendor(null);
                setIsVendorModalOpen(true);
              }}
              className="flex items-center gap-1.5 rounded-lg border-2 border-primary/50 bg-primary px-3 py-1.5 text-xs font-bold text-primary-foreground hover:brightness-110"
            >
              <Plus size={14} /> + Cadastrar Vendedor
            </button>
          </div>

          <div className="grid gap-6">
            {vendors.map((vendor) => {
              const vendorItems = itemsByVendor[vendor.nome] || [];

              return (
                <Card key={vendor.id || vendor.nome} className="p-5 border-2 border-primary/30">
                  {/* Cabeçalho do Vendedor */}
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 border-b border-border/80 pb-4">
                    <div className="flex items-start gap-3.5">
                      <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl border border-primary/40 bg-primary/10 text-primary">
                        <Store size={24} />
                      </div>
                      <div>
                        <div className="flex flex-wrap items-center gap-2">
                          <h4 className="font-serif text-lg font-black text-foreground">
                            {vendor.nome}
                          </h4>
                          <span className="rounded bg-primary/20 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-primary border border-primary/30">
                            {vendor.titulo || "Mercador"}
                          </span>
                        </div>
                        <div className="mt-1 flex flex-wrap items-center gap-3 text-xs text-muted-foreground">
                          <span className="flex items-center gap-1">
                            <MapPin size={12} className="text-amber-400" />
                            {vendor.regiao}
                          </span>
                          {vendor.especialidade && (
                            <span className="flex items-center gap-1">
                              <Tag size={12} className="text-primary" />
                              {vendor.especialidade}
                            </span>
                          )}
                        </div>
                        {vendor.humor && (
                          <p className="mt-2 text-xs italic text-amber-200/80 font-serif">
                            &ldquo;{vendor.humor}&rdquo;
                          </p>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center gap-2 self-start sm:self-auto">
                      <button
                        type="button"
                        onClick={() => {
                          setEditingItem({ vendedor: vendor.nome, regiao: vendor.regiao });
                          setIsItemModalOpen(true);
                        }}
                        className="flex items-center gap-1 rounded-lg border border-primary/40 bg-primary/15 px-3 py-1.5 text-xs font-bold text-primary hover:bg-primary/25 transition active:scale-95"
                      >
                        <Plus size={13} /> + Item para {vendor.nome.split(" ")[0]}
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setEditingVendor(vendor);
                          setIsVendorModalOpen(true);
                        }}
                        className="rounded p-1.5 text-muted-foreground hover:bg-secondary hover:text-foreground transition"
                        title="Editar mercador"
                      >
                        <Edit2 size={15} />
                      </button>
                      <button
                        type="button"
                        onClick={() => setVendorToDelete(vendor)}
                        className="rounded p-1.5 text-muted-foreground hover:bg-destructive/15 hover:text-destructive transition"
                        title="Remover mercador"
                      >
                        <Trash2 size={15} />
                      </button>
                    </div>
                  </div>

                  {/* Vitrine de Produtos deste Vendedor */}
                  <div className="mt-4">
                    <span className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground block mb-2">
                      Estoque à Venda ({vendorItems.length} {vendorItems.length === 1 ? "produto" : "produtos"}):
                    </span>

                    {vendorItems.length === 0 ? (
                      <p className="rounded-lg border border-dashed border-border p-4 text-xs italic text-muted-foreground text-center">
                        Esta tenda ainda não possui mercadorias registradas. Adicione um item acima!
                      </p>
                    ) : (
                      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                        {vendorItems.map((item) => (
                          <div
                            key={item.id}
                            className="rounded-lg border border-border bg-secondary/40 p-3 flex flex-col justify-between"
                          >
                            <div>
                              <div className="flex items-center justify-between text-xs">
                                <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                                  {item.tipo}
                                </span>
                                {getRarityBadge(item.raridade)}
                              </div>
                              <strong className="mt-1 block font-serif text-sm text-foreground">
                                {item.nome}
                              </strong>
                              {item.descricao && (
                                <p className="mt-1.5 text-xs text-muted-foreground line-clamp-2 font-serif">
                                  {item.descricao}
                                </p>
                              )}
                            </div>

                            <div className="mt-3 pt-2 border-t border-border/70 flex items-center justify-between text-xs">
                              <span className="font-bold text-foreground">
                                {formatItemPrice(item.preco, item.moeda)}
                              </span>
                              <span className="text-muted-foreground font-mono">
                                ⚖️ {formatItemWeight(item.peso)}
                              </span>
                              <span
                                className={`font-mono text-[11px] font-bold px-1.5 py-0.5 rounded ${
                                  item.quantidade > 0
                                    ? "bg-primary/20 text-primary"
                                    : "bg-rose-500/20 text-rose-300"
                                }`}
                              >
                                {item.quantidade > 0 ? `${item.quantidade} un.` : "Esgotado"}
                              </span>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </Card>
              );
            })}
          </div>
        </div>
      )}

      {/* ABA 4: LISTAGEM POR TIPOS DE ITENS */}
      {activeTab === "tipos" && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h3 className="font-serif text-lg font-bold text-foreground flex items-center gap-2">
              <Layers size={18} className="text-primary" />
              Mercado Agrupado por Tipos de Itens
            </h3>
            <span className="text-xs text-muted-foreground">
              {CATEGORIAS_ITEM.length} Categorias canônicas
            </span>
          </div>

          <div className="space-y-6">
            {CATEGORIAS_ITEM.map((tipo) => {
              const typeItems = itemsByType[tipo] || [];

              return (
                <Card key={tipo} className="p-5">
                  <div className="border-b border-primary/30 pb-3 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Package size={16} className="text-primary" />
                      <h4 className="font-serif text-base font-bold text-foreground">
                        {tipo}
                      </h4>
                      <span className="rounded-full bg-primary/20 px-2 py-0.5 text-[10px] font-bold text-primary">
                        {typeItems.length} {typeItems.length === 1 ? "item" : "itens"}
                      </span>
                    </div>

                    <button
                      type="button"
                      onClick={() => {
                        setEditingItem({ tipo });
                        setIsItemModalOpen(true);
                      }}
                      className="flex items-center gap-1 rounded-lg border border-primary/40 bg-primary/10 px-2.5 py-1 text-xs font-semibold text-primary hover:bg-primary/20"
                    >
                      <Plus size={13} /> + Item em {tipo}
                    </button>
                  </div>

                  {typeItems.length === 0 ? (
                    <p className="mt-4 text-xs italic text-muted-foreground">
                      Nenhum item desta categoria cadastrado no mercado mundial.
                    </p>
                  ) : (
                    <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                      {typeItems.map((item) => (
                        <div
                          key={item.id}
                          className="rounded-lg border border-border bg-secondary/30 p-3 flex flex-col justify-between"
                        >
                          <div>
                            <div className="flex items-center justify-between text-xs">
                              {getRarityBadge(item.raridade)}
                              <span className="text-[11px] font-mono font-bold text-foreground">
                                {formatItemPrice(item.preco, item.moeda)}
                              </span>
                            </div>
                            <strong className="mt-1.5 block font-serif text-sm text-foreground">
                              {item.nome}
                            </strong>
                            <div className="mt-1 space-y-0.5 text-[11px] text-muted-foreground">
                              <p className="truncate">
                                👤 <strong>{item.vendedor}</strong>
                              </p>
                              <p className="truncate">
                                🗺️ {item.regiao}
                              </p>
                            </div>
                            {item.descricao && (
                              <p className="mt-2 text-xs text-muted-foreground line-clamp-2 font-serif">
                                {item.descricao}
                              </p>
                            )}
                          </div>

                          <div className="mt-3 pt-2 border-t border-border/60 flex items-center justify-between text-xs">
                            <span className="text-muted-foreground font-mono">
                              ⚖️ {formatItemWeight(item.peso)}
                            </span>
                            <span
                              className={`font-mono text-[11px] font-bold px-1.5 py-0.2 rounded ${
                                item.quantidade > 0
                                  ? "bg-primary/15 text-primary"
                                  : "bg-rose-500/20 text-rose-300"
                              }`}
                            >
                              Estoque: {item.quantidade}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </Card>
              );
            })}
          </div>
        </div>
      )}

      {/* MODAL DE CRIAÇÃO / EDIÇÃO DE ITEM */}
      <MarketItemModal
        isOpen={isItemModalOpen}
        initialItem={editingItem}
        availableRegions={availableRegions}
        availableVendors={vendors}
        onSave={handleSaveItem}
        onClose={() => {
          setIsItemModalOpen(false);
          setEditingItem(null);
        }}
      />

      {/* MODAL DE CRIAÇÃO / EDIÇÃO DE VENDEDOR */}
      <VendorModal
        isOpen={isVendorModalOpen}
        initialVendor={editingVendor}
        availableRegions={availableRegions}
        onSave={handleSaveVendor}
        onClose={() => {
          setIsVendorModalOpen(false);
          setEditingVendor(null);
        }}
      />

      {/* CONFIRMAÇÃO DE EXCLUSÃO DE ITEM */}
      <ConfirmDialog
        isOpen={Boolean(itemToDelete)}
        title="Remover Item do Mercado"
        message={`Tem certeza que deseja remover o item "${itemToDelete?.nome}" do mercado de ${itemToDelete?.vendedor}? Esta ação é permanente.`}
        confirmText="Excluir Item"
        cancelText="Manter"
        dangerLevel="danger"
        onConfirm={() => itemToDelete && handleDeleteItem(itemToDelete.id)}
        onCancel={() => setItemToDelete(null)}
      />

      {/* CONFIRMAÇÃO DE EXCLUSÃO DE VENDEDOR */}
      <ConfirmDialog
        isOpen={Boolean(vendorToDelete)}
        title="Remover Mercador / Tenda"
        message={`Deseja remover o comerciante "${vendorToDelete?.nome}" de ${vendorToDelete?.regiao}? Os itens desse vendedor permanecerão no catálogo sob seu nome até serem reatribuídos.`}
        confirmText="Remover Mercador"
        cancelText="Cancelar"
        dangerLevel="danger"
        onConfirm={() => vendorToDelete && handleDeleteVendor(vendorToDelete.id)}
        onCancel={() => setVendorToDelete(null)}
      />

      {/* CONFIRMAÇÃO DE RESTAURAÇÃO DE PADRÕES */}
      <ConfirmDialog
        isOpen={isResetConfirmOpen}
        title="Restaurar Catálogo Padrão do Mundo"
        message="Esta ação substituirá todos os itens e mercadores atuais pelo catálogo canônico de fábrica. Alterações não salvas externamente serão perdidas."
        confirmText="Restaurar Padrões"
        cancelText="Voltar"
        dangerLevel="warning"
        requireTypedText="RESTAURAR"
        onConfirm={handleResetToDefault}
        onCancel={() => setIsResetConfirmOpen(false)}
      />
    </div>
  );
}
