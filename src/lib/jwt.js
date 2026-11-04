/**
 * Módulo de Gerenciamento de Sessão, Perfis e Tokens JWT
 * Crônicas do Destino - Sistema de Autenticação e Perfis
 * Mantido por: @seguranca-identidade-rpg & @backend-database
 */

let cryptoModule = null;
if (typeof window === "undefined") {
  try {
    cryptoModule = await import("crypto");
  } catch {
    // Ambiente sem crypto nativo
  }
}

export const PROFILES = {
  MESTRE: "mestre",
  JOGADOR: "jogador",
};

export const ROLES = {
  MASTER: "master",
  PLAYER: "player",
};

/**
 * Normaliza perfil e role de forma canônica e bidirecional.
 * @param {string} value
 * @returns {{ perfil: 'mestre'|'jogador', role: 'master'|'player', label: string, isMaster: boolean, isPlayer: boolean }}
 */
export function normalizeProfile(value) {
  const str = String(value || "").toLowerCase().trim();
  if (str === "mestre" || str === "master") {
    return {
      perfil: "mestre",
      role: "master",
      label: "Mestre de Campanha",
      isMaster: true,
      isPlayer: false,
    };
  }
  return {
    perfil: "jogador",
    role: "player",
    label: "Jogador",
    isMaster: false,
    isPlayer: true,
  };
}

/**
 * Decodifica Base64URL em string UTF-8 tanto no Node.js quanto no Navegador.
 */
