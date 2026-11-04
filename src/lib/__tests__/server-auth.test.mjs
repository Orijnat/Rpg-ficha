import test from "node:test";
import assert from "node:assert/strict";

process.env.JWT_SECRET = "test-secret-with-at-least-32-characters";

const { signJwt } = await import("../jwt.js");
const { authenticateRequest, requireMaster } = await import("../server-auth.js");

function requestWithToken(token) {
  return new Request("http://localhost/api", {
    headers: { authorization: `Bearer ${token}` },
  });
}

test("rejeita requisições sem token", () => {
  assert.throws(
    () => authenticateRequest(new Request("http://localhost/api")),
    /Token não fornecido/
  );
});

test("extrai identidade e perfil do token válido", () => {
  const token = signJwt({ id: "master-1", perfil: "mestre" }, process.env.JWT_SECRET);
  const user = authenticateRequest(requestWithToken(token));
  assert.equal(user.id, "master-1");
  assert.equal(user.isMaster, true);
});

test("bloqueia jogador em operação restrita ao mestre", () => {
  const token = signJwt({ id: "player-1", perfil: "jogador" }, process.env.JWT_SECRET);
  assert.throws(() => requireMaster(requestWithToken(token)), /Acesso restrito ao mestre/);
});
