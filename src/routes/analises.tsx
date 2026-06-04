import { createFileRoute } from "@tanstack/react-router";
import { Download } from "lucide-react";
import { toast } from "sonner";
import { AppShell, Kpi, Panel, PageHeader } from "@/components/AppShell";

export const Route = createFileRoute("/analises")({
  head: () => ({ meta: [{ title: "Análises — Orion AgTech" }] }),
  component: AnalisesPage,
});

const months = ["Jul","Ago","Set","Out","Nov","Dez","Jan","Fev","Mar","Abr","Mai","Jun"];
const receita = [62, 71, 68, 84, 92, 105, 118, 124, 132, 128, 142, 148];
const custo   = [48, 52, 50, 58, 64, 72, 80, 84, 88, 86, 92, 96];

function Bar({ values, color, max }: { values: number[]; color: string; max: number }) {
  return (
    <div className="flex h-44 items-end gap-1.5">
      {values.map((v, i) => (
        <div key={i} className="flex-1 rounded-t" style={{ height: `${(v / max) * 100}%`, background: color }} />
      ))}
    </div>
  );
}

function AnalisesPage() {
  const max = Math.max(...receita, ...custo);
  return (
    <AppShell>
      <PageHeader
        title="Análises Financeiras"
        subtitle="Desempenho da safra 2025/26 — Fazenda São Lucas"
        actions={
          <button onClick={() => {
            const body = `Orion AgTech — Análises Financeiras\nReceita acumulada: R$ 1,42M\nCusto operacional: R$ 918K\nMargem líquida: 35,3%\nROI/ha: R$ 1.840\n\nReceita (12m): ${receita.join(", ")}\nCusto (12m):   ${custo.join(", ")}\n`;
            const blob = new Blob([body], { type: "text/plain" });
            const url = URL.createObjectURL(blob);
            const a = document.createElement("a"); a.href = url; a.download = "analises-orion.txt"; a.click();
            URL.revokeObjectURL(url);
            toast.success("Relatório exportado.");
          }} className="flex items-center gap-1.5 rounded-lg border border-border bg-panel-2 px-3 py-2 text-[12.5px] text-foreground hover:bg-[#2a2a2a]">
            <Download size={14}/> Exportar PDF
          </button>
        }
      />

      <div className="grid grid-cols-4 gap-4">
        <Kpi label="Receita acumulada" value="R$ 1,42M" change="↑ +14,2% vs anterior" tone="green" />
        <Kpi label="Custo operacional" value="R$ 918K" change="↑ +6,4% vs anterior" tone="yellow" />
        <Kpi label="Margem líquida" value="35,3%" change="↑ +3,1 p.p." tone="green" />
        <Kpi label="ROI por hectare" value="R$ 1.840" change="meta R$ 2.000" tone="blue" />
      </div>

      <div className="mt-5 grid grid-cols-[1fr_320px] gap-5">
        <Panel className="p-5">
          <div className="mb-1 flex items-center justify-between">
            <h2 className="text-[14px] font-semibold text-white">Receita × Custo — Últimos 12 meses</h2>
            <div className="flex gap-3 text-[11px] text-muted-foreground">
              <span className="flex items-center gap-1.5"><span className="h-2 w-2 rounded-sm bg-[#4ADE80]"/>Receita</span>
              <span className="flex items-center gap-1.5"><span className="h-2 w-2 rounded-sm bg-[#E6641F]"/>Custo</span>
            </div>
          </div>
          <p className="mb-5 text-[11.5px] text-muted-foreground">Valores em R$ mil</p>

          <div className="grid grid-cols-12 gap-3">
            <div className="col-span-12"><Bar values={receita} color="#4ADE80" max={max}/></div>
            <div className="col-span-12 -mt-2"><Bar values={custo} color="#E6641F" max={max}/></div>
            <div className="col-span-12 mt-1 flex justify-between text-[10.5px] text-muted-foreground">
              {months.map((m) => <span key={m} className="flex-1 text-center">{m}</span>)}
            </div>
          </div>
        </Panel>

        <Panel className="p-5">
          <h3 className="mb-4 text-[13px] font-semibold text-white">Distribuição de custos</h3>
          <ul className="space-y-4">
            {[
              { l: "Insumos",       v: "R$ 412K", p: 45, c: "#E6641F" },
              { l: "Maquinário",    v: "R$ 184K", p: 20, c: "#FBBF24" },
              { l: "Mão de obra",   v: "R$ 156K", p: 17, c: "#60A5FA" },
              { l: "Logística",     v: "R$ 92K",  p: 10, c: "#4ADE80" },
              { l: "Outros",        v: "R$ 74K",  p:  8, c: "#A78BFA" },
            ].map((r) => (
              <li key={r.l}>
                <div className="mb-1 flex items-center justify-between text-[12px]">
                  <span className="text-white">{r.l}</span>
                  <span className="text-muted-foreground">{r.v} · {r.p}%</span>
                </div>
                <div className="h-[6px] overflow-hidden rounded bg-[#2E2E2E]">
                  <div className="h-full rounded" style={{ width: `${r.p * 2.2}%`, background: r.c }} />
                </div>
              </li>
            ))}
          </ul>
        </Panel>
      </div>

      <div className="mt-5 grid grid-cols-3 gap-5">
        <Panel className="p-5">
          <h3 className="mb-3 text-[13px] font-semibold text-white">Rentabilidade por cultura</h3>
          <ul className="space-y-3">
            {[
              { l: "Soja RR",            v: "R$ 2.140/ha", p: 88, c: "#4ADE80" },
              { l: "Milho Híbrido",      v: "R$ 1.560/ha", p: 64, c: "#FBBF24" },
              { l: "Soja Convencional",  v: "R$ 1.820/ha", p: 75, c: "#60A5FA" },
            ].map((r) => (
              <li key={r.l}>
                <div className="mb-1 flex justify-between text-[12px]"><span className="text-foreground">{r.l}</span><span className="text-muted-foreground">{r.v}</span></div>
                <div className="h-[6px] overflow-hidden rounded bg-[#2E2E2E]"><div className="h-full rounded" style={{ width: `${r.p}%`, background: r.c }}/></div>
              </li>
            ))}
          </ul>
        </Panel>

        <Panel className="p-5">
          <h3 className="mb-3 text-[13px] font-semibold text-white">Fluxo de caixa (próx. 90d)</h3>
          <ul className="space-y-2.5 text-[12px]">
            {[
              { d: "05/06", l: "Venda Soja — Cargill",     v: "+ R$ 184.500", c: "#4ADE80" },
              { d: "12/06", l: "Folha de pagamento",       v: "− R$ 86.420",  c: "#ef4444" },
              { d: "20/06", l: "Compra Diesel S-10",       v: "− R$ 28.900",  c: "#ef4444" },
              { d: "30/06", l: "Venda Milho — Bunge",      v: "+ R$ 92.100",  c: "#4ADE80" },
              { d: "10/07", l: "Parcela financiamento",    v: "− R$ 42.000",  c: "#ef4444" },
            ].map((r) => (
              <li key={r.d} className="flex items-center justify-between border-b border-border pb-2 last:border-0">
                <div><p className="text-white">{r.l}</p><p className="text-[11px] text-muted-foreground">{r.d}</p></div>
                <span style={{ color: r.c }} className="text-[12.5px] font-medium">{r.v}</span>
              </li>
            ))}
          </ul>
        </Panel>

        <Panel className="p-5">
          <h3 className="mb-3 text-[13px] font-semibold text-white">Indicadores chave</h3>
          <div className="grid grid-cols-2 gap-2">
            {[
              ["EBITDA",        "R$ 504K"],
              ["Margem bruta",  "42,1%"],
              ["Dívida/EBITDA", "1,8x"],
              ["Capex YTD",     "R$ 78K"],
              ["Ciclo caixa",   "62 dias"],
              ["Cobertura",     "3,2x"],
            ].map(([k, v]) => (
              <div key={k} className="rounded-lg bg-panel-2 p-3">
                <div className="text-[10px] uppercase tracking-wider text-muted-foreground">{k}</div>
                <div className="mt-1 text-[14px] font-semibold text-white">{v}</div>
              </div>
            ))}
          </div>
        </Panel>
      </div>
    </AppShell>
  );
}
