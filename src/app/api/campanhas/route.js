import { NextResponse } from "next/server";
import { authenticateRequest, requireMaster } from "../../../lib/server-auth.js";

let mockCampaigns = [
  {
    id: "camp-1",
    nome: "A Queda do Forte Cinzento",
    descricao: "Investigação dos mistérios que rondam o forte nas montanhas do norte.",
    estado: "ativa",
    codigoConvite: "INV-FORTE-77",
    mestreId: "usr-master-1",
    membros: [
      { userId: "user-1", nome: "Mestre cledi", papel: "mestre", status: "aprovado" },
      { userId: "user-2", nome: "Thorne Valerius", papel: "jogador", status: "aprovado" },
    ],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
];

export async function GET(req) {
  try {
    const user = authenticateRequest(req);
    const campaigns = user.isMaster
      ? mockCampaigns.filter((campaign) => campaign.mestreId === user.id)
      : mockCampaigns.filter((campaign) => campaign.membros.some((member) => member.userId === user.id));
    return NextResponse.json(campaigns);
  } catch (error) {
    return NextResponse.json({ error: error.message || "Não autorizado." }, { status: 401 });
  }
}

export async function POST(req) {
  try {
    const user = requireMaster(req);
    const body = await req.json();
    const newCamp = {
      id: `camp-${Date.now()}`,
      nome: body.nome || "Nova Campanha",
      descricao: body.descricao || "",
      estado: body.estado || "planejamento",
      codigoConvite: `INV-${Math.random().toString(36).substring(2, 7).toUpperCase()}`,
      mestreId: user.id,
      membros: [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    mockCampaigns.unshift(newCamp);
    return NextResponse.json(newCamp, { status: 201 });
  } catch (error) {
    const status = error.message.includes("mestre") ? 403 : 401;
    return NextResponse.json({ error: error.message || "Erro ao criar campanha." }, { status });
  }
}
