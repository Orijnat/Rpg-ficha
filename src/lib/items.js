/**
 * Consumo automático de itens: munição, cargas/usos, durabilidade e efeitos temporizados de poções.
 *
 * O perfil de uso vive no próprio item (`item.use`, 100% opcional, persistido no JSON da ficha):
 *   {
 *     kind: "melee" | "ranged" | "consumable" | "magic" | null,
 *     ammo: <id do item de munição> | null,   // ranged — null = detectar automaticamente
 *     charges: number,                          // cargas atuais (magic / consumível com cargas)
 *     chargesMax: number | null,
 *     durability: number,                       // durabilidade atual (armas)
 *     durabilityMax: number | null,
 *     efeito: string | null,                    // nome do efeito (consumíveis)
 *     duracao: number | null,                   // duração do efeito
 *     unidade: "rodadas" | "minutos",
 *   }
 * Efeitos ativos ficam em `data.dadosExtras.activeEffects`:
 *   { id, nome, origem, remaining, unidade }
 */

const AMMO_KEYWORDS = ["flecha", "virote", "bala", "munição", "municao", "dardo", "flechas", "bala de"];

export const USE_KINDS = [
  { id: "melee", label: "Arma (corpo a corpo)" },
  { id: "ranged", label: "Arma à distância" },
  { id: "consumable", label: "Consumível / Poção" },
  { id: "magic", label: "Item mágico (cargas)" },
];

export function isAmmunitionName(name = "") {
  const lower = name.toLowerCase();
  return AMMO_KEYWORDS.some((kw) => lower.includes(kw));
}

export function findAmmoItem(inventory = [], boundAmmoId = null) {
  if (boundAmmoId) {
    return inventory.find((item) => item.id === boundAmmoId) || null;
  }
  return inventory.find((item) => isAmmunitionName(item.name) && Number(item.qty ?? 0) > 0) || null;
}

export function getUseKindLabel(item) {
  const kind = item?.use?.kind;
  return USE_KINDS.find((k) => k.id === kind)?.label || "Sem perfil";
}

/** Resumo do que será consumido ao usar — usado para pré-visualizar na UI. */
export function previewUseCost(item, inventory = []) {
  const use = item?.use;
  if (!use?.kind) return null;
  if (use.kind === "ranged") {
    const bound = findAmmoItem(inventory, use.ammo || null);
    return bound ? { texto: `−1 × ${bound.name}`, via: use.ammo ? "vinculada" : "auto" } : { texto: "sem munição na mochila", via: "ausente" };
  }
  if (use.kind === "melee") {
    return use.durability != null ? { texto: `Durabilidade ${use.durability} → ${Math.max(0, use.durability - 1)}` } : null;
  }
  if (use.kind === "magic") {
    return use.charges != null ? { texto: `Cargas ${use.charges} → ${Math.max(0, use.charges - 1)}` } : null;
  }
  if (use.kind === "consumable") {
    if (use.charges != null) return { texto: `Cargas ${use.charges} → ${Math.max(0, use.charges - 1)}` };
    return { texto: `−1 × ${item.name} (${item.qty ?? 1} → ${Math.max(0, Number(item.qty ?? 1) - 1)})` };
  }
  return null;
}

/**
 * Aplica o consumo de um uso do item. Não rola dados — apenas resolve inventário/efeitos.
 * @returns {{ ok: boolean, inventory: Array, activeEffects: Array, message: string, warnings: string[], removedEffect?: object|null }}
 */
