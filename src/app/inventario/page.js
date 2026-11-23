"use client";

import { useState, useMemo, useEffect, useRef } from "react";
import {
  ChevronDown,
  ChevronUp,
  Coins,
  Package,
  Plus,
  Trash2,
  Search,
  Dices,
  ArrowUpDown,
  Filter,
  AlertTriangle,
  Sparkles,
  Swords,
  Wrench,
  ChevronsRight,
  Minus,
  Zap,
  Archive,
} from "lucide-react";
import { useCharacter } from "../context/CharacterContext";
import { useDice } from "../context/DiceContext";
import { Card, EditableNumber, EditableText, SectionHeader } from "../components/ui";
import { AddItemModal } from "../components/inventario/AddItemModal";
import { MOEDAS, RARIDADES } from "../../lib/market";
import { DepositToBankModal } from "../components/inventario/DepositToBankModal";
import { calculateCapacity, consumeAmmunition } from "../../lib/modifiers";
import {
  isAmmunitionName,
  previewUseCost,
  USE_KINDS,
  getUseKindLabel,
} from "../../lib/items";

export default function InventarioPage() {
  const {
    data,
    upd,
    addItem,
    depositToBank,
    removeItem,
    updItem,
    consumeItem,
    configureItemUse,
    tickActiveEffect,
    advanceRoundEffects,
    removeActiveEffect,
  } = useCharacter();
  const { requestRoll } = useDice();
  const [searchTerm, setSearchTerm] = useState("");
  const [sortBy, setSortBy] = useState("default"); // "default" | "name" | "qty-desc" | "qty-asc"
  const [filterType, setFilterType] = useState("all"); // "all" | "weapons" | "consumables" | "others"
  const [expandedUseId, setExpandedUseId] = useState(null);
  const [addModalOpen, setAddModalOpen] = useState(false);
  const [bankItem, setBankItem] = useState(null);
  const [bankNotice, setBankNotice] = useState(null);
  const bankTimer = useRef(null);
  const [useFeedback, setUseFeedback] = useState(null); // { ok, message, warnings[] }
  const feedbackTimer = useRef(null);

  useEffect(() => () => {
    window.clearTimeout(feedbackTimer.current);
    window.clearTimeout(bankTimer.current);
  }, []);

  const activeEffects = useMemo(() => data.dadosExtras?.activeEffects || [], [data.dadosExtras?.activeEffects]);
  const usableItems = useMemo(
    () => data.inventory.filter((item) => item?.use?.kind),
    [data.inventory]
  );
  const ammoItems = useMemo(
    () => data.inventory.filter((item) => isAmmunitionName(item.name)),
    [data.inventory]
  );
  const unconfiguredItems = useMemo(
    () => data.inventory.filter((item) => !item?.use?.kind),
    [data.inventory]
  );

  const showUseFeedback = (res) => {
    if (!res) return;
    setUseFeedback({ ok: Boolean(res.ok), message: res.message, warnings: res.warnings || [] });
    window.clearTimeout(feedbackTimer.current);
    feedbackTimer.current = window.setTimeout(() => setUseFeedback(null), 5000);
  };

  const freeBankSlots = useMemo(
    () => (data.bankSlots || []).filter((slot) => !slot?.item).length,
    [data.bankSlots]
  );

  const showBankNotice = (res) => {
    setBankNotice(res);
    window.clearTimeout(bankTimer.current);
    bankTimer.current = window.setTimeout(() => setBankNotice(null), 5000);
  };

  const handleSendToBank = (item, qty) => {
    const slotIndex = (data.bankSlots || []).findIndex((slot) => !slot?.item);
    if (slotIndex === -1) {
      showBankNotice({ ok: false, message: "O Banco está cheio — nenhum espaço vazio." });
      return;
    }
    depositToBank(slotIndex, item.id, qty);
    showBankNotice({ ok: true, message: `${qty}× ${item.name} guardado${qty > 1 ? "s" : ""} no Banco.` });
    setBankItem(null);
  };

  // Gatilho automático: rolar o dado do item também aplica o consumo do perfil.
  // Poções/mágicos sem fórmula no nome não rolam (só consumir); ataques sempre rolam.
  const handleUseAndRoll = (item) => {
    const isAttack = item?.use?.kind === "melee" || item?.use?.kind === "ranged";
    const formula = extractDiceFormula(item?.name || "");
    if (item?.use?.kind) {
      const res = consumeItem(item.id);
      showUseFeedback(res);
      if (!res.ok) return; // bloqueado (sem munição/cargas/quebrada): não rola
      if (isAttack || formula) {
        requestRoll({
          sides: 20,
          mode: "normal",
          label: `Dano/Efeito: ${item.name}`,
        });
      }
      return;
    }
    requestRoll({
      sides: 20,
      mode: "normal",
      label: `Dano/Efeito: ${item.name}`,
    });
  };

  const handleAddUseProfile = (itemId) => {
    if (!itemId) return;
    const item = data.inventory.find((entry) => entry.id === itemId);
    if (!item) return;
    const lower = item.name.toLowerCase();
    const kind = /arco|besta|pistola|rifle|revolver|flecha/.test(lower)
      ? "ranged"
      : /poção|pocao|gotas|erva/.test(lower)
        ? "consumable"
        : "melee";
    configureItemUse(itemId, { kind });
    setExpandedUseId(itemId);
  };

  const capacity = useMemo(() => calculateCapacity(data), [data]);

  // Checa se o nome do item parece conter uma fórmula de dado (ex: "1d6", "2d8+2")
  const extractDiceFormula = (name) => {
    const match = name.match(/(\d+)?d(\d+)([+-]\d+)?/i);
    return match ? match[0] : null;
  };

  const isWeaponOrAttack = (name = "") => {
    const lower = name.toLowerCase();
    return Boolean(
      extractDiceFormula(name) ||
        lower.includes("espada") ||
        lower.includes("adaga") ||
        lower.includes("arco") ||
        lower.includes("besta") ||
        lower.includes("rifle") ||
        lower.includes("pistola") ||
        lower.includes("revolver") ||
        lower.includes("machado") ||
        lower.includes("lança")
    );
  };

  const isConsumableOrAmmo = (name = "") => {
    const lower = name.toLowerCase();
    return Boolean(
      lower.includes("bala") ||
        lower.includes("munição") ||
        lower.includes("poção") ||
        lower.includes("óleo") ||
        lower.includes("erva") ||
        lower.includes("flor") ||
        lower.includes("virote") ||
        lower.includes("flecha")
    );
  };

  const filteredAndSortedItems = useMemo(() => {
    let result = [...data.inventory];

    // Filtro por tipo
    if (filterType === "weapons") {
      result = result.filter((item) => isWeaponOrAttack(item.name));
    } else if (filterType === "consumables") {
      result = result.filter((item) => isConsumableOrAmmo(item.name));
    } else if (filterType === "others") {
      result = result.filter((item) => !isWeaponOrAttack(item.name) && !isConsumableOrAmmo(item.name));
    }

    // Busca textual
    if (searchTerm.trim()) {
      const term = searchTerm.toLowerCase();
      result = result.filter((item) => item.name.toLowerCase().includes(term));
    }

    // Ordenação
    if (sortBy === "name") {
      result.sort((a, b) => a.name.localeCompare(b.name, "pt-BR"));
    } else if (sortBy === "qty-desc") {
      result.sort((a, b) => (Number(b.qty) || 0) - (Number(a.qty) || 0));
    } else if (sortBy === "qty-asc") {
      result.sort((a, b) => (Number(a.qty) || 0) - (Number(b.qty) || 0));
    }

    return result;
  }, [data.inventory, filterType, searchTerm, sortBy]);

  return (
    <div className="space-y-4">
      {/* Seção de Moedas */}
      <Card>
        <SectionHeader title="Tesouro & Moedas" icon={<Coins size={14} />} />
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          {[
            { label: "Platina", key: "platina", fallbackKey: "platina", color: "#a5b4fc" },
            { label: "Ouro", key: "ouro", color: "#fbbf24" },
            { label: "Prata", key: "prata", color: "#cbd5e1" },
            { label: "Cobre", key: "cobre", color: "#f97316" },
          ].map(({ label, key, fallbackKey, color }) => {
            const val = data[key] !== undefined ? data[key] : (data[fallbackKey] ?? 0);

            return (
              <div
                key={key}
                className="flex flex-col items-center gap-1.5 rounded-xl border border-white/5 bg-white/[0.02] p-3 transition-colors hover:border-white/10"
              >
                <span
                  className="text-[11px] font-bold uppercase tracking-widest"
                  style={{ color }}
                >
                  {label}
                </span>
                <EditableNumber
                  value={val}
                  onChange={(value) => {
                    upd(key, value);
                    if (fallbackKey) upd(fallbackKey, value);
                  }}
                  className="text-center font-mono text-xl font-bold text-[var(--theme-title)]"
                  min={0}
                />
              </div>
            );
          })}
        </div>
      </Card>

      {/* Efeitos Ativos — poções e bênçãos com duração */}
      <Card>
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-white/10 pb-3">
          <div className="flex items-center gap-3">
            <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-violet-500/40 bg-violet-500/15 text-violet-300">
              <Sparkles size={16} aria-hidden="true" />
            </span>
            <div>
              <h3 className="font-cinzel text-xs sm:text-sm font-bold uppercase tracking-[0.2em] text-foreground">
                Efeitos Ativos ({activeEffects.length})
              </h3>
              <p className="text-[10px] text-muted-foreground">
                Poções e bênçãos temporizadas — «Rodada +1» decrementa as de rodadas
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={() => {
              const expired = advanceRoundEffects();
              if (expired.length > 0) {
                showUseFeedback({
                  ok: true,
                  message: expired.map((effect) => `"${effect.nome}" expirou.`).join(" "),
                  warnings: [],
                });
              }
            }}
            className="flex items-center gap-1.5 rounded-lg border border-primary/40 bg-primary/10 px-3 py-1.5 text-xs font-semibold text-primary transition hover:bg-primary/20 active:scale-95"
            title="Avançar 1 rodada: decrementa todos os efeitos temporizados em rodadas e expira os zerados"
          >
            <ChevronsRight size={13} /> Rodada +1
          </button>
        </div>

        {activeEffects.length === 0 ? (
          <p className="py-5 text-center text-xs italic text-muted-foreground">
            Nenhum efeito ativo. Configure uma poção como consumível com duração no painel abaixo e use-a — o efeito aparece aqui com contagem regressiva.
          </p>
        ) : (
          <div data-lenis-prevent className="mt-3 max-h-48 space-y-1.5 overflow-y-auto pr-1">
            {activeEffects.map((effect) => (
              <div
                key={effect.id}
                className="flex items-center gap-2 rounded-lg border border-violet-500/25 bg-violet-950/20 px-2.5 py-2 text-xs"
              >
                <Sparkles size={13} className="shrink-0 text-violet-300" aria-hidden="true" />
                <div className="min-w-0 flex-1">
                  <p className="truncate font-semibold text-violet-200">{effect.nome}</p>
                  <p className="truncate text-[10px] text-muted-foreground">de {effect.origem}</p>
                </div>
                <span className="shrink-0 rounded border border-violet-500/30 bg-violet-500/15 px-1.5 py-0.5 font-mono text-[10px] font-bold text-violet-200">
                  {effect.remaining} {effect.unidade === "minutos" ? (effect.remaining === 1 ? "min" : "min") : (effect.remaining === 1 ? "rodada" : "rodadas")}
                </span>
                <button
                  type="button"
                  onClick={() => {
                    const res = tickActiveEffect(effect.id, 1);
                    if (res?.expired) {
                      showUseFeedback({ ok: true, message: `"${res.expired.nome}" expirou.`, warnings: [] });
                    }
                  }}
                  className="flex h-7 w-7 shrink-0 items-center justify-center rounded border border-border bg-secondary text-muted-foreground transition hover:border-primary/40 hover:text-primary"
                  title="Passar 1 unidade de tempo"
                  aria-label={`Decrementar duração de ${effect.nome}`}
                >
                  <Minus size={12} />
                </button>
                <button
                  type="button"
                  onClick={() => removeActiveEffect(effect.id)}
                  className="flex h-7 w-7 shrink-0 items-center justify-center rounded border border-border bg-secondary text-muted-foreground transition hover:border-rose-500/40 hover:text-rose-400"
                  title="Remover efeito"
                  aria-label={`Remover efeito ${effect.nome}`}
                >
                  <Trash2 size={12} />
                </button>
              </div>
            ))}
          </div>
        )}
      </Card>

      {/* Usar & Consumir — painel dedicado de ação com consumo automático */}
      <Card>
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-white/10 pb-3">
          <div className="flex items-center gap-3">
            <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-primary/40 bg-primary/15 text-primary">
              <Zap size={16} aria-hidden="true" />
            </span>
            <div>
              <h3 className="font-cinzel text-xs sm:text-sm font-bold uppercase tracking-[0.2em] text-foreground">
                Usar & Consumir
              </h3>
              <p className="text-[10px] text-muted-foreground">
                Atacar/usar consome munição, cargas, durabilidade e ativa efeitos
              </p>
            </div>
          </div>
          {unconfiguredItems.length > 0 && (
            <select
              value=""
              onChange={(e) => handleAddUseProfile(e.target.value)}
              className="h-8 rounded-lg border border-border bg-input-background px-2 text-xs text-foreground outline-none focus:border-primary"
              aria-label="Adicionar perfil de uso a um item"
            >
              <option value="">+ Configurar um item…</option>
              {unconfiguredItems.map((item) => (
                <option key={item.id} value={item.id}>
                  {item.name}
                </option>
              ))}
            </select>
          )}
        </div>

        {useFeedback && (
          <div
            role="status"
            className={`mt-3 rounded-lg border px-3 py-2 text-xs ${
              useFeedback.ok
                ? "border-emerald-500/40 bg-emerald-950/25 text-emerald-300"
                : "border-rose-500/40 bg-rose-950/30 text-rose-300"
            }`}
          >
            <p className="font-semibold">{useFeedback.message}</p>
            {useFeedback.warnings.length > 0 && (
              <ul className="mt-1 list-inside list-disc text-[10px] opacity-90">
                {useFeedback.warnings.map((warning, idx) => (
                  <li key={idx}>{warning}</li>
                ))}
              </ul>
            )}
          </div>
        )}

        {usableItems.length === 0 ? (
          <p className="py-5 text-center text-xs italic text-muted-foreground">
            Nenhum item com perfil de uso ainda. Escolha um item no seletor acima para configurar como ele consome algo.
          </p>
        ) : (
          <div data-lenis-prevent className="mt-3 max-h-72 space-y-1.5 overflow-y-auto pr-1">
            {usableItems.map((item) => {
              const use = item.use || {};
              const isAttack = use.kind === "melee" || use.kind === "ranged";
              const preview = previewUseCost(item, data.inventory);
              const broken = (use.kind === "melee" || use.kind === "ranged") && use.durability != null && use.durability <= 0;
              const depleted = (use.kind === "magic" || use.kind === "consumable") && use.charges != null && use.charges <= 0;
              const isExpanded = expandedUseId === item.id;

              return (
                <div key={item.id} className="rounded-lg border border-white/10 bg-background/40 p-2">
                  <div className="flex flex-wrap items-center gap-2">
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-xs font-semibold text-foreground">{item.name}</p>
                      <p className="text-[10px] text-muted-foreground">
                        {getUseKindLabel(item)}
                        {preview && <span className="text-amber-300/90"> · {preview.texto}</span>}
                        {broken && <span className="text-rose-400"> · QUEBRADA</span>}
                        {depleted && <span className="text-rose-400"> · SEM CARGAS</span>}
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() => handleUseAndRoll(item)}
                      className="flex h-8 items-center gap-1.5 rounded-lg border border-primary/40 bg-primary/15 px-2.5 text-[10px] font-bold uppercase tracking-wide text-primary transition hover:bg-primary/30 active:scale-95"
                      title={isAttack ? "Rolar ataque e consumir (munição/durabilidade)" : "Usar e consumir (cargas/quantidade + efeito)"}
                    >
                      {isAttack ? <Swords size={12} /> : <Sparkles size={12} />}
                      {isAttack ? "Atacar" : "Usar"}
                    </button>
                    <button
                      type="button"
                      onClick={() => setExpandedUseId(isExpanded ? null : item.id)}
                      className="flex h-8 w-8 items-center justify-center rounded-lg border border-border text-muted-foreground transition hover:border-primary/40 hover:text-primary"
                      aria-label={`Configurar perfil de uso de ${item.name}`}
                      aria-expanded={isExpanded}
                      title="Configurar consumo"
                    >
                      <Wrench size={13} />
                    </button>
                  </div>

                  {isExpanded && (
                    <div className="mt-2 grid grid-cols-2 gap-2 border-t border-white/10 pt-2 text-[10px] sm:grid-cols-4">
                      <label className="col-span-2 flex flex-col gap-1 text-muted-foreground">
                        Perfil de uso
                        <select
                          value={use.kind || "melee"}
                          onChange={(e) => configureItemUse(item.id, { kind: e.target.value })}
                          className="h-8 rounded border border-border bg-input-background px-2 text-foreground outline-none focus:border-primary"
                        >
                          {USE_KINDS.map((kind) => (
                            <option key={kind.id} value={kind.id}>
                              {kind.label}
                            </option>
                          ))}
                        </select>
                      </label>

                      {(use.kind === "melee" || use.kind === "ranged") && (
                        <>
                          <label className="flex flex-col gap-1 text-muted-foreground">
                            Durabilidade
                            <input
                              type="number"
                              min={0}
                              max={999}
                              value={use.durability ?? ""}
                              placeholder="∞"
                              onChange={(e) =>
                                configureItemUse(item.id, {
                                  durability: e.target.value === "" ? null : Math.max(0, Math.floor(Number(e.target.value) || 0)),
                                })
                              }
                              className="h-8 rounded border border-border bg-input-background px-2 text-foreground outline-none focus:border-primary"
                            />
                          </label>
                          <label className="flex flex-col gap-1 text-muted-foreground">
                            Durabilidade máx.
                            <input
                              type="number"
                              min={1}
                              max={999}
                              value={use.durabilityMax ?? ""}
                              placeholder="—"
                              onChange={(e) =>
                                configureItemUse(item.id, {
                                  durabilityMax: e.target.value === "" ? null : Math.max(1, Math.floor(Number(e.target.value) || 1)),
                                })
                              }
                              className="h-8 rounded border border-border bg-input-background px-2 text-foreground outline-none focus:border-primary"
                            />
                          </label>
                        </>
                      )}

                      {use.kind === "ranged" && (
                        <label className="col-span-2 flex flex-col gap-1 text-muted-foreground">
                          Munição vinculada
                          <select
                            value={use.ammo || ""}
                            onChange={(e) => configureItemUse(item.id, { ammo: e.target.value || null })}
                            className="h-8 rounded border border-border bg-input-background px-2 text-foreground outline-none focus:border-primary"
                          >
                            <option value="">Detectar automaticamente (flechas/virotes/balas)</option>
                            {ammoItems.map((ammo) => (
                              <option key={ammo.id} value={ammo.id}>
                                {ammo.name} ({ammo.qty}×)
                              </option>
                            ))}
                          </select>
                        </label>
                      )}

                      {(use.kind === "magic" || use.kind === "consumable") && (
                        <>
                          <label className="flex flex-col gap-1 text-muted-foreground">
                            Cargas
                            <input
                              type="number"
                              min={0}
                              max={999}
                              value={use.charges ?? ""}
                              placeholder={use.kind === "consumable" ? "usa qtd." : "∞"}
                              onChange={(e) =>
                                configureItemUse(item.id, {
                                  charges: e.target.value === "" ? null : Math.max(0, Math.floor(Number(e.target.value) || 0)),
                                })
                              }
                              className="h-8 rounded border border-border bg-input-background px-2 text-foreground outline-none focus:border-primary"
                            />
                          </label>
                          <label className="flex flex-col gap-1 text-muted-foreground">
                            Cargas máx.
                            <input
                              type="number"
                              min={1}
                              max={999}
                              value={use.chargesMax ?? ""}
                              placeholder="—"
                              onChange={(e) =>
                                configureItemUse(item.id, {
                                  chargesMax: e.target.value === "" ? null : Math.max(1, Math.floor(Number(e.target.value) || 1)),
                                })
                              }
                              className="h-8 rounded border border-border bg-input-background px-2 text-foreground outline-none focus:border-primary"
                            />
                          </label>
                        </>
                      )}

                      {use.kind === "consumable" && (
                        <>
                          <label className="col-span-2 flex flex-col gap-1 text-muted-foreground">
                            Efeito ao usar
                            <input
                              type="text"
                              value={use.efeito || ""}
                              placeholder="Ex.: Pés Leves, Pele de Pedra…"
                              maxLength={120}
                              onChange={(e) => configureItemUse(item.id, { efeito: e.target.value || null })}
                              className="h-8 rounded border border-border bg-input-background px-2 text-foreground outline-none focus:border-primary"
                            />
                          </label>
                          <label className="flex flex-col gap-1 text-muted-foreground">
                            Duração
                            <input
                              type="number"
                              min={0}
                              max={999}
                              value={use.duracao ?? ""}
                              placeholder="—"
                              onChange={(e) =>
                                configureItemUse(item.id, {
                                  duracao: e.target.value === "" ? null : Math.max(0, Math.floor(Number(e.target.value) || 0)),
                                })
                              }
                              className="h-8 rounded border border-border bg-input-background px-2 text-foreground outline-none focus:border-primary"
                            />
                          </label>
                          <label className="flex flex-col gap-1 text-muted-foreground">
                            Unidade
                            <select
                              value={use.unidade || "rodadas"}
                              onChange={(e) => configureItemUse(item.id, { unidade: e.target.value })}
                              className="h-8 rounded border border-border bg-input-background px-2 text-foreground outline-none focus:border-primary"
                            >
                              <option value="rodadas">Rodadas</option>
                              <option value="minutos">Minutos</option>
                            </select>
                          </label>
                        </>
                      )}

                      <div className="col-span-2 flex items-end justify-end sm:col-span-4">
                        <button
                          type="button"
                          onClick={() => {
                            configureItemUse(item.id, { kind: null });
                            setExpandedUseId(null);
                          }}
                          className="text-[10px] font-semibold uppercase text-muted-foreground underline-offset-2 hover:text-rose-400 hover:underline"
                        >
                          Remover perfil de uso
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </Card>

      {/* Seção de Inventário e Mochila */}
      <Card>
        {/* Barra de Capacidade de Carga */}
        <div className="mb-4 rounded-xl border border-white/10 bg-background/50 p-3.5">
          <div className="flex flex-wrap items-center justify-between gap-2 text-xs">
            <div className="flex items-center gap-2">
              <Package size={15} className="text-primary" />
              <span className="font-serif font-bold text-foreground">Capacidade de Carga (peso)</span>
              {capacity.isOverloaded && (
                <span className="flex items-center gap-1 rounded bg-rose-500/20 px-2 py-0.5 text-[10px] font-bold text-rose-300">
                  <AlertTriangle size={11} /> Sobrecarga!
                </span>
              )}
            </div>
            <div className="flex items-center gap-1.5 font-mono text-xs">
              <span className={capacity.isOverloaded ? "font-bold text-rose-400" : "font-bold text-foreground"}>
                {capacity.carried}
              </span>
              <span className="text-muted-foreground">/</span>
              <span className="text-muted-foreground">{capacity.max} unidades</span>
              <span className="text-[10px] text-muted-foreground">({capacity.percentage}%)</span>
            </div>
          </div>
          <div className="mt-2 h-2 w-full overflow-hidden rounded-full border border-white/10 bg-background/80">
            <div
              className={`h-full transition-all duration-300 ${
                capacity.isOverloaded
                  ? "bg-rose-500"
                  : capacity.percentage > 80
                  ? "bg-amber-400"
                  : "bg-primary"
              }`}
              style={{ width: `${capacity.percentage}%` }}
            />
          </div>
        </div>

        <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <SectionHeader
              title={`Mochila & Equipamentos (${filteredAndSortedItems.length}/${data.inventory.length})`}
              icon={<Package size={14} />}
            />
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {/* Seletor de Ordenação */}
            <div className="flex items-center gap-1 rounded-lg border border-white/10 bg-white/5 px-2 py-1 text-xs text-muted-foreground">
              <ArrowUpDown size={12} className="text-primary" />
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="bg-transparent text-xs text-foreground outline-none cursor-pointer"
              >
                <option value="default" className="bg-card text-foreground">Ordem original</option>
                <option value="name" className="bg-card text-foreground">Nome (A-Z)</option>
                <option value="qty-desc" className="bg-card text-foreground">Maior Quantidade</option>
                <option value="qty-asc" className="bg-card text-foreground">Menor Quantidade</option>
              </select>
            </div>

            {/* Barra de Pesquisa */}
            <div className="relative">
              <Search
                size={13}
                className="pointer-events-none absolute left-2.5 top-1/2 -translate-y-1/2 text-muted-foreground"
              />
              <input
                type="text"
                placeholder="Buscar item..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-36 rounded-lg border border-white/10 bg-white/5 py-1 pl-8 pr-2 text-xs text-foreground outline-none transition focus:w-48 focus:border-primary"
              />
            </div>

            <button
              onClick={() => setAddModalOpen(true)}
              className="flex items-center gap-1.5 rounded-lg border border-primary/40 bg-primary/10 px-3 py-1.5 text-xs font-semibold text-primary transition-all hover:bg-primary/20 active:scale-95"
            >
              <Plus size={13} /> Novo Item
            </button>
          </div>
        </div>

        {/* Chips de Filtro por Categoria */}
        <div className="mb-3 flex flex-wrap items-center gap-1.5 border-b border-white/10 pb-3 text-xs">
          <span className="flex items-center gap-1 text-[11px] font-medium text-muted-foreground mr-1">
            <Filter size={11} /> Filtrar:
          </span>
          {[
            { id: "all", label: "Todos" },
            { id: "weapons", label: "Armas & Fórmulas" },
            { id: "consumables", label: "Munições & Poções" },
            { id: "others", label: "Outros" },
          ].map((chip) => (
            <button
              key={chip.id}
              type="button"
              onClick={() => setFilterType(chip.id)}
              className={`rounded-md px-2.5 py-1 text-xs font-medium transition ${
                filterType === chip.id
                  ? "bg-primary text-primary-foreground font-semibold"
                  : "border border-white/10 bg-white/5 text-muted-foreground hover:bg-white/10 hover:text-foreground"
              }`}
            >
              {chip.label}
            </button>
          ))}
        </div>

        {bankNotice && (
          <div
            role="status"
            className={`mb-3 rounded-lg border px-3 py-2 text-xs ${
              bankNotice.ok
                ? "border-emerald-500/40 bg-emerald-950/25 text-emerald-300"
                : "border-rose-500/40 bg-rose-950/30 text-rose-300"
            }`}
          >
            <p className="font-semibold">{bankNotice.message}</p>
          </div>
        )}

        <div className="space-y-1">
          {filteredAndSortedItems.map((item) => {
            const formula = extractDiceFormula(item.name);

            return (
              <div
                key={item.id}
                className="group flex items-center gap-3 rounded-lg border border-transparent px-2 py-2 transition-all hover:border-white/5 hover:bg-white/[0.02]"
              >
                <div className="min-w-0 flex-1" title={item.descricao || undefined}>
                  <EditableText
                    value={item.name}
                    onChange={(value) => updItem(item.id, { name: value })}
                    className="text-xs font-medium text-[#e8d5b0] transition hover:text-[var(--theme-title)]"
                  />
                  {(item.raridade || item.categoria || item.preco != null) && (
                    <p className="mt-0.5 flex flex-wrap items-center gap-1.5 text-[9px] leading-tight text-muted-foreground">
                      {item.raridade && (
                        <span
                          className={`inline-flex items-center rounded border px-1 py-px font-semibold uppercase tracking-wider ${
                            RARIDADES.find((entry) => entry.id === item.raridade)?.color || "text-zinc-400 border-zinc-700"
                          }`}
                        >
                          {item.raridade}
                        </span>
                      )}
                      {item.categoria && <span className="truncate">{item.categoria}</span>}
                      {item.preco != null && (
                        <span className="font-mono">
                          {Number(item.preco).toLocaleString("pt-BR")} {MOEDAS.find((m) => m.id === item.moeda)?.sigla || "PO"}
                        </span>
                      )}
                    </p>
                  )}
                </div>

                <div className="flex shrink-0 items-center gap-1 text-[10px] text-muted-foreground" title="Peso por unidade">
                  <span>Peso</span>
                  <EditableNumber
                    value={item.weight ?? item.peso ?? 1}
                    onChange={(value) => updItem(item.id, { weight: value })}
                    className="w-10 text-center font-mono text-xs font-bold text-muted-foreground"
                    min={0}
                  />
                </div>

                {/* Botão de Rolagem Rápida se o item tiver dados no nome (ex: 1d6) */}
                {formula && (
                  <button
                    onClick={() => handleUseAndRoll(item)}
                    className="flex items-center gap-1 rounded border border-primary/30 bg-primary/15 px-2 py-0.5 text-[10px] font-mono font-bold text-primary hover:bg-primary/30"
                    title={`Rolar teste com ${item.name}`}
                  >
                    <Dices size={10} />
                    <span>{formula}</span>
                  </button>
                )}

                {/* Botão "Usar 1" para munições e consumíveis */}
                {isConsumableOrAmmo(item.name) && (
                  <button
                    type="button"
                    onClick={() => {
                      const result = consumeAmmunition(data.inventory, item.id, 1);
                      if (result.success) {
                        result.inventory.forEach((updatedItem, idx) => {
                          if (idx === data.inventory.findIndex((i) => i.id === item.id)) {
                            updItem(item.id, {
                              qty: updatedItem.qty,
                              quantidade: updatedItem.quantidade,
                              esgotado: updatedItem.esgotado,
                              depleted: updatedItem.depleted,
                            });
                          }
                        });
                      }
                    }}
                    disabled={item.esgotado || (item.qty !== undefined && item.qty <= 0)}
                    className={`flex items-center gap-1 rounded border px-2 py-0.5 text-[10px] font-bold transition active:scale-95 ${
                      item.esgotado || (item.qty !== undefined && item.qty <= 0)
                        ? "cursor-not-allowed border-white/10 bg-white/5 text-muted-foreground opacity-40"
                        : "border-amber-500/40 bg-amber-500/10 text-amber-400 hover:bg-amber-500/25"
                    }`}
                    title={item.esgotado ? "Esgotado" : "Usar 1 unidade"}
                  >
                    {item.esgotado ? "Esgotado" : "Usar 1"}
                  </button>
                )}

                {/* Contador de Quantidade */}
                <div className="flex shrink-0 items-center gap-1">
                  <button
                    type="button"
                    aria-label={`Diminuir quantidade de ${item.name || "item"}`}
                    onClick={() => updItem(item.id, { qty: Math.max(0, item.qty - 1) })}
                    className="flex h-7 w-7 items-center justify-center rounded border border-border bg-secondary text-xs text-muted-foreground transition hover:border-primary/40 hover:bg-primary/10 hover:text-primary"
                    title="Diminuir"
                  >
                    <ChevronDown size={12} />
                  </button>

                  <EditableNumber
                    value={item.qty}
                    onChange={(value) => updItem(item.id, { qty: value })}
                    className="w-8 text-center font-mono text-xs font-bold text-[var(--theme-accent)]"
                    min={0}
                    label={`Quantidade de ${item.name || "item"}`}
                  />

                  <button
                    type="button"
                    aria-label={`Aumentar quantidade de ${item.name || "item"}`}
                    onClick={() => updItem(item.id, { qty: item.qty + 1 })}
                    className="flex h-7 w-7 items-center justify-center rounded border border-border bg-secondary text-xs text-muted-foreground transition hover:border-primary/40 hover:bg-primary/10 hover:text-primary"
                    title="Aumentar"
                  >
                    <ChevronUp size={12} />
                  </button>
                </div>

                {/* Enviar ao Banco */}
                <button
                  type="button"
                  aria-label={`Guardar ${item.name || "item"} no Banco`}
                  onClick={() => setBankItem(item)}
                  className="rounded p-1 text-muted-foreground transition-all hover:bg-amber-500/10 hover:text-amber-400"
                  title="Guardar no Banco"
                >
                  <Archive size={13} />
                </button>

                {/* Remover Item */}
                <button
                  type="button"
                  aria-label={`Excluir item ${item.name || ""}`}
                  onClick={() => removeItem(item.id)}
                  className="rounded p-1 text-[#8b1a1a] opacity-0 transition-all group-hover:opacity-100 hover:bg-rose-500/10 hover:text-rose-400"
                  title="Excluir item"
                >
                  <Trash2 size={13} />
                </button>
              </div>
            );
          })}

          {filteredAndSortedItems.length === 0 && (
            <p className="py-8 text-center text-xs italic text-muted-foreground">
              {searchTerm || filterType !== "all"
                ? "Nenhum item corresponde aos filtros selecionados."
                : "Mochila vazia."}
            </p>
          )}
        </div>
      </Card>
      <AddItemModal
        open={addModalOpen}
        onClose={() => setAddModalOpen(false)}
        onAdd={(payload) => addItem(payload)}
      />
      <DepositToBankModal
        item={bankItem}
        freeSlots={freeBankSlots}
        onClose={() => setBankItem(null)}
        onConfirm={(qty) => handleSendToBank(bankItem, qty)}
      />
    </div>
  );
}
