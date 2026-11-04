import { NextResponse } from "next/server";
import { signJwt, normalizeProfile } from "../../../../lib/jwt.js";
import { mockUsers, mockCharacters } from "../_store.js";

export async function POST(req) {
  try {
    const body = await req.json();
    const { login, password } = body;

    if (!login || !password) {
      return NextResponse.json(
        { error: "Usuário/E-mail e senha são obrigatórios." },
        { status: 400 }
      );
    }

    const cleanLogin = String(login).trim().toLowerCase();
    const user = mockUsers.find(
      (u) =>
        u.username.toLowerCase() === cleanLogin ||
        u.email.toLowerCase() === cleanLogin
    );

    if (!user) {
      return NextResponse.json(
        { error: "Credenciais inválidas. Verifique o usuário e a senha." },
        { status: 401 }
      );
    }

    // Validação de senha (ou dev pass)
    if (user.password && user.password !== password) {
      return NextResponse.json(
        { error: "Credenciais inválidas. Verifique o usuário e a senha." },
        { status: 401 }
      );
    }

    const profileInfo = normalizeProfile(user.perfil || user.role);
    const token = signJwt(
      {
        id: user.id,
        username: user.username,
        email: user.email,
        perfil: profileInfo.perfil,
        role: profileInfo.role,
      },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );

    const userCharacters = mockCharacters.filter((c) => c.userId === user.id);

    const safeUser = {
      id: user.id,
      username: user.username,
      email: user.email,
      perfil: profileInfo.perfil,
      role: profileInfo.role,
      ativo: user.ativo,
      ultimoLoginAt: new Date().toISOString(),
    };

    return NextResponse.json({
      message: "Login realizado com sucesso!",
      user: safeUser,
      characters: userCharacters,
      token,
    });
  } catch (error) {
    console.error("Erro no login Next.js API:", error);
    return NextResponse.json(
      { error: error.message || "Erro interno ao processar login." },
      { status: 500 }
    );
  }
}
