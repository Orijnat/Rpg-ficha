import { NextResponse } from "next/server";

let mockCampaigns = [
  {
    id: "camp-1",
    nome: "A Queda do Forte Cinzento",
    descricao: "Investigação dos mistérios que rondam o forte nas montanhas do norte.",
    estado: "ativa",
    codigoConvite: "INV-FORTE-77",
    mestreId: "user-1",
    membros: [
      { userId: "user-1", nome: "Mestre cledi", papel: "mestre", status: "aprovado" },
      { userId: "user-2", nome: "Thorne Valerius", papel: "jogador", status: "aprovado" },
    ],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
];

export async function GET() {
  return NextResponse.json(mockCampaigns);
}

export async function POST(req) {
  try {
    const body = await req.json();
    const newCamp = {
      id: `camp-${Date.now()}`,
      nome: body.nome || "Nova Campanha",
      descricao: body.descricao || "",
      estado: body.estado || "planejamento",
      codigoConvite: `INV-${Math.random().toString(36).substring(2, 7).toUpperCase()}`,
      mestreId: "user-current",
      membros: [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    mockCampaigns.unshift(newCamp);
    return NextResponse.json(newCamp, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: error.message || "Erro ao criar campanha." }, { status: 400 });
  }
}
