import { Check } from "lucide-react";
import { CONTRATO_STYLES } from "./contrato-constants";

/**
 * Checkbox de conclusão do contrato
 * Marca/desmarca o contrato como concluído
 *
 * @param {boolean} isDone - Se o contrato está concluído
 * @param {Function} onToggle - Callback ao clicar
 */
export function ContratoCheckbox({ isDone, onToggle }) {
  const checkboxClass = isDone
    ? CONTRATO_STYLES.checkboxDone
    : CONTRATO_STYLES.checkboxActive;

  return (
    <button
      onClick={onToggle}
      className={`mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded border transition-colors ${checkboxClass}`}
      title={isDone ? "Marcar como pendente" : "Marcar como concluído"}
      aria-label={isDone ? "Desmarcar contrato" : "Marcar contrato"}
    >
      {isDone && <Check size={11} />}
    </button>
  );
}
