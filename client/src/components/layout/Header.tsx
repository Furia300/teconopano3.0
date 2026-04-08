import { Search, SunMoon } from "lucide-react";
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
    <header className="h-14 border-b border-border bg-card dark:bg-[#1A1A1A] dark:border-[#2E2E2E] px-6 flex items-center justify-between sticky top-0 z-10">
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
          aria-label={dark ? "Trocar para modo claro" : "Trocar para modo escuro"}
          className="group relative h-9 w-9 rounded-xl flex items-center justify-center transition-all duration-200 hover:scale-[1.04] active:scale-[0.98]"
          style={{
            background: dark ? "#27272a" : "#f4f4f5",
            border: `1px solid ${dark ? "#3f3f46" : "#e4e4e7"}`,
            boxShadow: dark
              ? "4px 4px 8px #0a0a0a, -4px -4px 8px #2a2a2a"
              : "0 2px 8px rgba(15,23,42,0.10), inset 0 1px 0 rgba(255,255,255,0.7)",
          }}
        >
          <SunMoon
            className="h-4.5 w-4.5"
            style={{ color: "#a1a1aa" }}
            strokeWidth={2.1}
          />
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
