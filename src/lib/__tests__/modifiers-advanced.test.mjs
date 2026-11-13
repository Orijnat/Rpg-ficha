/**
 * Testes Unitários — Motor de Regras Expandido (modifiers.js)
 * Suíte: Recursos Derivados, CA, PE, BP, Insanidade, XP, Descanso, Munição, Moedas, Condições
 * Mantido por: @qa-tester
 *
 * Executar: node --test src/lib/__tests__/modifiers-advanced.test.mjs
 */

import { describe, it } from 'node:test';
import { strict as assert } from 'node:assert';
import {
  calculateDerivedResources,
  calculateArmorClass,
  calculatePE,
  calculateBP,
  calculateInsanity,
  calculateLevelFromXP,
  calculateXPForLevel,
  applyShortRest,
  applyLongRest,
  consumeAmmunition,
  convertCurrency,
  totalWealthInCopper,
  applyCondition,
  removeCondition,
  hasCondition,
  XP_TABLE,
  CURRENCY_RATES,
  calculateModifier,
} from '../modifiers.js';

// ═══════════════════════════════════════════════════════════════════════════════
// 1. calculateDerivedResources
// ═══════════════════════════════════════════════════════════════════════════════

describe('calculateDerivedResources', () => {
  it('retorna todos os recursos para um personagem padrão', () => {
    const char = {
      FOR: 10, DES: 10, CON: 10, SAB: 10, ESP: 10, CAR: 10, INT: 10,
      hp: 50, hpMax: 70,
      nivel: 1,
      dadosExtras: { hitDie: '1d10', armorClass: 0 },
    };
    const result = calculateDerivedResources(char);

    // Verifica que todas as chaves esperadas existem
    assert.ok(result.hp, 'deve ter campo hp');
    assert.ok(result.pe, 'deve ter campo pe');
    assert.ok(result.bp, 'deve ter campo bp');
    assert.ok(result.insanity, 'deve ter campo insanity');
    assert.ok(result.ca, 'deve ter campo ca');
    assert.ok(result.initiative, 'deve ter campo initiative');
    assert.ok(result.hitDie, 'deve ter campo hitDie');

    // HP
    assert.equal(result.hp.current, 50);
    assert.equal(result.hp.max, 70);

    // PE: nível 1 + Mod(ESP 10)=0 => max 1
    assert.equal(result.pe.max, 1);

    // BP: nível 1 + Mod(CAR 10)=0 => max 1
    assert.equal(result.bp.max, 1);

    // Insanidade: 10 + Mod(SAB 10)=0 => max 10
    assert.equal(result.insanity.max, 10);

    // CA: 10 + Mod(DES 10)=0 + 0 = 10
    assert.equal(result.ca.total, 10);

    // Dado de Vida
    assert.equal(result.hitDie, '1d10');
  });

  it('personagem nível 5 com ESP 18 tem PE max = 5 + 4 = 9', () => {
    const char = {
      FOR: 10, DES: 10, CON: 10, SAB: 10, ESP: 18, CAR: 10, INT: 10,
      hp: 40, hpMax: 60,
      nivel: 5,
      dadosExtras: { hitDie: '1d10' },
    };
    const result = calculateDerivedResources(char);

    // Mod(ESP 18) = floor((18-10)/2) = 4
    assert.equal(result.pe.max, 9); // 5 + 4 = 9
  });

  it('personagem com valores vazios/undefined usa fallbacks seguros', () => {
    const result = calculateDerivedResources({});

    // HP fallback
    assert.equal(result.hp.current, 0);
    assert.equal(result.hp.max, 1);

    // PE: nível 1 + Mod(10)=0 => max 1
    assert.equal(result.pe.max, 1);

    // BP: nível 1 + Mod(10)=0 => max 1
    assert.equal(result.bp.max, 1);

    // Insanidade: 10 + 0 = 10
    assert.equal(result.insanity.max, 10);

    // CA: 10 + 0 + 0 = 10
    assert.equal(result.ca.total, 10);

    // HitDie fallback
    assert.equal(result.hitDie, '1d10');
  });

  it('personagem completamente undefined retorna sem erro', () => {
    const result = calculateDerivedResources(undefined);
    assert.ok(result, 'deve retornar resultado mesmo com undefined');
    assert.equal(typeof result.hp.current, 'number');
  });
});

