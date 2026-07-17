/**
 * Constantes e estilos centralizados do módulo Banco
 * Facilita manutenção e alterações de design
 */

/**
 * Estilos Tailwind para componentes do Banco
 */
export const BANK_STYLES = {
  // Tela de login (bloqueado)
  icon: "text-4xl text-[#c9862a]",
  title: "text-lg text-[#e8d5b0]",
  subtitle: "text-sm text-[#8a7355]",
  errorMessage: "text-xs text-[#8b1a1a]",
  unlockButton:
    "w-full rounded bg-[#c9862a] py-2 font-semibold text-[#0f0d0a] transition-colors hover:bg-[#e8a030]",

  // Input de senha
  inputBorder:
    "border-[rgba(201,134,42,0.3)] focus:border-[#c9862a]",
  inputErrorBorder: "border-[#8b1a1a]",

  // Slots
  slotFilled:
    "border-[#c9862a] bg-[#2a1c0a] text-[#c9862a]",
  slotEmpty:
    "border-[rgba(201,134,42,0.15)] bg-[#241c13] text-transparent hover:border-[rgba(201,134,42,0.4)] hover:text-[#8a7355]",
};

/**
 * Configurações dos slots do banco
 */
export const SLOT_CONFIG = {
  maxNameLength: 8, // Máximo de caracteres antes de truncar
  emptySlotChar: "·", // Caractere exibido em slots vazios
  gridColsDesktop: "sm:grid-cols-10", // Colunas em desktop
  gridColsMobile: "grid-cols-8", // Colunas em mobile
  gridGap: "gap-1.5", // Espaçamento entre slots
};

/**
 * Mensagens do sistema
 */
export const BANK_MESSAGES = {
  loginPrompt: "Digite a senha para acessar",
  wrongPassword: "Senha incorreta",
  bankTitle: "Banco de Glenor",
  bankIcon: "🏦",
  passwordLabel: "Senha:",
  emptySlotLabel: "vazio",
};

/**
 * Configurações de acessibilidade
 */
export const A11Y_CONFIG = {
  passwordInputPlaceholder: "Senha...",
  logoutButtonTitle: "Logout",
  slotInputPrompt: "Item:",
};
