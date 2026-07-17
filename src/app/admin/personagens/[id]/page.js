"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

export default function EditPersonagem({ params }) {
  const { id } = params;
  const [item, setItem] = useState(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    async function load() {
      setLoading(true);
      const res = await fetch(`/api/characters/${id}`);
      if (res.ok) {
        const data = await res.json();
        setItem(data);
      }
      setLoading(false);
    }
    load();
  }, [id]);

  async function save(e) {
    e.preventDefault();
    await fetch(`/api/characters/${id}`, { method: "PUT", body: JSON.stringify(item) });
    router.push("/admin/personagens");
  }

  if (loading) return <p className="text-sm text-[#a98b68]">Carregando...</p>;
  if (!item) return <p className="text-sm text-red-400">Personagem não encontrado.</p>;

  return (
    <form onSubmit={save} className="max-w-lg">
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
        <button type="submit" className="rounded-md bg-[#d69a3d] px-4 py-2 text-[#17140f]">Salvar</button>
      </div>
    </form>
  );
}
