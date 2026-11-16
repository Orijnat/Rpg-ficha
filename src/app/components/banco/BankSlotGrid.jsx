import { BankSlot } from "./BankSlot";

/**
 * Grid de slots do banco
 * Exibe todos os slots em formato de grade responsivo
 *
 * @param {Array} slots - Array de slots { item: string, qty?: number }
 * @param {Function} onSlotClick - Callback ao clicar em um slot (abre o modal)
 */
export function BankSlotGrid({ slots, onSlotClick }) {
  return (
    <div className="grid grid-cols-8 gap-1.5 sm:grid-cols-10">
      {slots.map((slot, index) => (
        <BankSlot
          key={index}
          index={index}
          item={slot.item}
          qty={slot.qty}
          onSlotClick={onSlotClick}
        />
      ))}
    </div>
  );
}
