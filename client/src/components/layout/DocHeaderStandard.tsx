import type { ReactNode } from "react";
import { Bell, GraduationCap, Menu, PanelLeft } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  docHeaderArtDepth,
  docHeaderArtWash,
  docHeaderBarTabs,
  docHeaderBarTop,
  docHeaderShellBorder,
  docHeaderToolbarIconBtnClass,
} from "@/lib/docHeaderChrome";
import { SHELL_HERO_ART_SRC } from "@/lib/dsTecnopanoShellArt";
import { DocHeaderNeuIconButton } from "./DocHeaderNeuIconButton";
import { DocHeaderPageTrail } from "./DocHeaderPageTrail";
import { HeaderDocSearch } from "./HeaderDocSearch";
import { HeaderDocUserChip } from "./HeaderDocUserChip";

export { DocHeaderNeuIconButton } from "./DocHeaderNeuIconButton";

/** Camada de arte + gradientes (igual `DocLayout` / header da app em modo claro). */
export function DocHeaderHeroBackground({ src = SHELL_HERO_ART_SRC }: { src?: string }) {
  return (
    <div className="pointer-events-none absolute inset-0">
      <img
        src={src}
        alt=""
        className="h-full w-full object-cover object-[center_65%] opacity-[0.20]"
        draggable={false}
      />
      <div className={cn("absolute inset-0", docHeaderArtWash)} />
      <div className={cn("absolute inset-0", docHeaderArtDepth)} />
    </div>
  );
}

export type DocHeaderStandardPreviewProps = {
  groupLabel: string;
  pageTitle: string;
  /** Conteúdo da faixa branca (ex.: `<HeaderDocSectionNav menu={...} />`). */
  sectionNav: ReactNode;
  /** Rodapé abaixo do `<header>`; `undefined` = texto de exemplo; `null` = omitir. */
  footer?: ReactNode | null;
  /** Envolves o `<header>` no cartão arredondado (default true). */
  withCardChrome?: boolean;
  /** Modo escuro — trilho, busca e chip seguem tokens do app. */
  dark?: boolean;
};

const defaultFooter = (
  <div className="px-4 py-3 text-xs text-muted-foreground sm:px-6">Área de conteúdo (exemplo)</div>
);

/**
 * Header padrão FIPS — mesmas classes e peças que o shell de documentação (referência viva / demos).
 */
export function DocHeaderStandardPreview({
  groupLabel,
  pageTitle,
  sectionNav,
  footer,
  withCardChrome = true,
  dark = false,
}: DocHeaderStandardPreviewProps) {
  const resolvedFooter = footer === undefined ? defaultFooter : footer;
  const inner = (
    <header className={cn("relative overflow-hidden", docHeaderShellBorder)}>
      <DocHeaderHeroBackground />
      <div className={cn("relative z-10", docHeaderBarTop)}>
        <div className="flex items-center gap-3 px-4 py-3 sm:px-6">
          <button
            type="button"
            className={cn(docHeaderToolbarIconBtnClass, "lg:hidden")}
            aria-label="Abrir menu (demo)"
            tabIndex={0}
          >
            <Menu className="h-5 w-5" aria-hidden />
          </button>
          <div className="flex min-w-0 flex-1 items-center gap-2">
            <PanelLeft className="hidden h-5 w-5 text-neutral-500 sm:block" aria-hidden />
            <DocHeaderPageTrail groupLabel={groupLabel} pageTitle={pageTitle} dark={dark} />
          </div>
          <div className="hidden w-full max-w-xs md:block">
            <HeaderDocSearch dark={dark} />
          </div>
          <div className="hidden shrink-0 items-center gap-2 sm:flex">
            <DocHeaderNeuIconButton ariaLabel="Notificações" dark={dark}>
              <Bell className="h-[17px] w-[17px]" aria-hidden strokeWidth={1.9} />
            </DocHeaderNeuIconButton>
            <DocHeaderNeuIconButton ariaLabel="Tutorial" dark={dark}>
              <GraduationCap className="h-[17px] w-[17px]" aria-hidden strokeWidth={1.9} />
            </DocHeaderNeuIconButton>
            <HeaderDocUserChip dark={dark} />
          </div>
        </div>
      </div>
      <div className={cn("relative z-10 hidden px-4 sm:px-6 lg:block", docHeaderBarTabs)}>{sectionNav}</div>
    </header>
  );

  if (!withCardChrome) {
    return (
      <>
        {inner}
        {resolvedFooter}
      </>
    );
  }

  return (
    <div className="overflow-hidden rounded-xl border border-border bg-muted/60 shadow-sm">
      {inner}
      {resolvedFooter}
    </div>
  );
}
