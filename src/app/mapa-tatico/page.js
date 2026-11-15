"use client";

import dynamic from "next/dynamic";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  ChevronLeft,
  ChevronRight,
  ChevronUp,
  ChevronDown,
  Compass,
  Eye,
  EyeOff,
  Footprints,
  Grid,
  Heart,
  Map as MapIcon,
  Minus,
  Plus,
  ScrollText,
  Shield,
  Sparkles,
  Sword,
  Swords,
  Trash2,
  Upload,
  Users,
  Warehouse,
  Zap,
  Crown,
  BookOpen,
  Home,
  Package,
  FileText,
  Coins,
  Cat,
  Flame,
  ShieldCheck,
  Axe,
  Wand,
  Skull,
  Ghost,
  Star,
  Gem,
  Bug,
  Bird,
  PawPrint,
  FlaskConical,
  Moon,
  Anchor,
  Hammer,
} from "lucide-react";
import EmberCanvas from "../components/mapa/EmberCanvas";
import FloatingWindow from "../components/mapa/FloatingWindow";
import { useWindowManager } from "../../hooks/useWindowManager";
import { useAuth } from "../context/AuthContext";
import {
  getTaticoMap,
  listCampaigns,
  listCharacters,
  listCampaignNpcs,
  updateTaticoMap,
  uploadArquivo,
  getApiBaseUrl,
} from "../../lib/api";

const PanelFallback = () => (
  <div className="flex h-full min-h-40 items-center justify-center text-xs text-muted-foreground">
    <span className="animate-pulse">Abrindo grimório…</span>
  </div>
);
const PersonagemPage = dynamic(() => import("../personagem/page"), { ssr: false, loading: () => <PanelFallback /> });
const HabilidadesPage = dynamic(() => import("../habilidades/page"), { ssr: false, loading: () => <PanelFallback /> });
const InventarioPage = dynamic(() => import("../inventario/page"), { ssr: false, loading: () => <PanelFallback /> });
const ContratosPage = dynamic(() => import("../contratos/page"), { ssr: false, loading: () => <PanelFallback /> });
const AnotacoesPage = dynamic(() => import("../anotacoes/page"), { ssr: false, loading: () => <PanelFallback /> });
const MundoPage = dynamic(() => import("../mundo/page"), { ssr: false, loading: () => <PanelFallback /> });
const BancoPage = dynamic(() => import("../banco/page"), { ssr: false, loading: () => <PanelFallback /> });
const QuartoPage = dynamic(() => import("../quarto/page"), { ssr: false, loading: () => <PanelFallback /> });
const MontariaPage = dynamic(() => import("../montaria/page"), { ssr: false, loading: () => <PanelFallback /> });
const AdminPersonagens = dynamic(() => import("../admin/personagens/page"), { ssr: false, loading: () => <PanelFallback /> });
const AdminNpcs = dynamic(() => import("../admin/npcs/page"), { ssr: false, loading: () => <PanelFallback /> });
const AdminEncontros = dynamic(() => import("../admin/encontros/page"), { ssr: false, loading: () => <PanelFallback /> });
const AdminNotas = dynamic(() => import("../admin/notas/page"), { ssr: false, loading: () => <PanelFallback /> });
const AdminSessoes = dynamic(() => import("../admin/sessoes/page"), { ssr: false, loading: () => <PanelFallback /> });

