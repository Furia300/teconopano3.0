import { Link, useLocation } from "wouter";
import { motion, AnimatePresence } from "framer-motion";
import { useSidebarBadges, type SidebarBadges } from "@/hooks/useSidebarBadges";
import { useSidebarCollapse } from "@/hooks/useSidebarCollapse";
import {
  LayoutDashboard, Truck, Package, Users, Settings, Box,
  ClipboardList, LogOut, Factory, ShoppingCart, DollarSign,
  FileText, Scissors, Droplets, ChevronDown, ChevronRight,
  Warehouse, CalendarDays, UserCog, Zap, X,
} from "lucide-react";
import { useState, useEffect, useCallback, useRef } from "react";
import { createPortal } from "react-dom";

const W_FULL = 256;
const W_MINI = 72;

/* ─── CSS ─── */
const CSS = `
@keyframes shimmerSweep {
  0%   { transform: translateX(-100%); }
  100% { transform: translateX(100%); }
}
.sb-nav::-webkit-scrollbar { display: none; }
.sb-range {
  -webkit-appearance: none; appearance: none;
  width: 100%; height: 6px; border-radius: 3px; outline: none;
}
.sb-range::-webkit-slider-thumb {
  -webkit-appearance: none; appearance: none;
  width: 18px; height: 18px; border-radius: 50%;
  background: #fff; border: 2px solid #004B9B;
  box-shadow: 0 1px 4px rgba(0,42,104,.18); cursor: pointer;
}
`;
if (typeof document !== "undefined" && !document.getElementById("sb-css")) {
  const s = document.createElement("style");
  s.id = "sb-css";
  s.textContent = CSS;
  document.head.appendChild(s);
}

/* ─── Types ─── */
interface MenuItem {
  icon: React.ElementType;
  label: string;
  href?: string;
  action?: string;
  badge?: keyof SidebarBadges;
  children?: MenuItem[];
  perfis?: string[];
}

/* ─── Menu ─── */
const MENU: MenuItem[] = [
  { icon: LayoutDashboard, label: "Dashboard", href: "/" },
  { icon: Truck, label: "Coleta", href: "/coleta", perfis: ["administrador", "expedicao", "motorista", "galpao"] },
  { icon: ClipboardList, label: "Separação", href: "/separacao", perfis: ["administrador", "galpao", "separacao"] },
  { icon: Factory, label: "Produção", href: "/producao", badge: "producaoEmAndamento", perfis: ["administrador", "galpao", "producao"] },
  { icon: CalendarDays, label: "Produção Diária", href: "/producao-diaria", perfis: ["administrador", "galpao", "producao"] },
  { icon: Droplets, label: "Repanol", href: "/repanol", perfis: ["administrador", "galpao"] },
  { icon: Scissors, label: "Costureira", href: "/costureira", perfis: ["administrador", "galpao", "motorista"] },
  { icon: Warehouse, label: "Estoque", href: "/estoque", perfis: ["administrador", "expedicao", "galpao"] },
  {
    icon: DollarSign, label: "Expedição",
    perfis: ["administrador", "expedicao", "financeiro", "emissao_nf"],
    children: [
      { icon: Package, label: "Pedidos", href: "/expedicao" },
      { icon: DollarSign, label: "Financeiro", href: "/financeiro", badge: "financeiroPendente", perfis: ["administrador", "expedicao", "financeiro"] },
      { icon: FileText, label: "Emissão NF", href: "/emissao-nf", badge: "notaPendente", perfis: ["administrador", "expedicao", "emissao_nf"] },
    ],
  },
  { icon: ShoppingCart, label: "Clientes", href: "/clientes", perfis: ["administrador", "expedicao"] },
  { icon: Truck, label: "Fornecedores", href: "/fornecedores", perfis: ["administrador", "expedicao"] },
  { icon: Box, label: "Produtos", href: "/produtos", perfis: ["administrador", "expedicao"] },
  { icon: Users, label: "Funcionários", href: "/funcionarios", perfis: ["administrador", "rh"] },
  { icon: UserCog, label: "Usuários", href: "/usuarios", perfis: ["administrador"] },
  { icon: Settings, label: "Configurações", href: "/configuracoes", perfis: ["administrador"] },
  { icon: Zap, label: "Automático", action: "autoCollapse", perfis: ["administrador"] },
];

/* ═══════════════════════════════════════════════
   Modal — "Comportamento do menu"
   Renderizado via portal fora da sidebar
   ═══════════════════════════════════════════════ */
