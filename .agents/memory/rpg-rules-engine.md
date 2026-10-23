# Memória do Sub-agente: rpg-rules-engine

## 🎯 Escopo e Responsabilidade
Especialista em regras matemáticas, cálculos de atributos, modificadores, perícias e validações puras do sistema de RPG customizado.

---

## 📐 Regras e Fórmulas em Vigor
- **Atributos (7)**: `FOR`, `DES`, `CON`, `SAB`, `ESP`, `CAR`, `INT`.
- **Fórmula de Modificador**: `Math.floor((valor - 10) / 2)`.
- **Mapeamento de Perícias**:
  * FOR: Atletismo
  * DES: Acrobacia, Furtividade, Prestidigitação
  * SAB: História, Investigação, Sobrevivência, Provocação, Animais, Medicina
  * ESP: Intuição, Percepção, Atuação
  * CAR: Enganação, Intimidação, Persuasão
  * INT: Arcanismo, Religião, Natureza
- **Cálculo da Perícia**: `Modificador Base + (bonusTreino || 0)`.

---

## 📂 Arquivos Sob Gestão Deste Sub-agente
- `src/lib/modifiers.js` (Implementado: cálculo de modificadores, labels, 19 perícias canônicas e validações)
- `src/models/character.js` (esquema de validação dos dados)

---

## 📌 Histórico de Alterações e Decisões
- **2026-10-15**:
  - Definição formal das regras matemáticas dos 7 atributos e vínculo das 19 perícias do sistema.
  - Alinhamento da fórmula de modificador d20 sem frações (`Math.floor`).
  - Implementação completa de `src/lib/modifiers.js` com suporte a `calculateModifier`, `formatModifier`, `calculateSkillBonus`, `calculateAllModifiers` e `validateAttributes`.

---

## 📋 Próximas Ações
- [x] Implementar `src/lib/modifiers.js` com funções puras.
- [x] Integrar `calculateModifier` e `calculateSkillBonus` diretamente nos componentes de UI da ficha.
- [x] Implementar cálculo de capacidade de carga (`calculateCapacity`) e iniciativa (`calculateInitiative`).
- [x] Implementar validação formal de schema com sanitização profunda (`validateCharacterSchema`) para importação/exportação com schema versionado v2.

