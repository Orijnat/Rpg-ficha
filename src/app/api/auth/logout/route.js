import { NextResponse } from "next/server";
import { authenticateRequest } from "../../../../lib/server-auth.js";

export async function POST(req) {
  try {
    authenticateRequest(req);

    return NextResponse.json({
      message: "Sessão encerrada com sucesso.",
      revoked: true,
      loggedOutAt: new Date().toISOString(),
    });
  } catch (error) {
    return NextResponse.json(
      { error: error.message || "Erro ao encerrar sessão." },
      { status: 401 }
    );
  }
}
