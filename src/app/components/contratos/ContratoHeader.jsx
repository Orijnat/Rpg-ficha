import { FileText, Plus } from "lucide-react";
import { SectionHeader } from "../ui";

/**
 * Header do painel de contratos
 * Exibe título e botão para adicionar novo contrato
 *
 * @param {Function} onAddContract - Callback ao criar novo contrato
 */
export function ContratoHeader({ onAddContract }) {
  return (
    <div className="mb-3 flex items-center justify-between">
      <SectionHeader 
        title="Painel de Contratos" 
        icon={<FileText size={14} />} 
      />

      <button
        onClick={onAddContract}
        className="flex items-center gap-1 text-xs text-[#c9862a] transition-colors hover:text-[#e8a030]"
        title="Criar novo contrato"
      >
        <Plus size={13} />
        Novo Contrato
      </button>
    </div>
  );
}
