import type { ReactNode, SVGAttributes } from 'react'
import { cn } from '@/lib/utils'

/** Arte de trem/fundo usada nos produtos FIPS (public/). */
export const PAGE_HERO_DEFAULT_DECORATION = '/backgrounds/app-shell-home-trains.png'

/**
 * Trilhos decorativos do DS-FIPS (DataListingDemo / Header do painel).
 * `currentColor` herda branco do container para funcionar em fundo navy.
 */
export function FipsJunctionLines({
  className,
  ...props
}: SVGAttributes<SVGSVGElement> & { className?: string }) {
  return (
    <svg
      viewBox="0 0 320 200"
      fill="none"
      className={cn('pointer-events-none text-white', className)}
      aria-hidden
      {...props}
    >
      <path
        d="M0 60H100C120 60 120 60 140 40L200 40H320"
        stroke="currentColor"
        strokeWidth="6"
        strokeLinecap="round"
      />
      <path
        d="M0 60H100C120 60 120 60 140 80L200 80H320"
        stroke="currentColor"
        strokeWidth="6"
        strokeLinecap="round"
      />
      <path
        d="M0 120H60C80 120 80 120 100 100L160 100H320"
        stroke="currentColor"
        strokeWidth="6"
        strokeLinecap="round"
      />
      <path
        d="M0 120H60C80 120 80 120 100 140L160 140H320"
        stroke="currentColor"
        strokeWidth="6"
        strokeLinecap="round"
      />
    </svg>
  )
}

export type PageHeroProps = {
  children: ReactNode
  className?: string
  /**
   * Imagem sutil à direita (trem / infra). Padrão: trilho do DS.
   * Passe string vazia para desativar e usar só o SVG geométrico.
   */
  decorationSrc?: string | null
  /** Silhueta SVG leve (fallback ou reforço). Por padrão fica desligada se houver foto. */
  showTrainSilhouette?: boolean
}

/**
 * Faixa hero padrão dos módulos FIPS: gradiente azul institucional + trem/trilhos sutis à direita.
 * Usar abaixo da topbar em todas as páginas de módulo (ex.: Produção, Governança).
 */
export function PageHero({
  children,
  className,
  decorationSrc = PAGE_HERO_DEFAULT_DECORATION,
  showTrainSilhouette,
}: PageHeroProps) {
  const hasPhoto = Boolean(decorationSrc)
  const showSvg = showTrainSilhouette ?? !hasPhoto

  return (
    <section
      className={cn(
        'relative isolate min-h-[200px] overflow-hidden text-white',
        className,
      )}
    >
      {/*
        Padrão FIPS (DataListingDemo): um único gradiente 135° — sem vinheta escura
        nem segunda camada que “suje” o navy institucional.
      */}
      <div
        className="absolute inset-0 bg-[linear-gradient(135deg,#004B9B_0%,#002A68_58%,#001A4A_100%)]"
        aria-hidden
      />
      <FipsJunctionLines
        className="absolute -top-5 -right-8 h-[200px] w-[min(92vw,360px)] opacity-[0.07] sm:h-[220px] sm:w-[min(80vw,420px)] sm:opacity-[0.085]"
        style={{ maxWidth: 'none' }}
      />

      {hasPhoto ? (
        <div
          className="pointer-events-none absolute inset-y-0 right-0 w-[min(65vw,580px)] opacity-[0.22] mix-blend-soft-light sm:opacity-[0.28]"
          aria-hidden
        >
          <img
            src={decorationSrc!}
            alt=""
            className="h-full w-full object-cover object-right"
            decoding="async"
          />
        </div>
      ) : null}

      {showSvg ? (
        <div
          className="pointer-events-none absolute -right-4 bottom-0 top-8 w-[min(70vw,640px)] opacity-[0.1] sm:opacity-[0.12]"
          aria-hidden
        >
          <img
            src="/brand/hero-train-silhouette.svg"
            alt=""
            className="h-full w-full object-contain object-right-bottom"
            decoding="async"
          />
        </div>
      ) : null}

      <div className="relative z-10">{children}</div>
    </section>
  )
}
