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
} from "lucide-react";
import { useCharacter } from "../context/CharacterContext";
import { useDice } from "../context/DiceContext";
import { Card, EditableNumber, EditableText, SectionHeader } from "../components/ui";

export default function InventarioPage() {
  const { data, upd, addItem, removeItem, updItem } = useCharacter();
  const { executeRoll } = useDice();
  const [searchTerm, setSearchTerm] = useState("");

  const filteredItems = useMemo(() => {
    if (!searchTerm.trim()) return data.inventory;
    const term = searchTerm.toLowerCase();
    return data.inventory.filter((item) =>
      item.name.toLowerCase().includes(term)
    );
  }, [data.inventory, searchTerm]);

  // Checa se o nome do item parece conter uma fórmula de dado (ex: "1d6", "2d8+2")
  const extractDiceFormula = (name) => {
    const match = name.match(/(\d+)?d(\d+)([+-]\d+)?/i);
    return match ? match[0] : null;
  };

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
        <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <SectionHeader
              title={`Mochila & Equipamentos (${data.inventory.length})`}
              icon={<Package size={14} />}
            />
          </div>

          <div className="flex items-center gap-2">
            {/* Barra de Pesquisa */}
            <div className="relative">
              <Search
                size={13}
                className="pointer-events-none absolute left-2.5 top-1/2 -translate-y-1/2 text-[#8a7355]"
              />
              <input
                type="text"
                placeholder="Buscar item..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-36 rounded-lg border border-white/10 bg-white/5 py-1 pl-8 pr-2 text-xs text-[#f5e9d7] outline-none transition focus:w-48 focus:border-[#d69a3d]"
              />
            </div>

            <button
              onClick={addItem}
              className="flex items-center gap-1.5 rounded-lg border border-[#d69a3d]/40 bg-[#d69a3d]/10 px-3 py-1.5 text-xs font-semibold text-[#d69a3d] transition-all hover:bg-[#d69a3d]/20 active:scale-95"
            >
              <Plus size={13} /> Novo Item
            </button>
          </div>
        </div>

        <div className="space-y-1">
          {filteredItems.map((item) => {
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

          {filteredItems.length === 0 && (
            <p className="py-8 text-center text-xs italic text-[#8a7355]">
              {searchTerm ? "Nenhum item encontrado na pesquisa." : "Mochila vazia."}
            </p>
          )}
        </div>
      </Card>
    </div>
  );
}