export function applyItemUse(inventory = [], activeEffects = [], itemId) {
  const warnings = [];
  const index = inventory.findIndex((item) => item.id === itemId);
  if (index === -1) {
    return { ok: false, inventory, activeEffects, message: "Item não encontrado.", warnings };
  }
  const item = inventory[index];
  const use = item.use;
  if (!use?.kind) {
    return { ok: false, inventory, activeEffects, message: "Configure um perfil de uso para este item primeiro.", warnings };
  }

  const clone = (list) => list.map((entry) => ({ ...entry, use: entry.use ? { ...entry.use } : entry.use }));
  let inv = clone(inventory);
  let effects = [...activeEffects];
  const target = inv[index];

  if (use.kind === "melee") {
    if (use.durability != null) {
      if (use.durability <= 0) {
        return { ok: false, inventory, activeEffects, message: `${item.name} está quebrada (durabilidade 0).`, warnings };
      }
      target.use = { ...target.use, durability: Math.max(0, use.durability - 1) };
      if (use.durability - 1 === 0) warnings.push(`${item.name} QUEBROU! Durabilidade chegou a 0.`);
      return {
        ok: true, inventory: inv, activeEffects: effects, warnings,
        message: `Ataque com ${item.name} (durabilidade ${target.use.durability}/${use.durabilityMax ?? "?"}).`,
        logDados: { kind: "melee", durabilityAfter: target.use.durability },
      };
    }
    return { ok: true, inventory: inv, activeEffects: effects, warnings, message: `Uso de ${item.name}.`, logDados: { kind: "melee" } };
  }

  if (use.kind === "ranged") {
    const ammoBound = use.ammo || null;
    let ammoIndex = -1;
    if (ammoBound) {
      const idx = inv.findIndex((entry) => entry.id === ammoBound);
      const boundItem = idx >= 0 ? inv[idx] : null;
      ammoIndex = boundItem && Number(boundItem.qty ?? 0) > 0 ? idx : -1;
      if (idx >= 0 && ammoIndex === -1) {
        return { ok: false, inventory, activeEffects, message: `A munição vinculada (${boundItem.name}) está esgotada.`, warnings };
      }
    } else {
      ammoIndex = inv.findIndex((entry) => isAmmunitionName(entry.name) && Number(entry.qty ?? 0) > 0);
    }
    let durabilityNote = "";
    if (use.durability != null) {
      if (use.durability <= 0) {
        return { ok: false, inventory, activeEffects, message: `${item.name} está quebrada (durabilidade 0).`, warnings };
      }
      target.use = { ...target.use, durability: Math.max(0, use.durability - 1) };
      durabilityNote = ` (durabilidade ${target.use.durability}/${use.durabilityMax ?? "?"})`;
    }
    if (ammoIndex === -1) {
      if (ammoBound) {
        return { ok: false, inventory, activeEffects, message: `Munição vinculada não encontrada na mochila.`, warnings };
      }
      warnings.push("Nenhuma munição detectada — ataque rolou sem consumir nada.");
      return {
        ok: true, inventory: inv, activeEffects: effects, warnings,
        message: `Ataque com ${item.name}${durabilityNote} (sem munição consumida).`,
        logDados: { kind: "ranged", ammoConsumed: null, ...(durabilityNote ? { durabilityAfter: target.use?.durability } : {}) },
      };
    }
    const ammo = inv[ammoIndex];
    const newQty = Math.max(0, Number(ammo.qty ?? 1) - 1);
    inv[ammoIndex] = { ...ammo, qty: newQty, quantidade: newQty, esgotado: newQty === 0, depleted: newQty === 0 };
    return {
      ok: true, inventory: inv, activeEffects: effects, warnings,
      message: `Ataque com ${item.name}: ${newQty}× ${ammo.name} restante(s)${durabilityNote}.`,
      logDados: { kind: "ranged", ammoId: ammo.id, ammoName: ammo.name, ammoRemaining: newQty, ...(durabilityNote ? { durabilityAfter: target.use?.durability } : {}) },
    };
  }

  if (use.kind === "magic") {
    if (use.charges != null) {
      if (use.charges <= 0) {
        return { ok: false, inventory, activeEffects, message: `${item.name} está sem cargas.`, warnings };
      }
      target.use = { ...target.use, charges: Math.max(0, use.charges - 1) };
      if (use.charges - 1 === 0) warnings.push(`${item.name} ficou sem cargas.`);
      return {
        ok: true, inventory: inv, activeEffects: effects, warnings,
        message: `${item.name} usado (${target.use.charges} carga(s) restante(s)).`,
        logDados: { kind: "magic", chargesAfter: target.use.charges },
      };
    }
    return { ok: true, inventory: inv, activeEffects: effects, warnings, message: `${item.name} usado.`, logDados: { kind: "magic" } };
  }

  // Consumível / poção
  if (use.charges != null) {
    if (use.charges <= 0) {
      return { ok: false, inventory, activeEffects, message: `${item.name} está sem cargas.`, warnings };
    }
    target.use = { ...target.use, charges: Math.max(0, use.charges - 1) };
  } else {
    const currentQty = Math.max(0, Number(target.qty ?? 1) - 1);
    target.qty = currentQty;
    target.quantidade = currentQty;
    target.esgotado = currentQty === 0;
    target.depleted = currentQty === 0;
    if (currentQty === 0) warnings.push(`${item.name} acabou.`);
  }
  let effectCreated = null;
  if (use.efeito && Number(use.duracao) > 0) {
    effectCreated = {
      id: `fx-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
      nome: String(use.efeito).slice(0, 120),
      origem: item.name,
      remaining: Math.min(999, Math.floor(Number(use.duracao))),
      unidade: use.unidade === "minutos" ? "minutos" : "rodadas",
    };
    effects = [...effects, effectCreated];
  }
  return {
    ok: true, inventory: inv, activeEffects: effects, warnings,
    message: effectCreated
      ? `${item.name} usado — efeito "${effectCreated.nome}" ativo por ${effectCreated.remaining} ${effectCreated.unidade}.`
      : `${item.name} usado.`,
    logDados: { kind: "consumable", efeito: effectCreated?.nome || null, duracao: effectCreated?.remaining || null, unidade: effectCreated?.unidade || null },
  };
}

/** Decrementa efeitos de uma unidade e expira os zerados. */
export function tickActiveEffects(activeEffects = [], unidade = "rodadas", amount = 1) {
  const expired = [];
  const remaining = [];
  for (const effect of activeEffects) {
    if (effect?.unidade !== unidade) {
      remaining.push(effect);
      continue;
    }
    const next = Math.max(0, Number(effect.remaining ?? 0) - amount);
    if (next === 0) expired.push(effect);
    else remaining.push({ ...effect, remaining: next });
  }
  return { activeEffects: remaining, expired };
}
