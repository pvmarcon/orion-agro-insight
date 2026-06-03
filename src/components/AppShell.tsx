import { Link, useRouterState } from "@tanstack/react-router";
import { Bell, Settings, Package, Sprout, Tractor, Truck, Users, Map as MapIcon, BarChart3, FileText, Wallet, LayoutGrid } from "lucide-react";
import type { ReactNode } from "react";

const topNav = [
  "Início", "A Orion", "Produtos", "Laboratório", "Cálculo de rentabilidade", "Difusão de conhecimento", "Contato",
];

const sideSections = [
  {
    title: "GESTÃO",
    items: [
      { label: "Visão geral", to: "/", icon: LayoutGrid },
      { label: "Insumos", to: "/insumos", icon: Package, badge: "3" },
      { label: "Culturas", to: "/culturas", icon: Sprout },
      { label: "Maquinário", to: "/maquinario", icon: Tractor },
    ],
  },
  {
    title: "OPERAÇÕES",
    items: [
      { label: "Entregas", to: "/entregas", icon: Truck },
      { label: "Equipe", to: "/equipe", icon: Users },
      { label: "Talhões", to: "/talhoes", icon: MapIcon },
    ],
  },
  {
    title: "FINANCEIRO",
    items: [
      { label: "Análises", to: "/analises", icon: BarChart3 },
      { label: "Notas fiscais", to: "/notas", icon: FileText },
      { label: "Financiamentos", to: "/financiamentos", icon: Wallet },
    ],
  },
] as const;

export function AppShell({ children }: { children: ReactNode }) {
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const activeTop = "Difusão de conhecimento";

  return (
    <div className="flex min-h-screen flex-col bg-background text-foreground">
      {/* Topbar */}
      <header className="flex h-[52px] items-center justify-between border-b border-border bg-panel px-5">
        <div className="flex items-center gap-8">
          <div className="flex items-center gap-2">
            <span className="rounded-md bg-brand px-2 py-0.5 text-[11px] font-bold tracking-wide text-brand-foreground">ORION</span>
            <span className="text-[11px] uppercase tracking-wider text-muted-foreground">AgTech</span>
          </div>
          <nav className="hidden items-center gap-5 text-[12.5px] lg:flex">
            {topNav.map((l) => (
              <a key={l} href="#" className={l === activeTop ? "text-brand" : "text-muted-foreground hover:text-foreground"}>{l}</a>
            ))}
          </nav>
        </div>
        <div className="flex items-center gap-2">
          <button className="grid h-8 w-8 place-items-center rounded-md border border-border bg-panel-2 text-muted-foreground hover:text-foreground"><Bell size={14} /></button>
          <button className="grid h-8 w-8 place-items-center rounded-md border border-border bg-panel-2 text-muted-foreground hover:text-foreground"><Settings size={14} /></button>
          <div className="grid h-8 w-8 place-items-center rounded-full bg-brand text-[11px] font-semibold text-brand-foreground">JP</div>
        </div>
      </header>

      <div className="flex flex-1">
        {/* Sidebar */}
        <aside className="w-[200px] shrink-0 border-r border-border bg-panel">
          <nav className="flex flex-col gap-5 py-5">
            {sideSections.map((sec) => (
              <div key={sec.title}>
                <div className="px-4 pb-2 text-[10px] font-semibold tracking-wider text-muted-foreground/70">{sec.title}</div>
                <ul>
                  {sec.items.map((it) => {
                    const active = pathname === it.to;
                    const Icon = it.icon;
                    return (
                      <li key={it.label}>
                        <Link
                          to={it.to}
                          className={`flex items-center gap-2.5 border-l-2 px-4 py-2 text-[13px] transition ${
                            active
                              ? "border-brand bg-[rgba(230,100,31,0.12)] text-white"
                              : "border-transparent text-muted-foreground hover:bg-panel-2 hover:text-foreground"
                          }`}
                        >
                          <Icon size={14} />
                          <span className="flex-1">{it.label}</span>
                          {"badge" in it && it.badge && (
                            <span className="rounded-full bg-brand/20 px-1.5 py-0.5 text-[10px] font-semibold text-brand">{it.badge}</span>
                          )}
                        </Link>
                      </li>
                    );
                  })}
                </ul>
              </div>
            ))}
          </nav>
        </aside>

        {/* Main */}
        <main className="flex-1 p-6">{children}</main>
      </div>

      {/* Footer */}
      <footer className="flex items-center justify-between border-t border-border bg-panel px-5 py-3 text-[11px] text-muted-foreground">
        <span>Orion AgTech © 2025 · Sistema de Gestão v2.4.1</span>
        <span>Última sincronização: hoje às 14:32</span>
      </footer>
    </div>
  );
}

