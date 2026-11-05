/**
 * Cliente HTTP resiliente para comunicação com a API.
 * Protegido contra respostas HTML acidentais (<!DOCTYPE html> em 404/500).
 */

const API_BASE_URL = (
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:3333/api"
).replace(/\/+$/, "");

export function getApiBaseUrl() {
  return API_BASE_URL;
}

export function getStoredToken() {
  if (typeof window === "undefined") return null;
  try {
    // sessionStorage reduz a persistência do JWT sem mudar o contrato Bearer da API.
    const sessionToken = window.sessionStorage.getItem("rpg_auth_token");
    if (sessionToken) return sessionToken;
    // Compatibilidade de migração: sessões antigas continuam funcionando uma vez.
    const legacyToken = window.localStorage.getItem("rpg_auth_token");
    if (legacyToken) {
      window.sessionStorage.setItem("rpg_auth_token", legacyToken);
      window.localStorage.removeItem("rpg_auth_token");
    }
    return legacyToken;
  } catch {
    return null;
  }
}

export function storeAuth(token, user) {
  if (typeof window === "undefined") return;
  try {
    if (token) {
      window.sessionStorage.setItem("rpg_auth_token", token);
      window.localStorage.removeItem("rpg_auth_token");
    }
    if (user) window.sessionStorage.setItem("rpg_auth_user", JSON.stringify(user));
  } catch {
    // A sessão em memória continua válida mesmo se o navegador bloquear storage.
  }
}

export function clearAuth() {
  if (typeof window === "undefined") return;
  for (const storage of [window.sessionStorage, window.localStorage]) {
    try {
      storage.removeItem("rpg_auth_token");
      storage.removeItem("rpg_auth_user");
      storage.removeItem("rpg_current_char_id");
    } catch {
      // Storage pode estar indisponível em modo privado/restrito.
    }
  }
}

function authHeaders(token = getStoredToken()) {
  return token ? { Authorization: `Bearer ${token}` } : {};
}

/**
 * Utilitário seguro para requisições HTTP que NUNCA falha com
 * "Unexpected token '<', '<!DOCTYPE '... is not valid JSON".
 */
export async function safeFetchJson(url, options = {}, fallbackErrorMsg = "Erro na requisição.") {
  let response;
  try {
    response = await fetch(url, options);
  } catch (err) {
    throw new Error(`Falha de conexão com o servidor (${err.message}). Verifique se o backend está ativo.`);
  }

  const contentType = response.headers.get("content-type") || "";
  const isJson = contentType.toLowerCase().includes("application/json");

  let data = null;
  if (isJson) {
    try {
      data = await response.json();
    } catch {
      data = null;
    }
  } else {
    // Resposta não-JSON (por exemplo página HTML de 404 ou 500 do Next.js / Nginx)
    if (!response.ok) {
      throw new Error(
        `Serviço indisponível ou rota não encontrada (${response.status} ${response.statusText || ""}).`
      );
    }
    throw new Error("O servidor retornou uma resposta em formato inválido (HTML em vez de JSON).");
  }

  if (!response.ok) {
    const errorMsg = data?.error || data?.message || fallbackErrorMsg;
    const error = new Error(errorMsg);
    error.name = "ApiError";
    error.status = response.status;
    error.code = data?.code;
    error.details = data?.details || data?.errors;
    throw error;
  }

  return data;
}

