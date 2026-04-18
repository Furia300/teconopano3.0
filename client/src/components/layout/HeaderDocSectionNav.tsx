import { useCallback, useLayoutEffect, useRef, useState } from "react";
import type { LucideIcon } from "lucide-react";
import { ChevronDown } from "lucide-react";
import * as DropdownMenu from "@radix-ui/react-dropdown-menu";
import { Link, useLocation } from "wouter";
import { cn } from "@/lib/utils";
import type { AppMenuItem } from "@/lib/appMenu";
import {
  docHeaderNeuAccentBgHover,
  docHeaderNeuAccentBorderHover,
  docHeaderNeuShimmerOnRed,
  docHeaderTabsNavSeparatorClass,
  docHeaderTabsUnderlineMd,
} from "@/lib/docHeaderChrome";
import { routePathMatches } from "@/lib/routePathMatch";

const U = docHeaderTabsUnderlineMd;

type NavEntry =
  | { kind: "link"; id: string; label: string; href: string; matchHrefs: string[]; icon: LucideIcon }
  | { kind: "dropdown"; id: string; item: AppMenuItem };

function buildNavEntries(menu: AppMenuItem[]): NavEntry[] {
  const out: NavEntry[] = [];
  for (const m of menu) {
    if (m.children?.length) {
      out.push({ kind: "dropdown", id: m.label, item: m });
    } else if (m.href) {
      const matchHrefs = m.navMatchHrefs?.length ? m.navMatchHrefs : [m.href];
      out.push({
        kind: "link",
        id: m.href,
        label: m.href === "/" ? "Início" : m.label,
        href: m.href,
        matchHrefs,
        icon: m.icon as LucideIcon,
      });
    }
  }
  return out;
}

function entryActive(entry: NavEntry, loc: string): boolean {
  if (entry.kind === "link") {
    return entry.matchHrefs.some((h) => routePathMatches(loc, h));
  }
  const links = (entry.item.children ?? []).filter((c): c is AppMenuItem & { href: string } => Boolean(c.href));
  return links.some((c) => routePathMatches(loc, c.href));
}

/** Faixa de tabs: ativo = vermelho Tecnopano + shimmer (igual sidebar); traço inferior `accentHex`. */
function tabTriggerClass(active: boolean, dark: boolean) {
  return cn(
    "inline-flex shrink-0 items-center font-sans whitespace-nowrap transition-all duration-200 focus-visible:outline-none focus-visible:ring-2",
    dark
      ? cn(
          active
            ? "font-semibold text-[#E2E2E8] focus-visible:ring-[#FF073A]/40"
            : "font-normal text-[#A1A1AA] hover:bg-white/[0.06] hover:text-[#D4D4D8] focus-visible:ring-[#FF073A]/30",
          "focus-visible:ring-offset-2 focus-visible:ring-offset-[#1A1A1A]",
        )
      : cn(
          active
            ? "font-semibold text-[#002A68] focus-visible:ring-[#FF073A]/35"
            : "font-normal text-[#4A5568] hover:bg-[#002a68]/[0.06] hover:text-[#1A202C] focus-visible:ring-[#FF073A]/28",
          "focus-visible:ring-offset-2 focus-visible:ring-offset-transparent",
        ),
  );
}

function iconClassInactive(dark: boolean) {
  return cn(
    "shrink-0 transition-colors duration-200",
    dark ? "text-[#A1A1AA]" : "text-[#4A5568]",
  );
}

/** Ícone ativo: azulejo vermelho + sweep `shimmerSweep` (mesma linguagem da `Sidebar`). */
function SectionTabIcon({
  icon: Icon,
  active,
  dark,
  sizePx,
}: {
  icon: LucideIcon;
  active: boolean;
  dark: boolean;
  sizePx: number;
}) {
  if (!active) {
    return (
      <Icon
        className={iconClassInactive(dark)}
        style={{ width: sizePx, height: sizePx }}
        strokeWidth={1.5}
        aria-hidden
      />
    );
  }
  const pad = 4;
  const box = sizePx + pad * 2;
  return (
    <span
      className="relative inline-flex shrink-0 items-center justify-center overflow-hidden rounded-md"
      style={{
        width: box,
        height: box,
        border: `1px solid ${docHeaderNeuAccentBorderHover}`,
        boxShadow: "0 2px 8px -2px rgba(255,7,58,0.45)",
      }}
    >
      <span className="absolute inset-0 rounded-[5px]" style={{ background: docHeaderNeuAccentBgHover }} aria-hidden />
      <span
        className="pointer-events-none absolute inset-0 rounded-[5px]"
        style={{
          background: docHeaderNeuShimmerOnRed,
          animation: "shimmerSweep 0.55s ease forwards",
        }}
        aria-hidden
      />
      <Icon
        className="relative z-[1] shrink-0 text-white"
        style={{ width: sizePx, height: sizePx }}
        strokeWidth={1.5}
        aria-hidden
      />
    </span>
  );
}

