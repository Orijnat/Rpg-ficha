/**
 * Motor do Mercado do Mundo para o Mestre (Grimorium RPG)
 * Gerencia Regiões, Vendedores, Tipos de Itens, Estoques, Preços, Pesos e Filtros.
 */

export const REGIOES_CANONICAS = [
  "Capital Valíria & Terras da Coroa",
  "Porto dos Afogados & Baía dos Naufrágios",
  "Cidadela da Vigília & Deserto das Cinzas",
  "Pântano das Brumas & Ermos Silenciosos",
  "Vales Congelados de Karrath",
];

export const VENDEDORES_PADRAO = [
  {
    id: "vend-1",
    nome: "Mestre Garrick Martelo-de-Prata",
    titulo: "Ferreiro Imperial da Coroa",
    regiao: "Capital Valíria & Terras da Coroa",
    humor: "O melhor aço de Valíria. Se quebrar em batalha, devolvo seu ouro!",
    especialidade: "Armas & Armaduras Pesadas",
  },
  {
    id: "vend-2",
    nome: "Mestre Elion, o Iluminado",
    titulo: "Arcanista & Bibliotecário Real",
    regiao: "Capital Valíria & Terras da Coroa",
    humor: "O conhecimento tem seu preço... e a tinta arcana não é barata.",
    especialidade: "Grimórios, Pergaminhos & Relíquias",
  },
  {
    id: "vend-3",
    nome: "Kaelen Olho-de-Corvo",
    titulo: "Contrabandista & Receptador do Porto",
    regiao: "Porto dos Afogados & Baía dos Naufrágios",
    humor: "Não faça perguntas sobre as manchas de água salgada ou de sangue.",
    especialidade: "Veneno, Lâminas Curtas & Cargas Ilícitas",
  },
  {
    id: "vend-4",
    nome: "Soraya do Oásis",
    titulo: "Líder de Caravana & Mercadora Nômade",
    regiao: "Cidadela da Vigília & Deserto das Cinzas",
    humor: "Quem atravessa as areias escaldantes sabe o real valor de uma boa corda e água fresca.",
    especialidade: "Equipamentos de Sobrevivência & Montarias",
  },
  {
    id: "vend-5",
    nome: "Capitão Valerius",
    titulo: "Intendente da Guarnição da Vigília",
    regiao: "Cidadela da Vigília & Deserto das Cinzas",
    humor: "Apenas equipamento homologado pela muralha. Disciplina e ferro.",
    especialidade: "Provisões Marciais & Equipamento Tático",
  },
  {
    id: "vend-6",
    nome: "Madame Isolde",
    titulo: "Herbalista & Bruxa das Brumas",
    regiao: "Pântano das Brumas & Ermos Silenciosos",
    humor: "Cada cogumelo deste caldo pode salvar sua vida... ou acelerar sua despedida.",
    especialidade: "Poções, Elixires & Unguentos",
  },
  {
    id: "vend-7",
    nome: "Thorgar Barba-de-Gelo",
    titulo: "Armeiro das Cavernas Rúnicas",
    regiao: "Vales Congelados de Karrath",
    humor: "O aço anão não congela e não dobra perante os gigantes das neves.",
    especialidade: "Machados, Escudos Fortes & Peles Árticas",
  },
];

export const CATEGORIAS_ITEM = [
  "Armas",
  "Armaduras & Escudos",
  "Poções & Alquimia",
  "Equipamento & Aventura",
  "Grimórios & Pergaminhos",
  "Munições",
  "Relíquias & Itens Mágicos",
  "Montarias & Provisões",
];

export const RARIDADES = [
  { id: "Comum", label: "Comum", color: "text-zinc-400 border-zinc-700 bg-zinc-900/60" },
  { id: "Incomum", label: "Incomum", color: "text-emerald-400 border-emerald-600/40 bg-emerald-950/40" },
  { id: "Raro", label: "Raro", color: "text-sky-400 border-sky-600/40 bg-sky-950/40" },
  { id: "Muito Raro", label: "Muito Raro", color: "text-purple-400 border-purple-600/40 bg-purple-950/40" },
  { id: "Lendário", label: "Lendário", color: "text-amber-400 border-amber-600/50 bg-amber-950/40" },
];

