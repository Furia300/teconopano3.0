import type { ElementType } from "react";
import type { SidebarBadges } from "@/hooks/useSidebarBadges";
import { routePathMatches } from "@/lib/routePathMatch";
import {
  LayoutDashboard,
  Truck,
  Package,
  Users,
  Settings,
  Box,
  Building2,
  ClipboardList,
  DollarSign,
  FileText,
  Scissors,
  Droplets,
  Factory,
  ShoppingCart,
  Send,
  Warehouse,
  CalendarDays,
  UserCog,
  Zap,
  Clock,
  Shield,
  BarChart3,
} from "lucide-react";

/** Item do menu lateral / header — única fonte de verdade para rotas agrupadas. */
export interface AppMenuItem {
  icon: ElementType;
  label: string;
  href?: string;
  action?: string;
  badge?: keyof SidebarBadges;
  children?: AppMenuItem[];
  perfis?: string[];
  /** Rotas que ativam este tab no header (grupo com vários filhos; preenchido por `headerParentNavItems`). */
  navMatchHrefs?: string[];
}

/** Perfis que veem o dashboard administrativo (exclui `michele` — entra direto em Coleta). */
const PERFIS_DASHBOARD = [
  "administrador",
  "super_admin",
  "galpao",
  "emissao_nf",
  "financeiro",
  "expedicao",
  "rh",
  "producao",
  "separacao",
  "motorista",
  "costureira",
] as const;

export const APP_MENU: AppMenuItem[] = [
  { icon: LayoutDashboard, label: "Dashboard", href: "/", perfis: [...PERFIS_DASHBOARD] },

  /**
   * COLETA — área upstream (entrada de matéria-prima).
   * Quando estiver em qualquer rota desta área, a faixa horizontal mostra:
   * Coleta · Fornecedores · Motorista (Motorista repete também em Expedição).
   */
  {
    icon: Truck,
    label: "Coleta",
    perfis: ["michele", "galpao", "administrador", "expedicao", "motorista"],
    children: [
      { icon: Truck, label: "Coleta", href: "/coleta", perfis: ["michele", "galpao", "administrador", "expedicao", "motorista"] },
      { icon: Building2, label: "Fornecedores", href: "/fornecedores", perfis: ["administrador", "expedicao", "galpao", "michele"] },
      { icon: LayoutDashboard, label: "Dashboard", href: "/dashboard-coleta", perfis: ["administrador", "expedicao", "galpao", "michele"] },
    ],
  },

  {
    icon: Warehouse,
    label: "Galpão",
    badge: "producaoEmAndamento",
    perfis: ["administrador", "galpao", "producao", "separacao"],
    children: [
      { icon: Factory, label: "Produção", href: "/producao", badge: "producaoEmAndamento", perfis: ["administrador", "galpao", "producao"] },
      { icon: ClipboardList, label: "Separação", href: "/separacao", perfis: ["administrador", "galpao", "separacao"] },
      { icon: CalendarDays, label: "Produção Diária", href: "/producao-diaria", perfis: ["administrador", "galpao", "producao"] },
      { icon: Droplets, label: "Repanol", href: "/repanol", perfis: ["administrador", "galpao"] },
      { icon: Scissors, label: "Costureira", href: "/costureira", perfis: ["administrador", "galpao"] },
    ],
  },

  /**
   * EXPEDIÇÃO — área downstream (pedido do cliente B2B).
   * Pedidos / Clientes / Estoque / Motorista (Motorista repete da Coleta — mesma pessoa,
   * outro contexto operacional).
   */
  {
    icon: Send,
    label: "Expedição",
    perfis: ["administrador", "expedicao", "motorista", "galpao", "michele"],
    children: [
      { icon: Package, label: "Pedidos", href: "/expedicao", perfis: ["administrador", "expedicao", "galpao", "michele"] },
      { icon: ShoppingCart, label: "Clientes", href: "/clientes", perfis: ["administrador", "expedicao", "michele"] },
      { icon: Box, label: "Produtos", href: "/produtos", perfis: ["administrador", "expedicao", "michele"] },
      { icon: Warehouse, label: "Estoque", href: "/estoque", perfis: ["administrador", "expedicao", "galpao", "michele"] },
      { icon: BarChart3, label: "Dashboard", href: "/dashboard-expedicao", perfis: ["administrador", "expedicao", "michele"] },
    ],
  },

  {
    icon: Truck,
    label: "Logística",
    perfis: ["administrador", "motorista", "expedicao", "galpao", "michele"],
    children: [
      { icon: Truck, label: "Motorista", href: "/motorista", perfis: ["administrador", "motorista", "expedicao", "galpao", "michele"] },
      { icon: UserCog, label: "Cadastro", href: "/motorista-cadastro", perfis: ["administrador", "motorista", "galpao"] },
    ],
  },

  {
    icon: DollarSign,
    label: "Financeiro",
    badge: "financeiroPendente",
    perfis: ["administrador", "expedicao", "financeiro", "emissao_nf"],
    children: [
      { icon: DollarSign, label: "Financeiro", href: "/financeiro", badge: "financeiroPendente", perfis: ["administrador", "expedicao", "financeiro"] },
      { icon: FileText, label: "Emissão NF", href: "/emissao-nf", badge: "notaPendente", perfis: ["administrador", "expedicao", "emissao_nf"] },
      { icon: BarChart3, label: "Dashboard", href: "/dashboard-financeiro", perfis: ["administrador", "financeiro", "expedicao"] },
    ],
  },

  {
    icon: Users,
    label: "RH",
    perfis: ["administrador", "rh"],
    children: [
      { icon: Clock, label: "Ponto diário", href: "/ponto-diario", perfis: ["administrador", "rh"] },
      { icon: UserCog, label: "Funcionários", href: "/funcionarios", perfis: ["administrador", "rh"] },
      { icon: LayoutDashboard, label: "Dashboard", href: "/dashboard-rh", perfis: ["administrador", "rh"] },
    ],
  },
  {
    icon: Shield,
    label: "Administração",
    badge: "adminPendencias",
    perfis: ["administrador"],
    children: [
      { icon: Shield, label: "Painel Admin", href: "/administracao", perfis: ["administrador"] },
      { icon: Settings, label: "Configurações", href: "/configuracoes", perfis: ["administrador"] },
    ],
  },
  { icon: Zap, label: "Menu Automático", action: "autoCollapse", perfis: ["administrador"] },
];

