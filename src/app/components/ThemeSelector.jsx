"use client";

import { useState, useRef, useEffect } from "react";
import { Palette, Check } from "lucide-react";
import { useTheme } from "../context/ThemeContext";

export default function ThemeSelector() {
  const { themeId, setThemeId, themes } = useTheme();
  const [isOpen, setIsOpen] = useState(false);
  const ref = useRef(null);

  // Fecha ao clicar fora
  useEffect(() => {
    function handleClickOutside(event) {
      if (ref.current && !ref.current.contains(event.target)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div className="relative" ref={ref}>
      {/* Botão Trigger */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-1.5 rounded-xl border border-primary/30 bg-secondary px-3 py-2 text-xs font-semibold text-secondary-foreground transition hover:border-primary hover:bg-primary/15 hover:text-foreground active:scale-95"
        title="Escolher Tema"
      >
        <Palette size={15} />
        <span className="hidden sm:inline">Tema</span>
      </button>

      {/* Dropdown */}
      {isOpen && (
        <div className="absolute right-0 top-full z-[100] mt-2 w-72 rounded-2xl border-2 border-primary/40 bg-card p-2.5 shadow-[0_20px_60px_rgba(0,0,0,0.75)] backdrop-blur-2xl">
          <p
            className="px-2.5 py-1.5 text-[10px] uppercase font-semibold tracking-[0.2em] text-muted-foreground"
            style={{ fontFamily: "Cinzel, serif" }}
          >
            Escolha seu Tema
          </p>

          <div className="mt-1 space-y-1">
            {themes.map((theme) => {
              const isActive = themeId === theme.id;
              return (
                <button
                  key={theme.id}
                  type="button"
                  onClick={() => {
                    setThemeId(theme.id);
                    setIsOpen(false);
                  }}
                  className={`group w-full flex items-center gap-3 rounded-xl px-3 py-2.5 text-left transition-all ${
                    isActive
                      ? "bg-primary/15 border border-primary/30 shadow-sm"
                      : "border border-transparent hover:border-primary/30 hover:bg-secondary hover:text-foreground"
                  }`}
                >
                  {/* Preview de cores */}
                  <div className="relative flex shrink-0">
                    <div
                      className="h-5 w-5 rounded-full border-2 border-border shadow-inner"
                      style={{ backgroundColor: theme.preview.accent }}
                    />
                    <div
                      className="h-5 w-5 -ml-1.5 rounded-full border-2 border-border shadow-inner"
                      style={{ backgroundColor: theme.preview.bg }}
                    />
                    <div
                      className="h-5 w-5 -ml-1.5 rounded-full border-2 border-border shadow-inner"
                      style={{ backgroundColor: theme.preview.text }}
                    />
                  </div>

                  {/* Info */}
                  <div className="min-w-0 flex-1">
                    <p className={`text-xs font-semibold truncate ${isActive ? "text-primary" : "text-foreground"}`}>
                      <span className="mr-1">{theme.emoji}</span>
                      {theme.name}
                    </p>
                    <p className="text-[10px] text-muted-foreground truncate">
                      {theme.description}
                    </p>
                  </div>

                  {/* Check ativo */}
                  {isActive && (
                    <div className="flex h-5 w-5 items-center justify-center rounded-full bg-primary/20 shrink-0">
                      <Check size={12} className="text-primary" />
                    </div>
                  )}
                </button>
              );
            })}
          </div>

          {/* Rodapé decorativo */}
          <div className="mt-2 border-t border-border pt-2 px-2.5">
            <p className="text-[9px] text-muted-foreground/60 italic">
              O tema é salvo automaticamente no seu navegador
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
