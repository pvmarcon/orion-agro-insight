import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Plus, Search, Mail } from "lucide-react";
import { toast } from "sonner";
import { AppShell, Kpi, Panel, StatusBadge, PageHeader, Input, BrandButton, Progress } from "@/components/AppShell";

export const Route = createFileRoute("/equipe")({
  head: () => ({ meta: [{ title: "Equipe — Orion AgTech" }] }),
  component: EquipePage,
});

const team = [
  { n: "João Pereira",      r: "Gerente de Operações",   t: "Operações", st: "Ativo",     stt: "green",  h: "Seg–Sex · 06h–16h", hrs: 92, ht: "green",  c: "+55 14 9 9876-5511" },
  { n: "Carlos Mendes",     r: "Tratorista Sênior",      t: "Maquinário", st: "Ativo",    stt: "green",  h: "Seg–Sáb · 05h–14h", hrs: 88, ht: "green",  c: "+55 14 9 9876-5512" },
  { n: "Rafael Souza",      r: "Operador Colheitadeira", t: "Maquinário", st: "Ativo",    stt: "green",  h: "Sob escala",        hrs: 76, ht: "green",  c: "+55 14 9 9876-5513" },
  { n: "Luiz Fernandes",    r: "Motorista Graneleiro",   t: "Logística", st: "Em rota",   stt: "blue",   h: "Seg–Sex · 04h–13h", hrs: 65, ht: "green",  c: "+55 14 9 9876-5514" },
  { n: "Mariana Costa",     r: "Agrônoma",               t: "Técnico",   st: "Ativo",     stt: "green",  h: "Seg–Sex · 08h–17h", hrs: 70, ht: "green",  c: "+55 14 9 9876-5515" },
  { n: "Pedro Almeida",     r: "Auxiliar de Armazém",    t: "Logística", st: "Folga",     stt: "gray",   h: "—",                 hrs: 40, ht: "yellow", c: "+55 14 9 9876-5516" },
  { n: "Beatriz Lima",      r: "Financeiro",             t: "Adm.",      st: "Ativo",     stt: "green",  h: "Seg–Sex · 09h–18h", hrs: 80, ht: "green",  c: "+55 14 9 9876-5517" },
  { n: "Tiago Ribeiro",     r: "Pulverizador Júnior",    t: "Maquinário", st: "Férias",   stt: "yellow", h: "Volta 12/06",       hrs: 0,  ht: "gray",   c: "+55 14 9 9876-5518" },
] as const;

const initials = (n: string) => n.split(" ").slice(0, 2).map((p) => p[0]).join("");
const palette = ["#E6641F", "#4ADE80", "#60A5FA", "#FBBF24", "#A78BFA", "#F472B6", "#22D3EE", "#FB923C"];

