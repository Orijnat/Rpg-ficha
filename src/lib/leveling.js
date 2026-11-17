/**
 * Utilitários puros de progressão (subida de nível) do Grimorium RPG.
 * O dado de vida vem da RAÇA (lib/races.js); a rolagem acontece no
 * momento de subir de nível, somando Mod(CON) — mínimo de 1 HP por nível.
 */

import { calculateLevelFromXP } from "./modifiers.js";

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

/** Valor máximo do Dado de Vida ("1d10" → 10). Usado na vida base inicial do herói. */
export function hitDieMax(hitDie, fallback = 8) {
  const { count, sides } = parseHitDie(hitDie, { count: 1, sides: fallback, modifier: 0 });
  return Math.max(1, count * sides);
}

/** HP ganho num nível: rolagem do dado de vida + Mod(CON), mínimo 1. */
export function hpGainFromRoll(rollTotal, conMod) {
  return Math.max(1, Math.floor(Number(rollTotal) || 0) + (Number(conMod) || 0));
}

/**
 * Gate de subida de nível: nível só sobe com XP suficiente (máx. 20).
 * @param {number|string} level nível atual da ficha
 * @param {number|string} xp XP acumulado
 */
export function levelUpGate(level, xp) {
  const current = Math.max(1, Math.min(20, Number(level) || 1));
  if (current >= 20) {
    return { ok: false, message: "Nível máximo (20) alcançado." };
  }
  const xpInfo = calculateLevelFromXP(xp ?? 0);
  if (current >= xpInfo.level) {
    const missing = Math.max(0, (xpInfo.nextLevelXP ?? 0) - (Number(xp) || 0));
    return {
      ok: false,
      message: `XP insuficiente para o nível ${current + 1}. Faltam ${missing.toLocaleString("pt-BR")} XP.`,
    };
  }
  return { ok: true, nextLevel: current + 1 };
}
