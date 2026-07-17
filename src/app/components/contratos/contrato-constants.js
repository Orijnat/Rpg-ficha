/**
 * Constantes e estilos centralizados do módulo Contrato
 * Facilita manutenção e alterações de design
 */

/**
 * Estilos Tailwind para componentes de Contrato
 */
export const CONTRATO_STYLES = {
  // Estados do contrato (borders)
  borderActive:
    "border-[rgba(201,134,42,0.3)] hover:border-[rgba(201,134,42,0.5)]",
  borderDone: "border-[rgba(201,134,42,0.1)] opacity-50",

  // Estados do título
  titleActive: "text-[#e8d5b0]",
  titleDone: "line-through text-[#8a7355]",

  // Estados do checkbox
  checkboxActive:
    "border-[rgba(201,134,42,0.4)] hover:border-[#c9862a]",
  checkboxDone:
    "border-[#4a7c59] bg-[#4a7c59] text-white",

  // Botões
  addButtonText: "text-[#c9862a]",
  addButtonHover: "hover:text-[#e8a030]",
  deleteButtonText: "text-[#8b1a1a]",
  deleteButtonHover: "hover:text-[#c02020]",
};

/**
 * Configurações de comportamento
 */
export const CONTRATO_CONFIG = {
  showDeleteConfirm: true, // Mostrar confirmação antes de deletar
  animationDuration: "transition-all", // Classe de transição
};

/**
 * Mensagens do sistema
 */
export const CONTRATO_MESSAGES = {
  panelTitle: "Painel de Contratos",
  newContractButton: "Novo Contrato",
  rewardLabel: "Recompensa:",
  emptyState: "Nenhum contrato ativo",
  deleteConfirm: "Tem certeza que deseja remover este contrato?",
  markDone: "Marcar como concluído",
  markPending: "Marcar como pendente",
};

/**
 * Configurações de acessibilidade
 */
export const A11Y_CONFIG = {
  checkboxDoneLabel: "Desmarcar contrato",
  checkboxPendingLabel: "Marcar contrato",
  deleteButtonLabel: "Remover contrato",
  addButtonLabel: "Criar novo contrato",
};
