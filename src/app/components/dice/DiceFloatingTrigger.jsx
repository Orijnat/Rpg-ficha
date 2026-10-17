"use client";

import { useDice } from "../../context/DiceContext";
import { Dices } from "lucide-react";

export default function DiceFloatingTrigger() {
  const { openModal, lastRoll } = useDice();

  return (
    <div className="fixed bottom-6 right-6 z-40">
      <button
        onClick={openModal}
        aria-label={lastRoll ? `Abrir rolador; último total ${lastRoll.total}` : "Abrir rolador de dados"}
        className="group relative flex h-14 w-14 items-center justify-center rounded-2xl border border-[#d69a3d]/40 bg-gradient-to-br from-[#241c13] to-[#120e09] text-[#d69a3d] shadow-[0_8px_30px_rgba(0,0,0,0.6)] backdrop-blur-md transition-all duration-200 hover:scale-105 hover:border-[#d69a3d] hover:shadow-[0_0_25px_rgba(214,154,61,0.35)] active:scale-95"
        title="Abrir Rolador de Dados"
      >
        <Dices size={26} className="transition-transform group-hover:rotate-12" />

        {/* Badge do último resultado se houver */}
        {lastRoll && (
          <span className="absolute -top-1 -right-1 flex h-6 w-6 items-center justify-center rounded-full border border-black/40 bg-[#d69a3d] font-mono text-[11px] font-black text-[#17140f] shadow-md">
            {lastRoll.total}
          </span>
        )}
      </button>
    </div>
  );
}
