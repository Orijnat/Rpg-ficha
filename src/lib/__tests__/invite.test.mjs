import test from "node:test";
import assert from "node:assert/strict";
import { generateInviteLink, fetchInviteInfo } from "../api.js";

test("Sistema de Convites e Vínculo de Mesa", async (t) => {
  await t.test("1. Deve gerar link de convite canônico com origin ou fallback", () => {
    const link = generateInviteLink("INV-VALE-100", "https://grimorium.rpg.app");
    assert.equal(link, "https://grimorium.rpg.app/convite/INV-VALE-100");

    const linkComBarra = generateInviteLink("abc-123", "https://grimorium.rpg.app/");
    assert.equal(linkComBarra, "https://grimorium.rpg.app/convite/ABC-123");

    assert.equal(generateInviteLink(""), "");
    assert.equal(generateInviteLink(null), "");
  });

  await t.test("2. Deve consultar informações públicas de convite via API", async () => {
    const mockCampaign = {
      valido: true,
      campanha: {
        id: "camp-uuid",
        nome: "Crônicas de Baróvia",
        descricao: "A névoa se aproxima...",
        mestre: "Mestre Supremo",
        codigoConvite: "INV-VALE-100",
      },
    };

    globalThis.fetch = async (url) => {
      assert.ok(url.includes("/campanhas/convite/INV-VALE-100"));
      return {
        ok: true,
        status: 200,
        headers: new Headers({ "content-type": "application/json" }),
        json: async () => mockCampaign,
      };
    };

    const res = await fetchInviteInfo("INV-VALE-100");
    assert.equal(res.valido, true);
    assert.equal(res.campanha.nome, "Crônicas de Baróvia");
    assert.equal(res.campanha.mestre, "Mestre Supremo");
  });

  await t.test("3. Deve retornar null graciosamente quando código for vazio", async () => {
    const res = await fetchInviteInfo("");
    assert.equal(res, null);
  });
});
