import { createFileRoute } from "@tanstack/react-router";
import { AppShell, Kpi, Panel, StatusBadge, PageHeader } from "@/components/AppShell";

export const Route = createFileRoute("/culturas")({
  head: () => ({ meta: [{ title: "Culturas — Orion AgTech" }] }),
  component: CulturasPage,
});

const cultures = [
  { name: "Soja RR", color: "#4ADE80", talhao: "Talhão A+C", area: "282ha", safra: "Safra 2025/26", phase: "Emergência", prog: 89, harvest: "Mar/2026", price: "R$ 142,50/sc" },
  { name: "Milho Híbrido", color: "#FBBF24", talhao: "Talhão B", area: "168ha", safra: "Safrinha 2026", phase: "Crescimento", prog: 72, harvest: "Jun/2026", price: "R$ 68,20/sc" },
  { name: "Soja Convencional", color: "#60A5FA", talhao: "Talhão D", area: "95ha", safra: "Safra 2025/26", phase: "Floração", prog: 65, harvest: "Abr/2026", price: "R$ 138,90/sc" },
];

const months = ["Out","Nov","Dez","Jan","Fev","Mar","Abr","Mai","Jun"];
const heights = [30, 55, 75, 90, 95, 88, 70, 50, 25];
const monthTones = ["#4ADE80","#4ADE80","#4ADE80","#4ADE80","#FBBF24","#FBBF24","#FBBF24","#6B7280","#6B7280"];

const ndvi = [
  { l: "Talhão A — Soja", v: 0.76, p: 76, c: "#4ADE80" },
  { l: "Talhão B — Milho", v: 0.71, p: 71, c: "#FBBF24" },
  { l: "Talhão C — Soja", v: 0.74, p: 74, c: "#4ADE80" },
];

export default function CulturasPage() {
  return (
    <AppShell>
      <PageHeader title="Gestão de Culturas" subtitle="Acompanhamento de safra e desempenho por talhão" />
      <div className="grid grid-cols-4 gap-4">
        <Kpi label="Culturas ativas" value="3" change="↑ +1 vs safra anterior" tone="green" />
        <Kpi label="Área plantada" value="545 ha" change="de 600 ha disponíveis" tone="muted" />
        <Kpi label="Produção estimada" value="4.850 sc" change="↑ +6.2% projeção" tone="blue" />
        <Kpi label="Receita projetada" value="R$ 834K" change="↑ +12% vs anterior" tone="green" />
      </div>

      <div className="mt-5 grid grid-cols-3 gap-5">
        {cultures.map((c) => (
          <Panel key={c.name} className="p-5">
            <div className="flex items-start justify-between">
              <div>
                <div className="flex items-center gap-2">
                  <span className="h-2.5 w-2.5 rounded-full" style={{ background: c.color }} />
                  <h3 className="text-[15px] font-semibold text-white">{c.name}</h3>
                </div>
                <p className="mt-0.5 text-[11px] text-muted-foreground">{c.talhao}</p>
              </div>
              <span className="inline-flex items-center rounded-full px-2.5 py-0.5 text-[11px] font-medium" style={{ backgroundColor: `${c.color}21`, color: c.color, border: `1px solid ${c.color}55` }}>{c.phase}</span>
            </div>
            <div className="mt-4 grid grid-cols-2 gap-2">
              {[
                ["Área", c.area],
                ["Safra", c.safra],
                ["Colheita", c.harvest],
                ["Cotação", c.price],
              ].map(([k, v]) => (
                <div key={k} className="rounded-lg bg-panel-2 p-3">
                  <div className="text-[10px] uppercase tracking-wider text-muted-foreground">{k}</div>
                  <div className="mt-1 text-[13px] text-white">{v}</div>
                </div>
              ))}
            </div>
            <div className="mt-4">
              <div className="mb-1.5 flex items-center justify-between text-[11px]">
                <span className="text-muted-foreground">Progresso do ciclo</span>
                <span className="text-white">{c.prog}%</span>
              </div>
              <div className="h-[6px] overflow-hidden rounded bg-[#2E2E2E]">
                <div className="h-full rounded" style={{ width: `${c.prog}%`, background: c.color }} />
              </div>
            </div>
          </Panel>
        ))}
      </div>

      <div className="mt-5 grid grid-cols-[1fr_280px] gap-5">
        <Panel className="p-5">
          <h3 className="mb-1 text-[14px] font-semibold text-white">Calendário de Culturas — Safra 2025/26</h3>
          <p className="text-[11.5px] text-muted-foreground">Distribuição mensal de atividade no campo</p>
          <div className="mt-6 flex h-48 items-end gap-3">
            {months.map((m, i) => (
              <div key={m} className="flex flex-1 flex-col items-center gap-2">
                <div className="flex w-full items-end justify-center" style={{ height: "100%" }}>
                  <div className="w-full rounded-t" style={{ height: `${heights[i]}%`, background: monthTones[i] }} />
                </div>
                <span className="text-[10.5px] text-muted-foreground">{m}</span>
              </div>
            ))}
          </div>
          <div className="mt-3 flex gap-4 text-[11px] text-muted-foreground">
            <span className="flex items-center gap-1.5"><span className="h-2 w-2 rounded-sm bg-[#4ADE80]"/>Plantio</span>
            <span className="flex items-center gap-1.5"><span className="h-2 w-2 rounded-sm bg-[#FBBF24]"/>Manejo</span>
            <span className="flex items-center gap-1.5"><span className="h-2 w-2 rounded-sm bg-[#6B7280]"/>Colheita</span>
          </div>
        </Panel>

        <Panel className="p-4">
          <h3 className="mb-1 text-[13px] font-semibold text-white">Índice NDVI por Talhão</h3>
          <p className="mb-4 text-[11px] text-muted-foreground">Vigor vegetativo atual</p>
          <ul className="space-y-4">
            {ndvi.map((n) => (
              <li key={n.l}>
                <div className="mb-1 flex items-center justify-between text-[11.5px]">
                  <span className="text-foreground">{n.l}</span>
                  <span className="text-muted-foreground">{n.v.toFixed(2)}</span>
                </div>
                <div className="h-[6px] overflow-hidden rounded bg-[#2E2E2E]">
                  <div className="h-full rounded" style={{ width: `${n.p}%`, background: n.c }} />
                </div>
              </li>
            ))}
          </ul>
        </Panel>
      </div>
    </AppShell>
  );
}
