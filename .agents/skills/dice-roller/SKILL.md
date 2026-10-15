---
name: dice-roller
description: Executa e resolve rolagens de dados virtuais d20 com suporte a bônus, vantagens e desvantagens para RPG.
---

# Skill: Dice Roller

Esta skill fornece o padrão determinístico para rolagens virtuais no sistema d20 customizado da Ficha de RPG Web.

## Lógica de Execução:
1. **Parâmetros de Entrada**:
   - `sides` (número, padrão 20): quantidade de lados do dado.
   - `count` (número, padrão 1): quantidade de dados para rolar.
   - `mode` ('normal' | 'advantage' | 'disadvantage'): modo do teste.
   - `modifier` (número, padrão 0): bônus ou penalidade somada ao resultado.
   - `label` (string opcional): descrição do teste (ex: "Acrobacia", "Ataque com Rifle").

2. **Resolução de Vantagem / Desvantagem**:
   - Se `mode === 'advantage'`: rola 2 dados (`sides`), define `kept = Math.max(d1, d2)` e `discarded = Math.min(d1, d2)`.
   - Se `mode === 'disadvantage'`: rola 2 dados (`sides`), define `kept = Math.min(d1, d2)` e `discarded = Math.max(d1, d2)`.
   - Se `mode === 'normal'`: rola 1 dado, `kept = d1`, `discarded = null`.

3. **Cálculo do Total**:
   - `total = kept + modifier`.
   - Detectar crítico d20: `isCriticalSuccess = (sides === 20 && kept === 20)`, `isCriticalFailure = (sides === 20 && kept === 1)`.

## Exemplo em JavaScript:
```javascript
export function rollDice({ sides = 20, mode = "normal", modifier = 0, label = "" } = {}) {
  const rollOne = () => Math.floor(Math.random() * sides) + 1;

  if (mode === "advantage" || mode === "disadvantage") {
    const d1 = rollOne();
    const d2 = rollOne();
    const kept = mode === "advantage" ? Math.max(d1, d2) : Math.min(d1, d2);
    const discarded = mode === "advantage" ? Math.min(d1, d2) : Math.max(d1, d2);

    return {
      id: Date.now().toString(),
      label,
      formula: mode === "advantage" ? `2d${sides}kh1 + ${modifier}` : `2d${sides}kl1 + ${modifier}`,
      mode,
      rolls: [d1, d2],
      kept,
      discarded,
      modifier,
      total: kept + modifier,
      isCriticalSuccess: sides === 20 && kept === 20,
      isCriticalFailure: sides === 20 && kept === 1,
      timestamp: new Date().toISOString(),
    };
  }

  const d1 = rollOne();
  return {
    id: Date.now().toString(),
    label,
    formula: `1d${sides} + ${modifier}`,
    mode: "normal",
    rolls: [d1],
    kept: d1,
    discarded: null,
    modifier,
    total: d1 + modifier,
    isCriticalSuccess: sides === 20 && kept === 20,
    isCriticalFailure: sides === 20 && kept === 1,
    timestamp: new Date().toISOString(),
  };
}
```
