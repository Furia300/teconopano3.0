import { useState, useMemo, useEffect, useRef } from "react";
import type { DashboardData } from "@/types/dashboard";
import { FipsJunctionLines, PageHero } from "@/composites/PageHero";
import { shellDarkGlassPanel } from "@/lib/docHeaderChrome";
import { DashboardPrintButton } from "@/components/domain/DashboardPrintButton";

type Props = { data: DashboardData };

function isValidFilterOption(value: string | undefined | null) {
  if (!value) return false;
  const normalized = String(value).trim().toLowerCase();
  return normalized !== "*" && normalized !== "-" && normalized !== "null" && normalized !== "undefined" && normalized !== "n/a";
}

/* ═══ DARK MODE HOOK ═══ */
function useDark() {
  const [dark, setDark] = useState(() => typeof document !== "undefined" && document.documentElement.classList.contains("dark"));
  useEffect(() => {
    const el = document.documentElement;
    const obs = new MutationObserver(() => setDark(el.classList.contains("dark")));
    obs.observe(el, { attributes: true, attributeFilter: ["class"] });
    return () => obs.disconnect();
  }, []);
  return dark;
}

/* ═══ COLORS (FIPS tokens — light + dark) ═══ */
const LIGHT = {
  azulProfundo: "#004B9B", azulEscuro: "#002A68", azulClaro: "#658EC9",
  cinzaChumbo: "#7B8C96", cinzaEscuro: "#333B41", cinzaClaro: "#C0CCD2",
  azulCeu: "#93BDE4", azulCeuClaro: "#D3E3F4",
  amareloOuro: "#FDC24E", amareloEscuro: "#F6921E",
  verdeFloresta: "#00C64C", verdeEscuro: "#00904C",
  danger: "#ed1b24",
  branco: "#FFFFFF", bg: "#F2F4F8",
  cardBg: "#FFFFFF", cardBorder: "#E2E8F0",
  textMuted: "#64748B", textLight: "#94A3B8",
};
const DARK = {
  azulProfundo: "#5B9BD5", azulEscuro: "#E2E8F0", azulClaro: "#7EAED6",
  cinzaChumbo: "#8B95A0", cinzaEscuro: "#E2E2E8", cinzaClaro: "#4A4A5A",
  azulCeu: "#5B9BD5", azulCeuClaro: "#252525",
  amareloOuro: "#FDC24E", amareloEscuro: "#F6921E",
  verdeFloresta: "#34D870", verdeEscuro: "#34D870",
  danger: "#FF073A",
  branco: "#FFFFFF", bg: "#1A1A1A",
  cardBg: "#222222", cardBorder: "#2E2E2E",
  textMuted: "#6B7280", textLight: "#4B5563",
};
/* Module-level reactive color ref — updated by DashboardRHDedicado on each render */
let C = LIGHT;
const Fn = { title: "'Saira Expanded',sans-serif", body: "'Open Sans',sans-serif", mono: "'Fira Code',monospace" };

/* ═══ SVG ICONS ═══ */
const Ic = {
  truck: (s: number, c: string) => <svg width={s} height={s} viewBox="0 0 20 20" fill="none"><rect x="1" y="6" width="11" height="9" rx="1.5" stroke={c} strokeWidth="1.4"/><path d="M12 9h4l2.5 3v3h-6.5" stroke={c} strokeWidth="1.4" strokeLinejoin="round"/><circle cx="5" cy="16" r="1.5" stroke={c} strokeWidth="1.3"/><circle cx="15.5" cy="16" r="1.5" stroke={c} strokeWidth="1.3"/></svg>,
  factory: (s: number, c: string) => <svg width={s} height={s} viewBox="0 0 20 20" fill="none"><path d="M2 18V8l4-3v5l4-3v5l4-3v8H2z" stroke={c} strokeWidth="1.4" strokeLinejoin="round"/><rect x="14" y="2" width="4" height="16" rx="1" stroke={c} strokeWidth="1.4"/></svg>,
  warehouse: (s: number, c: string) => <svg width={s} height={s} viewBox="0 0 20 20" fill="none"><path d="M2 8l8-5 8 5v10H2V8z" stroke={c} strokeWidth="1.4" strokeLinejoin="round"/><rect x="7" y="12" width="6" height="6" rx="1" stroke={c} strokeWidth="1.3"/></svg>,
  package: (s: number, c: string) => <svg width={s} height={s} viewBox="0 0 20 20" fill="none"><path d="M3 6l7-4 7 4v8l-7 4-7-4V6z" stroke={c} strokeWidth="1.4" strokeLinejoin="round"/><path d="M3 6l7 4 7-4M10 10v8" stroke={c} strokeWidth="1.3"/></svg>,
  dollar: (s: number, c: string) => <svg width={s} height={s} viewBox="0 0 20 20" fill="none"><circle cx="10" cy="10" r="8" stroke={c} strokeWidth="1.5"/><path d="M10 4v12M7 7.5c0-1 1.5-2 3-2s3 .5 3 2-1 2-3 2.5-3 1-3 2.5 1.5 2 3 2 3-1 3-2" stroke={c} strokeWidth="1.3" strokeLinecap="round"/></svg>,
  file: (s: number, c: string) => <svg width={s} height={s} viewBox="0 0 20 20" fill="none"><path d="M6 2h6l5 5v10a1 1 0 01-1 1H6a1 1 0 01-1-1V3a1 1 0 011-1z" stroke={c} strokeWidth="1.5" strokeLinejoin="round"/><path d="M12 2v5h5" stroke={c} strokeWidth="1.5"/></svg>,
  scissors: (s: number, c: string) => <svg width={s} height={s} viewBox="0 0 20 20" fill="none"><circle cx="5" cy="5" r="2.5" stroke={c} strokeWidth="1.4"/><circle cx="5" cy="15" r="2.5" stroke={c} strokeWidth="1.4"/><path d="M7 6.5L17 16M7 13.5L17 4" stroke={c} strokeWidth="1.4" strokeLinecap="round"/></svg>,
  droplets: (s: number, c: string) => <svg width={s} height={s} viewBox="0 0 20 20" fill="none"><path d="M10 2c-3 4-5 6-5 9a5 5 0 0010 0c0-3-2-5-5-9z" stroke={c} strokeWidth="1.5" strokeLinejoin="round"/></svg>,
  users: (s: number, c: string) => <svg width={s} height={s} viewBox="0 0 20 20" fill="none"><circle cx="7" cy="6" r="3" stroke={c} strokeWidth="1.4"/><path d="M1 17c0-3 2.5-5 6-5s6 2 6 5" stroke={c} strokeWidth="1.4" strokeLinecap="round"/><circle cx="14" cy="7" r="2" stroke={c} strokeWidth="1.2"/><path d="M15 12c2 .5 4 2 4 4" stroke={c} strokeWidth="1.2" strokeLinecap="round"/></svg>,
  arrowUp: (s: number, c: string) => <svg width={s} height={s} viewBox="0 0 16 16" fill="none"><path d="M8 12V4M5 7l3-3 3 3" stroke={c} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/></svg>,
  arrowDown: (s: number, c: string) => <svg width={s} height={s} viewBox="0 0 16 16" fill="none"><path d="M8 4v8M5 9l3 3 3-3" stroke={c} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/></svg>,
  chart: (s: number, c: string) => <svg width={s} height={s} viewBox="0 0 20 20" fill="none"><rect x="3" y="10" width="3" height="7" rx="1" stroke={c} strokeWidth="1.3"/><rect x="8.5" y="6" width="3" height="11" rx="1" stroke={c} strokeWidth="1.3"/><rect x="14" y="3" width="3" height="14" rx="1" stroke={c} strokeWidth="1.3"/></svg>,
  grid: (s: number, c: string) => <svg width={s} height={s} viewBox="0 0 20 20" fill="none"><rect x="2" y="2" width="7" height="7" rx="1.5" stroke={c} strokeWidth="1.4"/><rect x="11" y="2" width="7" height="7" rx="1.5" stroke={c} strokeWidth="1.4"/><rect x="2" y="11" width="7" height="7" rx="1.5" stroke={c} strokeWidth="1.4"/><rect x="11" y="11" width="7" height="7" rx="1.5" stroke={c} strokeWidth="1.4"/></svg>,
  clock: (s: number, c: string) => <svg width={s} height={s} viewBox="0 0 20 20" fill="none"><circle cx="10" cy="10" r="8" stroke={c} strokeWidth="1.5"/><path d="M10 5.5V10l3 2" stroke={c} strokeWidth="1.5" strokeLinecap="round"/></svg>,
  alert: (s: number, c: string) => <svg width={s} height={s} viewBox="0 0 20 20" fill="none"><path d="M10 2L1.5 17h17L10 2z" stroke={c} strokeWidth="1.5" strokeLinejoin="round"/><path d="M10 8v4M10 14v.5" stroke={c} strokeWidth="1.8" strokeLinecap="round"/></svg>,
  check: (s: number, c: string) => <svg width={s} height={s} viewBox="0 0 20 20" fill="none"><circle cx="10" cy="10" r="8" stroke={c} strokeWidth="1.5"/><path d="M7 10l2 2 4-4" stroke={c} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>,
  map: (s: number, c: string) => <svg width={s} height={s} viewBox="0 0 20 20" fill="none"><path d="M10 2C6.7 2 4 4.7 4 8c0 5 6 10 6 10s6-5 6-10c0-3.3-2.7-6-6-6z" stroke={c} strokeWidth="1.5"/><circle cx="10" cy="8" r="2" stroke={c} strokeWidth="1.3"/></svg>,
  scale: (s: number, c: string) => <svg width={s} height={s} viewBox="0 0 20 20" fill="none"><path d="M10 2v16M3 6l7-2 7 2M3 6l2 6h-4L3 6zM17 6l2 6h-4L17 6z" stroke={c} strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round"/></svg>,
  x: (s: number, c: string) => <svg width={s} height={s} viewBox="0 0 16 16" fill="none"><path d="M4 4l8 8M12 4l-8 8" stroke={c} strokeWidth="1.8" strokeLinecap="round"/></svg>,
  edificio: (s: number, c: string) => <svg width={s} height={s} viewBox="0 0 20 20" fill="none"><rect x="3" y="2" width="14" height="16" rx="1.5" stroke={c} strokeWidth="1.5"/><path d="M7 6h2M11 6h2M7 10h2M11 10h2M8 14h4v4H8z" stroke={c} strokeWidth="1.3" strokeLinecap="round"/></svg>,
  flag: (s: number, c: string) => <svg width={s} height={s} viewBox="0 0 20 20" fill="none"><path d="M4 2v16M4 2h10l-3 4 3 4H4" stroke={c} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>,
};

