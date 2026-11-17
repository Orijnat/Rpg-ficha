"use client";

import { createContext, useContext, useEffect, useRef, useState } from "react";
import { rollDice, manualRollResult } from "../../lib/dice";
import { postRollToBackend, postBattleLogEvent } from "../../lib/api";
import { useCharacter } from "./CharacterContext";
import { useAuth } from "./AuthContext";

const DiceContext = createContext(null);

export function DiceProvider({ children }) {
  const [history, setHistory] = useState([]);
  const [lastRoll, setLastRoll] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isRolling, setIsRolling] = useState(false);
  const [rollRequest, setRollRequest] = useState(null); // { sides, count, modifier, label } quando aguardando escolha (virtual ou físico)
  const rollingTimer = useRef(null);
  const rollResolverRef = useRef(null);
  const { data } = useCharacter();
  const { token } = useAuth();

  // Rolagens viram histórico persistente apenas quando a ficha está vinculada a uma mesa
  // (autorização no servidor: dono/mestre; ninguém de fora lê as rolagens).
  const persistRoll = (result) => {
    try {
      const manualSuffix = result.manual ? " (dado físico)" : "";
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
        mensagem: `${result.label}: ${result.total}${critSuffix}${manualSuffix}`,
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
          manual: Boolean(result.manual),
        },
      }, token).catch(() => {
        // Sem encontro ativo (ou mesa indisponível): a rolagem nunca pode falhar por causa disso
      });
    } catch {
      // silencioso: persistir histórico nunca pode quebrar a rolagem
    }
  };

  const recordRoll = (result) => {
    persistRoll(result);
    setLastRoll(result);
    setHistory((prev) => [result, ...prev].slice(0, 30)); // Mantém últimas 30
  };

  const finishRoll = (result, { animate = true } = {}) => {
    recordRoll(result);
    const resolve = rollResolverRef.current;
    rollResolverRef.current = null;
    setRollRequest(null);
    setIsModalOpen(true); // mostra a aba Resultado
    window.clearTimeout(rollingTimer.current);
    if (animate) {
      setIsRolling(true);
      const reducedMotion = window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;
      rollingTimer.current = window.setTimeout(() => setIsRolling(false), reducedMotion ? 0 : 1400);
    } else {
      setIsRolling(false);
    }
    resolve?.(result);
  };

  // Pede uma rolagem ao jogador: abre o modal com a escolha entre rolar no
  // virtual (Normal/Vantagem/Desvantagem) ou registrar os valores do DADO FÍSICO.
  // Resolve com o resultado, ou `null` se o jogador cancelar.
  const requestRoll = (config = {}) => {
    const sides = Math.floor(Number(config.sides));
    const count = Math.floor(Number(config.count));
    const normalized = {
      sides: Number.isFinite(sides) && sides >= 1 ? sides : 20,
      count: Number.isFinite(count) && count >= 1 ? count : 1,
      modifier: Number(config.modifier) || 0,
      label: config.label || "Rolagem",
      allowContest: config.allowContest !== false,
    };
    // Um novo pedido cancela (null) qualquer pedido anterior ainda pendente.
    rollResolverRef.current?.(null);
    return new Promise((resolve) => {
      rollResolverRef.current = resolve;
      setRollRequest(normalized);
      setIsModalOpen(true);
    });
  };

  // Chamada pelo modal quando o jogador escolhe o modo virtual no chooser.
  // As funções são recriadas a cada render do provider, então veem o rollRequest atual.
  const resolveVirtualRoll = (mode = "normal") => {
    if (!rollRequest) return;
    const result = rollDice({ ...rollRequest, mode, label: rollRequest.label });
    finishRoll(result, { animate: true });
  };

  // Chamada pelo modal com os valores digitados do dado físico.
  // Retorna { ok: true } em sucesso ou { ok: false, message } com o erro de validação.
  const resolveManualRoll = (faces, mode = "normal") => {
    if (!rollRequest) return { ok: false, message: "Nenhum pedido de rolagem ativo." };
    let result;
    try {
      result = manualRollResult({ ...rollRequest, mode, faces, label: rollRequest.label });
    } catch (error) {
      return { ok: false, message: error.message };
    }
    finishRoll(result, { animate: false });
    return { ok: true };
  };

  // Registro direto de dado físico (aba "Dado Físico" da bandeja), sem chooser.
  const executeManualRoll = ({ sides = 20, count = 1, mode = "normal", modifier = 0, label = "Rolagem física", faces } = {}) => {
    try {
      const result = manualRollResult({ sides, count, mode, modifier, label, faces });
      recordRoll(result);
      setIsModalOpen(true);
      setIsRolling(false);
      return { ok: true, result };
    } catch (error) {
      return { ok: false, message: error.message };
    }
  };

  // Registra a rolagem física pendente via chooser sem fechar com erro.
  const cancelRollRequest = () => {
    const resolve = rollResolverRef.current;
    rollResolverRef.current = null;
    setRollRequest(null);
    setIsRolling(false);
    setIsModalOpen(false);
    resolve?.(null);
  };

  const closeModal = () => {
    const resolve = rollResolverRef.current;
    rollResolverRef.current = null;
    setRollRequest(null);
    setIsModalOpen(false);
    setIsRolling(false);
    resolve?.(null);
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
        rollRequest,
        requestRoll,
        resolveVirtualRoll,
        resolveManualRoll,
        executeManualRoll,
        cancelRollRequest,
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
