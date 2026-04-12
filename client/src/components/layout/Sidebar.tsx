import { Link, useLocation } from "wouter";
import { motion } from "framer-motion";
import { useSidebarBadges, type SidebarBadges } from "@/hooks/useSidebarBadges";
import { useSidebarCollapse } from "@/hooks/useSidebarCollapse";
import { LogOut, X } from "lucide-react";
import { useState, useEffect, useCallback, useRef } from "react";
import { createPortal } from "react-dom";
import { useTecnopanoTheme } from "@/hooks/useTecnopanoTheme";
import { useAppUserPerfil } from "@/hooks/useAppUserPerfil";
import { APP_MENU, filterMenuByPerfil, getPrimaryNavHref, type AppMenuItem } from "@/lib/appMenu";
import { routePathMatches } from "@/lib/routePathMatch";
import { cn } from "@/lib/utils";
import logoCollapsedLight from "@/assets/logo-collapsed-light.png";

const W_FULL = 256;
const W_MINI = 72;

/**
 * Modo escuro — neu legível sobre o mesmo canvas que `main` (`#1A1A1A`); claro: `bg-muted/30` como o conteúdo.
 * (evita azulejo “colado” ao fundo). Ativo/hover: halo vermelho + inset suave (não só “afundado”).
 */
const SB_ICON_TILE_DARK = {
  borderIdle: "#3f3f46",
  borderHover: "rgba(255,7,58,0.4)",
  borderActive: "rgba(255,7,58,0.5)",
  bgIdle: "linear-gradient(160deg, #303036 0%, #222226 55%, #1c1c20 100%)",
  bgHover: "linear-gradient(135deg,#FF073A,#B20028)",
  shadowIdle:
    "0 3px 10px rgba(0,0,0,0.55), 0 1px 0 rgba(255,255,255,0.08) inset, 0 -1px 0 rgba(0,0,0,0.45) inset",
  shadowHover:
    "0 6px 22px -4px rgba(255,7,58,0.5), 0 3px 10px rgba(0,0,0,0.5), 0 1px 0 rgba(255,255,255,0.12) inset, 0 -1px 0 rgba(0,0,0,0.35) inset",
  shadowActive:
    "0 4px 18px -2px rgba(255,7,58,0.42), inset 0 1px 0 rgba(255,255,255,0.14), inset 0 -2px 6px rgba(0,0,0,0.45)",
  iconIdle: "#a1a1aa",
  iconOnAccent: "#ffffff",
} as const;

/** Modo claro — só repouso (neu claro). Hover/active vermelhos = mesmos tokens que `SB_ICON_TILE_DARK`. */
const SB_ICON_TILE_LIGHT = {
  borderIdle: "rgba(0,0,0,0.10)",
  bgIdle: "linear-gradient(145deg, #ffffff 0%, #ebebeb 55%, #e0e0e0 100%)",
  shadowIdle: "0 1px 2px rgba(0,0,0,0.06), inset 0 1px 0 rgba(255,255,255,0.85)",
  iconIdle: "rgba(55,55,55,0.82)",
} as const;

/** Brilho translúcido no sweep — claro sobre vermelho / cinza. */
const SHIMMER_ACCENT =
  "linear-gradient(135deg,transparent,rgba(255,255,255,0.25) 50%,transparent)";
