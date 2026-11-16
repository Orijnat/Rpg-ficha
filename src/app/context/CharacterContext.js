"use client";

import { createContext, useContext, useEffect, useRef, useState } from "react";
import { syncCharacterWithBackend, verifyBankPasswordOnBackend, fetchCharacterFromBackend } from "../../lib/api";
import {
  avancarTreinoHabilidade,
  criarSolicitacaoHabilidade,
  aprovarHabilidade,
  rejeitarHabilidade,
  podeTreinarHabilidade,
} from "../../lib/abilities";
import { ensureCanonicalSkills } from "../../lib/modifiers";
import { useAuth } from "./AuthContext";

import { defaultData, createBlankCharacterData } from "../../lib/defaultCharacter";
export { defaultData };

const CharacterContext = createContext(null);

const ATTRIBUTE_ALIASES = {
  FOR: "forca",
  DES: "destreza",
  CON: "constituicao",
  SAB: "sabedoria",
  ESP: "espirito",
  CAR: "carisma",
  INT: "inteligencia",
  forca: "FOR",
  destreza: "DES",
  constituicao: "CON",
  sabedoria: "SAB",
  espirito: "ESP",
  carisma: "CAR",
  inteligencia: "INT",
};

function normalizeCharacterForSync(charData, activeChar) {
  if (!charData) return charData;
  const forca = Number(charData.FOR ?? charData.forca ?? 10);
  const destreza = Number(charData.DES ?? charData.destreza ?? 10);
  const constituicao = Number(charData.CON ?? charData.constituicao ?? 10);
  const sabedoria = Number(charData.SAB ?? charData.sabedoria ?? 10);
  const espirito = Number(charData.ESP ?? charData.espirito ?? 10);
  const carisma = Number(charData.CAR ?? charData.carisma ?? 10);
  const inteligencia = Number(charData.INT ?? charData.inteligencia ?? 10);

  return {
    ...charData,
    id: charData.id || activeChar?.id,
    name: charData.name || activeChar?.name,
    FOR: forca,
    DES: destreza,
    CON: constituicao,
    SAB: sabedoria,
    ESP: espirito,
    CAR: carisma,
    INT: inteligencia,
    forca,
    destreza,
    constituicao,
    sabedoria,
    espirito,
    carisma,
    inteligencia,
    attributes: {
      ...(charData.attributes || {}),
      FOR: forca,
      DES: destreza,
      CON: constituicao,
      SAB: sabedoria,
      ESP: espirito,
      CAR: carisma,
      INT: inteligencia,
      forca,
      destreza,
      constituicao,
      sabedoria,
      espirito,
      carisma,
      inteligencia,
    },
  };
}

