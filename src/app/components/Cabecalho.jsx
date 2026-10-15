"use client";

import React, { useState } from "react";
import { Settings } from "lucide-react";
import { useCharacter } from "../context/CharacterContext";
import { useTheme } from "../context/ThemeContext";
import { EditableText, HPBar } from "./ui";
import SettingsModal from "./SettingsModal";

export default function Cabecalho() {
  const { data, upd } = useCharacter();
  const { activeThemeObj } = useTheme();
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);

  return (
    <>
      <header className="sticky top-0 z-20 border-b border-white/10 bg-[#0b0d12]/80 backdrop-blur-xl">
        <div className="mx-auto max-w-6xl px-4 py-4 sm:px-6 lg:px-8">
          <div className="flex flex-col gap-4 rounded-2xl border border-white/10 bg-white/[0.04] px-5 py-4 shadow-[0_18px_60px_rgba(0,0,0,0.24)] sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-[10px] uppercase tracking-[0.32em] text-[#a98b68]">Ficha de personagem</p>
              <h1 className="mt-1 text-2xl font-semibold tracking-tight text-[#f5e9d7] sm:text-3xl">Coração da Montanha</h1>
              <p className="mt-1 text-sm text-[#a98b68]">Controle central da ficha, inventário e contratos</p>
            </div>

            <div className="flex items-center justify-between gap-4 sm:justify-end">
              <div className="min-w-0 text-left sm:text-right">
                <EditableText
                  value={data.name}
                  onChange={(value) => upd("name", value)}
                  className="block text-lg font-semibold text-[#f5e9d7] sm:text-xl"
                />
                <div className="mt-2 flex items-center gap-3 sm:justify-end">
                  <div className="w-28 sm:w-32">
                    <HPBar hp={data.hp} max={data.hpMax} />
                  </div>
                  <span className="font-mono text-xs text-[#a98b68]">
                    {data.hp}/{data.hpMax}
                  </span>
                </div>
              </div>

              {/* Botão de Configurações com indicação visual de tema */}
              <button
                type="button"
                onClick={() => setIsSettingsOpen(true)}
                className="flex items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-xs font-semibold text-[#a98b68] transition hover:border-[#d69a3d]/40 hover:bg-[#d69a3d]/10 hover:text-[#f5e9d7] active:scale-95"
                title="Configurações & Temas"
              >
                <Settings size={15} />
                <span className="hidden sm:inline">Configurações</span>
                {activeThemeObj && (
                  <span
                    className="h-2 w-2 rounded-full ring-1 ring-white/30"
                    style={{ backgroundColor: activeThemeObj.accent }}
                    title={`Tema ativo: ${activeThemeObj.name}`}
                  />
                )}
              </button>
            </div>
          </div>
        </div>
      </header>

      <SettingsModal isOpen={isSettingsOpen} onClose={() => setIsSettingsOpen(false)} />
    </>
  );
}