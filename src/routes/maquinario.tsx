import { createFileRoute } from "@tanstack/react-router";
import { Wrench, Clock, CheckCircle2 } from "lucide-react";
import { AppShell, Kpi, Panel, StatusBadge, Progress, PageHeader } from "@/components/AppShell";

export const Route = createFileRoute("/maquinario")({
  head: () => ({ meta: [{ title: "Maquinário — Orion AgTech" }] }),
  component: MaquinarioPage,
});

const rows = [
  { e: "Pulverizador SP-800", t: "Pulverizador", cap: "800 L", s: "Operacional", st: "green", op: "João P.", u: 92, ut: "green", r: "Revisão: 15/06/26" },
  { e: "Trator Valtra T195", t: "Trator", cap: "195 cv", s: "Operacional", st: "green", op: "Carlos M.", u: 78, ut: "green", r: "Revisão: 02/07/26" },
  { e: "Plantadeira PDM", t: "Plantadeira", cap: "17 linhas", s: "Em manutenção", st: "yellow", op: "—", u: 35, ut: "yellow", r: "Oficina desde 20/05" },
  { e: "Colheitadeira TC 5.90", t: "Colheitadeira", cap: "90 cv", s: "Operacional", st: "green", op: "Rafael S.", u: 88, ut: "green", r: "Revisão: 10/08/26" },
  { e: "Caminhão Graneleiro", t: "Transporte", cap: "15 t", s: "Operacional", st: "green", op: "Luiz F.", u: 65, ut: "green", r: "Revisão: 30/06/26" },
  { e: "Grade Aradora 32d", t: "Implemento", cap: "32 discos", s: "Inativo", st: "gray", op: "—", u: 0, ut: "gray", r: "Armazenado" },
] as const;

const maint = [
  { icon: Wrench, bg: "#FBBF2433", color: "#FBBF24", t: "Plantadeira PDM", d: "Em manutenção agora" },
  { icon: Clock, bg: "#E6641F33", color: "#E6641F", t: "Pulverizador SP-800", d: "Revisão: 15/06/2026" },
  { icon: Clock, bg: "#E6641F33", color: "#E6641F", t: "Trator Valtra T195", d: "Revisão: 02/07/2026" },
  { icon: CheckCircle2, bg: "#4ADE8033", color: "#4ADE80", t: "Colheitadeira TC 5.90", d: "Revisão: 10/08/2026" },
];

function MaquinarioPage() {
  return (
    <AppShell>
      <PageHeader title="Controle de Maquinário" subtitle="Frota, operadores e plano de manutenção" />
      <div className="grid grid-cols-4 gap-4">
        <Kpi label="Equipamentos" value="6" change="4 operacionais" tone="green" />
        <Kpi label="Em manutenção" value="1" change="Plantadeira PDM" tone="yellow" />
        <Kpi label="Horas operadas" value="1.240h" change="este mês" tone="blue" />
        <Kpi label="Custo manutenção" value="R$ 24.800" change="↑ +12% vs mês anterior" tone="red" />
      </div>

      <div className="mt-5 grid grid-cols-[1fr_280px] gap-5">
        <Panel className="p-5">
          <h2 className="mb-4 text-[14px] font-semibold text-white">Frota e utilização</h2>
          <table className="w-full text-[12.5px]">
            <thead>
              <tr className="text-left text-[10px] uppercase tracking-wider text-muted-foreground">
                <th className="py-2 font-medium">Equipamento</th>
                <th className="font-medium">Tipo</th>
                <th className="font-medium">Capacidade</th>
                <th className="font-medium">Status</th>
                <th className="font-medium">Operador</th>
                <th className="font-medium">Utilização</th>
                <th className="font-medium">Próxima revisão</th>
                <th className="text-right font-medium">Ações</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((r) => (
                <tr key={r.e} className="border-t border-border">
                  <td className="py-3 text-white">{r.e}</td>
                  <td className="text-muted-foreground">{r.t}</td>
                  <td className="text-muted-foreground">{r.cap}</td>
                  <td><StatusBadge tone={r.st as any}>{r.s}</StatusBadge></td>
                  <td className="text-muted-foreground">{r.op}</td>
                  <td className="w-36"><Progress value={r.u} tone={r.ut as any} /></td>
                  <td className="text-muted-foreground">{r.r}</td>
                  <td className="text-right"><button className="rounded-md border border-border bg-panel-2 px-2.5 py-1 text-[11px] text-muted-foreground hover:text-foreground">Detalhes</button></td>
                </tr>
              ))}
            </tbody>
          </table>
        </Panel>

        <Panel className="p-4">
          <h3 className="mb-3 text-[13px] font-semibold text-white">Manutenções Previstas</h3>
          <ul className="space-y-3">
            {maint.map((m) => {
              const Icon = m.icon;
              return (
                <li key={m.t} className="flex items-start gap-3">
                  <div className="grid h-8 w-8 shrink-0 place-items-center rounded-lg" style={{ background: m.bg, color: m.color }}>
                    <Icon size={15} />
                  </div>
                  <div>
                    <p className="text-[12.5px] text-white">{m.t}</p>
                    <p className="text-[11px] text-muted-foreground">{m.d}</p>
                  </div>
                </li>
              );
            })}
          </ul>
        </Panel>
      </div>
    </AppShell>
  );
}
