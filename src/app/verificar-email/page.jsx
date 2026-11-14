"use client";

import { useEffect, useRef, useState, Suspense } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { CheckCircle2, Loader2, MailCheck, ShieldQuestion } from "lucide-react";
import AuthScaffold from "../../components/auth/AuthScaffold";
import { verifyEmailOnBackend } from "../../lib/api";

function VerificarEmailContent() {
  const searchParams = useSearchParams();
  const token = searchParams?.get("token") || "";
  const [status, setStatus] = useState("loading"); // loading | success | error
  const [message, setMessage] = useState("Selando o vínculo com o seu e-mail...");
  const requestedRef = useRef(false);

  useEffect(() => {
    if (requestedRef.current) return;
    requestedRef.current = true;
    if (!token) {
      setStatus("error");
      setMessage("Token de verificação ausente. Abra o link enviado por e-mail.");
      return;
    }
    verifyEmailOnBackend(token)
      .then((result) => {
        setStatus("success");
        setMessage(result?.message || "E-mail verificado com sucesso!");
      })
      .catch((error) => {
        setStatus("error");
        setMessage(error?.message || "Não foi possível verificar o e-mail.");
      });
  }, [token]);

  return (
    <AuthScaffold>
      <div className="relative w-full max-w-md py-10 text-center">
        <div className="rounded-2xl border border-[var(--theme-accent)]/30 bg-[#16120d]/90 p-8 shadow-[0_0_60px_rgba(214,154,61,0.12)] backdrop-blur-sm">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl border border-[var(--theme-accent)]/40 bg-[var(--theme-accent)]/10 text-[var(--theme-accent)]">
            {status === "loading" && <Loader2 size={28} className="animate-spin" />}
            {status === "success" && <CheckCircle2 size={28} />}
            {status === "error" && <ShieldQuestion size={28} />}
          </div>
          <h1 className="mt-5 font-cinzel text-2xl font-black tracking-wide text-[#f0d9a0]">
            {status === "success" ? "Selo Rompido" : status === "error" ? "Selo Falho" : "Verificando"}
          </h1>
          <p className="mt-3 font-journal text-sm italic leading-relaxed text-[#cbb694]" role="status" aria-live="polite">
            {message}
          </p>
          {status !== "loading" && (
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
