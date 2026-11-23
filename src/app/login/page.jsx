"use client";

import { useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { useAuth } from "../context/AuthContext";
import AuthScaffold from "../../components/auth/AuthScaffold";
import { Lock, User, Eye, EyeOff, LogIn, Sparkles, AlertCircle, Link2 } from "lucide-react";

function LoginForm() {
  const searchParams = useSearchParams();
  const inviteCode = searchParams ? (searchParams.get("invite") || searchParams.get("convite") || searchParams.get("code") || "") : "";

  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const { login } = useAuth();
  const router = useRouter();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (!identifier.trim() || !password) {
      setError("Por favor, preencha o usuário/e-mail e a senha.");
      return;
    }

    setLoading(true);

    try {
      const data = await login(identifier, password);
      if (inviteCode && (data.user?.role !== "master" && data.user?.perfil !== "mestre")) {
        router.push(`/convite/${encodeURIComponent(inviteCode.trim().toUpperCase())}`);
      } else {
        router.push(data.user?.role === "master" || data.user?.perfil === "mestre" ? "/admin" : "/personagem");
      }
    } catch (err) {
      setError(err?.message || "Erro ao conectar. Verifique suas credenciais.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthScaffold>
    <div className="relative w-full max-w-md py-4">
      {/* Moldura de Runas — brilho pulsante ao redor do card */}
      <div className="absolute -inset-[2px] rounded-2xl opacity-70 blur-[1px] animate-[runeGlow_4s_ease-in-out_infinite]"
        style={{
          background: "conic-gradient(from 0deg, var(--theme-accent), var(--codex-brass), var(--codex-verdigris), var(--theme-accent), transparent 40%, var(--theme-accent), var(--codex-brass), transparent 70%, var(--theme-accent))",
        }}
      />

      {/* Card Principal — Pergaminho */}
      <div className="auth-shell-card relative overflow-hidden rounded-2xl border border-[var(--border)] shadow-[0_0_60px_rgba(99,201,184,0.12),0_20px_60px_rgba(0,0,0,0.5)]"
        style={{
          background: "linear-gradient(170deg, #1c1f1c 0%, #151715 30%, #191b18 60%, #0f100f 100%)",
        }}
      >
        {/* Textura de Pergaminho */}
        <div className="pointer-events-none absolute inset-0 opacity-[0.03]"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='100' height='100' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.8' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100' height='100' filter='url(%23n)' opacity='1'/%3E%3C/svg%3E")`,
          }}
        />

        {/* Linhas decorativas — runas nos cantos */}
        <div className="pointer-events-none absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-[var(--theme-accent)]/50 to-transparent" />
        <div className="pointer-events-none absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-[var(--theme-accent)]/50 to-transparent" />
        <div className="pointer-events-none absolute top-0 bottom-0 left-0 w-px bg-gradient-to-b from-transparent via-[var(--theme-accent)]/30 to-transparent" />
        <div className="pointer-events-none absolute top-0 bottom-0 right-0 w-px bg-gradient-to-b from-transparent via-[var(--theme-accent)]/30 to-transparent" />

        {/* Runas decorativas nos cantos */}
        <svg className="pointer-events-none absolute top-3 left-3 h-6 w-6 text-[var(--theme-accent)]/30" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1">
          <path d="M2 2 L8 2 L8 8 M2 2 L2 8" />
          <circle cx="5" cy="5" r="1.5" fill="currentColor" opacity="0.5" />
        </svg>
        <svg className="pointer-events-none absolute top-3 right-3 h-6 w-6 text-[var(--theme-accent)]/30" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1">
          <path d="M22 2 L16 2 L16 8 M22 2 L22 8" />
          <circle cx="19" cy="5" r="1.5" fill="currentColor" opacity="0.5" />
        </svg>
        <svg className="pointer-events-none absolute bottom-3 left-3 h-6 w-6 text-[var(--theme-accent)]/30" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1">
          <path d="M2 22 L8 22 L8 16 M2 22 L2 16" />
          <circle cx="5" cy="19" r="1.5" fill="currentColor" opacity="0.5" />
        </svg>
        <svg className="pointer-events-none absolute bottom-3 right-3 h-6 w-6 text-[var(--theme-accent)]/30" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1">
          <path d="M22 22 L16 22 L16 16 M22 22 L22 16" />
          <circle cx="19" cy="19" r="1.5" fill="currentColor" opacity="0.5" />
        </svg>

        <div className="relative z-10 px-7 py-8 sm:px-10 sm:py-10">
          {/* Selo / Emblema animado */}
          <div className="auth-shell-emblem mx-auto mb-6 flex flex-col items-center">
            <div className="relative">
              {/* Halo brilhante */}
              <div className="absolute -inset-4 rounded-full bg-[var(--theme-accent)]/10 blur-xl animate-pulse" />
              {/* Selo hexagonal */}
              <div className="relative flex h-20 w-20 items-center justify-center">
                <svg viewBox="0 0 100 100" className="absolute inset-0 h-full w-full animate-[spin_30s_linear_infinite]">
                  <polygon
                    points="50,3 93,25 93,75 50,97 7,75 7,25"
                    fill="none"
                    stroke="url(#sealGrad)"
                    strokeWidth="1.5"
                  />
                  {/* Runas ao redor do selo */}
                  <text
                    textAnchor="middle"
                    className="fill-[var(--theme-accent)]/40"
                    style={{ fontSize: "6px", fontFamily: "Cinzel Decorative" }}
                  >
                    <textPath href="#sealPath">
                      ᚠ ᚢ ᚦ ᚨ ᚱ ᚲ ᚷ ᚹ ᚺ ᚾ ᛁ ᛃ ᛈ ᛇ ᛉ ᛊ ᛏ ᛒ ᛖ ᛗ ᛚ ᛜ ᛞ ᛟ
                    </textPath>
                  </text>
                  <defs>
                    <path
                      id="sealPath"
                      d="M 50,8 A 42,42 0 1,1 49.99,8"
                      fill="none"
                    />
                    <linearGradient id="sealGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                      <stop offset="0%" stopColor="#63c9b8" />
                      <stop offset="50%" stopColor="#c7a866" />
                      <stop offset="100%" stopColor="#63c9b8" />
                    </linearGradient>
                  </defs>
                </svg>
                {/* Ícone central */}
                <Image src="/astral.svg" alt="Grimorium" width={48} height={48} priority className="relative z-10 h-12 w-12 rounded-xl shadow-[0_0_18px_color-mix(in_srgb,var(--primary)_35%,transparent)]" />
              </div>
            </div>

            {/* Título */}
            <p
              className="mt-4 text-[10px] font-semibold uppercase tracking-[0.4em] text-[var(--theme-accent)]"
              style={{ fontFamily: "Cinzel, serif" }}
            >
              Crônicas do Destino
            </p>
            <h2
              className="mt-1.5 text-center text-2xl font-bold tracking-wide text-[var(--theme-title)] sm:text-3xl"
              style={{ fontFamily: "Cinzel, serif" }}
            >
              Acesso ao Reino
            </h2>
            <div className="mt-2 flex items-center gap-2">
              <div className="h-px w-12 bg-gradient-to-r from-transparent to-[var(--theme-accent)]/40" />
              <span className="text-[10px] text-[var(--theme-subtitle)]" style={{ fontFamily: "Crimson Text, serif" }}>
                Entre para continuar sua jornada
              </span>
              <div className="h-px w-12 bg-gradient-to-l from-transparent to-[var(--theme-accent)]/40" />
            </div>
          </div>

          {/* Mensagem de Erro */}
          {error && (
            <div className="mb-5 flex items-start gap-2.5 rounded-lg border border-red-800/40 bg-red-950/30 px-3.5 py-3 text-xs text-red-300/90 shadow-inner">
              <AlertCircle size={15} className="mt-0.5 shrink-0 text-red-400/80" />
              <span style={{ fontFamily: "Crimson Text, serif" }}>{error}</span>
            </div>
          )}

          {/* Formulário */}
          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label
                className="mb-1.5 block text-[11px] font-semibold uppercase tracking-wider text-[var(--theme-subtitle)]"
                style={{ fontFamily: "Cinzel, serif" }}
              >
                Nome de Aventureiro
              </label>
              <div className="group relative">
                <span className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3.5 text-[var(--theme-subtitle)] transition group-focus-within:text-[var(--theme-accent)]">
                  <User size={15} />
                </span>
                <input
                  type="text"
                  value={identifier}
                  onChange={(e) => setIdentifier(e.target.value)}
                  placeholder="Usuário ou e-mail"
                  required
                  className="w-full rounded-lg border border-[var(--border)] bg-[var(--input-background)] py-2.5 pl-10 pr-3.5 text-sm text-[var(--theme-body)] placeholder-[var(--muted-foreground)] shadow-inner transition-all focus:border-[var(--theme-accent)]/60 focus:bg-[var(--card)] focus:outline-none focus:ring-1 focus:ring-[var(--theme-accent)]/30 focus:shadow-[0_0_12px_rgba(99,201,184,0.12)]"
                  style={{ fontFamily: "Crimson Text, serif", fontSize: "15px" }}
                />
              </div>
            </div>

            <div>
              <label
                className="mb-1.5 block text-[11px] font-semibold uppercase tracking-wider text-[var(--theme-subtitle)]"
                style={{ fontFamily: "Cinzel, serif" }}
              >
                Palavra-Passe
              </label>
              <div className="group relative">
                <span className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3.5 text-[var(--theme-subtitle)] transition group-focus-within:text-[var(--theme-accent)]">
                  <Lock size={15} />
                </span>
                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                  className="w-full rounded-lg border border-[var(--border)] bg-[var(--input-background)] py-2.5 pl-10 pr-10 text-sm text-[var(--theme-body)] placeholder-[var(--muted-foreground)] shadow-inner transition-all focus:border-[var(--theme-accent)]/60 focus:bg-[var(--card)] focus:outline-none focus:ring-1 focus:ring-[var(--theme-accent)]/30 focus:shadow-[0_0_12px_rgba(99,201,184,0.12)]"
                  style={{ fontFamily: "Crimson Text, serif", fontSize: "15px" }}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 flex items-center pr-3.5 text-[var(--theme-subtitle)] transition hover:text-[var(--theme-accent)]"
                >
                  {showPassword ? <EyeOff size={15} /> : <Eye size={15} />}
                </button>
              </div>
            </div>

            {/* Botão Entrar */}
            <button
              type="submit"
              disabled={loading}
              className="group relative mt-7 flex w-full items-center justify-center gap-2.5 overflow-hidden rounded-lg border border-[var(--theme-accent)]/50 py-3 text-sm font-semibold tracking-wider transition-all hover:border-[var(--theme-accent)] hover:shadow-[0_0_24px_rgba(99,201,184,0.2)] active:scale-[0.98] disabled:opacity-50"
              style={{
                fontFamily: "Cinzel, serif",
                background: "linear-gradient(135deg, #26302a 0%, #32483e 50%, #26302a 100%)",
                color: "var(--theme-title)",
              }}
            >
              {/* Brilho no hover */}
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-[var(--theme-accent)]/10 to-transparent opacity-0 transition-opacity group-hover:opacity-100" />
              {loading ? (
                <span className="relative flex items-center gap-2">
                  <span className="h-4 w-4 animate-spin rounded-full border-2 border-[var(--theme-accent)] border-t-transparent" />
                  Abrindo os Portões...
                </span>
              ) : (
                <span className="relative flex items-center gap-2">
                  <LogIn size={16} />
                  Entrar no Reino
                </span>
              )}
            </button>
          </form>

          {/* Link para Registro + Esqueci a senha */}
          <div className="text-center">
            <p
              className="text-xs text-[var(--theme-subtitle)]"
              style={{ fontFamily: "Crimson Text, serif" }}
            >
              É sua primeira vez nestas terras?
            </p>
            <Link
              href={`/registro${inviteCode ? `?invite=${encodeURIComponent(inviteCode)}` : ""}`}
              className="mt-2 inline-flex items-center gap-1.5 text-sm font-semibold text-[var(--theme-accent)] transition hover:text-[var(--theme-title)] hover:drop-shadow-[0_0_6px_rgba(99,201,184,0.4)]"
              style={{ fontFamily: "Cinzel, serif" }}
            >
              <Sparkles size={14} />
              Forjar Nova Conta
            </Link>
          </div>

          {/* Atalho convidado */}
          <div className="mt-6 border-t border-[var(--border)] pt-4 text-center">
            <Link
              href="/personagem"
              className="text-[11px] text-[var(--theme-subtitle)]/70 transition hover:text-[var(--theme-subtitle)]"
              style={{ fontFamily: "Crimson Text, serif" }}
            >
              Continuar sem login (modo convidado offline) →
            </Link>
          </div>
        </div>
      </div>

      {/* CSS das animações */}
      <style>{`
        @keyframes runeGlow {
          0%, 100% { opacity: 0.35; }
          50% { opacity: 0.7; }
        }
      `}</style>
    </div>
    </AuthScaffold>
  );
}

export default function LoginPage() {
  return (
    <Suspense
      fallback={
        <div className="p-8 text-center text-xs text-muted-foreground font-serif">
          Carregando Portal dos Heróis...
        </div>
      }
    >
      <LoginForm />
    </Suspense>
  );
}