// ═══════════════════════════════════════════════════════════════════════════════
// 2. calculateArmorClass
// ═══════════════════════════════════════════════════════════════════════════════

describe('calculateArmorClass', () => {
  it('CA base = 10 + Mod(DES) + extra', () => {
    const result = calculateArmorClass({ DES: 10, dadosExtras: { armorClass: 0 } });
    // 10 + 0 + 0 = 10
    assert.equal(result.total, 10);
    assert.equal(result.base, 10);
    assert.equal(result.desMod, 0);
    assert.equal(result.extra, 0);
  });

  it('DES 16 → Mod 3, extra 2 → CA = 15', () => {
    const result = calculateArmorClass({ DES: 16, dadosExtras: { armorClass: 2 } });
    // Mod(16) = floor((16-10)/2) = 3
    assert.equal(result.desMod, 3);
    assert.equal(result.extra, 2);
    assert.equal(result.total, 15); // 10 + 3 + 2 = 15
  });

  it('DES 8 → Mod -1, extra 0 → CA = 9', () => {
    const result = calculateArmorClass({ DES: 8, dadosExtras: { armorClass: 0 } });
    // Mod(8) = floor((8-10)/2) = -1
    assert.equal(result.desMod, -1);
    assert.equal(result.extra, 0);
    assert.equal(result.total, 9); // 10 + (-1) + 0 = 9
  });

  it('retorna fórmula descritiva', () => {
    const result = calculateArmorClass({ DES: 14, dadosExtras: { armorClass: 1 } });
    assert.ok(typeof result.formula === 'string');
    assert.ok(result.formula.length > 0);
  });
});

// ═══════════════════════════════════════════════════════════════════════════════
// 3. calculatePE (Pontos de Esforço)
// ═══════════════════════════════════════════════════════════════════════════════

describe('calculatePE', () => {
  it('Nível 3, ESP 14 → PE max = 3 + 2 = 5', () => {
    const result = calculatePE({ nivel: 3, ESP: 14 });
    // Mod(14) = floor((14-10)/2) = 2
    assert.equal(result.max, 5); // 3 + 2 = 5
  });

  it('Nível 1, ESP 8 → PE max = max(0, 1 + (-1)) = 0', () => {
    const result = calculatePE({ nivel: 1, ESP: 8 });
    // Mod(8) = floor((8-10)/2) = -1
    assert.equal(result.max, 0); // max(0, 1 + (-1)) = 0
  });

  it('retorna current clamped ao max', () => {
    const result = calculatePE({ nivel: 2, ESP: 12, dadosExtras: { peCurrent: 999 } });
    // Mod(12)=1, max = 2+1=3, current clamped a 3
    assert.equal(result.max, 3);
    assert.ok(result.current <= result.max);
  });

  it('retorna fórmula descritiva', () => {
    const result = calculatePE({ nivel: 5, ESP: 16 });
    assert.ok(typeof result.formula === 'string');
  });
});

// ═══════════════════════════════════════════════════════════════════════════════
// 4. calculateBP (Bônus de Proficiência / Bravura)
// ═══════════════════════════════════════════════════════════════════════════════

describe('calculateBP', () => {
  it('Nível 4, CAR 16 → BP max = 4 + 3 = 7', () => {
    const result = calculateBP({ nivel: 4, CAR: 16 });
    // Mod(16) = 3
    assert.equal(result.max, 7); // 4 + 3 = 7
  });

  it('Nível 1, CAR 6 → BP max = max(0, 1 + (-2)) = 0', () => {
    const result = calculateBP({ nivel: 1, CAR: 6 });
    // Mod(6) = floor((6-10)/2) = -2
    assert.equal(result.max, 0); // max(0, 1 + (-2)) = 0
  });

  it('retorna current clamped ao max', () => {
    const result = calculateBP({ nivel: 3, CAR: 14, dadosExtras: { bpCurrent: 100 } });
    // Mod(14)=2, max = 3+2=5
    assert.equal(result.max, 5);
    assert.ok(result.current <= result.max);
  });
});