function base64UrlDecode(str) {
  if (typeof Buffer !== "undefined") {
    return Buffer.from(str, "base64url").toString("utf8");
  }
  try {
    const base64 = str.replace(/-/g, "+").replace(/_/g, "/");
    const pad = base64.length % 4 === 0 ? "" : "=".repeat(4 - (base64.length % 4));
    return decodeURIComponent(
      Array.prototype.map
        .call(atob(base64 + pad), (c) => "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2))
        .join("")
    );
  } catch {
    return "";
  }
}

/**
 * Codifica string UTF-8 em Base64URL tanto no Node quanto no Navegador.
 */
function base64UrlEncode(str) {
  if (typeof Buffer !== "undefined") {
    return Buffer.from(str, "utf8").toString("base64url");
  }
  const utf8Bytes = encodeURIComponent(str).replace(/%([0-9A-F]{2})/g, (_, p1) =>
    String.fromCharCode(parseInt(p1, 16))
  );
  return btoa(utf8Bytes).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

/**
 * Decodifica um token JWT sem validar a assinatura (seguro para inspeção client-side).
 * @param {string} token
 * @returns {{ header: Object|null, payload: Object|null, validFormat: boolean }}
 */
export function decodeJwt(token) {
  if (!token || typeof token !== "string") {
    return { header: null, payload: null, validFormat: false };
  }

  const parts = token.trim().split(".");
  if (parts.length !== 3) {
    return { header: null, payload: null, validFormat: false };
  }

  try {
    const headerJson = base64UrlDecode(parts[0]);
    const payloadJson = base64UrlDecode(parts[1]);
    const header = JSON.parse(headerJson);
    const payload = JSON.parse(payloadJson);
    return { header, payload, validFormat: true };
  } catch {
    return { header: null, payload: null, validFormat: false };
  }
}

/**
 * Verifica se um token JWT está expirado.
 * @param {string} token
 * @param {number} skewSeconds Tolerância em segundos (padrão 10s)
 * @returns {boolean}
 */
export function isJwtExpired(token, skewSeconds = 10) {
  const { payload } = decodeJwt(token);
  if (!payload || !payload.exp) {
    return true;
  }
  const now = Math.floor(Date.now() / 1000);
  return now >= payload.exp - skewSeconds;
}

/**
 * Extrai dados do usuário e perfil formatado a partir de um token JWT.
 * @param {string} token
 * @returns {Object|null}
 */
export function getUserFromToken(token) {
  const { payload } = decodeJwt(token);
  if (!payload) return null;

  const profileInfo = normalizeProfile(payload.perfil || payload.role);

  return {
    id: payload.id || payload.sub || null,
    username: payload.username || payload.name || "Aventureiro",
    email: payload.email || "",
    role: profileInfo.role,
    perfil: profileInfo.perfil,
    label: profileInfo.label,
    isMaster: profileInfo.isMaster,
    isPlayer: profileInfo.isPlayer,
    sessionId: payload.sessionId || payload.jti || null,
    issuedAt: payload.iat ? new Date(payload.iat * 1000).toISOString() : null,
    expiresAt: payload.exp ? new Date(payload.exp * 1000).toISOString() : null,
    isExpired: isJwtExpired(token),
  };
}

/**
 * Emite um novo token JWT HS256 assinado.
 * Executa no ambiente de servidor (Node.js).
 * @param {Object} payload Dados do usuário/sessão
 * @param {string} secret Segredo HMAC
 * @param {Object} options Configurações ({ expiresIn: '7d'|segundos })
 * @returns {string} Token JWT
 */
export function signJwt(payload, secret, options = {}) {
  const secretKey = secret || process.env.JWT_SECRET || "rpg-destiny-default-dev-secret-key-2026";
  const header = { alg: "HS256", typ: "JWT" };

  const now = Math.floor(Date.now() / 1000);
  let expiresInSeconds = 7 * 24 * 60 * 60; // 7 dias padrão

  if (typeof options.expiresIn === "number") {
    expiresInSeconds = options.expiresIn;
  } else if (typeof options.expiresIn === "string") {
    if (options.expiresIn.endsWith("d")) {
      expiresInSeconds = parseInt(options.expiresIn, 10) * 86400;
    } else if (options.expiresIn.endsWith("h")) {
      expiresInSeconds = parseInt(options.expiresIn, 10) * 3600;
    } else if (options.expiresIn.endsWith("m")) {
      expiresInSeconds = parseInt(options.expiresIn, 10) * 60;
    } else if (options.expiresIn.endsWith("s")) {
      expiresInSeconds = parseInt(options.expiresIn, 10);
    }
  }

  const profileInfo = normalizeProfile(payload.perfil || payload.role);

  const fullPayload = {
    ...payload,
    role: profileInfo.role,
    perfil: profileInfo.perfil,
    iat: now,
    exp: now + expiresInSeconds,
    sessionId: payload.sessionId || `sess-${now}-${Math.random().toString(36).slice(2, 8)}`,
  };

  const headerB64 = base64UrlEncode(JSON.stringify(header));
  const payloadB64 = base64UrlEncode(JSON.stringify(fullPayload));
  const signatureInput = `${headerB64}.${payloadB64}`;

  const crypto = cryptoModule || globalThis.crypto;
  let signatureB64 = "";

  if (cryptoModule && cryptoModule.createHmac) {
    signatureB64 = cryptoModule
      .createHmac("sha256", secretKey)
      .update(signatureInput)
      .digest("base64url");
  } else {
    // Fallback básico para ambiente sem cryptoModule
    signatureB64 = base64UrlEncode("unsigned");
  }

  return `${headerB64}.${payloadB64}.${signatureB64}`;
}

/**
 * Valida a integridade, assinatura e validade temporal de um token JWT.
 * Executa no ambiente de servidor (Node.js).
 * @param {string} token
 * @param {string} secret
 * @returns {Object} Payload decodificado se válido
 * @throws {Error} Se token for inválido, adulterado ou expirado
 */
export function verifyJwt(token, secret) {
  if (!token || typeof token !== "string") {
    throw new Error("Token ausente ou formato inválido.");
  }

  const parts = token.trim().split(".");
  if (parts.length !== 3) {
    throw new Error("Formato de token JWT malformado.");
  }

  const [headerB64, payloadB64, signatureB64] = parts;
  const secretKey = secret || process.env.JWT_SECRET || "rpg-destiny-default-dev-secret-key-2026";

  const crypto = cryptoModule || globalThis.crypto;
  if (!cryptoModule || !cryptoModule.createHmac) {
    throw new Error("Módulo criptográfico indisponível.");
  }

  const expectedSignature = cryptoModule
    .createHmac("sha256", secretKey)
    .update(`${headerB64}.${payloadB64}`)
    .digest("base64url");

  if (expectedSignature !== signatureB64) {
    throw new Error("Assinatura do token inválida ou adulterada.");
  }

  const { payload } = decodeJwt(token);
  if (!payload) {
    throw new Error("Payload do token corrompido.");
  }

  const now = Math.floor(Date.now() / 1000);
  if (payload.exp && now >= payload.exp) {
    throw new Error("Sessão expirada. Por favor, autentique-se novamente.");
  }

  return payload;
}
