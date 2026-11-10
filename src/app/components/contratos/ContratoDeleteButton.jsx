import { Trash2 } from "lucide-react";

/**
 * Botão de deletar contrato
 * Aparece ao fazer hover no contrato
 * Requer confirmação do usuário
 *
 * @param {Function} onDelete - Callback ao confirmar deleção
 */
export function ContratoDeleteButton({ onDelete }) {
  const handleClick = () => {
    if (confirm("Tem certeza que deseja remover este contrato?")) {
      onDelete();
    }
  };

  return (
    <button
      onClick={handleClick}
      className="shrink-0 text-[#8b1a1a] opacity-0 transition-all group-hover:opacity-100 hover:text-[#c02020]"
      title="Remover contrato"
      aria-label="Remover contrato"
    >
      <Trash2 size={13} />
    </button>
  );
}
