"use client";

import { ChevronDown, ChevronUp, Coins, Package, Plus, Trash2 } from "lucide-react";
import { useCharacter } from "../context/CharacterContext";
import { Card, EditableNumber, EditableText, SectionHeader } from "../components/ui";
import InventoryItem from "../components/inventario/InventoryItem"; // Importação corrigida (sem chaves)

// ============================================
// CONSTANTES E ESTILOS
// Exportamos para que o componente InventoryItem também possa usar!
// ============================================
export const INVENTORY_STYLES = {
  itemContainer: "group flex items-center gap-2 border-b border-[rgba(201,134,42,0.08)] py-1.5 last:border-0",
  itemName: "text-sm text-[#e8d5b0]",
  quantityButton: "flex h-5 w-5 items-center justify-center rounded bg-[#241c13] text-xs text-[#8a7355] hover:text-[#c9862a]",
  quantityInput: "w-12 bg-transparent text-center text-sm text-[#e8d5b0] outline-none",
};

// ============================================
// COMPONENTES AUXILIARES
// ============================================

export function QuantityControls({ itemId, quantity, onQuantityChange }) {
  const decreaseQuantity = () => {
    onQuantityChange(itemId, Math.max(0, quantity - 1));
  };

  const increaseQuantity = () => {
    onQuantityChange(itemId, quantity + 1);
  };

  // Correção aplicada: O return agora está dentro da função!
  return (
    <div className="flex shrink-0 items-center gap-1">
      <button
        onClick={decreaseQuantity}
        className={INVENTORY_STYLES.quantityButton}
        aria-label="Diminuir quantidade"
      >
        <ChevronDown size={11} />
      </button>
      <EditableNumber
        value={quantity}
        onChange={(value) => onQuantityChange(itemId, value)}
        className={INVENTORY_STYLES.quantityInput}
        min={0}
      />
      <button
        onClick={increaseQuantity}
        className={INVENTORY_STYLES.quantityButton}
        aria-label="Aumentar quantidade"
      >
        <ChevronUp size={11} />
      </button>
    </div>
  );
}

// Nota: Como a CoinsSection não estava no seu último trecho, 
// adicionei uma estrutura básica. Se você já tem a sua, pode substituir!
function CoinsSection({ data, onUpdate }) {
  return (
    <Card>
      <div className="flex items-center gap-2 mb-2">
        <SectionHeader title="Moedas" icon={<Coins size={14} />} />
      </div>
      <div className="text-sm text-[#8a7355]">
        {/* Implemente os inputs de moedas aqui */}
        Platina: {data?.coins?.platina || 0} | Ouro: {data?.coins?.ouro || 0} | Prata: {data?.coins?.prata || 0} | Cobre: {data?.coins?.cobre || 0}
      </div>
    </Card>
  );
}

/**
 * Seção de itens e equipamentos
 */
function InventorySection({ data, onAddItem, onUpdateItem, onRemoveItem }) {
  return (
    <Card>
      <div className="mb-3 flex items-center justify-between">
        <SectionHeader title="Itens & Equipamentos" icon={<Package size={14} />} />
        <button 
          onClick={onAddItem} 
          className="flex items-center gap-1 text-xs text-[#c9862a] transition-colors hover:text-[#e8a030]"
          aria-label="Adicionar novo item"
        >
          <Plus size={13} /> Adicionar
        </button>
      </div>
      <div className="space-y-1">
        {/* Adicionado o sinal de '?' (Optional Chaining) para evitar erros caso o inventário esteja vazio no carregamento */}
        {data?.inventory?.map((item) => (
          <InventoryItem
            key={item.id}
            item={item}
            onNameChange={onUpdateItem}
            onQuantityChange={onUpdateItem}
            onDelete={onRemoveItem}
          />
        ))}
      </div>
    </Card>
  );
}

// ============================================
// PÁGINA PRINCIPAL
// ============================================

export default function InventarioPage() {
  const { data, upd, addItem, removeItem, updItem } = useCharacter();

  // Prevenção de quebra de layout caso os dados do contexto ainda estejam carregando
  if (!data) {
    return <div className="p-4 text-[#e8d5b0]">Carregando inventário...</div>;
  }

  return (
    <div className="space-y-4">
      <CoinsSection 
        data={data} 
        onUpdate={upd} 
      />
      <InventorySection
        data={data}
        onAddItem={addItem}
        onUpdateItem={updItem}
        onRemoveItem={removeItem}
      />
    </div>
  );
}