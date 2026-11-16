/**
 * Utilitários puros de progressão (subida de nível) do Grimorium RPG.
 * O dado de vida vem da CLASSE (lib/classes.js); a rolagem acontece no
 * momento de subir de nível, somando Mod(CON) — mínimo de 1 HP por nível.
 */

/** Lê "1d10", "d8", "1d12+2" e devolve { count, sides, modifier } seguro. */
export function parseHitDie(hitDie, fallback = { count: 1, sides: 8, modifier: 0 }) {
  if (typeof hitDie !== "string") return { ...fallback };
  const match = hitDie.trim().match(/^(\d{0,2})d(\d+)([+-]\d+)?$/i);
  if (!match) return { ...fallback };
  const count = match[1] ? Number(match[1]) : 1;
  const sides = Number(match[2]);
  const modifier = match[3] ? Number(match[3]) : 0;
  if (!Number.isInteger(sides) || sides < 2 || sides > 100) return { ...fallback };
  return { count: Math.min(Math.max(1, count), 100), sides, modifier };
}

/** HP ganho num nível: rolagem do dado de vida + Mod(CON), mínimo 1. */
export function hpGainFromRoll(rollTotal, conMod) {
  return Math.max(1, Math.floor(Number(rollTotal) || 0) + (Number(conMod) || 0));
}
