"use client";

import React, { useState } from "react";
import { usePathname } from "next/navigation";
import { Crown, HeartPulse, Minus, Plus, ScrollText, Settings, Shield } from "lucide-react";
import { useCharacter } from "../context/CharacterContext";
import { useTheme } from "../context/ThemeContext";
import { useAuth } from "../context/AuthContext";
import { EditableText, HPBar } from "./ui";
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
      <header className="sticky top-0 z-20 border-b border-primary/20 bg-background/90 backdrop-blur-2xl lg:ml-64 shadow-[0_4px_25px_rgba(0,0,0,0.7)]">
        <div className="mx-auto max-w-6xl px-4 py-3 sm:px-6 lg:max-w-none lg:px-10">
          <div className="grimoire-card bracket-corners flex flex-col gap-3 rounded-2xl border border-primary/35 bg-card/95 px-4 py-3 sm:px-6 sm:py-3.5 shadow-[0_16px_50px_rgba(0,0,0,0.6)] sm:flex-row sm:items-center sm:justify-between">
            {/* Lado Esquerdo: Identidade do Contexto (Mestre vs. Jogador) */}
            <div className="flex items-center gap-3">
              <div
                className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border shadow-md ${
                  isMasterView
                    ? "border-amber-400/70 bg-gradient-to-b from-amber-500/25 to-amber-500/10 text-amber-400 shadow-[0_0_20px_rgba(245,158,11,0.35)]"
                    : "border-primary/60 bg-gradient-to-b from-primary/30 to-primary/10 text-primary shadow-[0_0_20px_color-mix(in_srgb,var(--primary)_35%,transparent)]"
                }`}
              >
                {isMasterView ? <Crown size={22} className="drop-shadow-[0_0_8px_#f59e0b]" /> : <ScrollText size={22} className="drop-shadow-[0_0_8px_var(--primary)]" />}
              </div>
              <div>
                <p className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-[0.28em] text-primary">
                  <span>✦</span>
                  <span>{isMasterView ? "Soberania do Narrador" : "Códice do Aventureiro"}</span>
                  <span>✦</span>
                </p>
                <h1 className="font-decorative text-xl sm:text-2xl font-black tracking-tight gold-gradient-text">
                  {isMasterView ? "Câmara do Mestre" : "Grimorium"}
                </h1>
                <p className="font-journal text-xs italic text-muted-foreground/90 hidden sm:block">
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
                      className="font-cinzel block text-base sm:text-lg font-black text-foreground drop-shadow-[0_1px_3px_rgba(0,0,0,0.8)]"
                    />
                    <span className="wax-seal bg-primary/20 text-primary border border-primary/40 shadow-[0_0_10px_color-mix(in_srgb,var(--primary)_25%,transparent)]">
                      Nv. {data.level || 1}
                    </span>
                  </div>

                  {/* Orbe / Barra de vida inline com controles de metal fundido */}
                  <div className="mt-1.5 flex items-center gap-1.5 sm:justify-end">
                    {/* Botão − */}
                    <button
                      type="button"
                      aria-label="Reduzir 1 ponto de vida"
                      title="Dano -1 PV"
                      onClick={() => upd("hp", Math.max(0, (Number(data.hp) || 0) - 1))}
                      className="flex h-6 w-6 shrink-0 items-center justify-center rounded-lg border border-rose-500/50 bg-gradient-to-b from-rose-950/70 to-rose-900/40 font-mono text-sm font-black text-rose-300 shadow-[0_2px_6px_rgba(0,0,0,0.6)] transition-all hover:bg-rose-900/80 hover:border-rose-400 hover:shadow-[0_0_10px_rgba(244,63,94,0.4)] active:scale-95"
                    >
                      <Minus size={11} />
                    </button>

                    {/* Barra clicável (Frasco de Alquimia) */}
                    <button
                      type="button"
                      onClick={() => setIsHpModalOpen(true)}
                      className="group flex items-center gap-2 hover:opacity-95 transition"
                      title="Clique para painel de Dano & Cura"
                      aria-label="Painel de dano e cura rápida"
                    >
                      <div className="w-24 sm:w-32 transition-transform group-hover:scale-[1.03]">
                        <HPBar hp={data.hp} max={data.hpMax} />
                      </div>
                      <span className="font-mono text-xs font-bold text-foreground group-hover:text-primary transition-colors whitespace-nowrap drop-shadow-[0_1px_2px_rgba(0,0,0,0.9)]">
                        {data.hp}/{data.hpMax} <span className="text-[10px] text-muted-foreground uppercase font-cinzel">PV</span>
                      </span>
                    </button>

                    {/* Botão + */}
                    <button
                      type="button"
                      aria-label="Recuperar 1 ponto de vida"
                      title="Cura +1 PV"
                      onClick={() => upd("hp", Math.min(Number(data.hpMax) || 1, (Number(data.hp) || 0) + 1))}
                      className="flex h-6 w-6 shrink-0 items-center justify-center rounded-lg border border-emerald-500/50 bg-gradient-to-b from-emerald-950/70 to-emerald-900/40 font-mono text-sm font-black text-emerald-300 shadow-[0_2px_6px_rgba(0,0,0,0.6)] transition-all hover:bg-emerald-900/80 hover:border-emerald-400 hover:shadow-[0_0_10px_rgba(16,185,129,0.4)] active:scale-95"
                    >
                      <Plus size={11} />
                    </button>

                    {/* Botão Dano/Cura completo */}
                    <button
                      type="button"
                      onClick={() => setIsHpModalOpen(true)}
                      className="btn-rpg !px-2.5 !py-1 !text-[10px] !normal-case"
                      title="Abrir painel rápido de Dano & Cura"
                      aria-label="Abrir painel rápido de Dano e Cura"
                    >
                      <HeartPulse size={12} className="text-rose-400" />
                      <span className="hidden sm:inline font-cinzel font-bold">Dano/Cura</span>
                    </button>
                  </div>
                </div>
              ) : (
                <div className="hidden sm:flex flex-col text-right">
                  <span className="wax-seal bg-amber-500/20 text-amber-300 border border-amber-400/50 shadow-[0_0_12px_rgba(245,158,11,0.25)]">
                    <Shield size={11} /> Mestre Ativo
                  </span>
                  <span className="font-cinzel text-xs text-muted-foreground/80 mt-1">Painel de Campanhas & Combate</span>
                </div>
              )}

              {/* Botão de Configurações com indicação visual de tema */}
              <button
                type="button"
                onClick={() => setIsSettingsOpen(true)}
                className="interactive-lift flex items-center gap-2 rounded-xl border border-primary/30 bg-secondary/80 px-3.5 py-2 text-xs font-semibold text-muted-foreground transition hover:border-primary hover:text-foreground active:scale-95 shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
                title="Configurações & Temas"
                aria-label="Configurações e temas"
              >
                <Settings size={15} className="text-primary/80" />
                <span className="hidden md:inline font-cinzel tracking-wider">Ajustes</span>
                {activeThemeObj && (
                  <span
                    className="h-3 w-3 rounded-full ring-1 ring-white/50 shadow-[0_0_8px_var(--theme-accent-glow)]"
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