import { useId, useState, type ReactNode } from "react";
import type { LucideIcon } from "lucide-react";
import { ArrowUp } from "lucide-react";
import { cn } from "@/lib/utils";

/** 12 pontos com spread visível — espelha `DataListingDemo` do DS-FIPS */
export function fipsListingSparkFromSeed(seed: number): number[] {
  let r = seed;
  return Array.from({ length: 12 }, (_, i) => {
    r = (r * 9301 + 49297) % 233280;
    const noise = (r / 233280 - 0.5) * 40;
    const trend = Math.sin(i * 0.7 + seed * 0.08) * 32;
    return Math.max(8, Math.round(55 + noise + trend));
  });
}

const ACCENT = {
  blue: "#004B9B",
  amber: "#F6921E",
  green: "#00C64C",
  teal: "#00904C",
} as const;

export type FipsDataListingKpiAccent = keyof typeof ACCENT;

export interface FipsDataListingKpiCardProps {
  label: string;
  value: ReactNode;
  delta: string;
  icon: LucideIcon;
  accent: FipsDataListingKpiAccent;
  spark?: number[];
  className?: string;
}

const MONTHS = ["Jan", "Fev", "Mar", "Abr", "Mai", "Jun", "Jul", "Ago", "Set", "Out", "Nov", "Dez"];

/**
 * Card KPI do padrão “Data List” FIPS: raio assimétrico, ícone top-right,
 * valor + delta %, sparkline area com hover (como em DataListingDemo).
 */
export function FipsDataListingKpiCard({
  label,
  value,
  delta,
  icon: Icon,
  accent,
  spark: sparkProp,
  className,
}: FipsDataListingKpiCardProps) {
  const uid = useId().replace(/:/g, "");
  const color = ACCENT[accent];
  const spark = sparkProp ?? fipsListingSparkFromSeed(11);
  const [hoverPt, setHoverPt] = useState<number>(-1);

  const max = Math.max(...spark);
  const min = Math.min(...spark);
  const sw = 200;
  const sh = 44;
  const pts = spark.map((v, j) => ({
    x: (j / (spark.length - 1)) * sw,
    y: sh - ((v - min) / (max - min || 1)) * (sh - 10) + 5,
  }));
  const line = pts.map((p) => `${p.x},${p.y}`).join(" ");
  const gradId = `fips-kpi-${accent}-${uid}`;

  return (
    <div
      className={cn(
        "relative overflow-hidden rounded-[10px_10px_10px_18px] border border-[var(--fips-border)] bg-[var(--fips-surface)] shadow-[0_1px_3px_rgba(0,75,155,0.04)]",
        className,
      )}
    >
      <div className="relative px-3.5 pt-3.5 pb-1 sm:px-[18px] sm:pt-4">
        <div
          className="absolute top-3 right-3 flex h-8 w-8 items-center justify-center rounded-[9px] sm:top-3.5 sm:right-3.5 sm:h-9 sm:w-9"
          style={{ background: `${color}0F` }}
          aria-hidden
        >
          <Icon className="h-4 w-4 sm:h-[17px] sm:w-[17px]" style={{ color }} strokeWidth={1.75} />
        </div>
        <span className="mb-1.5 block text-[11px] font-semibold text-[var(--fips-fg-muted)]">{label}</span>
        <div className="flex min-h-[26px] items-baseline gap-2">
          {hoverPt >= 0 ? (
            <>
              <span className="font-heading text-xl font-extrabold leading-none sm:text-2xl" style={{ color }}>
                {spark[hoverPt]}
              </span>
              <span className="text-[10px] font-semibold text-[var(--fips-fg-muted)]">{MONTHS[hoverPt]}</span>
            </>
          ) : (
            <>
              <span className="font-heading text-xl font-extrabold leading-none text-[var(--color-fips-blue-950)] sm:text-2xl dark:text-[var(--fips-fg)]">
                {value}
              </span>
              <span className="inline-flex items-center gap-0.5 font-mono text-[10px] font-bold text-[var(--fips-success)]">
                <ArrowUp className="h-2.5 w-2.5" strokeWidth={2.5} aria-hidden />
                {delta}
              </span>
            </>
          )}
        </div>
      </div>
      <div className="-mx-px -mb-px mt-1.5">
        <svg
          width="100%"
          height={sh + 10}
          viewBox={`-2 -8 ${sw + 4} ${sh + 18}`}
          preserveAspectRatio="none"
          className="block"
          onMouseLeave={() => setHoverPt(-1)}
          aria-hidden
        >
          <defs>
            <linearGradient id={gradId} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={color} stopOpacity="0.25" />
              <stop offset="100%" stopColor={color} stopOpacity="0" />
            </linearGradient>
          </defs>
          <polygon points={`0,${sh} ${line} ${sw},${sh}`} fill={`url(#${gradId})`} />
          <polyline
            points={line}
            fill="none"
            stroke={color}
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          {hoverPt >= 0 ? (
            <line
              x1={pts[hoverPt].x}
              y1={-2}
              x2={pts[hoverPt].x}
              y2={sh + 2}
              stroke={color}
              strokeWidth="0.8"
              strokeDasharray="2 2"
              opacity="0.5"
            />
          ) : null}
          {pts.map((p, j) => (
            <g key={j} style={{ cursor: "pointer" }} onMouseEnter={() => setHoverPt(j)}>
              <rect
                x={p.x - sw / spark.length / 2}
                y={-8}
                width={sw / spark.length}
                height={sh + 18}
                fill="transparent"
              />
              <circle
                cx={p.x}
                cy={p.y}
                r={hoverPt === j ? 3.5 : 0}
                fill={color}
                stroke="var(--fips-surface)"
                strokeWidth="1.5"
              />
            </g>
          ))}
        </svg>
      </div>
    </div>
  );
}
