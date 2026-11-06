"use client";

import React, { useState } from "react";
import { SectionHeader } from "../ui";
import { useCharacter } from "../../context/CharacterContext";
import NotebookEntry from "./NotebookEntry";
import NotesCategories from "./NotesCategories";

export default function NotesPage() {
  const { data, upd } = useCharacter();
  const [activeCategory, setActiveCategory] = useState("geral");
  const [isAddingNew, setIsAddingNew] = useState(false);

  const categories = [
    { id: "geral", label: "Geral", icon: "📝" },
    { id: "missoes", label: "Missões", icon: "⚔️" },
    { id: "personagens", label: "Personagens", icon: "👥" },
    { id: "locais", label: "Locais", icon: "🗺️" },
    { id: "combate", label: "Combate", icon: "🛡️" },
    { id: "magia", label: "Magia", icon: "✨" },
  ];

  const notes = data.notes || {};
  const currentCategoryNotes = notes[activeCategory] || [];

  const handleAddNote = (title, content) => {
    const newNote = {
      id: Date.now(),
      title,
      content,
      createdAt: new Date().toLocaleDateString("pt-BR"),
    };

    const updated = {
      ...notes,
      [activeCategory]: [...currentCategoryNotes, newNote],
    };

    upd("notes", updated);
    setIsAddingNew(false);
  };

  const handleDeleteNote = (noteId) => {
    const updated = {
      ...notes,
      [activeCategory]: currentCategoryNotes.filter((n) => n.id !== noteId),
    };
    upd("notes", updated);
  };

  const handleUpdateNote = (noteId, title, content) => {
    const updated = {
      ...notes,
      [activeCategory]: currentCategoryNotes.map((n) =>
        n.id === noteId ? { ...n, title, content } : n
      ),
    };
    upd("notes", updated);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center">
        <h1 className="mb-2 text-4xl font-bold text-[#d4a574] drop-shadow-lg">
           Caderno de Anotações
        </h1>
        <p className="text-[#a98b68] italic">
          Registre seus pensamentos, descobertas e memórias
        </p>
      </div>

      {/* Categories */}
      <NotesCategories
        categories={categories}
        activeCategory={activeCategory}
        setActiveCategory={setActiveCategory}
      />

      {/* Main Notebook */}
      <div className="notebook-container">
        <div className="notebook-background">
          {/* Left Page */}
          <div className="notebook-page notebook-left">
            <div className="page-content">
              <SectionHeader title={`Anotações - ${categories.find(c => c.id === activeCategory)?.label}`} />
              
              <div className="space-y-3 max-h-[500px] overflow-y-auto pr-3">
                {currentCategoryNotes.length === 0 ? (
                  <div className="italic text-[#8a7355] py-8 text-center">
                    Nenhuma anotação nesta categoria ainda...
                  </div>
                ) : (
                  currentCategoryNotes.map((note) => (
                    <NotebookEntry
                      key={note.id}
                      note={note}
                      onDelete={() => handleDeleteNote(note.id)}
                      onUpdate={handleUpdateNote}
                    />
                  ))
                )}
              </div>
            </div>

            {/* Spine decoration */}
            <div className="absolute left-0 top-0 h-full w-1 bg-gradient-to-b from-[#8b7355]/50 to-transparent" />
          </div>

          {/* Right Page (Add New) */}
          <div className="notebook-page notebook-right">
            <div className="page-content flex flex-col">
              <div className="mb-4">
                <h4 className="text-sm font-semibold text-[#d69a3d] uppercase tracking-widest">
                   Nova Anotação
                </h4>
                <div className="mt-2 h-px bg-gradient-to-r from-[#d69a3d]/40 to-transparent" />
              </div>

              {isAddingNew ? (
                <NewNoteForm
                  onAdd={handleAddNote}
                  onCancel={() => setIsAddingNew(false)}
                />
              ) : (
                <button
                  onClick={() => setIsAddingNew(true)}
                  className="mt-4 self-center rounded-lg border-2 border-dashed border-[#d69a3d]/40 px-6 py-3 text-[#d69a3d] transition hover:border-[#d69a3d] hover:bg-[#d69a3d]/5"
                >
                  + Adicionar Nota
                </button>
              )}

              {/* Decorative elements */}
              <div className="mt-auto pt-4 text-right text-xs text-[#8a7355]">
                {new Date().toLocaleDateString("pt-BR")}
              </div>
            </div>

            {/* Spine decoration */}
            <div className="absolute right-0 top-0 h-full w-1 bg-gradient-to-b from-[#8b7355]/50 to-transparent" />
          </div>
        </div>
      </div>

      <style jsx>{`
        .notebook-container {
          perspective: 1200px;
        }

        .notebook-background {
          background: linear-gradient(135deg, #2a2420 0%, #3a322a 50%, #2a2420 100%);
          border-radius: 0 20px 20px 0;
          padding: 20px 0;
          box-shadow: 
            0 20px 60px rgba(0, 0, 0, 0.5),
            inset 0 1px 0 rgba(255, 255, 255, 0.1);
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 0;
          border: 1px solid rgba(255, 255, 255, 0.05);
        }

        .notebook-page {
          position: relative;
          background: 
            repeating-linear-gradient(
              0deg,
              transparent,
              transparent 24px,
              rgba(214, 154, 61, 0.05) 24px,
              rgba(214, 154, 61, 0.05) 25px
            ),
            radial-gradient(circle at 20% 50%, rgba(212, 165, 116, 0.03) 0%, transparent 50%);
          background-color: #f5ead5;
          padding: 30px 25px;
          min-height: 500px;
          border-right: 1px solid rgba(0, 0, 0, 0.1);
        }

        .notebook-left {
          border-radius: 0;
        }

        .notebook-right {
          border-radius: 0 20px 20px 0;
          background-image: 
            repeating-linear-gradient(
              0deg,
              transparent,
              transparent 24px,
              rgba(214, 154, 61, 0.08) 24px,
              rgba(214, 154, 61, 0.08) 25px
            ),
            radial-gradient(circle at 20% 50%, rgba(212, 165, 116, 0.04) 0%, transparent 50%);
          background-color: #faf5ec;
        }

        .page-content {
          height: 100%;
          display: flex;
          flex-direction: column;
        }

        .notebook-page ::-webkit-scrollbar {
          width: 6px;
        }

        .notebook-page ::-webkit-scrollbar-track {
          background: transparent;
        }

        .notebook-page ::-webkit-scrollbar-thumb {
          background: rgba(212, 165, 116, 0.3);
          border-radius: 3px;
        }

        .notebook-page ::-webkit-scrollbar-thumb:hover {
          background: rgba(212, 165, 116, 0.5);
        }
      `}</style>
    </div>
  );
}

