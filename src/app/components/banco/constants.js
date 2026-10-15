/**
 * Constantes e estilos centralizados do módulo Banco
 * Facilita manutenção e alterações de design
 */

/**
 * Estilos Tailwind para componentes do Banco
 */
export const BANK_STYLES = {
  // Tela de login (bloqueado)
  icon: "text-4xl text-primary",
  title: "text-lg text-foreground",
  subtitle: "text-sm text-muted-foreground",
  errorMessage: "text-xs text-destructive",
  unlockButton:
    "w-full rounded bg-primary py-2 font-semibold text-primary-foreground transition-colors hover:brightness-110",

  // Input de senha
  inputBorder:
    "border-primary/30 focus:border-primary",
  inputErrorBorder: "border-destructive",

  // Slots
  slotFilled:
    "border-primary bg-secondary text-primary",
  slotEmpty:
    "border-primary/15 bg-muted text-transparent hover:border-primary/40 hover:text-muted-foreground",
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
