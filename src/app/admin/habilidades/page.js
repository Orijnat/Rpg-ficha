"use client";

import { useEffect, useMemo, useState } from "react";
import {
  Check,
  CheckCircle2,
  ChevronDown,
  ChevronUp,
  Clock,
  LoaderCircle,
  Pencil,
  ScrollText,
  Search,
  Sparkles,
  X,
  XCircle,
} from "lucide-react";
import { Card, SectionHeader } from "../../components/ui";
import { listCharacters, updateCharacterOnBackend } from "../../../lib/api";
import { useAuth } from "../../context/AuthContext";
import { AbilityFormModal } from "../../components/habilidades/AbilityFormModal";
import {
  TIPOS_HABILIDADE,
  STATUS_APROVACAO,
  aprovarHabilidade,
  rejeitarHabilidade,
  calcularProgressoTreino,
} from "../../../lib/abilities";

function heroAbilities(hero) {
  if (Array.isArray(hero?.dadosExtras?.abilities)) return hero.dadosExtras.abilities;
  if (Array.isArray(hero?.abilities)) return hero.abilities;
  return [];
}

const TABS = [
  { id: "pendentes", label: "Pendentes", icon: Clock },
  { id: "aprovadas", label: "Aprovadas", icon: CheckCircle2 },
  { id: "rejeitadas", label: "Rejeitadas", icon: XCircle },
  { id: "todas", label: "Todas", icon: Sparkles },
];

