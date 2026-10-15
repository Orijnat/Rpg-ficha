/**
 * Cliente HTTP para comunicação com o backend desacoplado (Rpg-backend)
 * Mantido por: @backend-database
 */

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:3333/api";

export async function syncCharacterWithBackend(characterData) {
  try {
    const response = await fetch(`${API_BASE_URL}/characters/sync`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
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