function NewNoteForm({ onAdd, onCancel }) {
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");

  const handleSubmit = () => {
    if (title.trim() || content.trim()) {
      onAdd(title || "Sem título", content);
      setTitle("");
      setContent("");
    }
  };

  return (
    <div className="space-y-3 flex-1 flex flex-col">
      <input
        type="text"
        placeholder="Título da anotação..."
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        className="w-full border-b-2 border-[#d69a3d]/30 bg-transparent px-2 py-2 text-sm font-semibold text-[#5a4a3a] placeholder-[#a98b68] outline-none transition focus:border-[#d69a3d]"
      />

      <textarea
        placeholder="Escreva sua anotação aqui..."
        value={content}
        onChange={(e) => setContent(e.target.value)}
        className="flex-1 resize-none border-l-4 border-[#d69a3d]/30 bg-transparent px-3 py-2 text-sm text-[#5a4a3a] placeholder-[#a98b68] outline-none transition focus:border-[#d69a3d]"
      />

      <div className="flex gap-2 pt-2">
        <button
          onClick={handleSubmit}
          className="flex-1 rounded-lg bg-[#d69a3d]/80 px-4 py-2 text-xs font-semibold text-[#1a1410] transition hover:bg-[#d69a3d]"
        >
          Salvar
        </button>
        <button
          onClick={onCancel}
          className="flex-1 rounded-lg border border-[#d69a3d]/40 px-4 py-2 text-xs font-semibold text-[#d69a3d] transition hover:bg-[#d69a3d]/5"
        >
          Cancelar
        </button>
      </div>
    </div>
  );
}
