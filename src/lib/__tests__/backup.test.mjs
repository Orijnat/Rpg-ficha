import { validateAttributes, validateCharacterSchema, ATTRIBUTES } from "../modifiers.js";
import { defaultData } from "../defaultCharacter.js";


console.log("🧪 Iniciando testes de validação de Backup, Exportação e Importação...");

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

// 1. Integridade do defaultData
console.log("\n--- 1. Integridade do Schema defaultData ---");
assert(typeof defaultData === "object", "defaultData é um objeto válido");
assert(typeof defaultData.hp === "number" && defaultData.hp > 0, "HP é número positivo");
assert(typeof defaultData.hpMax === "number" && defaultData.hpMax >= defaultData.hp, "hpMax >= hp");
assert(Array.isArray(defaultData.skills) && defaultData.skills.length === 19, "Contém as 19 perícias canônicas");
assert(Array.isArray(defaultData.bankSlots) && defaultData.bankSlots.length === 80, "Contém 80 slots de cofre bancário");

// 2. Validação dos 7 Atributos no defaultData
console.log("\n--- 2. Validação dos 7 Atributos ---");
const attrCheck = validateAttributes(defaultData);
assert(attrCheck.valid === true, "Todos os 7 atributos em defaultData são válidos");

for (const attr of ATTRIBUTES) {
  assert(typeof defaultData[attr] === "number", `Atributo ${attr} está presente e é numérico`);
}

// 3. Simulação de Exportação (JSON Serialization)
console.log("\n--- 3. Serialização para Exportação JSON ---");
const serialized = JSON.stringify(defaultData);
assert(typeof serialized === "string" && serialized.length > 500, "Dados serializados em JSON sem erros");

// 4. Simulação de Importação (JSON Deserialization)
console.log("\n--- 4. Desserialização e Validação de Importação ---");
const parsed = JSON.parse(serialized);
assert(parsed.name === defaultData.name, "Nome preservado");
assert(parsed.bankPassword === defaultData.bankPassword, "Senha do banco preservada");
assert(parsed.inventory.length === defaultData.inventory.length, "Inventário preservado");
assert(parsed.contracts.length === defaultData.contracts.length, "Contratos preservados");

// 5. Schema v2 e Validação Rigorosa
console.log("\n--- 5. Validação de Schema v2 e Sanitização ---");
const schemaVal = validateCharacterSchema(parsed);
assert(schemaVal.valid === true, "Objeto padrão passa na validação de schema v2");
assert(schemaVal.sanitized._schemaVersion === 2, "Schema versionado como 2");
assert(typeof schemaVal.sanitized.dadosExtras === "object", "dadosExtras preservado ou sanitizado");

const corrupted = { ...defaultData, FOR: "invalido", hp: -10 };
const corruptVal = validateCharacterSchema(corrupted);
assert(corruptVal.valid === false, "Ficha corrompida rejeitada corretamente");
assert(corruptVal.errors.length >= 2, "Erros de atributo e HP reportados detalhadamente");

console.log(`\n========================================`);
console.log(`📊 Resultado dos Testes de Backup: ${testsPassed} passaram, ${testsFailed} falharam.`);
if (testsFailed > 0) {
  process.exit(1);
} else {
  console.log("🎉 Todos os testes de integridade de backup e dados passaram com sucesso!");
}
