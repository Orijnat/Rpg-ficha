/**
 * Catálogo Oficial de Raças do Grimorium RPG (d20 customizado, fantasia sombria).
 * Cada raça concede bônus de atributos aplicados na CRIAÇÃO do herói.
 * O dado de vida vem da CLASSE (ver lib/classes.js), não da raça.
 */

export const DEFAULT_RACES = [
  { id: "humano", name: "Humano", bonuses: { FOR: 1, DES: 1, CON: 1, SAB: 1, ESP: 1, CAR: 1, INT: 1 }, trait: "Versátil — +1 em todos os atributos." },
  { id: "elfo", name: "Elfo", bonuses: { DES: 2, SAB: 1 }, trait: "Visão no Escuro · Sentidos Aguçados — +2 DES, +1 SAB." },
  { id: "anao", name: "Anão", bonuses: { CON: 2, FOR: 1 }, trait: "Resistência Anã — +2 CON, +1 FOR." },
  { id: "halfling", name: "Halfling", bonuses: { DES: 2, CAR: 1 }, trait: "Sortudo — +2 DES, +1 CAR." },
  { id: "draconato", name: "Draconato", bonuses: { FOR: 2, CAR: 1 }, trait: "Sopro Dracônico — +2 FOR, +1 CAR." },
  { id: "gnomo", name: "Gnomo", bonuses: { INT: 2, CAR: 1 }, trait: "Astúcia Gnômica — +2 INT, +1 CAR." },
  { id: "tiefling", name: "Tiefling", bonuses: { CAR: 2, INT: 1 }, trait: "Legado Abissal — +2 CAR, +1 INT." },
  { id: "orc", name: "Orc", bonuses: { FOR: 2, CON: 1 }, trait: "Vigor Selvagem — +2 FOR, +1 CON." },
];

export const RACE_IDS = DEFAULT_RACES.map((race) => race.id);

export function getRaceById(id) {
  if (!id) return null;
  const needle = String(id).trim().toLowerCase();
  return DEFAULT_RACES.find((race) => race.id === needle || race.name.toLowerCase() === needle) ?? null;
}

/** Bônus de atributos da raça (objeto parcial { FOR: n, ... }). */
export function getRaceBonuses(raceId) {
  return getRaceById(raceId)?.bonuses ?? {};
}

/** Aplica os bônus raciais sobre os atributos base. */
export function applyRaceBonuses(base = {}, raceId) {
  const bonuses = getRaceBonuses(raceId);
  const out = { ...base };
  for (const attr of ["FOR", "DES", "CON", "SAB", "ESP", "CAR", "INT"]) {
    out[attr] = Math.max(1, Math.floor(Number(base[attr]) || 10)) + (Number(bonuses[attr]) || 0);
  }
  return out;
}

// ── Point buy (27 pontos, base 8–15) ─────────────────────────────
export const POINT_BUY_POOL = 27;
export const POINT_BUY_MIN = 8;
export const POINT_BUY_MAX = 15;

/** Custo de cada valor base no point buy (estilo D&D). */
export const POINT_BUY_COST = Object.freeze({
  8: 0, 9: 1, 10: 2, 11: 3, 12: 4, 13: 5, 14: 7, 15: 9,
});

export function pointBuyCost(value) {
  const clamped = Math.min(POINT_BUY_MAX, Math.max(POINT_BUY_MIN, Math.floor(Number(value) || POINT_BUY_MIN)));
  return POINT_BUY_COST[clamped];
}

export function pointBuySpent(base = {}) {
  return ["FOR", "DES", "CON", "SAB", "ESP", "CAR", "INT"].reduce(
    (total, attr) => total + pointBuyCost(base[attr]),
    0
  );
}
