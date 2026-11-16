import { BANK_STYLES, SLOT_CONFIG } from "./constants";

/**
 * Slot individual do banco
 * Clique abre o modal do cofre (depositar do inventário ou devolver)
 *
 * @param {number} index - Índice do slot
 * @param {string} item - Nome do item (ou vazio)
 * @param {number} [qty] - Quantidade guardada (opcional em slots antigos)
 * @param {Function} onSlotClick - Callback ao clicar no slot
 */
export function BankSlot({ index, item, qty, onSlotClick }) {
  const hasItem = Boolean(item);
  const amount = Number(qty) > 1 ? ` ×${qty}` : "";
  const label = hasItem ? `${item}${amount}` : "";
  const displayText = hasItem
    ? formatItemName(label, SLOT_CONFIG.maxNameLength)
    : SLOT_CONFIG.emptySlotChar;

  return (
    <div
      title={hasItem ? `${label} — clique para gerenciar` : "vazio — clique para guardar um item"}
      className={`flex aspect-square cursor-pointer items-center justify-center rounded border p-0.5 text-center text-[10px] leading-tight transition-colors ${
        hasItem ? BANK_STYLES.slotFilled : BANK_STYLES.slotEmpty
      }`}
      onClick={() => onSlotClick(index)}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => e.key === "Enter" && onSlotClick(index)}
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
