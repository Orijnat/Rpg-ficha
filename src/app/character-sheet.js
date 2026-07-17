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

import Contratos from "./components/Contratos";

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

function modifier(score) {
  const mod = Math.floor((score - 10) / 2);
  return mod >= 0 ? `+${mod}` : `${mod}`;
}

function uid() {
  return Math.random().toString(36).slice(2);
}

function HPBar({ hp, max }) {
  const pct = Math.max(0, Math.min(100, (hp / max) * 100));
  const color = pct > 60 ? "#4f8f6b" : pct > 30 ? "#d69a3d" : "#b24a3d";

  return (
    <div className="h-3 w-full overflow-hidden rounded-full border border-white/10 bg-white/5 shadow-inner">
      <div
        className="h-full rounded-full shadow-[0_0_18px_rgba(214,154,61,0.25)] transition-all duration-300"
        style={{ width: `${pct}%`, backgroundColor: color }}
      />
    </div>
  );
}

function EditableText({ value, onChange, className = "", multiline = false, placeholder = "—" }) {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(value);

  const commit = () => {
    onChange(draft);
    setEditing(false);
  };

  if (!editing) {
    return (
      <span
        className={`cursor-pointer transition-colors duration-150 hover:text-[#f0bf67] ${className}`}
        onClick={() => {
          setDraft(value);
          setEditing(true);
        }}
      >
        {value || <span className="italic text-[#8a7355]">{placeholder}</span>}
      </span>
    );
  }

  if (multiline) {
    return (
      <textarea
        autoFocus
        className={`w-full resize-none rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-[#f1e7d2] shadow-sm outline-none transition focus:border-[#d69a3d] focus:ring-2 focus:ring-[#d69a3d]/20 ${className}`}
        value={draft}
        rows={4}
        onBlur={commit}
        onChange={(event) => setDraft(event.target.value)}
      />
    );
  }

  return (
    <input
      autoFocus
      className={`w-full rounded-lg border border-white/10 bg-white/5 px-2 py-1 text-[#f1e7d2] shadow-sm outline-none transition focus:border-[#d69a3d] focus:ring-2 focus:ring-[#d69a3d]/20 ${className}`}
      value={draft}
      onBlur={commit}
      onChange={(event) => setDraft(event.target.value)}
      onKeyDown={(event) => event.key === "Enter" && commit()}
    />
  );
}

function EditableNumber({ value, onChange, className = "", min, max }) {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(String(value));

  const commit = () => {
    const parsed = Number.parseInt(draft, 10);

    if (!Number.isNaN(parsed)) {
      const clamped =
        min !== undefined
          ? Math.max(min, max !== undefined ? Math.min(max, parsed) : parsed)
          : max !== undefined
            ? Math.min(max, parsed)
            : parsed;

      onChange(clamped);
    }

    setEditing(false);
  };

  if (!editing) {
    return (
      <span
        className={`cursor-pointer transition-colors hover:text-[#c9862a] ${className}`}
        onClick={() => {
          setDraft(String(value));
          setEditing(true);
        }}
      >
        {value}
      </span>
    );
  }

  return (
    <input
      autoFocus
      type="number"
      className={`w-16 rounded border border-[#c9862a] bg-[#241c13] px-1 text-center text-[#e8d5b0] ${className}`}
      value={draft}
      onBlur={commit}
      onChange={(event) => setDraft(event.target.value)}
      onKeyDown={(event) => event.key === "Enter" && commit()}
    />
  );
}

function SectionHeader({ title, icon }) {
  return (
    <div className="mb-4 flex items-center gap-3">
      {icon ? <span className="text-[#d69a3d]">{icon}</span> : null}
      <h3 className="text-[11px] font-semibold uppercase tracking-[0.24em] text-[#f0bf67]">
        {title}
      </h3>
      <div className="h-px flex-1 bg-gradient-to-r from-[#d69a3d]/40 via-[#d69a3d]/10 to-transparent" />
    </div>
  );
}

