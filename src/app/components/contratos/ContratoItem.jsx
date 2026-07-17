import { EditableText } from "../ui";
import { ContratoCheckbox } from "./ContratoCheckbox";
import { ContratoDeleteButton } from "./ContratoDeleteButton";
import { CONTRATO_STYLES } from "./contrato-constants";

/**
 * Item individual de contrato
 * Exibe título, recompensa e controles de edição/exclusão
 *
 * @param {Object} contract - Objeto do contrato { id, title, reward, done }
 * @param {Function} onUpdate - Callback ao atualizar contrato
 * @param {Function} onRemove - Callback ao remover contrato
 */
export function ContratoItem({ contract, onUpdate, onRemove }) {
  const handleToggleDone = () => {
    onUpdate(contract.id, { done: !contract.done });
  };

  const handleTitleChange = (value) => {
    onUpdate(contract.id, { title: value });
  };

  const handleRewardChange = (value) => {
    onUpdate(contract.id, { reward: value });
  };

  const handleRemove = () => {
    onRemove(contract.id);
  };

  const borderClass = contract.done
    ? CONTRATO_STYLES.borderDone
    : CONTRATO_STYLES.borderActive;

  const titleClass = contract.done
    ? CONTRATO_STYLES.titleDone
    : CONTRATO_STYLES.titleActive;

  return (
    <div className={`group rounded-lg border p-3 transition-all ${borderClass}`}>
      <div className="flex items-start gap-3">
        {/* Checkbox de conclusão */}
        <ContratoCheckbox
          isDone={contract.done}
          onToggle={handleToggleDone}
        />

        {/* Conteúdo: Título e Recompensa */}
        <div className="flex-1 space-y-1">
          <EditableText
            value={contract.title}
            onChange={handleTitleChange}
            className={`text-sm font-medium ${titleClass}`}
          />

          <ContratoRewardField
            reward={contract.reward}
            onChange={handleRewardChange}
          />
        </div>

        {/* Botão de deletar (aparece ao hover) */}
        <ContratoDeleteButton onDelete={handleRemove} />
      </div>
    </div>
  );
}

/**
 * Campo de recompensa do contrato
 * Exibe label e valor editável
 *
 * @param {string} reward - Valor da recompensa
 * @param {Function} onChange - Callback ao alterar recompensa
 */
function ContratoRewardField({ reward, onChange }) {
  return (
    <div className="flex items-center gap-2 text-xs">
      <span
        className="text-[#8a7355]"
        style={{ fontFamily: "'Cinzel', serif" }}
      >
        Recompensa:
      </span>
      <EditableText
        value={reward}
        onChange={onChange}
        className="text-[#c9862a]"
      />
    </div>
  );
}
