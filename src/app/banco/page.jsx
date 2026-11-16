"use client";

import { useCharacter } from "../context/CharacterContext";
import { BankUnlockedView } from "../components/banco/BankUnlockedView";
import { BankLockedView } from "../components/banco/BankLockedView";

/**
 * Página principal do Banco de Azedarack
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
    depositToBank,
    withdrawFromBank,
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
      bankSlots={data.bankSlots}
      inventory={data.inventory}
      onLogout={() => setBankUnlocked(false)}
      onDeposit={depositToBank}
      onWithdraw={withdrawFromBank}
    />
  );
}