function Card({ children, className = "" }) {
  return (
    <div className={`rounded-2xl border border-white/10 bg-white/[0.04] p-5 shadow-[0_18px_60px_rgba(0,0,0,0.28)] backdrop-blur-sm ${className}`}>
      {children}
    </div>
  );
}

function StatBox({ label, value, onChange }) {
  return (
    <div className="flex min-w-[64px] flex-col items-center gap-1 rounded-xl border border-white/10 bg-white/[0.03] p-3 shadow-sm">
      <span className="text-[10px] uppercase tracking-[0.22em] text-[#a98b68]">{label}</span>
      <EditableNumber
        value={value}
        onChange={onChange}
        className="text-center text-xl font-semibold text-[#f5e9d7]"
        min={1}
        max={30}
      />
      <span className="font-mono text-xs text-[#d69a3d]">{modifier(value)}</span>
    </div>
  );
}

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
                      ? "border-[#c9862a] bg-[#c9862a] text-[#0f0d0a]"
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

  const renderInventario = () => (
    <div className="space-y-4">
      <Card>
        <SectionHeader title="Moedas" icon={<Coins size={14} />} />
        <div className="grid grid-cols-4 gap-3">
          {[
            { label: "Latina", key: "latina", color: "#8a7355" },
            { label: "Ouro", key: "ouro", color: "#d4a017" },
            { label: "Prata", key: "prata", color: "#c0c0c0" },
            { label: "Cobre", key: "cobre", color: "#b87333" },
          ].map(({ label, key, color }) => (
            <div key={key} className="flex flex-col items-center gap-1 rounded-lg border border-[rgba(201,134,42,0.15)] bg-[#0f0d0a] p-3">
              <span className="text-[10px] uppercase tracking-widest" style={{ color, fontFamily: "'Cinzel', serif" }}>
                {label}
              </span>
              <EditableNumber value={data[key]} onChange={(value) => upd(key, value)} className="text-lg font-bold" min={0} />
            </div>
          ))}
        </div>
      </Card>

      <Card>
        <div className="mb-3 flex items-center justify-between">
          <SectionHeader title="Itens & Equipamentos" icon={<Package size={14} />} />
          <button onClick={addItem} className="flex items-center gap-1 text-xs text-[#c9862a] transition-colors hover:text-[#e8a030]">
            <Plus size={13} /> Adicionar
          </button>
        </div>
        <div className="space-y-1">
          {data.inventory.map((item) => (
            <div key={item.id} className="group flex items-center gap-2 border-b border-[rgba(201,134,42,0.08)] py-1.5 last:border-0">
              <div className="flex-1">
                <EditableText value={item.name} onChange={(value) => updItem(item.id, { name: value })} className="text-sm text-[#e8d5b0]" />
              </div>
              <div className="flex shrink-0 items-center gap-1">
                <button
                  onClick={() => updItem(item.id, { qty: Math.max(0, item.qty - 1) })}
                  className="flex h-5 w-5 items-center justify-center rounded bg-[#241c13] text-xs text-[#8a7355] hover:text-[#c9862a]"
                >
                  <ChevronDown size={11} />
                </button>
                <EditableNumber
                  value={item.qty}
                  onChange={(value) => updItem(item.id, { qty: value })}
                  className="w-8 text-center font-mono text-xs text-[#c9862a]"
                  min={0}
                />
                <button
                  onClick={() => updItem(item.id, { qty: item.qty + 1 })}
                  className="flex h-5 w-5 items-center justify-center rounded bg-[#241c13] text-xs text-[#8a7355] hover:text-[#c9862a]"
                >
                  <ChevronUp size={11} />
                </button>
              </div>
              <button onClick={() => removeItem(item.id)} className="text-[#8b1a1a] opacity-0 transition-all group-hover:opacity-100 hover:text-[#c02020]">
                <Trash2 size={13} />
              </button>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
  const renderContratos = () => <Contratos />;

  const renderMundo = () => (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
      {(["players", "npcs"]).map((listKey) => {
        const isPlayers = listKey === "players";

        return (
          <Card key={listKey}>
            <div className="mb-3 flex items-center justify-between">
              <SectionHeader title={isPlayers ? "Jogadores" : "NPCs"} icon={isPlayers ? <Users size={14} /> : <Skull size={14} />} />
              <button onClick={() => addPerson(listKey)} className="flex items-center gap-1 text-xs text-[#c9862a] transition-colors hover:text-[#e8a030]">
                <Plus size={13} />
              </button>
            </div>
            <div className="space-y-2">
              {data[listKey].map((person) => (
                <div key={person.id} className="group flex items-start gap-2 border-b border-[rgba(201,134,42,0.08)] pb-2 last:border-0">
                  <div className="flex-1 space-y-0.5">
                    <EditableText value={person.name} onChange={(value) => updPerson(listKey, person.id, { name: value })} className="text-sm font-medium text-[#e8d5b0]" />
                    <EditableText value={person.note} onChange={(value) => updPerson(listKey, person.id, { note: value })} className="text-xs text-[#8a7355]" placeholder="nota..." />
                  </div>
                  <button onClick={() => removePerson(listKey, person.id)} className="mt-0.5 text-[#8b1a1a] opacity-0 transition-all group-hover:opacity-100 hover:text-[#c02020]">
                    <Trash2 size={12} />
                  </button>
                </div>
              ))}
            </div>
          </Card>
        );
      })}
    </div>
  );

  const renderBanco = () => {
    if (!bankUnlocked) {
      return (
        <div className="flex min-h-[60vh] items-center justify-center">
          <Card className="w-full max-w-sm space-y-4 text-center">
            <div className="text-4xl text-[#c9862a]" style={{ fontFamily: "'Cinzel Decorative', serif" }}>
              🏦
            </div>
            <h2 className="text-lg text-[#e8d5b0]" style={{ fontFamily: "'Cinzel', serif" }}>
              Banco de Glenor
            </h2>
            <p className="text-sm text-[#8a7355]">Digite a senha para acessar</p>
            <div className="space-y-2">
              <input
                type="password"
                value={bankInput}
                onChange={(event) => setBankInput(event.target.value)}
                onKeyDown={(event) => event.key === "Enter" && tryUnlock()}
                placeholder="Senha..."
                className={`w-full rounded border bg-[#241c13] px-3 py-2 text-center text-lg tracking-widest text-[#e8d5b0] focus:outline-none ${
                  bankError ? "border-[#8b1a1a]" : "border-[rgba(201,134,42,0.3)] focus:border-[#c9862a]"
                }`}
              />
              {bankError ? <p className="text-xs text-[#8b1a1a]">Senha incorreta</p> : null}
              <button
                onClick={tryUnlock}
                className="w-full rounded bg-[#c9862a] py-2 font-semibold text-[#0f0d0a] transition-colors hover:bg-[#e8a030]"
                style={{ fontFamily: "'Cinzel', serif" }}
              >
                Entrar
              </button>
            </div>
          </Card>
        </div>
      );
    }

    return (
      <div className="space-y-4">
        <Card>
          <div className="mb-3 flex items-center justify-between">
            <SectionHeader title="Banco de Glenor" icon={<Coins size={14} />} />
            <div className="flex items-center gap-2 text-xs text-[#8a7355]">
              <span>Senha:</span>
              <EditableText
                value={data.bankPassword}
                onChange={(value) => {
                  upd("bankPassword", value);
                  setBankUnlocked(true);
                }}
                className="font-mono text-[#c9862a]"
              />
              <button onClick={() => setBankUnlocked(false)} className="text-[#8a7355] transition-colors hover:text-[#c9862a]">
                <X size={13} />
              </button>
            </div>
          </div>
          <div className="grid grid-cols-8 gap-1.5 sm:grid-cols-10">
            {data.bankSlots.map((slot, index) => (
              <div
                key={index}
                title={slot.item || "vazio"}
                className={`flex aspect-square cursor-pointer items-center justify-center rounded border p-0.5 text-center text-[9px] leading-tight transition-colors ${
                  slot.item
                    ? "border-[#c9862a] bg-[#2a1c0a] text-[#c9862a]"
                    : "border-[rgba(201,134,42,0.15)] bg-[#241c13] text-transparent hover:border-[rgba(201,134,42,0.4)] hover:text-[#8a7355]"
                }`}
                onClick={() => {
                  const nextValue = window.prompt("Item:", slot.item);
                  if (nextValue !== null) {
                    updBank(index, nextValue);
                  }
                }}
              >
                {slot.item ? (slot.item.length > 8 ? `${slot.item.slice(0, 8)}…` : slot.item) : "·"}
              </div>
            ))}
          </div>
        </Card>
      </div>
    );
  };

  const renderQuarto = () => (
    <div className="space-y-4">
      <Card>
        <SectionHeader title="Quarto" icon={<Home size={14} />} />
        <EditableText
          value={data.roomNotes}
          onChange={(value) => upd("roomNotes", value)}
          className="w-full text-sm text-[#e8d5b0]"
          multiline
          placeholder="Itens, descrição e notas do quarto..."
        />
      </Card>
    </div>
  );

  const renderMontaria = () => (
    <div className="space-y-4">
      <Card>
        <SectionHeader title="Montaria" icon={<Footprints size={14} />} />
        <div className="space-y-4">
          <div className="flex items-center gap-3">
            <span className="w-16 text-sm text-[#8a7355]" style={{ fontFamily: "'Cinzel', serif" }}>
              Nome
            </span>
            <EditableText
              value={data.mountName}
              onChange={(value) => upd("mountName", value)}
              className="font-medium text-[#e8d5b0]"
              placeholder="Nome da montaria"
            />
          </div>
          <div>
            <div className="mb-2 flex items-center gap-3">
              <button className="flex h-7 w-7 items-center justify-center rounded bg-[#8b1a1a] text-[#e8d5b0] hover:bg-[#a02020]" onClick={() => upd("mountHP", Math.max(0, data.mountHP - 1))}>
                −
              </button>
              <div className="flex-1">
                <HPBar hp={data.mountHP} max={data.mountHPMax} />
              </div>
              <button className="flex h-7 w-7 items-center justify-center rounded bg-[#4a7c59] text-[#e8d5b0] hover:bg-[#5a9c69]" onClick={() => upd("mountHP", Math.min(data.mountHPMax, data.mountHP + 1))}>
                +
              </button>
            </div>
            <div className="flex items-center gap-2 text-sm">
              <span className="text-[#8a7355]">HP:</span>
              <EditableNumber value={data.mountHP} onChange={(value) => upd("mountHP", value)} className="font-bold text-[#e8d5b0]" min={0} max={data.mountHPMax} />
              <span className="text-[#8a7355]">/</span>
              <EditableNumber value={data.mountHPMax} onChange={(value) => upd("mountHPMax", value)} className="text-[#8a7355]" min={1} />
            </div>
          </div>
          <div>
            <span className="mb-1 block text-sm text-[#8a7355]" style={{ fontFamily: "'Cinzel', serif" }}>
              Notas
            </span>
            <EditableText
              value={data.mountNotes}
              onChange={(value) => upd("mountNotes", value)}
              className="w-full text-sm text-[#e8d5b0]"
              multiline
              placeholder="Habilidades, equipamentos, histórico..."
            />
          </div>
        </div>
      </Card>
    </div>
  );

  const tabContent = {
    personagem: renderPersonagem(),
    inventario: renderInventario(),
    contratos: renderContratos(),
    mundo: renderMundo(),
    banco: renderBanco(),
    quarto: renderQuarto(),
    montaria: renderMontaria(),
  };

  return (
    <div className="relative min-h-screen overflow-hidden bg-[#0b0d12] text-[#e8d5b0]" style={{ fontFamily: "'Inter', sans-serif" }}>
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(214,154,61,0.13),transparent_35%),radial-gradient(circle_at_top_right,rgba(120,97,255,0.08),transparent_30%),linear-gradient(180deg,rgba(255,255,255,0.02),transparent_18%)]" />
      <div className="pointer-events-none absolute -left-24 top-24 h-72 w-72 rounded-full bg-[#d69a3d]/10 blur-3xl" />
      <div className="pointer-events-none absolute right-0 top-80 h-96 w-96 rounded-full bg-[#4f8f6b]/10 blur-3xl" />

      <header className="sticky top-0 z-20 border-b border-white/10 bg-[#0b0d12]/80 backdrop-blur-xl">
        <div className="mx-auto max-w-6xl px-4 py-4 sm:px-6 lg:px-8">
          <div className="flex flex-col gap-4 rounded-2xl border border-white/10 bg-white/[0.04] px-5 py-4 shadow-[0_18px_60px_rgba(0,0,0,0.24)] sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-[10px] uppercase tracking-[0.32em] text-[#a98b68]">Ficha de personagem</p>
              <h1 className="mt-1 text-2xl font-semibold tracking-tight text-[#f5e9d7] sm:text-3xl">Coração da Montanha</h1>
              <p className="mt-1 text-sm text-[#a98b68]">Controle central da ficha, inventário e contratos</p>
            </div>
            <div className="min-w-0 text-left sm:text-right">
              <EditableText
                value={data.name}
                onChange={(value) => upd("name", value)}
                className="block text-lg font-semibold text-[#f5e9d7] sm:text-xl"
              />
              <div className="mt-2 flex items-center gap-3 sm:justify-end">
                <div className="w-28 sm:w-32">
                  <HPBar hp={data.hp} max={data.hpMax} />
                </div>
                <span className="font-mono text-xs text-[#a98b68]">
                  {data.hp}/{data.hpMax}
                </span>
              </div>
            </div>
          </div>
        </div>
      </header>

      <nav className="sticky top-[93px] z-10 border-b border-white/10 bg-[#0b0d12]/70 backdrop-blur-xl">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
          <div className="no-scrollbar flex overflow-x-auto rounded-2xl border border-white/10 bg-white/[0.03] px-1 py-1">
            {TABS.map((item) => (
              <button
                key={item.id}
                onClick={() => setTab(item.id)}
                className={`flex items-center gap-2 whitespace-nowrap rounded-xl px-3 py-2 text-xs font-medium transition-all sm:px-4 ${
                  tab === item.id
                    ? "bg-[#d69a3d] text-[#17140f] shadow-md shadow-[#d69a3d]/20"
                    : "text-[#a98b68] hover:bg-white/[0.04] hover:text-[#f5e9d7]"
                }`}
              >
                {item.icon}
                <span className="hidden sm:inline">{item.label}</span>
              </button>
            ))}
          </div>
        </div>
      </nav>

      <main className="relative mx-auto max-w-6xl px-4 py-6 sm:px-6 lg:px-8 lg:py-8">{tabContent[tab]}</main>

      <style>{`
        .custom-scroll::-webkit-scrollbar { width: 4px; }
        .custom-scroll::-webkit-scrollbar-track { background: transparent; }
        .custom-scroll::-webkit-scrollbar-thumb { background: rgba(201,134,42,0.3); border-radius: 2px; }
        .no-scrollbar::-webkit-scrollbar { display: none; }
        .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
      `}</style>
    </div>
  );
}