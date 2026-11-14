"use client";

import { Coins, X } from "lucide-react";
import { useCharacter } from "../context/CharacterContext";
import { Card, EditableText, SectionHeader } from "../components/ui";
import { BankUnlockedView } from "../components/banco/BankUnlockedView";
import { BankLockedView } from "../components/banco/BankLockedView";

/**
 * Página principal do Banco de Glenor
 * Gerencia acesso protegido por senha e exibição do inventário do banco
 */
export default function BancoPage() {
  const {
    data,
    bankUnlocked,
    bankInput,
    bankError,
    setBankInput,
    setBankUnlocked,
    updBank,
    tryUnlock,
  } = useCharacter();

  if (!bankUnlocked) {
    return (
      <BankLockedView
        bankInput={bankInput}
        bankError={bankError}
        onInputChange={setBankInput}
        onUnlock={tryUnlock}
      />
    );
  }

  return (
    <BankUnlockedView
      characterId={data.id}
      bankSlots={data.bankSlots}
      onLogout={() => setBankUnlocked(false)}
      onSlotUpdate={updBank}
    />
  );
}