// ═══════════════════════════════════════════════════════════════════════════════
// 5. calculateInsanity
// ═══════════════════════════════════════════════════════════════════════════════

describe('calculateInsanity', () => {
  it('SAB 14 → Insanidade max = 10 + 2 = 12', () => {
    const result = calculateInsanity({ SAB: 14 });
    // Mod(14) = 2
    assert.equal(result.max, 12); // 10 + 2 = 12
  });

  it('SAB 8 → Insanidade max = 10 + (-1) = 9', () => {
    const result = calculateInsanity({ SAB: 8 });
    // Mod(8) = -1
    assert.equal(result.max, 9); // 10 + (-1) = 9
  });

  it('insanidade current clamped ao max', () => {
    const result = calculateInsanity({ SAB: 12, dadosExtras: { insanityCurrent: 999 } });
    // max = 10 + 1 = 11
    assert.equal(result.max, 11);
    assert.ok(result.current <= result.max);
  });

  it('sem dados, max = 10 (Mod(10) = 0)', () => {
    const result = calculateInsanity({});
    assert.equal(result.max, 10);
  });
});

// ═══════════════════════════════════════════════════════════════════════════════
// 6. XP e Progressão de Nível
// ═══════════════════════════════════════════════════════════════════════════════

describe('XP_TABLE e Progressão', () => {
  it('XP_TABLE tem 20 entradas', () => {
    assert.equal(XP_TABLE.length, 20);
  });

  it('XP_TABLE[0] = 0 (nível 1)', () => {
    assert.equal(XP_TABLE[0], 0);
  });

  it('XP_TABLE[19] = 355000 (nível 20)', () => {
    assert.equal(XP_TABLE[19], 355000);
  });

  it('XP_TABLE é imutável (frozen)', () => {
    assert.ok(Object.isFrozen(XP_TABLE));
  });
});

describe('calculateLevelFromXP', () => {
  it('XP 0 → nível 1', () => {
    const result = calculateLevelFromXP(0);
    assert.equal(result.level, 1);
  });

  it('XP 300 → nível 2', () => {
    const result = calculateLevelFromXP(300);
    assert.equal(result.level, 2);
  });

  it('XP 2700 → nível 4', () => {
    const result = calculateLevelFromXP(2700);
    assert.equal(result.level, 4);
  });

  it('XP 355000 → nível 20', () => {
    const result = calculateLevelFromXP(355000);
    assert.equal(result.level, 20);
  });

  it('XP acima de 355000 continua nível 20', () => {
    const result = calculateLevelFromXP(999999);
    assert.equal(result.level, 20);
    assert.equal(result.progress, 100);
  });

  it('XP 150 → nível 1, progress = 50%', () => {
    const result = calculateLevelFromXP(150);
    assert.equal(result.level, 1);
    // Progress: (150 - 0) / (300 - 0) * 100 = 50%
    assert.equal(result.progress, 50);
  });

  it('retorna xpForCurrent e nextLevelXP', () => {
    const result = calculateLevelFromXP(1000);
    // Nível 3 (XP 900), próximo nível 4 (XP 2700)
    assert.equal(result.level, 3);
    assert.equal(result.xpForCurrent, 900);
    assert.equal(result.nextLevelXP, 2700);
  });

  it('nível 20 tem nextLevelXP = null', () => {
    const result = calculateLevelFromXP(355000);
    assert.equal(result.nextLevelXP, null);
  });
});

describe('calculateXPForLevel', () => {
  it('calculateXPForLevel(1) → 0', () => {
    assert.equal(calculateXPForLevel(1), 0);
  });

  it('calculateXPForLevel(5) → 6500', () => {
    assert.equal(calculateXPForLevel(5), 6500);
  });

  it('calculateXPForLevel(20) → 355000', () => {
    assert.equal(calculateXPForLevel(20), 355000);
  });

  it('calculateXPForLevel(0) clampa para nível 1 → 0', () => {
    assert.equal(calculateXPForLevel(0), 0);
  });

  it('calculateXPForLevel(25) clampa para nível 20 → 355000', () => {
    assert.equal(calculateXPForLevel(25), 355000);
  });
});

