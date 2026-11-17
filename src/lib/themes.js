/**
 * Catálogo Oficial de Temas do Grimorium RPG
 * Harmonias cromáticas inspiradas nos padrões do Adobe Color (https://color.adobe.com/br/):
 * - 6 Temas Escuros:
 *   1. amber (Âmbar Vulcânico) -> Complementar Dividida Quente (Ouro Âmbar + Ametista Real + Fogo Vulcânico)
 *   2. abyss (Cripta Abissal)  -> Análoga Fria (Púrpura Místico + Azul Noturno + Ciano Rúnico)
 *   3. bloodmoon (Lua de Sangue) -> Complementar Quente (Brasa Rubra + Âmbar Torrado)
 *   4. frostfall (Gelo Eterno) -> Análoga Fria (Ciano Gelo + Azul Noturno)
 * - 2 Temas Claros (botões de ação em tons mais claros do mesmo matiz):
 *   5. aurora (Aurora Rubra)   -> Complementar Quente (Tijolo de Sangue + Marfim Rosado)
 *   6. sapphire (Safira Real)  -> Complementar Régia (Azul de Luva + Marfim Prateado)
 *
 * Todos os temas atendem aos padrões de contraste WCAG AA/AAA.
 */

export const LEGACY_THEME_MAP = {
  crimson: "amber",
  frost: "frostfall",
  forest: "amber",
  parchment: "aurora",
  sunlight: "sapphire",
  mist: "sapphire",
};

export const THEMES = [
  // ── TEMAS ESCUROS ──
  {
    id: "amber",
    name: "Âmbar Vulcânico",
    subtitle: "Forjas & Alquimia",
    description: "Tons de ouro fundido, bronze e carvão forjados nas entranhas da montanha.",
    accent: "#d89b38",
    bg: "#090b0e",
    titleColor: "#fbf3e6",
    subtitleColor: "#bfa47d",
    tag: "Escuro",
    type: "dark",
    harmony: "Complementar Dividida",
    harmonyFamily: "Adobe Color: Split-Complementary Warm",
    contrastRatio: "8.8:1 (WCAG AAA)",
    previewColors: ["#090b0e", "#d89b38", "#fbf3e6"],
    iconName: "Flame",
  },
  {
    id: "abyss",
    name: "Cripta Abissal",
    subtitle: "Sombra & Runas Arcanas",
    description: "Névoa púrpura, runas espectrais e mistérios sombrios do plano abissal.",
    accent: "#b05cf9",
    bg: "#08060e",
    titleColor: "#f8f4ff",
    subtitleColor: "#b59adf",
    tag: "Escuro",
    type: "dark",
    harmony: "Análoga Fria",
    harmonyFamily: "Adobe Color: Analogous Mystical Shadow",
    contrastRatio: "6.5:1 (WCAG AA)",
    previewColors: ["#08060e", "#b05cf9", "#f8f4ff"],
    iconName: "Skull",
  },
  {
    id: "bloodmoon",
    name: "Lua de Sangue",
    subtitle: "Caça & Brasas Antigas",
    description: "Brasa rubra e sangue coagulado sob um céu de eclipse permanente.",
    accent: "#e8503a",
    bg: "#0f0607",
    titleColor: "#ffe4de",
    subtitleColor: "#e89c8a",
    tag: "Escuro",
    type: "dark",
    harmony: "Complementar Quente",
    harmonyFamily: "Adobe Color: Complementary Ember & Oxblood",
    contrastRatio: "16.6:1 (WCAG AAA)",
    previewColors: ["#0f0607", "#e8503a", "#ffe4de"],
    iconName: "Eclipse",
  },
  {
    id: "frostfall",
    name: "Gelo Eterno",
    subtitle: "Tundra & Aurora Gelo",
    description: "Céu de uma noite polar, aurora ciano e aço congelado do norte.",
    accent: "#38bdf8",
    bg: "#050b13",
    titleColor: "#f0faff",
    subtitleColor: "#7dd3fc",
    tag: "Escuro",
    type: "dark",
    harmony: "Análoga Fria",
    harmonyFamily: "Adobe Color: Analogous Polar Frost",
    contrastRatio: "18.6:1 (WCAG AAA)",
    previewColors: ["#050b13", "#38bdf8", "#f0faff"],
    iconName: "Snowflake",
  },

  // ── TEMAS CLAROS ──
  {
    id: "aurora",
    name: "Aurora Rubra",
    subtitle: "Aurora & Rosas Secas",
    description: "Alvorada de marfim rosado e tijolo de sangue — o novo dia da guilda.",
    accent: "#b91c1c",
    bg: "#fbf0ec",
    titleColor: "#450a0a",
    subtitleColor: "#8a3a2b",
    tag: "Claro",
    type: "light",
    harmony: "Complementar Quente",
    harmonyFamily: "Adobe Color: Complementary Dawn Ember",
    contrastRatio: "14.4:1 (WCAG AAA)",
    previewColors: ["#fbf0ec", "#b91c1c", "#450a0a"],
    iconName: "Sunrise",
  },
  {
    id: "sapphire",
    name: "Safira Real",
    subtitle: "Trono & Medalhão",
    description: "Marfim prateado, azul de luva e o brilho frio de um trono de safira.",
    accent: "#1d4ed8",
    bg: "#eef1f7",
    titleColor: "#0f1e3d",
    subtitleColor: "#3b4d73",
    tag: "Claro",
    type: "light",
    harmony: "Complementar Régia",
    harmonyFamily: "Adobe Color: Complementary Royal Sapphire",
    contrastRatio: "14.6:1 (WCAG AAA)",
    previewColors: ["#eef1f7", "#1d4ed8", "#0f1e3d"],
    iconName: "Gem",
  },
];
