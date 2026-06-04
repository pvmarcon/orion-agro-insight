import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Search, Download, Plus, FileText } from "lucide-react";
import { toast } from "sonner";
import { AppShell, Kpi, Panel, StatusBadge, PageHeader, Tabs, Input, BrandButton } from "@/components/AppShell";

const tabFilter: Record<string, (n: { t: string; s: string }) => boolean> = {
  Todas: () => true,
  Entradas: (n) => n.t === "Entrada",
  Saídas: (n) => n.t === "Saída",
  Pendentes: (n) => n.s === "Pendente",
  Rejeitadas: (n) => n.s === "Rejeitada",
};

const downloadText = (name: string, body: string, mime: string) => {
  const blob = new Blob([body], { type: mime });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url; a.download = name; a.click();
  URL.revokeObjectURL(url);
};

export const Route = createFileRoute("/notas")({
  head: () => ({ meta: [{ title: "Notas Fiscais — Orion AgTech" }] }),
  component: NotasPage,
});

const notas = [
  { n: "NF-e 0042118", e: "AgroSul Sementes",   t: "Entrada", c: "Semente",      v: "R$ 84.500",  d: "27/05/26", s: "Validada",    st: "green" },
  { n: "NF-e 0042119", e: "FertiNorte S.A.",    t: "Entrada", c: "Fertilizante", v: "R$ 142.300", d: "26/05/26", s: "Validada",    st: "green" },
  { n: "NF-e 0042120", e: "DefensoAgro Ltda",   t: "Entrada", c: "Defensivo",    v: "R$ 38.900",  d: "25/05/26", s: "Pendente",    st: "yellow" },
  { n: "NF-e 0042121", e: "Petrobras Dist.",    t: "Entrada", c: "Combustível",  v: "R$ 24.150",  d: "25/05/26", s: "Validada",    st: "green" },
  { n: "NF-e 0042122", e: "Cargill Agrícola",   t: "Saída",   c: "Soja",         v: "R$ 184.500", d: "23/05/26", s: "Emitida",     st: "blue" },
  { n: "NF-e 0042123", e: "Bunge Alimentos",    t: "Saída",   c: "Milho",        v: "R$ 92.100",  d: "22/05/26", s: "Emitida",     st: "blue" },
  { n: "NF-e 0042124", e: "BASF Brasil",        t: "Entrada", c: "Defensivo",    v: "R$ 18.400",  d: "21/05/26", s: "Rejeitada",   st: "red" },
  { n: "NF-e 0042125", e: "Mosaic Fertilizantes", t: "Entrada", c: "Fertilizante", v: "R$ 76.200", d: "20/05/26", s: "Validada",   st: "green" },
] as const;

