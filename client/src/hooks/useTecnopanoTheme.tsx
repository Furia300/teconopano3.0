import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";

function initialDark(): boolean {
  if (typeof window === "undefined") return false;
  try {
    const stored = localStorage.getItem("tecnopano-theme");
    if (stored === "dark" || stored === "light") return stored === "dark";
  } catch {
    /* ignore */
  }
  return window.matchMedia("(prefers-color-scheme: dark)").matches;
}

export type TecnopanoThemeContextValue = {
  dark: boolean;
  setDark: (value: boolean) => void;
  toggle: () => void;
};

const TecnopanoThemeContext = createContext<TecnopanoThemeContextValue | null>(null);

/**
 * Provedor único de tema — Header, Sidebar e resto da app partilham o mesmo estado.
 */
export function TecnopanoThemeProvider({ children }: { children: ReactNode }) {
  const [dark, setDark] = useState(initialDark);

  useEffect(() => {
    document.documentElement.classList.toggle("dark", dark);
    try {
      localStorage.setItem("tecnopano-theme", dark ? "dark" : "light");
    } catch {
      /* ignore */
    }
  }, [dark]);

  useEffect(() => {
    const root = document.documentElement;
    const obs = new MutationObserver(() => {
      const next = root.classList.contains("dark");
      setDark((prev) => (prev !== next ? next : prev));
    });
    obs.observe(root, { attributes: true, attributeFilter: ["class"] });
    const onStorage = (e: StorageEvent) => {
      if (e.key === "tecnopano-theme" && (e.newValue === "dark" || e.newValue === "light")) {
        setDark(e.newValue === "dark");
      }
    };
    window.addEventListener("storage", onStorage);
    return () => {
      obs.disconnect();
      window.removeEventListener("storage", onStorage);
    };
  }, []);

  const toggle = useCallback(() => setDark((d) => !d), []);

  const value = useMemo(
    () => ({ dark, setDark, toggle }),
    [dark, setDark, toggle],
  );

  return <TecnopanoThemeContext.Provider value={value}>{children}</TecnopanoThemeContext.Provider>;
}

export function useTecnopanoTheme(): TecnopanoThemeContextValue {
  const ctx = useContext(TecnopanoThemeContext);
  if (!ctx) {
    throw new Error("useTecnopanoTheme deve ser usado dentro de TecnopanoThemeProvider");
  }
  return ctx;
}
