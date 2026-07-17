"use client";

import { Footprints } from "lucide-react";
import { useCharacter } from "../context/CharacterContext";
import { Card, EditableNumber, EditableText, HPBar, SectionHeader } from "../components/ui";

export default function MontariaPage() {
  const { data, upd } = useCharacter();

  return (
    <div className="space-y-4">
      <Card>
        <SectionHeader title="Montaria" icon={<Footprints size={14} />} />
        <div className="space-y-4">
          <div className="flex items-center gap-3">
            <span className="w-16 text-sm text-[#8a7355]" style={{ fontFamily: "'Cinzel', serif" }}>
              Nome
            </span>
            <EditableText
              value={data.mountName}
              onChange={(value) => upd("mountName", value)}
              className="font-medium text-[#e8d5b0]"
              placeholder="Nome da montaria"
            />
          </div>
          <div>
            <div className="mb-2 flex items-center gap-3">
              <button className="flex h-7 w-7 items-center justify-center rounded bg-[#8b1a1a] text-[#e8d5b0] hover:bg-[#a02020]" onClick={() => upd("mountHP", Math.max(0, data.mountHP - 1))}>
                −
              </button>
              <div className="flex-1">
                <HPBar hp={data.mountHP} max={data.mountHPMax} />
              </div>
              <button className="flex h-7 w-7 items-center justify-center rounded bg-[#4a7c59] text-[#e8d5b0] hover:bg-[#5a9c69]" onClick={() => upd("mountHP", Math.min(data.mountHPMax, data.mountHP + 1))}>
                +
              </button>
            </div>
            <div className="flex items-center gap-2 text-sm">
              <span className="text-[#8a7355]">HP:</span>
              <EditableNumber value={data.mountHP} onChange={(value) => upd("mountHP", value)} className="font-bold text-[#e8d5b0]" min={0} max={data.mountHPMax} />
              <span className="text-[#8a7355]">/</span>
              <EditableNumber value={data.mountHPMax} onChange={(value) => upd("mountHPMax", value)} className="text-[#8a7355]" min={1} />
            </div>
          </div>
          <div>
            <span className="mb-1 block text-sm text-[#8a7355]" style={{ fontFamily: "'Cinzel', serif" }}>
              Notas
            </span>
            <EditableText
              value={data.mountNotes}
              onChange={(value) => upd("mountNotes", value)}
              className="w-full text-sm text-[#e8d5b0]"
              multiline
              placeholder="Habilidades, equipamentos, histórico..."
            />
          </div>
        </div>
      </Card>
    </div>
  );
}
