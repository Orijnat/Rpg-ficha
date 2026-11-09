import test from "node:test";
import assert from "node:assert/strict";
import {
  REGIOES_CANONICAS,
  VENDEDORES_PADRAO,
  CATEGORIAS_ITEM,
  RARIDADES,
  MOEDAS,
  DEFAULT_MARKET_ITEMS,
  validateMarketItem,
  createMarketItem,
  filterMarketItems,
  groupItemsByRegion,
  groupItemsByVendor,
  groupItemsByType,
  calculateMarketStats,
  formatItemPrice,
  formatItemWeight,
  formatItemClipboard,
} from "../market.js";

test("Motor do Mercado — Constantes e Catálogo Inicial", () => {
  assert.ok(REGIOES_CANONICAS.length >= 5, "Deve conter pelo menos 5 regiões canônicas");
  assert.ok(VENDEDORES_PADRAO.length >= 5, "Deve conter pelo menos 5 vendedores padrão");
  assert.ok(CATEGORIAS_ITEM.length >= 6, "Deve conter categorias de armas, armaduras, etc.");
  assert.ok(DEFAULT_MARKET_ITEMS.length >= 15, "Catálogo padrão deve ser rico com itens variados");
});

test("Motor do Mercado — Validação de Item (validateMarketItem)", () => {
  const valid = validateMarketItem({
    nome: "Espada Curta",
    regiao: "Capital Valíria",
    vendedor: "Garrick",
    tipo: "Armas",
    quantidade: 5,
    preco: 10,
    peso: 1.0,
  });
  assert.strictEqual(valid.valid, true);
  assert.strictEqual(valid.errors.length, 0);

  const invalid = validateMarketItem({
    nome: "",
    regiao: "",
    vendedor: "",
    tipo: "",
    quantidade: -2,
    preco: -10,
    peso: -1,
  });
  assert.strictEqual(invalid.valid, false);
  assert.ok(invalid.errors.length >= 5);
});

test("Motor do Mercado — Normalização e Criação (createMarketItem)", () => {
  const item = createMarketItem({
    nome: "  Machado Rúnico  ",
    regiao: "Vales de Karrath",
    vendedor: "Thorgar",
    tipo: "Armas",
    quantidade: 3,
    preco: 45,
    moeda: "ouro",
    peso: 2.5,
  });

  assert.strictEqual(item.nome, "Machado Rúnico");
  assert.strictEqual(item.regiao, "Vales de Karrath");
  assert.strictEqual(item.vendedor, "Thorgar");
  assert.strictEqual(item.quantidade, 3);
  assert.strictEqual(item.preco, 45);
  assert.strictEqual(item.peso, 2.5);
  assert.ok(item.id.startsWith("item-"));
});

test("Motor do Mercado — Filtragem e Busca (filterMarketItems)", () => {
  const sample = [
    {
      id: "1",
      nome: "Espada de Aço",
      regiao: "Capital",
      vendedor: "Garrick",
      tipo: "Armas",
      quantidade: 5,
      preco: 20,
      peso: 1.5,
      raridade: "Comum",
    },
    {
      id: "2",
      nome: "Poção de Cura",
      regiao: "Pântano",
      vendedor: "Isolde",
      tipo: "Poções & Alquimia",
      quantidade: 0,
      preco: 50,
      peso: 0.2,
      raridade: "Incomum",
    },
    {
      id: "3",
      nome: "Arco Longo Élfico",
      regiao: "Capital",
      vendedor: "Elion",
      tipo: "Armas",
      quantidade: 2,
      preco: 100,
      peso: 1.0,
      raridade: "Raro",
    },
  ];

  // Busca textual
  const searchResults = filterMarketItems(sample, { searchTerm: "cura" });
  assert.strictEqual(searchResults.length, 1);
  assert.strictEqual(searchResults[0].nome, "Poção de Cura");

  // Filtro por Região
  const capitalResults = filterMarketItems(sample, { selectedRegion: "Capital" });
  assert.strictEqual(capitalResults.length, 2);

  // Filtro por Vendedor
  const isoldeResults = filterMarketItems(sample, { selectedVendor: "Isolde" });
  assert.strictEqual(isoldeResults.length, 1);

  // Filtro por Tipo
  const armasResults = filterMarketItems(sample, { selectedType: "Armas" });
  assert.strictEqual(armasResults.length, 2);

  // Filtro por Estoque Disponível vs Esgotado
  const disponiveis = filterMarketItems(sample, { stockFilter: "disponivel" });
  assert.strictEqual(disponiveis.length, 2);
  const esgotados = filterMarketItems(sample, { stockFilter: "esgotado" });
  assert.strictEqual(esgotados.length, 1);
  assert.strictEqual(esgotados[0].id, "2");

  // Ordenação por preço decrescente
  const sortedPrecoDesc = filterMarketItems(sample, { sortBy: "preco_desc" });
  assert.strictEqual(sortedPrecoDesc[0].preco, 100);
  assert.strictEqual(sortedPrecoDesc[2].preco, 20);
});