export default function AdminHabilidades() {
  const { token, isMaster, loading: authLoading } = useAuth();
  const [heroes, setHeroes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [msg, setMsg] = useState("");
  const [query, setQuery] = useState("");
  const [tab, setTab] = useState("pendentes");
  const [expanded, setExpanded] = useState({});
  const [savingKey, setSavingKey] = useState(null);
  const [rejectTarget, setRejectTarget] = useState(null); // { heroId, abilityId }
  const [rejectReason, setRejectReason] = useState("");
  const [modal, setModal] = useState({ isOpen: false, hero: null, ability: null });

  useEffect(() => {
    if (authLoading || !isMaster) return undefined;
    let active = true;
    listCharacters(token)
      .then((rows) => {
        if (!active) return;
        const list = Array.isArray(rows) ? rows : [];
        setHeroes(list);
        // Expande por padrão os heróis com pendências
        const next = {};
        for (const hero of list) {
          if (heroAbilities(hero).some((h) => (h.approvalStatus || "aprovada") === "pendente")) next[hero.id] = true;
        }
        setExpanded(next);
      })
      .catch((loadError) => active && setError(loadError.message))
      .finally(() => active && setLoading(false));
    return () => {
      active = false;
    };
  }, [authLoading, isMaster, token]);

  const normalizedQuery = query.trim().toLowerCase();

  const heroesWithStats = useMemo(() => {
    return heroes
      .map((hero) => {
        const abilities = heroAbilities(hero);
        const stats = { total: abilities.length, pendente: 0, aprovada: 0, rejeitada: 0 };
        for (const ability of abilities) {
          const status = ability.approvalStatus || "aprovada";
          if (status === "pendente") stats.pendente += 1;
          else if (status === "rejeitada") stats.rejeitada += 1;
          else stats.aprovada += 1;
        }
        return { hero, abilities, stats };
      })
      .filter(({ hero, abilities, stats }) => {
        if (stats.total === 0) return false;
        if (normalizedQuery) {
          const haystack = `${hero.name || ""} ${hero.job || ""} ${hero.customClass || ""}`.toLowerCase();
          if (!haystack.includes(normalizedQuery) && !abilities.some((a) => (a.name || "").toLowerCase().includes(normalizedQuery))) {
            return false;
          }
        }
        if (tab === "pendentes") return stats.pendente > 0;
        if (tab === "aprovadas") return stats.aprovada > 0;
        if (tab === "rejeitadas") return stats.rejeitada > 0;
        return true;
      });
  }, [heroes, normalizedQuery, tab]);

  const globalStats = useMemo(() => {
    const totals = { pendente: 0, aprovada: 0, rejeitada: 0, heroes: 0 };
    for (const hero of heroes) {
      const abilities = heroAbilities(hero);
      if (abilities.length === 0) continue;
      totals.heroes += 1;
      for (const ability of abilities) {
        const status = ability.approvalStatus || "aprovada";
        if (status === "pendente") totals.pendente += 1;
        else if (status === "rejeitada") totals.rejeitada += 1;
        else totals.aprovada += 1;
      }
    }
    return totals;
  }, [heroes]);

  const toggleExpanded = (id) => setExpanded((current) => ({ ...current, [id]: !current[id] }));

  const persistAbilities = async (hero, nextAbilities, successMessage) => {
    setSavingKey(hero.id);
    setMsg("");
    setError("");
    try {
      const saved = await updateCharacterOnBackend(hero.id, { dadosExtras: { abilities: nextAbilities } }, token);
      const merged = Array.isArray(saved?.dadosExtras?.abilities) ? saved.dadosExtras.abilities : nextAbilities;
      setHeroes((current) =>
        current.map((item) =>
          item.id === hero.id ? { ...item, dadosExtras: { ...(item.dadosExtras || {}), abilities: merged } } : item
        )
      );
      setMsg(successMessage);
    } catch (saveError) {
      setError(saveError.message || "Não foi possível salvar as habilidades.");
    } finally {
      setSavingKey(null);
    }
  };

  const handleApprove = (hero, abilityId) => {
    const next = heroAbilities(hero).map((ability) =>
      ability.id === abilityId ? aprovarHabilidade(ability) : ability
    );
    persistAbilities(hero, next, "Habilidade aprovada.");
  };

  const handleApproveAll = (hero) => {
    const next = heroAbilities(hero).map((ability) =>
      (ability.approvalStatus || "aprovada") === "pendente" ? aprovarHabilidade(ability) : ability
    );
    persistAbilities(hero, next, "Todas as habilidades pendentes foram aprovadas.");
  };

  const openReject = (heroId, abilityId) => {
    setRejectTarget({ heroId, abilityId });
    setRejectReason("");
  };

  const handleConfirmReject = (hero) => {
    if (!rejectTarget) return;
    const reason = rejectReason.trim() || "Habilidade incompatível com a mesa.";
    const next = heroAbilities(hero).map((ability) =>
      ability.id === rejectTarget.abilityId ? rejeitarHabilidade(ability, reason) : ability
    );
    setRejectTarget(null);
    persistAbilities(hero, next, "Habilidade rejeitada com justificativa.");
  };

  const openEdit = (hero, ability) => setModal({ isOpen: true, hero, ability });

  const handleModalSave = (abilityData) => {
    const hero = modal.hero;
    const ability = modal.ability;
    if (!hero || !ability) return;
    const next = heroAbilities(hero).map((item) =>
      item.id === ability.id
        ? { ...item, ...abilityData, id: ability.id, approvalStatus: item.approvalStatus || "aprovada", updatedAt: new Date().toISOString() }
        : item
    );
    setModal({ isOpen: false, hero: null, ability: null });
    persistAbilities(hero, next, "Habilidade atualizada pelo mestre.");
  };

  if (authLoading || loading) {
    return <div className="p-8 text-sm text-muted-foreground">Carregando habilidades dos heróis...</div>;
  }
  if (!isMaster) return null;

  return (
    <div className="space-y-5">
      <Card className="bg-gradient-to-br from-card via-card/85 to-amber-950/20 p-5 sm:p-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="min-w-0">
            <div className="mb-2 flex items-center gap-2 text-[10px] font-semibold uppercase tracking-[0.25em] text-primary">
              <ScrollText size={13} />
              Conselho do Mestre
            </div>
            <h1 className="font-serif text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
              Habilidades dos Heróis
            </h1>
            <p className="mt-1 text-xs text-muted-foreground">
              Aprove, rejeite ou edite as técnicas propostas pelos jogadores. A alteração vale direto na ficha do herói.
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <div className="rounded-xl border border-amber-500/30 bg-amber-950/30 px-3 py-2 text-center">
              <span className="block text-[10px] uppercase tracking-wider text-amber-300/80">Pendentes</span>
              <span className="font-mono text-lg font-bold text-amber-300">{globalStats.pendente}</span>
            </div>
            <div className="rounded-xl border border-emerald-500/30 bg-emerald-950/30 px-3 py-2 text-center">
              <span className="block text-[10px] uppercase tracking-wider text-emerald-300/80">Aprovadas</span>
              <span className="font-mono text-lg font-bold text-emerald-300">{globalStats.aprovada}</span>
            </div>
            <div className="rounded-xl border border-rose-500/30 bg-rose-950/30 px-3 py-2 text-center">
              <span className="block text-[10px] uppercase tracking-wider text-rose-300/80">Rejeitadas</span>
              <span className="font-mono text-lg font-bold text-rose-300">{globalStats.rejeitada}</span>
            </div>
          </div>
        </div>
      </Card>

      {msg && (
        <p className="flex items-center gap-2 border border-emerald-400/30 bg-emerald-950/30 p-3 text-sm text-emerald-200">
          <Check size={16} /> {msg}
        </p>
      )}
      {error && (
        <p className="border border-destructive/30 bg-destructive/10 p-3 text-sm text-destructive-foreground">{error}</p>
      )}

      {/* Controles */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-wrap items-center gap-1.5 rounded-xl border border-zinc-800 bg-zinc-950/60 p-1">
          {TABS.map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              type="button"
              onClick={() => setTab(id)}
              className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-medium transition ${
                tab === id
                  ? "bg-amber-500/25 text-amber-300 border border-amber-500/50 shadow-sm font-bold"
                  : "text-zinc-400 hover:text-zinc-200"
              }`}
            >
              <Icon size={12} />
              <span>{label}</span>
            </button>
          ))}
        </div>
        <div className="relative min-w-56">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500" />
          <input
            type="text"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Buscar herói ou habilidade..."
            className="w-full rounded-xl border border-zinc-800 bg-zinc-950/80 py-2 pl-9 pr-3 text-xs text-zinc-200 placeholder:text-zinc-600 focus:border-amber-500 focus:outline-none"
            aria-label="Buscar herói ou habilidade"
          />
        </div>
      </div>

      {/* Lista de heróis */}
      {heroesWithStats.length === 0 ? (
        <div className="rounded-2xl border border-zinc-800 bg-zinc-950/40 p-12 text-center text-zinc-500">
          <Sparkles size={34} className="mx-auto text-primary/70" />
          <p className="mt-3 text-sm font-semibold text-zinc-300">
            {tab === "pendentes" ? "Nenhuma habilidade pendente de aprovação." : "Nenhuma habilidade encontrada."}
          </p>
          <p className="mx-auto mt-1 max-w-md text-xs text-zinc-500">
            Quando um jogador propõe uma técnica pela página de Habilidades, ela aparece aqui para o seu veredito.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {heroesWithStats.map(({ hero, abilities, stats }) => {
            const isSaving = savingKey === hero.id;
            const isExpanded = Boolean(expanded[hero.id]);
            return (
              <section key={hero.id} className="border-2 border-primary/25 bg-card">
                {/* Cabeçalho do herói */}
                <div className="flex flex-col gap-3 p-4 sm:flex-row sm:items-center sm:justify-between">
                  <button
                    type="button"
                    onClick={() => toggleExpanded(hero.id)}
                    className="flex min-w-0 flex-1 items-center gap-3 text-left"
                    aria-expanded={isExpanded}
                  >
                    <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-primary/40 bg-primary/15 font-serif text-lg font-bold text-primary">
                      {(hero.name || "?").trim().slice(0, 1).toUpperCase()}
                    </div>
                    <div className="min-w-0">
                      <h3 className="font-serif text-base font-bold text-foreground">{hero.name || "Herói sem nome"}</h3>
                      <p className="text-[11px] text-muted-foreground">
                        {hero.job || hero.customClass || "Sem classe"} · Nível {hero.level ?? 1}
                        {stats.pendente > 0 && <span className="ml-2 font-bold text-amber-400">{stats.pendente} pendente{stats.pendente > 1 ? "s" : ""}</span>}
                        {stats.rejeitada > 0 && <span className="ml-2 text-rose-400">{stats.rejeitada} rejeitada{stats.rejeitada > 1 ? "s" : ""}</span>}
                      </p>
                    </div>
                    <span className="ml-auto shrink-0 text-muted-foreground">
                      {isExpanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                    </span>
                  </button>
                  <div className="flex shrink-0 items-center gap-2">
                    {stats.pendente > 0 && (
                      <button
                        type="button"
                        onClick={() => handleApproveAll(hero)}
                        disabled={isSaving}
                        className="flex min-h-9 items-center gap-1.5 rounded-lg border border-emerald-500/50 bg-emerald-500/15 px-3 text-[11px] font-bold text-emerald-300 transition hover:bg-emerald-500/25 disabled:opacity-50"
                      >
                        <Check size={13} /> Aprovar todas ({stats.pendente})
                      </button>
                    )}
                    {isSaving && <LoaderCircle size={16} className="animate-spin text-primary" />}
                  </div>
                </div>

                {/* Habilidades do herói */}
                {isExpanded && (
                  <div className="space-y-2 border-t border-border/60 p-3">
                    {abilities.map((ability) => {
                      const status = ability.approvalStatus || "aprovada";
                      const statusMeta = STATUS_APROVACAO[status] || STATUS_APROVACAO.aprovada;
                      const tipo = TIPOS_HABILIDADE[ability.type] || TIPOS_HABILIDADE.ativa;
                      const isPending = status === "pendente";
                      const progresso = calcularProgressoTreino(ability.trainingHours || 0);
                      const isRejectPromptOpen = rejectTarget?.heroId === hero.id && rejectTarget?.abilityId === ability.id;
                      return (
                        <div
                          key={ability.id}
                          className={`rounded-xl border p-3 transition ${
                            status === "rejeitada"
                              ? "border-rose-900/60 bg-rose-950/20"
                              : isPending
                                ? "border-amber-500/50 bg-amber-950/15"
                                : "border-border bg-secondary/40"
                          }`}
                        >
                          <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
                            <div className="min-w-0">
                              <div className="flex flex-wrap items-center gap-1.5">
                                <span className={`inline-flex items-center gap-1 rounded-md border px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider ${tipo.badge}`}>
                                  {tipo.nome}
                                </span>
                                <h4 className="font-serif text-sm font-bold text-foreground">{ability.name}</h4>
                                <span className={`inline-flex items-center rounded-md border px-2 py-0.5 text-[10px] font-semibold ${statusMeta.badge}`}>
                                  {statusMeta.nome}
                                </span>
                              </div>
                              <p className="mt-1 line-clamp-2 text-[11px] text-muted-foreground">{ability.description || "Sem descrição."}</p>
                              <div className="mt-1.5 flex flex-wrap items-center gap-2 font-mono text-[10px] text-zinc-500">
                                <span>Nível req. {ability.reqLevel ?? 1}</span>
                                <span>· {ability.cost || "—"}</span>
                                <span>· {ability.attr || "ESP"}</span>
                                {ability.damageType && <span>· {ability.damageType}</span>}
                                {ability.range && <span>· {ability.range}</span>}
                                <span>· T. {ability.trainingHours || 0}h ({progresso.grauAtual?.nome || "Aprendiz"})</span>
                              </div>
                              {ability.masterFeedback && (
                                <p className="mt-1 text-[10px] italic text-amber-200/70">&ldquo;{ability.masterFeedback}&rdquo;</p>
                              )}
                            </div>
                            <div className="flex shrink-0 flex-wrap items-center gap-1.5">
                              {status !== "aprovada" && (
                                <button
                                  type="button"
                                  onClick={() => handleApprove(hero, ability.id)}
                                  disabled={isSaving}
                                  className="flex min-h-9 items-center gap-1.5 rounded-lg border border-emerald-500/50 bg-emerald-500/15 px-2.5 text-[11px] font-bold text-emerald-300 transition hover:bg-emerald-500/25 disabled:opacity-50"
                                >
                                  <Check size={13} /> Aprovar
                                </button>
                              )}
                              {status !== "rejeitada" && (
                                <button
                                  type="button"
                                  onClick={() => openReject(hero.id, ability.id)}
                                  disabled={isSaving}
                                  className="flex min-h-9 items-center gap-1.5 rounded-lg border border-rose-500/50 bg-rose-500/15 px-2.5 text-[11px] font-bold text-rose-300 transition hover:bg-rose-500/25 disabled:opacity-50"
                                >
                                  <X size={13} /> Rejeitar
                                </button>
                              )}
                              <button
                                type="button"
                                onClick={() => openEdit(hero, ability)}
                                className="flex min-h-9 items-center gap-1.5 rounded-lg border border-primary/45 bg-primary/15 px-2.5 text-[11px] font-bold text-primary transition hover:bg-primary/25"
                              >
                                <Pencil size={13} /> Editar
                              </button>
                            </div>
                          </div>

                          {/* Rejeição em linha com justificativa */}
                          {isRejectPromptOpen && (
                            <div className="mt-2 rounded-lg border border-rose-500/40 bg-rose-950/25 p-2.5">
                              <label htmlFor={`reject-${hero.id}-${ability.id}`} className="text-[10px] font-bold uppercase tracking-wider text-rose-300">
                                Justificativa para o jogador (opcional)
                              </label>
                              <textarea
                                id={`reject-${hero.id}-${ability.id}`}
                                value={rejectReason}
                                onChange={(event) => setRejectReason(event.target.value)}
                                rows={2}
                                placeholder="Ex.: custo de PE alto demais para o nível 3..."
                                className="mt-1.5 w-full rounded-lg border border-rose-900/60 bg-black/30 px-2.5 py-2 text-xs text-rose-100 placeholder:text-rose-300/40 focus:border-rose-500 focus:outline-none"
                              />
                              <div className="mt-1.5 flex justify-end gap-1.5">
                                <button
                                  type="button"
                                  onClick={() => setRejectTarget(null)}
                                  className="rounded-lg px-2.5 py-1.5 text-[11px] font-semibold text-zinc-400 hover:text-zinc-200"
                                >
                                  Cancelar
                                </button>
                                <button
                                  type="button"
                                  onClick={() => handleConfirmReject(hero)}
                                  className="rounded-lg border border-rose-500/60 bg-rose-500/25 px-2.5 py-1.5 text-[11px] font-bold text-rose-200 hover:bg-rose-500/35"
                                >
                                  Confirmar rejeição
                                </button>
                              </div>
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                )}
              </section>
            );
          })}
        </div>
      )}

      {/* Modal de criação/edição (mesma do jogador, em modo mestre) */}
      <AbilityFormModal
        isOpen={modal.isOpen}
        ability={modal.ability}
        initialLevel={modal.ability?.reqLevel || 1}
        assignToLevel={null}
        isMaster
        onClose={() => setModal({ isOpen: false, hero: null, ability: null })}
        onSave={handleModalSave}
      />
    </div>
  );
}
