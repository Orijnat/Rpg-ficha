"use client";

import { useState, Suspense } from "react";
import Link from "next/link";
import { KeyRound, Mail, MailCheck, ArrowLeft } from "lucide-react";
import AuthScaffold from "../../components/auth/AuthScaffold";
import { forgotPasswordOnBackend } from "../../lib/api";

const inputCls =
  "w-full rounded-lg border border-[#4a3d2a]/60 bg-[#0f0d0a]/60 py-2.5 pl-9 pr-3 text-sm text-[#f1e7d2] placeholder-[#6b5a3e]/50 shadow-inner transition-all focus:border-[var(--theme-accent)]/60 focus:outline-none focus:ring-1 focus:ring-[var(--theme-accent)]/30";

function EsqueciSenhaContent() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [sent, setSent] = useState(null); // { message, devPreviewUrl? }

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    if (!email.trim() || !email.includes("@")) {
      setError("Informe um e-mail válido.");
      return;
    }
    setLoading(true);
    try {
      const result = await forgotPasswordOnBackend(email.trim().toLowerCase());
      setSent({ message: result?.message || "Se a conta existir, enviaremos o link.", devPreviewUrl: result?.devPreviewUrl });
    } catch (err) {
      setError(err?.message || "Não foi possível processar o pedido.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthScaffold>
      <div className="relative w-full max-w-md py-8">
        <div className="rounded-2xl border border-[var(--theme-accent)]/30 bg-[#16120d]/90 p-7 shadow-[0_0_60px_rgba(214,154,61,0.12)] backdrop-blur-sm">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl border border-[var(--theme-accent)]/40 bg-[var(--theme-accent)]/10 text-[var(--theme-accent)]">
            <KeyRound size={22} />
          </div>
          <h1 className="mt-4 font-cinzel text-xl font-black tracking-wide text-[#f0d9a0]">
            Recuperar Chave
          </h1>
          <p className="mt-1.5 font-journal text-sm italic leading-relaxed text-[#cbb694]">
            Informe o e-mail da sua conta. Enviaremos um pergaminho com o caminho para forjar uma nova senha.
          </p>

          {sent ? (
            <div className="mt-5 space-y-4" role="status" aria-live="polite">
              <div className="rounded-xl border border-emerald-500/30 bg-emerald-950/20 p-4 text-sm text-emerald-300">
                <p className="flex items-center gap-2 font-semibold"><MailCheck size={15} /> Missiva enviada</p>
                <p className="mt-1.5 text-emerald-200/80">{sent.message}</p>
              </div>
              {sent.devPreviewUrl && (
                <a
                  href={sent.devPreviewUrl}
                  className="block break-all rounded-lg border border-amber-500/30 bg-amber-950/20 px-3 py-2 text-[11px] text-amber-300 hover:bg-amber-950/40"
                >
                  [dev] Link de redefinição: {sent.devPreviewUrl}
                </a>
              )}
              <Link href="/login" className="inline-flex min-h-11 items-center gap-2 font-cinzel text-xs font-bold uppercase tracking-wider text-[var(--theme-accent)] hover:text-[#f0d9a0]">
                <ArrowLeft size={13} /> Voltar ao login
              </Link>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="mt-5 space-y-4">
              <div className="group relative">
                <span className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 text-[#6b5a3e]">
                  <Mail size={15} />
                </span>
                <input
                  type="email"
                  autoComplete="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="seu@email.com"
                  aria-label="E-mail da conta"
                  className={inputCls}
                />
              </div>
              {error && <p role="alert" className="text-xs font-semibold text-rose-400">{error}</p>}
              <button
                type="submit"
                disabled={loading}
                className="flex min-h-11 w-full items-center justify-center gap-2 rounded-lg border border-[var(--theme-accent)]/50 py-2.5 font-cinzel text-xs font-bold uppercase tracking-wider text-[#f0d9a0] transition hover:border-[var(--theme-accent)] disabled:opacity-50"
                style={{ background: "linear-gradient(135deg, #2a2018 0%, #3d2e1a 50%, #2a2018 100%)" }}
              >
                {loading ? "Enviando missiva..." : "Enviar pergaminho de redefinição"}
              </button>
              <Link href="/login" className="inline-flex min-h-10 items-center gap-2 font-cinzel text-[11px] font-bold uppercase tracking-wider text-[var(--theme-subtitle)] hover:text-[var(--theme-accent)]">
                <ArrowLeft size={12} /> Voltar
              </Link>
            </form>
          )}
        </div>
      </div>
    </AuthScaffold>
  );
}

export default function EsqueciSenhaPage() {
  return (
    <Suspense fallback={null}>
      <EsqueciSenhaContent />
    </Suspense>
  );
}
