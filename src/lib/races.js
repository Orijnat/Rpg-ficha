/**
 * Catálogo Oficial de Raças do Grimorium RPG (d20 customizado, fantasia sombria).
 * A raça define os STATUS BASE e o DADO DE VIDA do herói no momento da criação.
 * A subida de nível rola o dado de vida da raça (ver lib/leveling.js).
 */

const ATTRS = ["FOR", "DES", "CON", "SAB", "ESP", "CAR", "INT"];

export const DEFAULT_RACES = [
  { id: "humano", name: "Humano", hitDie: "1d8", base: { FOR: 12, DES: 12, CON: 12, SAB: 12, ESP: 12, CAR: 12, INT: 10 }, trait: "Versátil — linhagem equilibrada." },
  { id: "elfo", name: "Elfo", hitDie: "1d8", base: { FOR: 10, DES: 15, CON: 10, SAB: 12, ESP: 13, CAR: 10, INT: 12 }, trait: "Visão no Escuro · Sentidos Aguçados." },
  { id: "anao", name: "Anão", hitDie: "1d10", base: { FOR: 14, DES: 9, CON: 15, SAB: 12, ESP: 11, CAR: 10, INT: 11 }, trait: "Resistência Anã." },
  { id: "halfling", name: "Halfling", hitDie: "1d6", base: { FOR: 10, DES: 14, CON: 11, SAB: 13, ESP: 12, CAR: 13, INT: 9 }, trait: "Sortudo." },
  { id: "draconato", name: "Draconato", hitDie: "1d10", base: { FOR: 14, DES: 10, CON: 13, SAB: 10, ESP: 10, CAR: 15, INT: 10 }, trait: "Sopro Dracônico." },
  { id: "gnomo", name: "Gnomo", hitDie: "1d6", base: { FOR: 8, DES: 11, CON: 13, SAB: 10, ESP: 11, CAR: 13, INT: 16 }, trait: "Astúcia Gnômica." },
  { id: "tiefling", name: "Tiefling", hitDie: "1d8", base: { FOR: 10, DES: 10, CON: 11, SAB: 9, ESP: 10, CAR: 17, INT: 15 }, trait: "Legado Abissal." },
  { id: "orc", name: "Orc", hitDie: "1d12", base: { FOR: 15, DES: 12, CON: 13, SAB: 10, ESP: 11, CAR: 10, INT: 10 }, trait: "Vigor Selvagem." },
];

export const RACE_IDS = DEFAULT_RACES.map((race) => race.id);

export function getRaceById(id) {
  if (!id) return null;
  const needle = String(id).trim().toLowerCase();
  return DEFAULT_RACES.find((race) => race.id === needle || race.name.toLowerCase() === needle) ?? null;
}

/** Atributos base da raça (cópia; objeto imutável de entrada). */
export function getRaceBaseAttributes(raceId) {
  const race = getRaceById(raceId);
  return race ? { ...race.base } : Object.fromEntries(ATTRS.map((attr) => [attr, 10]));
}

/** Dado de vida definido pela raça (fallback 1d8). */
export function getRaceHitDie(raceId, fallback = "1d8") {
  return getRaceById(raceId)?.hitDie ?? fallback;
}
