"use client";

import { useState, useRef, useEffect } from "react";
import { Palette, Check } from "lucide-react";
import { useTheme } from "../context/ThemeContext";

export default function ThemeSelector() {
  const { theme, setTheme, themeId, setThemeId, themes } = useTheme();
  const currentId = theme || themeId;
  const selectTheme = setTheme || setThemeId;
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
            className="px-2.5 py-1.5 text-[10px] uppercase font-semibold tracking-[0.2em] text-muted-foreground font-cinzel"
          >
            Escolha a Atmosfera
          </p>

          <div className="mt-1 space-y-1">
            {themes.map((t) => {
              const isActive = currentId === t.id;
              const colorAccent = t.preview?.accent || t.previewColors?.[1] || t.accent;
              const colorBg = t.preview?.bg || t.previewColors?.[0] || t.bg;
              const colorText = t.preview?.text || t.previewColors?.[2] || t.titleColor;

              return (
                <button
                  key={t.id}
                  type="button"
                  onClick={() => {
                    if (selectTheme) selectTheme(t.id);
                    setIsOpen(false);
                  }}
                  className={`group w-full flex items-center gap-3 rounded-xl px-3 py-2 text-left transition-all ${
                    isActive
                      ? "bg-primary/15 border border-primary/40 shadow-sm"
                      : "border border-transparent hover:border-primary/30 hover:bg-secondary hover:text-foreground"
                  }`}
                >
                  {/* Preview de cores */}
                  <div className="relative flex shrink-0">
                    <div
                      className="h-4 w-4 rounded-full border border-border shadow-inner"
                      style={{ backgroundColor: colorAccent }}
                    />
                    <div
                      className="h-4 w-4 -ml-1.5 rounded-full border border-border shadow-inner"
                      style={{ backgroundColor: colorBg }}
                    />
                    <div
                      className="h-4 w-4 -ml-1.5 rounded-full border border-border shadow-inner"
                      style={{ backgroundColor: colorText }}
                    />
                  </div>

                  {/* Info */}
                  <div className="min-w-0 flex-1">
                    <p className={`text-xs font-semibold truncate ${isActive ? "text-primary" : "text-foreground"}`}>
                      {t.name}
                    </p>
                    <p className="text-[10px] text-muted-foreground truncate">
                      {t.subtitle || t.description}
                    </p>
                  </div>

                  {/* Check ativo */}
                  {isActive && (
                    <div className="flex h-4 w-4 items-center justify-center rounded-full bg-primary/20 shrink-0">
                      <Check size={11} className="text-primary" />
                    </div>
                  )}
                </button>
              );
            })}
          </div>

          {/* Rodapé decorativo */}
          <div className="mt-2 border-t border-border pt-2 px-2.5">
            <p className="text-[9px] text-muted-foreground/70 italic">
              O tema é salvo automaticamente na sua sessão
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