export async function loginUser({ login, password }) {
  const data = await safeFetchJson(`${API_BASE_URL}/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ login, password }),
  }, "Erro ao realizar login.");
  storeAuth(data.token, data.user);
  return data;
}

export async function registerUser({ username, email, password, characterName, characterJob, customClass }) {
  const data = await safeFetchJson(`${API_BASE_URL}/auth/register`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ username, email, password, characterName, characterJob, customClass }),
  }, "Erro ao realizar cadastro.");
  storeAuth(data.token, data.user);
  return data;
}

export async function fetchMe(token = getStoredToken()) {
  if (!token) return null;
  try {
    return await safeFetchJson(`${API_BASE_URL}/auth/me`, {
      headers: authHeaders(token),
    });
  } catch (error) {
    console.warn("Não foi possível verificar a sessão com o backend:", error.message);
    return null;
  }
}

export async function updateProfileOnBackend(profile, token = getStoredToken()) {
  return safeFetchJson(`${API_BASE_URL}/auth/me`, {
    method: "PUT",
    headers: { "Content-Type": "application/json", ...authHeaders(token) },
    body: JSON.stringify(profile),
  }, "Erro ao atualizar o perfil.");
}

export async function logoutUser(token = getStoredToken()) {
  if (!token) return;
  return safeFetchJson(`${API_BASE_URL}/auth/logout`, {
    method: "POST",
    headers: authHeaders(token),
  }, "Erro ao encerrar a sessão.");
}

export async function createCharacterOnBackend(characterData, token = getStoredToken()) {
  return safeFetchJson(`${API_BASE_URL}/characters`, {
    method: "POST",
    headers: { "Content-Type": "application/json", ...authHeaders(token) },
    body: JSON.stringify(characterData),
  }, "Erro ao criar novo personagem.");
}

export async function listCharacters(token = getStoredToken()) {
  const headers = token ? { Authorization: `Bearer ${token}` } : {};
  return safeFetchJson(`${API_BASE_URL}/characters`, { headers }, "Erro ao carregar personagens.");
}

export async function updateCharacterOnBackend(characterId, characterData, token = getStoredToken()) {
  const headers = { "Content-Type": "application/json", ...authHeaders(token) };
  return safeFetchJson(`${API_BASE_URL}/characters/${characterId}`, {
    method: "PUT",
    headers,
    body: JSON.stringify(characterData),
  }, "Erro ao atualizar personagem.");
}

export async function deleteCharacterOnBackend(characterId, token = getStoredToken()) {
  const headers = token ? { Authorization: `Bearer ${token}` } : {};
  return safeFetchJson(`${API_BASE_URL}/characters/${characterId}`, {
    method: "DELETE",
    headers,
  }, "Erro ao excluir personagem.");
}

export async function syncCharacterWithBackend(characterData, token = getStoredToken()) {
  const data = await safeFetchJson(`${API_BASE_URL}/characters/sync`, {
    method: "POST",
    headers: { "Content-Type": "application/json", ...authHeaders(token) },
    body: JSON.stringify(characterData),
  });
  return data?.character || data;
}

export async function fetchCharacterFromBackend(characterId, token = getStoredToken()) {
  try {
    return await safeFetchJson(`${API_BASE_URL}/characters/${characterId}`, {
      headers: authHeaders(token),
    });
  } catch (error) {
    console.warn("Não foi possível buscar do backend:", error.message);
    return null;
  }
}

export async function verifyBankPasswordOnBackend(characterId, password) {
  try {
    const data = await safeFetchJson(`${API_BASE_URL}/characters/${characterId}/bank/verify`, {
      method: "POST",
      headers: { "Content-Type": "application/json", ...authHeaders() },
      body: JSON.stringify({ password }),
    });
    return Boolean(data?.valid);
  } catch (error) {
    console.warn("Validação remota de cofre falhou:", error.message);
    return null;
  }
}

export async function fetchCampaignData(token = getStoredToken()) {
  return safeFetchJson(`${API_BASE_URL}/campanha`, {
    headers: authHeaders(token),
  }, "Erro ao carregar os dados da campanha.");
}

export async function updateCampaignData(campaignData, token = getStoredToken()) {
  return safeFetchJson(`${API_BASE_URL}/campanha`, {
    method: "PUT",
    headers: { "Content-Type": "application/json", ...authHeaders(token) },
    body: JSON.stringify(campaignData),
  }, "Erro ao salvar os dados da campanha.");
}

// ==========================================
// 🛡️ API DA CÂMARA DO MESTRE & CAMPANHAS
// ==========================================

export async function listCampaigns(token = getStoredToken()) {
  return safeFetchJson(`${API_BASE_URL}/campanhas`, {
    headers: authHeaders(token),
  }, "Erro ao listar campanhas.");
}

export async function createCampaign(campaignData, token = getStoredToken()) {
  return safeFetchJson(`${API_BASE_URL}/campanhas`, {
    method: "POST",
    headers: { "Content-Type": "application/json", ...authHeaders(token) },
    body: JSON.stringify(campaignData),
  }, "Erro ao criar campanha.");
}

export async function fetchCampaignById(id, token = getStoredToken()) {
  return safeFetchJson(`${API_BASE_URL}/campanhas/${id}`, {
    headers: authHeaders(token),
  }, "Erro ao carregar detalhes da campanha.");
}

export async function updateCampaignById(id, patch, token = getStoredToken()) {
  return safeFetchJson(`${API_BASE_URL}/campanhas/${id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json", ...authHeaders(token) },
    body: JSON.stringify(patch),
  }, "Erro ao atualizar campanha.");
}

