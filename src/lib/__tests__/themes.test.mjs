import test from "node:test";
import assert from "node:assert/strict";
import { THEMES } from "../themes.js";

test("Validação dos temas de RPG (Escuros e Claros)", () => {
  assert.ok(THEMES.length >= 6, "Devem existir pelo menos 6 temas configurados");

  const expectedThemes = [
    { id: "amber", name: "Âmbar Vulcânico", accent: "#d89b38", type: "dark" },
    { id: "abyss", name: "Cripta Abissal", accent: "#a855f7", type: "dark" },
    { id: "forest", name: "Floresta Ancestral", accent: "#10b981", type: "dark" },
    { id: "parchment", name: "Pergaminho Antigo", accent: "#8a5a0d", type: "light" },
    { id: "sunlight", name: "Catedral da Luz", accent: "#8a5a06", type: "light" },
    { id: "mist", name: "Névoa de Avalon", accent: "#0b6e66", type: "light" },
  ];

  expectedThemes.forEach((expected) => {
    const theme = THEMES.find((t) => t.id === expected.id);
    assert.ok(theme, `Tema "${expected.id}" deve existir na lista`);
    assert.equal(theme.name, expected.name, `Nome do tema ${expected.id}`);
    assert.equal(theme.accent, expected.accent, `Accent do tema ${expected.id}`);
    assert.equal(theme.type, expected.type, `Tipo (claro/escuro) do tema ${expected.id}`);
    assert.ok(theme.description, `Tema ${theme.id} deve conter descrição`);
    assert.ok(Array.isArray(theme.previewColors) && theme.previewColors.length >= 3, `Tema ${theme.id} deve conter paleta de preview`);
  });

  // Toda tag dark/light deve estar alinhada ao tipo declarado
  THEMES.forEach((theme) => {
    assert.ok(theme.tag === "Escuro" || theme.tag === "Claro", `Tag inválida em ${theme.id}`);
    assert.equal(theme.tag === "Escuro", theme.type === "dark", `Tag e tipo divergentes em ${theme.id}`);
  });
});
