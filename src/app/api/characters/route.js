import { NextResponse } from "next/server";
import { authenticateRequest } from "../../../lib/server-auth.js";

// Fallback in-memory quando o backend externo estiver desconectado
let mockCharacters = [
  {
    id: "char-1",
    name: "Thorne Valerius",
    job: "Guerreiro Arcano",
    level: 3,
    hp: 28,
    hpMax: 28,
    FOR: 16,
    DES: 14,
    CON: 14,
    INT: 12,
    SAB: 10,
    CAR: 10,
    ESP: 8,
    updatedAt: new Date().toISOString(),
  },
  {
    id: "char-2",
    name: "Lyra Sombralluna",
    job: "Ladina Infiltradora",
    level: 3,
    hp: 20,
    hpMax: 20,
    FOR: 10,
    DES: 18,
    CON: 12,
    INT: 14,
    SAB: 12,
    CAR: 14,
    ESP: 10,
    updatedAt: new Date().toISOString(),
  },
];

export async function GET(req) {
  try {
    const user = authenticateRequest(req);
    const characters = user.isMaster
      ? mockCharacters
      : mockCharacters.filter((character) => character.userId === user.id);
    return NextResponse.json(characters);
  } catch (error) {
    return NextResponse.json({ error: error.message || "Não autorizado." }, { status: 401 });
  }
}

export async function POST(req) {
  try {
    const user = authenticateRequest(req);
    const body = await req.json();
    const newChar = {
      id: `char-${Date.now()}`,
      userId: user.isMaster && body.userId ? String(body.userId) : user.id,
      name: typeof body.name === "string" && body.name.trim() ? body.name.trim() : "Novo Personagem",
      job: body.job || "Aventureiro",
      level: Number(body.level) || 1,
      hp: Number(body.hp) || 10,
      hpMax: Number(body.hpMax) || 10,
      updatedAt: new Date().toISOString(),
    };
    mockCharacters.unshift(newChar);
    return NextResponse.json(newChar, { status: 201 });
  } catch (error) {
    const status = error.message === "Token não fornecido." || error.message.includes("token") || error.message.includes("Sessão")
      ? 401
      : error.message.includes("mestre")
        ? 403
        : 400;
    return NextResponse.json({ error: error.message || "Erro ao processar criação de personagem." }, { status });
  }
}