test("Motor do Mercado — Agrupamentos (Região, Vendedor, Tipo)", () => {
  const sample = [
    { id: "1", nome: "A", regiao: "Norte", vendedor: "V1", tipo: "Armas" },
    { id: "2", nome: "B", regiao: "Norte", vendedor: "V2", tipo: "Armas" },
    { id: "3", nome: "C", regiao: "Sul", vendedor: "V1", tipo: "Poções" },
  ];

  const byRegion = groupItemsByRegion(sample);
  assert.strictEqual(byRegion["Norte"].length, 2);
  assert.strictEqual(byRegion["Sul"].length, 1);

  const byVendor = groupItemsByVendor(sample);
  assert.strictEqual(byVendor["V1"].length, 2);
  assert.strictEqual(byVendor["V2"].length, 1);

  const byType = groupItemsByType(sample);
  assert.strictEqual(byType["Armas"].length, 2);
  assert.strictEqual(byType["Poções"].length, 1);
});

test("Motor do Mercado — Estatísticas (calculateMarketStats)", () => {
  const sample = [
    { id: "1", regiao: "RegA", vendedor: "VenA", quantidade: 5, preco: 10, moeda: "ouro" },
    { id: "2", regiao: "RegB", vendedor: "VenB", quantidade: 0, preco: 20, moeda: "ouro" },
    { id: "3", regiao: "RegA", vendedor: "VenA", quantidade: 2, preco: 100, moeda: "prata" },
  ];

  const stats = calculateMarketStats(sample);
  assert.strictEqual(stats.totalItens, 3);
  assert.strictEqual(stats.totalRegioes, 2);
  assert.strictEqual(stats.totalVendedores, 2);
  assert.strictEqual(stats.estoqueTotal, 7);
  assert.strictEqual(stats.esgotados, 1);
  // valor: 5*10 + 0 + 2*100*0.1 = 50 + 20 = 70 PO
  assert.strictEqual(stats.valorTotalEmOuro, 70);
});

test("Motor do Mercado — Formatações e Clipboard", () => {
  assert.strictEqual(formatItemPrice(25, "ouro"), "25 PO");
  assert.strictEqual(formatItemPrice(10, "prata"), "10 PP");
  assert.strictEqual(formatItemWeight(1.5), "1.5 kg");

  const clip = formatItemClipboard({
    nome: "Espada de Aço",
    preco: 25,
    moeda: "ouro",
    peso: 1.5,
    tipo: "Armas",
    raridade: "Comum",
    vendedor: "Garrick",
    regiao: "Valíria",
    descricao: "Dano 1d8 cortante.",
  });

  assert.ok(clip.includes("Espada de Aço"));
  assert.ok(clip.includes("25 PO"));
  assert.ok(clip.includes("1.5 kg"));
  assert.ok(clip.includes("Garrick"));
  assert.ok(clip.includes("Valíria"));
});
