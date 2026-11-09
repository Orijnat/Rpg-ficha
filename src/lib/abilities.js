/**
 * Motor de Regras de Habilidades e Treinamento
 * Mantido por: @rpg-rules-engine & @frontend-artisan
 */

export const GRAUS_TREINAMENTO = [
  {
    id: "aprendiz",
    nome: "Aprendiz",
    grau: 1,
    horasMinimas: 0,
    horasMaximas: 10,
    bonus: "+0",
    efeito: "Domínio inicial dos movimentos e fundamentos da técnica.",
    cor: "text-zinc-300",
    bg: "bg-zinc-800/50",
    borda: "border-zinc-700/60",
    badge: "border-zinc-700 bg-zinc-800/60 text-zinc-300",
  },
  {
    id: "praticante",
    nome: "Praticante",
    grau: 2,
    horasMinimas: 10,
    horasMaximas: 25,
    bonus: "+1 no Teste / -1 PE",
    efeito: "Execução consistente com menor desgaste físico e mental.",
    cor: "text-sky-300",
    bg: "bg-sky-950/40",
    borda: "border-sky-500/40",
    badge: "border-sky-500/50 bg-sky-950/60 text-sky-300",
  },
  {
    id: "veterano",
    nome: "Veterano",
    grau: 3,
    horasMinimas: 25,
    horasMaximas: 50,
    bonus: "+2 no Teste / Alcance +50%",
    efeito: "Técnica instintiva capaz de surpreender adversários experientes.",
    cor: "text-amber-300",
    bg: "bg-amber-950/40",
    borda: "border-amber-500/40",
    badge: "border-amber-500/50 bg-amber-950/60 text-amber-300",
  },
  {
    id: "mestre",
    nome: "Mestre",
    grau: 4,
    horasMinimas: 50,
    horasMaximas: 100,
    bonus: "+3 no Teste / Crítico Aprimorado (19-20)",
    efeito: "Perfeição absoluta na execução da arte, canalizando poder máximo.",
    cor: "text-purple-300",
    bg: "bg-purple-950/40",
    borda: "border-purple-500/40",
    badge: "border-purple-500/50 bg-purple-950/60 text-purple-300",
  },
];

export const TIPOS_HABILIDADE = {
  magia: {
    id: "magia",
    nome: "Sinal / Magia",
    cor: "text-purple-300",
    bg: "bg-purple-950/40",
    borda: "border-purple-500/40",
    badge: "border-purple-500/40 bg-purple-950/60 text-purple-300",
  },
  ativa: {
    id: "ativa",
    nome: "Ação Ativa",
    cor: "text-amber-300",
    bg: "bg-amber-950/40",
    borda: "border-amber-500/40",
    badge: "border-amber-500/40 bg-amber-950/60 text-amber-300",
  },
  passiva: {
    id: "passiva",
    nome: "Passiva",
    cor: "text-emerald-300",
    bg: "bg-emerald-950/40",
    borda: "border-emerald-500/40",
    badge: "border-emerald-500/40 bg-emerald-950/60 text-emerald-300",
  },
  reacao: {
    id: "reacao",
    nome: "Reação",
    cor: "text-sky-300",
    bg: "bg-sky-950/40",
    borda: "border-sky-500/40",
    badge: "border-sky-500/40 bg-sky-950/60 text-sky-300",
  },
};

export const STATUS_APROVACAO = {
  aprovada: {
    id: "aprovada",
    nome: "Aprovada pelo Mestre",
    cor: "text-emerald-300",
    bg: "bg-emerald-950/40",
    borda: "border-emerald-500/40",
    badge: "border-emerald-500/50 bg-emerald-950/60 text-emerald-300",
  },
  pendente: {
    id: "pendente",
    nome: "Pendente de Aprovação",
    cor: "text-amber-300",
    bg: "bg-amber-950/40",
    borda: "border-amber-500/40",
    badge: "border-amber-500/50 bg-amber-950/60 text-amber-300",
  },
  rejeitada: {
    id: "rejeitada",
    nome: "Rejeitada",
    cor: "text-rose-300",
    bg: "bg-rose-950/40",
    borda: "border-rose-500/40",
    badge: "border-rose-500/50 bg-rose-950/60 text-rose-300",
  },
};

/**
 * Retorna metadados do status de aprovação de uma habilidade
 */
export function getStatusAprovacao(habilidade) {
  const status = habilidade?.approvalStatus || "aprovada";
  return STATUS_APROVACAO[status] || STATUS_APROVACAO.aprovada;
}

/**
 * Cria ou re-submete uma solicitação de habilidade.
 * Jogadores geram habilidades 'pendente', enquanto Mestres podem aprová-las diretamente.
 */