const MC = {
  on: "#004B9B", off: "#E8EBFF", border: "#E2E8F0",
  thumb: "#fff", filled: "#004B9B", empty: "#D3E3F4",
  val: "#002A68", muted: "#64748B",
};

function AutoModal({
  open, onClose,
  autoCollapse, onAutoCollapseChange,
  seconds, onSecondsChange,
}: {
  open: boolean; onClose: () => void;
  autoCollapse: boolean; onAutoCollapseChange: (v: boolean) => void;
  seconds: number; onSecondsChange: (v: number) => void;
}) {
  const pct = ((seconds - 1) / 29) * 100;

  if (!open) return null;

  return createPortal(
    <>
      {/* Backdrop */}
      <div
        onClick={onClose}
        style={{
          position: "fixed", inset: 0, background: "rgba(0,0,0,0.45)",
          zIndex: 9998, animation: "fadeIn .15s ease",
        }}
      />
      {/* Dialog */}
      <div style={{
        position: "fixed", top: "50%", left: "50%",
        transform: "translate(-50%,-50%)", zIndex: 9999,
        width: 380, maxWidth: "calc(100vw - 32px)",
        background: "#fff", borderRadius: 16,
        padding: "24px 28px 28px",
        boxShadow: "0 25px 50px -12px rgba(0,0,0,.25)",
        animation: "fadeIn .2s ease",
      }}>
        {/* Header */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 24 }}>
          <h3 style={{ fontSize: 16, fontWeight: 600, color: "#1a1a1a", margin: 0 }}>
            Comportamento do menu
          </h3>
          <button onClick={onClose} style={{
            background: "none", border: "none", cursor: "pointer",
            padding: 4, color: "#9ca3af", display: "flex",
          }}>
            <X size={18} />
          </button>
        </div>

        {/* Toggle */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 16 }}>
          <span style={{ fontSize: 14, color: "#1a1a1a" }}>Fechar automaticamente</span>
          <button
            type="button" role="switch" aria-checked={autoCollapse}
            onClick={() => onAutoCollapseChange(!autoCollapse)}
            style={{
              width: 44, height: 24, borderRadius: 12,
              border: `1px solid ${autoCollapse ? MC.on : MC.border}`,
              background: autoCollapse ? MC.on : MC.off,
              padding: 2, cursor: "pointer", flexShrink: 0,
            }}
          >
            <span style={{
              display: "block", width: 18, height: 18, borderRadius: "50%",
              background: MC.thumb,
              transform: autoCollapse ? "translateX(20px)" : "translateX(0)",
              transition: "transform .2s ease",
              boxShadow: "0 1px 3px rgba(0,42,104,.2)",
            }} />
          </button>
        </div>

        {/* Slider */}
        <div style={{ opacity: autoCollapse ? 1 : 0.45, marginTop: 20, transition: "opacity .2s" }}>
          <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 10 }}>
            <span style={{ fontSize: 13, color: "#6b7280" }}>Tempo para fechar</span>
            <span style={{ fontSize: 14, fontWeight: 700, color: MC.val }}>{seconds}s</span>
          </div>
          <input
            type="range" className="sb-range"
            min={1} max={30} step={1} value={seconds}
            disabled={!autoCollapse}
            onChange={(e) => onSecondsChange(Number(e.target.value))}
            style={{
              display: "block", width: "100%",
              background: `linear-gradient(to right,${MC.filled} 0%,${MC.filled} ${pct}%,${MC.empty} ${pct}%,${MC.empty} 100%)`,
            }}
          />
          <div style={{ display: "flex", justifyContent: "space-between", marginTop: 8, fontSize: 11, color: MC.muted }}>
            <span>1s</span><span>30s</span>
          </div>
        </div>
      </div>
    </>,
    document.body,
  );
}

/* ═══════════════════════════════════════════════
   SidebarItem
   ═══════════════════════════════════════════════ */