export function filterMenuByPerfil(items: AppMenuItem[], perfil: string): AppMenuItem[] {
  const p = perfil.trim().toLowerCase();
  const fullAccess = p === "administrador" || p === "super_admin";
  return items.filter(
    (m) => fullAccess || !m.perfis || m.perfis.some((x) => x.toLowerCase() === p),
  );
}

/** Primeira rota navegável do item (href próprio ou primeiro filho com `href`). */
export function getPrimaryNavHref(item: AppMenuItem): string | undefined {
  if (item.href) return item.href;
  const first = item.children?.find((c) => c.href);
  return first?.href;
}

/** Grupo do menu cujo filho coincide com o path (ex. Produção quando está em `/separacao`). */
export function getActiveMenuGroup(pathname: string, menu: AppMenuItem[]): AppMenuItem | null {
  for (const item of menu) {
    if (!item.children?.length) continue;
    if (item.children.some((c) => c.href && routePathMatches(pathname, c.href))) {
      return item;
    }
  }
  return null;
}

/** Faixa superior do header: só pais, cada um com `href` resolvido (sem dropdown). */
export function headerParentNavItems(menu: AppMenuItem[]): AppMenuItem[] {
  return menu
    .filter((i) => {
      if (i.action && !i.href && !i.children?.length) return false;
      return Boolean(getPrimaryNavHref(i));
    })
    .map((i) => {
      const href = getPrimaryNavHref(i)!;
      const childHrefs = (i.children ?? [])
        .map((c) => c.href)
        .filter((h): h is string => Boolean(h));
      const navMatchHrefs =
        childHrefs.length > 0
          ? Array.from(new Set([href, ...childHrefs]))
          : [href];
      return {
        icon: i.icon,
        label: href === "/" ? "Início" : i.label,
        href,
        badge: i.badge,
        perfis: i.perfis,
        navMatchHrefs,
      };
    });
}

/** Filhos do grupo ativo para a segunda faixa do header (só entradas com `href`). */
export function headerChildNavItems(group: AppMenuItem, perfil: string): AppMenuItem[] {
  if (!group.children?.length) return [];
  return filterMenuByPerfil(group.children, perfil).filter((c): c is AppMenuItem & { href: string } => Boolean(c.href));
}

/** @deprecated Prefer `headerParentNavItems` + `headerChildNavItems` no header em duas faixas. */
export function headerNavItemsFromMenu(items: AppMenuItem[]): AppMenuItem[] {
  return items.filter((i) => {
    if (i.children?.length) return true;
    if (i.href) return true;
    return false;
  });
}

function flattenRouteTitles(items: AppMenuItem[]): Record<string, string> {
  const out: Record<string, string> = {};
  for (const it of items) {
    if (it.href) out[it.href] = it.label;
    if (it.children) Object.assign(out, flattenRouteTitles(it.children));
  }
  return out;
}

export const ROUTE_PAGE_TITLE = flattenRouteTitles(APP_MENU);
