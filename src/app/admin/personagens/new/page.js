"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function NewPersonagem() {
  const [name, setName] = useState("");
  const [job, setJob] = useState("");
  const router = useRouter();

  async function submit(e) {
    e.preventDefault();
    const payload = { name, job, hp: 10, hpMax: 10, level: 1 };
    await fetch("/api/characters", { method: "POST", body: JSON.stringify(payload) });
    router.push("/admin/personagens");
  }

  return (
    <form onSubmit={submit} className="max-w-lg">
      <div>
        <label className="block text-sm text-[#a98b68]">Nome</label>
        <input value={name} onChange={(e) => setName(e.target.value)} className="mt-1 w-full rounded-md bg-[#0b0d12] border border-white/6 px-3 py-2 text-[#f5e9d7]" />
      </div>

      <div className="mt-3">
        <label className="block text-sm text-[#a98b68]">Classe / Job</label>
        <input value={job} onChange={(e) => setJob(e.target.value)} className="mt-1 w-full rounded-md bg-[#0b0d12] border border-white/6 px-3 py-2 text-[#f5e9d7]" />
      </div>

      <div className="mt-4 flex gap-2">
        <button type="submit" className="rounded-md bg-[#d69a3d] px-4 py-2 text-[#17140f]">Criar</button>
      </div>
    </form>
  );
}
