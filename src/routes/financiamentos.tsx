import { createFileRoute } from "@tanstack/react-router";
import { Plus, Calendar } from "lucide-react";
import { toast } from "sonner";
import { AppShell, Kpi, Panel, StatusBadge, PageHeader, BrandButton } from "@/components/AppShell";

export const Route = createFileRoute("/financiamentos")({
  head: () => ({ meta: [{ title: "Financiamentos — Orion AgTech" }] }),
  component: FinanciamentosPage,
});

const contratos = [
  { id: "Pronaf — Custeio 25/26",   b: "Banco do Brasil", v: "R$ 480.000", saldo: "R$ 312.500", j: "5,5% a.a.", venc: "30/04/2027", s: "Em dia",      st: "green",  pago: 35 },
  { id: "Moderfrota — Trator T195", b: "BNDES",           v: "R$ 220.000", saldo: "R$ 168.400", j: "8,5% a.a.", venc: "15/12/2028", s: "Em dia",      st: "green",  pago: 24 },
  { id: "Inovagro — Plantadeira",   b: "Sicredi",         v: "R$ 145.000", saldo: "R$ 92.100",  j: "7,0% a.a.", venc: "20/09/2027", s: "Em dia",      st: "green",  pago: 37 },
  { id: "Pronamp — Investimento",   b: "Banco do Brasil", v: "R$ 90.000",  saldo: "R$ 18.400",  j: "6,0% a.a.", venc: "10/07/2026", s: "Quitar",      st: "yellow", pago: 80 },
  { id: "CPR — Soja 2025",          b: "Cargill",         v: "R$ 360.000", saldo: "R$ 360.000", j: "—",         venc: "Entrega",    s: "Em entrega",  st: "blue",   pago: 0 },
  { id: "Capital de giro",          b: "Sicoob",          v: "R$ 60.000",  saldo: "R$ 64.200",  j: "12,4% a.a.", venc: "30/06/2026", s: "Atrasado",    st: "red",    pago: 12 },
] as const;

const parcelas = [
  { d: "10/06", l: "Pronaf — Custeio",   v: "R$ 42.000", c: "#E6641F" },
  { d: "18/06", l: "Moderfrota — T195",  v: "R$ 14.800", c: "#60A5FA" },
  { d: "20/06", l: "Inovagro",           v: "R$ 9.200",  c: "#4ADE80" },
  { d: "30/06", l: "Capital de giro",    v: "R$ 5.600",  c: "#ef4444" },
  { d: "10/07", l: "Pronamp",            v: "R$ 18.400", c: "#FBBF24" },
];

function FinanciamentosPage() {
  return (
    <AppShell>
      <PageHeader
        title="Financiamentos"
        subtitle="Linhas de crédito rural, CPRs e capital de giro"
        actions={<BrandButton onClick={() => toast.success("Simulador de novo contrato aberto.")}><span className="inline-flex items-center gap-1.5"><Plus size={14}/> Novo contrato</span></BrandButton>}
      />

      <div className="grid grid-cols-4 gap-4">
        <Kpi label="Dívida total"        value="R$ 1,02M" change="6 contratos ativos" tone="muted" />
        <Kpi label="Saldo devedor"       value="R$ 1,02M" change="↓ R$ 84K este tri." tone="green" />
        <Kpi label="Parcela do mês"      value="R$ 71.600" change="vence até 30/06" tone="yellow" />
        <Kpi label="Inadimplência"       value="1" change="⚠ Capital de giro" tone="red" />
      </div>

      <div className="mt-5 grid grid-cols-[1fr_300px] gap-5">
        <Panel className="p-5">
          <h2 className="mb-4 text-[14px] font-semibold text-white">Contratos ativos</h2>

          <table className="w-full text-[12.5px]">
            <thead>
              <tr className="text-left text-[10px] uppercase tracking-wider text-muted-foreground">
                <th className="py-2 font-medium">Contrato</th>
                <th className="font-medium">Banco</th>
                <th className="font-medium">Valor</th>
                <th className="font-medium">Saldo devedor</th>
                <th className="font-medium">Juros</th>
                <th className="font-medium">Vencimento</th>
                <th className="font-medium">Quitação</th>
                <th className="font-medium">Status</th>
              </tr>
            </thead>
            <tbody>
              {contratos.map((c) => (
                <tr key={c.id} onClick={() => toast.message(c.id, { description: `${c.b} · Saldo ${c.saldo} · ${c.j} · vence ${c.venc}` })} className="cursor-pointer border-t border-border hover:bg-panel-2">
                  <td className="py-3 text-white">{c.id}</td>
                  <td className="text-muted-foreground">{c.b}</td>
                  <td className="text-muted-foreground">{c.v}</td>
                  <td className="text-white">{c.saldo}</td>
                  <td className="text-muted-foreground">{c.j}</td>
                  <td className="text-muted-foreground">{c.venc}</td>
                  <td className="w-32">
                    <div className="flex items-center gap-2">
                      <div className="h-[6px] flex-1 overflow-hidden rounded bg-[#2E2E2E]"><div className="h-full rounded bg-brand" style={{ width: `${c.pago}%` }}/></div>
                      <span className="w-9 text-right text-[11px] text-muted-foreground">{c.pago}%</span>
                    </div>
                  </td>
                  <td><StatusBadge tone={c.st as any}>{c.s}</StatusBadge></td>
                </tr>
              ))}
            </tbody>
          </table>
        </Panel>

        <div className="flex flex-col gap-5">
          <Panel className="p-4">
            <div className="mb-3 flex items-center gap-2">
              <Calendar size={14} className="text-brand"/>
              <h3 className="text-[13px] font-semibold text-white">Próximas parcelas</h3>
            </div>
            <ul className="space-y-3">
              {parcelas.map((p) => (
                <li key={p.l} className="flex items-center gap-3 border-l-2 pl-3" style={{ borderColor: p.c }}>
                  <div className="flex w-12 flex-col items-center leading-none">
                    <span className="text-[16px] font-semibold" style={{ color: p.c }}>{p.d.split("/")[0]}</span>
                    <span className="text-[10px] uppercase text-muted-foreground">{["jan","fev","mar","abr","mai","jun","jul","ago","set","out","nov","dez"][parseInt(p.d.split("/")[1])-1]}</span>
                  </div>
                  <div className="flex-1">
                    <p className="text-[12.5px] text-white">{p.l}</p>
                    <p className="text-[11px] text-muted-foreground">{p.v}</p>
                  </div>
                </li>
              ))}
            </ul>
          </Panel>

          <Panel className="p-4">
            <h3 className="mb-3 text-[13px] font-semibold text-white">Capacidade de pagamento</h3>
            <div className="text-[11px] text-muted-foreground">Comprometimento da receita projetada</div>
            <div className="mt-2 flex items-end gap-1.5">
              <span className="text-[28px] font-semibold text-white leading-none">28%</span>
              <span className="pb-1 text-[11px] text-[#4ADE80]">saudável</span>
            </div>
            <div className="mt-3 h-[8px] overflow-hidden rounded bg-[#2E2E2E]">
              <div className="h-full rounded bg-gradient-to-r from-[#4ADE80] via-[#FBBF24] to-[#ef4444]" style={{ width: "28%" }} />
            </div>
            <div className="mt-2 flex justify-between text-[10px] text-muted-foreground"><span>0%</span><span>50%</span><span>100%</span></div>
          </Panel>
        </div>
      </div>
    </AppShell>
  );
}