/** Sobre azulejo vermelho (claro/escuro) — sweep mais visível e translúcido. */
const SHIMMER_ON_RED =
  "linear-gradient(135deg,transparent,rgba(255,255,255,0.38) 50%,transparent)";

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
  box-shadow: 0 1px 4px rgba(0,0,0,.1); cursor: pointer;
}
`;
if (typeof document !== "undefined" && !document.getElementById("sb-css")) {
  const s = document.createElement("style");
  s.id = "sb-css";
  s.textContent = CSS;
  document.head.appendChild(s);
}

/* ═══════════════════════════════════════════════
   Modal — "Comportamento do menu"
   Renderizado via portal fora da sidebar.
   Estética dark neumorphic alinhada à sidebar Tecnopano.
   ═══════════════════════════════════════════════ */
import { AnimatePresence } from "framer-motion";

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

  return createPortal(
    <AnimatePresence>
      {open && (
        <>
          {/* Backdrop — blur escuro */}
          <motion.div
            key="auto-backdrop"
            onClick={onClose}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            style={{
              position: "fixed", inset: 0,
              background: "rgba(0,0,0,0.6)",
              backdropFilter: "blur(6px)",
              WebkitBackdropFilter: "blur(6px)",
              zIndex: 9998,
            }}
          />
          {/* Dialog — dark neumorphic, slide up + scale */}
          <motion.div
            key="auto-dialog"
            initial={{ opacity: 0, y: 40, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.97 }}
            transition={{ type: "spring", damping: 28, stiffness: 350 }}
            style={{
              position: "fixed", top: "50%", left: "50%",
              transform: "translate(-50%,-50%)",
              zIndex: 9999,
              width: 400, maxWidth: "calc(100vw - 32px)",
              background: "linear-gradient(165deg, #232328 0%, #1a1a1e 50%, #151518 100%)",
              borderRadius: 20,
              border: "1px solid rgba(255,255,255,0.08)",
              padding: 0,
              boxShadow:
                "0 30px 60px -15px rgba(0,0,0,0.6), 0 0 0 1px rgba(255,255,255,0.04) inset, 0 1px 0 rgba(255,255,255,0.06) inset",
              overflow: "hidden",
            }}
          >
            {/* Grain texture overlay */}
            <div style={{
              position: "absolute", inset: 0, borderRadius: 20, pointerEvents: "none",
              opacity: 0.03, mixBlendMode: "overlay",
              backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='f'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23f)'/%3E%3C/svg%3E")`,
            }} />

            {/* Red accent line top */}
            <div style={{
              height: 3,
              background: "linear-gradient(90deg, #FF073A, #B20028 50%, transparent)",
              borderRadius: "20px 20px 0 0",
            }} />

            {/* Content */}
            <div style={{ padding: "24px 28px 28px", position: "relative" }}>
              {/* Header */}
              <motion.div
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.1, duration: 0.25 }}
                style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 28 }}
              >
                <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                  {/* Neumorphic icon tile (matches sidebar) */}
                  <div style={{
                    width: 36, height: 36, borderRadius: 10,
                    background: "linear-gradient(160deg, #303036 0%, #222226 55%, #1c1c20 100%)",
                    border: "1px solid #3f3f46",
                    boxShadow: "0 3px 10px rgba(0,0,0,0.55), 0 1px 0 rgba(255,255,255,0.08) inset, 0 -1px 0 rgba(0,0,0,0.45) inset",
                    display: "flex", alignItems: "center", justifyContent: "center",
                  }}>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#a1a1aa" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" />
                    </svg>
                  </div>
                  <div>
                    <h3 style={{
                      fontSize: 15, fontWeight: 700, color: "#fafafa", margin: 0,
                      fontFamily: "'Saira Expanded', sans-serif", letterSpacing: "-0.02em",
                    }}>
                      Automático
                    </h3>
                    <p style={{ fontSize: 11, color: "#71717a", margin: "2px 0 0" }}>
                      Comportamento do menu lateral
                    </p>
                  </div>
                </div>
                <button
                  onClick={onClose}
                  style={{
                    width: 28, height: 28, borderRadius: 8,
                    background: "rgba(255,255,255,0.04)",
                    border: "1px solid rgba(255,255,255,0.08)",
                    cursor: "pointer", display: "flex",
                    alignItems: "center", justifyContent: "center",
                    color: "#71717a", transition: "all .15s",
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background = "rgba(255,7,58,0.15)";
                    e.currentTarget.style.borderColor = "rgba(255,7,58,0.3)";
                    e.currentTarget.style.color = "#FF073A";
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = "rgba(255,255,255,0.04)";
                    e.currentTarget.style.borderColor = "rgba(255,255,255,0.08)";
                    e.currentTarget.style.color = "#71717a";
                  }}
                >
                  <X size={14} />
                </button>
              </motion.div>

              {/* Toggle row — neumorphic card */}
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.15, duration: 0.25 }}
                style={{
                  display: "flex", alignItems: "center", justifyContent: "space-between", gap: 16,
                  padding: "14px 16px", borderRadius: 12,
                  background: "rgba(255,255,255,0.03)",
                  border: "1px solid rgba(255,255,255,0.06)",
                }}
              >
                <div>
                  <span style={{ fontSize: 13, fontWeight: 600, color: "#e4e4e7" }}>
                    Fechar automaticamente
                  </span>
                  <p style={{ fontSize: 11, color: "#71717a", margin: "3px 0 0" }}>
                    {autoCollapse ? "Menu recolhe após inatividade" : "Menu permanece aberto"}
                  </p>
                </div>
                <button
                  type="button" role="switch" aria-checked={autoCollapse}
                  onClick={() => onAutoCollapseChange(!autoCollapse)}
                  style={{
                    width: 48, height: 26, borderRadius: 13,
                    border: `1px solid ${autoCollapse ? "rgba(255,7,58,0.4)" : "rgba(255,255,255,0.12)"}`,
                    background: autoCollapse
                      ? "linear-gradient(135deg, #FF073A, #B20028)"
                      : "rgba(255,255,255,0.06)",
                    padding: 3, cursor: "pointer", flexShrink: 0,
                    transition: "all .25s ease",
                    boxShadow: autoCollapse
                      ? "0 0 16px rgba(255,7,58,0.25), inset 0 1px 0 rgba(255,255,255,0.15)"
                      : "inset 0 1px 3px rgba(0,0,0,0.3)",
                  }}
                >
                  <motion.span
                    animate={{ x: autoCollapse ? 22 : 0 }}
                    transition={{ type: "spring", damping: 20, stiffness: 300 }}
                    style={{
                      display: "block", width: 18, height: 18, borderRadius: "50%",
                      background: "#fff",
                      boxShadow: "0 2px 6px rgba(0,0,0,0.25)",
                    }}
                  />
                </button>
              </motion.div>

              {/* Slider section — neumorphic card */}
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: autoCollapse ? 1 : 0.35, y: 0 }}
                transition={{ delay: 0.2, duration: 0.25 }}
                style={{
                  marginTop: 12, padding: "16px 16px 14px", borderRadius: 12,
                  background: "rgba(255,255,255,0.03)",
                  border: "1px solid rgba(255,255,255,0.06)",
                  transition: "opacity .25s",
                }}
              >
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: 14 }}>
                  <span style={{ fontSize: 12, fontWeight: 600, color: "#a1a1aa" }}>
                    Tempo para fechar
                  </span>
                  <div style={{ display: "flex", alignItems: "baseline", gap: 4 }}>
                    <motion.span
                      key={seconds}
                      initial={{ opacity: 0, y: -8 }}
                      animate={{ opacity: 1, y: 0 }}
                      style={{
                        fontSize: 22, fontWeight: 800, color: "#FF073A",
                        fontFamily: "'Saira Expanded', sans-serif",
                        lineHeight: 1,
                      }}
                    >
                      {seconds}
                    </motion.span>
                    <span style={{ fontSize: 12, fontWeight: 600, color: "#71717a" }}>seg</span>
                  </div>
                </div>

                {/* Custom slider track */}
                <div style={{ position: "relative", height: 6, borderRadius: 3, marginBottom: 10 }}>
                  {/* Background track */}
                  <div style={{
                    position: "absolute", inset: 0, borderRadius: 3,
                    background: "rgba(255,255,255,0.08)",
                    boxShadow: "inset 0 1px 3px rgba(0,0,0,0.4)",
                  }} />
                  {/* Filled portion */}
                  <motion.div
                    animate={{ width: `${pct}%` }}
                    transition={{ type: "spring", damping: 20, stiffness: 200 }}
                    style={{
                      position: "absolute", top: 0, left: 0, height: "100%",
                      borderRadius: 3,
                      background: "linear-gradient(90deg, #FF073A, #B20028)",
                      boxShadow: "0 0 10px rgba(255,7,58,0.3)",
                    }}
                  />
                  {/* Native input (invisible, for interaction) */}
                  <input
                    type="range" className="sb-range"
                    min={1} max={30} step={1} value={seconds}
                    disabled={!autoCollapse}
                    onChange={(e) => onSecondsChange(Number(e.target.value))}
                    style={{
                      position: "absolute", inset: 0, width: "100%",
                      opacity: 0, cursor: autoCollapse ? "pointer" : "not-allowed",
                      margin: 0,
                    }}
                  />
                  {/* Custom thumb */}
                  <motion.div
                    animate={{ left: `${pct}%` }}
                    transition={{ type: "spring", damping: 20, stiffness: 200 }}
                    style={{
                      position: "absolute", top: "50%",
                      width: 18, height: 18, borderRadius: "50%",
                      background: "#fff",
                      border: "2px solid #FF073A",
                      boxShadow: "0 2px 8px rgba(255,7,58,0.3), 0 1px 3px rgba(0,0,0,0.2)",
                      transform: "translate(-50%, -50%)",
                      pointerEvents: "none",
                    }}
                  />
                </div>

                <div style={{
                  display: "flex", justifyContent: "space-between",
                  fontSize: 10, fontWeight: 600, color: "#52525b",
                  letterSpacing: "0.05em",
                }}>
                  <span>1s</span>
                  <span>15s</span>
                  <span>30s</span>
                </div>
              </motion.div>

              {/* Status indicator */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.3 }}
                style={{
                  marginTop: 16, display: "flex", alignItems: "center", gap: 8,
                  justifyContent: "center",
                }}
              >
                <div style={{
                  width: 6, height: 6, borderRadius: "50%",
                  background: autoCollapse ? "#FF073A" : "#52525b",
                  boxShadow: autoCollapse ? "0 0 8px rgba(255,7,58,0.5)" : "none",
                  transition: "all .3s",
                }} />
                <span style={{ fontSize: 11, color: "#71717a", fontWeight: 500 }}>
                  {autoCollapse ? `Ativo — recolhe em ${seconds}s de inatividade` : "Desativado"}
                </span>
              </motion.div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>,
    document.body,
  );
}

