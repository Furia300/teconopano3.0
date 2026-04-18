import { useState, useMemo, useEffect, useRef } from "react";
import { LuSend, LuUsers, LuScale, LuCircleCheck, LuClock, LuChartBarIncreasing, LuTruck, LuLayoutGrid, LuX, LuFlag, LuDollarSign, LuBox, LuBuilding2, LuChevronDown, LuCheck } from "react-icons/lu";
import { ResponsiveContainer, PieChart, Pie, Cell, BarChart, Bar, XAxis, Tooltip, AreaChart, Area } from "recharts";

/* ─── Types ─── */
interface Expedicao {
  id: string;
  clienteId?: string;
  nomeFantasia?: string;
  descricaoProduto?: string;
  tipoMaterial?: string;
  kilo?: number;
  kiloSolicitada?: number;
  statusPedido?: string;
  statusEntrega?: string;
  statusFinanceiro?: string;
  galpao?: string;
  rota?: string;
  periodicidade?: string;
  createdAt: string;
  updatedAt?: string;
}

interface Props { expedicoes: Expedicao[] }

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

/* ─── Icons (react-icons/lu) ─── */
const Ic = {
  send: (s: number, c: string) => <LuSend size={s} color={c} />,
  users: (s: number, c: string) => <LuUsers size={s} color={c} />,
  scale: (s: number, c: string) => <LuScale size={s} color={c} />,
  check: (s: number, c: string) => <LuCircleCheck size={s} color={c} />,
  clock: (s: number, c: string) => <LuClock size={s} color={c} />,
  chart: (s: number, c: string) => <LuChartBarIncreasing size={s} color={c} />,
  truck: (s: number, c: string) => <LuTruck size={s} color={c} />,
  grid: (s: number, c: string) => <LuLayoutGrid size={s} color={c} />,
  x: (s: number, c: string) => <LuX size={s} color={c} />,
  flag: (s: number, c: string) => <LuFlag size={s} color={c} />,
  dollar: (s: number, c: string) => <LuDollarSign size={s} color={c} />,
  box: (s: number, c: string) => <LuBox size={s} color={c} />,
  edificio: (s: number, c: string) => <LuBuilding2 size={s} color={c} />,
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

const STATUS_ENTREGA: Record<string, string> = { pendente: "Pendente", em_rota: "Em rota", entregue: "Entregue", cancelado: "Cancelado" };
const STATUS_FINANCEIRO_LABELS: Record<string, string> = { pendente: "Pendente", aprovado: "Aprovado", recusado: "Recusado" };

/* ─── DSSelect ─── */
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
        <LuChevronDown size={14} color={C.cinzaChumbo} style={{ flexShrink: 0, opacity: .45, transition: "transform .2s", transform: open ? "rotate(180deg)" : "rotate(0)" }} />
      </div>
      {open && <div style={{ position: "absolute", top: "100%", left: 0, right: 0, zIndex: 20, background: C.cardBg, border: `1.5px solid ${C.azulProfundo}`, borderTop: "none", borderRadius: "0 0 8px 8px", boxShadow: "0 6px 20px rgba(0,75,155,.12)", maxHeight: 200, overflowY: "auto" }}>
        <div onClick={() => { onChange(null); setOpen(false) }} style={{ padding: "6px 14px", fontSize: 12, fontFamily: Fn.body, color: !value ? C.azulProfundo : C.cinzaEscuro, fontWeight: !value ? 600 : 400, background: !value ? C.azulCeuClaro : "transparent", cursor: "pointer" }}>{placeholder}</div>
        {options.map((o, i) => { const sel = o === value; return <div key={o} onClick={() => { onChange(o); setOpen(false) }} onMouseEnter={() => setHi(i)} onMouseLeave={() => setHi(-1)} style={{ padding: "6px 14px", fontSize: 12, fontFamily: Fn.body, color: sel ? C.azulProfundo : C.cinzaEscuro, fontWeight: sel ? 600 : 400, background: sel ? C.azulCeuClaro : i === hi ? C.bg : "transparent", cursor: "pointer", display: "flex", alignItems: "center", gap: 8 }}>
          {sel && <LuCheck size={12} color={C.azulProfundo} style={{ marginLeft: -14, flexShrink: 0 }} />}
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

/* ─── Donut (Recharts) ─── */
function Donut({ segments, size = 130, strokeW = 14, center, hov, setHov, onClick }: {
  segments: { label: string; value: number; color: string; key: string }[];
  size?: number; strokeW?: number; center: React.ReactNode;
  hov: number | null; setHov: (i: number | null) => void;
  onClick?: (key: string) => void;
}) {
  const innerR = (size / 2) - strokeW - 4;
  const outerR = (size / 2) - 4;
  return (
    <div style={{ position: "relative", width: size, height: size }}>
      <PieChart width={size} height={size}>
        <Pie
          data={segments}
          dataKey="value"
          cx="50%"
          cy="50%"
          innerRadius={innerR}
          outerRadius={outerR}
          paddingAngle={1}
          startAngle={90}
          endAngle={-270}
          stroke="none"
          isAnimationActive={false}
          onMouseEnter={(_, i) => setHov(i)}
          onMouseLeave={() => setHov(null)}
          onClick={(_, i) => onClick?.(segments[i].key)}
          style={{ cursor: onClick ? "pointer" : "default" }}
        >
          {segments.map((s, i) => (
            <Cell key={i} fill={s.color} strokeWidth={0} style={{ outline: "none", transition: "all .15s", transform: hov === i ? "scale(1.04)" : "scale(1)", transformOrigin: "center" }} />
          ))}
        </Pie>
      </PieChart>
      <div style={{ position: "absolute", inset: 0, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", pointerEvents: "none" }}>{center}</div>
    </div>
  );
}

/* ─── Tooltip ─── */
function ChartTooltip({ title, color, rows, x, y, total }: {
  title: string; color: string;
  rows: { label: string; value: string | number; color?: string }[];
  x: number; y: number; total?: number;
}) {
  const numRows = rows.filter(r => typeof r.value === "number");
  const maxVal = numRows.length > 0 ? Math.max(...numRows.map(r => r.value as number), 1) : 1;
  return (
    <div style={{ position: "fixed", left: x + 12, top: y - 10, zIndex: 50, pointerEvents: "none", animation: "fadeUp .15s ease" }}>
      <div style={{ background: C.cardBg, borderRadius: "8px 8px 8px 14px", border: `1px solid ${C.cardBorder}`, boxShadow: "0 8px 30px rgba(0,42,104,.18), 0 2px 8px rgba(0,0,0,.08)", minWidth: 180, maxWidth: 280, overflow: "hidden" }}>
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
export function ExpedicaoDashboard({ expedicoes }: Props) {
  const dark = useDark();
  C = dark ? DARK : LIGHT;

  const [hovStatus, setHovStatus] = useState<number | null>(null);
  const [hovBar, setHovBar] = useState(-1);
  const [hovForn, setHovForn] = useState(-1);
  const [hovMat, setHovMat] = useState(-1);
  const [tipPos, setTipPos] = useState({ x: 0, y: 0 });
  const trackMouse = (e: React.MouseEvent) => setTipPos({ x: e.clientX, y: e.clientY });

  /* ═══ FILTROS ═══ */
  const [filter, setFilter] = useState<Record<string, string | null>>({ cliente: null, statusEntrega: null, statusPedido: null, material: null, rota: null, dataInicio: null, dataFim: null });
  const hasFilter = Object.values(filter).some(v => v);
  const setF = (key: string, val: string | null) => setFilter(f => ({ ...f, [key]: val || null }));
  const clearAll = () => setFilter({ cliente: null, statusEntrega: null, statusPedido: null, material: null, rota: null, dataInicio: null, dataFim: null });

  const allRotas = useMemo(() => [...new Set(expedicoes.map(e => e.rota).filter(Boolean))].sort() as string[], [expedicoes]);
  const allMateriais = useMemo(() => [...new Set(expedicoes.map(e => e.tipoMaterial).filter(Boolean))].sort() as string[], [expedicoes]);
  const allClientes = useMemo(() => [...new Set(expedicoes.map(e => e.nomeFantasia).filter(Boolean))].sort() as string[], [expedicoes]);
  const allStatusEntrega = useMemo(() => [...new Set(expedicoes.map(e => e.statusEntrega || "pendente"))].sort() as string[], [expedicoes]);
  const allStatusPedido = useMemo(() => [...new Set(expedicoes.map(e => e.statusPedido).filter(Boolean))].sort() as string[], [expedicoes]);

  const filtered = useMemo(() => {
    return expedicoes.filter(e => {
      if (filter.rota && e.rota !== filter.rota) return false;
      if (filter.statusEntrega && (e.statusEntrega || "pendente") !== filter.statusEntrega) return false;
      if (filter.statusPedido && (e.statusPedido || "") !== filter.statusPedido) return false;
      if (filter.material && e.tipoMaterial !== filter.material) return false;
      if (filter.cliente && e.nomeFantasia !== filter.cliente) return false;
      if (filter.dataInicio && new Date(e.createdAt) < new Date(filter.dataInicio)) return false;
      if (filter.dataFim && new Date(e.createdAt) > new Date(`${filter.dataFim}T23:59:59`)) return false;
      return true;
    });
  }, [expedicoes, filter]);

  /* ─── Stats ─── */
  const total = filtered.length;
  const pendentes = filtered.filter(e => !e.statusEntrega || e.statusEntrega === "pendente").length;
  const emRota = filtered.filter(e => e.statusEntrega === "em_rota").length;
  const entregues = filtered.filter(e => e.statusEntrega === "entregue").length;
  const cancelados = filtered.filter(e => e.statusEntrega === "cancelado").length;
  const pesoTotal = filtered.reduce((a, e) => a + (e.kilo || 0), 0);
  const pesoSolicitado = filtered.reduce((a, e) => a + (e.kiloSolicitada || 0), 0);
  const finAprovados = filtered.filter(e => e.statusFinanceiro === "aprovado").length;
  const finPendentes = filtered.filter(e => !e.statusFinanceiro || e.statusFinanceiro === "pendente").length;

  /* Status donut */
  const statusData = useMemo(() => {
    const colors: Record<string, string> = { pendente: C.amareloEscuro, em_rota: C.azulProfundo, entregue: C.verdeFloresta, cancelado: C.danger };
    return Object.entries(STATUS_ENTREGA).map(([key, label]) => ({
      key, label, value: filtered.filter(e => (e.statusEntrega || "pendente") === key).length, color: colors[key] || "#999",
    })).filter(s => s.value > 0);
  }, [filtered]);

  /* Top clientes com periodicidade */
  const topClientes = useMemo(() => {
    const map: Record<string, { nome: string; count: number; peso: number; datas: number[]; materiais: Record<string, number> }> = {};
    for (const e of filtered) {
      const k = e.clienteId || e.nomeFantasia || "Desconhecido";
      const nome = e.nomeFantasia || "Desconhecido";
      if (!map[k]) map[k] = { nome, count: 0, peso: 0, datas: [], materiais: {} };
      map[k].count++;
      map[k].peso += e.kilo || 0;
      if (e.createdAt) map[k].datas.push(new Date(e.createdAt).getTime());
      if (e.tipoMaterial) map[k].materiais[e.tipoMaterial] = (map[k].materiais[e.tipoMaterial] || 0) + 1;
    }
    return Object.values(map)
      .map(f => {
        const sorted = f.datas.sort((a, b) => a - b);
        let mediaDias = 0;
        if (sorted.length >= 2) {
          const diffs: number[] = [];
          for (let i = 1; i < sorted.length; i++) diffs.push((sorted[i] - sorted[i - 1]) / 86400000);
          mediaDias = Math.round(diffs.reduce((a, b) => a + b, 0) / diffs.length);
        }
        const ultima = sorted.length > 0 ? sorted[sorted.length - 1] : 0;
        const proximaEstimada = ultima && mediaDias > 0 ? ultima + mediaDias * 86400000 : 0;
        let perioLabel = "—";
        if (mediaDias > 0) {
          if (mediaDias <= 3) perioLabel = `a cada ${mediaDias}d`;
          else if (mediaDias <= 9) perioLabel = "semanal";
          else if (mediaDias <= 18) perioLabel = "quinzenal";
          else if (mediaDias <= 45) perioLabel = "mensal";
          else if (mediaDias <= 100) perioLabel = "trimestral";
          else perioLabel = `~${mediaDias}d`;
        }
        const topMat = Object.entries(f.materiais).sort((a, b) => b[1] - a[1]).slice(0, 3).map(([m, c]) => `${m} (${c})`).join(", ");
        return { ...f, mediaDias, ultima, proximaEstimada, perioLabel, topMat };
      })
      .sort((a, b) => b.count - a.count)
      .slice(0, 10);
  }, [filtered]);
  const maxCliente = Math.max(...topClientes.map(f => f.count), 1);

  /* Top materiais */
  const topMateriais = useMemo(() => {
    const map: Record<string, { count: number; peso: number; clientes: Set<string> }> = {};
    for (const e of filtered) {
      const mat = e.tipoMaterial || "Sem tipo";
      if (!map[mat]) map[mat] = { count: 0, peso: 0, clientes: new Set() };
      map[mat].count++;
      map[mat].peso += e.kilo || 0;
      if (e.nomeFantasia) map[mat].clientes.add(e.nomeFantasia);
    }
    return Object.entries(map)
      .map(([mat, d]) => ({ material: mat, count: d.count, peso: d.peso, numClientes: d.clientes.size }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 10);
  }, [filtered]);
  const maxMat = Math.max(...topMateriais.map(m => m.count), 1);
  const matColors = [C.azulProfundo, C.verdeFloresta, C.amareloEscuro, C.azulCeu, C.amareloOuro, C.azulClaro, C.verdeEscuro, C.danger, C.cinzaChumbo, C.azulClaro];

  /* Monthly */
  const monthlyData = useMemo(() => {
    const map: Record<string, number> = {};
    const now = new Date();
    for (let i = 5; i >= 0; i--) { const d = new Date(now.getFullYear(), now.getMonth() - i, 1); map[`${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`] = 0; }
    for (const e of filtered) { if (!e.createdAt) continue; const d = new Date(e.createdAt); const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`; if (map[key] !== undefined) map[key]++; }
    return Object.entries(map).map(([m, count]) => ({ month: m, label: new Date(m + "-01").toLocaleDateString("pt-BR", { month: "short" }).toUpperCase(), count }));
  }, [filtered]);


  /* Rota distribution */
  const rotaData = useMemo(() => {
    const map: Record<string, number> = {};
    for (const e of filtered) { const r = e.rota || "Sem rota"; map[r] = (map[r] || 0) + 1; }
    return Object.entries(map).sort((a, b) => b[1] - a[1]).slice(0, 8);
  }, [filtered]);
  const maxRota = rotaData[0]?.[1] || 1;
  const rotaColors = [C.azulProfundo, C.azulCeu, C.verdeFloresta, C.amareloEscuro, C.amareloOuro, C.azulClaro, C.verdeEscuro, C.danger];

  /* Financeiro donut */
  const finData = useMemo(() => {
    const colors: Record<string, string> = { pendente: C.amareloEscuro, aprovado: C.verdeFloresta, recusado: C.danger };
    return Object.entries(STATUS_FINANCEIRO_LABELS).map(([key, label]) => ({
      key, label, value: filtered.filter(e => (e.statusFinanceiro || "pendente") === key).length, color: colors[key] || "#999",
    })).filter(s => s.value > 0);
  }, [filtered]);
  const [hovFin, setHovFin] = useState<number | null>(null);

  /* KPIs */
  const kpis = [
    { label: "Pedidos", value: total, delta: `${pendentes} pendentes`, up: true, color: C.azulProfundo, pts: spark(total * 9 + 42, "up"), icon: Ic.send },
    { label: "Peso Expedido", value: formatKg(pesoTotal), delta: `${formatKg(pesoSolicitado)} solicitado`, up: true, color: C.verdeFloresta, pts: spark(Math.round(pesoTotal / 100) + 3, "up"), icon: Ic.scale },
    { label: "Entregues", value: entregues, delta: `${total > 0 ? Math.round((entregues / total) * 100) : 0}% do total`, up: entregues > 0, color: C.verdeEscuro, pts: spark(entregues * 11 + 17, "up"), icon: Ic.check },
    { label: "Em Rota", value: emRota, delta: emRota > 0 ? "em trânsito" : "nenhum", up: emRota > 0, color: C.amareloEscuro, pts: spark(emRota + 41, emRota > 0 ? "up" : "down"), icon: Ic.truck },
  ];

  const cardStyle = (i?: number): React.CSSProperties => ({
    background: C.cardBg, border: `1px solid ${C.cardBorder}`, borderRadius: "12px 12px 12px 24px",
    boxShadow: "0 1px 3px rgba(0,75,155,.04)", animation: i !== undefined ? `fadeUp .35s ease ${(i) * 0.06}s both` : undefined,
  });

  const uniqueClientes = new Set(filtered.map(e => e.clienteId || e.nomeFantasia).filter(Boolean)).size;
  const uniqueMateriais = new Set(filtered.map(e => e.tipoMaterial).filter(Boolean)).size;
  const uniqueRotas = new Set(filtered.map(e => e.rota).filter(Boolean)).size;

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
        <div style={{ display: "grid", gridTemplateColumns: "130px 130px repeat(5,minmax(0,1fr))", gap: 12 }}>
          <DSDateField label="Data inicial" value={filter.dataInicio} onChange={(v) => setF("dataInicio", v)} icon={Ic.clock(14, C.cinzaChumbo)} />
          <DSDateField label="Data final" value={filter.dataFim} onChange={(v) => setF("dataFim", v)} icon={Ic.clock(14, C.cinzaChumbo)} />
          <DSSelect label="Cliente" value={filter.cliente} onChange={v => setF("cliente", v)} options={allClientes} icon={Ic.users(14, C.cinzaChumbo)} />
          <DSSelect label="Entrega" value={filter.statusEntrega} onChange={v => setF("statusEntrega", v)} options={allStatusEntrega} placeholder="Todas" icon={Ic.truck(14, C.cinzaChumbo)} />
          <DSSelect label="Pedidos" value={filter.statusPedido} onChange={v => setF("statusPedido", v)} options={allStatusPedido} icon={Ic.send(14, C.cinzaChumbo)} />
          <DSSelect label="Material" value={filter.material} onChange={v => setF("material", v)} options={allMateriais} icon={Ic.box(14, C.cinzaChumbo)} />
          <DSSelect label="Rota" value={filter.rota} onChange={v => setF("rota", v)} options={allRotas} icon={Ic.truck(14, C.cinzaChumbo)} />
        </div>
      </div>

      {hasFilter && (
        <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 14, flexWrap: "wrap" }}>
          {filter.rota && <span style={{ padding: "3px 8px", fontSize: 10, fontWeight: 600, color: C.azulProfundo, background: `${C.azulProfundo}10`, borderRadius: 4, fontFamily: Fn.body }}>Rota: {filter.rota}</span>}
          {filter.statusEntrega && <span style={{ padding: "3px 8px", fontSize: 10, fontWeight: 600, color: C.verdeFloresta, background: `${C.verdeFloresta}10`, borderRadius: 4, fontFamily: Fn.body }}>Entrega: {STATUS_ENTREGA[filter.statusEntrega] || filter.statusEntrega}</span>}
          {filter.statusPedido && <span style={{ padding: "3px 8px", fontSize: 10, fontWeight: 600, color: C.amareloEscuro, background: `${C.amareloEscuro}10`, borderRadius: 4, fontFamily: Fn.body }}>Pedidos: {filter.statusPedido}</span>}
          {filter.material && <span style={{ padding: "3px 8px", fontSize: 10, fontWeight: 600, color: C.verdeFloresta, background: `${C.verdeFloresta}10`, borderRadius: 4, fontFamily: Fn.body }}>Material: {filter.material}</span>}
          {filter.cliente && <span style={{ padding: "3px 8px", fontSize: 10, fontWeight: 600, color: C.azulCeu, background: `${C.azulCeu}10`, borderRadius: 4, fontFamily: Fn.body }}>Cliente: {filter.cliente}</span>}
          {(filter.dataInicio || filter.dataFim) && <span style={{ padding: "3px 8px", fontSize: 10, fontWeight: 600, color: C.cinzaChumbo, background: `${C.cinzaChumbo}12`, borderRadius: 4, fontFamily: Fn.body }}>Período: {filter.dataInicio || "…"} até {filter.dataFim || "…"}</span>}
        </div>
      )}

      {/* ═══ KPIs ═══ */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 16, marginBottom: 24 }}>
        {kpis.map((k, i) => {
          const sparkData = k.pts.map((v, j) => ({ name: MONTHS[j], value: v }));
          const uid = `ek${i}`;
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
                      <linearGradient id={`g${uid}`} x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor={k.color} stopOpacity={0.18} />
                        <stop offset="100%" stopColor={k.color} stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <Tooltip
                      content={({ active, payload }) => {
                        if (!active || !payload?.[0]) return null;
                        const d = payload[0].payload;
                        return <div style={{ background: C.cardBg, border: `1px solid ${C.cardBorder}`, borderRadius: 6, padding: "4px 8px", fontSize: 9, fontFamily: Fn.mono, color: k.color, fontWeight: 700 }}>{d.name}: {d.value}</div>;
                      }}
                      cursor={false}
                    />
                    <Area type="monotone" dataKey="value" stroke={k.color} strokeWidth={2} fill={`url(#g${uid})`} isAnimationActive={false} dot={false} activeDot={{ r: 4, fill: k.color, stroke: "none" }} />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>
          );
        })}
      </div>

      {/* ═══ PEDIDOS POR MÊS + STATUS DONUT ═══ */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, marginBottom: 24 }}>
        <div style={{ ...cardStyle(), padding: 20 }} onMouseMove={trackMouse}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 16 }}>
            <div><span style={{ fontSize: 13, fontWeight: 700, color: C.azulEscuro, fontFamily: Fn.title, display: "block" }}>Pedidos por Mês</span><span style={{ fontSize: 10, color: C.cinzaChumbo }}>Últimos 6 meses{hasFilter ? " · filtrado" : ""}</span></div>
            <div style={{ width: 30, height: 30, borderRadius: 8, background: `${C.azulProfundo}0A`, display: "flex", alignItems: "center", justifyContent: "center" }}>{Ic.chart(14, C.azulProfundo)}</div>
          </div>
          <ResponsiveContainer width="100%" height={160}>
            <BarChart data={monthlyData} onMouseMove={(state: any) => { if (state && state.activeTooltipIndex != null) setHovBar(state.activeTooltipIndex); }} onMouseLeave={() => setHovBar(-1)}>
              <XAxis dataKey="label" axisLine={false} tickLine={false} tick={{ fontSize: 9, fill: C.cinzaChumbo, fontFamily: Fn.body }} />
              <Tooltip content={({ active, payload }) => {
                if (!active || !payload?.[0]) return null;
                const d = payload[0].payload;
                return <ChartTooltip title={d.label} color={C.azulProfundo} x={tipPos.x} y={tipPos.y} rows={[{ label: "Pedidos no mês", value: d.count, color: C.azulProfundo }, { label: "% do total", value: `${total > 0 ? Math.round((d.count / total) * 100) : 0}%`, color: C.azulCeu }]} />;
              }} cursor={false} wrapperStyle={{ pointerEvents: "none" }} />
              <Bar dataKey="count" fill={C.azulProfundo} radius={[6, 6, 0, 0]} opacity={0.82} label={{ position: "top", fontSize: 11, fontWeight: 700, fill: C.azulEscuro, fontFamily: Fn.mono }} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div style={{ ...cardStyle(), padding: 20 }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 16 }}>
            <div><span style={{ fontSize: 13, fontWeight: 700, color: C.azulEscuro, fontFamily: Fn.title, display: "block" }}>Pedidos por Status</span><span style={{ fontSize: 10, color: C.cinzaChumbo }}>Clique para filtrar · {total} pedidos</span></div>
            <div style={{ width: 30, height: 30, borderRadius: 8, background: `${C.azulProfundo}0A`, display: "flex", alignItems: "center", justifyContent: "center" }}>{Ic.send(14, C.azulProfundo)}</div>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 20, justifyContent: "center" }}>
            <Donut segments={statusData} hov={hovStatus} setHov={setHovStatus}
              onClick={(key) => setF("statusEntrega", filter.statusEntrega === key ? null : key)}
              center={hovStatus !== null ? <><span style={{ fontSize: 16, fontWeight: 800, fontFamily: Fn.title, color: statusData[hovStatus]?.color, lineHeight: 1 }}>{statusData[hovStatus]?.value}</span><span style={{ fontSize: 8, color: C.cinzaChumbo }}>{Math.round((statusData[hovStatus]?.value || 0) / total * 100)}%</span></> : <><span style={{ fontSize: 20, fontWeight: 800, fontFamily: Fn.title, color: C.azulEscuro, lineHeight: 1 }}>{total}</span><span style={{ fontSize: 9, color: C.cinzaChumbo }}>total</span></>} />
            <div style={{ display: "flex", flexDirection: "column", gap: 5 }}>
              {statusData.map((s, i) => (
                <div key={s.key} onClick={() => setF("statusEntrega", filter.statusEntrega === s.key ? null : s.key)} style={{ display: "flex", alignItems: "center", gap: 8, cursor: "pointer", opacity: filter.statusEntrega && filter.statusEntrega !== s.key ? 0.3 : 1, transition: "opacity .15s" }} onMouseEnter={() => setHovStatus(i)} onMouseLeave={() => setHovStatus(null)}>
                  <div style={{ width: 8, height: 8, borderRadius: "50%", background: s.color, flexShrink: 0 }} />
                  <span style={{ fontSize: 11, color: C.cinzaEscuro, fontFamily: Fn.body }}>{s.label}</span>
                  <span style={{ fontSize: 11, fontWeight: 700, color: s.color, fontFamily: Fn.mono, marginLeft: "auto" }}>{s.value}</span>
                </div>))}
            </div>
          </div>
        </div>
      </div>

      {/* ═══ TOP CLIENTES + RESUMO ═══ */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 300px", gap: 16, marginBottom: 24 }}>
        <div style={{ ...cardStyle(), padding: 20 }} onMouseMove={trackMouse}>
          <div style={{ marginBottom: 16 }}>
            <span style={{ fontSize: 13, fontWeight: 700, color: C.azulEscuro, fontFamily: Fn.title, display: "block" }}>Top Clientes · Periodicidade</span>
            <span style={{ fontSize: 10, color: C.cinzaChumbo }}>Frequência real calculada pelas datas · Top 10</span>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "28px 1fr 80px 70px 90px 90px", gap: 8, padding: "0 12px 8px", borderBottom: `1px solid ${C.cardBorder}` }}>
            {["#", "Cliente", "Pedidos", "Peso", "Frequência", "Próxima est."].map(h => (<span key={h} style={{ fontSize: 9, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.06em", color: C.cinzaChumbo, fontFamily: Fn.title }}>{h}</span>))}
          </div>
          <div style={{ display: "flex", flexDirection: "column" }}>
            {topClientes.map((f, i) => {
              const pct = (f.count / maxCliente) * 100; const isH = hovForn === i;
              const proxFmt = f.proximaEstimada ? new Date(f.proximaEstimada).toLocaleDateString("pt-BR", { day: "2-digit", month: "short" }) : "—";
              const isAtrasada = f.proximaEstimada > 0 && f.proximaEstimada < Date.now();
              return (
                <div key={i} onMouseEnter={() => setHovForn(i)} onMouseLeave={() => setHovForn(-1)} style={{ display: "grid", gridTemplateColumns: "28px 1fr 80px 70px 90px 90px", gap: 8, alignItems: "center", padding: "10px 12px", borderBottom: `1px solid ${C.cardBorder}`, background: isH ? `${C.azulProfundo}06` : "transparent", transition: "background .15s", cursor: "default" }}>
                  <div style={{ width: 22, height: 22, borderRadius: 5, background: i < 3 ? C.azulProfundo : `${C.cardBorder}`, color: i < 3 ? C.branco : C.cinzaChumbo, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 9, fontWeight: 700, fontFamily: Fn.mono }}>{i + 1}</div>
                  <div style={{ minWidth: 0 }}><div style={{ fontSize: 12, fontWeight: 600, color: C.cinzaEscuro, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{f.nome}</div><div style={{ marginTop: 3, height: 3, borderRadius: 2, background: `${C.azulProfundo}10` }}><div style={{ height: 3, borderRadius: 2, background: C.azulProfundo, width: `${pct}%` }} /></div></div>
                  <span style={{ fontSize: 12, fontWeight: 700, color: C.azulProfundo, fontFamily: Fn.mono }}>{f.count}</span>
                  <span style={{ fontSize: 11, color: C.textMuted, fontFamily: Fn.mono }}>{formatKg(f.peso)}</span>
                  <div><span style={{ fontSize: 11, fontWeight: 600, color: f.mediaDias > 0 ? C.verdeFloresta : C.textLight, fontFamily: Fn.body }}>{f.perioLabel}</span>{f.mediaDias > 0 && <div style={{ fontSize: 9, color: C.textMuted }}>~{f.mediaDias}d média</div>}</div>
                  <div><span style={{ fontSize: 11, fontWeight: 600, color: isAtrasada ? C.danger : f.proximaEstimada ? C.azulProfundo : C.textLight, fontFamily: Fn.mono }}>{proxFmt}</span>{isAtrasada && <div style={{ fontSize: 9, fontWeight: 700, color: C.danger }}>atrasada</div>}{!isAtrasada && f.proximaEstimada > 0 && (() => { const diasPara = Math.ceil((f.proximaEstimada - Date.now()) / 86400000); return <div style={{ fontSize: 9, color: C.textMuted }}>{diasPara}d restantes</div>; })()}</div>
                </div>);
            })}
          </div>
          {hovForn >= 0 && topClientes[hovForn] && (() => {
            const f = topClientes[hovForn];
            const ultimaFmt = f.ultima ? new Date(f.ultima).toLocaleDateString("pt-BR") : "—";
            const proxFmt = f.proximaEstimada ? new Date(f.proximaEstimada).toLocaleDateString("pt-BR") : "—";
            return <ChartTooltip title={f.nome} color={C.azulProfundo} x={tipPos.x} y={tipPos.y} rows={[
              { label: "Total pedidos", value: f.count, color: C.azulProfundo },
              { label: "Peso total", value: formatKg(f.peso), color: C.verdeFloresta },
              { label: "Frequência média", value: f.mediaDias > 0 ? `${f.mediaDias} dias` : "—", color: C.amareloEscuro },
              { label: "Último pedido", value: ultimaFmt, color: C.azulCeu },
              { label: "Próxima estimada", value: proxFmt, color: f.proximaEstimada && f.proximaEstimada < Date.now() ? C.danger : C.verdeEscuro },
              { label: "Top materiais", value: f.topMat || "—", color: C.cinzaChumbo },
            ]} />;
          })()}
        </div>

        <div style={{ ...cardStyle(), padding: 20 }}>
          <span style={{ fontSize: 13, fontWeight: 700, color: C.azulEscuro, fontFamily: Fn.title, display: "block", marginBottom: 16 }}>Resumo</span>
          {[
            { label: "Pedidos totais", value: expedicoes.length, color: C.azulProfundo },
            { label: "Pendentes", value: pendentes, color: C.amareloEscuro },
            { label: "Em rota", value: emRota, color: C.azulCeu },
            { label: "Entregues", value: entregues, color: C.verdeFloresta },
            { label: "Cancelados", value: cancelados, color: C.danger },
            { label: "Clientes", value: uniqueClientes, color: C.azulProfundo },
            { label: "Materiais", value: uniqueMateriais, color: C.azulClaro },
            { label: "Rotas", value: uniqueRotas, color: C.amareloEscuro },
            { label: "Peso expedido", value: formatKg(pesoTotal), color: C.verdeFloresta },
            { label: "Financ. aprovado", value: finAprovados, color: C.verdeEscuro },
            { label: "Financ. pendente", value: finPendentes, color: C.amareloOuro },
          ].map((r, i) => (
            <div key={i} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "6px 0", borderBottom: `1px solid ${C.cardBorder}` }}>
              <span style={{ fontSize: 12, color: C.cinzaEscuro }}>{r.label}</span>
              <span style={{ fontSize: 12, fontWeight: 700, color: r.color, fontFamily: Fn.mono }}>{r.value}</span>
            </div>))}
        </div>
      </div>

      {/* ═══ TOP MATERIAIS + FINANCEIRO DONUT ═══ */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, marginBottom: 24 }}>
        <div style={{ ...cardStyle(), padding: 20 }} onMouseMove={trackMouse}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 16 }}>
            <div><span style={{ fontSize: 13, fontWeight: 700, color: C.azulEscuro, fontFamily: Fn.title, display: "block" }}>Top Materiais</span><span style={{ fontSize: 10, color: C.cinzaChumbo }}>Tipos de produto mais expedidos · Top 10</span></div>
            <div style={{ width: 30, height: 30, borderRadius: 8, background: `${C.verdeFloresta}0A`, display: "flex", alignItems: "center", justifyContent: "center" }}>{Ic.box(14, C.verdeFloresta)}</div>
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {topMateriais.map((m, i) => {
              const color = matColors[i % matColors.length]; const isH = hovMat === i;
              return (
                <div key={m.material} onMouseEnter={() => setHovMat(i)} onMouseLeave={() => setHovMat(-1)} style={{ display: "flex", alignItems: "center", gap: 10, padding: "4px 0", cursor: "default" }}>
                  <div style={{ width: 22, height: 22, borderRadius: 5, background: i < 3 ? color : `${C.cardBorder}`, color: i < 3 ? C.branco : C.cinzaChumbo, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 9, fontWeight: 700, fontFamily: Fn.mono, flexShrink: 0 }}>{i + 1}</div>
                  <span style={{ fontSize: 11, fontWeight: isH ? 700 : 600, color: isH ? color : C.cinzaEscuro, fontFamily: Fn.body, minWidth: 90, transition: "all .12s" }}>{m.material}</span>
                  <div style={{ flex: 1, height: isH ? 8 : 6, borderRadius: 4, background: `${color}12`, transition: "height .12s" }}><div style={{ height: "100%", borderRadius: 4, background: color, width: `${(m.count / maxMat) * 100}%`, opacity: .85 }} /></div>
                  <code style={{ fontSize: 10, fontWeight: 700, fontFamily: Fn.mono, color, minWidth: 30, textAlign: "right" }}>{m.count}</code>
                  <span style={{ fontSize: 9, color: C.textMuted, minWidth: 50 }}>{formatKg(m.peso)}</span>
                  <span style={{ fontSize: 9, color: C.textMuted, minWidth: 45 }}>{m.numClientes} cli.</span>
                </div>);
            })}
          </div>
          {hovMat >= 0 && topMateriais[hovMat] && <ChartTooltip title={topMateriais[hovMat].material} color={matColors[hovMat % matColors.length]} x={tipPos.x} y={tipPos.y} rows={[
            { label: "Pedidos", value: topMateriais[hovMat].count, color: C.azulProfundo },
            { label: "Peso total", value: formatKg(topMateriais[hovMat].peso), color: C.verdeFloresta },
            { label: "Clientes distintos", value: topMateriais[hovMat].numClientes, color: C.amareloEscuro },
            { label: "% dos pedidos", value: `${total > 0 ? Math.round((topMateriais[hovMat].count / total) * 100) : 0}%`, color: C.azulCeu },
          ]} />}
        </div>

        <div style={{ ...cardStyle(), padding: 20 }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 16 }}>
            <div><span style={{ fontSize: 13, fontWeight: 700, color: C.azulEscuro, fontFamily: Fn.title, display: "block" }}>Status Financeiro</span><span style={{ fontSize: 10, color: C.cinzaChumbo }}>Clique para filtrar · {total} pedidos</span></div>
            <div style={{ width: 30, height: 30, borderRadius: 8, background: `${C.amareloEscuro}0A`, display: "flex", alignItems: "center", justifyContent: "center" }}>{Ic.dollar(14, C.amareloEscuro)}</div>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 20, justifyContent: "center" }}>
            <Donut segments={finData} hov={hovFin} setHov={setHovFin}
              onClick={(key) => setF("statusFinanceiro", filter.statusFinanceiro === key ? null : key)}
              center={hovFin !== null ? <><span style={{ fontSize: 16, fontWeight: 800, fontFamily: Fn.title, color: finData[hovFin]?.color, lineHeight: 1 }}>{finData[hovFin]?.value}</span><span style={{ fontSize: 8, color: C.cinzaChumbo }}>{Math.round((finData[hovFin]?.value || 0) / total * 100)}%</span></> : <><span style={{ fontSize: 20, fontWeight: 800, fontFamily: Fn.title, color: C.azulEscuro, lineHeight: 1 }}>{total}</span><span style={{ fontSize: 9, color: C.cinzaChumbo }}>total</span></>} />
            <div style={{ display: "flex", flexDirection: "column", gap: 5 }}>
              {finData.map((s, i) => (
                <div key={s.key} onClick={() => setF("statusFinanceiro", filter.statusFinanceiro === s.key ? null : s.key)} style={{ display: "flex", alignItems: "center", gap: 8, cursor: "pointer", opacity: filter.statusFinanceiro && filter.statusFinanceiro !== s.key ? 0.3 : 1, transition: "opacity .15s" }} onMouseEnter={() => setHovFin(i)} onMouseLeave={() => setHovFin(null)}>
                  <div style={{ width: 8, height: 8, borderRadius: "50%", background: s.color, flexShrink: 0 }} />
                  <span style={{ fontSize: 11, color: C.cinzaEscuro, fontFamily: Fn.body }}>{s.label}</span>
                  <span style={{ fontSize: 11, fontWeight: 700, color: s.color, fontFamily: Fn.mono, marginLeft: "auto" }}>{s.value}</span>
                </div>))}
            </div>
          </div>
        </div>
      </div>

      {/* ═══ EXPEDIÇÃO POR GALPÃO ═══ */}
      <div style={{ ...cardStyle(), padding: 20, marginBottom: 24 }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 16 }}>
          <div><span style={{ fontSize: 13, fontWeight: 700, color: C.azulEscuro, fontFamily: Fn.title, display: "block" }}>Expedição por Rota</span><span style={{ fontSize: 10, color: C.cinzaChumbo }}>Distribuição dos pedidos por rota</span></div>
          <div style={{ width: 30, height: 30, borderRadius: 8, background: `${C.verdeFloresta}0A`, display: "flex", alignItems: "center", justifyContent: "center" }}>{Ic.chart(14, C.verdeFloresta)}</div>
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          {rotaData.map(([rota, count], i) => {
            const color = rotaColors[i % rotaColors.length];
            return (
              <div key={rota} onClick={() => setF("rota", filter.rota === rota ? null : rota)} style={{ display: "flex", alignItems: "center", gap: 10, padding: "2px 0", cursor: "pointer", opacity: filter.rota && filter.rota !== rota ? .3 : 1, transition: "opacity .15s" }}>
                <span style={{ fontSize: 11, fontWeight: 600, color: C.cinzaEscuro, fontFamily: Fn.body, minWidth: 100 }}>{rota}</span>
                <div style={{ flex: 1, height: 8, borderRadius: 4, background: `${color}12` }}><div style={{ height: "100%", borderRadius: 4, background: color, width: `${(count / maxRota) * 100}%`, opacity: .85 }} /></div>
                <code style={{ fontSize: 10, fontWeight: 700, fontFamily: Fn.mono, color, minWidth: 40, textAlign: "right" }}>{count}</code>
              </div>);
          })}
        </div>
      </div>
    </div>
  );
}
