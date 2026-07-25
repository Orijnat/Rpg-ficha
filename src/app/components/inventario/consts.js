export { COINS, COIN_STYLES, INVENTORY_STYLES };

const COINS = [
  { label: "Platina", key: "platina", color: "#8a7355" },
  { label: "Ouro", key: "ouro", color: "#d4a017" },
  { label: "Prata", key: "prata", color: "#c0c0c0" },
  { label: "Cobre", key: "cobre", color: "#b87333" },
];

const COIN_STYLES = {
  container: "flex flex-col items-center gap-1 rounded-lg border border-[rgba(201,134,42,0.15)] bg-[#0f0d0a] p-3",
  label: "text-[10px] uppercase tracking-widest",
  labelFont: "'Cinzel', serif",
};

const INVENTORY_STYLES = {
  itemContainer: "group flex items-center gap-2 border-b border-[rgba(201,134,42,0.08)] py-1.5 last:border-0",
  itemName: "text-sm text-[#e8d5b0]",
  quantityButton: "flex h-5 w-5 items-center justify-center rounded bg-[#241c13] text-xs text-[#8a7355] hover:text-[#c9862a]",
  quantityInput: "w-8 text-center font-mono text-xs text-[#c9862a]",
  deleteButton: "text-[#8b1a1a] opacity-0 transition-all group-hover:opacity-100 hover:text-[#c02020]",
};