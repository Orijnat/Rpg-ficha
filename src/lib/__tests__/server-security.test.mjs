import test from "node:test";
import assert from "node:assert/strict";

const { hashPassword, verifyPassword } = await import("../server-security.js");

test("hash de senha não armazena a senha original", () => {
  const hash = hashPassword("senha-segura");
  assert.notEqual(hash, "senha-segura");
  assert.equal(verifyPassword("senha-segura", hash), true);
  assert.equal(verifyPassword("senha-incorreta", hash), false);
});
