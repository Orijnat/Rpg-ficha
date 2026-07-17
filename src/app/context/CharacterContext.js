"use client";

import { createContext, useContext, useEffect, useState } from "react";

export const defaultData = {
  name: "",
  hp: 70,
  hpMax: 70,
  age: "",
  eyes: "Verde Azul",
  height: "1,89",
  skin: "Bronze",
  weight: "100kg",
  hair: "Laranja/cobre",
  appearance: "ondulados, corpo atlético, barba falha",
  FOR: 14,
  DES: 16,
  CON: 14,
  SAB: 12,
  ESP: 14,
  CAR: 10,
  INT: 10,
  skills: [
    { name: "Atletismo", attr: "FOR", trained: false, bonus: null },
    { name: "Acrobacia", attr: "DES", trained: false, bonus: null },
    { name: "Furtividade", attr: "DES", trained: false, bonus: null },
    { name: "Prestidigitação", attr: "DES", trained: false, bonus: null },
    { name: "História", attr: "SAB", trained: false, bonus: null },
    { name: "Investigação", attr: "SAB", trained: true, bonus: 5 },
    { name: "Sobrevivência", attr: "SAB", trained: false, bonus: null },
    { name: "Provocação", attr: "SAB", trained: false, bonus: null },
    { name: "Intuição", attr: "ESP", trained: false, bonus: null },
    { name: "Percepção", attr: "ESP", trained: true, bonus: 6 },
    { name: "Atuação", attr: "ESP", trained: false, bonus: null },
    { name: "Enganação", attr: "CAR", trained: false, bonus: null },
    { name: "Intimidação", attr: "CAR", trained: true, bonus: 6 },
    { name: "Persuasão", attr: "CAR", trained: false, bonus: null },
    { name: "Arcanismo", attr: "INT", trained: false, bonus: null },
    { name: "Religião", attr: "INT", trained: false, bonus: null },
    { name: "Natureza", attr: "INT", trained: false, bonus: null },
    { name: "Animais", attr: "SAB", trained: false, bonus: null },
    { name: "Medicina", attr: "SAB", trained: false, bonus: null },
  ],
  latina: 0,
  ouro: 66,
  prata: 70,
  cobre: 3,
  inventory: [
    { id: "1", name: "no farol", qty: 1 },
    { id: "2", name: "Annabelle", qty: 1 },
    { id: "3", name: "Garasta", qty: 1 },
    { id: "4", name: "Espada com tambor", qty: 1 },
    { id: "5", name: "Revolver/Rifle (1 anel)", qty: 1 },
    { id: "6", name: "Revolver de prata", qty: 1 },
    { id: "7", name: "Caixa de munição", qty: 24 },
    { id: "8", name: "Balas de rifle", qty: 246 },
    { id: "9", name: "Balas negras (rifle)", qty: 12 },
    { id: "10", name: "Bandoleira", qty: 1 },
    { id: "11", name: "Pistola", qty: 1 },
    { id: "12", name: "Armadura de couro e prata", qty: 1 },
    { id: "13", name: "7 gramas de flor (drogas)", qty: 1 },
  ],
  contracts: [
    { id: "1", title: "Me vingar de Brank", reward: "???", done: false },
    { id: "2", title: "Um velho amigo", reward: "???", done: false },
    { id: "3", title: "Para mais poder de...", reward: "???", done: false },
    { id: "4", title: "O que é meu é seu", reward: "???", done: false },
  ],
  players: [
    { id: "1", name: "Marosso", note: "" },
    { id: "2", name: "little finger", note: "" },
    { id: "3", name: "Skjar", note: "" },
    { id: "4", name: "jasmini", note: "" },
    { id: "5", name: "Victor", note: "" },
    { id: "6", name: "Humpty Dumpty", note: "" },
    { id: "7", name: "Ryathar", note: "" },
  ],
  npcs: [
    { id: "1", name: "Mithril", note: "6 de armadura de espinhos sacro, 2 cap" },
    { id: "2", name: "Luma", note: "" },
    { id: "3", name: "Malcolm", note: "" },
  ],
  bankSlots: Array.from({ length: 80 }, (_, index) =>
    index === 0 ? { item: "1 orelha de morcegão" } : { item: "" }
  ),
  bankPassword: "133313",
  notes: "corvo rubro com ovo com 0 de vida\nfaça de prata meio ameaçada\novo de corvo mágico (?/100)\n18 balas para o rifle na bandoleira",
  roomNotes: "",
  mountName: "",
  mountHP: 20,
  mountHPMax: 20,
  mountNotes: "",
};

const CharacterContext = createContext(null);

export function CharacterProvider({ children }) {
  const [data, setData] = useState(defaultData);
  const [hydrated, setHydrated] = useState(false);
  const [bankUnlocked, setBankUnlocked] = useState(false);
  const [bankInput, setBankInput] = useState("");
  const [bankError, setBankError] = useState(false);

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

  useEffect(() => {
    if (!hydrated) {
      return;
    }

    window.localStorage.setItem("bruxeiro-sheet", JSON.stringify(data));
  }, [data, hydrated]);

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

  const value = {
    data,
    setData,
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
