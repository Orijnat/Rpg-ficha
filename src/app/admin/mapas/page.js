"use client";

import { useEffect, useRef, useState } from "react";
import {
  Compass,
  Eye,
  EyeOff,
  Flame,
  Grid,
  MapPin,
  Plus,
  Save,
  ShieldAlert,
  Sparkles,
  Trash2,
  Unlock,
} from "lucide-react";
import { Card, SectionHeader } from "../../components/ui";
import ConfirmDialog from "../../components/admin/ConfirmDialog";
import {
  createMap,
  deleteMap,
  listCampaigns,
  listMaps,
  updateMap,
} from "../../../lib/api";
import { useAuth } from "../../context/AuthContext";

const PRESET_MAPS = [
  {
    titulo: "Ruínas Esquecidas",
    url: "https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=1200&auto=format&fit=crop",
    descricao: "Masmorra antiga esculpida no coração da montanha, com corredores escuros e câmaras secretas.",
  },
  {
    titulo: "Ermos Congelados",
    url: "https://images.unsplash.com/photo-1517411032315-54ef2cb783bb?w=1200&auto=format&fit=crop",
    descricao: "Passo montanhoso gélido fustigado por nevascas impiedosas e fendas profundas.",
  },
];

export default function AdminMapasPage() {
  const { token, isMaster } = useAuth();

  const [campaigns, setCampaigns] = useState([]);
  const [selectedCampaignId, setSelectedCampaignId] = useState("");
  const [maps, setMaps] = useState([]);
  const [activeMap, setActiveMap] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [successMsg, setSuccessMsg] = useState("");

  // Criação de mapa
  const [isCreating, setIsCreating] = useState(false);
  const [novoTitulo, setNovoTitulo] = useState("");
  const [novaUrl, setNovaUrl] = useState("");
  const [novaDescricao, setNovaDescricao] = useState("");
  const [novaPublica, setNovaPublica] = useState(false);

  // Marcadores
  const [selectedMarker, setSelectedMarker] = useState(null);
  const [isPlacingMarker, setIsPlacingMarker] = useState(false);
  const [newMarkerType, setNewMarkerType] = useState("monstro");
  const [newMarkerTitle, setNewMarkerTitle] = useState("Ameaça Oculta");
  const [newMarkerHidden, setNewMarkerHidden] = useState(true);

  // Exclusão
  const [mapToDelete, setMapToDelete] = useState(null);

  const mapContainerRef = useRef(null);

  useEffect(() => {
    if (!isMaster) return;
    listCampaigns(token)
      .then((camps) => {
        setCampaigns(camps || []);
        if (camps && camps.length > 0) {
          setSelectedCampaignId(camps[0].id);
        }
      })
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, [isMaster, token]);

  const loadMaps = async (campId) => {
    if (!campId) return;
    try {
      const data = await listMaps(campId, token);
      const list = Array.isArray(data) ? data : [];
      setMaps(list);
      setActiveMap(list[0] || null);
    } catch (err) {
      setError(err.message);
    }
  };

  useEffect(() => {
    if (selectedCampaignId) {
      loadMaps(selectedCampaignId);
    }
  }, [selectedCampaignId]);

  const handleCreateMap = async (e) => {
    e.preventDefault();
    if (!novoTitulo.trim() || !novaUrl.trim()) return;
    try {
      const created = await createMap(
        selectedCampaignId,
        {
          titulo: novoTitulo.trim(),
          descricao: novaDescricao.trim(),
          url: novaUrl.trim(),
          publica: novaPublica,
          metadados: { markers: [], fogOfWar: [] },
        },
        token
      );
      setNovoTitulo("");
      setNovaUrl("");
      setIsCreating(false);
      setSuccessMsg("Mapa adicionado com sucesso.");
      loadMaps(selectedCampaignId);
      setActiveMap(created);
    } catch (err) {
      setError(err.message);
    }
  };

  const handleMapClick = (e) => {
    if (!isPlacingMarker || !activeMap) return;
    const rect = mapContainerRef.current.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;

    const currentMarkers = activeMap.metadados?.markers || [];
    const newMarker = {
      id: `marker-${currentMarkers.length + 1}`,
      x: Math.round(x * 10) / 10,
      y: Math.round(y * 10) / 10,
      title: newMarkerTitle,
      type: newMarkerType,
      hidden: newMarkerHidden,
      notes: "",
    };
    const updatedMarkers = [...currentMarkers, newMarker];

    saveMapPatch({
      metadados: {
        ...(activeMap.metadados || {}),
        markers: updatedMarkers,
      },
    });

    setIsPlacingMarker(false);
  };

  const saveMapPatch = async (patch) => {
    if (!activeMap) return;
    try {
      const updated = await updateMap(activeMap.id, patch, token);
      setActiveMap(updated);
      setMaps((prev) => prev.map((m) => (m.id === updated.id ? updated : m)));
    } catch (err) {
      setError(err.message);
    }
  };

  const toggleMarkerVisibility = (markerId) => {
    const currentMarkers = activeMap.metadados?.markers || [];
    const updated = currentMarkers.map((m) =>
      m.id === markerId ? { ...m, hidden: !m.hidden } : m
    );
    saveMapPatch({
      metadados: {
        ...(activeMap.metadados || {}),
        markers: updated,
      },
    });
  };

  const removeMarker = (markerId) => {
    const currentMarkers = activeMap.metadados?.markers || [];
    const updated = currentMarkers.filter((m) => m.id !== markerId);
    saveMapPatch({
      metadados: {
        ...(activeMap.metadados || {}),
        markers: updated,
      },
    });
    setSelectedMarker(null);
  };

  const handleDeleteMap = async () => {
    if (!mapToDelete) return;
    try {
      await deleteMap(mapToDelete.id, token);
      setMapToDelete(null);
      setSuccessMsg("Mapa excluído.");
      loadMaps(selectedCampaignId);
    } catch (err) {
      setError(err.message);
      setMapToDelete(null);
    }
  };

  if (!isMaster) return null;

  const markers = activeMap?.metadados?.markers || [];

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between border-b-2 border-primary/40 pb-4">
        <div>
          <span className="text-[10px] font-bold uppercase tracking-[0.3em] text-primary">
            Câmara do Mestre · Cartografia & Névoa de Guerra
          </span>
          <h1 className="mt-1 font-serif text-3xl font-black uppercase tracking-wider text-foreground">
            Mapas Táticos & Revelação Controlada
          </h1>
          <p className="text-xs text-muted-foreground">
            Insira marcadores secretos, revele salas progressivamente e compartilhe a visão com os jogadores.
          </p>
        </div>

        <div className="flex items-center gap-2">
          {campaigns.length > 0 && (
            <select
              value={selectedCampaignId}
              onChange={(e) => setSelectedCampaignId(e.target.value)}
              className="h-10 rounded-lg border border-border bg-input-background px-3 text-xs text-foreground outline-none focus:border-primary"
            >
              {campaigns.map((c) => (
                <option key={c.id} value={c.id}>
                  Campanha: {c.nome}
                </option>
              ))}
            </select>
          )}

          <button
            type="button"
            onClick={() => setIsCreating(!isCreating)}
            className="flex min-h-10 items-center gap-1.5 rounded-lg bg-primary px-3.5 text-xs font-bold uppercase tracking-wider text-primary-foreground hover:brightness-110 active:scale-95 shadow-md shadow-primary/20"
          >
            <Plus size={14} /> Novo Mapa
          </button>
        </div>
      </div>

      {successMsg && (
        <div className="border border-emerald-500/40 bg-emerald-950/20 p-3 text-sm text-emerald-300">
          {successMsg}
        </div>
      )}
      {error && (
        <div className="border border-destructive/40 bg-destructive/10 p-4 text-sm text-destructive-foreground">
          {error}
        </div>
      )}

      {/* Formulário de Criação */}
      {isCreating && (
        <Card className="border-2 border-primary/40">
          <SectionHeader title="Adicionar Mapa Cartográfico" icon={<Compass size={16} />} />
          <form onSubmit={handleCreateMap} className="mt-4 space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className="block text-xs font-bold uppercase text-muted-foreground">
                  Título do Mapa *
                </label>
                <input
                  type="text"
                  required
                  value={novoTitulo}
                  onChange={(e) => setNovoTitulo(e.target.value)}
                  placeholder="Ex.: Catacumbas Esquecidas"
                  className="mt-1 min-h-10 w-full rounded border border-border bg-input-background px-3 text-xs text-foreground outline-none focus:border-primary"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase text-muted-foreground">
                  URL da Imagem do Mapa *
                </label>
                <input
                  type="url"
                  required
                  value={novaUrl}
                  onChange={(e) => setNovaUrl(e.target.value)}
                  placeholder="https://exemplo.com/mapa.jpg"
                  className="mt-1 min-h-10 w-full rounded border border-border bg-input-background px-3 text-xs text-foreground outline-none focus:border-primary"
                />
              </div>
            </div>

            <div className="flex items-center gap-2">
              <span className="text-[10px] text-muted-foreground uppercase font-bold">Modelos:</span>
              {PRESET_MAPS.map((pm) => (
                <button
                  key={pm.titulo}
                  type="button"
                  onClick={() => {
                    setNovoTitulo(pm.titulo);
                    setNovaUrl(pm.url);
                    setNovaDescricao(pm.descricao);
                  }}
                  className="rounded border border-border bg-secondary px-2 py-0.5 text-[10px] text-muted-foreground hover:border-primary"
                >
                  {pm.titulo}
                </button>
              ))}
            </div>

            <div>
              <label className="block text-xs font-bold uppercase text-muted-foreground">
                Descrição do Local
              </label>
              <textarea
                rows={2}
                value={novaDescricao}
                onChange={(e) => setNovaDescricao(e.target.value)}
                placeholder="Detalhes narrativos, iluminação e clima..."
                className="mt-1 w-full rounded border border-border bg-input-background p-2 text-xs text-foreground outline-none focus:border-primary"
              />
            </div>

            <div className="flex items-center justify-between">
              <label className="flex items-center gap-2 text-xs text-muted-foreground">
                <input
                  type="checkbox"
                  checked={novaPublica}
                  onChange={(e) => setNovaPublica(e.target.checked)}
                />
                <span>Revelar mapa aos jogadores imediatamente</span>
              </label>

              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setIsCreating(false)}
                  className="rounded border border-border px-3 py-1.5 text-xs text-muted-foreground hover:bg-secondary"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="rounded bg-primary px-4 py-1.5 text-xs font-bold uppercase text-primary-foreground hover:brightness-110"
                >
                  Adicionar Mapa
                </button>
              </div>
            </div>
          </form>
        </Card>
      )}

      {/* Seletor de Mapas */}
      <div className="flex flex-wrap items-center gap-2">
        <span className="text-xs font-bold uppercase text-muted-foreground">Mapas:</span>
        {maps.map((m) => (
          <button
            key={m.id}
            type="button"
            onClick={() => setActiveMap(m)}
            className={`rounded-xl px-3 py-1.5 text-xs font-bold uppercase transition ${
              activeMap?.id === m.id
                ? "bg-primary text-primary-foreground shadow-md shadow-primary/20"
                : "border border-border bg-secondary/50 text-muted-foreground hover:border-primary/40 hover:text-foreground"
            }`}
          >
            {m.titulo} {m.publica ? "👁️" : "🔒"}
          </button>
        ))}
      </div>

      {activeMap ? (
        <div className="space-y-4">
          {/* Barra de Ferramentas do Mapa */}
          <Card className="flex flex-wrap items-center justify-between gap-3 border-2 border-primary/30">
            <div className="flex flex-wrap items-center gap-3">
              <span className="font-serif font-bold text-foreground">{activeMap.titulo}</span>
              <button
                type="button"
                onClick={() => saveMapPatch({ publica: !activeMap.publica })}
                className={`flex items-center gap-1.5 rounded-lg px-2.5 py-1 text-xs font-bold uppercase transition ${
                  activeMap.publica
                    ? "bg-emerald-950/40 text-emerald-300 border border-emerald-500/40"
                    : "bg-rose-950/40 text-rose-300 border border-rose-500/40"
                }`}
              >
                {activeMap.publica ? <Eye size={13} /> : <EyeOff size={13} />}
                <span>{activeMap.publica ? "Visível aos Jogadores" : "Mapa Oculto (Só Mestre)"}</span>
              </button>
            </div>

            {/* Inserir Marcador */}
            <div className="flex flex-wrap items-center gap-2">
              <button
                type="button"
                onClick={() => setIsPlacingMarker(!isPlacingMarker)}
                className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-bold uppercase transition ${
                  isPlacingMarker
                    ? "bg-amber-600 text-white animate-pulse"
                    : "border border-primary/40 bg-primary/10 text-primary hover:bg-primary/20"
                }`}
              >
                <MapPin size={14} />
                <span>{isPlacingMarker ? "Clique no mapa para marcar..." : "Colocar Marcador"}</span>
              </button>

              <button
                type="button"
                onClick={() => setMapToDelete(activeMap)}
                className="rounded p-1.5 text-muted-foreground hover:bg-destructive/15 hover:text-destructive"
                title="Excluir mapa"
              >
                <Trash2 size={15} />
              </button>
            </div>
          </Card>

          {/* Visualizador do Mapa Interativo com Pins */}
          <div
            ref={mapContainerRef}
            onClick={handleMapClick}
            className={`relative overflow-hidden rounded-2xl border-2 border-primary/40 shadow-2xl ${
              isPlacingMarker ? "cursor-crosshair ring-4 ring-amber-500/50" : "cursor-default"
            }`}
            style={{ minHeight: "500px", maxHeight: "750px", backgroundColor: "#0b0d12" }}
          >
            <img
              src={activeMap.url}
              alt={activeMap.titulo}
              className="h-full w-full object-cover select-none pointer-events-none"
            />

            {/* Marcadores / Pins */}
            {markers.map((marker) => {
              const isHidden = marker.hidden;

              return (
                <div
                  key={marker.id}
                  onClick={(e) => {
                    e.stopPropagation();
                    setSelectedMarker(marker);
                  }}
                  style={{ left: `${marker.x}%`, top: `${marker.y}%` }}
                  className={`absolute -translate-x-1/2 -translate-y-1/2 flex items-center justify-center h-8 w-8 rounded-full border-2 transition-transform hover:scale-125 cursor-pointer shadow-lg ${
                    isHidden
                      ? "border-rose-500 bg-rose-950/90 text-rose-300"
                      : "border-primary bg-primary text-primary-foreground"
                  }`}
                  title={`${marker.title} (${isHidden ? "Oculto dos jogadores" : "Revelado"})`}
                >
                  <MapPin size={16} />
                </div>
              );
            })}
          </div>

          {/* Painel do Marcador Selecionado */}
          {selectedMarker && (
            <Card className="border-2 border-primary/50">
              <div className="flex items-center justify-between border-b border-border pb-2">
                <div className="flex items-center gap-2">
                  <MapPin size={16} className="text-primary" />
                  <strong className="font-serif text-foreground">{selectedMarker.title}</strong>
                  <span
                    className={`rounded px-1.5 py-0.2 text-[9px] font-bold uppercase ${
                      selectedMarker.hidden
                        ? "bg-rose-950/40 text-rose-300 border border-rose-500/40"
                        : "bg-emerald-950/40 text-emerald-300 border border-emerald-500/40"
                    }`}
                  >
                    {selectedMarker.hidden ? "Oculto dos Jogadores" : "Revelado aos Jogadores"}
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => toggleMarkerVisibility(selectedMarker.id)}
                    className="flex items-center gap-1 rounded border border-border px-2.5 py-1 text-xs text-muted-foreground hover:border-primary hover:text-foreground"
                  >
                    {selectedMarker.hidden ? <Eye size={13} /> : <EyeOff size={13} />}
                    <span>{selectedMarker.hidden ? "Revelar aos Jogadores" : "Ocultar"}</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => removeMarker(selectedMarker.id)}
                    className="rounded p-1 text-muted-foreground hover:bg-destructive/15 hover:text-destructive"
                    title="Excluir marcador"
                  >
                    <Trash2 size={14} />
                  </button>
                  <button
                    type="button"
                    onClick={() => setSelectedMarker(null)}
                    className="rounded px-2 text-xs text-muted-foreground hover:bg-secondary"
                  >
                    Fechar
                  </button>
                </div>
              </div>
            </Card>
          )}
        </div>
      ) : null}

      {/* Confirmação de Exclusão */}
      <ConfirmDialog
        isOpen={Boolean(mapToDelete)}
        title={`Excluir mapa "${mapToDelete?.titulo}"?`}
        message="O mapa cartográfico e todos os marcadores cadastrados serão removidos permanentemente."
        onConfirm={handleDeleteMap}
        onCancel={() => setMapToDelete(null)}
      />
    </div>
  );
}
