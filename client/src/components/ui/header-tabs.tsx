import * as React from "react";
import * as DropdownMenu from "@radix-ui/react-dropdown-menu";
import { Link, useLocation } from "wouter";
import { ChevronDown } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import type { AppMenuItem } from "@/lib/appMenu";
import { routePathMatches } from "@/lib/routePathMatch";
import {
  fipsUnderlineTabActive,
  fipsUnderlineTabBar,
  fipsUnderlineTabInactive,
  fipsUnderlineTabTriggerBase,
} from "@/lib/fipsTabUnderline";

/**
 * Abas reutilizáveis (tokens em `fipsTabUnderline.ts` — superfície `#EDF2F8` em páginas internas).
 * O header da app usa `HeaderDocSectionNav`: branco + separador `#E2E8F0` + traço laranja animado (FIPS `DocHeaderSectionNav`).
 */

export function HeaderTabBar({
  className,
  children,
  ...props
}: React.ComponentProps<"nav">) {
  return (
    <nav
      role="navigation"
      aria-label="Seções principais"
      className={cn(fipsUnderlineTabBar, className)}
      {...props}
    >
      {children}
    </nav>
  );
}

export function HeaderTabLink({
  href,
  icon: Icon,
  label,
  className,
}: {
  href: string;
  icon: LucideIcon;
  label: string;
  className?: string;
}) {
  const [loc] = useLocation();
  const isActive = routePathMatches(loc, href);

  return (
    <Link
      href={href}
      className={cn(
        fipsUnderlineTabTriggerBase,
        "shrink-0",
        isActive ? fipsUnderlineTabActive : fipsUnderlineTabInactive,
        className,
      )}
    >
      <Icon className="h-5 w-5 shrink-0" strokeWidth={1.85} aria-hidden />
      {label}
    </Link>
  );
}

/** Grupo com subitens da sidebar — mesmo visual de aba; chevron herda cinza / escurece no hover. */
export function HeaderNavDropdown({ item }: { item: AppMenuItem }) {
  const [loc, setLocation] = useLocation();
  const Icon = item.icon as LucideIcon;
  const links = (item.children ?? []).filter((c): c is AppMenuItem & { href: string } => Boolean(c.href));
  const isActive = links.some((c) => routePathMatches(loc, c.href));

  return (
    <DropdownMenu.Root modal={false}>
      <DropdownMenu.Trigger asChild>
        <button
          type="button"
          className={cn(
            fipsUnderlineTabTriggerBase,
            "shrink-0 cursor-pointer bg-transparent",
            isActive ? fipsUnderlineTabActive : fipsUnderlineTabInactive,
          )}
        >
          <Icon className="h-5 w-5 shrink-0" strokeWidth={1.85} aria-hidden />
          {item.label}
          <ChevronDown className="h-3.5 w-3.5 shrink-0 opacity-70" strokeWidth={2.2} aria-hidden />
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
                    "bg-[var(--fips-surface-muted)] font-bold text-[#002A68] dark:bg-white/10 dark:text-[#FDC24E]",
                )}
                onSelect={() => setLocation(ch.href)}
              >
                <ChIcon
                  className={cn(
                    "h-4 w-4 shrink-0",
                    childActive ? "text-[#F6921E] dark:text-[#FDC24E]" : "text-[#94a3b8] dark:text-[#71717A]",
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
  );
}
