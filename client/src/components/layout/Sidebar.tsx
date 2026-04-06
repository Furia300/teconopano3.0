import { Link, useLocation } from "wouter";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";
import { useSidebarBadges, type SidebarBadges } from "@/hooks/useSidebarBadges";
import {
  LayoutDashboard,
  Truck,
  Package,
  Users,
  Settings,
  Box,
  ClipboardList,
  LogOut,
  Factory,
  ShoppingCart,
  DollarSign,
  FileText,
  Scissors,
  Droplets,
  ChevronDown,
  ChevronRight,
  Bell,
  Warehouse,
  CalendarDays,
  UserCog,
} from "lucide-react";
import { useState } from "react";

interface MenuItem {
  icon: React.ElementType;
  label: string;
  href?: string;
  badge?: keyof SidebarBadges;
  children?: MenuItem[];
  perfis?: string[];
}

const MENU: MenuItem[] = [
  { icon: LayoutDashboard, label: "Dashboard", href: "/" },
  {
    icon: Truck,
    label: "Coleta",
    href: "/coleta",
    perfis: ["administrador", "expedicao", "motorista", "galpao"],
  },
  {
    icon: ClipboardList,
    label: "Separação",
    href: "/separacao",
    perfis: ["administrador", "galpao", "separacao"],
  },
  {
    icon: Factory,
    label: "Produção",
    href: "/producao",
    badge: "producaoEmAndamento",
    perfis: ["administrador", "galpao", "producao"],
  },
  {
    icon: CalendarDays,
    label: "Produção Diária",
    href: "/producao-diaria",
    perfis: ["administrador", "galpao", "producao"],
  },
  {
    icon: Droplets,
    label: "Repanol",
    href: "/repanol",
    perfis: ["administrador", "galpao"],
  },
  {
    icon: Scissors,
    label: "Costureira",
    href: "/costureira",
    perfis: ["administrador", "galpao", "motorista"],
  },
  {
    icon: Warehouse,
    label: "Estoque",
    href: "/estoque",
    perfis: ["administrador", "expedicao", "galpao"],
  },
  {
    icon: DollarSign,
    label: "Expedição",
    perfis: ["administrador", "expedicao", "financeiro", "emissao_nf"],
    children: [
      { icon: Package, label: "Pedidos", href: "/expedicao" },
      {
        icon: DollarSign,
        label: "Financeiro",
        href: "/financeiro",
        badge: "financeiroPendente",
        perfis: ["administrador", "expedicao", "financeiro"],
      },
      {
        icon: FileText,
        label: "Emissão NF",
        href: "/emissao-nf",
        badge: "notaPendente",
        perfis: ["administrador", "expedicao", "emissao_nf"],
      },
    ],
  },
  {
    icon: ShoppingCart,
    label: "Clientes",
    href: "/clientes",
    perfis: ["administrador", "expedicao"],
  },
  {
    icon: Truck,
    label: "Fornecedores",
    href: "/fornecedores",
    perfis: ["administrador", "expedicao"],
  },
  {
    icon: Box,
    label: "Produtos",
    href: "/produtos",
    perfis: ["administrador", "expedicao"],
  },
  {
    icon: Users,
    label: "Funcionários",
    href: "/funcionarios",
    perfis: ["administrador", "rh"],
  },
  {
    icon: UserCog,
    label: "Usuários",
    href: "/usuarios",
    perfis: ["administrador"],
  },
  {
    icon: Settings,
    label: "Configurações",
    href: "/configuracoes",
    perfis: ["administrador"],
  },
];

function BadgeCount({ count }: { count: number }) {
  if (!count) return null;
  return (
    <motion.span
      initial={{ scale: 0 }}
      animate={{ scale: 1 }}
      className="ml-auto min-w-[20px] h-5 px-1.5 rounded-full bg-red-500 text-white text-[10px] font-bold flex items-center justify-center shadow-lg shadow-red-500/40"
    >
      {count > 99 ? "99+" : count}
    </motion.span>
  );
}