function JunctionLines({ style }: { style?: React.CSSProperties }) {
  return (
    <svg viewBox="0 0 320 200" fill="none" style={{ opacity: .12, ...style }} aria-hidden>
      <defs>
        <linearGradient id="curtainL" x1="148" y1="18" x2="78" y2="178" gradientUnits="userSpaceOnUse">
          <stop offset="0" stopColor="rgba(255,255,255,0.30)" />
          <stop offset="1" stopColor="rgba(255,255,255,0.06)" />
        </linearGradient>
        <linearGradient id="curtainR" x1="172" y1="18" x2="242" y2="178" gradientUnits="userSpaceOnUse">
          <stop offset="0" stopColor="rgba(255,255,255,0.30)" />
          <stop offset="1" stopColor="rgba(255,255,255,0.06)" />
        </linearGradient>
        <linearGradient id="windowPane" x1="160" y1="28" x2="160" y2="170" gradientUnits="userSpaceOnUse">
          <stop offset="0" stopColor="rgba(255,255,255,0.10)" />
          <stop offset="1" stopColor="rgba(255,255,255,0.03)" />
        </linearGradient>
      </defs>

      {/* janela aberta */}
      <path d="M160 22V168" stroke="rgba(255,255,255,0.16)" strokeWidth="1.6" />
      <path d="M102 95H218" stroke="rgba(255,255,255,0.16)" strokeWidth="1.6" />

      {/* varão */}
      <path d="M82 32H238" stroke="rgba(255,255,255,0.24)" strokeWidth="3" strokeLinecap="round" />

      {/* pano esquerdo */}
      <path d="M106 44C118 58 122 74 122 92C122 112 114 134 96 156" stroke="rgba(255,255,255,0.20)" strokeWidth="1.5" strokeLinecap="round" />
      <path d="M90 56C100 70 102 86 100 106" stroke="rgba(255,255,255,0.16)" strokeWidth="1.2" strokeLinecap="round" />

      {/* pano direito */}
      <path d="M232 34C208 48 198 66 194 86C190 108 198 132 224 170L248 170C230 138 224 112 228 90C232 70 240 52 252 40L232 34Z" fill="url(#curtainR)" />
      <path d="M214 44C202 58 198 74 198 92C198 112 206 134 224 156" stroke="rgba(255,255,255,0.20)" strokeWidth="1.5" strokeLinecap="round" />
      <path d="M230 56C220 70 218 86 220 106" stroke="rgba(255,255,255,0.16)" strokeWidth="1.2" strokeLinecap="round" />

      {/* abraçadeiras — acento ouro FIPS */}
      <rect x="116" y="110" width="12" height="4" rx="2" fill="rgba(253,194,78,0.45)" />
      <rect x="192" y="110" width="12" height="4" rx="2" fill="rgba(253,194,78,0.45)" />
    </svg>
  );
}

