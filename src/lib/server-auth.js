import { verifyJwt, normalizeProfile } from "./jwt.js";

export function getBearerToken(request) {
  const header = request.headers.get("authorization") || "";
  if (!header.startsWith("Bearer ")) return null;
  const token = header.slice("Bearer ".length).trim();
  return token || null;
}

export function authenticateRequest(request) {
  const token = getBearerToken(request);
  if (!token) {
    throw new Error("Token não fornecido.");
  }

  const payload = verifyJwt(token, process.env.JWT_SECRET);
  const profile = normalizeProfile(payload.perfil || payload.role);

  return {
    ...payload,
    ...profile,
    id: payload.id || payload.sub || null,
  };
}

export function requireMaster(request) {
  const user = authenticateRequest(request);
  if (!user.isMaster) {
    throw new Error("Acesso restrito ao mestre.");
  }
  return user;
}
