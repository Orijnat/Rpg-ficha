"use client";

import { useEffect, useState } from "react";
import { Store, UserCheck, X } from "lucide-react";
import { REGIOES_CANONICAS } from "../../../lib/market";

export default function VendorModal({
  isOpen,
  initialVendor = null,
  availableRegions = REGIOES_CANONICAS,
  onSave,
  onClose,
}) {
  const [formData, setFormData] = useState({
    nome: "",
    titulo: "",
    regiao: availableRegions[0] || "Capital Valíria & Terras da Coroa",
    especialidade: "",
    humor: "",
  });

  const [isCustomRegion, setIsCustomRegion] = useState(false);
  const [customRegion, setCustomRegion] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    if (initialVendor) {
      setFormData({
        id: initialVendor.id,
        nome: initialVendor.nome || "",
        titulo: initialVendor.titulo || "",
        regiao: initialVendor.regiao || availableRegions[0] || "",
        especialidade: initialVendor.especialidade || "",
        humor: initialVendor.humor || "",
      });
      setIsCustomRegion(!availableRegions.includes(initialVendor.regiao));
      setCustomRegion(!availableRegions.includes(initialVendor.regiao) ? initialVendor.regiao : "");
    } else {
      setFormData({
        nome: "",
        titulo: "",
        regiao: availableRegions[0] || "Capital Valíria & Terras da Coroa",
        especialidade: "",
        humor: "",
      });
      setIsCustomRegion(false);
      setCustomRegion("");
    }
    setError("");
  }, [initialVendor, isOpen, availableRegions]);

  if (!isOpen) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.nome.trim()) {
      setError("O nome do vendedor ou da tenda é obrigatório.");
      return;
    }

    const finalRegion = isCustomRegion ? customRegion.trim() : formData.regiao;
    if (!finalRegion) {
      setError("A região do vendedor é obrigatória.");
      return;
    }

    onSave({
      ...formData,
      id: formData.id || `vend-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
      nome: formData.nome.trim(),
      titulo: formData.titulo.trim() || "Comerciante Local",
      regiao: finalRegion,
      especialidade: formData.especialidade.trim() || "Artigos Diversos",
      humor: formData.humor.trim(),
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 p-4 backdrop-blur-md">
      <div className="relative w-full max-w-lg rounded-2xl border-2 border-primary/50 bg-[#0f1118] p-6 shadow-2xl shadow-black/80">
        <button
          type="button"
          onClick={onClose}
          className="absolute right-4 top-4 rounded-lg p-1.5 text-muted-foreground hover:bg-white/10 hover:text-foreground"
        >
          <X size={18} />
        </button>

        <div className="flex items-center gap-3 border-b border-border/80 pb-4">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-primary/50 bg-primary/20 text-primary">
            <Store size={22} />
          </div>
          <div>
            <h3 className="font-serif text-lg font-black uppercase tracking-wider text-foreground">
              {initialVendor ? "Editar Mercador / Tenda" : "Novo Mercador / Vendedor"}
            </h3>
            <span className="text-[11px] font-bold uppercase tracking-widest text-primary">
              Comerciantes do Mundo
            </span>
          </div>
        </div>

        {error && (
          <div className="mt-4 rounded-lg border border-destructive/40 bg-destructive/10 p-3 text-xs text-destructive-foreground">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="mt-4 space-y-4">
          <label className="block text-xs font-semibold text-muted-foreground">
            Nome do Vendedor ou da Tenda *
            <input
              type="text"
              required
              value={formData.nome}
              onChange={(e) => setFormData({ ...formData, nome: e.target.value })}
              placeholder="Ex: Madame Isolde, Boticária"
              className="mt-1 min-h-10 w-full rounded-lg border border-border bg-input-background px-3 text-sm text-foreground outline-none focus:border-primary"
            />
          </label>

          <label className="block text-xs font-semibold text-muted-foreground">
            Título / Ocupação
            <input
              type="text"
              value={formData.titulo}
              onChange={(e) => setFormData({ ...formData, titulo: e.target.value })}
              placeholder="Ex: Armeiro Anão da Guarda Real"
              className="mt-1 min-h-10 w-full rounded-lg border border-border bg-input-background px-3 text-sm text-foreground outline-none focus:border-primary"
            />
          </label>

          <div>
            <div className="flex items-center justify-between text-xs font-semibold text-muted-foreground mb-1">
              <span>Região de Atuação *</span>
              <button
                type="button"
                onClick={() => setIsCustomRegion(!isCustomRegion)}
                className="text-[11px] text-primary hover:underline"
              >
                {isCustomRegion ? "Selecionar Região Existente" : "+ Nova Região"}
              </button>
            </div>
            {isCustomRegion ? (
              <input
                type="text"
                required
                value={customRegion}
                onChange={(e) => setCustomRegion(e.target.value)}
                placeholder="Nome da região..."
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

          <label className="block text-xs font-semibold text-muted-foreground">
            Especialidade / Tipo de Comércio
            <input
              type="text"
              value={formData.especialidade}
              onChange={(e) => setFormData({ ...formData, especialidade: e.target.value })}
              placeholder="Ex: Armas & Lâminas Exóticas, Poções, Grimórios..."
              className="mt-1 min-h-10 w-full rounded-lg border border-border bg-input-background px-3 text-sm text-foreground outline-none focus:border-primary"
            />
          </label>

          <label className="block text-xs font-semibold text-muted-foreground">
            Citação / Frase de Recepção
            <input
              type="text"
              value={formData.humor}
              onChange={(e) => setFormData({ ...formData, humor: e.target.value })}
              placeholder="Ex: 'O melhor aço ao norte da Capital!'"
              className="mt-1 min-h-10 w-full rounded-lg border border-border bg-input-background px-3 text-sm text-foreground outline-none focus:border-primary"
            />
          </label>

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
              {initialVendor ? "Salvar Vendedor" : "Cadastrar Vendedor"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
