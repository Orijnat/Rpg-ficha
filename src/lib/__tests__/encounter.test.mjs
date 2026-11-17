import { getEncounterXpReward } from "../encounter.js";

console.log("🧪 Iniciando bateria de testes de Recompensa de Encontro...");

let testsPassed = 0;
let testsFailed = 0;

function assert(condition, message) {
  if (condition) {
    console.log(`  ✅ PASS: ${message}`);
    testsPassed++;
  } else {
    console.error(`  ❌ FAIL: ${message}`);
    testsFailed++;
  }
}

console.log("\n--- 1. XP vem de dadosExtras.recursos.xp (formato real do backend) ---");
assert(getEncounterXpReward({ dadosExtras: { recursos: { xp: 250 } } }) === 250, "lê o XP do cadastro");
assert(getEncounterXpReward({ dadosExtras: { recursos: { xp: 0 } } }) === 0, "zero é respeitado");
assert(getEncounterXpReward({ dadosExtras: { recursos: { xp: "300" } } }) === 300, "string numérica convertida");
assert(getEncounterXpReward({ dadosExtras: { recursos: { xp: 175.9 } } }) === 175, "fração truncada");

console.log("\n--- 2. Tolerância ao formato legado top-level ---");
assert(getEncounterXpReward({ recursos: { xp: 150 } }) === 150, "top-level também funciona");
assert(getEncounterXpReward({ recursos: { xp: 150 }, dadosExtras: { recursos: { xp: 400 } } }) === 400, "dadosExtras tem prioridade");

console.log("\n--- 3. Entradas inválidas / ausentes ---");
assert(getEncounterXpReward(null) === 0, "encounter nulo → 0");
assert(getEncounterXpReward({}) === 0, "sem recursos → 0");
assert(getEncounterXpReward({ dadosExtras: {} }) === 0, "dadosExtras vazio → 0");
assert(getEncounterXpReward({ dadosExtras: { recursos: {} } }) === 0, "recursos sem xp → 0");
assert(getEncounterXpReward({ dadosExtras: { recursos: { xp: -50 } } }) === 0, "XP negativo → 0");
assert(getEncounterXpReward({ dadosExtras: { recursos: { xp: "abc" } } }) === 0, "XP inválido → 0");
assert(getEncounterXpReward({ dadosExtras: { recursos: { xp: NaN } } }) === 0, "NaN → 0");
assert(getEncounterXpReward({ dadosExtras: { recursos: { xp: Infinity } } }) === 0, "Infinity → 0");

console.log(`\n========================================`);
console.log(`📊 Resultado dos Testes: ${testsPassed} passaram, ${testsFailed} falharam.`);
if (testsFailed > 0) {
  process.exit(1);
} else {
  console.log("🎉 Todos os testes de recompensa de encontro passaram!");
}
