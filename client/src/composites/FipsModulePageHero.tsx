import { type ReactNode, useState, useEffect } from "react";
import type { LucideIcon } from "lucide-react";
import { PageHero } from "./PageHero";
import { cn } from "@/lib/utils";

function useDark() {
  const [dark, setDark] = useState(() => typeof document !== "undefined" && document.documentElement.classList.contains("dark"));
  useEffect(() => {
    const el = document.documentElement;
    const obs = new MutationObserver(() => setDark(el.classList.contains("dark")));
    obs.observe(el, { attributes: true, attributeFilter: ["class"] });
    return () => obs.disconnect();
  }, []);
  return dark;
}

export type HeroStat = {
  label: string;
  value: number | string;
  color: string;
};

export type FipsModulePageHeroProps = {
  title: string;
  description?: string;
  icon?: LucideIcon;
  /** Botoes ou controles a direita (ex.: Nova, Sincronizar). */
  actions?: ReactNode;
  /** Selo contextual (ex.: departamento, status de API). */
  badge?: ReactNode;
  /** Stats pills inline abaixo do subtitulo (replica do RH hero). */
  stats?: HeroStat[];
  className?: string;
  /** Mantido por compatibilidade, ignorado. */
  decorationSrc?: string | null;
  showTrainSilhouette?: boolean;
};

/**
 * Cabecalho de modulo — replica exata do RH hero.
 * Icon tile neumorphic, titulo, subtitulo, stats pills, area de acoes.
 */
export function FipsModulePageHero({
  title,
  description,
  icon: Icon,
  actions,
  badge,
  stats,
  className,
}: FipsModulePageHeroProps) {
  const dark = useDark();
  return (
    <PageHero className={className}>
      <div className="relative flex flex-col gap-4 px-6 py-5 sm:flex-row sm:items-center sm:justify-between sm:px-7 sm:py-6">
        {/* Left — icon + text + stats */}
        <div className="flex items-start gap-4">
          {Icon ? (
            <span
              className="relative hidden shrink-0 items-center justify-center overflow-hidden rounded-md sm:inline-flex"
              style={{
                width: 32, height: 32,
                border: "1px solid rgba(255,7,58,0.4)",
                boxShadow: "0 2px 8px -2px rgba(255,7,58,0.45)",
              }}
            >
              <span className="absolute inset-0 rounded-[5px]" style={{ background: "linear-gradient(135deg,#FF073A,#B20028)" }} aria-hidden />
              <span
                className="pointer-events-none absolute inset-0 rounded-[5px]"
                style={{
                  background: "linear-gradient(135deg,transparent,rgba(255,255,255,0.38) 50%,transparent)",
                  animation: "shimmerSweep 0.55s ease forwards",
                }}
                aria-hidden
              />
              <Icon
                className="relative z-[1] shrink-0 text-white"
                style={{ width: 18, height: 18 }}
                strokeWidth={1.5}
                aria-hidden
              />
            </span>
          ) : null}

          <div className="min-w-0">
            <h2
              className="font-heading text-xl font-bold tracking-tight text-white sm:text-[22px]"
              style={{ lineHeight: 1.2 }}
            >
              {title}
            </h2>
            {description ? (
              <p className="mt-0.5 text-xs text-white/45 sm:text-[13px]">{description}</p>
            ) : null}

            {/* Stats pills inline — igual RH hero */}
            {stats && stats.length > 0 ? (
              <div className="mt-3 flex flex-wrap gap-1.5">
                {stats.map((s) => (
                  <div key={s.label} className="page-hero-stat">
                    <span
                      className="h-1.5 w-1.5 rounded-full"
                      style={{ background: s.color }}
                    />
                    <span className="text-[9px] font-semibold uppercase tracking-wider text-white/45">
                      {s.label}
                    </span>
                    <span
                      className="font-heading text-xs font-extrabold"
                      style={{ color: s.color }}
                    >
                      {s.value}
                    </span>
                  </div>
                ))}
              </div>
            ) : null}
          </div>
        </div>

        {/* Right — actions + badge */}
        {badge || actions ? (
          <div className="flex flex-shrink-0 flex-wrap items-center gap-2">
            {badge}
            {actions}
          </div>
        ) : null}
      </div>
    </PageHero>
  );
}
