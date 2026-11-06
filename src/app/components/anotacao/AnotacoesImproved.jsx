"use client";

import React, { useState } from "react";
import { SectionHeader, EditableText } from "./ui";
import { useCharacter } from "../context/CharacterContext";

export default function AnotacoesImproved() {
  const { data, upd } = useCharacter();
  const [showQuickNote, setShowQuickNote] = useState(false);
  const [quickNoteTitle, setQuickNoteTitle] = useState("");
  const [quickNoteContent, setQuickNoteContent] = useState("");

  const handleAddQuickNote = () => {
    if (quickNoteTitle.trim() || quickNoteContent.trim()) {
      const newNote = {
        id: Date.now(),
        title: quickNoteTitle || "Sem título",
        content: quickNoteContent,
        createdAt: new Date().toLocaleDateString("pt-BR"),
      };

      const geral = (data.notes?.geral || []);
      upd("notes", {
        ...(data.notes || {}),
        geral: [...geral, newNote],
      });

      setQuickNoteTitle("");
      setQuickNoteContent("");
      setShowQuickNote(false);
    }
  };

  const notesCount = Object.values(data.notes || {}).reduce(
    (acc, arr) => acc + (Array.isArray(arr) ? arr.length : 0),
    0
  );

  return (
    <div className="space-y-4 rounded-xl border border-[#d69a3d]/30 bg-[#1a1410]/50 p-4">
      <div className="flex items-center justify-between">
        <SectionHeader title="Anotações Rápidas" icon="" />
        <span className="text-xs text-[#a98b68]">
          {notesCount} nota{notesCount !== 1 ? "s" : ""}
        </span>
      </div>

      {showQuickNote ? (
        <div className="space-y-2 rounded-lg bg-white/5 p-3">
          <input
            type="text"
            placeholder="Título (opcional)..."
            value={quickNoteTitle}
            onChange={(e) => setQuickNoteTitle(e.target.value)}
            className="w-full border-b border-[#d69a3d]/40 bg-transparent text-xs text-[#f5e9d7] placeholder-[#8a7355] outline-none transition focus:border-[#d69a3d]"
            autoFocus
          />

          <textarea
            placeholder="Sua anotação..."
            value={quickNoteContent}
            onChange={(e) => setQuickNoteContent(e.target.value)}
            className="h-16 w-full resize-none rounded border border-[#d69a3d]/20 bg-white/5 px-2 py-1 text-xs text-[#f5e9d7] placeholder-[#8a7355] outline-none transition focus:border-[#d69a3d]"
          />

          <div className="flex gap-2">
            <button
              onClick={handleAddQuickNote}
              className="flex-1 rounded-lg bg-[#d69a3d] px-3 py-1 text-xs font-semibold text-[#1a1410] transition hover:bg-[#e6b054]"
            >
              Salvar
            </button>
            <button
              onClick={() => {
                setShowQuickNote(false);
                setQuickNoteTitle("");
                setQuickNoteContent("");
              }}
              className="flex-1 rounded-lg border border-[#d69a3d]/40 px-3 py-1 text-xs font-semibold text-[#d69a3d] transition hover:bg-[#d69a3d]/10"
            >
              Cancelar
            </button>
          </div>
        </div>
      ) : (
        <button
          onClick={() => setShowQuickNote(true)}
          className="w-full rounded-lg border-2 border-dashed border-[#d69a3d]/40 py-3 text-sm text-[#a98b68] transition hover:border-[#d69a3d] hover:bg-[#d69a3d]/5 hover:text-[#d69a3d]"
        >
          + Adicionar Anotação Rápida
        </button>
      )}

      {/* Recent Notes Preview */}
      {notesCount > 0 && (
        <div className="border-t border-[#d69a3d]/20 pt-3">
          <p className="mb-2 text-[10px] uppercase tracking-widest text-[#a98b68]">
            Anotações Recentes
          </p>
          <div className="space-y-1 max-h-24 overflow-y-auto text-xs text-[#c9b9a0]">
            {Object.values(data.notes || {})
              .flat()
              .slice(-3)
              .map((note) => (
                <div
                  key={note.id}
                  className="truncate border-l-2 border-[#d69a3d]/40 pl-2 italic"
                >
                  {note.title}
                </div>
              ))}
          </div>
          <p className="mt-2 text-[10px] text-[#8a7355] italic">
            👉 Vá até "Caderno de Anotações" para ver todas as notas
          </p>
        </div>
      )}
    </div>
  );
}
