import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useMemo, useRef, useState } from "react";
import {
  Upload, Search, Hand, Pencil, Trash2, Undo2, Download, Save, Sparkles,
  Layers, ZoomIn, ZoomOut, Image as ImageIcon, ArrowRight, Check, FileDown,
} from "lucide-react";
import { AppShell, Panel, PageHeader, BrandButton, Input } from "@/components/AppShell";
import satellite from "@/assets/satellite.jpg";

export const Route = createFileRoute("/talhoes")({
  head: () => ({ meta: [{ title: "Talhões — Orion AgTech" }] }),
  component: TalhoesPage,
});

type Pt = { x: number; y: number };
type Polygon = { id: string; name: string; color: string; points: Pt[]; cultura?: string };

const COLORS = ["#E6641F", "#4ADE80", "#60A5FA", "#FBBF24", "#A78BFA", "#F472B6"];
const VW = 1000;
const VH = 560;

/** Area in viewbox units → estimated hectares (calibrated so a ~22% area ≈ 140ha). */
function polygonAreaHa(points: Pt[]) {
  if (points.length < 3) return 0;
  let a = 0;
  for (let i = 0; i < points.length; i++) {
    const p1 = points[i];
    const p2 = points[(i + 1) % points.length];
    a += p1.x * p2.y - p2.x * p1.y;
  }
  const px = Math.abs(a / 2);
  const totalPx = VW * VH;
  const totalHectares = 600;
  return (px / totalPx) * totalHectares;
}

const sample: Polygon[] = [
  { id: "A", name: "Talhão A", color: "#4ADE80", cultura: "Soja RR",
    points: [{x:80,y:90},{x:330,y:60},{x:380,y:240},{x:260,y:340},{x:90,y:300}] },
  { id: "B", name: "Talhão B", color: "#FBBF24", cultura: "Milho Híbrido",
    points: [{x:430,y:80},{x:660,y:110},{x:710,y:300},{x:520,y:340},{x:420,y:240}] },
  { id: "C", name: "Talhão C", color: "#60A5FA", cultura: "Soja Convencional",
    points: [{x:740,y:140},{x:930,y:170},{x:920,y:420},{x:770,y:470},{x:700,y:340}] },
];