const PLAYER_WIDGETS = [
  { id: "personagem", label: "Personagem", icon: <ScrollText size={14} />, content: <PersonagemPage /> },
  { id: "habilidades", label: "Habilidades", icon: <Zap size={14} />, content: <HabilidadesPage /> },
  { id: "inventario", label: "Inventário", icon: <Package size={14} />, content: <InventarioPage /> },
  { id: "contratos", label: "Contratos", icon: <FileText size={14} />, content: <ContratosPage /> },
  { id: "anotacoes", label: "Diário", icon: <BookOpen size={14} />, content: <AnotacoesPage /> },
  { id: "mundo", label: "Mundo", icon: <Compass size={14} />, content: <MundoPage /> },
  { id: "banco", label: "Banco", icon: <Coins size={14} />, content: <BancoPage /> },
  { id: "quarto", label: "Quarto", icon: <Home size={14} />, content: <QuartoPage /> },
  { id: "montaria", label: "Montaria", icon: <Footprints size={14} />, content: <MontariaPage /> },
];
const MASTER_WIDGETS = [
  ...PLAYER_WIDGETS,
  { id: "admin-personagens", label: "Heróis & Ameaças", icon: <Sword size={14} />, content: <AdminPersonagens /> },
  { id: "admin-npcs", label: "Bestiário (NPCs)", icon: <Shield size={14} />, content: <AdminNpcs /> },
  { id: "admin-encontros", label: "Encontros", icon: <Swords size={14} />, content: <AdminEncontros /> },
  { id: "admin-notas", label: "Segredos & Notas", icon: <FileText size={14} />, content: <AdminNotas /> },
  { id: "admin-sessoes", label: "Sessões & Cenas", icon: <BookOpen size={14} />, content: <AdminSessoes /> },
];

const TOKEN_SIZES = { P: 44, M: 58, G: 74, E: 92 };
const TOKEN_ICONS = {
  shield: Shield,
  shieldCheck: ShieldCheck,
  sword: Sword,
  swords: Swords,
  axe: Axe,
  wand: Wand,
  crown: Crown,
  skull: Skull,
  ghost: Ghost,
  flame: Flame,
  zap: Zap,
  heart: Heart,
  star: Star,
  eye: Eye,
  cat: Cat,
  sparkles: Sparkles,
  gem: Gem,
  bug: Bug,
  bird: Bird,
  paw: PawPrint,
  flask: FlaskConical,
  moon: Moon,
  anchor: Anchor,
  hammer: Hammer,
};
const ICON_OPTIONS = Object.keys(TOKEN_ICONS);
const uid = () => (crypto?.randomUUID ? crypto.randomUUID() : `tok-${Date.now()}-${Math.random().toString(16).slice(2)}`);