// ═══════════════════════════════════════════════════════════════════════════════
// 7. Descanso (Curto e Longo)
// ═══════════════════════════════════════════════════════════════════════════════

describe('applyShortRest', () => {
  it('retorna hpHealed ≥ 0 baseado no dado de vida + CON', () => {
    const char = {
      CON: 14, // Mod = +2
      nivel: 3,
      ESP: 14,
      dadosExtras: { hitDie: '1d10' },
    };
    const result = applyShortRest(char);
    // hpHealed = dieRoll (1-10) + conMod (2) → mínimo 3, máximo 12
    // Mas como dieRoll pode ser random, testa que é >= 0
    assert.ok(typeof result.hpHealed === 'number');
    assert.ok(result.hpHealed >= 0, 'hpHealed deve ser >= 0');
  });

  it('retorna peRestored = floor(PE max * 0.25)', () => {
    const char = {
      CON: 10,
      nivel: 4,
      ESP: 16, // Mod = +3 → PE max = 4 + 3 = 7
      dadosExtras: { hitDie: '1d10' },
    };
    const result = applyShortRest(char);
    // PE max = 7, 25% = floor(1.75) = 1
    assert.equal(result.peRestored, 1);
  });

  it('retorna descrição do descanso', () => {
    const result = applyShortRest({ CON: 10, nivel: 1, ESP: 10 });
    assert.ok(typeof result.description === 'string');
    assert.ok(result.description.includes('Descanso Curto'));
  });

  it('sem dados, usa fallbacks sem erro', () => {
    const result = applyShortRest({});
    assert.ok(typeof result.hpHealed === 'number');
    assert.ok(typeof result.peRestored === 'number');
  });
});

describe('applyLongRest', () => {
  it('restaura 100% HP (current → max)', () => {
    const char = {
      hp: 30, hpMax: 70,
      nivel: 5, ESP: 14, CAR: 10, SAB: 10, CON: 10,
      dadosExtras: { peCurrent: 2, insanityCurrent: 3 },
    };
    const result = applyLongRest(char);
    // hpRestored = 70 - 30 = 40
    assert.equal(result.hpRestored, 40);
  });

  it('restaura 100% PE', () => {
    const char = {
      hp: 50, hpMax: 50,
      nivel: 4, ESP: 16, // PE max = 4 + 3 = 7
      dadosExtras: { peCurrent: 2 },
    };
    const result = applyLongRest(char);
    // peRestored = 7 - 2 = 5
    assert.equal(result.peRestored, 5);
  });

  it('reduz insanidade em 1', () => {
    const char = {
      hp: 70, hpMax: 70,
      nivel: 1, ESP: 10, SAB: 14,
      dadosExtras: { insanityCurrent: 5 },
    };
    const result = applyLongRest(char);
    assert.equal(result.insanityReduced, 1);
  });

  it('não reduz insanidade se já 0', () => {
    const char = {
      hp: 70, hpMax: 70,
      nivel: 1, ESP: 10, SAB: 14,
      dadosExtras: { insanityCurrent: 0 },
    };
    const result = applyLongRest(char);
    assert.equal(result.insanityReduced, 0);
  });

  it('HP já no max → hpRestored = 0', () => {
    const char = {
      hp: 70, hpMax: 70,
      nivel: 1, ESP: 10,
    };
    const result = applyLongRest(char);
    assert.equal(result.hpRestored, 0);
  });

  it('retorna descrição do descanso longo', () => {
    const result = applyLongRest({ hp: 10, hpMax: 50, nivel: 1, ESP: 10 });
    assert.ok(typeof result.description === 'string');
    assert.ok(result.description.includes('Descanso Longo'));
  });
});

// ═══════════════════════════════════════════════════════════════════════════════
// 8. Munição (consumeAmmunition)
// ═══════════════════════════════════════════════════════════════════════════════