function TalhoesPage() {
  const [polygons, setPolygons] = useState<Polygon[]>([]);
  const [mode, setMode] = useState<"view" | "draw">("view");
  const [drawing, setDrawing] = useState<Pt[]>([]);
  const [hover, setHover] = useState<Pt | null>(null);
  const [tab, setTab] = useState<"Manual" | "KML" | "Automático">("Automático");
  const [autoRunning, setAutoRunning] = useState(false);
  const [fileName, setFileName] = useState<string | null>(null);
  const [toast, setToast] = useState<string | null>(null);
  const [bgImage, setBgImage] = useState<string>(satellite);
  const fileRef = useRef<HTMLInputElement>(null);
  const imageRef = useRef<HTMLInputElement>(null);
  const svgRef = useRef<SVGSVGElement>(null);

  useEffect(() => {
    if (!toast) return;
    const t = setTimeout(() => setToast(null), 2500);
    return () => clearTimeout(t);
  }, [toast]);

  const totalHa = useMemo(
    () => polygons.reduce((s, p) => s + polygonAreaHa(p.points), 0),
    [polygons]
  );

  const toSvgPoint = (e: React.MouseEvent): Pt => {
    const svg = svgRef.current!;
    const pt = svg.createSVGPoint();
    pt.x = e.clientX;
    pt.y = e.clientY;
    const ctm = svg.getScreenCTM()!.inverse();
    const r = pt.matrixTransform(ctm);
    return { x: r.x, y: r.y };
  };

  const handleSvgClick = (e: React.MouseEvent) => {
    if (mode !== "draw") return;
    setDrawing((d) => [...d, toSvgPoint(e)]);
  };

  const handleSvgMove = (e: React.MouseEvent) => {
    if (mode !== "draw") return;
    setHover(toSvgPoint(e));
  };

  const finishDrawing = () => {
    if (drawing.length < 3) {
      setToast("Adicione ao menos 3 pontos.");
      return;
    }
    const idx = polygons.length;
    const letter = String.fromCharCode(65 + idx);
    setPolygons((p) => [
      ...p,
      { id: crypto.randomUUID(), name: `Talhão ${letter}`, color: COLORS[idx % COLORS.length], points: drawing },
    ]);
    setDrawing([]);
    setHover(null);
    setMode("view");
    setToast(`Talhão ${letter} demarcado manualmente.`);
  };

  const undoPoint = () => setDrawing((d) => d.slice(0, -1));
  const cancelDrawing = () => { setDrawing([]); setHover(null); setMode("view"); };

  const clearAll = () => {
    if (polygons.length === 0 && drawing.length === 0) return;
    setPolygons([]); setDrawing([]); setHover(null);
    setToast("Demarcações apagadas.");
  };

  const runAutoDetect = () => {
    setAutoRunning(true);
    setTimeout(() => {
      setPolygons(sample);
      setAutoRunning(false);
      setToast("3 talhões detectados automaticamente.");
    }, 1400);
  };

  const onFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (!f) return;
    setFileName(f.name);
    const text = await f.text();
    const ext = f.name.split(".").pop()?.toLowerCase();
    try {
      if (ext === "kml") {
        const polys = parseKml(text);
        if (polys.length === 0) throw new Error("Nenhum polígono encontrado no KML.");
        setPolygons(polys);
        setToast(`KML importado: ${polys.length} talhão(ões).`);
      } else if (ext === "csv") {
        const polys = parseCsv(text);
        if (polys.length === 0) throw new Error("CSV sem coordenadas válidas.");
        setPolygons(polys);
        setToast(`CSV importado: ${polys.length} talhão(ões).`);
      } else {
        setToast("Formato não suportado. Use .kml ou .csv.");
      }
    } catch (err: any) {
      setToast(err.message ?? "Falha ao importar arquivo.");
    }
    e.target.value = "";
  };

  const downloadBlob = (blob: Blob, name: string) => {
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url; a.download = name; a.click();
    URL.revokeObjectURL(url);
  };

  const exportKml = () => {
    const kml = polygonsToKml(polygons);
    downloadBlob(new Blob([kml], { type: "application/vnd.google-earth.kml+xml" }), "talhoes.kml");
    setToast("KML exportado.");
  };

  const exportGeoJson = () => {
    const gj = polygonsToGeoJson(polygons);
    downloadBlob(new Blob([JSON.stringify(gj, null, 2)], { type: "application/geo+json" }), "talhoes.geojson");
    setToast("GeoJSON exportado.");
  };

  const exportImage = async () => {
    const canvas = document.createElement("canvas");
    canvas.width = VW; canvas.height = VH;
    const ctx = canvas.getContext("2d")!;
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.src = satellite;
    await new Promise<void>((res, rej) => { img.onload = () => res(); img.onerror = () => rej(); });
    ctx.drawImage(img, 0, 0, VW, VH);
    for (const p of polygons) {
      ctx.beginPath();
      p.points.forEach((pt, i) => (i === 0 ? ctx.moveTo(pt.x, pt.y) : ctx.lineTo(pt.x, pt.y)));
      ctx.closePath();
      ctx.fillStyle = p.color + "55";
      ctx.strokeStyle = p.color;
      ctx.lineWidth = 3;
      ctx.fill();
      ctx.stroke();
      // label
      const c = centroid(p.points);
      ctx.fillStyle = "rgba(0,0,0,0.6)";
      const label = `${p.name} · ${polygonAreaHa(p.points).toFixed(0)} ha`;
      ctx.font = "600 18px Inter, sans-serif";
      const w = ctx.measureText(label).width + 16;
      ctx.fillRect(c.x - w / 2, c.y - 14, w, 28);
      ctx.fillStyle = "#fff";
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.fillText(label, c.x, c.y);
    }
    canvas.toBlob((b) => { if (b) downloadBlob(b, "talhoes.png"); setToast("Imagem baixada."); }, "image/png");
  };

  return (
    <AppShell>
      <PageHeader
        title="Demarcação de Fazenda e Talhões"
        subtitle="Importe um arquivo ou trace manualmente o contorno da fazenda para o sistema cadastrar automaticamente."
      />

      <div className="grid grid-cols-[420px_1fr] gap-5">
        {/* LEFT — upload + mode */}
        <Panel className="p-5">
          <h3 className="text-[13px] font-semibold text-white">Upload de arquivo CSV ou KML</h3>
          <p className="mt-1 text-[11.5px] text-muted-foreground">Arquivos exportados pela sua máquina ou software.</p>

          <div className="mt-4 rounded-xl border border-dashed border-border bg-panel-2 p-5 text-center">
            <Upload size={28} className="mx-auto text-muted-foreground" />
            <p className="mt-2 text-[12px] text-muted-foreground">
              {fileName ? <span className="text-foreground">{fileName}</span> : "Arraste o arquivo ou selecione manualmente"}
            </p>
            <input ref={fileRef} type="file" accept=".kml,.csv" hidden onChange={onFile} />
            <BrandButton className="mt-3 w-full" onClick={() => fileRef.current?.click()}>Selecionar arquivo</BrandButton>
          </div>

          <div className="mt-6 mb-3 text-center text-[11px] uppercase tracking-wider text-muted-foreground">Demarcação de Contorno</div>

          <div className="grid grid-cols-3 gap-1 rounded-lg border border-border bg-panel-2 p-1">
            {(["Manual","KML","Automático"] as const).map((t) => (
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
                <li className="flex gap-2"><Check size={14} className="mt-0.5 shrink-0 text-[#4ADE80]"/>Análise NDVI da última imagem</li>
                <li className="flex gap-2"><Check size={14} className="mt-0.5 shrink-0 text-[#4ADE80]"/>Detecção de bordas e divisão de talhões</li>
                <li className="flex gap-2"><Check size={14} className="mt-0.5 shrink-0 text-[#4ADE80]"/>Cálculo automático de hectares</li>
              </ul>
              <BrandButton className="mt-4 w-full" disabled={autoRunning} onClick={runAutoDetect}>
                {autoRunning ? "Detectando talhões..." : "Detectar talhões automaticamente"}
              </BrandButton>
            </div>
          )}

          {tab === "Manual" && (
            <div className="mt-4 rounded-xl border border-border bg-panel-2 p-4 text-[12px] text-muted-foreground">
              <p className="mb-3 text-foreground">Use o lápis na barra do mapa para clicar e demarcar o contorno do talhão. Clique em <span className="text-brand">Concluir</span> para fechar o polígono.</p>
              <button onClick={() => setMode("draw")}
                className="flex w-full items-center justify-center gap-2 rounded-lg border border-border bg-panel px-3 py-2 text-[12.5px] text-foreground hover:bg-[#2a2a2a]">
                <Pencil size={14}/> Iniciar demarcação manual
              </button>
            </div>
          )}

          {tab === "KML" && (
            <div className="mt-4 rounded-xl border border-border bg-panel-2 p-4 text-[12px] text-muted-foreground">
              Selecione um arquivo .kml exportado do Google Earth, John Deere Operations Center ou Climate FieldView. Os polígonos serão importados automaticamente.
            </div>
          )}
        </Panel>

        {/* RIGHT — map / drawing */}
        <Panel className="p-5">
          <div className="mb-3 flex items-center justify-between gap-3">
            <div className="relative flex-1 max-w-md">
              <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
              <Input placeholder="Buscar talhão ou coordenada..." className="w-full pl-8" />
            </div>
            <div className="flex items-center gap-1.5">
              <button className="grid h-8 w-8 place-items-center rounded-md border border-border bg-panel-2 text-muted-foreground hover:text-foreground"><Layers size={14}/></button>
              <button className="grid h-8 w-8 place-items-center rounded-md border border-border bg-panel-2 text-muted-foreground hover:text-foreground"><ZoomIn size={14}/></button>
              <button className="grid h-8 w-8 place-items-center rounded-md border border-border bg-panel-2 text-muted-foreground hover:text-foreground"><ZoomOut size={14}/></button>
            </div>
          </div>

          {/* Map */}
          <div className="relative overflow-hidden rounded-xl border border-border bg-panel-2">
            <svg
              ref={svgRef}
              viewBox={`0 0 ${VW} ${VH}`}
              className={`block w-full ${mode === "draw" ? "cursor-crosshair" : "cursor-default"}`}
              onClick={handleSvgClick}
              onMouseMove={handleSvgMove}
              onMouseLeave={() => setHover(null)}
            >
              <image href={satellite} x={0} y={0} width={VW} height={VH} preserveAspectRatio="xMidYMid slice" />
              <rect x={0} y={0} width={VW} height={VH} fill="rgba(0,0,0,0.25)" />

              {polygons.map((p) => {
                const c = centroid(p.points);
                const area = polygonAreaHa(p.points);
                return (
                  <g key={p.id}>
                    <polygon
                      points={p.points.map((pt) => `${pt.x},${pt.y}`).join(" ")}
                      fill={p.color + "44"}
                      stroke={p.color}
                      strokeWidth={2.5}
                    />
                    <g transform={`translate(${c.x}, ${c.y})`}>
                      <rect x={-70} y={-16} width={140} height={32} rx={6} fill="rgba(0,0,0,0.7)" />
                      <text textAnchor="middle" y={-2} fill="#fff" fontSize={12} fontWeight={600} fontFamily="Inter">{p.name}</text>
                      <text textAnchor="middle" y={12} fill={p.color} fontSize={11} fontFamily="Inter">{area.toFixed(0)} ha · {p.cultura ?? "Sem cultura"}</text>
                    </g>
                  </g>
                );
              })}

              {/* In-progress polygon */}
              {drawing.length > 0 && (
                <g>
                  <polyline
                    points={[...drawing, hover ?? drawing[drawing.length - 1]].map((pt) => `${pt.x},${pt.y}`).join(" ")}
                    fill="rgba(230,100,31,0.18)"
                    stroke="#E6641F"
                    strokeWidth={2}
                    strokeDasharray="6 4"
                  />
                  {drawing.map((pt, i) => (
                    <circle key={i} cx={pt.x} cy={pt.y} r={5} fill="#E6641F" stroke="#fff" strokeWidth={1.5} />
                  ))}
                </g>
              )}
            </svg>

            {/* Map overlay status */}
            {mode === "draw" && (
              <div className="absolute left-3 top-3 rounded-md border border-brand/50 bg-black/60 px-2.5 py-1 text-[11px] text-brand">
                Modo demarcação · {drawing.length} ponto(s)
              </div>
            )}
            {autoRunning && (
              <div className="absolute inset-0 grid place-items-center bg-black/50">
                <div className="flex gap-1.5">
                  {[0,1,2,3,4].map((i) => (
                    <span key={i} className="h-2.5 w-2.5 rounded-full bg-brand" style={{ opacity: 0.3 + ((i % 3) * 0.25), animation: `pulse 1s ${i*0.1}s infinite` }} />
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Map toolbar */}
          <div className="mt-3 flex items-center justify-between rounded-xl border border-border bg-panel-2 px-3 py-2">
            <div className="text-[11px] uppercase tracking-wider text-muted-foreground">Demarcação de Contorno</div>
            <div className="flex items-center gap-1.5">
              <Tool icon={Hand}    label="Mover"    active={mode==="view"}   onClick={() => { cancelDrawing(); setMode("view"); }} />
              <Tool icon={Pencil}  label="Desenhar" active={mode==="draw"}   onClick={() => setMode("draw")} brand />
              <Tool icon={Undo2}   label="Desfazer" onClick={undoPoint}   disabled={mode!=="draw" || drawing.length===0} />
              <Tool icon={Trash2}  label="Limpar"   onClick={clearAll} />
              <Tool icon={ImageIcon} label="Baixar imagem" onClick={exportImage} disabled={polygons.length===0} />
              <span className="mx-1 h-5 w-px bg-border"/>
              {mode === "draw" ? (
                <button onClick={finishDrawing} className="rounded-md bg-brand px-3 py-1.5 text-[12px] font-medium text-brand-foreground">
                  <span className="inline-flex items-center gap-1.5"><Save size={13}/> Concluir</span>
                </button>
              ) : (
                <button onClick={() => setToast("Demarcações salvas no projeto.")} disabled={polygons.length===0}
                  className="rounded-md bg-brand px-3 py-1.5 text-[12px] font-medium text-brand-foreground disabled:opacity-40">
                  <span className="inline-flex items-center gap-1.5"><Save size={13}/> Salvar</span>
                </button>
              )}
            </div>
          </div>

          {/* Identified plots */}
          <div className="mt-4">
            <div className="mb-2 flex items-center justify-between">
              <h4 className="text-[12px] font-semibold text-white">Talhões identificados</h4>
              <span className="text-[11px] text-muted-foreground">Total: {totalHa.toFixed(0)} ha · {polygons.length} talhão(ões)</span>
            </div>
            {polygons.length === 0 ? (
              <div className="rounded-lg border border-dashed border-border bg-panel-2 p-5 text-center text-[12px] text-muted-foreground">
                Nenhum talhão demarcado ainda. Use a detecção automática, importe um KML ou desenhe manualmente no mapa.
              </div>
            ) : (
              <div className="grid grid-cols-3 gap-3">
                {polygons.map((p) => (
                  <div key={p.id} className="rounded-lg border border-border bg-panel-2 p-3">
                    <div className="flex items-center gap-2">
                      <span className="h-2.5 w-2.5 rounded-full" style={{ background: p.color }} />
                      <span className="text-[13px] font-semibold text-white">{p.name}</span>
                    </div>
                    <div className="mt-2 text-[22px] font-semibold text-white">{polygonAreaHa(p.points).toFixed(0)} ha</div>
                    <div className="text-[11px] text-muted-foreground">{p.cultura ?? "Sem cultura"}</div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </Panel>
      </div>

      {/* Bottom bar */}
      <div className="mt-5 flex items-center justify-between rounded-xl border border-border bg-panel p-4">
        <div className="text-[12px] text-muted-foreground">
          Fazenda São Lucas · Marília, SP · Safra 2025/26
        </div>
        <div className="flex items-center gap-2">
          <button onClick={exportKml} disabled={polygons.length===0}
            className="flex items-center gap-1.5 rounded-lg border border-border bg-panel-2 px-3 py-2 text-[12.5px] text-foreground hover:bg-[#2a2a2a] disabled:opacity-40">
            <FileDown size={14}/> Exportar KML
          </button>
          <button onClick={exportGeoJson} disabled={polygons.length===0}
            className="flex items-center gap-1.5 rounded-lg border border-border bg-panel-2 px-3 py-2 text-[12.5px] text-foreground hover:bg-[#2a2a2a] disabled:opacity-40">
            <Download size={14}/> Exportar GeoJSON
          </button>
          <BrandButton disabled={polygons.length===0}>
            <span className="inline-flex items-center gap-1.5">Confirmar e avançar <ArrowRight size={14}/></span>
          </BrandButton>
        </div>
      </div>

      {toast && (
        <div className="fixed bottom-16 left-1/2 z-50 -translate-x-1/2 rounded-lg border border-brand/40 bg-panel px-4 py-2 text-[12.5px] text-foreground shadow-lg">
          {toast}
        </div>
      )}

      <style>{`@keyframes pulse { 0%,100% { transform: scale(1); opacity: 0.4 } 50% { transform: scale(1.4); opacity: 1 } }`}</style>
    </AppShell>
  );
}

function Tool({ icon: Icon, label, active, brand, disabled, onClick }: { icon: any; label: string; active?: boolean; brand?: boolean; disabled?: boolean; onClick?: () => void }) {
  const base = "grid h-8 w-8 place-items-center rounded-md border transition";
  const cls = disabled
    ? "border-border bg-panel text-muted-foreground/40 cursor-not-allowed"
    : active && brand
    ? "border-brand bg-brand text-brand-foreground"
    : active
    ? "border-brand/50 bg-[rgba(230,100,31,0.15)] text-brand"
    : "border-border bg-panel text-muted-foreground hover:text-foreground";
  return (
    <button onClick={onClick} disabled={disabled} title={label} className={`${base} ${cls}`}>
      <Icon size={14} />
    </button>
  );
}

function centroid(pts: Pt[]): Pt {
  const x = pts.reduce((s, p) => s + p.x, 0) / pts.length;
  const y = pts.reduce((s, p) => s + p.y, 0) / pts.length;
  return { x, y };
}

/** Very small KML polygon parser: extracts <coordinates> within <Polygon>. Maps lat/lng to viewbox. */
function parseKml(text: string): Polygon[] {
  const doc = new DOMParser().parseFromString(text, "text/xml");
  const polys = Array.from(doc.getElementsByTagName("Polygon"));
  if (polys.length === 0) return [];
  const all: { name: string; coords: { lon: number; lat: number }[] }[] = [];
  polys.forEach((poly, i) => {
    const placemark = poly.closest("Placemark");
    const name = placemark?.getElementsByTagName("name")[0]?.textContent?.trim() || `Talhão ${String.fromCharCode(65 + i)}`;
    const coordsNode = poly.getElementsByTagName("coordinates")[0];
    if (!coordsNode) return;
    const coords = coordsNode.textContent!.trim().split(/\s+/).map((s) => {
      const [lon, lat] = s.split(",").map(Number);
      return { lon, lat };
    }).filter((c) => Number.isFinite(c.lon) && Number.isFinite(c.lat));
    if (coords.length >= 3) all.push({ name, coords });
  });
  if (all.length === 0) return [];
  const lons = all.flatMap((p) => p.coords.map((c) => c.lon));
  const lats = all.flatMap((p) => p.coords.map((c) => c.lat));
  const minLon = Math.min(...lons), maxLon = Math.max(...lons);
  const minLat = Math.min(...lats), maxLat = Math.max(...lats);
  const pad = 40;
  const project = (lon: number, lat: number): Pt => ({
    x: pad + ((lon - minLon) / (maxLon - minLon || 1)) * (VW - pad * 2),
    y: pad + (1 - (lat - minLat) / (maxLat - minLat || 1)) * (VH - pad * 2),
  });
  return all.map((p, i) => ({
    id: crypto.randomUUID(),
    name: p.name,
    color: COLORS[i % COLORS.length],
    points: p.coords.map((c) => project(c.lon, c.lat)),
  }));
}

/** CSV format: name,lon,lat (one point per line; new polygon when name changes). */
function parseCsv(text: string): Polygon[] {
  const lines = text.split(/\r?\n/).map((l) => l.trim()).filter(Boolean);
  if (lines.length < 3) return [];
  const grouped = new Map<string, { lon: number; lat: number }[]>();
  const startIdx = /[a-z]/i.test(lines[0]) ? 1 : 0;
  for (let i = startIdx; i < lines.length; i++) {
    const parts = lines[i].split(/[,;]/).map((p) => p.trim());
    if (parts.length < 3) continue;
    const name = parts[0];
    const lon = Number(parts[1]);
    const lat = Number(parts[2]);
    if (!Number.isFinite(lon) || !Number.isFinite(lat)) continue;
    if (!grouped.has(name)) grouped.set(name, []);
    grouped.get(name)!.push({ lon, lat });
  }
  const all = Array.from(grouped.entries()).map(([name, coords]) => ({ name, coords }));
  if (all.length === 0) return [];
  const lons = all.flatMap((p) => p.coords.map((c) => c.lon));
  const lats = all.flatMap((p) => p.coords.map((c) => c.lat));
  const minLon = Math.min(...lons), maxLon = Math.max(...lons);
  const minLat = Math.min(...lats), maxLat = Math.max(...lats);
  const pad = 40;
  return all.map((p, i) => ({
    id: crypto.randomUUID(),
    name: p.name,
    color: COLORS[i % COLORS.length],
    points: p.coords.map((c) => ({
      x: pad + ((c.lon - minLon) / (maxLon - minLon || 1)) * (VW - pad * 2),
      y: pad + (1 - (c.lat - minLat) / (maxLat - minLat || 1)) * (VH - pad * 2),
    })),
  }));
}

function polygonsToKml(polys: Polygon[]) {
  // Project viewbox back to a placeholder coord around -22, -49 (interior SP).
  const baseLon = -49.95, baseLat = -22.21, span = 0.05;
  const back = (p: Pt) => [baseLon + (p.x / VW) * span, baseLat + (1 - p.y / VH) * span];
  const placemarks = polys.map((p) => `
    <Placemark>
      <name>${p.name}</name>
      <Polygon><outerBoundaryIs><LinearRing><coordinates>
        ${p.points.map(back).map(([lon, lat]) => `${lon},${lat},0`).join(" ")}
        ${(() => { const [lon, lat] = back(p.points[0]); return `${lon},${lat},0`; })()}
      </coordinates></LinearRing></outerBoundaryIs></Polygon>
    </Placemark>`).join("\n");
  return `<?xml version="1.0" encoding="UTF-8"?>
<kml xmlns="http://www.opengis.net/kml/2.2"><Document><name>Orion AgTech — Talhões</name>${placemarks}</Document></kml>`;
}

function polygonsToGeoJson(polys: Polygon[]) {
  const baseLon = -49.95, baseLat = -22.21, span = 0.05;
  const back = (p: Pt) => [baseLon + (p.x / VW) * span, baseLat + (1 - p.y / VH) * span];
  return {
    type: "FeatureCollection",
    features: polys.map((p) => ({
      type: "Feature",
      properties: { name: p.name, color: p.color, cultura: p.cultura ?? null, hectares: +polygonAreaHa(p.points).toFixed(1) },
      geometry: {
        type: "Polygon",
        coordinates: [[...p.points.map(back), back(p.points[0])]],
      },
    })),
  };
}
