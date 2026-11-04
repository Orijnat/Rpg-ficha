import { describe, it } from "node:test";
import assert from "node:assert/strict";
import {
  signJwt,
  verifyJwt,
  decodeJwt,
  isJwtExpired,
  getUserFromToken,
  normalizeProfile,
  PROFILES,
  ROLES,
} from "../jwt.js";

describe("Sessões e Perfis via JWT Tokens", () => {
  const SECRET = "segredo-de-teste-rpg-123456";

  it("1. Normalização de perfis e roles canônicas", () => {
    const masterPerfil = normalizeProfile("mestre");
    assert.equal(masterPerfil.perfil, PROFILES.MESTRE);
    assert.equal(masterPerfil.role, ROLES.MASTER);
    assert.equal(masterPerfil.isMaster, true);
    assert.equal(masterPerfil.isPlayer, false);

    const masterRole = normalizeProfile("master");
    assert.equal(masterRole.perfil, PROFILES.MESTRE);
    assert.equal(masterRole.role, ROLES.MASTER);

    const playerPerfil = normalizeProfile("jogador");
    assert.equal(playerPerfil.perfil, PROFILES.JOGADOR);
    assert.equal(playerPerfil.role, ROLES.PLAYER);
    assert.equal(playerPerfil.isMaster, false);
    assert.equal(playerPerfil.isPlayer, true);

    const fallback = normalizeProfile(undefined);
    assert.equal(fallback.perfil, PROFILES.JOGADOR);
    assert.equal(fallback.role, ROLES.PLAYER);
  });

  it("2. Emissão e verificação de token JWT com sessão e perfil", () => {
    const payload = {
      id: "usr-123",
      username: "Aldor O Sábio",
      email: "aldor@rpg.com",
      perfil: "mestre",
    };

    const token = signJwt(payload, SECRET, { expiresIn: "1h" });
    assert.ok(token);
    assert.equal(typeof token, "string");
    assert.equal(token.split(".").length, 3);

    const verified = verifyJwt(token, SECRET);
    assert.equal(verified.id, "usr-123");
    assert.equal(verified.username, "Aldor O Sábio");
    assert.equal(verified.perfil, "mestre");
    assert.equal(verified.role, "master");
    assert.ok(verified.sessionId);
    assert.ok(verified.exp > verified.iat);
  });

  it("3. Detecção de adulteração de token (assinatura inválida)", () => {
    const token = signJwt({ id: "usr-jogador", perfil: "jogador" }, SECRET);
    const parts = token.split(".");
    // Tenta elevar privilégio alterando o payload
    const tamperedPayload = Buffer.from(
      JSON.stringify({ id: "usr-jogador", perfil: "mestre", role: "master" })
    ).toString("base64url");
    const tamperedToken = `${parts[0]}.${tamperedPayload}.${parts[2]}`;

    assert.throws(
      () => verifyJwt(tamperedToken, SECRET),
      /Assinatura do token inválida ou adulterada/
    );
  });

  it("4. Detecção de expiração de token", () => {
    // Token com 0 segundos de validade
    const expiredToken = signJwt({ id: "usr-exp", perfil: "jogador" }, SECRET, {
      expiresIn: -10,
    });

    assert.equal(isJwtExpired(expiredToken), true);
    assert.throws(
      () => verifyJwt(expiredToken, SECRET),
      /Sessão expirada/
    );
  });

  it("5. Extração de informações de usuário e sessão do token (client-side seguro)", () => {
    const token = signJwt(
      {
        id: "usr-hero",
        username: "Valerius",
        email: "valerius@destiny.com",
        perfil: "jogador",
        sessionId: "sess-valerius-999",
      },
      SECRET,
      { expiresIn: "7d" }
    );

    const user = getUserFromToken(token);
    assert.ok(user);
    assert.equal(user.id, "usr-hero");
    assert.equal(user.username, "Valerius");
    assert.equal(user.email, "valerius@destiny.com");
    assert.equal(user.perfil, "jogador");
    assert.equal(user.role, "player");
    assert.equal(user.isMaster, false);
    assert.equal(user.isPlayer, true);
    assert.equal(user.sessionId, "sess-valerius-999");
    assert.equal(user.isExpired, false);
  });
});
