import { Link, useLocation } from "wouter";
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
  Warehouse,
  CalendarDays,
  UserCog,
} from "lucide-react";
import { useState } from "react";

/* ─── Shimmer keyframes injected once ─── */
const shimmerCSS = `
@keyframes shimmerSweep {
  0%   { transform: translateX(-100%); }
  100% { transform: translateX(100%); }
}
`;
if (typeof document !== "undefined" && !document.getElementById("shimmer-css")) {
  const style = document.createElement("style");
  style.id = "shimmer-css";
  style.textContent = shimmerCSS;
  document.head.appendChild(style);
}

/* ─── Types ─── */
interface MenuItem {
  icon: React.ElementType;
  label: string;
  href?: string;
  badge?: keyof SidebarBadges;
  children?: MenuItem[];
  perfis?: string[];
}

/* ─── Menu structure ─── */
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

/* ─── Sidebar Item with Neumorphic Square Icon + Shimmer ─── */
function SidebarItem({
  item,
  badges,
  depth = 0,
}: {
  item: MenuItem;
  badges: SidebarBadges;
  depth?: number;
}) {
  const [location] = useLocation();
  const [hovered, setHovered] = useState(false);
  const [open, setOpen] = useState(() => {
    if (!item.children) return false;
    return item.children.some((c) => c.href === location);
  });

  const badgeCount = item.badge ? badges[item.badge] : 0;
  const hasChildren = !!item.children?.length;
  const isActive =
    item.href === location ||
    (hasChildren && item.children!.some((c) => c.href === location));

  const content = (
    <div
      className="flex items-center gap-3 cursor-pointer group"
      style={{
        padding: depth > 0 ? "6px 12px 6px 28px" : "6px 12px",
        margin: "1px 8px",
        borderRadius: "8px",
        transition: "background 0.15s ease",
      }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      onClick={() => hasChildren && setOpen(!open)}
    >
      {/* ─── Neumorphic Icon Square ─── */}
      <div
        className="relative flex items-center justify-center flex-shrink-0 overflow-hidden"
        style={{
          width: 36,
          height: 36,
          borderRadius: 10,
          border: `1px solid ${
            isActive
              ? "rgba(255,7,58,0.5)"
              : hovered
              ? "rgba(255,7,58,0.4)"
              : "#3f3f46"
          }`,
          background:
            isActive || hovered
              ? "linear-gradient(135deg, #FF073A 0%, #B20028 100%)"
              : "#27272a",
          boxShadow: isActive
            ? "inset 3px 3px 6px rgba(0,0,0,0.3), inset -3px -3px 6px rgba(255,255,255,0.04)"
            : hovered
            ? "0 8px 24px -8px rgba(255,7,58,0.4), 4px 4px 8px #0a0a0a, -4px -4px 8px #2a2a2a"
            : "4px 4px 8px #0a0a0a, -4px -4px 8px #2a2a2a",
          transform: hovered && !isActive ? "translateY(-1px)" : "none",
          transition: "all 0.3s ease",
        }}
      >
        {/* Shimmer sweep on hover/active */}
        <div
          style={{
            position: "absolute",
            inset: 0,
            background:
              "linear-gradient(135deg, transparent 0%, rgba(255,255,255,0.25) 50%, transparent 100%)",
            transform: hovered || isActive ? "translateX(0)" : "translateX(-100%)",
            animation: hovered || isActive ? "shimmerSweep 0.5s ease forwards" : "none",
            pointerEvents: "none",
          }}
        />
        <item.icon
          size={17}
          style={{
            position: "relative",
            zIndex: 1,
            color: isActive || hovered ? "#fff" : "#a1a1aa",
            transition: "color 0.2s ease",
          }}
        />
      </div>

      {/* ─── Label ─── */}
      <span
        style={{
          fontSize: 13,
          fontWeight: isActive ? 500 : 400,
          letterSpacing: "0.01em",
          flex: 1,
          color: isActive ? "#fafafa" : hovered ? "#d4d4d8" : "#a1a1aa",
          transition: "color 0.15s ease",
        }}
      >
        {item.label}
      </span>

      {/* Badge */}
      {badgeCount > 0 && (
        <motion.span
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          className="ml-auto min-w-[20px] h-5 px-1.5 rounded-full bg-red-500 text-white text-[10px] font-bold flex items-center justify-center shadow-lg shadow-red-500/40"
        >
          {badgeCount > 99 ? "99+" : badgeCount}
        </motion.span>
      )}

      {/* Chevron for children */}
      {hasChildren && (
        <motion.div animate={{ rotate: open ? 180 : 0 }} transition={{ duration: 0.2 }}>
          {open ? (
            <ChevronDown size={14} style={{ color: "#52525b" }} />
          ) : (
            <ChevronRight size={14} style={{ color: "#52525b" }} />
          )}
        </motion.div>
      )}
    </div>
  );

  return (
    <div>
      {item.href && !hasChildren ? (
        <Link href={item.href}>{content}</Link>
      ) : (
        content
      )}
      <AnimatePresence>
        {hasChildren && open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden"
          >
            {item.children!.map((child) => (
              <SidebarItem key={child.href ?? child.label} item={child} badges={badges} depth={depth + 1} />
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

/* ─── Sidebar ─── */
export function Sidebar() {
  const badges = useSidebarBadges();

  // TODO: usar perfil real do usuário logado
  const perfil = "administrador";

  const filteredMenu = MENU.filter((item) => {
    if (!item.perfis) return true;
    return item.perfis.includes(perfil);
  });

  return (
    <aside
      className="fixed left-0 top-0 w-64 h-screen flex flex-col z-30"
      style={{
        backgroundColor: "#1a1a1a",
        borderRight: "1px solid rgba(255,255,255,0.06)",
      }}
    >
      {/* Logo */}
      <div
        className="flex items-center justify-center h-14 px-4"
        style={{ borderBottom: "1px solid rgba(255,255,255,0.06)" }}
      >
        <img src="/src/assets/logo.png" alt="Tecnopano" className="w-36" />
      </div>

      {/* Menu */}
      <nav
        className="flex-1 overflow-y-auto py-3 space-y-0.5"
        style={{
          scrollbarWidth: "thin",
          scrollbarColor: "rgba(255,255,255,0.1) transparent",
        }}
      >
        {filteredMenu.map((item) => (
          <SidebarItem key={item.href ?? item.label} item={item} badges={badges} />
        ))}
      </nav>

      {/* Logout */}
      <div style={{ borderTop: "1px solid rgba(255,255,255,0.06)", padding: "10px 12px 16px" }}>
        <button
          className="flex items-center gap-3 w-full px-2 py-2 rounded-lg cursor-pointer transition-colors"
          style={{ color: "#52525b" }}
          onMouseEnter={(e) => (e.currentTarget.style.color = "#FF073A")}
          onMouseLeave={(e) => (e.currentTarget.style.color = "#52525b")}
        >
          <LogOut size={17} />
          <span style={{ fontSize: 13, fontWeight: 400 }}>Sair</span>
        </button>
      </div>
    </aside>
  );
}