export const MOEDAS = [
  { id: "ouro", label: "Ouro (PO)", sigla: "PO", color: "#fbbf24" },
  { id: "prata", label: "Prata (PP)", sigla: "PP", color: "#cbd5e1" },
  { id: "cobre", label: "Cobre (PC)", sigla: "PC", color: "#f97316" },
  { id: "latina", label: "Platina / Latina (PL)", sigla: "PL", color: "#a5b4fc" },
];

export const DEFAULT_MARKET_ITEMS = [
  {
    id: "item-val-1",
    nome: "Espada Longa de Aço Valiriano",
    regiao: "Capital Valíria & Terras da Coroa",
    vendedor: "Mestre Garrick Martelo-de-Prata",
    tipo: "Armas",
    quantidade: 4,
    preco: 35,
    moeda: "ouro",
    peso: 1.5,
    raridade: "Incomum",
    descricao: "Dano 1d8 cortante (versátil 1d10). Aço refinado duplamente temperado, equilibrado para combate.",
    requisitos: "FOR 11 ou Treinado em Armas Marciais",
  },
  {
    id: "item-val-2",
    nome: "Cota de Malha da Guarda Real",
    regiao: "Capital Valíria & Terras da Coroa",
    vendedor: "Mestre Garrick Martelo-de-Prata",
    tipo: "Armaduras & Escudos",
    quantidade: 2,
    preco: 75,
    moeda: "ouro",
    peso: 18.0,
    raridade: "Comum",
    descricao: "Armadura pesada. Garante CA 16 sólida. Desvantagem em testes de Furtividade.",
    requisitos: "FOR 13",
  },
  {
    id: "item-val-3",
    nome: "Carcás com 20 Flechas com Ponta de Prata",
    regiao: "Capital Valíria & Terras da Coroa",
    vendedor: "Mestre Garrick Martelo-de-Prata",
    tipo: "Munições",
    quantidade: 5,
    preco: 30,
    moeda: "ouro",
    peso: 1.0,
    raridade: "Incomum",
    descricao: "20 flechas com pontas banhadas em prata pura. Supera resistências de licantropos e mortos-vivos.",
    requisitos: "Requer Arco Longo ou Arco Curto",
  },
  {
    id: "item-val-4",
    nome: "Pergaminho de Mísseis Mágicos",
    regiao: "Capital Valíria & Terras da Coroa",
    vendedor: "Mestre Elion, o Iluminado",
    tipo: "Grimórios & Pergaminhos",
    quantidade: 6,
    preco: 50,
    moeda: "ouro",
    peso: 0.1,
    raridade: "Incomum",
    descricao: "Cria 3 dardos de pura força cintilante que acertam seus alvos sem chance de erro (1d4+1 cada).",
    requisitos: "Capacidade de conjuração arcana",
  },
  {
    id: "item-val-5",
    nome: "Grimório em Branco com Fecho Dourado",
    regiao: "Capital Valíria & Terras da Coroa",
    vendedor: "Mestre Elion, o Iluminado",
    tipo: "Grimórios & Pergaminhos",
    quantidade: 3,
    preco: 25,
    moeda: "ouro",
    peso: 1.5,
    raridade: "Comum",
    descricao: "Volume de 100 páginas de pergaminho de alta densidade revestido em couro marrom e cantoneiras de latão.",
    requisitos: "Mago / Conjurador",
  },
  {
    id: "item-val-6",
    nome: "Anel de Proteção Rúnica",
    regiao: "Capital Valíria & Terras da Coroa",
    vendedor: "Mestre Elion, o Iluminado",
    tipo: "Relíquias & Itens Mágicos",
    quantidade: 1,
    preco: 350,
    moeda: "ouro",
    peso: 0.05,
    raridade: "Raro",
    descricao: "Um anel de prata reluzente gravado com runas antigas. Concede +1 na CA e +1 em todas as salvaguardas.",
    requisitos: "Sintonização de 1 hora",
  },
  {
    id: "item-por-1",
    nome: "Cimitarra de Bordo Entalhada",
    regiao: "Porto dos Afogados & Baía dos Naufrágios",
    vendedor: "Kaelen Olho-de-Corvo",
    tipo: "Armas",
    quantidade: 5,
    preco: 25,
    moeda: "ouro",
    peso: 1.2,
    raridade: "Comum",
    descricao: "Dano 1d6 cortante. Propriedades: Acuidade e Leve. Excelente para duelistas marítimos.",
    requisitos: "DES 10",
  },
  {
    id: "item-por-2",
    nome: "Veneno de Viúva-Negra (Frasco)",
    regiao: "Porto dos Afogados & Baía dos Naufrágios",
    vendedor: "Kaelen Olho-de-Corvo",
    tipo: "Poções & Alquimia",
    quantidade: 3,
    preco: 100,
    moeda: "ouro",
    peso: 0.1,
    raridade: "Raro",
    descricao: "Basta recobrir a lâmina. O alvo atingido deve passar em Salvaguarda de CON CD 13 ou sofre 2d8 de veneno e Envenenado.",
    requisitos: "Uso cuidadoso (teste de Destreza para aplicar sem se ferir)",
  },
  {
    id: "item-por-3",
    nome: "Besta Pesada com Molas de Aço",
    regiao: "Porto dos Afogados & Baía dos Naufrágios",
    vendedor: "Kaelen Olho-de-Corvo",
    tipo: "Armas",
    quantidade: 2,
    preco: 50,
    moeda: "ouro",
    peso: 4.0,
    raridade: "Comum",
    descricao: "Dano 1d10 perfurante. Duas mãos, recarga pesada, alcance longo (30m / 120m).",
    requisitos: "FOR 12",
  },
  {
    id: "item-por-4",
    nome: "Kit de Ferramentas de Ladrão Aprimorado",
    regiao: "Porto dos Afogados & Baía dos Naufrágios",
    vendedor: "Kaelen Olho-de-Corvo",
    tipo: "Equipamento & Aventura",
    quantidade: 4,
    preco: 35,
    moeda: "ouro",
    peso: 0.8,
    raridade: "Incomum",
    descricao: "Gazúas de precisão, espelho angular, arames finos e óleo silencioso. Concede +1 em testes de Ladinagem.",
    requisitos: "Treinamento em Ladinagem",
  },
  {
    id: "item-des-1",
    nome: "Manto das Areias Eternas",
    regiao: "Cidadela da Vigília & Deserto das Cinzas",
    vendedor: "Soraya do Oásis",
    tipo: "Equipamento & Aventura",
    quantidade: 8,
    preco: 15,
    moeda: "ouro",
    peso: 1.0,
    raridade: "Comum",
    descricao: "Tecido duplo térmico. Concede vantagem em salvaguardas contra exaustão por calor extremo e tempestades de poeira.",
    requisitos: "Nenhum",
  },
  {
    id: "item-des-2",
    nome: "Corda de Fibras de Cacto Trançada (15m)",
    regiao: "Cidadela da Vigília & Deserto das Cinzas",
    vendedor: "Soraya do Oásis",
    tipo: "Equipamento & Aventura",
    quantidade: 10,
    preco: 8,
    moeda: "ouro",
    peso: 2.0,
    raridade: "Comum",
    descricao: "Extremamente durável e flexível, suporta até 400 kg de tração sem ceder.",
    requisitos: "Nenhum",
  },
  {
    id: "item-des-3",
    nome: "Cavalo de Guerra do Deserto",
    regiao: "Cidadela da Vigília & Deserto das Cinzas",
    vendedor: "Soraya do Oásis",
    tipo: "Montarias & Provisões",
    quantidade: 2,
    preco: 250,
    moeda: "ouro",
    peso: 380.0,
    raridade: "Incomum",
    descricao: "Montaria veloz e adaptada ao terreno arenoso. Resistência superior à sede. Deslocamento de 18 metros.",
    requisitos: "Perícia Adestramento de Animais",
  },
  {
    id: "item-des-4",
    nome: "Escudo de Bronze da Guarnição",
    regiao: "Cidadela da Vigília & Deserto das Cinzas",
    vendedor: "Capitão Valerius",
    tipo: "Armaduras & Escudos",
    quantidade: 5,
    preco: 20,
    moeda: "ouro",
    peso: 3.5,
    raridade: "Comum",
    descricao: "Escudo circular sólido de bronze reforçado. Concede +2 na CA do usuário.",
    requisitos: "Treinado em Escudos",
  },
  {
    id: "item-des-5",
    nome: "Rações Militares Desidratadas (10 dias)",
    regiao: "Cidadela da Vigília & Deserto das Cinzas",
    vendedor: "Capitão Valerius",
    tipo: "Montarias & Provisões",
    quantidade: 20,
    preco: 5,
    moeda: "ouro",
    peso: 5.0,
    raridade: "Comum",
    descricao: "Carne seca salgada e biscoitos de cevada resistentes a insetos e umidade.",
    requisitos: "Nenhum",
  },
  {
    id: "item-pan-1",
    nome: "Poção de Cura Menor (Elixir Carmesim)",
    regiao: "Pântano das Brumas & Ermos Silenciosos",
    vendedor: "Madame Isolde",
    tipo: "Poções & Alquimia",
    quantidade: 12,
    preco: 50,
    moeda: "ouro",
    peso: 0.2,
    raridade: "Comum",
    descricao: "Líquido vermelho brilhante com cheiro de ervas. Restaura 2d4+2 Pontos de Vida ao ser bebido como ação.",
    requisitos: "Ação padrão para ingerir",
  },
  {
    id: "item-pan-2",
    nome: "Fogo Alquímico Concentrado (Frasco)",
    regiao: "Pântano das Brumas & Ermos Silenciosos",
    vendedor: "Madame Isolde",
    tipo: "Poções & Alquimia",
    quantidade: 7,
    preco: 30,
    moeda: "ouro",
    peso: 0.5,
    raridade: "Incomum",
    descricao: "Pode ser arremessado até 6m. Causa 1d4 de dano de fogo imediato e 1d4 no início de cada turno da vítima.",
    requisitos: "Ação de ataque de arremesso",
  },
  {
    id: "item-pan-3",
    nome: "Antídoto Universal das Ervas Pantaneiras",
    regiao: "Pântano das Brumas & Ermos Silenciosos",
    vendedor: "Madame Isolde",
    tipo: "Poções & Alquimia",
    quantidade: 6,
    preco: 40,
    moeda: "ouro",
    peso: 0.2,
    raridade: "Incomum",
    descricao: "Neutraliza imediatamente condições de veneno ativas e concede vantagem contra novos venenos por 1 hora.",
    requisitos: "Ação para beber ou ministrar em aliado",
  },
  {
    id: "item-kar-1",
    nome: "Machado de Batalha com Runas de Gelo",
    regiao: "Vales Congelados de Karrath",
    vendedor: "Thorgar Barba-de-Gelo",
    tipo: "Armas",
    quantidade: 2,
    preco: 120,
    moeda: "ouro",
    peso: 2.5,
    raridade: "Raro",
    descricao: "Dano 1d8 cortante (versátil 1d10) + 1d4 de dano gélido. Forjado no coração das forjas de Karrath.",
    requisitos: "FOR 13",
  },
  {
    id: "item-kar-2",
    nome: "Capa de Pele de Lobo da Neve",
    regiao: "Vales Congelados de Karrath",
    vendedor: "Thorgar Barba-de-Gelo",
    tipo: "Equipamento & Aventura",
    quantidade: 4,
    preco: 45,
    moeda: "ouro",
    peso: 2.0,
    raridade: "Incomum",
    descricao: "Imunidade aos efeitos nocivos de frio extremo natural. +1 em testes de Furtividade em nevascas.",
    requisitos: "Nenhum",
  },
  {
    id: "item-kar-3",
    nome: "Piquete e Grampos de Escalada Glacial",
    regiao: "Vales Congelados de Karrath",
    vendedor: "Thorgar Barba-de-Gelo",
    tipo: "Equipamento & Aventura",
    quantidade: 6,
    preco: 18,
    moeda: "ouro",
    peso: 1.8,
    raridade: "Comum",
    descricao: "Equipamento essencial para escalada em penhascos íngremes ou geleiras. Impede quedas acidentais.",
    requisitos: "Nenhum",
  },
];

