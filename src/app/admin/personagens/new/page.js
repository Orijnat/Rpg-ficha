"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createCharacterOnBackend } from "../../../../lib/api";
import { useAuth } from "../../../context/AuthContext";

export default function NewPersonagem() {
  const [name, setName] = useState("");
  const [job, setJob] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const { token } = useAuth();

  async function submit(e) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const payload = { name: name.trim() || "Novo Personagem", job: job.trim() || "Aventureiro", hp: 10, hpMax: 10, level: 1 };
      await createCharacterOnBackend(payload, token);
      router.push("/admin/personagens");
    } catch (err) {
      setError(err.message || "Erro ao cadastrar personagem.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={submit} className="max-w-lg space-y-4">
      {error && (
        <div className="rounded-lg border border-red-500/30 bg-red-950/20 p-3 text-xs text-red-300">
          {error}
        </div>
      )}

      <div>
        <label className="block text-sm text-[#a98b68]">Nome do Personagem</label>
        <input
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Ex: Sir Percival"
          required
          className="mt-1 w-full rounded-md bg-[#0b0d12] border border-white/10 px-3 py-2 text-[#f5e9d7] outline-none focus:border-primary"
        />
      </div>

      <div>
        <label className="block text-sm text-[#a98b68]">Classe / Papel</label>
        <input
          value={job}
          onChange={(e) => setJob(e.target.value)}
          placeholder="Ex: Paladino, Mercenário"
          className="mt-1 w-full rounded-md bg-[#0b0d12] border border-white/10 px-3 py-2 text-[#f5e9d7] outline-none focus:border-primary"
        />
      </div>

      <div className="pt-2">
        <button
          type="submit"
          disabled={loading}
          className="rounded-md bg-primary px-4 py-2 text-xs font-bold uppercase tracking-wider text-primary-foreground transition hover:brightness-110 active:scale-95 disabled:opacity-50"
        >
          {loading ? "Criando..." : "Criar Personagem"}
        </button>
      </div>
    </form>
  );
}