function NotasPage() {
  const [tab, setTab] = useState("Todas");
  const [query, setQuery] = useState("");
  const filtered = notas.filter((n) => (tabFilter[tab]?.(n) ?? true) && (!query || n.n.toLowerCase().includes(query.toLowerCase()) || n.e.toLowerCase().includes(query.toLowerCase())));
  const exportXml = () => {
    const xml = `<?xml version="1.0" encoding="UTF-8"?>\n<NFeList>\n${notas.map((n) => `  <NFe numero="${n.n}" emissor="${n.e}" tipo="${n.t}" valor="${n.v}" data="${n.d}" status="${n.s}"/>`).join("\n")}\n</NFeList>`;
    downloadText("notas-fiscais.xml", xml, "application/xml");
    toast.success("XML exportado.");
  };
  const emit = () => toast.success("Nova NF-e enviada ao SEFAZ.", { description: "Aguardando autorização (Webservice online)." });
  return (
    <AppShell>
      <PageHeader
        title="Notas Fiscais"
        subtitle="Centro de gestão fiscal — Entradas, saídas e SPED"
        actions={
          <>
            <button onClick={exportXml} className="flex items-center gap-1.5 rounded-lg border border-border bg-panel-2 px-3 py-2 text-[12.5px] text-foreground hover:bg-[#2a2a2a]"><Download size={14}/> Exportar XML</button>
            <BrandButton onClick={emit}><span className="inline-flex items-center gap-1.5"><Plus size={14}/> Emitir NF-e</span></BrandButton>
          </>
        }
      />


      <div className="grid grid-cols-4 gap-4">
        <Kpi label="NF-e este mês" value="42" change="↑ +8 vs anterior" tone="green" />
        <Kpi label="Valor total"   value="R$ 1,12M" change="entradas + saídas" tone="muted" />
        <Kpi label="Pendentes"     value="3" change="aguardando validação" tone="yellow" />
        <Kpi label="Rejeitadas"    value="1" change="⚠ requer correção" tone="red" />
      </div>

      <div className="mt-5 grid grid-cols-[1fr_300px] gap-5">
        <Panel className="p-5">
          <div className="mb-3 flex items-center justify-between">
            <h2 className="text-[14px] font-semibold text-white">Documentos fiscais</h2>
            <div className="relative">
              <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
              <Input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Buscar por número ou emissor..." className="w-72 pl-8" />
            </div>
          </div>

          <Tabs items={["Todas","Entradas","Saídas","Pendentes","Rejeitadas"]} active={tab} onChange={setTab} />

          <table className="mt-3 w-full text-[12.5px]">
            <thead>
              <tr className="text-left text-[10px] uppercase tracking-wider text-muted-foreground">
                <th className="py-2 font-medium">Número</th>
                <th className="font-medium">Emissor</th>
                <th className="font-medium">Tipo</th>
                <th className="font-medium">Categoria</th>
                <th className="font-medium">Valor</th>
                <th className="font-medium">Emissão</th>
                <th className="font-medium">Status</th>
                <th className="text-right font-medium">Ações</th>
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 && <tr><td colSpan={8} className="py-8 text-center text-[12px] text-muted-foreground">Nenhuma nota encontrada.</td></tr>}
              {filtered.map((n) => (
                <tr key={n.n} className="border-t border-border">
                  <td className="py-3 font-medium text-brand">{n.n}</td>
                  <td className="text-white">{n.e}</td>
                  <td className="text-muted-foreground">{n.t}</td>
                  <td className="text-muted-foreground">{n.c}</td>
                  <td className="text-white">{n.v}</td>
                  <td className="text-muted-foreground">{n.d}</td>
                  <td><StatusBadge tone={n.st as any}>{n.s}</StatusBadge></td>
                  <td className="text-right">
                    <div className="flex justify-end gap-1.5">
                      <button onClick={() => toast.message(n.n, { description: `${n.e} · ${n.t} · ${n.v} · ${n.d}` })} className="grid h-7 w-7 place-items-center rounded-md border border-border bg-panel-2 text-muted-foreground hover:text-foreground"><FileText size={13}/></button>
                      <button onClick={() => { downloadText(`${n.n.replace(/\s+/g,"_")}.xml`, `<?xml version="1.0"?>\n<NFe numero="${n.n}" emissor="${n.e}" valor="${n.v}"/>`, "application/xml"); toast.success(`${n.n} baixada.`); }} className="grid h-7 w-7 place-items-center rounded-md border border-border bg-panel-2 text-muted-foreground hover:text-foreground"><Download size={13}/></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </Panel>


        <div className="flex flex-col gap-5">
          <Panel className="p-4">
            <h3 className="mb-3 text-[13px] font-semibold text-white">Resumo tributário</h3>
            <ul className="space-y-3 text-[12px]">
              {[
                { l: "ICMS apurado",    v: "R$ 28.400" },
                { l: "PIS / COFINS",    v: "R$ 14.860" },
                { l: "IR retido",       v: "R$ 6.120" },
                { l: "Funrural (2,3%)", v: "R$ 9.840" },
              ].map((r) => (
                <li key={r.l} className="flex items-center justify-between border-b border-border pb-2 last:border-0">
                  <span className="text-muted-foreground">{r.l}</span>
                  <span className="text-white">{r.v}</span>
                </li>
              ))}
            </ul>
            <div className="mt-4 rounded-lg bg-panel-2 p-3">
              <div className="text-[10px] uppercase tracking-wider text-muted-foreground">Total a recolher</div>
              <div className="mt-1 text-[18px] font-semibold text-white">R$ 59.220</div>
              <div className="mt-0.5 text-[11px] text-brand">Vencimento: 20/06/2026</div>
            </div>
          </Panel>

          <Panel className="p-4">
            <h3 className="mb-3 text-[13px] font-semibold text-white">Sincronização SEFAZ</h3>
            <ul className="space-y-3 text-[12px]">
              <li className="flex items-center gap-2"><span className="h-2 w-2 rounded-full bg-[#4ADE80]"/>Webservice online <span className="ml-auto text-muted-foreground text-[11px]">SP</span></li>
              <li className="flex items-center gap-2"><span className="h-2 w-2 rounded-full bg-[#4ADE80]"/>Certificado A1 válido <span className="ml-auto text-muted-foreground text-[11px]">até 04/2027</span></li>
              <li className="flex items-center gap-2"><span className="h-2 w-2 rounded-full bg-[#FBBF24]"/>3 NF-e em fila <span className="ml-auto text-muted-foreground text-[11px]">retry</span></li>
            </ul>
          </Panel>
        </div>
      </div>
    </AppShell>
  );
}