/* ═══════════════════════════════════════════════
   SidebarItem
   ═══════════════════════════════════════════════ */
function SidebarItem({
  item, badges, mini, dark, onAction,
}: {
  item: AppMenuItem;
  badges: SidebarBadges;
  mini: boolean;
  dark: boolean;
  onAction?: (a: string) => void;
}) {
  const [location] = useLocation();
  const [hovered, setHovered] = useState(false);

  const badgeCount = item.badge ? badges[item.badge] : 0;
  const hasChildren = !!item.children?.length;
  const isActive = Boolean(
    (item.href && routePathMatches(location, item.href)) ||
      (hasChildren &&
        item.children!.some((c) => c.href && routePathMatches(location, c.href))),
  );

  const linkHref = !item.action ? getPrimaryNavHref(item) : undefined;

  const D = SB_ICON_TILE_DARK;
  const L = SB_ICON_TILE_LIGHT;

  const tileBorder = isActive
    ? D.borderActive
    : hovered
      ? D.borderHover
      : dark
        ? D.borderIdle
        : L.borderIdle;

  const tileBackground =
    isActive || hovered ? D.bgHover : dark ? D.bgIdle : L.bgIdle;

  const tileShadow =
    !isActive && !hovered
      ? dark
        ? D.shadowIdle
        : L.shadowIdle
      : isActive
        ? D.shadowActive
        : D.shadowHover;

  const tileIconColor =
    isActive || hovered ? D.iconOnAccent : dark ? D.iconIdle : L.iconIdle;

  const content = (
    <div
      className="flex items-center cursor-pointer"
      title={mini ? item.label : undefined}
      style={{
        gap: mini ? 0 : 12,
        padding: mini ? "8px 0" : "6px 12px",
        margin: mini ? "2px 8px" : "1px 8px",
        borderRadius: 8,
        justifyContent: mini ? "center" : "flex-start",
        transition: "background .15s",
      }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      onClick={() => {
        if (item.action && onAction) onAction(item.action);
      }}
    >
      {/* Icon */}
      <div
        className="relative flex flex-shrink-0 items-center justify-center overflow-hidden"
        style={{
          width: 36,
          height: 36,
          borderRadius: 10,
          border: `1px solid ${tileBorder}`,
          background: tileBackground,
          boxShadow: tileShadow,
          transform: hovered && !isActive ? "translateY(-1px)" : "none",
          transition: isActive || hovered ? "all .3s ease" : "all .25s ease",
        }}
      >
        <div style={{
          position: "absolute", inset: 0,
          background: hovered || isActive ? SHIMMER_ON_RED : SHIMMER_ACCENT,
          transform: hovered || isActive ? "translateX(0)" : "translateX(-100%)",
          animation: hovered || isActive ? "shimmerSweep .5s ease forwards" : "none",
          pointerEvents: "none",
        }} />
        <item.icon
          size={17}
          style={{
            position: "relative",
            zIndex: 1,
            color: tileIconColor,
            transition: "color .2s",
          }}
        />
      </div>

      {/* Label */}
      {!mini && (
        <span style={{
          fontSize: 13, fontWeight: isActive ? 600 : 400,
          letterSpacing: ".01em", flex: 1,
          color: dark
            ? isActive
              ? "#fafafa"
              : hovered
                ? "#d4d4d8"
                : "#a1a1aa"
            : isActive
              ? "#002A68"
              : hovered
                ? "#1d4ed8"
                : "#404040",
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
    </div>
  );

  return (
    <div>
      {linkHref ? <Link href={linkHref}>{content}</Link> : content}
    </div>
  );
}

/* ═══════════════════════════════════════════════
   Sidebar
   ═══════════════════════════════════════════════ */
export function Sidebar({ onHoveringChange }: { onHoveringChange?: (hovering: boolean) => void }) {
  const { dark } = useTecnopanoTheme();
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
    onHoveringChange?.(true);
    clearTimer();
  }, [clearTimer, onHoveringChange]);

  const onLeave = useCallback(() => {
    setHovering(false);
    onHoveringChange?.(false);
    if (autoCollapse && !modalOpen) startTimer();
  }, [autoCollapse, modalOpen, startTimer, onHoveringChange]);

  const onAction = useCallback((a: string) => {
    if (a === "autoCollapse") setModalOpen(true);
  }, []);

  // ── Visual state ──
  const mini = collapsed && !hovering;

  const perfil = useAppUserPerfil();
  const filteredMenu = filterMenuByPerfil(APP_MENU, perfil);

  return (
    <>
      <aside
        className={cn("bg-muted/30 dark:bg-[#1A1A1A]")}
        onMouseEnter={onEnter}
        onMouseLeave={onLeave}
        style={{
          position: "fixed", left: 0, top: 0,
          width: mini ? W_MINI : W_FULL,
          height: "100vh",
          display: "flex", flexDirection: "column",
          borderRight: dark ? "1px solid rgba(255,255,255,0.06)" : "1px solid #e5e5e5",
          transition: "width .25s cubic-bezier(.4,0,.2,1), background-color .25s ease, border-color .25s ease",
          zIndex: 30,
          /* Sem sombra à direita: evita “degrau” sobre o main ao colapsar/expandir ou hover no rail. */
          boxShadow: "none",
          overflow: "hidden",
        }}
      >
        {/* Logo — rail expandido: faixa mais alta para logo horizontal ocupar largura/altura como no dark */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            height: mini ? 56 : dark ? 80 : 80,
            flexShrink: 0,
            padding: mini ? 0 : dark ? "2px 4px" : "2px 4px",
            boxSizing: "border-box",
            overflow: "hidden",
            /* Dark: sem linha por baixo — fundava com o nav e evitava “risco”/degrau visual */
            borderBottom: dark ? "none" : "1px solid #e5e5e5",
          }}
        >
          {mini ? (
            <img
              src={dark ? "/src/assets/logo-30anos.png" : logoCollapsedLight}
              alt="Tecnopano 30 Anos"
              style={{
                width: 40,
                height: 40,
                maxWidth: "100%",
                objectFit: "contain",
                objectPosition: "center",
                borderRadius: dark ? 10 : 12,
                display: "block",
                flexShrink: 0,
              }}
            />
          ) : (
            <img
              src={dark ? "/src/assets/logo-sidebar-dark.png" : "/src/assets/logo-light-full.png"}
              alt="Tecnopano"
              style={{
                display: "block",
                maxWidth: "100%",
                maxHeight: 78,
                width: "auto",
                height: "auto",
                objectFit: "contain",
                objectPosition: "center",
              }}
            />
          )}
        </div>

        {/* Nav */}
        <nav className="sb-nav" style={{
          flex: 1, overflowY: "auto", overflowX: "hidden",
          padding: "12px 0",
          scrollbarWidth: "none",
        }}>
          {filteredMenu.map((item) => (
            <SidebarItem key={item.href ?? item.label}
              item={item} badges={badges} mini={mini} dark={dark} onAction={onAction} />
          ))}
        </nav>

        {/* Logout */}
        <div style={{ borderTop: dark ? "1px solid rgba(255,255,255,0.06)" : "1px solid #e5e5e5", padding: "10px 12px 16px" }}>
          <button
            style={{
              display: "flex", alignItems: "center", gap: mini ? 0 : 12,
              justifyContent: mini ? "center" : "flex-start",
              width: "100%", padding: "8px", borderRadius: 8,
              background: "none", border: "none", cursor: "pointer",
              color: dark ? "#52525b" : "#737373", transition: "color .2s",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.color = dark ? "#FF073A" : "#2563EB";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.color = dark ? "#52525b" : "#737373";
            }}
          >
            <LogOut size={17} />
            {!mini && <span style={{ fontSize: 13, fontWeight: 500 }}>Sair</span>}
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