function NavItem({
  item,
  badges,
  depth = 0,
}: {
  item: MenuItem;
  badges: SidebarBadges;
  depth?: number;
}) {
  const [location] = useLocation();
  const [open, setOpen] = useState(() => {
    if (!item.children) return false;
    return item.children.some((c) => c.href === location);
  });

  const badgeCount = item.badge ? badges[item.badge] : 0;
  const isActive = item.href ? location === item.href : false;
  const hasChildren = !!item.children?.length;

  if (hasChildren) {
    return (
      <div>
        <button
          onClick={() => setOpen((v) => !v)}
          className={cn(
            "w-full flex items-center gap-3 px-4 py-2.5 text-sm font-medium rounded-lg transition-all cursor-pointer group",
            "text-sidebar-foreground/80 hover:text-white hover:bg-white/10",
            depth > 0 && "pl-7 py-2"
          )}
        >
          <item.icon className="h-4 w-4 flex-shrink-0 text-white/50 group-hover:text-white" />
          <span className="flex-1 text-left">{item.label}</span>
          {badgeCount > 0 && <BadgeCount count={badgeCount} />}
          {open ? (
            <ChevronDown className="h-3.5 w-3.5 text-white/30" />
          ) : (
            <ChevronRight className="h-3.5 w-3.5 text-white/30" />
          )}
        </button>
        <AnimatePresence initial={false}>
          {open && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="overflow-hidden ml-3 border-l border-white/10 pl-2 mt-0.5 mb-1"
            >
              {item.children!.map((child) => (
                <NavItem key={child.href ?? child.label} item={child} badges={badges} depth={depth + 1} />
              ))}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    );
  }

  return (
    <Link href={item.href!}>
      <motion.div
        whileHover={{ x: 2 }}
        className={cn(
          "flex items-center gap-3 px-4 py-2.5 text-sm font-medium rounded-lg transition-all cursor-pointer relative overflow-hidden group",
          depth > 0 && "py-2 text-[13px]",
          isActive
            ? "bg-gradient-to-r from-[#FF073A] to-[#B20028] text-white shadow-lg shadow-red-900/40"
            : "text-sidebar-foreground/80 hover:text-white hover:bg-white/8"
        )}
      >
        {isActive && (
          <motion.div
            initial={{ x: "-100%" }}
            animate={{ x: "200%" }}
            transition={{ duration: 1.5, repeat: Infinity, ease: "linear", repeatDelay: 1 }}
            className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent pointer-events-none"
          />
        )}
        <item.icon
          className={cn(
            "h-4 w-4 flex-shrink-0 relative z-10",
            isActive ? "text-white" : "text-white/40 group-hover:text-white/80"
          )}
        />
        <span className="relative z-10 flex-1">{item.label}</span>
        {badgeCount > 0 && <BadgeCount count={badgeCount} />}
        {isActive && (
          <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-2/3 bg-white rounded-r-full" />
        )}
      </motion.div>
    </Link>
  );
}

export function Sidebar() {
  const badges = useSidebarBadges();
  const totalAlerts = badges.financeiroPendente + badges.notaPendente;

  // TODO: usar perfil real do usuário logado
  const perfil = "administrador";
  const userName = "Admin";

  const filteredMenu = MENU.filter((item) => {
    if (!item.perfis) return true;
    return item.perfis.includes(perfil);
  });

  return (
    <div className="h-screen w-64 flex flex-col fixed left-0 top-0 z-50 bg-[#1a1a1a] border-r border-white/5">
      {/* Logo */}
      <div className="py-5 px-4 border-b border-white/5 flex justify-center items-center bg-[#161616]">
        <img src="/src/assets/logo.png" alt="Tecnopano" className="w-36 h-auto" />
      </div>

      {/* User profile strip */}
      <div className="px-4 py-3 border-b border-white/5 flex items-center gap-3">
        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[#FF073A] to-[#B20028] flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
          {userName.charAt(0).toUpperCase()}
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-white text-xs font-semibold truncate">{userName}</p>
          <p className="text-white/40 text-[10px] capitalize">{perfil.replace("_", " ")}</p>
        </div>
        {totalAlerts > 0 && (
          <div className="relative">
            <Bell className="h-4 w-4 text-white/40" />
            <span className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full text-[8px] text-white flex items-center justify-center">
              {totalAlerts > 9 ? "9+" : totalAlerts}
            </span>
          </div>
        )}
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-2 py-3 overflow-y-auto space-y-0.5
        [&::-webkit-scrollbar]:w-1
        [&::-webkit-scrollbar-track]:bg-transparent
        [&::-webkit-scrollbar-thumb]:bg-white/10
        [&::-webkit-scrollbar-thumb:hover]:bg-white/20">
        {filteredMenu.map((item) => (
          <NavItem key={item.href ?? item.label} item={item} badges={badges} />
        ))}
      </nav>

      {/* Logout */}
      <div className="p-3 border-t border-white/5">
        <button className="flex items-center gap-3 px-4 py-2.5 w-full text-sm font-medium text-red-400/80 hover:text-red-400 hover:bg-red-400/10 rounded-lg transition-colors cursor-pointer">
          <LogOut className="h-4 w-4" />
          Sair do Sistema
        </button>
      </div>
    </div>
  );
}
