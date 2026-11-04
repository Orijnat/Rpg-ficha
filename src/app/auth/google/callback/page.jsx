"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "../../../context/AuthContext";

export default function GoogleCallbackPage() {
  const router = useRouter();
  const { adoptToken } = useAuth();
  const [error, setError] = useState("");

  useEffect(() => {
    const token = window.location.hash.match(/(?:^|&)token=([^&]+)/)?.[1];
    if (!token) {
      setError("Não foi possível concluir o login com Google.");
      return;
    }

    adoptToken(decodeURIComponent(token))
      .then((data) => router.replace(data.user?.perfil === "mestre" ? "/admin" : "/personagem"))
      .catch((cause) => setError(cause.message || "Não foi possível validar sua conta Google."));
  }, [adoptToken, router]);

  return (
    <div className="w-full max-w-md rounded-2xl border border-[#6b5a3e]/60 bg-[#16120d] p-8 text-center text-[#f5e9d7]">
      {error ? (
        <>
          <p className="mb-4 text-sm text-red-300">{error}</p>
          <button type="button" onClick={() => router.replace("/login")} className="rounded-lg bg-[#d69a3d] px-4 py-2 text-sm text-[#17140f]">
            Voltar ao login
          </button>
        </>
      ) : (
        <p className="text-sm">Validando sua conta Google...</p>
      )}
    </div>
  );
}