/* ═══ DS FIPS Select ═══ */
function DSSelect({ label, value, onChange, options, placeholder = "Todos", icon }: { label?: string; value: string | null; onChange: (v: string | null) => void; options: string[]; placeholder?: string; icon?: React.ReactNode }) {
  const [open, setOpen] = useState(false);
  const [hi, setHi] = useState(-1);
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => { const h = (e: MouseEvent) => { if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false) }; document.addEventListener("mousedown", h); return () => document.removeEventListener("mousedown", h) }, []);
  const bc = open ? C.azulProfundo : "#CBD5E1";
  return (
    <div ref={ref} style={{ display: "flex", flexDirection: "column", minWidth: 0, position: "relative", zIndex: open ? 400 : 1 }}>
      {label && <label style={{ fontSize: 11, fontWeight: 600, color: C.cinzaEscuro, fontFamily: Fn.body, marginBottom: 1, marginLeft: 7 }}>{label}</label>}
      <div onClick={() => setOpen(!open)} style={{ display: "flex", alignItems: "center", gap: 8, height: 30, padding: "0 12px", background: C.cardBg, border: `1.5px solid ${bc}`, borderRadius: open ? "8px 8px 0 0" : 8, transition: "all .18s", boxShadow: open ? "0 0 0 3px rgba(147,189,228,0.35)" : "none", cursor: "pointer", fontFamily: Fn.body, fontSize: 12, userSelect: "none" }}>
        {icon && <span style={{ display: "flex", flexShrink: 0, opacity: .55 }}>{icon}</span>}
        <span style={{ flex: 1, color: value ? C.cinzaEscuro : C.textLight, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", fontWeight: 600 }}>{value || placeholder}</span>
        <svg width={14} height={14} viewBox="0 0 20 20" fill="none" style={{ flexShrink: 0, opacity: .45, transition: "transform .2s", transform: open ? "rotate(180deg)" : "rotate(0)" }}><path d="M6 8l4 4 4-4" stroke={C.cinzaChumbo} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" /></svg>
      </div>
      {open && <div style={{ position: "absolute", top: "100%", left: 0, right: 0, zIndex: 20, background: C.cardBg, border: `1.5px solid ${C.azulProfundo}`, borderTop: "none", borderRadius: "0 0 8px 8px", boxShadow: "0 6px 20px rgba(0,75,155,.12)", maxHeight: 200, overflowY: "auto" }}>
        <div onClick={() => { onChange(null); setOpen(false) }} style={{ padding: "6px 14px", fontSize: 12, fontFamily: Fn.body, color: !value ? C.azulProfundo : C.cinzaEscuro, fontWeight: !value ? 600 : 400, background: !value ? C.azulCeuClaro : "transparent", cursor: "pointer" }}>{placeholder}</div>
        {options.map((o, i) => { const sel = o === value; return <div key={o} onClick={() => { onChange(o); setOpen(false) }} onMouseEnter={() => setHi(i)} onMouseLeave={() => setHi(-1)} style={{ padding: "6px 14px", fontSize: 12, fontFamily: Fn.body, color: sel ? C.azulProfundo : C.cinzaEscuro, fontWeight: sel ? 600 : 400, background: sel ? C.azulCeuClaro : i === hi ? C.bg : "transparent", cursor: "pointer", display: "flex", alignItems: "center", gap: 8 }}>
          {sel && <svg width={12} height={12} viewBox="0 0 16 16" fill="none" style={{ marginLeft: -14, flexShrink: 0 }}><path d="M3.5 8.5L6.5 11.5L12.5 4.5" stroke={C.azulProfundo} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" /></svg>}
          {o}
        </div> })}
      </div>}
    </div>
  );
}

function DSDateField({
  label,
  value,
  onChange,
  placeholder = "dd/mm/aaaa",
  icon,
}: {
  label: string;
  value: string | null;
  onChange: (v: string | null) => void;
  placeholder?: string;
  icon?: React.ReactNode;
}) {
  const [text, setText] = useState(formatIsoToBr(value));
  useEffect(() => setText(formatIsoToBr(value)), [value]);
  return (
    <div style={{ display: "flex", flexDirection: "column", minWidth: 0, position: "relative", zIndex: 1 }}>
      <label style={{ fontSize: 11, fontWeight: 600, color: C.cinzaEscuro, fontFamily: Fn.body, marginBottom: 1, marginLeft: 7 }}>{label}</label>
      <div style={{ display: "flex", alignItems: "center", gap: 8, height: 30, padding: "0 12px", background: C.cardBg, border: "1.5px solid #CBD5E1", borderRadius: 8, transition: "all .18s" }}>
        {icon && <span style={{ display: "flex", flexShrink: 0, opacity: .55 }}>{icon}</span>}
        <input
          type="text"
          inputMode="numeric"
          placeholder={placeholder}
          value={text}
          onChange={(e) => {
            const digits = e.target.value.replace(/[^\d]/g, "").slice(0, 8);
            const p1 = digits.slice(0, 2);
            const p2 = digits.slice(2, 4);
            const p3 = digits.slice(4, 8);
            const masked = [p1, p2, p3].filter(Boolean).join("/");
            setText(masked);
            if (digits.length === 8) onChange(parseBrToIso(masked));
            if (digits.length === 0) onChange(null);
          }}
          onBlur={() => {
            const iso = parseBrToIso(text);
            if (!iso) {
              setText("");
              onChange(null);
              return;
            }
            setText(formatIsoToBr(iso));
            onChange(iso);
          }}
          style={{ flex: 1, minWidth: 0, height: 26, border: "none", outline: "none", background: "transparent", color: text ? C.cinzaEscuro : C.textLight, fontFamily: Fn.body, fontSize: 12 }}
        />
      </div>
    </div>
  );
}

/* ═══ SUB-COMPONENTS ═══ */
function Donut({ pct, color, size = 48, stroke = 4 }: { pct: number; color: string; size?: number; stroke?: number }) {
  const r = (size - stroke) / 2; const circ = 2 * Math.PI * r; const off = circ - (pct / 100) * circ;
  return <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} style={{ transform: "rotate(-90deg)" }}><circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke={`${color}18`} strokeWidth={stroke} /><circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke={color} strokeWidth={stroke} strokeDasharray={circ} strokeDashoffset={off} strokeLinecap="round" /></svg>;
}

function ChartTooltip({ title, color, rows, x, y, total }: { title: string; color: string; rows: { label: string; value: number; color?: string }[]; x: number; y: number; total?: number }) {
  const maxVal = Math.max(...rows.map(r => r.value), 1);
  return (
    <div style={{ position: "fixed", left: x + 12, top: y - 10, zIndex: 50, pointerEvents: "none", animation: "fadeUp .15s ease" }}>
      <div style={{ background: C.cardBg, borderRadius: "8px 8px 8px 14px", border: `1px solid ${C.cardBorder}`, boxShadow: "0 8px 30px rgba(0,42,104,.18)", minWidth: 180, maxWidth: 260, overflow: "hidden" }}>
        <div style={{ background: color, padding: "8px 14px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <span style={{ fontSize: 12, fontWeight: 700, color: C.branco, fontFamily: Fn.title }}>{title}</span>
          {total != null && <span style={{ fontSize: 11, fontWeight: 700, color: `${C.branco}CC`, fontFamily: Fn.mono }}>{total}</span>}
        </div>
        <div style={{ padding: "8px 0" }}>
          {rows.map((r, i) => (
            <div key={i} style={{ display: "flex", alignItems: "center", gap: 8, padding: "4px 14px" }}>
              <div style={{ width: 6, height: 6, borderRadius: "50%", background: r.color || color, flexShrink: 0 }} />
              <span style={{ fontSize: 11, color: C.cinzaEscuro, fontFamily: Fn.body, flex: 1, whiteSpace: "nowrap" }}>{r.label}</span>
              <div style={{ width: 50, height: 4, borderRadius: 2, background: `${r.color || color}15`, flexShrink: 0 }}><div style={{ height: 4, borderRadius: 2, background: r.color || color, width: `${(r.value / maxVal) * 100}%` }} /></div>
              <span style={{ fontSize: 11, fontWeight: 700, color: r.color || color, fontFamily: Fn.mono, minWidth: 22, textAlign: "right" }}>{r.value}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

/* ═══ CONSTANTS ═══ */
const DEPT_COLORS = [C.azulProfundo, C.azulCeu, C.verdeFloresta, C.amareloEscuro, C.amareloOuro, C.azulClaro, C.verdeEscuro, C.danger];
const STATUS_COLAB = ["Ativo", "Inativo", "Terceirizado"];
const STATUS_COLAB_COLORS: Record<string, string> = { "Ativo": C.verdeFloresta, "Inativo": C.danger, "Terceirizado": C.azulCeu };
const DEPT_TIPOS = ["PRODUÇÃO", "ADMINISTRATIVO", "LOGÍSTICA", "MANUTENÇÃO", "QUALIDADE", "COMERCIAL"];
const DEPT_TIPO_COLORS = [C.azulProfundo, C.azulCeu, C.verdeFloresta, C.amareloEscuro, C.amareloOuro, C.azulClaro];

function formatIsoToBr(iso: string | null) {
  if (!iso) return "";
  const m = iso.match(/^(\d{4})-(\d{2})-(\d{2})$/);
  if (!m) return "";
  return `${m[3]}/${m[2]}/${m[1]}`;
}
function parseBrToIso(br: string) {
  const raw = br.replace(/[^\d]/g, "");
  if (raw.length !== 8) return null;
  const d = raw.slice(0, 2);
  const m = raw.slice(2, 4);
  const y = raw.slice(4, 8);
  const iso = `${y}-${m}-${d}`;
  const date = new Date(`${iso}T00:00:00`);
  if (Number.isNaN(date.getTime())) return null;
  return iso;
}

function spark(seed: number, trend: "up" | "down") {
  const pts: number[] = []; let v = 40 + (seed % 30);
  for (let i = 0; i < 12; i++) { const d = trend === "up" ? 1.4 : -1.2; const n = Math.sin(seed * 0.31 + i * 0.7) * 8; v = Math.min(92, Math.max(8, v + d + n * 0.15)); pts.push(Math.round(v)); }
  return pts;
}
const MONTHS = ["Jan", "Fev", "Mar", "Abr", "Mai", "Jun", "Jul", "Ago", "Set", "Out", "Nov", "Dez"];

/* ═══════════════════════════════════ MAIN ═══════════════════════════════════ */
export default function DashboardRHDedicado({ data }: Props) {
  const dark = useDark();
  C = dark ? DARK : LIGHT;

  const [w, setW] = useState(typeof window !== "undefined" ? window.innerWidth : 1200);
  useEffect(() => { const h = () => setW(window.innerWidth); window.addEventListener("resize", h); return () => window.removeEventListener("resize", h); }, []);
  const mob = w < 640;

  /* ═══ COLABORADORES DATA ═══ */
  const colaboradores = data.colaboradores || [];

  /* ═══ DERIVED DATA ═══ */
  const allDepartamentos = useMemo(() => [...new Set(colaboradores.map((c: any) => c.departamento).filter(isValidFilterOption))].sort() as string[], [colaboradores]);
  const allCargos = useMemo(() => [...new Set(colaboradores.map((c: any) => c.cargo || c.registration || "").filter(isValidFilterOption))].sort() as string[], [colaboradores]);

  /* ═══ FILTROS ═══ */
  const [filter, setFilter] = useState<Record<string, string | null>>({ departamento: null, status: null, cargo: null, dataInicio: null, dataFim: null });
  const hasFilter = Object.values(filter).some(v => v);
  const setF = (key: string, val: string | null) => setFilter(f => ({ ...f, [key]: val || null }));
  const toggle = (key: string, val: string) => setFilter(f => ({ ...f, [key]: f[key] === val ? null : val }));
  const clearAll = () => setFilter({ departamento: null, status: null, cargo: null, dataInicio: null, dataFim: null });

  /* ═══ FILTERED DATA ═══ */
  const fColabs = useMemo(() => colaboradores.filter((c: any) => {
    if (filter.departamento && c.departamento !== filter.departamento) return false;
    if (filter.status) {
      if (filter.status === "Ativo" && c.status !== 1) return false;
      if (filter.status === "Inativo" && c.status !== 0) return false;
      if (filter.status === "Terceirizado" && c.fonte !== "terceirizado") return false;
    }
    if (filter.cargo) {
      const cargo = c.cargo || c.registration || "";
      if (cargo !== filter.cargo) return false;
    }
    const dataBase = c.createdAt || c.admissao || c.dataAdmissao || c.updatedAt;
    if (filter.dataInicio) {
      if (!dataBase || new Date(dataBase) < new Date(filter.dataInicio)) return false;
    }
    if (filter.dataFim) {
      if (!dataBase || new Date(dataBase) > new Date(`${filter.dataFim}T23:59:59`)) return false;
    }
    return true;
  }), [colaboradores, filter]);

  /* ═══ HOVER STATES ═══ */
  const [hovPipeline, setHovPipeline] = useState(-1);
  const [hovGalpao, setHovGalpao] = useState(-1);
  const [hovMaterial, setHovMaterial] = useState(-1);
  const [hovExpStatus, setHovExpStatus] = useState<number | null>(null);
  const [hovKpiPt, setHovKpiPt] = useState<{ c: number; p: number } | null>(null);
  const [hovKpiCard, setHovKpiCard] = useState(-1);
  const [hovExpRow, setHovExpRow] = useState(-1);
  const [hovColetaStatus, setHovColetaStatus] = useState<number | null>(null);
  const [tipPos, setTipPos] = useState({ x: 0, y: 0 });
  const trackMouse = (e: React.MouseEvent) => setTipPos({ x: e.clientX, y: e.clientY });

  /* ═══ CALCULOS RH ═══ */
  const totalColabs = fColabs.length;
  const ativos = fColabs.filter((c: any) => c.status === 1).length;
  const inativos = fColabs.filter((c: any) => c.status !== 1).length;
  const departamentos = [...new Set(fColabs.map((c: any) => c.departamento).filter(Boolean))];
  const numDepartamentos = departamentos.length;
  const avgPerDept = numDepartamentos > 0 ? Math.round(totalColabs / numDepartamentos) : 0;
  const pctAtivos = totalColabs > 0 ? Math.round(ativos / totalColabs * 100) : 0;
  const pctInativos = totalColabs > 0 ? Math.round(inativos / totalColabs * 100) : 0;
  const terceirizados = fColabs.filter((c: any) => c.fonte === "terceirizado").length;

  /* Department counts for pipeline (top 5) */
  const deptCountMap = new Map<string, number>();
  fColabs.forEach((c: any) => { const d = c.departamento || "Sem Depto"; deptCountMap.set(d, (deptCountMap.get(d) || 0) + 1); });
  const topDepts = [...deptCountMap.entries()].sort((a, b) => b[1] - a[1]).slice(0, 5);
  const topDeptLabels = topDepts.map(d => d[0]);
  const topDeptCounts = topDepts.map(d => d[1]);
  const pipelineColors = [C.azulProfundo, C.azulCeu, C.verdeFloresta, C.amareloEscuro, C.amareloOuro];

  /* Status donut (Colaboradores por Status) */
  const colabByStatus = [
    { label: "Ativo", key: "Ativo", value: fColabs.filter((c: any) => c.status === 1).length, color: C.verdeFloresta },
    { label: "Inativo", key: "Inativo", value: fColabs.filter((c: any) => c.status !== 1 && c.fonte !== "terceirizado").length, color: C.danger },
    { label: "Terceirizado", key: "Terceirizado", value: fColabs.filter((c: any) => c.fonte === "terceirizado").length, color: C.azulCeu },
  ].filter(s => s.value > 0);
  const colabStatusTotal = Math.max(colabByStatus.reduce((a, s) => a + s.value, 0), 1);

  /* Colaboradores por departamento (horizontal bars) */
  const allDeptCounts = [...deptCountMap.entries()].sort((a, b) => b[1] - a[1]).slice(0, 6);
  const maxDeptCount = allDeptCounts[0]?.[1] || 1;

  /* Departamentos por tipo */
  const deptTipoMap = new Map<string, number>();
  fColabs.forEach((c: any) => {
    const dept = (c.departamento || "").toUpperCase();
    let tipo = "OUTROS";
    if (dept.includes("PRODUÇÃO") || dept.includes("PRODUCAO") || dept.includes("PROD")) tipo = "PRODUÇÃO";
    else if (dept.includes("ADMIN") || dept.includes("FINANC") || dept.includes("RH") || dept.includes("CONTAB")) tipo = "ADMINISTRATIVO";
    else if (dept.includes("LOGÍST") || dept.includes("LOGIST") || dept.includes("EXPED") || dept.includes("TRANSP")) tipo = "LOGÍSTICA";
    else if (dept.includes("MANUT")) tipo = "MANUTENÇÃO";
    else if (dept.includes("QUALID")) tipo = "QUALIDADE";
    else if (dept.includes("COMERC") || dept.includes("VEND")) tipo = "COMERCIAL";
    deptTipoMap.set(tipo, (deptTipoMap.get(tipo) || 0) + 1);
  });
  const topTipos = [...deptTipoMap.entries()].sort((a, b) => b[1] - a[1]).slice(0, 6);
  const maxTipo = topTipos[0]?.[1] || 1;

  /* Distribuicao por Status donut (second donut) */
  const statusDistrib = [
    { label: "Ativos", key: "ativos", value: ativos, color: C.verdeFloresta },
    { label: "Inativos", key: "inativos", value: inativos, color: C.amareloEscuro },
  ].filter(s => s.value > 0);
  const statusDistribTotal = Math.max(statusDistrib.reduce((a, s) => a + s.value, 0), 1);

  /* Quadro de atencao RH */
  const deptsComUmaPessoa = [...deptCountMap.entries()].filter(([_, count]) => count === 1).length;
  const taxaInatividade = totalColabs > 0 ? Math.round(inativos / totalColabs * 100) : 0;
  const deptsSemColab = allDepartamentos.length - numDepartamentos;
  const colabsSemDept = fColabs.filter((c: any) => !c.departamento).length;
  const alertasRH = deptsComUmaPessoa + (taxaInatividade > 20 ? 1 : 0) + (colabsSemDept > 0 ? 1 : 0);

  /* KPIs */
  const kpis = [
    { label: "Colaboradores", value: totalColabs, delta: `${ativos} ativos`, up: true, icon: Ic.users, color: C.azulProfundo, sparkPts: spark(totalColabs * 9 + 42, "up") },
    { label: "Ativos", value: ativos, delta: `${pctAtivos}% do total`, up: true, icon: Ic.check, color: C.verdeFloresta, sparkPts: spark(ativos * 11 + 17, "up") },
    { label: "Departamentos", value: numDepartamentos, delta: `${avgPerDept} por dept`, up: true, icon: Ic.edificio, color: C.amareloEscuro, sparkPts: spark(numDepartamentos * 13 + 5, "up") },
    { label: "Inativos", value: inativos, delta: `${pctInativos}% do total`, up: false, icon: Ic.clock, color: C.danger, sparkPts: spark(inativos + 88, "down") },
  ];

  /* Tabela ultimos colaboradores */
  const colabTable = fColabs.slice(-8).reverse();

  /* Tooltip KPI */
  const tipKpiCard = useMemo(() => {
    if (hovKpiCard < 0) return null;
    if (hovKpiCard === 0) return { title: "Colaboradores", color: C.azulProfundo, total: totalColabs, rows: topDepts.slice(0, 4).map(([d, count], i) => ({ label: d, value: count, color: DEPT_COLORS[i] })) };
    if (hovKpiCard === 1) return { title: "Ativos", color: C.verdeFloresta, total: ativos, rows: topDepts.slice(0, 4).map(([d], i) => ({ label: d, value: fColabs.filter((c: any) => c.departamento === d && c.status === 1).length, color: DEPT_COLORS[i] })).filter(r => r.value > 0) };
    if (hovKpiCard === 2) return { title: "Departamentos", color: C.amareloEscuro, total: numDepartamentos, rows: topDepts.slice(0, 4).map(([d, count], i) => ({ label: d, value: count, color: DEPT_COLORS[i] })) };
    return { title: "Inativos", color: C.danger, total: inativos, rows: topDepts.slice(0, 4).map(([d], i) => ({ label: d, value: fColabs.filter((c: any) => c.departamento === d && c.status !== 1).length, color: DEPT_COLORS[i] })).filter(r => r.value > 0) };
  }, [hovKpiCard, fColabs, totalColabs, ativos, inativos, numDepartamentos, topDepts]);

  return (
    <div style={{ minHeight: "100vh", fontFamily: Fn.body, color: C.cinzaEscuro, background: C.bg, transition: "background .3s, color .3s" }}>
      <style>{`@keyframes fadeUp{from{opacity:0;transform:translateY(12px)}to{opacity:1;transform:translateY(0)}}`}</style>

      {/* ═══ HERO ═══ */}
      <div style={{ margin: mob ? "0 12px" : "0 32px" }}>
        <PageHero>
          <div className="relative flex flex-col gap-4 px-6 py-5 sm:flex-row sm:items-center sm:justify-between sm:px-7 sm:py-6">
            <div className="flex items-start gap-4">
              <div className="hidden flex-shrink-0 items-center justify-center sm:flex" style={{ width: 52, height: 52, borderRadius: 14, background: "linear-gradient(135deg, rgba(237,27,36,0.12), rgba(178,0,40,0.06))", border: "1px solid rgba(237,27,36,0.18)" }}>
                {Ic.users(24, "#ed1b24")}
              </div>
              <div className="min-w-0">
                <div style={{ display: "inline-flex", alignItems: "center", gap: 6, background: "rgba(253,194,78,0.16)", border: "1px solid rgba(253,194,78,0.42)", borderRadius: 20, padding: "4px 12px", fontSize: 10, fontWeight: 600, color: C.amareloOuro, marginBottom: 8 }}>RH · Tecnopano 3.0</div>
                <h2 className="font-heading text-xl font-bold tracking-tight text-white sm:text-[22px]" style={{ lineHeight: 1.2 }}>Painel <span style={{ color: C.amareloOuro }}>RH</span></h2>
                <p className="mt-0.5 text-xs text-white/45 sm:text-[13px]">Gestão de Pessoas · {totalColabs} colaboradores · {ativos} ativos · {numDepartamentos} departamentos{hasFilter ? " (filtrado)" : ""}</p>
                <p className="mt-1 text-[10px] text-white/30">{new Date().toLocaleDateString("pt-BR", { weekday: "long", day: "numeric", month: "long", year: "numeric" })}</p>
                <p className="mt-1 text-[10px] text-white/45 tracking-wide">30 anos de atuação · 2.000+ clientes · atendimento nacional · coleta e destinação ambiental</p>
              </div>
            </div>
            <div className="flex flex-shrink-0 flex-col items-end gap-2">
            <DashboardPrintButton title="Dashboard RH" />
            {alertasRH > 0 && (
              <div className="flex flex-shrink-0 flex-col gap-1.5 rounded-lg px-4 py-2.5" style={{ background: "rgba(246,146,30,0.14)", border: "1px solid rgba(246,146,30,0.38)", maxWidth: 260 }}>
                {deptsComUmaPessoa > 0 && (
                  <div className="flex items-center gap-2">
                    {Ic.alert(14, C.amareloEscuro)}
                    <span className="text-[11px] text-white/90">{deptsComUmaPessoa} depto(s) com apenas 1 pessoa</span>
                  </div>
                )}
                {colabsSemDept > 0 && (
                  <div className="flex items-center gap-2">
                    {Ic.alert(14, C.amareloEscuro)}
                    <span className="text-[11px] text-white/90">{colabsSemDept} colaborador(es) sem departamento</span>
                  </div>
                )}
                {taxaInatividade > 20 && (
                  <div className="flex items-center gap-2">
                    {Ic.alert(14, C.danger)}
                    <span className="text-[11px] text-white/90">Taxa de inatividade: {taxaInatividade}%</span>
                  </div>
                )}
              </div>
            )}
            </div>
          </div>
        </PageHero>
      </div>

      <div style={{ padding: mob ? "12px" : "16px 32px" }}>
        {/* ═══ BARRA DE FILTROS (abaixo do hero) ═══ */}
        <div
          style={{
            ...(dark
              ? shellDarkGlassPanel
              : {
                  background: "rgba(255,255,255,0.1)",
                  border: "1px solid rgba(255,255,255,0.15)",
                }),
            borderRadius: 10,
            padding: mob ? "12px" : "14px 20px",
            marginTop: 20,
            marginBottom: 20,
            ...(dark ? {} : { backdropFilter: "blur(8px)", WebkitBackdropFilter: "blur(8px)" }),
            position: "relative",
            zIndex: 300,
            overflow: "visible",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 12 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              {Ic.grid(16, C.azulProfundo)}
              <span style={{ fontSize: 13, fontWeight: 700, color: C.azulEscuro, fontFamily: Fn.title }}>Filtros</span>
              {hasFilter && <span style={{ fontSize: 10, color: C.textMuted }}>· dados filtrados</span>}
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
              <span style={{ fontSize: 10, color: C.textMuted, fontFamily: Fn.body }}>{totalColabs} colaboradores</span>
              {hasFilter && <button onClick={clearAll} style={{ display: "inline-flex", alignItems: "center", gap: 4, padding: "4px 10px", fontSize: 10, fontWeight: 600, color: C.cinzaChumbo, background: C.bg, border: `1px solid ${C.cardBorder}`, borderRadius: 6, cursor: "pointer", fontFamily: Fn.body }}>{Ic.x(10, C.cinzaChumbo)} Limpar</button>}
            </div>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: mob ? "1fr 1fr" : "130px 130px repeat(3,minmax(0,1fr))", gap: mob ? 8 : 12 }}>
            <DSDateField label="Data inicial" value={filter.dataInicio} onChange={(v) => setF("dataInicio", v)} icon={Ic.clock(14, C.cinzaChumbo)} />
            <DSDateField label="Data final" value={filter.dataFim} onChange={(v) => setF("dataFim", v)} icon={Ic.clock(14, C.cinzaChumbo)} />
            <DSSelect label="Departamento" value={filter.departamento} onChange={v => setF("departamento", v)} options={allDepartamentos} icon={Ic.edificio(14, C.cinzaChumbo)} />
            <DSSelect label="Status" value={filter.status} onChange={v => setF("status", v)} options={STATUS_COLAB} placeholder="Todos" icon={Ic.flag(14, C.cinzaChumbo)} />
            <DSSelect label="Cargo" value={filter.cargo} onChange={v => setF("cargo", v)} options={allCargos} placeholder="Todos" icon={Ic.users(14, C.cinzaChumbo)} />
          </div>
        </div>


        {/* ═══ ACTIVE FILTER BADGES ═══ */}
        {hasFilter && (
          <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 14, flexWrap: "wrap" }}>
            {filter.departamento && <span style={{ padding: "3px 8px", fontSize: 10, fontWeight: 600, color: C.azulProfundo, background: `${C.azulProfundo}10`, borderRadius: 4, fontFamily: Fn.body }}>Departamento: {filter.departamento}</span>}
            {filter.status && <span style={{ padding: "3px 8px", fontSize: 10, fontWeight: 600, color: STATUS_COLAB_COLORS[filter.status] || C.azulProfundo, background: `${STATUS_COLAB_COLORS[filter.status] || C.azulProfundo}10`, borderRadius: 4, fontFamily: Fn.body }}>Status: {filter.status}</span>}
            {filter.cargo && <span style={{ padding: "3px 8px", fontSize: 10, fontWeight: 600, color: C.verdeFloresta, background: `${C.verdeFloresta}10`, borderRadius: 4, fontFamily: Fn.body }}>Cargo: {filter.cargo}</span>}
            {(filter.dataInicio || filter.dataFim) && <span style={{ padding: "3px 8px", fontSize: 10, fontWeight: 600, color: C.cinzaChumbo, background: `${C.cinzaChumbo}12`, borderRadius: 4, fontFamily: Fn.body }}>Período: {filter.dataInicio || "…"} até {filter.dataFim || "…"}</span>}
          </div>
        )}

        {/* ═══ KPIs ═══ */}
        <div style={{ display: "grid", gridTemplateColumns: mob ? "repeat(2,1fr)" : "repeat(4,1fr)", gap: mob ? 10 : 16, marginBottom: mob ? 16 : 24 }}>
          {kpis.map((k, i) => {
            const max = Math.max(...k.sparkPts), min = Math.min(...k.sparkPts);
            const sw2 = 200, sh = 40;
            const pts = k.sparkPts.map((v, j) => ({ x: (j / (k.sparkPts.length - 1)) * sw2, y: sh - ((v - min) / (max - min || 1)) * (sh - 8) + 4 }));
            const line = pts.map(p => `${p.x},${p.y}`).join(" ");
            const uid = k.color.replace('#', '') + 'k' + i;
            const hovPt = hovKpiPt && hovKpiPt.c === i ? hovKpiPt.p : -1;
            return (
              <div
                key={i}
                onMouseEnter={() => setHovKpiCard(i)}
                onMouseLeave={() => setHovKpiCard(-1)}
                onMouseMove={trackMouse}
                style={{
                  ...(dark
                    ? { ...shellDarkGlassPanel, boxShadow: "none" }
                    : {
                        background: C.cardBg,
                        border: `1px solid ${C.cardBorder}`,
                        boxShadow: "0 1px 3px rgba(0,75,155,0.04)",
                      }),
                  borderRadius: "12px 12px 12px 24px",
                  animation: `fadeUp .35s ease ${i * 0.06}s both`,
                  position: "relative",
                }}
              >
                <div style={{ padding: mob ? "14px 12px 6px" : "18px 20px 6px", position: "relative", zIndex: 2 }}>
                  <div style={{ position: "absolute", top: mob ? 12 : 16, right: mob ? 10 : 16, width: mob ? 34 : 40, height: mob ? 34 : 40, borderRadius: mob ? 9 : 12, background: `${k.color}0F`, border: `1px solid ${k.color}22`, display: "flex", alignItems: "center", justifyContent: "center" }}>{k.icon(mob ? 16 : 20, k.color)}</div>
                  <span style={{ fontSize: 10, fontWeight: 700, letterSpacing: "0.06em", textTransform: "uppercase", color: C.cinzaChumbo, display: "block", marginBottom: mob ? 6 : 8, fontFamily: Fn.title }}>{k.label}</span>
                  <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-start", gap: 6, paddingRight: mob ? 40 : 48 }}>
                    <span style={{ fontSize: mob ? 22 : 26, fontWeight: 800, fontFamily: Fn.title, color: C.azulEscuro, lineHeight: 1, letterSpacing: "-0.02em" }}>{k.value}</span>
                    <span style={{ fontSize: 11, fontWeight: 600, fontFamily: Fn.body, color: C.textMuted, lineHeight: 1.35, maxWidth: "100%" }}>
                      <span style={{ color: k.up ? C.verdeEscuro : C.amareloEscuro, fontFamily: Fn.mono, fontWeight: 700 }}>{k.up ? "▲ " : "▼ "}</span>
                      {k.delta}
                    </span>
                  </div>
                </div>
                <div style={{ overflow: "hidden", borderRadius: "0 0 12px 24px", marginLeft: -1, marginRight: -1, marginBottom: -1 }}>
                  <svg width="100%" height={sh + 16} viewBox={`-2 -12 ${sw2 + 4} ${sh + 28}`} preserveAspectRatio="none" style={{ display: "block" }} onMouseLeave={() => setHovKpiPt(null)}>
                    <defs><linearGradient id={`ga${uid}`} x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor={k.color} stopOpacity=".18" /><stop offset="100%" stopColor={k.color} stopOpacity="0" /></linearGradient></defs>
                    <polygon points={`0,${sh} ${line} ${sw2},${sh}`} fill={`url(#ga${uid})`} />
                    <polyline points={line} fill="none" stroke={k.color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                    {pts.map((p, j) => (<g key={j} onMouseEnter={() => setHovKpiPt({ c: i, p: j })} style={{ cursor: "pointer" }}><circle cx={p.x} cy={p.y} r="10" fill="transparent" /><circle cx={p.x} cy={p.y} r={hovPt === j ? 4 : 0} fill={k.color} />{hovPt === j && <><text x={p.x} y={p.y - 8} textAnchor="middle" fontSize="9" fontWeight="700" fill={k.color} fontFamily={Fn.mono}>{k.sparkPts[j]}</text><text x={p.x} y={sh + 10} textAnchor="middle" fontSize="7" fill={C.cinzaChumbo} fontFamily={Fn.body}>{MONTHS[j]}</text></>}</g>))}
                    {pts.map((p, j) => j % 2 === 0 && hovPt === -1 ? <text key={`m${j}`} x={p.x} y={sh + 10} textAnchor="middle" fontSize="7" fill={C.textLight} fontFamily={Fn.body}>{MONTHS[j]}</text> : null)}
                  </svg>
                </div>
              </div>
            );
          })}
        </div>
        {hovKpiCard >= 0 && tipKpiCard && <ChartTooltip {...tipKpiCard} x={tipPos.x} y={tipPos.y} />}

        {/* ═══ DISTRIBUIÇÃO POR DEPARTAMENTO (Pipeline) + COLABORADORES POR STATUS DONUT ═══ */}
        <div style={{ display: "grid", gridTemplateColumns: mob ? "1fr" : "1fr 1fr", gap: mob ? 12 : 16, marginBottom: mob ? 16 : 24 }}>
          {/* Department distribution bar chart */}
          {(() => {
            const max = Math.max(...topDeptCounts, 1);
            const bw = 48, gp = 20, chartW = topDeptLabels.length * (bw + gp) - gp, chartH = 110;
            return (
              <div style={{ background: C.cardBg, borderRadius: "12px 12px 12px 24px", border: `1px solid ${C.cardBorder}`, padding: mob ? 14 : 20, boxShadow: "0 1px 3px rgba(0,75,155,.04)" }} onMouseMove={trackMouse}>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 16 }}>
                  <div><span style={{ fontSize: 13, fontWeight: 700, color: C.azulEscuro, fontFamily: Fn.title, display: "block" }}>Distribuição por Departamento</span><span style={{ fontSize: 10, color: C.cinzaChumbo }}>Top {topDeptLabels.length} departamentos{hasFilter ? " (filtrado)" : ""}</span></div>
                  <div style={{ width: 30, height: 30, borderRadius: 8, background: `${C.azulProfundo}0A`, display: "flex", alignItems: "center", justifyContent: "center" }}>{Ic.chart(14, C.azulProfundo)}</div>
                </div>
                <div style={{ display: "flex", justifyContent: "center" }}>
                  <svg width={chartW + 40} height={chartH + 50} viewBox={`-20 -20 ${chartW + 40} ${chartH + 50}`}>
                    <line x1={0} y1={chartH} x2={chartW} y2={chartH} stroke={C.cardBorder} strokeWidth=".5" />
                    {topDeptLabels.map((label, i) => {
                      const bh = Math.max(6, (topDeptCounts[i] / max) * chartH); const x = i * (bw + gp); const isH = hovPipeline === i;
                      return <g key={i} onMouseEnter={() => setHovPipeline(i)} onMouseLeave={() => setHovPipeline(-1)} style={{ cursor: "pointer" }}>
                        <rect x={x} y={-20} width={bw} height={chartH + 50} fill="transparent" />
                        <rect x={x} y={chartH - bh} width={bw} height={bh} rx={6} fill={pipelineColors[i % pipelineColors.length]} opacity={isH ? 1 : 0.82} style={{ transition: "all .15s" }} />
                        <text x={x + bw / 2} y={chartH - bh - 6} textAnchor="middle" fontSize="11" fontWeight="700" fill={C.azulEscuro} fontFamily={Fn.mono}>{topDeptCounts[i]}</text>
                        <text x={x + bw / 2} y={chartH + 16} textAnchor="middle" fontSize="9" fill={isH ? pipelineColors[i % pipelineColors.length] : C.cinzaChumbo} fontFamily={Fn.body} fontWeight={isH ? 700 : 400}>{label.length > 8 ? label.slice(0, 7) + "…" : label}</text>
                        {isH && <rect x={x - 2} y={chartH - bh - 2} width={bw + 4} height={bh + 4} rx={7} fill="none" stroke={pipelineColors[i % pipelineColors.length]} strokeWidth="1.5" strokeDasharray="4 2" />}
                      </g>;
                    })}
                  </svg>
                </div>
                {hovPipeline >= 0 && <ChartTooltip title={topDeptLabels[hovPipeline]} color={pipelineColors[hovPipeline % pipelineColors.length]} total={topDeptCounts[hovPipeline]} rows={(() => { const dept = topDeptLabels[hovPipeline]; const deptColabs = fColabs.filter((c: any) => c.departamento === dept); const ativosD = deptColabs.filter((c: any) => c.status === 1).length; const inativosD = deptColabs.length - ativosD; return [{ label: "Ativos", value: ativosD, color: C.verdeFloresta }, { label: "Inativos", value: inativosD, color: C.danger }].filter(r => r.value > 0); })()} x={tipPos.x} y={tipPos.y} />}
              </div>
            );
          })()}

          {/* Colaboradores por Status — Donut */}
          {(() => {
            const size = 130, cx = size / 2, cy = size / 2, r = 48, sw = 14; const circ = 2 * Math.PI * r; let acc = 0;
            return (
              <div style={{ background: C.cardBg, borderRadius: "10px 10px 10px 18px", border: `1px solid ${filter.status ? STATUS_COLAB_COLORS[filter.status] || C.cardBorder : C.cardBorder}`, padding: mob ? 14 : 20, boxShadow: "0 1px 3px rgba(0,75,155,.04)", transition: "border-color .15s" }} onMouseMove={trackMouse}>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 16 }}>
                  <div><span style={{ fontSize: 13, fontWeight: 700, color: C.azulEscuro, fontFamily: Fn.title, display: "block" }}>Colaboradores por Status</span><span style={{ fontSize: 10, color: C.cinzaChumbo }}>Clique para filtrar · {totalColabs} colaboradores</span></div>
                  <div style={{ width: 30, height: 30, borderRadius: 8, background: `${C.azulProfundo}0A`, display: "flex", alignItems: "center", justifyContent: "center" }}>{Ic.users(14, C.azulProfundo)}</div>
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: mob ? 12 : 20, justifyContent: "center" }}>
                  <div style={{ position: "relative" }}>
                    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} style={{ transform: "rotate(-90deg)" }}>
                      <circle cx={cx} cy={cy} r={r} fill="none" stroke={C.cardBorder} strokeWidth={sw} />
                      {colabByStatus.map((s, i) => { const pct = s.value / colabStatusTotal; const dash = pct * circ; const off = acc * circ; acc += pct; const isActive = filter.status === s.key; const isDimmed = filter.status && !isActive; return <circle key={i} cx={cx} cy={cy} r={r} fill="none" stroke={s.color} strokeWidth={hovColetaStatus === i ? sw + 4 : sw} strokeDasharray={`${dash} ${circ - dash}`} strokeDashoffset={-off} strokeLinecap="round" opacity={isDimmed ? .2 : 1} style={{ transition: "all .15s", cursor: "pointer" }} onClick={() => toggle("status", s.key)} onMouseEnter={() => setHovColetaStatus(i)} onMouseLeave={() => setHovColetaStatus(null)} /> })}
                    </svg>
                    <div style={{ position: "absolute", inset: 0, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", pointerEvents: "none" }}>
                      {hovColetaStatus !== null ? <><span style={{ fontSize: 16, fontWeight: 800, fontFamily: Fn.title, color: colabByStatus[hovColetaStatus]?.color, lineHeight: 1 }}>{colabByStatus[hovColetaStatus]?.value}</span><span style={{ fontSize: 8, color: C.cinzaChumbo }}>{Math.round((colabByStatus[hovColetaStatus]?.value || 0) / colabStatusTotal * 100)}%</span></> : <><span style={{ fontSize: 20, fontWeight: 800, fontFamily: Fn.title, color: C.azulEscuro, lineHeight: 1 }}>{totalColabs}</span><span style={{ fontSize: 9, color: C.cinzaChumbo }}>total</span></>}
                    </div>
                  </div>
                  <div style={{ display: "flex", flexDirection: "column", gap: 5 }}>
                    {colabByStatus.map((s, i) => { const isActive = filter.status === s.key; const isDimmed = filter.status && !isActive; return (
                      <div key={i} onClick={() => toggle("status", s.key)} onMouseEnter={() => setHovColetaStatus(i)} onMouseLeave={() => setHovColetaStatus(null)} style={{ display: "flex", alignItems: "center", gap: 6, cursor: "pointer", padding: "2px 4px", borderRadius: 4, background: isActive ? `${s.color}10` : hovColetaStatus === i ? `${s.color}08` : "transparent", opacity: isDimmed ? .4 : 1, transition: "all .12s" }}>
                        <div style={{ width: 8, height: 8, borderRadius: "50%", background: s.color, flexShrink: 0 }} />
                        <span style={{ fontSize: 11, color: isActive || hovColetaStatus === i ? s.color : C.cinzaEscuro, fontWeight: isActive ? 700 : 400, transition: "all .12s" }}>{s.label}</span>
                        <code style={{ fontSize: 10, fontWeight: 700, fontFamily: Fn.mono, color: s.color, marginLeft: "auto" }}>{s.value}</code>
                      </div>
                    ) })}
                  </div>
                </div>
              </div>
            );
          })()}
        </div>

        {/* ═══ COLABORADORES POR DEPARTAMENTO + DEPARTAMENTOS POR TIPO ═══ */}
        <div style={{ display: "grid", gridTemplateColumns: mob ? "1fr" : "1fr 1fr", gap: mob ? 12 : 16, marginBottom: mob ? 16 : 24 }}>
          {/* Colaboradores por departamento */}
          <div style={{ background: C.cardBg, borderRadius: "10px 10px 10px 18px", border: `1px solid ${filter.departamento ? C.azulProfundo : C.cardBorder}`, padding: mob ? 14 : 20, boxShadow: "0 1px 3px rgba(0,75,155,.04)", transition: "border-color .15s" }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 16 }}>
              <div><span style={{ fontSize: 13, fontWeight: 700, color: C.azulEscuro, fontFamily: Fn.title, display: "block" }}>Colaboradores por Departamento</span><span style={{ fontSize: 10, color: C.cinzaChumbo }}>Clique para filtrar por departamento</span></div>
              <div style={{ width: 30, height: 30, borderRadius: 8, background: `${C.verdeFloresta}0A`, display: "flex", alignItems: "center", justifyContent: "center" }}>{Ic.map(14, C.verdeFloresta)}</div>
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              {allDeptCounts.map(([dept, count], i) => {
                const isH = hovGalpao === i; const isActive = filter.departamento === dept; const isDimmed = filter.departamento && !isActive;
                const deptColor = DEPT_COLORS[i % DEPT_COLORS.length];
                return (
                  <div key={dept} onClick={() => toggle("departamento", dept)} onMouseEnter={() => setHovGalpao(i)} onMouseLeave={() => setHovGalpao(-1)} style={{ display: "flex", alignItems: "center", gap: 10, cursor: "pointer", padding: "2px 0", opacity: isDimmed ? .3 : 1, transition: "opacity .15s" }}>
                    <span style={{ fontSize: 11, fontWeight: isH || isActive ? 700 : 600, color: isActive ? deptColor : C.cinzaEscuro, fontFamily: Fn.body, minWidth: 80, transition: "all .12s" }}>{dept.length > 12 ? dept.slice(0, 11) + "…" : dept}</span>
                    <div style={{ flex: 1, height: isH || isActive ? 10 : 8, borderRadius: 4, background: `${deptColor}12`, transition: "height .12s" }}>
                      <div style={{ height: "100%", borderRadius: 4, background: deptColor, width: `${(count / maxDeptCount) * 100}%`, transition: "width .3s", opacity: isActive ? 1 : .8 }} />
                    </div>
                    <code style={{ fontSize: 10, fontWeight: 700, fontFamily: Fn.mono, color: deptColor, minWidth: 55, textAlign: "right" }}>{count}{(isH || isActive) ? ` (${totalColabs ? Math.round(count / totalColabs * 100) : 0}%)` : ""}</code>
                  </div>
                );
              })}
            </div>
            <div style={{ marginTop: 14, padding: "10px 14px", background: C.bg, borderRadius: 8, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
              <span style={{ fontSize: 10, fontWeight: 600, color: C.cinzaChumbo }}>Total de colaboradores</span>
              <span style={{ fontSize: 14, fontWeight: 800, color: C.azulEscuro, fontFamily: Fn.title }}>{totalColabs}</span>
            </div>
          </div>

          {/* Departamentos por tipo */}
          <div style={{ background: C.cardBg, borderRadius: "10px 10px 10px 18px", border: `1px solid ${C.cardBorder}`, padding: mob ? 14 : 20, boxShadow: "0 1px 3px rgba(0,75,155,.04)", transition: "border-color .15s" }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 16 }}>
              <div><span style={{ fontSize: 13, fontWeight: 700, color: C.azulEscuro, fontFamily: Fn.title, display: "block" }}>Departamentos por Tipo</span><span style={{ fontSize: 10, color: C.cinzaChumbo }}>Agrupamento por categoria · Top {topTipos.length}</span></div>
              <div style={{ width: 30, height: 30, borderRadius: 8, background: `${C.azulProfundo}0A`, display: "flex", alignItems: "center", justifyContent: "center" }}>{Ic.grid(14, C.azulProfundo)}</div>
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              {topTipos.map(([tipo, count], i) => {
                const isH = hovMaterial === i;
                const tipoColor = DEPT_TIPO_COLORS[i % DEPT_TIPO_COLORS.length];
                return (
                  <div key={tipo} onMouseEnter={() => setHovMaterial(i)} onMouseLeave={() => setHovMaterial(-1)} style={{ display: "flex", alignItems: "center", gap: 10, cursor: "pointer", padding: "2px 0", transition: "opacity .15s" }}>
                    <div style={{ width: 8, height: 8, borderRadius: "50%", background: tipoColor, flexShrink: 0 }} />
                    <span style={{ fontSize: 11, fontWeight: isH ? 700 : 600, color: isH ? tipoColor : C.cinzaEscuro, fontFamily: Fn.body, minWidth: 80, transition: "all .12s" }}>{tipo}</span>
                    <div style={{ flex: 1, height: isH ? 8 : 6, borderRadius: 3, background: `${tipoColor}12`, transition: "height .12s" }}>
                      <div style={{ height: "100%", borderRadius: 3, background: tipoColor, width: `${(count / maxTipo) * 100}%`, opacity: isH ? 1 : .8 }} />
                    </div>
                    <code style={{ fontSize: 10, fontWeight: 700, fontFamily: Fn.mono, color: tipoColor, minWidth: 40, textAlign: "right" }}>{count}</code>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* ═══ DISTRIBUIÇÃO POR STATUS DONUT + QUADRO DE ATENÇÃO RH ═══ */}
        <div style={{ display: "grid", gridTemplateColumns: mob ? "1fr" : "1fr 1fr", gap: mob ? 12 : 16, marginBottom: mob ? 16 : 24 }}>
          {/* Distribuição por Status donut */}
          {(() => {
            const size = 120, cx = size / 2, cy = size / 2, r = 44, sw = 14; const circ = 2 * Math.PI * r; let acc = 0;
            return (
              <div style={{ background: C.cardBg, borderRadius: "10px 10px 10px 18px", border: `1px solid ${C.cardBorder}`, padding: mob ? 14 : 20, boxShadow: "0 1px 3px rgba(0,75,155,.04)", transition: "border-color .15s" }}>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 16 }}>
                  <div><span style={{ fontSize: 13, fontWeight: 700, color: C.azulEscuro, fontFamily: Fn.title, display: "block" }}>Distribuição por Status</span><span style={{ fontSize: 10, color: C.cinzaChumbo }}>Visão geral · {totalColabs} colaboradores</span></div>
                  <div style={{ width: 30, height: 30, borderRadius: 8, background: `${C.amareloEscuro}0A`, display: "flex", alignItems: "center", justifyContent: "center" }}>{Ic.users(14, C.amareloEscuro)}</div>
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: mob ? 12 : 24, justifyContent: "center" }}>
                  <div style={{ position: "relative" }}>
                    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} style={{ transform: "rotate(-90deg)" }}>
                      <circle cx={cx} cy={cy} r={r} fill="none" stroke={C.cardBorder} strokeWidth={sw} />
                      {statusDistrib.map((s, i) => { const pct = s.value / statusDistribTotal; const dash = pct * circ; const off = acc * circ; acc += pct; return <circle key={i} cx={cx} cy={cy} r={r} fill="none" stroke={s.color} strokeWidth={hovExpStatus === i ? sw + 4 : sw} strokeDasharray={`${dash} ${circ - dash}`} strokeDashoffset={-off} strokeLinecap="round" style={{ transition: "all .15s", cursor: "pointer" }} onMouseEnter={() => setHovExpStatus(i)} onMouseLeave={() => setHovExpStatus(null)} /> })}
                    </svg>
                    <div style={{ position: "absolute", inset: 0, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", pointerEvents: "none" }}>
                      {hovExpStatus !== null ? <><span style={{ fontSize: 16, fontWeight: 800, fontFamily: Fn.title, color: statusDistrib[hovExpStatus]?.color, lineHeight: 1 }}>{statusDistrib[hovExpStatus]?.value}</span><span style={{ fontSize: 8, color: C.cinzaChumbo }}>{Math.round((statusDistrib[hovExpStatus]?.value || 0) / statusDistribTotal * 100)}%</span></> : <><span style={{ fontSize: 20, fontWeight: 800, fontFamily: Fn.title, color: C.azulEscuro, lineHeight: 1 }}>{totalColabs}</span><span style={{ fontSize: 9, color: C.cinzaChumbo }}>total</span></>}
                    </div>
                  </div>
                  <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                    {statusDistrib.map((s, i) => (
                      <div key={i} onMouseEnter={() => setHovExpStatus(i)} onMouseLeave={() => setHovExpStatus(null)} style={{ display: "flex", alignItems: "center", gap: 6, cursor: "pointer", padding: "2px 4px", borderRadius: 4, background: hovExpStatus === i ? `${s.color}08` : "transparent", transition: "all .12s" }}>
                        <div style={{ width: 8, height: 8, borderRadius: "50%", background: s.color, flexShrink: 0 }} />
                        <span style={{ fontSize: 11, color: hovExpStatus === i ? s.color : C.cinzaEscuro, fontWeight: hovExpStatus === i ? 700 : 400 }}>{s.label}</span>
                        <code style={{ fontSize: 10, fontWeight: 700, fontFamily: Fn.mono, color: s.color, marginLeft: "auto" }}>{s.value}</code>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            );
          })()}

          {/* Quadro de Atenção RH */}
          <div style={{ background: C.cardBg, borderRadius: "10px 10px 10px 18px", border: `1px solid ${C.cardBorder}`, padding: mob ? 14 : 20, boxShadow: "0 1px 3px rgba(0,75,155,.04)" }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 16 }}>
              <div><span style={{ fontSize: 13, fontWeight: 700, color: C.azulEscuro, fontFamily: Fn.title, display: "block" }}>Quadro de Atenção RH</span><span style={{ fontSize: 10, color: C.cinzaChumbo }}>Pontos que requerem atenção</span></div>
              <div style={{ width: 30, height: 30, borderRadius: 8, background: `${C.amareloEscuro}0A`, display: "flex", alignItems: "center", justifyContent: "center" }}>{Ic.alert(14, C.amareloEscuro)}</div>
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 6, marginBottom: 16 }}>
              {[
                { label: "Departamentos com 1 pessoa", value: deptsComUmaPessoa, color: C.amareloEscuro, icon: Ic.alert },
                { label: "Taxa de inatividade", value: `${taxaInatividade}%`, color: taxaInatividade > 20 ? C.danger : C.verdeFloresta, icon: Ic.chart },
                { label: "Colaboradores sem departamento", value: colabsSemDept, color: C.azulProfundo, icon: Ic.users },
                { label: "Terceirizados", value: terceirizados, color: C.azulCeu, icon: Ic.edificio },
              ].filter(p => typeof p.value === "string" || p.value > 0).map((p, i) => (
                <div key={i} style={{ display: "flex", alignItems: "center", gap: 10, padding: "8px 12px", borderRadius: 8, border: `1px solid ${C.cardBorder}` }}>
                  <div style={{ width: 28, height: 28, borderRadius: 7, background: `${p.color}10`, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>{p.icon(14, p.color)}</div>
                  <span style={{ fontSize: 11, fontWeight: 600, color: C.cinzaEscuro, flex: 1 }}>{p.label}</span>
                  <span style={{ fontSize: 13, fontWeight: 800, fontFamily: Fn.title, color: p.color }}>{p.value}</span>
                </div>
              ))}
              {alertasRH === 0 && deptsComUmaPessoa === 0 && colabsSemDept === 0 && terceirizados === 0 && <div style={{ padding: "16px 0", textAlign: "center" }}>{Ic.check(24, C.verdeFloresta)}<p style={{ fontSize: 11, fontWeight: 600, color: C.cinzaEscuro, margin: "6px 0 0" }}>Sem alertas RH</p></div>}
            </div>
            {/* Status mini */}
            <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 8 }}>
              {[
                { label: "Ativos", value: ativos, color: C.verdeFloresta, pct: pctAtivos },
                { label: "Inativos", value: inativos, color: C.danger, pct: pctInativos },
                { label: "Deptos", value: numDepartamentos, color: C.azulProfundo, pct: numDepartamentos > 0 ? Math.round(numDepartamentos / (allDepartamentos.length || 1) * 100) : 0 },
              ].map((s, i) => (
                <div key={i} style={{ textAlign: "center", padding: 10, borderRadius: 8, border: `1px solid ${C.cardBorder}`, position: "relative" }}>
                  <div style={{ display: "flex", justifyContent: "center", marginBottom: 6 }}><Donut pct={s.pct} color={s.color} size={36} stroke={3} /><span style={{ position: "absolute", top: 16, fontSize: 8, fontWeight: 800, color: s.color, fontFamily: Fn.mono }}>{s.pct}%</span></div>
                  <span style={{ fontSize: 16, fontWeight: 800, fontFamily: Fn.title, color: s.color, display: "block" }}>{s.value}</span>
                  <span style={{ fontSize: 8, fontWeight: 600, color: C.cinzaChumbo, textTransform: "uppercase", letterSpacing: "0.5px" }}>{s.label}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* ═══ TABELA ÚLTIMOS COLABORADORES + SIDEBAR ═══ */}
        <div style={{ display: "grid", gridTemplateColumns: mob ? "1fr" : "2fr 1fr", gap: mob ? 16 : 20 }}>
          {/* Tabela */}
          <div style={{ background: C.cardBg, borderRadius: "12px 12px 12px 24px", border: `1px solid ${C.cardBorder}`, overflow: "hidden", boxShadow: "0 1px 3px rgba(0,75,155,.04)" }}>
            <div style={{ padding: "16px 20px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
              <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
                <div style={{ width: 44, height: 44, borderRadius: 14, background: `${C.azulProfundo}0A`, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>{Ic.users(20, C.azulProfundo)}</div>
                <div><span style={{ fontSize: 15, fontWeight: 700, color: C.azulEscuro, fontFamily: Fn.title, display: "block" }}>Últimos Colaboradores{hasFilter ? " (filtrados)" : ""}</span><span style={{ fontSize: 12, color: C.cinzaChumbo }}>{colabTable.length} mais recentes</span></div>
              </div>
            </div>
            <div style={{ overflowX: "auto" }}>
              <table style={{ width: "100%", borderCollapse: "collapse", fontFamily: Fn.body }}>
                <thead><tr style={{ background: C.bg }}>
                  {(mob ? ["ID", "Nome", "Status"] : ["ID", "Nome", "CPF", "Departamento", "Cargo", "Status", "Fonte"]).map(h => (
                    <th key={h} style={{ padding: "12px 14px", textAlign: "center", fontSize: 10, fontWeight: 700, letterSpacing: "1px", textTransform: "uppercase", color: C.cinzaChumbo, fontFamily: Fn.title, borderBottom: `2px solid ${C.cardBorder}`, whiteSpace: "nowrap" }}>{h}</th>
                  ))}
                </tr></thead>
                <tbody>
                  {colabTable.map((r: any, i: number) => {
                    const isH = hovExpRow === i; const zebra = i % 2 === 1 ? `${C.azulCeu}0D` : "transparent";
                    const statusColor = r.status === 1 ? C.verdeFloresta : C.danger;
                    const statusLabel = r.status === 1 ? "Ativo" : "Inativo";
                    return (
                      <tr key={i} onMouseEnter={() => setHovExpRow(i)} onMouseLeave={() => setHovExpRow(-1)} style={{ background: isH ? `${C.amareloOuro}18` : zebra, transition: "background .12s", borderBottom: i < colabTable.length - 1 ? `1px solid ${C.cardBorder}` : "none" }}>
                        <td style={{ padding: "10px 14px", fontSize: 12, fontWeight: 600, color: C.azulProfundo, fontFamily: Fn.mono }}>{r.id}</td>
                        <td style={{ padding: "10px 14px", fontSize: 12, fontWeight: 500, color: C.cinzaEscuro, maxWidth: 140, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{r.name || "—"}</td>
                        {!mob && <td style={{ padding: "10px 14px", fontSize: 11, color: C.cinzaChumbo, textAlign: "center" }}>{r.cpf || "—"}</td>}
                        {!mob && <td style={{ padding: "10px 14px", fontSize: 11, color: C.cinzaChumbo, textAlign: "center" }}>{r.departamento || "—"}</td>}
                        {!mob && <td style={{ padding: "10px 14px", fontSize: 11, color: C.cinzaChumbo, textAlign: "center" }}>{r.cargo || r.registration || "—"}</td>}
                        <td style={{ padding: "10px 14px", textAlign: "center" }}><span style={{ display: "inline-flex", alignItems: "center", gap: 4, padding: "2px 6px", fontSize: 10, fontWeight: 600, color: statusColor, background: `${statusColor}10`, border: `1px solid ${statusColor}25`, borderRadius: 4 }}><span style={{ width: 5, height: 5, borderRadius: "50%", background: statusColor }} />{statusLabel}</span></td>
                        {!mob && <td style={{ padding: "10px 14px", fontSize: 11, color: C.cinzaChumbo, textAlign: "center" }}>{r.fonte || "—"}</td>}
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
            <div style={{ padding: "10px 16px", borderTop: `1px solid ${C.cardBorder}`, background: C.bg, display: "flex", alignItems: "center", justifyContent: "space-between", fontSize: 11, color: C.cinzaChumbo }}>
              <span>{totalColabs} colaboradores{hasFilter ? " filtrados" : ""}</span>
              <span style={{ fontWeight: 600, color: C.verdeEscuro }}>{ativos} ativos ({pctAtivos}%)</span>
            </div>
          </div>

          {/* Sidebar */}
          <div style={{ display: "flex", flexDirection: "column", gap: mob ? 16 : 20 }}>
            {/* Estrutura RH */}
            <div style={{ background: C.cardBg, borderRadius: "10px 10px 10px 18px", border: `1px solid ${C.cardBorder}`, padding: mob ? 14 : 18, boxShadow: "0 1px 3px rgba(0,75,155,.04)" }}>
              <span style={{ fontSize: 13, fontWeight: 700, color: C.azulEscuro, fontFamily: Fn.title, display: "block", marginBottom: 12 }}>Estrutura RH</span>
              {allDeptCounts.slice(0, 5).map(([dept, count], i) => (
                <div key={i}>
                  <div style={{ display: "flex", alignItems: "center", gap: 10, padding: "7px 0" }}>
                    <div style={{ width: 24, height: 24, borderRadius: "50%", background: `${DEPT_COLORS[i % DEPT_COLORS.length]}15`, border: `2px solid ${DEPT_COLORS[i % DEPT_COLORS.length]}`, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}><span style={{ fontSize: 10, fontWeight: 800, fontFamily: Fn.title, color: DEPT_COLORS[i % DEPT_COLORS.length] }}>{i + 1}</span></div>
                    <span style={{ fontSize: 12, fontWeight: 600, color: C.azulEscuro, flex: 1 }}>{dept.length > 14 ? dept.slice(0, 13) + "…" : dept}</span>
                    <code style={{ fontSize: 11, fontWeight: 700, fontFamily: Fn.mono, color: DEPT_COLORS[i % DEPT_COLORS.length] }}>{count}</code>
                  </div>
                  {i < Math.min(allDeptCounts.length, 5) - 1 && <div style={{ width: 2, height: 10, background: C.cardBorder, marginLeft: 11, borderRadius: 1 }} />}
                </div>
              ))}
            </div>

            {/* Resumo RH */}
            <div style={{ background: C.cardBg, borderRadius: "10px 10px 10px 18px", border: `1px solid ${C.cardBorder}`, padding: mob ? 14 : 18, boxShadow: "0 1px 3px rgba(0,75,155,.04)" }}>
              <span style={{ fontSize: 13, fontWeight: 700, color: C.azulEscuro, fontFamily: Fn.title, display: "block", marginBottom: 12 }}>Resumo RH</span>
              {[
                { label: "Total colaboradores", value: totalColabs, color: C.azulProfundo },
                { label: "Ativos", value: ativos, color: C.verdeFloresta },
                { label: "Inativos", value: inativos, color: C.danger },
                { label: "Terceirizados", value: terceirizados, color: C.azulCeu },
                { label: "Departamentos", value: numDepartamentos, color: C.amareloEscuro },
                { label: "Média por depto", value: avgPerDept, color: C.azulProfundo },
                { label: "Taxa atividade", value: `${pctAtivos}%`, color: C.verdeEscuro },
              ].map((r, i) => (
                <div key={i} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "7px 0", borderBottom: i < 6 ? `1px solid ${C.cardBorder}` : "none" }}>
                  <span style={{ fontSize: 12, color: C.cinzaChumbo }}>{r.label}</span>
                  <code style={{ fontSize: 12, fontWeight: 700, fontFamily: Fn.mono, color: r.color }}>{r.value}</code>
                </div>
              ))}
            </div>

            {/* Departamentos grid */}
            <div style={{ background: C.cardBg, borderRadius: "10px 10px 10px 18px", border: `1px solid ${C.cardBorder}`, padding: mob ? 14 : 18, boxShadow: "0 1px 3px rgba(0,75,155,.04)" }}>
              <span style={{ fontSize: 13, fontWeight: 700, color: C.azulEscuro, fontFamily: Fn.title, display: "block", marginBottom: 12 }}>Departamentos</span>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
                {allDeptCounts.slice(0, 6).map(([dept, count], i) => {
                  const isActive = filter.departamento === dept;
                  const deptColor = DEPT_COLORS[i % DEPT_COLORS.length];
                  return (
                    <div key={dept} onClick={() => toggle("departamento", dept)} style={{ display: "flex", alignItems: "center", gap: 8, padding: "8px 10px", borderRadius: 8, border: `1px solid ${isActive ? deptColor : C.cardBorder}`, cursor: "pointer", background: isActive ? `${deptColor}08` : "transparent", transition: "all .15s" }}>
                      <div style={{ width: 8, height: 8, borderRadius: "50%", background: deptColor }} />
                      <div><span style={{ fontSize: 11, fontWeight: 600, color: isActive ? deptColor : C.cinzaEscuro, display: "block" }}>{dept.length > 10 ? dept.slice(0, 9) + "…" : dept}</span><span style={{ fontSize: 9, color: C.cinzaChumbo }}>{count} colab(s)</span></div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
