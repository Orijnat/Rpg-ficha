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
} from "../../lib/api";

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
          const savedCharId = localStorage.getItem("rpg_current_char_id");
          const found = (data.characters || []).find((c) => c.id === savedCharId);
          if (found) {
            setActiveCharacterId(found.id);
          } else if (data.characters && data.characters.length > 0) {
            setActiveCharacterId(data.characters[0].id);
            localStorage.setItem("rpg_current_char_id", data.characters[0].id);
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
      localStorage.setItem("rpg_current_char_id", firstChar.id);
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
      localStorage.setItem("rpg_current_char_id", chars[0].id);
    }

    return data;
  };

  const logout = () => {
    clearAuth();
    setUser(null);
    setToken(null);
    setCharacters([]);
    setActiveCharacterId(null);
    router.push("/login");
  };

  const selectCharacter = (characterId) => {
    setActiveCharacterId(characterId);
    if (typeof window !== "undefined") {
      localStorage.setItem("rpg_current_char_id", characterId);
    }
  };

  const createCharacter = async (charData) => {
    const newChar = await createCharacterOnBackend(charData, token);
    setCharacters((prev) => [newChar, ...prev]);
    selectCharacter(newChar.id);
    return newChar;
  };

  const activeCharacter = characters.find((c) => c.id === activeCharacterId) || null;
  const isMaster = user?.role === "master";
  const isPlayer = user?.role === "player";

  const value = {
    user,
    token,
    characters,
    activeCharacter,
    activeCharacterId,
    loading,
    isAuthenticated: Boolean(user && token),
    isMaster,
    isPlayer,
    login,
    register,
    logout,
    selectCharacter,
    createCharacter,
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
