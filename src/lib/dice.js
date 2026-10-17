/**
 * Motor de Rolagem de Dados Virtuais (com Vantagens, Desvantagens e Críticos)
 * Mantido por: @dice-mechanic
 */

/**
 * Executa uma rolagem de dados virtuais determinística e estruturada.
 *
 * @param {Object} options
 * @param {number} [options.sides=20] Número de lados do dado (4, 6, 8, 10, 12, 20, 100).
 * @param {number} [options.count=1] Quantidade de dados a rolar no modo normal.
 * @param {'normal'|'advantage'|'disadvantage'} [options.mode='normal'] Modo da rolagem.
 * @param {number} [options.modifier=0] Modificador somado ao total.
 * @param {string} [options.label=''] Nome do teste (ex: "Iniciativa", "Atletismo").
 * @param {() => number} [options.random=Math.random] Fonte de aleatoriedade injetável.
 * @returns {Object} Resultado detalhado da rolagem.
 */
export function rollDice({
  sides = 20,
  count = 1,
  mode = "normal",
  modifier = 0,
  label = "",
  random = Math.random,
} = {}) {
  const validSides = Number.isFinite(Number(sides)) && Number(sides) >= 1
    ? Math.floor(Number(sides))
    : 20;
  const randomSource = typeof random === "function" ? random : Math.random;
  const rollOne = () => {
    const sample = Number(randomSource());
    // A fonte pode retornar 1 por arredondamento; manter o domínio sempre [1, sides].
    const normalized = Number.isFinite(sample) ? Math.min(Math.max(sample, 0), 0.9999999999999999) : 0;
    return Math.floor(normalized * validSides) + 1;
  };
  const numModifier = Number(modifier) || 0;
  const modSign = numModifier >= 0 ? `+ ${numModifier}` : `- ${Math.abs(numModifier)}`;
  const modString = numModifier !== 0 ? ` ${modSign}` : "";

  // Modo Vantagem ou Desvantagem (padrão d20 de 2 dados)
  if (mode === "advantage" || mode === "disadvantage") {
    const d1 = rollOne();
    const d2 = rollOne();
    const isAdv = mode === "advantage";

    const kept = isAdv ? Math.max(d1, d2) : Math.min(d1, d2);
    const discarded = isAdv ? Math.min(d1, d2) : Math.max(d1, d2);
    const formula = isAdv
      ? `2d${validSides}kh1${modString}`
      : `2d${validSides}kl1${modString}`;

    return {
      id: createRollId(),
      label,
      formula,
      mode,
      sides: validSides,
      rolls: [d1, d2],
      kept,
      discarded,
      modifier: numModifier,
      total: kept + numModifier,
      isCriticalSuccess: validSides === 20 && kept === 20,
      isCriticalFailure: validSides === 20 && kept === 1,
      timestamp: new Date().toISOString(),
    };
  }

  // Modo Normal
  const rolls = [];
  let sum = 0;
  const requestedCount = Number(count);
  const actualCount = Math.max(
    1,
    Number.isFinite(requestedCount) ? Math.floor(requestedCount) : 1,
  );

  for (let i = 0; i < actualCount; i++) {
    const val = rollOne();
    rolls.push(val);
    sum += val;
  }

  const formula = `${actualCount}d${validSides}${modString}`;
  const total = sum + numModifier;

  return {
    id: createRollId(),
    label,
    formula,
    mode: "normal",
    sides: validSides,
    rolls,
    kept: rolls.length === 1 ? rolls[0] : sum,
    discarded: null,
    modifier: numModifier,
    total,
    isCriticalSuccess: validSides === 20 && actualCount === 1 && rolls[0] === 20,
    isCriticalFailure: validSides === 20 && actualCount === 1 && rolls[0] === 1,
    timestamp: new Date().toISOString(),
  };
}

let rollSequence = 0;

function createRollId() {
  rollSequence += 1;
  return `${Date.now()}_${rollSequence}`;
}

/**
 * Atalho para rolar um teste d20 de Perícia ou Atributo.
 * @param {string} label Nome da perícia ou atributo (ex: "Furtividade", "FOR")
 * @param {number} modifier Bônus/modificador total do teste
 * @param {'normal'|'advantage'|'disadvantage'} mode
 * @returns {Object}
 */
export function rollCheck(label, modifier = 0, mode = "normal") {
  return rollDice({
    sides: 20,
    count: 1,
    mode,
    modifier,
    label,
  });
}

/**
 * Interpreta uma fórmula simples como "1d20+5", "2d6+3", "1d100".
 * @param {string} formulaStr
 * @returns {Object|null}
 */
export function parseAndRollFormula(formulaStr, label = "Rolagem") {
  if (!formulaStr || typeof formulaStr !== "string") return null;

  const sanitized = formulaStr.replace(/\s+/g, "").toLowerCase();
  const match = sanitized.match(/^(\d+)?d(\d+)([+-]\d+)?$/);

  if (!match) return null;

  const count = match[1] ? parseInt(match[1], 10) : 1;
  const sides = parseInt(match[2], 10);
  const modifier = match[3] ? parseInt(match[3], 10) : 0;

  return rollDice({
    sides,
    count,
    mode: "normal",
    modifier,
    label,
  });
}
