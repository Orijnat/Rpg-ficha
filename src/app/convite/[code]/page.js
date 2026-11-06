"use client";

import React, { use, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  Crown,
  Sword,
  Shield,
  Sparkles,
  ArrowRight,
  LogIn,
  AlertCircle,
  CheckCircle2,
  Users,
  Scroll,
  Loader2,
} from "lucide-react";
import { fetchInviteInfo, joinCampaign } from "../../../lib/api";
import { useAuth } from "../../context/AuthContext";

export default function ConvitePage({ params }) {
  const unwrappedParams = use(params);
  const code = (unwrappedParams?.code || "").trim().toUpperCase();

  const router = useRouter();
  const { isAuthenticated, user, characters, activeCharacterId } = useAuth();

  const [campaign, setCampaign] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [joining, setJoining] = useState(false);
  const [joinedSuccess, setJoinedSuccess] = useState(false);

  const activeChar = characters.find((c) => c.id === activeCharacterId) || characters[0];

  useEffect(() => {
    if (!code) {
      setError("Código de convite não fornecido na URL.");
      setLoading(false);
      return;
    }

    let isMounted = true;
    setLoading(true);
    setError("");

    fetchInviteInfo(code)
      .then((res) => {
        if (!isMounted) return;
        if (res?.valido && res.campanha) {
          setCampaign(res.campanha);
        } else {
          setError(res?.error || "Mesa de RPG não encontrada ou convite expirado.");
        }
      })
      .catch((err) => {
        if (!isMounted) return;
        setError(err?.message || "Não foi possível carregar as informações da mesa.");
      })
      .finally(() => {
        if (isMounted) setLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, [code]);

  const handleAcceptInvite = async () => {
    setJoining(true);
    setError("");
    try {
      await joinCampaign(code);
      setJoinedSuccess(true);
      setTimeout(() => {
        router.push("/personagem");
      }, 1500);
    } catch (err) {
      setError(err?.message || "Falha ao entrar na campanha.");
      setJoining(false);
    }
  };

  return (
    <div className="relative min-h-[80vh] flex items-center justify-center p-4">
      {/* Moldura de Runas ao redor do Card */}
      <div
        className="absolute -inset-[2px] max-w-xl w-full rounded-2xl opacity-70 blur-[1px] animate-[runeGlow_4s_ease-in-out_infinite]"
        style={{
          background:
            "conic-gradient(from 0deg, #d69a3d, #c9862a, #a97323, #d69a3d, transparent 40%, #d69a3d, #c9862a, transparent 70%, #d69a3d)",
        }}
      />

      <div
        className="relative max-w-xl w-full overflow-hidden rounded-2xl border border-[#6b5a3e]/60 shadow-[0_0_60px_rgba(214,154,61,0.18),0_20px_60px_rgba(0,0,0,0.6)]"
        style={{
          background:
            "linear-gradient(170deg, #1e1a14 0%, #16120d 30%, #1a1510 60%, #13100c 100%)",
        }}
      >
        {/* Textura de Pergaminho */}
        <div
          className="pointer-events-none absolute inset-0 opacity-[0.03]"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='100' height='100' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.8' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100' height='100' filter='url(%23n)' opacity='1'/%3E%3C/svg%3E")`,
          }}
        />

        <div className="relative z-10 p-6 sm:p-8">
          {/* Topo / Selo da Mesa */}
          <div className="mx-auto mb-6 flex flex-col items-center text-center">
            <div className="relative mb-3 flex h-16 w-16 items-center justify-center rounded-2xl border-2 border-[#d69a3d]/50 bg-[#d69a3d]/10 shadow-[0_0_24px_rgba(214,154,61,0.25)]">
              <Crown size={32} className="text-[#d69a3d] animate-pulse" />
            </div>
            <span
              className="text-[10px] font-bold uppercase tracking-[0.3em] text-[#d69a3d]"
              style={{ fontFamily: "Cinzel, serif" }}
            >
              Convocação Oficial de Mesa
            </span>
            <h1
              className="mt-1 text-2xl font-black uppercase tracking-wider text-[#f5e9d7] sm:text-3xl"
              style={{ fontFamily: "Cinzel, serif" }}
            >
              {loading ? "Decifrando Convite..." : campaign?.nome || "Mesa de RPG"}
            </h1>
            {code && (
              <span className="mt-1 font-mono text-xs text-[#8a7355] border border-[#4a3d2a]/50 rounded px-2 py-0.5 bg-[#0f0d0a]/60">
                Código: {code}
              </span>
            )}
          </div>

          {/* Estado de Carregamento */}
          {loading && (
            <div className="py-8 text-center text-xs text-[#8a7355] flex flex-col items-center gap-3">
              <Loader2 size={24} className="animate-spin text-[#d69a3d]" />
              <span style={{ fontFamily: "Crimson Text, serif", fontSize: "16px" }}>
                Consultando o Grimório do Reino...
              </span>
            </div>
          )}

          {/* Erro */}
          {error && !loading && (
            <div className="mb-6 rounded-xl border border-red-800/40 bg-red-950/30 p-4 text-xs text-red-300">
              <div className="flex items-center gap-2 font-bold text-red-400">
                <AlertCircle size={16} /> Falha no Convite
              </div>
              <p className="mt-1" style={{ fontFamily: "Crimson Text, serif", fontSize: "15px" }}>
                {error}
              </p>
              <div className="mt-4 pt-3 border-t border-red-900/40 flex justify-center">
                <Link
                  href="/registro"
                  className="rounded-lg bg-secondary px-4 py-2 text-xs font-bold uppercase text-foreground hover:bg-secondary/80"
                  style={{ fontFamily: "Cinzel, serif" }}
                >
                  Ir para Cadastro Geral
                </Link>
              </div>
            </div>
          )}

          {/* Sucesso após aceitar convite (usuário já logado) */}
          {joinedSuccess && (
            <div className="mb-6 rounded-xl border border-emerald-500/50 bg-emerald-950/30 p-5 text-center text-emerald-200">
              <CheckCircle2 size={32} className="mx-auto text-emerald-400 mb-2" />
              <h3 className="font-serif text-lg font-bold text-foreground">
                Convocação Aceita com Honra!
              </h3>
              <p className="mt-1 text-sm text-emerald-300/80">
                Seu herói foi vinculado com sucesso à mesa. Redirecionando para sua ficha...
              </p>
            </div>
          )}

          {/* Detalhes da Campanha */}
          {campaign && !loading && !joinedSuccess && (
            <div className="space-y-5">
              <div className="rounded-xl border border-[#4a3d2a]/50 bg-[#0f0d0a]/40 p-4">
                <div className="flex flex-wrap items-center justify-between gap-2 border-b border-[#4a3d2a]/30 pb-2.5">
                  <span className="text-xs text-[#8a7355] flex items-center gap-1.5 font-medium">
                    <Users size={14} className="text-[#d69a3d]" />
                    Mestre da Mesa: <strong className="text-[#f5e9d7]">{campaign.mestre}</strong>
                  </span>
                  <span className="rounded bg-[#d69a3d]/20 px-2 py-0.5 text-[10px] font-bold uppercase text-[#f0d9a0] border border-[#d69a3d]/30">
                    {campaign.estado}
                  </span>
                </div>

                <div className="mt-3">
                  <span className="block text-[10px] font-bold uppercase tracking-wider text-[#b59a6e]" style={{ fontFamily: "Cinzel, serif" }}>
                    Sinopse & Cenário
                  </span>
                  <p
                    className="mt-1 text-sm text-[#e8d5b0] leading-relaxed italic"
                    style={{ fontFamily: "Crimson Text, serif", fontSize: "15px" }}
                  >
                    "{campaign.descricao || "Uma nova jornada épica aguarda por valorosos aventureiros..."}"
                  </p>
                </div>
              </div>

              {/* Modo: Jogador NÃO Logado */}
              {!isAuthenticated ? (
                <div className="space-y-3 pt-2">
                  <Link
                    href={`/registro?invite=${encodeURIComponent(code)}`}
                    className="group relative flex w-full items-center justify-center gap-2 rounded-xl border border-[#d69a3d] py-3.5 text-xs font-bold uppercase tracking-wider shadow-[0_0_20px_rgba(214,154,61,0.25)] transition hover:brightness-110 active:scale-[0.98]"
                    style={{
                      fontFamily: "Cinzel, serif",
                      background: "linear-gradient(135deg, #2a2018 0%, #3d2e1a 50%, #2a2018 100%)",
                      color: "#f0d9a0",
                    }}
                  >
                    <Sparkles size={15} />
                    Criar Conta & Ingressar Nesta Mesa
                    <ArrowRight size={15} />
                  </Link>

                  <div className="text-center pt-2">
                    <p className="text-xs text-[#8a7355]" style={{ fontFamily: "Crimson Text, serif" }}>
                      Já possui uma conta de herói cadastrada?
                    </p>
                    <Link
                      href={`/login?invite=${encodeURIComponent(code)}`}
                      className="mt-1 inline-flex items-center gap-1 text-xs font-bold uppercase tracking-wider text-[#d69a3d] hover:text-[#f0d9a0] transition"
                      style={{ fontFamily: "Cinzel, serif" }}
                    >
                      <LogIn size={13} /> Fazer Login para Entrar
                    </Link>
                  </div>
                </div>
              ) : (
                /* Modo: Jogador JÁ Logado */
                <div className="space-y-4 pt-2">
                  <div className="rounded-xl border border-primary/40 bg-primary/10 p-3.5 text-xs text-foreground">
                    <div className="flex items-center gap-2 font-bold uppercase text-primary" style={{ fontFamily: "Cinzel, serif" }}>
                      <Shield size={15} /> Herói Ativo Convocado
                    </div>
                    <p className="mt-1 text-xs text-muted-foreground">
                      Você está conectado como <strong>{user?.username}</strong>. O herói{" "}
                      <strong className="text-foreground">"{activeChar?.name || "Seu Herói"}"</strong> será vinculado à mesa.
                    </p>
                  </div>

                  <button
                    type="button"
                    onClick={handleAcceptInvite}
                    disabled={joining}
                    className="flex w-full items-center justify-center gap-2 rounded-xl bg-primary py-3.5 font-serif text-xs font-bold uppercase tracking-wider text-primary-foreground shadow-lg shadow-primary/20 hover:brightness-110 active:scale-[0.98] disabled:opacity-50"
                  >
                    {joining ? (
                      <>
                        <Loader2 size={15} className="animate-spin" /> Ingressando na Mesa...
                      </>
                    ) : (
                      <>
                        <Sword size={15} /> Aceitar Convocação e Entrar na Mesa
                      </>
                    )}
                  </button>

                  <div className="text-center">
                    <Link
                      href="/personagem"
                      className="text-xs text-muted-foreground hover:text-foreground transition underline"
                    >
                      Voltar para Minha Ficha
                    </Link>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      <style>{`
        @keyframes runeGlow {
          0%, 100% { opacity: 0.35; }
          50% { opacity: 0.7; }
        }
      `}</style>
    </div>
  );
}
