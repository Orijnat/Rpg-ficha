import test from "node:test";
import assert from "node:assert/strict";
import { THEMES } from "../themes.js";

test("Validação dos 5 temas de RPG", () => {
  console.log("🧪 Iniciando testes de validação dos 5 Temas de RPG...");

  assert.equal(THEMES.length, 5, "Devem existir exatamente 5 temas configurados");

  const expectedThemes = [
    { id: "amber", name: "Âmbar Vulcânico", accent: "#d69a3d" },
    { id: "abyss", name: "Cripta Abissal", accent: "#a855f7" },
    { id: "forest", name: "Floresta Ancestral", accent: "#10b981" },
    { id: "crimson", name: "Sangue Carmesim", accent: "#ef4444" },
    { id: "frost", name: "Gelo Eterno", accent: "#06b6d4" },
  ];

  expectedThemes.forEach((expected, index) => {
    const theme = THEMES[index];
    assert.equal(theme.id, expected.id, `ID do tema ${index} deve ser ${expected.id}`);
    assert.equal(theme.name, expected.name, `Nome do tema ${index} deve ser ${expected.name}`);
    assert.equal(theme.accent, expected.accent, `Accent do tema ${index} deve ser ${expected.accent}`);
    assert.ok(theme.description, `Tema ${theme.id} deve conter descrição`);
    assert.ok(Array.isArray(theme.previewColors) && theme.previewColors.length >= 3, `Tema ${theme.id} deve conter paleta de preview`);
    console.log(`  ✅ PASS: Tema "${theme.name}" (${theme.id}) validado com sucesso!`);
  });

  console.log("========================================");
  console.log("🎉 Todos os 5 temas de RPG estão consistentes e válidos!");
});
