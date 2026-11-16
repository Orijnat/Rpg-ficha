import test from "node:test";
import assert from "node:assert/strict";
import { applyItemUse, tickActiveEffects, findAmmoItem, isAmmunitionName } from "../items.js";

const invFixture = () => ([
  { id: "arco", name: "Arco Curto", qty: 1, weight: 2, use: { kind: "ranged" } },
  { id: "flecha", name: "Flechas", qty: 12, weight: 0.05 },
  { id: "espada", name: "Espada Longa", qty: 1, weight: 3, use: { kind: "melee", durability: 1, durabilityMax: 20 } },
  { id: "pocao", name: "Poção Andorinha", qty: 2, weight: 0.25, use: { kind: "consumable", efeito: "Pés Leves", duracao: 3, unidade: "rodadas" } },
  { id: "varinha", name: "Varinha de Faíscas", qty: 1, weight: 0.5, use: { kind: "magic", charges: 1, chargesMax: 7 } },
]);

test("items — detecção e vínculo de munição", () => {
  assert.equal(isAmmunitionName("Flechas (20)"), true);
  assert.equal(isAmmunitionName("Espada Longa"), false);
  const inv = invFixture();
  assert.equal(findAmmoItem(inv, null)?.id, "flecha");
  assert.equal(findAmmoItem(inv, "flecha")?.id, "flecha");
  assert.equal(findAmmoItem([{ id: "x", name: "Flecha", qty: 0 }], null), null, "munição esgotada não é detectada");
});

test("items — ataque à distância consome 1 munição detectada automaticamente", () => {
  const { ok, inventory, message, logDados } = applyItemUse(invFixture(), [], "arco");
  assert.equal(ok, true);
  assert.equal(inventory.find((i) => i.id === "flecha").qty, 11);
  assert.match(message, /11/);
  assert.equal(logDados.ammoRemaining, 11);
});

test("items — ataque à distância sem munição nenhuma rola com aviso e não bloqueia", () => {
  const inv = [{ id: "arco", name: "Arco Curto", qty: 1, use: { kind: "ranged" } }];
  const { ok, warnings } = applyItemUse(inv, [], "arco");
  assert.equal(ok, true);
  assert.equal(warnings.length, 1);
});

test("items — munição vinculada esgotada bloqueia o ataque", () => {
  const inv = [
    { id: "arco", name: "Arco Curto", qty: 1, use: { kind: "ranged", ammo: "virote" } },
    { id: "virote", name: "Virotes", qty: 0, use: undefined },
  ];
  const { ok, message } = applyItemUse(inv, [], "arco");
  assert.equal(ok, false);
  assert.match(message, /Munição/i);
});

test("items — durabilidade decrementa e quebra em 0", () => {
  const res1 = applyItemUse(invFixture(), [], "espada");
  assert.equal(res1.ok, true);
  assert.equal(res1.inventory.find((i) => i.id === "espada").use.durability, 0);
  assert.match(res1.warnings[0] || "", /QUEBROU/);
  const res2 = applyItemUse(res1.inventory, res1.activeEffects, "espada");
  assert.equal(res2.ok, false);
  assert.match(res2.message, /quebrada/i);
});

test("items — poção decrementa qty e cria efeito ativo com duração", () => {
  const { ok, inventory, activeEffects, message } = applyItemUse(invFixture(), [], "pocao");
  assert.equal(ok, true);
  assert.equal(inventory.find((i) => i.id === "pocao").qty, 1);
  assert.equal(activeEffects.length, 1);
  assert.equal(activeEffects[0].nome, "Pés Leves");
  assert.equal(activeEffects[0].remaining, 3);
  assert.equal(activeEffects[0].unidade, "rodadas");
  assert.equal(activeEffects[0].origem, "Poção Andorinha");
  assert.match(message, /3 rodadas/);
});

test("items — poção sem configurar efeito apenas decrementa", () => {
  const inv = [{ id: "p", name: "Poção Simples", qty: 1, use: { kind: "consumable" } }];
  const { activeEffects, ok } = applyItemUse(inv, [], "p");
  assert.equal(ok, true);
  assert.equal(activeEffects.length, 0);
});

test("items — item mágico consome cargas e esgota corretamente", () => {
  const { ok, inventory, warnings } = applyItemUse(invFixture(), [], "varinha");
  assert.equal(ok, true);
  assert.equal(inventory.find((i) => i.id === "varinha").use.charges, 0);
  assert.match(warnings[0] || "", /sem cargas/);
  const again = applyItemUse(inventory, [], "varinha");
  assert.equal(again.ok, false);
});

test("items — item sem perfil recusado", () => {
  const { ok, message } = applyItemUse([{ id: "rock", name: "Pedra", qty: 1 }], [], "rock");
  assert.equal(ok, false);
  assert.match(message, /perfil/i);
});

test("items — tick de efeitos decrementa rodadas e expira os zerados", () => {
  const fx = [
    { id: "1", nome: "Bênção", origem: "Poção", remaining: 2, unidade: "rodadas" },
    { id: "2", nome: "Pele de Pedra", origem: "Poção", remaining: 1, unidade: "rodadas" },
    { id: "3", nome: "Inspiração", origem: "Outro", remaining: 10, unidade: "minutos" },
  ];
  const { activeEffects, expired } = tickActiveEffects(fx, "rodadas", 1);
  assert.equal(activeEffects.length, 2);
  assert.equal(activeEffects.find((e) => e.id === "1").remaining, 1);
  assert.equal(activeEffects.find((e) => e.id === "3").remaining, 10, "minutos não são afetados pelo tick de rodadas");
  assert.equal(expired.length, 1);
  assert.equal(expired[0].id, "2");
});
