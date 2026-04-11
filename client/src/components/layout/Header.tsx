import { Bell, GraduationCap, PanelLeft, SunMoon } from "lucide-react";
import { useLocation } from "wouter";
import { cn } from "@/lib/utils";
import { useTecnopanoTheme } from "@/hooks/useTecnopanoTheme";
import { useAppAuthMe } from "@/hooks/useAppUserPerfil";
import { useSidebarCollapse } from "@/hooks/useSidebarCollapse";
import { DocHeaderHeroBackground, DocHeaderNeuIconButton } from "@/components/layout/DocHeaderStandard";
import { DocHeaderPageTrail } from "@/components/layout/DocHeaderPageTrail";
import { HeaderDocSearch } from "@/components/layout/HeaderDocSearch";
import { HeaderDocUserChip } from "@/components/layout/HeaderDocUserChip";
import { HeaderDocSectionNav } from "@/components/layout/HeaderDocSectionNav";
import {
  APP_MENU,
  filterMenuByPerfil,
  getActiveMenuGroup,
  headerChildNavItems,
  headerParentNavItems,
} from "@/lib/appMenu";
import { docTrailForPath } from "@/lib/docHeaderTrail";
import { docHeaderShellBorder } from "@/lib/docHeaderChrome";

/**
 * Header alinhado ao shell: arte hero (claro) + faixa `bg-muted/30` / escuro `#1A1A1A` como `main`, trilho, busca, ícones, chip.
 * Faixa branca lg+: só o menu **pai** (áreas) fora de um grupo com subrotas; dentro de um grupo (ex. Produção, RH), **só** as subseções.
 */
export function Header() {
  const { dark, toggle } = useTecnopanoTheme();
  const { collapsed, setCollapsed } = useSidebarCollapse();
  const [location] = useLocation();
  const { perfil, nome } = useAppAuthMe();
  const filteredMenu = filterMenuByPerfil(APP_MENU, perfil);
  const parentNav = headerParentNavItems(filteredMenu);
  const activeGroup = getActiveMenuGroup(location, filteredMenu);
  const childNav = activeGroup ? headerChildNavItems(activeGroup, perfil) : [];
  const showChildNavRow = childNav.length > 0;
  const { groupLabel, pageTitle } = docTrailForPath(location, filteredMenu);

  const userInitials = (() => {
    const parts = nome.trim().split(/\s+/).filter(Boolean);
    if (parts.length >= 2) return `${parts[0][0] ?? ""}${parts[parts.length - 1][0] ?? ""}`.toUpperCase();
    return (parts[0] ?? "U").slice(0, 2).toUpperCase();
  })();

  const perfilLegivel = perfil
    .split("_")
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(" ");

  return (
    <header
      className={cn(
        "sticky top-0 z-40 isolate overflow-hidden",
        docHeaderShellBorder,
        !dark && "shadow-[0_1px_0_rgba(0,0,0,0.06)]",
        dark && "shadow-[0_1px_0_rgba(0,0,0,0.35)]",
      )}
    >
      {!dark ? (
        <DocHeaderHeroBackground />
      ) : (
        <div className="pointer-events-none absolute inset-0" aria-hidden>
          <div className="absolute inset-0 bg-[#1A1A1A]" />
          <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(255,255,255,0.04)_0%,transparent_50%)]" />
        </div>
      )}

      <div
        className={cn(
          "relative z-10",
          dark
            ? "border-b border-white/[0.08] bg-[#1A1A1A]"
            : "border-b border-[#e5e5e5] bg-muted/30",
        )}
      >
        {/* Mesma grelha que `DocLayout` / `DocHeaderStandard` (Design-system-FIPS): sem flex-wrap. */}
        <div className="flex items-center gap-3 px-4 py-3 sm:px-6">
          <div className="flex min-w-0 flex-1 items-center gap-2">
            <DocHeaderNeuIconButton
              className="hidden sm:inline-flex"
              dark={dark}
              ariaLabel={collapsed ? "Expandir menu lateral" : "Recolher menu lateral"}
              aria-expanded={!collapsed}
              onClick={() => setCollapsed(!collapsed)}
            >
              <PanelLeft
                className={cn("h-[17px] w-[17px] transition-transform duration-200", collapsed && "rotate-180")}
                aria-hidden
                strokeWidth={1.9}
              />
            </DocHeaderNeuIconButton>
            <DocHeaderPageTrail groupLabel={groupLabel} pageTitle={pageTitle} dark={dark} />
          </div>

          <div className="hidden w-full max-w-xs md:block">
            <HeaderDocSearch dark={dark} />
          </div>

          <div className="hidden shrink-0 items-center gap-2 sm:flex">
            <DocHeaderNeuIconButton ariaLabel="Notificações" dark={dark}>
              <Bell className="h-[17px] w-[17px]" aria-hidden strokeWidth={1.9} />
            </DocHeaderNeuIconButton>
            <DocHeaderNeuIconButton ariaLabel="Ajuda e tutoriais" dark={dark}>
              <GraduationCap className="h-[17px] w-[17px]" aria-hidden strokeWidth={1.9} />
            </DocHeaderNeuIconButton>

            <DocHeaderNeuIconButton
              ariaLabel={dark ? "Trocar para modo claro" : "Trocar para modo escuro"}
              dark={dark}
              onClick={toggle}
            >
              <SunMoon className="h-[17px] w-[17px]" aria-hidden strokeWidth={1.85} />
            </DocHeaderNeuIconButton>

            <div
              className={cn("mx-0.5 hidden h-6 w-px shrink-0 sm:block", dark ? "bg-[#52525B]" : "bg-neutral-300")}
            />

            <HeaderDocUserChip
              dark={dark}
              name={nome}
              subtitle={perfilLegivel}
              initials={userInitials}
            />
          </div>
        </div>
      </div>

      <div
        className={cn(
          "relative z-10 hidden lg:block",
          dark ? "!bg-transparent" : "bg-muted/30",
        )}
      >
        {!showChildNavRow && (
          <HeaderDocSectionNav menu={parentNav} dark={dark} bottomBorder="full" />
        )}
        {showChildNavRow && (
          <HeaderDocSectionNav
            menu={childNav}
            dark={dark}
            bottomBorder="full"
            ariaLabel="Subseções da área atual"
          />
        )}
      </div>
    </header>
  );
}
