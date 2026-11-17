"use client";

import { useEffect, useState } from "react";
import { BookOpen, Check, LoaderCircle, Pencil, Plus, Shield, Sparkles, Trash2 } from "lucide-react";
import { Card, SectionHeader } from "../../components/ui";
import ClassFormModal from "../../components/admin/ClassFormModal";
import ConfirmDialog from "../../components/admin/ConfirmDialog";
import { listClasses, createClassOnBackend, updateClassOnBackend, deleteClassOnBackend } from "../../../lib/api";
import { useAuth } from "../../context/AuthContext";

export default function AdminClasses() {
  const { token, isMaster, loading: authLoading } = useAuth();
  const [classes, setClasses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [msg, setMsg] = useState("");
  const [modal, setModal] = useState({ isOpen: false, classe: null });
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (authLoading || !isMaster) return undefined;
    let active = true;
    listClasses()
      .then((rows) => {
        if (!active) return;
        setClasses(Array.isArray(rows) ? rows : []);
      })
      .catch((loadError) => active && setError(loadError.message))
      .finally(() => active && setLoading(false));
    return () => {
      active = false;
    };
  }, [authLoading, isMaster]);

  if (!isMaster) return null;

  const handleSave = async (payload) => {
    setSaving(true);
    setError("");
    try {
      if (modal.classe?.id) {
        await updateClassOnBackend(modal.classe.id, payload, token);
        setMsg(`Classe "${payload.nome}" atualizada. As fichas que a usam já veem as mudanças.`);
      } else {
        await createClassOnBackend(payload, token);
        setMsg(`Classe "${payload.nome}" criada no catálogo global.`);
      }
      setModal({ isOpen: false, classe: null });
      const rows = await listClasses();
      setClasses(Array.isArray(rows) ? rows : []);
    } catch (saveError) {
      setError(saveError.message || "Não foi possível salvar a classe.");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    setSaving(true);
    setError("");
    try {
      await deleteClassOnBackend(deleteTarget.id, token);
      setClasses((current) => current.filter((classe) => classe.id !== deleteTarget.id));
      setMsg(`Classe "${deleteTarget.name}" removida. Fichas que a usavam ficam sem classe.`);
    } catch (deleteError) {
      setError(deleteError.message || "Não foi possível remover a classe.");
    } finally {
      setSaving(false);
      setDeleteTarget(null);
    }
  };

  return (
    <div className="space-y-4 pb-10">
      <Card>
        <div className="flex flex-wrap items-start justify-between gap-3">
          <SectionHeader
            title="Classes & Habilidades de Nível"
            subtitle="Catálogo global — qualquer mestre cria, edita e remove. A progressão é fixa por classe e as fichas a referenciam dinamicamente."
            icon={<BookOpen size={15} />}
          />
          <button
            type="button"
            onClick={() => setModal({ isOpen: true, classe: null })}
            className="flex min-h-11 shrink-0 items-center gap-2 rounded-xl border border-amber-500/50 bg-amber-500/15 px-4 text-xs font-bold uppercase tracking-wider text-amber-300 transition hover:bg-amber-500/25 active:scale-95"
          >
            <Plus size={15} />
            Nova Classe
          </button>
        </div>
        {error && <p className="mt-3 rounded-lg border border-rose-500/40 bg-rose-950/30 px-3 py-2 text-xs text-rose-300">{error}</p>}
        {msg && (
          <p className="mt-3 flex items-center gap-2 rounded-lg border border-emerald-500/40 bg-emerald-950/25 px-3 py-2 text-xs text-emerald-300">
            <Check size={14} /> {msg}
          </p>
        )}
      </Card>

      {loading ? (
        <div className="flex items-center justify-center gap-2 py-16 text-sm text-zinc-500">
          <LoaderCircle size={18} className="animate-spin" /> Carregando o catálogo de classes...
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-3 lg:grid-cols-2">
          {classes.map((classe) => {
            const abilities = Array.isArray(classe.abilities) ? classe.abilities : [];
            const filledLevels = new Set(abilities.map((a) => Number(a.reqLevel ?? a.nivel) || 1)).size;
            return (
              <Card key={classe.id} className="flex flex-col gap-2">
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <h3 className="font-serif text-lg font-bold text-zinc-100">{classe.name}</h3>
                      <span className="rounded-md border border-amber-500/40 bg-amber-950/40 px-2 py-0.5 font-mono text-[10px] font-bold text-amber-300">
                        {classe.hitDie}
                      </span>
                      {(classe.primaryAttribute || classe.secondaryAttribute) && (
                        <span className="flex items-center gap-1 rounded-md border border-zinc-800 bg-zinc-900/70 px-2 py-0.5 text-[10px] font-bold text-zinc-400">
                          <Shield size={10} />
                          {classe.primaryAttribute}/{classe.secondaryAttribute}
                        </span>
                      )}
                    </div>
                    <p className="mt-1 line-clamp-2 text-xs leading-snug text-zinc-500">{classe.description}</p>
                  </div>
                  <div className="flex shrink-0 items-center gap-1.5">
                    <button
                      type="button"
                      onClick={() => setModal({ isOpen: true, classe })}
                      aria-label={`Editar ${classe.name}`}
                      className="rounded-lg border border-zinc-800 p-2 text-zinc-400 transition hover:bg-zinc-800 hover:text-amber-300"
                    >
                      <Pencil size={16} />
                    </button>
                    <button
                      type="button"
                      onClick={() => setDeleteTarget(classe)}
                      aria-label={`Remover ${classe.name}`}
                      className="rounded-lg border border-zinc-800 p-2 text-zinc-500 transition hover:border-rose-500/50 hover:bg-rose-950/60 hover:text-rose-300"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
                <div className="mt-auto flex items-center justify-between gap-2 border-t border-zinc-800/70 pt-2 text-[10px] text-zinc-500">
                  <span className="flex items-center gap-1.5">
                    <Sparkles size={11} className="text-amber-400" />
                    {abilities.length} habilidade{abilities.length === 1 ? "" : "s"} de nível · {filledLevels} nível{filledLevels === 1 ? "" : "eis"}
                  </span>
                  {classe.slug && <span className="font-mono">{classe.slug}</span>}
                </div>
              </Card>
            );
          })}
        </div>
      )}

      <ClassFormModal
        isOpen={modal.isOpen}
        classe={modal.classe}
        onClose={() => setModal({ isOpen: false, classe: null })}
        onSave={handleSave}
      />
      <ConfirmDialog
        isOpen={Boolean(deleteTarget)}
        title={`Remover ${deleteTarget?.name ?? "classe"}?`}
        message="As fichas que usam esta classe ficam sem classe (e sem a progressão dela). A remoção não pode ser desfeita."
        confirmText="Remover Classe"
        cancelText="Cancelar"
        onConfirm={handleDelete}
        onCancel={() => setDeleteTarget(null)}
      />
    </div>
  );
}
