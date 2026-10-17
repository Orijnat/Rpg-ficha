/**
 * Cliente HTTP para comunicação com o backend desacoplado (Rpg-backend).
 */

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:3333/api";

export function getApiBaseUrl() {
  return API_BASE_URL;
}

export function getStoredToken() {
  if (typeof window === "undefined") return null;
  return localStorage.getItem("rpg_auth_token");
}

export function storeAuth(token, user) {
  if (typeof window === "undefined") return;
  if (token) localStorage.setItem("rpg_auth_token", token);
  if (user) localStorage.setItem("rpg_auth_user", JSON.stringify(user));
}

export function clearAuth() {
  if (typeof window === "undefined") return;
  localStorage.removeItem("rpg_auth_token");
  localStorage.removeItem("rpg_auth_user");
  localStorage.removeItem("rpg_current_char_id");
}

function authHeaders(token = getStoredToken()) {
  return token ? { Authorization: `Bearer ${token}` } : {};
}

export async function loginUser({ login, password }) {
  const response = await fetch(`${API_BASE_URL}/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ login, password }),
  });
  const data = await response.json();
  if (!response.ok) throw new Error(data.error || "Erro ao realizar login.");
  storeAuth(data.token, data.user);
  return data;
}

export async function registerUser({ username, email, password, characterName, characterJob }) {
  const response = await fetch(`${API_BASE_URL}/auth/register`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ username, email, password, characterName, characterJob }),
  });
  const data = await response.json();
  if (!response.ok) throw new Error(data.error || "Erro ao realizar cadastro.");
  storeAuth(data.token, data.user);
  return data;
}

export async function fetchMe(token = getStoredToken()) {
  if (!token) return null;
  try {
    const response = await fetch(`${API_BASE_URL}/auth/me`, {
      headers: authHeaders(token),
    });
    if (!response.ok) {
      if (response.status === 401) clearAuth();
      return null;
    }
    return await response.json();
  } catch (error) {
    console.warn("Não foi possível verificar a sessão com o backend:", error.message);
    return null;
  }
}

export async function createCharacterOnBackend(characterData, token = getStoredToken()) {
  const response = await fetch(`${API_BASE_URL}/characters`, {
    method: "POST",
    headers: { "Content-Type": "application/json", ...authHeaders(token) },
    body: JSON.stringify(characterData),
  });
  const data = await response.json();
  if (!response.ok) throw new Error(data.error || "Erro ao criar novo personagem.");
  return data;
}

export async function listCharacters(token = getStoredToken()) {
  const headers = token ? { Authorization: `Bearer ${token}` } : {};
  const response = await fetch(`${API_BASE_URL}/characters`, { headers });
  const data = await response.json();
  if (!response.ok) throw new Error(data.error || "Erro ao carregar personagens.");
  return data;
}

export async function updateCharacterOnBackend(characterId, characterData, token = getStoredToken()) {
  const headers = { "Content-Type": "application/json" };
  if (token) headers.Authorization = `Bearer ${token}`;
  const response = await fetch(`${API_BASE_URL}/characters/${characterId}`, {
    method: "PUT",
    headers,
    body: JSON.stringify(characterData),
  });
  const data = await response.json();
  if (!response.ok) throw new Error(data.error || "Erro ao atualizar personagem.");
  return data;
}

export async function deleteCharacterOnBackend(characterId, token = getStoredToken()) {
  const headers = token ? { Authorization: `Bearer ${token}` } : {};
  const response = await fetch(`${API_BASE_URL}/characters/${characterId}`, {
    method: "DELETE",
    headers,
  });
  if (!response.ok) {
    const data = await response.json().catch(() => ({}));
    throw new Error(data.error || "Erro ao excluir personagem.");
  }
}

export async function syncCharacterWithBackend(characterData, token = getStoredToken()) {
  try {
    const response = await fetch(`${API_BASE_URL}/characters/sync`, {
      method: "POST",
      headers: { "Content-Type": "application/json", ...authHeaders(token) },
      body: JSON.stringify(characterData),
    });
    if (!response.ok) throw new Error(`Erro na sincronização: ${response.statusText}`);
    const data = await response.json();
    // O endpoint de sync devolve metadados além da ficha; os consumidores
    // legados esperam a ficha diretamente.
    return data.character || data;
  } catch (error) {
    console.warn("Backend offline ou inacessível. Mantendo dados em cache local:", error.message);
    return null;
  }
}

export async function fetchCharacterFromBackend(characterId, token = getStoredToken()) {
  try {
    const response = await fetch(`${API_BASE_URL}/characters/${characterId}`, {
      headers: authHeaders(token),
    });
    if (!response.ok) throw new Error(`Erro ao carregar: ${response.statusText}`);
    return await response.json();
  } catch (error) {
    console.warn("Não foi possível buscar do backend:", error.message);
    return null;
  }
}

export async function verifyBankPasswordOnBackend(characterId, password) {
  try {
    const response = await fetch(`${API_BASE_URL}/characters/${characterId}/bank/verify`, {
      method: "POST",
      headers: { "Content-Type": "application/json", ...authHeaders() },
      body: JSON.stringify({ password }),
    });
    if (!response.ok) return false;
    const data = await response.json();
    return Boolean(data.valid);
  } catch (error) {
    console.warn("Validação remota de cofre falhou:", error.message);
    return null;
  }
}

export async function fetchCampaignData(token = getStoredToken()) {
  const response = await fetch(`${API_BASE_URL}/campanha`, { headers: authHeaders(token) });
  const data = await response.json();
  if (!response.ok) throw new Error(data.error || "Erro ao carregar os dados da campanha.");
  return data;
}

export async function updateCampaignData(campaignData, token = getStoredToken()) {
  const response = await fetch(`${API_BASE_URL}/campanha`, {
    method: "PUT",
    headers: { "Content-Type": "application/json", ...authHeaders(token) },
    body: JSON.stringify(campaignData),
  });
  const data = await response.json();
  if (!response.ok) throw new Error(data.error || "Erro ao salvar os dados da campanha.");
  return data;
}
