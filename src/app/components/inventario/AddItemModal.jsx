"use client";

import { useEffect, useRef, useState } from "react";
import { Package, X, Plus } from "lucide-react";
import { USE_KINDS } from "../../../lib/items";
import { CATEGORIAS_ITEM, MOEDAS, RARIDADES } from "../../../lib/market";

const inputClass =
  "h-9 w-full rounded-lg border border-[#4a3d2a]/60 bg-[#0f0d0a]/60 px-3 text-xs text-[#f1e7d2] outline-none placeholder:text-[#6b5a3e]/60 focus:border-[var(--theme-accent)]/60";
const labelClass =
  "flex flex-col gap-1.5 text-[10px] font-semibold uppercase tracking-wider text-[#cbb288]";

/**
 * Modal de cadastro completo de item para o inventário.
 * Nome (obrigatório), descrição, categoria, raridade, preço + moeda,
 * quantidade, peso e perfil de uso opcional (com durabilidade/cargas/efeito).
 */
export function AddItemModal({ open, onClose, onAdd }) {
  if (!open) return null;
  return <AddItemDialog onClose={onClose} onAdd={onAdd} />;
}

function AddItemDialog({ onClose, onAdd }) {
  const [name, setName] = useState("");
  const [descricao, setDescricao] = useState("");
  const [categoria, setCategoria] = useState(CATEGORIAS_ITEM[0]);
  const [raridade, setRaridade] = useState("Comum");
  const [qty, setQty] = useState(1);
  const [weight, setWeight] = useState(1);
  const [preco, setPreco] = useState("");
  const [moeda, setMoeda] = useState("ouro");
  const [kind, setKind] = useState("");
  const [durability, setDurability] = useState("");
  const [durabilityMax, setDurabilityMax] = useState("");
  const [charges, setCharges] = useState("");
  const [chargesMax, setChargesMax] = useState("");
  const [efeito, setEfeito] = useState("");
  const [duracao, setDuracao] = useState("");
  const [unidade, setUnidade] = useState("rodadas");
  const dialogRef = useRef(null);
  const nameRef = useRef(null);

  useEffect(() => {
    nameRef.current?.focus();
    const handleKeyDown = (event) => {
      if (event.key === "Escape") {
        event.stopPropagation();
        onClose();
      }
    };
    document.addEventListener("keydown", handleKeyDown, true);
    return () => document.removeEventListener("keydown", handleKeyDown, true);
  }, [onClose]);

  const trimmedName = name.trim();
  const canSubmit = trimmedName.length > 0;
  const isWeapon = kind === "melee" || kind === "ranged";
  const usesCharges = kind === "magic" || kind === "consumable";
  const rarity = RARIDADES.find((entry) => entry.id === raridade) || RARIDADES[0];

  const handleSubmit = (event) => {
    event.preventDefault();
    if (!canSubmit) return;

    const use = kind
      ? {
          kind,
          ...(isWeapon && {
            durability: durability === "" ? null : Math.max(0, Math.floor(Number(durability) || 0)),
            durabilityMax: durabilityMax === "" ? null : Math.max(1, Math.floor(Number(durabilityMax) || 1)),
          }),
          ...(usesCharges && {
            charges: charges === "" ? null : Math.max(0, Math.floor(Number(charges) || 0)),
            chargesMax: chargesMax === "" ? null : Math.max(1, Math.floor(Number(chargesMax) || 1)),
          }),
          ...(kind === "consumable" && {
            efeito: efeito.trim() || null,
            duracao: duracao === "" ? null : Math.max(0, Math.floor(Number(duracao) || 0)),
            unidade,
          }),
        }
      : undefined;

    onAdd({
      name: trimmedName,
      descricao: descricao.trim(),
      categoria,
      raridade,
      preco: preco === "" ? "" : Math.max(0, Number(preco) || 0),
      moeda,
      qty: Math.max(0, Math.floor(Number(qty) || 0)),
      weight: Math.max(0, Number(weight) || 0),
      use,
    });
    onClose();
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-md"
      role="presentation"
      onClick={onClose}
    >
      <form
        onSubmit={handleSubmit}
        className="relative flex max-h-[90vh] w-full max-w-lg flex-col overflow-hidden rounded-2xl border border-[#6b5a3e]/60 bg-[#16120d] text-[#f1e7d2] shadow-2xl shadow-black/80"
        role="dialog"
        aria-modal="true"
        aria-labelledby="add-item-modal-title"
        ref={dialogRef}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Cabeçalho */}
        <div className="flex items-center justify-between border-b border-white/10 bg-white/[0.02] px-5 py-4">
          <div className="flex items-center gap-2">
            <span className="flex h-8 w-8 items-center justify-center rounded-lg border border-[var(--theme-accent)]/30 bg-[var(--theme-accent)]/10 text-[var(--theme-accent)]">
              <Package size={16} />
            </span>
            <div>
              <h3 id="add-item-modal-title" className="text-sm font-semibold tracking-wide text-[#f5efdf]">
                Cadastrar Item
              </h3>
              <p className="text-[11px] text-[#cbb288]">Mochila &amp; equipamentos</p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Fechar"
            className="rounded-lg p-1.5 text-[#cbb288] transition-colors hover:bg-white/10 hover:text-[#f5efdf]"
          >
            <X size={18} />
          </button>
        </div>

        {/* Corpo */}
        <div data-lenis-prevent className="flex-1 overflow-y-auto px-5 py-4">
          <label className={labelClass}>
            Nome do item *
            <input
              ref={nameRef}
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Ex.: Espada Longa, Poção de Cura 2d4+2…"
              maxLength={120}
              required
              className={inputClass}
            />
          </label>

          <label className={`mt-3 ${labelClass}`}>
            Descrição
            <textarea
              value={descricao}
              onChange={(e) => setDescricao(e.target.value)}
              placeholder="Aparência, história, propriedades especiais…"
              maxLength={500}
              rows={2}
              className="w-full resize-none rounded-lg border border-[#4a3d2a]/60 bg-[#0f0d0a]/60 px-3 py-2 text-xs text-[#f1e7d2] outline-none placeholder:text-[#6b5a3e]/60 focus:border-[var(--theme-accent)]/60"
            />
          </label>

          <div className="mt-3 grid grid-cols-2 gap-3">
            <label className={labelClass}>
              Categoria
              <select value={categoria} onChange={(e) => setCategoria(e.target.value)} className={inputClass}>
                {CATEGORIAS_ITEM.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>
            </label>
            <label className={labelClass}>
              Raridade
              <select value={raridade} onChange={(e) => setRaridade(e.target.value)} className={inputClass}>
                {RARIDADES.map((entry) => (
                  <option key={entry.id} value={entry.id}>
                    {entry.label}
                  </option>
                ))}
              </select>
            </label>
          </div>
          <p className="mt-1.5">
            <span className={`inline-flex items-center rounded-md border px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider ${rarity.color}`}>
              {rarity.label}
            </span>
          </p>

          <div className="mt-3 grid grid-cols-2 gap-3">
            <label className={labelClass}>
              Quantidade
              <input
                type="number"
                min={0}
                max={9999}
                value={qty}
                onChange={(e) => setQty(e.target.value)}
                className={inputClass}
              />
            </label>
            <label className={labelClass}>
              Peso por unidade
              <input
                type="number"
                min={0}
                max={9999}
                step="0.1"
                value={weight}
                onChange={(e) => setWeight(e.target.value)}
                className={inputClass}
              />
            </label>
          </div>

          <div className="mt-3 grid grid-cols-5 gap-3">
            <label className={`col-span-3 ${labelClass}`}>
              Preço (opcional)
              <input
                type="number"
                min={0}
                max={99999999}
                value={preco}
                onChange={(e) => setPreco(e.target.value)}
                placeholder="—"
                className={inputClass}
              />
            </label>
            <label className={`col-span-2 ${labelClass}`}>
              Moeda
              <select value={moeda} onChange={(e) => setMoeda(e.target.value)} className={inputClass}>
                {MOEDAS.map((entry) => (
                  <option key={entry.id} value={entry.id}>
                    {entry.label}
                  </option>
                ))}
              </select>
            </label>
          </div>

          <label className={`mt-3 ${labelClass}`}>
            Perfil de uso (opcional)
            <select value={kind} onChange={(e) => setKind(e.target.value)} className={inputClass}>
              <option value="">Sem perfil — item comum</option>
              {USE_KINDS.map((option) => (
                <option key={option.id} value={option.id}>
                  {option.label}
                </option>
              ))}
            </select>
          </label>

          {isWeapon && (
            <div className="mt-3 grid grid-cols-2 gap-3">
              <label className={labelClass}>
                Durabilidade
                <input
                  type="number"
                  min={0}
                  max={999}
                  value={durability}
                  onChange={(e) => setDurability(e.target.value)}
                  placeholder="∞"
                  className={inputClass}
                />
              </label>
              <label className={labelClass}>
                Durabilidade máx.
                <input
                  type="number"
                  min={1}
                  max={999}
                  value={durabilityMax}
                  onChange={(e) => setDurabilityMax(e.target.value)}
                  placeholder="—"
                  className={inputClass}
                />
              </label>
            </div>
          )}

          {usesCharges && (
            <div className="mt-3 grid grid-cols-2 gap-3">
              <label className={labelClass}>
                Cargas
                <input
                  type="number"
                  min={0}
                  max={999}
                  value={charges}
                  onChange={(e) => setCharges(e.target.value)}
                  placeholder={kind === "consumable" ? "usa qtd." : "∞"}
                  className={inputClass}
                />
              </label>
              <label className={labelClass}>
                Cargas máx.
                <input
                  type="number"
                  min={1}
                  max={999}
                  value={chargesMax}
                  onChange={(e) => setChargesMax(e.target.value)}
                  placeholder="—"
                  className={inputClass}
                />
              </label>
            </div>
          )}

          {kind === "consumable" && (
            <>
              <label className={`mt-3 ${labelClass}`}>
                Efeito ao usar
                <input
                  type="text"
                  value={efeito}
                  onChange={(e) => setEfeito(e.target.value)}
                  placeholder="Ex.: Pés Leves, Pele de Pedra…"
                  maxLength={120}
                  className={inputClass}
                />
              </label>
              <div className="mt-3 grid grid-cols-2 gap-3">
                <label className={labelClass}>
                  Duração
                  <input
                    type="number"
                    min={0}
                    max={999}
                    value={duracao}
                    onChange={(e) => setDuracao(e.target.value)}
                    placeholder="—"
                    className={inputClass}
                  />
                </label>
                <label className={labelClass}>
                  Unidade
                  <select value={unidade} onChange={(e) => setUnidade(e.target.value)} className={inputClass}>
                    <option value="rodadas">Rodadas</option>
                    <option value="minutos">Minutos</option>
                  </select>
                </label>
              </div>
            </>
          )}
        </div>

        {/* Rodapé */}
        <div className="flex items-center justify-end gap-2 border-t border-white/10 bg-white/[0.02] px-5 py-3">
          <button
            type="button"
            onClick={onClose}
            className="h-9 rounded-lg border border-border px-4 text-xs font-semibold text-muted-foreground transition hover:border-white/20 hover:text-foreground active:scale-95"
          >
            Cancelar
          </button>
          <button
            type="submit"
            disabled={!canSubmit}
            className="flex h-9 items-center gap-1.5 rounded-lg border border-[var(--theme-accent)]/50 bg-[var(--theme-accent)]/15 px-4 text-xs font-bold uppercase tracking-wider text-[var(--theme-accent)] transition hover:bg-[var(--theme-accent)]/25 active:scale-95 disabled:cursor-not-allowed disabled:opacity-40"
          >
            <Plus size={14} />
            Cadastrar Item
          </button>
        </div>
      </form>
    </div>
  );
}