export default function MapaTaticoPage() {
  const { token, isMaster, user } = useAuth();
  const [campaigns, setCampaigns] = useState([]);
  const [selectedCampaignId, setSelectedCampaignId] = useState("");
  const [heroes, setHeroes] = useState([]);
  const [npcs, setNpcs] = useState([]);
  const [map, setMap] = useState(null);
  const [mapLoading, setMapLoading] = useState(true);
  const [mapError, setMapError] = useState(null);
  const [isSaving, setIsSaving] = useState(false);
  const [paletteOpen, setPaletteOpen] = useState(true);
  const [activeTool, setActiveTool] = useState("move"); // move | place
  const [snap, setSnap] = useState(false);
  const [selectedToken, setSelectedToken] = useState(null);
  const [dragInfo, setDragInfo] = useState(null); // { id, startX, startY, baseX, baseY }
  const [uploadingBg, setUploadingBg] = useState(false);
  const saveTimer = useRef(null);
  const fieldRef = useRef(null);
  const { windows, openWindow, closeWindow, toggleMinimize, focusWindow, moveWindow, resizeWindow } = useWindowManager();

  const widgets = isMaster ? MASTER_WIDGETS : PLAYER_WIDGETS;
  const activeCampaign = useMemo(() => campaigns.find((c) => c.id === selectedCampaignId) || null, [campaigns, selectedCampaignId]);

  // Carrega campanhas e escolhe a primeira
  useEffect(() => {
    if (!token) return;
    listCampaigns(token)
      .then((camps) => {
        const list = Array.isArray(camps) ? camps : [];
        setCampaigns(list);
        setSelectedCampaignId((current) => current || list[0]?.id || "");
      })
      .catch(() => {});
  }, [token]);

  // Carrega o mapa e as fontes de miniaturas ao trocar a campanha
  const loadMap = useCallback((campId) => {
    if (!campId) return;
    setMapLoading(true);
    setMapError(null);
    Promise.all([
      getTaticoMap(campId, token),
      listCharacters(token).catch(() => []),
      listCampaignNpcs(campId, token).catch(() => []),
    ])
      .then(([mapData, chars, npcList]) => {
        setMap(mapData);
        const allChars = Array.isArray(chars) ? chars : [];
        setHeroes(isMaster ? allChars.filter((c) => c.campanhaId === campId) : allChars);
        setNpcs(Array.isArray(npcList) ? npcList : []);
      })
      .catch((error) => {
        setMapError(error?.message || "Não foi possível carregar o mapa.");
        setMap(null);
      })
      .finally(() => setMapLoading(false));
  }, [token, isMaster]);

  useEffect(() => {
    loadMap(selectedCampaignId);
    setSelectedToken(null);
  }, [loadMap, selectedCampaignId]);

  const persist = useCallback((patch) => {
    if (!selectedCampaignId) return;
    window.clearTimeout(saveTimer.current);
    saveTimer.current = window.setTimeout(async () => {
      setIsSaving(true);
      try {
        const updated = await updateTaticoMap(selectedCampaignId, patch, token);
        setMap((current) => (current ? { ...current, ...updated } : updated));
      } catch (error) {
        console.warn("Falha ao salvar o mapa:", error?.message);
      } finally {
        setIsSaving(false);
      }
    }, 650);
  }, [selectedCampaignId, token]);

  const updateTokens = useCallback((mutator) => {
    setMap((current) => {
      if (!current) return current;
      const tokens = typeof mutator === "function" ? mutator(current.tokens || []) : mutator;
      persist({ tokens });
      return { ...current, tokens };
    });
  }, [persist]);

  const addToken = (kind, source) => {
    updateTokens((tokens) => {
      const next = {
        id: uid(),
        tipo: kind === "sheet" ? "personagem" : "monstro",
        refId: source.id,
        name: source.name || source.nome || "Miniatura",
        x: 0.42 + Math.random() * 0.16,
        y: 0.42 + Math.random() * 0.16,
        tamanho: "M",
        hp: source.hp ?? null,
        hpMax: source.hpMax ?? null,
        icone: kind === "sheet" ? "shield" : "sword",
      };
      return [...tokens, next];
    });
  };

  const removeToken = (tokenId) => {
    updateTokens((tokens) => tokens.filter((t) => t.id !== tokenId));
    setSelectedToken(null);
  };

  const setTokenIcon = (tokenId, icone) => {
    updateTokens((tokens) => tokens.map((t) => (t.id === tokenId ? { ...t, icone } : t)));
  };

  const cycleTokenSize = (tokenId) => {
    const order = ["P", "M", "G", "E"];
    updateTokens((tokens) => tokens.map((t) => (t.id === tokenId ? { ...t, tamanho: order[(order.indexOf(t.tamanho || "M") + 1) % order.length] } : t)));
  };

  const toggleHidden = (tokenId) => {
    updateTokens((tokens) => tokens.map((t) => (t.id === tokenId ? { ...t, oculto: !t.oculto } : t)));
  };

  const adjustHp = (tokenId, delta) => {
    updateTokens((tokens) => tokens.map((t) => {
      if (t.id !== tokenId) return t;
      const max = Number(t.hpMax ?? 20);
      const next = Math.max(0, Math.min(max, Number(t.hp ?? max) + delta));
      return { ...t, hp: next };
    }));
  };

  // Drag de tokens (pointer events)
  const onTokenPointerDown = (event, tokenItem) => {
    event.stopPropagation();
    event.preventDefault();
    focusMapField();
    setSelectedToken(tokenItem.id);
    setDragInfo({ id: tokenItem.id, startX: event.clientX, startY: event.clientY, baseX: tokenItem.x, baseY: tokenItem.y, field: fieldRef.current?.getBoundingClientRect() });
  };
  const focusMapField = () => {
    // interrompe drag de janelas para este fluxo
  };
  useEffect(() => {
    if (!dragInfo) return undefined;
    const { field } = dragInfo;
    const handleMove = (event) => {
      if (!field) return;
      const dx = (event.clientX - dragInfo.startX) / field.width;
      const dy = (event.clientY - dragInfo.startY) / field.height;
      let nx = dragInfo.baseX + dx;
      let ny = dragInfo.baseY + dy;
      if (snap) {
        nx = Math.round(nx * (field.width / (map?.gradePx || 40))) / (field.width / (map?.gradePx || 40));
        ny = Math.round(ny * (field.height / (map?.gradePx || 40))) / (field.height / (map?.gradePx || 40));
      }
      setMap((current) => (current ? { ...current, tokens: (current.tokens || []).map((t) => (t.id === dragInfo.id ? { ...t, x: Math.min(0.96, Math.max(0.04, nx)), y: Math.min(0.96, Math.max(0.04, ny)) } : t)) } : current));
    };
    const handleUp = () => {
      const latest = dragInfo;
      setDragInfo(null);
      if (latest) {
        setMap((current) => {
          if (current) persist({ tokens: current.tokens });
          return current;
        });
      }
    };
    window.addEventListener("pointermove", handleMove);
    window.addEventListener("pointerup", handleUp);
    return () => {
      window.removeEventListener("pointermove", handleMove);
      window.removeEventListener("pointerup", handleUp);
    };
  }, [dragInfo, map?.gradePx, persist, snap]);

  // Atualiza o título do mapa (mestre)
  const renameMap = (value) => setMap((current) => (current ? { ...current, titulo: value } : current));
  const saveTitle = () => { if (map?.titulo?.trim()) persist({ titulo: map.titulo.trim() }); };

  const changeGrade = (delta) => {
    if (map) persist({ gradePx: Math.max(10, Math.min(200, (map.gradePx || 40) + delta)) });
  };
  const toggleGrid = () => { if (map) persist({ gradeVisivel: !map.gradeVisivel }); };

  const uploadBackground = async (event) => {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (!file) return;
    setUploadingBg(true);
    try {
      const uploaded = await uploadArquivo(file, { campanhaId: selectedCampaignId, contexto: "mapa" }, token);
      const arquivoId = uploaded?.arquivo?.id;
      if (arquivoId) persist({ arquivoFundoId: arquivoId });
    } catch (error) {
      window.alert(`Não foi possível enviar o fundo: ${error?.message || "erro"}`);
    } finally {
      setUploadingBg(false);
    }
  };
  const clearBackground = () => persist({ arquivoFundoId: null, urlFundo: null });

  // URL do fundo a renderizar
  const backgroundUrl = useMemo(() => {
    if (map?.urlFundoAssinada) return `${getApiBaseUrl().replace(/\/api$/, "")}${map.urlFundoAssinada}`;
    if (map?.urlFundo) return map.urlFundo;
    return null;
  }, [map?.urlFundo, map?.urlFundoAssinada]);

  const tokens = map?.tokens || [];
  const selected = tokens.find((t) => t.id === selectedToken) || null;
  const canManage = Boolean(map?.podeGerenciar);

  return (
    <div className="flex min-h-[calc(100vh-88px)] flex-col gap-3 p-3 sm:p-4">
      {/* Barra superior do mapa */}
      <div className="flex flex-col gap-2 rounded-2xl border border-primary/25 bg-card/80 p-3 shadow-sm backdrop-blur-sm lg:flex-row lg:items-center lg:justify-between">
        <div className="flex items-center gap-3">
          <span className="flex h-10 w-10 items-center justify-center rounded-xl border border-primary/50 bg-primary/15 text-primary">
            <MapIcon size={18} />
          </span>
          <div>
            {canManage ? (
              <input
                value={map?.titulo || ""}
                onChange={(e) => renameMap(e.target.value)}
                onBlur={saveTitle}
                onKeyDown={(e) => e.key === "Enter" && saveTitle()}
                aria-label="Título do mapa"
                className="block w-48 bg-transparent font-cinzel text-base font-black uppercase tracking-wider text-foreground outline-none transition focus:border-b focus:border-primary sm:text-lg"
              />
            ) : (
              <h1 className="font-cinzel text-base font-black uppercase tracking-wider gold-gradient-text sm:text-lg">
                {map?.titulo || "Campo de Batalha"}
              </h1>
            )}
            <p className="font-journal text-[10px] italic text-muted-foreground">
              {activeCampaign?.nome || "Mesa"} — {tokens.length} miniatura(s) em campo {isSaving ? "· salvando…" : "· persistido"}
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-1.5">
          {/* Escolher campanha (jogador com mais de uma mesa) */}
          {campaigns.length > 1 && (
            <select
              value={selectedCampaignId}
              onChange={(e) => setSelectedCampaignId(e.target.value)}
              aria-label="Mesa"
              className="min-h-9 max-w-44 rounded-lg border border-white/10 bg-background/70 px-2 text-xs text-foreground outline-none focus:border-primary"
            >
              {campaigns.map((c) => <option key={c.id} value={c.id}>{c.nome}</option>)}
            </select>
          )}
          <button type="button" onClick={toggleGrid} title={map?.gradeVisivel ? "Ocultar grade" : "Mostrar grade"} aria-pressed={Boolean(map?.gradeVisivel)} className="min-h-9 rounded-lg border border-white/10 bg-background/70 p-2 text-muted-foreground transition hover:text-primary">
            <Grid size={15} />
          </button>
          <div className="flex items-center gap-1 rounded-lg border border-white/10 bg-background/70 px-1.5 py-1">
            <button type="button" onClick={() => changeGrade(-8)} aria-label="Diminuir casas" className="p-1 text-muted-foreground hover:text-foreground"><Minus size={12} /></button>
            <span className="w-10 text-center font-mono text-[11px] text-muted-foreground" title="Tamanho da casa (px)">{map?.gradePx || 40}px</span>
            <button type="button" onClick={() => changeGrade(8)} aria-label="Aumentar casas" className="p-1 text-muted-foreground hover:text-foreground"><Plus size={12} /></button>
          </div>
          <button type="button" onClick={() => setSnap((v) => !v)} aria-pressed={snap} title="Encaixar na grade" className={`min-h-9 rounded-lg border p-2 transition ${snap ? "border-primary bg-primary/20 text-primary" : "border-white/10 bg-background/70 text-muted-foreground hover:text-foreground"}`}>
            <Footprints size={15} />
          </button>
          {canManage && (
            <>
              <label className="flex min-h-9 cursor-pointer items-center gap-1.5 rounded-lg border border-primary/40 bg-primary/15 px-2.5 py-1.5 font-cinzel text-[10px] font-bold uppercase tracking-wider text-primary transition hover:bg-primary/25" title="Enviar imagem para substituir o fundo do mapa">
                {uploadingBg ? <span className="animate-pulse">Subindo…</span> : <><Upload size={12} /> Mapa</>}
                <input type="file" accept="image/png,image/jpeg,image/webp,image/gif" className="sr-only" onChange={uploadBackground} disabled={uploadingBg} />
              </label>
              {backgroundUrl && (
                <button type="button" onClick={clearBackground} className="min-h-9 rounded-lg border border-white/10 bg-background/70 p-2 text-muted-foreground transition hover:text-rose-300" title="Restaurar fundo padrão (cinzas arcanos)" aria-label="Restaurar fundo padrão">
                  <Trash2 size={14} />
                </button>
              )}
            </>
          )}
        </div>
      </div>

      {/* Área do mapa + paleta lateral */}
      <div className="relative flex min-h-0 flex-1 gap-3">
        {/* Paleta de miniaturas */}
        {paletteOpen && (
          <aside className="z-10 flex w-48 shrink-0 flex-col overflow-hidden rounded-2xl border border-primary/20 bg-card/85 backdrop-blur-sm lg:w-56">
            <div className="flex items-center justify-between border-b border-white/5 p-3">
              <span className="font-cinzel text-[10px] font-black uppercase tracking-widest text-primary">Miniaturas</span>
              <button type="button" onClick={() => setPaletteOpen(false)} className="p-1 text-muted-foreground hover:text-foreground" aria-label="Fechar paleta">
                <ChevronLeft size={14} />
              </button>
            </div>
            <div className="custom-scroll min-h-0 flex-1 space-y-3 overflow-y-auto p-3 text-xs">
              <div>
                <span className="mb-1 block font-cinzel text-[9px] font-bold uppercase tracking-widest text-muted-foreground">Heróis</span>
                <div className="space-y-1">
                  {heroes.length === 0 && <p className="px-1 text-[10px] italic text-muted-foreground">Nenhuma ficha nesta mesa.</p>}
                  {heroes.map((hero) => (
                    <button key={hero.id} type="button" onClick={() => addToken("sheet", hero)} className="flex w-full items-center gap-1.5 rounded-lg border border-white/5 bg-white/[0.03] px-2 py-1.5 text-left transition hover:border-primary/40 hover:bg-primary/10">
                      <Plus size={11} className="shrink-0 text-primary" />
                      <span className="truncate">{hero.name}</span>
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <span className="mb-1 block font-cinzel text-[9px] font-bold uppercase tracking-widest text-muted-foreground">Monstros & NPCs</span>
                <div className="space-y-1">
                  {npcs.length === 0 && <p className="px-1 text-[10px] italic text-muted-foreground">Bestiário vazio.</p>}
                  {npcs.map((npc) => (
                    <button key={npc.id} type="button" onClick={() => addToken("npc", npc)} className="flex w-full items-center gap-1.5 rounded-lg border border-rose-500/10 bg-rose-950/10 px-2 py-1.5 text-left transition hover:border-rose-500/40 hover:bg-rose-950/30">
                      <Plus size={11} className="shrink-0 text-rose-300" />
                      <span className="truncate">{npc.nome}</span>
                    </button>
                  ))}
                </div>
              </div>
              {/* Alvo selecionado */}
              {selected && (
                <div className="rounded-xl border border-primary/30 bg-primary/5 p-2 text-[10px]">
                  <div className="flex items-center justify-between gap-2">
                    <strong className="truncate text-foreground">{selected.name}</strong>
                    <div className="flex items-center gap-1">
                      <button type="button" onClick={() => cycleTokenSize(selected.id)} title="Tamanho" className="rounded border border-white/10 px-1 py-0.5 font-mono text-[10px] text-primary">{selected.tamanho || "M"}</button>
                      {canManage && (
                        <>
                          <button type="button" onClick={() => toggleHidden(selected.id)} title={selected.oculto ? "Mostrar na mesa" : "Ocultar da mesa"} className="rounded border border-white/10 p-1 text-muted-foreground hover:text-foreground">{selected.oculto ? <EyeOff size={11} /> : <Eye size={11} />}</button>
                          <button type="button" onClick={() => removeToken(selected.id)} title="Remover miniatura" className="rounded border border-white/10 p-1 text-rose-300/90 hover:text-rose-200"><Trash2 size={11} /></button>
                        </>
                      )}
                    </div>
                  </div>
                  {(selected.hpMax != null) && (
                    <div className="mt-1 flex items-center justify-between gap-2">
                      <span className="flex items-center gap-1 font-mono text-rose-300"><Heart size={10} /> {selected.hp}/{selected.hpMax}</span>
                      <div className="flex items-center gap-0.5">
                        <button type="button" onClick={() => adjustHp(selected.id, -1)} aria-label="Dano 1" className="rounded border border-white/10 px-1 text-[11px]">−</button>
                        <button type="button" onClick={() => adjustHp(selected.id, +1)} aria-label="Cura 1" className="rounded border border-white/10 px-1 text-[11px]">+</button>
                      </div>
                    </div>
                  )}
                  <span className="mt-1.5 block font-cinzel text-[8px] font-bold uppercase tracking-widest text-muted-foreground">Ícone</span>
                  <div className="mt-1 grid grid-cols-12 gap-1">
                    {ICON_OPTIONS.map((key) => {
                      const Ico = TOKEN_ICONS[key];
                      const activeIcone = selected.icone || (selected.tipo === "personagem" ? "shield" : "sword");
                      const isActive = activeIcone === key;
                      return (
                        <button
                          key={key}
                          type="button"
                          onClick={() => setTokenIcon(selected.id, key)}
                          title={key}
                          aria-label={`Ícone ${key}`}
                          aria-pressed={isActive}
                          className={`flex h-6 w-6 items-center justify-center rounded border transition ${isActive ? "border-primary bg-primary/25 text-primary" : "border-white/10 text-muted-foreground hover:border-primary/40 hover:text-primary"}`}
                        >
                          <Ico size={12} />
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          </aside>
        )}
        {!paletteOpen && (
          <button type="button" onClick={() => setPaletteOpen(true)} className="z-10 flex w-8 shrink-0 items-center justify-center rounded-2xl border border-primary/20 bg-card/80 text-primary hover:bg-primary/10" aria-label="Mostrar paleta de miniaturas" title="Miniaturas">
            <ChevronRight size={16} />
          </button>
        )}

        {/* Canvas do mapa */}
        <div
          ref={fieldRef}
          className="relative min-h-0 flex-1 select-none overflow-hidden rounded-2xl border border-primary/30 bg-[#0b0d12] shadow-[inset_0_0_80px_rgba(0,0,0,0.9),0_0_60px_color-mix(in_srgb,var(--primary)_15%,transparent)]"
          onPointerDown={() => setSelectedToken(null)}
        >
          {/* Camadas de fundo */}
          {backgroundUrl ? (
            <div className="animate-kenburns absolute inset-[-12%] bg-cover bg-center transition-opacity duration-700" style={{ backgroundImage: `url(${backgroundUrl})` }} />
          ) : (
            <div className="absolute inset-0" style={{ background: "radial-gradient(ellipse at 30% 20%, rgba(90,60,25,0.5), transparent 55%), radial-gradient(ellipse at 75% 80%, rgba(35,12,60,0.55), transparent 60%), linear-gradient(180deg, #141109 0%, #191209 45%, #0d0a08 100%)" }} />
          )}
          {/* Névoa de atmosfera */}
          <div className="pointer-events-none absolute inset-0" style={{ background: "radial-gradient(ellipse at 50% 0%, rgba(20,15,8,0.1), transparent 60%), radial-gradient(ellipse at 50% 100%, rgba(8,6,10,0.55), transparent 55%)" }} />
          <EmberCanvas />
          {/* Grade */}
          {map?.gradeVisivel && (
            <div
              className="pointer-events-none absolute inset-0 opacity-80"
              style={{
                backgroundImage:
                  "linear-gradient(rgba(230,190,120,0.14) 1px, transparent 1px), linear-gradient(90deg, rgba(230,190,120,0.14) 1px, transparent 1px)",
                backgroundSize: `${map?.gradePx || 40}px ${map?.gradePx || 40}px`,
              }}
            />
          )}

          {/* Miniaturas */}
          {!mapLoading && !mapError && tokens.map((tokenItem) => {
            const size = TOKEN_SIZES[tokenItem.tamanho || "M"] || TOKEN_SIZES.M;
            const isSelected = selectedToken === tokenItem.id;
            const isHidden = Boolean(tokenItem.oculto) && isMaster;
            const TokenIcon = TOKEN_ICONS[tokenItem.icone] || (tokenItem.tipo === "personagem" ? Shield : Sword);
            const hpPct = tokenItem.hpMax ? Math.max(0, Math.round((100 * Number(tokenItem.hp ?? tokenItem.hpMax)) / Number(tokenItem.hpMax))) : null;
            return (
              <button
                key={tokenItem.id}
                type="button"
                onPointerDown={(e) => onTokenPointerDown(e, tokenItem)}
                className={`absolute flex -translate-x-1/2 -translate-y-1/2 touch-none flex-col items-center justify-center rounded-full border-2 font-cinzel transition-shadow ${
                  tokenItem.tipo === "personagem" ? "border-primary/70 shadow-[0_0_18px_color-mix(in_srgb,var(--primary)_45%,transparent),inset_0_0_14px_rgba(0,0,0,0.8)]" : "border-rose-500/70 shadow-[0_0_18px_rgba(244,63,94,0.35),inset_0_0_14px_rgba(0,0,0,0.8)]"
                } ${isSelected ? "z-20 ring-2 ring-primary ring-offset-2 ring-offset-background" : "z-10"} ${isHidden ? "opacity-60 saturate-0" : ""}`}
                style={{
                  left: `${(tokenItem.x ?? 0.5) * 100}%`,
                  top: `${(tokenItem.y ?? 0.5) * 100}%`,
                  width: size,
                  height: size,
                  background: tokenItem.tipo === "personagem"
                    ? "radial-gradient(circle at 32% 28%, #e8c37a 0%, #a87c3e 38%, #5c4020 72%, #241708 100%)"
                    : "radial-gradient(circle at 32% 28%, #f87171 0%, #b91c1c 38%, #6f1212 72%, #2a0707 100%)",
                }}
                title={`${tokenItem.name}${isHidden ? " (oculto da mesa)" : ""}`}
                aria-label={`Miniatura de ${tokenItem.name}`}
              >
                <TokenIcon size={size * 0.4} className="text-black/60" />
                {hpPct !== null && (
                  <span className="absolute -bottom-1.5 left-1 right-1 h-1.5 overflow-hidden rounded-full border border-black/60 bg-black/70">
                    <span className={`block h-full ${hpPct > 50 ? "bg-emerald-500" : hpPct > 25 ? "bg-amber-400" : "bg-rose-500"}`} style={{ width: `${hpPct}%` }} />
                  </span>
                )}
                {isHidden && <EyeOff size={14} className="absolute right-1 top-1 text-zinc-300" />}
              </button>
            );
          })}
          {mapLoading && <div className="absolute inset-0 flex items-center justify-center font-journal text-sm italic text-muted-foreground">Consumindo as brasas do mapa…</div>}
          {mapError && <div className="absolute inset-0 flex items-center justify-center p-6 text-center text-sm text-rose-300">{mapError}</div>}
          {!mapLoading && !mapError && tokens.length === 0 && (
            <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center gap-2 text-center">
              <MapIcon size={42} className="text-primary/40" />
              <p className="font-journal text-sm italic text-muted-foreground">Campo vazio.<br />Traga heróis e monstros para a arena.</p>
            </div>
          )}
        </div>

        {/* Docas de ferramentas flutuantes (lado direito) */}
        <nav className="z-10 flex w-11 shrink-0 flex-col items-center gap-1 overflow-y-auto rounded-2xl border border-primary/20 bg-card/80 py-2 backdrop-blur-sm" aria-label="Abrir janelas da ficha">
          {widgets.map((widget) => (
            <button
              key={widget.id}
              type="button"
              onClick={() => openWindow(widget.id)}
              className="flex h-9 w-9 items-center justify-center rounded-xl border border-white/5 bg-white/[0.04] text-muted-foreground transition hover:border-primary/40 hover:bg-primary/15 hover:text-primary"
              title={`Abrir ${widget.label}`}
              aria-label={`Abrir ${widget.label}`}
            >
              {widget.icon}
            </button>
          ))}
        </nav>
      </div>

      {/* Janelas flutuantes (pop-ups redimensionáveis) */}
      {widgets.map((widget) => {
        const win = windows[widget.id];
        if (!win) return null;
        return (
          <FloatingWindow
            key={widget.id}
            title={widget.label}
            icon={widget.icon}
            win={win}
            onFocus={() => focusWindow(widget.id)}
            onMove={(x, y) => moveWindow(widget.id, x, y)}
            onResize={(w, h) => resizeWindow(widget.id, w, h)}
            onMinimize={() => toggleMinimize(widget.id)}
            onClose={() => closeWindow(widget.id)}
          >
            {widget.content}
          </FloatingWindow>
        );
      })}
    </div>
  );
}
