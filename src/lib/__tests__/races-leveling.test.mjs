import {
  DEFAULT_RACES,
  getRaceById,
  getRaceBaseAttributes,
  getRaceHitDie,
} from "../races.js";
import { parseHitDie, hpGainFromRoll, levelUpGate } from "../leveling.js";

let passed = 0;
let failed = 0;
function assert(condition, message) {
  if (condition) { console.log(`  ✅ PASS: ${message}`); passed++; }
  else { console.error(`  ❌ FAIL: ${message}`); failed++; }
}

console.log("🧪 Testes de Raças e Progressão de Nível...");

console.log("\n--- 1. Catálogo de raças ---");
const ATTRS = ["FOR", "DES", "CON", "SAB", "ESP", "CAR", "INT"];
assert(Array.isArray(DEFAULT_RACES) && DEFAULT_RACES.length === 8, "8 raças clássicas disponíveis");
for (const race of DEFAULT_RACES) {
  assert(race.id && race.name && race.trait, `${race.id} tem id, nome e traço`);
  assert(race.base && typeof race.base === "object", `${race.id} define atributos base`);
  assert(ATTRS.every((attr) => Number.isInteger(race.base[attr]) && race.base[attr] >= 1), `${race.id}: 7 atributos base inteiros ≥ 1`);
  const total = ATTRS.reduce((sum, attr) => sum + race.base[attr], 0);
  assert(total >= 78 && total <= 84, `${race.id}: soma total ${total} coerente (78–84)`);
  assert(/^(?:[1-9]\d{0,1})?d(?:4|6|8|10|12|20)$/i.test(race.hitDie), `${race.id}: dado de vida ${race.hitDie} válido`);
}

console.log("\n--- 2. Resolução por id/nome ---");
assert(getRaceById("elfo")?.name === "Elfo", "getRaceById por id");
assert(getRaceById("Elfo")?.id === "elfo", "getRaceById case-insensitive");
assert(getRaceById("nao-existe") === null, "raça inválida retorna null");

console.log("\n--- 3. Status base e dado de vida da raça ---");
const humano = getRaceBaseAttributes("humano");
assert(humano.FOR === 12 && humano.INT === 10, "Humano base: FOR 12, INT 10");
const orc = getRaceBaseAttributes("orc");
assert(orc.FOR === 15 && orc.CON === 13, "Orc base: FOR 15, CON 13");
assert(getRaceHitDie("orc") === "1d12", "Orc: dado de vida 1d12");
assert(getRaceHitDie("gnomo") === "1d6", "Gnomo: dado de vida 1d6");
assert(getRaceHitDie("anao") === "1d10", "Anão: dado de vida 1d10");
assert(getRaceHitDie("nao-existe") === "1d8", "fallback de dado de vida é 1d8");
assert(getRaceHitDie("nao-existe", "1d10") === "1d10", "fallback aceita override");
const fallback = getRaceBaseAttributes("nada");
assert(ATTRS.every((attr) => fallback[attr] === 10), "raça desconhecida cai em 10 em todos os atributos");
const baseCopy = getRaceBaseAttributes("elfo");
baseCopy.DES = 99;
assert(getRaceBaseAttributes("elfo").DES === 15, "getRaceBaseAttributes devolve cópia, não a referência");

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
