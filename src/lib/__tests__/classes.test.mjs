import test from "node:test";
import assert from "node:assert/strict";
import {
  DEFAULT_CLASSES,
  getClassByName,
  getHitDieForClass,
  isValidHitDie,
  getClassAbilities,
  getClassAbilitiesLocked,
  findSelectedClass,
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

const CATALOGO = [
  {
    id: "mago", slug: "mago", name: "Mago", hitDie: "1d6",
    abilities: [
      { id: "a1", reqLevel: 1, name: "Toque Arcano", type: "ativa" },
      { id: "a2", reqLevel: 3, name: "Bola de Fogo", type: "ativa" },
      { id: "a3", reqLevel: 5, name: "Muralha de Força", type: "passiva" },
    ],
  },
];

test("habilidades da classe liberam pelo nível do herói", () => {
  const lv1 = getClassAbilities(CATALOGO[0], 1);
  assert.deepEqual(lv1.map((a) => a.name), ["Toque Arcano"]);
  const lv5 = getClassAbilities(CATALOGO[0], 5);
  assert.deepEqual(lv5.map((a) => a.name), ["Toque Arcano", "Bola de Fogo", "Muralha de Força"]);
  const locked = getClassAbilitiesLocked(CATALOGO[0], 1);
  assert.deepEqual(locked.map((a) => a.name), ["Bola de Fogo", "Muralha de Força"]);
  assert.deepEqual(getClassAbilities(null, 10), []);
});

test("findSelectedClass resolve por classId ou slug dos dados extras", () => {
  assert.equal(findSelectedClass(CATALOGO, { classId: "mago" })?.name, "Mago");
  assert.equal(findSelectedClass(CATALOGO, { dadosExtras: { class: "mago" } })?.name, "Mago");
  assert.equal(findSelectedClass(CATALOGO, { dadosExtras: { class: "nao-existe" } }), null);
  assert.equal(findSelectedClass(CATALOGO, {}), null);
});
