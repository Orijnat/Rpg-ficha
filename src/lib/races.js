/**
 * Catálogo de Raças do Grimorium RPG (d20 customizado, fantasia sombria).
 *
 * Modelo (clássico 5e): o jogador define os STATUS BASE livremente; a raça
 * apenas SOMA seu bônus na seleção (nunca sobrescreve). Troca de raça pelo
 * mestre: subtrai o bônus da raça antiga e soma o da nova.
 * A raça NÃO define o Dado de Vida — quem define é a classe (lib/classes.js).
 */

export const DEFAULT_RACES = [
  { id: "humano", slug: "humano", name: "Humano", bonus: { FOR: 1, DES: 1, CON: 1, SAB: 1, ESP: 1, CAR: 1, INT: 1 }, trait: "Versátil — +1 em todos os atributos." },
  { id: "elfo", slug: "elfo", name: "Elfo", bonus: { DES: 2, SAB: 1 }, trait: "Visão no Escuro · Sentidos Aguçados — +2 DES, +1 SAB." },
  { id: "anao", slug: "anao", name: "Anão", bonus: { CON: 2, FOR: 1 }, trait: "Resistência Anã — +2 CON, +1 FOR." },
  { id: "halfling", slug: "halfling", name: "Halfling", bonus: { DES: 2, CAR: 1 }, trait: "Sortudo — +2 DES, +1 CAR." },
  { id: "draconato", slug: "draconato", name: "Draconato", bonus: { FOR: 2, CAR: 1 }, trait: "Sopro Dracônico — +2 FOR, +1 CAR." },
  { id: "gnomo", slug: "gnomo", name: "Gnomo", bonus: { INT: 2, CAR: 1 }, trait: "Astúcia Gnômica — +2 INT, +1 CAR." },
  { id: "tiefling", slug: "tiefling", name: "Tiefling", bonus: { CAR: 2, INT: 1 }, trait: "Legado Abissal — +2 CAR, +1 INT." },
  { id: "orc", slug: "orc", name: "Orc", bonus: { FOR: 2, CON: 1 }, trait: "Vigor Selvagem — +2 FOR, +1 CON." },
];

export const RACE_IDS = DEFAULT_RACES.map((race) => race.id);
const ATTRS = ["FOR", "DES", "CON", "SAB", "ESP", "CAR", "INT"];

export function getRaceById(id) {
  if (!id) return null;
  const needle = String(id).trim().toLowerCase();
  return DEFAULT_RACES.find((race) => race.id === needle || race.slug === needle || race.name.toLowerCase() === needle) ?? null;
}

/** Bônus clássico 5e da raça (cópia defensiva; atributos ausentes = 0). */
export function getRaceBonus(raceOrId) {
  const race = typeof raceOrId === "string"
    ? getRaceById(raceOrId)
    : raceOrId?.bonus
      ? raceOrId
      : getRaceById(raceOrId?.slug ?? raceOrId?.id ?? raceOrId?.name);
  const bonus = {};
  for (const attr of ATTRS) bonus[attr] = Number(race?.bonus?.[attr]) || 0;
  return bonus;
}

/** Texto curto do bônus para exibir no select/preview (ex.: "+2 DES, +1 SAB"). */
export function formatRaceBonus(raceOrId) {
  const bonus = getRaceBonus(raceOrId);
  const parts = ATTRS.filter((attr) => bonus[attr] !== 0).map((attr) => `+${bonus[attr]} ${attr}`);
  return parts.length > 0 ? parts.join(", ") : "sem bônus";
}

/** Subtrai o bônus de uma raça dos atributos (troca de raça pelo mestre). */
export function subtractRaceBonus(attributes, raceOrId) {
  const bonus = getRaceBonus(raceOrId);
  const next = { ...attributes };
  for (const attr of ATTRS) {
    const current = Number(next[attr]) || 10;
    next[attr] = Math.max(1, Math.min(30, current - bonus[attr]));
  }
  return next;
}

/** Soma o bônus de uma raça aos atributos (seleção da raça). */
export function addRaceBonus(attributes, raceOrId) {
  const bonus = getRaceBonus(raceOrId);
  const next = { ...attributes };
  for (const attr of ATTRS) {
    const current = Number(next[attr]) || 10;
    next[attr] = Math.max(1, Math.min(30, current + bonus[attr]));
  }
  return next;
}
