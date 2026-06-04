import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState, type FormEvent } from "react";
import logo from "@/assets/orion-logo.png.asset.json";

export const Route = createFileRoute("/login")({
  component: LoginPage,
});

function LoginPage() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const submit = (e: FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      sessionStorage.setItem("orion_auth", "1");
    } catch {}
    setTimeout(() => navigate({ to: "/insumos" }), 400);
  };

  return (
    <div className="relative flex min-h-screen w-full items-center justify-center overflow-hidden bg-background">
      {/* Lava lamp background */}
      <div className="pointer-events-none absolute inset-0 -z-10">
        <div className="absolute inset-0 bg-[#0a0a0a]" />
        <div className="lava lava-1" />
        <div className="lava lava-2" />
        <div className="lava lava-3" />
        <div className="lava lava-4" />
        <div className="lava lava-5" />
        <div className="absolute inset-0 backdrop-blur-3xl" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_0%,rgba(0,0,0,0.55)_70%,rgba(0,0,0,0.85)_100%)]" />
      </div>

      <div className="relative w-[400px] max-w-[92vw] rounded-2xl border border-border bg-panel/85 p-8 shadow-2xl backdrop-blur-xl">
        <div className="mb-7 flex flex-col items-center">
          <img src={logo.url} alt="Orion" className="h-12 w-auto" />
          <p className="mt-4 text-[12px] uppercase tracking-[0.2em] text-muted-foreground">
            Plataforma AgTech
          </p>
        </div>

        <form onSubmit={submit} className="space-y-4">
          <div>
            <label className="mb-1.5 block text-[11px] font-medium uppercase tracking-wider text-muted-foreground">
              E-mail
            </label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="seu@email.com"
              className="h-10 w-full rounded-md border border-border bg-panel-2 px-3 text-sm text-foreground outline-none transition focus:border-brand"
            />
          </div>
          <div>
            <label className="mb-1.5 block text-[11px] font-medium uppercase tracking-wider text-muted-foreground">
              Senha
            </label>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="h-10 w-full rounded-md border border-border bg-panel-2 px-3 text-sm text-foreground outline-none transition focus:border-brand"
            />
          </div>

          <div className="flex items-center justify-between text-[12px]">
            <label className="flex items-center gap-2 text-muted-foreground">
              <input type="checkbox" className="accent-brand" /> Lembrar de mim
            </label>
            <a href="#" className="text-brand hover:underline">Esqueci a senha</a>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="mt-2 h-10 w-full rounded-md bg-brand text-sm font-semibold text-brand-foreground transition hover:brightness-110 disabled:opacity-60"
          >
            {loading ? "Entrando..." : "Entrar"}
          </button>
        </form>

        <p className="mt-6 text-center text-[11px] text-muted-foreground">
          © {new Date().getFullYear()} Orion AgTech · For Professional Farmers
        </p>
      </div>
    </div>
  );
}
