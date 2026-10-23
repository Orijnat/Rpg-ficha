"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Crown,
  HeartPulse,
  LogOut,
  Palette,
  Plus,
  ScrollText,
  Shield,
  Sparkles,
  User,
  ExternalLink,
  Check,
} from "lucide-react";
import { Card, SectionHeader } from "../components/ui";
import { useAuth } from "../context/AuthContext";
import { useTheme } from "../context/ThemeContext";
import { useCharacter } from "../context/CharacterContext";

export default function PerfilPage() {
  const { user, isMaster, isAuthenticated, logout, characters, activeCharacterId, selectCharacter, createCharacter } = useAuth();
  const { themeId, setThemeId, themes } = useTheme();
  const { data: activeCharData } = useCharacter();
  const router = useRouter();

  const [newCharName, setNewCharName] = useState("");
  const [newCharJob, setNewCharJob] = useState("");
  const [isCreating, setIsCreating] = useState(false);
  const [createMsg, setCreateMsg] = useState("");

  const handleCreate = async (e) => {
    e.preventDefault();
    if (!newCharName.trim()) return;

    setIsCreating(true);
    setCreateMsg("");
    try {
      await createCharacter({
        name: newCharName.trim(),
        job: newCharJob.trim() || "Aventureiro",
        hp: 70,
        hpMax: 70,
        level: 1,
      });
      setNewCharName("");
      setNewCharJob("");
      setCreateMsg("Novo personagem criado com sucesso!");
      setTimeout(() => setCreateMsg(""), 3000);
    } catch (err) {
      setCreateMsg(`Erro: ${err.message || "Falha ao criar personagem."}`);
    } finally {
      setIsCreating(false);
    }
  };

  if (!isAuthenticated && typeof window !== "undefined") {
    return (
      <div className="mx-auto max-w-2xl py-12 text-center">
        <Card>
          <p className="font-serif text-lg text-foreground">Acesso não autenticado</p>
          <p className="mt-2 text-sm text-muted-foreground">Por favor, faça login para acessar seu perfil.</p>
          <Link
            href="/login"
            className="mt-4 inline-flex min-h-11 items-center rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground"
          >
            Fazer Login
          </Link>
        </Card>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      {/* Cabeçalho da Página de Perfil */}
      <div className="guild-plaque ornate-frame border-2 border-primary/45 bg-card/95 p-6 shadow-xl sm:p-7">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-4">
            <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-full border-2 border-primary/60 bg-primary/20 text-primary shadow-lg shadow-primary/20">
              {isMaster ? <Crown size={30} /> : <User size={30} />}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-serif text-[10px] font-bold uppercase tracking-[0.3em] text-primary">
                  Câmara de Identidade
                </span>
                <span
                  className={`rounded-full px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider ${
                    isMaster
                      ? "bg-amber-400/20 text-amber-300 border border-amber-400/40"
                      : "bg-primary/20 text-primary border border-primary/40"
                  }`}
                >
                  {isMaster ? "Mestre de Campanha" : "Jogador"}
                </span>
              </div>
              <h1 className="mt-1 font-serif text-2xl font-black text-foreground sm:text-3xl">
                @{user?.username || "Aventureiro"}
              </h1>
              <p className="text-xs text-muted-foreground">
                {user?.email || "Sessão local ativa com token criptografado"}
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={logout}
            className="flex min-h-11 items-center justify-center gap-2 rounded-lg border border-rose-500/30 bg-rose-950/20 px-4 py-2 text-xs font-bold uppercase tracking-wider text-rose-300 transition hover:bg-rose-900/40 hover:border-rose-500 active:scale-95"
          >
            <LogOut size={15} /> Encerrar Sessão
          </button>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {/* Gestão de Personagens do Usuário */}
        <Card className="border-2 border-primary/25">
          <div className="flex items-center justify-between border-b border-border/70 pb-3">
            <SectionHeader title="Seus Personagens" icon={<ScrollText size={16} />} />
            <span className="text-xs text-muted-foreground">{characters.length} ficha(s)</span>
          </div>

          <div className="mt-4 space-y-2.5">
            {characters.length === 0 ? (
              <p className="border border-dashed border-border p-4 text-center text-xs text-muted-foreground">
                Nenhum personagem associado a esta conta.
              </p>
            ) : (
              characters.map((char) => {
                const isActive = char.id === activeCharacterId;
                return (
                  <div
                    key={char.id}
                    onClick={() => selectCharacter(char.id)}
                    className={`flex cursor-pointer items-center justify-between rounded-xl border-2 p-3 transition-all ${
                      isActive
                        ? "border-primary bg-primary/15 shadow-md shadow-primary/15"
                        : "border-border bg-secondary/50 hover:border-primary/40 hover:bg-secondary"
                    }`}
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <div
                        className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border ${
                          isActive
                            ? "border-primary bg-primary text-primary-foreground font-bold"
                            : "border-border bg-background text-muted-foreground"
                        }`}
                      >
                        {isActive ? <Check size={16} /> : <Shield size={16} />}
                      </div>
                      <div className="min-w-0">
                        <div className="flex items-center gap-2">
                          <strong className="truncate font-serif text-sm text-foreground">
                            {char.name}
                          </strong>
                          {isActive && (
                            <span className="rounded bg-primary/20 px-1.5 py-0.2 text-[9px] font-bold uppercase text-primary border border-primary/40">
                              Ativo
                            </span>
                          )}
                        </div>
                        <p className="text-xs text-muted-foreground truncate">
                          {char.job || "Aventureiro"} · Nível {char.level || 1} · {char.hp ?? 70}/{char.hpMax ?? 70} PV
                        </p>
                      </div>
                    </div>

                    <Link
                      href="/personagem"
                      onClick={(e) => {
                        e.stopPropagation();
                        selectCharacter(char.id);
                      }}
                      className="rounded p-2 text-primary hover:bg-primary/20 transition active:scale-95"
                      title="Abrir ficha"
                    >
                      <ExternalLink size={15} />
                    </Link>
                  </div>
                );
              })
            )}
          </div>

          {/* Formulário Rápido de Novo Personagem */}
          <div className="mt-5 border-t border-border/70 pt-4">
            <h4 className="flex items-center gap-1.5 font-serif text-xs font-bold uppercase tracking-wider text-muted-foreground">
              <Plus size={13} className="text-primary" /> Criar Novo Herói
            </h4>

            {createMsg && (
              <p
                className={`mt-2 rounded p-2 text-xs ${
                  createMsg.startsWith("Erro")
                    ? "bg-rose-500/15 text-rose-300 border border-rose-500/30"
                    : "bg-emerald-500/15 text-emerald-300 border border-emerald-500/30"
                }`}
              >
                {createMsg}
              </p>
            )}

            <form onSubmit={handleCreate} className="mt-2 space-y-2">
              <div className="grid grid-cols-2 gap-2">
                <input
                  type="text"
                  placeholder="Nome do personagem *"
                  value={newCharName}
                  onChange={(e) => setNewCharName(e.target.value)}
                  className="min-h-10 rounded-lg border border-border bg-input-background px-3 text-xs text-foreground outline-none focus:border-primary"
                  required
                />
                <input
                  type="text"
                  placeholder="Classe / Ocupação"
                  value={newCharJob}
                  onChange={(e) => setNewCharJob(e.target.value)}
                  className="min-h-10 rounded-lg border border-border bg-input-background px-3 text-xs text-foreground outline-none focus:border-primary"
                />
              </div>
              <button
                type="submit"
                disabled={isCreating}
                className="w-full flex min-h-10 items-center justify-center gap-1.5 rounded-lg border border-primary/45 bg-primary/10 px-3 py-1.5 text-xs font-bold uppercase tracking-wide text-primary transition hover:bg-primary/25 disabled:opacity-50 active:scale-95"
              >
                <Plus size={13} /> {isCreating ? "Criando..." : "Adicionar Personagem"}
              </button>
            </form>
          </div>
        </Card>

        {/* Preferências Visuais e Temas */}
        <Card className="border-2 border-primary/25">
          <SectionHeader title="Tema & Visual Dark Fantasy" icon={<Palette size={16} />} />
          <p className="mt-1 text-xs text-muted-foreground">
            Escolha o estilo atmosférico que ilumina sua jornada e interface.
          </p>

          <div className="mt-4 space-y-2.5">
            {themes.map((theme) => {
              const active = themeId === theme.id;
              return (
                <button
                  key={theme.id}
                  type="button"
                  onClick={() => setThemeId(theme.id)}
                  className={`w-full flex items-center justify-between rounded-xl border-2 p-3 text-left transition-all active:scale-95 ${
                    active
                      ? "border-primary bg-primary/15 shadow-md shadow-primary/20"
                      : "border-border bg-secondary/50 hover:border-primary/40 hover:bg-secondary"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <span className="text-xl">{theme.emoji}</span>
                    <div>
                      <div className="flex items-center gap-2">
                        <strong className="font-serif text-sm text-foreground">
                          {theme.name}
                        </strong>
                        {active && (
                          <span className="rounded bg-primary/20 px-1.5 py-0.2 text-[9px] font-bold text-primary border border-primary/40">
                            Selecionado
                          </span>
                        )}
                      </div>
                      <p className="text-[11px] text-muted-foreground">{theme.description}</p>
                    </div>
                  </div>

                  {/* Amostra de Cores */}
                  <div className="flex items-center gap-1.5 shrink-0">
                    <span
                      className="h-4 w-4 rounded-full border border-white/20 shadow-sm"
                      style={{ backgroundColor: theme.preview.accent }}
                      title="Destaque"
                    />
                    <span
                      className="h-4 w-4 rounded-full border border-white/20 shadow-sm"
                      style={{ backgroundColor: theme.preview.bg }}
                      title="Superfície"
                    />
                  </div>
                </button>
              );
            })}
          </div>

          {/* Atalhos Rápidos */}
          <div className="mt-6 border-t border-border/70 pt-4">
            <h4 className="font-serif text-xs font-bold uppercase tracking-wider text-muted-foreground mb-2">
              Atalhos de Acesso Rápido
            </h4>
            <div className="grid grid-cols-2 gap-2 text-xs">
              <Link
                href="/personagem"
                className="flex items-center justify-center gap-1.5 rounded-lg border border-border bg-secondary p-2.5 font-semibold text-secondary-foreground hover:border-primary/40 hover:text-primary transition"
              >
                Ficha Principal
              </Link>
              <Link
                href="/inventario"
                className="flex items-center justify-center gap-1.5 rounded-lg border border-border bg-secondary p-2.5 font-semibold text-secondary-foreground hover:border-primary/40 hover:text-primary transition"
              >
                Mochila & Carga
              </Link>
              <Link
                href="/anotacoes"
                className="flex items-center justify-center gap-1.5 rounded-lg border border-border bg-secondary p-2.5 font-semibold text-secondary-foreground hover:border-primary/40 hover:text-primary transition"
              >
                Diário de Bordo
              </Link>
              {isMaster && (
                <Link
                  href="/admin"
                  className="flex items-center justify-center gap-1.5 rounded-lg border border-amber-400/40 bg-amber-400/10 p-2.5 font-semibold text-amber-300 hover:bg-amber-400/20 transition"
                >
                  Sala do Mestre
                </Link>
              )}
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}