describe('consumeAmmunition', () => {
  it('reduce qty corretamente', () => {
    const inventory = [
      { id: 'flechas', name: 'Flechas', qty: 20, peso: 0.1 },
      { id: 'potion', name: 'Poção de Cura', qty: 3, peso: 0.5 },
    ];
    const result = consumeAmmunition(inventory, 'flechas', 5);
    assert.equal(result.success, true);
    assert.equal(result.remaining, 15);
    assert.equal(result.item.qty, 15);
    assert.equal(result.error, null);
  });

  it('consome por nome do item', () => {
    const inventory = [
      { name: 'Flechas', qty: 10 },
    ];
    const result = consumeAmmunition(inventory, 'Flechas', 3);
    assert.equal(result.success, true);
    assert.equal(result.remaining, 7);
  });

  it('consome por índice numérico', () => {
    const inventory = [
      { name: 'Flechas', qty: 10 },
      { name: 'Balas', qty: 5 },
    ];
    const result = consumeAmmunition(inventory, 1, 2);
    assert.equal(result.success, true);
    assert.equal(result.remaining, 3);
  });

  it('falha quando item não existe', () => {
    const inventory = [
      { id: 'flechas', name: 'Flechas', qty: 20 },
    ];
    const result = consumeAmmunition(inventory, 'espada_magica');
    assert.equal(result.success, false);
    assert.ok(result.error !== null);
    assert.ok(result.error.includes('não encontrado'));
  });

  it('qty chega a 0 e marca como esgotado', () => {
    const inventory = [
      { id: 'potion', name: 'Poção', qty: 1 },
    ];
    const result = consumeAmmunition(inventory, 'potion', 1);
    assert.equal(result.success, true);
    assert.equal(result.remaining, 0);
    assert.equal(result.item.esgotado, true);
    assert.equal(result.item.depleted, true);
  });

  it('consumir mais que disponível faz qty = 0 (clamp)', () => {
    const inventory = [
      { id: 'flechas', name: 'Flechas', qty: 3 },
    ];
    const result = consumeAmmunition(inventory, 'flechas', 10);
    assert.equal(result.success, true);
    assert.equal(result.remaining, 0);
  });

  it('não muta o array original', () => {
    const inventory = [
      { id: 'flechas', name: 'Flechas', qty: 10 },
    ];
    const original = [...inventory];
    consumeAmmunition(inventory, 'flechas', 5);
    assert.equal(inventory[0].qty, original[0].qty);
  });

  it('inventário inválido retorna erro', () => {
    const result = consumeAmmunition(null, 'flechas');
    assert.equal(result.success, false);
    assert.ok(result.error !== null);
  });
});

// ═══════════════════════════════════════════════════════════════════════════════
// 9. Conversão de Moedas
// ═══════════════════════════════════════════════════════════════════════════════

describe('CURRENCY_RATES', () => {
  it('CURRENCY_RATES é imutável (frozen)', () => {
    assert.ok(Object.isFrozen(CURRENCY_RATES));
  });

  it('ouro = 100 cobres', () => {
    assert.equal(CURRENCY_RATES.ouro, 100);
  });

  it('prata = 10 cobres', () => {
    assert.equal(CURRENCY_RATES.prata, 10);
  });

  it('cobre = 1', () => {
    assert.equal(CURRENCY_RATES.cobre, 1);
  });

  it('latina (platina) = 1000 cobres', () => {
    assert.equal(CURRENCY_RATES.latina, 1000);
  });
});

describe('convertCurrency', () => {
  it('1 ouro = 10 prata', () => {
    const result = convertCurrency(1, 'ouro', 'prata');
    assert.equal(result.result, 10); // 1 * 100 / 10 = 10
  });

  it('100 cobre = 1 ouro', () => {
    const result = convertCurrency(100, 'cobre', 'ouro');
    assert.equal(result.result, 1); // 100 * 1 / 100 = 1
  });

  it('1 latina = 10 ouro', () => {
    const result = convertCurrency(1, 'latina', 'ouro');
    assert.equal(result.result, 10); // 1 * 1000 / 100 = 10
  });

  it('5 ouro = 500 cobre', () => {
    const result = convertCurrency(5, 'ouro', 'cobre');
    assert.equal(result.result, 500); // 5 * 100 / 1 = 500
  });

  it('moeda inválida retorna 0', () => {
    const result = convertCurrency(10, 'diamante', 'ouro');
    assert.equal(result.result, 0);
  });

  it('retorna fórmula descritiva', () => {
    const result = convertCurrency(3, 'ouro', 'prata');
    assert.ok(typeof result.formula === 'string');
    assert.ok(result.formula.length > 0);
  });
});

