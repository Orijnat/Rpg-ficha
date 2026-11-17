"use client";

import { useEffect, useRef, useState } from "react";
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
  PenLine,
  ChevronDown,
} from "lucide-react";
import DiceRoll3D from "./Dice3D";
import { formatModifier } from "../../../lib/modifiers";

const DICE_TYPES = [4, 6, 8, 10, 12, 20, 100];


function FaceInputs({ count, sides, values, onChange, onEnter }) {
  return (
    <div className="flex flex-wrap items-end justify-center gap-2">
      {Array.from({ length: count }, (_, i) => (
        <label key={i} className="flex flex-col items-center gap-1">
          <span className="text-[10px] font-bold uppercase tracking-wider text-[var(--theme-subtitle)]">
            Dado {i + 1}
          </span>
          <input
            type="number"
            inputMode="numeric"
            min={1}
            max={sides}
            autoFocus={i === 0}
            value={values[i] ?? ""}
            onChange={(e) => onChange(i, e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && onEnter) {
                e.preventDefault();
                onEnter();
              }
            }}
            className="h-14 w-14 rounded-xl border border-white/15 bg-white/5 text-center font-mono text-xl font-bold text-[var(--theme-title)] outline-none transition focus:border-[var(--theme-accent)] focus:ring-1 focus:ring-[var(--theme-accent)]/50"
            aria-label={`Valor do dado físico ${i + 1} (1 a ${sides})`}
          />
        </label>
      ))}
    </div>
  );
}

