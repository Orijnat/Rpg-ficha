"use client";

import { useEffect, useRef, useState } from "react";
import { Check, CloudOff, Crown, LoaderCircle, RefreshCw, Sparkles, Sword, TriangleAlert, Package, ChevronsUp, Dna } from "lucide-react";
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
  const { data, upd, syncStatus, syncError, retrySync, reloadFromCloud, overwriteCloud, updateDadosExtras, updateRace, updateClass, applyLevelUp } = useCharacter();
  const { requestRoll } = useDice();
  const { isMaster } = useAuth();
  const [levelFeedback, setLevelFeedback] = useState(null);
  const feedbackTimer = useRef(null);
  const [racas, setRacas] = useState(DEFAULT_RACES);
  const [classes, setClasses] = useState(DEFAULT_CLASSES);
  const capacity = calculateCapacity(data);
  const abilities = Array.isArray(data.abilities) ? data.abilities : [];
  const characterLevel = Math.max(1, Number(data.level) || 1);
  const xpInfo = calculateLevelFromXP(data.xp ?? data.dadosExtras?.xp ?? 0);
  const conMod = calculateModifier(data.CON);
  const hitDie = typeof data.dadosExtras?.hitDie === "string" && data.dadosExtras.hitDie ? data.dadosExtras.hitDie : "1d8";
  const race = racas.find((raca) => raca.id === data.raceId || raca.slug === data.dadosExtras?.race) ?? null;
  const classe = findSelectedClass(classes, data);
  const canLevelUp = characterLevel < xpInfo.level && characterLevel < 20;
  const xpMissing = Math.max(0, (xpInfo.nextLevelXP ?? 0) - Number(data.xp || 0));

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

  const syncLabels = {
    idle: null,
    saving: { label: "Salvando...", Icon: LoaderCircle, className: "text-primary" },
    saved: { label: "Salvo", Icon: Check, className: "text-emerald-400" },
    offline: { label: "Salvo localmente", Icon: CloudOff, className: "text-amber-300" },
    error: { label: "Falha ao sincronizar", Icon: TriangleAlert, className: "text-rose-300" },
    conflict: { label: "Conflito: revisão necessária", Icon: TriangleAlert, className: "text-amber-300" },
  };
  const syncIndicator = syncLabels[syncStatus];

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
            {syncIndicator && (
              <span className={`flex items-center gap-1.5 text-[10px] font-semibold uppercase tracking-wider ${syncIndicator.className}`} role="status" aria-live="polite">
                <syncIndicator.Icon size={13} className={syncStatus === "saving" ? "animate-spin" : ""} />
                {syncIndicator.label}
                {(syncStatus === "error" || syncStatus === "conflict") && (
                  <>
                    <button type="button" onClick={retrySync} className="ml-1 inline-flex min-h-8 items-center gap-1 rounded px-2 text-[10px] underline underline-offset-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary" aria-label="Tentar sincronizar novamente">
                      <RefreshCw size={11} aria-hidden="true" /> Tentar novamente
                    </button>
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
              </span>
            )}
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
            <button
              type="button"
              onClick={handleLevelUp}
              disabled={!canLevelUp}
              title={
                characterLevel >= 20
                  ? "Nível máximo alcançado"
                  : canLevelUp
                    ? `Rolar ${hitDie} + Mod(CON) e subir para o nível ${characterLevel + 1}`
                    : `Faltam ${xpMissing.toLocaleString("pt-BR")} XP para o nível ${characterLevel + 1}`
              }
              className="flex min-h-11 items-center justify-center gap-2 rounded-lg border border-amber-500/50 bg-amber-500/15 px-4 text-xs font-bold uppercase tracking-wider text-amber-300 transition hover:bg-amber-500/25 active:scale-95 disabled:cursor-not-allowed disabled:opacity-40"
            >
              <ChevronsUp size={15} />
              Subir de Nível
            </button>
            )}
            <span className="text-center font-mono text-[10px] text-muted-foreground sm:text-right">
              {characterLevel >= 20
                ? "Nível máximo (20)"
                : canLevelUp
                  ? `XP suficiente — ascensão disponível!`
                  : `Faltam ${xpMissing.toLocaleString("pt-BR")} XP para o nível ${characterLevel + 1}`}
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
