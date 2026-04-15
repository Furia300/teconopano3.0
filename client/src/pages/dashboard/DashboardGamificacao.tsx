import { useState, useMemo, useEffect, useRef } from "react";

/* ═══ TYPES ═══ */
interface Producao {
  id: string; coletaId: string; sala: string; tipoMaterial: string; cor: string;
  medida: string; acabamento: string; pesoTotal: number; pesoMedio: number;
  quantidadePacotes: number; unidadeSaida: string; operador: string; createdAt: string;
}
interface ProducaoDiaria {
  nomeDupla: string; sala: string; material: string;
  horarioInicio: string; horarioFim: string; status: string;
}
interface Props { producoes: any[]; producaoDiaria: any[] }

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
let C = LIGHT;
const Fn = { title: "'Saira Expanded',sans-serif", body: "'Open Sans',sans-serif", mono: "'Fira Code',monospace" };

/* ═══ SVG ICONS ═══ */
const Ic = {
  trophy: (s: number, c: string) => <svg width={s} height={s} viewBox="0 0 20 20" fill="none"><path d="M6 3h8v5a4 4 0 01-8 0V3z" stroke={c} strokeWidth="1.4"/><path d="M6 5H3a1 1 0 00-1 1v1a3 3 0 003 3h1M14 5h3a1 1 0 011 1v1a3 3 0 01-3 3h-1" stroke={c} strokeWidth="1.3"/><path d="M8 12v2h4v-2M7 14h6M10 3v1" stroke={c} strokeWidth="1.3" strokeLinecap="round"/></svg>,
  scale: (s: number, c: string) => <svg width={s} height={s} viewBox="0 0 20 20" fill="none"><path d="M10 2v16M3 6l7-2 7 2M3 6l2 6h-4L3 6zM17 6l2 6h-4L17 6z" stroke={c} strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round"/></svg>,
  package: (s: number, c: string) => <svg width={s} height={s} viewBox="0 0 20 20" fill="none"><path d="M3 6l7-4 7 4v8l-7 4-7-4V6z" stroke={c} strokeWidth="1.4" strokeLinejoin="round"/><path d="M3 6l7 4 7-4M10 10v8" stroke={c} strokeWidth="1.3"/></svg>,
  users: (s: number, c: string) => <svg width={s} height={s} viewBox="0 0 20 20" fill="none"><circle cx="7" cy="6" r="3" stroke={c} strokeWidth="1.4"/><path d="M1 17c0-3 2.5-5 6-5s6 2 6 5" stroke={c} strokeWidth="1.4" strokeLinecap="round"/><circle cx="14" cy="7" r="2" stroke={c} strokeWidth="1.2"/><path d="M15 12c2 .5 4 2 4 4" stroke={c} strokeWidth="1.2" strokeLinecap="round"/></svg>,
  factory: (s: number, c: string) => <svg width={s} height={s} viewBox="0 0 20 20" fill="none"><path d="M2 18V8l4-3v5l4-3v5l4-3v8H2z" stroke={c} strokeWidth="1.4" strokeLinejoin="round"/><rect x="14" y="2" width="4" height="16" rx="1" stroke={c} strokeWidth="1.4"/></svg>,
  chart: (s: number, c: string) => <svg width={s} height={s} viewBox="0 0 20 20" fill="none"><rect x="3" y="10" width="3" height="7" rx="1" stroke={c} strokeWidth="1.3"/><rect x="8.5" y="6" width="3" height="11" rx="1" stroke={c} strokeWidth="1.3"/><rect x="14" y="3" width="3" height="14" rx="1" stroke={c} strokeWidth="1.3"/></svg>,
  grid: (s: number, c: string) => <svg width={s} height={s} viewBox="0 0 20 20" fill="none"><rect x="2" y="2" width="7" height="7" rx="1.5" stroke={c} strokeWidth="1.4"/><rect x="11" y="2" width="7" height="7" rx="1.5" stroke={c} strokeWidth="1.4"/><rect x="2" y="11" width="7" height="7" rx="1.5" stroke={c} strokeWidth="1.4"/><rect x="11" y="11" width="7" height="7" rx="1.5" stroke={c} strokeWidth="1.4"/></svg>,
  star: (s: number, c: string) => <svg width={s} height={s} viewBox="0 0 20 20" fill="none"><path d="M10 2l2.47 5.01L18 7.75l-4 3.9.94 5.49L10 14.63l-4.94 2.51.94-5.49-4-3.9 5.53-.74L10 2z" stroke={c} strokeWidth="1.4" strokeLinejoin="round"/></svg>,
  fire: (s: number, c: string) => <svg width={s} height={s} viewBox="0 0 20 20" fill="none"><path d="M10 2c0 3-3 5-3 8a4.5 4.5 0 009 0c0-2-1-3.5-2-5-1 1.5-2 2-2 2s0-2-2-5z" stroke={c} strokeWidth="1.4" strokeLinejoin="round"/></svg>,
  calendar: (s: number, c: string) => <svg width={s} height={s} viewBox="0 0 20 20" fill="none"><rect x="2" y="4" width="16" height="14" rx="2" stroke={c} strokeWidth="1.5"/><path d="M2 8h16M6 2v4M14 2v4" stroke={c} strokeWidth="1.5" strokeLinecap="round"/></svg>,
  x: (s: number, c: string) => <svg width={s} height={s} viewBox="0 0 16 16" fill="none"><path d="M4 4l8 8M12 4l-8 8" stroke={c} strokeWidth="1.8" strokeLinecap="round"/></svg>,
  flag: (s: number, c: string) => <svg width={s} height={s} viewBox="0 0 20 20" fill="none"><path d="M4 2v16M4 2h10l-3 4 3 4H4" stroke={c} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>,
};

/* ═══ MEDAL COLORS ═══ */
const MEDAL_GOLD = "#FDC24E";
const MEDAL_SILVER = "#C0CCD2";
const MEDAL_BRONZE = "#CD7F32";

/* ═══ SALA COLORS ═══ */
const SALA_COLORS = ["#004B9B", "#00C64C", "#F6921E", "#93BDE4", "#FDC24E", "#ed1b24", "#658EC9", "#00904C"];

