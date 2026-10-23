/**
 * Módulo de Regras Matemáticas e Modificadores do RPG (Base d20 com 7 Atributos)
 * Mantido por: @rpg-rules-engine
 */

export const ATTRIBUTES = ["FOR", "DES", "CON", "SAB", "ESP", "CAR", "INT"];

export const ATTRIBUTE_LABELS = {
  FOR: "Força",
  DES: "Destreza",
  CON: "Constituição",
  SAB: "Sabedoria",
  ESP: "Espírito",
  CAR: "Carisma",
  INT: "Inteligência",
};

/**
 * Mapeamento canônico das 19 perícias do sistema e seus atributos base.
 */
export const DEFAULT_SKILLS = [
  // FOR
  { name: "Atletismo", attr: "FOR" },
  // DES
  { name: "Acrobacia", attr: "DES" },
  { name: "Furtividade", attr: "DES" },
  { name: "Prestidigitação", attr: "DES" },
  // SAB
  { name: "História", attr: "SAB" },
  { name: "Investigação", attr: "SAB" },
  { name: "Sobrevivência", attr: "SAB" },
  { name: "Provocação", attr: "SAB" },
  { name: "Animais", attr: "SAB" },
  { name: "Medicina", attr: "SAB" },
  // ESP
  { name: "Intuição", attr: "ESP" },
  { name: "Percepção", attr: "ESP" },
  { name: "Atuação", attr: "ESP" },
  // CAR
  { name: "Enganação", attr: "CAR" },
  { name: "Intimidação", attr: "CAR" },
  { name: "Persuasão", attr: "CAR" },
  // INT
  { name: "Arcanismo", attr: "INT" },
  { name: "Religião", attr: "INT" },
  { name: "Natureza", attr: "INT" },
];

/**
 * Calcula o modificador de um valor de atributo d20: floor((valor - 10) / 2)
 * @param {number|string} attributeValue
 * @returns {number} Modificador inteiro
 */
export function calculateModifier(attributeValue) {
  const value = Number(attributeValue);
  if (isNaN(value)) return 0;
  return Math.floor((value - 10) / 2);
}

/**
 * Formata um modificador numérico com sinal (+X ou -X)
 * @param {number} mod
 * @returns {string} "+2", "0", "-1"
 */
export function formatModifier(mod) {
  const numericMod = Number(mod) || 0;
  if (numericMod > 0) return `+${numericMod}`;
  return `${numericMod}`;
}

/**
 * Calcula o bônus final de uma perícia considerando o modificador do atributo base
 * e bônus de treino/customizado.
 * @param {Object} skill Objeto da perícia { name, attr, trained, bonus }
 * @param {Object} characterData Objeto do personagem com os atributos { FOR, DES, ... }
 * @param {number} proficiencyBonus Bônus padrão de treino (padrão 2 se treinado e sem bônus explícito)
 * @returns {Object} Detalhes do cálculo da perícia
 */
export function calculateSkillBonus(skill, characterData = {}, proficiencyBonus = 2) {
  const baseAttr = skill.attr || "FOR";
  const attrValue = characterData[baseAttr] ?? 10;
  const attrMod = calculateModifier(attrValue);

  let extraBonus = 0;
  if (typeof skill.bonus === "number") {
    extraBonus = skill.bonus;
  } else if (skill.trained) {
    extraBonus = proficiencyBonus;
  }

  const total = attrMod + extraBonus;

  return {
    name: skill.name,
    attr: baseAttr,
    attrValue,
    attrMod,
    trained: Boolean(skill.trained),
    extraBonus,
    total,
    formatted: formatModifier(total),
  };
}

/**
 * Calcula todos os modificadores de atributos de um personagem.
 * @param {Object} characterData
 * @returns {Record<string, number>} { FOR: 2, DES: 3, ... }
 */
export function calculateAllModifiers(characterData = {}) {
  const modifiers = {};
  for (const attr of ATTRIBUTES) {
    modifiers[attr] = calculateModifier(characterData[attr] ?? 10);
  }
  return modifiers;
}

/**
 * Valida a integridade do conjunto de atributos de um personagem.
 * @param {Object} attrs
 * @returns {{ valid: boolean, errors: string[] }}
 */
