"use client";

import { ChevronDown, ChevronUp, Coins, Package, Plus, Trash2 } from "lucide-react";
import { useCharacter } from "../context/CharacterContext";
import { Card, EditableNumber, EditableText, SectionHeader } from "../components/ui";

export default function InventarioPage() {
  const { data, upd, addItem, removeItem, updItem } = useCharacter();

  return (
    <div className="space-y-4">
      <Card>
        <SectionHeader title="Moedas" icon={<Coins size={14} />} />
        <div className="grid grid-cols-4 gap-3">
          {[
            { label: "Platina", key: "platina", color: "#8a7355" },
            { label: "Ouro", key: "ouro", color: "#d4a017" },
            { label: "Prata", key: "prata", color: "#c0c0c0" },
            { label: "Cobre", key: "cobre", color: "#b87333" },
          ].map(({ label, key, color }) => (
            <div key={key} className="flex flex-col items-center gap-1 rounded-lg border border-[rgba(201,134,42,0.15)] bg-[#0f0d0a] p-3">
              <span className="text-[10px] uppercase tracking-widest" style={{ color, fontFamily: "'Cinzel', serif" }}>
                {label}
              </span>
              <EditableNumber value={data[key]} onChange={(value) => upd(key, value)} className="text-lg font-bold" min={0} />
            </div>
          ))}
        </div>
      </Card>

      <Card>
        <div className="mb-3 flex items-center justify-between">
          <SectionHeader title="Itens & Equipamentos" icon={<Package size={14} />} />
          <button onClick={addItem} className="flex items-center gap-1 text-xs text-[#c9862a] transition-colors hover:text-[#e8a030]">
            <Plus size={13} /> Adicionar
          </button>
        </div>
        <div className="space-y-1">
          {data.inventory.map((item) => (
            <div key={item.id} className="group flex items-center gap-2 border-b border-[rgba(201,134,42,0.08)] py-1.5 last:border-0">
              <div className="flex-1">
                <EditableText value={item.name} onChange={(value) => updItem(item.id, { name: value })} className="text-sm text-[#e8d5b0]" />
              </div>
              <div className="flex shrink-0 items-center gap-1">
                <button
                  onClick={() => updItem(item.id, { qty: Math.max(0, item.qty - 1) })}
                  className="flex h-5 w-5 items-center justify-center rounded bg-[#241c13] text-xs text-[#8a7355] hover:text-[#c9862a]"
                >
                  <ChevronDown size={11} />
                </button>
                <EditableNumber
                  value={item.qty}
                  onChange={(value) => updItem(item.id, { qty: value })}
                  className="w-8 text-center font-mono text-xs text-[#c9862a]"
                  min={0}
                />
                <button
                  onClick={() => updItem(item.id, { qty: item.qty + 1 })}
                  className="flex h-5 w-5 items-center justify-center rounded bg-[#241c13] text-xs text-[#8a7355] hover:text-[#c9862a]"
                >
                  <ChevronUp size={11} />
                </button>
              </div>
              <button onClick={() => removeItem(item.id)} className="text-[#8b1a1a] opacity-0 transition-all group-hover:opacity-100 hover:text-[#c02020]">
                <Trash2 size={13} />
              </button>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}