export async function deleteCampaign(id, token = getStoredToken()) {
  return safeFetchJson(`${API_BASE_URL}/campanhas/${id}`, {
    method: "DELETE",
    headers: authHeaders(token),
  }, "Erro ao excluir campanha.");
}

export async function listGameSessions(campanhaId, token = getStoredToken()) {
  return safeFetchJson(`${API_BASE_URL}/campanhas/${campanhaId}/sessoes`, {
    headers: authHeaders(token),
  }, "Erro ao carregar sessões.");
}

export async function createGameSession(campanhaId, sessionData, token = getStoredToken()) {
  return safeFetchJson(`${API_BASE_URL}/campanhas/${campanhaId}/sessoes`, {
    method: "POST",
    headers: { "Content-Type": "application/json", ...authHeaders(token) },
    body: JSON.stringify(sessionData),
  }, "Erro ao criar sessão.");
}

export async function updateGameSession(id, patch, token = getStoredToken()) {
  return safeFetchJson(`${API_BASE_URL}/campanhas/sessoes/${id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json", ...authHeaders(token) },
    body: JSON.stringify(patch),
  }, "Erro ao atualizar sessão.");
}

export async function deleteGameSession(id, token = getStoredToken()) {
  return safeFetchJson(`${API_BASE_URL}/campanhas/sessoes/${id}`, {
    method: "DELETE",
    headers: { "Content-Type": "application/json", ...authHeaders(token) },
    body: JSON.stringify({ confirmacao: true }),
  }, "Erro ao excluir sessão.");
}

export async function joinCampaign(inviteCode, token = getStoredToken()) {
  return safeFetchJson(`${API_BASE_URL}/campanhas/join`, {
    method: "POST",
    headers: { "Content-Type": "application/json", ...authHeaders(token) },
    body: JSON.stringify({ inviteCode }),
  }, "Erro ao entrar na campanha.");
}

export async function listCampaignMembers(campanhaId, token = getStoredToken()) {
  return safeFetchJson(`${API_BASE_URL}/campanhas/${campanhaId}/membros`, {
    headers: authHeaders(token),
  }, "Erro ao carregar membros.");
}

export async function updateCampaignMember(campanhaId, userId, patch, token = getStoredToken()) {
  return safeFetchJson(`${API_BASE_URL}/campanhas/${campanhaId}/membros/${userId}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json", ...authHeaders(token) },
    body: JSON.stringify(patch),
  }, "Erro ao atualizar permissão do membro.");
}

export async function removeCampaignMember(campanhaId, userId, token = getStoredToken()) {
  return safeFetchJson(`${API_BASE_URL}/campanhas/${campanhaId}/membros/${userId}`, {
    method: "DELETE",
    headers: authHeaders(token),
  }, "Erro ao remover membro da campanha.");
}

export async function fetchCampaignAudit(campanhaId, token = getStoredToken()) {
  return safeFetchJson(`${API_BASE_URL}/campanhas/${campanhaId}/auditoria`, {
    headers: authHeaders(token),
  }, "Erro ao carregar auditoria.");
}

// ==========================================
// 👹 CATÁLOGO E GESTÃO DEDICADA DE NPCS
// ==========================================

export async function listNpcs(params = {}, token = getStoredToken()) {
  const query = new URLSearchParams(params).toString();
  const url = `${API_BASE_URL}/npcs${query ? `?${query}` : ""}`;
  return safeFetchJson(url, { headers: authHeaders(token) }, "Erro ao buscar catálogo de NPCs.");
}

export async function createNpc(npcData, token = getStoredToken()) {
  return safeFetchJson(`${API_BASE_URL}/npcs`, {
    method: "POST",
    headers: { "Content-Type": "application/json", ...authHeaders(token) },
    body: JSON.stringify(npcData),
  }, "Erro ao cadastrar NPC.");
}

export async function fetchNpcById(id, token = getStoredToken()) {
  return safeFetchJson(`${API_BASE_URL}/npcs/${id}`, {
    headers: authHeaders(token),
  }, "Erro ao buscar dados do NPC.");
}

