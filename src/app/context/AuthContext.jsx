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
  fetchNpcById,
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
          // Perfil/role vêm exclusivamente do servidor — nunca de storage do navegador
          const restoredUser = data.user;

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
          // O mestre pode abrir a ficha completa de um herói OU de um monstro em uma NOVA GUIA.
          // /personagem?inspect=<id>            → herói da campanha (registro compartilhado)
          // /personagem?inspect=<id>&type=npc   → monstro (guia trabalha sobre uma CÓPIA local)
          const inspectParam = window.location?.search
            ? new URLSearchParams(window.location.search).get("inspect")
            : null;
          const inspectType = window.location?.search
            ? new URLSearchParams(window.location.search).get("type")
            : null;

          let inspectFound = inspectParam ? allChars.find((c) => c.id === inspectParam) : null;
          if (inspectParam && inspectType === "npc") {
            try {
              const npc = await fetchNpcById(inspectParam, storedToken);
              if (npc) {
                const attrs = npc.dadosExtras?.attributes ?? {};
                const synthetic = {
                  __npc: true,
                  id: npc.id,
                  nome: npc.nome,
                  name: npc.nome,
                  papel: npc.papel,
                  job: npc.papel,
                  descricao: npc.descricao ?? "",
                  hp: npc.hp,
                  hpMax: npc.hpMax,
                  avatar: npc.avatar ?? npc.dadosExtras?.avatar ?? "",
                  ca: npc.dadosExtras?.ca ?? 10,
                  FOR: attrs.FOR ?? 10,
                  DES: attrs.DES ?? 10,
                  CON: attrs.CON ?? 10,
                  SAB: attrs.SAB ?? 10,
                  ESP: attrs.ESP ?? 10,
                  CAR: attrs.CAR ?? 10,
                  INT: attrs.INT ?? 10,
                  xp: 0,
                  level: 1,
                  userId: `npc:${npc.id}`,
                  abilities: npc.dadosExtras?.abilities ?? [],
                  dadosExtras: {
                    ...(npc.dadosExtras || {}),
                    abilities: npc.dadosExtras?.abilities ?? [],
                  },
                  updatedAt: npc.updatedAt ?? null,
                  owner: { username: "Monstro" },
                  campanhaId: npc.campanhaId ?? null,
                };
                allChars.push(synthetic);
                inspectFound = synthetic;
              }
            } catch (e) {
              console.warn("Falha ao abrir ficha do monstro:", e);
            }
          }

          setCharacters(allChars);

          // Recupera a ficha ativa salva. O mestre NUNCA herda a ficha de um herói de
          // terceiros: para ele, só vale o que é dele (data.characters) ou o ?inspect= explícito.
          // Jogadores comuns só têm os próprios personagens na lista de qualquer forma.
          const ownChars = data.characters || [];
          const savedCharId = window.sessionStorage.getItem("rpg_current_char_id")
            || window.localStorage.getItem("rpg_current_char_id");
          const found = inspectFound ?? ownChars.find((c) => c.id === savedCharId);
          if (found) {
            setActiveCharacterId(found.id);
          } else if (ownChars.length > 0) {
            setActiveCharacterId(ownChars[0].id);
            window.sessionStorage.setItem("rpg_current_char_id", ownChars[0].id);
          } else {
            setActiveCharacterId(null);
            window.sessionStorage.removeItem("rpg_current_char_id");
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

  // Sessão de navegador inteiro: logout em uma guia desconecta as demais.
  useEffect(() => {
    if (typeof window === "undefined") return undefined;
    const handleStorage = (event) => {
      if (event.key !== "rpg_auth_token") return;
      if (event.newValue === null && !getStoredToken()) {
        setUser(null);
        setToken(null);
        setActiveCharacterId(null);
        setCharacters([]);
        router.push("/login");
      }
    };
    window.addEventListener("storage", handleStorage);
    return () => window.removeEventListener("storage", handleStorage);
  }, [router]);

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

    // O mestre nunca é jogado na ficha de um herói de terceiros: seleciona apenas do
    // que é dele (data.characters, retorno do login). Jogadores não têm heróis de terceiros na lista.
    const ownChars = data.characters || [];
    if (ownChars.length > 0) {
      const firstChar = ownChars[0];
      setActiveCharacterId(firstChar.id);
      window.sessionStorage.setItem("rpg_current_char_id", firstChar.id);
    } else {
      setActiveCharacterId(null);
      window.sessionStorage.removeItem("rpg_current_char_id");
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
    } else {
      setActiveCharacterId(null);
      window.sessionStorage.removeItem("rpg_current_char_id");
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

  // Garante que uma ficha retornada pelo backend exista na lista local (sem trocar a seleção ativa)
  const upsertCharacter = (character) => {
    if (!character?.id) return;
    setCharacters((prev) => {
      const exists = prev.some((c) => c.id === character.id);
      if (exists) {
        return prev.map((c) => (c.id === character.id ? { ...c, ...character } : c));
      }
      return [character, ...prev];
    });
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
  const playerCharacters = isMaster ? characters.filter((c) => c.userId !== user?.id && !c.__npc) : [];
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
    upsertCharacter,
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
