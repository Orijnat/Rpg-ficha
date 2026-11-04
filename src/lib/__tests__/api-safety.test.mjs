import test from "node:test";
import assert from "node:assert/strict";
import { safeFetchJson } from "../api.js";

test("API Safety & Proteção contra HTML Unexpected Token", async (t) => {
  await t.test("1. Deve rejeitar graciosamente respostas HTML (<!DOCTYPE html>) sem estourar JSON.parse", async () => {
    // Simula resposta HTML do Next.js / Nginx (ex: 404 Not Found)
    const mockHtmlResponse = {
      ok: false,
      status: 404,
      statusText: "Not Found",
      headers: new Headers({ "content-type": "text/html; charset=utf-8" }),
      text: async () => "<!DOCTYPE html><html><body><h1>404 Not Found</h1></body></html>",
      json: async () => {
        throw new SyntaxError("Unexpected token '<', \"<!DOCTYPE \"... is not valid JSON");
      },
    };

    // Injeta fetch mock
    globalThis.fetch = async () => mockHtmlResponse;

    await assert.rejects(
      async () => {
        await safeFetchJson("http://localhost:3000/api/inexistente");
      },
      (err) => {
        // NÃO deve conter o erro cru de parse HTML:
        assert.ok(!err.message.includes("Unexpected token '<'"));
        // Deve conter a mensagem segura amigável:
        assert.ok(err.message.includes("404") || err.message.includes("indisponível"));
        return true;
      }
    );
  });

  await t.test("2. Deve processar corretamente respostas JSON válidas", async () => {
    const mockData = { id: "char-123", nome: "Valerius" };
    const mockJsonResponse = {
      ok: true,
      status: 200,
      headers: new Headers({ "content-type": "application/json" }),
      json: async () => mockData,
    };

    globalThis.fetch = async () => mockJsonResponse;

    const result = await safeFetchJson("http://localhost:3000/api/characters");
    assert.deepEqual(result, mockData);
  });

  await t.test("3. Deve extrair mensagem de erro amigável em respostas de erro JSON", async () => {
    const mockErrorResponse = {
      ok: false,
      status: 400,
      headers: new Headers({ "content-type": "application/json" }),
      json: async () => ({ error: "Nome do personagem é obrigatório." }),
    };

    globalThis.fetch = async () => mockErrorResponse;

    await assert.rejects(
      async () => {
        await safeFetchJson("http://localhost:3000/api/characters");
      },
      (err) => {
        assert.equal(err.message, "Nome do personagem é obrigatório.");
        return true;
      }
    );
  });
});