export async function updateNpc(id, patch, token = getStoredToken()) {
  return safeFetchJson(`${API_BASE_URL}/npcs/${id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json", ...authHeaders(token) },
    body: JSON.stringify(patch),
  }, "Erro ao atualizar NPC.");
}

export async function duplicateNpc(id, options = {}, token = getStoredToken()) {
  return safeFetchJson(`${API_BASE_URL}/npcs/${id}/duplicar`, {
    method: "POST",
    headers: { "Content-Type": "application/json", ...authHeaders(token) },
    body: JSON.stringify(options),
  }, "Erro ao duplicar NPC.");
}

export async function deleteNpc(id, token = getStoredToken()) {
  return safeFetchJson(`${API_BASE_URL}/npcs/${id}`, {
    method: "DELETE",
    headers: authHeaders(token),
  }, "Erro ao excluir NPC.");
}

// ==========================================
// 📜 NOTAS PÚBLICAS E PRIVADAS
// ==========================================

export async function listCampaignNotes(campanhaId, token = getStoredToken()) {
  return safeFetchJson(`${API_BASE_URL}/campanhas/${campanhaId}/notas`, {
    headers: authHeaders(token),
  }, "Erro ao carregar notas.");
}

export async function createCampaignNote(campanhaId, noteData, token = getStoredToken()) {
  return safeFetchJson(`${API_BASE_URL}/campanhas/${campanhaId}/notas`, {
    method: "POST",
    headers: { "Content-Type": "application/json", ...authHeaders(token) },
    body: JSON.stringify(noteData),
  }, "Erro ao criar nota.");
}

export async function updateCampaignNote(id, patch, token = getStoredToken()) {
  return safeFetchJson(`${API_BASE_URL}/notas/${id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json", ...authHeaders(token) },
    body: JSON.stringify(patch),
  }, "Erro ao atualizar nota.");
}

export async function deleteCampaignNote(id, token = getStoredToken()) {
  return safeFetchJson(`${API_BASE_URL}/notas/${id}`, {
    method: "DELETE",
    headers: authHeaders(token),
  }, "Erro ao remover nota.");
}

// ==========================================
// ⚔️ ENCONTROS TÁTICOS E INICIATIVA
// ==========================================

export async function listEncounters(campanhaId, token = getStoredToken()) {
  return safeFetchJson(`${API_BASE_URL}/campanhas/${campanhaId}/encontros`, {
    headers: authHeaders(token),
  }, "Erro ao carregar encontros.");
}

export async function createEncounter(campanhaId, encounterData, token = getStoredToken()) {
  return safeFetchJson(`${API_BASE_URL}/campanhas/${campanhaId}/encontros`, {
    method: "POST",
    headers: { "Content-Type": "application/json", ...authHeaders(token) },
    body: JSON.stringify(encounterData),
  }, "Erro ao criar encontro.");
}

export async function updateEncounter(id, patch, token = getStoredToken()) {
  return safeFetchJson(`${API_BASE_URL}/encontros/${id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json", ...authHeaders(token) },
    body: JSON.stringify(patch),
  }, "Erro ao atualizar encontro.");
}

export async function deleteEncounter(id, token = getStoredToken()) {
  return safeFetchJson(`${API_BASE_URL}/encontros/${id}`, {
    method: "DELETE",
    headers: authHeaders(token),
  }, "Erro ao remover encontro.");
}

export async function sendInitiativeFromSheet(campanhaId, initiativeData, token = getStoredToken()) {
  return safeFetchJson(`${API_BASE_URL}/campanhas/${campanhaId}/iniciativa/ficha`, {
    method: "POST",
    headers: { "Content-Type": "application/json", ...authHeaders(token) },
    body: JSON.stringify(initiativeData),
  }, "Erro ao sincronizar iniciativa com a mesa.");
}

// ==========================================
// 🗺️ MAPAS TÁTICOS, MARCADORES E REVELAÇÃO
// ==========================================

export async function listMaps(campanhaId, token = getStoredToken()) {
  return safeFetchJson(`${API_BASE_URL}/campanhas/${campanhaId}/mapas`, {
    headers: authHeaders(token),
  }, "Erro ao carregar mapas.");
}

export async function createMap(campanhaId, mapData, token = getStoredToken()) {
  return safeFetchJson(`${API_BASE_URL}/campanhas/${campanhaId}/mapas`, {
    method: "POST",
    headers: { "Content-Type": "application/json", ...authHeaders(token) },
    body: JSON.stringify(mapData),
  }, "Erro ao adicionar mapa.");
}

export async function updateMap(id, patch, token = getStoredToken()) {
  return safeFetchJson(`${API_BASE_URL}/mapas/${id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json", ...authHeaders(token) },
    body: JSON.stringify(patch),
  }, "Erro ao atualizar mapa.");
}

export async function deleteMap(id, token = getStoredToken()) {
  return safeFetchJson(`${API_BASE_URL}/mapas/${id}`, {
    method: "DELETE",
    headers: authHeaders(token),
  }, "Erro ao remover mapa.");
}
