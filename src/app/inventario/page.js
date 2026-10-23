"use client";

import { useState, useMemo } from "react";
import {
  ChevronDown,
  ChevronUp,
  Coins,
  Package,
  Plus,
  Trash2,
  Search,
  Dices,
  ArrowUpDown,
  Filter,
  AlertTriangle,
} from "lucide-react";
import { useCharacter } from "../context/CharacterContext";
import { useDice } from "../context/DiceContext";
import { Card, EditableNumber, EditableText, SectionHeader } from "../components/ui";
import { calculateCapacity } from "../../lib/modifiers";

export default function InventarioPage() {
  const { data, upd, addItem, removeItem, updItem } = useCharacter();
  const { executeRoll } = useDice();
  const [searchTerm, setSearchTerm] = useState("");
  const [sortBy, setSortBy] = useState("default"); // "default" | "name" | "qty-desc" | "qty-asc"
  const [filterType, setFilterType] = useState("all"); // "all" | "weapons" | "consumables" | "others"

  const capacity = useMemo(() => calculateCapacity(data), [data]);

  // Checa se o nome do item parece conter uma fórmula de dado (ex: "1d6", "2d8+2")
  const extractDiceFormula = (name) => {
    const match = name.match(/(\d+)?d(\d+)([+-]\d+)?/i);
    return match ? match[0] : null;
  };

  const isWeaponOrAttack = (name = "") => {
    const lower = name.toLowerCase();
    return Boolean(
      extractDiceFormula(name) ||
        lower.includes("espada") ||
        lower.includes("adaga") ||
        lower.includes("arco") ||
        lower.includes("besta") ||
        lower.includes("rifle") ||
        lower.includes("pistola") ||
        lower.includes("revolver") ||
        lower.includes("machado") ||
        lower.includes("lança")
    );
  };

  const isConsumableOrAmmo = (name = "") => {
    const lower = name.toLowerCase();
    return Boolean(
      lower.includes("bala") ||
        lower.includes("munição") ||
        lower.includes("poção") ||
        lower.includes("óleo") ||
        lower.includes("erva") ||
        lower.includes("flor") ||
        lower.includes("virote") ||
        lower.includes("flecha")
    );
  };

  const filteredAndSortedItems = useMemo(() => {
    let result = [...data.inventory];

    // Filtro por tipo
    if (filterType === "weapons") {
      result = result.filter((item) => isWeaponOrAttack(item.name));
    } else if (filterType === "consumables") {
      result = result.filter((item) => isConsumableOrAmmo(item.name));
    } else if (filterType === "others") {
      result = result.filter((item) => !isWeaponOrAttack(item.name) && !isConsumableOrAmmo(item.name));
    }

    // Busca textual
    if (searchTerm.trim()) {
      const term = searchTerm.toLowerCase();
      result = result.filter((item) => item.name.toLowerCase().includes(term));
    }

    // Ordenação
    if (sortBy === "name") {
      result.sort((a, b) => a.name.localeCompare(b.name, "pt-BR"));
    } else if (sortBy === "qty-desc") {
      result.sort((a, b) => (Number(b.qty) || 0) - (Number(a.qty) || 0));
    } else if (sortBy === "qty-asc") {
      result.sort((a, b) => (Number(a.qty) || 0) - (Number(b.qty) || 0));
    }

    return result;
  }, [data.inventory, filterType, searchTerm, sortBy]);

  return (
    <div className="space-y-4">
      {/* Seção de Moedas */}
      <Card>
        <SectionHeader title="Tesouro & Moedas" icon={<Coins size={14} />} />
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          {[
            { label: "Latina", key: "latina", fallbackKey: "platina", color: "#a5b4fc" },
            { label: "Ouro", key: "ouro", color: "#fbbf24" },
            { label: "Prata", key: "prata", color: "#cbd5e1" },
            { label: "Cobre", key: "cobre", color: "#f97316" },
          ].map(({ label, key, fallbackKey, color }) => {
            const val = data[key] !== undefined ? data[key] : (data[fallbackKey] ?? 0);

            return (
              <div
                key={key}
                className="flex flex-col items-center gap-1.5 rounded-xl border border-white/5 bg-white/[0.02] p-3 transition-colors hover:border-white/10"
              >
                <span
                  className="text-[11px] font-bold uppercase tracking-widest"
                  style={{ color }}
                >
                  {label}
                </span>
                <EditableNumber
                  value={val}
                  onChange={(value) => {
                    upd(key, value);
                    if (fallbackKey) upd(fallbackKey, value);
                  }}
                  className="text-center font-mono text-xl font-bold text-[#f5e9d7]"
                  min={0}
                />
              </div>
            );
          })}
        </div>
      </Card>

      {/* Seção de Inventário e Mochila */}
      <Card>
        {/* Barra de Capacidade de Carga */}
        <div className="mb-4 rounded-xl border border-white/10 bg-background/50 p-3.5">
          <div className="flex flex-wrap items-center justify-between gap-2 text-xs">
            <div className="flex items-center gap-2">
              <Package size={15} className="text-primary" />
              <span className="font-serif font-bold text-foreground">Capacidade de Carga</span>
              {capacity.isOverloaded && (
                <span className="flex items-center gap-1 rounded bg-rose-500/20 px-2 py-0.5 text-[10px] font-bold text-rose-300">
                  <AlertTriangle size={11} /> Sobrecarga!
                </span>
              )}
            </div>
            <div className="flex items-center gap-1.5 font-mono text-xs">
              <span className={capacity.isOverloaded ? "font-bold text-rose-400" : "font-bold text-foreground"}>
                {capacity.carried}
              </span>
              <span className="text-muted-foreground">/</span>
              <span className="text-muted-foreground">{capacity.max} unidades</span>
              <span className="text-[10px] text-muted-foreground">({capacity.percentage}%)</span>
            </div>
          </div>
          <div className="mt-2 h-2 w-full overflow-hidden rounded-full border border-white/10 bg-background/80">
            <div
              className={`h-full transition-all duration-300 ${
                capacity.isOverloaded
                  ? "bg-rose-500"
                  : capacity.percentage > 80
                  ? "bg-amber-400"
                  : "bg-primary"
              }`}
              style={{ width: `${capacity.percentage}%` }}
            />
          </div>
        </div>

        <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <SectionHeader
              title={`Mochila & Equipamentos (${filteredAndSortedItems.length}/${data.inventory.length})`}
              icon={<Package size={14} />}
            />
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {/* Seletor de Ordenação */}
            <div className="flex items-center gap-1 rounded-lg border border-white/10 bg-white/5 px-2 py-1 text-xs text-muted-foreground">
              <ArrowUpDown size={12} className="text-primary" />
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="bg-transparent text-xs text-foreground outline-none cursor-pointer"
              >
                <option value="default" className="bg-card text-foreground">Ordem original</option>
                <option value="name" className="bg-card text-foreground">Nome (A-Z)</option>
                <option value="qty-desc" className="bg-card text-foreground">Maior Quantidade</option>
                <option value="qty-asc" className="bg-card text-foreground">Menor Quantidade</option>
              </select>
            </div>

            {/* Barra de Pesquisa */}
            <div className="relative">
              <Search
                size={13}
                className="pointer-events-none absolute left-2.5 top-1/2 -translate-y-1/2 text-muted-foreground"
              />
              <input
                type="text"
                placeholder="Buscar item..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-36 rounded-lg border border-white/10 bg-white/5 py-1 pl-8 pr-2 text-xs text-foreground outline-none transition focus:w-48 focus:border-primary"
              />
            </div>

            <button
              onClick={addItem}
              className="flex items-center gap-1.5 rounded-lg border border-primary/40 bg-primary/10 px-3 py-1.5 text-xs font-semibold text-primary transition-all hover:bg-primary/20 active:scale-95"
            >
              <Plus size={13} /> Novo Item
            </button>
          </div>
        </div>

        {/* Chips de Filtro por Categoria */}
        <div className="mb-3 flex flex-wrap items-center gap-1.5 border-b border-white/10 pb-3 text-xs">
          <span className="flex items-center gap-1 text-[11px] font-medium text-muted-foreground mr-1">
            <Filter size={11} /> Filtrar:
          </span>
          {[
            { id: "all", label: "Todos" },
            { id: "weapons", label: "Armas & Fórmulas" },
            { id: "consumables", label: "Munições & Poções" },
            { id: "others", label: "Outros" },
          ].map((chip) => (
            <button
              key={chip.id}
              type="button"
              onClick={() => setFilterType(chip.id)}
              className={`rounded-md px-2.5 py-1 text-xs font-medium transition ${
                filterType === chip.id
                  ? "bg-primary text-primary-foreground font-semibold"
                  : "border border-white/10 bg-white/5 text-muted-foreground hover:bg-white/10 hover:text-foreground"
              }`}
            >
              {chip.label}
            </button>
          ))}
        </div>

        <div className="space-y-1">
          {filteredAndSortedItems.map((item) => {
            const formula = extractDiceFormula(item.name);

            return (
              <div
                key={item.id}
                className="group flex items-center gap-3 rounded-lg border border-transparent px-2 py-2 transition-all hover:border-white/5 hover:bg-white/[0.02]"
              >
                <div className="flex-1">
                  <EditableText
                    value={item.name}
                    onChange={(value) => updItem(item.id, { name: value })}
                    className="text-xs font-medium text-[#e8d5b0] transition hover:text-[#f5e9d7]"
                  />
                </div>

                {/* Botão de Rolagem Rápida se o item tiver dados no nome (ex: 1d6) */}
                {formula && (
                  <button
                    onClick={() => {
                      executeRoll({
                        sides: 20,
                        mode: "normal",
                        label: `Dano/Efeito: ${item.name}`,
                      });
                    }}
                    className="flex items-center gap-1 rounded border border-primary/30 bg-primary/15 px-2 py-0.5 text-[10px] font-mono font-bold text-primary hover:bg-primary/30"
                    title={`Rolar teste com ${item.name}`}
                  >
                    <Dices size={10} />
                    <span>{formula}</span>
                  </button>
                )}

                {/* Contador de Quantidade */}
                <div className="flex shrink-0 items-center gap-1">
                  <button
                    onClick={() => updItem(item.id, { qty: Math.max(0, item.qty - 1) })}
                    className="flex h-7 w-7 items-center justify-center rounded border border-border bg-secondary text-xs text-muted-foreground transition hover:border-primary/40 hover:bg-primary/10 hover:text-primary"
                    title="Diminuir"
                  >
                    <ChevronDown size={12} />
                  </button>

                  <EditableNumber
                    value={item.qty}
                    onChange={(value) => updItem(item.id, { qty: value })}
                    className="w-8 text-center font-mono text-xs font-bold text-[#d69a3d]"
                    min={0}
                  />

                  <button
                    onClick={() => updItem(item.id, { qty: item.qty + 1 })}
                    className="flex h-7 w-7 items-center justify-center rounded border border-border bg-secondary text-xs text-muted-foreground transition hover:border-primary/40 hover:bg-primary/10 hover:text-primary"
                    title="Aumentar"
                  >
                    <ChevronUp size={12} />
                  </button>
                </div>

                {/* Remover Item */}
                <button
                  onClick={() => removeItem(item.id)}
                  className="rounded p-1 text-[#8b1a1a] opacity-0 transition-all group-hover:opacity-100 hover:bg-rose-500/10 hover:text-rose-400"
                  title="Excluir item"
                >
                  <Trash2 size={13} />
                </button>
              </div>
            );
          })}

          {filteredAndSortedItems.length === 0 && (
            <p className="py-8 text-center text-xs italic text-muted-foreground">
              {searchTerm || filterType !== "all"
                ? "Nenhum item corresponde aos filtros selecionados."
                : "Mochila vazia."}
            </p>
          )}
        </div>
      </Card>
    </div>
  );
}
