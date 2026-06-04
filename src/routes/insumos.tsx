import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { Search, Download, Plus } from "lucide-react";
import { AppShell, Kpi, Panel, StatusBadge, Progress, Input, BrandButton, PageHeader, Tabs } from "@/components/AppShell";

export const Route = createFileRoute("/insumos")({
  head: () => ({ meta: [{ title: "Insumos — Orion AgTech" }] }),
  component: InsumosPage,
});

type Row = {
  p: string; c: string; q: string; n: number;
  nt: "green" | "yellow" | "red"; f: string;
  s: string; st: "green" | "yellow" | "red"; a: "Editar" | "Pedir";
};

const initialRows: Row[] = [
  { p: "Soja RR — Elite Plus", c: "Sementes", q: "1.240 sc", n: 82, nt: "green", f: "AgroSul Sementes", s: "OK", st: "green", a: "Editar" },
  { p: "Glifosato 480 CS", c: "Defensivos", q: "320 L", n: 28, nt: "yellow", f: "DefensoAgro Ltda", s: "Repor", st: "yellow", a: "Editar" },
  { p: "Ureia 46% N", c: "Fertilizantes", q: "48 t", n: 61, nt: "green", f: "FertiNorte S.A.", s: "OK", st: "green", a: "Editar" },
  { p: "Diesel S-10", c: "Combustível", q: "4.800 L", n: 14, nt: "red", f: "Petrobras Dist.", s: "Crítico", st: "red", a: "Pedir" },
  { p: "Fungicida Opera", c: "Defensivos", q: "180 L", n: 45, nt: "green", f: "BASF Brasil", s: "OK", st: "green", a: "Editar" },
  { p: "Inseticida Belt", c: "Defensivos", q: "90 L", n: 33, nt: "yellow", f: "Bayer CropScience", s: "Repor", st: "yellow", a: "Editar" },
  { p: "MAP 11-52-0", c: "Fertilizantes", q: "30 t", n: 55, nt: "green", f: "Mosaic Fertil.", s: "OK", st: "green", a: "Editar" },
];

const alerts = [
  { d: "#ef4444", m: "Diesel S-10 abaixo do mínimo", t: "agora" },
  { d: "#FBBF24", m: "Glifosato: reposição recomendada", t: "2h" },
  { d: "#E6641F", m: "Pedido #0047 aguarda aprovação", t: "5h" },
  { d: "#4ADE80", m: "Entrega Ureia confirmada — sex.", t: "1d" },
];

const TABS = ["Todos", "Sementes", "Defensivos", "Fertilizantes", "Combustível"];

