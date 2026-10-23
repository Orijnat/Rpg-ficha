"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useAuth } from "../context/AuthContext";
import { Lock, User, Eye, EyeOff, LogIn, Sparkles, AlertCircle } from "lucide-react";

export default function LoginPage() {
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
      router.push(data.user?.role === "master" || data.user?.perfil === "mestre" ? "/admin" : "/personagem");
    } catch (err) {
      setError(err.message || "Erro ao conectar. Verifique suas credenciais.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative w-full max-w-md">
      {/* Moldura de Runas — brilho pulsante ao redor do card */}
      <div className="absolute -inset-[2px] rounded-2xl opacity-70 blur-[1px] animate-[runeGlow_4s_ease-in-out_infinite]"
        style={{
          background: "conic-gradient(from 0deg, #d69a3d, #c9862a, #a97323, #d69a3d, transparent 40%, #d69a3d, #c9862a, transparent 70%, #d69a3d)",
        }}
      />

      {/* Card Principal — Pergaminho */}
      <div className="relative overflow-hidden rounded-2xl border border-[#6b5a3e]/60 shadow-[0_0_60px_rgba(214,154,61,0.15),0_20px_60px_rgba(0,0,0,0.5)]"
        style={{
          background: "linear-gradient(170deg, #1e1a14 0%, #16120d 30%, #1a1510 60%, #13100c 100%)",
        }}
      >
        {/* Textura de Pergaminho */}
        <div className="pointer-events-none absolute inset-0 opacity-[0.03]"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='100' height='100' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.8' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100' height='100' filter='url(%23n)' opacity='1'/%3E%3C/svg%3E")`,
          }}
        />

        {/* Linhas decorativas — runas nos cantos */}
        <div className="pointer-events-none absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-[#d69a3d]/50 to-transparent" />
        <div className="pointer-events-none absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-[#d69a3d]/50 to-transparent" />
        <div className="pointer-events-none absolute top-0 bottom-0 left-0 w-px bg-gradient-to-b from-transparent via-[#d69a3d]/30 to-transparent" />
        <div className="pointer-events-none absolute top-0 bottom-0 right-0 w-px bg-gradient-to-b from-transparent via-[#d69a3d]/30 to-transparent" />

        {/* Runas decorativas nos cantos */}
        <svg className="pointer-events-none absolute top-3 left-3 h-6 w-6 text-[#d69a3d]/30" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1">
          <path d="M2 2 L8 2 L8 8 M2 2 L2 8" />
          <circle cx="5" cy="5" r="1.5" fill="currentColor" opacity="0.5" />
        </svg>
        <svg className="pointer-events-none absolute top-3 right-3 h-6 w-6 text-[#d69a3d]/30" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1">
          <path d="M22 2 L16 2 L16 8 M22 2 L22 8" />
          <circle cx="19" cy="5" r="1.5" fill="currentColor" opacity="0.5" />
        </svg>
        <svg className="pointer-events-none absolute bottom-3 left-3 h-6 w-6 text-[#d69a3d]/30" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1">
          <path d="M2 22 L8 22 L8 16 M2 22 L2 16" />
          <circle cx="5" cy="19" r="1.5" fill="currentColor" opacity="0.5" />
        </svg>
        <svg className="pointer-events-none absolute bottom-3 right-3 h-6 w-6 text-[#d69a3d]/30" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1">
          <path d="M22 22 L16 22 L16 16 M22 22 L22 16" />
          <circle cx="19" cy="19" r="1.5" fill="currentColor" opacity="0.5" />
        </svg>

        <div className="relative z-10 px-7 py-8 sm:px-10 sm:py-10">
          {/* Selo / Emblema animado */}
          <div className="mx-auto mb-6 flex flex-col items-center">
            <div className="relative">
              {/* Halo brilhante */}
              <div className="absolute -inset-4 rounded-full bg-[#d69a3d]/10 blur-xl animate-pulse" />
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
                    className="fill-[#d69a3d]/40"
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
                      <stop offset="0%" stopColor="#d69a3d" />
                      <stop offset="50%" stopColor="#a97323" />
                      <stop offset="100%" stopColor="#d69a3d" />
                    </linearGradient>
                  </defs>
                </svg>
                {/* Ícone central */}
                <div className="relative z-10 flex h-12 w-12 items-center justify-center rounded-xl border border-[#d69a3d]/40 bg-gradient-to-br from-[#2a2018] to-[#1a1510] shadow-[inset_0_1px_4px_rgba(214,154,61,0.15)]">
                  <span className="text-2xl" style={{ fontFamily: "Cinzel Decorative" }}>⚔</span>
                </div>
              </div>
            </div>

            {/* Título */}
            <p
              className="mt-4 text-[10px] font-semibold uppercase tracking-[0.4em] text-[#a97323]"
              style={{ fontFamily: "Cinzel, serif" }}
            >
              Crônicas do Destino
            </p>
            <h2
              className="mt-1.5 text-center text-2xl font-bold tracking-wide text-[#f5e9d7] sm:text-3xl"
              style={{ fontFamily: "Cinzel, serif" }}
            >
              Acesso ao Reino
            </h2>
            <div className="mt-2 flex items-center gap-2">
              <div className="h-px w-12 bg-gradient-to-r from-transparent to-[#d69a3d]/40" />
              <span className="text-[10px] text-[#8a7355]" style={{ fontFamily: "Crimson Text, serif" }}>
                Entre para continuar sua jornada
              </span>
              <div className="h-px w-12 bg-gradient-to-l from-transparent to-[#d69a3d]/40" />
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
                className="mb-1.5 block text-[11px] font-semibold uppercase tracking-wider text-[#b59a6e]"
                style={{ fontFamily: "Cinzel, serif" }}
              >
                Nome de Aventureiro
              </label>
              <div className="group relative">
                <span className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3.5 text-[#6b5a3e] transition group-focus-within:text-[#d69a3d]">
                  <User size={15} />
                </span>
                <input
                  type="text"
                  value={identifier}
                  onChange={(e) => setIdentifier(e.target.value)}
                  placeholder="Usuário ou e-mail"
                  required
                  className="w-full rounded-lg border border-[#4a3d2a]/60 bg-[#0f0d0a]/60 py-2.5 pl-10 pr-3.5 text-sm text-[#f1e7d2] placeholder-[#6b5a3e]/50 shadow-inner transition-all focus:border-[#d69a3d]/60 focus:bg-[#0f0d0a]/80 focus:outline-none focus:ring-1 focus:ring-[#d69a3d]/30 focus:shadow-[0_0_12px_rgba(214,154,61,0.08)]"
                  style={{ fontFamily: "Crimson Text, serif", fontSize: "15px" }}
                />
              </div>
            </div>

            <div>
              <label
                className="mb-1.5 block text-[11px] font-semibold uppercase tracking-wider text-[#b59a6e]"
                style={{ fontFamily: "Cinzel, serif" }}
              >
                Palavra-Passe
              </label>
              <div className="group relative">
                <span className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3.5 text-[#6b5a3e] transition group-focus-within:text-[#d69a3d]">
                  <Lock size={15} />
                </span>
                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                  className="w-full rounded-lg border border-[#4a3d2a]/60 bg-[#0f0d0a]/60 py-2.5 pl-10 pr-10 text-sm text-[#f1e7d2] placeholder-[#6b5a3e]/50 shadow-inner transition-all focus:border-[#d69a3d]/60 focus:bg-[#0f0d0a]/80 focus:outline-none focus:ring-1 focus:ring-[#d69a3d]/30 focus:shadow-[0_0_12px_rgba(214,154,61,0.08)]"
                  style={{ fontFamily: "Crimson Text, serif", fontSize: "15px" }}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 flex items-center pr-3.5 text-[#6b5a3e] transition hover:text-[#d69a3d]"
                >
                  {showPassword ? <EyeOff size={15} /> : <Eye size={15} />}
                </button>
              </div>
            </div>

            {/* Botão Entrar */}
            <button
              type="submit"
              disabled={loading}
              className="group relative mt-7 flex w-full items-center justify-center gap-2.5 overflow-hidden rounded-lg border border-[#d69a3d]/50 py-3 text-sm font-semibold tracking-wider transition-all hover:border-[#d69a3d] hover:shadow-[0_0_24px_rgba(214,154,61,0.2)] active:scale-[0.98] disabled:opacity-50"
              style={{
                fontFamily: "Cinzel, serif",
                background: "linear-gradient(135deg, #2a2018 0%, #3d2e1a 50%, #2a2018 100%)",
                color: "#f0d9a0",
              }}
            >
              {/* Brilho no hover */}
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-[#d69a3d]/10 to-transparent opacity-0 transition-opacity group-hover:opacity-100" />
              {loading ? (
                <span className="relative flex items-center gap-2">
                  <span className="h-4 w-4 animate-spin rounded-full border-2 border-[#d69a3d] border-t-transparent" />
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

          {/* Separador decorativo */}
          <div className="relative my-7">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-[#4a3d2a]/40" />
            </div>
            <div className="relative flex justify-center">
              <span
                className="px-4 text-[11px] text-[#6b5a3e]"
                style={{
                  fontFamily: "Cinzel Decorative, serif",
                  background: "linear-gradient(170deg, #1e1a14 0%, #16120d 30%, #1a1510 60%, #13100c 100%)",
                }}
              >
                ✦ ou ✦
              </span>
            </div>
          </div>

          {/* Link para Registro */}
          <div className="text-center">
            <p
              className="text-xs text-[#8a7355]"
              style={{ fontFamily: "Crimson Text, serif" }}
            >
              É sua primeira vez nestas terras?
            </p>
            <Link
              href="/registro"
              className="mt-2 inline-flex items-center gap-1.5 text-sm font-semibold text-[#d69a3d] transition hover:text-[#f0d9a0] hover:drop-shadow-[0_0_6px_rgba(214,154,61,0.4)]"
              style={{ fontFamily: "Cinzel, serif" }}
            >
              <Sparkles size={14} />
              Forjar Nova Conta
            </Link>
          </div>

          {/* Atalho convidado */}
          <div className="mt-6 border-t border-[#4a3d2a]/30 pt-4 text-center">
            <Link
              href="/personagem"
              className="text-[11px] text-[#6b5a3e]/70 transition hover:text-[#8a7355]"
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
  );
}
