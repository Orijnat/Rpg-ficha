import {
  manualRollResult,
  rollDice,
} from "../dice.js";

console.log("🧪 Iniciando bateria de testes de Rolagem Manual (dado físico)...");

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

// 1. d20 normal: soma face + modificador, respeita a forma do rollDice
console.log("\n--- 1. Dado físico simples (d20) ---");
const r1 = manualRollResult({ sides: 20, modifier: 4, label: "Atletismo", faces: [15] });
assert(r1.total === 19, "15 + 4 = 19");
assert(r1.kept === 15 && r1.rolls[0] === 15, "kept = face informada");
assert(r1.formula === "1d20 + 4", "Fórmula idêntica à do virtual");
assert(r1.manual === true, "Resultado marcado como manual");
assert(Boolean(r1.id) && Boolean(r1.timestamp), "id e timestamp preenchidos");

// 2. Múltiplos dados no modo normal
console.log("\n--- 2. Múltiplos dados (3d6) ---");
const r2 = manualRollResult({ sides: 6, count: 3, modifier: -1, label: "Dano", faces: [2, 5, 6] });
assert(r2.total === 12, "2+5+6-1 = 12");
assert(r2.kept === 13, "kept = soma dos dados");
assert(r2.formula === "3d6 - 1", "Fórmula 3d6 - 1");

// 3. Vantagem física: mantém o maior
console.log("\n--- 3. Vantagem física (2d20kh1) ---");
const r3 = manualRollResult({ sides: 20, mode: "advantage", modifier: 2, label: "Furtividade", faces: [17, 5] });
assert(r3.kept === 17 && r3.discarded === 5, "Vantagem mantém o 17, descarta o 5");
assert(r3.total === 19, "17 + 2 = 19");
assert(r3.formula === "2d20kh1 + 2", "Fórmula de vantagem");

// 4. Desvantagem física: mantém o menor
console.log("\n--- 4. Desvantagem física (2d20kl1) ---");
const r4 = manualRollResult({ sides: 20, mode: "disadvantage", modifier: -3, label: "Ataque", faces: [17, 5] });
assert(r4.kept === 5 && r4.discarded === 17, "Desvantagem mantém o 5, descarta o 17");
assert(r4.total === 2, "5 - 3 = 2");
assert(r4.formula === "2d20kl1 - 3", "Fórmula de desvantagem");

// 5. Críticos com dado físico d20
console.log("\n--- 5. Críticos físicos (d20) ---");
const crit = manualRollResult({ sides: 20, modifier: 0, label: "Ataque", faces: [20] });
assert(crit.isCriticalSuccess === true, "20 natural = sucesso crítico");
const fail = manualRollResult({ sides: 20, modifier: 0, label: "Ataque", faces: [1] });
assert(fail.isCriticalFailure === true, "1 natural = falha crítica");
const noCrit = manualRollResult({ sides: 20, count: 2, faces: [20, 1] });
assert(noCrit.isCriticalSuccess === false, "2d20 físico não gera crítico");
const advCrit = manualRollResult({ sides: 20, mode: "advantage", faces: [20, 1] });
assert(advCrit.isCriticalSuccess === true, "Vantagem física com 20 mantido = crítico");

// 6. Validação de faces inválidas
console.log("\n--- 6. Validação de entrada ---");
const expectThrow = (fn, message) => {
  try {
    fn();
    assert(false, message);
  } catch (error) {
    assert(error instanceof RangeError, message);
  }
};
expectThrow(() => manualRollResult({ sides: 20, faces: [21] }), "Face 21 no d20 é rejeitada");
expectThrow(() => manualRollResult({ sides: 20, faces: [0] }), "Face 0 é rejeitada");
expectThrow(() => manualRollResult({ sides: 6, faces: [7] }), "Face 7 no d6 é rejeitada");
expectThrow(() => manualRollResult({ sides: 20, faces: [NaN] }), "Face NaN é rejeitada");
expectThrow(() => manualRollResult({ sides: 20, faces: [] }), "Nenhum dado informado é rejeitado");
expectThrow(() => manualRollResult({ sides: 20, count: 3, faces: [1, 2] }), "Quantidade insuficiente é rejeitada");
expectThrow(() => manualRollResult({ sides: 20, mode: "advantage", faces: [10] }), "Vantagem exige 2 valores");

// 7. Decimal é truncado, strings numéricas aceitas
console.log("\n--- 7. Normalização ---");
const r7 = manualRollResult({ sides: 20, faces: ["18.9"] });
assert(r7.kept === 18, "'18.9' vira 18");
const r8 = manualRollResult({ sides: 12, count: 2, faces: [12, "7"] });
assert(r8.total === 19, "Strings numéricas são aceitas");

// 8. Paridade estrutural com rollDice (mesmas chaves)
console.log("\n--- 8. Paridade estrutural com o resultado virtual ---");
const virtual = rollDice({ sides: 20, modifier: 2, label: "X" });
const manual = manualRollResult({ sides: 20, modifier: 2, label: "X", faces: [10] });
const virtualKeys = Object.keys(virtual).sort();
const manualKeys = Object.keys(manual).filter((k) => k !== "manual").sort();
assert(virtualKeys.join(",") === manualKeys.join(","), "Resultado manual tem as mesmas chaves do virtual (+ flag `manual`)");

console.log(`\n========================================`);
console.log(`📊 Resultado dos Testes: ${testsPassed} passaram, ${testsFailed} falharam.`);
if (testsFailed > 0) {
  process.exit(1);
} else {
  console.log("🎉 Todos os testes de rolagem manual passaram com 100% de sucesso!");
}