function SidebarItem({
  item, badges, mini, depth = 0, onAction,
}: {
  item: MenuItem; badges: SidebarBadges; mini: boolean;
  depth?: number; onAction?: (a: string) => void;
}) {
  const [location] = useLocation();
  const [hovered, setHovered] = useState(false);
  const [open, setOpen] = useState(() =>
    item.children?.some((c) => c.href === location) ?? false,
  );

  const badgeCount = item.badge ? badges[item.badge] : 0;
  const hasChildren = !!item.children?.length;
  const isActive = item.href === location ||
    (hasChildren && item.children!.some((c) => c.href === location));

  const content = (
    <div
      className="flex items-center cursor-pointer"
      title={mini ? item.label : undefined}
      style={{
        gap: mini ? 0 : 12,
        padding: mini ? "8px 0" : depth > 0 ? "6px 12px 6px 28px" : "6px 12px",
        margin: mini ? "2px 8px" : "1px 8px",
        borderRadius: 8,
        justifyContent: mini ? "center" : "flex-start",
        transition: "background .15s",
      }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      onClick={() => {
        if (item.action && onAction) onAction(item.action);
        else if (hasChildren) setOpen(!open);
      }}
    >
      {/* Icon */}
      <div
        className="relative flex items-center justify-center flex-shrink-0 overflow-hidden"
        style={{
          width: 36, height: 36, borderRadius: 10,
          border: `1px solid ${isActive ? "rgba(255,7,58,.5)" : hovered ? "rgba(255,7,58,.4)" : "#3f3f46"}`,
          background: isActive || hovered ? "linear-gradient(135deg,#FF073A,#B20028)" : "#27272a",
          boxShadow: isActive
            ? "inset 3px 3px 6px rgba(0,0,0,.3),inset -3px -3px 6px rgba(255,255,255,.04)"
            : hovered
            ? "0 8px 24px -8px rgba(255,7,58,.4),4px 4px 8px #0a0a0a,-4px -4px 8px #2a2a2a"
            : "4px 4px 8px #0a0a0a,-4px -4px 8px #2a2a2a",
          transform: hovered && !isActive ? "translateY(-1px)" : "none",
          transition: "all .3s ease",
        }}
      >
        <div style={{
          position: "absolute", inset: 0,
          background: "linear-gradient(135deg,transparent,rgba(255,255,255,.25) 50%,transparent)",
          transform: hovered || isActive ? "translateX(0)" : "translateX(-100%)",
          animation: hovered || isActive ? "shimmerSweep .5s ease forwards" : "none",
          pointerEvents: "none",
        }} />
        <item.icon size={17} style={{
          position: "relative", zIndex: 1,
          color: isActive || hovered ? "#fff" : "#a1a1aa",
          transition: "color .2s",
        }} />
      </div>

      {/* Label */}
      {!mini && (
        <span style={{
          fontSize: 13, fontWeight: isActive ? 500 : 400,
          letterSpacing: ".01em", flex: 1,
          color: isActive ? "#fafafa" : hovered ? "#d4d4d8" : "#a1a1aa",
          transition: "color .15s",
          whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis",
        }}>
          {item.label}
        </span>
      )}

      {/* Badge */}
      {!mini && badgeCount > 0 && (
        <motion.span initial={{ scale: 0 }} animate={{ scale: 1 }}
          className="ml-auto min-w-[20px] h-5 px-1.5 rounded-full bg-red-500 text-white text-[10px] font-bold flex items-center justify-center shadow-lg shadow-red-500/40"
        >
          {badgeCount > 99 ? "99+" : badgeCount}
        </motion.span>
      )}

      {/* Chevron */}
      {!mini && hasChildren && (
        <motion.div animate={{ rotate: open ? 180 : 0 }} transition={{ duration: .2 }}>
          {open ? <ChevronDown size={14} style={{ color: "#52525b" }} />
            : <ChevronRight size={14} style={{ color: "#52525b" }} />}
        </motion.div>
      )}
    </div>
  );

  return (
    <div>
      {item.href && !hasChildren && !item.action
        ? <Link href={item.href}>{content}</Link>
        : content}
      <AnimatePresence>
        {hasChildren && open && !mini && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: .2 }}
            className="overflow-hidden"
          >
            {item.children!.map((ch) => (
              <SidebarItem key={ch.href ?? ch.label} item={ch} badges={badges}
                mini={mini} depth={depth + 1} onAction={onAction} />
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

/* ═══════════════════════════════════════════════
   Sidebar
   ═══════════════════════════════════════════════ */
export function Sidebar() {
  const badges = useSidebarBadges();
  const { collapsed, setCollapsed } = useSidebarCollapse();
  const [hovering, setHovering] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Persisted settings
  const [autoCollapse, setAutoCollapse] = useState(() => {
    try { return localStorage.getItem("sb_auto") === "1"; } catch { return false; }
  });
  const [seconds, setSeconds] = useState(() => {
    try { return Number(localStorage.getItem("sb_sec")) || 5; } catch { return 5; }
  });

  // Save to localStorage
  useEffect(() => {
    try {
      localStorage.setItem("sb_auto", autoCollapse ? "1" : "0");
      localStorage.setItem("sb_sec", String(seconds));
    } catch {}
  }, [autoCollapse, seconds]);

  // ── Timer logic ──
  const clearTimer = useCallback(() => {
    if (timerRef.current) { clearTimeout(timerRef.current); timerRef.current = null; }
  }, []);

  const startTimer = useCallback(() => {
    clearTimer();
    if (!autoCollapse || modalOpen) return;
    timerRef.current = setTimeout(() => {
      setCollapsed(true);
    }, seconds * 1000);
  }, [autoCollapse, seconds, modalOpen, clearTimer, setCollapsed]);

  // When settings change
  useEffect(() => {
    if (autoCollapse) {
      startTimer();
    } else {
      clearTimer();
      setCollapsed(false);
    }
    return clearTimer;
  }, [autoCollapse, seconds, startTimer, clearTimer, setCollapsed]);

  // Pause timer while modal is open
  useEffect(() => {
    if (modalOpen) clearTimer();
    else if (autoCollapse && !hovering) startTimer();
  }, [modalOpen, autoCollapse, hovering, clearTimer, startTimer]);

  // ── Mouse events ──
  const onEnter = useCallback(() => {
    setHovering(true);
    clearTimer();
  }, [clearTimer]);

  const onLeave = useCallback(() => {
    setHovering(false);
    if (autoCollapse && !modalOpen) startTimer();
  }, [autoCollapse, modalOpen, startTimer]);

  const onAction = useCallback((a: string) => {
    if (a === "autoCollapse") setModalOpen(true);
  }, []);

  // ── Visual state ──
  const mini = collapsed && !hovering;
  const isOverlay = collapsed && hovering;

  const perfil = "administrador";
  const filteredMenu = MENU.filter((m) => !m.perfis || m.perfis.includes(perfil));

  return (
    <>
      <aside
        onMouseEnter={onEnter}
        onMouseLeave={onLeave}
        style={{
          position: "fixed", left: 0, top: 0,
          width: mini ? W_MINI : W_FULL,
          height: "100vh",
          display: "flex", flexDirection: "column",
          backgroundColor: "#1a1a1a",
          borderRight: "1px solid rgba(255,255,255,.06)",
          transition: "width .25s cubic-bezier(.4,0,.2,1)",
          zIndex: 30,
          boxShadow: isOverlay ? "8px 0 24px rgba(0,0,0,.35)" : "none",
          overflow: "hidden",
        }}
      >
        {/* Logo */}
        <div style={{
          display: "flex", alignItems: "center", justifyContent: "center",
          height: 56, flexShrink: 0,
          borderBottom: "1px solid rgba(255,255,255,.06)",
        }}>
          {mini
            ? <img src="/src/assets/logo-30anos.png" alt="Tecnopano 30 Anos"
                style={{ width: 36, height: 36, objectFit: "contain", borderRadius: 10 }} />
            : <img src="/src/assets/logo.png" alt="Tecnopano" style={{ width: 144 }} />}
        </div>

        {/* Nav */}
        <nav className="sb-nav" style={{
          flex: 1, overflowY: "auto", overflowX: "hidden",
          padding: "12px 0",
          scrollbarWidth: "none",
        }}>
          {filteredMenu.map((item) => (
            <SidebarItem key={item.href ?? item.label}
              item={item} badges={badges} mini={mini} onAction={onAction} />
          ))}
        </nav>

        {/* Logout */}
        <div style={{ borderTop: "1px solid rgba(255,255,255,.06)", padding: "10px 12px 16px" }}>
          <button
            style={{
              display: "flex", alignItems: "center", gap: mini ? 0 : 12,
              justifyContent: mini ? "center" : "flex-start",
              width: "100%", padding: "8px", borderRadius: 8,
              background: "none", border: "none", cursor: "pointer",
              color: "#52525b", transition: "color .2s",
            }}
            onMouseEnter={(e) => (e.currentTarget.style.color = "#FF073A")}
            onMouseLeave={(e) => (e.currentTarget.style.color = "#52525b")}
          >
            <LogOut size={17} />
            {!mini && <span style={{ fontSize: 13, fontWeight: 400 }}>Sair</span>}
          </button>
        </div>
      </aside>

      {/* Modal via portal — fora da sidebar */}
      <AutoModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        autoCollapse={autoCollapse}
        onAutoCollapseChange={setAutoCollapse}
        seconds={seconds}
        onSecondsChange={setSeconds}
      />
    </>
  );
}
