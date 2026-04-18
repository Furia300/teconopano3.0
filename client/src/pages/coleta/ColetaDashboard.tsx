import { useState, useMemo, useEffect, useRef } from "react";
import { LuTruck, LuScale, LuFactory, LuCalendar, LuLayoutGrid, LuX, LuFlag, LuChevronDown, LuCheck } from "react-icons/lu";
import { ResponsiveContainer, PieChart, Pie, Cell, BarChart, Bar, XAxis, Tooltip, AreaChart, Area } from "recharts";

/* ─── Types ─── */
interface Coleta {
  id: string; numero: number; nomeFantasia: string; cnpjFornecedor: string;
  pesoTotalNF: number; pesoTotalAtual: number; dataPedido: string;
  dataChegada: string | null; status: string; fornecedorId: string;
  recorrencia?: string | null; galpao?: string;
}

interface Props { coletas: Coleta[] }

/* ─── Dark mode ─── */
function useDark() {
  const [d, setD] = useState(() => typeof document !== "undefined" && document.documentElement.classList.contains("dark"));
  useEffect(() => { const el = document.documentElement; const obs = new MutationObserver(() => setD(el.classList.contains("dark"))); obs.observe(el, { attributes: true, attributeFilter: ["class"] }); return () => obs.disconnect(); }, []);
  return d;
}

/* ─── Colors (match DashboardAdmin exactly) ─── */
const LIGHT = { azulProfundo: "#004B9B", azulEscuro: "#002A68", azulClaro: "#658EC9", cinzaChumbo: "#7B8C96", cinzaEscuro: "#333B41", azulCeu: "#93BDE4", azulCeuClaro: "#D3E3F4", amareloOuro: "#FDC24E", amareloEscuro: "#F6921E", verdeFloresta: "#00C64C", verdeEscuro: "#00904C", danger: "#DC3545", branco: "#FFFFFF", bg: "#F2F4F8", cardBg: "#FFFFFF", cardBorder: "#E2E8F0", textMuted: "#64748B", textLight: "#94A3B8" };
const DARK = { azulProfundo: "#5B9BD5", azulEscuro: "#E2E8F0", azulClaro: "#7EAED6", cinzaChumbo: "#8B95A0", cinzaEscuro: "#E2E2E8", azulCeu: "#5B9BD5", azulCeuClaro: "#252525", amareloOuro: "#FDC24E", amareloEscuro: "#F6921E", verdeFloresta: "#34D870", verdeEscuro: "#34D870", danger: "#EF6B6B", branco: "#FFFFFF", bg: "#1A1A1A", cardBg: "#222222", cardBorder: "#2E2E2E", textMuted: "#6B7280", textLight: "#4B5563" };
let C = LIGHT;
const Fn = { title: "'Saira Expanded',sans-serif", body: "'Open Sans',sans-serif", mono: "'Fira Code',monospace" };

