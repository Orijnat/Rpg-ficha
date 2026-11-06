"use client";

import React, { useState } from "react";
import { Crown, Settings, Heart } from "lucide-react";
import { useCharacter } from "../context/CharacterContext";
import { useTheme } from "../context/ThemeContext";
import { useAuth } from "../context/AuthContext";
import { EditableText, EditableNumber, HPBar } from "./ui";
import SettingsModal from "./SettingsModal";

export default function Cabecalho() {
  const { data, upd } = useCharacter();
  const { activeThemeObj } = useTheme();
  const { isMaster, playerCharacters, inspectCharacter, activeCharacterId } = useAuth();
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);

  const hpPct = data.hpMax > 0 ? Math.round((data.hp / data.hpMax) * 100) : 0;
  const hpColor =
    hpPct > 60 ? "text-emerald-400" : hpPct > 30 ? "text-amber-300" : "text-rose-400";

  return (
    <>
      <header className="sticky top-0 z-20 border-b border-border/70 bg-background/80 backdrop-blur-xl lg:ml-64">
        <div className="mx-auto max-w-6xl px-4 py-3 sm:px-6 lg:max-w-none lg:px-10">
          <div className="ornate-frame flex flex-col gap-3 rounded-2xl border border-border/80 bg-card/80 px-5 py-3 shadow-[0_18px_60px_rgba(0,0,0,0.24)] sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-[10px] uppercase tracking-[0.32em] text-muted-foreground">Ficha de personagem</p>
              <h1 className="mt-1 font-serif text-2xl font-semibold tracking-tight text-foreground sm:text-3xl">Grimorium</h1>
              <p className="mt-1 text-sm text-muted-foreground">Controle central da ficha, inventário e contratos</p>
            </div>

            <div className="flex items-center justify-between gap-4 sm:justify-end">
              <div className="min-w-0 text-left sm:text-right">
                {/* Nome do personagem */}
                <EditableText
                  value={data.name}
                  onChange={(value) => upd("name", value)}
                  className="block text-lg font-semibold text-foreground sm:text-xl"
                />

                {/* Controle de Pontos de Vida */}
                <div className="mt-2 flex flex-col gap-1.5 sm:items-end">
                  <div className="flex items-center gap-2">
                    {/* Rótulo */}
                    <div className="flex items-center gap-1 text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">
                      <Heart size={11} className={hpColor} />
                      <span>PV</span>
                    </div>
                    {/* Botão − */}
                    <button
                      type="button"
                      aria-label="Reduzir 1 ponto de vida"
                      onClick={() => upd("hp", Math.max(0, data.hp - 1))}
                      className="flex h-6 w-6 items-center justify-center rounded-md border border-destructive/40 bg-destructive/20 text-sm font-bold text-foreground transition hover:bg-destructive/50 active:scale-95"
                    >
                      −
                    </button>
                    {/* hp / hpMax editáveis */}
                    <div className="flex items-baseline gap-0.5 font-mono text-sm font-bold">
                      <EditableNumber
                        value={data.hp}
                        onChange={(v) => upd("hp", v)}
                        min={0}
                        max={data.hpMax}
                        label="Pontos de vida atuais"
                        className={`w-7 text-center ${hpColor}`}
                      />
                      <span className="text-muted-foreground text-xs">/</span>
                      <EditableNumber
                        value={data.hpMax}
                        onChange={(v) => upd("hpMax", v)}
                        min={1}
                        disabled={!isMaster}
                        label="HP Máximo"
                        className="w-7 text-center text-muted-foreground text-xs"
                      />
                    </div>
                    {/* Botão + */}
                    <button
                      type="button"
                      aria-label="Recuperar 1 ponto de vida"
                      onClick={() => upd("hp", Math.min(data.hpMax, data.hp + 1))}
                      className="flex h-6 w-6 items-center justify-center rounded-md border border-emerald-400/30 bg-emerald-900/40 text-sm font-bold text-foreground transition hover:bg-emerald-800/60 active:scale-95"
                    >
                      +
                    </button>
                    {/* % */}
                    <span className={`text-[10px] font-semibold ${hpColor}`}>{hpPct}%</span>
                  </div>
                  {/* Barra de HP */}
                  <div className="w-full sm:w-48">
                    <HPBar hp={data.hp} max={data.hpMax} />
                  </div>
                </div>
              </div>

              {/* Seletor rápido de ficha de jogador para o Mestre */}
              {isMaster && playerCharacters.length > 0 && (
                <div className="flex items-center gap-1.5 rounded-xl border border-primary/40 bg-secondary/70 px-2.5 py-2 text-xs">
                  <Crown size={14} className="text-primary shrink-0" />
                  <select
                    value={activeCharacterId || ""}
                    onChange={(e) => inspectCharacter(e.target.value)}
                    className="bg-transparent text-xs font-semibold text-foreground outline-none cursor-pointer max-w-[130px] truncate"
                    title="Alternar ficha do jogador"
                  >
                    <option value="" disabled className="bg-card text-foreground">Ficha do jogador</option>
                    {playerCharacters.map((c) => (
                      <option key={c.id} value={c.id} className="bg-card text-foreground">
                        {c.name} ({c.owner?.username || "Jogador"})
                      </option>
                    ))}
                  </select>
                </div>
              )}

              {/* Botão de Configurações com indicação visual de tema */}
              <button
                type="button"
                onClick={() => setIsSettingsOpen(true)}
                className="interactive-lift flex items-center gap-2 rounded-xl border border-border bg-secondary/60 px-3 py-2 text-xs font-semibold text-muted-foreground transition hover:text-foreground active:scale-95"
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