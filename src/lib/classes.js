/**
 * Catálogo de Classes do Grimorium RPG (d20 customizado).
 * A classe define o DADO DE VIDA e carrega as HABILIDADES DE NÍVEL fixas
 * (referência dinâmica: nada é copiado para a ficha — a ficha apenas lista
 * o que está liberado pelo nível do herói).
 * O catálogo vive no banco (`classes` / `classe_habilidades`, ver /api/classes);
 * este arquivo é o fallback offline e a documentação viva do contrato.
 */

export const DEFAULT_CLASSES = [
  { id: "bruxeiro", slug: "bruxeiro", name: "Bruxeiro", hitDie: "1d10", primaryAttribute: "ESP", secondaryAttribute: "SAB", description: "Caçador de monstros guiado pelos Sinais e pela lâmina de prata.", abilities: [] },
  { id: "guerreiro", slug: "guerreiro", name: "Guerreiro", hitDie: "1d10", primaryAttribute: "FOR", secondaryAttribute: "CON", description: "Mestre de armas, escudos e tática de combate frontal.", abilities: [] },
  { id: "barbaro", slug: "barbaro", name: "Bárbaro", hitDie: "1d12", primaryAttribute: "CON", secondaryAttribute: "FOR", description: "Fúria primal que despreza a dor e o aço adversário.", abilities: [] },
  { id: "ladino", slug: "ladino", name: "Ladino", hitDie: "1d8", primaryAttribute: "DES", secondaryAttribute: "CAR", description: "Sombras, fechaduras e oportunidade onde outros veem só parede.", abilities: [] },
  { id: "ranger", slug: "ranger", name: "Ranger", hitDie: "1d10", primaryAttribute: "DES", secondaryAttribute: "SAB", description: "Caçador silencioso dos ermos, rastreador e arqueiro de escol.", abilities: [] },
  { id: "mago", slug: "mago", name: "Mago", hitDie: "1d6", primaryAttribute: "INT", secondaryAttribute: "ESP", description: "Estudioso dos arcanos; o conhecimento pesa mais que aço.", abilities: [] },
  { id: "clerigo", slug: "clerigo", name: "Clérigo", hitDie: "1d8", primaryAttribute: "CAR", secondaryAttribute: "ESP", description: "Canais da vontade divina; cura, proteção e julgamento.", abilities: [] },
  { id: "bardo", slug: "bardo", name: "Bardo", hitDie: "1d8", primaryAttribute: "CAR", secondaryAttribute: "INT", description: "Palavras e música que inspiram ou despedaçam a coragem.", abilities: [] },
];

export const CLASS_IDS = DEFAULT_CLASSES.map((c) => c.id);
const ATTRS = ["FOR", "DES", "CON", "SAB", "ESP", "CAR", "INT"];

export function getClassById(idOrSlug) {
  if (!idOrSlug) return null;
  const needle = String(idOrSlug).trim().toLowerCase();
  return DEFAULT_CLASSES.find((c) => c.id === needle || c.slug === needle || c.name.toLowerCase() === needle) ?? null;
}

export function getHitDieForClass(classOrId, fallback = "1d8") {
  const cls = typeof classOrId === "string" ? getClassById(classOrId) : classOrId;
  return cls?.hitDie ?? fallback;
}

export function isValidHitDie(notation) {
  if (typeof notation !== "string") return false;
  const match = notation.trim().match(/^(\d+)?d(\d+)([+-]\d+)?$/i);
  if (!match) return false;
  const count = match[1] ? Number(match[1]) : 1;
  const sides = Number(match[2]);
  return Number.isInteger(count) && count >= 1 && count <= 100 && [4, 6, 8, 10, 12, 20, 100].includes(sides);
}

/** @deprecated Mantida para compatibilidade de testes; prefira getClassById. */
export function getClassByName(name) {
  return getClassById(name);
}

export const CLASS_ABILITY_TIPOS = ["magia", "ativa", "passiva", "reacao"];
export const CLASS_ABILITY_ATTRS = ATTRS;

/** Resolve a classe selecionada na ficha a partir do catálogo carregado. */
export function findSelectedClass(classes, character) {
  if (!Array.isArray(classes)) return null;
  const classId = character?.classId ?? null;
  const slug = character?.dadosExtras?.class ?? character?.classSlug ?? null;
  if (classId) {
    const byId = classes.find((c) => c.id === classId);
    if (byId) return byId;
  }
  if (slug) {
    const needle = String(slug).trim().toLowerCase();
    const bySlug = classes.find((c) => String(c.slug ?? "").toLowerCase() === needle || String(c.name ?? "").toLowerCase() === needle);
    if (bySlug) return bySlug;
  }
  return null;
}

/** Habilidades da classe liberadas até o nível informado (referência dinâmica). */
export function getClassAbilities(classe, level) {
  const lv = Math.max(1, Math.min(20, Number(level) || 1));
  const abilities = Array.isArray(classe?.abilities) ? classe.abilities : [];
  return abilities
    .map((ability) => ({ ...ability, reqLevel: Number(ability?.reqLevel ?? ability?.nivel) || 1 }))
    .filter((ability) => ability.reqLevel <= lv)
    .sort((a, b) => a.reqLevel - b.reqLevel || String(a.name).localeCompare(String(b.name)));
}

/** Habilidades da classe ainda bloqueadas, com o nível exigido. */
export function getClassAbilitiesLocked(classe, level) {
  const lv = Math.max(1, Math.min(20, Number(level) || 1));
  const abilities = Array.isArray(classe?.abilities) ? classe.abilities : [];
  return abilities
    .map((ability) => ({ ...ability, reqLevel: Number(ability?.reqLevel ?? ability?.nivel) || 1 }))
    .filter((ability) => ability.reqLevel > lv)
    .sort((a, b) => a.reqLevel - b.reqLevel);
}
