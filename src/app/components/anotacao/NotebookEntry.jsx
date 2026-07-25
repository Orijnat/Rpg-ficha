"use client";

import React, { useState } from "react";

export default function NotebookEntry({ note, onDelete, onUpdate }) {
  const [isEditing, setIsEditing] = useState(false);
  const [editTitle, setEditTitle] = useState(note.title);
  const [editContent, setEditContent] = useState(note.content);

  const handleSave = () => {
    onUpdate(note.id, editTitle, editContent);
    setIsEditing(false);
  };

  const handleCancel = () => {
    setEditTitle(note.title);
    setEditContent(note.content);
    setIsEditing(false);
  };

  return (
    <div className="group rounded-lg border-l-4 border-[#d69a3d]/60 bg-white/50 p-3 shadow-sm transition hover:bg-white/70 hover:shadow-md">
      {isEditing ? (
        <div className="space-y-2">
          <input
            type="text"
            value={editTitle}
            onChange={(e) => setEditTitle(e.target.value)}
            className="w-full border-b border-[#d69a3d]/40 bg-transparent text-sm font-semibold text-[#5a4a3a] outline-none transition focus:border-[#d69a3d]"
          />
          <textarea
            value={editContent}
            onChange={(e) => setEditContent(e.target.value)}
            className="h-20 w-full resize-none border border-[#d69a3d]/30 rounded bg-white/50 px-2 py-1 text-xs text-[#5a4a3a] outline-none transition focus:border-[#d69a3d]"
          />
          <div className="flex gap-2 pt-1">
            <button
              onClick={handleSave}
              className="flex-1 rounded text-xs font-semibold bg-[#d69a3d]/70 text-[#1a1410] px-2 py-1 transition hover:bg-[#d69a3d]"
            >
              Salvar
            </button>
            <button
              onClick={handleCancel}
              className="flex-1 rounded text-xs font-semibold bg-red-500/30 text-red-700 px-2 py-1 transition hover:bg-red-500/50"
            >
              Cancelar
            </button>
          </div>
        </div>
      ) : (
        <>
          <div className="mb-1 flex items-start justify-between">
            <h4 className="text-sm font-semibold text-[#5a4a3a] leading-tight">
              {note.title}
            </h4>
            <span className="ml-2 whitespace-nowrap text-[10px] text-[#a98b68]">
              {note.createdAt}
            </span>
          </div>
          
          {note.content && (
            <p className="mb-2 text-xs text-[#6b5a48] leading-relaxed whitespace-pre-wrap">
              {note.content}
            </p>
          )}

          <div className="flex gap-1 opacity-0 transition group-hover:opacity-100">
            <button
              onClick={() => setIsEditing(true)}
              className="text-[10px] px-2 py-1 rounded bg-[#d69a3d]/40 text-[#d69a3d] transition hover:bg-[#d69a3d]/60 font-semibold"
            >
              Editar
            </button>
            <button
              onClick={onDelete}
              className="text-[10px] px-2 py-1 rounded bg-red-500/30 text-red-600 transition hover:bg-red-500/50 font-semibold"
            >
              Deletar
            </button>
          </div>
        </>
      )}
    </div>
  );
}
