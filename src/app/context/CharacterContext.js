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
  const [syncStatus, setSyncStatus] = useState("idle");

  const { activeCharacter, token, loading: authLoading } = useAuth();

  const cacheKey = activeCharacter?.id
    ? `bruxeiro-sheet:${activeCharacter.id}`
    : "bruxeiro-sheet";

  // O cache só é usado como fallback quando não existe personagem vindo da API.
  useEffect(() => {
    if (authLoading || activeCharacter) return;
    try {
      const saved = window.localStorage.getItem(cacheKey);
      if (saved) setData({ ...defaultData, ...JSON.parse(saved) });
    } catch {
      setData(defaultData);
    } finally {
      setHydrated(true);
    }
  }, [activeCharacter, authLoading, cacheKey]);

  // Atualiza ficha quando o personagem ativo da conta logada mudar
  useEffect(() => {
    if (authLoading || !activeCharacter) return;
    const atributos = {
      FOR: activeCharacter.forca ?? activeCharacter.FOR ?? activeCharacter.attributes?.FOR,
      DES: activeCharacter.destreza ?? activeCharacter.DES ?? activeCharacter.attributes?.DES,
      CON: activeCharacter.constituicao ?? activeCharacter.CON ?? activeCharacter.attributes?.CON,
      SAB: activeCharacter.sabedoria ?? activeCharacter.SAB ?? activeCharacter.attributes?.SAB,
      ESP: activeCharacter.espirito ?? activeCharacter.ESP ?? activeCharacter.attributes?.ESP,
      CAR: activeCharacter.carisma ?? activeCharacter.CAR ?? activeCharacter.attributes?.CAR,
      INT: activeCharacter.inteligencia ?? activeCharacter.INT ?? activeCharacter.attributes?.INT,
    };
    const pickCollection = (canonical, alias, fallback) =>
      canonical ?? alias ?? fallback;
    const moedas = Object.keys(activeCharacter.moedas ?? {}).length
      ? activeCharacter.moedas
      : (activeCharacter.currencies ?? {});
    setData((current) => ({
      ...defaultData,
      ...activeCharacter,
      ...atributos,
      skills: pickCollection(activeCharacter.pericias, activeCharacter.skills, defaultData.skills),
      inventory: pickCollection(activeCharacter.itensInventario, activeCharacter.inventory, defaultData.inventory),
      contracts: pickCollection(activeCharacter.contratosDados, activeCharacter.contracts, defaultData.contracts),
      players: activeCharacter.jogadores ?? activeCharacter.players ?? defaultData.players,
      npcs: activeCharacter.npcs ?? defaultData.npcs,
      notesImages: pickCollection(activeCharacter.imagensAnotacoes, activeCharacter.notesImages, defaultData.notesImages),
      latina: activeCharacter.latina ?? moedas.latina ?? moedas.platina ?? defaultData.latina,
      ouro: activeCharacter.ouro ?? moedas.ouro ?? defaultData.ouro,
      prata: activeCharacter.prata ?? moedas.prata ?? defaultData.prata,
      cobre: activeCharacter.cobre ?? moedas.cobre ?? defaultData.cobre,
      dadosExtras: {
        ...defaultData.dadosExtras,
        ...(current.dadosExtras || {}),
        ...(activeCharacter.dadosExtras || {}),
      },
    }));
    setHydrated(true);
  }, [activeCharacter, authLoading]);

  useEffect(() => {
    if (!hydrated) {
      return;
    }

    window.localStorage.setItem(cacheKey, JSON.stringify(data));

    // Sincronização em segundo plano com o backend (debounce de 1.2s)
    setSyncStatus("saving");
    const timer = setTimeout(() => {
      syncCharacterWithBackend(data, token)
        .then((result) => setSyncStatus(result ? "saved" : "offline"))
        .catch(() => setSyncStatus("error"));
    }, 1200);

    return () => clearTimeout(timer);
  }, [cacheKey, data, hydrated, token]);


  const upd = (key, value) => {
    setData((current) => ({ ...current, [key]: value }));
  };

  const updExtra = (key, value) => {
    setData((current) => ({
      ...current,
      dadosExtras: {
        ...(current.dadosExtras || {}),
        [key]: value,
      },
    }));
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
    window.localStorage.removeItem(cacheKey);
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
    syncStatus,
    setBankError,
    upd,
    updExtra,
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