function EquipePage() {
  const [query, setQuery] = useState("");
  const filtered = team.filter((m) => !query || m.n.toLowerCase().includes(query.toLowerCase()) || m.r.toLowerCase().includes(query.toLowerCase()));
  return (
    <AppShell>
      <PageHeader
        title="Equipe & Colaboradores"
        subtitle="Quadro de funcionários, escalas e produtividade"
        actions={<BrandButton onClick={() => toast.success("Formulário de novo colaborador aberto.")}><span className="inline-flex items-center gap-1.5"><Plus size={14} /> Novo colaborador</span></BrandButton>}
      />

      <div className="grid grid-cols-4 gap-4">
        <Kpi label="Colaboradores" value="14" change="↑ +2 este trimestre" tone="green" />
        <Kpi label="Em atividade hoje" value="11" change="2 em rota · 1 escritório" tone="blue" />
        <Kpi label="Horas trabalhadas" value="1.864h" change="acumulado do mês" tone="muted" />
        <Kpi label="Folha (mês)" value="R$ 86,4K" change="↑ +3,1% vs anterior" tone="yellow" />
      </div>

      <div className="mt-5 grid grid-cols-[1fr_300px] gap-5">
        <Panel className="p-5">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-[14px] font-semibold text-white">Quadro de Colaboradores</h2>
            <div className="relative">
              <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
              <Input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Buscar colaborador..." className="w-64 pl-8" />
            </div>
          </div>

          <table className="w-full text-[12.5px]">
            <thead>
              <tr className="text-left text-[10px] uppercase tracking-wider text-muted-foreground">
                <th className="py-2 font-medium">Nome</th>
                <th className="font-medium">Cargo</th>
                <th className="font-medium">Time</th>
                <th className="font-medium">Status</th>
                <th className="font-medium">Escala</th>
                <th className="font-medium">Produtividade</th>
                <th className="font-medium">Contato</th>
                <th className="text-right font-medium">Ações</th>
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 && <tr><td colSpan={8} className="py-8 text-center text-[12px] text-muted-foreground">Nenhum colaborador encontrado.</td></tr>}
              {filtered.map((m) => {
                const i = team.indexOf(m);
                return (
                <tr key={m.n} className="border-t border-border">
                  <td className="py-3">
                    <div className="flex items-center gap-2.5">
                      <div className="grid h-7 w-7 place-items-center rounded-full text-[10.5px] font-semibold text-white" style={{ background: palette[i % palette.length] }}>{initials(m.n)}</div>
                      <span className="text-white">{m.n}</span>
                    </div>
                  </td>
                  <td className="text-muted-foreground">{m.r}</td>
                  <td className="text-muted-foreground">{m.t}</td>
                  <td><StatusBadge tone={m.stt as any}>{m.st}</StatusBadge></td>
                  <td className="text-muted-foreground">{m.h}</td>
                  <td className="w-36"><Progress value={m.hrs} tone={m.ht as any} /></td>
                  <td className="text-muted-foreground">{m.c}</td>
                  <td className="text-right">
                    <button onClick={() => toast.message(m.n, { description: `${m.r} · ${m.t} · ${m.c}` })} className="rounded-md border border-border bg-panel-2 px-2.5 py-1 text-[11px] text-muted-foreground hover:text-foreground">Perfil</button>
                  </td>
                </tr>
              );})}
            </tbody>
          </table>
        </Panel>

        <div className="flex flex-col gap-5">
          <Panel className="p-4">
            <h3 className="mb-3 text-[13px] font-semibold text-white">Distribuição por Time</h3>
            <ul className="space-y-3">
              {[
                { l: "Maquinário", v: 5, c: "#E6641F", p: 36 },
                { l: "Operações",  v: 3, c: "#4ADE80", p: 21 },
                { l: "Logística",  v: 3, c: "#60A5FA", p: 21 },
                { l: "Técnico",    v: 2, c: "#FBBF24", p: 14 },
                { l: "Administrativo", v: 1, c: "#A78BFA", p: 8 },
              ].map((t) => (
                <li key={t.l}>
                  <div className="mb-1 flex justify-between text-[11.5px]">
                    <span className="text-foreground">{t.l}</span>
                    <span className="text-muted-foreground">{t.v}</span>
                  </div>
                  <div className="h-[6px] overflow-hidden rounded bg-[#2E2E2E]">
                    <div className="h-full rounded" style={{ width: `${t.p}%`, background: t.c }} />
                  </div>
                </li>
              ))}
            </ul>
          </Panel>

          <Panel className="p-4">
            <h3 className="mb-3 text-[13px] font-semibold text-white">Aniversariantes do mês</h3>
            <ul className="space-y-3 text-[12px]">
              {[
                { n: "Carlos Mendes", d: "12 jun" },
                { n: "Mariana Costa", d: "21 jun" },
                { n: "Pedro Almeida", d: "28 jun" },
              ].map((a, i) => (
                <li key={a.n} className="flex items-center gap-2.5">
                  <div className="grid h-7 w-7 place-items-center rounded-full text-[10.5px] font-semibold text-white" style={{ background: palette[i + 2] }}>{initials(a.n)}</div>
                  <div className="flex-1">
                    <p className="text-white">{a.n}</p>
                    <p className="text-[11px] text-muted-foreground">{a.d}</p>
                  </div>
                  <button onClick={() => toast.success(`Mensagem de aniversário enviada para ${a.n}.`)} className="grid h-7 w-7 place-items-center rounded-md border border-border bg-panel-2 text-muted-foreground hover:text-foreground"><Mail size={12}/></button>
                </li>
              ))}
            </ul>
          </Panel>
        </div>
      </div>
    </AppShell>
  );
}
