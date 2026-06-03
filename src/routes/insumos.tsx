import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Search, Download, Plus } from "lucide-react";
import { AppShell, Kpi, Panel, StatusBadge, Progress, Input, BrandButton, PageHeader, Tabs } from "@/components/AppShell";

export const Route = createFileRoute("/insumos")({
  head: () => ({ meta: [{ title: "Insumos — Orion AgTech" }] }),
  component: InsumosPage,
});

const rows = [
  { p: "Soja RR — Elite Plus", c: "Semente", q: "1.240 sc", n: 82, nt: "green", f: "AgroSul Sementes", s: "OK", st: "green", a: "Editar" },
  { p: "Glifosato 480 CS", c: "Defensivo", q: "320 L", n: 28, nt: "yellow", f: "DefensoAgro Ltda", s: "Repor", st: "yellow", a: "Editar" },
  { p: "Ureia 46% N", c: "Fertilizante", q: "48 t", n: 61, nt: "green", f: "FertiNorte S.A.", s: "OK", st: "green", a: "Editar" },
  { p: "Diesel S-10", c: "Combustível", q: "4.800 L", n: 14, nt: "red", f: "Petrobras Dist.", s: "Crítico", st: "red", a: "Pedir" },
  { p: "Fungicida Opera", c: "Defensivo", q: "180 L", n: 45, nt: "green", f: "BASF Brasil", s: "OK", st: "green", a: "Editar" },
  { p: "Inseticida Belt", c: "Defensivo", q: "90 L", n: 33, nt: "yellow", f: "Bayer CropScience", s: "Repor", st: "yellow", a: "Editar" },
  { p: "MAP 11-52-0", c: "Fertilizante", q: "30 t", n: 55, nt: "green", f: "Mosaic Fertil.", s: "OK", st: "green", a: "Editar" },
] as const;

const alerts = [
  { d: "#ef4444", m: "Diesel S-10 abaixo do mínimo", t: "agora" },
  { d: "#FBBF24", m: "Glifosato: reposição recomendada", t: "2h" },
  { d: "#E6641F", m: "Pedido #0047 aguarda aprovação", t: "5h" },
  { d: "#4ADE80", m: "Entrega Ureia confirmada — sex.", t: "1d" },
];

function InsumosPage() {
  const [tab, setTab] = useState("Todos");
  return (
    <AppShell>
      <PageHeader
        title="Sistema de Gestão — Foco em Insumos"
        subtitle="Safra 2025/26 · Fazenda São Lucas · Marília, SP"
        actions={
          <>
            <button className="flex items-center gap-1.5 rounded-lg border border-border bg-panel-2 px-3 py-2 text-[12.5px] text-foreground hover:bg-[#2a2a2a]"><Download size={14}/> Exportar</button>
            <BrandButton><span className="inline-flex items-center gap-1.5"><Plus size={14}/> Novo insumo</span></BrandButton>
          </>
        }
      />

      <div className="grid grid-cols-4 gap-4">
        <Kpi label="Itens em estoque" value="148" change="↑ +12 este mês" tone="green" />
        <Kpi label="Valor total (R$)" value="R$ 842K" change="↑ +8.4% vs safra anterior" tone="green" />
        <Kpi label="Alertas de estoque" value="3" change="⚠ Reposição necessária" tone="yellow" />
        <Kpi label="Pedidos em aberto" value="7" change="→ 2 aguardando aprovação" tone="orange" />
      </div>

      <div className="mt-5 grid grid-cols-[1fr_280px] gap-5">
        <Panel className="p-5">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-[14px] font-semibold text-white">Controle de Insumos</h2>
            <div className="relative">
              <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
              <Input placeholder="Buscar insumo..." className="w-64 pl-8" />
            </div>
          </div>
          <Tabs items={["Todos","Sementes","Defensivos","Fertilizantes","Combustível"]} active={tab} onChange={setTab} />
          <table className="mt-3 w-full text-[12.5px]">
            <thead>
              <tr className="text-left text-[10px] uppercase tracking-wider text-muted-foreground">
                <th className="py-2 font-medium">Produto</th>
                <th className="font-medium">Categoria</th>
                <th className="font-medium">Estoque atual</th>
                <th className="font-medium">Nível</th>
                <th className="font-medium">Fornecedor</th>
                <th className="font-medium">Status</th>
                <th className="text-right font-medium">Ações</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((r) => (
                <tr key={r.p} className="border-t border-border">
                  <td className="py-3 text-white">{r.p}</td>
                  <td className="text-muted-foreground">{r.c}</td>
                  <td className="text-white">{r.q}</td>
                  <td className="w-40"><Progress value={r.n} tone={r.nt as any} /></td>
                  <td className="text-muted-foreground">{r.f}</td>
                  <td><StatusBadge tone={r.st as any}>{r.s}</StatusBadge></td>
                  <td className="text-right">
                    {r.a === "Pedir" ? (
                      <button className="rounded-md bg-brand px-2.5 py-1 text-[11px] font-medium text-brand-foreground">Pedir</button>
                    ) : (
                      <button className="rounded-md border border-border bg-panel-2 px-2.5 py-1 text-[11px] text-muted-foreground hover:text-foreground">Editar</button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </Panel>

        <div className="flex flex-col gap-5">
          <Panel className="p-4">
            <h3 className="mb-3 text-[13px] font-semibold text-white">Alertas recentes</h3>
            <ul className="space-y-3">
              {alerts.map((a) => (
                <li key={a.m} className="flex items-start gap-2.5">
                  <span className="mt-1.5 h-2 w-2 shrink-0 rounded-full" style={{ background: a.d }} />
                  <div className="flex-1">
                    <p className="text-[12px] text-foreground">{a.m}</p>
                    <p className="text-[10.5px] text-muted-foreground">{a.t}</p>
                  </div>
                </li>
              ))}
            </ul>
          </Panel>

          <Panel className="p-4">
            <h3 className="mb-3 text-[13px] font-semibold text-white">Adicionar Insumo</h3>
            <div className="space-y-2">
              <Input placeholder="Nome" className="w-full" />
              <Input placeholder="Categoria" className="w-full" />
              <Input placeholder="Quantidade" className="w-full" />
              <Input placeholder="Fornecedor" className="w-full" />
              <BrandButton className="mt-1 w-full">+ Cadastrar Insumo</BrandButton>
            </div>
          </Panel>
        </div>
      </div>
    </AppShell>
  );
}
