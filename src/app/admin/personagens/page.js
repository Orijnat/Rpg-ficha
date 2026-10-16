"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { HeartPulse, Plus, ScrollText, Trash2 } from "lucide-react";
import { Card, SectionHeader } from "../../components/ui";

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
    let mounted = true;
    (async () => {
      const res = await fetch("/api/characters");
      const data = await res.json();
      if (mounted) {
        setItems(data);
        setLoading(false);
      }
    })();
    return () => {
      mounted = false;
    };
  }, []);

  async function remove(id) {
    if (!confirm("Excluir personagem?")) return;
    await fetch(`/api/characters/${id}`, { method: "DELETE" });
    load();
  }

  return (
    <Card>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <SectionHeader title="Personagens da campanha" icon={<ScrollText size={15} />} />
        <Link href="/admin/personagens/new" className="flex min-h-11 items-center gap-2 rounded-lg border-2 border-primary/50 bg-primary px-3 py-2 text-xs font-bold uppercase tracking-wider text-primary-foreground transition hover:brightness-110">
          <Plus size={15} /> Novo herói
        </Link>
      </div>

      <div className="mt-4">
        {loading ? (
          <p className="text-sm text-muted-foreground">Carregando...</p>
        ) : (
          <ul className="grid gap-3 sm:grid-cols-2">
            {items.map((p) => (
              <li key={p.id} className="flex items-center justify-between border-2 border-border bg-secondary/60 px-3 py-3">
                <div>
                  <div className="font-serif font-semibold text-foreground">{p.name}</div>
                  <div className="text-sm text-muted-foreground">{p.job || "Aventureiro"} · Nível {p.level || 1}</div>
                  <div className="mt-2 flex items-center gap-1 text-xs text-primary"><HeartPulse size={13} /> {p.hp}/{p.hpMax} PV</div>
                </div>
                <div className="flex items-center gap-2">
                  <Link href={`/admin/personagens/${p.id}`} className="text-sm text-primary hover:underline">
                    Editar
                  </Link>
                  <button onClick={() => remove(p.id)} className="rounded p-2 text-destructive transition hover:bg-destructive/15" title="Excluir personagem">
                    <Trash2 size={14} />
                  </button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </Card>
  );
}
