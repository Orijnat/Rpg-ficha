"use client";

import { useEffect, useState } from "react";
import {
  BookOpen,
  Eye,
  EyeOff,
  FileText,
  Lock,
  Plus,
  Save,
  Scroll,
  Sparkles,
  Trash2,
  Unlock,
} from "lucide-react";
import { Card, SectionHeader } from "../../components/ui";
import ConfirmDialog from "../../components/admin/ConfirmDialog";
import {
  createCampaignNote,
  deleteCampaignNote,
  listCampaignNotes,
  listCampaigns,
  updateCampaignNote,
} from "../../../lib/api";
import { useAuth } from "../../context/AuthContext";

export default function AdminNotasPage() {
  const { token, isMaster } = useAuth();

  const [campaigns, setCampaigns] = useState([]);
  const [selectedCampaignId, setSelectedCampaignId] = useState("");
  const [notes, setNotes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [successMsg, setSuccessMsg] = useState("");

  // Criação
  const [isCreating, setIsCreating] = useState(false);
  const [novoTitulo, setNovoTitulo] = useState("");
  const [novoConteudo, setNovoConteudo] = useState("");
  const [novoTipo, setNovoTipo] = useState("anotacao");
  const [novaPrivada, setNovaPrivada] = useState(true);

  // Edição
  const [editingNote, setEditingNote] = useState(null);

  // Exclusão
  const [noteToDelete, setNoteToDelete] = useState(null);

  useEffect(() => {
    if (!isMaster) return;
    listCampaigns(token)
      .then((data) => {
        const camps = Array.isArray(data) ? data : [];
        setCampaigns(camps);
        if (camps.length > 0) {
          setSelectedCampaignId(camps[0].id);
        }
      })
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, [isMaster, token]);

  const loadNotes = async (campId) => {
    if (!campId) return;
    setLoading(true);
    try {
      const data = await listCampaignNotes(campId, token);
      setNotes(Array.isArray(data) ? data : []);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (selectedCampaignId) {
      loadNotes(selectedCampaignId);
    }
  }, [selectedCampaignId]);

  const handleCreateNote = async (e) => {
    e.preventDefault();
    if (!novoConteudo.trim()) return;
    try {
      await createCampaignNote(
        selectedCampaignId,
        {
          titulo: novoTitulo.trim() || "Nova Anotação",
          conteudo: novoConteudo.trim(),
          tipo: novoTipo,
          privada: novaPrivada,
        },
        token
      );
      setNovoTitulo("");
      setNovoConteudo("");
      setIsCreating(false);
      setSuccessMsg("Nota registrada com sucesso.");
      loadNotes(selectedCampaignId);
    } catch (err) {
      setError(err.message);
    }
  };

  const handleUpdateNote = async (e) => {
    e.preventDefault();
    if (!editingNote) return;
    try {
      await updateCampaignNote(
        editingNote.id,
        {
          titulo: editingNote.titulo,
          conteudo: editingNote.conteudo,
          tipo: editingNote.tipo,
          privada: editingNote.privada,
        },
        token
      );
      setEditingNote(null);
      setSuccessMsg("Nota atualizada.");
      loadNotes(selectedCampaignId);
    } catch (err) {
      setError(err.message);
    }
  };

  const handleDeleteNote = async () => {
    if (!noteToDelete) return;
    try {
      await deleteCampaignNote(noteToDelete.id, token);
      setNoteToDelete(null);
      setSuccessMsg("Nota removida.");
      loadNotes(selectedCampaignId);
    } catch (err) {
      setError(err.message);
      setNoteToDelete(null);
    }
  };

  if (!isMaster) return null;

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between border-b-2 border-primary/40 pb-4">
        <div>
          <span className="text-[10px] font-bold uppercase tracking-[0.3em] text-primary">
            Câmara do Mestre · Segredos & Handouts
          </span>
          <h1 className="mt-1 font-serif text-3xl font-black uppercase tracking-wider text-foreground">
            Notas Públicas & Privadas
          </h1>
          <p className="text-xs text-muted-foreground">
            Protegidas por filtragem estrita no servidor: segredos nunca são transmitidos a jogadores.
          </p>
        </div>

        <div className="flex items-center gap-2">
          {campaigns.length > 0 && (
            <select
              value={selectedCampaignId}
              onChange={(e) => setSelectedCampaignId(e.target.value)}
              className="h-10 rounded-lg border border-border bg-input-background px-3 text-xs text-foreground outline-none focus:border-primary"
            >
              {campaigns.map((c) => (
                <option key={c.id} value={c.id}>
                  Campanha: {c.nome}
                </option>
              ))}
            </select>
          )}

          <button
            type="button"
            onClick={() => setIsCreating(!isCreating)}
            className="flex min-h-10 items-center gap-1.5 rounded-lg bg-primary px-3.5 text-xs font-bold uppercase tracking-wider text-primary-foreground hover:brightness-110 active:scale-95 shadow-md shadow-primary/20"
          >
            <Plus size={14} /> Nova Nota
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

      {/* Formulário de Criação */}
      {isCreating && (
        <Card className="border-2 border-primary/40">
          <SectionHeader title="Criar Registro Narrativo" icon={<FileText size={16} />} />
          <form onSubmit={handleCreateNote} className="mt-4 space-y-4">
            <div className="grid gap-4 sm:grid-cols-[1.5fr_1fr_1fr]">
              <div>
                <label className="block text-xs font-bold uppercase text-muted-foreground">
                  Título da Nota
                </label>
                <input
                  type="text"
                  value={novoTitulo}
                  onChange={(e) => setNovoTitulo(e.target.value)}
                  placeholder="Ex.: A profecia do eclipse..."
                  className="mt-1 min-h-10 w-full rounded border border-border bg-input-background px-3 text-xs text-foreground outline-none focus:border-primary"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase text-muted-foreground">
                  Tipo de Registro
                </label>
                <select
                  value={novoTipo}
                  onChange={(e) => setNovoTipo(e.target.value)}
                  className="mt-1 min-h-10 w-full rounded border border-border bg-input-background px-3 text-xs text-foreground outline-none focus:border-primary"
                >
                  <option value="anotacao">Anotação Simples</option>
                  <option value="diario">Diário de Campanha</option>
                  <option value="handout">Handout (Pista / Carta)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase text-muted-foreground">
                  Privacidade Server-Side
                </label>
                <button
                  type="button"
                  onClick={() => setNovaPrivada(!novaPrivada)}
                  className={`mt-1 flex min-h-10 w-full items-center justify-center gap-2 rounded border px-3 text-xs font-bold uppercase transition ${
                    novaPrivada
                      ? "border-rose-500/40 bg-rose-950/30 text-rose-300"
                      : "border-emerald-500/40 bg-emerald-950/30 text-emerald-300"
                  }`}
                >
                  {novaPrivada ? <Lock size={13} /> : <Unlock size={13} />}
                  <span>{novaPrivada ? "Privada (Só Mestre)" : "Pública (Jogadores)"}</span>
                </button>
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase text-muted-foreground">
                Conteúdo do Texto
              </label>
              <textarea
                rows={5}
                required
                value={novoConteudo}
                onChange={(e) => setNovoConteudo(e.target.value)}
                placeholder="Escreva a pista, os segredos ou o relato..."
                className="mt-1 w-full rounded border border-border bg-input-background p-3 text-sm text-foreground outline-none focus:border-primary"
              />
            </div>

            <div className="flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setIsCreating(false)}
                className="rounded border border-border px-3 py-1.5 text-xs text-muted-foreground hover:bg-secondary"
              >
                Cancelar
              </button>
              <button
                type="submit"
                className="rounded bg-primary px-4 py-1.5 text-xs font-bold uppercase text-primary-foreground hover:brightness-110"
              >
                Salvar Nota
              </button>
            </div>
          </form>
        </Card>
      )}

      {/* Lista de Notas */}
      {loading ? (
        <div className="py-8 text-center text-xs text-muted-foreground">Carregando notas da campanha...</div>
      ) : notes.length === 0 ? (
        <Card className="py-12 text-center text-muted-foreground">
          <BookOpen size={28} className="mx-auto text-primary opacity-40 mb-2" />
          <p className="font-serif text-base text-foreground font-bold">Nenhuma nota cadastrada nesta campanha.</p>
          <p className="mt-1 text-xs">Crie pistas, cartas ou anotações secretas no botão acima.</p>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2">
          {notes.map((note) => {
            const isEditing = editingNote?.id === note.id;

            return (
              <Card
                key={note.id}
                className={`flex flex-col justify-between border-2 transition ${
                  note.privada
                    ? "border-rose-500/25 bg-rose-950/5 hover:border-rose-500/40"
                    : "border-primary/25 bg-secondary/30 hover:border-primary/50"
                }`}
              >
                <div>
                  <div className="flex items-start justify-between gap-3 border-b border-border/80 pb-2">
                    <div>
                      <div className="flex items-center gap-2">
                        <strong className="font-serif text-base font-bold text-foreground">
                          {note.titulo || "Sem título"}
                        </strong>
                        <span
                          className={`rounded px-1.5 py-0.2 text-[9px] font-bold uppercase tracking-wider ${
                            note.privada
                              ? "border border-rose-500/40 bg-rose-950/40 text-rose-300"
                              : "border border-emerald-500/40 bg-emerald-950/40 text-emerald-300"
                          }`}
                        >
                          {note.privada ? "Privada" : "Pública"}
                        </span>
                        <span className="rounded border border-border bg-black/40 px-1.5 py-0.2 text-[9px] uppercase text-muted-foreground">
                          {note.tipo}
                        </span>
                      </div>
                      <span className="text-[10px] text-muted-foreground">
                        Autor: {note.autor?.username || "Mestre"} ·{" "}
                        {new Date(note.updated_at || note.updatedAt).toLocaleDateString("pt-BR")}
                      </span>
                    </div>

                    <button
                      type="button"
                      onClick={() => setNoteToDelete(note)}
                      className="rounded p-1 text-muted-foreground hover:text-destructive"
                      title="Excluir nota"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>

                  {isEditing ? (
                    <form onSubmit={handleUpdateNote} className="mt-3 space-y-3">
                      <input
                        type="text"
                        value={editingNote.titulo}
                        onChange={(e) =>
                          setEditingNote({ ...editingNote, titulo: e.target.value })
                        }
                        className="w-full rounded border border-border bg-input-background px-2 py-1 text-xs text-foreground outline-none focus:border-primary"
                      />
                      <textarea
                        rows={4}
                        value={editingNote.conteudo}
                        onChange={(e) =>
                          setEditingNote({ ...editingNote, conteudo: e.target.value })
                        }
                        className="w-full rounded border border-border bg-input-background p-2 text-xs text-foreground outline-none focus:border-primary"
                      />
                      <div className="flex items-center justify-between">
                        <label className="flex items-center gap-1.5 text-xs text-muted-foreground">
                          <input
                            type="checkbox"
                            checked={editingNote.privada}
                            onChange={(e) =>
                              setEditingNote({ ...editingNote, privada: e.target.checked })
                            }
                          />
                          <span>Privada para o mestre</span>
                        </label>
                        <div className="flex gap-2">
                          <button
                            type="button"
                            onClick={() => setEditingNote(null)}
                            className="rounded px-2 py-1 text-xs text-muted-foreground hover:bg-secondary"
                          >
                            Cancelar
                          </button>
                          <button
                            type="submit"
                            className="rounded bg-primary px-3 py-1 text-xs font-bold uppercase text-primary-foreground hover:brightness-110"
                          >
                            Salvar
                          </button>
                        </div>
                      </div>
                    </form>
                  ) : (
                    <div className="mt-3">
                      <p className="whitespace-pre-wrap font-serif text-xs leading-relaxed text-foreground/90">
                        {note.conteudo}
                      </p>
                    </div>
                  )}
                </div>

                {!isEditing && (
                  <div className="mt-4 flex justify-end border-t border-border/60 pt-2">
                    <button
                      type="button"
                      onClick={() => setEditingNote(note)}
                      className="text-xs text-primary hover:underline font-semibold"
                    >
                      Editar Nota
                    </button>
                  </div>
                )}
              </Card>
            );
          })}
        </div>
      )}

      {/* Confirmação de Exclusão */}
      <ConfirmDialog
        isOpen={Boolean(noteToDelete)}
        title={`Excluir nota "${noteToDelete?.titulo}"?`}
        message="Esta nota será removida da campanha e registrada em auditoria."
        onConfirm={handleDeleteNote}
        onCancel={() => setNoteToDelete(null)}
      />
    </div>
  );
}
