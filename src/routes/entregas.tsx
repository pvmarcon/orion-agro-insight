import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Eye, Check } from "lucide-react";
import { AppShell, Kpi, Panel, StatusBadge, PageHeader, Tabs } from "@/components/AppShell";

export const Route = createFileRoute("/entregas")({
  head: () => ({ meta: [{ title: "Entregas — Orion AgTech" }] }),
  component: EntregasPage,
});

const rows = [
  { id: "ENT-0051", prod: "Ureia 46% N", q: "30 t", f: "FertiNorte S.A.", s: "Confirmada", st: "green", p: "sex. 30/05", l: "Armazém 2" },
  { id: "ENT-0052", prod: "Soja RR Elite", q: "500 sc", f: "AgroSul Sementes", s: "Em trânsito", st: "blue", p: "seg. 02/06", l: "Galpão 1" },
  { id: "ENT-0053", prod: "Glifosato 480", q: "200 L", f: "DefensoAgro", s: "Pendente", st: "yellow", p: "qua. 04/06", l: "Almoxarifado" },
  { id: "ENT-0054", prod: "Diesel S-10", q: "5.000 L", f: "Petrobras Dist.", s: "Urgente", st: "red", p: "hj. 27/05", l: "Tanque 1" },
  { id: "ENT-0055", prod: "MAP 11-52-0", q: "20 t", f: "Mosaic Fertil.", s: "Confirmada", st: "green", p: "qui. 05/06", l: "Armazém 1" },
  { id: "ENT-0056", prod: "Fungicida Opera", q: "100 L", f: "BASF Brasil", s: "Agendada", st: "gray", p: "seg. 09/06", l: "Almoxarifado" },
] as const;

const timeline = [
  { d: "27", m: "mai", c: "#ef4444", t: "Diesel S-10", det: "5.000 L · Urgente" },
  { d: "30", m: "mai", c: "#4ADE80", t: "Ureia 46% N", det: "30 t · Confirmada" },
  { d: "02", m: "jun", c: "#60A5FA", t: "Soja RR Elite", det: "500 sc · Em trânsito" },
  { d: "04", m: "jun", c: "#FBBF24", t: "Glifosato 480", det: "200 L · Pendente" },
  { d: "05", m: "jun", c: "#4ADE80", t: "MAP 11-52-0", det: "20 t · Confirmada" },
];

function EntregasPage() {
  const [tab, setTab] = useState("Todas");
  return (
    <AppShell>
      <PageHeader title="Gestão de Entregas" subtitle="Acompanhamento de pedidos e recebimentos" />
      <div className="grid grid-cols-4 gap-4">
        <Kpi label="Entregas este mês" value="12" change="6 concluídas" tone="green" />
        <Kpi label="Pendentes" value="4" change="1 urgente" tone="yellow" />
        <Kpi label="Valor em trânsito" value="R$ 184K" change="3 cargas" tone="blue" />
        <Kpi label="Atrasos" value="1" change="⚠ Diesel urgente" tone="red" />
      </div>

      <div className="mt-5 grid grid-cols-[1fr_260px] gap-5">
        <Panel className="p-5">
          <div className="mb-3 flex items-center justify-between">
            <h2 className="text-[14px] font-semibold text-white">Pedidos & Entregas</h2>
          </div>
          <Tabs items={["Todas","Pendentes","Confirmadas","Urgentes"]} active={tab} onChange={setTab} />
          <table className="mt-3 w-full text-[12.5px]">
            <thead>
              <tr className="text-left text-[10px] uppercase tracking-wider text-muted-foreground">
                <th className="py-2 font-medium">Pedido</th>
                <th className="font-medium">Produto</th>
                <th className="font-medium">Quantidade</th>
                <th className="font-medium">Fornecedor</th>
                <th className="font-medium">Status</th>
                <th className="font-medium">Previsão</th>
                <th className="font-medium">Local</th>
                <th className="text-right font-medium">Ações</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((r) => (
                <tr key={r.id} className="border-t border-border">
                  <td className="py-3 font-medium text-brand">{r.id}</td>
                  <td className="text-white">{r.prod}</td>
                  <td className="text-muted-foreground">{r.q}</td>
                  <td className="text-muted-foreground">{r.f}</td>
                  <td><StatusBadge tone={r.st as any}>{r.s}</StatusBadge></td>
                  <td className="text-muted-foreground">{r.p}</td>
                  <td className="text-muted-foreground">{r.l}</td>
                  <td>
                    <div className="flex justify-end gap-1.5">
                      <button className="grid h-7 w-7 place-items-center rounded-md border border-border bg-panel-2 text-muted-foreground hover:text-foreground"><Eye size={13}/></button>
                      <button className="grid h-7 w-7 place-items-center rounded-md border border-[#4ADE8055] bg-[#4ADE8021] text-[#4ADE80]"><Check size={13}/></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </Panel>

        <Panel className="p-4">
          <h3 className="mb-4 text-[13px] font-semibold text-white">Próximas Entregas</h3>
          <ul className="space-y-3">
            {timeline.map((t) => (
              <li key={t.t} className="flex items-center gap-3 border-l-2 pl-3" style={{ borderColor: t.c }}>
                <div className="flex w-10 flex-col items-center leading-none">
                  <span className="text-[18px] font-semibold" style={{ color: t.c }}>{t.d}</span>
                  <span className="text-[10px] uppercase text-muted-foreground">{t.m}</span>
                </div>
                <div>
                  <p className="text-[12.5px] text-white">{t.t}</p>
                  <p className="text-[11px] text-muted-foreground">{t.det}</p>
                </div>
              </li>
            ))}
          </ul>
        </Panel>
      </div>
    </AppShell>
  );
}