function RollChooser({ request, onVirtual, onManual, onCancel }) {
  const [physOpen, setPhysOpen] = useState(false);
  const [physMode, setPhysMode] = useState("normal");
  const [faces, setFaces] = useState(() => Array(Math.max(1, request.count)).fill(""));
  const [error, setError] = useState(null);

  const isContest = physMode !== "normal";
  const faceCount = isContest ? 2 : Math.max(1, request.count);
  const [prevFaceCount, setPrevFaceCount] = useState(faceCount);
  if (prevFaceCount !== faceCount) {
    setPrevFaceCount(faceCount);
    setFaces((current) => {
      const next = Array(faceCount).fill("");
      for (let i = 0; i < faceCount; i += 1) next[i] = current[i] ?? "";
      return next;
    });
    setError(null);
  }

  const modText = request.modifier === 0 ? "" : ` ${formatModifier(request.modifier)}`;
  const physFormula = isContest
    ? `2d${request.sides}${physMode === "advantage" ? "kh1" : "kl1"}${modText}`
    : `${faceCount}d${request.sides}${modText}`;

  const handleRegister = () => {
    const result = onManual(faces.map((v) => String(v).trim()), physMode);
    if (result && !result.ok) {
      setError(result.message || "Valores inválidos.");
    }
  };

  const modeButton = (mode, label, Icon, activeClass) => (
    <button
      type="button"
      onClick={() => setPhysMode(mode)}
      aria-pressed={physMode === mode}
      className={`flex-1 rounded-lg border px-2 py-1.5 text-[10px] font-bold uppercase tracking-wider transition active:scale-95 ${
        physMode === mode
          ? activeClass
          : "border-white/10 bg-white/[0.03] text-[var(--theme-subtitle)] hover:text-[#e8d5b0]"
      }`}
    >
      <Icon size={12} className="mx-auto mb-0.5" />
      {label}
    </button>
  );

  return (
    <div className="space-y-4 text-center">
      <div className="rounded-xl border border-white/5 bg-white/[0.02] p-4">
        <span className="text-xs uppercase tracking-widest text-[var(--theme-subtitle)]">
          Escolha como rolar
        </span>
        <h2 className="mt-1 text-2xl font-bold text-[var(--theme-title)]">
          {request.label}
        </h2>
        <span className="font-mono text-sm font-semibold text-[var(--theme-accent)]">
          Modificador: {formatModifier(request.modifier)}
        </span>
      </div>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
        <button
          onClick={() => onVirtual("normal")}
          className="flex flex-col items-center gap-2 rounded-xl border border-white/10 bg-white/[0.03] p-4 transition-all hover:border-[var(--theme-accent)] hover:bg-[var(--theme-accent)]/10 active:scale-95"
        >
          <Dices className="text-[var(--theme-accent)]" size={24} />
          <span className="text-xs font-semibold uppercase tracking-wider">Normal</span>
          <span className="font-mono text-[11px] text-[var(--theme-subtitle)]">
            {request.count}d{request.sides} {formatModifier(request.modifier)}
          </span>
        </button>

        <button
          onClick={() => onVirtual("advantage")}
          className="flex flex-col items-center gap-2 rounded-xl border border-white/10 bg-white/[0.03] p-4 transition-all hover:border-emerald-500 hover:bg-emerald-500/10 active:scale-95"
        >
          <Zap className="text-emerald-400" size={24} />
          <span className="text-xs font-semibold uppercase tracking-wider text-emerald-400">Vantagem</span>
          <span className="font-mono text-[11px] text-[var(--theme-subtitle)]">
            2d{request.sides}kh1 {formatModifier(request.modifier)}
          </span>
        </button>

        <button
          onClick={() => onVirtual("disadvantage")}
          className="flex flex-col items-center gap-2 rounded-xl border border-white/10 bg-white/[0.03] p-4 transition-all hover:border-rose-500 hover:bg-rose-500/10 active:scale-95"
        >
          <ShieldAlert className="text-rose-400" size={24} />
          <span className="text-xs font-semibold uppercase tracking-wider text-rose-400">Desvantagem</span>
          <span className="font-mono text-[11px] text-[var(--theme-subtitle)]">
            2d{request.sides}kl1 {formatModifier(request.modifier)}
          </span>
        </button>
      </div>

      {/* Dado físico */}
      <div className="rounded-xl border border-amber-500/25 bg-amber-950/10">
        <button
          type="button"
          onClick={() => setPhysOpen((open) => !open)}
          aria-expanded={physOpen}
          className="flex w-full items-center justify-center gap-2 rounded-xl px-4 py-2.5 text-xs font-bold uppercase tracking-wider text-amber-300 transition hover:bg-amber-500/10"
        >
          <PenLine size={13} />
          Usou o dado físico? Informar valores
          <ChevronDown size={13} className={`transition-transform ${physOpen ? "rotate-180" : ""}`} />
        </button>
        {physOpen && (
          <div className="space-y-3 border-t border-amber-500/20 p-4">
            <div className="flex gap-1.5">
              {modeButton("normal", "Normal", Dices, "border-amber-500/60 bg-amber-500/20 text-amber-300")}
              {modeButton("advantage", "Vantagem", Zap, "border-emerald-500/60 bg-emerald-500/20 text-emerald-300")}
              {modeButton("disadvantage", "Desvant.", ShieldAlert, "border-rose-500/60 bg-rose-500/20 text-rose-300")}
            </div>
            <FaceInputs
              count={faceCount}
              sides={request.sides}
              values={faces}
              onChange={(index, value) => {
                setFaces((current) => current.map((v, i) => (i === index ? value : v)));
                setError(null);
              }}
              onEnter={handleRegister}
            />
            <p className="font-mono text-[10px] uppercase tracking-wider text-[var(--theme-subtitle)]">
              Fórmula: <span className="text-amber-300">{physFormula}</span>
            </p>
            {error && (
              <p role="alert" className="rounded-lg border border-rose-500/40 bg-rose-950/30 px-3 py-1.5 text-[11px] text-rose-300">
                {error}
              </p>
            )}
            <button
              type="button"
              onClick={handleRegister}
              className="w-full rounded-xl border border-amber-500/60 bg-amber-500/20 py-2.5 text-xs font-bold uppercase tracking-widest text-amber-200 transition hover:bg-amber-500/30 active:scale-95"
            >
              Registrar rolagem física
            </button>
          </div>
        )}
      </div>

      <button
        type="button"
        onClick={onCancel}
        className="text-[11px] font-semibold uppercase tracking-wider text-[var(--theme-subtitle)] underline-offset-2 transition hover:text-[#e8d5b0] hover:underline"
      >
        Cancelar
      </button>
    </div>
  );
}

function DiceRollAnimation({ roll }) {
  const isContest = roll.mode === "advantage" || roll.mode === "disadvantage";
  const isPercentile = roll.sides === 100;
  const crit = roll.isCriticalSuccess ? "success" : roll.isCriticalFailure ? "failure" : undefined;

  return (
    <div
      key={roll.id}
      className="dice-roll-stage"
      role="img"
      aria-label={`${roll.formula}: dados ${roll.rolls.join(", ")}; total ${roll.total}`}
      data-sides={roll.sides}
      data-crit={crit}
    >
      <div className="dice-roll-aura" />
      <DiceRoll3D roll={roll} />
      <span className="dice-roll-caption">
        {isContest ? (roll.mode === "advantage" ? "Vantagem" : "Desvantagem") : isPercentile ? "d100 · Percentil" : `d${roll.sides}`}
      </span>
    </div>
  );
}