export function criarSolicitacaoHabilidade(ability, isMaster = false) {
  const now = new Date().toISOString();
  return {
    ...ability,
    approvalStatus: isMaster ? (ability?.approvalStatus || "aprovada") : "pendente",
    submittedBy: ability?.submittedBy || (isMaster ? "mestre" : "jogador"),
    requestedAt: ability?.requestedAt || now,
    updatedAt: now,
    masterFeedback: ability?.masterFeedback || null,
  };
}

/**
 * Aprova uma habilidade (ação do mestre)
 */
export function aprovarHabilidade(habilidade, feedback = null) {
  return {
    ...habilidade,
    approvalStatus: "aprovada",
    approvedAt: new Date().toISOString(),
    masterFeedback: feedback || null,
  };
}

/**
 * Rejeita uma habilidade (ação do mestre) com justificativa
 */
export function rejeitarHabilidade(habilidade, feedback = "Habilidade desbalanceada ou incompatível.") {
  return {
    ...habilidade,
    approvalStatus: "rejeitada",
    rejectedAt: new Date().toISOString(),
    masterFeedback: feedback,
  };
}

/**
 * Retorna as informações do grau atual com base nas horas treinadas
 */
export function getGrauTreinamento(horas = 0) {
  const h = Math.max(0, Number(horas) || 0);
  if (h >= 50) return GRAUS_TREINAMENTO[3];
  if (h >= 25) return GRAUS_TREINAMENTO[2];
  if (h >= 10) return GRAUS_TREINAMENTO[1];
  return GRAUS_TREINAMENTO[0];
}

/**
 * Calcula o progresso percentual até o próximo grau de maestria
 */
export function calcularProgressoTreino(horas = 0) {
  const h = Math.max(0, Number(horas) || 0);
  const atual = getGrauTreinamento(h);
  const idx = GRAUS_TREINAMENTO.findIndex((g) => g.id === atual.id);
  const proximo = idx < GRAUS_TREINAMENTO.length - 1 ? GRAUS_TREINAMENTO[idx + 1] : null;

  if (!proximo) {
    return {
      grauAtual: atual,
      proximoGrau: null,
      horas: h,
      horasNoGrau: h - atual.horasMinimas,
      horasNecessarias: 0,
      porcentagem: 100,
      isMax: true,
    };
  }

  const faixa = proximo.horasMinimas - atual.horasMinimas;
  const progressoFaixa = Math.min(faixa, Math.max(0, h - atual.horasMinimas));
  const porcentagem = Math.min(100, Math.round((progressoFaixa / faixa) * 100));

  return {
    grauAtual: atual,
    proximoGrau: proximo,
    horas: h,
    horasFaltantes: Math.max(0, proximo.horasMinimas - h),
    horasNecessarias: faixa,
    porcentagem,
    isMax: false,
  };
}

/**
 * Verifica se a habilidade está desbloqueada de acordo com o nível do herói
 */
export function isHabilidadeDesbloqueada(habilidade, nivelPersonagem = 1) {
  const req = Number(habilidade?.reqLevel) || 1;
  const lvl = Math.max(1, Number(nivelPersonagem) || 1);
  return lvl >= req;
}

/**
 * Verifica se uma habilidade está apta para ser treinada.
 * Somente habilidades aprovadas pelo Mestre podem ser treinadas pelos jogadores.
 */
export function podeTreinarHabilidade(habilidade) {
  if (!habilidade) return false;
  const status = habilidade.approvalStatus || "aprovada";
  return status === "aprovada";
}

/**
 * Avança as horas de treino de uma habilidade e atualiza seu grau.
 * Bloqueia treino de habilidades pendentes ou rejeitadas.
 */
export function avancarTreinoHabilidade(habilidade, horasAdicionais = 1) {
  if (!podeTreinarHabilidade(habilidade)) {
    return habilidade;
  }

  const horasAtuais = Math.max(0, Number(habilidade.trainingHours || 0));
  const novasHoras = Math.min(100, horasAtuais + Math.max(0, Number(horasAdicionais) || 0));
  const novoGrau = getGrauTreinamento(novasHoras);

  return {
    ...habilidade,
    trainingHours: novasHoras,
    masteryLevel: novoGrau.id,
  };
}

/**
 * Agrupa uma lista de habilidades por tiers de nível
 */
export function agruparPorNivel(habilidades = [], nivelPersonagem = 1) {
  const grupos = {};

  for (const hab of habilidades) {
    const lvl = Number(hab.reqLevel) || 1;
    if (!grupos[lvl]) {
      grupos[lvl] = {
        nivel: lvl,
        desbloqueado: Number(nivelPersonagem) >= lvl,
        habilidades: [],
      };
    }
    grupos[lvl].habilidades.push({
      ...hab,
      desbloqueada: Number(nivelPersonagem) >= lvl,
      progresso: calcularProgressoTreino(hab.trainingHours || 0),
    });
  }

  return Object.values(grupos).sort((a, b) => a.nivel - b.nivel);
}