function useSectionTabUnderline(activeIndex: number, remeasureKey?: unknown) {
  const navRef = useRef<HTMLElement>(null);
  const tabRefs = useRef<(HTMLDivElement | null)[]>([]);
  const [line, setLine] = useState({ left: 0, width: 0 });

  const update = useCallback(() => {
    const nav = navRef.current;
    if (activeIndex < 0 || !nav) {
      setLine({ left: 0, width: 0 });
      return;
    }
    const el = tabRefs.current[activeIndex];
    if (!el) {
      setLine({ left: 0, width: 0 });
      return;
    }
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

export function HeaderDocSectionNav({
  menu,
  dark = false,
  /** `full` = separador FIPS `border-b-2`; `subtle` = linha fina (faixa de pais quando há filhos abaixo); `none` = sem borda inferior */
  bottomBorder = "full",
  ariaLabel = "Seções principais",
}: {
  menu: AppMenuItem[];
  dark?: boolean;
  bottomBorder?: "full" | "subtle" | "none";
  ariaLabel?: string;
}) {
  const [loc, setLocation] = useLocation();
  const entries = buildNavEntries(menu);
  const activeTabIndex = entries.findIndex((e) => entryActive(e, loc));
  const underlineIndex = activeTabIndex >= 0 ? activeTabIndex : -1;
  const { navRef, tabRefs, line } = useSectionTabUnderline(underlineIndex, `${loc}-${entries.length}`);

  const navSkin = dark
    ? cn(
        "bg-[rgba(255,255,255,0.08)] backdrop-blur-[8px] [-webkit-backdrop-filter:blur(8px)]",
        bottomBorder === "none"
          ? ""
          : bottomBorder === "subtle"
            ? "border-b border-white/10"
            : "border-b-2 border-white/10",
      )
    : cn(
        "bg-transparent",
        bottomBorder === "none"
          ? ""
          : bottomBorder === "subtle"
            ? "border-b border-[#E2E8F0]"
            : docHeaderTabsNavSeparatorClass,
      );

  return (
    <nav
      ref={navRef}
      className={cn(
        "no-scrollbar relative flex w-full min-w-0 items-stretch gap-0 overflow-x-auto",
        navSkin,
      )}
      aria-label={ariaLabel}
    >
      {entries.map((entry, i) => {
        const active = entryActive(entry, loc);

        if (entry.kind === "link") {
          const Icon = entry.icon;
          return (
            <div
              key={entry.id}
              ref={(el) => {
                tabRefs.current[i] = el;
              }}
              className="inline-flex shrink-0"
            >
              <Link
                href={entry.href}
                className={cn(tabTriggerClass(active, dark), "no-underline")}
                style={{
                  fontSize: U.fontSizePx,
                  padding: `${U.paddingYPx}px ${U.paddingXPx}px`,
                  gap: U.iconGapPx,
                }}
              >
                <SectionTabIcon icon={Icon} active={active} dark={dark} sizePx={U.iconSizePx} />
                {entry.label}
              </Link>
            </div>
          );
        }

        const item = entry.item;
        const Icon = item.icon as LucideIcon;
        const links = (item.children ?? []).filter((c): c is AppMenuItem & { href: string } => Boolean(c.href));

        return (
          <div
            key={entry.id}
            ref={(el) => {
              tabRefs.current[i] = el;
            }}
            className="inline-flex shrink-0"
          >
            <DropdownMenu.Root modal={false}>
              <DropdownMenu.Trigger asChild>
                <button
                  type="button"
                  className={cn(tabTriggerClass(active, dark), "cursor-pointer bg-transparent")}
                  style={{
                    fontSize: U.fontSizePx,
                    padding: `${U.paddingYPx}px ${U.paddingXPx}px`,
                    gap: U.iconGapPx,
                  }}
                >
                  <SectionTabIcon icon={Icon} active={active} dark={dark} sizePx={U.iconSizePx} />
                  {item.label}
                  <ChevronDown
                    className={cn(
                      "h-3.5 w-3.5 shrink-0 opacity-80",
                      dark ? "text-[#A1A1AA]" : "text-[#7B8C96]",
                    )}
                    strokeWidth={1.5}
                    aria-hidden
                  />
                </button>
              </DropdownMenu.Trigger>
              <DropdownMenu.Portal>
                <DropdownMenu.Content
                  className="z-[60] min-w-[220px] overflow-hidden rounded-lg border border-[var(--fips-border)] bg-[var(--fips-surface)] py-1 shadow-lg dark:border-white/10 dark:bg-[#2a2a2e]"
                  sideOffset={6}
                  align="start"
                >
                  {links.map((ch) => {
                    const ChIcon = ch.icon as LucideIcon;
                    const childActive = routePathMatches(loc, ch.href);
                    return (
                      <DropdownMenu.Item
                        key={ch.href}
                        className={cn(
                          "flex cursor-pointer items-center gap-2 px-3 py-2.5 text-sm outline-none select-none",
                          "text-[#333B41] data-[highlighted]:bg-[var(--fips-surface-muted)]",
                          "dark:text-[#E2E2E8] dark:data-[highlighted]:bg-white/[0.08]",
                          childActive &&
                            "bg-[var(--fips-surface-muted)] font-bold text-[#B20028] dark:bg-white/10 dark:text-[#FF073A]",
                        )}
                        onSelect={() => setLocation(ch.href)}
                      >
                        <ChIcon
                          className={cn(
                            "h-4 w-4 shrink-0",
                            childActive ? "text-[#FF073A] dark:text-[#FF073A]" : "text-[#94a3b8] dark:text-[#71717A]",
                          )}
                          strokeWidth={2}
                          aria-hidden
                        />
                        {ch.label}
                      </DropdownMenu.Item>
                    );
                  })}
                </DropdownMenu.Content>
              </DropdownMenu.Portal>
            </DropdownMenu.Root>
          </div>
        );
      })}
      <span
        className={cn(
          "pointer-events-none absolute -bottom-0.5 h-[3px] rounded-t-[3px] bg-[#FF073A]",
          underlineIndex < 0 && "opacity-0",
        )}
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