function ManualTray({ onDone }) {
  const { executeManualRoll } = useDice();
  const [sides, setSides] = useState(20);
  const [count, setCount] = useState(1);
  const [modifier, setModifier] = useState(0);
  const [label, setLabel] = useState("Rolagem física");
  const [mode, setMode] = useState("normal");
  const [faces, setFaces] = useState([""]);
  const [error, setError] = useState(null);

  const isContest = mode !== "normal";
  const faceCount = isContest ? 2 : Math.max(1, Math.floor(Number(count) || 1));
  const [prevFaceCount, setPrevFaceCount] = useState(faceCount);
  if (prevFaceCount !== faceCount) {
    setPrevFaceCount(faceCount);
    setFaces((current) => {
      const next = Array(faceCount).fill("");
      for (let i = 0; i < faceCount; i += 1) next[i] = current[i] ?? "";
      return next;
    });
    setError(null);
  }

  const handleRegister = () => {
    const result = executeManualRoll({
      sides,
      count: faceCount,
      mode,
      modifier,
      label: label.trim() || "Rolagem física",
      faces: faces.map((v) => String(v).trim()),
    });
    if (result.ok) {
      onDone();
    } else {
      setError(result.message || "Valores inválidos.");
    }
  };

  return (
    <div className="space-y-4">
      <div className="rounded-xl border border-amber-500/25 bg-amber-950/10 p-3 text-center">
        <p className="text-xs font-bold uppercase tracking-widest text-amber-300">
          Registrar dado físico
        </p>
        <p className="mt-1 text-[11px] text-[var(--theme-subtitle)]">
          Role no mundo real e digite aqui os valores. O resultado entra no histórico, no log da batalha e (se houver) no servidor.
        </p>
      </div>

      <div>
        <span className="text-xs uppercase tracking-wider text-[var(--theme-subtitle)]">Tipo de dado</span>
        <div className="mt-2 grid grid-cols-4 gap-2 sm:grid-cols-7">
          {DICE_TYPES.map((s) => (
            <button
              key={s}
              onClick={() => setSides(s)}
              aria-pressed={sides === s}
              className={`flex flex-col items-center justify-center rounded-xl border py-2.5 transition-all ${
                sides === s
                  ? "border-amber-500 bg-amber-500 font-bold text-[#17140f] shadow-md"
                  : "border-white/10 bg-white/[0.02] text-[#e8d5b0] hover:bg-white/5"
              }`}
            >
              <span className="font-mono text-xs">d{s}</span>
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="text-xs text-[var(--theme-subtitle)]" htmlFor="manual-count">Quantidade</label>
          <input
            id="manual-count"
            type="number"
            min={1}
            max={20}
            disabled={isContest}
            value={faceCount}
            onChange={(e) => setCount(Math.max(1, parseInt(e.target.value, 10) || 1))}
            className="mt-1 w-full rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-center font-mono text-[var(--theme-title)] outline-none focus:border-amber-500 disabled:opacity-50"
          />
        </div>
        <div>
          <label className="text-xs text-[var(--theme-subtitle)]" htmlFor="manual-mod">Modificador (+/-)</label>
          <input
            id="manual-mod"
            type="number"
            value={modifier}
            onChange={(e) => setModifier(parseInt(e.target.value, 10) || 0)}
            className="mt-1 w-full rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-center font-mono text-[var(--theme-title)] outline-none focus:border-amber-500"
          />
        </div>
      </div>

      <div>
        <label className="text-xs text-[var(--theme-subtitle)]" htmlFor="manual-label">Descrição da rolagem</label>
        <input
          id="manual-label"
          type="text"
          value={label}
          onChange={(e) => setLabel(e.target.value)}
          className="mt-1 w-full rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-sm text-[var(--theme-title)] outline-none focus:border-amber-500"
          placeholder="Ex.: Ataque com espada"
        />
      </div>

      <div>
        <span className="text-xs uppercase tracking-wider text-[var(--theme-subtitle)]">Modo</span>
        <div className="mt-2 flex gap-1.5">
          {[
            { id: "normal", label: "Normal" },
            { id: "advantage", label: "Vantagem" },
            { id: "disadvantage", label: "Desvantagem" },
          ].map(({ id, label: modeLabel }) => (
            <button
              key={id}
              type="button"
              onClick={() => setMode(id)}
              aria-pressed={mode === id}
              className={`flex-1 rounded-lg border px-2 py-2 text-[10px] font-bold uppercase tracking-wider transition active:scale-95 ${
                mode === id
                  ? "border-amber-500/60 bg-amber-500/20 text-amber-300"
                  : "border-white/10 bg-white/[0.03] text-[var(--theme-subtitle)] hover:text-[#e8d5b0]"
              }`}
            >
              {modeLabel}
            </button>
          ))}
        </div>
      </div>

      <FaceInputs
        count={faceCount}
        sides={sides}
        values={faces}
        onChange={(index, value) => {
          setFaces((current) => current.map((v, i) => (i === index ? value : v)));
          setError(null);
        }}
        onEnter={handleRegister}
      />

      {error && (
        <p role="alert" className="rounded-lg border border-rose-500/40 bg-rose-950/30 px-3 py-1.5 text-[11px] text-rose-300">
          {error}
        </p>
      )}

      <button
        type="button"
        onClick={handleRegister}
        className="w-full rounded-xl border border-amber-500/70 bg-gradient-to-r from-amber-500/80 to-amber-600/80 py-3 text-xs font-bold uppercase tracking-widest text-[#17140f] shadow-lg transition active:scale-95"
      >
        Registrar {faceCount}d{sides} {formatModifier(modifier)}
      </button>
    </div>
  );
}

export default function DiceModal() {
  const {
    isModalOpen,
    isRolling,
    closeModal,
    lastRoll,
    rollRequest,
    resolveVirtualRoll,
    resolveManualRoll,
    cancelRollRequest,
    executeManualRoll,
    requestRoll,
    history,
    clearHistory,
  } = useDice();

  const [activeTab, setActiveTab] = useState("result"); // "result" | "tray" | "manual" | "history"
  const [customSides, setCustomSides] = useState(20);
  const [customCount, setCustomCount] = useState(1);
  const [customModifier, setCustomModifier] = useState(0);
  const dialogRef = useRef(null);

  // Escape fecha o modal e foca o botão de fechar na abertura
  useEffect(() => {
    if (!isModalOpen) return undefined;
    const closeButton = dialogRef.current?.querySelector("button");
    closeButton?.focus();
    const handleKeyDown = (event) => {
      if (event.key === "Escape") {
        event.stopPropagation();
        closeModal();
      }
    };
    document.addEventListener("keydown", handleKeyDown, true);
    return () => document.removeEventListener("keydown", handleKeyDown, true);
  }, [isModalOpen, closeModal]);

  if (!isModalOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-md" role="presentation">
      <div
        className="relative w-full max-w-lg overflow-hidden rounded-2xl border border-white/10 bg-[#0f1118] text-[#e8d5b0] shadow-2xl shadow-black/90"
        role="dialog"
        aria-modal="true"
        aria-labelledby="dice-modal-title"
        ref={dialogRef}
      >
        {/* Glow de fundo */}
        <div className="pointer-events-none absolute -right-20 -top-20 h-48 w-48 rounded-full bg-[var(--theme-accent)]/15 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-20 -left-20 h-48 w-48 rounded-full bg-[#7861ff]/10 blur-3xl" />

        {/* Cabeçalho */}
        <div className="flex items-center justify-between border-b border-white/10 bg-white/[0.02] px-5 py-4">
          <div className="flex items-center gap-2">
            <span className="flex h-8 w-8 items-center justify-center rounded-lg border border-[var(--theme-accent)]/30 bg-[var(--theme-accent)]/10 text-[var(--theme-accent)]">
              <Dices size={18} />
            </span>
            <div>
              <h3 id="dice-modal-title" className="text-sm font-semibold tracking-wide text-[var(--theme-title)]">
                Rolador de Dados Virtual
              </h3>
              <p className="text-[11px] text-[var(--theme-subtitle)]">
                {rollRequest
                  ? `Teste: ${rollRequest.label} (${formatModifier(rollRequest.modifier)})`
                  : lastRoll
                  ? lastRoll.label || "Última Rolagem"
                  : "Mesa de Rolagem"}
              </p>
            </div>
          </div>

          <button
            onClick={closeModal}
            aria-label="Fechar rolador de dados"
            className="rounded-lg p-1.5 text-[var(--theme-subtitle)] transition-colors hover:bg-white/10 hover:text-[var(--theme-title)]"
          >
            <X size={18} />
          </button>
        </div>

        {/* Abas de Navegação */}
        {!rollRequest && (
          <div className="flex border-b border-white/10 bg-black/20 text-xs">
            <button
              onClick={() => setActiveTab("result")}
              className={`flex-1 py-2.5 font-medium transition-colors ${
                activeTab === "result"
                  ? "border-b-2 border-[var(--theme-accent)] text-[var(--theme-title)]"
                  : "text-[var(--theme-subtitle)] hover:text-[#e8d5b0]"
              }`}
            >
              Resultado
            </button>
            <button
              onClick={() => setActiveTab("tray")}
              className={`flex items-center justify-center gap-1.5 flex-1 py-2.5 font-medium transition-colors ${
                activeTab === "tray"
                  ? "border-b-2 border-[var(--theme-accent)] text-[var(--theme-title)]"
                  : "text-[var(--theme-subtitle)] hover:text-[#e8d5b0]"
              }`}
            >
              <SlidersHorizontal size={13} />
              Dados Avulsos
            </button>
            <button
              onClick={() => setActiveTab("manual")}
              className={`flex items-center justify-center gap-1.5 flex-1 py-2.5 font-medium transition-colors ${
                activeTab === "manual"
                  ? "border-b-2 border-amber-500 text-[var(--theme-title)]"
                  : "text-[var(--theme-subtitle)] hover:text-[#e8d5b0]"
              }`}
            >
              <PenLine size={13} />
              Dado Físico
            </button>
            <button
              onClick={() => setActiveTab("history")}
              className={`flex items-center justify-center gap-1.5 flex-1 py-2.5 font-medium transition-colors ${
                activeTab === "history"
                  ? "border-b-2 border-[var(--theme-accent)] text-[var(--theme-title)]"
                  : "text-[var(--theme-subtitle)] hover:text-[#e8d5b0]"
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
          {rollRequest ? (
            <RollChooser
              request={rollRequest}
              onVirtual={resolveVirtualRoll}
              onManual={resolveManualRoll}
              onCancel={cancelRollRequest}
            />
          ) : (activeTab === "result" || isRolling) && lastRoll ? (
            <div className="space-y-5 text-center">
              {isRolling && (
                <div className="text-xs font-semibold uppercase tracking-[0.24em] text-[var(--theme-accent)]" role="status" aria-live="polite">
                  Rolando os dados...
                </div>
              )}
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
              <DiceRollAnimation roll={lastRoll} />
              <div className="relative mx-auto flex h-32 w-32 items-center justify-center rounded-3xl border-2 border-[var(--theme-accent)]/50 bg-gradient-to-b from-[#241c13] to-[#120e09] shadow-[0_0_35px_rgba(214,154,61,0.25)]">
                <span className="font-mono text-5xl font-black text-[var(--theme-title)]">
                  {lastRoll.total}
                </span>
                <span className="absolute bottom-2 font-mono text-[10px] text-[var(--theme-accent)]/80 uppercase tracking-widest">
                  Total
                </span>
              </div>

              {/* Detalhes do Cálculo */}
              <div className="rounded-xl border border-white/5 bg-white/[0.02] p-3 text-xs">
                <div className="flex items-center justify-between border-b border-white/5 pb-2 text-[var(--theme-subtitle)]">
                  <span>Fórmula:</span>
                  <span className="font-mono font-medium text-[#e8d5b0]">
                    {lastRoll.formula}
                  </span>
                </div>

                <div className="mt-2 flex items-center justify-between text-[var(--theme-subtitle)]">
                  <span>Dados Rolados:</span>
                  <div className="flex items-center gap-2">
                    {lastRoll.mode === "advantage" || lastRoll.mode === "disadvantage" ? (
                      <>
                        <span className="rounded bg-[var(--theme-accent)]/20 px-2 py-0.5 font-mono font-bold text-[var(--theme-accent)]">
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
                  <div className="mt-2 flex items-center justify-between text-[var(--theme-subtitle)]">
                    <span>Modificador:</span>
                    <span className="font-mono text-[var(--theme-accent)]">
                      {formatModifier(lastRoll.modifier)}
                    </span>
                  </div>
                )}
              </div>

              {/* Origem do resultado */}
              <p className="pt-1 font-mono text-[10px] uppercase tracking-[0.28em] text-[var(--theme-subtitle)]">
                {lastRoll.manual ? "Valores informados do dado físico" : "Rolagem virtual"}
              </p>

              {/* Ações Rápidas de Re-rolagem (abre a escolha virtual/físico novamente) */}
              <div className="flex items-center justify-center gap-2 pt-2">
                <button
                  onClick={() =>
                    requestRoll({
                      sides: lastRoll.sides,
                      count: lastRoll.mode === "normal" ? lastRoll.rolls.length : 1,
                      modifier: lastRoll.modifier,
                      label: lastRoll.label,
                    })
                  }
                  className="flex items-center gap-1.5 rounded-xl border border-white/10 bg-white/[0.04] px-4 py-2 text-xs font-medium text-[#e8d5b0] transition hover:bg-white/10 active:scale-95"
                >
                  <RotateCcw size={14} />
                  Rolar Novamente
                </button>
              </div>
            </div>
          ) : activeTab === "tray" ? (
            /* Seletor Customizado de Dados Avulsos */
            <div className="space-y-4">
              <div>
                <span className="text-xs uppercase tracking-wider text-[var(--theme-subtitle)]">
                  Escolha o Tipo de Dado
                </span>
                <div className="mt-2 grid grid-cols-4 gap-2 sm:grid-cols-7">
                  {DICE_TYPES.map((sides) => (
                    <button
                      key={sides}
                      onClick={() => setCustomSides(sides)}
                      className={`flex flex-col items-center justify-center rounded-xl border py-2.5 transition-all ${
                        customSides === sides
                          ? "border-[var(--theme-accent)] bg-[var(--theme-accent)] font-bold text-[#17140f] shadow-md shadow-[var(--theme-accent)]/20"
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
                  <label className="text-xs text-[var(--theme-subtitle)]">Quantidade</label>
                  <input
                    type="number"
                    min={1}
                    max={20}
                    value={customCount}
                    onChange={(e) => setCustomCount(Math.max(1, parseInt(e.target.value) || 1))}
                    className="mt-1 w-full rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-center font-mono text-[var(--theme-title)] outline-none focus:border-[var(--theme-accent)]"
                  />
                </div>
                <div>
                  <label className="text-xs text-[var(--theme-subtitle)]">Modificador (+/-)</label>
                  <input
                    type="number"
                    value={customModifier}
                    onChange={(e) => setCustomModifier(parseInt(e.target.value) || 0)}
                    className="mt-1 w-full rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-center font-mono text-[var(--theme-title)] outline-none focus:border-[var(--theme-accent)]"
                  />
                </div>
              </div>

              <button
                onClick={() => {
                  requestRoll({
                    sides: customSides,
                    count: customCount,
                    modifier: customModifier,
                    label: `Rolagem Customizada (${customCount}d${customSides})`,
                  });
                }}
                className="w-full rounded-xl border border-[var(--theme-accent)] bg-gradient-to-r from-[var(--theme-accent)] to-[var(--theme-accent)] py-3 text-xs font-bold uppercase tracking-widest text-[#17140f] shadow-lg shadow-[var(--theme-accent)]/20 transition active:scale-95"
              >
                Rolar {customCount}d{customSides} {formatModifier(customModifier)}
              </button>
            </div>
          ) : activeTab === "manual" ? (
            <ManualTray onDone={() => setActiveTab("result")} />
          ) : (
            /* Histórico da Sessão */
            <div className="space-y-3">
              <div className="flex items-center justify-between text-xs text-[var(--theme-subtitle)]">
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

              <div data-lenis-prevent className="custom-scroll max-h-60 space-y-2 overflow-y-auto pr-1">
                {history.length === 0 ? (
                  <p className="py-8 text-center text-xs italic text-[var(--theme-subtitle)]">
                    Nenhuma rolagem realizada ainda.
                  </p>
                ) : (
                  history.map((h) => (
                    <div
                      key={h.id}
                      className="flex items-center justify-between rounded-xl border border-white/5 bg-white/[0.02] p-2.5 text-xs"
                    >
                      <div>
                        <span className="font-semibold text-[var(--theme-title)]">
                          {h.label || "Rolagem"}
                        </span>
                        {h.manual && (
                          <span className="ml-1.5 rounded bg-amber-500/20 px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-wider text-amber-300">
                            Físico
                          </span>
                        )}
                        <div className="font-mono text-[11px] text-[var(--theme-subtitle)]">
                          {h.formula}
                        </div>
                      </div>
                      <div className="text-right">
                        <span className="font-mono text-base font-bold text-[var(--theme-accent)]">
                          {h.total}
                        </span>
                        {h.isCriticalSuccess && (
                          <span className="block text-[10px] font-bold text-emerald-400">
                            CRÍTICO!
                          </span>
                        )}
                        {h.isCriticalFailure && (
                          <span className="block text-[10px] font-bold text-rose-400">
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