export function validateAttributes(attrs = {}) {
  const errors = [];
  for (const attr of ATTRIBUTES) {
    const val = attrs[attr];
    if (val === undefined || val === null) {
      errors.push(`Atributo obrigatório ausente: ${attr}`);
    } else {
      const num = Number(val);
      if (isNaN(num)) {
        errors.push(`Atributo ${attr} deve ser numérico, recebido: ${val}`);
      } else if (num < 1 || num > 30) {
        errors.push(`Atributo ${attr} deve estar no intervalo de 1 a 30, recebido: ${num}`);
      }
    }
  }
  return {
    valid: errors.length === 0,
    errors,
  };
}

/**
 * Calcula a capacidade de carga e peso total transportado pelo personagem.
 * @param {Object} characterData
 * @returns {{ carried: number, max: number, isOverloaded: boolean, percentage: number }}
 */
export function calculateCapacity(characterData = {}) {
  const max = Math.max(
    1,
    Number(
      characterData?.dadosExtras?.inventoryCapacity ??
        characterData?.inventoryCapacity ??
        (characterData?.FOR ? Math.floor(Number(characterData.FOR) * 1.5) : 20)
    ) || 20
  );

  const inventory = Array.isArray(characterData?.inventory)
    ? characterData.inventory
    : Array.isArray(characterData?.itensInventario)
    ? characterData.itensInventario
    : [];

  const carried = inventory.reduce((acc, item) => {
    const qty = Number(item?.qty ?? item?.quantidade ?? 1);
    return acc + (isNaN(qty) ? 0 : Math.max(0, qty));
  }, 0);

  const isOverloaded = carried > max;
  const percentage = Math.min(100, Math.round((carried / max) * 100));

  return {
    carried,
    max,
    isOverloaded,
    percentage,
  };
}

/**
 * Calcula a iniciativa do personagem baseada no modificador de DES e bônus extra.
 * @param {Object} characterData
 * @returns {{ desMod: number, extra: number, total: number, formatted: string }}
 */
export function calculateInitiative(characterData = {}) {
  const desMod = calculateModifier(characterData?.DES ?? 10);
  const extra = Number(characterData?.dadosExtras?.initiative ?? 0) || 0;
  const total = desMod + extra;

  return {
    desMod,
    extra,
    total,
    formatted: formatModifier(total),
  };
}

/**
 * Validação rigorosa e sanitização do schema do personagem para importação/exportação.
 * @param {any} data
 * @returns {{ valid: boolean, errors: string[], sanitized: Object }}
 */
export function validateCharacterSchema(data) {
  const errors = [];
  if (!data || typeof data !== "object") {
    return { valid: false, errors: ["Formato inválido: os dados devem ser um objeto."], sanitized: null };
  }

  // Valida 7 atributos
  const attrCheck = validateAttributes(data);
  if (!attrCheck.valid) {
    errors.push(...attrCheck.errors);
  }

  // Sanitiza e valida HP
  const hp = Number(data.hp ?? 70);
  const hpMax = Number(data.hpMax ?? 70);
  if (isNaN(hp) || hp < 0) errors.push("HP atual deve ser um número não-negativo.");
  if (isNaN(hpMax) || hpMax <= 0) errors.push("HP máximo deve ser um número maior que zero.");

  // Garante integridade de perícias
  const skills = Array.isArray(data.skills) ? data.skills : [];
  const inventory = Array.isArray(data.inventory) ? data.inventory : [];
  const contracts = Array.isArray(data.contracts) ? data.contracts : [];

  const sanitized = {
    ...data,
    _schemaVersion: 2,
    hp: Math.max(0, isNaN(hp) ? 70 : hp),
    hpMax: Math.max(1, isNaN(hpMax) ? 70 : hpMax),
    skills,
    inventory,
    contracts,
    dadosExtras: {
      inventoryCapacity: Number(data.dadosExtras?.inventoryCapacity || 20),
      insanityMax: Number(data.dadosExtras?.insanityMax || 0),
      insanityCurrent: Number(data.dadosExtras?.insanityCurrent || 0),
      bpMax: Number(data.dadosExtras?.bpMax || 0),
      bpCurrent: Number(data.dadosExtras?.bpCurrent || 0),
      peMax: Number(data.dadosExtras?.peMax || 0),
      peCurrent: Number(data.dadosExtras?.peCurrent || 0),
      hitDie: data.dadosExtras?.hitDie || "1d10",
      armorClass: Number(data.dadosExtras?.armorClass || 0),
      initiative: Number(data.dadosExtras?.initiative || 0),
      ...(data.dadosExtras || {}),
    },
  };

  return {
    valid: errors.length === 0,
    errors,
    sanitized,
  };
}

