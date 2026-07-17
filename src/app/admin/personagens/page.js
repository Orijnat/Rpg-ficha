"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

export default function PersonagensAdmin() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);

  async function load() {
    setLoading(true);
    const res = await fetch("/api/characters");
    const data = await res.json();
    setItems(data || []);
    setLoading(false);
  }

  useEffect(() => {
    load();
  }, []);

  async function remove(id) {
    if (!confirm("Excluir personagem?")) return;
    await fetch(`/api/characters/${id}`, { method: "DELETE" });
    load();
  }

  return (
    <div>
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-medium text-[#f5e9d7]">Personagens</h3>
        <Link href="/admin/personagens/new" className="rounded-md bg-[#d69a3d] px-3 py-2 text-sm text-[#17140f]">
          Novo
        </Link>
      </div>

      <div className="mt-4">
        {loading ? (
          <p className="text-sm text-[#a98b68]">Carregando...</p>
        ) : (
          <ul className="space-y-3">
            {items.map((p) => (
              <li key={p.id} className="flex items-center justify-between rounded-md border border-white/6 px-3 py-2">
                <div>
                  <div className="font-semibold text-[#f5e9d7]">{p.name}</div>
                  <div className="text-sm text-[#a98b68]">{p.job} · Nível {p.level}</div>
                </div>
                <div className="flex items-center gap-2">
                  <Link href={`/admin/personagens/${p.id}`} className="text-sm text-[#a98b68] hover:underline">
                    Editar
                  </Link>
                  <button onClick={() => remove(p.id)} className="text-sm text-red-400">
                    Excluir
                  </button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
