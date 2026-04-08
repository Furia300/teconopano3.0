import type { LucideIcon } from "lucide-react";
import { TrendingDown, TrendingUp } from "lucide-react";
import { cn } from "@/lib/utils";

type TrendDir = "up" | "down";

export interface KpiSparklineCardProps {
  label: string;
  value: string | number;
  icon: LucideIcon;
  /** Cor do acento: linha do spark, ícone */
  accent: "emerald" | "sky" | "amber" | "rose";
  trendLabel: string;
  trendDir: TrendDir;
  /** 12 pontos 0–100 para forma da curva (mock controlado) */
  sparkPoints: number[];
  className?: string;
}

const accentMap = {
  emerald: {
    stroke: "#00c64c",
    fill: "rgb(0 198 76 / 0.12)",
    iconBg: "bg-[#00c64c]/12",
    iconFg: "text-[#00904c]",
    trend: "text-[#00904c]",
  },
  sky: {
    stroke: "#0090d0",
    fill: "rgb(0 144 208 / 0.1)",
    iconBg: "bg-[#0090d0]/12",
    iconFg: "text-[#004b9b]",
    trend: "text-[#004b9b]",
  },
  amber: {
    stroke: "#f6921e",
    fill: "rgb(246 146 30 / 0.12)",
    iconBg: "bg-[#f6921e]/12",
    iconFg: "text-[#c2410c]",
    trend: "text-[#b45309]",
  },
  rose: {
    stroke: "#ef4444",
    fill: "rgb(239 68 68 / 0.1)",
    iconBg: "bg-red-500/12",
    iconFg: "text-red-600",
    trend: "text-red-600",
  },
} as const;

/** Gera pontos pseudo-aleatórios estáveis a partir de um número */
export function sparklineFromSeed(seed: number, trend: TrendDir): number[] {
  const pts: number[] = [];
  let v = 40 + (seed % 30);
  for (let i = 0; i < 14; i++) {
    const drift = trend === "up" ? 1.4 : -1.2;
    const noise = Math.sin(seed * 0.31 + i * 0.7) * 8;
    v = Math.min(92, Math.max(8, v + drift + noise * 0.15));
    pts.push(v);
  }
  return pts;
}

function SparklineArea({
  points,
  stroke,
  fill,
}: {
  points: number[];
  stroke: string;
  fill: string;
}) {
  const w = 120;
  const h = 36;
  const pad = 2;
  const innerW = w - pad * 2;
  const innerH = h - pad * 2;
  const n = points.length;
  if (n < 2) return null;

  const lineD = points
    .map((p, i) => {
      const x = pad + (i / (n - 1)) * innerW;
      const y = pad + innerH - (p / 100) * innerH;
      return `${i === 0 ? "M" : "L"} ${x.toFixed(1)} ${y.toFixed(1)}`;
    })
    .join(" ");

  const xLast = pad + innerW;
  const x0 = pad;
  const yBase = h - pad;
  const areaD = `${lineD} L ${xLast.toFixed(1)} ${yBase} L ${x0.toFixed(1)} ${yBase} Z`;

  return (
    <svg
      viewBox={`0 0 ${w} ${h}`}
      className="h-9 w-full min-h-[36px]"
      preserveAspectRatio="none"
      aria-hidden
    >
      <path d={areaD} fill={fill} stroke="none" />
      <path
        d={lineD}
        fill="none"
        stroke={stroke}
        strokeWidth={2}
        strokeLinecap="round"
        strokeLinejoin="round"
        vectorEffect="non-scaling-stroke"
      />
    </svg>
  );
}

export function KpiSparklineCard({
  label,
  value,
  icon: Icon,
  accent,
  trendLabel,
  trendDir,
  sparkPoints,
  className,
}: KpiSparklineCardProps) {
  const a = accentMap[accent];
  const TrendIcon = trendDir === "up" ? TrendingUp : TrendingDown;

  return (
    <div
      className={cn(
        "flex flex-col overflow-hidden rounded-xl border border-[var(--fips-border)] bg-[var(--fips-surface)] shadow-[var(--shadow-card)] transition-shadow duration-200 hover:shadow-[var(--shadow-card-hover)]",
        className
      )}
    >
      <div className="flex items-start justify-between gap-2 px-5 pt-5">
        <div className="flex min-w-0 items-center gap-2.5">
          <div
            className={cn(
              "flex h-9 w-9 shrink-0 items-center justify-center rounded-lg",
              a.iconBg
            )}
          >
            <Icon className={cn("h-4 w-4", a.iconFg)} />
          </div>
          <span className="truncate text-sm font-medium text-[var(--fips-fg-muted)]">
            {label}
          </span>
        </div>
        <div
          className={cn(
            "flex shrink-0 items-center gap-0.5 text-xs font-semibold tabular-nums",
            a.trend
          )}
        >
          <TrendIcon className="h-3.5 w-3.5" />
          {trendLabel}
        </div>
      </div>

      <p className="font-heading px-5 pt-3 text-4xl font-bold tracking-tight tabular-nums text-[var(--fips-fg)] sm:text-[2.65rem] leading-none">
        {value}
      </p>

      <div className="mt-4 px-2 pb-1">
        <SparklineArea points={sparkPoints} stroke={a.stroke} fill={a.fill} />
      </div>
    </div>
  );
}
