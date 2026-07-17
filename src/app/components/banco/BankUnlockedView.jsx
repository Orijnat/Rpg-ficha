import { Coins, X } from "lucide-react";
import { Card, EditableText, SectionHeader } from "../ui";
import { BankSlotGrid } from "./BankSlotGrid";

/**
 * Componente exibido quando o banco está desbloqueado
 * Mostra header com controles e grid de slots
 *
 * @param {string} bankPassword - Senha atual do banco
 * @param {Array} bankSlots - Lista de slots do banco
 * @param {Function} onPasswordChange - Callback ao alterar senha
 * @param {Function} onLogout - Callback ao fazer logout
 * @param {Function} onSlotUpdate - Callback ao atualizar um slot
 */
export function BankUnlockedView({
  bankPassword,
  bankSlots,
  onPasswordChange,
  onLogout,
  onSlotUpdate,
}) {
  return (
    <div className="space-y-4">
      <Card>
        {/* Header com título e controles */}
        <div className="mb-3 flex items-center justify-between">
          <SectionHeader title="Banco de Glenor" icon={<Coins size={14} />} />

          <BankHeaderControls
            password={bankPassword}
            onPasswordChange={onPasswordChange}
            onLogout={onLogout}
          />
        </div>

        {/* Grid de slots */}
        <BankSlotGrid slots={bankSlots} onSlotUpdate={onSlotUpdate} />
      </Card>
    </div>
  );
}

/**
 * Controles do header do banco (senha e logout)
 */
function BankHeaderControls({ password, onPasswordChange, onLogout }) {
  return (
    <div className="flex items-center gap-2 text-xs text-[#8a7355]">
      <span>Senha:</span>

      <EditableText
        value={password}
        onChange={onPasswordChange}
        className="font-mono text-[#c9862a]"
      />

      <button
        onClick={onLogout}
        className="text-[#8a7355] transition-colors hover:text-[#c9862a]"
        title="Logout"
      >
        <X size={13} />
      </button>
    </div>
  );
}
