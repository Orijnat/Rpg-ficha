import test from "node:test";
import assert from "node:assert/strict";
import { normalizeSearchText } from "../search.js";

test("Busca — normalização remove acentos e caixa", () => {
  assert.equal(normalizeSearchText("Druída"), "druida");
  assert.equal(normalizeSearchText("  SÃO PAULO  "), "sao paulo");
  assert.equal(normalizeSearchText("Morto-Vivo"), "morto-vivo");
});

test("Busca — normalização tolera valores vazios", () => {
  assert.equal(normalizeSearchText(null), "");
  assert.equal(normalizeSearchText(undefined), "");
  assert.equal(normalizeSearchText(42), "42");
});

test("Busca — 'druida' encontra tag 'Druída'", () => {
  const term = normalizeSearchText("druida");
  assert.ok(normalizeSearchText("Druída").includes(term));
});
