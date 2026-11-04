import { NextResponse } from "next/server";

export async function POST(req) {
  try {
    const authHeader = req.headers.get("authorization");
    const hasToken = Boolean(authHeader && authHeader.startsWith("Bearer "));

    return NextResponse.json({
      message: "Sessão encerrada com sucesso.",
      revoked: hasToken,
      loggedOutAt: new Date().toISOString(),
    });
  } catch (error) {
    return NextResponse.json(
      { error: error.message || "Erro ao encerrar sessão." },
      { status: 500 }
    );
  }
}
