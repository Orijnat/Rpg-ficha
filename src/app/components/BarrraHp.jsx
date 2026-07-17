"use client";

import React from "react";
import { Shield } from "lucide-react";
import { SectionHeader, HPBar, EditableNumber } from "./ui";
import { useCharacter } from "../context/CharacterContext";

export default function BarrraHp() {
  const { data, upd } = useCharacter();

  return (
    <div>
      <SectionHeader title="Pontos de Vida" icon={<Shield size={14} />} />
      <div className="mb-2 flex items-center gap-3">
        <button
          className="flex h-7 w-7 items-center justify-center rounded bg-[#8b1a1a] text-[#e8d5b0] transition-colors hover:bg-[#a02020]"
          onClick={() => upd("hp", Math.max(0, data.hp - 1))}
        >
          −
        </button>
        <div className="flex-1">
          <HPBar hp={data.hp} max={data.hpMax} />
        </div>
        <button
          className="flex h-7 w-7 items-center justify-center rounded bg-[#4a7c59] text-[#e8d5b0] transition-colors hover:bg-[#5a9c69]"
          onClick={() => upd("hp", Math.min(data.hpMax, data.hp + 1))}
        >
          +
        </button>
      </div>
      <div className="flex items-center gap-2 text-sm">
        <span className="text-[#8a7355]">HP:</span>
        <EditableNumber value={data.hp} onChange={(value) => upd("hp", value)} className="font-bold text-[#e8d5b0]" min={0} max={data.hpMax} />
        <span className="text-[#8a7355]">/</span>
        <EditableNumber value={data.hpMax} onChange={(value) => upd("hpMax", value)} className="text-[#8a7355]" min={1} />
      </div>
    </div>
  );
}