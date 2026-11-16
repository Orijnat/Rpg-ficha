import { validateAttributes, validateCharacterSchema, ATTRIBUTES } from "../modifiers.js";
import { createBlankCharacterData } from "../defaultCharacter.js";

const blankCharacter = createBlankCharacterData();


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

// 1. Integridade do blankCharacter
console.log("\n--- 1. Integridade do Schema blankCharacter ---");
assert(typeof blankCharacter === "object", "createBlankCharacterData() retorna objeto válido");
assert(typeof blankCharacter.hp === "number" && blankCharacter.hp > 0, "HP é número positivo");
assert(typeof blankCharacter.hpMax === "number" && blankCharacter.hpMax >= blankCharacter.hp, "hpMax >= hp");
assert(Array.isArray(blankCharacter.skills) && blankCharacter.skills.length === 19, "Contém as 19 perícias canônicas");
assert(Array.isArray(blankCharacter.bankSlots) && blankCharacter.bankSlots.length === 80, "Contém 80 slots de cofre bancário");

// 2. Validação dos 7 Atributos no blankCharacter
console.log("\n--- 2. Validação dos 7 Atributos ---");
const attrCheck = validateAttributes(blankCharacter);
assert(attrCheck.valid === true, "Todos os 7 atributos em blankCharacter são válidos");

for (const attr of ATTRIBUTES) {
  assert(typeof blankCharacter[attr] === "number", `Atributo ${attr} está presente e é numérico`);
}

// 3. Simulação de Exportação (JSON Serialization)
console.log("\n--- 3. Serialização para Exportação JSON ---");
const serialized = JSON.stringify(blankCharacter);
assert(typeof serialized === "string" && serialized.length > 500, "Dados serializados em JSON sem erros");

// 4. Simulação de Importação (JSON Deserialization)
console.log("\n--- 4. Desserialização e Validação de Importação ---");
const parsed = JSON.parse(serialized);
assert(parsed.name === blankCharacter.name, "Nome preservado");
assert(!("bankPassword" in parsed), "Senha do cofre NÃO é exportada (validada apenas no servidor)");
assert(parsed.inventory.length === blankCharacter.inventory.length, "Inventário preservado");
assert(parsed.contracts.length === blankCharacter.contracts.length, "Contratos preservados");

// 5. Schema v2 e Validação Rigorosa
console.log("\n--- 5. Validação de Schema v2 e Sanitização ---");
const schemaVal = validateCharacterSchema(parsed);
assert(schemaVal.valid === true, "Objeto padrão passa na validação de schema v2");
assert(schemaVal.sanitized._schemaVersion === 2, "Schema versionado como 2");
assert(typeof schemaVal.sanitized.dadosExtras === "object", "dadosExtras preservado ou sanitizado");

const corrupted = { ...blankCharacter, FOR: "invalido", hp: -10 };
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
