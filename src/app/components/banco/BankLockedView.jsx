import { Card } from "../ui";
import { BankPasswordInput } from "./BankPasswordInput";
import { BANK_STYLES } from "./constants";

/**
 * Componente exibido quando o banco está bloqueado
 * Apresenta tela de login com entrada de senha
 *
 * @param {string} bankInput - Valor atual do input de senha
 * @param {boolean} bankError - Indica se a senha está incorreta
 * @param {Function} onInputChange - Callback ao alterar o input
 * @param {Function} onUnlock - Callback ao tentar desbloquear
 */
export function BankLockedView({
  bankInput,
  bankError,
  onInputChange,
  onUnlock,
}) {
  return (
    <div className="flex min-h-[60vh] items-center justify-center">
      <Card className="w-full max-w-sm space-y-4 text-center">
        {/* Ícone decorativo */}
        <div className={BANK_STYLES.icon}>🏦</div>

        {/* Título */}
        <h2 className={BANK_STYLES.title}>Banco de Glenor</h2>

        {/* Descrição */}
        <p className={BANK_STYLES.subtitle}>Digite a senha para acessar</p>

        {/* Formulário de login */}
        <div className="space-y-2">
          <BankPasswordInput
            value={bankInput}
            hasError={bankError}
            onChange={onInputChange}
            onSubmit={onUnlock}
          />

          {bankError && (
            <p className={BANK_STYLES.errorMessage}>Senha incorreta</p>
          )}

          <button
            onClick={onUnlock}
            className={BANK_STYLES.unlockButton}
            style={{ fontFamily: "'Cinzel', serif" }}
          >
            Entrar
          </button>
        </div>
      </Card>
    </div>
  );
}
