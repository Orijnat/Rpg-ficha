/**
 * Metadados visuais e utilitários do Log de Batalha.
 * O servidor é a fonte da verdade das entradas (`log_batalha`); este módulo só
 * padroniza rótulos, cores e a normalização do formato legado (logHistorico JSONB).
 */

export const BATTLE_LOG_TIPOS = {
  rolagem: { label: "Rolagem", className: "border-indigo-500/30 bg-indigo-500/15 text-indigo-300" },
  dano: { label: "Dano", className: "border-rose-500/30 bg-rose-500/15 text-rose-300" },
  cura: { label: "Cura", className: "border-emerald-500/30 bg-emerald-500/15 text-emerald-300" },
  iniciativa: { label: "Iniciativa", className: "border-amber-500/30 bg-amber-500/15 text-amber-300" },
  condicao: { label: "Condição", className: "border-fuchsia-500/30 bg-fuchsia-500/15 text-fuchsia-300" },
  turno: { label: "Turno", className: "border-sky-500/30 bg-sky-500/15 text-sky-300" },
  entrada: { label: "Entrada", className: "border-teal-500/30 bg-teal-500/15 text-teal-300" },
  encontro: { label: "Encontro", className: "border-primary/30 bg-primary/15 text-primary" },
  recursos: { label: "Recursos", className: "border-lime-500/30 bg-lime-500/15 text-lime-300" },
  sistema: { label: "Sistema", className: "border-border bg-secondary text-muted-foreground" },
};

export const BATTLE_LOG_PAPEIS = {
  mestre: { label: "Mestre", className: "border-amber-400/40 bg-amber-500/15 text-amber-300" },
  jogador: { label: "Jogador", className: "border-sky-400/40 bg-sky-500/15 text-sky-300" },
  sistema: { label: "Sistema", className: "border-border bg-secondary text-muted-foreground" },
};

export function battleLogTipoMeta(tipo) {
  return BATTLE_LOG_TIPOS[tipo] || BATTLE_LOG_TIPOS.sistema;
}

export function battleLogPapelMeta(papel) {
  return BATTLE_LOG_PAPEIS[papel] || BATTLE_LOG_PAPEIS.sistema;
}

/**
 * Normaliza uma entrada legada do JSONB (`dadosExtras.logHistorico`: { timestamp, autor, evento })
 * para o mesmo contrato das entradas do servidor ({ id, autor, papel, tipo, mensagem, rodada, timestamp }).
 */
export function normalizeLegacyBattleLogEntry(entry, index) {
  return {
    id: `legado-${index}-${entry?.timestamp || "sem-data"}`,
    autor: entry?.autor || "Sistema",
    papel: entry?.papel || "sistema",
    tipo: entry?.tipo || "sistema",
    mensagem: entry?.evento || entry?.mensagem || "",
    dados: {},
    rodada: entry?.rodada ?? null,
    timestamp: entry?.timestamp || null,
    legado: true,
  };
}