/**
 * Valida os dados de um item de mercado.
 * @param {Object} item
 * @returns {{ valid: boolean, errors: string[] }}
 */
export function validateMarketItem(item = {}) {
  const errors = [];
  if (!item.nome || typeof item.nome !== "string" || !item.nome.trim()) {
    errors.push("O nome do item é obrigatório.");
  }
  if (!item.regiao || typeof item.regiao !== "string" || !item.regiao.trim()) {
    errors.push("A região do item é obrigatória.");
  }
  if (!item.vendedor || typeof item.vendedor !== "string" || !item.vendedor.trim()) {
    errors.push("O vendedor do item é obrigatório.");
  }
  if (!item.tipo || typeof item.tipo !== "string" || !item.tipo.trim()) {
    errors.push("O tipo do item é obrigatório.");
  }
  if (item.quantidade !== undefined && (isNaN(Number(item.quantidade)) || Number(item.quantidade) < 0)) {
    errors.push("A quantidade deve ser um número maior ou igual a zero.");
  }
  if (item.preco !== undefined && (isNaN(Number(item.preco)) || Number(item.preco) < 0)) {
    errors.push("O preço deve ser um número maior ou igual a zero.");
  }
  if (item.peso !== undefined && (isNaN(Number(item.peso)) || Number(item.peso) < 0)) {
    errors.push("O peso deve ser um número maior ou igual a zero.");
  }
  return {
    valid: errors.length === 0,
    errors,
  };
}