/* ═══ MATERIAL COLORS ═══ */
const MAT_COLORS = ["#004B9B", "#00C64C", "#FDC24E", "#F6921E", "#93BDE4", "#658EC9", "#ed1b24", "#00904C", "#CD7F32", "#5B9BD5"];

/* ═══ HELPERS ═══ */
function formatKg(n: number) { return n >= 1000 ? `${(n / 1000).toFixed(1)}t` : `${Math.round(n)} kg`; }
const DIAS_SEMANA = ["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sab"];

function spark(seed: number, trend: "up" | "down") {
  const pts: number[] = []; let v = 40 + (seed % 30);
  for (let i = 0; i < 12; i++) { const d = trend === "up" ? 1.4 : -1.2; const n = Math.sin(seed * 0.31 + i * 0.7) * 8; v = Math.min(92, Math.max(8, v + d + n * 0.15)); pts.push(Math.round(v)); }
  return pts;
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

/* ═══ ChartTooltip ═══ */
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

/* ═══ Donut (multi-segment) ═══ */
function DonutChart({ segments, size = 130, strokeW = 14, center, hov, setHov }: {
  segments: { label: string; value: number; color: string; key: string }[];
  size?: number; strokeW?: number; center: React.ReactNode;
  hov: number | null; setHov: (i: number | null) => void;
}) {
  const cx = size / 2, cy = size / 2, r = (size - strokeW * 2) / 2;
  const circ = 2 * Math.PI * r;
  const total = Math.max(segments.reduce((a, s) => a + s.value, 0), 1);
  let acc = 0;
  return (
    <div style={{ position: "relative" }}>
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} style={{ transform: "rotate(-90deg)" }}>
        <circle cx={cx} cy={cy} r={r} fill="none" stroke={C.cardBorder} strokeWidth={strokeW} />
        {segments.map((s, i) => {
          const pct = s.value / total;
          const dash = pct * circ;
          const off = acc * circ;
          acc += pct;
          return (
            <circle key={i} cx={cx} cy={cy} r={r} fill="none" stroke={s.color}
              strokeWidth={hov === i ? strokeW + 4 : strokeW}
              strokeDasharray={`${dash} ${circ - dash}`} strokeDashoffset={-off}
              strokeLinecap="round" style={{ transition: "all .15s", cursor: "default" }}
              onMouseEnter={() => setHov(i)} onMouseLeave={() => setHov(null)}
            />
          );
        })}
      </svg>
      <div style={{ position: "absolute", inset: 0, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", pointerEvents: "none" }}>
        {center}
      </div>
    </div>
  );
}

/* ═══ Medal Badge ═══ */
function MedalBadge({ rank }: { rank: number }) {
  if (rank === 1) return (
    <div style={{ width: 36, height: 36, borderRadius: 10, background: `linear-gradient(135deg, ${MEDAL_GOLD}, #E5A800)`, display: "flex", alignItems: "center", justifyContent: "center", boxShadow: `0 2px 8px ${MEDAL_GOLD}55`, position: "relative" }}>
      {Ic.trophy(18, "#FFFFFF")}
      <span style={{ position: "absolute", bottom: -2, right: -2, fontSize: 8, fontWeight: 800, color: "#FFFFFF", background: MEDAL_GOLD, borderRadius: 6, padding: "0 4px", fontFamily: Fn.mono, border: `1.5px solid ${C.cardBg}` }}>1</span>
    </div>
  );
  if (rank === 2) return (
    <div style={{ width: 36, height: 36, borderRadius: 10, background: `linear-gradient(135deg, ${MEDAL_SILVER}, #A0ADB5)`, display: "flex", alignItems: "center", justifyContent: "center", boxShadow: `0 2px 8px ${MEDAL_SILVER}44` }}>
      {Ic.star(18, "#FFFFFF")}
      <span style={{ position: "absolute", bottom: -2, right: -2, fontSize: 8, fontWeight: 800, color: "#FFFFFF", background: MEDAL_SILVER, borderRadius: 6, padding: "0 4px", fontFamily: Fn.mono, border: `1.5px solid ${C.cardBg}` }}>2</span>
    </div>
  );
  if (rank === 3) return (
    <div style={{ width: 36, height: 36, borderRadius: 10, background: `linear-gradient(135deg, ${MEDAL_BRONZE}, #A0622A)`, display: "flex", alignItems: "center", justifyContent: "center", boxShadow: `0 2px 8px ${MEDAL_BRONZE}44` }}>
      {Ic.fire(18, "#FFFFFF")}
      <span style={{ position: "absolute", bottom: -2, right: -2, fontSize: 8, fontWeight: 800, color: "#FFFFFF", background: MEDAL_BRONZE, borderRadius: 6, padding: "0 4px", fontFamily: Fn.mono, border: `1.5px solid ${C.cardBg}` }}>3</span>
    </div>
  );
  return (
    <div style={{ width: 36, height: 36, borderRadius: 10, background: `${C.azulProfundo}0F`, border: `1px solid ${C.cardBorder}`, display: "flex", alignItems: "center", justifyContent: "center" }}>
      <span style={{ fontSize: 14, fontWeight: 800, color: C.cinzaChumbo, fontFamily: Fn.mono }}>{rank}</span>
    </div>
  );
}

/* ═══════════════════════════════════ MAIN ═══════════════════════════════════ */
export function DashboardGamificacao({ producoes, producaoDiaria }: Props) {
  const dark = useDark();
  C = dark ? DARK : LIGHT;

  const [w, setW] = useState(typeof window !== "undefined" ? window.innerWidth : 1200);
  useEffect(() => { const h = () => setW(window.innerWidth); window.addEventListener("resize", h); return () => window.removeEventListener("resize", h); }, []);
  const mob = w < 640;

  /* ═══ FILTERS ═══ */
  const allSalas = useMemo(() => [...new Set([...producoes.map((p: any) => p.sala), ...producaoDiaria.map((p: any) => p.sala)].filter(Boolean))].sort() as string[], [producoes, producaoDiaria]);
  const allMateriais = useMemo(() => [...new Set(producoes.map((p: any) => p.tipoMaterial).filter(Boolean))].sort() as string[], [producoes]);
  const [filterSala, setFilterSala] = useState<string | null>(null);
  const [filterMaterial, setFilterMaterial] = useState<string | null>(null);

  const fProd = useMemo(() => producoes.filter((p: any) => {
    if (filterSala && p.sala !== filterSala) return false;
    if (filterMaterial && p.tipoMaterial !== filterMaterial) return false;
    return true;
  }), [producoes, filterSala, filterMaterial]);

  const fDiaria = useMemo(() => producaoDiaria.filter((p: any) => {
    if (filterSala && p.sala !== filterSala) return false;
    return true;
  }), [producaoDiaria, filterSala]);

  const hasFilter = filterSala || filterMaterial;

  /* ═══ HOVER STATES ═══ */
  const [hovKpiCard, setHovKpiCard] = useState(-1);
  const [hovRankRow, setHovRankRow] = useState(-1);
  const [hovSalaBar, setHovSalaBar] = useState(-1);
  const [hovDonut, setHovDonut] = useState<number | null>(null);
  const [hovWeekBar, setHovWeekBar] = useState(-1);
  const [tipPos, setTipPos] = useState({ x: 0, y: 0 });
  const trackMouse = (e: React.MouseEvent) => setTipPos({ x: e.clientX, y: e.clientY });

  /* ═══ KPI CALCULATIONS ═══ */
  const totalKg = useMemo(() => fProd.reduce((sum: number, p: any) => sum + (Number(p.pesoTotal) || 0), 0), [fProd]);
  const totalPacotes = useMemo(() => fProd.reduce((sum: number, p: any) => sum + (Number(p.quantidadePacotes) || 0), 0), [fProd]);
  const operadores = useMemo(() => [...new Set([...fProd.map((p: any) => p.operador), ...fDiaria.map((p: any) => p.nomeDupla)].filter(Boolean))], [fProd, fDiaria]);
  const salasAtivas = useMemo(() => [...new Set([...fProd.map((p: any) => p.sala), ...fDiaria.map((p: any) => p.sala)].filter(Boolean))], [fProd, fDiaria]);

  /* ═══ RANKING DATA ═══ */
  const ranking = useMemo(() => {
    const map = new Map<string, { kg: number; pacotes: number; dias: Set<string> }>();
    fProd.forEach((p: any) => {
      const name = (p.operador || "").trim();
      if (!name) return;
      const entry = map.get(name) || { kg: 0, pacotes: 0, dias: new Set<string>() };
      entry.kg += Number(p.pesoTotal) || 0;
      entry.pacotes += Number(p.quantidadePacotes) || 0;
      if (p.createdAt) entry.dias.add(p.createdAt.slice(0, 10));
      map.set(name, entry);
    });
    fDiaria.forEach((p: any) => {
      const name = (p.nomeDupla || "").trim();
      if (!name) return;
      const entry = map.get(name) || { kg: 0, pacotes: 0, dias: new Set<string>() };
      if (p.horarioInicio) entry.dias.add(p.horarioInicio.slice(0, 10));
      map.set(name, entry);
    });
    return [...map.entries()]
      .map(([name, data]) => ({
        name,
        kg: Math.round(data.kg * 100) / 100,
        pacotes: data.pacotes,
        dias: data.dias.size,
        mediaDia: data.dias.size > 0 ? Math.round((data.kg / data.dias.size) * 10) / 10 : 0,
      }))
      .sort((a, b) => b.kg - a.kg);
  }, [fProd, fDiaria]);

  const maxKg = ranking[0]?.kg || 1;

  /* ═══ SALA PRODUCTION ═══ */
  const salaData = useMemo(() => {
    const map = new Map<string, number>();
    fProd.forEach((p: any) => {
      const sala = p.sala || "Sem Sala";
      map.set(sala, (map.get(sala) || 0) + (Number(p.pesoTotal) || 0));
    });
    return [...map.entries()].sort((a, b) => b[1] - a[1]).slice(0, 8);
  }, [fProd]);
  const maxSalaKg = salaData[0]?.[1] || 1;

  /* ═══ MATERIAL DONUT ═══ */
  const materialData = useMemo(() => {
    const map = new Map<string, number>();
    fProd.forEach((p: any) => {
      const mat = p.tipoMaterial || "Outros";
      map.set(mat, (map.get(mat) || 0) + (Number(p.pesoTotal) || 0));
    });
    return [...map.entries()].sort((a, b) => b[1] - a[1]).slice(0, 8).map(([label, value], i) => ({
      label, value: Math.round(value), color: MAT_COLORS[i % MAT_COLORS.length], key: label,
    }));
  }, [fProd]);
  const materialTotal = materialData.reduce((a, s) => a + s.value, 0);

  /* ═══ WEEKLY PRODUCTION ═══ */
  const weeklyData = useMemo(() => {
    const now = new Date();
    const days: { label: string; iso: string; kg: number; pacotes: number }[] = [];
    for (let i = 6; i >= 0; i--) {
      const d = new Date(now);
      d.setDate(d.getDate() - i);
      const iso = d.toISOString().slice(0, 10);
      days.push({ label: DIAS_SEMANA[d.getDay()], iso, kg: 0, pacotes: 0 });
    }
    fProd.forEach((p: any) => {
      const pDate = (p.createdAt || "").slice(0, 10);
      const day = days.find(d => d.iso === pDate);
      if (day) {
        day.kg += Number(p.pesoTotal) || 0;
        day.pacotes += Number(p.quantidadePacotes) || 0;
      }
    });
    return days;
  }, [fProd]);
  const maxWeekKg = Math.max(...weeklyData.map(d => d.kg), 1);

  /* ═══ KPIs ═══ */
  const kpis = [
    { label: "Total Produzido", value: formatKg(totalKg), icon: Ic.scale, color: C.azulProfundo, sparkPts: spark(Math.round(totalKg) * 3 + 42, "up") },
    { label: "Total Pacotes", value: totalPacotes.toLocaleString("pt-BR"), icon: Ic.package, color: C.verdeFloresta, sparkPts: spark(totalPacotes * 7 + 17, "up") },
    { label: "Colaboradores", value: operadores.length, icon: Ic.users, color: C.amareloEscuro, sparkPts: spark(operadores.length * 13 + 5, "up") },
    { label: "Salas Ativas", value: salasAtivas.length, icon: Ic.factory, color: C.azulCeu, sparkPts: spark(salasAtivas.length + 88, "up") },
  ];

  /* ═══ TOOLTIP CONTENT ═══ */
  const tipKpiCard = useMemo(() => {
    if (hovKpiCard < 0) return null;
    if (hovKpiCard === 0) return { title: "Produzido (kg)", color: C.azulProfundo, total: Math.round(totalKg), rows: salaData.slice(0, 4).map(([s, kg], i) => ({ label: s, value: Math.round(kg), color: SALA_COLORS[i % SALA_COLORS.length] })) };
    if (hovKpiCard === 1) return { title: "Pacotes", color: C.verdeFloresta, total: totalPacotes, rows: ranking.slice(0, 4).map((r, i) => ({ label: r.name, value: r.pacotes, color: SALA_COLORS[i % SALA_COLORS.length] })) };
    if (hovKpiCard === 2) return { title: "Colaboradores", color: C.amareloEscuro, total: operadores.length, rows: ranking.slice(0, 4).map((r, i) => ({ label: r.name, value: Math.round(r.kg), color: SALA_COLORS[i % SALA_COLORS.length] })) };
    return { title: "Salas", color: C.azulCeu, total: salasAtivas.length, rows: salaData.slice(0, 4).map(([s, kg], i) => ({ label: s, value: Math.round(kg), color: SALA_COLORS[i % SALA_COLORS.length] })) };
  }, [hovKpiCard, totalKg, totalPacotes, operadores, salasAtivas, salaData, ranking]);

  return (
    <div style={{ minHeight: "100vh", fontFamily: Fn.body, color: C.cinzaEscuro, background: C.bg, transition: "background .3s, color .3s" }}>
      <style>{`@keyframes fadeUp{from{opacity:0;transform:translateY(12px)}to{opacity:1;transform:translateY(0)}} @keyframes shimmerRank{0%{background-position:-200% 0}100%{background-position:200% 0}}`}</style>

      <div style={{ padding: mob ? "12px" : "16px 32px" }}>

        {/* ═══ HEADER ═══ */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 20 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <div style={{ width: 44, height: 44, borderRadius: 12, background: `linear-gradient(135deg, ${C.amareloOuro}22, ${C.amareloEscuro}11)`, border: `1px solid ${C.amareloOuro}33`, display: "flex", alignItems: "center", justifyContent: "center" }}>
              {Ic.trophy(22, C.amareloOuro)}
            </div>
            <div>
              <h2 style={{ fontSize: 20, fontWeight: 800, fontFamily: Fn.title, color: C.azulEscuro, lineHeight: 1.2, margin: 0 }}>
                Ranking de <span style={{ color: C.amareloOuro }}>Produtividade</span>
              </h2>
              <p style={{ fontSize: 11, color: C.textMuted, margin: 0, marginTop: 2 }}>
                Gamificacao da producao · {ranking.length} colaboradores · {salasAtivas.length} salas{hasFilter ? " (filtrado)" : ""}
              </p>
            </div>
          </div>
          <span style={{ fontSize: 10, color: C.textLight }}>{new Date().toLocaleDateString("pt-BR", { weekday: "long", day: "numeric", month: "long", year: "numeric" })}</span>
        </div>

        {/* ═══ FILTERS ═══ */}
        <div style={{ background: C.cardBg, border: `1px solid ${C.cardBorder}`, borderRadius: 10, padding: mob ? "12px" : "14px 20px", marginBottom: 20, position: "relative", zIndex: 300, overflow: "visible" }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 10 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              {Ic.grid(16, C.azulProfundo)}
              <span style={{ fontSize: 13, fontWeight: 700, color: C.azulEscuro, fontFamily: Fn.title }}>Filtros</span>
              {hasFilter && <span style={{ fontSize: 10, color: C.textMuted }}>- dados filtrados</span>}
            </div>
            {hasFilter && <button onClick={() => { setFilterSala(null); setFilterMaterial(null); }} style={{ display: "inline-flex", alignItems: "center", gap: 4, padding: "4px 10px", fontSize: 10, fontWeight: 600, color: C.cinzaChumbo, background: C.bg, border: `1px solid ${C.cardBorder}`, borderRadius: 6, cursor: "pointer", fontFamily: Fn.body }}>{Ic.x(10, C.cinzaChumbo)} Limpar</button>}
          </div>
          <div style={{ display: "grid", gridTemplateColumns: mob ? "1fr" : "repeat(2,1fr)", gap: 12 }}>
            <DSSelect label="Sala" value={filterSala} onChange={setFilterSala} options={allSalas} icon={Ic.factory(14, C.cinzaChumbo)} />
            <DSSelect label="Material" value={filterMaterial} onChange={setFilterMaterial} options={allMateriais} icon={Ic.package(14, C.cinzaChumbo)} />
          </div>
        </div>

        {/* ═══ KPIs ═══ */}
        <div style={{ display: "grid", gridTemplateColumns: mob ? "repeat(2,1fr)" : "repeat(4,1fr)", gap: mob ? 10 : 16, marginBottom: mob ? 16 : 24 }} onMouseMove={trackMouse}>
          {kpis.map((k, i) => {
            const max = Math.max(...k.sparkPts), min = Math.min(...k.sparkPts);
            const sw2 = 200, sh = 40;
            const pts = k.sparkPts.map((v, j) => ({ x: (j / (k.sparkPts.length - 1)) * sw2, y: sh - ((v - min) / (max - min || 1)) * (sh - 8) + 4 }));
            const line = pts.map(p => `${p.x},${p.y}`).join(" ");
            const uid = k.color.replace('#', '') + 'g' + i;
            return (
              <div
                key={i}
                onMouseEnter={() => setHovKpiCard(i)}
                onMouseLeave={() => setHovKpiCard(-1)}
                style={{
                  background: C.cardBg, border: `1px solid ${C.cardBorder}`, boxShadow: "0 1px 3px rgba(0,75,155,0.04)",
                  borderRadius: "12px 12px 12px 24px",
                  animation: `fadeUp .35s ease ${i * 0.06}s both`,
                  position: "relative",
                }}
              >
                <div style={{ padding: mob ? "14px 12px 6px" : "18px 20px 6px", position: "relative", zIndex: 2 }}>
                  <div style={{ position: "absolute", top: mob ? 12 : 16, right: mob ? 10 : 16, width: mob ? 34 : 40, height: mob ? 34 : 40, borderRadius: mob ? 9 : 12, background: `${k.color}0F`, border: `1px solid ${k.color}22`, display: "flex", alignItems: "center", justifyContent: "center" }}>{k.icon(mob ? 16 : 20, k.color)}</div>
                  <span style={{ fontSize: 10, fontWeight: 700, letterSpacing: "0.06em", textTransform: "uppercase", color: C.cinzaChumbo, display: "block", marginBottom: mob ? 6 : 8, fontFamily: Fn.title }}>{k.label}</span>
                  <span style={{ fontSize: mob ? 22 : 26, fontWeight: 800, fontFamily: Fn.title, color: C.azulEscuro, lineHeight: 1, letterSpacing: "-0.02em", display: "block", paddingRight: mob ? 40 : 48 }}>{k.value}</span>
                </div>
                <div style={{ overflow: "hidden", borderRadius: "0 0 12px 24px", marginLeft: -1, marginRight: -1, marginBottom: -1 }}>
                  <svg width="100%" height={sh + 16} viewBox={`-2 -12 ${sw2 + 4} ${sh + 28}`} preserveAspectRatio="none" style={{ display: "block" }}>
                    <defs><linearGradient id={`ga${uid}`} x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor={k.color} stopOpacity=".18" /><stop offset="100%" stopColor={k.color} stopOpacity="0" /></linearGradient></defs>
                    <polygon points={`0,${sh} ${line} ${sw2},${sh}`} fill={`url(#ga${uid})`} />
                    <polyline points={line} fill="none" stroke={k.color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </div>
              </div>
            );
          })}
        </div>
        {hovKpiCard >= 0 && tipKpiCard && <ChartTooltip {...tipKpiCard} x={tipPos.x} y={tipPos.y} />}

        {/* ═══ RANKING DE COLABORADORES ═══ */}
        <div style={{ background: C.cardBg, borderRadius: "12px 12px 12px 24px", border: `1px solid ${C.cardBorder}`, boxShadow: "0 1px 3px rgba(0,75,155,.04)", marginBottom: mob ? 16 : 24, animation: "fadeUp .4s ease .12s both", overflow: "hidden" }}>
          <div style={{ padding: mob ? "14px 12px" : "20px 24px 14px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <div>
              <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4 }}>
                {Ic.trophy(18, C.amareloOuro)}
                <span style={{ fontSize: 15, fontWeight: 700, color: C.azulEscuro, fontFamily: Fn.title }}>Ranking de Colaboradores</span>
              </div>
              <span style={{ fontSize: 10, color: C.cinzaChumbo }}>Ordenado por kg produzidos · {ranking.length} colaboradores{hasFilter ? " (filtrado)" : ""}</span>
            </div>
            <div style={{ width: 34, height: 34, borderRadius: 10, background: `${C.amareloOuro}14`, display: "flex", alignItems: "center", justifyContent: "center" }}>
              {Ic.chart(16, C.amareloOuro)}
            </div>
          </div>

          {/* Table header */}
          <div style={{ display: "grid", gridTemplateColumns: mob ? "44px 1fr 80px" : "50px 1fr 100px 90px 70px 90px 1fr", gap: 0, padding: "8px 24px", borderTop: `1px solid ${C.cardBorder}`, borderBottom: `1px solid ${C.cardBorder}`, background: `${C.azulProfundo}06` }}>
            <span style={{ fontSize: 9, fontWeight: 700, color: C.cinzaChumbo, fontFamily: Fn.title, textTransform: "uppercase", letterSpacing: "0.08em" }}>#</span>
            <span style={{ fontSize: 9, fontWeight: 700, color: C.cinzaChumbo, fontFamily: Fn.title, textTransform: "uppercase", letterSpacing: "0.08em" }}>Colaborador</span>
            <span style={{ fontSize: 9, fontWeight: 700, color: C.cinzaChumbo, fontFamily: Fn.title, textTransform: "uppercase", letterSpacing: "0.08em", textAlign: "right" }}>Kg Total</span>
            {!mob && <>
              <span style={{ fontSize: 9, fontWeight: 700, color: C.cinzaChumbo, fontFamily: Fn.title, textTransform: "uppercase", letterSpacing: "0.08em", textAlign: "right" }}>Pacotes</span>
              <span style={{ fontSize: 9, fontWeight: 700, color: C.cinzaChumbo, fontFamily: Fn.title, textTransform: "uppercase", letterSpacing: "0.08em", textAlign: "right" }}>Dias</span>
              <span style={{ fontSize: 9, fontWeight: 700, color: C.cinzaChumbo, fontFamily: Fn.title, textTransform: "uppercase", letterSpacing: "0.08em", textAlign: "right" }}>Media/dia</span>
              <span style={{ fontSize: 9, fontWeight: 700, color: C.cinzaChumbo, fontFamily: Fn.title, textTransform: "uppercase", letterSpacing: "0.08em", paddingLeft: 16 }}>Progresso</span>
            </>}
          </div>

          {/* Rows */}
          {ranking.length === 0 && (
            <div style={{ padding: "40px 24px", textAlign: "center" }}>
              <span style={{ fontSize: 13, color: C.textMuted }}>Nenhuma producao encontrada</span>
            </div>
          )}
          {ranking.map((r, i) => {
            const rank = i + 1;
            const pct = (r.kg / maxKg) * 100;
            const isTop3 = rank <= 3;
            const medalColor = rank === 1 ? MEDAL_GOLD : rank === 2 ? MEDAL_SILVER : rank === 3 ? MEDAL_BRONZE : C.azulProfundo;
            const isHov = hovRankRow === i;
            return (
              <div
                key={r.name}
                onMouseEnter={() => setHovRankRow(i)}
                onMouseLeave={() => setHovRankRow(-1)}
                style={{
                  display: "grid",
                  gridTemplateColumns: mob ? "44px 1fr 80px" : "50px 1fr 100px 90px 70px 90px 1fr",
                  gap: 0,
                  padding: mob ? "10px 12px" : "12px 24px",
                  alignItems: "center",
                  borderBottom: `1px solid ${C.cardBorder}`,
                  background: isTop3
                    ? `${medalColor}${isHov ? "12" : "08"}`
                    : isHov ? `${C.azulProfundo}06` : "transparent",
                  transition: "background .12s",
                  cursor: "default",
                }}
              >
                {/* Rank badge */}
                <MedalBadge rank={rank} />

                {/* Name */}
                <div style={{ display: "flex", flexDirection: "column", gap: 2, minWidth: 0 }}>
                  <span style={{ fontSize: 13, fontWeight: isTop3 ? 700 : 600, color: isTop3 ? C.azulEscuro : C.cinzaEscuro, fontFamily: Fn.body, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{r.name}</span>
                  {mob && <span style={{ fontSize: 10, color: C.textMuted }}>{r.pacotes} pac · {r.dias}d · {formatKg(r.mediaDia)}/d</span>}
                </div>

                {/* Kg total */}
                <span style={{ fontSize: isTop3 ? 15 : 13, fontWeight: 800, fontFamily: Fn.mono, color: isTop3 ? medalColor : C.azulEscuro, textAlign: "right", letterSpacing: "-0.02em" }}>{formatKg(r.kg)}</span>

                {!mob && <>
                  {/* Pacotes */}
                  <span style={{ fontSize: 12, fontWeight: 600, fontFamily: Fn.mono, color: C.cinzaEscuro, textAlign: "right" }}>{r.pacotes.toLocaleString("pt-BR")}</span>

                  {/* Dias */}
                  <span style={{ fontSize: 12, fontWeight: 500, fontFamily: Fn.mono, color: C.textMuted, textAlign: "right" }}>{r.dias}</span>

                  {/* Media/dia */}
                  <span style={{ fontSize: 12, fontWeight: 600, fontFamily: Fn.mono, color: C.verdeEscuro, textAlign: "right" }}>{formatKg(r.mediaDia)}</span>

                  {/* Progress bar */}
                  <div style={{ paddingLeft: 16, display: "flex", alignItems: "center", gap: 8 }}>
                    <div style={{ flex: 1, height: 8, borderRadius: 4, background: `${medalColor}15`, overflow: "hidden" }}>
                      <div style={{
                        height: 8, borderRadius: 4,
                        background: isTop3
                          ? `linear-gradient(90deg, ${medalColor}, ${medalColor}CC)`
                          : C.azulProfundo,
                        width: `${pct}%`,
                        transition: "width .4s ease",
                        ...(rank === 1 ? {
                          backgroundSize: "200% 100%",
                          animation: "shimmerRank 2s ease-in-out infinite",
                          backgroundImage: `linear-gradient(90deg, ${MEDAL_GOLD}, ${MEDAL_GOLD}CC, #FFFFFF88, ${MEDAL_GOLD}CC, ${MEDAL_GOLD})`,
                        } : {}),
                      }} />
                    </div>
                    <span style={{ fontSize: 10, fontWeight: 700, fontFamily: Fn.mono, color: C.textMuted, minWidth: 32, textAlign: "right" }}>{Math.round(pct)}%</span>
                  </div>
                </>}
              </div>
            );
          })}
        </div>

        {/* ═══ GRID: Produtividade por Sala + Top Materiais ═══ */}
        <div style={{ display: "grid", gridTemplateColumns: mob ? "1fr" : "1fr 1fr", gap: mob ? 12 : 16, marginBottom: mob ? 16 : 24 }}>

          {/* Produtividade por Sala — horizontal bars */}
          <div style={{ background: C.cardBg, borderRadius: "12px 12px 12px 24px", border: `1px solid ${C.cardBorder}`, padding: mob ? 14 : 20, boxShadow: "0 1px 3px rgba(0,75,155,.04)", animation: "fadeUp .4s ease .18s both" }} onMouseMove={trackMouse}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 16 }}>
              <div>
                <span style={{ fontSize: 13, fontWeight: 700, color: C.azulEscuro, fontFamily: Fn.title, display: "block" }}>Produtividade por Sala</span>
                <span style={{ fontSize: 10, color: C.cinzaChumbo }}>Total kg por sala de producao</span>
              </div>
              <div style={{ width: 30, height: 30, borderRadius: 8, background: `${C.azulProfundo}0A`, display: "flex", alignItems: "center", justifyContent: "center" }}>{Ic.factory(14, C.azulProfundo)}</div>
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              {salaData.map(([sala, kg], i) => {
                const pct = (kg / maxSalaKg) * 100;
                const isH = hovSalaBar === i;
                const color = SALA_COLORS[i % SALA_COLORS.length];
                return (
                  <div key={sala} onMouseEnter={() => setHovSalaBar(i)} onMouseLeave={() => setHovSalaBar(-1)} style={{ cursor: "default" }}>
                    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 3 }}>
                      <span style={{ fontSize: 11, fontWeight: isH ? 700 : 500, color: isH ? color : C.cinzaEscuro, fontFamily: Fn.body, transition: "all .12s" }}>{sala}</span>
                      <span style={{ fontSize: 11, fontWeight: 700, fontFamily: Fn.mono, color: isH ? color : C.azulEscuro }}>{formatKg(kg)}</span>
                    </div>
                    <div style={{ height: 10, borderRadius: 5, background: `${color}15`, overflow: "hidden" }}>
                      <div style={{ height: 10, borderRadius: 5, background: color, width: `${pct}%`, opacity: isH ? 1 : 0.8, transition: "all .15s" }} />
                    </div>
                  </div>
                );
              })}
              {salaData.length === 0 && <span style={{ fontSize: 12, color: C.textMuted, textAlign: "center", padding: 20 }}>Sem dados de producao</span>}
            </div>
            {hovSalaBar >= 0 && (
              <ChartTooltip
                title={salaData[hovSalaBar][0]}
                color={SALA_COLORS[hovSalaBar % SALA_COLORS.length]}
                total={Math.round(salaData[hovSalaBar][1])}
                rows={[
                  { label: "Kg Total", value: Math.round(salaData[hovSalaBar][1]), color: SALA_COLORS[hovSalaBar % SALA_COLORS.length] },
                  { label: "% do Total", value: Math.round((salaData[hovSalaBar][1] / Math.max(totalKg, 1)) * 100), color: C.verdeFloresta },
                ]}
                x={tipPos.x} y={tipPos.y}
              />
            )}
          </div>

          {/* Top Materiais — Donut */}
          <div style={{ background: C.cardBg, borderRadius: "10px 10px 10px 18px", border: `1px solid ${C.cardBorder}`, padding: mob ? 14 : 20, boxShadow: "0 1px 3px rgba(0,75,155,.04)", animation: "fadeUp .4s ease .24s both" }} onMouseMove={trackMouse}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 16 }}>
              <div>
                <span style={{ fontSize: 13, fontWeight: 700, color: C.azulEscuro, fontFamily: Fn.title, display: "block" }}>Top Materiais Produzidos</span>
                <span style={{ fontSize: 10, color: C.cinzaChumbo }}>Distribuicao por tipo de material</span>
              </div>
              <div style={{ width: 30, height: 30, borderRadius: 8, background: `${C.azulProfundo}0A`, display: "flex", alignItems: "center", justifyContent: "center" }}>{Ic.package(14, C.azulProfundo)}</div>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: mob ? 12 : 20, justifyContent: "center" }}>
              <DonutChart
                segments={materialData}
                hov={hovDonut}
                setHov={setHovDonut}
                center={
                  hovDonut !== null && materialData[hovDonut]
                    ? <>
                        <span style={{ fontSize: 16, fontWeight: 800, fontFamily: Fn.title, color: materialData[hovDonut].color, lineHeight: 1 }}>{formatKg(materialData[hovDonut].value)}</span>
                        <span style={{ fontSize: 8, color: C.cinzaChumbo }}>{Math.round((materialData[hovDonut].value / Math.max(materialTotal, 1)) * 100)}%</span>
                      </>
                    : <>
                        <span style={{ fontSize: 18, fontWeight: 800, fontFamily: Fn.title, color: C.azulEscuro, lineHeight: 1 }}>{materialData.length}</span>
                        <span style={{ fontSize: 9, color: C.cinzaChumbo }}>tipos</span>
                      </>
                }
              />
              <div style={{ display: "flex", flexDirection: "column", gap: 4, maxHeight: 130, overflowY: "auto" }}>
                {materialData.map((s, i) => (
                  <div key={s.key} onMouseEnter={() => setHovDonut(i)} onMouseLeave={() => setHovDonut(null)} style={{ display: "flex", alignItems: "center", gap: 6, padding: "2px 4px", borderRadius: 4, background: hovDonut === i ? `${s.color}10` : "transparent", transition: "all .12s", cursor: "default" }}>
                    <div style={{ width: 8, height: 8, borderRadius: "50%", background: s.color, flexShrink: 0 }} />
                    <span style={{ fontSize: 11, color: hovDonut === i ? s.color : C.cinzaEscuro, fontWeight: hovDonut === i ? 700 : 400, transition: "all .12s", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis", maxWidth: 100 }}>{s.label}</span>
                    <code style={{ fontSize: 10, fontWeight: 700, fontFamily: Fn.mono, color: s.color, marginLeft: "auto" }}>{formatKg(s.value)}</code>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* ═══ GRID: Producao Semanal + Resumo Lateral ═══ */}
        <div style={{ display: "grid", gridTemplateColumns: mob ? "1fr" : "2fr 1fr", gap: mob ? 12 : 16, marginBottom: mob ? 16 : 24 }}>

          {/* Producao Semanal — bar chart */}
          <div style={{ background: C.cardBg, borderRadius: "12px 12px 12px 24px", border: `1px solid ${C.cardBorder}`, padding: mob ? 14 : 20, boxShadow: "0 1px 3px rgba(0,75,155,.04)", animation: "fadeUp .4s ease .3s both" }} onMouseMove={trackMouse}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 16 }}>
              <div>
                <span style={{ fontSize: 13, fontWeight: 700, color: C.azulEscuro, fontFamily: Fn.title, display: "block" }}>Producao Semanal</span>
                <span style={{ fontSize: 10, color: C.cinzaChumbo }}>Ultimos 7 dias de producao (kg)</span>
              </div>
              <div style={{ width: 30, height: 30, borderRadius: 8, background: `${C.verdeFloresta}0A`, display: "flex", alignItems: "center", justifyContent: "center" }}>{Ic.calendar(14, C.verdeFloresta)}</div>
            </div>
            {(() => {
              const bw = 40, gp = 16, chartW = 7 * (bw + gp) - gp, chartH = 120;
              return (
                <div style={{ display: "flex", justifyContent: "center" }}>
                  <svg width={chartW + 40} height={chartH + 50} viewBox={`-20 -20 ${chartW + 40} ${chartH + 50}`}>
                    <line x1={0} y1={chartH} x2={chartW} y2={chartH} stroke={C.cardBorder} strokeWidth=".5" />
                    {weeklyData.map((day, i) => {
                      const bh = maxWeekKg > 0 ? Math.max(4, (day.kg / maxWeekKg) * chartH) : 4;
                      const x = i * (bw + gp);
                      const isH = hovWeekBar === i;
                      const color = day.kg > 0 ? C.verdeFloresta : C.textLight;
                      return (
                        <g key={i} onMouseEnter={() => setHovWeekBar(i)} onMouseLeave={() => setHovWeekBar(-1)} style={{ cursor: "pointer" }}>
                          <rect x={x} y={-20} width={bw} height={chartH + 50} fill="transparent" />
                          <rect x={x} y={chartH - bh} width={bw} height={bh} rx={6} fill={color} opacity={isH ? 1 : 0.75} style={{ transition: "all .15s" }} />
                          <text x={x + bw / 2} y={chartH - bh - 6} textAnchor="middle" fontSize="10" fontWeight="700" fill={C.azulEscuro} fontFamily={Fn.mono}>{day.kg > 0 ? formatKg(day.kg) : ""}</text>
                          <text x={x + bw / 2} y={chartH + 16} textAnchor="middle" fontSize="10" fill={isH ? C.verdeFloresta : C.cinzaChumbo} fontFamily={Fn.body} fontWeight={isH ? 700 : 400}>{day.label}</text>
                          {isH && <rect x={x - 2} y={chartH - bh - 2} width={bw + 4} height={bh + 4} rx={7} fill="none" stroke={color} strokeWidth="1.5" strokeDasharray="4 2" />}
                        </g>
                      );
                    })}
                  </svg>
                </div>
              );
            })()}
            {hovWeekBar >= 0 && weeklyData[hovWeekBar] && (
              <ChartTooltip
                title={weeklyData[hovWeekBar].label}
                color={C.verdeFloresta}
                total={Math.round(weeklyData[hovWeekBar].kg)}
                rows={[
                  { label: "Peso (kg)", value: Math.round(weeklyData[hovWeekBar].kg), color: C.verdeFloresta },
                  { label: "Pacotes", value: weeklyData[hovWeekBar].pacotes, color: C.azulProfundo },
                ]}
                x={tipPos.x} y={tipPos.y}
              />
            )}
          </div>

          {/* Resumo Lateral */}
          <div style={{ background: C.cardBg, borderRadius: "10px 10px 10px 18px", border: `1px solid ${C.cardBorder}`, padding: mob ? 14 : 20, boxShadow: "0 1px 3px rgba(0,75,155,.04)", animation: "fadeUp .4s ease .36s both" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 16 }}>
              {Ic.flag(16, C.azulProfundo)}
              <span style={{ fontSize: 13, fontWeight: 700, color: C.azulEscuro, fontFamily: Fn.title }}>Resumo</span>
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              {/* Top producer highlight */}
              {ranking[0] && (
                <div style={{ background: `${MEDAL_GOLD}10`, border: `1px solid ${MEDAL_GOLD}30`, borderRadius: 10, padding: 14 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8 }}>
                    {Ic.trophy(16, MEDAL_GOLD)}
                    <span style={{ fontSize: 11, fontWeight: 700, color: MEDAL_GOLD, fontFamily: Fn.title, textTransform: "uppercase", letterSpacing: "0.06em" }}>Lider de Producao</span>
                  </div>
                  <span style={{ fontSize: 15, fontWeight: 800, color: C.azulEscuro, fontFamily: Fn.body, display: "block" }}>{ranking[0].name}</span>
                  <div style={{ display: "flex", gap: 12, marginTop: 6 }}>
                    <span style={{ fontSize: 11, color: C.textMuted }}><strong style={{ color: MEDAL_GOLD, fontFamily: Fn.mono }}>{formatKg(ranking[0].kg)}</strong> total</span>
                    <span style={{ fontSize: 11, color: C.textMuted }}><strong style={{ color: C.verdeEscuro, fontFamily: Fn.mono }}>{formatKg(ranking[0].mediaDia)}</strong>/dia</span>
                  </div>
                </div>
              )}

              {/* Key metrics */}
              {[
                { label: "Media geral/colab", value: ranking.length > 0 ? formatKg(totalKg / ranking.length) : "0 kg", color: C.azulProfundo },
                { label: "Media geral/dia", value: (() => { const allDays = new Set<string>(); fProd.forEach((p: any) => { if (p.createdAt) allDays.add(p.createdAt.slice(0, 10)); }); return allDays.size > 0 ? formatKg(totalKg / allDays.size) : "0 kg"; })(), color: C.verdeFloresta },
                { label: "Maior pacote unico", value: (() => { let m = 0; fProd.forEach((p: any) => { const w = Number(p.pesoTotal) || 0; if (w > m) m = w; }); return formatKg(m); })(), color: C.amareloEscuro },
                { label: "Material mais produzido", value: materialData[0]?.label || "-", color: materialData[0]?.color || C.azulCeu },
                { label: "Sala mais produtiva", value: salaData[0]?.[0] || "-", color: SALA_COLORS[0] },
              ].map((m, i) => (
                <div key={i} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "6px 0", borderBottom: `1px solid ${C.cardBorder}` }}>
                  <span style={{ fontSize: 11, color: C.cinzaChumbo, fontFamily: Fn.body }}>{m.label}</span>
                  <span style={{ fontSize: 12, fontWeight: 700, fontFamily: Fn.mono, color: m.color }}>{m.value}</span>
                </div>
              ))}

              {/* Podium mini */}
              {ranking.length >= 3 && (
                <div style={{ marginTop: 8 }}>
                  <span style={{ fontSize: 10, fontWeight: 700, color: C.cinzaChumbo, fontFamily: Fn.title, textTransform: "uppercase", letterSpacing: "0.06em", display: "block", marginBottom: 8 }}>Podio</span>
                  <div style={{ display: "flex", alignItems: "flex-end", justifyContent: "center", gap: 6 }}>
                    {[1, 0, 2].map((idx) => {
                      const r = ranking[idx];
                      if (!r) return null;
                      const heights = [70, 50, 40];
                      const colors = [MEDAL_GOLD, MEDAL_SILVER, MEDAL_BRONZE];
                      const h = heights[idx];
                      return (
                        <div key={idx} style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 4 }}>
                          <span style={{ fontSize: 9, fontWeight: 700, color: colors[idx], fontFamily: Fn.mono, textAlign: "center", maxWidth: 60, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{r.name.split(" ")[0]}</span>
                          <div style={{ width: 44, height: h, borderRadius: "6px 6px 0 0", background: `linear-gradient(180deg, ${colors[idx]}, ${colors[idx]}88)`, display: "flex", alignItems: "center", justifyContent: "center" }}>
                            <span style={{ fontSize: 14, fontWeight: 800, color: "#FFFFFF", fontFamily: Fn.mono }}>{idx + 1}</span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
