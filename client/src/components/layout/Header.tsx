import { Bell, Search, Sun, Moon } from "lucide-react";
import { useState, useEffect } from "react";

function useTheme() {
  const [dark, setDark] = useState(() => {
    if (typeof window === "undefined") return false;
    const stored = localStorage.getItem("tecnopano-theme");
    if (stored) return stored === "dark";
    return window.matchMedia("(prefers-color-scheme: dark)").matches;
  });

  useEffect(() => {
    const root = document.documentElement;
    if (dark) {
      root.classList.add("dark");
    } else {
      root.classList.remove("dark");
    }
    localStorage.setItem("tecnopano-theme", dark ? "dark" : "light");
  }, [dark]);

  return { dark, toggle: () => setDark(d => !d) };
}

export function Header() {
  const { dark, toggle } = useTheme();

  return (
    <header className="h-14 border-b border-border bg-card px-6 flex items-center justify-between sticky top-0 z-10">
      <div className="w-96">
        <div className="relative">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <input
            type="search"
            placeholder="Buscar pedidos, clientes ou produtos..."
            className="w-full h-9 pl-9 pr-3 rounded-md bg-muted/40 border-none text-sm focus:outline-none focus:ring-1 focus:ring-ring"
          />
        </div>
      </div>

      <div className="flex items-center gap-3">
        {/* Dark/Light toggle */}
        <button
          onClick={toggle}
          aria-label={dark ? "Modo claro" : "Modo escuro"}
          className="group relative h-9 w-9 rounded-xl flex items-center justify-center transition-all duration-300 hover:scale-105 active:scale-95"
          style={{
            background: dark
              ? "linear-gradient(135deg, #1e293b 0%, #0f172a 100%)"
              : "linear-gradient(135deg, #FDC24E 0%, #F6921E 100%)",
            boxShadow: dark
              ? "0 2px 8px rgba(15,23,42,0.4), inset 0 1px 0 rgba(255,255,255,0.05)"
              : "0 2px 8px rgba(246,146,30,0.3), inset 0 1px 0 rgba(255,255,255,0.3)",
          }}
        >
          <div className="relative w-5 h-5">
            {/* Sun icon */}
            <Sun
              className="absolute inset-0 h-5 w-5 transition-all duration-300"
              style={{
                color: dark ? "#94a3b8" : "#ffffff",
                opacity: dark ? 0 : 1,
                transform: dark ? "rotate(-90deg) scale(0.5)" : "rotate(0) scale(1)",
              }}
              strokeWidth={2.2}
            />
            {/* Moon icon */}
            <Moon
              className="absolute inset-0 h-5 w-5 transition-all duration-300"
              style={{
                color: dark ? "#93BDE4" : "#F6921E",
                opacity: dark ? 1 : 0,
                transform: dark ? "rotate(0) scale(1)" : "rotate(90deg) scale(0.5)",
              }}
              strokeWidth={2.2}
            />
          </div>
        </button>

        {/* Notifications */}
        <button className="relative h-9 w-9 rounded-xl flex items-center justify-center bg-muted/50 hover:bg-muted transition-colors duration-200">
          <Bell className="h-4.5 w-4.5 text-muted-foreground" />
          <span className="absolute top-1.5 right-1.5 h-2 w-2 bg-red-500 rounded-full ring-2 ring-card" />
        </button>

        <div className="h-6 w-px bg-border mx-0.5" />

        {/* User */}
        <div className="flex items-center gap-3">
          <div className="text-right">
            <p className="text-sm font-medium leading-none">Admin</p>
            <p className="text-xs text-muted-foreground">Administrador</p>
          </div>
          <div className="h-9 w-9 rounded-xl bg-[var(--fips-primary)]/10 flex items-center justify-center text-[var(--fips-primary)] font-semibold text-sm font-heading">
            AD
          </div>
        </div>
      </div>
    </header>
  );
}
