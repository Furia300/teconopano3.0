import type { ReactNode } from "react";
import type { LucideIcon } from "lucide-react";
import { PageHero } from "./PageHero";
import { cn } from "@/lib/utils";

export type FipsModulePageHeroProps = {
  title: string;
  description?: string;
  icon?: LucideIcon;
  /** Botões ou controles à direita (ex.: Nova, Sincronizar). */
  actions?: ReactNode;
  /** Selo contextual FIPS (ex.: departamento, status de API). */
  badge?: ReactNode;
  className?: string;
  /** Padrão listagem: sem foto; só gradiente + trilhos leves no `PageHero`. */
  decorationSrc?: string | null;
  showTrainSilhouette?: boolean;
};

const HERO_LISTING_SHELL =
  "rounded-[12px_12px_12px_24px] border border-white/10 shadow-[0_4px_20px_rgba(0,42,104,0.12)]";

/**
 * Cabeçalho de módulo alinhado ao DS-FIPS (Data Listing / HeroHeaderDoc):
 * faixa azul, ícone ouro, título Saira, subtítulo e área de ações.
 */
export function FipsModulePageHero({
  title,
  description,
  icon: Icon,
  actions,
  badge,
  className,
  decorationSrc = "",
  showTrainSilhouette = false,
}: FipsModulePageHeroProps) {
  return (
    <PageHero
      className={cn(HERO_LISTING_SHELL, className)}
      decorationSrc={decorationSrc}
      showTrainSilhouette={showTrainSilhouette}
    >
      <div className="relative flex flex-wrap items-center gap-3 p-[18px] sm:gap-4 sm:p-[22px]">
        {Icon ? (
          <div
            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-[11px] border border-[#FDC24E]/30 bg-[#FDC24E]/18 sm:h-11 sm:w-11"
            aria-hidden
          >
            <Icon className="h-5 w-5 text-[#FDC24E] sm:h-[22px] sm:w-[22px]" strokeWidth={1.75} />
          </div>
        ) : null}
        <div className="min-w-0 flex-1">
          <h2 className="font-heading text-[17px] font-bold tracking-tight text-white sm:text-[21px]">{title}</h2>
          {description ? (
            <p className="mt-1 max-w-3xl text-[11px] leading-snug text-white/65 sm:text-xs">{description}</p>
          ) : null}
        </div>
        {badge || actions ? (
          <div className="flex w-full flex-wrap items-center gap-2 sm:w-auto sm:justify-end">
            {badge}
            {actions}
          </div>
        ) : null}
      </div>
    </PageHero>
  );
}
