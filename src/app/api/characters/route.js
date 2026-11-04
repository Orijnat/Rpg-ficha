import { NextResponse } from "next/server";

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

export async function GET() {
  return NextResponse.json(mockCharacters);
}

export async function POST(req) {
  try {
    const body = await req.json();
    const newChar = {
      id: `char-${Date.now()}`,
      name: body.name || "Novo Personagem",
      job: body.job || "Aventureiro",
      level: Number(body.level) || 1,
      hp: Number(body.hp) || 10,
      hpMax: Number(body.hpMax) || 10,
      updatedAt: new Date().toISOString(),
    };
    mockCharacters.unshift(newChar);
    return NextResponse.json(newChar, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: error.message || "Erro ao processar criação de personagem." }, { status: 400 });
  }
}
