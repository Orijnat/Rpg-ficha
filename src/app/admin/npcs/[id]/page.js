"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import {
  Clock,
  Copy,
  Crown,
  HeartPulse,
  Plus,
  Save,
  Shield,
  ShieldAlert,
  Sparkles,
  Sword,
  Trash2,
} from "lucide-react";
import { Card, SectionHeader } from "../../../components/ui";
import ConfirmDialog from "../../../components/admin/ConfirmDialog";
import { deleteNpc, duplicateNpc, fetchNpcById, updateNpc } from "../../../../lib/api";
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

export default function EditNpcPage() {
  const { id } = useParams();
  const router = useRouter();
  const { token, isMaster } = useAuth();

  const [npc, setNpc] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [duplicating, setDuplicating] = useState(false);
  const [error, setError] = useState("");
  const [successMsg, setSuccessMsg] = useState("");
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [isVariantOpen, setIsVariantOpen] = useState(false);
  const [variantSuffix, setVariantSuffix] = useState(" (Elite)");
  const [variantHpMultiplier, setVariantHpMultiplier] = useState(1.5);
  const [customTagInput, setCustomTagInput] = useState("");

  useEffect(() => {
    if (!id || !isMaster) return;
    fetchNpcById(id, token)
      .then((data) => {
        setNpc(data);
        setLoading(false);
      })
      .catch((err) => {
        setError(err.message);
        setLoading(false);
      });
  }, [id, isMaster, token]);

  if (!isMaster) return null;
  if (loading) return <div className="p-8 text-center text-sm text-muted-foreground">Carregando NPC...</div>;
  if (!npc) return <div className="p-8 text-center text-sm text-rose-400">{error || "NPC não encontrado."}</div>;

  const updateField = (patch) => setNpc((prev) => ({ ...prev, ...patch }));
  const updateExtras = (patch) =>
    setNpc((prev) => ({
      ...prev,
      dadosExtras: { ...(prev.dadosExtras || {}), ...patch },
    }));

  const toggleTag = (tag) => {
    const currentTags = npc.dadosExtras?.tags || [];
    const nextTags = currentTags.includes(tag)
      ? currentTags.filter((t) => t !== tag)
      : [...currentTags, tag];
    updateExtras({ tags: nextTags });
  };

  const addCustomTag = () => {
    if (!customTagInput.trim()) return;
    const currentTags = npc.dadosExtras?.tags || [];
    if (!currentTags.includes(customTagInput.trim())) {
      updateExtras({ tags: [...currentTags, customTagInput.trim()] });
    }
    setCustomTagInput("");
  };

  const addAction = () => {
    const current = npc.dadosExtras?.acoes || [];
    updateExtras({
      acoes: [...current, { nome: "Novo Golpe", descricao: "Efeito do golpe.", bonus: "+4", dano: "1d8+2" }],
    });
  };

  const updateAction = (index, patch) => {
    const current = npc.dadosExtras?.acoes || [];
    updateExtras({
      acoes: current.map((item, i) => (i === index ? { ...item, ...patch } : item)),
    });
  };

  const removeAction = (index) => {
    const current = npc.dadosExtras?.acoes || [];
    updateExtras({ acoes: current.filter((_, i) => i !== index) });
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError("");
    setSuccessMsg("");

    try {
      const payload = {
        nome: npc.nome,
        papel: npc.papel,
        descricao: npc.descricao,
        hp: Number(npc.hp),
        hpMax: Number(npc.hpMax),
        ca: Number(npc.dadosExtras?.ca || 10),
        iniciativa: Number(npc.dadosExtras?.iniciativa || 0),
        avatar: npc.dadosExtras?.avatar || "",
        tags: npc.dadosExtras?.tags || [],
        status: npc.dadosExtras?.status || "Ativo",
        attitude: npc.dadosExtras?.attitude || "Hostil",
        acoes: npc.dadosExtras?.acoes || [],
        notasMestre: npc.dadosExtras?.notasMestre || "",
      };

      const saved = await updateNpc(id, payload, token);
      setNpc(saved);
      setSuccessMsg("NPC atualizado com sucesso!");
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  const handleDuplicate = async () => {
    setDuplicating(true);
    setError("");
    try {
      const novo = await duplicateNpc(
        id,
        {
          variantSuffix,
          hpMultiplier: Number(variantHpMultiplier),
          addTags: ["Variante", "Elite"],
        },
        token
      );
      router.push(`/admin/npcs/${novo.id}`);
    } catch (err) {
      setError(err.message);
      setDuplicating(false);
    }
  };

  const handleDelete = async () => {
    try {
      await deleteNpc(id, token);
      router.push("/admin/personagens");
    } catch (err) {
      setError(err.message);
      setIsDeleteOpen(false);
    }
  };

  const lastMod = npc.dadosExtras?.lastModifiedBy;
  const lastModAt = npc.dadosExtras?.lastModifiedAt;

  return (
    <form onSubmit={handleSave} className="space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between border-b-2 border-primary/40 pb-4">
        <div>
          <span className="text-[10px] font-bold uppercase tracking-[0.3em] text-primary">
            Gestão & Ficha Administrativa
          </span>
          <h1 className="mt-1 font-serif text-3xl font-black uppercase text-foreground">
            {npc.nome}
          </h1>
          {lastMod && (
            <p className="mt-1 flex items-center gap-1.5 text-xs text-muted-foreground">
              <Clock size={12} className="text-primary" />
              Última alteração por <strong className="text-foreground">{lastMod.name}</strong> em{" "}
              {lastModAt ? new Date(lastModAt).toLocaleString("pt-BR") : "data recente"}
            </p>
          )}
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={() => setIsVariantOpen(true)}
            className="flex min-h-11 items-center gap-1.5 rounded-lg border border-primary/40 bg-primary/10 px-3 text-xs font-bold uppercase tracking-wider text-primary hover:bg-primary/20"
          >
            <Copy size={14} /> Duplicar / Criar Variante
          </button>
          <button
            type="button"
            onClick={() => setIsDeleteOpen(true)}
            className="flex min-h-11 items-center gap-1.5 rounded-lg border border-rose-500/30 bg-rose-950/20 px-3 text-xs font-bold uppercase tracking-wider text-rose-400 hover:bg-rose-950/40"
          >
            <Trash2 size={14} /> Excluir
          </button>
          <button
            type="submit"
            disabled={saving}
            className="flex min-h-11 items-center gap-2 rounded-lg bg-primary px-5 font-serif text-xs font-bold uppercase tracking-wider text-primary-foreground shadow-lg shadow-primary/20 hover:brightness-110 active:scale-95 disabled:opacity-50"
          >
            <Save size={15} />
            {saving ? "Salvando..." : "Salvar Alterações"}
          </button>
        </div>
      </div>

      {successMsg && (
        <div className="border border-emerald-500/40 bg-emerald-950/20 p-3 text-sm text-emerald-300">
          {successMsg}
        </div>
      )}
      {error && (
        <div className="border border-destructive/40 bg-destructive/10 p-4 text-sm text-destructive-foreground">
          {error}
        </div>
      )}

      <div className="grid gap-6 lg:grid-cols-[1.2fr_0.8fr]">
        <Card className="space-y-4">
          <SectionHeader title="Identidade & Comportamento" icon={<Crown size={16} />} />

          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-muted-foreground">
                Nome
              </label>
              <input
                type="text"
                value={npc.nome}
                onChange={(e) => updateField({ nome: e.target.value })}
                className="mt-1 min-h-11 w-full rounded-lg border-2 border-border bg-input-background px-3 text-sm text-foreground outline-none focus:border-primary"
              />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-muted-foreground">
                Papel / Título
              </label>
              <input
                type="text"
                value={npc.papel || ""}
                onChange={(e) => updateField({ papel: e.target.value })}
                className="mt-1 min-h-11 w-full rounded-lg border-2 border-border bg-input-background px-3 text-sm text-foreground outline-none focus:border-primary"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-muted-foreground">
                Atitude
              </label>
              <select
                value={npc.dadosExtras?.attitude || "Hostil"}
                onChange={(e) => updateExtras({ attitude: e.target.value })}
                className="mt-1 min-h-11 w-full rounded-lg border-2 border-border bg-input-background px-3 text-sm text-foreground outline-none focus:border-primary"
              >
                <option value="Hostil">Hostil (Ameaça)</option>
                <option value="Neutro">Neutro (Intermediário)</option>
                <option value="Aliado">Aliado (Companheiro)</option>
                <option value="Chefe">Chefe (Boss)</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-muted-foreground">
                Status Operacional
              </label>
              <select
                value={npc.dadosExtras?.status || "Ativo"}
                onChange={(e) => updateExtras({ status: e.target.value })}
                className="mt-1 min-h-11 w-full rounded-lg border-2 border-border bg-input-background px-3 text-sm text-foreground outline-none focus:border-primary"
              >
                <option value="Ativo">Ativo</option>
                <option value="Inconsciente">Inconsciente</option>
                <option value="Derrotado">Derrotado / Morto</option>
                <option value="Fugiu">Fugiu</option>
                <option value="Capturado">Capturado</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-muted-foreground">
              Descrição
            </label>
            <textarea
              rows={3}
              value={npc.descricao || ""}
              onChange={(e) => updateField({ descricao: e.target.value })}
              className="mt-1 w-full rounded-lg border-2 border-border bg-input-background p-3 text-sm text-foreground outline-none focus:border-primary"
            />
          </div>
        </Card>

        <Card className="space-y-4">
          <SectionHeader title="Combate & Recursos" icon={<ShieldAlert size={16} />} />

          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            <div>
              <label className="block text-center text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                PV Atual
              </label>
              <input
                type="number"
                value={npc.hp}
                onChange={(e) => updateField({ hp: Number(e.target.value) })}
                className="mt-1 min-h-11 w-full rounded-lg border border-border bg-input-background text-center font-mono text-lg font-bold text-rose-400 outline-none focus:border-primary"
              />
            </div>
            <div>
              <label className="block text-center text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                PV Máx
              </label>
              <input
                type="number"
                value={npc.hpMax}
                onChange={(e) => updateField({ hpMax: Number(e.target.value) })}
                className="mt-1 min-h-11 w-full rounded-lg border border-border bg-input-background text-center font-mono text-lg font-bold text-foreground outline-none focus:border-primary"
              />
            </div>
            <div>
              <label className="block text-center text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                CA
              </label>
              <input
                type="number"
                value={npc.dadosExtras?.ca ?? 10}
                onChange={(e) => updateExtras({ ca: Number(e.target.value) })}
                className="mt-1 min-h-11 w-full rounded-lg border border-border bg-input-background text-center font-mono text-lg font-bold text-primary outline-none focus:border-primary"
              />
            </div>
            <div>
              <label className="block text-center text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                Iniciativa
              </label>
              <input
                type="number"
                value={npc.dadosExtras?.iniciativa ?? 0}
                onChange={(e) => updateExtras({ iniciativa: Number(e.target.value) })}
                className="mt-1 min-h-11 w-full rounded-lg border border-border bg-input-background text-center font-mono text-lg font-bold text-foreground outline-none focus:border-primary"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-muted-foreground mb-1.5">
              Tags
            </label>
            <div className="flex flex-wrap gap-1.5">
              {PRESET_TAGS.map((tag) => {
                const active = (npc.dadosExtras?.tags || []).includes(tag);
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

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-muted-foreground mb-1">
              Avatar URL
            </label>
            <input
              type="url"
              value={npc.dadosExtras?.avatar || ""}
              onChange={(e) => updateExtras({ avatar: e.target.value })}
              className="min-h-10 w-full rounded-lg border border-border bg-input-background px-3 text-xs text-foreground outline-none focus:border-primary"
            />
          </div>
        </Card>
      </div>

      <Card>
        <div className="flex items-center justify-between border-b border-border pb-3">
          <SectionHeader title="Ações & Ataques" icon={<Sword size={16} />} />
          <button
            type="button"
            onClick={addAction}
            className="flex min-h-9 items-center gap-1.5 rounded-lg border border-primary/40 bg-primary/10 px-3 text-xs font-bold text-primary hover:bg-primary/20"
          >
            <Plus size={14} /> Adicionar Ação
          </button>
        </div>

        <div className="mt-4 space-y-3">
          {(npc.dadosExtras?.acoes || []).map((acao, index) => (
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
                >
                  <Trash2 size={15} />
                </button>
              </div>
            </div>
          ))}
        </div>
      </Card>

      <Card>
        <SectionHeader title="Segredos & Táticas do Mestre (Confidencial)" icon={<Sparkles size={16} />} />
        <textarea
          rows={4}
          value={npc.dadosExtras?.notasMestre || ""}
          onChange={(e) => updateExtras({ notasMestre: e.target.value })}
          placeholder="Fraquezas, táticas secretas e tesouro dropado..."
          className="mt-3 w-full rounded-lg border-2 border-border bg-input-background p-3 text-sm text-foreground outline-none focus:border-primary"
        />
      </Card>

      {/* Modal de Duplicação e Criação de Variante */}
      {isVariantOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-md">
          <div className="w-full max-w-md rounded-2xl border-2 border-primary/50 bg-[#0f1118] p-6 shadow-2xl">
            <h3 className="font-serif text-lg font-bold uppercase text-foreground">
              Criar Variante do NPC
            </h3>
            <p className="mt-1 text-xs text-muted-foreground">
              Gera um clone independente para você ajustar dificuldade e estatísticas.
            </p>

            <div className="mt-4 space-y-3">
              <div>
                <label className="block text-xs font-semibold text-muted-foreground">
                  Sufixo do Nome da Variante:
                </label>
                <input
                  type="text"
                  value={variantSuffix}
                  onChange={(e) => setVariantSuffix(e.target.value)}
                  placeholder="Ex.: (Alfa), (Elite), (Chefe)"
                  className="mt-1 min-h-10 w-full rounded border border-border bg-input-background px-3 text-sm text-foreground outline-none focus:border-primary"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-muted-foreground">
                  Multiplicador de PV ({variantHpMultiplier}x = {Math.round(npc.hpMax * variantHpMultiplier)} PV):
                </label>
                <input
                  type="range"
                  min="0.5"
                  max="3"
                  step="0.1"
                  value={variantHpMultiplier}
                  onChange={(e) => setVariantHpMultiplier(Number(e.target.value))}
                  className="mt-2 w-full accent-primary"
                />
              </div>
            </div>

            <div className="mt-6 flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setIsVariantOpen(false)}
                className="rounded-lg border border-border px-4 py-2 text-xs font-bold uppercase text-muted-foreground hover:bg-secondary"
              >
                Cancelar
              </button>
              <button
                type="button"
                disabled={duplicating}
                onClick={handleDuplicate}
                className="rounded-lg bg-primary px-4 py-2 text-xs font-bold uppercase text-primary-foreground hover:brightness-110 disabled:opacity-50"
              >
                {duplicating ? "Clonando..." : "Criar Variante"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Confirmação de Exclusão */}
      <ConfirmDialog
        isOpen={isDeleteOpen}
        title={`Excluir NPC "${npc.nome}"?`}
        message="Esta ação é definitiva e removerá este NPC de todos os encontros da campanha. Esta exclusão será registrada na trilha de auditoria."
        requireTypedText={npc.nome}
        onConfirm={handleDelete}
        onCancel={() => setIsDeleteOpen(false)}
      />
    </form>
  );
}
