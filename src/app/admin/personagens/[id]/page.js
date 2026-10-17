"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { fetchCharacterFromBackend, updateCharacterOnBackend } from "../../../../lib/api";
import { useAuth } from "../../../context/AuthContext";

export default function EditPersonagem({ params }) {
  const [id, setId] = useState(null);
  const [item, setItem] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const router = useRouter();
  const { token, isMaster, loading: authLoading } = useAuth();

  useEffect(() => {
    async function load() {
      const resolvedParams = await params;
      setId(resolvedParams.id);
      setLoading(true);
      try {
        const data = await fetchCharacterFromBackend(resolvedParams.id);
        setItem(data);
      } catch (loadError) {
        setError(loadError.message);
      }
      setLoading(false);
    }
    if (!authLoading && isMaster) load();
  }, [authLoading, isMaster]);

  async function save(e) {
    e.preventDefault();
    try {
      await updateCharacterOnBackend(id, item, token);
      router.push("/admin/personagens");
    } catch (saveError) {
      setError(saveError.message);
    }
  }

  if (loading) return <p className="text-sm text-[#a98b68]">Carregando...</p>;
  if (!item) return <p className="text-sm text-red-400">{error || "Personagem não encontrado."}</p>;

  return (
    <form onSubmit={save} className="max-w-lg">
      {error && <p className="mb-4 border border-destructive/30 bg-destructive/10 p-3 text-sm text-destructive-foreground">{error}</p>}
      <div>
        <label className="block text-sm text-[#a98b68]">Nome</label>
        <input value={item.name || ""} onChange={(e) => setItem({ ...item, name: e.target.value })} className="mt-1 w-full rounded-md bg-[#0b0d12] border border-white/6 px-3 py-2 text-[#f5e9d7]" />
      </div>

      <div className="mt-3">
        <label className="block text-sm text-[#a98b68]">Classe / Job</label>
        <input value={item.job || ""} onChange={(e) => setItem({ ...item, job: e.target.value })} className="mt-1 w-full rounded-md bg-[#0b0d12] border border-white/6 px-3 py-2 text-[#f5e9d7]" />
      </div>

      <div className="mt-3 grid grid-cols-2 gap-3">
        <div>
          <label className="block text-sm text-[#a98b68]">HP</label>
          <input type="number" value={item.hp} onChange={(e) => setItem({ ...item, hp: Number(e.target.value) })} className="mt-1 w-full rounded-md bg-[#0b0d12] border border-white/6 px-3 py-2 text-[#f5e9d7]" />
        </div>
        <div>
          <label className="block text-sm text-[#a98b68]">HP Máx</label>
          <input type="number" value={item.hpMax} onChange={(e) => setItem({ ...item, hpMax: Number(e.target.value) })} className="mt-1 w-full rounded-md bg-[#0b0d12] border border-white/6 px-3 py-2 text-[#f5e9d7]" />
        </div>
      </div>

      <div className="mt-4 flex gap-2">
        <button type="submit" className="rounded-md bg-primary px-4 py-2 font-semibold text-primary-foreground transition hover:brightness-110 active:scale-95">Salvar</button>
      </div>
    </form>
  );
}
