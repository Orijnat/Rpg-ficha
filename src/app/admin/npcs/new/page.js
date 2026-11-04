"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  Crown,
  HeartPulse,
  Plus,
  Save,
  Shield,
  ShieldAlert,
  Sparkles,
  Sword,
  Tag,
  Trash2,
  UserCheck,
  X,
} from "lucide-react";
import { Card, SectionHeader } from "../../../components/ui";
import { createNpc } from "../../../../lib/api";
import { useAuth } from "../../../context/AuthContext";

const PRESET_TAGS = [
  "Chefe",
  "Elite",
  "Lacaio",
  "Morto-Vivo",
  "Fera",
  "Humanoide",
  "Mágico",
  "Vendedor",
  "Infiltrador",
  "Guarda",
  "Cultista",
];

const PRESET_AVATARS = [
  { label: "Lich", url: "https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=150&auto=format&fit=crop" },
  { label: "Guerreiro Sombrio", url: "https://images.unsplash.com/photo-1579783900882-c0d3dad7b119?w=150&auto=format&fit=crop" },
  { label: "Besta Alada", url: "https://images.unsplash.com/photo-1534447677768-be436bb09401?w=150&auto=format&fit=crop" },
  { label: "Mago Arcano", url: "https://images.unsplash.com/photo-1514539079130-25950c84af65?w=150&auto=format&fit=crop" },
];

