/**
 * Estrutura canônica do Personagem (7 Atributos, 19 Perícias, 80 Slots de Banco)
 * Nenhuma ficha de demonstração é criada — toda ficha nasce a partir de `createBlankCharacterData`.
 */

// Perícias canônicas do sistema (conteúdo de regras, não dados de usuário).
const CANONICAL_SKILLS = [
  { name: "Atletismo", attr: "FOR" },
  { name: "Acrobacia", attr: "DES" },
  { name: "Furtividade", attr: "DES" },
  { name: "Prestidigitação", attr: "DES" },
  { name: "História", attr: "SAB" },
  { name: "Investigação", attr: "SAB" },
  { name: "Sobrevivência", attr: "SAB" },
  { name: "Provocação", attr: "SAB" },
  { name: "Animais", attr: "SAB" },
  { name: "Medicina", attr: "SAB" },
  { name: "Intuição", attr: "ESP" },
  { name: "Percepção", attr: "ESP" },
  { name: "Atuação", attr: "ESP" },
  { name: "Enganação", attr: "CAR" },
  { name: "Intimidação", attr: "CAR" },
  { name: "Persuasão", attr: "CAR" },
  { name: "Arcanismo", attr: "INT" },
  { name: "Religião", attr: "INT" },
  { name: "Natureza", attr: "INT" },
];

// Pontos de vida iniciais de um herói recém-criado (linha de base mecânica única).
export const NEW_HERO_HP = 70;

/**
 * Ficha em branco — ponto de partida neutro para novas contas/fallbacks.
 * Nenhum item, moeda, anotação ou dado de demonstração é criado.
 */
export function createBlankCharacterData() {
  return {
    name: "",
    job: "",
    level: 1,
    xp: 0,
    customClass: "",
    hp: NEW_HERO_HP,
    hpMax: NEW_HERO_HP,
    age: "",
    eyes: "",
    height: "",
    skin: "",
    weight: "",
    hair: "",
    appearance: "",
    FOR: 10,
    DES: 10,
    CON: 10,
    SAB: 10,
    ESP: 10,
    CAR: 10,
    INT: 10,
    skills: CANONICAL_SKILLS.map(({ name, attr }) => ({ name, attr, trained: false, bonus: null })),
    latina: 0,
    ouro: 0,
    prata: 0,
    cobre: 0,
    inventory: [],
    contracts: [],
    players: [],
    npcs: [],
    bankSlots: Array.from({ length: 80 }, () => ({ item: "" })),
    notes: "",
    notesImages: [],
    roomNotes: "",
    mountName: "",
    mountHP: 0,
    mountHPMax: 0,
    mountNotes: "",
    abilities: [],
    levelAbilities: {},
    dadosExtras: {
      inventoryCapacity: 20,
      insanityMax: 0,
      insanityCurrent: 0,
      bpMax: 0,
      bpCurrent: 0,
      peMax: 0,
      peCurrent: 0,
      hitDie: "1d8",
      armorClass: 10,
      initiative: 0,
      customAbilities: [],
      training: [],
      abilities: [],
      levelAbilities: {},
    },
  };
}
