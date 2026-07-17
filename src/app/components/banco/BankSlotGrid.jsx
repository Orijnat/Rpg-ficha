import { BankSlot } from "./BankSlot";

/**
 * Grid de slots do banco
 * Exibe todos os slots em formato de grade responsivo
 *
 * @param {Array} slots - Array de slots { item: string }
 * @param {Function} onSlotUpdate - Callback ao editar um slot
 */
export function BankSlotGrid({ slots, onSlotUpdate }) {
  return (
    <div className="grid grid-cols-8 gap-1.5 sm:grid-cols-10">
      {slots.map((slot, index) => (
        <BankSlot
          key={index}
          index={index}
          item={slot.item}
          onUpdate={onSlotUpdate}
        />
      ))}
    </div>
  );
}
