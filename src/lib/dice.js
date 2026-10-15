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
 * @returns {Object} Resultado detalhado da rolagem.
 */
export function rollDice({
  sides = 20,
  count = 1,
  mode = "normal",
  modifier = 0,
  label = "",
} = {}) {
  const rollOne = () => Math.floor(Math.random() * sides) + 1;
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
      ? `2d${sides}kh1${modString}`
      : `2d${sides}kl1${modString}`;

    return {
      id: `${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
      label,
      formula,
      mode,
      sides,
      rolls: [d1, d2],
      kept,
      discarded,
      modifier: numModifier,
      total: kept + numModifier,
      isCriticalSuccess: sides === 20 && kept === 20,
      isCriticalFailure: sides === 20 && kept === 1,
      timestamp: new Date().toISOString(),
    };
  }

  // Modo Normal
  const rolls = [];
  let sum = 0;
  const actualCount = Math.max(1, Number(count) || 1);

  for (let i = 0; i < actualCount; i++) {
    const val = rollOne();
    rolls.push(val);
    sum += val;
  }

  const formula = `${actualCount}d${sides}${modString}`;
  const total = sum + numModifier;

  return {
    id: `${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
    label,
    formula,
    mode: "normal",
    sides,
    rolls,
    kept: rolls.length === 1 ? rolls[0] : sum,
    discarded: null,
    modifier: numModifier,
    total,
    isCriticalSuccess: sides === 20 && actualCount === 1 && rolls[0] === 20,
    isCriticalFailure: sides === 20 && actualCount === 1 && rolls[0] === 1,
    timestamp: new Date().toISOString(),
  };
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
