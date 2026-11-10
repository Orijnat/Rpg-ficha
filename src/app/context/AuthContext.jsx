"use client";

import { createContext, useContext, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  getStoredToken,
  storeAuth,
  clearAuth,
  loginUser,
  registerUser,
  fetchMe,
  fetchCharacterFromBackend,
  listCharacters,
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
          let restoredUser = data.user;
          try {
            const rawStoredUser = window.sessionStorage.getItem("rpg_auth_user");
            if (rawStoredUser) {
              const parsed = JSON.parse(rawStoredUser);
              if (parsed?.perfil === "mestre" || parsed?.role === "master") {
                restoredUser = { ...restoredUser, perfil: "mestre", role: "master" };
              }
            }
          } catch {
            // Ignora erro de storage
          }

          setUser(restoredUser);
          let allChars = data.characters || [];
          const isMasterUser = restoredUser?.perfil === "mestre" || restoredUser?.role === "master";
          if (isMasterUser) {
            try {
              const campaignChars = await listCharacters(storedToken);
              if (Array.isArray(campaignChars)) {
                campaignChars.forEach((cc) => {
                  if (!allChars.some((c) => c.id === cc.id)) {
                    allChars.push(cc);
                  }
                });
              }
            } catch (e) {
              console.warn("Falha ao carregar heróis das campanhas para o mestre:", e);
            }
          }
          setCharacters(allChars);

          // Recupera o personagem ativo salvo ou pega o primeiro da lista
          const savedCharId = window.sessionStorage.getItem("rpg_current_char_id")
            || window.localStorage.getItem("rpg_current_char_id");
          const found = allChars.find((c) => c.id === savedCharId);
          if (found) {
            setActiveCharacterId(found.id);
          } else if (allChars.length > 0) {
            setActiveCharacterId(allChars[0].id);
            window.sessionStorage.setItem("rpg_current_char_id", allChars[0].id);
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

    let allChars = data.characters || [];
    const isMasterUser = data.user?.perfil === "mestre" || data.user?.role === "master";
    if (isMasterUser) {
      try {
        const campaignChars = await listCharacters(data.token);
        if (Array.isArray(campaignChars)) {
          campaignChars.forEach((cc) => {
            if (!allChars.some((c) => c.id === cc.id)) {
              allChars.push(cc);
            }
          });
        }
      } catch (e) {
        console.warn("Falha ao carregar heróis pós-login:", e);
      }
    }
    setCharacters(allChars);

    if (allChars.length > 0) {
      const firstChar = allChars[0];
      setActiveCharacterId(firstChar.id);
      window.sessionStorage.setItem("rpg_current_char_id", firstChar.id);
    }

    return data;
  };

  const register = async (formData) => {
    const data = await registerUser(formData);
    const wantsMaster = formData?.perfil === "mestre" || formData?.role === "master";

    let finalUser = data.user || {};
    let finalToken = data.token;

    if (wantsMaster) {
      finalUser = {
        ...finalUser,
        perfil: "mestre",
        role: "master",
      };

      // Tenta sincronizar a alteração de perfil com o backend caso o endpoint inicial tenha usado default
      try {
        const updateRes = await updateProfileOnBackend({ perfil: "mestre", role: "master" }, finalToken);
        if (updateRes?.user) finalUser = { ...finalUser, ...updateRes.user };
        if (updateRes?.token) finalToken = updateRes.token;
      } catch (err) {
        console.warn("Sincronização complementar de perfil de mestre pós-registro:", err?.message || err);
      }

      storeAuth(finalToken, finalUser);
    }

    setUser(finalUser);
    setToken(finalToken);

    const chars = data.characters || (data.character ? [data.character] : []);
    setCharacters(chars);

    if (chars.length > 0) {
      setActiveCharacterId(chars[0].id);
      window.sessionStorage.setItem("rpg_current_char_id", chars[0].id);
    }

    return { ...data, user: finalUser, token: finalToken };
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

  const inspectCharacter = async (characterId, redirectToSheet = true) => {
    try {
      let fullChar = await fetchCharacterFromBackend(characterId, token);
      if (!fullChar) {
        fullChar = characters.find((c) => c.id === characterId);
      }
      if (fullChar) {
        setCharacters((prev) => {
          const exists = prev.some((c) => c.id === fullChar.id);
          if (exists) {
            return prev.map((c) => (c.id === fullChar.id ? { ...c, ...fullChar } : c));
          }
          return [fullChar, ...prev];
        });
        setActiveCharacterId(fullChar.id);
        if (typeof window !== "undefined") {
          window.sessionStorage.setItem("rpg_current_char_id", fullChar.id);
        }
        if (redirectToSheet) {
          router.push("/personagem");
        }
        return fullChar;
      }
    } catch (err) {
      console.error("Falha ao inspecionar personagem:", err);
    }
  };

  const stopInspecting = () => {
    const myChar = characters.find((c) => c.userId === user?.id);
    if (myChar) {
      setActiveCharacterId(myChar.id);
      if (typeof window !== "undefined") {
        window.sessionStorage.setItem("rpg_current_char_id", myChar.id);
      }
    } else {
      setActiveCharacterId(null);
      if (typeof window !== "undefined") {
        window.sessionStorage.removeItem("rpg_current_char_id");
      }
    }
    router.push("/admin");
  };

  const createCharacter = async (charData) => {
    const newChar = await createCharacterOnBackend(charData, token);
    setCharacters((prev) => [newChar, ...prev]);
    selectCharacter(newChar.id);
    return newChar;
  };

  const sessionInfo = token ? getUserFromToken(token) : null;
  const profileInfo = normalizeProfile(user?.perfil || user?.role || sessionInfo?.perfil);
  const isMaster = profileInfo.isMaster;
  const isPlayer = profileInfo.isPlayer;
  const activeCharacter = characters.find((c) => c.id === activeCharacterId) || null;
  const playerCharacters = isMaster ? characters.filter((c) => c.userId !== user?.id) : [];
  const isInspecting = Boolean(isMaster && activeCharacter && activeCharacter.userId !== user?.id);

  const value = {
    user,
    token,
    sessionInfo,
    characters,
    playerCharacters,
    activeCharacter,
    activeCharacterId,
    loading,
    isAuthenticated: Boolean(user && token && !sessionInfo?.isExpired),
    isMaster,
    isPlayer,
    isInspecting,
    profileInfo,
    login,
    register,
    logout,
    selectCharacter,
    inspectCharacter,
    stopInspecting,
    createCharacter,
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
