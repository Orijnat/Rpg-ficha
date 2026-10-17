import {
  calculateModifier,
  formatModifier,
  calculateSkillBonus,
  calculateAllModifiers,
  validateAttributes,
  DEFAULT_SKILLS,
  ATTRIBUTES,
} from "../modifiers.js";

import {
  rollDice,
  rollCheck,
  parseAndRollFormula,
} from "../dice.js";

console.log("🧪 Iniciando bateria de testes de QA para Regras e Rolagens...");

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

// 1. Testes de Modificadores Matemáticos d20
console.log("\n--- 1. Validação de Modificadores d20 ---");
assert(calculateModifier(10) === 0, "Atributo 10 -> Mod 0");
assert(calculateModifier(11) === 0, "Atributo 11 -> Mod 0");
assert(calculateModifier(12) === 1, "Atributo 12 -> Mod +1");
assert(calculateModifier(13) === 1, "Atributo 13 -> Mod +1");
assert(calculateModifier(14) === 2, "Atributo 14 -> Mod +2");
assert(calculateModifier(16) === 3, "Atributo 16 -> Mod +3");
assert(calculateModifier(18) === 4, "Atributo 18 -> Mod +4");
assert(calculateModifier(9) === -1, "Atributo 9 -> Mod -1");
assert(calculateModifier(8) === -1, "Atributo 8 -> Mod -1");
assert(calculateModifier(7) === -2, "Atributo 7 -> Mod -2");

// 2. Testes de Formatação
console.log("\n--- 2. Formatação com Sinal ---");
assert(formatModifier(3) === "+3", "+3 formatado com sinal");
assert(formatModifier(0) === "0", "0 formatado sem sinal");
assert(formatModifier(-2) === "-2", "-2 formatado com sinal negativo");

// 3. Teste das 19 Perícias e Atributos Vinculados
console.log("\n--- 3. Verificação das 19 Perícias ---");
assert(DEFAULT_SKILLS.length === 19, "Total de 19 perícias canônicas mapeadas");
assert(ATTRIBUTES.length === 7, "Total de 7 atributos base mapeados");

const mockCharacter = {
  FOR: 16, // mod +3
  DES: 14, // mod +2
  CON: 14, // mod +2
  SAB: 12, // mod +1
  ESP: 18, // mod +4
  CAR: 10, // mod +0
  INT: 8,  // mod -1
};

const athletic = calculateSkillBonus({ name: "Atletismo", attr: "FOR", trained: false }, mockCharacter);
assert(athletic.total === 3 && athletic.formatted === "+3", "Atletismo (não treinado) = mod FOR (+3)");

const perception = calculateSkillBonus({ name: "Percepção", attr: "ESP", trained: true, bonus: 5 }, mockCharacter);
assert(perception.total === 9 && perception.formatted === "+9", "Percepção (treinada com bonus 5 + mod ESP 4) = +9");

const religion = calculateSkillBonus({ name: "Religião", attr: "INT", trained: false }, mockCharacter);
assert(religion.total === -1 && religion.formatted === "-1", "Religião com INT 8 = -1");

// 4. Teste de Validação de Atributos
console.log("\n--- 4. Validação de Integridade de Atributos ---");
const validCheck = validateAttributes(mockCharacter);
assert(validCheck.valid === true, "Personagem válido passa na validação");

const invalidCheck = validateAttributes({ FOR: 10, DES: 10 }); // Faltam atributos
assert(invalidCheck.valid === false && invalidCheck.errors.length === 5, "Personagem incompleto falha na validação");

// 5. Teste de Rolagem de Dados e Vantagens/Desvantagens
console.log("\n--- 5. Rolagens Virtuais com Vantagem e Desvantagem ---");

// Teste de Vantagem: kept deve ser o Math.max e discarded deve ser o Math.min
for (let i = 0; i < 20; i++) {
  const rollAdv = rollDice({ sides: 20, mode: "advantage", modifier: 3, label: "Furtividade" });
  const [d1, d2] = rollAdv.rolls;
  const expectedKept = Math.max(d1, d2);
  const expectedDiscarded = Math.min(d1, d2);
  if (rollAdv.kept !== expectedKept || rollAdv.discarded !== expectedDiscarded || rollAdv.total !== expectedKept + 3) {
    assert(false, `Falha na vantagem: ${JSON.stringify(rollAdv)}`);
    break;
  }
}
assert(true, "20 rolagens com Vantagem validadas com sucesso (sempre mantém o maior)");

// Teste de Desvantagem: kept deve ser o Math.min e discarded deve ser o Math.max
for (let i = 0; i < 20; i++) {
  const rollDis = rollDice({ sides: 20, mode: "disadvantage", modifier: -1, label: "Ataque" });
  const [d1, d2] = rollDis.rolls;
  const expectedKept = Math.min(d1, d2);
  const expectedDiscarded = Math.max(d1, d2);
  if (rollDis.kept !== expectedKept || rollDis.discarded !== expectedDiscarded || rollDis.total !== expectedKept - 1) {
    assert(false, `Falha na desvantagem: ${JSON.stringify(rollDis)}`);
    break;
  }
}
assert(true, "20 rolagens com Desvantagem validadas com sucesso (sempre mantém o menor)");

// 6. Teste de Parser de Fórmulas
console.log("\n--- 6. Parser de Fórmulas de Dados ---");
const formulaRoll = parseAndRollFormula("2d6+4", "Dano de Fogo");
assert(formulaRoll !== null, "Fórmula 2d6+4 interpretada");
assert(formulaRoll.sides === 6 && formulaRoll.rolls.length === 2 && formulaRoll.modifier === 4, "Parâmetros de 2d6+4 corretos");
assert(formulaRoll.total === formulaRoll.rolls[0] + formulaRoll.rolls[1] + 4, "Total de 2d6+4 soma dados + mod");

// 7. Aleatoriedade injetável e múltiplos dados
console.log("\n--- 7. Repetibilidade e múltiplos dados ---");
const sequence = [0, 0.5, 0.999999];
const repeatableRoll = rollDice({
  sides: 20,
  count: 3,
  modifier: -2,
  random: () => sequence.shift(),
  label: "Teste repetível",
});
assert(
  repeatableRoll.rolls.join(",") === "1,11,20" &&
    repeatableRoll.total === 30 &&
    repeatableRoll.formula === "3d20 - 2",
  "Fonte aleatória injetada preserva valores, total e fórmula de 3 dados",
);

console.log(`\n========================================`);
console.log(`📊 Resultado dos Testes: ${testsPassed} passaram, ${testsFailed} falharam.`);
if (testsFailed > 0) {
  process.exit(1);
} else {
  console.log("🎉 Todos os testes de regras e dados passaram com 100% de sucesso!");
}
