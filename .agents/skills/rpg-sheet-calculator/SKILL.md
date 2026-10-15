---
name: rpg-sheet-calculator
description: Calcula modificadores dos 7 atributos e atualiza bônus de perícias para o sistema d20 customizado.
---

# Skill: RPG Sheet Calculator

Esta skill define os cálculos matemáticos formais para o sistema de 7 atributos (`FOR`, `DES`, `CON`, `SAB`, `ESP`, `CAR`, `INT`).

## Regras de Negócio:
1. **Modificador de Atributo**:
   $$\text{Modificador} = \lfloor(\text{Atributo} - 10) / 2\rfloor$$

2. **Perícias e Atributos Vinculados**:
   - `Atletismo` -> FOR
   - `Acrobacia`, `Furtividade`, `Prestidigitação` -> DES
   - `História`, `Investigação`, `Sobrevivência`, `Provocação`, `Animais`, `Medicina` -> SAB
   - `Intuição`, `Percepção`, `Atuação` -> ESP
   - `Enganação`, `Intimidação`, `Persuasão` -> CAR
   - `Arcanismo`, `Religião`, `Natureza` -> INT

3. **Cálculo da Perícia**:
   - $\text{Total} = \text{Modificador do Atributo Base} + (\text{skill.bonus} \text{ se treinado ou definido})$.

## Implementação de Referência:
```javascript
export const ATTRIBUTE_LIST = ["FOR", "DES", "CON", "SAB", "ESP", "CAR", "INT"];

export function calculateModifier(attributeValue) {
  const value = Number(attributeValue) || 10;
  return Math.floor((value - 10) / 2);
}

export function formatModifier(mod) {
  return mod >= 0 ? `+${mod}` : `${mod}`;
}

export function calculateSkillBonus(skill, characterData) {
  const baseAttr = skill.attr || "FOR";
  const attrValue = characterData[baseAttr] ?? 10;
  const attrMod = calculateModifier(attrValue);
  const customBonus = typeof skill.bonus === "number" ? skill.bonus : (skill.trained ? 2 : 0);

  return {
    baseAttr,
    attrMod,
    customBonus,
    total: attrMod + customBonus,
    formatted: formatModifier(attrMod + customBonus)
  };
}
```
