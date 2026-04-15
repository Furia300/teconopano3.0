import { useState, useMemo, useEffect, useRef } from "react";
import type { DashboardData } from "@/types/dashboard";
import { FipsJunctionLines, PageHero } from "@/composites/PageHero";
import { DashboardPrintButton } from "@/components/domain/DashboardPrintButton";
import { shellDarkGlassPanel } from "@/lib/docHeaderChrome";

type Props = { data: DashboardData };

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
  danger: "#DC3545",
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
  danger: "#EF6B6B",
  branco: "#FFFFFF", bg: "#1A1A1A",
  cardBg: "#222222", cardBorder: "#2E2E2E",
  textMuted: "#6B7280", textLight: "#4B5563",
};
/* Module-level reactive color ref — updated by DashboardAdmin on each render */
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
        <span style={{ flex: 1, color: value ? C.cinzaEscuro : C.textLight, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{value || placeholder}</span>
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
        <div style={{ borderTop: `1px solid ${C.cardBorder}`, padding: "6px 14px" }}>
          <span style={{ fontSize: 9, color: C.textMuted, fontFamily: Fn.body }}>Passe o mouse para detalhar</span>
        </div>
      </div>
    </div>
  );
}

/* ═══ CONSTANTS ═══ */
const ETAPAS = ["Coleta", "Separação", "Produção", "Estoque", "Expedição"];
/** Cores por etapa — fluxo azul→verde; estoque em verde escuro; expedição em ouro FIPS (não laranja de alerta no meio do fluxo). */
const ETAPA_COLORS = [C.azulProfundo, C.azulCeu, C.verdeFloresta, C.verdeEscuro, C.amareloOuro];
const STATUS_COLETA = ["pendente", "agendado", "recebido", "em_separacao", "em_producao", "concluido"];
const STATUS_COLETA_LABELS: Record<string, string> = { pendente: "Pendente", agendado: "Agendado", recebido: "Recebido", em_separacao: "Em separação", em_producao: "Em produção", concluido: "Concluído" };
const STATUS_COLETA_COLORS: Record<string, string> = { pendente: C.amareloEscuro, agendado: C.azulCeu, recebido: C.azulProfundo, em_separacao: C.azulClaro, em_producao: C.verdeFloresta, concluido: C.verdeEscuro };
const STATUS_EXP_LABELS: Record<string, string> = { pendente: "Pendente", em_rota: "Em rota", entregue: "Entregue" };
const STATUS_EXP_COLORS: Record<string, string> = { pendente: C.amareloEscuro, em_rota: C.azulProfundo, entregue: C.verdeEscuro };
const STATUS_FIN_LABELS: Record<string, string> = { pendente_aprovacao: "Pend. Aprovação", aprovado: "Aprovado" };
const STATUS_FIN_COLORS: Record<string, string> = { pendente_aprovacao: C.amareloEscuro, aprovado: C.verdeEscuro };
const DEPARTAMENTO_OPTIONS = [
  "Coleta",
  "Fornecedores",
  "Galpão",
  "Produção",
  "Separação",
  "Produção Diária",
  "Repanol",
  "Costureira",
  "Expedição",
  "Pedidos",
  "Clientes",
  "Produtos",
  "Estoque",
  "Logística",
  "Motorista",
  "Financeiro",
  "Emissão NF",
  "RH",
  "Ponto diário",
  "Funcionários",
  "Administração",
  "Painel Admin",
  "Configurações",
  "Dashboard",
];
const DEPARTAMENTO_AREA_MAP: Record<string, string[]> = {
  "Coleta": ["Coleta"],
  "Fornecedores": ["Coleta"],
  "Galpão": ["Produção", "Separação", "Estoque", "Repanol", "Costureira"],
  "Produção": ["Produção"],
  "Separação": ["Separação"],
  "Produção Diária": ["Produção"],
  "Repanol": ["Repanol"],
  "Costureira": ["Costureira"],
  "Expedição": ["Expedição"],
  "Pedidos": ["Expedição"],
  "Clientes": ["Expedição"],
  "Produtos": ["Expedição"],
  "Estoque": ["Estoque"],
  "Logística": ["Expedição"],
  "Motorista": ["Expedição"],
  "Financeiro": ["Expedição"],
  "Emissão NF": ["Expedição"],
  "RH": ["Coleta", "Separação", "Produção", "Estoque", "Expedição", "Repanol", "Costureira"],
  "Ponto diário": ["Coleta", "Separação", "Produção", "Estoque", "Expedição", "Repanol", "Costureira"],
  "Funcionários": ["Coleta", "Separação", "Produção", "Estoque", "Expedição", "Repanol", "Costureira"],
  "Administração": ["Coleta", "Separação", "Produção", "Estoque", "Expedição", "Repanol", "Costureira"],
  "Painel Admin": ["Coleta", "Separação", "Produção", "Estoque", "Expedição", "Repanol", "Costureira"],
  "Configurações": ["Coleta", "Separação", "Produção", "Estoque", "Expedição", "Repanol", "Costureira"],
  "Dashboard": ["Coleta", "Separação", "Produção", "Estoque", "Expedição", "Repanol", "Costureira"],
};

function formatKg(n: number) { return n >= 1000 ? `${(n / 1000).toFixed(1)}t` : `${n} kg`; }
function spark(seed: number, trend: "up" | "down") {
  const pts: number[] = []; let v = 40 + (seed % 30);
  for (let i = 0; i < 12; i++) { const d = trend === "up" ? 1.4 : -1.2; const n = Math.sin(seed * 0.31 + i * 0.7) * 8; v = Math.min(92, Math.max(8, v + d + n * 0.15)); pts.push(Math.round(v)); }
  return pts;
}
const MONTHS = ["Jan", "Fev", "Mar", "Abr", "Mai", "Jun", "Jul", "Ago", "Set", "Out", "Nov", "Dez"];