export function CharacterProvider({ children }) {
  const [data, setData] = useState(() => createBlankCharacterData());
  const [hydrated, setHydrated] = useState(false);
  const [hydratedKey, setHydratedKey] = useState(null);
  const [bankUnlocked, setBankUnlocked] = useState(false);
  const [bankInput, setBankInput] = useState("");
  const [bankError, setBankError] = useState(false);
  const [syncStatus, setSyncStatus] = useState("idle");
  const [syncError, setSyncError] = useState(null);
  const latestData = useRef(data);
  const syncSequence = useRef(0);
  const skipSyncRef = useRef(false);
  // Versão remota conhecida (updatedAt do servidor). Usada para concorrência otimista;
  // não vive no estado porque cada save do servidor a invalida e re-dispararia o efeito de sync.
  const remoteVersionRef = useRef(null);

  const { activeCharacter, token, user, loading: authLoading, isMaster, upsertCharacter } = useAuth();

  const cacheKey = `bruxeiro-sheet:v2:${user?.id || "anonymous"}:${activeCharacter?.id || "default"}`;

  // Remove caches legados (v1) que podiam estar contaminados com dados de demonstração.
  useEffect(() => {
    try {
      const stale = [];
      for (let i = 0; i < window.localStorage.length; i += 1) {
        const key = window.localStorage.key(i);
        if (key && key.startsWith("bruxeiro-sheet:") && !key.startsWith("bruxeiro-sheet:v2:")) {
          stale.push(key);
        }
      }
      stale.forEach((key) => window.localStorage.removeItem(key));
    } catch {
      // Ignora indisponibilidade do storage.
    }
  }, []);

  // O cache só é usado como fallback quando não existe personagem vindo da API.
  useEffect(() => {
    if (authLoading || activeCharacter) return;
    try {
      const saved = window.localStorage.getItem(cacheKey);
      if (saved) setData({ ...createBlankCharacterData(), ...JSON.parse(saved) });
      else setData(createBlankCharacterData());
    } catch {
      setData(createBlankCharacterData());
    } finally {
      setHydrated(true);
      setHydratedKey(cacheKey);
    }
  }, [activeCharacter, authLoading, cacheKey]);

  // Monta a ficha local a partir do personagem retornado pelo backend
  const buildSheetFromActive = (activeChar) => {
    if (!activeChar) return null;
    const blank = createBlankCharacterData();
    const atributos = {
      FOR: activeChar.forca ?? activeChar.FOR ?? activeChar.attributes?.FOR,
      DES: activeChar.destreza ?? activeChar.DES ?? activeChar.attributes?.DES,
      CON: activeChar.constituicao ?? activeChar.CON ?? activeChar.attributes?.CON,
      SAB: activeChar.sabedoria ?? activeChar.SAB ?? activeChar.attributes?.SAB,
      ESP: activeChar.espirito ?? activeChar.ESP ?? activeChar.attributes?.ESP,
      CAR: activeChar.carisma ?? activeChar.CAR ?? activeChar.attributes?.CAR,
      INT: activeChar.inteligencia ?? activeChar.INT ?? activeChar.attributes?.INT,
    };
    const pickCollection = (canonical, alias, fallback) =>
      canonical ?? alias ?? fallback;
    const moedas = Object.keys(activeChar.moedas ?? {}).length
      ? activeChar.moedas
      : (activeChar.currencies ?? {});
    return (current) => ({
      ...blank,
      ...activeChar,
      ...atributos,
      xp: activeChar.xp ?? activeChar.experiencia ?? blank.xp,
      skills: ensureCanonicalSkills(pickCollection(activeChar.pericias, activeChar.skills, blank.skills)),
      inventory: pickCollection(activeChar.itensInventario, activeChar.inventory, blank.inventory),
      contracts: pickCollection(activeChar.contratosDados, activeChar.contracts, blank.contracts),
      players: activeChar.jogadores ?? activeChar.players ?? blank.players,
      npcs: activeChar.npcs ?? blank.npcs,
      notesImages: pickCollection(activeChar.imagensAnotacoes, activeChar.notesImages, blank.notesImages),
      latina: activeChar.latina ?? moedas.latina ?? moedas.platina ?? blank.latina,
      ouro: activeChar.ouro ?? moedas.ouro ?? blank.ouro,
      prata: activeChar.prata ?? moedas.prata ?? blank.prata,
      cobre: activeChar.cobre ?? moedas.cobre ?? blank.cobre,
      abilities: pickCollection(
        activeChar.dadosExtras?.abilities,
        activeChar.abilities,
        current.abilities ?? blank.abilities ?? []
      ),
      levelAbilities: pickCollection(
        activeChar.dadosExtras?.levelAbilities,
        activeChar.levelAbilities,
        current.levelAbilities ?? blank.levelAbilities ?? {}
      ),
      dadosExtras: {
        ...blank.dadosExtras,
        ...(current.dadosExtras || {}),
        ...(activeChar.dadosExtras || {}),
        abilities: pickCollection(
          activeChar.dadosExtras?.abilities,
          activeChar.abilities,
          current.abilities ?? blank.abilities ?? []
        ),
        levelAbilities: pickCollection(
          activeChar.dadosExtras?.levelAbilities,
          activeChar.levelAbilities,
          current.levelAbilities ?? blank.levelAbilities ?? {}
        ),
      },
    });
  };

  // Atualiza ficha quando o personagem ativo da conta logada mudar
  useEffect(() => {
    if (authLoading || !activeCharacter) return;
    setHydrated(false);
    setHydratedKey(null);
    remoteVersionRef.current = activeCharacter?.updatedAt ?? null;
    setData(buildSheetFromActive(activeCharacter));
    setHydrated(true);
    setHydratedKey(cacheKey);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeCharacter, authLoading, cacheKey]);

  const adoptRemoteCharacter = (remoteChar) => {
    if (remoteChar?.updatedAt) remoteVersionRef.current = remoteChar.updatedAt;
    setData((current) => (current.id ? current : { ...current, id: remoteChar.id, userId: remoteChar.userId ?? current.userId }));
    upsertCharacter?.(remoteChar);
  };

  // Descarta a versão remota e sobrescreve a nuvem com o rascunho local (decisão do jogador)
  const overwriteCloud = () => retrySync({ force: true });

  // Descarta a versão local e repuxa a ficha do backend (resolve conflitos 409)
  const reloadFromCloud = async () => {
    if (!activeCharacter?.id) return false;
    try {
      const fresh = await fetchCharacterFromBackend(activeCharacter.id, token);
      if (!fresh) return false;
      const builder = buildSheetFromActive(fresh);
      if (!builder) return false;
      skipSyncRef.current = false; // repuxar da nuvem reidrata a ficha real e reativa o sync
      remoteVersionRef.current = fresh.updatedAt ?? null;
      setData(builder);
      setSyncStatus("saved");
      setSyncError(null);
      return true;
    } catch (error) {
      setSyncError(error);
      setSyncStatus("error");
      return false;
    }
  };

  useEffect(() => {
    if (!hydrated || hydratedKey !== cacheKey) {
      return;
    }

    latestData.current = data;
    window.localStorage.setItem(cacheKey, JSON.stringify(data));

    if (skipSyncRef.current) {
      // Ficha foi "restaurada para os dados padrão" localmente: nunca sobrescrever a nuvem com isso.
      setSyncStatus("offline");
      return;
    }
    // Só sincroniza com uma ficha identificada. Nunca cai no fallback do personagem ativo:
    // após "restaurar padrão" ou importar arquivo, a ficha local não tem id e nada é enviado.
    const targetId = data?.id;
    if (!targetId) {
      // Não existe ficha vinculada: nunca cria silenciosamente uma nova a partir de dados locais.
      setSyncStatus("idle");
      return;
    }

    // Sincronização em segundo plano com o backend (debounce de 800ms)
    const sequence = ++syncSequence.current;
    setSyncStatus("saving");
    setSyncError(null);
    const timer = setTimeout(() => {
      const payload = normalizeCharacterForSync({ ...data, id: targetId, updatedAt: remoteVersionRef.current ?? data?.updatedAt }, activeCharacter);
      syncCharacterWithBackend(payload, token)
        .then((result) => {
          if (sequence !== syncSequence.current) return;
          const remoteChar = result?.id ? result : result?.character ?? null;
          if (remoteChar?.updatedAt) remoteVersionRef.current = remoteChar.updatedAt;
          if (remoteChar?.id && !latestData.current?.id) {
            adoptRemoteCharacter(remoteChar);
          }
          setSyncStatus(result ? "saved" : "offline");
        })
        .catch((error) => {
          if (sequence !== syncSequence.current) return;
          setSyncError(error);
          setSyncStatus(error.status === 409 ? "conflict" : "error");
        });
    }, 800);

    return () => clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [cacheKey, data, hydrated, hydratedKey, token, activeCharacter]);

  const retrySync = async (options = {}) => {
    const sequence = ++syncSequence.current;
    setSyncStatus("saving");
    setSyncError(null);
    try {
      if (skipSyncRef.current) {
        if (sequence === syncSequence.current) setSyncStatus("offline");
        return;
      }
      const targetId = latestData.current?.id;
      if (!targetId) {
        if (sequence === syncSequence.current) setSyncStatus("idle");
        return;
      }
      const force = options?.force === true;
      const payload = normalizeCharacterForSync({
        ...latestData.current,
        id: targetId,
        ...(force ? { force: true } : { updatedAt: remoteVersionRef.current ?? latestData.current?.updatedAt }),
      }, activeCharacter);
      const result = await syncCharacterWithBackend(payload, token);
      if (sequence !== syncSequence.current) return;
      const remoteChar = result?.id ? result : result?.character ?? null;
      if (remoteChar?.updatedAt) remoteVersionRef.current = remoteChar.updatedAt;
      if (remoteChar?.id && !latestData.current?.id) {
        adoptRemoteCharacter(remoteChar);
      }
      setSyncStatus(result ? "saved" : "offline");
    } catch (error) {
      if (sequence === syncSequence.current) {
        setSyncError(error);
        setSyncStatus(error.status === 409 ? "conflict" : "error");
      }
    }
  };

  const upd = (key, value) => {
    setData((current) => {
      const parsedVal =
        typeof value === "number"
          ? value
          : Number.isNaN(Number(value))
            ? value
            : Number(value);
      const next = { ...current, [key]: parsedVal };
      const alias = ATTRIBUTE_ALIASES[key];
      if (alias) {
        next[alias] = parsedVal;
        next.attributes = {
          ...(current.attributes || {}),
          [key]: parsedVal,
          [alias]: parsedVal,
        };
      }
      return next;
    });
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
      const next = [...(current.skills || [])];
      if (next[index]) {
        next[index] = { ...next[index], ...patch };
      }
      return { ...current, skills: next };
    });
  };

  const toggleSkillTrained = (skillName) => {
    setData((current) => {
      const next = [...(current.skills || [])];
      const idx = next.findIndex((s) => s.name.toLowerCase() === String(skillName).toLowerCase());
      if (idx !== -1) {
        next[idx] = { ...next[idx], trained: !next[idx].trained };
      }
      return { ...current, skills: next };
    });
  };

  const setSkills = (newSkills) => {
    setData((current) => ({
      ...current,
      skills: Array.isArray(newSkills) ? newSkills : current.skills,
    }));
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

  const depositToBank = (slotIndex, inventoryItemId) => {
    setData((current) => {
      const slot = current.bankSlots[slotIndex];
      const item = (current.inventory || []).find((entry) => entry.id === inventoryItemId);
      if (!slot || slot.item || !item) return current;
      const next = [...current.bankSlots];
      next[slotIndex] = {
        item: item.name,
        qty: Number(item.qty) > 0 ? Number(item.qty) : 1,
        weight: Number(item.weight) > 0 ? Number(item.weight) : 1,
      };
      return {
        ...current,
        bankSlots: next,
        inventory: current.inventory.filter((entry) => entry.id !== inventoryItemId),
      };
    });
  };

  const withdrawFromBank = (slotIndex) => {
    setData((current) => {
      const slot = current.bankSlots[slotIndex];
      if (!slot?.item) return current;
      const qty = Number(slot.qty) > 0 ? Number(slot.qty) : 1;
      const weight = Number(slot.weight) > 0 ? Number(slot.weight) : 1;
      const next = [...current.bankSlots];
      next[slotIndex] = { item: "" };
      return {
        ...current,
        bankSlots: next,
        inventory: [
          ...current.inventory,
          { id: uid(), name: slot.item, qty, weight },
        ],
      };
    });
  };

  const addAbility = (ability, isMasterActor = false) => {
    const id = ability?.id || uid();
    const baseAbility = {
      id,
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
      isTraining: false,
      ...ability,
    };
    const newAbility = criarSolicitacaoHabilidade(baseAbility, isMasterActor || isMaster);
    setData((current) => {
      const list = current.abilities || [];
      const nextAbilities = [...list, newAbility];
      let nextLevelAbilities = current.levelAbilities || current.dadosExtras?.levelAbilities || {};
      if (ability?.assignToLevel) {
        nextLevelAbilities = {
          ...nextLevelAbilities,
          [Number(ability.assignToLevel)]: newAbility.id,
        };
      }
      return {
        ...current,
        abilities: nextAbilities,
        levelAbilities: nextLevelAbilities,
        dadosExtras: {
          ...(current.dadosExtras || {}),
          abilities: nextAbilities,
          levelAbilities: nextLevelAbilities,
        },
      };
    });
    return newAbility;
  };

  const removeAbility = (id) => {
    setData((current) => {
      const list = current.abilities || [];
      const nextAbilities = list.filter((hab) => hab.id !== id);
      const prevLevelAbilities = current.levelAbilities || current.dadosExtras?.levelAbilities || {};
      const nextLevelAbilities = { ...prevLevelAbilities };
      for (const [lvl, habId] of Object.entries(nextLevelAbilities)) {
        if (habId === id) {
          delete nextLevelAbilities[lvl];
        }
      }
      return {
        ...current,
        abilities: nextAbilities,
        levelAbilities: nextLevelAbilities,
        dadosExtras: {
          ...(current.dadosExtras || {}),
          abilities: nextAbilities,
          levelAbilities: nextLevelAbilities,
        },
      };
    });
  };

  const updAbility = (id, patch, isMasterActor = false) => {
    setData((current) => {
      const list = current.abilities || [];
      const isMasterEffective = isMasterActor || isMaster;
      const nextAbilities = list.map((hab) => {
        if (hab.id !== id) return hab;
        const updated = { ...hab, ...patch, updatedAt: new Date().toISOString() };
        // Toda edição realizada por jogador re-submete a habilidade para aprovação do Mestre
        if (!isMasterEffective) {
          updated.approvalStatus = "pendente";
          updated.submittedBy = "jogador";
          updated.masterFeedback = null;
        }
        return updated;
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

  const approveAbility = (id, feedback = null) => {
    setData((current) => {
      const list = current.abilities || [];
      const nextAbilities = list.map((hab) => (hab.id === id ? aprovarHabilidade(hab, feedback) : hab));
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

  const rejectAbility = (id, feedback = "Rejeitada pelo mestre.") => {
    setData((current) => {
      const list = current.abilities || [];
      const nextAbilities = list.map((hab) => (hab.id === id ? rejeitarHabilidade(hab, feedback) : hab));
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
      const list = current.abilities || [];
      const nextAbilities = list.map((hab) => {
        if (hab.id !== id) return hab;
        if (!podeTreinarHabilidade(hab)) {
          return hab;
        }
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
      const list = current.abilities || [];
      const target = list.find((h) => h.id === id);
      if (target && !podeTreinarHabilidade(target)) {
        return current;
      }
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

  const assignLevelAbility = (level, abilityId) => {
    const lvlNum = Number(level);
    if (!lvlNum || lvlNum < 1 || lvlNum > 20) return;
    setData((current) => {
      const prev = current.levelAbilities || current.dadosExtras?.levelAbilities || {};
      const nextLevelAbilities = {
        ...prev,
        [lvlNum]: abilityId,
      };
      return {
        ...current,
        levelAbilities: nextLevelAbilities,
        dadosExtras: {
          ...(current.dadosExtras || {}),
          levelAbilities: nextLevelAbilities,
        },
      };
    });
  };

  const unassignLevelAbility = (level) => {
    const lvlNum = Number(level);
    if (!lvlNum) return;
    setData((current) => {
      const prev = current.levelAbilities || current.dadosExtras?.levelAbilities || {};
      const nextLevelAbilities = { ...prev };
      delete nextLevelAbilities[lvlNum];
      return {
        ...current,
        levelAbilities: nextLevelAbilities,
        dadosExtras: {
          ...(current.dadosExtras || {}),
          levelAbilities: nextLevelAbilities,
        },
      };
    });
  };

  const tryUnlock = async () => {
    if (!activeCharacter?.id) {
      setBankError(true);
      return;
    }
    const remoteResult = await verifyBankPasswordOnBackend(activeCharacter.id, bankInput);
    // Senha personalizada da ficha ou senha do login do dono — validadas pelo servidor.
    // Offline: sem validação local (não há senha em texto puro no navegador).
    if (remoteResult === true) {
      setBankUnlocked(true);
      setBankError(false);
      return;
    }
    setBankError(true);
  };

  // Importa um backup JSON por cima da ficha ATIVA (a UI exige confirmação tipada).
  // Identidade do arquivo é descartada: id/userId/campanhaId vêm da ficha ativa da sessão.
  // Sem ficha ativa, o conteúdo fica só no navegador e nunca é sincronizado.
  const loadCharacter = (importedData) => {
    if (importedData && typeof importedData === "object") {
      const { id: _id, userId: _userId, campanhaId: _campanhaId, ...imported } = importedData;
      const currentId = activeCharacter?.id;
      skipSyncRef.current = false; // restauração explícita reidrata a ficha e reativa o sync
      setData({
        ...createBlankCharacterData(),
        ...imported,
        ...(currentId ? { id: currentId, userId: activeCharacter?.userId } : {}),
      });
    }
  };

  const resetCharacter = () => {
    skipSyncRef.current = true; // nunca sincroniza a ficha em branco por cima da nuvem
    setData(createBlankCharacterData());
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
    reloadFromCloud,
    overwriteCloud,
    setBankError,
    upd,
    updExtra,
    updSkill,
    toggleSkillTrained,
    setSkills,
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
    depositToBank,
    withdrawFromBank,
    tryUnlock,
    addAbility,
    removeAbility,
    updAbility,
    approveAbility,
    rejectAbility,
    trainAbility,
    setAbilityTrainingFocus,
    assignLevelAbility,
    unassignLevelAbility,
  };

  return <CharacterContext.Provider value={value}>{children}</CharacterContext.Provider>;

}

function uid() {
  const cryptoObj = typeof globalThis !== "undefined" ? globalThis.crypto : undefined;
  if (cryptoObj?.getRandomValues) {
    const bytes = new Uint8Array(8);
    cryptoObj.getRandomValues(bytes);
    return Array.from(bytes, (b) => b.toString(16).padStart(2, "0")).join("");
  }
  return `${Date.now().toString(36)}${Math.random().toString(36).slice(2)}`;
}

export function useCharacter() {
  const context = useContext(CharacterContext);

  if (!context) {
    throw new Error("useCharacter must be used within a CharacterProvider");
  }

  return context;
}
