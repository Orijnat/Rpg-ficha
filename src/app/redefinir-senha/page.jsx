"use client";

import { useState, Suspense } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Eye, EyeOff, Lock, ShieldCheck, CheckCircle2 } from "lucide-react";
import AuthScaffold from "../../components/auth/AuthScaffold";
import { resetPasswordOnBackend } from "../../lib/api";

const inputCls =
  "w-full rounded-lg border border-[#4a3d2a]/60 bg-[#0f0d0a]/60 py-2.5 pl-9 pr-11 text-sm text-[#f1e7d2] placeholder-[#6b5a3e]/50 shadow-inner transition-all focus:border-[var(--theme-accent)]/60 focus:outline-none focus:ring-1 focus:ring-[var(--theme-accent)]/30";

function RedefinirSenhaContent() {
  const searchParams = useSearchParams();
  const token = searchParams?.get("token") || "";
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [done, setDone] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    if (!token) {
      setError("Token ausente. Abra o link enviado por e-mail.");
      return;
    }
    if (password.length < 6) {
      setError("A senha deve ter pelo menos 6 caracteres.");
      return;
    }
    if (password !== confirm) {
      setError("As senhas não coincidem.");
      return;
    }
    setLoading(true);
    try {
      await resetPasswordOnBackend(token, password);
      setDone(true);
    } catch (err) {
      setError(err?.message || "Não foi possível redefinir a senha.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthScaffold>
      <div className="relative w-full max-w-md py-8">
        <div className="rounded-2xl border border-[var(--theme-accent)]/30 bg-[#16120d]/90 p-7 shadow-[0_0_60px_rgba(214,154,61,0.12)] backdrop-blur-sm">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl border border-[var(--theme-accent)]/40 bg-[var(--theme-accent)]/10 text-[var(--theme-accent)]">
            {done ? <CheckCircle2 size={22} /> : <ShieldCheck size={22} />}
          </div>
          <h1 className="mt-4 font-cinzel text-xl font-black tracking-wide text-[#f0d9a0]">
            {done ? "Chave Reforjada" : "Forjar Nova Chave"}
          </h1>

          {done ? (
            <div className="mt-4 space-y-4" role="status" aria-live="polite">
              <p className="font-journal text-sm italic leading-relaxed text-[#cbb694]">
                Sua senha foi redefinida e todas as sessões antigas foram revogadas. Entre novamente com a nova chave.
              </p>
              <Link
                href="/login"
                className="inline-flex min-h-11 items-center gap-2 rounded-lg border border-[var(--theme-accent)]/50 bg-[var(--theme-accent)]/15 px-6 font-cinzel text-xs font-bold uppercase tracking-wider text-[#f0d9a0] transition hover:bg-[var(--theme-accent)]/25"
              >
                Entrar no Reino
              </Link>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="mt-5 space-y-4">
              <p className="font-journal text-sm italic leading-relaxed text-[#cbb694]">
                Escolha uma nova senha para sua conta. As sessões abertas em outros aparelhos serão encerradas.
              </p>
              {[
                { value: password, setter: setPassword, label: "Nova senha", autoComplete: "new-password" },
                { value: confirm, setter: setConfirm, label: "Confirmar nova senha", autoComplete: "new-password" },
              ].map(({ value, setter, label, autoComplete }) => (
                <div key={label} className="group relative">
                  <span className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 text-[#6b5a3e]">
                    <Lock size={15} />
                  </span>
                  <input
                    type={showPassword ? "text" : "password"}
                    required
                    minLength={6}
                    autoComplete={autoComplete}
                    value={value}
                    onChange={(e) => setter(e.target.value)}
                    placeholder={label}
                    aria-label={label}
                    className={inputCls}
                  />
                </div>
              ))}
              <button
                type="button"
                onClick={() => setShowPassword((current) => !current)}
                className="inline-flex min-h-10 items-center gap-1.5 text-[11px] font-semibold text-[var(--theme-subtitle)] transition hover:text-[var(--theme-accent)]"
                aria-pressed={showPassword}
              >
                {showPassword ? <EyeOff size={12} /> : <Eye size={12} />}
                {showPassword ? "Ocultar senha" : "Mostrar senha"}
              </button>
              {error && <p role="alert" className="text-xs font-semibold text-rose-400">{error}</p>}
              <button
                type="submit"
                disabled={loading}
                className="flex min-h-11 w-full items-center justify-center gap-2 rounded-lg border border-[var(--theme-accent)]/50 py-2.5 font-cinzel text-xs font-bold uppercase tracking-wider text-[#f0d9a0] transition hover:border-[var(--theme-accent)] disabled:opacity-50"
                style={{ background: "linear-gradient(135deg, #2a2018 0%, #3d2e1a 50%, #2a2018 100%)" }}
              >
                {loading ? "Forjando..." : "Redefinir senha"}
              </button>
            </form>
          )}
        </div>
      </div>
    </AuthScaffold>
  );
}

export default function RedefinirSenhaPage() {
  return (
    <Suspense fallback={null}>
      <RedefinirSenhaContent />
    </Suspense>
  );
}
