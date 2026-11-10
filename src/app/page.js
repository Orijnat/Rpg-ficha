"use client";

import { useState } from "react";
import Link from "next/link";
import {
  ArrowRight,
  BookOpen,
  CheckCircle2,
  Coins,
  Compass,
  Crown,
  Dices,
  Flame,
  Heart,
  HeartPulse,
  Layers,
  Map,
  Package,
  ScrollText,
  Shield,
  Skull,
  Sparkles,
  Swords,
  Users,
  Zap,
} from "lucide-react";

export default function Home() {
  const [activeTab, setActiveTab] = useState("player"); // "player" | "master"
  const [demoRoll, setDemoRoll] = useState(null);

  const handleDemoRoll = () => {
    const d20 = Math.floor(Math.random() * 20) + 1;
    const mod = 3;
    setDemoRoll({ natural: d20, total: d20 + mod, mod });
  };

  return (
    <div
      data-theme="amber"
      className="relative isolate min-h-screen overflow-hidden text-[#ebd9be] bg-[#090b0e]"
      style={{
        backgroundColor: "#090b0e",
        color: "#ebd9be",
      }}
    >
      {/* Luzes e Auras Místicas de Fundo Fixas Canônicas (Âmbar Vulcânico) */}
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_20%_10%,rgba(216,155,56,0.18),transparent_40%),radial-gradient(circle_at_80%_25%,rgba(142,90,247,0.10),transparent_35%)]" />
      <div className="pointer-events-none absolute left-1/2 top-24 h-96 w-96 -translate-x-1/2 rounded-full bg-[rgba(216,155,56,0.35)] blur-3xl opacity-40" />

      {/* Topo / Header Público */}
      <header className="relative z-20 mx-auto flex max-w-7xl items-center justify-between px-5 py-4 sm:px-8 lg:px-12 border-b border-primary/20 backdrop-blur-md">
        <Link href="/" className="flex items-center gap-3" aria-label="Grimorium, início">
          <div className="flex h-11 w-11 items-center justify-center rounded-xl border border-primary/50 bg-primary/10 text-primary shadow-[0_0_20px_color-mix(in_srgb,var(--primary)_30%,transparent)]">
            <ScrollText size={22} />
          </div>
          <div>
            <span className="block font-cinzel text-base font-bold tracking-[0.16em] text-foreground">
              Grimorium
            </span>
            <span className="block font-journal text-xs italic text-muted-foreground">
              Grimório Digital & Sala de Guerra
            </span>
          </div>
        </Link>

        <nav className="flex items-center gap-2 sm:gap-4" aria-label="Navegação pública">
          <Link
            href="/login"
            className="rounded-xl px-3.5 py-2 font-cinzel text-xs font-bold uppercase tracking-wider text-muted-foreground transition hover:text-foreground focus:outline-none focus:ring-2 focus:ring-primary sm:px-4"
          >
            Entrar
          </Link>
          <Link
            href="/registro"
            className="interactive-lift rounded-xl border border-primary/50 bg-primary px-4 py-2 font-cinzel text-xs font-bold uppercase tracking-wider text-primary-foreground shadow-lg shadow-primary/25 transition hover:brightness-110 active:scale-95 focus:outline-none focus:ring-2 focus:ring-primary"
          >
            Criar Conta
          </Link>
        </nav>
      </header>

      <main className="relative z-10">
        {/* ========================================================================= */}
        {/* 1. HERO SECTION                                                          */}
        {/* ========================================================================= */}
        <section className="mx-auto max-w-7xl px-5 pt-12 pb-16 sm:px-8 sm:pt-20 lg:px-12 lg:pb-24">
          <div className="text-center max-w-3xl mx-auto">
            <div className="inline-flex items-center gap-2 rounded-full border border-primary/30 bg-primary/10 px-4 py-1 mb-6 text-xs font-semibold uppercase tracking-[0.24em] text-primary">
              <Sparkles size={14} className="text-primary animate-pulse" />
              <span>Plataforma Definitiva para Mesas de RPG d20</span>
            </div>

            <h1 className="font-cinzel text-4xl font-black leading-tight tracking-tight text-foreground sm:text-6xl lg:text-7xl">
              O Códice dos Heróis.{" "}
              <span className="text-primary block mt-1">A Sala de Guerra do Mestre.</span>
            </h1>

            <p className="mt-6 font-journal text-lg sm:text-2xl leading-relaxed text-foreground/80 max-w-2xl mx-auto italic">
              Diga adeus às planilhas frias e anotações perdidas. Grimorium combina um
              <strong> códice vivo e tátil</strong> para aventureiros com um <strong>painel de combate em tempo real</strong> para narradores.
            </p>

            <div className="mt-9 flex flex-col items-center justify-center gap-3 sm:flex-row">
              <Link
                href="/registro"
                className="interactive-lift flex min-h-12 w-full sm:w-auto items-center justify-center gap-2 rounded-xl border border-primary bg-primary px-7 font-cinzel text-sm font-bold uppercase tracking-wider text-primary-foreground shadow-xl shadow-primary/30 transition hover:brightness-110 active:scale-95"
              >
                <span>Começar Minha Jornada</span>
                <ArrowRight size={16} />
              </Link>
              <Link
                href="/login"
                className="flex min-h-12 w-full sm:w-auto items-center justify-center rounded-xl border border-primary/30 bg-secondary/80 px-6 font-cinzel text-xs font-bold uppercase tracking-wider text-foreground hover:bg-primary/15 transition active:scale-95"
              >
                Já Tenho uma Mesa (Entrar)
              </Link>
            </div>

            <p className="mt-4 font-journal text-xs sm:text-sm italic text-muted-foreground">
              Totalmente gratuito · Sem downloads · Funciona em smartphones, tablets e desktop
            </p>
          </div>

          {/* ========================================================================= */}
          {/* 2. SHOWCASE INTERATIVO (ALTERNÂNCIA: JOGADOR VS. MESTRE)                  */}
          {/* ========================================================================= */}
          <div className="mt-14 max-w-5xl mx-auto">
            {/* Seletor de Modo na Vitrine */}
            <div className="flex items-center justify-center gap-2 mb-6">
              <button
                type="button"
                onClick={() => setActiveTab("player")}
                className={`flex items-center gap-2 rounded-xl px-5 py-2.5 font-cinzel text-xs font-bold uppercase tracking-wider transition-all ${
                  activeTab === "player"
                    ? "border border-primary bg-primary/25 text-primary shadow-lg shadow-primary/20 scale-105"
                    : "border border-border bg-secondary/50 text-muted-foreground hover:text-foreground"
                }`}
              >
                <ScrollText size={16} />
                <span>Visão do Jogador (Grimório)</span>
              </button>

              <button
                type="button"
                onClick={() => setActiveTab("master")}
                className={`flex items-center gap-2 rounded-xl px-5 py-2.5 font-cinzel text-xs font-bold uppercase tracking-wider transition-all ${
                  activeTab === "master"
                    ? "border border-amber-400 bg-amber-500/25 text-amber-300 shadow-lg shadow-amber-500/20 scale-105"
                    : "border border-border bg-secondary/50 text-muted-foreground hover:text-foreground"
                }`}
              >
                <Crown size={16} />
                <span>Visão do Mestre (Sala de Guerra)</span>
              </button>
            </div>

            {/* Painel do Jogador */}
            {activeTab === "player" && (
              <div className="grimoire-card bracket-corners rounded-2xl p-6 sm:p-8 transition-all animate-in fade-in-50">
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-primary/25 pb-5">
                  <div>
                    <span className="wax-seal bg-primary/20 text-primary border border-primary/40">
                      Ficha do Aventureiro
                    </span>
                    <h3 className="mt-2 font-cinzel text-2xl sm:text-3xl font-black text-foreground">
                      Sir Galahad de Astora
                    </h3>
                    <p className="font-journal text-sm italic text-muted-foreground">
                      Paladino da Chama Eterna · Nível 4 · Ordem dos Cavaleiros do Sol
                    </p>
                  </div>

                  {/* Vida & Frasco de Vitalidade */}
                  <div className="w-full sm:w-64 bg-background/60 p-3 rounded-xl border border-primary/20">
                    <div className="flex items-center justify-between text-xs mb-1.5">
                      <span className="font-cinzel text-[11px] font-bold uppercase text-muted-foreground">Vitalidade (PV)</span>
                      <strong className="font-mono text-emerald-400">28 / 32 PV</strong>
                    </div>
                    <div className="h-2.5 w-full bg-black/60 rounded-full overflow-hidden p-0.5 border border-white/10">
                      <div className="h-full bg-gradient-to-r from-emerald-600 to-emerald-400 rounded-full w-[87%]" />
                    </div>
                  </div>
                </div>

                {/* Os 7 Atributos em Medalhões Arcanos */}
                <div className="mt-6">
                  <div className="flex items-center justify-between mb-3">
                    <span className="font-cinzel text-xs font-bold uppercase tracking-wider text-primary">
                      Atributos Fundamentais (Clique no modificador para rolar)
                    </span>
                    <span className="font-journal text-xs italic text-muted-foreground hidden sm:inline">
                      1 clique resolve a jogada d20
                    </span>
                  </div>

                  <div className="grid grid-cols-4 sm:grid-cols-7 gap-2 sm:gap-3">
                    {[
                      { label: "FOR", score: 16, mod: "+3" },
                      { label: "DES", score: 12, mod: "+1" },
                      { label: "CON", score: 14, mod: "+2" },
                      { label: "SAB", score: 10, mod: "0" },
                      { label: "ESP", score: 15, mod: "+2" },
                      { label: "CAR", score: 16, mod: "+3" },
                      { label: "INT", score: 8, mod: "-1" },
                    ].map((attr) => (
                      <div
                        key={attr.label}
                        className="medallion-plate flex flex-col items-center rounded-xl p-2.5 text-center"
                      >
                        <span className="font-cinzel text-[10px] font-bold text-primary/90">{attr.label}</span>
                        <button
                          type="button"
                          onClick={handleDemoRoll}
                          className="my-1 w-full rounded-lg bg-primary/15 border border-primary/30 py-1 hover:bg-primary/25 transition active:scale-95"
                          title={`Clique para simular teste de ${attr.label}`}
                        >
                          <span className="font-cinzel text-lg font-black text-foreground">{attr.mod}</span>
                          <span className="block text-[8px] uppercase tracking-wider text-muted-foreground">rolar</span>
                        </button>
                        <span className="text-[10px] text-muted-foreground/80 font-mono">Base {attr.score}</span>
                      </div>
                    ))}
                  </div>

                  {/* Feedback da Rolagem Interativa da Demo */}
                  {demoRoll && (
                    <div className="mt-4 flex items-center justify-between rounded-xl border border-primary/50 bg-primary/10 p-3 text-xs animate-in fade-in-50">
                      <div className="flex items-center gap-2">
                        <Dices size={16} className="text-primary animate-spin" />
                        <span className="font-cinzel font-bold text-foreground">
                          Resultado da Rolagem:
                        </span>
                        <span className="font-mono text-muted-foreground">
                          1d20 ({demoRoll.natural}) + {demoRoll.mod} =
                        </span>
                        <strong className="font-cinzel text-base font-black text-primary">
                          {demoRoll.total}
                        </strong>
                      </div>
                      <span className="font-journal text-xs italic text-primary">
                        {demoRoll.natural === 20 ? "🎉 Sucesso Crítico!" : demoRoll.natural === 1 ? "💀 Falha Crítica!" : "Sucesso!"}
                      </span>
                    </div>
                  )}
                </div>

                {/* Resumo de Inventário e Recursos Especiais */}
                <div className="mt-6 grid grid-cols-1 sm:grid-cols-3 gap-3 border-t border-primary/20 pt-5">
                  <div className="flex items-center gap-3 p-3 rounded-xl bg-background/40 border border-white/5">
                    <Shield size={20} className="text-amber-400" />
                    <div>
                      <span className="block font-cinzel text-[10px] uppercase tracking-wider text-muted-foreground">Classe Armadura</span>
                      <strong className="font-cinzel text-lg font-bold text-foreground">18 (Escudo de Ferro)</strong>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 p-3 rounded-xl bg-background/40 border border-white/5">
                    <Zap size={20} className="text-sky-400" />
                    <div>
                      <span className="block font-cinzel text-[10px] uppercase tracking-wider text-muted-foreground">Pontos de Energia (PE)</span>
                      <strong className="font-mono text-lg font-bold text-sky-300">12 / 12</strong>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 p-3 rounded-xl bg-background/40 border border-white/5">
                    <Package size={20} className="text-emerald-400" />
                    <div>
                      <span className="block font-cinzel text-[10px] uppercase tracking-wider text-muted-foreground">Carga da Mochila</span>
                      <strong className="font-mono text-lg font-bold text-foreground">7 / 16 unidades</strong>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Painel do Mestre */}
            {activeTab === "master" && (
              <div className="war-room-card bracket-corners rounded-2xl p-6 sm:p-8 transition-all animate-in fade-in-50 border border-amber-400/40">
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-primary/25 pb-5">
                  <div>
                    <span className="wax-seal bg-amber-500/20 text-amber-300 border border-amber-400/40">
                      Soberania do Narrador · Sala de Guerra
                    </span>
                    <h3 className="mt-2 font-cinzel text-2xl sm:text-3xl font-black text-foreground">
                      Mesa: A Maldição da Cripta Negra
                    </h3>
                    <p className="font-journal text-sm italic text-muted-foreground">
                      Encontro Ativo · Rodada 2 · 4 Heróis e 3 Inimigos na Arena
                    </p>
                  </div>

                  <div className="flex items-center gap-2">
                    <span className="rounded-full bg-amber-400/20 border border-amber-400/40 px-3 py-1 font-cinzel text-xs font-bold text-amber-300">
                      ⚔️ Turno Ativo
                    </span>
                  </div>
                </div>

                {/* Rastreador de Iniciativa e Combate */}
                <div className="mt-6 space-y-2.5">
                  <span className="font-cinzel text-xs font-bold uppercase tracking-wider text-amber-300 block mb-2">
                    Ordem de Iniciativa & Pontos de Vida em Tempo Real:
                  </span>

                  {/* Combatente 1 (Turno Ativo) */}
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3 rounded-xl border border-amber-400/80 bg-gradient-to-r from-amber-500/20 via-card to-card shadow-[0_0_20px_rgba(245,158,11,0.2)]">
                    <div className="flex items-center gap-3">
                      <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-amber-400 text-black font-cinzel font-black text-sm">
                        1
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <strong className="font-cinzel text-sm font-bold text-foreground">Sir Galahad (Herói)</strong>
                          <span className="wax-seal bg-primary/20 text-primary border border-primary/40">Herói</span>
                          <span className="animate-pulse rounded bg-amber-400/30 px-1.5 py-0.2 text-[9px] font-bold text-amber-300 border border-amber-400">Turno Ativo</span>
                        </div>
                        <span className="font-journal text-xs italic text-muted-foreground">Iniciativa 19 · CA 18</span>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <span className="font-mono text-xs font-bold text-foreground">28/32 PV</span>
                      <div className="flex items-center gap-1">
                        <button type="button" className="rounded bg-rose-950/60 px-1.5 py-0.5 font-mono text-[10px] text-rose-300 border border-rose-500/40">-5</button>
                        <button type="button" className="rounded bg-rose-950/60 px-1.5 py-0.5 font-mono text-[10px] text-rose-300 border border-rose-500/40">-1</button>
                        <button type="button" className="rounded bg-emerald-950/60 px-1.5 py-0.5 font-mono text-[10px] text-emerald-300 border border-emerald-500/40">+1</button>
                        <button type="button" className="rounded bg-emerald-950/60 px-1.5 py-0.5 font-mono text-[10px] text-emerald-300 border border-emerald-500/40">+5</button>
                      </div>
                    </div>
                  </div>

                  {/* Combatente 2 */}
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3 rounded-xl border border-border/70 bg-secondary/40">
                    <div className="flex items-center gap-3">
                      <div className="flex h-8 w-8 items-center justify-center rounded-lg border border-border bg-background font-cinzel font-bold text-sm text-muted-foreground">
                        2
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <strong className="font-cinzel text-sm font-bold text-foreground">Gárgula de Pedra (NPC)</strong>
                          <span className="wax-seal bg-rose-950/40 text-rose-300 border border-rose-500/40">Inimigo</span>
                          <span className="wax-seal bg-purple-950/40 text-purple-300 border border-purple-500/40">Atordoado</span>
                        </div>
                        <span className="font-journal text-xs italic text-muted-foreground">Iniciativa 14 · CA 16</span>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <span className="font-mono text-xs font-bold text-foreground">18/45 PV</span>
                      <div className="flex items-center gap-1">
                        <button type="button" className="rounded bg-rose-950/60 px-1.5 py-0.5 font-mono text-[10px] text-rose-300 border border-rose-500/40">-5</button>
                        <button type="button" className="rounded bg-rose-950/60 px-1.5 py-0.5 font-mono text-[10px] text-rose-300 border border-rose-500/40">-1</button>
                        <button type="button" className="rounded bg-emerald-950/60 px-1.5 py-0.5 font-mono text-[10px] text-emerald-300 border border-emerald-500/40">+1</button>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="mt-5 flex flex-wrap items-center justify-between gap-3 border-t border-primary/20 pt-4 text-xs">
                  <span className="font-journal text-muted-foreground italic">
                    Convoque novos jogadores compartilhando o link de convite em 1 clique
                  </span>
                  <Link
                    href="/registro"
                    className="font-cinzel font-bold text-amber-300 hover:text-amber-200 transition underline underline-offset-4"
                  >
                    Experimentar Painel do Mestre →
                  </Link>
                </div>
              </div>
            )}
          </div>
        </section>

        {/* ========================================================================= */}
        {/* 3. OS DOIS PILARES DA MESA: JOGADOR & MESTRE                              */}
        {/* ========================================================================= */}
        <section className="border-t border-primary/20 bg-black/25 py-20 px-5 sm:px-8 lg:px-12">
          <div className="mx-auto max-w-7xl">
            <div className="text-center max-w-3xl mx-auto mb-16">
              <span className="font-cinzel text-xs font-bold uppercase tracking-[0.28em] text-primary">
                Desenvolvido para as Duas Pontas da Mesa
              </span>
              <h2 className="mt-3 font-cinzel text-3xl sm:text-5xl font-black text-foreground">
                Tudo o que sua sessão precisa, em harmonia.
              </h2>
              <p className="mt-4 font-journal text-lg italic text-muted-foreground">
                Cada detalhe foi desenhado para eliminar interrupções e manter os olhos no jogo e na imaginação.
              </p>
            </div>

            {/* Grid Dividido: Para o Jogador vs Para o Mestre */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Coluna 1: Jogadores */}
              <div className="grimoire-card bracket-corners rounded-2xl p-6 sm:p-8 space-y-6">
                <div className="flex items-center gap-3 border-b border-primary/20 pb-4">
                  <div className="flex h-12 w-12 items-center justify-center rounded-xl border border-primary/40 bg-primary/10 text-primary shadow-sm">
                    <ScrollText size={24} />
                  </div>
                  <div>
                    <span className="font-cinzel text-[10px] font-bold uppercase tracking-wider text-primary">
                      Para os Aventureiros
                    </span>
                    <h3 className="font-cinzel text-2xl font-bold text-foreground">
                      O Grimório Vivo do Jogador
                    </h3>
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="flex items-start gap-3.5">
                    <CheckCircle2 size={18} className="text-primary shrink-0 mt-1" />
                    <div>
                      <strong className="font-cinzel text-sm text-foreground block">
                        7 Atributos & 19 Perícias Canônicas
                      </strong>
                      <p className="font-journal text-sm leading-relaxed text-muted-foreground mt-0.5">
                        Cálculos automáticos de modificador e proficiência com rolagens de d20 disparadas com um simples toque no valor.
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3.5">
                    <CheckCircle2 size={18} className="text-primary shrink-0 mt-1" />
                    <div>
                      <strong className="font-cinzel text-sm text-foreground block">
                        Grimório de Habilidades & Treino Ativo
                      </strong>
                      <p className="font-journal text-sm leading-relaxed text-muted-foreground mt-0.5">
                        Árvore de magias e técnicas com avanço em horas de treino real durante descansos curtos e longos nos aposentos.
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3.5">
                    <CheckCircle2 size={18} className="text-primary shrink-0 mt-1" />
                    <div>
                      <strong className="font-cinzel text-sm text-foreground block">
                        Mochila Inteligente & Banco de Glenor
                      </strong>
                      <p className="font-journal text-sm leading-relaxed text-muted-foreground mt-0.5">
                        Capacidade de carga ponderada com alerta de sobrecarga, controle de moedas e cofre bancário protegido por senha.
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3.5">
                    <CheckCircle2 size={18} className="text-primary shrink-0 mt-1" />
                    <div>
                      <strong className="font-cinzel text-sm text-foreground block">
                        Diário de Campanha com Fotos e Tags
                      </strong>
                      <p className="font-journal text-sm leading-relaxed text-muted-foreground mt-0.5">
                        Registre pistas, rumores, missões e desenhos de mapas em um caderno datado e categorizado.
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Coluna 2: Mestres */}
              <div className="war-room-card bracket-corners rounded-2xl p-6 sm:p-8 space-y-6 border border-amber-400/30">
                <div className="flex items-center gap-3 border-b border-amber-400/20 pb-4">
                  <div className="flex h-12 w-12 items-center justify-center rounded-xl border border-amber-400/50 bg-amber-500/10 text-amber-400 shadow-sm">
                    <Crown size={24} />
                  </div>
                  <div>
                    <span className="font-cinzel text-[10px] font-bold uppercase tracking-wider text-amber-400">
                      Para os Narradores
                    </span>
                    <h3 className="font-cinzel text-2xl font-bold text-foreground">
                      A Câmara Tática do Mestre
                    </h3>
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="flex items-start gap-3.5">
                    <CheckCircle2 size={18} className="text-amber-400 shrink-0 mt-1" />
                    <div>
                      <strong className="font-cinzel text-sm text-foreground block">
                        Iniciativa Dinâmica & Combate Tático
                      </strong>
                      <p className="font-journal text-sm leading-relaxed text-muted-foreground mt-0.5">
                        Avanço de turnos, rodadas automáticas, rastreamento de PV ao vivo e aplicação de condições em selos de cera.
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3.5">
                    <CheckCircle2 size={18} className="text-amber-400 shrink-0 mt-1" />
                    <div>
                      <strong className="font-cinzel text-sm text-foreground block">
                        Bestiário & Criação de Variantes
                      </strong>
                      <p className="font-journal text-sm leading-relaxed text-muted-foreground mt-0.5">
                        Catálogo de NPCs e monstros com ajuste rápido de atitude (Aliado, Neutro, Hostil, Chefe) e duplicação em 1 clique.
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3.5">
                    <CheckCircle2 size={18} className="text-amber-400 shrink-0 mt-1" />
                    <div>
                      <strong className="font-cinzel text-sm text-foreground block">
                        Mapas com Névoa de Guerra (Fog of War)
                      </strong>
                      <p className="font-journal text-sm leading-relaxed text-muted-foreground mt-0.5">
                        Posicione marcadores e revele aposentos e segredos da masmorra no momento exato em que os heróis exploram.
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3.5">
                    <CheckCircle2 size={18} className="text-amber-400 shrink-0 mt-1" />
                    <div>
                      <strong className="font-cinzel text-sm text-foreground block">
                        Convites por Link & Múltiplas Mesas
                      </strong>
                      <p className="font-journal text-sm leading-relaxed text-muted-foreground mt-0.5">
                        Envie links diretos com código de convite no WhatsApp ou Discord: o novo jogador cadastra e já entra vinculado à sua campanha.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ========================================================================= */}
        {/* 4. OS 5 TEMAS DARK FANTASY                                               */}
        {/* ========================================================================= */}
        <section className="py-20 px-5 sm:px-8 lg:px-12 border-t border-primary/20">
          <div className="mx-auto max-w-5xl text-center">
            <span className="font-cinzel text-xs font-bold uppercase tracking-[0.28em] text-primary">
              Personalização Visual Profunda
            </span>
            <h2 className="mt-3 font-cinzel text-3xl sm:text-5xl font-black text-foreground">
              Cinco Atmosferas Arcanas
            </h2>
            <p className="mt-3 font-journal text-base sm:text-lg italic text-muted-foreground max-w-xl mx-auto">
              Cada mesa possui sua própria luz. Alterne instantaneamente entre paletas refinadas com iluminação ambiental dinâmica.
            </p>

            <div className="mt-10 grid grid-cols-1 sm:grid-cols-5 gap-3.5">
              {[
                { name: "Âmbar Vulcânico", desc: "Coração da Montanha", color: "#d69a3d", ring: "border-amber-500/40" },
                { name: "Cripta Abissal", desc: "Mistérios Ocultos", color: "#a855f7", ring: "border-purple-500/40" },
                { name: "Floresta Ancestral", desc: "Segredos dos Elfos", color: "#10b981", ring: "border-emerald-500/40" },
                { name: "Sangue Carmesim", desc: "Pacto dos Dragões", color: "#ef4444", ring: "border-rose-500/40" },
                { name: "Gelo Eterno", desc: "Geada do Norte", color: "#06b6d4", ring: "border-cyan-500/40" },
              ].map((theme) => (
                <div
                  key={theme.name}
                  className={`medallion-plate flex flex-col items-center p-4 rounded-xl border ${theme.ring} shadow-md`}
                >
                  <span
                    className="h-6 w-6 rounded-full shadow-lg ring-2 ring-white/20 mb-2.5"
                    style={{ backgroundColor: theme.color }}
                  />
                  <strong className="font-cinzel text-xs font-bold text-foreground text-center">
                    {theme.name}
                  </strong>
                  <span className="font-journal text-[11px] italic text-muted-foreground mt-0.5">
                    {theme.desc}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ========================================================================= */}
        {/* 5. CHAMADA FINAL PARA A AÇÃO                                              */}
        {/* ========================================================================= */}
        <section className="relative py-20 px-5 sm:px-8 border-t border-primary/20 bg-gradient-to-b from-transparent to-black/50 text-center">
          <div className="max-w-3xl mx-auto space-y-6">
            <span className="font-cinzel text-xs font-bold uppercase tracking-[0.3em] text-primary">
              Sua Próxima Crônica Começa Agora
            </span>
            <h2 className="font-cinzel text-3xl sm:text-5xl font-black text-foreground">
              Reúna o grupo. Role a iniciativa.
            </h2>
            <p className="font-journal text-lg sm:text-xl italic text-muted-foreground max-w-xl mx-auto">
              Crie seu primeiro personagem ou monte sua campanha em menos de dois minutos.
            </p>

            <div className="pt-4 flex flex-col sm:flex-row items-center justify-center gap-3">
              <Link
                href="/registro"
                className="interactive-lift flex min-h-12 w-full sm:w-auto items-center justify-center gap-2 rounded-xl border border-primary bg-primary px-8 font-cinzel text-sm font-bold uppercase tracking-wider text-primary-foreground shadow-2xl shadow-primary/30 transition hover:brightness-110 active:scale-95"
              >
                <span>Criar Conta Gratuita</span>
                <ArrowRight size={16} />
              </Link>
              <Link
                href="/login"
                className="flex min-h-12 w-full sm:w-auto items-center justify-center rounded-xl border border-primary/30 bg-secondary/80 px-6 font-cinzel text-xs font-bold uppercase tracking-wider text-foreground hover:bg-primary/15 transition active:scale-95"
              >
                Acessar Minha Ficha
              </Link>
            </div>
          </div>
        </section>
      </main>

      {/* Rodapé */}
      <footer className="relative z-10 border-t border-primary/20 py-8 px-5 sm:px-8 text-center bg-black/60">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4 text-xs font-journal text-muted-foreground italic">
          <div className="flex items-center gap-2 font-cinzel not-italic text-foreground font-bold">
            <ScrollText size={16} className="text-primary" />
            <span>Grimorium</span>
          </div>
          <span>“Toda grande campanha começa com uma página em branco.”</span>
          <span className="not-italic font-mono text-[11px] text-muted-foreground/75">
            © {new Date().getFullYear()} Grimorium · RPG d20 Folio & Tactical Engine
          </span>
        </div>
      </footer>
    </div>
  );
}
