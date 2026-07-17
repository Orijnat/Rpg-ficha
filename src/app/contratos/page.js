"use client";

import React from "react";
import { Check, Plus, Trash2, FileText } from "lucide-react";
import { SectionHeader, Card, EditableText } from "..//components/ui";
import { useCharacter } from "../context/CharacterContext";

export default function Contratos() {
  const { data, addContract, updContract, removeContract } = useCharacter();

  return (
    <div className="space-y-4">
      <Card>
        <div className="mb-3 flex items-center justify-between">
          <SectionHeader title="Painel de Contratos" icon={<FileText size={14} />} />
          <button onClick={addContract} className="flex items-center gap-1 text-xs text-[#c9862a] transition-colors hover:text-[#e8a030]">
            <Plus size={13} /> Novo Contrato
          </button>
        </div>
        <div className="space-y-3">
          {data.contracts.map((contract) => (
            <div
              key={contract.id}
              className={`group rounded-lg border p-3 transition-all ${
                contract.done
                  ? "border-[rgba(201,134,42,0.1)] opacity-50"
                  : "border-[rgba(201,134,42,0.3)] hover:border-[rgba(201,134,42,0.5)]"
              }`}
            >
              <div className="flex items-start gap-3">
                <button
                  onClick={() => updContract(contract.id, { done: !contract.done })}
                  className={`mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded border transition-colors ${
                    contract.done
                      ? "border-[#4a7c59] bg-[#4a7c59] text-white"
                      : "border-[rgba(201,134,42,0.4)] hover:border-[#c9862a]"
                  }`}
                >
                  {contract.done ? <Check size={11} /> : null}
                </button>
                <div className="flex-1 space-y-1">
                  <EditableText
                    value={contract.title}
                    onChange={(value) => updContract(contract.id, { title: value })}
                    className={`text-sm font-medium ${contract.done ? "line-through text-[#8a7355]" : "text-[#e8d5b0]"}`}
                  />
                  <div className="flex items-center gap-2 text-xs">
                    <span className="text-[#8a7355]" style={{ fontFamily: "'Cinzel', serif" }}>
                      Recompensa:
                    </span>
                    <EditableText value={contract.reward} onChange={(value) => updContract(contract.id, { reward: value })} className="text-[#c9862a]" />
                  </div>
                </div>
                <button onClick={() => removeContract(contract.id)} className="shrink-0 text-[#8b1a1a] opacity-0 transition-all group-hover:opacity-100 hover:text-[#c02020]">
                  <Trash2 size={13} />
                </button>
              </div>
            </div>
          ))}

          {data.contracts.length === 0 ? <p className="py-6 text-center text-sm italic text-[#8a7355]">Nenhum contrato ativo</p> : null}
        </div>
      </Card>
    </div>
  );
}
