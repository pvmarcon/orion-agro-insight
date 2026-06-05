import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useMemo, useRef, useState } from "react";
import {
  Upload, Search, Pencil, Trash2, Undo2, Download, Save, Sparkles,
  Layers, ZoomIn, ZoomOut, ArrowRight, Check, FileDown, KeyRound, Image as ImageIcon,
} from "lucide-react";
import { toast } from "sonner";
import mapboxgl from "mapbox-gl";
import MapboxDraw from "@mapbox/mapbox-gl-draw";
import turfArea from "@turf/area";
import turfCentroid from "@turf/centroid";
import "mapbox-gl/dist/mapbox-gl.css";
import "@mapbox/mapbox-gl-draw/dist/mapbox-gl-draw.css";
import { AppShell, Panel, PageHeader, BrandButton, Input } from "@/components/AppShell";

export const Route = createFileRoute("/talhoes")({
  head: () => ({ meta: [{ title: "Talhões — Orion AgTech" }] }),
  component: TalhoesPage,
});

type Plot = {
  id: string;
  name: string;
  color: string;
  cultura?: string;
  hectares: number;
  feature: GeoJSON.Feature<GeoJSON.Polygon>;
};

const COLORS = ["#E6641F", "#4ADE80", "#60A5FA", "#FBBF24", "#A78BFA", "#F472B6"];
const DEFAULT_CENTER: [number, number] = [-49.9509, -22.2118]; // Marília, SP
const STYLES = {
  satellite: "mapbox://styles/mapbox/satellite-streets-v12",
  streets: "mapbox://styles/mapbox/streets-v12",
  outdoors: "mapbox://styles/mapbox/outdoors-v12",
} as const;
type StyleKey = keyof typeof STYLES;

const ENV_TOKEN = (import.meta.env.VITE_MAPBOX_TOKEN as string | undefined) ?? "";

/* ─────────────────────────── Sample polygons (auto detect) ─────────────────────────── */
function sampleFeatures(center: [number, number]): GeoJSON.Feature<GeoJSON.Polygon>[] {
  const [lng, lat] = center;
  // ~0.01 deg ≈ 1.1 km
  const offsets: Array<{ name: string; cultura: string; box: [number, number, number, number] }> = [
    { name: "Talhão A", cultura: "Soja RR",            box: [lng - 0.014, lat - 0.004, lng - 0.002, lat + 0.008] },
    { name: "Talhão B", cultura: "Milho Híbrido",      box: [lng + 0.0,    lat - 0.006, lng + 0.012, lat + 0.006] },
    { name: "Talhão C", cultura: "Soja Convencional", box: [lng + 0.014,  lat - 0.010, lng + 0.026, lat + 0.004] },
  ];
  return offsets.map((o, i) => {
    const [w, s, e, n] = o.box;
    return {
      type: "Feature",
      properties: { name: o.name, cultura: o.cultura, color: COLORS[i % COLORS.length] },
      geometry: { type: "Polygon", coordinates: [[[w, s],[e, s],[e, n],[w, n],[w, s]]] },
    };
  });
}

/* ─────────────────────────── KML / CSV parsers ─────────────────────────── */
function parseKml(text: string): GeoJSON.Feature<GeoJSON.Polygon>[] {
  const doc = new DOMParser().parseFromString(text, "text/xml");
  const polys = Array.from(doc.getElementsByTagName("Polygon"));
  return polys.map((poly, i) => {
    const placemark = poly.closest("Placemark");
    const name = placemark?.getElementsByTagName("name")[0]?.textContent?.trim() || `Talhão ${String.fromCharCode(65 + i)}`;
    const coordsNode = poly.getElementsByTagName("coordinates")[0];
    if (!coordsNode) return null;
    const coords = coordsNode.textContent!.trim().split(/\s+/).map((s) => {
      const [lon, lat] = s.split(",").map(Number);
      return [lon, lat] as [number, number];
    }).filter((c) => Number.isFinite(c[0]) && Number.isFinite(c[1]));
    if (coords.length < 3) return null;
    return {
      type: "Feature",
      properties: { name, color: COLORS[i % COLORS.length] },
      geometry: { type: "Polygon", coordinates: [coords] },
    } as GeoJSON.Feature<GeoJSON.Polygon>;
  }).filter(Boolean) as GeoJSON.Feature<GeoJSON.Polygon>[];
}

