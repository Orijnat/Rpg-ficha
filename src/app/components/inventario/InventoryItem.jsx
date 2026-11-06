import {EditableText} from "../ui";
import { Trash2 } from "lucide-react";
import { INVENTORY_STYLES, QuantityControls } from "../../inventario/page";

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
      <QuantityControls
        itemId={item.id}
        quantity={item.qty}
        onQuantityChange={(id, qty) => onQuantityChange(id, { qty })}
      />

      {/* Botão de deletar */}
      <button 
        onClick={() => onDelete(item.id)} 
        className={INVENTORY_STYLES.deleteButton}
        aria-label="Remover item"
      >
        <Trash2 size={13} />
      </button>
    </div>
  );
}