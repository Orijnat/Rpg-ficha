"use client";

import React from "react";

export default function NotesCategories({
  categories,
  activeCategory,
  setActiveCategory,
}) {
  return (
    <div className="flex justify-center gap-2">
      {categories.map((category) => (
        <button
          key={category.id}
          onClick={() => setActiveCategory(category.id)}
          className={`
            px-4 py-2 rounded-lg text-sm font-semibold transition
            flex items-center gap-2
            ${
              activeCategory === category.id
                ? "bg-[#d69a3d] text-[#1a1410] shadow-lg shadow-[#d69a3d]/20"
                : "bg-white/10 text-[#d69a3d] border border-[#d69a3d]/40 hover:bg-white/20 hover:border-[#d69a3d]"
            }
          `}
        >
          <span className="text-base">{category.icon}</span>
          {category.label}
        </button>
      ))}
    </div>
  );
}
