import test from "node:test";
import assert from "node:assert/strict";
import {
  TOKEN_ICONS,
  ICON_OPTIONS,
  ICONES_BACKEND_KEYS,
  defaultTokenIcon,
  resolveTokenIcon,
} from "../mapaTatico.js";

test("Mapa tático — ícones de miniatura", async (t) => {
  await t.test("ICON_OPTIONS tem exatamente as 24 chaves aceitas pelo backend", () => {
    assert.equal(ICON_OPTIONS.length, 24);
    assert.deepEqual([...ICON_OPTIONS].sort(), [...ICONES_BACKEND_KEYS].sort());
  });

  await t.test("cada chave do backend tem componente mapeado", () => {
    for (const key of ICONES_BACKEND_KEYS) {
      assert.ok(TOKEN_ICONS[key], `TOKEN_ICONS sem a chave ${key}`);
    }
  });

  await t.test("defaultTokenIcon por tipo", () => {
    assert.equal(defaultTokenIcon("personagem"), "shield");
    assert.equal(defaultTokenIcon("npc"), "sword");
    assert.equal(defaultTokenIcon("monstro"), "sword");
    assert.equal(defaultTokenIcon("efeito"), "sword");
  });

  await t.test("resolveTokenIcon cai no padrão quando a chave é inválida/ausente", () => {
    assert.equal(resolveTokenIcon(null, "personagem"), TOKEN_ICONS.shield);
    assert.equal(resolveTokenIcon("chave-inexistente", "monstro"), TOKEN_ICONS.sword);
    assert.equal(resolveTokenIcon("ghost", "monstro"), TOKEN_ICONS.ghost);
  });
});