/**
 * Habilidades Canônicas Padrão para Bruxeiro / Aventureiro
 */
export const DEFAULT_ABILITIES = [
  {
    id: "hab-igni",
    name: "Sinal Igni",
    type: "magia",
    reqLevel: 1,
    cost: "2 PE",
    attr: "ESP",
    rollFormula: "2d6+2",
    damageType: "Fogo",
    range: "Cone de 5 metros",
    description: "Concede a projeção de uma labareda ardente capaz de queimar armaduras e inflamar inimigos.",
    trainingHours: 12,
    masteryLevel: "praticante",
    isTraining: true,
  },
  {
    id: "hab-quen",
    name: "Sinal Quen",
    type: "magia",
    reqLevel: 1,
    cost: "2 PE",
    attr: "ESP",
    rollFormula: "",
    damageType: "Defesa Arcana",
    range: "Pessoal",
    description: "Cria um escudo prismático translúcido que absorve o próximo golpe ou até 15 pontos de dano.",
    trainingHours: 8,
    masteryLevel: "aprendiz",
    isTraining: false,
  },
  {
    id: "hab-sentidos",
    name: "Sentidos de Bruxeiro",
    type: "passiva",
    reqLevel: 1,
    cost: "Passiva (0 PE)",
    attr: "SAB",
    rollFormula: "",
    damageType: "Percepção / Rastreamento",
    range: "Até 30 metros",
    description: "Olhos felinos e audição aguçada concedem visão no escuro e +3 em testes de Percepção para rastros e batimentos cardíacos.",
    trainingHours: 30,
    masteryLevel: "veterano",
    isTraining: false,
  },
  {
    id: "hab-aard",
    name: "Sinal Aard",
    type: "magia",
    reqLevel: 2,
    cost: "2 PE",
    attr: "ESP",
    rollFormula: "1d20+ESP",
    damageType: "Impacto Telecinético",
    range: "Linha de 6 metros",
    description: "Dispara uma onda de choque de ar comprimido capaz de derrubar adversários, quebrar portas e desestabilizar escudos.",
    trainingHours: 4,
    masteryLevel: "aprendiz",
    isTraining: false,
  },
  {
    id: "hab-esquiva",
    name: "Esquiva Fluida",
    type: "reacao",
    reqLevel: 2,
    cost: "1 PE",
    attr: "DES",
    rollFormula: "",
    damageType: "Evasão Defensiva",
    range: "Reação",
    description: "Passo lateral acrobático em resposta a um ataque físico. Adiciona +3 na Classe de Armadura (CA) contra o golpe.",
    trainingHours: 15,
    masteryLevel: "praticante",
    isTraining: false,
  },
  {
    id: "hab-axii",
    name: "Sinal Axii",
    type: "magia",
    reqLevel: 3,
    cost: "3 PE",
    attr: "CAR",
    rollFormula: "1d20+CAR",
    damageType: "Encanto Mental",
    range: "Toque ou 4 metros",
    description: "Onda hipnótica sutil que acalma feras em pânico ou atordoa humanoides durante 1 rodada de combate.",
    trainingHours: 0,
    masteryLevel: "aprendiz",
    isTraining: false,
  },
  {
    id: "hab-danca-laminas",
    name: "Dança das Lâminas",
    type: "ativa",
    reqLevel: 3,
    cost: "3 PE",
    attr: "DES",
    rollFormula: "1d10+3",
    damageType: "Cortante",
    range: "Corpo a corpo (até 3 alvos)",
    description: "Giro veloz com a espada desembainhada, atingindo múltiplos inimigos adjacentes com corte impiedoso.",
    trainingHours: 0,
    masteryLevel: "aprendiz",
    isTraining: false,
  },
  {
    id: "hab-yrden",
    name: "Sinal Yrden",
    type: "magia",
    reqLevel: 4,
    cost: "3 PE",
    attr: "INT",
    rollFormula: "",
    damageType: "Armadilha Mágica",
    range: "Raio de 4 metros no chão",
    description: "Glifos mágicos gravados no solo que retardam movimentos de inimigos em 50% e forçam espectros incorpóreos a se materializarem.",
    trainingHours: 0,
    masteryLevel: "aprendiz",
    isTraining: false,
  },
  {
    id: "hab-golpe-mortal",
    name: "Execução de Prata",
    type: "ativa",
    reqLevel: 5,
    cost: "4 PE",
    attr: "FOR",
    rollFormula: "3d10+5",
    damageType: "Letal / Prata Sagrada",
    range: "Corpo a corpo",
    description: "Investida precisa que atinge pontos vitais de bestas lendárias ou monstros com lâmina de prata, causando dano devastador.",
    trainingHours: 0,
    masteryLevel: "aprendiz",
    isTraining: false,
  },
].map((h) => ({
  approvalStatus: "aprovada",
  ...h,
}));
