import { EditableText } from "../ui";
import { Trash2 } from "lucide-react";
import { INVENTORY_STYLES } from "./consts";

export default function InventoryItem({ item, onNameChange, onQuantityChange, onDelete }) {
  return (
    <div key={item.id} className={INVENTORY_STYLES.itemContainer}>
      {/* Nome do item */}
      <div className="flex-1">
        <EditableText 
          value={item.name} 
          onChange={(value) => onNameChange(item.id, { name: value })} 
          className={INVENTORY_STYLES.itemName}
        />
      </div>

      {/* Controles de quantidade */}
      <div className="flex items-center gap-1">
        <button
          type="button"
          onClick={() => onQuantityChange(item.id, { qty: Math.max(0, (item.qty || 1) - 1) })}
          className={INVENTORY_STYLES.quantityButton}
        >
          -
        </button>
        <span className={INVENTORY_STYLES.quantityInput}>{item.qty || 1}</span>
        <button
          type="button"
          onClick={() => onQuantityChange(item.id, { qty: (item.qty || 1) + 1 })}
          className={INVENTORY_STYLES.quantityButton}
        >
          +
        </button>
      </div>

      {/* Botão de deletar */}
      <button 
        type="button"
        onClick={() => onDelete(item.id)} 
        className={INVENTORY_STYLES.deleteButton}
        aria-label="Remover item"
      >
        <Trash2 size={13} />
      </button>
    </div>
  );
}
