import { NextResponse } from "next/server";
import { verifyJwt, signJwt, normalizeProfile } from "../../../../lib/jwt.js";
import { mockUsers, mockCharacters } from "../_store.js";

function getBearerToken(req) {
  const authHeader = req.headers.get("authorization");
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return null;
  }
  return authHeader.split(" ")[1];
}

export async function GET(req) {
  try {
    const token = getBearerToken(req);
    if (!token) {
      return NextResponse.json({ error: "Token não fornecido." }, { status: 401 });
    }

    const decoded = verifyJwt(token, process.env.JWT_SECRET);
    const user = mockUsers.find((u) => u.id === decoded.id) || {
      id: decoded.id,
      username: decoded.username || "Aventureiro",
      email: decoded.email || "",
      perfil: decoded.perfil || "jogador",
      role: decoded.role || "player",
      ativo: true,
    };

    const profileInfo = normalizeProfile(user.perfil || user.role);
    const userCharacters = mockCharacters.filter((c) => c.userId === user.id);

    return NextResponse.json({
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        perfil: profileInfo.perfil,
        role: profileInfo.role,
        ativo: user.ativo,
      },
      characters: userCharacters,
      session: {
        sessionId: decoded.sessionId || null,
        issuedAt: decoded.iat ? new Date(decoded.iat * 1000).toISOString() : null,
        expiresAt: decoded.exp ? new Date(decoded.exp * 1000).toISOString() : null,
        role: profileInfo.role,
        perfil: profileInfo.perfil,
        label: profileInfo.label,
      },
    });
  } catch (error) {
    return NextResponse.json(
      { error: error.message || "Sessão inválida ou expirada." },
      { status: 401 }
    );
  }
}

export async function PUT(req) {
  try {
    const token = getBearerToken(req);
    if (!token) {
      return NextResponse.json({ error: "Token não fornecido." }, { status: 401 });
    }

    const decoded = verifyJwt(token, process.env.JWT_SECRET);
    const user = mockUsers.find((u) => u.id === decoded.id);

    const body = await req.json();
    const { username, email, perfil, role } = body;

    const targetUser = user || {
      id: decoded.id,
      username: decoded.username,
      email: decoded.email,
      perfil: decoded.perfil,
      role: decoded.role,
      ativo: true,
    };

    if (username && username.trim()) {
      targetUser.username = username.trim();
    }

    if (email && email.trim()) {
      targetUser.email = email.trim().toLowerCase();
    }

    const targetPerfil = perfil || (role === "master" ? "mestre" : role === "player" ? "jogador" : null);
    if (targetPerfil) {
      const profileInfo = normalizeProfile(targetPerfil);
      targetUser.perfil = profileInfo.perfil;
      targetUser.role = profileInfo.role;
    }

    targetUser.updatedAt = new Date().toISOString();

    const finalProfile = normalizeProfile(targetUser.perfil || targetUser.role);

    // Emissão de novo token JWT atualizado com os novos dados de sessão e perfil
    const newToken = signJwt(
      {
        id: targetUser.id,
        username: targetUser.username,
        email: targetUser.email,
        perfil: finalProfile.perfil,
        role: finalProfile.role,
      },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );

    return NextResponse.json({
      message: "Perfil atualizado com sucesso!",
      user: {
        id: targetUser.id,
        username: targetUser.username,
        email: targetUser.email,
        perfil: finalProfile.perfil,
        role: finalProfile.role,
        ativo: targetUser.ativo,
      },
      token: newToken,
    });
  } catch (error) {
    return NextResponse.json(
      { error: error.message || "Erro ao atualizar perfil." },
      { status: 400 }
    );
  }
}
