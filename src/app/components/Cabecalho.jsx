"use client";

import React, { useState } from "react";
import { usePathname } from "next/navigation";
import { Crown, HeartPulse, ScrollText, Settings, Shield } from "lucide-react";
import { useCharacter } from "../context/CharacterContext";
import { useTheme } from "../context/ThemeContext";
import { useAuth } from "../context/AuthContext";
import { EditableText, EditableNumber, HPBar } from "./ui";
import SettingsModal from "./SettingsModal";
import DanoCuraPainel from "./DanoCuraPainel";

export default function Cabecalho() {
  const pathname = usePathname();
  const { data, upd } = useCharacter();
  const { activeThemeObj } = useTheme();
  const { isMaster, playerCharacters = [], inspectCharacter, activeCharacterId } = useAuth();
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isHpModalOpen, setIsHpModalOpen] = useState(false);

  const isMasterView = pathname?.startsWith("/admin");

  return (
    <>
      <header className="sticky top-0 z-20 border-b border-border/70 bg-background/85 backdrop-blur-xl lg:ml-64">
        <div className="mx-auto max-w-6xl px-4 py-3 sm:px-6 lg:max-w-none lg:px-10">
          <div className="grimoire-card bracket-corners flex flex-col gap-3 rounded-2xl border border-primary/25 bg-card/90 px-4 py-3 sm:px-6 sm:py-3.5 shadow-[0_16px_50px_rgba(0,0,0,0.35)] sm:flex-row sm:items-center sm:justify-between">
            {/* Lado Esquerdo: Identidade do Contexto (Mestre vs. Jogador) */}
            <div className="flex items-center gap-3">
              <div
                className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border shadow-sm ${
                  isMasterView
                    ? "border-amber-400/50 bg-amber-500/10 text-amber-400 shadow-[0_0_15px_rgba(245,158,11,0.2)]"
                    : "border-primary/40 bg-primary/10 text-primary shadow-[0_0_15px_color-mix(in_srgb,var(--primary)_20%,transparent)]"
                }`}
              >
                {isMasterView ? <Crown size={20} /> : <ScrollText size={20} />}
              </div>
              <div>
                <p className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-[0.28em] text-primary">
                  {isMasterView ? "Soberania do Narrador" : "Códice do Aventureiro"}
                </p>
                <h1 className="font-cinzel text-xl sm:text-2xl font-bold tracking-tight text-foreground">
                  {isMasterView ? "Câmara do Mestre" : "Grimorium"}
                </h1>
                <p className="font-journal text-xs italic text-muted-foreground hidden sm:block">
                  {isMasterView
                    ? "Sala de guerra, condução de encontros e controle da mesa"
                    : "Folio vivo de proezas, inventário e contratos da guilda"}
                </p>
              </div>
            </div>

            {/* Lado Direito: Estatísticas do Jogador OU Status da Mesa */}
            <div className="flex items-center justify-between gap-4 sm:justify-end">
              {!isMasterView ? (
                <div className="min-w-0 text-left sm:text-right">
                  <div className="flex items-center gap-2 sm:justify-end">
                    <EditableText
                      value={data.name}
                      onChange={(value) => upd("name", value)}
                      className="font-cinzel block text-base sm:text-lg font-bold text-foreground"
                    />
                    <span className="hidden sm:inline-block rounded border border-primary/30 bg-primary/10 px-1.5 py-0.5 text-[10px] font-semibold text-primary">
                      Nv. {data.level || 1}
                    </span>
                  </div>
                  <div className="mt-1 flex items-center gap-2 sm:justify-end">
                    <button
                      type="button"
                      onClick={() => setIsHpModalOpen(true)}
                      className="cursor-pointer group flex items-center gap-2 hover:opacity-95 transition"
                      title="Clique para abrir painel de Dano e Cura rápida"
                      aria-label="Painel de dano e cura rápida"
                    >
                      <div className="w-24 sm:w-28 transition-transform group-hover:scale-[1.02]">
                        <HPBar hp={data.hp} max={data.hpMax} />
                      </div>
                      <span className="font-mono text-xs font-semibold text-foreground/90 group-hover:text-primary transition-colors">
                        {data.hp}/{data.hpMax} <span className="text-[10px] text-muted-foreground">PV</span>
                      </span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setIsHpModalOpen(true)}
                      className="flex items-center gap-1 rounded-lg border border-primary/30 bg-primary/10 px-2 py-0.5 text-[10px] font-bold text-primary transition hover:border-primary/60 hover:bg-primary/20 active:scale-95"
                      title="Abrir painel rápido de Dano & Cura"
                      aria-label="Abrir painel rápido de Dano e Cura"
                    >
                      <HeartPulse size={11} />
                      <span className="hidden sm:inline">Dano/Cura</span>
                    </button>
                  </div>
                </div>
              ) : (
                <div className="hidden sm:flex flex-col text-right">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-amber-400 flex items-center justify-end gap-1">
                    <Shield size={11} /> Mestre Ativo
                  </span>
                  <span className="font-cinzel text-xs text-muted-foreground">Painel de Campanhas & Combate</span>
                </div>
              )}

              {/* Botão de Configurações com indicação visual de tema */}
              <button
                type="button"
                onClick={() => setIsSettingsOpen(true)}
                className="interactive-lift flex items-center gap-2 rounded-xl border border-primary/20 bg-secondary/80 px-3 py-2 text-xs font-semibold text-muted-foreground transition hover:border-primary/50 hover:text-foreground active:scale-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
                title="Configurações & Temas"
                aria-label="Configurações e temas"
              >
                <Settings size={15} />
                <span className="hidden md:inline">Tema & Ajustes</span>
                {activeThemeObj && (
                  <span
                    className="h-2.5 w-2.5 rounded-full ring-1 ring-white/40 shadow-sm"
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

      {isHpModalOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 p-4 backdrop-blur-sm animate-in fade-in-50"
          onClick={() => setIsHpModalOpen(false)}
        >
          <div
            className="w-full max-w-sm"
            onClick={(e) => e.stopPropagation()}
          >
            <DanoCuraPainel compact onClose={() => setIsHpModalOpen(false)} />
          </div>
        </div>
      )}
    </>
  );
}