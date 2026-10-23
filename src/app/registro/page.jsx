"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useAuth } from "../context/AuthContext";
import {
  Lock,
  User,
  Mail,
  Eye,
  EyeOff,
  Sparkles,
  Sword,
  AlertCircle,
  ArrowRight,
  Scroll,
  Shield,
} from "lucide-react";

const SUGGESTED_JOBS = [
  "Bruxeiro",
  "Guerreiro",
  "Mago",
  "Ladino",
  "Clérigo",
  "Bardo",
  "Paladino",
  "Patrulheiro",
];

/* ─────── Componente reutilizável de campo de formulário ─────── */
function FormField({ label, icon: Icon, children }) {
  return (
    <div>
      <label
        className="mb-1.5 block text-[11px] font-semibold uppercase tracking-wider text-[#b59a6e]"
        style={{ fontFamily: "Cinzel, serif" }}
      >
        {label}
      </label>
      <div className="group relative">
        <span className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 text-[#6b5a3e] transition group-focus-within:text-[#d69a3d]">
          <Icon size={14} />
        </span>
        {children}
      </div>
    </div>
  );
}

/* ─────── Componente reutilizável de input ─────── */
const inputBase =
  "w-full rounded-lg border border-[#4a3d2a]/60 bg-[#0f0d0a]/60 py-2 pl-9 pr-3 text-xs text-[#f1e7d2] placeholder-[#6b5a3e]/50 shadow-inner transition-all focus:border-[#d69a3d]/60 focus:bg-[#0f0d0a]/80 focus:outline-none focus:ring-1 focus:ring-[#d69a3d]/30 focus:shadow-[0_0_12px_rgba(214,154,61,0.08)]";

const inputFont = { fontFamily: "Crimson Text, serif", fontSize: "14px" };

/* ─────── Seção decorativa ─────── */
function SectionTitle({ icon: Icon, number, title }) {
  return (
    <div className="flex items-center gap-2.5 border-b border-[#4a3d2a]/40 pb-3">
      <div className="flex h-7 w-7 items-center justify-center rounded-md border border-[#d69a3d]/30 bg-[#d69a3d]/10">
        <Icon size={14} className="text-[#d69a3d]" />
      </div>
      <h3
        className="text-[11px] font-semibold uppercase tracking-[0.15em] text-[#d69a3d]"
        style={{ fontFamily: "Cinzel, serif" }}
      >
        {number}. {title}
      </h3>
      <div className="h-px flex-1 bg-gradient-to-r from-[#d69a3d]/20 to-transparent" />
    </div>
  );
}

export default function RegisterPage() {
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  // Dados do Primeiro Personagem
  const [characterName, setCharacterName] = useState("");
  const [characterJob, setCharacterJob] = useState("Bruxeiro");
  const [customClass, setCustomClass] = useState("");

  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const { register } = useAuth();
  const router = useRouter();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (!username.trim() || !email.trim() || !password) {
      setError("Por favor, preencha todos os campos obrigatórios da conta.");
      return;
    }

    if (password.length < 6) {
      setError("A senha deve conter no mínimo 6 caracteres.");
      return;
    }

    if (password !== confirmPassword) {
      setError("As senhas informadas não coincidem.");
      return;
    }

    setLoading(true);

    try {
      const data = await register({
        username: username.trim(),
        email: email.trim(),
        password,
        characterName: characterName.trim() || "Novo Herói",
        characterJob: characterJob.trim() || "Aventureiro",
        customClass: customClass.trim(),
      });

      router.push(data.user?.role === "master" || data.user?.perfil === "mestre" ? "/admin" : "/personagem");
    } catch (err) {
      setError(err.message || "Erro ao realizar o cadastro. Tente novamente.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative w-full max-w-2xl py-4">
      {/* Moldura de Runas — brilho pulsante ao redor */}
      <div
        className="absolute -inset-[2px] rounded-2xl opacity-70 blur-[1px] animate-[runeGlow_4s_ease-in-out_infinite]"
        style={{
          background:
            "conic-gradient(from 0deg, #d69a3d, #c9862a, #a97323, #d69a3d, transparent 40%, #d69a3d, #c9862a, transparent 70%, #d69a3d)",
        }}
      />

      {/* Card Principal — Pergaminho */}
      <div
        className="relative overflow-hidden rounded-2xl border border-[#6b5a3e]/60 shadow-[0_0_60px_rgba(214,154,61,0.15),0_20px_60px_rgba(0,0,0,0.5)]"
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

        {/* Linhas de borda decorativas */}
        <div className="pointer-events-none absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-[#d69a3d]/50 to-transparent" />
        <div className="pointer-events-none absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-[#d69a3d]/50 to-transparent" />
        <div className="pointer-events-none absolute top-0 bottom-0 left-0 w-px bg-gradient-to-b from-transparent via-[#d69a3d]/30 to-transparent" />
        <div className="pointer-events-none absolute top-0 bottom-0 right-0 w-px bg-gradient-to-b from-transparent via-[#d69a3d]/30 to-transparent" />

        {/* Runas nos cantos */}
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

        <div className="relative z-10 px-6 py-7 sm:px-10 sm:py-9">
          {/* Selo / Emblema animado */}
          <div className="mx-auto mb-5 flex flex-col items-center">
            <div className="relative">
              <div className="absolute -inset-4 rounded-full bg-[#d69a3d]/10 blur-xl animate-pulse" />
              <div className="relative flex h-20 w-20 items-center justify-center">
                <svg viewBox="0 0 100 100" className="absolute inset-0 h-full w-full animate-[spin_30s_linear_infinite]">
                  <polygon
                    points="50,3 93,25 93,75 50,97 7,75 7,25"
                    fill="none"
                    stroke="url(#sealGradReg)"
                    strokeWidth="1.5"
                  />
                  <text
                    textAnchor="middle"
                    className="fill-[#d69a3d]/40"
                    style={{ fontSize: "6px", fontFamily: "Cinzel Decorative" }}
                  >
                    <textPath href="#sealPathReg">
                      ᚠ ᚢ ᚦ ᚨ ᚱ ᚲ ᚷ ᚹ ᚺ ᚾ ᛁ ᛃ ᛈ ᛇ ᛉ ᛊ ᛏ ᛒ ᛖ ᛗ ᛚ ᛜ ᛞ ᛟ
                    </textPath>
                  </text>
                  <defs>
                    <path id="sealPathReg" d="M 50,8 A 42,42 0 1,1 49.99,8" fill="none" />
                    <linearGradient id="sealGradReg" x1="0%" y1="0%" x2="100%" y2="100%">
                      <stop offset="0%" stopColor="#d69a3d" />
                      <stop offset="50%" stopColor="#a97323" />
                      <stop offset="100%" stopColor="#d69a3d" />
                    </linearGradient>
                  </defs>
                </svg>
                <div className="relative z-10 flex h-12 w-12 items-center justify-center rounded-xl border border-[#d69a3d]/40 bg-gradient-to-br from-[#2a2018] to-[#1a1510] shadow-[inset_0_1px_4px_rgba(214,154,61,0.15)]">
                  <Sparkles size={22} className="text-[#d69a3d]" />
                </div>
              </div>
            </div>

            <p
              className="mt-4 text-[10px] font-semibold uppercase tracking-[0.4em] text-[#a97323]"
              style={{ fontFamily: "Cinzel, serif" }}
            >
              Forja de Aventureiros
            </p>
            <h2
              className="mt-1.5 text-center text-2xl font-bold tracking-wide text-[#f5e9d7] sm:text-3xl"
              style={{ fontFamily: "Cinzel, serif" }}
            >
              Crie sua Conta
            </h2>
            <div className="mt-2 flex items-center gap-2">
              <div className="h-px w-10 bg-gradient-to-r from-transparent to-[#d69a3d]/40" />
              <span className="text-[10px] text-[#8a7355]" style={{ fontFamily: "Crimson Text, serif" }}>
                Cadastre-se e forje o primeiro herói da sua lenda
              </span>
              <div className="h-px w-10 bg-gradient-to-l from-transparent to-[#d69a3d]/40" />
            </div>
          </div>

          {/* Mensagem de Erro */}
          {error && (
            <div className="mb-5 flex items-start gap-2.5 rounded-lg border border-red-800/40 bg-red-950/30 px-3.5 py-3 text-xs text-red-300/90 shadow-inner">
              <AlertCircle size={15} className="mt-0.5 shrink-0 text-red-400/80" />
              <span style={{ fontFamily: "Crimson Text, serif" }}>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* ══════ SEÇÃO 1: CREDENCIAIS ══════ */}
            <div className="rounded-xl border border-[#4a3d2a]/40 bg-[#0f0d0a]/30 p-4 sm:p-5">
              <SectionTitle icon={Shield} number="I" title="Credenciais de Acesso" />

              <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
                <FormField label="Nome de Usuário *" icon={User}>
                  <input
                    type="text"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    placeholder="Ex: bruxeiro_99"
                    required
                    className={inputBase}
                    style={inputFont}
                  />
                </FormField>

                <FormField label="E-mail *" icon={Mail}>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="heroi@reino.com"
                    required
                    className={inputBase}
                    style={inputFont}
                  />
                </FormField>

                <FormField label="Senha * (mín. 6 caracteres)" icon={Lock}>
                  <input
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    required
                    minLength={6}
                    className={inputBase.replace("pr-3", "pr-9")}
                    style={inputFont}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-0 flex items-center pr-3 text-[#6b5a3e] transition hover:text-[#d69a3d]"
                  >
                    {showPassword ? <EyeOff size={14} /> : <Eye size={14} />}
                  </button>
                </FormField>

                <FormField label="Confirmar Senha *" icon={Lock}>
                  <input
                    type={showPassword ? "text" : "password"}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="••••••••"
                    required
                    minLength={6}
                    className={inputBase}
                    style={inputFont}
                  />
                </FormField>
              </div>
            </div>

            {/* ══════ SEÇÃO 2: PERSONAGEM ══════ */}
            <div className="rounded-xl border border-[#4a3d2a]/40 bg-[#0f0d0a]/30 p-4 sm:p-5">
              <SectionTitle icon={Sword} number="II" title="Seu Primeiro Personagem" />

              <div className="mt-4 space-y-4">
                <FormField label="Nome do Herói" icon={Scroll}>
                  <input
                    type="text"
                    value={characterName}
                    onChange={(e) => setCharacterName(e.target.value)}
                    placeholder="Ex: Geralt de Rívia (padrão: Novo Herói)"
                    className={inputBase}
                    style={inputFont}
                  />
                </FormField>

                <div>
                  <label
                    className="mb-1.5 block text-[11px] font-semibold uppercase tracking-wider text-[#b59a6e]"
                    style={{ fontFamily: "Cinzel, serif" }}
                  >
                    Classe / Ocupação
                  </label>
                  <input
                    type="text"
                    value={characterJob}
                    onChange={(e) => setCharacterJob(e.target.value)}
                    placeholder="Ex: Bruxeiro, Feiticeiro, Caçador..."
                    className="w-full rounded-lg border border-[#4a3d2a]/60 bg-[#0f0d0a]/60 px-3 py-2 text-xs text-[#f1e7d2] placeholder-[#6b5a3e]/50 shadow-inner transition-all focus:border-[#d69a3d]/60 focus:bg-[#0f0d0a]/80 focus:outline-none focus:ring-1 focus:ring-[#d69a3d]/30"
                    style={inputFont}
                  />

                  {/* Sugestões como "tags rúnicas" */}
                  <div className="mt-3 flex flex-wrap gap-1.5">
                    <span
                      className="mr-1 self-center text-[10px] text-[#6b5a3e]"
                      style={{ fontFamily: "Cinzel, serif" }}
                    >
                      Classes:
                    </span>
                    {SUGGESTED_JOBS.map((job) => (
                      <button
                        key={job}
                        type="button"
                        onClick={() => setCharacterJob(job)}
                        className={`rounded-md border px-2.5 py-1 text-[11px] font-medium transition-all ${
                          characterJob === job
                            ? "border-[#d69a3d]/60 bg-[#d69a3d]/15 text-[#f0d9a0] shadow-[0_0_8px_rgba(214,154,61,0.15)]"
                            : "border-[#4a3d2a]/40 bg-[#0f0d0a]/40 text-[#8a7355] hover:border-[#6b5a3e] hover:text-[#c5ab8d]"
                        }`}
                        style={{ fontFamily: "Crimson Text, serif" }}
                      >
                        {job}
                      </button>
                    ))}
                  </div>
                  <div>
                    <label className="mb-1.5 block text-[11px] font-semibold uppercase tracking-wider text-[#b59a6e]" style={{ fontFamily: "Cinzel, serif" }}>
                      Classe customizada
                    </label>
                    <input
                      type="text"
                      value={customClass}
                      onChange={(e) => setCustomClass(e.target.value)}
                      placeholder="Opcional: Pistoleiro Ígneo, Artífice de Guerra..."
                      className="w-full rounded-lg border border-[#4a3d2a]/60 bg-[#0f0d0a]/60 px-3 py-2 text-xs text-[#f1e7d2] placeholder-[#6b5a3e]/50 shadow-inner transition-all focus:border-[#d69a3d]/60 focus:outline-none"
                      style={inputFont}
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Botão de Registro */}
            <button
              type="submit"
              disabled={loading}
              className="group relative flex w-full items-center justify-center gap-2.5 overflow-hidden rounded-lg border border-[#d69a3d]/50 py-3 text-sm font-semibold tracking-wider transition-all hover:border-[#d69a3d] hover:shadow-[0_0_24px_rgba(214,154,61,0.2)] active:scale-[0.98] disabled:opacity-50"
              style={{
                fontFamily: "Cinzel, serif",
                background: "linear-gradient(135deg, #2a2018 0%, #3d2e1a 50%, #2a2018 100%)",
                color: "#f0d9a0",
              }}
            >
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-[#d69a3d]/10 to-transparent opacity-0 transition-opacity group-hover:opacity-100" />
              {loading ? (
                <span className="relative flex items-center gap-2">
                  <span className="h-4 w-4 animate-spin rounded-full border-2 border-[#d69a3d] border-t-transparent" />
                  Forjando Personagem e Conta...
                </span>
              ) : (
                <span className="relative flex items-center gap-2">
                  Concluir Cadastro & Iniciar Aventura
                  <ArrowRight size={16} />
                </span>
              )}
            </button>
          </form>

          {/* Link para Login */}
          <div className="mt-6 border-t border-[#4a3d2a]/30 pt-4 text-center">
            <p
              className="text-xs text-[#8a7355]"
              style={{ fontFamily: "Crimson Text, serif" }}
            >
              Já possui uma conta registrada?{" "}
              <Link
                href="/login"
                className="font-semibold text-[#d69a3d] transition hover:text-[#f0d9a0] hover:drop-shadow-[0_0_6px_rgba(214,154,61,0.4)]"
                style={{ fontFamily: "Cinzel, serif" }}
              >
                Fazer Login
              </Link>
            </p>
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
