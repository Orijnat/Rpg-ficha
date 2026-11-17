"use client";

import React, { useState } from "react";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { Crown, HeartPulse, Settings, Shield } from "lucide-react";
import { useCharacter } from "../context/CharacterContext";
import { useTheme } from "../context/ThemeContext";
import { useAuth } from "../context/AuthContext";
import { EditableText, HPBar } from "./ui";
import SettingsModal from "./SettingsModal";
import dynamic from "next/dynamic";
const DanoCuraPainel = dynamic(() => import("./DanoCuraPainel"), { ssr: false });
import XPBar from "./XPBar";

export default function Cabecalho() {
  const pathname = usePathname();
  const { data, upd } = useCharacter();
  const { activeThemeObj } = useTheme();
  const { isMaster, playerCharacters = [], inspectCharacter, activeCharacterId, activeCharacter, loading: authLoading } = useAuth();
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
              {isMasterView ? (
                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-amber-400/70 bg-gradient-to-b from-amber-500/25 to-amber-500/10 text-amber-400 shadow-[0_0_20px_rgba(245,158,11,0.35)]">
                  <Crown size={22} className="drop-shadow-[0_0_8px_#f59e0b]" />
                </div>
              ) : (
                <Image src="/ambar-vulcanico.svg" alt="Grimorium" width={44} height={44} priority className="h-11 w-11 shrink-0 rounded-xl shadow-[0_0_20px_color-mix(in_srgb,var(--primary)_35%,transparent)]" />
              )}
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
              {!isMasterView && !authLoading && !activeCharacter ? (
                <div className="hidden sm:flex flex-col text-right">
                  <span className="wax-seal bg-amber-500/20 text-amber-300 border border-amber-400/50 shadow-[0_0_12px_rgba(245,158,11,0.25)]">
                    <Shield size={11} /> {isMaster ? "Nenhuma ficha própria" : "Nenhuma ficha ativa"}
                  </span>
                  <span className="font-cinzel text-xs text-muted-foreground/80 mt-1">
                    {isMaster ? "Abra a ficha de um herói pelo Painel do Mestre" : "Nenhuma ficha vinculada a esta conta"}
                  </span>
                </div>
              ) : !isMasterView ? (
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

                  {/* Barra de PV somente leitura + botão Dano/Cura (abre a gestão de vitalidade) */}
                  <div className="mt-1.5 flex items-center gap-2 sm:justify-end">
                    <button
                      type="button"
                      onClick={() => setIsHpModalOpen(true)}
                      className="group flex items-center gap-2 hover:opacity-95 transition"
                      title="Gestão de Vitalidade (dano & cura)"
                      aria-label="Gestão de Vitalidade (dano e cura)"
                    >
                      <div className="w-24 sm:w-32 transition-transform group-hover:scale-[1.03]">
                        <HPBar hp={data.hp} max={data.hpMax} />
                      </div>
                      <span className="font-mono text-xs font-bold text-foreground group-hover:text-primary transition-colors whitespace-nowrap drop-shadow-[0_1px_2px_rgba(0,0,0,0.9)]">
                        {data.hp}/{data.hpMax} <span className="text-[10px] text-muted-foreground uppercase font-cinzel">PV</span>
                      </span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setIsHpModalOpen(true)}
                      className="btn-rpg !px-2.5 !py-1 !text-[10px] !normal-case"
                      title="Abrir painel de Dano & Cura"
                      aria-label="Abrir painel de Dano e Cura"
                    >
                      <HeartPulse size={12} className="text-rose-400" />
                      <span className="hidden sm:inline font-cinzel font-bold">Dano/Cura</span>
                    </button>
                  </div>

                  {/* Barra de XP/Nível */}
                  <div className="mt-2 w-full max-w-[13rem] sm:max-w-[16rem] sm:ml-auto">
                    <XPBar />
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