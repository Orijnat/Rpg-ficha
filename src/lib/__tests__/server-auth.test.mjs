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

test("JWT adulterado é rejeitado", async () => {
  const { signJwt, verifyJwt } = await import("../jwt.js");
  const secret = process.env.JWT_SECRET;
  const token = signJwt({ id: "master-2", perfil: "mestre" }, secret);
  const [h, p, s] = token.split(".");
  const forged = `${h}.${p}.${"a".repeat(s.length)}`;
  assert.throws(() => verifyJwt(forged, secret), /Assinatura do token inválida/);
});

test("JWT expirado é rejeitado", async () => {
  const { signJwt, verifyJwt } = await import("../jwt.js");
  const secret = process.env.JWT_SECRET;
  const token = signJwt({ id: "master-3", perfil: "mestre" }, secret, { expiresIn: -10 });
  assert.throws(() => verifyJwt(token, secret), /Sessão expirada/);
});

test("assinatura válida verifica com sucesso (round-trip)", async () => {
  const { signJwt, verifyJwt } = await import("../jwt.js");
  const secret = process.env.JWT_SECRET;
  const token = signJwt({ id: "player-9", perfil: "jogador" }, secret);
  const payload = verifyJwt(token, secret);
  assert.equal(payload.id, "player-9");
  assert.equal(payload.perfil, "jogador");
});
