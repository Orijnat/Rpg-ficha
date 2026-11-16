import {
  DEFAULT_RACES,
  getRaceById,
  getRaceBonuses,
  applyRaceBonuses,
  pointBuyCost,
  pointBuySpent,
  POINT_BUY_POOL,
  POINT_BUY_MIN,
  POINT_BUY_MAX,
} from "../races.js";
import { parseHitDie, hpGainFromRoll } from "../leveling.js";

let passed = 0;
let failed = 0;
function assert(condition, message) {
  if (condition) { console.log(`  ✅ PASS: ${message}`); passed++; }
  else { console.error(`  ❌ FAIL: ${message}`); failed++; }
}

console.log("🧪 Testes de Raças e Progressão de Nível...");

console.log("\n--- 1. Catálogo de raças ---");
assert(Array.isArray(DEFAULT_RACES) && DEFAULT_RACES.length === 8, "8 raças clássicas disponíveis");
for (const race of DEFAULT_RACES) {
  assert(race.id && race.name && race.trait, `${race.id} tem id, nome e traço`);
  assert(typeof race.bonuses === "object", `${race.id} tem bônus`);
  const bonusSum = Object.values(race.bonuses).reduce((a, b) => a + b, 0);
  assert(race.id === "humano" ? bonusSum === 7 : bonusSum === 3, `${race.id} concede 3 pontos (humano: 7)`);
}

console.log("\n--- 2. Resolução por id/nome ---");
assert(getRaceById("elfo")?.name === "Elfo", "getRaceById por id");
assert(getRaceById("Elfo")?.id === "elfo", "getRaceById case-insensitive");
assert(getRaceById("nao-existe") === null, "raça inválida retorna null");
assert(getRaceBonuses("anao").CON === 2, "Anão: +2 CON");
assert(getRaceBonuses("humano").INT === 1, "Humano: +1 INT");
assert(Object.keys(getRaceBonuses("inexistente")).length === 0, "bônus de raça desconhecida são vazios");

console.log("\n--- 3. Aplicação de bônus sobre a base ---");
const base = { FOR: 10, DES: 10, CON: 10, SAB: 10, ESP: 10, CAR: 10, INT: 10 };
const elfo = applyRaceBonuses(base, "elfo");
assert(elfo.DES === 12 && elfo.SAB === 11, "Elfo: DES 10+2, SAB 10+1");
assert(elfo.FOR === 10, "atributos sem bônus permanecem");
assert(base.DES === 10, "objeto base não é mutado");

console.log("\n--- 4. Point buy (27 pontos) ---");
assert(pointBuyCost(POINT_BUY_MIN) === 0, "valor mínimo custa 0");
assert(pointBuyCost(15) === 9, "15 custa 9");
assert(pointBuyCost(14) === 7, "14 custa 7");
assert(pointBuySpent({ FOR: 8, DES: 8, CON: 8, SAB: 8, ESP: 8, CAR: 8, INT: 8 }) === 0, "tudo 8 gasta 0");
assert(pointBuySpent({ FOR: 15, DES: 15, CON: 15, SAB: 8, ESP: 8, CAR: 8, INT: 8 }) === 27, "15/15/15 gasta exatamente 27");
assert(POINT_BUY_POOL === 27, "pool padrão é 27");

console.log("\n--- 5. Parse de Dado de Vida ---");
assert(parseHitDie("1d10").sides === 10, "1d10 → 10 lados");
assert(parseHitDie("d8").sides === 8 && parseHitDie("d8").count === 1, "d8 aceito sem contagem (default 1)");
assert(parseHitDie("2d6+1").count === 2 && parseHitDie("2d6+1").modifier === 1, "2d6+1 parseia contagem e bônus");
assert(parseHitDie("lixo").sides === 8, "entrada inválida cai no fallback");
assert(hpGainFromRoll(6, 2) === 8, "6 + Mod(CON) 2 = 8 HP");
assert(hpGainFromRoll(1, -3) === 1, "mínimo de 1 HP por nível");

console.log(`\n========================================`);
console.log(`📊 Resultado: ${passed} passaram, ${failed} falharam.`);
if (failed > 0) process.exit(1);
console.log("🎉 Todos os testes de raças e progressão passaram!");
