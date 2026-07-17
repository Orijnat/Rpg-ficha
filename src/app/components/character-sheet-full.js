"use client";

import { useCallback, useEffect, useState } from "react";
import {
  Check,
  ChevronDown,
  ChevronUp,
  Coins,
  FileText,
  Footprints,
  Home,
  Package,
  Plus,
  ScrollText,
  Shield,
  Skull,
  Sword,
  Trash2,
  Users,
  X,
} from "lucide-react";

import { modifier, uid, HPBar, EditableText, EditableNumber, SectionHeader, Card, StatBox } from "./ui";

const defaultData = {
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

const TABS = [
  { id: "personagem", label: "Personagem", icon: <ScrollText size={15} /> },
  { id: "inventario", label: "Inventário", icon: <Package size={15} /> },
  { id: "contratos", label: "Contratos", icon: <FileText size={15} /> },
  { id: "mundo", label: "Mundo", icon: <Users size={15} /> },
  { id: "banco", label: "Banco", icon: <Coins size={15} /> },
  { id: "quarto", label: "Quarto", icon: <Home size={15} /> },
  { id: "montaria", label: "Montaria", icon: <Footprints size={15} /> },
];

export default function CharacterSheet() {
  const [tab, setTab] = useState("personagem");
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

  const upd = useCallback((key, value) => {
    setData((current) => ({ ...current, [key]: value }));
  }, []);

  const updSkill = (index, patch) => {
    const next = [...data.skills];
    next[index] = { ...next[index], ...patch };
    upd("skills", next);
  };

  const addItem = () => {
    upd("inventory", [...data.inventory, { id: uid(), name: "Novo item", qty: 1 }]);
  };

  const removeItem = (id) => upd("inventory", data.inventory.filter((item) => item.id !== id));

  const updItem = (id, patch) => {
    upd("inventory", data.inventory.map((item) => (item.id === id ? { ...item, ...patch } : item)));
  };

  const addContract = () => {
    upd("contracts", [...data.contracts, { id: uid(), title: "Novo contrato", reward: "???", done: false }]);
  };

  const removeContract = (id) => upd("contracts", data.contracts.filter((contract) => contract.id !== id));

  const updContract = (id, patch) => {
    upd("contracts", data.contracts.map((contract) => (contract.id === id ? { ...contract, ...patch } : contract)));
  };

  const addPerson = (list) => {
    upd(list, [...data[list], { id: uid(), name: "Novo", note: "" }]);
  };

  const removePerson = (list, id) => {
    upd(list, data[list].filter((person) => person.id !== id));
  };

  const updPerson = (list, id, patch) => {
    upd(list, data[list].map((person) => (person.id === id ? { ...person, ...patch } : person)));
  };

  const updBank = (index, item) => {
    const next = [...data.bankSlots];
    next[index] = { item };
    upd("bankSlots", next);
  };

  const tryUnlock = () => {
    if (bankInput === data.bankPassword) {
      setBankUnlocked(true);
      setBankError(false);
      return;
    }

    setBankError(true);
  };

  const renderPersonagem = () => (
    <div className="space-y-4">
      <Card>
        <SectionHeader title="Atributos" icon={<Sword size={14} />} />
        <div className="flex flex-wrap justify-center gap-2 sm:justify-start">
          {["FOR", "DES", "CON", "SAB", "ESP", "CAR", "INT"].map((attr) => (
            <StatBox key={attr} label={attr} value={data[attr]} onChange={(value) => upd(attr, value)} />
          ))}
        </div>
      </Card>

      <Card>
        <SectionHeader title="Pontos de Vida" icon={<Shield size={14} />} />
        <div className="mb-2 flex items-center gap-3">
          <button
            className="flex h-7 w-7 items-center justify-center rounded bg-[#8b1a1a] text-[#e8d5b0] transition-colors hover:bg-[#a02020]"
            onClick={() => upd("hp", Math.max(0, data.hp - 1))}
          >
            −
          </button>
          <div className="flex-1">
            <HPBar hp={data.hp} max={data.hpMax} />
          </div>
          <button
            className="flex h-7 w-7 items-center justify-center rounded bg-[#4a7c59] text-[#e8d5b0] transition-colors hover:bg-[#5a9c69]"
            onClick={() => upd("hp", Math.min(data.hpMax, data.hp + 1))}
          >
            +
          </button>
        </div>
        <div className="flex items-center gap-2 text-sm">
          <span className="text-[#8a7355]">HP:</span>
          <EditableNumber value={data.hp} onChange={(value) => upd("hp", value)} className="font-bold text-[#e8d5b0]" min={0} max={data.hpMax} />
          <span className="text-[#8a7355]">/</span>
          <EditableNumber value={data.hpMax} onChange={(value) => upd("hpMax", value)} className="text-[#8a7355]" min={1} />
        </div>
      </Card>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <Card>
          <SectionHeader title="Aparência" />
          <div className="space-y-1.5 text-sm">
            {[
              ["Idade", "age"],
              ["Olhos", "eyes"],
              ["Altura", "height"],
              ["Cor da Pele", "skin"],
              ["Peso", "weight"],
              ["Cabelo", "hair"],
            ].map(([label, key]) => (
              <div key={key} className="flex items-start gap-2">
                <span className="w-24 shrink-0 text-[#8a7355]" style={{ fontFamily: "'Cinzel', serif", fontSize: "11px" }}>
                  {label}
                </span>
                <EditableText value={data[key]} onChange={(value) => upd(key, value)} className="text-sm text-[#e8d5b0]" />
              </div>
            ))}
            <div className="flex items-start gap-2">
              <span className="w-24 shrink-0 text-[11px] text-[#8a7355]" style={{ fontFamily: "'Cinzel', serif" }}>
                Aparência
              </span>
              <EditableText
                value={data.appearance}
                onChange={(value) => upd("appearance", value)}
                className="text-sm text-[#e8d5b0]"
                multiline
              />
            </div>
          </div>
        </Card>

        <Card>
          <SectionHeader title="Perícias" />
          <div className="custom-scroll max-h-72 space-y-0.5 overflow-y-auto pr-1">
            {data.skills.map((skill, index) => (
              <div key={skill.name} className="flex items-center gap-2 border-b border-[rgba(201,134,42,0.08)] py-1 last:border-0">
                <button
                  onClick={() => updSkill(index, { trained: !skill.trained })}
                  className={`flex h-4 w-4 shrink-0 items-center justify-center rounded border transition-colors ${
                    skill.trained
                      ? "border-[#c9862a] bg[#c9862a] text-[#0f0d0a]"
                      : "border-[rgba(201,134,42,0.3)] hover:border-[#c9862a]"
                  }`}
                >
                  {skill.trained ? <Check size={10} /> : null}
                </button>
                <span className={`flex-1 text-xs ${skill.trained ? "text-[#e8d5b0]" : "text-[#8a7355]"}`}>
                  {skill.name}
                </span>
                <span className="w-7 text-center font-mono text-[10px] text-[#8a7355]">{skill.attr}</span>
                {skill.trained ? (
                  <span className="w-6 text-right font-bold font-mono text-xs text-[#c9862a]">
                    {skill.bonus !== null ? `+${skill.bonus}` : ""}
                  </span>
                ) : null}
              </div>
            ))}
          </div>
        </Card>
      </div>

      <Card>
        <SectionHeader title="Anotações" />
        <EditableText
          value={data.notes}
          onChange={(value) => upd("notes", value)}
          className="w-full text-sm text-[#e8d5b0]"
          multiline
          placeholder="Escreva suas anotações aqui..."
        />
      </Card>
    </div>
  );
}
