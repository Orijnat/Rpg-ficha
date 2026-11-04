"use client";

import { createContext, useContext, useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import {
  getStoredToken,
  storeAuth,
  clearAuth,
  loginUser,
  registerUser,
  fetchMe,
  createCharacterOnBackend,
  updateProfileOnBackend,
  logoutUser,
} from "../../lib/api";
import { getUserFromToken, normalizeProfile, isJwtExpired } from "../../lib/jwt";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [characters, setCharacters] = useState([]);
  const [activeCharacterId, setActiveCharacterId] = useState(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  // Verifica a sessão salva ao carregar
  useEffect(() => {
    async function initAuth() {
      const storedToken = getStoredToken();
      if (!storedToken) {
        setLoading(false);
        return;
      }

      setToken(storedToken);

      try {
        const data = await fetchMe(storedToken);
        if (data && data.user) {
          setUser(data.user);
          setCharacters(data.characters || []);

          // Recupera o personagem ativo salvo ou pega o primeiro da lista
          const savedCharId = window.sessionStorage.getItem("rpg_current_char_id")
            || window.localStorage.getItem("rpg_current_char_id");
          const found = (data.characters || []).find((c) => c.id === savedCharId);
          if (found) {
            setActiveCharacterId(found.id);
          } else if (data.characters && data.characters.length > 0) {
            setActiveCharacterId(data.characters[0].id);
            window.sessionStorage.setItem("rpg_current_char_id", data.characters[0].id);
          }
        } else {
          clearAuth();
          setUser(null);
          setToken(null);
        }
      } catch (err) {
        console.error("Falha ao inicializar autenticação:", err);
      } finally {
        setLoading(false);
      }
    }

    initAuth();
  }, []);

  const login = async (identifier, password) => {
    const data = await loginUser({ login: identifier, password });
    setUser(data.user);
    setToken(data.token);
    setCharacters(data.characters || []);

    if (data.characters && data.characters.length > 0) {
      const firstChar = data.characters[0];
      setActiveCharacterId(firstChar.id);
      window.sessionStorage.setItem("rpg_current_char_id", firstChar.id);
    }

    return data;
  };

  const register = async (formData) => {
    const data = await registerUser(formData);
    setUser(data.user);
    setToken(data.token);

    const chars = data.characters || (data.character ? [data.character] : []);
    setCharacters(chars);

    if (chars.length > 0) {
      setActiveCharacterId(chars[0].id);
      window.sessionStorage.setItem("rpg_current_char_id", chars[0].id);
    }

    return data;
  };

  const logout = async () => {
    try {
      await logoutUser(token);
    } catch (error) {
      console.warn("Sessão local encerrada; o servidor não confirmou o logout:", error.message);
    }
    clearAuth();
    setUser(null);
    setToken(null);
    setCharacters([]);
    setActiveCharacterId(null);
    router.push("/login");
  };

  const updateProfile = async (profile) => {
    const response = await updateProfileOnBackend(profile, token);
    const nextUser = response?.user || response;
    if (!nextUser || typeof nextUser !== "object") {
      throw new Error("O servidor não retornou o perfil atualizado.");
    }
    if (response?.token) {
      setToken(response.token);
      storeAuth(response.token, nextUser);
    } else {
      storeAuth(token, nextUser);
    }
    setUser((current) => ({ ...current, ...nextUser }));
    return nextUser;
  };

  const switchProfile = async (targetPerfil) => {
    return await updateProfile({ perfil: targetPerfil });
  };

  const selectCharacter = (characterId) => {
    setActiveCharacterId(characterId);
    if (typeof window !== "undefined") {
      window.sessionStorage.setItem("rpg_current_char_id", characterId);
    }
  };

  const createCharacter = async (charData) => {
    const newChar = await createCharacterOnBackend(charData, token);
    setCharacters((prev) => [newChar, ...prev]);
    selectCharacter(newChar.id);
    return newChar;
  };

  const adoptToken = useCallback(async (nextToken) => {
    if (!nextToken) throw new Error("Token Google ausente.");
    storeAuth(nextToken);
    const data = await fetchMe(nextToken);
    if (!data?.user) {
      clearAuth();
      throw new Error("Não foi possível validar a conta Google.");
    }
    setToken(nextToken);
    setUser(data.user);
    setCharacters(data.characters || []);
    const first = data.characters?.[0];
    if (first) {
      setActiveCharacterId(first.id);
      window.sessionStorage.setItem("rpg_current_char_id", first.id);
    }
    return data;
  }, []);

  const sessionInfo = token ? getUserFromToken(token) : null;
  const profileInfo = normalizeProfile(user?.perfil || user?.role || sessionInfo?.perfil);
  const isMaster = profileInfo.isMaster;
  const isPlayer = profileInfo.isPlayer;
  const activeCharacter = characters.find((c) => c.id === activeCharacterId) || null;

  const value = {
    user,
    token,
    sessionInfo,
    characters,
    activeCharacter,
    activeCharacterId,
    loading,
    isAuthenticated: Boolean(user && token && !sessionInfo?.isExpired),
    isMaster,
    isPlayer,
    profileInfo,
    login,
    register,
    logout,
    selectCharacter,
    createCharacter,
    adoptToken,
    updateProfile,
    switchProfile,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth deve ser usado dentro de um AuthProvider");
  }
  return context;
}
