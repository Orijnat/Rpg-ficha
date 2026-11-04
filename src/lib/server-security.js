import crypto from "crypto";

const DEFAULT_SCRYPT_PARAMS = { N: 16384, r: 8, p: 1 };

export function getJwtSecret() {
  const secret = process.env.JWT_SECRET;
  if (!secret || secret.length < 32) {
    throw new Error("JWT_SECRET ausente ou fraco. Configure um segredo com pelo menos 32 caracteres.");
  }
  return secret;
}

export function hashPassword(password) {
  if (typeof password !== "string" || password.length < 6) {
    throw new Error("A senha deve ter pelo menos 6 caracteres.");
  }
  const salt = crypto.randomBytes(16).toString("hex");
  const { N, r, p } = DEFAULT_SCRYPT_PARAMS;
  const derivedKey = crypto.scryptSync(password, salt, 64, { N, r, p });
  return `scrypt$${N}$${r}$${p}$${salt}$${derivedKey.toString("hex")}`;
}

export function verifyPassword(password, encodedHash) {
  if (typeof password !== "string" || typeof encodedHash !== "string") return false;
  const [, n, r, p, salt, digest] = encodedHash.split("$");
  if (!n || !r || !p || !salt || !digest) return false;

  try {
    const expected = Buffer.from(digest, "hex");
    const actual = crypto.scryptSync(password, salt, expected.length, {
      N: Number(n),
      r: Number(r),
      p: Number(p),
    });
    return expected.length === actual.length && crypto.timingSafeEqual(expected, actual);
  } catch {
    return false;
  }
}

const attempts = new Map();

export function enforceRateLimit(key, { limit = 10, windowMs = 60_000 } = {}) {
  const now = Date.now();
  const current = attempts.get(key);
  if (!current || current.resetAt <= now) {
    attempts.set(key, { count: 1, resetAt: now + windowMs });
    return;
  }
  if (current.count >= limit) {
    const error = new Error("Muitas tentativas. Aguarde antes de tentar novamente.");
    error.status = 429;
    error.retryAfter = Math.ceil((current.resetAt - now) / 1000);
    throw error;
  }
  current.count += 1;
}