/* ═══════════════════════════════════ MAIN ═══════════════════════════════════ */
export default function DashboardAdmin({ data }: Props) {
  const dark = useDark();
  C = dark ? DARK : LIGHT;

  const [w, setW] = useState(typeof window !== "undefined" ? window.innerWidth : 1200);
  useEffect(() => { const h = () => setW(window.innerWidth); window.addEventListener("resize", h); return () => window.removeEventListener("resize", h); }, []);
  const mob = w < 640;

  /* ═══ FILTROS ═══ */
  const [filter, setFilter] = useState<Record<string, string | null>>({ departamento: null, statusEntrega: null, statusFinanceiro: null, alerta: null, mes: null });
  const hasFilter = Object.values(filter).some(v => v);
  const setF = (key: string, val: string | null) => setFilter(f => ({ ...f, [key]: val || null }));
  const toggle = (key: string, val: string) => setFilter(f => ({ ...f, [key]: f[key] === val ? null : val }));
  const clearAll = () => setFilter({ departamento: null, statusEntrega: null, statusFinanceiro: null, alerta: null, mes: null });

  const inDepartamento = (area: string) => {
    if (!filter.departamento) return true;
    return (DEPARTAMENTO_AREA_MAP[filter.departamento] || []).includes(area);
  };
  const inMes = (dateValue?: string | null) => {
    if (!filter.mes) return true;
    if (!dateValue) return false;
    const d = new Date(dateValue);
    if (Number.isNaN(d.getTime())) return false;
    const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
    return key === filter.mes;
  };

  /* ═══ FILTERED DATA ═══ */
  const fColetas = useMemo(() => data.coletas.filter(c => {
    if (!inDepartamento("Coleta")) return false;
    if (!inMes(c.dataPedido)) return false;
    return true;
  }), [data.coletas, filter]);

  const fSeparacoes = useMemo(() => data.separacoes.filter(s => {
    if (!inDepartamento("Separação")) return false;
    return true;
  }), [data.separacoes, filter]);

  const fProducoes = useMemo(() => data.producoes.filter(p => {
    if (!inDepartamento("Produção")) return false;
    return true;
  }), [data.producoes, filter]);

  const fEstoque = useMemo(() => data.estoque.filter(e => {
    if (!inDepartamento("Estoque")) return false;
    return true;
  }), [data.estoque, filter]);

  const fExpedicoes = useMemo(() => data.expedicoes.filter(e => {
    if (!inDepartamento("Expedição")) return false;
    if (!inMes(e.createdAt)) return false;
    if (filter.statusEntrega && e.statusEntrega !== filter.statusEntrega) return false;
    if (filter.statusFinanceiro && e.statusFinanceiro !== filter.statusFinanceiro) return false;
    const hasAlerta = e.statusFinanceiro === "pendente_aprovacao" || (e.statusFinanceiro === "aprovado" && e.statusNota === "pendente_emissao");
    if (filter.alerta === "com_pendencias" && !hasAlerta) return false;
    if (filter.alerta === "sem_pendencias" && hasAlerta) return false;
    return true;
  }), [data.expedicoes, filter]);

  const fRepanol = useMemo(() => data.repanol.filter(r => {
    if (!inDepartamento("Repanol")) return false;
    return true;
  }), [data.repanol, filter]);

  const fCostureira = useMemo(() => data.costureira.filter(c => {
    if (!inDepartamento("Costureira")) return false;
    return true;
  }), [data.costureira, filter]);

  /* Filter options */
  const allDepartamentos = DEPARTAMENTO_OPTIONS;
  const allStatusEntrega = ["pendente", "em_rota", "entregue"];
  const allStatusFin = ["pendente_aprovacao", "aprovado"];
  const allAlertas = ["com_pendencias", "sem_pendencias"];
  const allMeses = useMemo(() => {
    const set = new Set<string>();
    [...data.coletas.map(c => c.dataPedido), ...data.expedicoes.map(e => e.createdAt)]
      .filter(Boolean)
      .forEach((dateValue) => {
        const d = new Date(dateValue as string);
        if (!Number.isNaN(d.getTime())) set.add(`${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`);
      });
    return [...set].sort().reverse().map((m) => {
      const d = new Date(`${m}-01T00:00:00`);
      return { key: m, label: d.toLocaleDateString("pt-BR", { month: "long", year: "numeric" }) };
    });
  }, [data.coletas, data.expedicoes]);

  /* ═══ HOVER STATES ═══ */
  const [hovPipeline, setHovPipeline] = useState(-1);
  const [hovMacro, setHovMacro] = useState(-1);
  const [hovMaterial, setHovMaterial] = useState(-1);
  const [hovExpStatus, setHovExpStatus] = useState<number | null>(null);
  const [hovKpiPt, setHovKpiPt] = useState<{ c: number; p: number } | null>(null);
  const [hovKpiCard, setHovKpiCard] = useState(-1);
  const [hovExpRow, setHovExpRow] = useState(-1);
  const [hovColetaStatus, setHovColetaStatus] = useState<number | null>(null);
  const [hovFornAdmin, setHovFornAdmin] = useState(-1);
  const [tipPos, setTipPos] = useState({ x: 0, y: 0 });
  const trackMouse = (e: React.MouseEvent) => setTipPos({ x: e.clientX, y: e.clientY });

  /* ═══ CÁLCULOS (FILTRADOS) ═══ */
  const coletasPendentes = fColetas.filter(c => ["pendente", "agendado"].includes(c.status)).length;
  const emProducaoCount = fColetas.filter(c => ["recebido", "em_separacao", "em_producao"].includes(c.status)).length;
  const concluidas = fColetas.filter(c => c.status === "concluido").length;
  const pendFinanceiro = fExpedicoes.filter(e => e.statusFinanceiro === "pendente_aprovacao").length;
  const pendNF = fExpedicoes.filter(e => e.statusFinanceiro === "aprovado" && e.statusNota === "pendente_emissao").length;
  const repanolEnviados = fRepanol.filter(r => r.status === "enviado").length;
  const costureiraEnviados = fCostureira.filter(c => c.status === "enviado").length;
  const pesoEstoque = fEstoque.reduce((a, e) => a + (e.kilo || 0), 0);
  const totalAlertas = pendFinanceiro + pendNF + repanolEnviados + costureiraEnviados;
  const entregues = fExpedicoes.filter(e => e.statusEntrega === "entregue").length;
  const totalExp = fExpedicoes.length;
  const colabAtivos = data.colaboradores.filter(c => c.status === 1).length;
  const pesoTotal = fColetas.reduce((a, c) => a + (c.pesoTotalNF || 0), 0);

  const pipelineCounts = [fColetas.length, fSeparacoes.length, fProducoes.length, fEstoque.length, fExpedicoes.length];
  const totalRegistros = pipelineCounts.reduce((a, b) => a + b, 0);

  /* KPIs */
  const kpis = [
    { label: "Coletas", value: fColetas.length, delta: `${coletasPendentes} abertas`, up: true, icon: Ic.truck, color: C.azulProfundo, sparkPts: spark(fColetas.length * 9 + 42, "up") },
    { label: "Em produção", value: emProducaoCount, delta: `${fColetas.length ? Math.round(emProducaoCount / fColetas.length * 100) : 0}% do fluxo`, up: true, icon: Ic.factory, color: C.verdeFloresta, sparkPts: spark(emProducaoCount * 11 + 17, "up") },
    { label: "Pendências", value: totalAlertas, delta: `${pendFinanceiro} financ. ${pendNF} NF`, up: false, icon: Ic.clock, color: C.amareloEscuro, sparkPts: spark(totalAlertas * 13 + 5, "down") },
    { label: "Estoque", value: formatKg(pesoEstoque), delta: `${fEstoque.length} itens`, up: true, icon: Ic.warehouse, color: C.verdeEscuro, sparkPts: spark(pesoEstoque + 88, "up") },
  ];

  /* Carga por unidade (macro + micro) */
  const macroPainel = [
    { label: "Abertas na coleta", value: coletasPendentes, color: C.azulProfundo, hint: "Pendentes e agendadas" },
    { label: "Em andamento", value: emProducaoCount + fSeparacoes.length + fProducoes.length, color: C.verdeFloresta, hint: "Separacao + producao ativa" },
    { label: "Pendencias financeiras", value: pendFinanceiro + pendNF, color: C.amareloEscuro, hint: "Financeiro e emissao NF" },
    { label: "Entregas concluidas", value: entregues, color: C.verdeEscuro, hint: `${totalExp > 0 ? Math.round(entregues / totalExp * 100) : 0}% da expedicao` },
  ];
  const maxMacro = Math.max(...macroPainel.map(m => m.value), 1);

  /* Material breakdown */
  const materialMap = new Map<string, number>();
  fEstoque.forEach(e => { materialMap.set(e.material || "Outros", (materialMap.get(e.material || "Outros") || 0) + (e.kilo || 0)); });
  const topMateriais = [...materialMap.entries()].sort((a, b) => b[1] - a[1]).slice(0, 6);
  const maxMaterial = topMateriais[0]?.[1] || 1;
  const materialColors = [C.azulProfundo, C.azulCeu, C.verdeFloresta, C.amareloEscuro, C.amareloOuro, C.azulClaro];

  /* Expedição donut */
  const expByStatus = allStatusEntrega.map(s => ({ label: STATUS_EXP_LABELS[s], key: s, value: fExpedicoes.filter(e => e.statusEntrega === s).length, color: STATUS_EXP_COLORS[s] }));
  const expTotal = Math.max(expByStatus.reduce((a, s) => a + s.value, 0), 1);

  /* Coleta por status donut */
  const coletaByStatus = STATUS_COLETA.map(s => ({ label: STATUS_COLETA_LABELS[s], key: s, value: fColetas.filter(c => c.status === s).length, color: STATUS_COLETA_COLORS[s] })).filter(s => s.value > 0);
  const coletaTotal = Math.max(coletaByStatus.reduce((a, s) => a + s.value, 0), 1);

  /* Produção status */
  const prodAtiva = fProducoes.filter(p => p.status === "ativa").length;
  const prodPausada = fProducoes.filter(p => p.status === "pausada").length;
  const prodConcluida = fProducoes.filter(p => p.status === "concluida").length;

  /* Tabela expedições */
  const expTable = fExpedicoes.slice(-8).reverse();

  /* Tooltip KPI */
  const tipKpiCard = useMemo(() => {
    if (hovKpiCard < 0) return null;
    if (hovKpiCard === 0) return { title: "Coletas", color: C.azulProfundo, total: fColetas.length, rows: [{ label: "Pendentes", value: coletasPendentes, color: C.amareloEscuro }, { label: "Concluidas", value: concluidas, color: C.verdeEscuro }, { label: "Em fluxo", value: emProducaoCount, color: C.azulCeu }].filter(r => r.value > 0) };
    if (hovKpiCard === 1) return { title: "Em produção", color: C.verdeFloresta, total: emProducaoCount, rows: [{ label: "Recebido", value: fColetas.filter(c => c.status === "recebido").length, color: C.azulProfundo }, { label: "Separação", value: fColetas.filter(c => c.status === "em_separacao").length, color: C.azulCeu }, { label: "Produção", value: fColetas.filter(c => c.status === "em_producao").length, color: C.verdeFloresta }] };
    if (hovKpiCard === 2) return { title: "Pendências", color: C.amareloEscuro, total: totalAlertas, rows: [{ label: "Financeiro", value: pendFinanceiro, color: C.amareloEscuro }, { label: "NF", value: pendNF, color: C.azulProfundo }, { label: "Repanol", value: repanolEnviados, color: C.azulCeu }, { label: "Costureira", value: costureiraEnviados, color: C.verdeFloresta }].filter(r => r.value > 0) };
    return { title: "Estoque", color: C.verdeEscuro, total: fEstoque.length, rows: [{ label: "Itens em estoque", value: fEstoque.length, color: C.verdeEscuro }, { label: "Peso total (kg)", value: Math.round(pesoEstoque), color: C.azulCeu }].filter(r => r.value > 0) };
  }, [hovKpiCard, fColetas, fEstoque, emProducaoCount, totalAlertas, pendFinanceiro, pendNF, repanolEnviados, costureiraEnviados, coletasPendentes, concluidas, pesoEstoque]);

  return (
    <div style={{ minHeight: "100vh", fontFamily: Fn.body, color: C.cinzaEscuro, background: C.bg, transition: "background .3s, color .3s" }}>
      <style>{`@keyframes fadeUp{from{opacity:0;transform:translateY(12px)}to{opacity:1;transform:translateY(0)}}`}</style>

      {/* ═══ HERO — réplica exata do padrão RH ═══ */}
      <div style={{ margin: mob ? "0 12px" : "0 32px" }}>
        <PageHero>
          <div className="relative flex flex-col gap-4 px-6 py-5 sm:flex-row sm:items-center sm:justify-between sm:px-7 sm:py-6">
            <div className="flex items-start gap-4">
              <div className="hidden flex-shrink-0 items-center justify-center sm:flex" style={{ width: 52, height: 52, borderRadius: 14, background: "linear-gradient(135deg, rgba(237,27,36,0.12), rgba(178,0,40,0.06))", border: "1px solid rgba(237,27,36,0.18)" }}>
                {Ic.alert(24, "#ed1b24")}
              </div>
              <div className="min-w-0">
                <div style={{ display: "inline-flex", alignItems: "center", gap: 6, background: "rgba(253,194,78,0.16)", border: "1px solid rgba(253,194,78,0.42)", borderRadius: 20, padding: "4px 12px", fontSize: 10, fontWeight: 600, color: C.amareloOuro, marginBottom: 8 }}>Super Admin · Tecnopano 3.0</div>
                <h2 className="font-heading text-xl font-bold tracking-tight text-white sm:text-[22px]" style={{ lineHeight: 1.2 }}>Painel <span style={{ color: C.amareloOuro }}>Operacional</span></h2>
                <p className="mt-0.5 text-xs text-white/45 sm:text-[13px]">Tecnologia Ambiental em Panos · {totalRegistros} registros operacionais{hasFilter ? " (filtrado)" : ""} · {formatKg(pesoTotal)} no fluxo</p>
                <p className="mt-1 text-[10px] text-white/30">{new Date().toLocaleDateString("pt-BR", { weekday: "long", day: "numeric", month: "long", year: "numeric" })}</p>
                <p className="mt-1 text-[10px] text-white/45 tracking-wide">30 anos de atuação · 2.000+ clientes · atendimento nacional · coleta e destinação ambiental</p>
              </div>
            </div>
            <div className="flex flex-shrink-0 flex-col items-end gap-2">
              <DashboardPrintButton title="Painel Operacional" />
              {totalAlertas > 0 && (
                <div className="flex items-center gap-2 rounded-lg px-4 py-2.5" style={{ background: "rgba(246,146,30,0.14)", border: "1px solid rgba(246,146,30,0.38)" }}>
                  {Ic.alert(18, C.amareloEscuro)}
                  <div>
                    <span className="block text-[13px] font-bold text-white">{totalAlertas} pendências</span>
                    <span className="text-[10px] text-white/70">Financeiro, NF e logística ambiental</span>
                  </div>
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
              <span style={{ fontSize: 10, color: C.textMuted, fontFamily: Fn.body }}>{totalRegistros} registros</span>
              {hasFilter && <button onClick={clearAll} style={{ display: "inline-flex", alignItems: "center", gap: 4, padding: "4px 10px", fontSize: 10, fontWeight: 600, color: C.cinzaChumbo, background: C.bg, border: `1px solid ${C.cardBorder}`, borderRadius: 6, cursor: "pointer", fontFamily: Fn.body }}>{Ic.x(10, C.cinzaChumbo)} Limpar</button>}
            </div>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: mob ? "1fr 1fr" : "repeat(5,minmax(0,1fr))", gap: mob ? 8 : 12 }}>
            <DSSelect label="Departamento" value={filter.departamento} onChange={v => setF("departamento", v)} options={allDepartamentos} icon={Ic.grid(14, C.cinzaChumbo)} />
            <DSSelect label="Mês" value={filter.mes ? allMeses.find(m => m.key === filter.mes)?.label || filter.mes : null} onChange={v => { const found = allMeses.find(m => m.label === v); setF("mes", found ? found.key : null); }} options={allMeses.map(m => m.label)} placeholder="Todos" icon={Ic.clock(14, C.cinzaChumbo)} />
            <DSSelect label="Entrega" value={filter.statusEntrega} onChange={v => setF("statusEntrega", v)} options={allStatusEntrega} placeholder="Todas" icon={Ic.truck(14, C.cinzaChumbo)} />
            <DSSelect label="Financeiro" value={filter.statusFinanceiro} onChange={v => setF("statusFinanceiro", v)} options={allStatusFin} placeholder="Todos" icon={Ic.dollar(14, C.cinzaChumbo)} />
            <DSSelect label="Alertas" value={filter.alerta} onChange={v => setF("alerta", v)} options={allAlertas} placeholder="Todos" icon={Ic.alert(14, C.cinzaChumbo)} />
          </div>
        </div>


        {/* ═══ ACTIVE FILTER BADGES ═══ */}
        {hasFilter && (
          <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 14, flexWrap: "wrap" }}>
            {filter.departamento && <span style={{ padding: "3px 8px", fontSize: 10, fontWeight: 600, color: C.azulProfundo, background: `${C.azulProfundo}10`, borderRadius: 4, fontFamily: Fn.body }}>Departamento: {filter.departamento}</span>}
            {filter.statusEntrega && <span style={{ padding: "3px 8px", fontSize: 10, fontWeight: 600, color: STATUS_EXP_COLORS[filter.statusEntrega] || C.azulProfundo, background: `${STATUS_EXP_COLORS[filter.statusEntrega] || C.azulProfundo}10`, borderRadius: 4, fontFamily: Fn.body }}>Entrega: {STATUS_EXP_LABELS[filter.statusEntrega]}</span>}
            {filter.statusFinanceiro && <span style={{ padding: "3px 8px", fontSize: 10, fontWeight: 600, color: C.amareloEscuro, background: `${C.amareloEscuro}10`, borderRadius: 4, fontFamily: Fn.body }}>Financeiro: {STATUS_FIN_LABELS[filter.statusFinanceiro] || filter.statusFinanceiro}</span>}
            {filter.alerta && <span style={{ padding: "3px 8px", fontSize: 10, fontWeight: 600, color: C.danger, background: `${C.danger}10`, borderRadius: 4, fontFamily: Fn.body }}>Alertas: {filter.alerta === "com_pendencias" ? "Com pendencias" : "Sem pendencias"}</span>}
            {filter.mes && <span style={{ padding: "3px 8px", fontSize: 10, fontWeight: 600, color: C.cinzaChumbo, background: `${C.cinzaChumbo}12`, borderRadius: 4, fontFamily: Fn.body }}>Mês: {allMeses.find(m => m.key === filter.mes)?.label || filter.mes}</span>}
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
                {hovKpiCard === i && tipKpiCard && <ChartTooltip {...tipKpiCard} x={tipPos.x} y={tipPos.y} />}
              </div>
            );
          })}
        </div>

        {/* ═══ PIPELINE + COLETA POR STATUS DONUT ═══ */}
        <div style={{ display: "grid", gridTemplateColumns: mob ? "1fr" : "1fr 1fr", gap: mob ? 12 : 16, marginBottom: mob ? 16 : 24 }}>
          {/* Pipeline bar chart */}
          {(() => {
            const max = Math.max(...pipelineCounts, 1);
            const bw = 48, gp = 20, chartW = ETAPAS.length * (bw + gp) - gp, chartH = 110;
            return (
              <div style={{ background: C.cardBg, borderRadius: "12px 12px 12px 24px", border: `1px solid ${C.cardBorder}`, padding: mob ? 14 : 20, boxShadow: "0 1px 3px rgba(0,75,155,.04)" }} onMouseMove={trackMouse}>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 16 }}>
                  <div><span style={{ fontSize: 13, fontWeight: 700, color: C.azulEscuro, fontFamily: Fn.title, display: "block" }}>Pipeline de Produção</span><span style={{ fontSize: 10, color: C.cinzaChumbo }}>Contagem por etapa do fluxo{hasFilter ? " (filtrado)" : ""}</span></div>
                  <div style={{ width: 30, height: 30, borderRadius: 8, background: `${C.azulProfundo}0A`, display: "flex", alignItems: "center", justifyContent: "center" }}>{Ic.chart(14, C.azulProfundo)}</div>
                </div>
                <div style={{ display: "flex", justifyContent: "center" }}>
                  <svg width={chartW + 40} height={chartH + 50} viewBox={`-20 -20 ${chartW + 40} ${chartH + 50}`}>
                    <line x1={0} y1={chartH} x2={chartW} y2={chartH} stroke={C.cardBorder} strokeWidth=".5" />
                    {ETAPAS.map((label, i) => {
                      const bh = Math.max(6, (pipelineCounts[i] / max) * chartH); const x = i * (bw + gp); const isH = hovPipeline === i;
                      return <g key={i} onMouseEnter={() => setHovPipeline(i)} onMouseLeave={() => setHovPipeline(-1)} style={{ cursor: "pointer" }}>
                        <rect x={x} y={-20} width={bw} height={chartH + 50} fill="transparent" />
                        <rect x={x} y={chartH - bh} width={bw} height={bh} rx={6} fill={ETAPA_COLORS[i]} opacity={isH ? 1 : 0.82} style={{ transition: "all .15s" }} />
                        <text x={x + bw / 2} y={chartH - bh - 6} textAnchor="middle" fontSize="11" fontWeight="700" fill={C.azulEscuro} fontFamily={Fn.mono}>{pipelineCounts[i]}</text>
                        <text x={x + bw / 2} y={chartH + 16} textAnchor="middle" fontSize="9" fill={isH ? ETAPA_COLORS[i] : C.cinzaChumbo} fontFamily={Fn.body} fontWeight={isH ? 700 : 400}>{label}</text>
                        {isH && <rect x={x - 2} y={chartH - bh - 2} width={bw + 4} height={bh + 4} rx={7} fill="none" stroke={ETAPA_COLORS[i]} strokeWidth="1.5" strokeDasharray="4 2" />}
                      </g>;
                    })}
                  </svg>
                </div>
                {hovPipeline >= 0 && <ChartTooltip title={ETAPAS[hovPipeline]} color={ETAPA_COLORS[hovPipeline]} x={tipPos.x} y={tipPos.y} total={pipelineCounts[hovPipeline]} rows={[
                  { label: "Registros na etapa", value: pipelineCounts[hovPipeline], color: ETAPA_COLORS[hovPipeline] },
                  { label: "% do total", value: totalRegistros > 0 ? Math.round(pipelineCounts[hovPipeline] / totalRegistros * 100) : 0, color: C.azulCeu },
                ]} />}
              </div>
            );
          })()}

          {/* Coleta por status — Donut */}
          {(() => {
            const size = 130, cx = size / 2, cy = size / 2, r = 48, sw = 14; const circ = 2 * Math.PI * r; let acc = 0;
            return (
              <div style={{ background: C.cardBg, borderRadius: "10px 10px 10px 18px", border: `1px solid ${filter.statusColeta ? STATUS_COLETA_COLORS[filter.statusColeta] : C.cardBorder}`, padding: mob ? 14 : 20, boxShadow: "0 1px 3px rgba(0,75,155,.04)", transition: "border-color .15s" }} onMouseMove={trackMouse}>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 16 }}>
                  <div><span style={{ fontSize: 13, fontWeight: 700, color: C.azulEscuro, fontFamily: Fn.title, display: "block" }}>Coletas por Status</span><span style={{ fontSize: 10, color: C.cinzaChumbo }}>Clique para filtrar · {fColetas.length} coletas</span></div>
                  <div style={{ width: 30, height: 30, borderRadius: 8, background: `${C.azulProfundo}0A`, display: "flex", alignItems: "center", justifyContent: "center" }}>{Ic.truck(14, C.azulProfundo)}</div>
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: mob ? 12 : 20, justifyContent: "center" }}>
                  <div style={{ position: "relative" }}>
                    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} style={{ transform: "rotate(-90deg)" }}>
                      <circle cx={cx} cy={cy} r={r} fill="none" stroke={C.cardBorder} strokeWidth={sw} />
                      {coletaByStatus.map((s, i) => { const pct = s.value / coletaTotal; const dash = pct * circ; const off = acc * circ; acc += pct; const isActive = filter.statusColeta === s.key; const isDimmed = filter.statusColeta && !isActive; return <circle key={i} cx={cx} cy={cy} r={r} fill="none" stroke={s.color} strokeWidth={hovColetaStatus === i ? sw + 4 : sw} strokeDasharray={`${dash} ${circ - dash}`} strokeDashoffset={-off} strokeLinecap="round" opacity={isDimmed ? .2 : 1} style={{ transition: "all .15s", cursor: "pointer" }} onClick={() => toggle("statusColeta", s.key)} onMouseEnter={() => setHovColetaStatus(i)} onMouseLeave={() => setHovColetaStatus(null)} /> })}
                    </svg>
                    <div style={{ position: "absolute", inset: 0, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", pointerEvents: "none" }}>
                      {hovColetaStatus !== null ? <><span style={{ fontSize: 16, fontWeight: 800, fontFamily: Fn.title, color: coletaByStatus[hovColetaStatus]?.color, lineHeight: 1 }}>{coletaByStatus[hovColetaStatus]?.value}</span><span style={{ fontSize: 8, color: C.cinzaChumbo }}>{Math.round((coletaByStatus[hovColetaStatus]?.value || 0) / coletaTotal * 100)}%</span></> : <><span style={{ fontSize: 20, fontWeight: 800, fontFamily: Fn.title, color: C.azulEscuro, lineHeight: 1 }}>{fColetas.length}</span><span style={{ fontSize: 9, color: C.cinzaChumbo }}>total</span></>}
                    </div>
                  </div>
                  <div style={{ display: "flex", flexDirection: "column", gap: 5 }}>
                    {coletaByStatus.map((s, i) => { const isActive = filter.statusColeta === s.key; const isDimmed = filter.statusColeta && !isActive; return (
                      <div key={i} onClick={() => toggle("statusColeta", s.key)} onMouseEnter={() => setHovColetaStatus(i)} onMouseLeave={() => setHovColetaStatus(null)} style={{ display: "flex", alignItems: "center", gap: 6, cursor: "pointer", padding: "2px 4px", borderRadius: 4, background: isActive ? `${s.color}10` : hovColetaStatus === i ? `${s.color}08` : "transparent", opacity: isDimmed ? .4 : 1, transition: "all .12s" }}>
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

        {/* ═══ EXECUTIVO + MATERIAIS ═══ */}
        <div style={{ display: "grid", gridTemplateColumns: mob ? "1fr" : "1fr 1fr", gap: mob ? 12 : 16, marginBottom: mob ? 16 : 24 }}>
          {/* Painel executivo */}
          <div style={{ background: C.cardBg, borderRadius: "10px 10px 10px 18px", border: `1px solid ${C.cardBorder}`, padding: mob ? 14 : 20, boxShadow: "0 1px 3px rgba(0,75,155,.04)" }} onMouseMove={trackMouse}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 16 }}>
              <div><span style={{ fontSize: 13, fontWeight: 700, color: C.azulEscuro, fontFamily: Fn.title, display: "block" }}>Prioridades Executivas</span><span style={{ fontSize: 10, color: C.cinzaChumbo }}>Indicadores macro para decisao do dono</span></div>
              <div style={{ width: 30, height: 30, borderRadius: 8, background: `${C.verdeFloresta}0A`, display: "flex", alignItems: "center", justifyContent: "center" }}>{Ic.map(14, C.verdeFloresta)}</div>
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              {macroPainel.map((m, i) => {
                const isH = hovMacro === i;
                return (
                  <div key={m.label} onMouseEnter={() => setHovMacro(i)} onMouseLeave={() => setHovMacro(-1)} style={{ display: "flex", alignItems: "center", gap: 10, padding: "2px 0" }}>
                    <span style={{ fontSize: 11, fontWeight: isH ? 700 : 600, color: isH ? m.color : C.cinzaEscuro, fontFamily: Fn.body, minWidth: 130, transition: "all .12s" }}>{m.label}</span>
                    <div style={{ flex: 1, height: isH ? 10 : 8, borderRadius: 4, background: `${m.color}12`, transition: "height .12s" }}>
                      <div style={{ height: "100%", borderRadius: 4, background: m.color, width: `${(m.value / maxMacro) * 100}%`, transition: "width .3s" }} />
                    </div>
                    <code style={{ fontSize: 10, fontWeight: 700, fontFamily: Fn.mono, color: m.color, minWidth: 60, textAlign: "right" }}>{m.value}</code>
                  </div>
                );
              })}
            </div>
            <div style={{ marginTop: 14, padding: "10px 14px", background: C.bg, borderRadius: 8, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
              <span style={{ fontSize: 10, fontWeight: 600, color: C.cinzaChumbo }}>Resumo do dia</span>
              <span style={{ fontSize: 14, fontWeight: 800, color: C.azulEscuro, fontFamily: Fn.title }}>{totalRegistros} registros monitorados</span>
            </div>
            {hovMacro >= 0 && macroPainel[hovMacro] && <ChartTooltip title={macroPainel[hovMacro].label} color={macroPainel[hovMacro].color} x={tipPos.x} y={tipPos.y} total={macroPainel[hovMacro].value} rows={[
              { label: "Valor atual", value: macroPainel[hovMacro].value, color: macroPainel[hovMacro].color },
              { label: "Contexto", value: totalRegistros > 0 ? Math.round(macroPainel[hovMacro].value / totalRegistros * 100) : 0, color: C.azulCeu },
              { label: macroPainel[hovMacro].hint, value: 1, color: C.textMuted },
            ]} />}
          </div>

          {/* Estoque por material */}
          <div style={{ background: C.cardBg, borderRadius: "10px 10px 10px 18px", border: `1px solid ${C.cardBorder}`, padding: mob ? 14 : 20, boxShadow: "0 1px 3px rgba(0,75,155,.04)" }} onMouseMove={trackMouse}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 16 }}>
              <div><span style={{ fontSize: 13, fontWeight: 700, color: C.azulEscuro, fontFamily: Fn.title, display: "block" }}>Estoque por Material</span><span style={{ fontSize: 10, color: C.cinzaChumbo }}>Composicao de estoque · Top {topMateriais.length}</span></div>
              <div style={{ width: 30, height: 30, borderRadius: 8, background: `${C.azulProfundo}0A`, display: "flex", alignItems: "center", justifyContent: "center" }}>{Ic.grid(14, C.azulProfundo)}</div>
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              {topMateriais.map(([mat, peso], i) => {
                const isH = hovMaterial === i;
                return (
                  <div key={mat} onMouseEnter={() => setHovMaterial(i)} onMouseLeave={() => setHovMaterial(-1)} style={{ display: "flex", alignItems: "center", gap: 10, padding: "2px 0" }}>
                    <div style={{ width: 8, height: 8, borderRadius: "50%", background: materialColors[i], flexShrink: 0 }} />
                    <span style={{ fontSize: 11, fontWeight: isH ? 700 : 600, color: isH ? materialColors[i] : C.cinzaEscuro, fontFamily: Fn.body, minWidth: 80, transition: "all .12s" }}>{mat}</span>
                    <div style={{ flex: 1, height: isH ? 8 : 6, borderRadius: 3, background: `${materialColors[i]}12`, transition: "height .12s" }}>
                      <div style={{ height: "100%", borderRadius: 3, background: materialColors[i], width: `${(peso / maxMaterial) * 100}%`, opacity: isH ? 1 : .8 }} />
                    </div>
                    <code style={{ fontSize: 10, fontWeight: 700, fontFamily: Fn.mono, color: materialColors[i], minWidth: 40, textAlign: "right" }}>{formatKg(peso)}</code>
                  </div>
                );
              })}
            </div>
            {hovMaterial >= 0 && topMateriais[hovMaterial] && <ChartTooltip title={topMateriais[hovMaterial][0]} color={materialColors[hovMaterial]} x={tipPos.x} y={tipPos.y} total={fEstoque.filter(e => e.material === topMateriais[hovMaterial][0]).length} rows={[
              { label: "Peso em estoque", value: Math.round(topMateriais[hovMaterial][1]), color: materialColors[hovMaterial] },
              { label: "% do estoque", value: pesoEstoque > 0 ? Math.round(topMateriais[hovMaterial][1] / pesoEstoque * 100) : 0, color: C.azulCeu },
              { label: "Itens", value: fEstoque.filter(e => e.material === topMateriais[hovMaterial][0]).length, color: C.verdeFloresta },
            ]} />}
          </div>
        </div>

        {/* ═══ EXPEDIÇÃO DONUT + PENDÊNCIAS ═══ */}
        <div style={{ display: "grid", gridTemplateColumns: mob ? "1fr" : "1fr 1fr", gap: mob ? 12 : 16, marginBottom: mob ? 16 : 24 }}>
          {/* Expedição donut */}
          {(() => {
            const size = 120, cx = size / 2, cy = size / 2, r = 44, sw = 14; const circ = 2 * Math.PI * r; let acc = 0;
            return (
              <div style={{ background: C.cardBg, borderRadius: "10px 10px 10px 18px", border: `1px solid ${filter.statusEntrega ? STATUS_EXP_COLORS[filter.statusEntrega] : C.cardBorder}`, padding: mob ? 14 : 20, boxShadow: "0 1px 3px rgba(0,75,155,.04)", transition: "border-color .15s" }} onMouseMove={trackMouse}>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 16 }}>
                  <div><span style={{ fontSize: 13, fontWeight: 700, color: C.azulEscuro, fontFamily: Fn.title, display: "block" }}>Expedição por Status</span><span style={{ fontSize: 10, color: C.cinzaChumbo }}>Clique para filtrar · {totalExp} pedidos</span></div>
                  <div style={{ width: 30, height: 30, borderRadius: 8, background: `${C.amareloEscuro}0A`, display: "flex", alignItems: "center", justifyContent: "center" }}>{Ic.package(14, C.amareloEscuro)}</div>
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: mob ? 12 : 24, justifyContent: "center" }}>
                  <div style={{ position: "relative" }}>
                    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} style={{ transform: "rotate(-90deg)" }}>
                      <circle cx={cx} cy={cy} r={r} fill="none" stroke={C.cardBorder} strokeWidth={sw} />
                      {expByStatus.map((s, i) => { const pct = s.value / expTotal; const dash = pct * circ; const off = acc * circ; acc += pct; const isActive = filter.statusEntrega === s.key; const isDimmed = filter.statusEntrega && !isActive; return <circle key={i} cx={cx} cy={cy} r={r} fill="none" stroke={s.color} strokeWidth={hovExpStatus === i ? sw + 4 : sw} strokeDasharray={`${dash} ${circ - dash}`} strokeDashoffset={-off} strokeLinecap="round" opacity={isDimmed ? .2 : 1} style={{ transition: "all .15s", cursor: "pointer" }} onClick={() => toggle("statusEntrega", s.key)} onMouseEnter={() => setHovExpStatus(i)} onMouseLeave={() => setHovExpStatus(null)} /> })}
                    </svg>
                    <div style={{ position: "absolute", inset: 0, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", pointerEvents: "none" }}>
                      {hovExpStatus !== null ? <><span style={{ fontSize: 16, fontWeight: 800, fontFamily: Fn.title, color: expByStatus[hovExpStatus].color, lineHeight: 1 }}>{expByStatus[hovExpStatus].value}</span><span style={{ fontSize: 8, color: C.cinzaChumbo }}>{Math.round(expByStatus[hovExpStatus].value / expTotal * 100)}%</span></> : <><span style={{ fontSize: 20, fontWeight: 800, fontFamily: Fn.title, color: C.azulEscuro, lineHeight: 1 }}>{totalExp}</span><span style={{ fontSize: 9, color: C.cinzaChumbo }}>total</span></>}
                    </div>
                  </div>
                  <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                    {expByStatus.map((s, i) => { const isActive = filter.statusEntrega === s.key; const isDimmed = filter.statusEntrega && !isActive; return (
                      <div key={i} onClick={() => toggle("statusEntrega", s.key)} onMouseEnter={() => setHovExpStatus(i)} onMouseLeave={() => setHovExpStatus(null)} style={{ display: "flex", alignItems: "center", gap: 6, cursor: "pointer", padding: "2px 4px", borderRadius: 4, background: isActive ? `${s.color}10` : hovExpStatus === i ? `${s.color}08` : "transparent", opacity: isDimmed ? .4 : 1, transition: "all .12s" }}>
                        <div style={{ width: 8, height: 8, borderRadius: "50%", background: s.color, flexShrink: 0 }} />
                        <span style={{ fontSize: 11, color: isActive || hovExpStatus === i ? s.color : C.cinzaEscuro, fontWeight: isActive ? 700 : 400 }}>{s.label}</span>
                        <code style={{ fontSize: 10, fontWeight: 700, fontFamily: Fn.mono, color: s.color, marginLeft: "auto" }}>{s.value}</code>
                      </div>
                    ) })}
                  </div>
                </div>
                {hovExpStatus !== null && expByStatus[hovExpStatus] && <ChartTooltip title={expByStatus[hovExpStatus].label} color={expByStatus[hovExpStatus].color} x={tipPos.x} y={tipPos.y} total={expByStatus[hovExpStatus].value} rows={[
                  { label: "Pedidos", value: expByStatus[hovExpStatus].value, color: expByStatus[hovExpStatus].color },
                  { label: "% do total", value: totalExp > 0 ? Math.round(expByStatus[hovExpStatus].value / totalExp * 100) : 0, color: C.azulCeu },
                ]} />}
              </div>
            );
          })()}

          {/* Pendências + Produção */}
          <div style={{ background: C.cardBg, borderRadius: "10px 10px 10px 18px", border: `1px solid ${C.cardBorder}`, padding: mob ? 14 : 20, boxShadow: "0 1px 3px rgba(0,75,155,.04)" }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 16 }}>
              <div><span style={{ fontSize: 13, fontWeight: 700, color: C.azulEscuro, fontFamily: Fn.title, display: "block" }}>Pendências & Produção</span><span style={{ fontSize: 10, color: C.cinzaChumbo }}>Ações necessárias e status das salas</span></div>
              <div style={{ width: 30, height: 30, borderRadius: 8, background: `${C.amareloEscuro}0A`, display: "flex", alignItems: "center", justifyContent: "center" }}>{Ic.alert(14, C.amareloEscuro)}</div>
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 6, marginBottom: 16 }}>
              {[
                { label: "Aprovação financeira", value: pendFinanceiro, color: C.amareloEscuro, icon: Ic.dollar },
                { label: "Emissão de NF", value: pendNF, color: C.azulProfundo, icon: Ic.file },
                { label: "Repanol em trânsito", value: repanolEnviados, color: C.azulCeu, icon: Ic.droplets },
                { label: "Costureira em trânsito", value: costureiraEnviados, color: C.verdeFloresta, icon: Ic.scissors },
              ].filter(p => p.value > 0).map((p, i) => (
                <div key={i} style={{ display: "flex", alignItems: "center", gap: 10, padding: "8px 12px", borderRadius: 8, border: `1px solid ${C.cardBorder}` }}>
                  <div style={{ width: 28, height: 28, borderRadius: 7, background: `${p.color}10`, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>{p.icon(14, p.color)}</div>
                  <span style={{ fontSize: 11, fontWeight: 600, color: C.cinzaEscuro, flex: 1 }}>{p.label}</span>
                  <span style={{ fontSize: 13, fontWeight: 800, fontFamily: Fn.title, color: p.color }}>{p.value}</span>
                </div>
              ))}
              {totalAlertas === 0 && <div style={{ padding: "16px 0", textAlign: "center" }}>{Ic.check(24, C.verdeFloresta)}<p style={{ fontSize: 11, fontWeight: 600, color: C.cinzaEscuro, margin: "6px 0 0" }}>Sem pendências</p></div>}
            </div>
            {/* Produção mini */}
            <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 8 }}>
              {[
                { label: "Ativas", value: prodAtiva, color: C.verdeFloresta, pct: fProducoes.length ? Math.round(prodAtiva / fProducoes.length * 100) : 0 },
                { label: "Pausadas", value: prodPausada, color: C.amareloEscuro, pct: fProducoes.length ? Math.round(prodPausada / fProducoes.length * 100) : 0 },
                { label: "Concluídas", value: prodConcluida, color: C.azulProfundo, pct: fProducoes.length ? Math.round(prodConcluida / fProducoes.length * 100) : 0 },
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

        {/* ═══ TOP FORNECEDORES · PERIODICIDADE ═══ */}
        {(() => {
          const fornMap: Record<string, { nome: string; count: number; peso: number; datas: number[] }> = {};
          for (const c of fColetas) {
            const k = c.fornecedorId || c.nomeFantasia || "?";
            if (!fornMap[k]) fornMap[k] = { nome: c.nomeFantasia || "?", count: 0, peso: 0, datas: [] };
            fornMap[k].count++;
            fornMap[k].peso += c.pesoTotalNF || 0;
            if (c.dataPedido) fornMap[k].datas.push(new Date(c.dataPedido).getTime());
          }
          const topForn = Object.values(fornMap).map(f => {
            const sorted = f.datas.sort((a, b) => a - b);
            let mediaDias = 0;
            if (sorted.length >= 2) {
              const diffs: number[] = [];
              for (let i = 1; i < sorted.length; i++) diffs.push((sorted[i] - sorted[i - 1]) / 86400000);
              mediaDias = Math.round(diffs.reduce((a, b) => a + b, 0) / diffs.length);
            }
            const ultima = sorted.length > 0 ? sorted[sorted.length - 1] : 0;
            const proxEst = ultima && mediaDias > 0 ? ultima + mediaDias * 86400000 : 0;
            let perioLabel = "—";
            if (mediaDias > 0) {
              if (mediaDias <= 3) perioLabel = `a cada ${mediaDias}d`;
              else if (mediaDias <= 9) perioLabel = "semanal";
              else if (mediaDias <= 18) perioLabel = "quinzenal";
              else if (mediaDias <= 45) perioLabel = "mensal";
              else if (mediaDias <= 100) perioLabel = "trimestral";
              else perioLabel = `~${mediaDias}d`;
            }
            return { ...f, mediaDias, ultima, proxEst, perioLabel };
          }).sort((a, b) => b.count - a.count).slice(0, 10);
          const maxFornCount = Math.max(...topForn.map(f => f.count), 1);
          const now = Date.now();
          return (
            <div style={{ background: C.cardBg, borderRadius: "12px 12px 12px 24px", border: `1px solid ${C.cardBorder}`, padding: mob ? 14 : 20, boxShadow: "0 1px 3px rgba(0,75,155,.04)", marginBottom: mob ? 16 : 24 }} onMouseMove={trackMouse}>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 16 }}>
                <div>
                  <span style={{ fontSize: 13, fontWeight: 700, color: C.azulEscuro, fontFamily: Fn.title, display: "block" }}>Top Fornecedores · Periodicidade</span>
                  <span style={{ fontSize: 10, color: C.cinzaChumbo }}>Frequência real calculada pelas datas{hasFilter ? " (filtrado)" : ""} · Top 10</span>
                </div>
                <div style={{ width: 30, height: 30, borderRadius: 8, background: `${C.azulProfundo}0A`, display: "flex", alignItems: "center", justifyContent: "center" }}>{Ic.edificio(14, C.azulProfundo)}</div>
              </div>
              {/* Header */}
              <div style={{ display: "grid", gridTemplateColumns: mob ? "28px 1fr 50px 70px" : "28px 1fr 70px 60px 80px 90px", gap: 8, padding: "0 12px 8px", borderBottom: `1px solid ${C.cardBorder}` }}>
                {(mob ? ["#", "Fornecedor", "Qtd", "Freq."] : ["#", "Fornecedor", "Coletas", "Peso", "Frequência", "Próxima est."]).map(h => (
                  <span key={h} style={{ fontSize: 9, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.06em", color: C.cinzaChumbo, fontFamily: Fn.title }}>{h}</span>
                ))}
              </div>
              {topForn.map((f, i) => {
                const pct = (f.count / maxFornCount) * 100;
                const proxFmt = f.proxEst ? new Date(f.proxEst).toLocaleDateString("pt-BR", { day: "2-digit", month: "short" }) : "—";
                const isAtrasada = f.proxEst > 0 && f.proxEst < now;
                const isH = hovFornAdmin === i;
                return (
                  <div key={i} onMouseEnter={() => setHovFornAdmin(i)} onMouseLeave={() => setHovFornAdmin(-1)} style={{ display: "grid", gridTemplateColumns: mob ? "28px 1fr 50px 70px" : "28px 1fr 70px 60px 80px 90px", gap: 8, alignItems: "center", padding: "8px 12px", borderBottom: `1px solid ${C.cardBorder}`, background: isH ? `${C.azulProfundo}06` : "transparent", transition: "background .12s", cursor: "default" }}>
                    <div style={{ width: 22, height: 22, borderRadius: 5, background: i < 3 ? C.azulProfundo : C.cardBorder, color: i < 3 ? C.branco : C.cinzaChumbo, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 9, fontWeight: 700, fontFamily: Fn.mono }}>{i + 1}</div>
                    <div style={{ minWidth: 0 }}>
                      <div style={{ fontSize: 12, fontWeight: 600, color: C.cinzaEscuro, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{f.nome}</div>
                      <div style={{ marginTop: 3, height: 3, borderRadius: 2, background: `${C.azulProfundo}10` }}><div style={{ height: 3, borderRadius: 2, background: C.azulProfundo, width: `${pct}%` }} /></div>
                    </div>
                    <span style={{ fontSize: 12, fontWeight: 700, color: C.azulProfundo, fontFamily: Fn.mono }}>{f.count}</span>
                    {!mob && <span style={{ fontSize: 11, color: C.textMuted, fontFamily: Fn.mono }}>{formatKg(f.peso)}</span>}
                    <div>
                      <span style={{ fontSize: 11, fontWeight: 600, color: f.mediaDias > 0 ? C.verdeFloresta : C.textLight }}>{f.perioLabel}</span>
                      {f.mediaDias > 0 && <div style={{ fontSize: 9, color: C.textMuted }}>~{f.mediaDias}d</div>}
                    </div>
                    {!mob && <div>
                      <span style={{ fontSize: 11, fontWeight: 600, color: isAtrasada ? C.danger : f.proxEst ? C.azulProfundo : C.textLight, fontFamily: Fn.mono }}>{proxFmt}</span>
                      {isAtrasada && <div style={{ fontSize: 9, fontWeight: 700, color: C.danger }}>atrasada</div>}
                      {!isAtrasada && f.proxEst > 0 && <div style={{ fontSize: 9, color: C.textMuted }}>{Math.ceil((f.proxEst - now) / 86400000)}d</div>}
                    </div>}
                  </div>
                );
              })}
              {hovFornAdmin >= 0 && topForn[hovFornAdmin] && (() => {
                const f = topForn[hovFornAdmin];
                const ultimaFmt = f.ultima ? new Date(f.ultima).toLocaleDateString("pt-BR") : "—";
                const proxFmt2 = f.proxEst ? new Date(f.proxEst).toLocaleDateString("pt-BR") : "—";
                return <ChartTooltip title={f.nome} color={C.azulProfundo} x={tipPos.x} y={tipPos.y} total={f.count} rows={[
                  { label: "Peso total", value: Math.round(f.peso), color: C.verdeFloresta },
                  { label: `Freq. média (${f.mediaDias || "—"}d)`, value: f.count, color: C.amareloEscuro },
                  { label: `Última: ${ultimaFmt}`, value: f.datas.length, color: C.azulCeu },
                  { label: `Próxima: ${proxFmt2}`, value: f.proxEst && f.proxEst < now ? 0 : 1, color: f.proxEst && f.proxEst < now ? C.danger : C.verdeEscuro },
                ]} />;
              })()}
            </div>
          );
        })()}

        {/* ═══ TABELA EXPEDIÇÕES + SIDEBAR ═══ */}
        <div style={{ display: "grid", gridTemplateColumns: mob ? "1fr" : "2fr 1fr", gap: mob ? 16 : 20 }}>
          {/* Tabela */}
          <div style={{ background: C.cardBg, borderRadius: "12px 12px 12px 24px", border: `1px solid ${C.cardBorder}`, overflow: "hidden", boxShadow: "0 1px 3px rgba(0,75,155,.04)" }}>
            <div style={{ padding: "16px 20px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
              <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
                <div style={{ width: 44, height: 44, borderRadius: 14, background: `${C.azulProfundo}0A`, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>{Ic.package(20, C.azulProfundo)}</div>
                <div><span style={{ fontSize: 15, fontWeight: 700, color: C.azulEscuro, fontFamily: Fn.title, display: "block" }}>Expedições{hasFilter ? " (filtradas)" : ""}</span><span style={{ fontSize: 12, color: C.cinzaChumbo }}>{expTable.length} mais recentes</span></div>
              </div>
            </div>
            <div style={{ overflowX: "auto" }}>
              <table style={{ width: "100%", borderCollapse: "collapse", fontFamily: Fn.body }}>
                <thead><tr style={{ background: C.bg }}>
                  {(mob ? ["ID", "Cliente", "Entrega"] : ["ID", "Cliente", "Galpão", "Rota", "Financeiro", "Entrega", "Kg"]).map(h => (
                    <th key={h} style={{ padding: "12px 14px", textAlign: "center", fontSize: 10, fontWeight: 700, letterSpacing: "1px", textTransform: "uppercase", color: C.cinzaChumbo, fontFamily: Fn.title, borderBottom: `2px solid ${C.cardBorder}`, whiteSpace: "nowrap" }}>{h}</th>
                  ))}
                </tr></thead>
                <tbody>
                  {expTable.map((r: any, i: number) => {
                    const isH = hovExpRow === i; const zebra = i % 2 === 1 ? `${C.azulCeu}0D` : "transparent";
                    return (
                      <tr key={i} onMouseEnter={() => setHovExpRow(i)} onMouseLeave={() => setHovExpRow(-1)} style={{ background: isH ? `${C.amareloOuro}18` : zebra, transition: "background .12s", borderBottom: i < expTable.length - 1 ? `1px solid ${C.cardBorder}` : "none" }}>
                        <td style={{ padding: "10px 14px", fontSize: 12, fontWeight: 600, color: C.azulProfundo, fontFamily: Fn.mono }}>EXP-{r.id}</td>
                        <td style={{ padding: "10px 14px", fontSize: 12, fontWeight: 500, color: C.cinzaEscuro, maxWidth: 140, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{r.cliente || "—"}</td>
                        {!mob && <td style={{ padding: "10px 14px", fontSize: 11, color: C.cinzaChumbo, textAlign: "center" }}>{r.galpao || "—"}</td>}
                        {!mob && <td style={{ padding: "10px 14px", fontSize: 11, color: C.cinzaChumbo, textAlign: "center" }}>{r.rota || "—"}</td>}
                        {!mob && <td style={{ padding: "10px 14px", textAlign: "center" }}><span style={{ display: "inline-flex", alignItems: "center", gap: 4, padding: "2px 6px", fontSize: 10, fontWeight: 600, color: STATUS_FIN_COLORS[r.statusFinanceiro] || C.cinzaChumbo, background: `${STATUS_FIN_COLORS[r.statusFinanceiro] || C.cinzaChumbo}10`, border: `1px solid ${STATUS_FIN_COLORS[r.statusFinanceiro] || C.cinzaChumbo}25`, borderRadius: 4 }}><span style={{ width: 5, height: 5, borderRadius: "50%", background: STATUS_FIN_COLORS[r.statusFinanceiro] || C.cinzaChumbo }} />{STATUS_FIN_LABELS[r.statusFinanceiro] || r.statusFinanceiro}</span></td>}
                        <td style={{ padding: "10px 14px", textAlign: "center" }}><span style={{ display: "inline-flex", alignItems: "center", gap: 4, padding: "2px 6px", fontSize: 10, fontWeight: 600, color: STATUS_EXP_COLORS[r.statusEntrega] || C.cinzaChumbo, background: `${STATUS_EXP_COLORS[r.statusEntrega] || C.cinzaChumbo}10`, border: `1px solid ${STATUS_EXP_COLORS[r.statusEntrega] || C.cinzaChumbo}25`, borderRadius: 4 }}><span style={{ width: 5, height: 5, borderRadius: "50%", background: STATUS_EXP_COLORS[r.statusEntrega] || C.cinzaChumbo }} />{STATUS_EXP_LABELS[r.statusEntrega] || r.statusEntrega}</span></td>
                        {!mob && <td style={{ padding: "10px 14px", fontSize: 12, fontWeight: 600, fontFamily: Fn.mono, color: C.azulEscuro, textAlign: "right" }}>{r.kilo ? formatKg(r.kilo) : "—"}</td>}
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
            <div style={{ padding: "10px 16px", borderTop: `1px solid ${C.cardBorder}`, background: C.bg, display: "flex", alignItems: "center", justifyContent: "space-between", fontSize: 11, color: C.cinzaChumbo }}>
              <span>{totalExp} expedições{hasFilter ? " filtradas" : ""}</span>
              <span style={{ fontWeight: 600, color: C.verdeEscuro }}>{entregues} entregues ({totalExp > 0 ? Math.round(entregues / totalExp * 100) : 0}%)</span>
            </div>
          </div>

          {/* Sidebar */}
          <div style={{ display: "flex", flexDirection: "column", gap: mob ? 16 : 20 }}>
            {/* Fluxo */}
            <div style={{ background: C.cardBg, borderRadius: "10px 10px 10px 18px", border: `1px solid ${C.cardBorder}`, padding: mob ? 14 : 18, boxShadow: "0 1px 3px rgba(0,75,155,.04)" }}>
              <span style={{ fontSize: 13, fontWeight: 700, color: C.azulEscuro, fontFamily: Fn.title, display: "block", marginBottom: 12 }}>Fluxo</span>
              {ETAPAS.map((label, i) => (
                <div key={i}>
                  <div style={{ display: "flex", alignItems: "center", gap: 10, padding: "7px 0" }}>
                    <div style={{ width: 24, height: 24, borderRadius: "50%", background: `${ETAPA_COLORS[i]}15`, border: `2px solid ${ETAPA_COLORS[i]}`, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}><span style={{ fontSize: 10, fontWeight: 800, fontFamily: Fn.title, color: ETAPA_COLORS[i] }}>{i + 1}</span></div>
                    <span style={{ fontSize: 12, fontWeight: 600, color: C.azulEscuro, flex: 1 }}>{label}</span>
                    <code style={{ fontSize: 11, fontWeight: 700, fontFamily: Fn.mono, color: ETAPA_COLORS[i] }}>{pipelineCounts[i]}</code>
                  </div>
                  {i < 4 && <div style={{ width: 2, height: 10, background: C.cardBorder, marginLeft: 11, borderRadius: 1 }} />}
                </div>
              ))}
            </div>

            {/* Resumo */}
            <div style={{ background: C.cardBg, borderRadius: "10px 10px 10px 18px", border: `1px solid ${C.cardBorder}`, padding: mob ? 14 : 18, boxShadow: "0 1px 3px rgba(0,75,155,.04)" }}>
              <span style={{ fontSize: 13, fontWeight: 700, color: C.azulEscuro, fontFamily: Fn.title, display: "block", marginBottom: 12 }}>Resumo</span>
              {[
                { label: "Clientes", value: data.clientes.length, color: C.azulProfundo },
                { label: "Fornecedores", value: (data as any).fornecedores?.length || 5, color: C.azulCeu },
                { label: "Colaboradores", value: `${colabAtivos} ativos`, color: C.verdeFloresta },
                { label: "Produtos", value: (data as any).produtos?.length || 8, color: C.amareloEscuro },
                { label: "Itens estoque", value: fEstoque.length, color: C.azulProfundo },
                { label: "Expedições ativas", value: totalExp - entregues, color: C.amareloEscuro },
                { label: "Peso NF recebido", value: formatKg(pesoTotal), color: C.verdeEscuro },
              ].map((r, i) => (
                <div key={i} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "7px 0", borderBottom: i < 6 ? `1px solid ${C.cardBorder}` : "none" }}>
                  <span style={{ fontSize: 12, color: C.cinzaChumbo }}>{r.label}</span>
                  <code style={{ fontSize: 12, fontWeight: 700, fontFamily: Fn.mono, color: r.color }}>{r.value}</code>
                </div>
              ))}
            </div>

            {/* Prioridades do dia */}
            <div style={{ background: C.cardBg, borderRadius: "10px 10px 10px 18px", border: `1px solid ${C.cardBorder}`, padding: mob ? 14 : 18, boxShadow: "0 1px 3px rgba(0,75,155,.04)" }}>
              <span style={{ fontSize: 13, fontWeight: 700, color: C.azulEscuro, fontFamily: Fn.title, display: "block", marginBottom: 12 }}>Prioridades do dia</span>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
                {macroPainel.map((m, i) => {
                  return (
                    <div key={m.label} style={{ display: "flex", alignItems: "center", gap: 8, padding: "8px 10px", borderRadius: 8, border: `1px solid ${C.cardBorder}`, background: `${m.color}08` }}>
                      <div style={{ width: 8, height: 8, borderRadius: "50%", background: m.color }} />
                      <div><span style={{ fontSize: 11, fontWeight: 600, color: C.cinzaEscuro, display: "block" }}>{m.label}</span><span style={{ fontSize: 9, color: m.color }}>{m.value}</span></div>
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
