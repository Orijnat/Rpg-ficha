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
