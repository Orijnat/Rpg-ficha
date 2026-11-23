import test from "node:test";
import assert from "node:assert/strict";
import { THEMES } from "../themes.js";

test("Validação dos temas de RPG (Escuros e Claros)", () => {
  assert.ok(THEMES.length >= 7, "Devem existir pelo menos 7 temas configurados");

  const expectedThemes = [
    { id: "codex", name: "Forja Astral", accent: "#63c9b8", type: "dark" },
    { id: "amber", name: "Âmbar Vulcânico", accent: "#d89b38", type: "dark" },
    { id: "abyss", name: "Cripta Abissal", accent: "#b05cf9", type: "dark" },
    { id: "bloodmoon", name: "Lua de Sangue", accent: "#d53c25", type: "dark" },
    { id: "frostfall", name: "Gelo Eterno", accent: "#38bdf8", type: "dark" },
    { id: "aurora", name: "Aurora Rubra", accent: "#b91c1c", type: "light" },
    { id: "sapphire", name: "Safira Real", accent: "#1d4ed8", type: "light" },
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

  // Apenas os temas suportados permanecem (sem forest/parchment/sunlight/mist/crimson/frost)
  const removed = ["forest", "parchment", "sunlight", "mist", "crimson", "frost", "jade", "felflame"];
  removed.forEach((id) => {
    assert.equal(THEMES.some((t) => t.id === id), false, `Tema removido "${id}" não deve existir`);
  });
});
