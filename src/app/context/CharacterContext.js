"use client";

import { createContext, useContext, useEffect, useState } from "react";
import { syncCharacterWithBackend } from "../../lib/api";
import { useAuth } from "./AuthContext";

import { defaultData } from "../../lib/defaultCharacter";
export { defaultData };

const CharacterContext = createContext(null);

export function CharacterProvider({ children }) {
  const [data, setData] = useState(defaultData);
  const [hydrated, setHydrated] = useState(false);
  const [bankUnlocked, setBankUnlocked] = useState(false);
  const [bankInput, setBankInput] = useState("");
  const [bankError, setBankError] = useState(false);

  const { activeCharacter, token } = useAuth();

  // Carrega do cache local inicialmente
  useEffect(() => {
    const timeout = window.setTimeout(() => {
      try {
        const saved = window.localStorage.getItem("bruxeiro-sheet");

        if (saved) {
          setData({ ...defaultData, ...JSON.parse(saved) });
        }
      } catch {
        setData(defaultData);
      }

      setHydrated(true);
    }, 0);

    return () => window.clearTimeout(timeout);
  }, []);

  // Atualiza ficha quando o personagem ativo da conta logada mudar
  useEffect(() => {
    if (activeCharacter) {
      setData((current) => ({
        ...defaultData,
        ...activeCharacter,
        // Garante compatibilidade de formatos
        inventory: activeCharacter.inventory || current.inventory || [],
        contracts: activeCharacter.contracts || current.contracts || [],
      }));
    }
  }, [activeCharacter?.id]);

  useEffect(() => {
    if (!hydrated) {
      return;
    }

    window.localStorage.setItem("bruxeiro-sheet", JSON.stringify(data));

    // Sincronização em segundo plano com o backend (debounce de 1.2s)
    const timer = setTimeout(() => {
      syncCharacterWithBackend(data, token);
    }, 1200);

    return () => clearTimeout(timer);
  }, [data, hydrated, token]);


  const upd = (key, value) => {
    setData((current) => ({ ...current, [key]: value }));
  };

  const updSkill = (index, patch) => {
    setData((current) => {
      const next = [...current.skills];
      next[index] = { ...next[index], ...patch };
      return { ...current, skills: next };
    });
  };

  const addItem = () => {
    setData((current) => ({
      ...current,
      inventory: [...current.inventory, { id: uid(), name: "Novo item", qty: 1 }],
    }));
  };

  const removeItem = (id) => {
    setData((current) => ({
      ...current,
      inventory: current.inventory.filter((item) => item.id !== id),
    }));
  };

  const updItem = (id, patch) => {
    setData((current) => ({
      ...current,
      inventory: current.inventory.map((item) => (item.id === id ? { ...item, ...patch } : item)),
    }));
  };

  const addContract = () => {
    setData((current) => ({
      ...current,
      contracts: [...current.contracts, { id: uid(), title: "Novo contrato", reward: "???", done: false }],
    }));
  };

  const removeContract = (id) => {
    setData((current) => ({
      ...current,
      contracts: current.contracts.filter((contract) => contract.id !== id),
    }));
  };

  const updContract = (id, patch) => {
    setData((current) => ({
      ...current,
      contracts: current.contracts.map((contract) => (contract.id === id ? { ...contract, ...patch } : contract)),
    }));
  };

  const addPerson = (list) => {
    setData((current) => ({
      ...current,
      [list]: [...current[list], { id: uid(), name: "Novo", note: "" }],
    }));
  };

  const removePerson = (list, id) => {
    setData((current) => ({
      ...current,
      [list]: current[list].filter((person) => person.id !== id),
    }));
  };

  const updPerson = (list, id, patch) => {
    setData((current) => ({
      ...current,
      [list]: current[list].map((person) => (person.id === id ? { ...person, ...patch } : person)),
    }));
  };

  const updBank = (index, item) => {
    setData((current) => {
      const next = [...current.bankSlots];
      next[index] = { item };
      return { ...current, bankSlots: next };
    });
  };

  const tryUnlock = () => {
    if (bankInput === data.bankPassword) {
      setBankUnlocked(true);
      setBankError(false);
      return;
    }

    setBankError(true);
  };

  const loadCharacter = (importedData) => {
    if (importedData && typeof importedData === "object") {
      setData({ ...defaultData, ...importedData });
    }
  };

  const resetCharacter = () => {
    setData(defaultData);
    window.localStorage.removeItem("bruxeiro-sheet");
  };

  const value = {
    data,
    setData,
    loadCharacter,
    resetCharacter,
    hydrated,
    bankUnlocked,
    setBankUnlocked,
    bankInput,
    setBankInput,
    bankError,
    setBankError,
    upd,
    updSkill,
    addItem,
    removeItem,
    updItem,
    addContract,
    removeContract,
    updContract,
    addPerson,
    removePerson,
    updPerson,
    updBank,
    tryUnlock,
  };

  return <CharacterContext.Provider value={value}>{children}</CharacterContext.Provider>;

}

function uid() {
  return Math.random().toString(36).slice(2);
}

export function useCharacter() {
  const context = useContext(CharacterContext);

  if (!context) {
    throw new Error("useCharacter must be used within a CharacterProvider");
  }

  return context;
}
