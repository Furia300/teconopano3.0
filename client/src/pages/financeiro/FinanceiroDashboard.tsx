import { useState, useMemo, useEffect, useRef } from "react";
import { LuDollarSign, LuCircleCheck, LuClock, LuFile, LuX, LuChartBarIncreasing, LuLayoutGrid, LuUsers, LuFlag, LuTriangleAlert, LuArrowUp, LuArrowDown, LuArrowRight, LuChevronDown } from "react-icons/lu";
import { ResponsiveContainer, PieChart, Pie, Cell, BarChart, Bar, XAxis, Tooltip, AreaChart, Area } from "recharts";

/* ─── Types ─── */
interface Expedicao {
  id: string; clienteId?: string; nomeFantasia?: string; descricaoProduto?: string;
  tipoMaterial?: string; kilo?: number; kiloSolicitada?: number; qtdePedido?: number;
  statusPedido?: string; statusEntrega?: string; statusFinanceiro?: string;
  statusNota?: string; notaFiscal?: string; dataEmissaoNota?: string;
  galpao?: string; rota?: string; prioridade?: string; createdAt: string; updatedAt?: string;
}
interface Props { expedicoes: Expedicao[] }

function getPedidoStatus(e: Expedicao) {
  return (e.statusPedido || e.statusEntrega || "sem_status").toLowerCase();
}

function isValidFilterOption(value: string | undefined | null) {
  if (!value) return false;
  const normalized = String(value).trim().toLowerCase();
  return normalized !== "*" && normalized !== "-" && normalized !== "null" && normalized !== "undefined" && normalized !== "n/a";
}

/* ─── Dark mode ─── */
function useDark() {
  const [d, setD] = useState(() => typeof document !== "undefined" && document.documentElement.classList.contains("dark"));
  useEffect(() => { const el = document.documentElement; const obs = new MutationObserver(() => setD(el.classList.contains("dark"))); obs.observe(el, { attributes: true, attributeFilter: ["class"] }); return () => obs.disconnect(); }, []);
  return d;
}

/* ─── Colors ─── */
const LIGHT = { azulProfundo: "#004B9B", azulEscuro: "#002A68", azulClaro: "#658EC9", cinzaChumbo: "#7B8C96", cinzaEscuro: "#333B41", azulCeu: "#93BDE4", azulCeuClaro: "#D3E3F4", amareloOuro: "#FDC24E", amareloEscuro: "#F6921E", verdeFloresta: "#00C64C", verdeEscuro: "#00904C", danger: "#DC3545", branco: "#FFFFFF", bg: "#F2F4F8", cardBg: "#FFFFFF", cardBorder: "#E2E8F0", textMuted: "#64748B", textLight: "#94A3B8" };
const DARK = { azulProfundo: "#5B9BD5", azulEscuro: "#E2E8F0", azulClaro: "#7EAED6", cinzaChumbo: "#8B95A0", cinzaEscuro: "#E2E2E8", azulCeu: "#5B9BD5", azulCeuClaro: "#252525", amareloOuro: "#FDC24E", amareloEscuro: "#F6921E", verdeFloresta: "#34D870", verdeEscuro: "#34D870", danger: "#EF6B6B", branco: "#FFFFFF", bg: "#1A1A1A", cardBg: "#222222", cardBorder: "#2E2E2E", textMuted: "#6B7280", textLight: "#4B5563" };
let C = LIGHT;
const Fn = { title: "'Saira Expanded',sans-serif", body: "'Open Sans',sans-serif", mono: "'Fira Code',monospace" };

/* ─── Icons ─── */
const Ic = {
  dollar: (s: number, c: string) => <LuDollarSign size={s} color={c} />,
  check: (s: number, c: string) => <LuCircleCheck size={s} color={c} />,
  clock: (s: number, c: string) => <LuClock size={s} color={c} />,
  file: (s: number, c: string) => <LuFile size={s} color={c} />,
  x: (s: number, c: string) => <LuX size={s} color={c} />,
  chart: (s: number, c: string) => <LuChartBarIncreasing size={s} color={c} />,
  grid: (s: number, c: string) => <LuLayoutGrid size={s} color={c} />,
  users: (s: number, c: string) => <LuUsers size={s} color={c} />,
  flag: (s: number, c: string) => <LuFlag size={s} color={c} />,
  alert: (s: number, c: string) => <LuTriangleAlert size={s} color={c} />,
  arrow: (s: number, c: string) => <LuArrowRight size={s} color={c} />,
  arrowUp: (s: number, c: string) => <LuArrowUp size={s} color={c} />,
  arrowDown: (s: number, c: string) => <LuArrowDown size={s} color={c} />,
};

/* ─── Helpers ─── */
function formatKg(n: number) { return n >= 1000 ? `${(n / 1000).toFixed(1)}t` : `${Math.round(n)} kg`; }
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

const STATUS_FIN: Record<string, string> = { pendente_aprovacao: "Pendente", aprovado: "Aprovado", rejeitado: "Rejeitado" };
const STATUS_NF: Record<string, string> = { pendente_emissao: "Pendente", emitida: "Emitida", cancelada: "Cancelada" };
const PRIORIDADE_LABELS: Record<string, string> = { Urgente: "Urgente", Normal: "Normal", Baixa: "Baixa" };