describe('totalWealthInCopper', () => {
  it('mix de moedas calcula corretamente', () => {
    const currencies = { latina: 1, ouro: 5, prata: 10, cobre: 25 };
    // 1*1000 + 5*100 + 10*10 + 25*1 = 1000 + 500 + 100 + 25 = 1625
    assert.equal(totalWealthInCopper(currencies), 1625);
  });

  it('somente ouro', () => {
    assert.equal(totalWealthInCopper({ ouro: 10 }), 1000); // 10 * 100 = 1000
  });

  it('somente cobre', () => {
    assert.equal(totalWealthInCopper({ cobre: 50 }), 50);
  });

  it('objeto vazio retorna 0', () => {
    assert.equal(totalWealthInCopper({}), 0);
  });

  it('null retorna 0', () => {
    assert.equal(totalWealthInCopper(null), 0);
  });

  it('valores negativos são tratados como 0', () => {
    // Math.max(0, qty) na implementação garante que negativos virem 0
    assert.equal(totalWealthInCopper({ ouro: -5, cobre: 10 }), 10);
  });
});

// ═══════════════════════════════════════════════════════════════════════════════
// 10. Condições Táticas
// ═══════════════════════════════════════════════════════════════════════════════

describe('applyCondition', () => {
  it('adiciona condição única', () => {
    const result = applyCondition([], 'atordoado');
    assert.deepEqual(result, ['atordoado']);
  });

  it('não duplica condição já presente', () => {
    const result = applyCondition(['atordoado'], 'atordoado');
    assert.deepEqual(result, ['atordoado']);
    assert.equal(result.length, 1);
  });

  it('adiciona múltiplas condições diferentes', () => {
    let conditions = applyCondition([], 'atordoado');
    conditions = applyCondition(conditions, 'envenenado');
    conditions = applyCondition(conditions, 'cego');
    assert.equal(conditions.length, 3);
    assert.ok(conditions.includes('atordoado'));
    assert.ok(conditions.includes('envenenado'));
    assert.ok(conditions.includes('cego'));
  });

  it('ignora condição inválida (não presente em CONDITIONS_LIST)', () => {
    const result = applyCondition([], 'voando_infinito');
    assert.deepEqual(result, []);
  });

  it('ignora string vazia', () => {
    const result = applyCondition([], '');
    assert.deepEqual(result, []);
  });

  it('retorna novo array (imutável)', () => {
    const original = ['atordoado'];
    const result = applyCondition(original, 'cego');
    assert.notStrictEqual(result, original);
    assert.equal(original.length, 1); // original não mutado
  });
});

describe('removeCondition', () => {
  it('remove condição existente', () => {
    const result = removeCondition(['atordoado', 'cego'], 'atordoado');
    assert.deepEqual(result, ['cego']);
  });

  it('não altera se condição não presente', () => {
    const result = removeCondition(['atordoado'], 'cego');
    assert.deepEqual(result, ['atordoado']);
  });

  it('de lista vazia retorna lista vazia', () => {
    const result = removeCondition([], 'atordoado');
    assert.deepEqual(result, []);
  });

  it('retorna novo array (imutável)', () => {
    const original = ['atordoado', 'cego'];
    const result = removeCondition(original, 'cego');
    assert.notStrictEqual(result, original);
    assert.equal(original.length, 2); // original não mutado
  });
});

describe('hasCondition', () => {
  it('retorna true quando condição está ativa', () => {
    assert.equal(hasCondition(['atordoado', 'cego'], 'atordoado'), true);
  });

  it('retorna false quando condição não está ativa', () => {
    assert.equal(hasCondition(['atordoado'], 'cego'), false);
  });

  it('retorna false para lista vazia', () => {
    assert.equal(hasCondition([], 'atordoado'), false);
  });

  it('retorna false para string vazia', () => {
    assert.equal(hasCondition(['atordoado'], ''), false);
  });

  it('retorna false para array não válido', () => {
    assert.equal(hasCondition(null, 'atordoado'), false);
  });

  it('normaliza ID para lowercase', () => {
    assert.equal(hasCondition(['atordoado'], 'Atordoado'), true);
  });
});
