/**
 * Réplica dos 2 blocos do header da documentação FIPS (uma única versão, sem duplicados).
 *
 * BLOCO 1 — faixa #f5f5f5: arte + toolbar (trilho, busca, ícones neumórficos, chip).
 * BLOCO 2 — faixa branca: abas com underline laranja animado (#F6921E).
 *
 * Este projeto usa `wouter` + `@/lib/utils` (`cn`). CSS: `no-scrollbar` e `@keyframes docsSidebarNeuShimmer` em `globals.css`.
 */
import { useCallback, useLayoutEffect, useRef, useState } from "react";
import type { LucideIcon } from "lucide-react";
import { Bell, ChevronDown, GraduationCap, Menu, PanelLeft, Search } from "lucide-react";
import { Link } from "wouter";
import { cn } from "@/lib/utils";
import { SHELL_HERO_ART_SRC } from "@/lib/dsTecnopanoShellArt";
import {
  docHeaderArtDepth,
  docHeaderArtWash,
  docHeaderBarTabs,
  docHeaderBarTop,
  docHeaderShellBorder,
  docHeaderTabsNavSeparatorClass,
  docHeaderTabsSurface,
  docHeaderTabsUnderlineMd,
} from "@/lib/docHeaderChrome";

export {
  docHeaderArtDepth,
  docHeaderArtWash,
  docHeaderBarSurface,
  docHeaderBarTabs,
  docHeaderBarTop,
  docHeaderShellBorder,
  docHeaderTabsNavSeparatorClass,
  docHeaderTabsSurface,
  docHeaderTabsUnderlineMd,
} from "@/lib/docHeaderChrome";

import { DocHeaderNeuIconButton } from "@/components/layout/DocHeaderNeuIconButton";

export { DocHeaderNeuIconButton as ReplicaHeaderNeuIconBtn } from "@/components/layout/DocHeaderNeuIconButton";

const U = docHeaderTabsUnderlineMd;

/** Arte em `client/public/` — padrão DS Tecnopano */
export const HERO_ART_SRC = SHELL_HERO_ART_SRC;

export function ReplicaDocHeaderPageTrail({ groupLabel, pageTitle }: { groupLabel: string; pageTitle: string }) {
  return (
    <nav aria-label="Trilho da documentação" className="min-w-0">
      <ol className="m-0 flex min-w-0 list-none items-baseline gap-2 p-0 sm:gap-2.5">
        <li className="min-w-0 max-w-[min(11rem,42vw)] shrink truncate font-sans text-[13px] font-medium leading-snug text-neutral-600 sm:max-w-[13rem] sm:text-sm">
          {groupLabel}
        </li>
        <li
          aria-hidden
          className="shrink-0 select-none font-sans text-[13px] font-light leading-none text-neutral-300 sm:text-sm"
        >
          /
        </li>
        <li className="min-w-0 flex-1 truncate font-heading text-base font-semibold leading-snug tracking-tight text-[#171717] sm:text-lg">
          {pageTitle}
        </li>
      </ol>
    </nav>
  );
}

const iconHeaderBtnClass =
  "inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-[10px] border border-black/[0.12] bg-white/90 text-neutral-800 shadow-sm backdrop-blur-sm transition-colors hover:bg-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#2563EB]/25 sm:inline-flex [&_svg]:h-[17px] [&_svg]:w-[17px]";

export function ReplicaSearchPillDocHeader({ "aria-label": ariaLabel }: { "aria-label"?: string }) {
  return (
    <div
      role="search"
      aria-label={ariaLabel ?? "Buscar"}
      className={cn(
        "hidden items-center rounded-lg border border-black/[0.12] bg-white text-neutral-700 shadow-[0_1px_2px_rgba(0,0,0,0.04)] backdrop-blur-sm md:flex",
        "h-[35px] w-full max-w-xs gap-2 px-3",
      )}
    >
      <Search className="h-4 w-4 shrink-0 text-neutral-500" aria-hidden />
      <span className="min-w-0 truncate font-sans text-[13px] leading-normal">Buscar na documentação…</span>
    </div>
  );
}

