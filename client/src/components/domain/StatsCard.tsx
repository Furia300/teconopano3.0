import { useState, useEffect } from "react";
import { cn } from "@/lib/utils";
import type { LucideIcon } from "lucide-react";

interface StatsCardProps {
  label: string;
  value: string | number;
  subtitle?: string;
  icon: LucideIcon;
  color?: string;
  /** Cor alternativa para dark mode — se omitida, usa mapeamento automático */
  darkColor?: string;
  bg?: string;
  trend?: { value: number; label: string };
}

/* Mapeamento automático de cores escuras → claras para dark mode */
const DARK_COLOR_MAP: Record<string, string> = {
  "#004B9B": "#93BDE4",
  "#004b9b": "#93BDE4",
  "#002A68": "#7EAED6",
  "#002a68": "#7EAED6",
  "#00C64C": "#8BE5AD",
  "#00c64c": "#8BE5AD",
  "#00904C": "#8BE5AD",
  "#00904c": "#8BE5AD",
  "#DC3545": "#FCA5A5",
  "#dc3545": "#FCA5A5",
  "#9B59B6": "#C4B5FD",
  "#9b59b6": "#C4B5FD",
};

function useDark() {
  const [dark, setDark] = useState(
    () => typeof document !== "undefined" && document.documentElement.classList.contains("dark"),
  );
  useEffect(() => {
    const el = document.documentElement;
    const obs = new MutationObserver(() => setDark(el.classList.contains("dark")));
    obs.observe(el, { attributes: true, attributeFilter: ["class"] });
    return () => obs.disconnect();
  }, []);
  return dark;
}

export function StatsCard({ label, value, subtitle, icon: Icon, color = "var(--fips-primary)", darkColor }: StatsCardProps) {
  const dark = useDark();
  const resolvedColor = dark ? (darkColor || DARK_COLOR_MAP[color] || color) : color;

  return (
    <div
      className="relative flex items-center justify-between overflow-hidden rounded-[10px_10px_10px_18px] border border-[var(--fips-border)] bg-[var(--fips-surface)] px-4 py-3.5 shadow-[0_1px_3px_rgba(0,75,155,0.04)]"
      style={{ borderLeft: `4px solid ${resolvedColor}` }}
    >
      <div className="min-w-0">
        <span className="mb-[3px] block text-[10px] font-semibold uppercase tracking-[0.5px] text-[var(--fips-fg-muted)]">
          {label}
        </span>
        <span
          className="font-heading block text-2xl font-extrabold leading-none"
          style={{ color: resolvedColor }}
        >
          {value}
        </span>
        {subtitle && (
          <span className="mt-[3px] block text-[10px] text-[var(--fips-fg-muted)]">
            {subtitle}
          </span>
        )}
      </div>
      <div
        className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full"
        style={{
          backgroundColor: `color-mix(in srgb, ${resolvedColor} 6%, transparent)`,
          border: `1px solid color-mix(in srgb, ${resolvedColor} 12%, transparent)`,
        }}
      >
        <Icon className="h-[18px] w-[18px]" style={{ color: resolvedColor }} />
      </div>
    </div>
  );
}
