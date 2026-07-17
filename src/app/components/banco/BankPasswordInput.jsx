import { BANK_STYLES } from "./constants";

/**
 * Input de senha para o banco
 * Suporta Enter para submissão rápida
 *
 * @param {string} value - Valor do input
 * @param {boolean} hasError - Se há erro de validação
 * @param {Function} onChange - Callback ao alterar valor
 * @param {Function} onSubmit - Callback ao pressionar Enter
 */
export function BankPasswordInput({
  value,
  hasError,
  onChange,
  onSubmit,
}) {
  const borderClass = hasError
    ? BANK_STYLES.inputErrorBorder
    : BANK_STYLES.inputBorder;

  const handleKeyDown = (event) => {
    if (event.key === "Enter") {
      onSubmit();
    }
  };

  return (
    <input
      type="password"
      value={value}
      onChange={(event) => onChange(event.target.value)}
      onKeyDown={handleKeyDown}
      placeholder="Senha..."
      className={`w-full rounded border bg-[#241c13] px-3 py-2 text-center text-lg tracking-widest text-[#e8d5b0] focus:outline-none ${borderClass}`}
    />
  );
}