/* ─── DSSelect ─── */
function DSSelect({ label, value, onChange, options, placeholder = "Todos", icon }: { label?: string; value: string | null; onChange: (v: string | null) => void; options: string[]; placeholder?: string; icon?: React.ReactNode }) {
  const [open, setOpen] = useState(false); const [hi, setHi] = useState(-1);
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => { const h = (e: MouseEvent) => { if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false) }; document.addEventListener("mousedown", h); return () => document.removeEventListener("mousedown", h) }, []);
  const bc = open ? C.azulProfundo : "#CBD5E1";
  return (
    <div ref={ref} style={{ display: "flex", flexDirection: "column", minWidth: 0, position: "relative", zIndex: open ? 400 : 1 }}>
      {label && <label style={{ fontSize: 11, fontWeight: 600, color: C.cinzaEscuro, fontFamily: Fn.body, marginBottom: 1, marginLeft: 7 }}>{label}</label>}
      <div onClick={() => setOpen(!open)} style={{ display: "flex", alignItems: "center", gap: 8, height: 30, padding: "0 12px", background: C.cardBg, border: `1.5px solid ${bc}`, borderRadius: open ? "8px 8px 0 0" : 8, transition: "all .18s", boxShadow: open ? "0 0 0 3px rgba(147,189,228,0.35)" : "none", cursor: "pointer", fontFamily: Fn.body, fontSize: 12, userSelect: "none" }}>
        {icon && <span style={{ display: "flex", flexShrink: 0, opacity: .55 }}>{icon}</span>}
        <span title={value || placeholder} style={{ flex: 1, color: value ? C.cinzaEscuro : C.textLight, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", fontWeight: 600 }}>{value || placeholder}</span>
        <LuChevronDown size={14} color={C.cinzaChumbo} style={{ flexShrink: 0, opacity: .45, transition: "transform .2s", transform: open ? "rotate(180deg)" : "rotate(0)" }} />
      </div>
      {open && <div style={{ position: "absolute", top: "100%", left: 0, right: 0, zIndex: 20, background: C.cardBg, border: `1.5px solid ${C.azulProfundo}`, borderTop: "none", borderRadius: "0 0 8px 8px", boxShadow: "0 6px 20px rgba(0,75,155,.12)", maxHeight: 200, overflowY: "auto" }}>
        <div onClick={() => { onChange(null); setOpen(false) }} style={{ padding: "6px 14px", fontSize: 12, fontFamily: Fn.body, color: !value ? C.azulProfundo : C.cinzaEscuro, fontWeight: !value ? 600 : 400, background: !value ? C.azulCeuClaro : "transparent", cursor: "pointer" }}>{placeholder}</div>
        {options.map((o, i) => { const sel = o === value; return <div key={o} onClick={() => { onChange(o); setOpen(false) }} onMouseEnter={() => setHi(i)} onMouseLeave={() => setHi(-1)} style={{ padding: "6px 14px", fontSize: 12, fontFamily: Fn.body, color: sel ? C.azulProfundo : C.cinzaEscuro, fontWeight: sel ? 600 : 400, background: sel ? C.azulCeuClaro : i === hi ? C.bg : "transparent", cursor: "pointer" }}>{o}</div> })}
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

/* ─── Donut ─── */
function Donut({ segments, size = 130, strokeW = 14, center, hov, setHov, onClick }: {
  segments: { label: string; value: number; color: string; key: string }[];
  size?: number; strokeW?: number; center: React.ReactNode;
  hov: number | null; setHov: (i: number | null) => void; onClick?: (key: string) => void;
}) {
  const innerRadius = (size - strokeW) / 2 - 4 - strokeW / 2;
  const outerRadius = (size - strokeW) / 2 - 4 + strokeW / 2;
  return (
    <div style={{ position: "relative", width: size, height: size }}>
      <ResponsiveContainer width={size} height={size}>
        <PieChart>
          <Pie
            data={segments}
            dataKey="value"
            cx="50%"
            cy="50%"
            innerRadius={innerRadius}
            outerRadius={outerRadius}
            paddingAngle={1}
            startAngle={90}
            endAngle={-270}
            stroke="none"
            isAnimationActive={false}
            activeIndex={hov !== null ? hov : undefined}
          >
            {segments.map((s, i) => (
              <Cell
                key={i}
                fill={s.color}
                style={{ cursor: onClick ? "pointer" : "default", transition: "all .15s", outline: "none" }}
                onClick={() => onClick?.(s.key)}
                onMouseEnter={() => setHov(i)}
                onMouseLeave={() => setHov(null)}
                strokeWidth={hov === i ? 2 : 0}
                stroke={hov === i ? s.color : "none"}
              />
            ))}
          </Pie>
        </PieChart>
      </ResponsiveContainer>
      <div style={{ position: "absolute", inset: 0, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", pointerEvents: "none" }}>{center}</div>
    </div>
  );
}

/* ─── Tooltip ─── */
function ChartTooltip({ title, color, rows, x, y, total }: { title: string; color: string; rows: { label: string; value: string | number; color?: string }[]; x: number; y: number; total?: number }) {
  const numRows = rows.filter(r => typeof r.value === "number");
  const maxVal = numRows.length > 0 ? Math.max(...numRows.map(r => r.value as number), 1) : 1;
  return (
    <div style={{ position: "fixed", left: x + 12, top: y - 10, zIndex: 50, pointerEvents: "none", animation: "fadeUp .15s ease" }}>
      <div style={{ background: C.cardBg, borderRadius: "8px 8px 8px 14px", border: `1px solid ${C.cardBorder}`, boxShadow: "0 8px 30px rgba(0,42,104,.18)", minWidth: 180, maxWidth: 280, overflow: "hidden" }}>
        <div style={{ background: color, padding: "8px 14px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <span style={{ fontSize: 12, fontWeight: 700, color: C.branco, fontFamily: Fn.title }}>{title}</span>
          {total != null && <span style={{ fontSize: 11, fontWeight: 700, color: `${C.branco}CC`, fontFamily: Fn.mono }}>{total}</span>}
        </div>
        <div style={{ padding: "8px 0" }}>
          {rows.map((r, i) => (
            <div key={i} style={{ display: "flex", alignItems: "center", gap: 8, padding: "4px 14px" }}>
              <div style={{ width: 6, height: 6, borderRadius: "50%", background: r.color || color, flexShrink: 0 }} />
              <span style={{ fontSize: 11, color: C.cinzaEscuro, fontFamily: Fn.body, flex: 1, whiteSpace: "nowrap" }}>{r.label}</span>
              {typeof r.value === "number" && <div style={{ width: 50, height: 4, borderRadius: 2, background: `${r.color || color}15`, flexShrink: 0 }}><div style={{ height: 4, borderRadius: 2, background: r.color || color, width: `${((r.value as number) / maxVal) * 100}%` }} /></div>}
              <span style={{ fontSize: 11, fontWeight: 700, color: r.color || color, fontFamily: Fn.mono, minWidth: 22, textAlign: "right" }}>{r.value}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

/* ═════════════════════════ MAIN ═════════════════════════ */
export function FinanceiroDashboard({ expedicoes }: Props) {
  const dark = useDark(); C = dark ? DARK : LIGHT;

  const [hovFin, setHovFin] = useState<number | null>(null);
  const [hovNf, setHovNf] = useState<number | null>(null);
  const [hovBar, setHovBar] = useState(-1);
  const [hovClient, setHovClient] = useState(-1);
  const [tipPos, setTipPos] = useState({ x: 0, y: 0 });
  const trackMouse = (e: React.MouseEvent) => setTipPos({ x: e.clientX, y: e.clientY });

  /* ═══ FILTROS ═══ */
  const [filter, setFilter] = useState<Record<string, string | null>>({ cliente: null, statusPedido: null, statusFin: null, statusNf: null, dataInicio: null, dataFim: null });
  const hasFilter = Object.values(filter).some(v => v);
  const setF = (key: string, val: string | null) => setFilter(f => ({ ...f, [key]: val || null }));
  const clearAll = () => setFilter({ cliente: null, statusPedido: null, statusFin: null, statusNf: null, dataInicio: null, dataFim: null });

  const allClientes = useMemo(() => [...new Set(expedicoes.map(e => e.nomeFantasia).filter(isValidFilterOption))].sort() as string[], [expedicoes]);
  const allStatusPedido = useMemo(() => [...new Set(expedicoes.map(getPedidoStatus).filter(isValidFilterOption))].sort() as string[], [expedicoes]);

  const filtered = useMemo(() => expedicoes.filter(e => {
    if (filter.statusPedido && getPedidoStatus(e) !== filter.statusPedido) return false;
    if (filter.statusFin && (e.statusFinanceiro || "pendente_aprovacao") !== filter.statusFin) return false;
    if (filter.statusNf && (e.statusNota || "pendente_emissao") !== filter.statusNf) return false;
    if (filter.cliente && e.nomeFantasia !== filter.cliente) return false;
    if (filter.dataInicio && new Date(e.createdAt) < new Date(filter.dataInicio)) return false;
    if (filter.dataFim && new Date(e.createdAt) > new Date(`${filter.dataFim}T23:59:59`)) return false;
    return true;
  }), [expedicoes, filter]);

  /* ─── Stats ─── */
  const total = filtered.length;
  const pendentes = filtered.filter(e => !e.statusFinanceiro || e.statusFinanceiro === "pendente_aprovacao").length;
  const aprovados = filtered.filter(e => e.statusFinanceiro === "aprovado").length;
  const rejeitados = filtered.filter(e => e.statusFinanceiro === "rejeitado").length;
  const nfEmitidas = filtered.filter(e => e.statusNota === "emitida").length;
  const nfPendentes = filtered.filter(e => !e.statusNota || e.statusNota === "pendente_emissao").length;
  const pesoTotal = filtered.reduce((a, e) => a + (e.kilo || 0), 0);
  const pesoPendente = filtered.filter(e => !e.statusFinanceiro || e.statusFinanceiro === "pendente_aprovacao").reduce((a, e) => a + (e.kilo || 0), 0);
  const urgentes = filtered.filter(e => e.prioridade === "Urgente" && (!e.statusFinanceiro || e.statusFinanceiro === "pendente_aprovacao")).length;

  /* Status Financeiro donut */
  const finData = useMemo(() => {
    const colors: Record<string, string> = { pendente_aprovacao: C.amareloEscuro, aprovado: C.verdeFloresta, rejeitado: C.danger };
    return Object.entries(STATUS_FIN).map(([key, label]) => ({
      key, label, value: filtered.filter(e => (e.statusFinanceiro || "pendente_aprovacao") === key).length, color: colors[key] || "#999",
    })).filter(s => s.value > 0);
  }, [filtered]);

  /* Status NF donut */
  const nfData = useMemo(() => {
    const colors: Record<string, string> = { pendente_emissao: C.amareloEscuro, emitida: C.verdeFloresta, cancelada: C.danger };
    return Object.entries(STATUS_NF).map(([key, label]) => ({
      key, label, value: filtered.filter(e => (e.statusNota || "pendente_emissao") === key).length, color: colors[key] || "#999",
    })).filter(s => s.value > 0);
  }, [filtered]);

  /* Monthly approvals */
  const monthlyData = useMemo(() => {
    const map: Record<string, { total: number; aprovados: number; rejeitados: number }> = {};
    const now = new Date();
    for (let i = 5; i >= 0; i--) { const d = new Date(now.getFullYear(), now.getMonth() - i, 1); map[`${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`] = { total: 0, aprovados: 0, rejeitados: 0 }; }
    for (const e of filtered) { if (!e.createdAt) continue; const d = new Date(e.createdAt); const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`; if (map[key]) { map[key].total++; if (e.statusFinanceiro === "aprovado") map[key].aprovados++; if (e.statusFinanceiro === "rejeitado") map[key].rejeitados++; } }
    return Object.entries(map).map(([m, d]) => ({ month: m, label: new Date(m + "-01").toLocaleDateString("pt-BR", { month: "short" }).toUpperCase(), ...d }));
  }, [filtered]);

  /* Top clientes pendentes */
  const topClientesPendentes = useMemo(() => {
    const map: Record<string, { nome: string; pendentes: number; aprovados: number; peso: number; total: number }> = {};
    for (const e of filtered) {
      const k = e.nomeFantasia || "Desconhecido";
      if (!map[k]) map[k] = { nome: k, pendentes: 0, aprovados: 0, peso: 0, total: 0 };
      map[k].total++;
      map[k].peso += e.kilo || 0;
      if (!e.statusFinanceiro || e.statusFinanceiro === "pendente_aprovacao") map[k].pendentes++;
      if (e.statusFinanceiro === "aprovado") map[k].aprovados++;
    }
    return Object.values(map).sort((a, b) => b.pendentes - a.pendentes || b.total - a.total).slice(0, 10);
  }, [filtered]);
  const maxClientePend = Math.max(...topClientesPendentes.map(c => c.total), 1);

  /* Pipeline financeiro */
  const pipeline = useMemo(() => [
    { label: "Pendente Aprovação", value: pendentes, color: C.amareloEscuro, icon: Ic.clock },
    { label: "Aprovado", value: aprovados, color: C.verdeFloresta, icon: Ic.check },
    { label: "NF Pendente", value: nfPendentes, color: C.azulCeu, icon: Ic.file },
    { label: "NF Emitida", value: nfEmitidas, color: C.azulProfundo, icon: Ic.file },
    { label: "Pronto Entrega", value: filtered.filter(e => e.statusEntrega === "pronto_entrega").length, color: C.verdeEscuro, icon: Ic.check },
  ], [filtered, pendentes, aprovados, nfPendentes, nfEmitidas]);
  const maxPipe = Math.max(...pipeline.map(p => p.value), 1);

  /* Prioridade distribution */
  const prioData = useMemo(() => {
    const colors: Record<string, string> = { Urgente: C.danger, Normal: C.azulProfundo, Baixa: C.cinzaChumbo };
    return Object.entries(PRIORIDADE_LABELS).map(([key, label]) => ({
      key, label, value: filtered.filter(e => e.prioridade === key).length, color: colors[key] || "#999",
    })).filter(s => s.value > 0);
  }, [filtered]);

  /* KPIs */
  const kpis = [
    { label: "Pendentes", value: pendentes, delta: urgentes > 0 ? `${urgentes} urgentes` : "nenhum urgente", up: false, color: C.amareloEscuro, pts: spark(pendentes * 9 + 42, "down"), icon: Ic.clock },
    { label: "Aprovados", value: aprovados, delta: `${total > 0 ? Math.round((aprovados / total) * 100) : 0}% do total`, up: true, color: C.verdeFloresta, pts: spark(aprovados * 11 + 17, "up"), icon: Ic.check },
    { label: "NF Emitidas", value: nfEmitidas, delta: `${nfPendentes} pendentes`, up: nfEmitidas > 0, color: C.azulProfundo, pts: spark(nfEmitidas + 41, nfEmitidas > 0 ? "up" : "down"), icon: Ic.file },
    { label: "Rejeitados", value: rejeitados, delta: rejeitados > 0 ? "requer atenção" : "nenhum", up: false, color: C.danger, pts: spark(rejeitados + 88, "down"), icon: Ic.alert },
  ];

  const cardStyle = (i?: number): React.CSSProperties => ({
    background: C.cardBg, border: `1px solid ${C.cardBorder}`, borderRadius: "12px 12px 12px 24px",
    boxShadow: "0 1px 3px rgba(0,75,155,.04)", animation: i !== undefined ? `fadeUp .35s ease ${(i) * 0.06}s both` : undefined,
  });

  return (
    <div style={{ fontFamily: Fn.body, color: C.cinzaEscuro }}>
      <style>{`@keyframes fadeUp{from{opacity:0;transform:translateY(12px)}to{opacity:1;transform:translateY(0)}}`}</style>

      {/* ═══ FILTROS ═══ */}
      <div style={{ ...cardStyle(), padding: "14px 20px", marginBottom: 16, position: "relative", zIndex: 300, overflow: "visible" }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 12 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            {Ic.grid(16, C.azulProfundo)}
            <span style={{ fontSize: 13, fontWeight: 700, color: C.azulEscuro, fontFamily: Fn.title }}>Filtros</span>
            {hasFilter && <span style={{ fontSize: 10, color: C.textMuted }}>· dados filtrados</span>}
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
            <span style={{ fontSize: 10, color: C.textMuted, fontFamily: Fn.body }}>{filtered.length} registros</span>
            {hasFilter && <button onClick={clearAll} style={{ display: "inline-flex", alignItems: "center", gap: 4, padding: "4px 10px", fontSize: 10, fontWeight: 600, color: C.cinzaChumbo, background: C.bg, border: `1px solid ${C.cardBorder}`, borderRadius: 6, cursor: "pointer", fontFamily: Fn.body }}>{Ic.x(10, C.cinzaChumbo)} Limpar</button>}
          </div>
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "160px 160px minmax(240px,1.4fr) repeat(3,minmax(0,1fr))", gap: 12 }}>
          <DSDateField label="Data inicial" value={filter.dataInicio} onChange={(v) => setF("dataInicio", v)} icon={Ic.clock(14, C.cinzaChumbo)} />
          <DSDateField label="Data final" value={filter.dataFim} onChange={(v) => setF("dataFim", v)} icon={Ic.clock(14, C.cinzaChumbo)} />
          <DSSelect label="Cliente" value={filter.cliente} onChange={v => setF("cliente", v)} options={allClientes} icon={Ic.users(14, C.cinzaChumbo)} />
          <DSSelect label="Pedidos" value={filter.statusPedido} onChange={v => setF("statusPedido", v)} options={allStatusPedido} icon={Ic.arrow(14, C.cinzaChumbo)} />
          <DSSelect label="Financeiro" value={filter.statusFin ? STATUS_FIN[filter.statusFin] || filter.statusFin : null} onChange={v => { const found = Object.entries(STATUS_FIN).find(([_, l]) => l === v); setF("statusFin", found ? found[0] : null); }} options={Object.values(STATUS_FIN)} icon={Ic.dollar(14, C.cinzaChumbo)} />
          <DSSelect label="Emissão NF" value={filter.statusNf ? STATUS_NF[filter.statusNf] || filter.statusNf : null} onChange={v => { const found = Object.entries(STATUS_NF).find(([_, l]) => l === v); setF("statusNf", found ? found[0] : null); }} options={Object.values(STATUS_NF)} icon={Ic.file(14, C.cinzaChumbo)} />
        </div>
      </div>

      {hasFilter && (
        <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 14, flexWrap: "wrap" }}>
          {filter.statusPedido && <span style={{ padding: "3px 8px", fontSize: 10, fontWeight: 600, color: C.azulProfundo, background: `${C.azulProfundo}10`, borderRadius: 4 }}>Pedidos: {filter.statusPedido.replace(/_/g, " ")}</span>}
          {filter.statusFin && <span style={{ padding: "3px 8px", fontSize: 10, fontWeight: 600, color: C.amareloEscuro, background: `${C.amareloEscuro}10`, borderRadius: 4 }}>Financeiro: {STATUS_FIN[filter.statusFin]}</span>}
          {filter.statusNf && <span style={{ padding: "3px 8px", fontSize: 10, fontWeight: 600, color: C.azulProfundo, background: `${C.azulProfundo}10`, borderRadius: 4 }}>NF: {STATUS_NF[filter.statusNf]}</span>}
          {filter.cliente && <span style={{ padding: "3px 8px", fontSize: 10, fontWeight: 600, color: C.azulCeu, background: `${C.azulCeu}10`, borderRadius: 4 }}>Cliente: {filter.cliente}</span>}
          {(filter.dataInicio || filter.dataFim) && <span style={{ padding: "3px 8px", fontSize: 10, fontWeight: 600, color: C.cinzaChumbo, background: `${C.cinzaChumbo}12`, borderRadius: 4 }}>Período: {filter.dataInicio || "…"} até {filter.dataFim || "…"}</span>}
        </div>
      )}

      {/* ═══ KPIs ═══ */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 16, marginBottom: 24 }}>
        {kpis.map((k, i) => {
          const sparkData = k.pts.map((v, j) => ({ month: MONTHS[j], value: v }));
          return (
            <div key={i} style={cardStyle(i)}>
              <div style={{ padding: "18px 20px 6px", position: "relative", zIndex: 2 }}>
                <div style={{ position: "absolute", top: 16, right: 16, width: 40, height: 40, borderRadius: 12, background: `${k.color}0F`, border: `1px solid ${k.color}22`, display: "flex", alignItems: "center", justifyContent: "center" }}>{k.icon(20, k.color)}</div>
                <span style={{ fontSize: 10, fontWeight: 700, letterSpacing: "0.06em", textTransform: "uppercase", color: C.cinzaChumbo, display: "block", marginBottom: 8, fontFamily: Fn.title }}>{k.label}</span>
                <div style={{ display: "flex", flexDirection: "column", gap: 6, paddingRight: 48 }}>
                  <span style={{ fontSize: 26, fontWeight: 800, fontFamily: Fn.title, color: C.azulEscuro, lineHeight: 1, letterSpacing: "-0.02em" }}>{k.value}</span>
                  <span style={{ fontSize: 11, fontWeight: 600, color: C.textMuted }}><span style={{ color: k.up ? C.verdeEscuro : C.amareloEscuro, fontFamily: Fn.mono, fontWeight: 700 }}>{k.up ? "▲ " : "▼ "}</span>{k.delta}</span>
                </div>
              </div>
              <div style={{ overflow: "hidden", borderRadius: "0 0 12px 24px", marginLeft: -1, marginRight: -1, marginBottom: -1 }}>
                <ResponsiveContainer width="100%" height={56}>
                  <AreaChart data={sparkData} margin={{ top: 4, right: 0, bottom: 0, left: 0 }}>
                    <defs>
                      <linearGradient id={`gfk${i}`} x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor={k.color} stopOpacity={0.18} />
                        <stop offset="100%" stopColor={k.color} stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <Area
                      type="monotone"
                      dataKey="value"
                      stroke={k.color}
                      strokeWidth={2}
                      fill={`url(#gfk${i})`}
                      isAnimationActive={false}
                      dot={false}
                      activeDot={{ r: 4, fill: k.color, stroke: "none" }}
                    />
                    <Tooltip
                      cursor={false}
                      contentStyle={{ background: C.cardBg, border: `1px solid ${C.cardBorder}`, borderRadius: 6, padding: "4px 8px", fontSize: 10, fontFamily: Fn.mono }}
                      labelStyle={{ fontSize: 9, color: C.cinzaChumbo, fontFamily: Fn.body }}
                      formatter={(value: number) => [value, ""]}
                      labelFormatter={(label: string) => label}
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>
          );
        })}
      </div>

      {/* ═══ PIPELINE FINANCEIRO ═══ */}
      <div style={{ ...cardStyle(), padding: 20, marginBottom: 24 }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 20 }}>
          <div><span style={{ fontSize: 13, fontWeight: 700, color: C.azulEscuro, fontFamily: Fn.title, display: "block" }}>Pipeline Financeiro</span><span style={{ fontSize: 10, color: C.cinzaChumbo }}>Fluxo de aprovação e emissão · {total} pedidos</span></div>
          <div style={{ width: 30, height: 30, borderRadius: 8, background: `${C.azulProfundo}0A`, display: "flex", alignItems: "center", justifyContent: "center" }}>{Ic.chart(14, C.azulProfundo)}</div>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 0 }}>
          {pipeline.map((p, i) => (
            <div key={i} style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", position: "relative" }}>
              <div style={{ width: 48, height: 48, borderRadius: 14, background: `${p.color}12`, border: `2px solid ${p.color}40`, display: "flex", alignItems: "center", justifyContent: "center", marginBottom: 8 }}>{p.icon(22, p.color)}</div>
              <span style={{ fontSize: 22, fontWeight: 800, fontFamily: Fn.title, color: p.color }}>{p.value}</span>
              <span style={{ fontSize: 9, fontWeight: 600, color: C.cinzaChumbo, textAlign: "center", marginTop: 2 }}>{p.label}</span>
              <div style={{ position: "absolute", top: 22, right: -8, width: 16, height: 16, display: i < pipeline.length - 1 ? "flex" : "none", alignItems: "center", justifyContent: "center", opacity: .3 }}>{Ic.arrow(14, C.cinzaChumbo)}</div>
            </div>
          ))}
        </div>
      </div>

      {/* ═══ APROVAÇÕES POR MÊS + STATUS FINANCEIRO DONUT ═══ */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, marginBottom: 24 }}>
        <div style={{ ...cardStyle(), padding: 20 }} onMouseMove={trackMouse}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 16 }}>
            <div><span style={{ fontSize: 13, fontWeight: 700, color: C.azulEscuro, fontFamily: Fn.title, display: "block" }}>Movimentação por Mês</span><span style={{ fontSize: 10, color: C.cinzaChumbo }}>Últimos 6 meses{hasFilter ? " · filtrado" : ""}</span></div>
            <div style={{ width: 30, height: 30, borderRadius: 8, background: `${C.azulProfundo}0A`, display: "flex", alignItems: "center", justifyContent: "center" }}>{Ic.chart(14, C.azulProfundo)}</div>
          </div>
          <ResponsiveContainer width="100%" height={160}>
            <BarChart data={monthlyData} margin={{ top: 16, right: 8, bottom: 0, left: 8 }}
              onMouseMove={(state: any) => { if (state && state.activeTooltipIndex !== undefined) setHovBar(state.activeTooltipIndex); }}
              onMouseLeave={() => setHovBar(-1)}
            >
              <XAxis dataKey="label" tick={{ fontSize: 9, fill: C.cinzaChumbo, fontFamily: Fn.body }} axisLine={{ stroke: C.cardBorder, strokeWidth: 0.5 }} tickLine={false} />
              <Tooltip
                cursor={{ fill: `${C.azulProfundo}08` }}
                content={({ active, payload }) => {
                  if (!active || !payload?.[0]) return null;
                  const d = payload[0].payload;
                  return <ChartTooltip title={d.label} color={C.azulProfundo} x={tipPos.x} y={tipPos.y} rows={[
                    { label: "Total", value: d.total, color: C.azulProfundo },
                    { label: "Aprovados", value: d.aprovados, color: C.verdeFloresta },
                    { label: "Rejeitados", value: d.rejeitados, color: C.danger },
                  ]} />;
                }}
                wrapperStyle={{ pointerEvents: "none" }}
              />
              <Bar dataKey="total" fill={C.azulProfundo} radius={[6, 6, 0, 0]} opacity={0.82} isAnimationActive={false}
                label={{ position: "top", fontSize: 11, fontWeight: 700, fill: C.azulEscuro, fontFamily: Fn.mono }}
              />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div style={{ ...cardStyle(), padding: 20 }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 16 }}>
            <div><span style={{ fontSize: 13, fontWeight: 700, color: C.azulEscuro, fontFamily: Fn.title, display: "block" }}>Status Financeiro</span><span style={{ fontSize: 10, color: C.cinzaChumbo }}>Clique para filtrar · {total} pedidos</span></div>
            <div style={{ width: 30, height: 30, borderRadius: 8, background: `${C.amareloEscuro}0A`, display: "flex", alignItems: "center", justifyContent: "center" }}>{Ic.dollar(14, C.amareloEscuro)}</div>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 20, justifyContent: "center" }}>
            <Donut segments={finData} hov={hovFin} setHov={setHovFin}
              onClick={(key) => setF("statusFin", filter.statusFin === key ? null : key)}
              center={hovFin !== null ? <><span style={{ fontSize: 16, fontWeight: 800, fontFamily: Fn.title, color: finData[hovFin]?.color, lineHeight: 1 }}>{finData[hovFin]?.value}</span><span style={{ fontSize: 8, color: C.cinzaChumbo }}>{Math.round((finData[hovFin]?.value || 0) / total * 100)}%</span></> : <><span style={{ fontSize: 20, fontWeight: 800, fontFamily: Fn.title, color: C.azulEscuro, lineHeight: 1 }}>{total}</span><span style={{ fontSize: 9, color: C.cinzaChumbo }}>total</span></>} />
            <div style={{ display: "flex", flexDirection: "column", gap: 5 }}>
              {finData.map((s, i) => (
                <div key={s.key} onClick={() => setF("statusFin", filter.statusFin === s.key ? null : s.key)} style={{ display: "flex", alignItems: "center", gap: 8, cursor: "pointer", opacity: filter.statusFin && filter.statusFin !== s.key ? 0.3 : 1, transition: "opacity .15s" }} onMouseEnter={() => setHovFin(i)} onMouseLeave={() => setHovFin(null)}>
                  <div style={{ width: 8, height: 8, borderRadius: "50%", background: s.color, flexShrink: 0 }} />
                  <span style={{ fontSize: 11, color: C.cinzaEscuro, fontFamily: Fn.body }}>{s.label}</span>
                  <span style={{ fontSize: 11, fontWeight: 700, color: s.color, fontFamily: Fn.mono, marginLeft: "auto" }}>{s.value}</span>
                </div>))}
            </div>
          </div>
        </div>
      </div>

      {/* ═══ TOP CLIENTES PENDENTES + STATUS NF DONUT ═══ */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, marginBottom: 24 }}>
        <div style={{ ...cardStyle(), padding: 20 }} onMouseMove={trackMouse}>
          <div style={{ marginBottom: 16 }}>
            <span style={{ fontSize: 13, fontWeight: 700, color: C.azulEscuro, fontFamily: Fn.title, display: "block" }}>Top Clientes · Pendências</span>
            <span style={{ fontSize: 10, color: C.cinzaChumbo }}>Clientes com mais pedidos pendentes de aprovação</span>
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
            {topClientesPendentes.slice(0, 8).map((c, i) => {
              const isH = hovClient === i;
              const pctPend = c.total > 0 ? Math.round((c.pendentes / c.total) * 100) : 0;
              return (
                <div key={i} onMouseEnter={() => setHovClient(i)} onMouseLeave={() => setHovClient(-1)} style={{ display: "flex", alignItems: "center", gap: 10, padding: "6px 8px", borderRadius: 6, background: isH ? `${C.azulProfundo}06` : "transparent", transition: "background .15s" }}>
                  <div style={{ width: 20, height: 20, borderRadius: 4, background: i < 3 ? C.amareloEscuro : C.cardBorder, color: i < 3 ? C.branco : C.cinzaChumbo, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 8, fontWeight: 700, fontFamily: Fn.mono, flexShrink: 0 }}>{i + 1}</div>
                  <span style={{ fontSize: 11, fontWeight: 600, color: C.cinzaEscuro, flex: 1, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{c.nome}</span>
                  <div style={{ width: 60, height: 5, borderRadius: 3, background: `${C.amareloEscuro}12`, flexShrink: 0 }}>
                    <div style={{ height: "100%", borderRadius: 3, background: C.amareloEscuro, width: `${(c.total / maxClientePend) * 100}%` }} />
                  </div>
                  <code style={{ fontSize: 10, fontWeight: 700, color: c.pendentes > 0 ? C.amareloEscuro : C.verdeFloresta, fontFamily: Fn.mono, minWidth: 20, textAlign: "right" }}>{c.pendentes}</code>
                  <span style={{ fontSize: 9, color: C.textMuted }}>{pctPend}%</span>
                </div>);
            })}
          </div>
          {hovClient >= 0 && topClientesPendentes[hovClient] && (() => {
            const c = topClientesPendentes[hovClient];
            return <ChartTooltip title={c.nome} color={C.amareloEscuro} x={tipPos.x} y={tipPos.y} rows={[
              { label: "Total pedidos", value: c.total, color: C.azulProfundo },
              { label: "Pendentes", value: c.pendentes, color: C.amareloEscuro },
              { label: "Aprovados", value: c.aprovados, color: C.verdeFloresta },
              { label: "Peso total", value: formatKg(c.peso), color: C.azulCeu },
            ]} />;
          })()}
        </div>

        <div style={{ ...cardStyle(), padding: 20 }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 16 }}>
            <div><span style={{ fontSize: 13, fontWeight: 700, color: C.azulEscuro, fontFamily: Fn.title, display: "block" }}>Status Nota Fiscal</span><span style={{ fontSize: 10, color: C.cinzaChumbo }}>Clique para filtrar · {total} pedidos</span></div>
            <div style={{ width: 30, height: 30, borderRadius: 8, background: `${C.azulProfundo}0A`, display: "flex", alignItems: "center", justifyContent: "center" }}>{Ic.file(14, C.azulProfundo)}</div>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 20, justifyContent: "center" }}>
            <Donut segments={nfData} hov={hovNf} setHov={setHovNf}
              onClick={(key) => setF("statusNf", filter.statusNf === key ? null : key)}
              center={hovNf !== null ? <><span style={{ fontSize: 16, fontWeight: 800, fontFamily: Fn.title, color: nfData[hovNf]?.color, lineHeight: 1 }}>{nfData[hovNf]?.value}</span><span style={{ fontSize: 8, color: C.cinzaChumbo }}>{Math.round((nfData[hovNf]?.value || 0) / total * 100)}%</span></> : <><span style={{ fontSize: 20, fontWeight: 800, fontFamily: Fn.title, color: C.azulEscuro, lineHeight: 1 }}>{total}</span><span style={{ fontSize: 9, color: C.cinzaChumbo }}>total</span></>} />
            <div style={{ display: "flex", flexDirection: "column", gap: 5 }}>
              {nfData.map((s, i) => (
                <div key={s.key} onClick={() => setF("statusNf", filter.statusNf === s.key ? null : s.key)} style={{ display: "flex", alignItems: "center", gap: 8, cursor: "pointer", opacity: filter.statusNf && filter.statusNf !== s.key ? 0.3 : 1 }} onMouseEnter={() => setHovNf(i)} onMouseLeave={() => setHovNf(null)}>
                  <div style={{ width: 8, height: 8, borderRadius: "50%", background: s.color, flexShrink: 0 }} />
                  <span style={{ fontSize: 11, color: C.cinzaEscuro, fontFamily: Fn.body }}>{s.label}</span>
                  <span style={{ fontSize: 11, fontWeight: 700, color: s.color, fontFamily: Fn.mono, marginLeft: "auto" }}>{s.value}</span>
                </div>))}
            </div>
          </div>
        </div>
      </div>

      {/* ═══ RESUMO + PRIORIDADE ═══ */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, marginBottom: 24 }}>
        <div style={{ ...cardStyle(), padding: 20 }}>
          <span style={{ fontSize: 13, fontWeight: 700, color: C.azulEscuro, fontFamily: Fn.title, display: "block", marginBottom: 16 }}>Resumo Financeiro</span>
          {[
            { label: "Total pedidos", value: expedicoes.length, color: C.azulProfundo },
            { label: "Pendentes aprovação", value: pendentes, color: C.amareloEscuro },
            { label: "Aprovados", value: aprovados, color: C.verdeFloresta },
            { label: "Rejeitados", value: rejeitados, color: C.danger },
            { label: "NF emitidas", value: nfEmitidas, color: C.azulProfundo },
            { label: "NF pendentes", value: nfPendentes, color: C.amareloOuro },
            { label: "Peso total", value: formatKg(pesoTotal), color: C.verdeFloresta },
            { label: "Peso pendente", value: formatKg(pesoPendente), color: C.amareloEscuro },
            { label: "Clientes", value: new Set(filtered.map(e => e.nomeFantasia).filter(Boolean)).size, color: C.azulClaro },
            { label: "Urgentes pendentes", value: urgentes, color: C.danger },
            { label: "Taxa aprovação", value: `${total > 0 ? Math.round((aprovados / total) * 100) : 0}%`, color: C.verdeEscuro },
          ].map((r, i) => (
            <div key={i} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "6px 0", borderBottom: `1px solid ${C.cardBorder}` }}>
              <span style={{ fontSize: 12, color: C.cinzaEscuro }}>{r.label}</span>
              <span style={{ fontSize: 12, fontWeight: 700, color: r.color, fontFamily: Fn.mono }}>{r.value}</span>
            </div>))}
        </div>

        <div style={{ ...cardStyle(), padding: 20 }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 16 }}>
            <div><span style={{ fontSize: 13, fontWeight: 700, color: C.azulEscuro, fontFamily: Fn.title, display: "block" }}>Distribuição por Prioridade</span><span style={{ fontSize: 10, color: C.cinzaChumbo }}>Clique para filtrar</span></div>
            <div style={{ width: 30, height: 30, borderRadius: 8, background: `${C.danger}0A`, display: "flex", alignItems: "center", justifyContent: "center" }}>{Ic.flag(14, C.danger)}</div>
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            {prioData.map((p, i) => {
              const pct = total > 0 ? Math.round((p.value / total) * 100) : 0;
              return (
                <div key={p.key} onClick={() => setF("prioridade", filter.prioridade === p.key ? null : p.key)} style={{ cursor: "pointer", opacity: filter.prioridade && filter.prioridade !== p.key ? .3 : 1, transition: "opacity .15s" }}>
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 4 }}>
                    <span style={{ fontSize: 12, fontWeight: 600, color: p.color }}>{p.label}</span>
                    <span style={{ fontSize: 12, fontWeight: 700, color: p.color, fontFamily: Fn.mono }}>{p.value} ({pct}%)</span>
                  </div>
                  <div style={{ height: 10, borderRadius: 5, background: `${p.color}12` }}>
                    <div style={{ height: "100%", borderRadius: 5, background: p.color, width: `${pct}%`, opacity: .85, transition: "width .3s" }} />
                  </div>
                </div>);
            })}
            {prioData.length === 0 && <span style={{ fontSize: 11, color: C.textMuted, textAlign: "center", padding: 20 }}>Sem dados de prioridade</span>}
          </div>
        </div>
      </div>
    </div>
  );
}
