/**
 * Helpers de recompensa de encontro (Sala de Guerra).
 */

/**
 * XP total do encontro, definido no cadastro ("XP Total do Encontro").
 * O backend guarda tudo em dados_extras.recursos ({ xp, tesouro }) — não
 * existe coluna top-level "recursos" na tabela encontros. Aceita o formato
 * legado top-level `encounter.recursos.xp` por tolerância.
 */
export function getEncounterXpReward(encounter) {
  const raw = encounter?.dadosExtras?.recursos?.xp ?? encounter?.recursos?.xp ?? 0;
  const value = Math.floor(Number(raw));
  if (!Number.isFinite(value) || value < 0) return 0;
  return value;
}
