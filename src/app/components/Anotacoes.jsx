"use client";

import { useMemo, useState } from "react";
import { BookOpen, CalendarDays, ImagePlus, Plus, Save, Trash2, X } from "lucide-react";
import { Card, SectionHeader } from "./ui";
import { useCharacter } from "../context/CharacterContext";

const today = () => new Date().toISOString().slice(0, 10);
const EMPTY_ENTRY = { id: "empty-diary", date: "", title: "", content: "", images: [] };

function formatDate(value) {
  if (!value) return "Sem data";
  return new Intl.DateTimeFormat("pt-BR", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  }).format(new Date(`${value}T12:00:00`));
}

function getDiaryEntries(notes) {
  if (Array.isArray(notes)) return notes;

  if (typeof notes === "string" && notes.trim()) {
    return [{ id: "legacy-note", date: today(), title: "Primeiro registro", content: notes, images: [] }];
  }

  if (notes && typeof notes === "object") {
    return Object.entries(notes).flatMap(([category, value]) => {
      const items = Array.isArray(value) ? value : [{ content: value }];
      return items.map((item, index) => ({
        id: item.id || `${category}-${index}`,
        date: item.date || item.createdAt || today(),
        title: item.title || category,
        content: item.content || String(item),
        images: item.images || [],
      }));
    });
  }

  return [];
}

