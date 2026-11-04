import { NextResponse } from "next/server";
import { requireMaster } from "../../../lib/server-auth.js";

let mockNpcs = [
  {
    id: "npc-1",
    nome: "Capitão dos Guardas",
    papel: "Defensor da Cidade",
    hp: 45,
    hpMax: 45,
    dadosExtras: {
      ca: 16,
      iniciativa: 2,
      attitude: "Neutro",
      status: "Ativo",
      tags: ["Guarda", "Humanoide"],
      lastModifiedAt: new Date().toISOString(),
    },
    updatedAt: new Date().toISOString(),
  },
  {
    id: "npc-2",
    nome: "Cultista das Sombras",
    papel: "Conjurador Fanático",
    hp: 22,
    hpMax: 22,
    dadosExtras: {
      ca: 12,
      iniciativa: 3,
      attitude: "Hostil",
      status: "Ativo",
      tags: ["Cultista", "Mágico"],
      lastModifiedAt: new Date().toISOString(),
    },
    updatedAt: new Date().toISOString(),
  },
];

export async function GET(req) {
  try {
    requireMaster(req);
    return NextResponse.json(mockNpcs);
  } catch (error) {
    return NextResponse.json({ error: error.message || "Não autorizado." }, { status: error.message.includes("mestre") ? 403 : 401 });
  }
}

export async function POST(req) {
  try {
    const user = requireMaster(req);
    const body = await req.json();
    const newNpc = {
      id: `npc-${Date.now()}`,
      mestreId: user.id,
      nome: body.nome || "Novo NPC",
      papel: body.papel || "Inimigo",
      hp: Number(body.hp) || 10,
      hpMax: Number(body.hpMax) || 10,
      dadosExtras: {
        ca: Number(body.ca || body.dadosExtras?.ca) || 10,
        iniciativa: Number(body.iniciativa || body.dadosExtras?.iniciativa) || 0,
        attitude: body.attitude || body.dadosExtras?.attitude || "Hostil",
        status: body.status || body.dadosExtras?.status || "Ativo",
        tags: Array.isArray(body.tags) ? body.tags : Array.isArray(body.dadosExtras?.tags) ? body.dadosExtras.tags : [],
        avatar: body.avatar || body.dadosExtras?.avatar || "",
        lastModifiedAt: new Date().toISOString(),
      },
      updatedAt: new Date().toISOString(),
    };
    mockNpcs.unshift(newNpc);
    return NextResponse.json(newNpc, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: error.message || "Erro ao cadastrar NPC." }, { status: error.message.includes("mestre") ? 403 : 401 });
  }
}
