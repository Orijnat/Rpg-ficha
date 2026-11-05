"use client";

import { createContext, useContext, useEffect, useRef, useState } from "react";
import { syncCharacterWithBackend, verifyBankPasswordOnBackend } from "../../lib/api";
import { avancarTreinoHabilidade } from "../../lib/abilities";
import { useAuth } from "./AuthContext";

import { defaultData } from "../../lib/defaultCharacter";
export { defaultData };

const CharacterContext = createContext(null);

export function CharacterProvider({ children }) {
  const [data, setData] = useState(defaultData);
  const [hydrated, setHydrated] = useState(false);
  const [hydratedKey, setHydratedKey] = useState(null);
  const [bankUnlocked, setBankUnlocked] = useState(false);
  const [bankInput, setBankInput] = useState("");
  const [bankError, setBankError] = useState(false);
  const [syncStatus, setSyncStatus] = useState("idle");
  const [syncError, setSyncError] = useState(null);
  const latestData = useRef(data);
  const syncSequence = useRef(0);

  const { activeCharacter, token, user, loading: authLoading } = useAuth();

  const cacheKey = `bruxeiro-sheet:${user?.id || "anonymous"}:${activeCharacter?.id || "default"}`;

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
      setHydratedKey(cacheKey);
    }
  }, [activeCharacter, authLoading, cacheKey]);

  // Atualiza ficha quando o personagem ativo da conta logada mudar
  useEffect(() => {
    if (authLoading || !activeCharacter) return;
    setHydrated(false);
    setHydratedKey(null);
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
      abilities: pickCollection(
        activeCharacter.dadosExtras?.abilities,
        activeCharacter.abilities,
        current.abilities ?? defaultData.abilities
      ),
      dadosExtras: {
        ...defaultData.dadosExtras,
        ...(current.dadosExtras || {}),
        ...(activeCharacter.dadosExtras || {}),
        abilities: pickCollection(
          activeCharacter.dadosExtras?.abilities,
          activeCharacter.abilities,
          current.abilities ?? defaultData.abilities
        ),
      },
    }));
    setHydrated(true);
    setHydratedKey(cacheKey);
  }, [activeCharacter, authLoading, cacheKey]);

  useEffect(() => {
    if (!hydrated || hydratedKey !== cacheKey) {
      return;
    }

    latestData.current = data;
    window.localStorage.setItem(cacheKey, JSON.stringify(data));

    // Sincronização em segundo plano com o backend (debounce de 1.2s)
    const sequence = ++syncSequence.current;
    setSyncStatus("saving");
    setSyncError(null);
    const timer = setTimeout(() => {
      syncCharacterWithBackend(data, token)
        .then((result) => {
          if (sequence === syncSequence.current) setSyncStatus(result ? "saved" : "offline");
        })
        .catch((error) => {
          if (sequence !== syncSequence.current) return;
          setSyncError(error);
          setSyncStatus(error.status === 409 ? "conflict" : "error");
        });
    }, 1200);

    return () => clearTimeout(timer);
  }, [cacheKey, data, hydrated, hydratedKey, token]);

  const retrySync = async () => {
    const sequence = ++syncSequence.current;
    setSyncStatus("saving");
    setSyncError(null);
    try {
      const result = await syncCharacterWithBackend(latestData.current, token);
      if (sequence === syncSequence.current) setSyncStatus(result ? "saved" : "offline");
    } catch (error) {
      if (sequence === syncSequence.current) {
        setSyncError(error);
        setSyncStatus(error.status === 409 ? "conflict" : "error");
      }
    }
  };


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
      inventory: [...current.inventory, { id: uid(), name: "Novo item", qty: 1, weight: 1 }],
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

  const addAbility = (ability) => {
    setData((current) => {
      const list = current.abilities || defaultData.abilities || [];
      const newAbility = {
        id: ability?.id || uid(),
        name: ability?.name || "Nova Habilidade",
        type: ability?.type || "ativa",
        reqLevel: Number(ability?.reqLevel) || 1,
        cost: ability?.cost || "1 PE",
        attr: ability?.attr || "FOR",
        rollFormula: ability?.rollFormula || "",
        damageType: ability?.damageType || "",
        range: ability?.range || "Corpo a corpo",
        description: ability?.description || "",
        trainingHours: Number(ability?.trainingHours) || 0,
        masteryLevel: ability?.masteryLevel || "aprendiz",
        isTraining: Boolean(ability?.isTraining),
      };
      const nextAbilities = [...list, newAbility];
      return {
        ...current,
        abilities: nextAbilities,
        dadosExtras: {
          ...(current.dadosExtras || {}),
          abilities: nextAbilities,
        },
      };
    });
  };

  const removeAbility = (id) => {
    setData((current) => {
      const list = current.abilities || defaultData.abilities || [];
      const nextAbilities = list.filter((hab) => hab.id !== id);
      return {
        ...current,
        abilities: nextAbilities,
        dadosExtras: {
          ...(current.dadosExtras || {}),
          abilities: nextAbilities,
        },
      };
    });
  };

  const updAbility = (id, patch) => {
    setData((current) => {
      const list = current.abilities || defaultData.abilities || [];
      const nextAbilities = list.map((hab) => (hab.id === id ? { ...hab, ...patch } : hab));
      return {
        ...current,
        abilities: nextAbilities,
        dadosExtras: {
          ...(current.dadosExtras || {}),
          abilities: nextAbilities,
        },
      };
    });
  };

  const trainAbility = (id, hours = 1) => {
    setData((current) => {
      const list = current.abilities || defaultData.abilities || [];
      const nextAbilities = list.map((hab) => {
        if (hab.id !== id) return hab;
        return avancarTreinoHabilidade(hab, hours);
      });
      return {
        ...current,
        abilities: nextAbilities,
        dadosExtras: {
          ...(current.dadosExtras || {}),
          abilities: nextAbilities,
        },
      };
    });
  };

  const setAbilityTrainingFocus = (id) => {
    setData((current) => {
      const list = current.abilities || defaultData.abilities || [];
      const nextAbilities = list.map((hab) => ({
        ...hab,
        isTraining: hab.id === id ? !hab.isTraining : false,
      }));
      return {
        ...current,
        abilities: nextAbilities,
        dadosExtras: {
          ...(current.dadosExtras || {}),
          abilities: nextAbilities,
        },
      };
    });
  };

  const tryUnlock = async () => {
    const remoteResult = activeCharacter?.id
      ? await verifyBankPasswordOnBackend(activeCharacter.id, bankInput)
      : null;
    const valid = remoteResult === null ? bankInput === data.bankPassword : remoteResult;

    if (valid) {
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
    syncError,
    retrySync,
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
    addAbility,
    removeAbility,
    updAbility,
    trainAbility,
    setAbilityTrainingFocus,
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
