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
  { id: "Raro", label: "Raro", color: "text-rose-400 border-rose-600/40 bg-rose-950/40" },
  { id: "Muito Raro", label: "Muito Raro", color: "text-purple-400 border-purple-600/40 bg-purple-950/40" },
  { id: "Lendário", label: "Lendário", color: "text-amber-400 border-amber-600/50 bg-amber-950/40" },
];

export const MOEDAS = [
  { id: "ouro", label: "Ouro (PO)", sigla: "PO", color: "#fbbf24" },
  { id: "prata", label: "Prata (PP)", sigla: "PP", color: "#cfc9bb" },
  { id: "cobre", label: "Cobre (PC)", sigla: "PC", color: "#f97316" },
  { id: "latina", label: "Platina / Latina (PL)", sigla: "PL", color: "#e6dcc2" },
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
    vendedor: (raw.vendedor || "").trim(),
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