export default function Anotacoes() {
  const { data, upd } = useCharacter();
  const entries = useMemo(() => getDiaryEntries(data.notes), [data.notes]);
  const [selectedId, setSelectedId] = useState(entries[0]?.id || null);
  const [draft, setDraft] = useState(null);
  const [isCreating, setIsCreating] = useState(false);

  const selectedEntry = entries.find((entry) => entry.id === selectedId) || entries[0];
  const currentDraft = draft || selectedEntry || EMPTY_ENTRY;

  const updateDraft = (patch) => setDraft({ ...currentDraft, ...patch });

  const saveEntry = () => {
    if (!currentDraft.title.trim() && !currentDraft.content.trim()) return;
    const next = entries.some((entry) => entry.id === currentDraft.id)
      ? entries.map((entry) => (entry.id === currentDraft.id ? currentDraft : entry))
      : [currentDraft, ...entries];
    upd("notes", next);
    setSelectedId(currentDraft.id);
    setDraft(null);
    setIsCreating(false);
  };

  const createEntry = () => {
    const entry = { id: `diary-${Date.now()}`, date: today(), title: "", content: "", images: [] };
    setSelectedId(entry.id);
    setDraft(entry);
    setIsCreating(true);
  };

  const deleteEntry = () => {
    if (!selectedEntry) return;
    const next = entries.filter((entry) => entry.id !== selectedEntry.id);
    upd("notes", next);
    setSelectedId(next[0]?.id || null);
    setDraft(null);
  };

  const addImages = (event) => {
    const files = Array.from(event.target.files || []);
    files.forEach((file) => {
      if (!file.type.startsWith("image/") || file.size > 3 * 1024 * 1024) {
        window.alert("Escolha uma imagem de até 3 MB.");
        return;
      }
      const reader = new FileReader();
      reader.onload = () => {
        updateDraft({
          images: [
            ...(currentDraft.images || []),
            { id: `${Date.now()}-${file.name}`, name: file.name, dataUrl: reader.result },
          ],
        });
      };
      reader.onerror = () => window.alert(`Não foi possível carregar ${file.name}.`);
      reader.readAsDataURL(file);
    });
    event.target.value = "";
  };

  const removeImage = (imageId) => {
    updateDraft({ images: (currentDraft.images || []).filter((image) => image.id !== imageId) });
  };

  return (
    <Card className="min-h-[60vh]">
      <div className="flex items-center justify-between gap-3">
        <SectionHeader title="Diário de campanha" icon={<BookOpen size={14} />} />
        <button
          type="button"
          onClick={createEntry}
          className="flex min-h-11 items-center gap-2 rounded-xl border border-primary/30 bg-primary/10 px-3 py-2 text-xs font-semibold text-primary transition hover:bg-primary/20 active:scale-95"
        >
          <Plus size={15} />
          <span className="hidden sm:inline">Novo registro</span>
        </button>
      </div>

      <div className="mt-5 grid gap-5 lg:grid-cols-[230px_1fr]">
        <aside className="space-y-2 lg:border-r lg:border-white/10 lg:pr-4">
          <p className="px-2 text-[10px] font-semibold uppercase tracking-[0.2em] text-muted-foreground">
            Registros · {entries.length}
          </p>
          {entries.length === 0 ? (
            <p className="px-2 py-5 text-xs italic text-muted-foreground">Seu diário ainda está vazio.</p>
          ) : (
            entries.map((entry) => (
              <button
                key={entry.id}
                type="button"
                onClick={() => {
                  setSelectedId(entry.id);
                  setDraft(null);
                  setIsCreating(false);
                }}
                className={`w-full rounded-xl border p-3 text-left transition ${
                  selectedEntry?.id === entry.id
                    ? "border-primary/40 bg-primary/10"
                    : "border-white/10 bg-background/30 hover:border-primary/25 hover:bg-primary/5"
                }`}
              >
                <span className="block truncate font-serif text-sm font-semibold text-foreground">
                  {entry.title || "Registro sem título"}
                </span>
                <span className="mt-1 flex items-center gap-1 text-[10px] text-muted-foreground">
                  <CalendarDays size={11} />
                  {formatDate(entry.date)}
                </span>
              </button>
            ))
          )}
        </aside>

        <section className="min-w-0">
          {selectedEntry || isCreating ? (
            <>
              <div className="grid gap-3 sm:grid-cols-[1fr_180px]">
                <label className="text-xs text-muted-foreground">
                  Título do registro
                  <input
                    value={currentDraft.title}
                    onChange={(event) => updateDraft({ title: event.target.value })}
                    placeholder="Ex.: A noite na floresta"
                    className="mt-1 min-h-11 w-full rounded-xl border border-white/10 bg-background/40 px-3 text-sm text-foreground outline-none transition focus:border-primary"
                  />
                </label>
                <label className="text-xs text-muted-foreground">
                  Data
                  <input
                    type="date"
                    value={currentDraft.date}
                    onChange={(event) => updateDraft({ date: event.target.value })}
                    className="mt-1 min-h-11 w-full rounded-xl border border-white/10 bg-background/40 px-3 text-sm text-foreground outline-none transition focus:border-primary"
                  />
                </label>
              </div>

              <label className="mt-4 block text-xs text-muted-foreground">
                Relato da jornada
                <textarea
                  value={currentDraft.content}
                  onChange={(event) => updateDraft({ content: event.target.value })}
                  placeholder="Escreva aqui o que aconteceu..."
                  rows={10}
                  className="mt-1 w-full resize-y rounded-xl border border-white/10 bg-background/40 p-3 text-sm leading-6 text-foreground outline-none transition focus:border-primary"
                />
              </label>

              <div className="mt-4">
                <div className="mb-2 flex flex-wrap items-center justify-between gap-2">
                  <span className="text-xs font-semibold text-muted-foreground">Memórias visuais</span>
                  <label className="flex min-h-11 cursor-pointer items-center gap-2 rounded-xl border border-primary/30 bg-primary/10 px-3 py-2 text-xs font-semibold text-primary transition hover:bg-primary/20 active:scale-95">
                    <ImagePlus size={14} />
                    Adicionar imagem
                    <input type="file" accept="image/*" multiple className="sr-only" onChange={addImages} />
                  </label>
                </div>
                {(currentDraft.images || []).length > 0 && (
                  <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
                    {currentDraft.images.map((image) => (
                      <figure key={image.id} className="group relative overflow-hidden rounded-xl border border-white/10">
                        <img src={image.dataUrl} alt={image.name || "Imagem do diário"} className="aspect-video w-full object-cover" />
                        <button
                          type="button"
                          onClick={() => removeImage(image.id)}
                          className="absolute right-2 top-2 rounded-lg bg-black/70 p-2 text-white/80 opacity-0 transition group-hover:opacity-100 hover:text-red-300"
                          title="Remover imagem"
                        >
                          <X size={14} />
                        </button>
                      </figure>
                    ))}
                  </div>
                )}
              </div>

              <div className="mt-5 flex flex-wrap justify-between gap-2 border-t border-white/10 pt-4">
                <button type="button" onClick={deleteEntry} disabled={!selectedEntry} className="flex min-h-11 items-center gap-2 rounded-xl px-3 py-2 text-xs text-red-300 transition hover:bg-red-950/30 disabled:invisible">
                  <Trash2 size={14} />
                  Excluir registro
                </button>
                <button type="button" onClick={saveEntry} className="flex min-h-11 items-center gap-2 rounded-xl bg-primary px-4 py-2 text-xs font-bold text-primary-foreground transition hover:brightness-110 active:scale-95">
                  <Save size={14} />
                  Salvar no diário
                </button>
              </div>
            </>
          ) : (
            <div className="flex min-h-80 flex-col items-center justify-center rounded-xl border border-dashed border-white/15 bg-background/20 p-6 text-center">
              <BookOpen size={30} className="text-primary/70" />
              <p className="mt-3 font-serif text-lg text-foreground">Comece seu diário</p>
              <p className="mt-1 max-w-sm text-xs text-muted-foreground">Registre acontecimentos, pistas e decisões importantes da campanha.</p>
              <button type="button" onClick={createEntry} className="mt-5 flex min-h-11 items-center gap-2 rounded-xl bg-primary px-4 py-2 text-xs font-bold text-primary-foreground active:scale-95">
                <Plus size={14} />
                Escrever primeiro registro
              </button>
            </div>
          )}
        </section>
      </div>
    </Card>
  );
}