function InsumosPage() {
  const [tab, setTab] = useState("Todos");
  const [query, setQuery] = useState("");
  const [rows, setRows] = useState<Row[]>(initialRows);
  const [toast, setToast] = useState<string | null>(null);
  const [form, setForm] = useState({ name: "", cat: "Sementes", qty: "", supplier: "" });

  useEffect(() => {
    if (!toast) return;
    const t = setTimeout(() => setToast(null), 2200);
    return () => clearTimeout(t);
  }, [toast]);

  const filtered = useMemo(() => {
    return rows.filter((r) => {
      const matchTab = tab === "Todos" || r.c === tab;
      const q = query.trim().toLowerCase();
      const matchQuery = !q || r.p.toLowerCase().includes(q) || r.f.toLowerCase().includes(q);
      return matchTab && matchQuery;
    });
  }, [rows, tab, query]);

  const exportCsv = () => {
    const header = "Produto;Categoria;Estoque;Nivel;Fornecedor;Status\n";
    const body = rows.map((r) => `${r.p};${r.c};${r.q};${r.n}%;${r.f};${r.s}`).join("\n");
    const blob = new Blob([header + body], { type: "text/csv;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url; a.download = "insumos.csv"; a.click();
    URL.revokeObjectURL(url);
    setToast("Inventário exportado em CSV.");
  };

  const submit = () => {
    if (!form.name.trim() || !form.qty.trim()) {
      setToast("Preencha nome e quantidade.");
      return;
    }
    const newRow: Row = {
      p: form.name.trim(),
      c: form.cat,
      q: form.qty.trim(),
      n: 75,
      nt: "green",
      f: form.supplier.trim() || "—",
      s: "OK",
      st: "green",
      a: "Editar",
    };
    setRows((r) => [newRow, ...r]);
    setForm({ name: "", cat: form.cat, qty: "", supplier: "" });
    setToast(`Insumo "${newRow.p}" cadastrado.`);
  };

  return (
    <AppShell>
      <PageHeader
        title="Sistema de Gestão — Foco em Insumos"
        subtitle="Safra 2025/26 · Fazenda São Lucas · Marília, SP"
        actions={
          <>
            <button onClick={exportCsv} className="flex items-center gap-1.5 rounded-lg border border-border bg-panel-2 px-3 py-2 text-[12.5px] text-foreground hover:bg-[#2a2a2a]"><Download size={14}/> Exportar</button>
            <BrandButton onClick={() => document.getElementById("novo-insumo-nome")?.focus()}>
              <span className="inline-flex items-center gap-1.5"><Plus size={14}/> Novo insumo</span>
            </BrandButton>
          </>
        }
      />

      <div className="grid grid-cols-4 gap-4">
        <Kpi label="Itens em estoque" value={String(rows.length)} change="↑ +12 este mês" tone="green" />
        <Kpi label="Valor total (R$)" value="R$ 842K" change="↑ +8.4% vs safra anterior" tone="green" />
        <Kpi label="Alertas de estoque" value={String(rows.filter((r) => r.st !== "green").length)} change="⚠ Reposição necessária" tone="yellow" />
        <Kpi label="Pedidos em aberto" value="7" change="→ 2 aguardando aprovação" tone="orange" />
      </div>

      <div className="mt-5 grid grid-cols-[1fr_280px] gap-5">
        <Panel className="p-5">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-[14px] font-semibold text-white">Controle de Insumos</h2>
            <div className="relative">
              <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
              <Input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Buscar insumo ou fornecedor..." className="w-64 pl-8" />
            </div>
          </div>
          <Tabs items={TABS} active={tab} onChange={setTab} />
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
              {filtered.length === 0 && (
                <tr><td colSpan={7} className="py-8 text-center text-[12px] text-muted-foreground">Nenhum insumo encontrado.</td></tr>
              )}
              {filtered.map((r) => (
                <tr key={r.p} className="border-t border-border">
                  <td className="py-3 text-white">{r.p}</td>
                  <td className="text-muted-foreground">{r.c}</td>
                  <td className="text-white">{r.q}</td>
                  <td className="w-40"><Progress value={r.n} tone={r.nt} /></td>
                  <td className="text-muted-foreground">{r.f}</td>
                  <td><StatusBadge tone={r.st}>{r.s}</StatusBadge></td>
                  <td className="text-right">
                    {r.a === "Pedir" ? (
                      <button onClick={() => setToast(`Pedido para "${r.p}" aberto.`)} className="rounded-md bg-brand px-2.5 py-1 text-[11px] font-medium text-brand-foreground">Pedir</button>
                    ) : (
                      <button onClick={() => setToast(`Editando "${r.p}".`)} className="rounded-md border border-border bg-panel-2 px-2.5 py-1 text-[11px] text-muted-foreground hover:text-foreground">Editar</button>
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
              <Input id="novo-insumo-nome" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="Nome" className="w-full" />
              <select
                value={form.cat}
                onChange={(e) => setForm({ ...form, cat: e.target.value })}
                className="w-full rounded-md border border-border bg-panel-2 px-2.5 py-2 text-[12.5px] text-foreground outline-none focus:border-brand"
              >
                {TABS.filter((t) => t !== "Todos").map((t) => <option key={t} value={t}>{t}</option>)}
              </select>
              <Input value={form.qty} onChange={(e) => setForm({ ...form, qty: e.target.value })} placeholder="Quantidade (ex: 100 L)" className="w-full" />
              <Input value={form.supplier} onChange={(e) => setForm({ ...form, supplier: e.target.value })} placeholder="Fornecedor" className="w-full" />
              <BrandButton onClick={submit} className="mt-1 w-full">+ Cadastrar Insumo</BrandButton>
            </div>
          </Panel>
        </div>
      </div>

      {toast && (
        <div className="fixed bottom-6 right-6 z-50 rounded-lg border border-border bg-panel-2 px-4 py-2.5 text-[12.5px] text-foreground shadow-lg">
          {toast}
        </div>
      )}
    </AppShell>
  );
}
