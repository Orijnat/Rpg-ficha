"use client";

import { useState, useRef } from "react";
import { Download, Upload, RefreshCw, X, ShieldAlert, Check, Settings2, Trash2 } from "lucide-react";
import { useCharacter } from "../context/CharacterContext";
import { syncCharacterWithBackend } from "../../lib/api";
import { validateAttributes } from "../../lib/modifiers";

export default function BackupModal({ isOpen, onClose }) {
  const { data, loadCharacter, resetCharacter } = useCharacter();
  const [syncStatus, setSyncStatus] = useState(null); // null | "syncing" | "success" | "error"
  const [syncMessage, setSyncMessage] = useState("");
  const fileInputRef = useRef(null);

  if (!isOpen) return null;

  // Exportar ficha como arquivo JSON
  const handleExportJSON = () => {
    try {
      const sanitizedName = (data.name || "personagem").toLowerCase().replace(/[^a-z0-9]/g, "-");
      const dateStr = new Date().toISOString().split("T")[0];
      const filename = `ficha-${sanitizedName}-${dateStr}.json`;

      const jsonStr = JSON.stringify(data, null, 2);
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
      setSyncMessage("Ficha exportada com sucesso como arquivo JSON!");
      setTimeout(() => setSyncStatus(null), 3500);
    } catch (err) {
      setSyncStatus("error");
      setSyncMessage("Erro ao exportar arquivo: " + err.message);
    }
  };

  // Importar ficha a partir de arquivo JSON
  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const parsed = JSON.parse(event.target.result);

        // Validação básica de integridade
        if (!parsed || typeof parsed !== "object") {
          throw new Error("Arquivo JSON inválido ou vazio.");
        }

        // Carrega dados no contexto
        loadCharacter(parsed);
        setSyncStatus("success");
        setSyncMessage(`Ficha de "${parsed.name || "Herói"}" importada com sucesso!`);
        setTimeout(() => setSyncStatus(null), 4000);
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
    setSyncStatus("syncing");
    setSyncMessage("Conectando ao backend e salvando no PostgreSQL...");

    const res = await syncCharacterWithBackend(data);
    if (res && res.success) {
      setSyncStatus("success");
      setSyncMessage("Ficha salva no PostgreSQL com sucesso!");
    } else {
      setSyncStatus("error");
      setSyncMessage("Backend offline ou inacessível. Seus dados continuam salvos no navegador!");
    }

    setTimeout(() => setSyncStatus(null), 4500);
  };

  // Restaurar dados padrão da ficha
  const handleReset = () => {
    if (window.confirm("Atenção: Deseja realmente restaurar os dados padrão da ficha? Todos os dados atuais não salvos serão redefinidos.")) {
      resetCharacter();
      setSyncStatus("success");
      setSyncMessage("Ficha restaurada para as configurações iniciais.");
      setTimeout(() => setSyncStatus(null), 3000);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-md">
      <div className="relative w-full max-w-md overflow-hidden rounded-2xl border border-white/10 bg-[#0f1118] text-[#e8d5b0] shadow-2xl">
        {/* Cabeçalho */}
        <div className="flex items-center justify-between border-b border-white/10 bg-white/[0.02] px-5 py-4">
          <div className="flex items-center gap-2">
            <span className="flex h-8 w-8 items-center justify-center rounded-lg border border-[#d69a3d]/30 bg-[#d69a3d]/10 text-[#d69a3d]">
              <Settings2 size={18} />
            </span>
            <div>
              <h3 className="text-sm font-semibold tracking-wide text-[#f5e9d7]">
                Gerenciamento & Backup
              </h3>
              <p className="text-[11px] text-[#8a7355]">Exportar, importar e sincronizar ficha</p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="rounded-lg p-1.5 text-[#8a7355] transition-colors hover:bg-white/10 hover:text-[#f5e9d7]"
          >
            <X size={18} />
          </button>
        </div>

        {/* Feedback visual */}
        {syncStatus && (
          <div
            className={`mx-5 mt-4 flex items-center gap-2 rounded-xl p-3 text-xs font-semibold ${
              syncStatus === "success"
                ? "border border-emerald-500/40 bg-emerald-500/10 text-emerald-300"
                : syncStatus === "error"
                ? "border border-rose-500/40 bg-rose-500/10 text-rose-300"
                : "border border-amber-500/40 bg-amber-500/10 text-amber-300"
            }`}
          >
            {syncStatus === "success" && <Check size={14} />}
            {syncStatus === "error" && <ShieldAlert size={14} />}
            {syncStatus === "syncing" && <RefreshCw size={14} className="animate-spin" />}
            <span>{syncMessage}</span>
          </div>
        )}

        {/* Opções */}
        <div className="space-y-3 p-5">
          {/* Exportar JSON */}
          <button
            onClick={handleExportJSON}
            className="flex w-full items-center justify-between rounded-xl border border-white/10 bg-white/[0.03] p-3.5 transition-all hover:border-[#d69a3d]/40 hover:bg-[#d69a3d]/10 active:scale-98"
          >
            <div className="flex items-center gap-3">
              <Download size={18} className="text-[#d69a3d]" />
              <div className="text-left">
                <span className="block text-xs font-semibold text-[#f5e9d7]">
                  Exportar Backup (JSON)
                </span>
                <span className="block text-[11px] text-[#8a7355]">
                  Baixar arquivo com todos os dados da ficha
                </span>
              </div>
            </div>
          </button>

          {/* Importar JSON */}
          <button
            onClick={() => fileInputRef.current?.click()}
            className="flex w-full items-center justify-between rounded-xl border border-white/10 bg-white/[0.03] p-3.5 transition-all hover:border-emerald-500/40 hover:bg-emerald-500/10 active:scale-98"
          >
            <div className="flex items-center gap-3">
              <Upload size={18} className="text-emerald-400" />
              <div className="text-left">
                <span className="block text-xs font-semibold text-[#f5e9d7]">
                  Importar Backup (JSON)
                </span>
                <span className="block text-[11px] text-[#8a7355]">
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
            onClick={handleManualSync}
            disabled={syncStatus === "syncing"}
            className="flex w-full items-center justify-between rounded-xl border border-white/10 bg-white/[0.03] p-3.5 transition-all hover:border-indigo-500/40 hover:bg-indigo-500/10 active:scale-98 disabled:opacity-50"
          >
            <div className="flex items-center gap-3">
              <RefreshCw
                size={18}
                className={`text-indigo-400 ${syncStatus === "syncing" ? "animate-spin" : ""}`}
              />
              <div className="text-left">
                <span className="block text-xs font-semibold text-[#f5e9d7]">
                  Sincronizar com Banco PostgreSQL
                </span>
                <span className="block text-[11px] text-[#8a7355]">
                  Forçar envio manual para a API do Rpg-backend
                </span>
              </div>
            </div>
          </button>

          {/* Restaurar Padrão */}
          <button
            onClick={handleReset}
            className="flex w-full items-center justify-between rounded-xl border border-rose-500/20 bg-rose-950/10 p-3.5 transition-all hover:border-rose-500/40 hover:bg-rose-950/20 active:scale-98"
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
      </div>
    </div>
  );
}
