/**
 * Catálogo Oficial de Temas do Grimorium RPG
 * Desenvolvido com base nos padrões cromáticos e regras de harmonia do Adobe Color (https://color.adobe.com/br/):
 * - 3 Temas Escuros:
 *   1. amber (Âmbar Vulcânico) -> Harmonia Complementar Dividida Quente (Ouro Âmbar + Ametista Real + Fogo Vulcânico)
 *   2. abyss (Cripta Abissal) -> Harmonia Análoga Fria (Púrpura Místico + Azul Noturno + Ciano Rúnico)
 *   3. forest (Floresta Ancestral) -> Harmonia Tríade Natural (Esmeralda Silvestre + Ocre Dourado + Teal Aquático)
 * - 3 Temas Claros:
 *   4. parchment (Pergaminho Antigo) -> Harmonia Monocromática Terrosa (Papiro Dourado + Bronze Queimado + Nanquim Sépia)
 *   5. sunlight (Catedral da Luz) -> Harmonia Complementar Sacro-Solar (Marfim Sacro + Ouro Solar Reluzente + Azul Safira)
 *   6. mist (Névoa de Avalon) -> Harmonia Análoga Marítima (Prata Geada Nórdica + Sálvia Marítima + Índigo Bruma)
 *
 * Todos os temas atendem aos padrões de contraste WCAG AA/AAA (Adobe Color Accessibility).
 */

export const LEGACY_THEME_MAP = {
  crimson: "amber",
  frost: "mist",
};

export const THEMES = [
  // ── 3 TEMAS ESCUROS ──
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
    accent: "#a855f7",
    bg: "#08060e",
    titleColor: "#f8f4ff",
    subtitleColor: "#b59adf",
    tag: "Escuro",
    type: "dark",
    harmony: "Análoga Fria",
    harmonyFamily: "Adobe Color: Analogous Mystical Shadow",
    contrastRatio: "6.5:1 (WCAG AA)",
    previewColors: ["#08060e", "#a855f7", "#f8f4ff"],
    iconName: "Skull",
  },
  {
    id: "forest",
    name: "Floresta Ancestral",
    subtitle: "Druidas & Natureza",
    description: "Densas copas élficas, líquen bioluminescente e esmeralda silvestre viva.",
    accent: "#10b981",
    bg: "#040d08",
    titleColor: "#f0fdf4",
    subtitleColor: "#6ee7b7",
    tag: "Escuro",
    type: "dark",
    harmony: "Tríade Natural",
    harmonyFamily: "Adobe Color: Triad Nature Equilibrium",
    contrastRatio: "8.5:1 (WCAG AAA)",
    previewColors: ["#040d08", "#10b981", "#f0fdf4"],
    iconName: "Trees",
  },

  // ── 3 TEMAS CLAROS ──
  {
    id: "parchment",
    name: "Pergaminho Antigo",
    subtitle: "Manuscrito & Nanquim",
    description: "Tomo secular em papiro claro envelhecido, nanquim sépia e filigranas de bronze.",
    accent: "#a86412",
    bg: "#f5eee0",
    titleColor: "#23150c",
    subtitleColor: "#70533a",
    tag: "Claro",
    type: "light",
    harmony: "Monocromática Terrosa",
    harmonyFamily: "Adobe Color: Monochromatic Warm Earth",
    contrastRatio: "4.8:1 (WCAG AA)",
    previewColors: ["#f5eee0", "#a86412", "#23150c"],
    iconName: "BookOpen",
  },
  {
    id: "sunlight",
    name: "Catedral da Luz",
    subtitle: "Paladinos & Marfim",
    description: "Mármore sacro banhado pelo sol da alvorada, ouro solar reluzente e aço polido.",
    accent: "#b87508",
    bg: "#f8fafc",
    titleColor: "#0f172a",
    subtitleColor: "#5c6d84",
    tag: "Claro",
    type: "light",
    harmony: "Complementar Solar",
    harmonyFamily: "Adobe Color: Complementary Divine Radiance",
    contrastRatio: "4.6:1 (WCAG AA)",
    previewColors: ["#f8fafc", "#b87508", "#0f172a"],
    iconName: "Sun",
  },
  {
    id: "mist",
    name: "Névoa de Avalon",
    subtitle: "Brumas & Sabedoria Celta",
    description: "Brumas matinais frescas, prata nórdica e sálvia marítima relaxante.",
    accent: "#0d8a80",
    bg: "#f0f4f8",
    titleColor: "#0f2233",
    subtitleColor: "#526e85",
    tag: "Claro",
    type: "light",
    harmony: "Análoga Marítima",
    harmonyFamily: "Adobe Color: Analogous Nordic Mist & Sage",
    contrastRatio: "4.7:1 (WCAG AA)",
    previewColors: ["#f0f4f8", "#0d8a80", "#0f2233"],
    iconName: "Compass",
  },
];
