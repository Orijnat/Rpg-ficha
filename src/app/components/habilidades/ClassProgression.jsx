"use client";

import { Sparkles, BookOpen, Lock, Flame, Shield, Zap, Sword } from "lucide-react";
import Link from "next/link";
import { TIPOS_HABILIDADE } from "../../../lib/abilities";

const renderTipoIcon = (type) => {
  switch (type) {
    case "magia":
      return <Flame size={12} className="text-purple-400" />;
    case "passiva":
      return <Shield size={12} className="text-emerald-400" />;
    case "reacao":
      return <Zap size={12} className="text-amber-400" />;
    default:
      return <Sword size={12} className="text-amber-400" />;
  }
};

/**
 * Habilidades de Nível da CLASSE (referência dinâmica ao catálogo do mestre).
 * Somente leitura liberada pelo nível do herói — nada é copiado para a ficha.
 */
export function ClassProgression({ classe = null, characterLevel = 1 }) {
  if (!classe) {
    return (
      <div className="rounded-2xl border border-zinc-800 bg-zinc-950/60 p-4 text-center">
        <BookOpen size={22} className="mx-auto text-zinc-600" />
        <p className="mt-2 text-xs text-zinc-400">
          Nenhuma classe selecionada ainda. Escolha a classe na{" "}
          <Link href="/personagem" className="text-primary underline underline-offset-2 hover:text-primary/80">
            ficha
          </Link>{" "}
          para liberar a progressão de habilidades da classe.
        </p>
      </div>
    );
  }

  const level = Math.max(1, Math.min(20, Number(characterLevel) || 1));
  const abilities = Array.isArray(classe.abilities) ? classe.abilities : [];
  const normalized = abilities
    .map((ability) => ({ ...ability, reqLevel: Number(ability?.reqLevel ?? ability?.nivel) || 1 }))
    .sort((a, b) => a.reqLevel - b.reqLevel || String(a.name).localeCompare(String(b.name)));
  const unlocked = normalized.filter((ability) => ability.reqLevel <= level);
  const locked = normalized.filter((ability) => ability.reqLevel > level);

  return (
    <section className="rounded-2xl border border-amber-500/30 bg-gradient-to-b from-amber-950/15 via-zinc-950/70 to-zinc-950/70 p-4 shadow-md">
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-amber-500/20 pb-3">
        <div className="flex items-center gap-2.5">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-amber-500/50 bg-amber-500/15 text-amber-300">
            <BookOpen size={18} />
          </div>
          <div>
            <span className="text-[10px] font-bold uppercase tracking-widest text-amber-400">
              Classe · Progressão Fixa
            </span>
            <h3 className="font-serif text-base font-bold text-zinc-100">
              {classe.name} <span className="text-xs font-normal text-zinc-400">· Dado de Vida {classe.hitDie}</span>
            </h3>
          </div>
        </div>
        <span className="rounded-full border border-amber-500/40 bg-amber-950/40 px-2.5 py-1 text-[10px] font-bold text-amber-300">
          {unlocked.length} liberada{unlocked.length === 1 ? "" : "s"} no nível {level}
        </span>
      </div>

      <p className="mt-2 text-[11px] text-zinc-400">
        Progressão fixa desta classe — igual para todos os heróis que a seguem —, desbloqueada ao subir de nível.
        Habilidades criadas por você passam pela aprovação do mestre e ficam disponíveis apenas para a sua ficha.
      </p>

      {normalized.length === 0 ? (
        <p className="mt-3 rounded-xl border border-zinc-800 bg-zinc-950/60 p-3 text-center text-xs text-zinc-500">
          O mestre ainda não cadastrou habilidades de nível para esta classe.
        </p>
      ) : (
        <ul className="mt-3 grid grid-cols-1 gap-2 lg:grid-cols-2">
          {unlocked.map((ability) => {
            const tipo = TIPOS_HABILIDADE[ability.type] || TIPOS_HABILIDADE.ativa;
            return (
              <li key={ability.id ?? `${ability.reqLevel}-${ability.name}`} className="rounded-xl border border-emerald-500/25 bg-emerald-950/10 p-3">
                <div className="flex flex-wrap items-center gap-1.5">
                  <span className="rounded-md border border-emerald-500/40 bg-emerald-950/50 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-emerald-300">
                    Nível {ability.reqLevel}
                  </span>
                  <span className={`inline-flex items-center gap-1 rounded-md border px-2 py-0.5 text-[10px] font-semibold ${tipo?.badge || "border-zinc-700 bg-zinc-800 text-zinc-300"}`}>
                    {renderTipoIcon(ability.type)}
                    {tipo?.nome || ability.type}
                  </span>
                  {ability.cost ? (
                    <span className="rounded-md border border-zinc-700 bg-zinc-900/80 px-2 py-0.5 text-[10px] font-mono font-bold text-zinc-300">
                      {ability.cost}
                    </span>
                  ) : null}
                </div>
                <h4 className="mt-1.5 font-serif text-sm font-bold text-zinc-100">{ability.name}</h4>
                <p className="mt-0.5 line-clamp-2 text-[11px] leading-snug text-zinc-400">{ability.description}</p>
                {(ability.rollFormula || ability.damageType || ability.range) && (
                  <p className="mt-1 font-mono text-[10px] text-zinc-500">
                    {[ability.rollFormula, ability.damageType, ability.range].filter(Boolean).join(" · ")}
                  </p>
                )}
              </li>
            );
          })}
          {locked.map((ability) => {
            const tipo = TIPOS_HABILIDADE[ability.type] || TIPOS_HABILIDADE.ativa;
            return (
              <li key={ability.id ?? `${ability.reqLevel}-${ability.name}`} className="rounded-xl border border-zinc-800/60 bg-zinc-950/40 p-3 opacity-60">
                <div className="flex flex-wrap items-center gap-1.5">
                  <span className="inline-flex items-center gap-1 rounded-md border border-zinc-800 bg-zinc-900/70 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-zinc-500">
                    <Lock size={10} />
                    Nível {ability.reqLevel}
                  </span>
                  <span className={`inline-flex items-center gap-1 rounded-md border px-2 py-0.5 text-[10px] font-semibold ${tipo?.badge || "border-zinc-700 bg-zinc-800 text-zinc-400"}`}>
                    {renderTipoIcon(ability.type)}
                    {tipo?.nome || ability.type}
                  </span>
                </div>
                <h4 className="mt-1.5 font-serif text-sm font-bold text-zinc-500">{ability.name}</h4>
                <p className="mt-0.5 line-clamp-2 text-[11px] leading-snug text-zinc-600">{ability.description}</p>
              </li>
            );
          })}
        </ul>
      )}
    </section>
  );
}
