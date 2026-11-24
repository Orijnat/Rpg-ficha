"use client";

import { useState } from "react";
import { Coins, LogOut, ArrowRightLeft } from "lucide-react";
import { Card, SectionHeader } from "../ui";
import { BankSlotGrid } from "./BankSlotGrid";
import { BankChestModal } from "./BankChestModal";
import { convertCurrency, CURRENCY_RATES } from "../../../lib/modifiers";

const CURRENCY_LABELS = {
  latina: { label: "Latina (Platina)", color: "#e6dcc2" },
  ouro:   { label: "Ouro",            color: "#fbbf24" },
  prata:  { label: "Prata",           color: "#cfc9bb" },
  cobre:  { label: "Cobre",           color: "#f97316" },
};

const CURRENCY_KEYS = Object.keys(CURRENCY_RATES);

/**
 * Componente exibido quando o banco está desbloqueado
 * Mostra header com controles, grid de slots, modal de depósito e conversor de moedas
 */
export function BankUnlockedView({
  bankSlots,
  inventory,
  onLogout,
  onDeposit,
  onWithdraw,
}) {
  const [activeSlot, setActiveSlot] = useState(null); // índice do slot com o modal aberto

  return (
    <div className="space-y-4">
      <Card>
        {/* Header com título e controles */}
        <div className="mb-3 flex items-center justify-between">
          <SectionHeader title="Banco de Azedarack" icon={<Coins size={14} />} />

          <BankHeaderControls onLogout={onLogout} />
        </div>

        {/* Grid de slots */}
        <BankSlotGrid slots={bankSlots} onSlotClick={setActiveSlot} />
      </Card>

      {/* Modal de depósito/retirada */}
      <BankChestModal
        slotIndex={activeSlot}
        slot={activeSlot !== null ? bankSlots[activeSlot] : null}
        inventory={inventory}
        onClose={() => setActiveSlot(null)}
        onDeposit={onDeposit}
        onWithdraw={onWithdraw}
      />

      {/* Conversor de Moedas */}
      <CurrencyConverter />
    </div>
  );
}

/**
 * Controles do header do banco.
 * Apenas a opção de sair (fechar o cofre).
 */
function BankHeaderControls({ onLogout }) {
  return (
    <button
      onClick={onLogout}
      className="flex items-center gap-1.5 rounded-lg border border-white/10 bg-white/5 px-3 py-1.5 font-cinzel text-[11px] font-bold uppercase tracking-wider text-[var(--theme-subtitle)] transition hover:border-primary/40 hover:text-[var(--theme-accent)]"
      title="Fechar o cofre"
      aria-label="Fechar o cofre"
    >
      <LogOut size={13} />
      Sair
    </button>
  );
}

/**
 * Seção de conversor de moedas do banco.
 * Usa convertCurrency de modifiers.js para conversão entre latina/ouro/prata/cobre.
 */
function CurrencyConverter() {
  const [amount, setAmount] = useState("1");
  const [from, setFrom] = useState("ouro");
  const [to, setTo] = useState("cobre");
  const [result, setResult] = useState(null);

  const handleConvert = () => {
    const parsed = Number(amount);
    if (!isNaN(parsed) && parsed >= 0) {
      const conversion = convertCurrency(parsed, from, to);
      setResult(conversion);
    }
  };

  const handleSwap = () => {
    setFrom(to);
    setTo(from);
    setResult(null);
  };

  const selectClass =
    "rounded-lg border border-white/10 bg-white/5 px-2 py-1.5 text-xs text-foreground outline-none focus:border-primary cursor-pointer";

  return (
    <Card>
      <SectionHeader
        title="Conversor de Moedas"
        icon={<ArrowRightLeft size={14} />}
      />

      <div className="mt-3 space-y-3">
        {/* Linha principal: quantidade + moeda origem + seta + moeda destino + botão */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Quantidade */}
          <input
            type="number"
            min={0}
            value={amount}
            onChange={(e) => {
              setAmount(e.target.value);
              setResult(null);
            }}
            className="w-24 rounded-lg border border-white/10 bg-white/5 px-2 py-1.5 text-center font-mono text-xs text-[var(--theme-title)] outline-none focus:border-primary"
            placeholder="Qtd"
            aria-label="Quantidade a converter"
          />

          {/* Moeda origem */}
          <select
            value={from}
            onChange={(e) => { setFrom(e.target.value); setResult(null); }}
            className={selectClass}
            aria-label="Moeda de origem"
          >
            {CURRENCY_KEYS.map((key) => (
              <option key={key} value={key} className="bg-card text-foreground">
                {CURRENCY_LABELS[key].label}
              </option>
            ))}
          </select>

          {/* Botão Trocar */}
          <button
            type="button"
            onClick={handleSwap}
            className="flex h-7 w-7 items-center justify-center rounded-full border border-white/10 bg-white/5 text-muted-foreground transition hover:border-primary/40 hover:bg-primary/10 hover:text-primary"
            title="Trocar sentido"
            aria-label="Inverter moedas"
          >
            <ArrowRightLeft size={12} />
          </button>

          {/* Moeda destino */}
          <select
            value={to}
            onChange={(e) => { setTo(e.target.value); setResult(null); }}
            className={selectClass}
            aria-label="Moeda de destino"
          >
            {CURRENCY_KEYS.map((key) => (
              <option key={key} value={key} className="bg-card text-foreground">
                {CURRENCY_LABELS[key].label}
              </option>
            ))}
          </select>

          {/* Converter */}
          <button
            type="button"
            onClick={handleConvert}
            className="flex items-center gap-1.5 rounded-lg border border-primary/40 bg-primary/10 px-3 py-1.5 text-xs font-semibold text-primary transition-all hover:bg-primary/20 active:scale-95"
          >
            Converter
          </button>
        </div>

        {/* Resultado */}
        {result && (
          <div className="rounded-xl border border-white/10 bg-white/[0.03] p-3">
            <div className="flex items-baseline gap-2">
              <span
                className="font-mono text-lg font-bold"
                style={{ color: CURRENCY_LABELS[to]?.color ?? "#f5e9d7" }}
              >
                {Number.isInteger(result.result)
                  ? result.result.toLocaleString("pt-BR")
                  : result.result.toFixed(4)}
              </span>
              <span className="text-xs capitalize text-muted-foreground">
                {CURRENCY_LABELS[to]?.label ?? to}
              </span>
            </div>
            <p className="mt-1 font-mono text-[11px] text-muted-foreground">
              {result.formula}
            </p>
          </div>
        )}

        {/* Tabela de referência de taxas */}
        <div className="border-t border-white/5 pt-2">
          <p className="mb-1.5 text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">
            Taxas de câmbio (em cobre)
          </p>
          <div className="flex flex-wrap gap-2">
            {CURRENCY_KEYS.map((key) => (
              <div
                key={key}
                className="flex items-center gap-1.5 rounded-md border border-white/5 bg-white/[0.02] px-2 py-1"
              >
                <span
                  className="text-[11px] font-bold uppercase tracking-wider"
                  style={{ color: CURRENCY_LABELS[key].color }}
                >
                  {key}
                </span>
                <span className="font-mono text-[11px] text-muted-foreground">
                  = {CURRENCY_RATES[key].toLocaleString("pt-BR")}¢
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </Card>
  );
}
