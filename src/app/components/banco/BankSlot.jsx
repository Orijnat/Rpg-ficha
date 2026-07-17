import { BANK_STYLES, SLOT_CONFIG } from "./constants";

/**
 * Slot individual do banco
 * Exibe item com opção de edição via prompt
 *
 * @param {number} index - Índice do slot
 * @param {string} item - Nome do item (ou vazio)
 * @param {Function} onUpdate - Callback ao atualizar
 */
export function BankSlot({ index, item, onUpdate }) {
  const hasItem = Boolean(item);
  const displayText = hasItem
    ? formatItemName(item, SLOT_CONFIG.maxNameLength)
    : SLOT_CONFIG.emptySlotChar;

  const handleClick = () => {
    const nextValue = window.prompt("Item:", item);
    if (nextValue !== null) {
      onUpdate(index, nextValue);
    }
  };

  return (
    <div
      title={item || "vazio"}
      className={`flex aspect-square cursor-pointer items-center justify-center rounded border p-0.5 text-center text-[9px] leading-tight transition-colors ${
        hasItem ? BANK_STYLES.slotFilled : BANK_STYLES.slotEmpty
      }`}
      onClick={handleClick}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => e.key === "Enter" && handleClick()}
    >
      {displayText}
    </div>
  );
}

/**
 * Formata o nome do item para caber no slot
 * @param {string} itemName - Nome do item
 * @param {number} maxLength - Comprimento máximo
 * @returns {string} Nome formatado com reticências se necessário
 */
function formatItemName(itemName, maxLength) {
  if (itemName.length > maxLength) {
    return `${itemName.slice(0, maxLength)}…`;
  }
  return itemName;
}
