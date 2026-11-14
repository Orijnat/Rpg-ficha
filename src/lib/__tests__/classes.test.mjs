import test from "node:test";
import assert from "node:assert/strict";
import {
  DEFAULT_CLASSES,
  getClassByName,
  getHitDieForClass,
  isValidHitDie,
  getAbilityPresetsForClass,
} from "../classes.js";

test("catálogo cobre as classes do documento de regras", () => {
  assert.ok(DEFAULT_CLASSES.length >= 6);
  for (const cls of DEFAULT_CLASSES) {
    assert.match(cls.hitDie, /^1d\d+$/);
    assert.ok(cls.primaryAttribute, `${cls.id} sem atributo-chave`);
  }
});

test("getClassByName resolve id e nome com case/espaços", () => {
  assert.equal(getClassByName("  BRUXEIRO")?.id, "bruxeiro");
  assert.equal(getClassByName("Mago")?.hitDie, "1d6");
  assert.equal(getClassByName("Bárbaro")?.id, "barbaro");
  assert.equal(getClassByName(""), null);
  assert.equal(getClassByName(undefined), null);
});

test("getHitDieForClass tem fallback seguro", () => {
  assert.equal(getHitDieForClass("Guerreiro"), "1d10");
  assert.equal(getHitDieForClass("Fantasma"), "1d8");
});

test("isValidHitDie aceita apenas notações d20 de regras", () => {
  assert.equal(isValidHitDie("1d10"), true);
  assert.equal(isValidHitDie("2d6+3"), true);
  assert.equal(isValidHitDie("1d7"), false);
  assert.equal(isValidHitDie("0d6"), false);
  assert.equal(isValidHitDie("d20"), true);
  assert.equal(isValidHitDie("banana"), false);
  assert.equal(isValidHitDie("1d1000"), false);
});

test("preset de habilidades por classe", () => {
  assert.deepEqual(getAbilityPresetsForClass("bruxeiro"), ["hab-igni", "hab-quen"]);
  assert.deepEqual(getAbilityPresetsForClass("inventada"), []);
});
