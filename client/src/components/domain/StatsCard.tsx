import { cn } from "@/lib/utils";
import type { LucideIcon } from "lucide-react";

interface StatsCardProps {
  label: string;
  value: string | number;
  subtitle?: string;
  icon: LucideIcon;
  /** Hex color (sem #) ou token CSS — controla a barra esquerda, o número e o ícone. Default azul FIPS. */
  color?: string;
  /** @deprecated mantido por compat, não usado no padrão Card Relatório */
  bg?: string;
  /** @deprecated trends pertencem ao Card KPI com sparkline, não ao Card Relatório */
  trend?: { value: number; label: string };
}

/**
 * Card Relatório — alinhado ao FIPS DS canônico (`/docs/components/card`, padrão "03 — Card Relatório"):
 *
 * - container: white, radius 10/10/10/18, shadow leve, **borderLeft 4px na cor do indicador**
 * - label: 10px uppercase letter-spaced, `--fips-fg-muted`
 * - value: **24px Saira Expanded weight 800 na mesma cor da barra**
 * - subtitle: 10px Open Sans, `--fips-fg-muted`
 * - ícone: container circular 40×40, bg `{color}0A`, border `{color}15`, ícone 18px na cor
 *
 * Para visões consolidadas SEM tendência (relatórios, cadastros, métricas estáticas).
 * Quem precisa de trend + sparkline deve usar o Card KPI da família Dashboard.
 */
export function StatsCard({ label, value, subtitle, icon: Icon, color = "var(--fips-primary)" }: StatsCardProps) {
  return (
    <div
      className="relative flex items-center justify-between overflow-hidden rounded-[10px_10px_10px_18px] border border-[var(--fips-border)] bg-[var(--fips-surface)] px-4 py-3.5 shadow-[0_1px_3px_rgba(0,75,155,0.04)]"
      style={{ borderLeft: `4px solid ${color}` }}
    >
      <div className="min-w-0">
        <span className="mb-[3px] block text-[10px] font-semibold uppercase tracking-[0.5px] text-[var(--fips-fg-muted)]">
          {label}
        </span>
        <span
          className="font-heading block text-2xl font-extrabold leading-none"
          style={{ color }}
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
          backgroundColor: `color-mix(in srgb, ${color} 6%, transparent)`,
          border: `1px solid color-mix(in srgb, ${color} 12%, transparent)`,
        }}
      >
        <Icon className="h-[18px] w-[18px]" style={{ color }} />
      </div>
    </div>
  );
}
