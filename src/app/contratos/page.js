"use client";

import React, { useState, useMemo } from "react";
import { Check, Plus, Trash2, FileText, CheckCircle2, Clock } from "lucide-react";
import { SectionHeader, Card, EditableText } from "../components/ui";
import { useCharacter } from "../context/CharacterContext";

export default function Contratos() {
  const { data, addContract, updContract, removeContract } = useCharacter();
  const [filter, setFilter] = useState("all"); // "all" | "active" | "done"

  const completedCount = useMemo(
    () => data.contracts.filter((c) => c.done).length,
    [data.contracts]
  );

  const filteredContracts = useMemo(() => {
    if (filter === "active") return data.contracts.filter((c) => !c.done);
    if (filter === "done") return data.contracts.filter((c) => c.done);
    return data.contracts;
  }, [data.contracts, filter]);

  return (
    <div className="space-y-4">
      <Card>
        <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <SectionHeader
              title={`Painel de Contratos (${completedCount}/${data.contracts.length} Concluídos)`}
              icon={<FileText size={14} />}
            />
          </div>

          <div className="flex items-center gap-2">
            {/* Filtros */}
            <div className="flex rounded-lg border border-border bg-secondary p-0.5 text-xs">
              <button
                onClick={() => setFilter("all")}
                className={`rounded-md px-2.5 py-1 font-medium transition ${
                  filter === "all"
                    ? "bg-primary text-primary-foreground"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                Todos
              </button>
              <button
                onClick={() => setFilter("active")}
                className={`flex items-center gap-1 rounded-md px-2.5 py-1 font-medium transition ${
                  filter === "active"
                    ? "bg-primary text-primary-foreground"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                <Clock size={11} />
                Ativos
              </button>
              <button
                onClick={() => setFilter("done")}
                className={`flex items-center gap-1 rounded-md px-2.5 py-1 font-medium transition ${
                  filter === "done"
                    ? "bg-primary text-primary-foreground"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                <CheckCircle2 size={11} />
                Concluídos
              </button>
            </div>

            <button
              onClick={addContract}
              className="flex items-center gap-1.5 rounded-lg border border-primary/40 bg-primary/10 px-3 py-1.5 text-xs font-semibold text-primary transition hover:bg-primary/20 active:scale-95"
            >
              <Plus size={13} /> Novo Contrato
            </button>
          </div>
        </div>

        <div className="space-y-3">
          {filteredContracts.map((contract) => (
            <div
              key={contract.id}
              className={`group rounded-xl border p-3.5 transition-all ${
                contract.done
                  ? "border-emerald-500/20 bg-emerald-950/10 opacity-70"
                  : "border-border bg-secondary/50 hover:border-primary/40 hover:bg-secondary"
              }`}
            >
              <div className="flex items-start gap-3">
                <button
                  type="button"
                  onClick={() => updContract(contract.id, { done: !contract.done })}
                  className={`mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-lg border transition-colors ${
                    contract.done
                      ? "border-emerald-500 bg-emerald-500 text-[#0f0d0a]"
                      : "border-border hover:border-primary"
                  }`}
                  title={contract.done ? "Marcar como Ativo" : "Marcar como Concluído"}
                >
                  {contract.done ? <Check size={12} strokeWidth={3} /> : null}
                </button>

                <div className="flex-1 space-y-1">
                  <EditableText
                    value={contract.title}
                    onChange={(value) => updContract(contract.id, { title: value })}
                    className={`text-sm font-semibold transition ${
                      contract.done ? "line-through text-[#8a7355]" : "text-[#f5e9d7]"
                    }`}
                  />
                  <div className="flex items-center gap-2 text-xs">
                    <span className="font-serif uppercase tracking-wider text-[#8a7355]">
                      Recompensa:
                    </span>
                    <EditableText
                      value={contract.reward}
                      onChange={(value) => updContract(contract.id, { reward: value })}
                      className="font-mono font-medium text-[#d69a3d]"
                    />
                  </div>
                </div>

                <button
                  onClick={() => removeContract(contract.id)}
                  className="shrink-0 rounded p-1 text-[#8b1a1a] opacity-0 transition-all group-hover:opacity-100 hover:bg-rose-500/10 hover:text-rose-400"
                  title="Excluir contrato"
                >
                  <Trash2 size={14} />
                </button>
              </div>
            </div>
          ))}

          {filteredContracts.length === 0 && (
            <p className="py-8 text-center text-xs italic text-[#8a7355]">
              Nenhum contrato encontrado nesta categoria.
            </p>
          )}
        </div>
      </Card>
    </div>
  );
}