/**
 * Lista canônica de condições táticas de combate do sistema.
 */
export const CONDITIONS_LIST = [
  { id: "atordoado", name: "Atordoado", color: "amber", description: "Incapaz de agir ou se mover; falha em testes de FOR e DES." },
  { id: "envenenado", name: "Envenenado", color: "emerald", description: "Desvantagem em jogadas de ataque e testes de atributo." },
  { id: "caido", name: "Caído", color: "zinc", description: "Ataques corpo a corpo contra o alvo têm vantagem; movimentos custam o dobro." },
  { id: "cego", name: "Cego", color: "slate", description: "Ataques contra o alvo têm vantagem; ataques do alvo têm desvantagem." },
  { id: "amaldicoado", name: "Amaldiçoado", color: "violet", description: "Dano necrótico ou penalidade mágica em rolagens." },
  { id: "incapacitado", name: "Incapacitado", color: "rose", description: "Não pode realizar ações ou reações." },
  { id: "amedrontado", name: "Amedrontado", color: "orange", description: "Desvantagem em testes enquanto a fonte do medo estiver visível." },
  { id: "inconsciente", name: "Inconsciente", color: "red", description: "Incapacitado, larga o que estiver segurando e cai; falha em salvaguardas." },
  { id: "abencoado", name: "Abençoado", color: "cyan", description: "+1d4 em jogadas de ataque e testes de resistência." },
  { id: "invisivel", name: "Invisível", color: "indigo", description: "Vantagem em ataques; ataques contra o alvo têm desvantagem." },
];

/**
 * Função pura para aplicar alteração de PV (dano ou cura) respeitando os limites mínimo (0) e máximo (hpMax).
 * @param {number|string} currentHp
 * @param {number|string} maxHp
 * @param {number|string} delta Positivo para cura, negativo para dano
 * @returns {{ previousHp: number, currentHp: number, maxHp: number, isDead: boolean, isFull: boolean }}
 */
export function applyHealthChange(currentHp, maxHp, delta) {
  const cur = Number(currentHp) || 0;
  const max = Math.max(1, Number(maxHp) || 1);
  const change = Number(delta) || 0;
  const newHp = Math.max(0, Math.min(max, cur + change));

  return {
    previousHp: cur,
    currentHp: newHp,
    maxHp: max,
    isDead: newHp === 0,
    isFull: newHp === max,
  };
}

/**
 * Avança o turno da iniciativa em ordem cíclica e incrementa a rodada quando todos tiverem agido.
 * @param {Array} combatants
 * @param {number} currentTurnIndex
 * @param {number} currentRound
 * @returns {{ turnIndex: number, round: number, activeCombatant: Object|null }}
 */
export function advanceTurn(combatants = [], currentTurnIndex = 0, currentRound = 1) {
  if (!Array.isArray(combatants) || combatants.length === 0) {
    return { turnIndex: 0, round: 1, activeCombatant: null };
  }

  const nextIndex = (currentTurnIndex + 1) % combatants.length;
  const nextRound = nextIndex === 0 ? currentRound + 1 : currentRound;

  return {
    turnIndex: nextIndex,
    round: nextRound,
    activeCombatant: combatants[nextIndex] || null,
  };
}

/**
 * Validação defensiva de números inteiros/decimais com limites mínimo e máximo.
 * @param {any} value
 * @param {number} min
 * @param {number} max
 * @param {number} fallback
 * @returns {number}
 */
export function validateNumericBounds(value, min = 0, max = Infinity, fallback = 0) {
  const parsed = Number(value);
  if (isNaN(parsed)) return fallback;
  return Math.max(min, Math.min(max, parsed));
}

