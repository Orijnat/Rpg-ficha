"use client";

import { useEffect, useRef, useState, Suspense } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { CheckCircle2, Loader2, MailCheck, ShieldQuestion, SendHorizonal, LockKeyhole } from "lucide-react";
import AuthScaffold from "../../components/auth/AuthScaffold";
import { verifyEmailOnBackend, verifyEmailCodeOnBackend, resendVerificationOnBackend } from "../../lib/api";

function VerificarEmailContent() {
  const searchParams = useSearchParams();
  const token = searchParams?.get("token") || "";
  const email = searchParams?.get("email") || "";
  const isCodeMode = !token;

  const [status, setStatus] = useState(isCodeMode ? "form" : "loading"); // form | checking | success | error | loading
  const [message, setMessage] = useState(
    isCodeMode ? "Digite o código de 6 dígitos que enviamos para o seu e-mail." : "Selando o vínculo com o seu e-mail..."
  );
  const [code, setCode] = useState("");
  const [sending, setSending] = useState(false);
  const requestedRef = useRef(false);

  useEffect(() => {
    if (requestedRef.current) return;
    requestedRef.current = true;
    if (token) {
      verifyEmailOnBackend(token)
        .then((result) => {
          setStatus("success");
          setMessage(result?.message || "E-mail verificado com sucesso!");
        })
        .catch((error) => {
          setStatus("error");
          setMessage(error?.message || "Não foi possível verificar o e-mail.");
        });
      return;
    }
    if (!email) {
      setStatus("error");
      setMessage("E-mail ausente. Volte ao cadastro ou envie um novo código.");
    }
  }, [token, email]);

  const handleVerify = async (e) => {
    e.preventDefault();
    if (!code.trim() || !email) return;
    setStatus("checking");
    setMessage("");
    try {
      const result = await verifyEmailCodeOnBackend({ email, code: code.trim() });
      setStatus("success");
      setMessage(result?.message || "E-mail verificado com sucesso!");
    } catch (error) {
      setStatus("form");
      setMessage(error?.message || "Código inválido ou expirado.");
    }
  };

  const handleResend = async () => {
    if (!email) return;
    setSending(true);
    setMessage("Enviando um novo código...");
    try {
      const result = await resendVerificationOnBackend(email);
      setMessage(result?.message || "E-mail de verificação reenviado.");
    } catch (error) {
      setMessage(error?.message || "Não foi possível reenviar o e-mail.");
    } finally {
      setSending(false);
    }
  };

  return (
    <AuthScaffold>
      <div className="relative w-full max-w-md py-10 text-center">
        <div className="rounded-2xl border border-[var(--theme-accent)]/30 bg-[#16120d]/90 p-8 shadow-[0_0_60px_rgba(214,154,61,0.12)] backdrop-blur-sm">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl border border-[var(--theme-accent)]/40 bg-[var(--theme-accent)]/10 text-[var(--theme-accent)]">
            {status === "loading" || status === "checking" ? (
              <Loader2 size={28} className="animate-spin" />
            ) : status === "success" ? (
              <CheckCircle2 size={28} />
            ) : status === "form" ? (
              <LockKeyhole size={28} />
            ) : (
              <ShieldQuestion size={28} />
            )}
          </div>
          <h1 className="mt-5 font-cinzel text-2xl font-black tracking-wide text-[#f0d9a0]">
            {status === "success" ? "Selo Rompido" : status === "error" ? "Selo Falho" : "Verificação de E-mail"}
          </h1>
          <p className="mt-3 font-journal text-sm italic leading-relaxed text-[#cbb694]" role="status" aria-live="polite">
            {message}
          </p>
          {email && (
            <p className="mt-1 font-mono text-[11px] text-[#8a7355]">{email}</p>
          )}

          {status === "form" && (
            <form onSubmit={handleVerify} className="mt-6 space-y-4 text-left">
              <div>
                <label htmlFor="verification-code" className="mb-2 block text-center text-[11px] font-semibold uppercase tracking-[0.2em] text-[#b59a6e]" style={{ fontFamily: "Cinzel, serif" }}>
                  Código de 6 dígitos
                </label>
                <input
                  id="verification-code"
                  type="text"
                  inputMode="numeric"
                  autoComplete="one-time-code"
                  pattern="[0-9]{6}"
                  maxLength={6}
                  value={code}
                  onChange={(e) => setCode(e.target.value.replace(/\D/g, "").slice(0, 6))}
                  placeholder="000000"
                  className="w-full rounded-xl border border-[#4a3d2a]/60 bg-[#0f0d0a]/60 px-4 py-3 text-center font-mono text-2xl font-bold tracking-[0.6em] text-[#f0d9a0] placeholder-[#4a3d2a]/50 focus:border-[var(--theme-accent)] focus:outline-none"
                  aria-label="Código de 6 dígitos"
                  required
                />
              </div>
              <button
                type="submit"
                disabled={code.length < 6}
                className="flex min-h-11 w-full items-center justify-center gap-2 rounded-lg border border-[var(--theme-accent)]/50 bg-[var(--theme-accent)]/15 px-6 font-cinzel text-xs font-bold uppercase tracking-wider text-[#f0d9a0] transition hover:bg-[var(--theme-accent)]/25 disabled:cursor-not-allowed disabled:opacity-50"
              >
                <MailCheck size={15} /> Verificar e-mail
              </button>
              <button
                type="button"
                onClick={handleResend}
                disabled={sending}
                className="flex min-h-11 w-full items-center justify-center gap-2 rounded-lg border border-[#4a3d2a]/60 bg-[#0f0d0a]/40 px-6 text-xs font-semibold text-[#b59a6e] transition hover:border-[var(--theme-accent)]/40 hover:text-[#f0d9a0] disabled:opacity-50"
              >
                <SendHorizonal size={14} /> {sending ? "Reenviando..." : "Reenviar código"}
              </button>
            </form>
          )}

          {(status === "success" || status === "error") && (
            <Link
              href="/login"
              className="mt-6 inline-flex min-h-11 items-center gap-2 rounded-lg border border-[var(--theme-accent)]/50 bg-[var(--theme-accent)]/15 px-6 font-cinzel text-xs font-bold uppercase tracking-wider text-[#f0d9a0] transition hover:bg-[var(--theme-accent)]/25"
            >
              <MailCheck size={15} /> Ir para o login
            </Link>
          )}
        </div>
      </div>
    </AuthScaffold>
  );
}

export default function VerificarEmailPage() {
  return (
    <Suspense fallback={null}>
      <VerificarEmailContent />
    </Suspense>
  );
}