export default function NewNpcPage() {
  const router = useRouter();
  const { token, isMaster } = useAuth();

  const [nome, setNome] = useState("");
  const [papel, setPapel] = useState("Inimigo");
  const [descricao, setDescricao] = useState("");
  const [hp, setHp] = useState(25);
  const [hpMax, setHpMax] = useState(25);
  const [ca, setCa] = useState(13);
  const [iniciativa, setIniciativa] = useState(2);
  const [attitude, setAttitude] = useState("Hostil");
  const [status, setStatus] = useState("Ativo");
  const [avatar, setAvatar] = useState("");
  const [tags, setTags] = useState(["Humanoide"]);
  const [customTagInput, setCustomTagInput] = useState("");
  const [acoes, setAcoes] = useState([
    { nome: "Ataque com Arma", descricao: "Acerto +4, alcance 1.5m. Dano: 1d8+2 cortante.", bonus: "+4", dano: "1d8+2" },
  ]);
  const [notasMestre, setNotasMestre] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  if (!isMaster) return null;

  const toggleTag = (tag) => {
    if (tags.includes(tag)) {
      setTags(tags.filter((t) => t !== tag));
    } else {
      setTags([...tags, tag]);
    }
  };

  const addCustomTag = () => {
    if (!customTagInput.trim()) return;
    if (!tags.includes(customTagInput.trim())) {
      setTags([...tags, customTagInput.trim()]);
    }
    setCustomTagInput("");
  };

  const addAction = () => {
    setAcoes([
      ...acoes,
      { nome: "Nova Ação / Habilidade", descricao: "Descrição do efeito ou dano.", bonus: "+0", dano: "1d6" },
    ]);
  };

  const updateAction = (index, patch) => {
    setAcoes(acoes.map((item, i) => (i === index ? { ...item, ...patch } : item)));
  };

  const removeAction = (index) => {
    setAcoes(acoes.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!nome.trim()) {
      setError("O nome do NPC é obrigatório.");
      return;
    }

    setSaving(true);
    setError("");

    try {
      const payload = {
        nome: nome.trim(),
        papel,
        descricao,
        hp: Number(hp),
        hpMax: Number(hpMax),
        ca: Number(ca),
        iniciativa: Number(iniciativa),
        attitude,
        status,
        avatar,
        tags,
        acoes,
        notasMestre,
      };

      await createNpc(payload, token);
      router.push("/admin/personagens");
    } catch (err) {
      setError(err.message);
      setSaving(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between border-b-2 border-primary/40 pb-4">
        <div>
          <span className="text-[10px] font-bold uppercase tracking-[0.3em] text-primary">
            Cadastro Dedicado de Ameaças & NPCs
          </span>
          <h1 className="mt-1 font-serif text-3xl font-black uppercase text-foreground">
            Novo NPC / Monstro
          </h1>
          <p className="text-xs text-muted-foreground">
            Entidade própria do mestre, com estatísticas táticas, tags e atitude.
          </p>
        </div>
        <div className="flex gap-2">
          <Link
            href="/admin/personagens"
            className="flex min-h-11 items-center rounded-lg border border-border px-4 text-xs font-bold uppercase tracking-wider text-muted-foreground hover:border-primary hover:text-primary"
          >
            Cancelar
          </Link>
          <button
            type="submit"
            disabled={saving}
            className="flex min-h-11 items-center gap-2 rounded-lg bg-primary px-5 font-serif text-xs font-bold uppercase tracking-wider text-primary-foreground shadow-lg shadow-primary/20 hover:brightness-110 active:scale-95 disabled:opacity-50"
          >
            <Save size={15} />
            {saving ? "Salvando..." : "Cadastrar NPC"}
          </button>
        </div>
      </div>

      {error && (
        <div className="border border-destructive/40 bg-destructive/10 p-4 text-sm text-destructive-foreground">
          {error}
        </div>
      )}

      <div className="grid gap-6 lg:grid-cols-[1.2fr_0.8fr]">
        {/* Bloco 1: Identidade e Atitude */}
        <Card className="space-y-4">
          <SectionHeader title="Identidade & Atitude" icon={<Crown size={16} />} />

          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-muted-foreground">
                Nome do NPC / Criatura *
              </label>
              <input
                type="text"
                required
                value={nome}
                onChange={(e) => setNome(e.target.value)}
                placeholder="Ex.: Valerius, o Inquisidor"
                className="mt-1 min-h-11 w-full rounded-lg border-2 border-border bg-input-background px-3 text-sm text-foreground outline-none focus:border-primary"
              />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-muted-foreground">
                Título ou Papel
              </label>
              <input
                type="text"
                value={papel}
                onChange={(e) => setPapel(e.target.value)}
                placeholder="Ex.: Chefe da Guilda Negra"
                className="mt-1 min-h-11 w-full rounded-lg border-2 border-border bg-input-background px-3 text-sm text-foreground outline-none focus:border-primary"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-muted-foreground">
                Atitude / Alinhamento
              </label>
              <select
                value={attitude}
                onChange={(e) => setAttitude(e.target.value)}
                className="mt-1 min-h-11 w-full rounded-lg border-2 border-border bg-input-background px-3 text-sm text-foreground outline-none focus:border-primary"
              >
                <option value="Hostil">Hostil (Ameaça / Inimigo)</option>
                <option value="Neutro">Neutro (Intermediário / Povo)</option>
                <option value="Aliado">Aliado (Companheiro de Grupo)</option>
                <option value="Chefe">Chefe (Grande Inimigo de Arco)</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-muted-foreground">
                Status Inicial
              </label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value)}
                className="mt-1 min-h-11 w-full rounded-lg border-2 border-border bg-input-background px-3 text-sm text-foreground outline-none focus:border-primary"
              >
                <option value="Ativo">Ativo / Em Combate</option>
                <option value="Inconsciente">Inconsciente</option>
                <option value="Derrotado">Derrotado / Morto</option>
                <option value="Fugiu">Fugiu</option>
                <option value="Capturado">Capturado</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-muted-foreground">
              Descrição Visual & Comportamento
            </label>
            <textarea
              rows={3}
              value={descricao}
              onChange={(e) => setDescricao(e.target.value)}
              placeholder="Aparência, vestimentas, cicatrizes e maneirismos..."
              className="mt-1 w-full rounded-lg border-2 border-border bg-input-background p-3 text-sm text-foreground outline-none focus:border-primary"
            />
          </div>
        </Card>

        {/* Bloco 2: Estatísticas de Combate */}
        <Card className="space-y-4">
          <SectionHeader title="Combate & Resistência" icon={<ShieldAlert size={16} />} />

          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            <div>
              <label className="block text-center text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                PV Atual
              </label>
              <input
                type="number"
                min="0"
                value={hp}
                onChange={(e) => setHp(Number(e.target.value))}
                className="mt-1 min-h-11 w-full rounded-lg border border-border bg-input-background text-center font-mono text-lg font-bold text-rose-400 outline-none focus:border-primary"
              />
            </div>
            <div>
              <label className="block text-center text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                PV Máximo
              </label>
              <input
                type="number"
                min="1"
                value={hpMax}
                onChange={(e) => setHpMax(Number(e.target.value))}
                className="mt-1 min-h-11 w-full rounded-lg border border-border bg-input-background text-center font-mono text-lg font-bold text-foreground outline-none focus:border-primary"
              />
            </div>
            <div>
              <label className="block text-center text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                Armadura (CA)
              </label>
              <input
                type="number"
                min="0"
                value={ca}
                onChange={(e) => setCa(Number(e.target.value))}
                className="mt-1 min-h-11 w-full rounded-lg border border-border bg-input-background text-center font-mono text-lg font-bold text-primary outline-none focus:border-primary"
              />
            </div>
            <div>
              <label className="block text-center text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                Iniciativa
              </label>
              <input
                type="number"
                value={iniciativa}
                onChange={(e) => setIniciativa(Number(e.target.value))}
                className="mt-1 min-h-11 w-full rounded-lg border border-border bg-input-background text-center font-mono text-lg font-bold text-foreground outline-none focus:border-primary"
              />
            </div>
          </div>

          {/* Tags */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-muted-foreground mb-1.5">
              Tags & Categorias
            </label>
            <div className="flex flex-wrap gap-1.5">
              {PRESET_TAGS.map((tag) => {
                const active = tags.includes(tag);
                return (
                  <button
                    key={tag}
                    type="button"
                    onClick={() => toggleTag(tag)}
                    className={`rounded-full px-2.5 py-0.5 text-xs font-semibold transition ${
                      active
                        ? "bg-primary text-primary-foreground font-bold shadow-sm"
                        : "border border-border bg-secondary/60 text-muted-foreground hover:border-primary/40 hover:text-foreground"
                    }`}
                  >
                    {active ? `✓ ${tag}` : `+ ${tag}`}
                  </button>
                );
              })}
            </div>

            <div className="mt-2 flex gap-2">
              <input
                type="text"
                value={customTagInput}
                onChange={(e) => setCustomTagInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    addCustomTag();
                  }
                }}
                placeholder="Outra tag..."
                className="h-8 flex-1 rounded border border-border bg-input-background px-2 text-xs text-foreground outline-none focus:border-primary"
              />
              <button
                type="button"
                onClick={addCustomTag}
                className="h-8 rounded border border-primary/40 bg-primary/10 px-3 text-xs font-bold text-primary hover:bg-primary/20"
              >
                Adicionar
              </button>
            </div>
          </div>

          {/* Avatar */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-muted-foreground mb-1">
              Avatar do NPC (URL ou Imagem)
            </label>
            <input
              type="url"
              value={avatar}
              onChange={(e) => setAvatar(e.target.value)}
              placeholder="https://exemplo.com/avatar.jpg"
              className="min-h-10 w-full rounded-lg border border-border bg-input-background px-3 text-xs text-foreground outline-none focus:border-primary"
            />
            <div className="mt-2 flex items-center gap-2">
              <span className="text-[10px] text-muted-foreground uppercase font-bold">Presets:</span>
              {PRESET_AVATARS.map((p) => (
                <button
                  key={p.label}
                  type="button"
                  onClick={() => setAvatar(p.url)}
                  className="rounded border border-border bg-secondary px-2 py-0.5 text-[10px] text-muted-foreground hover:border-primary hover:text-foreground"
                >
                  {p.label}
                </button>
              ))}
            </div>
          </div>
        </Card>
      </div>

      {/* Bloco 3: Ações e Golpes */}
      <Card>
        <div className="flex items-center justify-between border-b border-border pb-3">
          <SectionHeader title="Ações, Golpes & Habilidades" icon={<Sword size={16} />} />
          <button
            type="button"
            onClick={addAction}
            className="flex min-h-9 items-center gap-1.5 rounded-lg border border-primary/40 bg-primary/10 px-3 text-xs font-bold text-primary hover:bg-primary/20"
          >
            <Plus size={14} /> Adicionar Ação
          </button>
        </div>

        <div className="mt-4 space-y-3">
          {acoes.map((acao, index) => (
            <div
              key={index}
              className="grid gap-2 rounded-xl border border-border bg-secondary/40 p-3 sm:grid-cols-[1fr_90px_110px_36px]"
            >
              <div className="space-y-1">
                <input
                  type="text"
                  value={acao.nome}
                  onChange={(e) => updateAction(index, { nome: e.target.value })}
                  placeholder="Nome do ataque"
                  className="w-full rounded border border-border bg-input-background px-2 py-1 text-xs font-bold text-foreground outline-none focus:border-primary"
                />
                <input
                  type="text"
                  value={acao.descricao}
                  onChange={(e) => updateAction(index, { descricao: e.target.value })}
                  placeholder="Descrição da ação..."
                  className="w-full rounded border border-border bg-input-background px-2 py-1 text-xs text-muted-foreground outline-none focus:border-primary"
                />
              </div>
              <div>
                <label className="text-[9px] uppercase font-bold text-muted-foreground">Bônus</label>
                <input
                  type="text"
                  value={acao.bonus}
                  onChange={(e) => updateAction(index, { bonus: e.target.value })}
                  placeholder="+4"
                  className="w-full rounded border border-border bg-input-background px-2 py-1 text-center text-xs font-mono text-foreground outline-none focus:border-primary"
                />
              </div>
              <div>
                <label className="text-[9px] uppercase font-bold text-muted-foreground">Dano</label>
                <input
                  type="text"
                  value={acao.dano}
                  onChange={(e) => updateAction(index, { dano: e.target.value })}
                  placeholder="1d8+2"
                  className="w-full rounded border border-border bg-input-background px-2 py-1 text-center text-xs font-mono text-foreground outline-none focus:border-primary"
                />
              </div>
              <div className="flex items-end justify-center">
                <button
                  type="button"
                  onClick={() => removeAction(index)}
                  className="rounded p-1.5 text-muted-foreground hover:bg-destructive/15 hover:text-destructive"
                  title="Remover ação"
                >
                  <Trash2 size={15} />
                </button>
              </div>
            </div>
          ))}
        </div>
      </Card>

      {/* Bloco 4: Notas Privadas do Mestre */}
      <Card>
        <SectionHeader title="Segredos & Táticas do Mestre (Confidencial)" icon={<Sparkles size={16} />} />
        <p className="mt-1 text-xs text-muted-foreground">
          Notas estritamente privadas: fraquezas, intenções secretas, itens deixados após a morte e gatilhos de comportamento.
        </p>
        <textarea
          rows={4}
          value={notasMestre}
          onChange={(e) => setNotasMestre(e.target.value)}
          placeholder="Ex.: Se ficar abaixo de 10 PV, tentará negociar ou fugir pela passagem secreta..."
          className="mt-3 w-full rounded-lg border-2 border-border bg-input-background p-3 text-sm text-foreground outline-none focus:border-primary"
        />
      </Card>
    </form>
  );
}
