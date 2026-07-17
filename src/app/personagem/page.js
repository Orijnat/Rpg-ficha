"use client";

import { Check, Shield, Skull, Sword } from "lucide-react";
import { useCharacter } from "../context/CharacterContext";
import { Card, EditableText, EditableNumber, HPBar, SectionHeader, StatBox } from "../components/ui";
import Aparencia from "../components/Aparencia";
import Pericia from "../components/Pericia";
import Anotacoes from "../components/Anotacoes";
import BarraHp from "../components/BarrraHp";

export default function Personagem() {
  const { data, upd, updSkill } = useCharacter();

  return (
    <div className="space-y-4">
      <Card>
        <SectionHeader title="Atributos" icon={<Sword size={14} />} />
        <div className="flex flex-wrap justify-center gap-2 sm:justify-start">
          {["FOR", "DES", "CON", "SAB", "ESP", "CAR", "INT"].map((attr) => (
            <StatBox key={attr} label={attr} value={data[attr]} onChange={(value) => upd(attr, value)} />
          ))}
        </div>
      </Card>

      <BarraHp />

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <Aparencia/>
        <Pericia />
      </div>
      
          <Anotacoes />
    </div>
  );
}
