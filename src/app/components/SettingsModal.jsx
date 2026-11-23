"use client";

import { useState, useRef, useEffect } from "react";
import {
  Palette,
  Database,
  X,
  Check,
  Flame,
  Skull,
  Eclipse,
  Snowflake,
  Sunrise,
  Gem,
  Download,
  Upload,
  RefreshCw,
  Trash2,
  ShieldAlert,
  Settings2,
  Sparkles,
  Compass,
} from "lucide-react";
import { useCharacter } from "../context/CharacterContext";
import { useTheme } from "../context/ThemeContext";
import { syncCharacterWithBackend } from "../../lib/api";
import { validateCharacterSchema } from "../../lib/modifiers";
import ConfirmDialog from "./admin/ConfirmDialog";

const THEME_ICONS = {
  codex: Compass,
  amber: Flame,
  abyss: Skull,
  bloodmoon: Eclipse,
  frostfall: Snowflake,
  aurora: Sunrise,
  sapphire: Gem,
};

export default function SettingsModal({ isOpen, onClose, initialTab = "themes" }) {
  const { data, loadCharacter, resetCharacter } = useCharacter();
  const { theme, setTheme, themes } = useTheme();

  const [activeTab, setActiveTab] = useState(initialTab);
  const [syncStatus, setSyncStatus] = useState(null); // null | "syncing" | "success" | "error"
  const [syncMessage, setSyncMessage] = useState("");
  const [pendingImport, setPendingImport] = useState(null); // backup validado aguardando confirmação tipada
  const [pendingReset, setPendingReset] = useState(false); // restauração de ficha aguardando confirmação tipada
  const fileInputRef = useRef(null);

  const [prevIsOpen, setPrevIsOpen] = useState(isOpen);
  if (isOpen !== prevIsOpen) {
    setPrevIsOpen(isOpen);
    if (isOpen) {
      setActiveTab(initialTab);
    }
  }

  // Fechar no ESC
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === "Escape" && isOpen) {
        onClose();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  // Exportar ficha como arquivo JSON com schema versionado
  const handleExportJSON = () => {
    try {
      const sanitizedName = (data.name || "personagem").toLowerCase().replace(/[^a-z0-9]/g, "-");
      const dateStr = new Date().toISOString().split("T")[0];
      const filename = `ficha-${sanitizedName}-${dateStr}.json`;

      const { bankPassword: _privateBankPassword, ...exportableData } = data;
      const exportPayload = {
        _schemaVersion: 2,
        exportedAt: new Date().toISOString(),
        system: "Crônicas do Destino (d20)",
        character: exportableData,
      };

      const jsonStr = JSON.stringify(exportPayload, null, 2);
      const blob = new Blob([jsonStr], { type: "application/json" });
      const url = URL.createObjectURL(blob);

      const link = document.createElement("a");
      link.href = url;
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

      setSyncStatus("success");
      setSyncMessage("Ficha exportada com sucesso como arquivo JSON (Schema v2)!");
      setTimeout(() => setSyncStatus(null), 3500);
    } catch (err) {
      setSyncStatus("error");
      setSyncMessage("Erro ao exportar arquivo: " + err.message);
    }
  };

  // Importar ficha a partir de arquivo JSON com validação de schema
  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const parsed = JSON.parse(event.target.result);
        if (!parsed || typeof parsed !== "object") {
          throw new Error("Arquivo JSON inválido ou vazio.");
        }

        const rawChar = parsed.character || parsed;
        const validation = validateCharacterSchema(rawChar);
        if (!validation.valid) {
          throw new Error(`Dados corrompidos ou incompatíveis: ${validation.errors.join("; ")}`);
        }

        // Não aplica direto: sobrescreve a ficha atual, então exige confirmação tipada
        setPendingImport({ sanitized: validation.sanitized || rawChar, name: rawChar.name || "Herói" });
        setSyncStatus(null);
      } catch (err) {
        setSyncStatus("error");
        setSyncMessage("Falha ao importar ficha: " + err.message);
      }
    };
    reader.readAsText(file);
    e.target.value = "";
  };

  // Sincronizar com o backend manualmente
  const handleManualSync = async () => {
    if (!data?.id) {
      setSyncStatus("error");
      setSyncMessage("Ficha sem vínculo com o servidor (restaurada localmente). Importe um backup ou recarregue a ficha da nuvem antes de sincronizar.");
      setTimeout(() => setSyncStatus(null), 4500);
      return;
    }
    setSyncStatus("syncing");
    setSyncMessage("Conectando ao backend e salvando no PostgreSQL...");

    try {
      const res = await syncCharacterWithBackend(data);
      if (res) {
      setSyncStatus("success");
      setSyncMessage("Ficha salva no PostgreSQL com sucesso!");
      } else {
      setSyncStatus("error");
      setSyncMessage("Backend offline ou inacessível. Seus dados continuam salvos no navegador!");
      }
    } catch (error) {
      setSyncStatus(error.status === 409 ? "error" : "error");
      setSyncMessage(error.status === 409
        ? "Conflito detectado: a ficha não foi sobrescrita. Revise e tente novamente."
        : `Falha ao sincronizar: ${error.message}`);
    }

    setTimeout(() => setSyncStatus(null), 4500);
  };

  // Restaurar dados padrão da ficha (confirmação tipada no ConfirmDialog)
  const handleReset = () => {
    setPendingReset(true);
  };

  const confirmImport = () => {
    if (!pendingImport) return;
    loadCharacter(pendingImport.sanitized);
    setSyncStatus("success");
    setSyncMessage(`Ficha de "${pendingImport.name}" validada e importada com sucesso (Schema v2)!`);
    setPendingImport(null);
    setTimeout(() => setSyncStatus(null), 4000);
  };

  const confirmReset = () => {
    resetCharacter();
    setPendingReset(false);
    setSyncStatus("success");
    setSyncMessage("Ficha restaurada para as configurações iniciais (apenas neste navegador; a nuvem não foi alterada).");
    setTimeout(() => setSyncStatus(null), 4000);
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-md transition-opacity duration-200"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div role="dialog" aria-modal="true" aria-labelledby="settings-title" className="relative flex max-h-[90vh] w-full max-w-xl flex-col overflow-hidden rounded-2xl border border-white/10 bg-[#161816] text-[#e8d5b0] shadow-2xl">
        {/* Cabeçalho do Modal */}
        <div className="flex items-center justify-between border-b border-white/10 bg-white/[0.02] px-6 py-4">
          <div className="flex items-center gap-2.5">
            <span className="flex h-9 w-9 items-center justify-center rounded-xl border border-white/10 bg-white/5 text-[var(--theme-accent)]">
              <Settings2 size={18} />
            </span>
            <div>
              <h3 id="settings-title" className="text-base font-semibold tracking-wide text-[var(--theme-title)]">
                Configurações do Sistema
              </h3>
              <p className="text-xs text-[var(--theme-subtitle)]">Personalize temas, gerencie backups e dados da ficha</p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="min-h-11 min-w-11 rounded-lg p-1.5 text-[var(--theme-subtitle)] transition hover:bg-white/10 hover:text-[var(--theme-title)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
            title="Fechar"
            aria-label="Fechar configurações"
          >
            <X size={18} />
          </button>
        </div>

        {/* Abas de Navegação */}
        <div className="flex border-b border-white/10 bg-black/20 px-6 pt-3">
          <button
            type="button"
            onClick={() => setActiveTab("themes")}
            className={`flex items-center gap-2 border-b-2 px-4 py-2.5 text-xs font-semibold transition-all ${
              activeTab === "themes"
                ? "border-[var(--theme-accent)] text-[var(--theme-title)]"
                : "border-transparent text-[var(--theme-subtitle)] hover:text-[#e8d5b0]"
            }`}
          >
            <Palette size={15} />
            <span>Temas Visuais</span>
            <span className="rounded-full bg-white/10 px-1.5 py-0.2 font-mono text-[10px] text-[var(--theme-accent)]">
              {themes.length}
            </span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab("backup")}
            className={`flex items-center gap-2 border-b-2 px-4 py-2.5 text-xs font-semibold transition-all ${
              activeTab === "backup"
                ? "border-[var(--theme-accent)] text-[var(--theme-title)]"
                : "border-transparent text-[var(--theme-subtitle)] hover:text-[#e8d5b0]"
            }`}
          >
            <Database size={15} />
            <span>Backup & Sincronização</span>
          </button>
        </div>

        {/* Feedback visual de ações */}
        {syncStatus && (
          <div
            className={`mx-6 mt-4 flex items-center gap-2 rounded-xl p-3 text-xs font-semibold ${
              syncStatus === "success"
                ? "border border-emerald-500/40 bg-emerald-500/10 text-emerald-300"
                : syncStatus === "error"
                ? "border border-rose-500/40 bg-rose-500/10 text-rose-300"
                : "border border-codex-500/40 bg-codex-500/10 text-codex-300"
            }`}
          >
            {syncStatus === "success" && <Check size={14} />}
            {syncStatus === "error" && <ShieldAlert size={14} />}
            {syncStatus === "syncing" && <RefreshCw size={14} className="animate-spin" />}
            <span>{syncMessage}</span>
          </div>
        )}

        {/* Conteúdo rolável */}
        <div data-lenis-prevent className="custom-scroll overflow-y-auto p-6">
          {activeTab === "themes" && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="text-xs font-bold uppercase tracking-wider text-[var(--theme-accent)]">
                    Escolha a Atmosfera
                  </h4>
                  <p className="mt-0.5 text-xs text-[var(--theme-subtitle)]">
                    Alterne o esquema de cores e a identidade da ficha em tempo real (Escuros & Claros).
                  </p>
                </div>
                <div className="flex items-center gap-1.5 rounded-lg border border-white/10 bg-white/[0.03] px-2.5 py-1 text-[11px] font-medium text-[var(--theme-title)]">
                  <Sparkles size={12} className="text-[var(--theme-accent)]" />
                  <span>{themes.length} Temas RPG</span>
                </div>
              </div>

              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                {themes.map((t) => {
                  const Icon = THEME_ICONS[t.id] || Flame;
                  const isSelected = theme === t.id;

                  return (
                    <button
                      key={t.id}
                      type="button"
                      onClick={() => setTheme(t.id)}
                      className={`group relative flex flex-col justify-between rounded-xl border p-4 text-left transition-all duration-200 active:scale-[0.98] ${
                        isSelected
                          ? "border-[var(--theme-accent)] bg-white/[0.06] shadow-lg shadow-black/40 ring-1 ring-[var(--theme-accent)]/50"
                          : "border-white/10 bg-white/[0.02] hover:border-white/20 hover:bg-white/[0.04]"
                      }`}
                    >
                      {/* Topo do Card de Tema */}
                      <div>
                        <div className="flex items-center justify-between gap-2">
                          <div className="flex items-center gap-2">
                            <span
                              className="flex h-7 w-7 items-center justify-center rounded-lg transition-transform group-hover:scale-110"
                              style={{
                                backgroundColor: `${t.accent}20`,
                                color: t.accent,
                                border: `1px solid ${t.accent}40`,
                              }}
                            >
                              <Icon size={14} />
                            </span>
                            <div>
                              <span className="block text-xs font-bold text-[var(--theme-title)]">
                                {t.name}
                              </span>
                              <span className="block text-[10px] text-[var(--theme-subtitle)]">
                                {t.subtitle}
                              </span>
                            </div>
                          </div>

                          {isSelected ? (
                            <span className="flex items-center gap-1 rounded-full bg-[var(--theme-accent)]/20 px-2 py-0.5 text-[10px] font-bold text-[var(--theme-accent)]">
                              <Check size={11} strokeWidth={3} />
                              Ativo
                            </span>
                          ) : (
                            <span className="rounded bg-white/5 px-1.5 py-0.5 text-[10px] uppercase tracking-wider text-[var(--theme-subtitle)]">
                              {t.tag}
                            </span>
                          )}
                        </div>

                        <p className="mt-2.5 text-[11px] leading-relaxed text-[var(--theme-subtitle)]">
                          {t.description}
                        </p>
                      </div>

                      {/* Amostras da Paleta */}
                      <div className="mt-4 flex items-center justify-between border-t border-white/5 pt-2.5">
                        <span className="text-[10px] font-mono text-[var(--theme-subtitle)]/70">Paleta</span>
                        <div className="flex items-center gap-1.5">
                          {t.previewColors.map((color, idx) => (
                            <span
                              key={idx}
                              className="h-3.5 w-3.5 rounded-full border border-white/20 shadow-xs"
                              style={{ backgroundColor: color }}
                              title={`Cor: ${color}`}
                            />
                          ))}
                        </div>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {activeTab === "backup" && (
            <div className="space-y-3">
              {/* Exportar JSON */}
              <button
                type="button"
                onClick={handleExportJSON}
                className="flex w-full items-center justify-between rounded-xl border border-white/10 bg-white/[0.03] p-3.5 transition-all hover:border-[var(--theme-accent)]/40 hover:bg-[var(--theme-accent)]/10 active:scale-[0.99]"
              >
                <div className="flex items-center gap-3">
                  <Download size={18} className="text-[var(--theme-accent)]" />
                  <div className="text-left">
                    <span className="block text-xs font-semibold text-[var(--theme-title)]">
                      Exportar Backup (JSON)
                    </span>
                    <span className="block text-[11px] text-[var(--theme-subtitle)]">
                      Baixar arquivo com todos os dados da ficha
                    </span>
                  </div>
                </div>
              </button>

              {/* Importar JSON */}
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="flex w-full items-center justify-between rounded-xl border border-white/10 bg-white/[0.03] p-3.5 transition-all hover:border-emerald-500/40 hover:bg-emerald-500/10 active:scale-[0.99]"
              >
                <div className="flex items-center gap-3">
                  <Upload size={18} className="text-emerald-400" />
                  <div className="text-left">
                    <span className="block text-xs font-semibold text-[var(--theme-title)]">
                      Importar Backup (JSON)
                    </span>
                    <span className="block text-[11px] text-[var(--theme-subtitle)]">
                      Carregar ficha salva anteriormente
                    </span>
                  </div>
                </div>
              </button>

              <input
                type="file"
                ref={fileInputRef}
                onChange={handleFileChange}
                accept=".json"
                className="hidden"
              />

              {/* Sincronizar com Backend */}
              <button
                type="button"
                onClick={handleManualSync}
                disabled={syncStatus === "syncing"}
                className="flex w-full items-center justify-between rounded-xl border border-white/10 bg-white/[0.03] p-3.5 transition-all hover:border-indigo-500/40 hover:bg-indigo-500/10 active:scale-[0.99] disabled:opacity-50"
              >
                <div className="flex items-center gap-3">
                  <RefreshCw
                    size={18}
                    className={`text-indigo-400 ${syncStatus === "syncing" ? "animate-spin" : ""}`}
                  />
                  <div className="text-left">
                    <span className="block text-xs font-semibold text-[var(--theme-title)]">
                      Sincronizar com Banco PostgreSQL
                    </span>
                    <span className="block text-[11px] text-[var(--theme-subtitle)]">
                      Forçar envio manual para a API do Rpg-backend
                    </span>
                  </div>
                </div>
              </button>

              {/* Restaurar Padrão */}
              <button
                type="button"
                onClick={handleReset}
                className="flex w-full items-center justify-between rounded-xl border border-rose-500/20 bg-rose-950/10 p-3.5 transition-all hover:border-rose-500/40 hover:bg-rose-950/20 active:scale-[0.99]"
              >
                <div className="flex items-center gap-3">
                  <Trash2 size={18} className="text-rose-400" />
                  <div className="text-left">
                    <span className="block text-xs font-semibold text-rose-300">
                      Restaurar Ficha Padrão
                    </span>
                    <span className="block text-[11px] text-rose-400/60">
                      Redefinir atributos e inventário para o padrão inicial
                    </span>
                  </div>
                </div>
              </button>
            </div>
          )}
        </div>

        {/* Rodapé informativo */}
        <div className="flex items-center justify-between border-t border-white/10 bg-black/30 px-6 py-3 text-[11px] text-[var(--theme-subtitle)]">
          <span>Tema atual: <strong className="text-[var(--theme-title)]">{themes.find((t) => t.id === theme)?.name}</strong></span>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg border border-white/10 bg-white/5 px-3 py-1 font-semibold text-[var(--theme-title)] transition hover:bg-white/10"
          >
            Concluído
          </button>
        </div>
      </div>

      <ConfirmDialog
        isOpen={Boolean(pendingImport)}
        title="Importar backup por cima da ficha?"
        message={`A ficha atual será substituída pelos dados de "${pendingImport?.name}". Alterações locais não sincronizadas serão perdidas e o conteúdo importado passará a sincronizar com a nuvem para a ficha ativa.`}
        confirmText="Importar mesmo assim"
        dangerLevel="danger"
        requireTypedText="IMPORTAR"
        onConfirm={confirmImport}
        onCancel={() => setPendingImport(null)}
      />
      <ConfirmDialog
        isOpen={pendingReset}
        title="Restaurar ficha padrão?"
        message="A ficha deste navegador será redefinida para o formulário em branco. A cópia no servidor NÃO será alterada — apenas as alterações locais não salvas serão perdidas. Para recuperar a ficha da nuvem, recarregue a página."
        confirmText="Restaurar mesmo assim"
        dangerLevel="danger"
        requireTypedText="RESTAURAR"
        onConfirm={confirmReset}
        onCancel={() => setPendingReset(false)}
      />
    </div>
  );
}
