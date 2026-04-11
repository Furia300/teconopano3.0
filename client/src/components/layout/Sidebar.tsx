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
              boxShadow: "0 1px 3px rgba(0,0,0,.12)",
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
              src={dark ? "/src/assets/logo-dark-full.png" : "/src/assets/logo-light-full.png"}
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