export function ReplicaUserChipDocHeader() {
  return (
    <div
      className={cn(
        "flex h-[35px] items-center gap-2 rounded-full border px-2.5",
        "border-black/[0.12] bg-white text-neutral-800 shadow-sm backdrop-blur-sm",
      )}
      aria-label="Conta do usuário (demonstração)"
    >
      <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-white text-[12px] font-semibold text-[#002A68]">
        AF
      </span>
      <span className="truncate font-sans text-[13px] leading-none text-neutral-800">Usuário</span>
      <ChevronDown className="h-3.5 w-3.5 shrink-0 text-neutral-500" aria-hidden />
    </div>
  );
}

export type ReplicaDocHeaderSectionTab = {
  id: string;
  label: string;
  to: string;
  /** Só relevante para rotas hierárquicas; aqui o estado ativo vem de `currentGroupId`. */
  end: boolean;
  icon: LucideIcon;
};

function tabLinkClass(active: boolean) {
  return cn(
    "inline-flex shrink-0 items-center font-sans whitespace-nowrap transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#002a68]/25 focus-visible:ring-offset-2 focus-visible:ring-offset-white",
    active
      ? "font-semibold text-[#002A68]"
      : "font-normal text-[#7B8C96] hover:bg-[#002a68]/[0.04] hover:text-[#333B41]",
  );
}

function useSectionTabUnderline(activeIndex: number, remeasureKey?: unknown) {
  const navRef = useRef<HTMLElement | null>(null);
  const tabRefs = useRef<(HTMLDivElement | null)[]>([]);
  const [line, setLine] = useState({ left: 0, width: 0 });

  const update = useCallback(() => {
    const nav = navRef.current;
    const el = tabRefs.current[activeIndex];
    if (!nav || !el) return;
    const navRect = nav.getBoundingClientRect();
    const elRect = el.getBoundingClientRect();
    setLine({
      left: elRect.left - navRect.left + nav.scrollLeft,
      width: elRect.width,
    });
  }, [activeIndex]);

  useLayoutEffect(() => {
    update();
    const nav = navRef.current;
    window.addEventListener("resize", update);
    nav?.addEventListener("scroll", update, { passive: true });
    return () => {
      window.removeEventListener("resize", update);
      nav?.removeEventListener("scroll", update);
    };
  }, [update, remeasureKey]);

  return { navRef, tabRefs, line };
}

export function ReplicaDocHeaderSectionNav({
  tabs,
  currentGroupId,
  remeasureKey,
}: {
  tabs: ReplicaDocHeaderSectionTab[];
  currentGroupId: string;
  remeasureKey?: unknown;
}) {
  const activeIndex = Math.max(
    0,
    tabs.findIndex((t) => t.id === currentGroupId),
  );
  const { navRef, tabRefs, line } = useSectionTabUnderline(activeIndex, remeasureKey);

  return (
    <nav
      ref={navRef}
      className={cn(
        docHeaderTabsSurface,
        "no-scrollbar relative flex w-full min-w-0 items-stretch gap-0 overflow-x-auto",
        docHeaderTabsNavSeparatorClass,
      )}
      aria-label="Seções principais"
    >
      {tabs.map((tab, i) => {
        const active = tab.id === currentGroupId;
        const Icon = tab.icon;
        return (
          <div
            key={tab.id}
            ref={(el) => {
              tabRefs.current[i] = el;
            }}
            className="inline-flex shrink-0"
          >
            <Link
              href={tab.to}
              className={cn(tabLinkClass(active), "no-underline")}
              aria-current={active ? "page" : undefined}
              style={{
                fontSize: U.fontSizePx,
                padding: `${U.paddingYPx}px ${U.paddingXPx}px`,
                gap: U.iconGapPx,
              }}
            >
              <Icon
                className={cn(
                  "shrink-0 transition-colors duration-200",
                  active ? "text-[#F6921E]" : "text-[#7B8C96]",
                )}
                style={{ width: U.iconSizePx, height: U.iconSizePx }}
                strokeWidth={1.5}
                aria-hidden
              />
              {tab.label}
            </Link>
          </div>
        );
      })}
      <span
        className="pointer-events-none absolute -bottom-0.5 h-[3px] rounded-t-[3px] bg-[#F6921E]"
        style={{
          left: line.left,
          width: line.width,
          transition: U.indicatorTransition,
        }}
        aria-hidden
      />
    </nav>
  );
}

export type ReplicaDocHeaderBlock1Props = {
  heroArtSrc?: string;
  groupLabel: string;
  pageTitle: string;
  showMobileMenuButton?: boolean;
  onOpenMobileMenu?: () => void;
  showSidebarToggle?: boolean;
  sidebarCollapsed?: boolean;
  isLargeScreen?: boolean;
  mobileMenuOpen?: boolean;
  onSidebarToggle?: () => void;
};

export function ReplicaDocHeaderBlock1BlueToolbar({
  heroArtSrc = HERO_ART_SRC,
  groupLabel,
  pageTitle,
  showMobileMenuButton = true,
  onOpenMobileMenu,
  showSidebarToggle = false,
  sidebarCollapsed = false,
  isLargeScreen = true,
  mobileMenuOpen = false,
  onSidebarToggle,
}: ReplicaDocHeaderBlock1Props) {
  return (
    <>
      <div className="pointer-events-none absolute inset-0">
        <img
          src={heroArtSrc}
          alt=""
          className="h-full w-full object-cover object-[center_65%] opacity-[0.20]"
          draggable={false}
        />
        <div className={cn("absolute inset-0", docHeaderArtWash)} />
        <div className={cn("absolute inset-0", docHeaderArtDepth)} />
      </div>

      <div className={cn("relative z-10", docHeaderBarTop)}>
        <div className="flex items-center gap-3 px-4 py-3 sm:px-6">
          {showMobileMenuButton ? (
            <button
              type="button"
              className={cn(iconHeaderBtnClass, "lg:hidden")}
              onClick={() => onOpenMobileMenu?.()}
              aria-label="Abrir menu"
            >
              <Menu className="h-5 w-5" />
            </button>
          ) : null}

          <div className="flex min-w-0 flex-1 items-center gap-2">
            {showSidebarToggle ? (
              <button
                type="button"
                className={cn(iconHeaderBtnClass, "hidden sm:inline-flex")}
                aria-expanded={isLargeScreen ? !sidebarCollapsed : mobileMenuOpen}
                aria-label={
                  isLargeScreen
                    ? sidebarCollapsed
                      ? "Expandir painel lateral"
                      : "Recolher painel lateral"
                    : mobileMenuOpen
                      ? "Fechar menu"
                      : "Abrir menu"
                }
                onClick={() => onSidebarToggle?.()}
              >
                <PanelLeft
                  className={cn(
                    "h-5 w-5 text-neutral-800 transition-transform duration-200",
                    isLargeScreen && sidebarCollapsed && "rotate-180",
                  )}
                  aria-hidden
                />
              </button>
            ) : null}
            <ReplicaDocHeaderPageTrail groupLabel={groupLabel} pageTitle={pageTitle} />
          </div>

          <div className="hidden w-full max-w-xs md:block">
            <ReplicaSearchPillDocHeader aria-label="Buscar na documentação" />
          </div>

          <div className="hidden shrink-0 items-center gap-2 sm:flex">
            <DocHeaderNeuIconButton ariaLabel="Notificações">
              <Bell className="h-[17px] w-[17px]" aria-hidden strokeWidth={1.9} />
            </DocHeaderNeuIconButton>
            <DocHeaderNeuIconButton ariaLabel="Tutorial">
              <GraduationCap className="h-[17px] w-[17px]" aria-hidden strokeWidth={1.9} />
            </DocHeaderNeuIconButton>
            <ReplicaUserChipDocHeader />
          </div>
        </div>
      </div>
    </>
  );
}

export type ReplicaDocHeaderBlock2Props = {
  tabs: ReplicaDocHeaderSectionTab[];
  currentGroupId: string;
  remeasureKey?: unknown;
};

export function ReplicaDocHeaderBlock2WhiteTabs({ tabs, currentGroupId, remeasureKey }: ReplicaDocHeaderBlock2Props) {
  return (
    <div className={cn("relative z-10 hidden px-4 sm:px-6 lg:block", docHeaderBarTabs)}>
      <ReplicaDocHeaderSectionNav tabs={tabs} currentGroupId={currentGroupId} remeasureKey={remeasureKey} />
    </div>
  );
}

export function ReplicaDocHeaderComplete(props: ReplicaDocHeaderBlock1Props & ReplicaDocHeaderBlock2Props) {
  const { tabs, currentGroupId, remeasureKey, ...block1 } = props;
  return (
    <header className={cn("sticky top-0 z-20 overflow-hidden", docHeaderShellBorder)}>
      <ReplicaDocHeaderBlock1BlueToolbar {...block1} />
      <ReplicaDocHeaderBlock2WhiteTabs tabs={tabs} currentGroupId={currentGroupId} remeasureKey={remeasureKey} />
    </header>
  );
}
