"use client";

import { createContext, useContext, useEffect, useRef, useState } from "react";
import { rollDice } from "../../lib/dice";

const DiceContext = createContext(null);

export function DiceProvider({ children }) {
  const [history, setHistory] = useState([]);
  const [lastRoll, setLastRoll] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isRolling, setIsRolling] = useState(false);
  const [pendingTarget, setPendingTarget] = useState(null); // { label, modifier }
  const rollingTimer = useRef(null);

  // Executa uma rolagem e registra no histórico
  const executeRoll = ({ sides = 20, count = 1, mode = "normal", modifier = 0, label = "Rolagem" }) => {
    const result = rollDice({ sides, count, mode, modifier, label });
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