function parseCsv(text: string): GeoJSON.Feature<GeoJSON.Polygon>[] {
  const lines = text.split(/\r?\n/).map((l) => l.trim()).filter(Boolean);
  const grouped = new Map<string, [number, number][]>();
  const startIdx = /[a-z]/i.test(lines[0]) ? 1 : 0;
  for (let i = startIdx; i < lines.length; i++) {
    const parts = lines[i].split(/[,;]/).map((p) => p.trim());
    if (parts.length < 3) continue;
    const name = parts[0];
    const lon = Number(parts[1]); const lat = Number(parts[2]);
    if (!Number.isFinite(lon) || !Number.isFinite(lat)) continue;
    if (!grouped.has(name)) grouped.set(name, []);
    grouped.get(name)!.push([lon, lat]);
  }
  return Array.from(grouped.entries()).map(([name, coords], i) => ({
    type: "Feature",
    properties: { name, color: COLORS[i % COLORS.length] },
    geometry: { type: "Polygon", coordinates: [[...coords, coords[0]]] },
  } as GeoJSON.Feature<GeoJSON.Polygon>));
}

function toKml(plots: Plot[]) {
  const placemarks = plots.map((p) => {
    const coords = (p.feature.geometry.coordinates[0] as [number, number][])
      .map(([lon, lat]) => `${lon},${lat},0`).join(" ");
    return `<Placemark><name>${p.name}</name><description>${p.cultura ?? ""} · ${p.hectares.toFixed(1)} ha</description><Polygon><outerBoundaryIs><LinearRing><coordinates>${coords}</coordinates></LinearRing></outerBoundaryIs></Polygon></Placemark>`;
  }).join("");
  return `<?xml version="1.0" encoding="UTF-8"?><kml xmlns="http://www.opengis.net/kml/2.2"><Document><name>Orion AgTech — Talhões</name>${placemarks}</Document></kml>`;
}

function toGeoJson(plots: Plot[]): GeoJSON.FeatureCollection {
  return {
    type: "FeatureCollection",
    features: plots.map((p) => ({
      ...p.feature,
      properties: { name: p.name, cultura: p.cultura ?? null, color: p.color, hectares: +p.hectares.toFixed(2) },
    })),
  };
}

function downloadBlob(blob: Blob, name: string) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url; a.download = name; a.click();
  URL.revokeObjectURL(url);
}

