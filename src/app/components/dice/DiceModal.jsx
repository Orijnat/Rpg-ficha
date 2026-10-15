"use client";

import { useState } from "react";
import { useDice } from "../../context/DiceContext";
import {
  Dices,
  Sparkles,
  Skull,
  X,
  History,
  RotateCcw,
  Zap,
  ShieldAlert,
  SlidersHorizontal,
} from "lucide-react";
import { formatModifier } from "../../../lib/modifiers";

const DICE_TYPES = [4, 6, 8, 10, 12, 20, 100];

export default function DiceModal() {
  const {
    isModalOpen,
    closeModal,
    lastRoll,
    pendingTarget,
    executeRoll,
    history,
    clearHistory,
  } = useDice();

  const [activeTab, setActiveTab] = useState("result"); // "result" | "tray" | "history"
  const [customSides, setCustomSides] = useState(20);
  const [customCount, setCustomCount] = useState(1);
  const [customModifier, setCustomModifier] = useState(0);

  if (!isModalOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-md">
      <div className="relative w-full max-w-lg overflow-hidden rounded-2xl border border-white/10 bg-[#0f1118] text-[#e8d5b0] shadow-2xl shadow-black/90">
        {/* Glow de fundo */}
        <div className="pointer-events-none absolute -right-20 -top-20 h-48 w-48 rounded-full bg-[#d69a3d]/15 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-20 -left-20 h-48 w-48 rounded-full bg-[#7861ff]/10 blur-3xl" />

        {/* Cabeçalho */}
        <div className="flex items-center justify-between border-b border-white/10 bg-white/[0.02] px-5 py-4">
          <div className="flex items-center gap-2">
            <span className="flex h-8 w-8 items-center justify-center rounded-lg border border-[#d69a3d]/30 bg-[#d69a3d]/10 text-[#d69a3d]">
              <Dices size={18} />
            </span>
            <div>
              <h3 className="text-sm font-semibold tracking-wide text-[#f5e9d7]">
                Rolador de Dados Virtual
              </h3>
              <p className="text-[11px] text-[#8a7355]">
                {pendingTarget
                  ? `Teste: ${pendingTarget.label} (${formatModifier(pendingTarget.modifier)})`
                  : lastRoll
                  ? lastRoll.label || "Última Rolagem"
                  : "Mesa de Rolagem"}
              </p>
            </div>
          </div>

          <button
            onClick={closeModal}
            className="rounded-lg p-1.5 text-[#8a7355] transition-colors hover:bg-white/10 hover:text-[#f5e9d7]"
          >
            <X size={18} />
          </button>
        </div>

        {/* Abas de Navegação */}
        {!pendingTarget && (
          <div className="flex border-b border-white/10 bg-black/20 text-xs">
            <button
              onClick={() => setActiveTab("result")}
              className={`flex-1 py-2.5 font-medium transition-colors ${
                activeTab === "result"
                  ? "border-b-2 border-[#d69a3d] text-[#f5e9d7]"
                  : "text-[#8a7355] hover:text-[#e8d5b0]"
              }`}
            >
              Resultado
            </button>
            <button
              onClick={() => setActiveTab("tray")}
              className={`flex items-center justify-center gap-1.5 flex-1 py-2.5 font-medium transition-colors ${
                activeTab === "tray"
                  ? "border-b-2 border-[#d69a3d] text-[#f5e9d7]"
                  : "text-[#8a7355] hover:text-[#e8d5b0]"
              }`}
            >
              <SlidersHorizontal size={13} />
              Dados Avulsos
            </button>
            <button
              onClick={() => setActiveTab("history")}
              className={`flex items-center justify-center gap-1.5 flex-1 py-2.5 font-medium transition-colors ${
                activeTab === "history"
                  ? "border-b-2 border-[#d69a3d] text-[#f5e9d7]"
                  : "text-[#8a7355] hover:text-[#e8d5b0]"
              }`}
            >
              <History size={13} />
              Histórico ({history.length})
            </button>
          </div>
        )}

        {/* Conteúdo */}
        <div className="p-6">
          {/* Se estiver aguardando escolha de modo para um teste específico */}
          {pendingTarget ? (
            <div className="space-y-4 text-center">
              <div className="rounded-xl border border-white/5 bg-white/[0.02] p-4">
                <span className="text-xs uppercase tracking-widest text-[#a98b68]">
                  Escolha o Modo de Rolagem
                </span>
                <h2 className="mt-1 text-2xl font-bold text-[#f5e9d7]">
                  {pendingTarget.label}
                </h2>
                <span className="font-mono text-sm font-semibold text-[#d69a3d]">
                  Modificador: {formatModifier(pendingTarget.modifier)}
                </span>
              </div>

              <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
                <button
                  onClick={() =>
                    executeRoll({
                      sides: 20,
                      mode: "normal",
                      modifier: pendingTarget.modifier,
                      label: pendingTarget.label,
                    })
                  }
                  className="flex flex-col items-center gap-2 rounded-xl border border-white/10 bg-white/[0.03] p-4 transition-all hover:border-[#d69a3d] hover:bg-[#d69a3d]/10 active:scale-95"
                >
                  <Dices className="text-[#d69a3d]" size={24} />
                  <span className="text-xs font-semibold uppercase tracking-wider">
                    Normal
                  </span>
                  <span className="font-mono text-[11px] text-[#8a7355]">
                    1d20 {formatModifier(pendingTarget.modifier)}
                  </span>
                </button>

                <button
                  onClick={() =>
                    executeRoll({
                      sides: 20,
                      mode: "advantage",
                      modifier: pendingTarget.modifier,
                      label: pendingTarget.label,
                    })
                  }
                  className="flex flex-col items-center gap-2 rounded-xl border border-white/10 bg-white/[0.03] p-4 transition-all hover:border-emerald-500 hover:bg-emerald-500/10 active:scale-95"
                >
                  <Zap className="text-emerald-400" size={24} />
                  <span className="text-xs font-semibold uppercase tracking-wider text-emerald-400">
                    Vantagem
                  </span>
                  <span className="font-mono text-[11px] text-[#8a7355]">
                    2d20kh1 {formatModifier(pendingTarget.modifier)}
                  </span>
                </button>

                <button
                  onClick={() =>
                    executeRoll({
                      sides: 20,
                      mode: "disadvantage",
                      modifier: pendingTarget.modifier,
                      label: pendingTarget.label,
                    })
                  }
                  className="flex flex-col items-center gap-2 rounded-xl border border-white/10 bg-white/[0.03] p-4 transition-all hover:border-rose-500 hover:bg-rose-500/10 active:scale-95"
                >
                  <ShieldAlert className="text-rose-400" size={24} />
                  <span className="text-xs font-semibold uppercase tracking-wider text-rose-400">
                    Desvantagem
                  </span>
                  <span className="font-mono text-[11px] text-[#8a7355]">
                    2d20kl1 {formatModifier(pendingTarget.modifier)}
                  </span>
                </button>
              </div>
            </div>
          ) : activeTab === "result" && lastRoll ? (
            <div className="space-y-5 text-center">
              {/* Badge de Crítico */}
              {lastRoll.isCriticalSuccess && (
                <div className="inline-flex items-center gap-1.5 rounded-full border border-emerald-500/40 bg-emerald-500/15 px-3 py-1 text-xs font-bold text-emerald-300 shadow-lg shadow-emerald-950">
                  <Sparkles size={14} /> SUCESSO CRÍTICO (20 NATURAL)!
                </div>
              )}
              {lastRoll.isCriticalFailure && (
                <div className="inline-flex items-center gap-1.5 rounded-full border border-rose-500/40 bg-rose-500/15 px-3 py-1 text-xs font-bold text-rose-300 shadow-lg shadow-rose-950">
                  <Skull size={14} /> FALHA CRÍTICA (1 NATURAL)!
                </div>
              )}

              {/* Número Gigante do Total */}
              <div className="relative mx-auto flex h-32 w-32 items-center justify-center rounded-3xl border-2 border-[#d69a3d]/50 bg-gradient-to-b from-[#241c13] to-[#120e09] shadow-[0_0_35px_rgba(214,154,61,0.25)]">
                <span className="font-mono text-5xl font-black text-[#fdf6e7]">
                  {lastRoll.total}
                </span>
                <span className="absolute bottom-2 font-mono text-[10px] text-[#d69a3d]/80 uppercase tracking-widest">
                  Total
                </span>
              </div>

              {/* Detalhes do Cálculo */}
              <div className="rounded-xl border border-white/5 bg-white/[0.02] p-3 text-xs">
                <div className="flex items-center justify-between border-b border-white/5 pb-2 text-[#8a7355]">
                  <span>Fórmula:</span>
                  <span className="font-mono font-medium text-[#e8d5b0]">
                    {lastRoll.formula}
                  </span>
                </div>

                <div className="mt-2 flex items-center justify-between text-[#8a7355]">
                  <span>Dados Rolados:</span>
                  <div className="flex items-center gap-2">
                    {lastRoll.mode === "advantage" || lastRoll.mode === "disadvantage" ? (
                      <>
                        <span className="rounded bg-[#d69a3d]/20 px-2 py-0.5 font-mono font-bold text-[#d69a3d]">
                          {lastRoll.kept} (Mantido)
                        </span>
                        <span className="rounded bg-white/5 px-2 py-0.5 font-mono line-through opacity-50">
                          {lastRoll.discarded} (Descartado)
                        </span>
                      </>
                    ) : (
                      <span className="font-mono font-bold text-[#e8d5b0]">
                        [{lastRoll.rolls.join(", ")}]
                      </span>
                    )}
                  </div>
                </div>

                {lastRoll.modifier !== 0 && (
                  <div className="mt-2 flex items-center justify-between text-[#8a7355]">
                    <span>Modificador:</span>
                    <span className="font-mono text-[#d69a3d]">
                      {formatModifier(lastRoll.modifier)}
                    </span>
                  </div>
                )}
              </div>

              {/* Ações Rápidas de Re-rolagem */}
              <div className="flex items-center justify-center gap-2 pt-2">
                <button
                  onClick={() =>
                    executeRoll({
                      sides: lastRoll.sides,
                      mode: lastRoll.mode,
                      modifier: lastRoll.modifier,
                      label: lastRoll.label,
                    })
                  }
                  className="flex items-center gap-1.5 rounded-xl border border-white/10 bg-white/[0.04] px-4 py-2 text-xs font-medium text-[#e8d5b0] transition hover:bg-white/10 active:scale-95"
                >
                  <RotateCcw size={14} />
                  Rolar Novamente
                </button>

                {lastRoll.sides === 20 && (
                  <>
                    <button
                      onClick={() =>
                        executeRoll({
                          sides: 20,
                          mode: "advantage",
                          modifier: lastRoll.modifier,
                          label: `${lastRoll.label} (Vantagem)`,
                        })
                      }
                      className="rounded-xl border border-emerald-500/30 bg-emerald-500/10 px-3 py-2 text-xs font-medium text-emerald-400 hover:bg-emerald-500/20 active:scale-95"
                    >
                      + Vantagem
                    </button>
                    <button
                      onClick={() =>
                        executeRoll({
                          sides: 20,
                          mode: "disadvantage",
                          modifier: lastRoll.modifier,
                          label: `${lastRoll.label} (Desvantagem)`,
                        })
                      }
                      className="rounded-xl border border-rose-500/30 bg-rose-500/10 px-3 py-2 text-xs font-medium text-rose-400 hover:bg-rose-500/20 active:scale-95"
                    >
                      + Desvantagem
                    </button>
                  </>
                )}
              </div>
            </div>
          ) : activeTab === "tray" ? (
            /* Seletor Customizado de Dados Avulsos */
            <div className="space-y-4">
              <div>
                <span className="text-xs uppercase tracking-wider text-[#8a7355]">
                  Escolha o Tipo de Dado
                </span>
                <div className="mt-2 grid grid-cols-4 gap-2 sm:grid-cols-7">
                  {DICE_TYPES.map((sides) => (
                    <button
                      key={sides}
                      onClick={() => setCustomSides(sides)}
                      className={`flex flex-col items-center justify-center rounded-xl border py-2.5 transition-all ${
                        customSides === sides
                          ? "border-[#d69a3d] bg-[#d69a3d] font-bold text-[#17140f] shadow-md shadow-[#d69a3d]/20"
                          : "border-white/10 bg-white/[0.02] text-[#e8d5b0] hover:bg-white/5"
                      }`}
                    >
                      <span className="text-xs font-mono">d{sides}</span>
                    </button>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs text-[#8a7355]">Quantidade</label>
                  <input
                    type="number"
                    min={1}
                    max={20}
                    value={customCount}
                    onChange={(e) => setCustomCount(Math.max(1, parseInt(e.target.value) || 1))}
                    className="mt-1 w-full rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-center font-mono text-[#f5e9d7] outline-none focus:border-[#d69a3d]"
                  />
                </div>
                <div>
                  <label className="text-xs text-[#8a7355]">Modificador (+/-)</label>
                  <input
                    type="number"
                    value={customModifier}
                    onChange={(e) => setCustomModifier(parseInt(e.target.value) || 0)}
                    className="mt-1 w-full rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-center font-mono text-[#f5e9d7] outline-none focus:border-[#d69a3d]"
                  />
                </div>
              </div>

              <button
                onClick={() => {
                  executeRoll({
                    sides: customSides,
                    count: customCount,
                    mode: "normal",
                    modifier: customModifier,
                    label: `Rolagem Customizada (${customCount}d${customSides})`,
                  });
                  setActiveTab("result");
                }}
                className="w-full rounded-xl border border-[#d69a3d] bg-gradient-to-r from-[#d69a3d] to-[#c9862a] py-3 text-xs font-bold uppercase tracking-widest text-[#17140f] shadow-lg shadow-[#d69a3d]/20 transition active:scale-95"
              >
                Rolar {customCount}d{customSides} {formatModifier(customModifier)}
              </button>
            </div>
          ) : (
            /* Histórico da Sessão */
            <div className="space-y-3">
              <div className="flex items-center justify-between text-xs text-[#8a7355]">
                <span>Últimas rolagens desta sessão</span>
                {history.length > 0 && (
                  <button
                    onClick={clearHistory}
                    className="text-rose-400/80 hover:text-rose-300"
                  >
                    Limpar Histórico
                  </button>
                )}
              </div>

              <div className="custom-scroll max-h-60 space-y-2 overflow-y-auto pr-1">
                {history.length === 0 ? (
                  <p className="py-8 text-center text-xs italic text-[#8a7355]">
                    Nenhuma rolagem realizada ainda.
                  </p>
                ) : (
                  history.map((h) => (
                    <div
                      key={h.id}
                      className="flex items-center justify-between rounded-xl border border-white/5 bg-white/[0.02] p-2.5 text-xs"
                    >
                      <div>
                        <span className="font-semibold text-[#f5e9d7]">
                          {h.label || "Rolagem"}
                        </span>
                        <div className="font-mono text-[11px] text-[#8a7355]">
                          {h.formula}
                        </div>
                      </div>
                      <div className="text-right">
                        <span className="font-mono text-base font-bold text-[#d69a3d]">
                          {h.total}
                        </span>
                        {h.isCriticalSuccess && (
                          <span className="block text-[9px] font-bold text-emerald-400">
                            CRÍTICO!
                          </span>
                        )}
                        {h.isCriticalFailure && (
                          <span className="block text-[9px] font-bold text-rose-400">
                            FALHA!
                          </span>
                        )}
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
