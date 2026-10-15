"use client";

import { useState } from "react";
import { Home, Moon, Sun, Sparkles, Bed, Check } from "lucide-react";
import { useCharacter } from "../context/CharacterContext";
import { useDice } from "../context/DiceContext";
import { Card, EditableText, SectionHeader } from "../components/ui";

export default function QuartoPage() {
  const { data, upd } = useCharacter();
  const { executeRoll } = useDice();
  const [restNotice, setRestNotice] = useState("");

  const handleShortRest = () => {
    // Rola 1d8 + mod CON de cura rápida
    const con = data.CON ?? 10;
    const conMod = Math.floor((con - 10) / 2);
    const roll = executeRoll({
      sides: 8,
      mode: "normal",
      modifier: Math.max(0, conMod),
      label: "Descanso Curto (1d8 + CON)",
    });

    const newHp = Math.min(data.hpMax, data.hp + roll.total);
    upd("hp", newHp);
    setRestNotice(`Descanso Curto realizado! Você recuperou ${roll.total} PV.`);
    setTimeout(() => setRestNotice(""), 4000);
  };

  const handleLongRest = () => {
    upd("hp", data.hpMax);
    if (data.mountHPMax) {
      upd("mountHP", data.mountHPMax);
    }
    setRestNotice("Descanso Longo completo! Todos os Pontos de Vida (seu e da montaria) foram restaurados.");
    setTimeout(() => setRestNotice(""), 4000);
  };

  return (
    <div className="space-y-4">
      {/* Painel de Descanso e Recuperação */}
      <Card>
        <SectionHeader title="Aposentos & Descanso" icon={<Bed size={14} />} />

        {restNotice && (
          <div className="mb-4 flex items-center gap-2 rounded-xl border border-emerald-500/40 bg-emerald-500/10 p-3 text-xs font-semibold text-emerald-300">
            <Check size={14} />
            <span>{restNotice}</span>
          </div>
        )}

        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          {/* Descanso Curto */}
          <div className="flex flex-col justify-between rounded-xl border border-white/5 bg-white/[0.02] p-4 transition-all hover:border-[#d69a3d]/30">
            <div>
              <div className="flex items-center gap-2 text-sm font-bold text-[#f5e9d7]">
                <Sun size={16} className="text-amber-400" />
                <span>Descanso Curto (1 hora)</span>
              </div>
              <p className="mt-1 text-xs text-[#8a7355]">
                Pausa para respirar e enfaixar ferimentos. Recupera 1d8 + modificador de CON em vida.
              </p>
            </div>
            <button
              onClick={handleShortRest}
              className="mt-4 flex items-center justify-center gap-2 rounded-xl border border-primary/40 bg-primary/15 py-2.5 text-xs font-bold text-primary transition hover:bg-primary/25 active:scale-95"
            >
              <Sparkles size={13} />
              Realizar Descanso Curto
            </button>
          </div>

          {/* Descanso Longo */}
          <div className="flex flex-col justify-between rounded-xl border border-white/5 bg-white/[0.02] p-4 transition-all hover:border-indigo-500/30">
            <div>
              <div className="flex items-center gap-2 text-sm font-bold text-[#f5e9d7]">
                <Moon size={16} className="text-indigo-400" />
                <span>Descanso Longo (8 horas)</span>
              </div>
              <p className="mt-1 text-xs text-[#8a7355]">
                Uma boa noite de sono em segurança. Restaura 100% dos Pontos de Vida (seus e da sua montaria).
              </p>
            </div>
            <button
              onClick={handleLongRest}
              className="mt-4 flex items-center justify-center gap-2 rounded-xl border border-accent/50 bg-accent/15 py-2.5 text-xs font-bold text-accent transition hover:bg-accent/25 active:scale-95"
            >
              <Sparkles size={13} />
              Realizar Descanso Longo
            </button>
          </div>
        </div>
      </Card>

      {/* Anotações do Quarto */}
      <Card>
        <SectionHeader title="Diário do Quarto & Pertences Guardados" icon={<Home size={14} />} />
        <div className="rounded-xl border border-white/5 bg-white/[0.02] p-3">
          <EditableText
            value={data.roomNotes}
            onChange={(value) => upd("roomNotes", value)}
            className="w-full text-sm text-[#e8d5b0]"
            multiline
            placeholder="Itens deixados no baú do dormitório, cartas recebidas, mobília, segredos guardados..."
          />
        </div>
      </Card>
    </div>
  );
}
