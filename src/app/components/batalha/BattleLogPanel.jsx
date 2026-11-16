"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { Bot, Crown, RefreshCw, Sword, Swords } from "lucide-react";
import { listBattleLog, listCampaigns } from "../../../lib/api";
import { useAuth } from "../../context/AuthContext";
import { battleLogPapelMeta, battleLogTipoMeta } from "../../../lib/battleLog";

const POLL_MS = 5000;

/** Linha de uma entrada do log — compartilhada entre a visão do jogador e a do mestre. */
export function BattleLogEntryRow({ entry, dense = false }) {
  const tipo = battleLogTipoMeta(entry.tipo);
  const papel = battleLogPapelMeta(entry.papel);
  const PapelIcon = entry.papel === "mestre" ? Crown : entry.papel === "jogador" ? Sword : Bot;
  const hora = entry.timestamp
    ? new Date(entry.timestamp).toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" })
    : "--:--";

  return (
    <div
      className={`rounded-lg border border-border/70 bg-secondary/40 ${
        dense ? "px-2 py-1 text-[11px]" : "px-2.5 py-1.5 text-xs"
      }`}
    >
      <div className="flex flex-wrap items-center gap-1.5 text-[9px]">
        <span
          className={`inline-flex items-center gap-0.5 rounded border px-1 py-0.5 font-bold uppercase tracking-wide ${papel.className}`}
        >
          <PapelIcon size={9} aria-hidden="true" />
          {papel.label}
        </span>
        <span
          className={`rounded border px-1 py-0.5 font-semibold uppercase tracking-wide ${tipo.className}`}
        >
          {tipo.label}
        </span>
        <span className="ml-auto font-mono text-[9px] text-muted-foreground">
          {hora}
          {entry.rodada ? ` · R${entry.rodada}` : ""}
        </span>
      </div>
      <p className="mt-0.5 leading-snug text-foreground">
        <span className="font-semibold">{entry.autor}</span>
        {" — "}
        {entry.mensagem}
      </p>
    </div>
  );
}

/**
 * Painel de leitura do Log de Batalha.
 * Jogadores e mestre veem os mesmos eventos do encontro ativo (polling leve).
 * Sem campanha selecionada, tenta resolver a primeira campanha do usuário.
 */
