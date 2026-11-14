/**
 * Catálogo Oficial de Classes do Grimorium RPG (d20 customizado).
 * Fonte única de verdade para dado de vida e atributos-chave por classe.
 * Usado na criação de fichas, na sugestão de Hit Die e em regras derivadas.
 */

export const DEFAULT_CLASSES = [
  { id: "bruxeiro", name: "Bruxeiro", hitDie: "1d10", primaryAttribute: "ESP", secondaryAttribute: "SAB", description: "Caçador de monstros guiado pelos Sinais e pela lâmina de prata." },
  { id: "guerreiro", name: "Guerreiro", hitDie: "1d10", primaryAttribute: "FOR", secondaryAttribute: "CON", description: "Mestre de armas, escudos e tática de combate frontal." },
  { id: "barbaro", name: "Bárbaro", hitDie: "1d12", primaryAttribute: "CON", secondaryAttribute: "FOR", description: "Fúria primal que despreza a dor e o aço adversário." },
  { id: "ladino", name: "Ladino", hitDie: "1d8", primaryAttribute: "DES", secondaryAttribute: "CAR", description: "Sombras, fechaduras e oportunidade onde outros veem só parede." },
  { id: "ranger", name: "Ranger", hitDie: "1d10", primaryAttribute: "DES", secondaryAttribute: "SAB", description: "Caçador silencioso dos ermos, rastreador e arqueiro de escol." },
  { id: "mago", name: "Mago", hitDie: "1d6", primaryAttribute: "INT", secondaryAttribute: "ESP", description: "Estudioso dos arcanos; o conhecimento pesa mais que aço." },
  { id: "clerigo", name: "Clérigo", hitDie: "1d8", primaryAttribute: "CAR", secondaryAttribute: "ESP", description: "Canais da vontade divina; cura, proteção e julgamento." },
  { id: "bardo", name: "Bardo", hitDie: "1d8", primaryAttribute: "CAR", secondaryAttribute: "INT", description: "Palavras e música que inspiram ou despedaçam a coragem." },
];

export const CLASS_IDS = DEFAULT_CLASSES.map((c) => c.id);

export function getClassByName(name) {
  if (!name || typeof name !== "string") return null;
  const needle = name.trim().toLowerCase();
  return DEFAULT_CLASSES.find((c) => c.id === needle || c.name.toLowerCase() === needle) ?? null;
}

export function getHitDieForClass(name, fallback = "1d8") {
  return getClassByName(name)?.hitDie ?? fallback;
}

export function isValidHitDie(notation) {
  if (typeof notation !== "string") return false;
  const match = notation.trim().match(/^(\d+)?d(\d+)([+-]\d+)?$/i);
  if (!match) return false;
  const count = match[1] ? Number(match[1]) : 1;
  const sides = Number(match[2]);
  return Number.isInteger(count) && count >= 1 && count <= 100 && [4, 6, 8, 10, 12, 20, 100].includes(sides);
}

/** Habilidades pré-aprovadas por classe (base mínima, todas no nível 1). */
export const CLASS_ABILITY_PRESETS = {
  bruxeiro: ["hab-igni", "hab-quen"],
  guerreiro: [],
  barbaro: [],
  ladino: [],
  ranger: [],
  mago: ["hab-igni"],
  clerigo: ["hab-quen"],
  bardo: [],
};

export function getAbilityPresetsForClass(name) {
  const cls = getClassByName(name);
  return cls ? CLASS_ABILITY_PRESETS[cls.id] ?? [] : [];
}