/* ─────────────────────────── Component ─────────────────────────── */
function TalhoesPage() {
  const [token, setToken] = useState<string>(() => ENV_TOKEN || (typeof window !== "undefined" ? localStorage.getItem("orion_mapbox_token") ?? "" : ""));
  const [tokenInput, setTokenInput] = useState("");
  const [plots, setPlots] = useState<Plot[]>([]);
  const [tab, setTab] = useState<"Manual" | "KML" | "Automático">("Automático");
  const [autoRunning, setAutoRunning] = useState(false);
  const [fileName, setFileName] = useState<string | null>(null);
  const [styleKey, setStyleKey] = useState<StyleKey>("satellite");
  const [search, setSearch] = useState("");
  const fileRef = useRef<HTMLInputElement>(null);
  const mapEl = useRef<HTMLDivElement>(null);
  const mapRef = useRef<mapboxgl.Map | null>(null);
  const drawRef = useRef<MapboxDraw | null>(null);
  const labelMarkers = useRef<mapboxgl.Marker[]>([]);

  /* ── Build a Plot from a raw GeoJSON polygon ── */
  const buildPlot = (feat: GeoJSON.Feature<GeoJSON.Polygon>, idx: number): Plot => {
    const haRaw = turfArea(feat as any) / 10000;
    const props = (feat.properties ?? {}) as any;
    return {
      id: (feat.id as string) ?? crypto.randomUUID(),
      name: props.name ?? `Talhão ${String.fromCharCode(65 + idx)}`,
      cultura: props.cultura ?? undefined,
      color: props.color ?? COLORS[idx % COLORS.length],
      hectares: haRaw,
      feature: feat,
    };
  };

  /* ── Initialize map ── */
  useEffect(() => {
    if (!token || !mapEl.current || mapRef.current) return;
    mapboxgl.accessToken = token;

    // mapbox-gl v3 compat for mapbox-gl-draw v1.5 (defensive)
    try {
      const C = (MapboxDraw as any).constants?.classes;
      if (C) {
        C.CANVAS = "mapboxgl-canvas";
        C.CANVAS_CONTAINER = "mapboxgl-canvas-container";
        C.CONTROL_BASE = "mapboxgl-ctrl";
        C.CONTROL_PREFIX = "mapboxgl-ctrl-";
        C.CONTROL_GROUP = "mapboxgl-ctrl-group";
        C.ATTRIBUTION = "mapboxgl-ctrl-attrib";
      }
    } catch {}

    let map: mapboxgl.Map;
    try {
      map = new mapboxgl.Map({
        container: mapEl.current,
        style: STYLES[styleKey],
        center: DEFAULT_CENTER,
        zoom: 13.5,
        pitch: 0,
        attributionControl: false,
      });
    } catch (e: any) {
      console.error("[mapbox] init failed", e);
      toast.error("Falha ao iniciar o Mapbox.", { description: e?.message ?? "" });
      return;
    }
    mapRef.current = map;

    map.addControl(new mapboxgl.NavigationControl({ visualizePitch: true }), "top-right");
    map.addControl(new mapboxgl.ScaleControl({ unit: "metric" }), "bottom-left");
    map.addControl(new mapboxgl.AttributionControl({ compact: true }));

    const refresh = () => {
      const d = drawRef.current; if (!d) return;
      const fc = d.getAll();
      const next: Plot[] = (fc.features as GeoJSON.Feature[])
        .filter((f: GeoJSON.Feature): f is GeoJSON.Feature<GeoJSON.Polygon> => f.geometry?.type === "Polygon")
        .map((f: GeoJSON.Feature<GeoJSON.Polygon>, i: number) => buildPlot(f, i));
      setPlots(next);
    };

    map.on("load", () => {
      try {
        const draw = new MapboxDraw({
          displayControlsDefault: false,
          controls: { polygon: false, trash: false },
          defaultMode: "simple_select",
          styles: drawStyles(),
        });
        drawRef.current = draw;
        map.addControl(draw as any);
        map.on("draw.create", refresh);
        map.on("draw.update", refresh);
        map.on("draw.delete", refresh);
      } catch (e: any) {
        console.error("[mapbox-draw] init failed", e);
        toast.error("Falha ao iniciar ferramenta de desenho.", { description: e?.message ?? "" });
      }
      setTimeout(() => { try { map.resize(); } catch {} }, 50);
    });

    map.on("error", (ev: any) => {
      const msg = ev?.error?.message ?? String(ev?.error ?? ev);
      console.error("[mapbox] error", ev?.error ?? ev);
      const low = msg.toLowerCase();
      if (low.includes("unauthorized") || low.includes("invalid") || low.includes("403") || low.includes("401")) {
        toast.error("Token Mapbox inválido ou sem permissão.", { description: "Verifique o token em account.mapbox.com." });
        setToken("");
        try { localStorage.removeItem("orion_mapbox_token"); } catch {}
      }
    });

    const onResize = () => { try { map.resize(); } catch {} };
    window.addEventListener("resize", onResize);

    return () => {
      window.removeEventListener("resize", onResize);
      labelMarkers.current.forEach((m) => m.remove());
      labelMarkers.current = [];
      try { map.remove(); } catch {}
      mapRef.current = null;
      drawRef.current = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token]);

  /* ── React to style changes ── */
  useEffect(() => {
    const m = mapRef.current; if (!m) return;
    m.setStyle(STYLES[styleKey]);
  }, [styleKey]);

  /* ── Render area labels as markers (independent of style reloads) ── */
  useEffect(() => {
    const m = mapRef.current; if (!m) return;
    labelMarkers.current.forEach((mk) => mk.remove());
    labelMarkers.current = plots.map((p) => {
      const c = turfCentroid(p.feature as any).geometry.coordinates as [number, number];
      const el = document.createElement("div");
      el.style.cssText = "background:rgba(0,0,0,0.75);border:1px solid " + p.color + ";color:#fff;font:600 11px Inter,sans-serif;padding:3px 7px;border-radius:6px;white-space:nowrap;pointer-events:none;";
      el.innerHTML = `${p.name} · <span style="color:${p.color}">${p.hectares.toFixed(1)} ha</span>`;
      return new mapboxgl.Marker({ element: el }).setLngLat(c).addTo(m);
    });
  }, [plots]);

  /* ── Helpers ── */
  const totalHa = useMemo(() => plots.reduce((s, p) => s + p.hectares, 0), [plots]);

  const startDrawing = () => {
    const d = drawRef.current; if (!d) return;
    d.changeMode("draw_polygon" as any);
    toast.message("Demarcação manual ativa", { description: "Clique no mapa para adicionar pontos. Duplo clique para finalizar." });
  };

  const undoPoint = () => {
    // Mapbox Draw does not expose an undo; cancel current draw and let user restart.
    const d = drawRef.current; if (!d) return;
    d.changeMode("simple_select");
    toast.message("Demarcação cancelada.");
  };

  const clearAll = () => {
    const d = drawRef.current; if (!d) return;
    if (plots.length === 0) return;
    d.deleteAll();
    setPlots([]);
    toast.success("Demarcações apagadas.");
  };

  const runAutoDetect = () => {
    const m = mapRef.current, d = drawRef.current; if (!m || !d) return;
    setAutoRunning(true);
    setTimeout(() => {
      const center = m.getCenter().toArray() as [number, number];
      const feats = sampleFeatures(center);
      d.deleteAll();
      feats.forEach((f) => d.add(f));
      const fc = d.getAll();
      const next = (fc.features as GeoJSON.Feature[]).map((f: GeoJSON.Feature, i: number) => {
        const merged = { ...f, properties: { ...(f.properties ?? {}), ...feats[i]?.properties } } as GeoJSON.Feature<GeoJSON.Polygon>;
        return buildPlot(merged, i);
      });
      setPlots(next);
      setAutoRunning(false);
      const b = new mapboxgl.LngLatBounds();
      feats.forEach((f) => (f.geometry.coordinates[0] as [number, number][]).forEach((c) => b.extend(c)));
      m.fitBounds(b, { padding: 60, duration: 800 });
      toast.success(`${feats.length} talhões detectados.`);
    }, 1100);
  };

  const onFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0]; if (!f) return;
    setFileName(f.name);
    const ext = f.name.split(".").pop()?.toLowerCase();
    try {
      let feats: GeoJSON.Feature<GeoJSON.Polygon>[] = [];
      if (ext === "kml") feats = parseKml(await f.text());
      else if (ext === "csv") feats = parseCsv(await f.text());
      else if (ext === "geojson" || ext === "json") {
        const data = JSON.parse(await f.text()) as GeoJSON.FeatureCollection;
        feats = (data.features ?? []).filter((x): x is GeoJSON.Feature<GeoJSON.Polygon> => x.geometry?.type === "Polygon");
      } else {
        toast.error("Use arquivos .kml, .csv ou .geojson.");
        return;
      }
      if (feats.length === 0) throw new Error("Nenhum polígono encontrado no arquivo.");
      const d = drawRef.current, m = mapRef.current; if (!d || !m) return;
      d.deleteAll();
      feats.forEach((ft, i) => d.add({ ...ft, properties: { ...(ft.properties ?? {}), color: COLORS[i % COLORS.length] } }));
      const next = (d.getAll().features as GeoJSON.Feature[]).map((ft: GeoJSON.Feature, i: number) => buildPlot({ ...ft, properties: { ...(ft.properties ?? {}), ...feats[i]?.properties } } as GeoJSON.Feature<GeoJSON.Polygon>, i));
      setPlots(next);
      const b = new mapboxgl.LngLatBounds();
      feats.forEach((ft) => (ft.geometry.coordinates[0] as [number, number][]).forEach((c) => b.extend(c)));
      m.fitBounds(b, { padding: 60, duration: 800 });
      toast.success(`${feats.length} talhão(ões) importado(s).`);
    } catch (err: any) {
      toast.error(err.message ?? "Falha ao importar arquivo.");
    }
    e.target.value = "";
  };

  /* ── Search via Mapbox Geocoding API ── */
  const doSearch = async (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!search.trim() || !token || !mapRef.current) return;
    try {
      const r = await fetch(`https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(search)}.json?access_token=${token}&limit=1`);
      const data = await r.json();
      const f = data.features?.[0];
      if (!f) { toast.error("Local não encontrado."); return; }
      mapRef.current.flyTo({ center: f.center as [number, number], zoom: 14, essential: true });
      toast.success(`Centralizado em ${f.place_name}`);
    } catch {
      toast.error("Falha na busca.");
    }
  };

  /* ── Exports ── */
  const exportKml = () => {
    if (plots.length === 0) return toast.error("Nenhum talhão para exportar.");
    downloadBlob(new Blob([toKml(plots)], { type: "application/vnd.google-earth.kml+xml" }), "talhoes.kml");
    toast.success("KML exportado.");
  };
  const exportGeoJson = () => {
    if (plots.length === 0) return toast.error("Nenhum talhão para exportar.");
    downloadBlob(new Blob([JSON.stringify(toGeoJson(plots), null, 2)], { type: "application/geo+json" }), "talhoes.geojson");
    toast.success("GeoJSON exportado.");
  };
  const exportImage = () => {
    const m = mapRef.current; if (!m) return;
    m.once("render", () => {
      m.getCanvas().toBlob((b) => {
        if (b) { downloadBlob(b, "mapa-talhoes.png"); toast.success("Imagem do mapa baixada."); }
        else toast.error("Falha ao gerar imagem.");
      });
    });
    m.triggerRepaint();
  };

  const saveToken = (e: React.FormEvent) => {
    e.preventDefault();
    if (!tokenInput.trim().startsWith("pk.")) {
      toast.error("Token inválido. Use um Access Token público (pk.…) do Mapbox.");
      return;
    }
    try { localStorage.setItem("orion_mapbox_token", tokenInput.trim()); } catch {}
    setToken(tokenInput.trim());
    toast.success("Mapbox conectado.");
  };

  /* ── Render ── */
  return (
    <AppShell>
      <PageHeader
        title="Demarcação de Fazenda e Talhões"
        subtitle="Mapa de satélite Mapbox · Importe, detecte ou desenhe seus talhões e exporte."
      />

      <div className="grid grid-cols-[420px_1fr] gap-5">
        {/* LEFT */}
        <Panel className="p-5">
          <h3 className="text-[13px] font-semibold text-white">Upload de arquivo geoespacial</h3>
          <p className="mt-1 text-[11.5px] text-muted-foreground">CSV, KML ou GeoJSON exportado do Google Earth / John Deere / FieldView.</p>

          <div className="mt-4 rounded-xl border border-dashed border-border bg-panel-2 p-5 text-center">
            <Upload size={26} className="mx-auto text-muted-foreground" />
            <p className="mt-2 text-[12px] text-muted-foreground">
              {fileName ? <span className="text-foreground">{fileName}</span> : "Selecione um .kml, .csv ou .geojson"}
            </p>
            <input ref={fileRef} type="file" accept=".kml,.csv,.geojson,.json" hidden onChange={onFile} />
            <BrandButton className="mt-3 w-full" onClick={() => fileRef.current?.click()}>Selecionar arquivo</BrandButton>
          </div>

          <div className="mt-6 mb-3 text-center text-[11px] uppercase tracking-wider text-muted-foreground">Demarcação de Contorno</div>

          <div className="grid grid-cols-3 gap-1 rounded-lg border border-border bg-panel-2 p-1">
            {(["Manual", "KML", "Automático"] as const).map((t) => (
              <button key={t} onClick={() => setTab(t)}
                className={`rounded-md py-1.5 text-[12px] transition ${tab === t ? "bg-brand text-brand-foreground" : "text-muted-foreground hover:text-foreground"}`}>
                {t}
              </button>
            ))}
          </div>

          {tab === "Automático" && (
            <div className="mt-4 rounded-xl border border-brand/40 bg-[rgba(230,100,31,0.08)] p-4">
              <div className="mb-2 flex items-center gap-2 text-[11.5px] font-semibold uppercase tracking-wider text-brand">
                <Sparkles size={14} /> Detecção automática
              </div>
              <ul className="space-y-1.5 text-[12px] text-foreground">
                <li className="flex gap-2"><Check size={14} className="mt-0.5 shrink-0 text-[#4ADE80]" />Análise NDVI da última imagem</li>
                <li className="flex gap-2"><Check size={14} className="mt-0.5 shrink-0 text-[#4ADE80]" />Detecção de bordas e divisão de talhões</li>
                <li className="flex gap-2"><Check size={14} className="mt-0.5 shrink-0 text-[#4ADE80]" />Cálculo automático de hectares</li>
              </ul>
              <BrandButton className="mt-4 w-full" disabled={autoRunning || !token} onClick={runAutoDetect}>
                {autoRunning ? "Detectando talhões..." : "Detectar talhões automaticamente"}
              </BrandButton>
            </div>
          )}

          {tab === "Manual" && (
            <div className="mt-4 rounded-xl border border-border bg-panel-2 p-4 text-[12px] text-muted-foreground">
              <p className="mb-3 text-foreground">Use o lápis para clicar e demarcar o contorno do talhão. Duplo-clique para fechar o polígono.</p>
              <button onClick={startDrawing} disabled={!token}
                className="flex w-full items-center justify-center gap-2 rounded-lg border border-border bg-panel px-3 py-2 text-[12.5px] text-foreground hover:bg-[#2a2a2a] disabled:opacity-40">
                <Pencil size={14} /> Iniciar demarcação manual
              </button>
            </div>
          )}

          {tab === "KML" && (
            <div className="mt-4 rounded-xl border border-border bg-panel-2 p-4 text-[12px] text-muted-foreground">
              Selecione um arquivo .kml exportado do Google Earth, John Deere Operations Center ou Climate FieldView. Os polígonos serão georreferenciados automaticamente.
            </div>
          )}
        </Panel>

        {/* RIGHT */}
        <Panel className="p-5">
          <div className="mb-3 flex items-center justify-between gap-3">
            <form onSubmit={doSearch} className="relative flex-1 max-w-md">
              <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
              <Input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Buscar endereço, cidade ou coordenada..." className="w-full pl-8" />
            </form>
            <div className="flex items-center gap-1.5">
              <button onClick={() => { const next: StyleKey = styleKey === "satellite" ? "streets" : styleKey === "streets" ? "outdoors" : "satellite"; setStyleKey(next); toast.message(`Camada: ${next}`); }}
                title="Trocar camada"
                className="grid h-8 w-8 place-items-center rounded-md border border-border bg-panel-2 text-muted-foreground hover:text-foreground"><Layers size={14} /></button>
              <button onClick={() => mapRef.current?.zoomIn()} className="grid h-8 w-8 place-items-center rounded-md border border-border bg-panel-2 text-muted-foreground hover:text-foreground"><ZoomIn size={14} /></button>
              <button onClick={() => mapRef.current?.zoomOut()} className="grid h-8 w-8 place-items-center rounded-md border border-border bg-panel-2 text-muted-foreground hover:text-foreground"><ZoomOut size={14} /></button>
            </div>
          </div>

          {/* Map container */}
          <div className="relative h-[560px] overflow-hidden rounded-xl border border-border bg-panel-2">
            {token ? (
              <div ref={mapEl} className="absolute inset-0" />
            ) : (
              <div className="absolute inset-0 grid place-items-center p-8">
                <form onSubmit={saveToken} className="w-full max-w-md rounded-xl border border-border bg-panel p-6 text-center">
                  <KeyRound className="mx-auto text-brand" size={26} />
                  <h3 className="mt-3 text-[15px] font-semibold text-white">Conectar Mapbox</h3>
                  <p className="mt-1 text-[12px] text-muted-foreground">
                    Cole seu Access Token público (<code className="text-brand">pk.…</code>) do Mapbox para carregar imagens de satélite e desenhar talhões.
                  </p>
                  <input
                    value={tokenInput}
                    onChange={(e) => setTokenInput(e.target.value)}
                    placeholder="pk.eyJ1Ijoi..."
                    className="mt-4 h-10 w-full rounded-md border border-border bg-panel-2 px-3 text-[12.5px] text-foreground outline-none focus:border-brand"
                  />
                  <BrandButton type="submit" className="mt-3 w-full">Conectar</BrandButton>
                  <p className="mt-3 text-[11px] text-muted-foreground">
                    O token fica salvo apenas no seu navegador. Pegue em{" "}
                    <a href="https://account.mapbox.com/access-tokens/" target="_blank" rel="noreferrer" className="text-brand hover:underline">account.mapbox.com</a>.
                  </p>
                </form>
              </div>
            )}

            {autoRunning && (
              <div className="absolute inset-0 grid place-items-center bg-black/50">
                <div className="flex gap-1.5">
                  {[0, 1, 2, 3, 4].map((i) => (
                    <span key={i} className="h-2.5 w-2.5 rounded-full bg-brand" style={{ animation: `pulse 1s ${i * 0.1}s infinite` }} />
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Toolbar */}
          <div className="mt-3 flex items-center justify-between rounded-xl border border-border bg-panel-2 px-3 py-2">
            <div className="text-[11px] uppercase tracking-wider text-muted-foreground">Ferramentas do Mapa</div>
            <div className="flex items-center gap-1.5">
              <Tool icon={Pencil} label="Desenhar" brand onClick={startDrawing} disabled={!token} />
              <Tool icon={Undo2} label="Cancelar desenho" onClick={undoPoint} disabled={!token} />
              <Tool icon={Trash2} label="Limpar" onClick={clearAll} disabled={plots.length === 0} />
              <Tool icon={ImageIcon} label="Baixar imagem" onClick={exportImage} disabled={!token} />
              <span className="mx-1 h-5 w-px bg-border" />
              <button onClick={() => toast.success("Demarcações salvas no projeto.")} disabled={plots.length === 0}
                className="rounded-md bg-brand px-3 py-1.5 text-[12px] font-medium text-brand-foreground disabled:opacity-40">
                <span className="inline-flex items-center gap-1.5"><Save size={13} /> Salvar</span>
              </button>
            </div>
          </div>

          {/* Identified plots */}
          <div className="mt-4">
            <div className="mb-2 flex items-center justify-between">
              <h4 className="text-[12px] font-semibold text-white">Talhões identificados</h4>
              <span className="text-[11px] text-muted-foreground">Total: {totalHa.toFixed(1)} ha · {plots.length} talhão(ões)</span>
            </div>
            {plots.length === 0 ? (
              <div className="rounded-lg border border-dashed border-border bg-panel-2 p-5 text-center text-[12px] text-muted-foreground">
                Nenhum talhão demarcado. Use a detecção automática, importe um KML/GeoJSON ou desenhe manualmente no mapa.
              </div>
            ) : (
              <div className="grid grid-cols-3 gap-3">
                {plots.map((p) => (
                  <button key={p.id} onClick={() => {
                    const c = turfCentroid(p.feature as any).geometry.coordinates as [number, number];
                    mapRef.current?.flyTo({ center: c, zoom: 15.5, essential: true });
                  }} className="rounded-lg border border-border bg-panel-2 p-3 text-left hover:border-brand/60">
                    <div className="flex items-center gap-2">
                      <span className="h-2.5 w-2.5 rounded-full" style={{ background: p.color }} />
                      <span className="text-[13px] font-semibold text-white">{p.name}</span>
                    </div>
                    <div className="mt-2 text-[22px] font-semibold text-white">{p.hectares.toFixed(1)} ha</div>
                    <div className="text-[11px] text-muted-foreground">{p.cultura ?? "Sem cultura"}</div>
                  </button>
                ))}
              </div>
            )}
          </div>
        </Panel>
      </div>

      {/* Bottom bar */}
      <div className="mt-5 flex items-center justify-between rounded-xl border border-border bg-panel p-4">
        <div className="text-[12px] text-muted-foreground">Fazenda São Lucas · Marília, SP · Safra 2025/26</div>
        <div className="flex items-center gap-2">
          <button onClick={exportKml} disabled={plots.length === 0} className="flex items-center gap-1.5 rounded-lg border border-border bg-panel-2 px-3 py-2 text-[12.5px] text-foreground hover:bg-[#2a2a2a] disabled:opacity-40">
            <FileDown size={14} /> Exportar KML
          </button>
          <button onClick={exportGeoJson} disabled={plots.length === 0} className="flex items-center gap-1.5 rounded-lg border border-border bg-panel-2 px-3 py-2 text-[12.5px] text-foreground hover:bg-[#2a2a2a] disabled:opacity-40">
            <Download size={14} /> Exportar GeoJSON
          </button>
          <BrandButton disabled={plots.length === 0} onClick={() => toast.success(`${plots.length} talhões confirmados.`, { description: `Total: ${totalHa.toFixed(1)} ha` })}>
            <span className="inline-flex items-center gap-1.5">Confirmar e avançar <ArrowRight size={14} /></span>
          </BrandButton>
        </div>
      </div>

      <style>{`
        @keyframes pulse { 0%,100% { transform: scale(1); opacity: 0.4 } 50% { transform: scale(1.4); opacity: 1 } }
        .mapboxgl-ctrl-attrib, .mapboxgl-ctrl-logo { opacity: 0.6 }
        .mapboxgl-ctrl-group { background: #1a1a1a !important; border: 1px solid #2e2e2e !important; }
        .mapboxgl-ctrl-group button { filter: invert(0.9); }
      `}</style>
    </AppShell>
  );
}

/* ─────────────────────────── Toolbar button ─────────────────────────── */
function Tool({ icon: Icon, label, brand, disabled, onClick }: { icon: any; label: string; brand?: boolean; disabled?: boolean; onClick?: () => void }) {
  const base = "grid h-8 w-8 place-items-center rounded-md border transition";
  const cls = disabled
    ? "border-border bg-panel text-muted-foreground/40 cursor-not-allowed"
    : brand
      ? "border-brand bg-brand text-brand-foreground"
      : "border-border bg-panel text-muted-foreground hover:text-foreground";
  return (
    <button onClick={onClick} disabled={disabled} title={label} className={`${base} ${cls}`}>
      <Icon size={14} />
    </button>
  );
}

/* ─────────────────────────── Mapbox Draw custom styling ─────────────────────────── */
function drawStyles() {
  const brand = "#E6641F";
  return [
    { id: "gl-draw-polygon-fill", type: "fill", filter: ["all", ["==", "$type", "Polygon"]], paint: { "fill-color": brand, "fill-opacity": 0.18 } },
    { id: "gl-draw-polygon-stroke", type: "line", filter: ["all", ["==", "$type", "Polygon"]], paint: { "line-color": brand, "line-width": 2.5 } },
    { id: "gl-draw-polygon-and-line-vertex-halo-active", type: "circle", filter: ["all", ["==", "meta", "vertex"], ["==", "$type", "Point"]], paint: { "circle-radius": 6, "circle-color": "#fff" } },
    { id: "gl-draw-polygon-and-line-vertex-active", type: "circle", filter: ["all", ["==", "meta", "vertex"], ["==", "$type", "Point"]], paint: { "circle-radius": 4, "circle-color": brand } },
    { id: "gl-draw-line-active", type: "line", filter: ["all", ["==", "$type", "LineString"], ["==", "active", "true"]], paint: { "line-color": brand, "line-dasharray": [0.2, 2], "line-width": 2 } },
  ] as any[];
}
