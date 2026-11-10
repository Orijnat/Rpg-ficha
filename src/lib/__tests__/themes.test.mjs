import test from "node:test";
import assert from "node:assert/strict";
import { THEMES } from "../themes.js";

test("Validação dos temas de RPG (Escuros e Claros)", () => {
  console.log("🧪 Iniciando testes de validação dos Temas de RPG...");

  assert.ok(THEMES.length >= 7, "Devem existir pelo menos 7 temas configurados (incluindo temas claros)");

  const expectedThemes = [
    { id: "amber", name: "Âmbar Vulcânico", accent: "#d69a3d" },
    { id: "abyss", name: "Cripta Abissal", accent: "#a855f7" },
    { id: "forest", name: "Floresta Ancestral", accent: "#10b981" },
    { id: "crimson", name: "Sangue Carmesim", accent: "#ef4444" },
    { id: "frost", name: "Gelo Eterno", accent: "#06b6d4" },
    { id: "parchment", name: "Pergaminho Antigo", accent: "#b47018" },
    { id: "sunlight", name: "Catedral da Luz", accent: "#c4841d" },
  ];

  expectedThemes.forEach((expected) => {
    const theme = THEMES.find((t) => t.id === expected.id);
    assert.ok(theme, `Tema "${expected.id}" deve existir na lista`);
    assert.equal(theme.name, expected.name, `Nome do tema ${expected.id} deve ser ${expected.name}`);
    assert.equal(theme.accent, expected.accent, `Accent do tema ${expected.id} deve ser ${expected.accent}`);
    assert.ok(theme.description, `Tema ${theme.id} deve conter descrição`);
    assert.ok(Array.isArray(theme.previewColors) && theme.previewColors.length >= 3, `Tema ${theme.id} deve conter paleta de preview`);
    console.log(`  ✅ PASS: Tema "${theme.name}" (${theme.id}) validado com sucesso!`);
  });

  console.log("========================================");
  console.log("🎉 Todos os temas de RPG (escuros e claros) estão consistentes e válidos!");
});
