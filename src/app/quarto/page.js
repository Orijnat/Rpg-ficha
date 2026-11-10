"use client";

import { useState } from "react";
import { Home, Moon, Sun, Sparkles, Bed, Check } from "lucide-react";
import { useCharacter } from "../context/CharacterContext";
import { useDice } from "../context/DiceContext";
import { Card, EditableText, SectionHeader } from "../components/ui";

export default function QuartoPage() {
  const { data, upd, updExtra, trainAbility } = useCharacter();
  const { executeRoll } = useDice();
  const [restNotice, setRestNotice] = useState("");

  const peMax = Number(data.dadosExtras?.peMax ?? 10);
  const peCurrent = Number(data.dadosExtras?.peCurrent ?? 10);
  const activeTraining = data.abilities?.find((h) => h.isTraining);

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

    // Recupera até 3 PE
    const newPe = Math.min(peMax, peCurrent + 3);
    updExtra("peCurrent", newPe);

    // Avança 1 hora na habilidade em foco de treino
    let trainMsg = "";
    if (activeTraining) {
      trainAbility(activeTraining.id, 1);
      trainMsg = ` e investiu +1h no treino de ${activeTraining.name}`;
    }

    setRestNotice(`Descanso Curto realizado! Você recuperou ${roll.total} PV, recuperou PE${trainMsg}.`);
    setTimeout(() => setRestNotice(""), 4500);
  };

  const handleLongRest = () => {
    upd("hp", data.hpMax);
    if (data.mountHPMax) {
      upd("mountHP", data.mountHPMax);
    }
    // Restaura 100% dos PE
    updExtra("peCurrent", peMax);

    // Avança 4 horas de treino intenso na habilidade em foco
    let trainMsg = "";
    if (activeTraining) {
      trainAbility(activeTraining.id, 4);
      trainMsg = ` e completou +4h de treino dedicado em ${activeTraining.name}`;
    }

    setRestNotice(`Descanso Longo completo! Todos os Pontos de Vida (seu e da montaria) e PE foram restaurados${trainMsg}.`);
    setTimeout(() => setRestNotice(""), 4500);
  };

  return (
    <div className="space-y-4">
      {/* Painel de Descanso e Recuperação */}
      <Card>
        <SectionHeader
          title="Aposentos & Descanso"
          subtitle="Recupere o vigor físico, pontos de energia e avance seus estudos arcanos"
          icon={<Bed size={15} />}
        />

        {restNotice && (
          <div className="mb-4 flex items-center gap-2 rounded-xl border border-emerald-500/50 bg-emerald-950/40 p-3 text-xs font-semibold text-emerald-300 shadow-[0_0_15px_rgba(16,185,129,0.2)]">
            <Check size={14} />
            <span>{restNotice}</span>
          </div>
        )}

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          {/* Descanso Curto */}
          <div className="medallion-plate flex flex-col justify-between rounded-xl p-4 sm:p-5">
            <div>
              <div className="flex items-center gap-2 font-cinzel text-sm font-bold text-foreground">
                <Sun size={17} className="text-amber-400" />
                <span>Descanso Curto (1 hora)</span>
              </div>
              <p className="mt-2 font-journal text-xs sm:text-sm italic leading-relaxed text-muted-foreground">
                Pausa breve para respirar e meditar. Recupera 1d8 + CON em vida, restaura até 3 PE e avança +1h no treino da habilidade em foco.
              </p>
            </div>
            <button
              onClick={handleShortRest}
              className="mt-4 flex items-center justify-center gap-2 rounded-xl border border-primary/50 bg-primary/20 py-2.5 font-cinzel text-xs font-bold uppercase tracking-wider text-primary transition hover:bg-primary/30 active:scale-95 shadow-md shadow-primary/15"
            >
              <Sparkles size={14} />
              Realizar Descanso Curto
            </button>
          </div>

          {/* Descanso Longo */}
          <div className="medallion-plate flex flex-col justify-between rounded-xl p-4 sm:p-5">
            <div>
              <div className="flex items-center gap-2 font-cinzel text-sm font-bold text-foreground">
                <Moon size={17} className="text-indigo-400" />
                <span>Descanso Longo (8 horas)</span>
              </div>
              <p className="mt-2 font-journal text-xs sm:text-sm italic leading-relaxed text-muted-foreground">
                Uma noite de sono profundo em segurança. Restaura 100% de PV e PE (seus e da montaria) e avança +4h no treino da habilidade em foco.
              </p>
            </div>
            <button
              onClick={handleLongRest}
              className="mt-4 flex items-center justify-center gap-2 rounded-xl border border-indigo-400/50 bg-indigo-500/20 py-2.5 font-cinzel text-xs font-bold uppercase tracking-wider text-indigo-300 transition hover:bg-indigo-500/30 active:scale-95 shadow-md shadow-indigo-500/20"
            >
              <Sparkles size={14} />
              Realizar Descanso Longo
            </button>
          </div>
        </div>
      </Card>

      {/* Anotações do Quarto */}
      <Card>
        <SectionHeader
          title="Diário do Quarto & Baú de Pertences"
          subtitle="Itens deixados em segurança, cartas e lembranças de jornadas passadas"
          icon={<Home size={15} />}
        />
        <div className="rounded-xl border border-primary/20 bg-background/50 p-3.5">
          <EditableText
            value={data.roomNotes}
            onChange={(value) => upd("roomNotes", value)}
            className="w-full font-journal text-sm sm:text-base leading-relaxed text-foreground"
            multiline
            placeholder="Itens deixados no baú do dormitório, cartas recebidas, mobília, segredos guardados..."
            label="Notas do quarto"
          />
        </div>
      </Card>
    </div>
  );
}
