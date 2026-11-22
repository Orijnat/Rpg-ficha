"use client";

import { useEffect, useRef, useState } from "react";
import { Check, CloudOff, Crown, LoaderCircle, RefreshCw, Sparkles, Sword, TriangleAlert, Package, ChevronsUp, Dna, Lock, LockOpen, Plus, Trash2 } from "lucide-react";
import Link from "next/link";
import { useCharacter } from "../context/CharacterContext";
import { Card, EditableText, SectionHeader, StatBox } from "../components/ui";
import Aparencia from "../components/Aparencia";
import Pericia from "../components/Pericia";
import RecursosCombate from "../components/RecursosCombate";
import { calculateCapacity, calculateLevelFromXP, calculateModifier } from "../../lib/modifiers";
import { DEFAULT_RACES, formatRaceBonus } from "../../lib/races";
import { DEFAULT_CLASSES, findSelectedClass } from "../../lib/classes";
import { listRaces, listClasses } from "../../lib/api";
import { parseHitDie, hpGainFromRoll, levelUpGate } from "../../lib/leveling";
import { useDice } from "../context/DiceContext";
import { useAuth } from "../context/AuthContext";
import { DEFAULT_ABILITIES, isHabilidadeDesbloqueada } from "../../lib/abilities";

export default function Personagem() {
  const { data, upd, syncStatus, syncError, autoRetryAttempt, retrySync, reloadFromCloud, overwriteCloud, updateDadosExtras, updateRace, updateClass, applyLevelUp } = useCharacter();
  const { requestRoll } = useDice();
  const { isMaster, activeCharacter, loading: authLoading, logout } = useAuth();
  const [levelFeedback, setLevelFeedback] = useState(null);
  const [showSyncDetails, setShowSyncDetails] = useState(false);
  const feedbackTimer = useRef(null);
  const [racas, setRacas] = useState(DEFAULT_RACES);
  const [classes, setClasses] = useState(DEFAULT_CLASSES);
  const [acoes, setAcoes] = useState([]);
  const capacity = calculateCapacity(data);
  const abilities = Array.isArray(data.abilities) ? data.abilities : [];
  const characterLevel = Math.max(1, Number(data.level) || 1);
  const xpInfo = calculateLevelFromXP(data.xp ?? data.dadosExtras?.xp ?? 0);
  const conMod = calculateModifier(data.CON);
  const hitDie = typeof data.dadosExtras?.hitDie === "string" && data.dadosExtras.hitDie ? data.dadosExtras.hitDie : "1d8";
  const race = racas.find((raca) => raca.id === data.raceId || raca.slug === data.dadosExtras?.race) ?? null;
  const classe = findSelectedClass(classes, data);
  // Ascensão exige DOIS fatores: XP no limite da tabela E a liberação do mestre (o "feito").
  // DadosExtras.levelUpLiberado é consumido ao subir de nível (CharacterContext.applyLevelUp).
  const xpReady = characterLevel < xpInfo.level && characterLevel < 20;
  const liberado = Boolean(data.dadosExtras?.levelUpLiberado);
  const canLevelUp = xpReady && liberado;
  const xpMissing = Math.max(0, (xpInfo.nextLevelXP ?? 0) - Number(data.xp || 0));

  const addAcao = () => setAcoes([...acoes, { nome: "", tipo: "Ataque", dano: "", bonus: "" }]);
  const updateAcao = (index, patch) =>
    setAcoes(acoes.map((acao, i) => (i === index ? { ...acao, ...patch } : acao)));
  const removeAcao = (index) => setAcoes(acoes.filter((_, i) => i !== index));

  useEffect(() => () => window.clearTimeout(feedbackTimer.current), []);

  useEffect(() => {
    let active = true;
    listRaces()
      .then((rows) => {
        if (active && Array.isArray(rows) && rows.length > 0) setRacas(rows);
      })
      .catch(() => {});
    listClasses()
      .then((rows) => {
        if (active && Array.isArray(rows) && rows.length > 0) setClasses(rows);
      })
      .catch(() => {});
    return () => {
      active = false;
    };
  }, []);

  const handleLevelUp = async () => {
    if (xpReady && !liberado) {
      setLevelFeedback({ ok: false, message: "XP no limite, mas a ascensão não foi liberada — o mestre precisa liberar (requerido um feito) antes da subida." });
      return;
    }
    const gate = levelUpGate(characterLevel, data.xp ?? data.dadosExtras?.xp ?? 0);
    if (!gate.ok) {
      setLevelFeedback({ ok: false, message: gate.message });
      return;
    }
    const { count, sides, modifier } = parseHitDie(hitDie, { count: 1, sides: 8, modifier: 0 });
    // Pede a rolagem (virtual ou dado físico); o total já inclui o Mod(CON).
    const roll = await requestRoll({
      sides,
      count,
      modifier: modifier + conMod,
      label: `Dado de Vida · Nível ${characterLevel + 1}`,
      allowContest: false,
    });
    if (!roll) {
      setLevelFeedback({ ok: false, message: "Subida de nível cancelada — nada foi aplicado." });
      return;
    }
    const gain = hpGainFromRoll(roll.total, 0); // total já inclui Mod(CON)
    const applied = applyLevelUp(gain, { hitDie, roll: roll.total, conMod });
    setLevelFeedback(
      applied.ok
        ? { ok: true, message: `Você ascendeu ao nível ${applied.level}! Dado de Vida (${hitDie}) rolou ${roll.total} (inclui Mod(CON)) = +${applied.gain} HP máximo.` }
        : { ok: false, message: applied.message }
    );
    window.clearTimeout(feedbackTimer.current);
    feedbackTimer.current = window.setTimeout(() => setLevelFeedback(null), 7000);
  };
  const activeTraining = abilities.find((h) => h.isTraining && (h.approvalStatus || "aprovada") === "aprovada");
  const unlockedCount = abilities.filter((h) => isHabilidadeDesbloqueada(h, characterLevel) && (h.approvalStatus || "aprovada") === "aprovada").length;

  // Mestre logando sem ficha própria (ou conta sem ficha): nunca abrir a ficha de um herói
  if (!authLoading && !activeCharacter) {
    return (
      <div className="flex min-h-[60vh] flex-col items-center justify-center gap-5 text-center">
        <div className="flex h-16 w-16 items-center justify-center rounded-2xl border border-primary/40 bg-primary/10 text-primary">
          <Crown size={30} />
        </div>
        <div>
          <h2 className="font-cinzel text-xl font-black text-foreground sm:text-2xl">
            {isMaster ? "Modo Mestre — nenhuma ficha própria" : "Nenhuma ficha vinculada"}
          </h2>
          <p className="mt-2 max-w-md text-sm text-muted-foreground">
            {isMaster
              ? "Como mestre, você conduz a mesa. Para abrir a ficha completa de um herói em uma nova guia, use os botões «Acessar Ficha» no Painel do Mestre."
              : "Nenhuma ficha foi encontrada para esta conta."}
          </p>
        </div>
        <Link
          href={isMaster ? "/admin" : "/perfil"}
          className="flex min-h-11 items-center gap-2 rounded-xl border border-primary/50 bg-primary/15 px-5 text-xs font-bold uppercase tracking-wider text-primary transition hover:bg-primary/25"
        >
          {isMaster ? "Ir para o Painel do Mestre" : "Ir para o Perfil"}
        </Link>
      </div>
    );
  }

  const syncLabels = {
    idle: null,
    saving: { label: "Salvando...", Icon: LoaderCircle, className: "text-primary" },
    saved: { label: "Salvo", Icon: Check, className: "text-emerald-400" },
    offline: { label: "Salvo localmente", Icon: CloudOff, className: "text-amber-300" },
    error: { label: "Falha ao sincronizar", Icon: TriangleAlert, className: "text-rose-300" },
    conflict: { label: "Conflito: revisão necessária", Icon: TriangleAlert, className: "text-amber-300" },
  };
  const syncIndicator = syncLabels[syncStatus];
  const syncDetails = Array.isArray(syncError?.details) ? syncError.details : [];

  return (
    <div className="space-y-5">
      {/* Folio Header do Personagem */}
      <Card className="p-5 sm:p-7">
        <div className="flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
          <div className="min-w-0">
            <div className="mb-2 flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.3em] text-primary">
              <span>✦</span>
              <Crown size={14} className="text-primary drop-shadow-[0_0_6px_var(--primary)]" />
              <span>Registro do aventureiro</span>
              <span>✦</span>
            </div>
            <h2 className="font-cinzel text-3xl sm:text-5xl font-black tracking-tight gold-gradient-text">
              <EditableText value={data.name} onChange={(value) => upd("name", value)} label="Nome do aventureiro" />
            </h2>
            <p className="mt-2.5 flex items-center gap-2 font-journal text-sm sm:text-base italic text-amber-100/80">
              <Sparkles size={15} className="text-primary animate-pulse" />
              Um novo capítulo aguarda ser inscrito neste códice vivo.
            </p>
          </div>
          <div className="flex flex-col gap-2.5 sm:items-end">
            <span className="flex min-h-8 items-center gap-1.5 text-[10px] font-semibold uppercase tracking-wider" role="status" aria-live="polite">
              {syncIndicator ? (
                <>
                <syncIndicator.Icon size={13} className={`${syncIndicator.className} ${syncStatus === "saving" ? "animate-spin" : ""}`} />
                <span className={syncIndicator.className}>{syncIndicator.label}</span>
                {(syncStatus === "error" || syncStatus === "conflict") && (
                  <>
                    <button type="button" onClick={retrySync} className="ml-1 inline-flex min-h-8 items-center gap-1 rounded px-2 text-[10px] underline underline-offset-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary" aria-label="Tentar sincronizar novamente">
                      <RefreshCw size={11} aria-hidden="true" /> Tentar novamente
                    </button>
                    {syncStatus === "error" && autoRetryAttempt > 0 && (
                      <span className="ml-1 inline-flex min-h-8 items-center text-[9px] text-muted-foreground" title="Em caso de erro o app mantém seus dados locais e tenta sincronizar sozinho em segundo plano (backoff 5s → 60s, até 5 tentativas).">
                        tentativa automática {autoRetryAttempt}/5
                      </span>
                    )}
                    {(syncError?.status === 401 || syncError?.status === 403) && (
                      <button type="button" onClick={() => { logout(); }} className="ml-1 inline-flex min-h-8 items-center gap-1 rounded border border-rose-500/50 bg-rose-500/15 px-2 text-[10px] font-bold text-rose-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary" aria-label="Sair e entrar novamente">
                        Sair e entrar de novo
                      </button>
                    )}
                    {syncStatus === "conflict" && (
                      <>
                        <button type="button" onClick={reloadFromCloud} className="ml-1 inline-flex min-h-8 items-center gap-1 rounded px-2 text-[10px] underline underline-offset-2 text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary" aria-label="Descartar o rascunho local e manter a versão do servidor">
                          Manter da nuvem
                        </button>
                        <button type="button" onClick={overwriteCloud} className="ml-1 inline-flex min-h-8 items-center gap-1 rounded px-2 text-[10px] underline underline-offset-2 text-amber-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary" aria-label="Sobrescrever a versão do servidor com o rascunho local">
                          Manter meus dados
                        </button>
                      </>
                    )}
                  </>
                )}
                </>
                ) : (
                  <span aria-hidden="true">&nbsp;</span>
                )}
            </span>
            <div className="relative flex h-4 w-full items-center justify-end sm:w-auto">
              <p className="max-w-[16rem] break-words text-right font-mono text-[9px] normal-case leading-4 text-rose-300/90 sm:max-w-[20rem]" role="alert">
                {syncStatus === "error" && syncError ? (
                  <>
                    {syncError.status ? `HTTP ${syncError.status} · ` : ""}{syncError.message || "Falha desconhecida"}
                    {syncDetails.length > 0 && (
                      <button type="button" onClick={() => setShowSyncDetails((v) => !v)} className="ml-1 underline underline-offset-2 hover:text-rose-200 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-rose-400" aria-expanded={showSyncDetails}>
                        {syncDetails.length} campo{syncDetails.length > 1 ? "s" : ""}
                      </button>
                    )}
                  </>
                ) : "\u00A0"}
              </p>
              {showSyncDetails && syncDetails.length > 0 && (
                <ul className="absolute right-0 top-full z-50 mt-1 max-h-44 w-72 space-y-1 overflow-y-auto rounded-lg border border-rose-500/40 bg-card p-2 text-left font-mono text-[9px] leading-snug text-rose-200/90 shadow-2xl" data-lenis-prevent aria-label="Campos inválidos retornados pelo servidor">
                  {syncDetails.map((issue, index) => (
                    <li key={index}>
                      <strong className="text-rose-300">{issue?.field ?? "?"}</strong>
                      {": "}{issue?.message ?? "valor inválido"}
                    </li>
                  ))}
                  <li>
                    <button type="button" onClick={() => setShowSyncDetails(false)} className="mt-1 text-[9px] font-bold uppercase tracking-wider text-muted-foreground underline underline-offset-2 hover:text-foreground">
                      Fechar
                    </button>
                  </li>
                </ul>
              )}
            </div>
            <div className="grid grid-cols-2 gap-2.5 sm:min-w-56">
              <div className="medallion-plate rounded-xl p-3 text-center">
                <span className="block font-cinzel text-[10px] uppercase tracking-wider text-muted-foreground/80">Nível</span>
                <span className="font-cinzel text-2xl sm:text-3xl font-black gold-gradient-text font-tabular">{data.level || 1}</span>
              </div>
              <div className="medallion-plate rounded-xl p-3 text-center">
                <span className="block font-cinzel text-[10px] uppercase tracking-wider text-muted-foreground/80">Ofício / Classe</span>
                <EditableText value={data.customClass || data.job || ""} onChange={(value) => upd("customClass", value)} className="font-cinzel text-xs sm:text-sm font-bold text-foreground hover:text-primary transition-colors" label="Classe ou ofício" />
              </div>
            </div>
          </div>
        </div>

        {/* Barra resumida de Carga do Inventário */}
        <div className="mt-5 flex flex-wrap items-center justify-between gap-2 border-t border-primary/25 pt-4 text-xs">
          <Link
            href="/inventario"
            className="flex items-center gap-2 font-medium text-muted-foreground hover:text-primary transition"
          >
            <Package size={15} className="text-primary" />
            <span className="font-cinzel text-[11px] uppercase tracking-wider">Carga da Mochila:</span>
            <strong className={`font-mono font-tabular ${capacity.isOverloaded ? "text-rose-400" : "text-foreground"}`}>
              {capacity.carried} / {capacity.max} unidades
            </strong>
            {capacity.isOverloaded && (
              <span className="wax-seal bg-rose-950/80 text-rose-300 border border-rose-500/60 shadow-[0_0_10px_#f43f5e]">
                Sobrecarregado!
              </span>
            )}
          </Link>
          <div className="alchemy-vial relative h-2.5 w-32 sm:w-48 overflow-hidden rounded-full border border-white/10 bg-black/70 p-0.5">
            <div
              className={`h-full rounded-full transition-all duration-300 ${
                capacity.isOverloaded
                  ? "bg-rose-500 shadow-[0_0_10px_#f43f5e]"
                  : capacity.percentage > 80
                  ? "bg-amber-400 shadow-[0_0_10px_#fbbf24]"
                  : "bg-primary shadow-[0_0_10px_var(--primary)]"
              }`}
              style={{ width: `${capacity.percentage}%` }}
            />
            <div className="alchemy-vial-glass" />
          </div>
        </div>

        {/* Atalho de Habilidades & Treinamento */}
        <div className="mt-3.5 flex flex-wrap items-center justify-between gap-2 border-t border-primary/20 pt-3.5 text-xs">
          <Link
            href="/habilidades"
            className="flex items-center gap-2 font-medium text-muted-foreground hover:text-primary transition"
          >
            <Sparkles size={15} className="text-amber-400" />
            <span className="font-cinzel text-[11px] uppercase tracking-wider">Grimório de Habilidades:</span>
            <strong className="text-foreground font-tabular">
              {unlockedCount} / {abilities.length} despertadas
            </strong>
            {activeTraining && (
              <span className="wax-seal bg-amber-500/25 text-amber-200 border border-amber-400/50 shadow-[0_0_10px_rgba(245,158,11,0.25)]">
                🎯 Treino: {activeTraining.name} ({activeTraining.trainingHours || 0}h)
              </span>
            )}
          </Link>
          <Link
            href="/habilidades"
            className="btn-rpg !px-3 !py-1 !text-[10px] !normal-case"
          >
            Ver Grimório Completo →
          </Link>
        </div>
      </Card>

      {/* Ações & Ataques */}
      <Card>
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <SectionHeader
            title="Ações & Ataques"
            subtitle="Golpes, técnicas e combates diretos do herói"
            icon={<Sword size={15} />}
          />
          <button
            type="button"
            onClick={addAcao}
            className="flex min-h-9 items-center gap-1.5 rounded-lg border border-primary/40 bg-primary/10 px-3 text-xs font-bold text-primary hover:bg-primary/20"
          >
            <Plus size={14} /> Adicionar Ação / Ataque
          </button>
        </div>

        <div className="mt-3 space-y-2">
          {acoes.map((acao, index) => (
            <div key={index} className="grid gap-2 rounded-xl border border-border bg-secondary/40 p-3 sm:grid-cols-[1fr_140px_140px_120px_36px]">
              <input
                type="text"
                value={acao.nome || ""}
                onChange={(e) => updateAcao(index, { nome: e.target.value })}
                placeholder="Nome da ação / ataque"
                className="w-full rounded border border-border bg-input-background px-2 py-1 text-xs font-bold text-foreground outline-none focus:border-primary"
              />
              <input
                type="text"
                value={acao.tipo || ""}
                onChange={(e) => updateAcao(index, { tipo: e.target.value })}
                placeholder="Tipo (Ataque, Magia...)"
                className="rounded border border-border bg-input-background px-2 py-1 text-xs text-foreground outline-none focus:border-primary"
              />
              <input
                type="text"
                value={acao.dano || ""}
                onChange={(e) => updateAcao(index, { dano: e.target.value })}
                placeholder="Dano / Efeito"
                className="rounded border border-border bg-input-background px-2 py-1 text-xs text-foreground outline-none focus:border-primary"
              />
              <input
                type="text"
                value={acao.bonus || ""}
                onChange={(e) => updateAcao(index, { bonus: e.target.value })}
                placeholder="Bônus / Alvo"
                className="rounded border border-border bg-input-background px-2 py-1 text-xs text-foreground outline-none focus:border-primary"
              />
              <div className="flex items-end justify-center">
                <button
                  type="button"
                  onClick={() => removeAcao(index)}
                  className="rounded p-1.5 text-muted-foreground hover:bg-destructive/15 hover:text-destructive"
                  title="Remover ação"
                >
                  <Trash2 size={15} />
                </button>
              </div>
            </div>
          ))}
        </div>
      </Card>

      {/* Raça & Ascensão */}
      <Card>
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="min-w-0">
            <SectionHeader
              title="Raça, Classe & Ascensão"
              subtitle="A raça soma seu bônus 5e; a classe define o Dado de Vida e as habilidades de nível"
              icon={<Dna size={15} />}
            />
            <div className="mt-2 flex flex-wrap items-center gap-2">
              <label className="flex flex-col gap-1 text-[9px] font-bold uppercase tracking-wider text-muted-foreground">
                Raça
                <select
                  value={race?.id || ""}
                  onChange={(e) => {
                    const option = e.target.value ? racas.find((raca) => raca.id === e.target.value) : null;
                    if (option) updateRace(option); // a raça só pode ser definida uma vez
                  }}
                  disabled={Boolean(race)}
                  className="h-9 rounded-lg border border-border bg-input-background px-2.5 text-xs font-normal text-foreground outline-none focus:border-primary disabled:cursor-not-allowed disabled:opacity-70 normal-case"
                  aria-label="Raça do herói"
                  title={race ? "A raça já foi definida e só o mestre pode alterar." : "Escolha com cuidado: a raça só pode ser definida uma vez."}
                >
                  {!race && <option value="">Selecione a raça (uma única vez)</option>}
                  {racas.map((option) => (
                    <option key={option.id} value={option.id}>
                      {option.name} ({formatRaceBonus(option)})
                    </option>
                  ))}
                </select>
              </label>
              <label className="flex flex-col gap-1 text-[9px] font-bold uppercase tracking-wider text-muted-foreground">
                Classe
                <select
                  value={classe?.id || ""}
                  onChange={(e) => {
                    const option = e.target.value ? classes.find((entry) => entry.id === e.target.value) : null;
                    if (option) updateClass(option); // a classe só pode ser definida uma vez
                  }}
                  disabled={Boolean(classe)}
                  className="h-9 rounded-lg border border-border bg-input-background px-2.5 text-xs font-normal text-foreground outline-none focus:border-primary disabled:cursor-not-allowed disabled:opacity-70 normal-case"
                  aria-label="Classe do herói"
                  title={classe ? "A classe já foi definida e só o mestre pode alterar." : "Escolha com cuidado: a classe só pode ser definida uma vez."}
                >
                  {!classe && <option value="">Selecione a classe (uma única vez)</option>}
                  {classes.map((option) => (
                    <option key={option.id} value={option.id}>
                      {option.name} ({option.hitDie})
                    </option>
                  ))}
                </select>
              </label>
              <span className="max-w-[16rem] text-[10px] text-muted-foreground">
                {classe
                  ? `${classe.description ?? ""} ${race?.trait ? race.trait : ""} · Raça e classe já seladas — só o mestre pode alterar.`
                  : "Defina a raça e a classe uma única vez. A raça SOMA seu bônus sobre seus status; a classe define o Dado de Vida e a vida máxima (nível 1) — depois, só o mestre pode mudar."}
              </span>
            </div>
            <p className="mt-2 font-mono text-[10px] uppercase tracking-wider text-muted-foreground">
              Dado de Vida (classe): <span className="text-primary">{hitDie}</span> · Mod(CON){" "}
              <span className={conMod >= 0 ? "text-emerald-400" : "text-rose-400"}>
                {conMod >= 0 ? "+" : ""}{conMod}
              </span>
            </p>
          </div>
          <div className="flex shrink-0 flex-col items-stretch gap-1.5 sm:items-end">
            {!isMaster ? (
              <span className="max-w-[180px] rounded-lg border border-primary/30 bg-primary/10 px-3 py-2 text-center font-mono text-[10px] uppercase tracking-wider text-muted-foreground">
                Apenas o mestre promove o herói de nível
              </span>
            ) : (
              <>
                <button
                  type="button"
                  onClick={() => updateDadosExtras({ levelUpLiberado: !liberado })}
                  aria-pressed={liberado}
                  title={liberado
                    ? "Ascensão liberada — o herói pode subir de nível. Clique para revogar."
                    : "Liberar a ascensão: o XP chegou ao limite, mas é necessário um feito. «Subir de Nível» só habilita após esta liberação."}
                  className={`flex min-h-11 items-center justify-center gap-2 rounded-lg border px-4 text-xs font-bold uppercase tracking-wider transition active:scale-95 ${
                    liberado
                      ? "border-emerald-500/50 bg-emerald-500/15 text-emerald-300 hover:bg-emerald-500/25"
                      : "border-border bg-secondary text-muted-foreground hover:border-primary hover:text-primary"
                  }`}
                >
                  {liberado ? <LockOpen size={15} aria-hidden="true" /> : <Lock size={15} aria-hidden="true" />}
                  {liberado ? "Ascensão liberada" : "Liberar Ascensão"}
                </button>
                <button
                  type="button"
                  onClick={handleLevelUp}
                  disabled={!canLevelUp}
                  title={
                    characterLevel >= 20
                      ? "Nível máximo alcançado"
                      : !xpReady
                        ? `Faltam ${xpMissing.toLocaleString("pt-BR")} XP para o nível ${characterLevel + 1}`
                        : !liberado
                          ? "XP no limite — a ascensão precisa ser liberada pelo mestre (feito)"
                          : `Rolar ${hitDie} + Mod(CON) e subir para o nível ${characterLevel + 1}`
                  }
                  className="flex min-h-11 items-center justify-center gap-2 rounded-lg border border-amber-500/50 bg-amber-500/15 px-4 text-xs font-bold uppercase tracking-wider text-amber-300 transition hover:bg-amber-500/25 active:scale-95 disabled:cursor-not-allowed disabled:opacity-40"
                >
                  <ChevronsUp size={15} />
                  Subir de Nível
                </button>
              </>
            )}
            <span className="text-center font-mono text-[10px] text-muted-foreground sm:text-right">
              {characterLevel >= 20
                ? "Nível máximo (20)"
                : !xpReady
                  ? `Faltam ${xpMissing.toLocaleString("pt-BR")} XP para o nível ${characterLevel + 1}`
                  : liberado
                    ? "XP suficiente e ascensão liberada — o herói pode subir!"
                    : "XP no limite — aguardando o mestre liberar a ascensão (feito)"}
            </span>
          </div>
        </div>
        {levelFeedback && (
          <div
            role="status"
            className={`mt-3 rounded-lg border px-3 py-2 text-xs ${
              levelFeedback.ok
                ? "border-emerald-500/40 bg-emerald-950/25 text-emerald-300"
                : "border-rose-500/40 bg-rose-950/30 text-rose-300"
            }`}
          >
            <p className="font-semibold">{levelFeedback.message}</p>
          </div>
        )}
      </Card>

      {/* Atributos Fundamentais */}
      <Card>
        <SectionHeader
          title="Atributos Fundamentais"
          subtitle="Você define os status base; a raça soma o bônus 5e na seleção (+1 em tudo para Humano, etc.)"
          icon={<Sword size={15} />}
        />
        <div className="grid grid-cols-4 gap-2 sm:grid-cols-7 sm:gap-3">
          {["FOR", "DES", "CON", "SAB", "ESP", "CAR", "INT"].map((attr) => (
            <StatBox key={attr} label={attr} value={data[attr]} onChange={(value) => upd(attr, value)} />
          ))}
        </div>
      </Card>

      {/* Seção de Recursos de Combate */}
      <Card>
        <RecursosCombate />
      </Card>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <Card><Aparencia /></Card>
        <Card><Pericia /></Card>
      </div>
    </div>
  );
}
