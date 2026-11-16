"use client";

import { createContext, useContext, useEffect, useRef, useState } from "react";
import { rollDice } from "../../lib/dice";
import { postRollToBackend, postBattleLogEvent } from "../../lib/api";
import { useCharacter } from "./CharacterContext";
import { useAuth } from "./AuthContext";

const DiceContext = createContext(null);

export function DiceProvider({ children }) {
  const [history, setHistory] = useState([]);
  const [lastRoll, setLastRoll] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isRolling, setIsRolling] = useState(false);
  const [pendingTarget, setPendingTarget] = useState(null); // { label, modifier }
  const rollingTimer = useRef(null);
  const { data } = useCharacter();
  const { token } = useAuth();

  // Rolagens viram histórico persistente apenas quando a ficha está vinculada a uma mesa
  // (autorização no servidor: dono/mestre; ninguém de fora lê as rolagens).
  const persistRoll = (result) => {
    try {
      if (!token || !data?.id || !data?.campanhaId) return;
      postRollToBackend({
        formula: result.formula,
        expressao: result.label,
        resultados: result.rolls,
        kept: result.kept,
        modifier: result.modifier,
        total: result.total,
        modo: result.mode,
        critico: Boolean(result.isCriticalSuccess),
        falhaCritica: Boolean(result.isCriticalFailure),
        contexto: "ficha",
        personagemId: data.id,
      }, token).catch((error) => {
        console.warn("Rolagem não registrada no servidor:", error?.message || error);
      });
      // Espelha a rolagem no log da batalha ativa (o servidor ignora se não houver encontro ativo)
      const critSuffix = result.isCriticalSuccess
        ? " — Crítico!"
        : result.isCriticalFailure
        ? " — Falha crítica"
        : "";
      postBattleLogEvent(data.campanhaId, {
        tipo: "rolagem",
        mensagem: `${result.label}: ${result.total}${critSuffix}`,
        dados: {
          formula: result.formula,
          resultados: result.rolls,
          kept: result.kept,
          modifier: result.modifier,
          total: result.total,
          modo: result.mode,
          critico: Boolean(result.isCriticalSuccess),
          falhaCritica: Boolean(result.isCriticalFailure),
          personagemId: data.id,
        },
      }, token).catch(() => {
        // Sem encontro ativo (ou mesa indisponível): a rolagem nunca pode falhar por causa disso
      });
    } catch {
      // silencioso: persistir histórico nunca pode quebrar a rolagem
    }
  };

  // Executa uma rolagem e registra no histórico
  const executeRoll = ({ sides = 20, count = 1, mode = "normal", modifier = 0, label = "Rolagem" }) => {
    const result = rollDice({ sides, count, mode, modifier, label });
    persistRoll(result);
    setLastRoll(result);
    setHistory((prev) => [result, ...prev].slice(0, 30)); // Mantém últimas 30
    setPendingTarget(null);
    setIsRolling(true);
    setIsModalOpen(true);
    window.clearTimeout(rollingTimer.current);
    const reducedMotion = window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;
    rollingTimer.current = window.setTimeout(() => setIsRolling(false), reducedMotion ? 0 : 1400);
    return result;
  };

  // Abre o diálogo para escolher modo (normal, vantagem, desvantagem) antes de rolar
  const promptRoll = (label, modifier = 0) => {
    setPendingTarget({ label, modifier });
    setIsModalOpen(true);
  };

  // Rola diretamente um teste (ex: a partir de um clique rápido)
  const quickCheck = (label, modifier = 0, mode = "normal") => {
    return executeRoll({ sides: 20, mode, modifier, label });
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setIsRolling(false);
    setPendingTarget(null);
  };

  useEffect(() => () => window.clearTimeout(rollingTimer.current), []);

  const clearHistory = () => {
    setHistory([]);
  };

  return (
    <DiceContext.Provider
      value={{
        history,
        lastRoll,
        isModalOpen,
        isRolling,
        pendingTarget,
        executeRoll,
        promptRoll,
        quickCheck,
        closeModal,
        openModal: () => setIsModalOpen(true),
        clearHistory,
      }}
    >
      {children}
    </DiceContext.Provider>
  );
}

export function useDice() {
  const context = useContext(DiceContext);
  if (!context) {
    throw new Error("useDice deve ser usado dentro de um DiceProvider");
  }
  return context;
}
