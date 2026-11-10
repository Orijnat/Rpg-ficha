"use client";

import { useEffect, useState } from "react";
import { Coins, Package, Sparkles, X } from "lucide-react";
import {
  CATEGORIAS_ITEM,
  MOEDAS,
  RARIDADES,
  REGIOES_CANONICAS,
  validateMarketItem,
} from "../../../lib/market";

export default function MarketItemModal({
  isOpen,
  initialItem = null,
  availableRegions = REGIOES_CANONICAS,
  availableVendors = [],
  onSave,
  onClose,
}) {
  const [formData, setFormData] = useState({
    nome: "",
    regiao: availableRegions[0] || "Capital Valíria & Terras da Coroa",
    vendedor: availableVendors[0]?.nome || "Mestre Garrick Martelo-de-Prata",
    tipo: CATEGORIAS_ITEM[0] || "Armas",
    quantidade: 1,
    preco: 10,
    moeda: "ouro",
    peso: 1.0,
    raridade: "Comum",
    descricao: "",
    requisitos: "",
  });

  const [isCustomRegion, setIsCustomRegion] = useState(false);
  const [customRegion, setCustomRegion] = useState("");
  const [isCustomVendor, setIsCustomVendor] = useState(false);
  const [customVendor, setCustomVendor] = useState("");
  const [errors, setErrors] = useState([]);

  useEffect(() => {
    if (initialItem) {
      setFormData({
        id: initialItem.id,
        nome: initialItem.nome || "",
        regiao: initialItem.regiao || availableRegions[0] || "",
        vendedor: initialItem.vendedor || availableVendors[0]?.nome || "",
        tipo: initialItem.tipo || CATEGORIAS_ITEM[0],
        quantidade: initialItem.quantidade !== undefined ? initialItem.quantidade : 1,
        preco: initialItem.preco !== undefined ? initialItem.preco : 10,
        moeda: initialItem.moeda || "ouro",
        peso: initialItem.peso !== undefined ? initialItem.peso : 1.0,
        raridade: initialItem.raridade || "Comum",
        descricao: initialItem.descricao || "",
        requisitos: initialItem.requisitos || "",
      });
      setIsCustomRegion(!availableRegions.includes(initialItem.regiao));
      setCustomRegion(!availableRegions.includes(initialItem.regiao) ? initialItem.regiao : "");
      const vendorNames = availableVendors.map((v) => v.nome || v);
      setIsCustomVendor(!vendorNames.includes(initialItem.vendedor));
      setCustomVendor(!vendorNames.includes(initialItem.vendedor) ? initialItem.vendedor : "");
    } else {
      setFormData({
        nome: "",
        regiao: availableRegions[0] || "Capital Valíria & Terras da Coroa",
        vendedor: availableVendors[0]?.nome || "Mestre Garrick Martelo-de-Prata",
        tipo: CATEGORIAS_ITEM[0] || "Armas",
        quantidade: 1,
        preco: 10,
        moeda: "ouro",
        peso: 1.0,
        raridade: "Comum",
        descricao: "",
        requisitos: "",
      });
      setIsCustomRegion(false);
      setCustomRegion("");
      setIsCustomVendor(false);
      setCustomVendor("");
    }
    setErrors([]);
  }, [initialItem, isOpen, availableRegions, availableVendors]);

  if (!isOpen) return null;

  const handleSubmit = (e) => {
    e.preventDefault();

    const finalRegion = isCustomRegion ? customRegion.trim() : formData.regiao;
    const finalVendor = isCustomVendor ? customVendor.trim() : formData.vendedor;

    const payload = {
      ...formData,
      regiao: finalRegion,
      vendedor: finalVendor,
      quantidade: Number(formData.quantidade) || 0,
      preco: Number(formData.preco) || 0,
      peso: Number(Number(formData.peso || 0).toFixed(2)),
    };

    const validation = validateMarketItem(payload);
    if (!validation.valid) {
      setErrors(validation.errors);
      return;
    }

    onSave(payload);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 p-4 backdrop-blur-md overflow-y-auto">
      <div className="relative my-8 w-full max-w-2xl rounded-2xl border-2 border-primary/50 bg-[#0f1118] p-6 shadow-2xl shadow-black/80">
        <button
          type="button"
          onClick={onClose}
          className="absolute right-4 top-4 rounded-lg p-1.5 text-muted-foreground hover:bg-white/10 hover:text-foreground"
        >
          <X size={18} />
        </button>

        <div className="flex items-center gap-3 border-b border-border/80 pb-4">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-primary/50 bg-primary/20 text-primary">
            <Package size={22} />
          </div>
          <div>
            <h3 className="font-serif text-lg font-black uppercase tracking-wider text-foreground">
              {initialItem ? "Editar Item de Mercado" : "Novo Item de Mercado"}
            </h3>
            <span className="text-[11px] font-bold uppercase tracking-widest text-primary">
              Comércio & Entrepostos do Mundo
            </span>
          </div>
        </div>

        {errors.length > 0 && (
          <div className="mt-4 rounded-lg border border-destructive/40 bg-destructive/10 p-3 text-xs text-destructive-foreground space-y-1">
            {errors.map((err, i) => (
              <p key={i}>• {err}</p>
            ))}
          </div>
        )}

        <form onSubmit={handleSubmit} className="mt-4 space-y-4">
          {/* Nome e Raridade */}
          <div className="grid gap-3 sm:grid-cols-[1.5fr_1fr]">
            <label className="block text-xs font-semibold text-muted-foreground">
              Nome do Item *
              <input
                type="text"
                required
                value={formData.nome}
                onChange={(e) => setFormData({ ...formData, nome: e.target.value })}
                placeholder="Ex: Espada de Aço Valiriano"
                className="mt-1 min-h-10 w-full rounded-lg border border-border bg-input-background px-3 text-sm text-foreground outline-none focus:border-primary"
              />
            </label>

            <label className="block text-xs font-semibold text-muted-foreground">
              Raridade
              <select
                value={formData.raridade}
                onChange={(e) => setFormData({ ...formData, raridade: e.target.value })}
                className="mt-1 min-h-10 w-full rounded-lg border border-border bg-input-background px-3 text-sm text-foreground outline-none focus:border-primary"
              >
                {RARIDADES.map((rar) => (
                  <option key={rar.id} value={rar.id}>
                    {rar.label}
                  </option>
                ))}
              </select>
            </label>
          </div>

          {/* Região do Mundo */}
          <div>
            <div className="flex items-center justify-between text-xs font-semibold text-muted-foreground mb-1">
              <span>Região do Mundo *</span>
              <button
                type="button"
                onClick={() => setIsCustomRegion(!isCustomRegion)}
                className="text-[11px] text-primary hover:underline"
              >
                {isCustomRegion ? "Selecionar Região Existente" : "+ Nova Região Customizada"}
              </button>
            </div>
            {isCustomRegion ? (
              <input
                type="text"
                required
                value={customRegion}
                onChange={(e) => setCustomRegion(e.target.value)}
                placeholder="Digite o nome da nova região..."
                className="min-h-10 w-full rounded-lg border border-primary/50 bg-input-background px-3 text-sm text-foreground outline-none focus:border-primary"
              />
            ) : (
              <select
                value={formData.regiao}
                onChange={(e) => setFormData({ ...formData, regiao: e.target.value })}
                className="min-h-10 w-full rounded-lg border border-border bg-input-background px-3 text-sm text-foreground outline-none focus:border-primary"
              >
                {availableRegions.map((reg) => (
                  <option key={reg} value={reg}>
                    {reg}
                  </option>
                ))}
              </select>
            )}
          </div>

          {/* Vendedor e Categoria */}
          <div className="grid gap-3 sm:grid-cols-2">
            <div>
              <div className="flex items-center justify-between text-xs font-semibold text-muted-foreground mb-1">
                <span>Vendedor / Mercador *</span>
                <button
                  type="button"
                  onClick={() => setIsCustomVendor(!isCustomVendor)}
                  className="text-[11px] text-primary hover:underline"
                >
                  {isCustomVendor ? "Selecionar Vendedor" : "+ Novo Vendedor"}
                </button>
              </div>
              {isCustomVendor ? (
                <input
                  type="text"
                  required
                  value={customVendor}
                  onChange={(e) => setCustomVendor(e.target.value)}
                  placeholder="Nome do mercador ou tenda..."
                  className="min-h-10 w-full rounded-lg border border-primary/50 bg-input-background px-3 text-sm text-foreground outline-none focus:border-primary"
                />
              ) : (
                <select
                  value={formData.vendedor}
                  onChange={(e) => setFormData({ ...formData, vendedor: e.target.value })}
                  className="min-h-10 w-full rounded-lg border border-border bg-input-background px-3 text-sm text-foreground outline-none focus:border-primary"
                >
                  {availableVendors.map((v) => {
                    const name = typeof v === "string" ? v : v.nome;
                    const title = typeof v === "object" && v.titulo ? ` (${v.titulo})` : "";
                    return (
                      <option key={name} value={name}>
                        {name}{title}
                      </option>
                    );
                  })}
                </select>
              )}
            </div>

            <label className="block text-xs font-semibold text-muted-foreground">
              Categoria / Tipo de Item *
              <select
                value={formData.tipo}
                onChange={(e) => setFormData({ ...formData, tipo: e.target.value })}
                className="mt-1 min-h-10 w-full rounded-lg border border-border bg-input-background px-3 text-sm text-foreground outline-none focus:border-primary"
              >
                {CATEGORIAS_ITEM.map((tipo) => (
                  <option key={tipo} value={tipo}>
                    {tipo}
                  </option>
                ))}
              </select>
            </label>
          </div>

          {/* Estoque, Preço, Moeda e Peso */}
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            <label className="block text-xs font-semibold text-muted-foreground">
              Quantidade (Estoque)
              <input
                type="number"
                min="0"
                step="1"
                required
                value={formData.quantidade}
                onChange={(e) => setFormData({ ...formData, quantidade: e.target.value })}
                className="mt-1 min-h-10 w-full rounded-lg border border-border bg-input-background px-3 text-center text-sm font-bold text-foreground outline-none focus:border-primary"
              />
            </label>

            <label className="block text-xs font-semibold text-muted-foreground">
              Preço
              <input
                type="number"
                min="0"
                step="0.1"
                required
                value={formData.preco}
                onChange={(e) => setFormData({ ...formData, preco: e.target.value })}
                className="mt-1 min-h-10 w-full rounded-lg border border-border bg-input-background px-3 text-center text-sm font-bold text-foreground outline-none focus:border-primary"
              />
            </label>

            <label className="block text-xs font-semibold text-muted-foreground">
              Moeda
              <select
                value={formData.moeda}
                onChange={(e) => setFormData({ ...formData, moeda: e.target.value })}
                className="mt-1 min-h-10 w-full rounded-lg border border-border bg-input-background px-2 text-xs font-semibold text-foreground outline-none focus:border-primary"
              >
                {MOEDAS.map((m) => (
                  <option key={m.id} value={m.id}>
                    {m.label}
                  </option>
                ))}
              </select>
            </label>

            <label className="block text-xs font-semibold text-muted-foreground">
              Peso (kg)
              <input
                type="number"
                min="0"
                step="0.05"
                required
                value={formData.peso}
                onChange={(e) => setFormData({ ...formData, peso: e.target.value })}
                className="mt-1 min-h-10 w-full rounded-lg border border-border bg-input-background px-3 text-center text-sm font-bold text-foreground outline-none focus:border-primary"
              />
            </label>
          </div>

          {/* Requisitos */}
          <label className="block text-xs font-semibold text-muted-foreground">
            Requisitos de Uso (opcional)
            <input
              type="text"
              value={formData.requisitos}
              onChange={(e) => setFormData({ ...formData, requisitos: e.target.value })}
              placeholder="Ex: FOR 13, Treinado em Armas Marciais, Mago..."
              className="mt-1 min-h-10 w-full rounded-lg border border-border bg-input-background px-3 text-sm text-foreground outline-none focus:border-primary"
            />
          </label>

          {/* Descrição e Efeitos */}
          <label className="block text-xs font-semibold text-muted-foreground">
            Descrição, Dano, Defesa ou Efeito Tático
            <textarea
              rows={3}
              value={formData.descricao}
              onChange={(e) => setFormData({ ...formData, descricao: e.target.value })}
              placeholder="Ex: Dano 1d8 cortante. Versátil (1d10). Causa +1d4 de dano de fogo..."
              className="mt-1 w-full rounded-lg border border-border bg-input-background p-3 text-sm text-foreground outline-none focus:border-primary resize-y"
            />
          </label>

          {/* Botões de Ação */}
          <div className="mt-6 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end pt-3 border-t border-border">
            <button
              type="button"
              onClick={onClose}
              className="min-h-11 rounded-lg border border-border bg-secondary px-4 py-2 text-xs font-bold uppercase tracking-wider text-secondary-foreground transition hover:border-primary/50 active:scale-95"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="min-h-11 rounded-lg border-2 border-primary/50 bg-primary px-5 py-2 text-xs font-black uppercase tracking-wider text-primary-foreground shadow-lg shadow-primary/30 transition hover:brightness-110 active:scale-95"
            >
              {initialItem ? "Salvar Alterações" : "Cadastrar no Mercado"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
