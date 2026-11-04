import { NextResponse } from "next/server";
import { signJwt, normalizeProfile } from "../../../../lib/jwt.js";
import { mockUsers, mockCharacters } from "../_store.js";

export async function POST(req) {
  try {
    const body = await req.json();
    const { username, email, password, characterName, characterJob, customClass, perfil } = body;

    if (!username || !email || !password) {
      return NextResponse.json(
        { error: "Nome de usuário, e-mail e senha são obrigatórios." },
        { status: 400 }
      );
    }

    if (password.length < 6) {
      return NextResponse.json(
        { error: "A senha deve ter pelo menos 6 caracteres." },
        { status: 400 }
      );
    }

    const cleanUsername = String(username).trim();
    const cleanEmail = String(email).trim().toLowerCase();

    const existing = mockUsers.find(
      (u) =>
        u.username.toLowerCase() === cleanUsername.toLowerCase() ||
        u.email.toLowerCase() === cleanEmail
    );

    if (existing) {
      if (existing.username.toLowerCase() === cleanUsername.toLowerCase()) {
        return NextResponse.json({ error: "Este nome de usuário já está em uso." }, { status: 409 });
      }
      return NextResponse.json({ error: "Este e-mail já está cadastrado." }, { status: 409 });
    }

    const profileInfo = normalizeProfile(perfil || "jogador");

    const newUser = {
      id: `usr-${Date.now()}`,
      username: cleanUsername,
      email: cleanEmail,
      password,
      perfil: profileInfo.perfil,
      role: profileInfo.role,
      ativo: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    mockUsers.push(newUser);

    const initialCharacter = {
      id: `char-${Date.now()}`,
      userId: newUser.id,
      name: characterName && characterName.trim() ? characterName.trim() : "Novo Herói",
      job: characterJob && characterJob.trim() ? characterJob.trim() : "Aventureiro",
      customClass: customClass?.trim() || "",
      hp: 70,
      hpMax: 70,
      level: 1,
      updatedAt: new Date().toISOString(),
    };
    mockCharacters.unshift(initialCharacter);

    const token = signJwt(
      {
        id: newUser.id,
        username: newUser.username,
        email: newUser.email,
        perfil: profileInfo.perfil,
        role: profileInfo.role,
      },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );

    const safeUser = {
      id: newUser.id,
      username: newUser.username,
      email: newUser.email,
      perfil: profileInfo.perfil,
      role: profileInfo.role,
      ativo: true,
    };

    return NextResponse.json(
      {
        message: "Usuário e personagem criados com sucesso!",
        user: safeUser,
        character: initialCharacter,
        characters: [initialCharacter],
        token,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Erro no registro Next.js API:", error);
    return NextResponse.json(
      { error: error.message || "Erro interno ao cadastrar." },
      { status: 500 }
    );
  }
}
