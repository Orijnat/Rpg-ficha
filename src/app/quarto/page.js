"use client";

import { useState } from "react";
import { Home, Bed } from "lucide-react";
import { useCharacter } from "../context/CharacterContext";
import { Card, EditableText, SectionHeader } from "../components/ui";
import RestControls from "../components/RestControls";
import { Check } from "lucide-react";

export default function QuartoPage() {
  const { data, upd, updExtra, trainAbility } = useCharacter();
  const [restNotice, setRestNotice] = useState("");

  const activeTraining = data.abilities?.find((h) => h.isTraining);

  /**
   * Callback recebido do RestControls após descanso aplicado pelo motor de regras.
   * Persiste as mudanças no CharacterContext e exibe a notificação.
   */
  const handleUpdateCharacter = async ({ hp, peCurrent, insanityCurrent, description, type, result }) => {
    // Persiste HP
    if (typeof hp === "number") {
      upd("hp", hp);
    }

    // Persiste PE atual
    if (typeof peCurrent === "number") {
      updExtra("peCurrent", peCurrent);
    }

    // Persiste Insanidade atual (apenas no descanso longo)
    if (typeof insanityCurrent === "number") {
      updExtra("insanityCurrent", insanityCurrent);
    }

    // Lógica de treino — mantida da implementação anterior
    let trainMsg = "";
    if (activeTraining && trainAbility) {
      const hours = type === "long" ? 4 : 1;
      trainAbility(activeTraining.id, hours);
      trainMsg =
        type === "long"
          ? ` e completou +4h de treino dedicado em ${activeTraining.name}`
          : ` e investiu +1h no treino de ${activeTraining.name}`;
    }

    // Monta notificação
    let notice = "";
    if (type === "short") {
      const r = result;
      notice = `Descanso Curto realizado! +${r.hpHealed} PV, +${r.peRestored} PE recuperados${trainMsg}.`;
    } else {
      const r = result;
      const insMsg = r.insanityReduced > 0 ? `, Insanidade −${r.insanityReduced}` : "";
      // Montaria — mantida da implementação anterior
      if (data.mountHPMax) {
        upd("mountHP", data.mountHPMax);
      }
      notice = `Descanso Longo completo! PV e PE totalmente restaurados${insMsg}${trainMsg}.`;
    }

    setRestNotice(notice);
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

        <RestControls
          character={data}
          updateCharacter={handleUpdateCharacter}
        />
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
