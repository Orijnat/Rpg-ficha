import {
  DEFAULT_RACES,
  getRaceById,
  getRaceBonus,
  addRaceBonus,
  subtractRaceBonus,
  formatRaceBonus,
} from "../races.js";
import { parseHitDie, hpGainFromRoll, levelUpGate } from "../leveling.js";

let passed = 0;
let failed = 0;
function assert(condition, message) {
  if (condition) { console.log(`  ✅ PASS: ${message}`); passed++; }
  else { console.error(`  ❌ FAIL: ${message}`); failed++; }
}

console.log("🧪 Testes de Raças e Progressão de Nível...");

console.log("\n--- 1. Catálogo de raças (bônus clássico 5e) ---");
const ATTRS = ["FOR", "DES", "CON", "SAB", "ESP", "CAR", "INT"];
assert(Array.isArray(DEFAULT_RACES) && DEFAULT_RACES.length === 8, "8 raças clássicas disponíveis");
for (const race of DEFAULT_RACES) {
  assert(race.id && race.name && race.trait, `${race.id} tem id, nome e traço`);
  assert(race.bonus && typeof race.bonus === "object", `${race.id} define bônus`);
  assert(ATTRS.every((attr) => Number.isInteger(race.bonus[attr] ?? 0) && (race.bonus[attr] ?? 0) >= 0 && (race.bonus[attr] ?? 0) <= 2), `${race.id}: bônus inteiros 0–2`);
  const total = ATTRS.reduce((sum, attr) => sum + (race.bonus[attr] ?? 0), 0);
  assert(total >= 2 && total <= 7, `${race.id}: soma do bônus ${total} coerente (2–7)`);
}

console.log("\n--- 2. Resolução por id/nome ---");
assert(getRaceById("elfo")?.name === "Elfo", "getRaceById por id");
assert(getRaceById("Elfo")?.id === "elfo", "getRaceById case-insensitive");
assert(getRaceById("nao-existe") === null, "raça inválida retorna null");

console.log("\n--- 3. Bônus racial SOMA sobre os status definidos pelo jogador ---");
const humanoBonus = getRaceBonus("humano");
assert(ATTRS.every((attr) => humanoBonus[attr] === 1), "Humano: +1 em todos");
const elfoBonus = getRaceBonus("elfo");
assert(elfoBonus.DES === 2 && elfoBonus.SAB === 1, "Elfo: +2 DES, +1 SAB");
const base = { FOR: 10, DES: 10, CON: 10, SAB: 10, ESP: 10, CAR: 10, INT: 10 };
const added = addRaceBonus(base, "orc");
assert(added.FOR === 12 && added.CON === 11 && added.DES === 10, "Orc soma +2 FOR e +1 CON, sem tocar no resto");
assert(base.FOR === 10, "addRaceBonus não muta o objeto original");
const swapped = subtractRaceBonus(addRaceBonus(base, "elfo"), "elfo");
assert(ATTRS.every((attr) => swapped[attr] === 10), "subtrair o bônus devolve o base intacto");
const swappedRace = subtractRaceBonus(addRaceBonus(base, "elfo"), "elfo");
assert(addRaceBonus(swappedRace, "anao").CON === 12, "troca de raça pelo mestre: remove elfo e aplica anão");
assert(formatRaceBonus("elfo") === "+2 DES, +1 SAB", "formatRaceBonus resume o bônus");
const unknownBonus = getRaceBonus("nao-existe");
assert(ATTRS.every((attr) => unknownBonus[attr] === 0), "raça desconhecida: bônus zerado");
const bonusCopy = getRaceBonus("elfo");
bonusCopy.DES = 99;
assert(getRaceBonus("elfo").DES === 2, "getRaceBonus devolve cópia, não a referência");

console.log("\n--- 4. Gate de subida de nível ---");
assert(levelUpGate(1, 0).ok === false, "1 com 0 XP não sobe");
assert(levelUpGate(1, 300).ok === true && levelUpGate(1, 300).nextLevel === 2, "300 XP libera nível 2");
assert(levelUpGate(2, 300).ok === false, "já no nível liberado pelo XP, não rola de novo");
assert(levelUpGate(1, 900).ok === true && levelUpGate(1, 900).nextLevel === 2, "900 XP libera apenas 1 nível por vez");
assert(levelUpGate(20, 999999).ok === false, "nível 20 é teto");
assert(levelUpGate(1, 299).message.includes("XP"), "mensagem informa XP faltante");

console.log("\n--- 5. Parse de Dado de Vida ---");
assert(parseHitDie("1d12").sides === 12, "1d12 → 12 lados");
assert(parseHitDie("d8").sides === 8 && parseHitDie("d8").count === 1, "d8 aceito sem contagem (default 1)");
assert(parseHitDie("2d6+1").count === 2 && parseHitDie("2d6+1").modifier === 1, "2d6+1 parseia contagem e bônus");
assert(parseHitDie("lixo").sides === 8, "entrada inválida cai no fallback");
assert(hpGainFromRoll(6, 2) === 8, "6 + Mod(CON) 2 = 8 HP");
assert(hpGainFromRoll(1, -3) === 1, "mínimo de 1 HP por nível");

console.log(`\n========================================`);
console.log(`📊 Resultado: ${passed} passaram, ${failed} falharam.`);
if (failed > 0) process.exit(1);
console.log("🎉 Todos os testes de raças e progressão passaram!");
