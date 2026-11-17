"use client";

import { useEffect, useMemo, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { Check, Crown, HeartPulse, LoaderCircle, Save, Shield, Sparkles, Trash2 } from "lucide-react";
import { fetchCharacterFromBackend, updateCharacterOnBackend, listRaces, listClasses } from "../../../../../lib/api";
import { DEFAULT_RACES, formatRaceBonus, addRaceBonus, subtractRaceBonus } from "../../../../../lib/races";
import { DEFAULT_CLASSES, findSelectedClass } from "../../../../../lib/classes";
import { hitDieMax } from "../../../../../lib/leveling";
import { useAuth } from "../../../../context/AuthContext";

const ATTRIBUTES = ["FOR", "DES", "CON", "SAB", "ESP", "CAR", "INT"];
const ATTRIBUTE_LABELS = { FOR: "Força", DES: "Destreza", CON: "Constituição", SAB: "Sabedoria", ESP: "Espírito", CAR: "Carisma", INT: "Inteligência" };

function readCapacity(character) {
  return character?.dadosExtras?.inventoryCapacity ?? character?.inventoryCapacity ?? 20;
}

function normalizeCharacter(character) {
  const source = character || {};
  const skills = Array.isArray(source.pericias) ? source.pericias : (source.skills || []);
  const inventory = Array.isArray(source.itensInventario) ? source.itensInventario : (source.inventory || []);
  return {
    ...source,
    ...Object.fromEntries(ATTRIBUTES.map((key) => [key, source[key] ?? source.attributes?.[key] ?? 10])),
    skills: skills.map((skill) => ({ ...skill, trained: Boolean(skill.trained), bonus: Number(skill.bonus || 0) })),
    inventory: inventory.map((item) => ({ ...item, qty: Math.max(0, Number(item.qty ?? item.quantidade ?? 1)) })),
    inventoryCapacity: readCapacity(source),
    customClass: source.customClass ?? source.dadosExtras?.customClass ?? "",
  };
}

export default function MasterCharacterSheet() {
  const { id } = useParams();
  const router = useRouter();
  const { token, isMaster, loading: authLoading } = useAuth();
  const [character, setCharacter] = useState(null);
  const [racas, setRacas] = useState(DEFAULT_RACES);
  const [classes, setClasses] = useState(DEFAULT_CLASSES);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    if (authLoading || !isMaster || !id) return;
    listRaces().then((rows) => {
      if (Array.isArray(rows) && rows.length > 0) setRacas(rows);
    }).catch(() => {});
    listClasses().then((rows) => {
      if (Array.isArray(rows) && rows.length > 0) setClasses(rows);
    }).catch(() => {});
    fetchCharacterFromBackend(id, token)
      .then((data) => setCharacter(normalizeCharacter(data)))
      .catch((loadError) => setError(loadError.message))
      .finally(() => setLoading(false));
  }, [authLoading, id, isMaster, token]);

  const carriedItems = useMemo(
    () => (character?.inventory || []).reduce((total, item) => total + Number(item.qty || 0), 0),
    [character],
  );

  const update = (patch) => setCharacter((current) => ({ ...current, ...patch }));
  const updateRules = (patch) => setCharacter((current) => ({
    ...current,
    dadosExtras: { ...(current.dadosExtras || {}), ...patch },
  }));
  const updateSkill = (index, patch) => update({ skills: character.skills.map((skill, itemIndex) => itemIndex === index ? { ...skill, ...patch } : skill) });
  const updateInventory = (index, patch) => update({ inventory: character.inventory.map((item, itemIndex) => itemIndex === index ? { ...item, ...patch } : item) });
  const addInventory = () => update({ inventory: [...character.inventory, { id: `item-${Date.now()}`, name: "Novo item", qty: 1 }] });
  const removeInventory = (index) => update({ inventory: character.inventory.filter((_, itemIndex) => itemIndex !== index) });
  const uuidRe = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
  const currentRaceId = racas.find((raca) => raca.id === character?.raceId || raca.slug === character?.dadosExtras?.race || raca.slug === character?.race)?.id ?? "";
  const currentClassId = classes.find((classe) => classe.id === character?.classId || classe.slug === character?.dadosExtras?.class || classe.slug === character?.classSlug)?.id ?? "";
  const currentRace = racas.find((raca) => raca.id === currentRaceId || raca.slug === character?.dadosExtras?.race) ?? null;
  const flatAttributes = (source) => Object.fromEntries(ATTRIBUTES.map((key) => [key, Number(source[key] ?? source.attributes?.[key] ?? 10)]));

  const handleRaceChange = (event) => {
    const value = event.target.value;
    const option = value ? racas.find((raca) => raca.id === value) : null;
    setCharacter((current) => {
      // Troca de raça: subtrai o bônus da raça anterior e soma o da nova (status nunca acumulam bônus de 2 raças).
      const baseAttrs = flatAttributes(current);
      const afterRemove = currentRace ? subtractRaceBonus(baseAttrs, currentRace) : baseAttrs;
      const finalAttrs = option ? addRaceBonus(afterRemove, option) : afterRemove;
      return {
        ...current,
        // raceId só quando for UUID (API); senão o backend resolve pelo slug `race`
        raceId: option ? (uuidRe.test(String(option.id)) ? option.id : undefined) : null,
        race: option?.slug ?? null,
        ...finalAttrs,
        attributes: { ...(current.attributes || {}), ...finalAttrs },
        dadosExtras: {
          ...(current.dadosExtras || {}),
          race: option?.slug ?? null,
        },
      };
    });
  };

  const handleClassChange = (event) => {
    const value = event.target.value;
    const option = value ? classes.find((classe) => classe.id === value) : null;
    setCharacter((current) => {
      const heroLevel = Math.max(1, Number(current.level) || 1);
      // A classe define o Dado de Vida; a vida base inicial (nível 1) é o máximo do dado.
      const initialHp = option && heroLevel <= 1 ? hitDieMax(option.hitDie, 8) : null;
      return {
        ...current,
        classId: option ? (uuidRe.test(String(option.id)) ? option.id : undefined) : null,
        class: option?.slug ?? null,
        ...(initialHp ? { hp: initialHp, hpMax: initialHp } : {}),
        dadosExtras: {
          ...(current.dadosExtras || {}),
          class: option?.slug ?? null,
          hitDie: option?.hitDie ?? current.dadosExtras?.hitDie ?? "1d8",
        },
      };
    });
  };

  async function save(event) {
    event.preventDefault();
    const hitDieValue = (character?.dadosExtras?.hitDie || "").trim();
    if (hitDieValue && !/^(?:[1-9]\d{0,1})?d(?:4|6|8|10|12|20)$/i.test(hitDieValue)) {
      setError("Dado de vida inválido. Use o formato ex.: 1d10 (d4, d6, d8, d10, d12 ou d20).");
      return;
    }
    setSaving(true);
    setMessage("");
    setError("");
    try {
      const payload = {
        ...character,
        dadosExtras: {
          ...(character.dadosExtras || {}),
          inventoryCapacity: Number(character.inventoryCapacity),
          sharedWithPlayers: Boolean(character.dadosExtras?.sharedWithPlayers),
        },
        itensInventario: character.inventory,
        pericias: character.skills,
      };
      const saved = await updateCharacterOnBackend(id, payload, token);
      setCharacter(normalizeCharacter(saved));
      setMessage("Ficha do jogador atualizada.");
    } catch (saveError) {
      setError(saveError.message);
    } finally {
      setSaving(false);
    }
  }

  if (authLoading || loading) return <div className="p-8 text-sm text-muted-foreground">Carregando ficha do jogador...</div>;
  if (!isMaster) return null;
  if (!character) return <div className="p-8 text-sm text-destructive">{error || "Personagem não encontrado."}</div>;

  return (
    <form onSubmit={save} className="min-h-screen bg-background px-4 py-6 text-foreground sm:px-8 lg:px-12">
      <div className="mx-auto max-w-7xl space-y-5">
        <header className="border-b-2 border-primary/40 bg-card px-5 py-5 shadow-xl shadow-black/20 sm:px-7">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <div className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.3em] text-primary"><Crown size={14} /> Ficha sob gestão do mestre</div>
              <h1 className="mt-2 font-serif text-3xl font-black uppercase tracking-[0.08em] sm:text-4xl">{character.name}</h1>
              <p className="mt-1 text-sm text-muted-foreground">Aba administrativa · alterações aplicadas diretamente ao personagem do jogador.</p>
            </div>
            <div className="flex gap-2">
              <button type="button" onClick={() => router.back()} className="min-h-11 border border-border px-4 py-2 text-xs font-bold uppercase tracking-wide text-muted-foreground hover:border-primary hover:text-primary">Voltar</button>
              <button type="submit" disabled={saving} className="flex min-h-11 items-center gap-2 bg-primary px-4 py-2 text-xs font-bold uppercase tracking-wide text-primary-foreground disabled:opacity-60">
                {saving ? <LoaderCircle size={15} className="animate-spin" /> : <Save size={15} />} Salvar ficha
              </button>
            </div>
          </div>
        </header>

        {message && <p className="flex items-center gap-2 border border-emerald-400/30 bg-emerald-950/30 p-3 text-sm text-emerald-200"><Check size={16} /> {message}</p>}
        {error && <p className="border border-destructive/30 bg-destructive/10 p-3 text-sm text-destructive-foreground">{error}</p>}

        {/* Compartilhar este herói com a mesa */}
        <label className="flex cursor-pointer items-center justify-between gap-3 border-2 border-primary/25 bg-primary/5 p-4 transition hover:border-primary/50">
          <span className="flex flex-col">
            <span className="text-xs font-bold uppercase tracking-wider text-primary">Compartilhar com a mesa</span>
            <span className="mt-0.5 text-[10px] text-muted-foreground">Jogadores da campanha veem esta ficha (somente leitura) em Mundo &gt; Fichas Compartilhadas.</span>
          </span>
          <input
            type="checkbox"
            checked={Boolean(character.dadosExtras?.sharedWithPlayers)}
            onChange={(e) => updateRules({ sharedWithPlayers: e.target.checked })}
            className="h-5 w-5 accent-primary"
            aria-label="Compartilhar este herói com os jogadores da campanha"
          />
        </label>

        <section className="grid gap-4 lg:grid-cols-[1.2fr_0.8fr]">
          <div className="border-2 border-primary/25 bg-card p-5">
            <div className="mb-4 flex items-center gap-2 font-serif text-lg font-bold"><Shield size={18} className="text-primary" /> Identidade e vitalidade</div>
            <div className="grid gap-3 sm:grid-cols-2">
              {[
                ["name", "Nome"], ["job", "Classe base"], ["customClass", "Classe customizada"], ["level", "Nível"], ["hp", "HP atual"], ["hpMax", "HP máximo"],
              ].map(([key, label]) => (
                <label key={key} className="text-xs font-bold uppercase tracking-wide text-muted-foreground">
                  {label}
                  <input type={["level", "hp", "hpMax"].includes(key) ? "number" : "text"} value={character[key] ?? ""} onChange={(event) => update({ [key]: ["level", "hp", "hpMax"].includes(key) ? Number(event.target.value) : event.target.value })} className="mt-1 min-h-11 w-full border border-border bg-input-background px-3 text-sm text-foreground outline-none focus:border-primary" />
                </label>
              ))}
            </div>
          </div>
          <div className="border-2 border-rose-400/25 bg-card p-5">
            <div className="mb-4 flex items-center gap-2 font-serif text-lg font-bold"><HeartPulse size={18} className="text-rose-300" /> Capacidade de carga</div>
            <label className="text-xs font-bold uppercase tracking-wide text-muted-foreground">Quantidade máxima de itens
              <input type="number" min="0" value={character.inventoryCapacity} onChange={(event) => update({ inventoryCapacity: Math.max(0, Number(event.target.value)) })} className="mt-1 min-h-12 w-full border border-border bg-input-background px-3 text-xl font-bold text-foreground outline-none focus:border-primary" />
            </label>
            <p className={`mt-4 text-sm ${carriedItems > character.inventoryCapacity ? "text-rose-300" : "text-muted-foreground"}`}>Carga atual: <strong>{carriedItems}</strong> / {character.inventoryCapacity} unidades</p>
          </div>
        </section>

        <section className="border-2 border-primary/30 bg-card p-5">
          <div className="mb-4 flex items-center gap-2 font-serif text-lg font-bold"><Shield size={18} className="text-primary" /> Classe (somente o mestre altera)</div>
          <div className="grid gap-3 sm:grid-cols-[1fr_auto] sm:items-end">
            <label className="text-xs font-bold uppercase tracking-wide text-muted-foreground">Classe do herói
              <select value={currentClassId} onChange={handleClassChange} className="mt-1 min-h-11 w-full border border-border bg-input-background px-3 text-sm text-foreground outline-none focus:border-primary" aria-label="Classe do herói (mestre)">
                <option value="">Sem classe</option>
                {classes.map((classe) => <option key={classe.id} value={classe.id}>{classe.name} ({classe.hitDie})</option>)}
              </select>
            </label>
            <p className="text-[10px] leading-snug text-muted-foreground sm:max-w-[260px]">O jogador só escolhe a classe uma única vez na ficha. A classe define o Dado de Vida (rolado ao subir de nível) e as habilidades de nível — em nível 1, a Vida máxima também é ajustada ao máximo do dado.</p>
          </div>
        </section>

        <section className="border-2 border-amber-400/30 bg-card p-5">
          <div className="mb-4 flex items-center gap-2 font-serif text-lg font-bold"><Shield size={18} className="text-amber-300" /> Raça (somente o mestre altera)</div>
          <div className="grid gap-3 sm:grid-cols-[1fr_auto] sm:items-end">
            <label className="text-xs font-bold uppercase tracking-wide text-muted-foreground">Raça do herói
              <select value={currentRaceId} onChange={handleRaceChange} className="mt-1 min-h-11 w-full border border-border bg-input-background px-3 text-sm text-foreground outline-none focus:border-primary" aria-label="Raça do herói (mestre)">
                <option value="">Sem raça</option>
                {racas.map((raca) => <option key={raca.id} value={raca.id}>{raca.name} ({formatRaceBonus(raca)})</option>)}
              </select>
            </label>
            <p className="text-[10px] leading-snug text-muted-foreground sm:max-w-[260px]">O jogador só escolhe a raça uma única vez na ficha. Alterar aqui remove o bônus da raça anterior (5e clássico) e aplica o da nova sobre os status atuais.</p>
          </div>
        </section>

        <section className="border-2 border-primary/25 bg-card p-5">
          <div className="mb-4 flex items-center gap-2 font-serif text-lg font-bold"><Sparkles size={18} className="text-primary" /> Recursos e regras da classe</div>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {[
              ["insanityMax", "Insanidade máxima"], ["insanityCurrent", "Insanidade atual"],
              ["bpMax", "BP máximo"], ["bpCurrent", "BP atual"],
              ["peMax", "PE máximo"], ["peCurrent", "PE atual"],
              ["armorClass", "Classe de armadura"], ["initiative", "Iniciativa"],
            ].map(([key, label]) => (
              <label key={key} className="text-xs font-bold uppercase tracking-wide text-muted-foreground">
                {label}
                <input type="number" value={Number(character.dadosExtras?.[key] || 0)} onChange={(event) => updateRules({ [key]: Number(event.target.value) })} className="mt-1 min-h-11 w-full border border-border bg-input-background px-3 text-sm text-foreground outline-none focus:border-primary" />
              </label>
            ))}
            <label className="text-xs font-bold uppercase tracking-wide text-muted-foreground">Dado de vida
              <input value={character.dadosExtras?.hitDie || ""} onChange={(event) => updateRules({ hitDie: event.target.value })} placeholder="Ex.: 1d10" list="hit-die-options" className="mt-1 min-h-11 w-full border border-border bg-input-background px-3 text-sm text-foreground outline-none focus:border-primary" />
              <datalist id="hit-die-options">
                {["1d4", "1d6", "1d8", "1d10", "1d12", "1d20"].map((die) => (
                  <option key={die} value={die} />
                ))}
              </datalist>
            </label>
          </div>
        </section>

        <section className="border-2 border-primary/25 bg-card p-5">
          <div className="mb-4 flex items-center gap-2 font-serif text-lg font-bold"><Sparkles size={18} className="text-primary" /> Atributos do personagem</div>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 lg:grid-cols-7">
            {ATTRIBUTES.map((key) => <label key={key} className="text-center text-[10px] font-bold uppercase tracking-wide text-muted-foreground">{key}<input type="number" value={character[key]} onChange={(event) => update({ [key]: Number(event.target.value) })} aria-label={ATTRIBUTE_LABELS[key]} className="mt-1 min-h-12 w-full border border-border bg-input-background text-center text-lg font-bold text-foreground outline-none focus:border-primary" /></label>)}
          </div>
        </section>

        <section className="border-2 border-primary/25 bg-card p-5">
          <div className="mb-4 flex items-center justify-between gap-3"><div className="flex items-center gap-2 font-serif text-lg font-bold"><Sparkles size={18} className="text-primary" /> Perícias gerenciadas pelo mestre</div><span className="text-xs text-muted-foreground">{character.skills.length} perícias</span></div>
          <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
            {character.skills.map((skill, index) => <div key={`${skill.name || "skill"}-${index}`} className="border border-border bg-secondary/50 p-3"><div className="font-semibold text-foreground">{skill.name || skill.nome || `Perícia ${index + 1}`}</div><div className="mt-2 flex items-center gap-3"><label className="flex items-center gap-2 text-xs text-muted-foreground"><input type="checkbox" checked={Boolean(skill.trained)} onChange={(event) => updateSkill(index, { trained: event.target.checked })} /> Treinado</label><label className="flex items-center gap-2 text-xs text-muted-foreground">Bônus<input type="number" value={skill.bonus || 0} onChange={(event) => updateSkill(index, { bonus: Number(event.target.value) })} className="h-9 w-20 border border-border bg-input-background px-2 text-center text-foreground" /></label></div></div>)}
          </div>
        </section>

        <section className="border-2 border-primary/25 bg-card p-5">
          <div className="mb-4 flex items-center justify-between gap-3"><div className="flex items-center gap-2 font-serif text-lg font-bold"><Shield size={18} className="text-primary" /> Inventário controlado</div><button type="button" onClick={addInventory} className="min-h-10 border border-primary/45 px-3 text-xs font-bold uppercase tracking-wide text-primary hover:bg-primary/10">Adicionar item</button></div>
          <div className="space-y-2">{character.inventory.map((item, index) => <div key={item.id || index} className="grid gap-2 border border-border bg-secondary/50 p-3 sm:grid-cols-[1fr_120px_42px]"><input value={item.name || item.nome || ""} onChange={(event) => updateInventory(index, { name: event.target.value })} placeholder="Nome do item" className="min-h-10 border border-border bg-input-background px-3 text-sm text-foreground outline-none focus:border-primary" /><input type="number" min="0" value={item.qty ?? 0} onChange={(event) => updateInventory(index, { qty: Math.max(0, Number(event.target.value)) })} className="min-h-10 border border-border bg-input-background px-3 text-center text-sm text-foreground outline-none focus:border-primary" /><button type="button" onClick={() => removeInventory(index)} className="flex min-h-10 items-center justify-center text-destructive hover:bg-destructive/15" title="Remover item"><Trash2 size={15} /></button></div>)}</div>
        </section>
      </div>
    </form>
  );
}