export function Kpi({ label, value, change, tone = "muted" }: { label: string; value: string; change?: string; tone?: "green" | "yellow" | "orange" | "red" | "blue" | "muted" }) {
  const toneClass = {
    green: "text-[#4ADE80]",
    yellow: "text-[#FBBF24]",
    orange: "text-brand",
    red: "text-[#ef4444]",
    blue: "text-[#60A5FA]",
    muted: "text-muted-foreground",
  }[tone];
  return (
    <div className="rounded-[10px] border border-border bg-panel p-4">
      <div className="text-[10px] font-medium uppercase tracking-wider text-muted-foreground">{label}</div>
      <div className="mt-2 text-[22px] font-semibold text-white">{value}</div>
      {change && <div className={`mt-1 text-[11px] ${toneClass}`}>{change}</div>}
    </div>
  );
}

export function Panel({ children, className = "" }: { children: ReactNode; className?: string }) {
  return <div className={`rounded-xl border border-border bg-panel ${className}`}>{children}</div>;
}

export function StatusBadge({ tone, children }: { tone: "green" | "yellow" | "red" | "orange" | "blue" | "gray"; children: ReactNode }) {
  const map = {
    green: { c: "#4ADE80" },
    yellow: { c: "#FBBF24" },
    red: { c: "#ef4444" },
    orange: { c: "#E6641F" },
    blue: { c: "#60A5FA" },
    gray: { c: "#9CA3AF" },
  }[tone];
  return (
    <span
      className="inline-flex items-center rounded-md border px-2 py-0.5 text-[11px] font-medium"
      style={{ backgroundColor: `${map.c}21`, borderColor: `${map.c}66`, color: map.c }}
    >
      {children}
    </span>
  );
}

export function Progress({ value, tone = "green" }: { value: number; tone?: "green" | "yellow" | "red" | "gray" }) {
  const c = { green: "#4ADE80", yellow: "#FBBF24", red: "#ef4444", gray: "#6B7280" }[tone];
  return (
    <div className="flex items-center gap-2">
      <div className="h-[6px] flex-1 overflow-hidden rounded bg-[#2E2E2E]">
        <div className="h-full rounded" style={{ width: `${value}%`, backgroundColor: c }} />
      </div>
      <span className="w-9 text-right text-[11px] text-muted-foreground">{value}%</span>
    </div>
  );
}

export function Input(props: React.InputHTMLAttributes<HTMLInputElement>) {
  return <input {...props} className={`rounded-lg border border-[#333] bg-panel-2 px-3 py-2 text-[13px] text-white placeholder:text-muted-foreground outline-none focus:border-brand ${props.className ?? ""}`} />;
}

export function BrandButton({ children, ...rest }: React.ButtonHTMLAttributes<HTMLButtonElement>) {
  return <button {...rest} className={`rounded-lg bg-brand px-3 py-2 text-[12.5px] font-medium text-brand-foreground hover:opacity-90 ${rest.className ?? ""}`}>{children}</button>;
}

export function PageHeader({ title, subtitle, actions }: { title: string; subtitle?: string; actions?: ReactNode }) {
  return (
    <div className="mb-5 flex items-end justify-between">
      <div>
        <h1 className="text-[18px] font-semibold text-white">{title}</h1>
        {subtitle && <p className="mt-1 text-[12px] text-muted-foreground">{subtitle}</p>}
      </div>
      <div className="flex items-center gap-2">{actions}</div>
    </div>
  );
}

export function Tabs({ items, active, onChange }: { items: string[]; active: string; onChange?: (v: string) => void }) {
  return (
    <div className="flex items-center gap-1 border-b border-border">
      {items.map((it) => {
        const isActive = it === active;
        return (
          <button
            key={it}
            onClick={() => onChange?.(it)}
            className={`-mb-px border-b-2 px-3 py-2 text-[12.5px] ${isActive ? "border-brand text-brand" : "border-transparent text-muted-foreground hover:text-foreground"}`}
          >
            {it}
          </button>
        );
      })}
    </div>
  );
}