export default function BattleLogPanel({
  campanhaId = null,
  encontroId = null,
  limit = 200,
  className = "",
}) {
  const { token } = useAuth();
  const [autoCampanhaId, setAutoCampanhaId] = useState("");
  const [resolving, setResolving] = useState(!campanhaId);
  const [encontro, setEncontro] = useState(null);
  const [entradas, setEntradas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState("");
  const scrollRef = useRef(null);
  const lastEntryIdRef = useRef(null);

  const effectiveCampanhaId = campanhaId || autoCampanhaId;

  // Auto-detecção da campanha quando o painel é aberto sem contexto
  useEffect(() => {
    if (campanhaId) return undefined;
    let cancelled = false;
    listCampaigns(token)
      .then((camps) => {
        if (cancelled) return;
        const list = Array.isArray(camps) ? camps : [];
        setAutoCampanhaId(list[0]?.id || "");
      })
      .catch(() => {
        if (!cancelled) setAutoCampanhaId("");
      })
      .finally(() => {
        if (!cancelled) setResolving(false);
      });
    return () => {
      cancelled = true;
    };
  }, [campanhaId, token]);

  const fetchLog = useCallback(
    async ({ silent = false } = {}) => {
      if (!effectiveCampanhaId) {
        setLoading(false);
        return;
      }
      try {
        if (silent) setRefreshing(true);
        else setLoading(true);
        const data = await listBattleLog(effectiveCampanhaId, { encontroId, limit }, token);
        setEncontro(data?.encontro || null);
        setEntradas(Array.isArray(data?.entradas) ? data.entradas : []);
        setError("");
      } catch (err) {
        // Falha silenciosa no polling: mantém os dados antigos na tela
        if (!silent) setError(err?.message || "Não foi possível carregar o log de batalha.");
      } finally {
        setLoading(false);
        setRefreshing(false);
      }
    },
    [effectiveCampanhaId, encontroId, limit, token]
  );

  // Carga inicial + polling leve enquanto o painel está montado
  useEffect(() => {
    if (!effectiveCampanhaId) return undefined;
    fetchLog();
    const id = window.setInterval(() => fetchLog({ silent: true }), POLL_MS);
    return () => window.clearInterval(id);
  }, [fetchLog, effectiveCampanhaId]);

  // Rola até o fim quando chegam eventos novos
  useEffect(() => {
    const lastId = entradas[entradas.length - 1]?.id || null;
    if (lastId && lastId !== lastEntryIdRef.current && scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
    lastEntryIdRef.current = lastId;
  }, [entradas]);

  const isBusy = loading || resolving;

  return (
    <div className={`flex h-full min-h-0 flex-col gap-2 ${className}`}>
      <div className="flex items-center justify-between gap-2 border-b border-border pb-2">
        <div className="flex min-w-0 items-center gap-2">
          <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg border border-primary/40 bg-primary/15 text-primary">
            <Swords size={15} aria-hidden="true" />
          </span>
          <div className="min-w-0">
            <h3 className="font-serif text-xs font-bold uppercase tracking-[0.18em] text-foreground">
              Log da Batalha
            </h3>
            <p className="truncate text-[10px] text-muted-foreground">
              {encontro
                ? `${encontro.nome}${encontro.rodadaAtual ? ` · Rodada ${encontro.rodadaAtual}` : ""}`
                : "Nenhuma batalha em andamento"}
            </p>
          </div>
        </div>
        <div className="flex shrink-0 items-center gap-1.5">
          <span className="rounded-full border border-border bg-secondary/60 px-2 py-0.5 font-mono text-[9px] text-muted-foreground">
            {entradas.length} eventos
          </span>
          <button
            type="button"
            onClick={() => fetchLog({ silent: true })}
            disabled={isBusy || refreshing}
            className="rounded-lg border border-border p-1.5 text-muted-foreground transition hover:border-primary/50 hover:text-primary disabled:opacity-50"
            title="Atualizar log"
            aria-label="Atualizar log"
          >
            <RefreshCw size={13} className={refreshing ? "animate-spin" : ""} aria-hidden="true" />
          </button>
        </div>
      </div>

      {error && (
        <div className="flex items-center justify-between gap-2 rounded-lg border border-destructive/40 bg-destructive/10 px-2 py-1.5 text-[10px] text-destructive-foreground">
          <span className="truncate">{error}</span>
          <button
            type="button"
            onClick={() => fetchLog()}
            className="shrink-0 font-bold uppercase tracking-wide hover:underline"
          >
            Tentar de novo
          </button>
        </div>
      )}

      <div ref={scrollRef} data-lenis-prevent className="min-h-0 flex-1 space-y-1.5 overflow-y-auto pr-0.5">
        {isBusy ? (
          <p className="py-6 text-center text-[10px] text-muted-foreground">Abrindo os anais da batalha…</p>
        ) : entradas.length === 0 ? (
          <div className="flex flex-col items-center gap-2 py-8 text-center">
            <Swords size={22} className="text-muted-foreground/50" aria-hidden="true" />
            <p className="text-[11px] text-muted-foreground">
              {encontro
                ? "Nenhum evento registrado ainda. Role dados, tome dano ou avance turnos — tudo fica gravado aqui."
                : "Quando o mestre iniciar um encontro, as ações de todos aparecerão aqui."}
            </p>
          </div>
        ) : (
          entradas.map((entry) => <BattleLogEntryRow key={entry.id} entry={entry} />)
        )}
      </div>
    </div>
  );
}
