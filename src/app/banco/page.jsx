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
    upd,
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
      bankPassword={data.bankPassword}
      bankSlots={data.bankSlots}
      onPasswordChange={(value) => {
        upd("bankPassword", value);
        setBankUnlocked(true);
      }}
      onLogout={() => setBankUnlocked(false)}
      onSlotUpdate={updBank}
    />
  );
}