/**
 * Normaliza e cria um novo item para o mercado.
 * @param {Object} raw
 * @returns {Object}
 */
export function createMarketItem(raw = {}) {
  return {
    id: raw.id || `item-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
    nome: (raw.nome || "Novo Item").trim(),
    regiao: (raw.regiao || REGIOES_CANONICAS[0]).trim(),
    vendedor: (raw.vendedor || VENDEDORES_PADRAO[0].nome).trim(),
    tipo: (raw.tipo || CATEGORIAS_ITEM[0]).trim(),
    quantidade: Math.max(0, Math.floor(Number(raw.quantidade) || 1)),
    preco: Math.max(0, Number(raw.preco) || 1),
    moeda: raw.moeda && MOEDAS.some((m) => m.id === raw.moeda) ? raw.moeda : "ouro",
    peso: Math.max(0, Number(Number(raw.peso || 1).toFixed(2))),
    raridade: raw.raridade || "Comum",
    descricao: (raw.descricao || "").trim(),
    requisitos: (raw.requisitos || "").trim(),
  };
}

/**
 * Filtra e ordena a lista de itens do mercado.
 */
export function filterMarketItems(items = [], filters = {}) {
  const {
    searchTerm = "",
    selectedRegion = "todas",
    selectedVendor = "todos",
    selectedType = "todos",
    selectedRarity = "todas",
    stockFilter = "todos", // "todos" | "disponivel" | "esgotado"
    sortBy = "nome_asc", // "nome_asc" | "nome_desc" | "preco_asc" | "preco_desc" | "peso_asc" | "peso_desc" | "qtd_desc"
  } = filters;

  const search = searchTerm.trim().toLowerCase();

  return items
    .filter((item) => {
      // Região
      if (selectedRegion !== "todas" && item.regiao !== selectedRegion) {
        return false;
      }
      // Vendedor
      if (selectedVendor !== "todos" && item.vendedor !== selectedVendor) {
        return false;
      }
      // Tipo / Categoria
      if (selectedType !== "todos" && item.tipo !== selectedType) {
        return false;
      }
      // Raridade
      if (selectedRarity !== "todas" && item.raridade !== selectedRarity) {
        return false;
      }
      // Filtro de Estoque
      const qty = Number(item.quantidade) || 0;
      if (stockFilter === "disponivel" && qty <= 0) return false;
      if (stockFilter === "esgotado" && qty > 0) return false;

      // Busca Textual
      if (search) {
        const matchName = item.nome?.toLowerCase().includes(search);
        const matchDesc = item.descricao?.toLowerCase().includes(search);
        const matchVend = item.vendedor?.toLowerCase().includes(search);
        const matchReg = item.regiao?.toLowerCase().includes(search);
        const matchType = item.tipo?.toLowerCase().includes(search);
        if (!matchName && !matchDesc && !matchVend && !matchReg && !matchType) {
          return false;
        }
      }

      return true;
    })
    .sort((a, b) => {
      if (sortBy === "nome_asc") return (a.nome || "").localeCompare(b.nome || "", "pt-BR");
      if (sortBy === "nome_desc") return (b.nome || "").localeCompare(a.nome || "", "pt-BR");
      if (sortBy === "preco_asc") return (Number(a.preco) || 0) - (Number(b.preco) || 0);
      if (sortBy === "preco_desc") return (Number(b.preco) || 0) - (Number(a.preco) || 0);
      if (sortBy === "peso_asc") return (Number(a.peso) || 0) - (Number(b.peso) || 0);
      if (sortBy === "peso_desc") return (Number(b.peso) || 0) - (Number(a.peso) || 0);
      if (sortBy === "qtd_desc") return (Number(b.quantidade) || 0) - (Number(a.quantidade) || 0);
      return 0;
    });
}

/**
 * Agrupa itens por Região do Mundo.
 * @param {Array} items
 * @returns {Record<string, Array>}
 */
export function groupItemsByRegion(items = []) {
  const groups = {};
  items.forEach((item) => {
    const regiao = item.regiao || "Região Indefinida";
    if (!groups[regiao]) {
      groups[regiao] = [];
    }
    groups[regiao].push(item);
  });
  return groups;
}

/**
 * Agrupa itens por Vendedor.
 * @param {Array} items
 * @returns {Record<string, Array>}
 */
export function groupItemsByVendor(items = []) {
  const groups = {};
  items.forEach((item) => {
    const vendedor = item.vendedor || "Comerciante Desconhecido";
    if (!groups[vendedor]) {
      groups[vendedor] = [];
    }
    groups[vendedor].push(item);
  });
  return groups;
}

/**
 * Agrupa itens por Tipo de Item.
 * @param {Array} items
 * @returns {Record<string, Array>}
 */
export function groupItemsByType(items = []) {
  const groups = {};
  items.forEach((item) => {
    const tipo = item.tipo || "Outros";
    if (!groups[tipo]) {
      groups[tipo] = [];
    }
    groups[tipo].push(item);
  });
  return groups;
}

/**
 * Calcula estatísticas do mercado.
 */
export function calculateMarketStats(items = []) {
  const totalItens = items.length;
  const regioesSet = new Set();
  const vendedoresSet = new Set();
  let estoqueTotal = 0;
  let esgotados = 0;
  let valorTotalEmOuro = 0;

  // Conversões aproximadas para estatísticas de riqueza
  const multipliers = {
    ouro: 1,
    prata: 0.1,
    cobre: 0.01,
    latina: 10,
  };

  items.forEach((item) => {
    if (item.regiao) regioesSet.add(item.regiao);
    if (item.vendedor) vendedoresSet.add(item.vendedor);
    const qty = Number(item.quantidade) || 0;
    estoqueTotal += qty;
    if (qty <= 0) esgotados += 1;

    const preco = Number(item.preco) || 0;
    const mult = multipliers[item.moeda] || 1;
    valorTotalEmOuro += preco * qty * mult;
  });

  return {
    totalItens,
    totalRegioes: regioesSet.size,
    totalVendedores: vendedoresSet.size,
    estoqueTotal,
    esgotados,
    valorTotalEmOuro: Math.round(valorTotalEmOuro),
  };
}

/**
 * Formata o preço com o sufixo da moeda.
 */
export function formatItemPrice(preco, moeda = "ouro") {
  const m = MOEDAS.find((item) => item.id === moeda) || MOEDAS[0];
  return `${preco} ${m.sigla}`;
}

/**
 * Formata o peso do item.
 */
export function formatItemWeight(peso) {
  const n = Number(peso) || 0;
  return `${n} kg`;
}

/**
 * Gera texto formatado para copiar para a área de transferência
 * e fornecer ao jogador ou colar no chat da sessão.
 */
export function formatItemClipboard(item) {
  if (!item) return "";
  const parts = [
    `📦 **${item.nome}**`,
    `💰 Preço: ${formatItemPrice(item.preco, item.moeda)}`,
    `⚖️ Peso: ${formatItemWeight(item.peso)}`,
    `🏷️ Tipo: ${item.tipo} (${item.raridade || "Comum"})`,
    `👤 Vendedor: ${item.vendedor}`,
    `🗺️ Região: ${item.regiao}`,
  ];
  if (item.requisitos) {
    parts.push(`⚙️ Requisitos: ${item.requisitos}`);
  }
  if (item.descricao) {
    parts.push(`📜 Efeito: ${item.descricao}`);
  }
  return parts.join("\n");
}