/* ─── Icons (react-icons/lu — padrão DashboardAdmin) ─── */
const Ic = {
  truck: (s: number, c: string) => <LuTruck size={s} color={c} />,
  scale: (s: number, c: string) => <LuScale size={s} color={c} />,
  factory: (s: number, c: string) => <LuFactory size={s} color={c} />,
  calendario: (s: number, c: string) => <LuCalendar size={s} color={c} />,
  grid: (s: number, c: string) => <LuLayoutGrid size={s} color={c} />,
  x: (s: number, c: string) => <LuX size={s} color={c} />,
  flag: (s: number, c: string) => <LuFlag size={s} color={c} />,
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

const STATUS_LABELS: Record<string, string> = { pendente: "Pendente", agendado: "Agendado", em_rota: "Em rota", recebido: "Recebido", em_separacao: "Em separação", separado: "Separado", em_producao: "Em produção", finalizado: "Concluído", cancelado: "Cancelado" };

/* ─── Donut (Recharts PieChart) ─── */
function Donut({ segments, size = 130, strokeW = 14, center, hov, setHov, onClick }: {
  segments: { label: string; value: number; color: string; key: string }[];
  size?: number; strokeW?: number; center: React.ReactNode;
  hov: number | null; setHov: (i: number | null) => void;
  onClick?: (key: string) => void;
}) {
  const innerR = (size / 2) - strokeW * 2;
  const outerR = (size / 2) - strokeW / 2;
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
          style={{ cursor: onClick ? "pointer" : "default", outline: "none" }}
          activeIndex={hov !== null ? hov : undefined}
        >
          {segments.map((s, i) => (
            <Cell
              key={s.key}
              fill={s.color}
              strokeWidth={0}
              style={{ transition: "all .15s", outline: "none", transform: hov === i ? "scale(1.06)" : "scale(1)", transformOrigin: "center" }}
              onMouseEnter={() => setHov(i)}
              onMouseLeave={() => setHov(null)}
              onClick={() => onClick?.(s.key)}
            />
          ))}
        </Pie>
      </PieChart>
      <div style={{ position: "absolute", inset: 0, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", pointerEvents: "none" }}>
        {center}
      </div>
    </div>
  );
}

/* ─── Tooltip flutuante (padrão DS FIPS DashboardDemo) ─── */
function ChartTooltip({ title, color, rows, x, y, total }: {
  title: string; color: string;
  rows: { label: string; value: string | number; color?: string }[];
  x: number; y: number; total?: number;
}) {
  const numRows = rows.filter(r => typeof r.value === "number");
  const maxVal = numRows.length > 0 ? Math.max(...numRows.map(r => r.value as number), 1) : 1;
  return (
    <div style={{ position: "absolute", left: 0, top: "100%", marginTop: 8, zIndex: 50, pointerEvents: "none", animation: "fadeUp .15s ease" }}>
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
              {typeof r.value === "number" && (
                <div style={{ width: 50, height: 4, borderRadius: 2, background: `${r.color || color}15`, flexShrink: 0 }}>
                  <div style={{ height: 4, borderRadius: 2, background: r.color || color, width: `${((r.value as number) / maxVal) * 100}%` }} />
                </div>
              )}
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

/* ─── DSSelect (padrão DashboardAdmin) ─── */
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
        <span style={{ flexShrink: 0, opacity: .45, transition: "transform .2s", transform: open ? "rotate(180deg)" : "rotate(0)", display: "flex" }}><LuChevronDown size={14} color={C.cinzaChumbo} /></span>
      </div>
      {open && <div style={{ position: "absolute", top: "100%", left: 0, right: 0, zIndex: 20, background: C.cardBg, border: `1.5px solid ${C.azulProfundo}`, borderTop: "none", borderRadius: "0 0 8px 8px", boxShadow: "0 6px 20px rgba(0,75,155,.12)", maxHeight: 200, overflowY: "auto" }}>
        <div onClick={() => { onChange(null); setOpen(false) }} style={{ padding: "6px 14px", fontSize: 12, fontFamily: Fn.body, color: !value ? C.azulProfundo : C.cinzaEscuro, fontWeight: !value ? 600 : 400, background: !value ? C.azulCeuClaro : "transparent", cursor: "pointer" }}>{placeholder}</div>
        {options.map((o, i) => { const sel = o === value; return <div key={o} onClick={() => { onChange(o); setOpen(false) }} onMouseEnter={() => setHi(i)} onMouseLeave={() => setHi(-1)} style={{ padding: "6px 14px", fontSize: 12, fontFamily: Fn.body, color: sel ? C.azulProfundo : C.cinzaEscuro, fontWeight: sel ? 600 : 400, background: sel ? C.azulCeuClaro : i === hi ? C.bg : "transparent", cursor: "pointer", display: "flex", alignItems: "center", gap: 8 }}>
          {sel && <span style={{ marginLeft: -14, flexShrink: 0, display: "flex" }}><LuCheck size={12} color={C.azulProfundo} /></span>}
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

/* ═════════════════════════ MAIN ═════════════════════════ */
export function ColetaDashboard({ coletas }: Props) {
  const dark = useDark();
  C = dark ? DARK : LIGHT;

  const [hovKpi, setHovKpi] = useState(-1);
  const [hovKpiPt, setHovKpiPt] = useState<{ c: number; p: number } | null>(null);
  const [hovStatus, setHovStatus] = useState<number | null>(null);
  const [hovForn, setHovForn] = useState(-1);
  const [hovBar, setHovBar] = useState(-1);
  const [tipPos, setTipPos] = useState({ x: 0, y: 0 });
  const trackMouse = (e: React.MouseEvent) => setTipPos({ x: e.clientX, y: e.clientY });
  const [filter, setFilter] = useState<Record<string, string | null>>({ galpao: null, status: null, fornecedor: null, recorrencia: null, dataInicio: null, dataFim: null });
  const hasFilter = Object.values(filter).some(v => v);
  const setF = (key: string, val: string | null) => setFilter(f => ({ ...f, [key]: val || null }));
  const clearAll = () => setFilter({ galpao: null, status: null, fornecedor: null, recorrencia: null, dataInicio: null, dataFim: null });

  const allFornecedores = useMemo(() => [...new Set(coletas.map(c => c.nomeFantasia).filter(Boolean))].sort() as string[], [coletas]);
  const allGalpoes = useMemo(() => [...new Set(coletas.map(c => c.galpao).filter(Boolean))].sort() as string[], [coletas]);
  const STATUS_LABELS_MAP: Record<string, string> = { pendente: "Pendente", agendado: "Agendado", em_rota: "Em rota", recebido: "Recebido", em_separacao: "Em separação", separado: "Separado", em_producao: "Em produção", finalizado: "Concluído", cancelado: "Cancelado" };

  const filtered = useMemo(() => {
    return coletas.filter(c => {
      if (filter.galpao && (c.galpao || "") !== filter.galpao) return false;
      if (filter.status && c.status !== filter.status) return false;
      if (filter.fornecedor && c.nomeFantasia !== filter.fornecedor) return false;
      if (filter.recorrencia) {
        if (filter.recorrencia === "Sim" && !c.recorrencia) return false;
        if (filter.recorrencia === "Não" && c.recorrencia) return false;
      }
      if (filter.dataInicio && new Date(c.dataPedido) < new Date(filter.dataInicio)) return false;
      if (filter.dataFim && new Date(c.dataPedido) > new Date(`${filter.dataFim}T23:59:59`)) return false;
      return true;
    });
  }, [coletas, filter]);

  /* ─── Stats ─── */
  const total = filtered.length;
  const pendentes = filtered.filter(c => ["pendente", "agendado"].includes(c.status)).length;
  const emAndamento = filtered.filter(c => ["em_rota", "recebido", "em_separacao", "em_producao"].includes(c.status)).length;
  const finalizados = filtered.filter(c => c.status === "finalizado").length;
  const pesoNF = filtered.reduce((a, c) => a + (c.pesoTotalNF || 0), 0);
  const pesoAtual = filtered.reduce((a, c) => a + (c.pesoTotalAtual || 0), 0);
  const recorrentes = filtered.filter(c => c.recorrencia).length;

  /* Status donut */
  const statusData = useMemo(() => {
    const colors: Record<string, string> = { pendente: C.amareloEscuro, agendado: C.azulCeu, em_rota: C.azulProfundo, recebido: C.azulClaro, em_separacao: C.amareloOuro, separado: C.azulCeu, em_producao: C.verdeFloresta, finalizado: C.verdeEscuro, cancelado: C.danger };
    return Object.entries(STATUS_LABELS).map(([key, label]) => ({
      key, label, value: filtered.filter(c => c.status === key).length, color: colors[key] || "#999",
    })).filter(s => s.value > 0);
  }, [filtered]);

  /* Top fornecedores com periodicidade real */
  const topForn = useMemo(() => {
    const map: Record<string, { nome: string; count: number; peso: number; datas: number[] }> = {};
    for (const c of filtered) {
      const k = c.fornecedorId || c.nomeFantasia;
      if (!map[k]) map[k] = { nome: c.nomeFantasia || "?", count: 0, peso: 0, datas: [] };
      map[k].count++;
      map[k].peso += c.pesoTotalAtual || 0;
      if (c.dataPedido) map[k].datas.push(new Date(c.dataPedido).getTime());
    }
    return Object.values(map)
      .map(f => {
        // Calcular periodicidade média (dias entre coletas)
        const sorted = f.datas.sort((a, b) => a - b);
        let mediaDias = 0;
        if (sorted.length >= 2) {
          const diffs: number[] = [];
          for (let i = 1; i < sorted.length; i++) diffs.push((sorted[i] - sorted[i - 1]) / 86400000);
          mediaDias = Math.round(diffs.reduce((a, b) => a + b, 0) / diffs.length);
        }
        // Última coleta e próxima estimada
        const ultima = sorted.length > 0 ? sorted[sorted.length - 1] : 0;
        const proximaEstimada = ultima && mediaDias > 0 ? ultima + mediaDias * 86400000 : 0;
        // Label da periodicidade
        let perioLabel = "—";
        if (mediaDias > 0) {
          if (mediaDias <= 3) perioLabel = `a cada ${mediaDias}d`;
          else if (mediaDias <= 9) perioLabel = "semanal";
          else if (mediaDias <= 18) perioLabel = "quinzenal";
          else if (mediaDias <= 45) perioLabel = "mensal";
          else if (mediaDias <= 100) perioLabel = "trimestral";
          else perioLabel = `~${mediaDias}d`;
        }
        return { ...f, mediaDias, ultima, proximaEstimada, perioLabel };
      })
      .sort((a, b) => b.count - a.count)
      .slice(0, 10);
  }, [filtered]);
  const maxForn = Math.max(...topForn.map(f => f.count), 1);

  /* Monthly */
  const monthlyData = useMemo(() => {
    const map: Record<string, number> = {};
    const now = new Date();
    for (let i = 5; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      map[`${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`] = 0;
    }
    for (const c of filtered) {
      if (!c.dataPedido) continue;
      const d = new Date(c.dataPedido);
      const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
      if (map[key] !== undefined) map[key]++;
    }
    return Object.entries(map).map(([m, count]) => ({ month: m, label: new Date(m + "-01").toLocaleDateString("pt-BR", { month: "short" }).toUpperCase(), count }));
  }, [filtered]);
  const maxMonth = Math.max(...monthlyData.map(m => m.count), 1);

  /* Alertas */
  const now = new Date();
  const semData = filtered.filter(c => c.status === "pendente" && !c.dataChegada).length;
  const atrasadas = filtered.filter(c => c.dataChegada && !["finalizado", "cancelado"].includes(c.status) && new Date(c.dataChegada) < now).length;

  /* KPIs */
  const kpis = [
    { label: "Coletas", value: total, delta: `${pendentes} abertas`, up: true, color: C.azulProfundo, pts: spark(total * 9 + 42, "up"), icon: Ic.truck },
    { label: "Peso NF Total", value: formatKg(pesoNF), delta: `${formatKg(pesoAtual)} atual`, up: true, color: C.verdeFloresta, pts: spark(Math.round(pesoNF / 100) + 3, "up"), icon: Ic.scale },
    { label: "Em Andamento", value: emAndamento, delta: `${finalizados} concluídos`, up: emAndamento > 0, color: C.amareloEscuro, pts: spark(emAndamento * 11 + 17, "up"), icon: Ic.factory },
    { label: "Recorrentes", value: recorrentes, delta: recorrentes > 0 ? "com agendamento" : "nenhuma", up: recorrentes > 0, color: C.verdeEscuro, pts: spark(recorrentes + 41, recorrentes > 0 ? "up" : "down"), icon: Ic.calendario },
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
            <span style={{ fontSize: 10, color: C.textMuted, fontFamily: Fn.body }}>{filtered.length} coletas</span>
            {hasFilter && <button onClick={clearAll} style={{ display: "inline-flex", alignItems: "center", gap: 4, padding: "4px 10px", fontSize: 10, fontWeight: 600, color: C.cinzaChumbo, background: C.bg, border: `1px solid ${C.cardBorder}`, borderRadius: 6, cursor: "pointer", fontFamily: Fn.body }}>{Ic.x(10, C.cinzaChumbo)} Limpar</button>}
          </div>
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "130px 130px repeat(4,minmax(0,1fr))", gap: 12 }}>
          <DSDateField label="Data inicial" value={filter.dataInicio} onChange={(v) => setF("dataInicio", v)} icon={Ic.calendario(14, C.cinzaChumbo)} />
          <DSDateField label="Data final" value={filter.dataFim} onChange={(v) => setF("dataFim", v)} icon={Ic.calendario(14, C.cinzaChumbo)} />
          <DSSelect label="Galpão" value={filter.galpao} onChange={v => setF("galpao", v)} options={allGalpoes} icon={Ic.factory(14, C.cinzaChumbo)} />
          <DSSelect label="Status" value={filter.status} onChange={v => setF("status", v)} options={Object.keys(STATUS_LABELS)} icon={Ic.flag(14, C.cinzaChumbo)} />
          <DSSelect label="Fornecedor" value={filter.fornecedor} onChange={v => setF("fornecedor", v)} options={allFornecedores} icon={Ic.truck(14, C.cinzaChumbo)} />
          <DSSelect label="Recorrência" value={filter.recorrencia} onChange={v => setF("recorrencia", v)} options={["Sim", "Não"]} icon={Ic.calendario(14, C.cinzaChumbo)} />
        </div>
      </div>

      {hasFilter && (
        <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 14, flexWrap: "wrap" }}>
          {filter.galpao && <span style={{ padding: "3px 8px", fontSize: 10, fontWeight: 600, color: C.azulProfundo, background: `${C.azulProfundo}10`, borderRadius: 4, fontFamily: Fn.body }}>Galpão: {filter.galpao}</span>}
          {filter.status && <span style={{ padding: "3px 8px", fontSize: 10, fontWeight: 600, color: C.verdeFloresta, background: `${C.verdeFloresta}10`, borderRadius: 4, fontFamily: Fn.body }}>Status: {STATUS_LABELS[filter.status] || filter.status}</span>}
          {filter.fornecedor && <span style={{ padding: "3px 8px", fontSize: 10, fontWeight: 600, color: C.amareloEscuro, background: `${C.amareloEscuro}10`, borderRadius: 4, fontFamily: Fn.body }}>Fornecedor: {filter.fornecedor}</span>}
          {filter.recorrencia && <span style={{ padding: "3px 8px", fontSize: 10, fontWeight: 600, color: C.azulCeu, background: `${C.azulCeu}10`, borderRadius: 4, fontFamily: Fn.body }}>Recorrência: {filter.recorrencia}</span>}
          {(filter.dataInicio || filter.dataFim) && <span style={{ padding: "3px 8px", fontSize: 10, fontWeight: 600, color: C.cinzaChumbo, background: `${C.cinzaChumbo}12`, borderRadius: 4, fontFamily: Fn.body }}>Período: {filter.dataInicio || "…"} até {filter.dataFim || "…"}</span>}
        </div>
      )}

      {/* ═══ KPIs ═══ */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 16, marginBottom: 24 }}>
        {kpis.map((k, i) => {
          const sparkData = k.pts.map((v, j) => ({ name: MONTHS[j], value: v }));
          const uid = `ck${i}`;
          return (
            <div key={i} style={cardStyle(i)} onMouseEnter={() => setHovKpi(i)} onMouseLeave={() => setHovKpi(-1)}>
              <div style={{ padding: "18px 20px 6px", position: "relative", zIndex: 2 }}>
                <div style={{ position: "absolute", top: 16, right: 16, width: 40, height: 40, borderRadius: 12, background: `${k.color}0F`, border: `1px solid ${k.color}22`, display: "flex", alignItems: "center", justifyContent: "center" }}>
                  {k.icon(20, k.color)}
                </div>
                <span style={{ fontSize: 10, fontWeight: 700, letterSpacing: "0.06em", textTransform: "uppercase", color: C.cinzaChumbo, display: "block", marginBottom: 8, fontFamily: Fn.title }}>{k.label}</span>
                <div style={{ display: "flex", flexDirection: "column", gap: 6, paddingRight: 48 }}>
                  <span style={{ fontSize: 26, fontWeight: 800, fontFamily: Fn.title, color: C.azulEscuro, lineHeight: 1, letterSpacing: "-0.02em" }}>{k.value}</span>
                  <span style={{ fontSize: 11, fontWeight: 600, color: C.textMuted }}>
                    <span style={{ color: k.up ? C.verdeEscuro : C.amareloEscuro, fontFamily: Fn.mono, fontWeight: 700 }}>{k.up ? "▲ " : "▼ "}</span>
                    {k.delta}
                  </span>
                </div>
              </div>
              <div style={{ overflow: "hidden", borderRadius: "0 0 12px 24px", marginLeft: -1, marginRight: -1, marginBottom: -1, height: 56 }}>
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={sparkData} margin={{ top: 0, right: 0, bottom: 0, left: 0 }}
                    onMouseMove={(state: any) => { if (state && state.activeTooltipIndex !== undefined) setHovKpiPt({ c: i, p: state.activeTooltipIndex }); }}
                    onMouseLeave={() => setHovKpiPt(null)}>
                    <defs>
                      <linearGradient id={`g${uid}`} x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor={k.color} stopOpacity={0.18} />
                        <stop offset="100%" stopColor={k.color} stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <XAxis dataKey="name" hide />
                    <Tooltip
                      content={({ active, payload, label }) => {
                        if (!active || !payload?.[0]) return null;
                        return (
                          <div style={{ background: C.cardBg, border: `1px solid ${C.cardBorder}`, borderRadius: 6, padding: "4px 8px", boxShadow: "0 2px 8px rgba(0,0,0,.12)" }}>
                            <span style={{ fontSize: 9, fontWeight: 700, color: k.color, fontFamily: Fn.mono }}>{payload[0].value}</span>
                            <span style={{ fontSize: 7, color: C.cinzaChumbo, fontFamily: Fn.body, marginLeft: 4 }}>{label}</span>
                          </div>
                        );
                      }}
                      cursor={false}
                    />
                    <Area
                      type="monotone"
                      dataKey="value"
                      stroke={k.color}
                      strokeWidth={2}
                      fill={`url(#g${uid})`}
                      dot={false}
                      activeDot={{ r: 4, fill: k.color, stroke: "none" }}
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>
          );
        })}
      </div>

      {/* ═══ ALERTAS ═══ */}
      {(semData > 0 || atrasadas > 0) && (
        <div style={{ display: "flex", gap: 12, marginBottom: 24, flexWrap: "wrap" }}>
          {semData > 0 && (
            <div style={{ display: "flex", alignItems: "center", gap: 8, padding: "10px 16px", borderRadius: 10, background: `${C.amareloEscuro}0A`, border: `1px solid ${C.amareloEscuro}30` }}>
              <span style={{ fontSize: 13, fontWeight: 700, color: C.amareloEscuro, fontFamily: Fn.mono }}>{semData}</span>
              <span style={{ fontSize: 12, color: C.cinzaEscuro }}>coletas pendentes <b>sem data</b></span>
            </div>
          )}
          {atrasadas > 0 && (
            <div style={{ display: "flex", alignItems: "center", gap: 8, padding: "10px 16px", borderRadius: 10, background: `${C.danger}0A`, border: `1px solid ${C.danger}30` }}>
              <span style={{ fontSize: 13, fontWeight: 700, color: C.danger, fontFamily: Fn.mono }}>{atrasadas}</span>
              <span style={{ fontSize: 12, color: C.cinzaEscuro }}>coletas com data <b>vencida</b></span>
            </div>
          )}
        </div>
      )}

      {/* ═══ COLETA POR MÊS + STATUS DONUT ═══ */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, marginBottom: 24 }}>
        {/* Barras mensais */}
        <div style={{ ...cardStyle(), padding: 20 }} onMouseMove={trackMouse}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 16 }}>
            <div>
              <span style={{ fontSize: 13, fontWeight: 700, color: C.azulEscuro, fontFamily: Fn.title, display: "block" }}>Coletas por Mês</span>
              <span style={{ fontSize: 10, color: C.cinzaChumbo }}>Passe o mouse para detalhes{filter.status ? " · filtrado" : ""}</span>
            </div>
          </div>
          <div style={{ width: "100%", height: 160 }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={monthlyData} onMouseMove={(state: any) => { if (state && state.activeTooltipIndex !== undefined) setHovBar(state.activeTooltipIndex); }} onMouseLeave={() => setHovBar(-1)}>
                <XAxis dataKey="label" tick={{ fontSize: 9, fill: C.cinzaChumbo, fontFamily: Fn.body }} axisLine={{ stroke: C.cardBorder, strokeWidth: 0.5 }} tickLine={false} />
                <Bar dataKey="count" radius={[6, 6, 0, 0]} cursor="pointer" label={{ position: "top", fontSize: 11, fontWeight: 700, fill: C.azulEscuro, fontFamily: Fn.mono }}>
                  {monthlyData.map((_m, i) => (
                    <Cell key={i} fill={C.azulProfundo} fillOpacity={hovBar === i ? 1 : 0.82} style={{ transition: "all .15s" }} />
                  ))}
                </Bar>
                <Tooltip content={() => null} cursor={false} />
              </BarChart>
            </ResponsiveContainer>
          </div>
          {hovBar >= 0 && monthlyData[hovBar] && (
            <ChartTooltip
              title={monthlyData[hovBar].label}
              color={C.azulProfundo}
              x={tipPos.x} y={tipPos.y}
              rows={[
                { label: "Coletas no mês", value: monthlyData[hovBar].count, color: C.azulProfundo },
                { label: "% do total", value: `${Math.round((monthlyData[hovBar].count / total) * 100)}%`, color: C.azulCeu },
              ]}
            />
          )}
        </div>

        {/* Donut status */}
        <div style={{ ...cardStyle(), padding: 20 }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 16 }}>
            <div>
              <span style={{ fontSize: 13, fontWeight: 700, color: C.azulEscuro, fontFamily: Fn.title, display: "block" }}>Coletas por Status</span>
              <span style={{ fontSize: 10, color: C.cinzaChumbo }}>Clique para filtrar · {total} coletas</span>
            </div>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 20, justifyContent: "center" }}>
            <Donut
              segments={statusData}
              hov={hovStatus}
              setHov={setHovStatus}
              onClick={(key) => setF("status", filter.status === key ? null : key)}
              center={
                hovStatus !== null
                  ? <><span style={{ fontSize: 16, fontWeight: 800, fontFamily: Fn.title, color: statusData[hovStatus]?.color, lineHeight: 1 }}>{statusData[hovStatus]?.value}</span><span style={{ fontSize: 8, color: C.cinzaChumbo }}>{Math.round((statusData[hovStatus]?.value || 0) / total * 100)}%</span></>
                  : <><span style={{ fontSize: 20, fontWeight: 800, fontFamily: Fn.title, color: C.azulEscuro, lineHeight: 1 }}>{total}</span><span style={{ fontSize: 9, color: C.cinzaChumbo }}>total</span></>
              }
            />
            <div style={{ display: "flex", flexDirection: "column", gap: 5 }}>
              {statusData.map((s, i) => (
                <div key={s.key} onClick={() => setF("status", filter.status === s.key ? null : s.key)}
                  style={{ display: "flex", alignItems: "center", gap: 8, cursor: "pointer", opacity: filter.status && filter.status !== s.key ? 0.3 : 1, transition: "opacity .15s" }}
                  onMouseEnter={() => setHovStatus(i)} onMouseLeave={() => setHovStatus(null)}>
                  <div style={{ width: 8, height: 8, borderRadius: "50%", background: s.color, flexShrink: 0 }} />
                  <span style={{ fontSize: 11, color: C.cinzaEscuro, fontFamily: Fn.body }}>{s.label}</span>
                  <span style={{ fontSize: 11, fontWeight: 700, color: s.color, fontFamily: Fn.mono, marginLeft: "auto" }}>{s.value}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* ═══ TOP FORNECEDORES + RESUMO ═══ */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 300px", gap: 16 }}>
        {/* Fornecedores — com periodicidade */}
        <div style={{ ...cardStyle(), padding: 20 }} onMouseMove={trackMouse}>
          <div style={{ marginBottom: 16 }}>
            <span style={{ fontSize: 13, fontWeight: 700, color: C.azulEscuro, fontFamily: Fn.title, display: "block" }}>Top Fornecedores · Periodicidade</span>
            <span style={{ fontSize: 10, color: C.cinzaChumbo }}>Frequência real calculada pelas datas · Top 10</span>
          </div>

          {/* Header */}
          <div style={{ display: "grid", gridTemplateColumns: "28px 1fr 80px 70px 90px 90px", gap: 8, padding: "0 12px 8px", borderBottom: `1px solid ${C.cardBorder}` }}>
            {["#", "Fornecedor", "Coletas", "Peso", "Frequência", "Próxima est."].map(h => (
              <span key={h} style={{ fontSize: 9, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.06em", color: C.cinzaChumbo, fontFamily: Fn.title }}>{h}</span>
            ))}
          </div>

          <div style={{ display: "flex", flexDirection: "column" }}>
            {topForn.map((f, i) => {
              const pct = (f.count / maxForn) * 100;
              const isH = hovForn === i;
              const ultimaFmt = f.ultima ? new Date(f.ultima).toLocaleDateString("pt-BR", { day: "2-digit", month: "short" }) : "—";
              const proxFmt = f.proximaEstimada ? new Date(f.proximaEstimada).toLocaleDateString("pt-BR", { day: "2-digit", month: "short" }) : "—";
              const isAtrasada = f.proximaEstimada > 0 && f.proximaEstimada < Date.now();
              return (
                <div key={i} onMouseEnter={() => setHovForn(i)} onMouseLeave={() => setHovForn(-1)}
                  style={{ display: "grid", gridTemplateColumns: "28px 1fr 80px 70px 90px 90px", gap: 8, alignItems: "center", padding: "10px 12px", borderBottom: `1px solid ${C.cardBorder}`, background: isH ? `${C.azulProfundo}06` : "transparent", transition: "background .15s", cursor: "default" }}>
                  {/* Rank */}
                  <div style={{ width: 22, height: 22, borderRadius: 5, background: i < 3 ? C.azulProfundo : `${C.cardBorder}`, color: i < 3 ? C.branco : C.cinzaChumbo, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 9, fontWeight: 700, fontFamily: Fn.mono }}>{i + 1}</div>
                  {/* Nome + barra */}
                  <div style={{ minWidth: 0 }}>
                    <div style={{ fontSize: 12, fontWeight: 600, color: C.cinzaEscuro, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{f.nome}</div>
                    <div style={{ marginTop: 3, height: 3, borderRadius: 2, background: `${C.azulProfundo}10` }}>
                      <div style={{ height: 3, borderRadius: 2, background: C.azulProfundo, width: `${pct}%` }} />
                    </div>
                  </div>
                  {/* Coletas */}
                  <span style={{ fontSize: 12, fontWeight: 700, color: C.azulProfundo, fontFamily: Fn.mono }}>{f.count}</span>
                  {/* Peso */}
                  <span style={{ fontSize: 11, color: C.textMuted, fontFamily: Fn.mono }}>{formatKg(f.peso)}</span>
                  {/* Frequência */}
                  <div>
                    <span style={{ fontSize: 11, fontWeight: 600, color: f.mediaDias > 0 ? C.verdeFloresta : C.textLight, fontFamily: Fn.body }}>{f.perioLabel}</span>
                    {f.mediaDias > 0 && <div style={{ fontSize: 9, color: C.textMuted }}>~{f.mediaDias}d média</div>}
                  </div>
                  {/* Próxima estimada */}
                  <div>
                    <span style={{ fontSize: 11, fontWeight: 600, color: isAtrasada ? C.danger : f.proximaEstimada ? C.azulProfundo : C.textLight, fontFamily: Fn.mono }}>{proxFmt}</span>
                    {isAtrasada && <div style={{ fontSize: 9, fontWeight: 700, color: C.danger }}>atrasada</div>}
                    {!isAtrasada && f.proximaEstimada > 0 && (() => {
                      const diasPara = Math.ceil((f.proximaEstimada - Date.now()) / 86400000);
                      return <div style={{ fontSize: 9, color: C.textMuted }}>{diasPara}d restantes</div>;
                    })()}
                  </div>
                </div>
              );
            })}
          </div>
          {hovForn >= 0 && topForn[hovForn] && (() => {
            const f = topForn[hovForn];
            const ultimaFmt = f.ultima ? new Date(f.ultima).toLocaleDateString("pt-BR") : "—";
            const proxFmt = f.proximaEstimada ? new Date(f.proximaEstimada).toLocaleDateString("pt-BR") : "—";
            return (
              <ChartTooltip
                title={f.nome} color={C.azulProfundo}
                x={tipPos.x} y={tipPos.y}
                rows={[
                  { label: "Total coletas", value: f.count, color: C.azulProfundo },
                  { label: "Peso total", value: formatKg(f.peso), color: C.verdeFloresta },
                  { label: "Frequência média", value: f.mediaDias > 0 ? `${f.mediaDias} dias` : "—", color: C.amareloEscuro },
                  { label: "Última coleta", value: ultimaFmt, color: C.azulCeu },
                  { label: "Próxima estimada", value: proxFmt, color: f.proximaEstimada && f.proximaEstimada < Date.now() ? C.danger : C.verdeEscuro },
                ]}
              />
            );
          })()}
        </div>

        {/* Resumo lateral */}
        <div style={{ ...cardStyle(), padding: 20 }}>
          <span style={{ fontSize: 13, fontWeight: 700, color: C.azulEscuro, fontFamily: Fn.title, display: "block", marginBottom: 16 }}>Resumo</span>
          {[
            { label: "Coletas totais", value: coletas.length, color: C.azulProfundo },
            { label: "Pendentes", value: coletas.filter(c => c.status === "pendente").length, color: C.amareloEscuro },
            { label: "Agendadas", value: coletas.filter(c => c.status === "agendado").length, color: C.azulCeu },
            { label: "Em andamento", value: emAndamento, color: C.verdeFloresta },
            { label: "Finalizadas", value: finalizados, color: C.verdeEscuro },
            { label: "Canceladas", value: coletas.filter(c => c.status === "cancelado").length, color: C.danger },
            { label: "Recorrentes", value: recorrentes, color: C.azulClaro },
            { label: "Fornecedores", value: new Set(coletas.map(c => c.fornecedorId).filter(Boolean)).size, color: C.azulProfundo },
            { label: "Peso NF total", value: formatKg(pesoNF), color: C.verdeFloresta },
            { label: "Peso atual", value: formatKg(pesoAtual), color: C.verdeEscuro },
          ].map((r, i) => (
            <div key={i} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "6px 0", borderBottom: `1px solid ${C.cardBorder}` }}>
              <span style={{ fontSize: 12, color: C.cinzaEscuro }}>{r.label}</span>
              <span style={{ fontSize: 12, fontWeight: 700, color: r.color, fontFamily: Fn.mono }}>{r.value}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
