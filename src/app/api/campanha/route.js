import { NextResponse } from "next/server";

let currentCampaignData = {
  sessionTitle: "A Fortaleza dos Ventos Gélidos",
  sessionNotes: "O grupo deve desbravar a muralha externa antes da nevasca cair.",
  combatRound: 1,
  activeTurnIndex: 0,
  initiative: [],
  npcs: [
    { id: "npc-1", name: "Capitão dos Guardas", role: "Defensor", hp: 45, hpMax: 45 },
  ],
};

export async function GET() {
  return NextResponse.json(currentCampaignData);
}

export async function PUT(req) {
  try {
    const body = await req.json();
    currentCampaignData = { ...currentCampaignData, ...body };
    return NextResponse.json(currentCampaignData);
  } catch (error) {
    return NextResponse.json({ error: error.message || "Erro ao atualizar dados da mesa." }, { status: 400 });
  }
}
