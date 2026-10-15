/**
 * Cliente HTTP para comunicação com o backend desacoplado (Rpg-backend)
 * Mantido por: @backend-database
 */

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:3333/api";

// Obter token salvo no navegador
export function getStoredToken() {
  if (typeof window === "undefined") return null;
  return localStorage.getItem("rpg_auth_token");
}

// Salvar token e dados do usuário
export function storeAuth(token, user) {
  if (typeof window === "undefined") return;
  if (token) localStorage.setItem("rpg_auth_token", token);
  if (user) localStorage.setItem("rpg_auth_user", JSON.stringify(user));
}

// Limpar autenticação
export function clearAuth() {
  if (typeof window === "undefined") return;
  localStorage.removeItem("rpg_auth_token");
  localStorage.removeItem("rpg_auth_user");
  localStorage.removeItem("rpg_current_char_id");
}

// Login
export async function loginUser({ login, password }) {
  const response = await fetch(`${API_BASE_URL}/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ login, password }),
  });

  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.error || "Erro ao realizar login.");
  }

  storeAuth(data.token, data.user);
  return data;
}

// Registro com criação do primeiro personagem
export async function registerUser({ username, email, password, characterName, characterJob }) {
  const response = await fetch(`${API_BASE_URL}/auth/register`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      username,
      email,
      password,
      characterName,
      characterJob,
    }),
  });

  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.error || "Erro ao realizar cadastro.");
  }

  storeAuth(data.token, data.user);
  return data;
}

// Obter perfil e personagens do usuário logado
export async function fetchMe(token = getStoredToken()) {
  if (!token) return null;

  try {
    const response = await fetch(`${API_BASE_URL}/auth/me`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      if (response.status === 401) {
        clearAuth();
      }
      return null;
    }

    return await response.json();
  } catch (error) {
    console.warn("⚠️ Não foi possível verificar sessão com o backend:", error.message);
    return null;
  }
}

// Criação de um novo personagem para o usuário logado
export async function createCharacterOnBackend(characterData, token = getStoredToken()) {
  const headers = { "Content-Type": "application/json" };
  if (token) headers.Authorization = `Bearer ${token}`;

  const response = await fetch(`${API_BASE_URL}/characters`, {
    method: "POST",
    headers,
    body: JSON.stringify(characterData),
  });

  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.error || "Erro ao criar novo personagem.");
  }

  return data;
}

export async function syncCharacterWithBackend(characterData, token = getStoredToken()) {
  try {
    const headers = { "Content-Type": "application/json" };
    if (token) headers.Authorization = `Bearer ${token}`;

    const response = await fetch(`${API_BASE_URL}/characters/sync`, {
      method: "POST",
      headers,
      body: JSON.stringify(characterData),
    });

    if (!response.ok) {
      throw new Error(`Erro na sincronização: ${response.statusText}`);
    }

    return await response.json();
  } catch (error) {
    console.warn("⚠️ Backend offline ou inacessível. Mantendo dados em cache local:", error.message);
    return null;
  }
}

export async function fetchCharacterFromBackend(characterId) {
  try {
    const response = await fetch(`${API_BASE_URL}/characters/${characterId}`);
    if (!response.ok) {
      throw new Error(`Erro ao carregar: ${response.statusText}`);
    }
    return await response.json();
  } catch (error) {
    console.warn("⚠️ Não foi possível buscar do backend:", error.message);
    return null;
  }
}

export async function verifyBankPasswordOnBackend(characterId, password) {
  try {
    const response = await fetch(`${API_BASE_URL}/characters/${characterId}/bank/verify`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ password }),
    });
    if (!response.ok) return false;
    const data = await response.json();
    return Boolean(data.valid);
  } catch (error) {
    console.warn("⚠️ Validação remota de cofre falhou, usando validação local:", error.message);
    return null;
  }
}
