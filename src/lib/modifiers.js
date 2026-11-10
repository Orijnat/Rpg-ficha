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
 * Garante que a lista de perícias contenha todas as 19 perícias canônicas do sistema,
 * preservando o estado treinado/bônus das perícias existentes e eventuais perícias customizadas.
 * @param {Array} skills Lista atual de perícias do personagem
 * @returns {Array} Lista completa com todas as 19 perícias canônicas garantidas
 */
export function ensureCanonicalSkills(skills = []) {
  const currentSkills = Array.isArray(skills) ? skills : [];
  const skillMap = new Map();

  for (const s of currentSkills) {
    if (s && typeof s.name === "string") {
      skillMap.set(s.name.toLowerCase().trim(), s);
    }
  }

  const result = DEFAULT_SKILLS.map((canon) => {
    const existing = skillMap.get(canon.name.toLowerCase().trim());
    if (existing) {
      skillMap.delete(canon.name.toLowerCase().trim());
      return {
        name: canon.name,
        attr: existing.attr || canon.attr,
        trained: Boolean(existing.trained),
        bonus: typeof existing.bonus === "number" ? existing.bonus : null,
      };
    }
    return {
      name: canon.name,
      attr: canon.attr,
      trained: false,
      bonus: null,
    };
  });

  // Preserva perícias customizadas extras que não estejam na lista canônica
  for (const [_, extraSkill] of skillMap) {
    result.push({
      name: extraSkill.name,
      attr: extraSkill.attr || "FOR",
      trained: Boolean(extraSkill.trained),
      bonus: typeof extraSkill.bonus === "number" ? extraSkill.bonus : null,
    });
  }

  return result;
}

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
    const weight = Number(item?.weight ?? item?.peso ?? 1);
    return acc + (isNaN(qty) || isNaN(weight) ? 0 : Math.max(0, qty) * Math.max(0, weight));
  }, 0);

  const isOverloaded = carried > max;
  const percentage = Math.min(100, Math.round((carried / max) * 100));

  return {
    carried: Number(carried.toFixed(2)),
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
  if (!Number.isFinite(hp) || hp < 0) errors.push("HP atual deve ser um número não-negativo.");
  if (!Number.isFinite(hpMax) || hpMax <= 0) errors.push("HP máximo deve ser um número maior que zero.");
  if (Number.isFinite(hp) && Number.isFinite(hpMax) && hp > hpMax) {
    errors.push("HP atual não pode exceder o HP máximo.");
  }

  // Garante integridade de perícias
  const skills = Array.isArray(data.skills) ? data.skills : [];
  const inventory = Array.isArray(data.inventory) ? data.inventory : [];
  const contracts = Array.isArray(data.contracts) ? data.contracts : [];

  const extras = data.dadosExtras && typeof data.dadosExtras === "object" ? data.dadosExtras : {};
  const numericExtra = (key, fallback, min = 0, max = 999) => {
    const value = Number(extras[key] ?? fallback);
    if (!Number.isInteger(value) || value < min || value > max) {
      errors.push(`${key} deve ser um número inteiro entre ${min} e ${max}.`);
      return fallback;
    }
    return value;
  };

  const sanitized = {
    ...data,
    _schemaVersion: 2,
    hp: Math.max(0, isNaN(hp) ? 70 : hp),
    hpMax: Math.max(1, isNaN(hpMax) ? 70 : hpMax),
    skills,
    inventory,
    contracts,
    dadosExtras: {
      inventoryCapacity: numericExtra("inventoryCapacity", 20, 1, 999),
      insanityMax: numericExtra("insanityMax", 0),
      insanityCurrent: numericExtra("insanityCurrent", 0),
      bpMax: numericExtra("bpMax", 0),
      bpCurrent: numericExtra("bpCurrent", 0),
      peMax: numericExtra("peMax", 0),
      peCurrent: numericExtra("peCurrent", 0),
      hitDie: typeof extras.hitDie === "string" && /^\d+d\d+(?:[+-]\d+)?$/i.test(extras.hitDie)
        ? extras.hitDie
        : "1d10",
      armorClass: numericExtra("armorClass", 10, 0, 99),
      initiative: numericExtra("initiative", 0, -30, 30),
      customAbilities: Array.isArray(extras.customAbilities) ? extras.customAbilities : [],
      training: Array.isArray(extras.training) ? extras.training : [],
    },
  };

  if (sanitized.dadosExtras.peCurrent > sanitized.dadosExtras.peMax) {
    errors.push("PE atual não pode exceder o PE máximo.");
  }
  if (sanitized.dadosExtras.insanityCurrent > sanitized.dadosExtras.insanityMax) {
    errors.push("Insanidade atual não pode exceder o máximo.");
  }
  if (sanitized.dadosExtras.bpCurrent > sanitized.dadosExtras.bpMax) {
    errors.push("BP atual não pode exceder o BP máximo.");
  }

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


// ═══════════════════════════════════════════════════════════════════════════════
// Motor de Regras Expandido — Mecânicas Derivadas, Descanso, Moedas, Condições
// Adicionado por: @rpg-rules-engine + skill rpg-sheet-calculator
// ═══════════════════════════════════════════════════════════════════════════════

// ─────────────────────────────────────────────
// 6. Progressão de Nível — Tabela de XP
// ─────────────────────────────────────────────

/**
 * Tabela de XP necessário acumulado para cada nível (índice = nível).
 * Nível 1 = 0 XP, Nível 20 = 355.000 XP.
 * @type {readonly number[]}
 */
export const XP_TABLE = Object.freeze([
  0, 300, 900, 2700, 6500, 14000, 23000, 34000, 48000, 64000,
  85000, 100000, 120000, 140000, 165000, 195000, 225000, 265000, 305000, 355000,
]);

// ─────────────────────────────────────────────
// 9. Conversão de Moedas — Taxas
// ─────────────────────────────────────────────

/**
 * Taxas de câmbio do sistema monetário em unidades de cobre.
 * latina (platina) = 1000 cobres, ouro = 100, prata = 10, cobre = 1.
 * @type {Readonly<Record<string, number>>}
 */
export const CURRENCY_RATES = Object.freeze({
  latina: 1000,
  ouro: 100,
  prata: 10,
  cobre: 1,
});

// ─────────────────────────────────────────────
// 2. Classe de Armadura (CA)
// ─────────────────────────────────────────────

/**
 * Calcula a Classe de Armadura do personagem.
 * CA = 10 + Mod(DES) + bônus extra de armadura (dadosExtras.armorClass − 10, se > 10, ou 0).
 * O campo `dadosExtras.armorClass` é tratado como bônus extra adicional à base.
 * @param {Object} characterData Dados do personagem
 * @returns {{ base: number, desMod: number, extra: number, total: number, formula: string }}
 */
export function calculateArmorClass(characterData = {}) {
  const base = 10;
  const desMod = calculateModifier(characterData?.DES ?? 10);
  const extra = Number(characterData?.dadosExtras?.armorClass ?? 0) || 0;
  const total = base + desMod + extra;

  return {
    base,
    desMod,
    extra,
    total,
    formula: `10 + Mod(DES)[${desMod}] + Extra[${extra}] = ${total}`,
  };
}

// ─────────────────────────────────────────────
// 3. Pontos de Esforço (PE)
// ─────────────────────────────────────────────

/**
 * Calcula os Pontos de Esforço do personagem.
 * PE Max = Nível + Mod(ESP). Mínimo 0.
 * @param {Object} characterData Dados do personagem (precisa de nivel/level e ESP)
 * @returns {{ current: number, max: number, formula: string }}
 */
export function calculatePE(characterData = {}) {
  const level = Number(characterData?.nivel ?? characterData?.level ?? 1) || 1;
  const espMod = calculateModifier(characterData?.ESP ?? 10);
  const max = Math.max(0, level + espMod);
  const current = Math.max(0, Math.min(
    Number(characterData?.dadosExtras?.peCurrent ?? max),
    max
  ));

  return {
    current,
    max,
    formula: `Nível[${level}] + Mod(ESP)[${espMod}] = ${max}`,
  };
}

// ─────────────────────────────────────────────
// 4. Bônus de Proficiência / Bravura (BP)
// ─────────────────────────────────────────────

/**
 * Calcula os Pontos de Bravura / Bônus de Proficiência.
 * BP Max = Nível + Mod(CAR). Mínimo 0.
 * @param {Object} characterData Dados do personagem (precisa de nivel/level e CAR)
 * @returns {{ current: number, max: number, formula: string }}
 */
export function calculateBP(characterData = {}) {
  const level = Number(characterData?.nivel ?? characterData?.level ?? 1) || 1;
  const carMod = calculateModifier(characterData?.CAR ?? 10);
  const max = Math.max(0, level + carMod);
  const current = Math.max(0, Math.min(
    Number(characterData?.dadosExtras?.bpCurrent ?? max),
    max
  ));

  return {
    current,
    max,
    formula: `Nível[${level}] + Mod(CAR)[${carMod}] = ${max}`,
  };
}

// ─────────────────────────────────────────────
// 5. Insanidade
// ─────────────────────────────────────────────

/**
 * Calcula o limiar de Insanidade do personagem.
 * Insanidade Max = 10 + Mod(SAB). Mínimo 0.
 * @param {Object} characterData Dados do personagem (precisa de SAB)
 * @returns {{ current: number, max: number, formula: string }}
 */
export function calculateInsanity(characterData = {}) {
  const sabMod = calculateModifier(characterData?.SAB ?? 10);
  const max = Math.max(0, 10 + sabMod);
  const current = Math.max(0, Math.min(
    Number(characterData?.dadosExtras?.insanityCurrent ?? 0),
    max
  ));

  return {
    current,
    max,
    formula: `10 + Mod(SAB)[${sabMod}] = ${max}`,
  };
}

// ─────────────────────────────────────────────
// 1. Recursos Derivados (agregador)
// ─────────────────────────────────────────────

/**
 * Calcula todos os recursos derivados de um personagem em uma única chamada.
 * Agrega HP, PE, BP, Insanidade, CA, Iniciativa e Dado de Vida.
 * @param {Object} characterData Dados completos do personagem
 * @returns {{
 *   hp: { current: number, max: number },
 *   pe: { current: number, max: number, formula: string },
 *   bp: { current: number, max: number, formula: string },
 *   insanity: { current: number, max: number, formula: string },
 *   ca: { base: number, desMod: number, extra: number, total: number, formula: string },
 *   initiative: { desMod: number, extra: number, total: number },
 *   hitDie: string
 * }}
 */
export function calculateDerivedResources(characterData = {}) {
  const hp = {
    current: Math.max(0, Number(characterData?.hp ?? 0)),
    max: Math.max(1, Number(characterData?.hpMax ?? 1)),
  };

  const pe = calculatePE(characterData);
  const bp = calculateBP(characterData);
  const insanity = calculateInsanity(characterData);
  const ca = calculateArmorClass(characterData);

  const initData = calculateInitiative(characterData);
  const initiative = {
    desMod: initData.desMod,
    extra: initData.extra,
    total: initData.total,
  };

  const hitDie = (typeof characterData?.dadosExtras?.hitDie === "string" &&
    /^\d+d\d+(?:[+-]\d+)?$/i.test(characterData.dadosExtras.hitDie))
    ? characterData.dadosExtras.hitDie
    : "1d10";

  return { hp, pe, bp, insanity, ca, initiative, hitDie };
}

// ─────────────────────────────────────────────
// 6. Progressão de Nível — Funções
// ─────────────────────────────────────────────

/**
 * Determina o nível atual com base no XP acumulado consultando a XP_TABLE.
 * @param {number|string} xp Experiência acumulada
 * @returns {{
 *   level: number,
 *   currentXP: number,
 *   nextLevelXP: number|null,
 *   xpForCurrent: number,
 *   progress: number
 * }}
 */
export function calculateLevelFromXP(xp = 0) {
  const totalXP = Math.max(0, Number(xp) || 0);

  let level = 1;
  for (let i = XP_TABLE.length - 1; i >= 0; i--) {
    if (totalXP >= XP_TABLE[i]) {
      level = i + 1;
      break;
    }
  }

  // Clamp ao nível 20
  level = Math.min(level, 20);

  const xpForCurrent = XP_TABLE[level - 1] ?? 0;
  const nextLevelXP = level < 20 ? XP_TABLE[level] : null;
  const progress = nextLevelXP !== null
    ? Math.min(100, Math.round(((totalXP - xpForCurrent) / (nextLevelXP - xpForCurrent)) * 100))
    : 100;

  return {
    level,
    currentXP: totalXP,
    nextLevelXP,
    xpForCurrent,
    progress,
  };
}

/**
 * Retorna o XP total necessário para atingir um dado nível.
 * @param {number} level Nível desejado (1-20)
 * @returns {number} XP acumulado necessário
 */
export function calculateXPForLevel(level = 1) {
  const lvl = Math.max(1, Math.min(20, Math.floor(Number(level) || 1)));
  return XP_TABLE[lvl - 1] ?? 0;
}

// ─────────────────────────────────────────────
// 7. Descanso (Curto e Longo)
// ─────────────────────────────────────────────

/**
 * Simula a rolagem de um dado de vida (ex: "1d10", "2d8+3").
 * Usa Math.random para simulação — função pura (determinística dado o RNG).
 * @param {string} hitDieStr Dado de vida no formato XdY[+/-Z]
 * @returns {number} Resultado da rolagem
 * @private
 */
function rollHitDie(hitDieStr = "1d10") {
  const match = String(hitDieStr).match(/^(\d+)d(\d+)([+-]\d+)?$/i);
  if (!match) return 0;

  const count = Math.max(1, Number(match[1]));
  const sides = Math.max(1, Number(match[2]));
  const bonus = Number(match[3] ?? 0) || 0;

  let total = bonus;
  for (let i = 0; i < count; i++) {
    total += Math.floor(Math.random() * sides) + 1;
  }
  return total;
}

/**
 * Aplica descanso curto ao personagem.
 * - Rola o dado de vida (hitDie) + Mod(CON) para recuperar HP.
 * - Restaura 25% do PE máximo (arredondado para baixo).
 * @param {Object} characterData Dados completos do personagem
 * @returns {{ hpHealed: number, peRestored: number, description: string }}
 */
export function applyShortRest(characterData = {}) {
  const hitDie = (typeof characterData?.dadosExtras?.hitDie === "string" &&
    /^\d+d\d+(?:[+-]\d+)?$/i.test(characterData.dadosExtras.hitDie))
    ? characterData.dadosExtras.hitDie
    : "1d10";

  const conMod = calculateModifier(characterData?.CON ?? 10);
  const dieRoll = rollHitDie(hitDie);
  const rawHeal = dieRoll + conMod;
  const hpHealed = Math.max(0, rawHeal);

  const pe = calculatePE(characterData);
  const peRestored = Math.max(0, Math.floor(pe.max * 0.25));

  return {
    hpHealed,
    peRestored,
    description:
      `Descanso Curto: Dado de Vida (${hitDie}) rolou ${dieRoll} + Mod(CON)[${conMod}] = ${hpHealed} HP curados. ` +
      `PE restaurados: ${peRestored} (25% de ${pe.max}).`,
  };
}

/**
 * Aplica descanso longo ao personagem.
 * - Recupera 100% HP (current = max).
 * - Recupera 100% PE (current = max).
 * - Reduz insanidade atual em 1 (mínimo 0).
 * @param {Object} characterData Dados completos do personagem
 * @returns {{ hpRestored: number, peRestored: number, insanityReduced: number, description: string }}
 */
export function applyLongRest(characterData = {}) {
  const hpCurrent = Math.max(0, Number(characterData?.hp ?? 0));
  const hpMax = Math.max(1, Number(characterData?.hpMax ?? 1));
  const hpRestored = hpMax - hpCurrent;

  const pe = calculatePE(characterData);
  const peCurrent = Number(characterData?.dadosExtras?.peCurrent ?? 0) || 0;
  const peRestored = Math.max(0, pe.max - peCurrent);

  const insanityCurrent = Number(characterData?.dadosExtras?.insanityCurrent ?? 0) || 0;
  const insanityReduced = insanityCurrent > 0 ? 1 : 0;

  return {
    hpRestored: Math.max(0, hpRestored),
    peRestored,
    insanityReduced,
    description:
      `Descanso Longo: HP restaurado para ${hpMax}/${hpMax} (+${Math.max(0, hpRestored)}). ` +
      `PE restaurado para ${pe.max}/${pe.max} (+${peRestored}). ` +
      `Insanidade reduzida em ${insanityReduced} (${Math.max(0, insanityCurrent - insanityReduced)}/${calculateInsanity(characterData).max}).`,
  };
}

// ─────────────────────────────────────────────
// 8. Munição e Consumo de Inventário
// ─────────────────────────────────────────────

/**
 * Consome munição ou item consumível do inventário do personagem.
 * Reduz a quantidade pelo valor informado. Se qty chegar a 0, marca como esgotado.
 * Retorna um NOVO array (não muta o original).
 * @param {Array} inventory Array de itens do inventário
 * @param {string|number} itemId Identificador do item (id ou index)
 * @param {number} [amount=1] Quantidade a consumir
 * @returns {{ success: boolean, remaining: number, item: Object|null, inventory: Array, error: string|null }}
 */
export function consumeAmmunition(inventory = [], itemId, amount = 1) {
  if (!Array.isArray(inventory)) {
    return { success: false, remaining: 0, item: null, inventory: [], error: "Inventário inválido." };
  }

  const consumeAmount = Math.max(0, Math.floor(Number(amount) || 1));
  if (consumeAmount <= 0) {
    return { success: false, remaining: 0, item: null, inventory: [...inventory], error: "Quantidade a consumir deve ser maior que zero." };
  }

  const index = inventory.findIndex((item, idx) => {
    if (item?.id !== undefined && item.id === itemId) return true;
    if (typeof itemId === "number" && idx === itemId) return true;
    if (typeof itemId === "string" && (item?.name === itemId || item?.nome === itemId)) return true;
    return false;
  });

  if (index === -1) {
    return { success: false, remaining: 0, item: null, inventory: [...inventory], error: `Item "${itemId}" não encontrado no inventário.` };
  }

  const newInventory = inventory.map((item, idx) => {
    if (idx !== index) return { ...item };
    const currentQty = Number(item.qty ?? item.quantidade ?? 1) || 0;
    const newQty = Math.max(0, currentQty - consumeAmount);
    return {
      ...item,
      qty: newQty,
      quantidade: newQty,
      esgotado: newQty === 0,
      depleted: newQty === 0,
    };
  });

  const updatedItem = newInventory[index];

  return {
    success: true,
    remaining: updatedItem.qty,
    item: updatedItem,
    inventory: newInventory,
    error: null,
  };
}

// ─────────────────────────────────────────────
// 9. Conversão de Moedas — Funções
// ─────────────────────────────────────────────

/**
 * Converte uma quantia de uma moeda para outra usando as taxas do sistema.
 * @param {number} amount Quantia a converter
 * @param {string} from Moeda de origem ("latina" | "ouro" | "prata" | "cobre")
 * @param {string} to Moeda de destino ("latina" | "ouro" | "prata" | "cobre")
 * @returns {{ result: number, formula: string }}
 */
export function convertCurrency(amount = 0, from = "ouro", to = "cobre") {
  const safeAmount = Number(amount) || 0;
  const fromRate = CURRENCY_RATES[from];
  const toRate = CURRENCY_RATES[to];

  if (fromRate === undefined || toRate === undefined) {
    return {
      result: 0,
      formula: `Moeda inválida: "${fromRate === undefined ? from : to}". Moedas válidas: ${Object.keys(CURRENCY_RATES).join(", ")}.`,
    };
  }

  const copperValue = safeAmount * fromRate;
  const result = copperValue / toRate;

  return {
    result,
    formula: `${safeAmount} ${from} × ${fromRate} = ${copperValue} cobre ÷ ${toRate} = ${result} ${to}`,
  };
}

/**
 * Calcula a riqueza total do personagem convertida para cobre.
 * @param {Object} currencies Objeto com as moedas { latina, ouro, prata, cobre }
 * @returns {number} Valor total em cobres
 */
export function totalWealthInCopper(currencies = {}) {
  if (!currencies || typeof currencies !== "object") return 0;

  let total = 0;
  for (const [coin, rate] of Object.entries(CURRENCY_RATES)) {
    const qty = Number(currencies[coin] ?? 0) || 0;
    total += Math.max(0, qty) * rate;
  }
  return total;
}

// ─────────────────────────────────────────────
// 10. Gerenciamento de Condições Táticas
// ─────────────────────────────────────────────

/**
 * Adiciona uma condição à lista de condições ativas do personagem (sem duplicatas).
 * Retorna um NOVO array (imutável).
 * @param {Array<string>} activeConditions Lista atual de IDs de condições ativas
 * @param {string} conditionId ID da condição a aplicar (ex: "atordoado")
 * @returns {Array<string>} Nova lista de condições ativas
 */
export function applyCondition(activeConditions = [], conditionId = "") {
  const conditions = Array.isArray(activeConditions) ? [...activeConditions] : [];
  const id = String(conditionId).trim().toLowerCase();

  if (!id) return conditions;

  // Verifica se é uma condição válida
  const isValid = CONDITIONS_LIST.some((c) => c.id === id);
  if (!isValid) return conditions;

  // Não duplicar
  if (conditions.includes(id)) return conditions;

  return [...conditions, id];
}

/**
 * Remove uma condição da lista de condições ativas do personagem.
 * Retorna um NOVO array (imutável).
 * @param {Array<string>} activeConditions Lista atual de IDs de condições ativas
 * @param {string} conditionId ID da condição a remover
 * @returns {Array<string>} Nova lista de condições ativas
 */
export function removeCondition(activeConditions = [], conditionId = "") {
  const conditions = Array.isArray(activeConditions) ? activeConditions : [];
  const id = String(conditionId).trim().toLowerCase();

  if (!id) return [...conditions];

  return conditions.filter((c) => c !== id);
}

/**
 * Verifica se uma condição está ativa no personagem.
 * @param {Array<string>} activeConditions Lista de IDs de condições ativas
 * @param {string} conditionId ID da condição a verificar
 * @returns {boolean} Verdadeiro se a condição estiver ativa
 */
export function hasCondition(activeConditions = [], conditionId = "") {
  const conditions = Array.isArray(activeConditions) ? activeConditions : [];
  const id = String(conditionId).trim().toLowerCase();

  if (!id) return false;
  return conditions.includes(id);
}
