import { useState, useMemo, useEffect, useRef } from "react";

/* ─── Types ─── */
interface Coleta {
  id: string; numero: number; nomeFantasia: string; cnpjFornecedor: string;
  pesoTotalNF: number; pesoTotalAtual: number; dataPedido: string;
  dataChegada: string | null; status: string; fornecedorId: string;
  galpao?: string; recorrencia?: string | null;
}

interface CostureiraEnvio {
  id: string; coletaId: string; coletaNumero: number; fornecedor: string;
  costureira: string; tipoMaterial: string; tipoMedida: string;
  status: string; dataEnvio: string | null; dataRetorno: string | null;
  motoristaEnvio: string; motoristaRetorno: string;
  qtdsSaidaKg: number; qtdsRetornoKg: number; galpaoEnvio?: string;
  observacao: string;
}

interface Repanol {
  id: string; coletaId: string; coletaNumero: number; fornecedor: string;
  empresaFornecedor: string; tipoMaterial: string; status: string;
  dataEnvio: string | null; dataRetorno: string | null;
  pesoManchadoEnvio: number; pesoMolhadoEnvio: number; pesoTingidoEnvio: number;
  galpao?: string;
}

interface Expedicao {
  id: string; clienteId?: string; nomeFantasia?: string;
  descricaoProduto?: string; tipoMaterial?: string; kilo?: number;
  statusEntrega?: string; statusFinanceiro?: string; statusNota?: string;
  galpao?: string; rota?: string; prioridade?: string;
  endereco?: string; dataEntrega?: string; createdAt: string;
}

interface Props {
  coletas: Coleta[];
  costureiras: CostureiraEnvio[];
  repanois: Repanol[];
  expedicoes: Expedicao[];
}

interface LogisticaTask {
  id: string;
  tipo: "coleta" | "expedicao" | "costureira" | "repanol";
  destino: string;
  material?: string;
  peso: number;
  rota?: string;
  galpao?: string;
  statusLabel: string;
  prioridade: "urgente" | "normal" | "baixa";
  data: string;
  acaoLabel: string;
}

type AtribuicaoTipo = "saida_rota" | "ida_costureira" | "busca_coleta";

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

/* ─── SVG Icons ─── */
const Ic = {
  send: (s: number, c: string) => <svg width={s} height={s} viewBox="0 0 20 20" fill="none"><path d="M18 2L9 11M18 2l-5 16-4-7-7-4 16-5z" stroke={c} strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"/></svg>,
  users: (s: number, c: string) => <svg width={s} height={s} viewBox="0 0 20 20" fill="none"><circle cx="7" cy="7" r="3" stroke={c} strokeWidth="1.4"/><path d="M1 17c0-3 2.7-5 6-5s6 2 6 5" stroke={c} strokeWidth="1.4" strokeLinecap="round"/><circle cx="14" cy="6" r="2.5" stroke={c} strokeWidth="1.2"/><path d="M15.5 12c2 .5 3.5 2 3.5 4" stroke={c} strokeWidth="1.2" strokeLinecap="round"/></svg>,
  scale: (s: number, c: string) => <svg width={s} height={s} viewBox="0 0 20 20" fill="none"><path d="M10 2v16M3 6l7-2 7 2M3 6l2 6h-4L3 6zM17 6l2 6h-4L17 6z" stroke={c} strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round"/></svg>,
  check: (s: number, c: string) => <svg width={s} height={s} viewBox="0 0 20 20" fill="none"><path d="M4 10l4 4 8-8" stroke={c} strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/></svg>,
  clock: (s: number, c: string) => <svg width={s} height={s} viewBox="0 0 20 20" fill="none"><circle cx="10" cy="10" r="8" stroke={c} strokeWidth="1.4"/><path d="M10 5v5l3 3" stroke={c} strokeWidth="1.4" strokeLinecap="round"/></svg>,
  chart: (s: number, c: string) => <svg width={s} height={s} viewBox="0 0 20 20" fill="none"><rect x="2" y="10" width="4" height="8" rx="1" stroke={c} strokeWidth="1.3"/><rect x="8" y="5" width="4" height="13" rx="1" stroke={c} strokeWidth="1.3"/><rect x="14" y="2" width="4" height="16" rx="1" stroke={c} strokeWidth="1.3"/></svg>,
  truck: (s: number, c: string) => <svg width={s} height={s} viewBox="0 0 20 20" fill="none"><rect x="1" y="6" width="11" height="9" rx="1.5" stroke={c} strokeWidth="1.4"/><path d="M12 9h4l2.5 3v3h-6.5" stroke={c} strokeWidth="1.4" strokeLinejoin="round"/><circle cx="5" cy="16" r="1.5" stroke={c} strokeWidth="1.3"/><circle cx="15.5" cy="16" r="1.5" stroke={c} strokeWidth="1.3"/></svg>,
  grid: (s: number, c: string) => <svg width={s} height={s} viewBox="0 0 20 20" fill="none"><rect x="2" y="2" width="7" height="7" rx="1.5" stroke={c} strokeWidth="1.3"/><rect x="11" y="2" width="7" height="7" rx="1.5" stroke={c} strokeWidth="1.3"/><rect x="2" y="11" width="7" height="7" rx="1.5" stroke={c} strokeWidth="1.3"/><rect x="11" y="11" width="7" height="7" rx="1.5" stroke={c} strokeWidth="1.3"/></svg>,
  x: (s: number, c: string) => <svg width={s} height={s} viewBox="0 0 16 16" fill="none"><path d="M4 4l8 8M12 4l-8 8" stroke={c} strokeWidth="1.5" strokeLinecap="round"/></svg>,
  flag: (s: number, c: string) => <svg width={s} height={s} viewBox="0 0 20 20" fill="none"><path d="M4 2v16M4 2l10 5-10 5" stroke={c} strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"/></svg>,
  dollar: (s: number, c: string) => <svg width={s} height={s} viewBox="0 0 20 20" fill="none"><path d="M10 2v16M6 6c0-1.5 1.8-2 4-2s4 .5 4 2-1.8 2-4 3-4 1.5-4 3 1.8 2 4 2 4-.5 4-2" stroke={c} strokeWidth="1.4" strokeLinecap="round"/></svg>,
  box: (s: number, c: string) => <svg width={s} height={s} viewBox="0 0 20 20" fill="none"><path d="M2 6l8-4 8 4v8l-8 4-8-4V6z" stroke={c} strokeWidth="1.3" strokeLinejoin="round"/><path d="M2 6l8 4 8-4M10 10v8" stroke={c} strokeWidth="1.3" strokeLinejoin="round"/></svg>,
  edificio: (s: number, c: string) => <svg width={s} height={s} viewBox="0 0 20 20" fill="none"><rect x="3" y="2" width="14" height="16" rx="2" stroke={c} strokeWidth="1.4"/><rect x="6" y="5" width="3" height="3" rx=".5" stroke={c} strokeWidth="1"/><rect x="11" y="5" width="3" height="3" rx=".5" stroke={c} strokeWidth="1"/><rect x="6" y="10" width="3" height="3" rx=".5" stroke={c} strokeWidth="1"/><rect x="11" y="10" width="3" height="3" rx=".5" stroke={c} strokeWidth="1"/><rect x="8" y="15" width="4" height="3" rx=".5" stroke={c} strokeWidth="1"/></svg>,
  scissors: (s: number, c: string) => <svg width={s} height={s} viewBox="0 0 20 20" fill="none"><circle cx="6" cy="6" r="2.5" stroke={c} strokeWidth="1.3"/><circle cx="6" cy="14" r="2.5" stroke={c} strokeWidth="1.3"/><path d="M8 7.5L17 3M8 12.5L17 17M17 3v14" stroke={c} strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round"/></svg>,
  droplets: (s: number, c: string) => <svg width={s} height={s} viewBox="0 0 20 20" fill="none"><path d="M7 3c-3 4-5 6.5-5 9a5 5 0 0010 0c0-2.5-2-5-5-9z" stroke={c} strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round"/><path d="M14 8c-1.8 2.4-3 4-3 5.5a3 3 0 006 0c0-1.5-1.2-3.1-3-5.5z" stroke={c} strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round"/></svg>,
};

/* ─── Helpers ─── */
function formatKg(n: number) { return n >= 1000 ? `${(n / 1000).toFixed(1)}t` : `${Math.round(n)} kg`; }
function spark(seed: number, trend: "up" | "down") {
  const pts: number[] = []; let v = 40 + (seed % 30);
  for (let i = 0; i < 12; i++) { const d = trend === "up" ? 1.4 : -1.2; const n = Math.sin(seed * 0.31 + i * 0.7) * 8; v = Math.min(92, Math.max(8, v + d + n * 0.15)); pts.push(Math.round(v)); }
  return pts;
}
const MONTHS = ["Jan", "Fev", "Mar", "Abr", "Mai", "Jun", "Jul", "Ago", "Set", "Out", "Nov", "Dez"];

const TIPO_COLORS: Record<string, { bg: string; color: string }> = {
  coleta: { bg: "#004B9B15", color: "#004B9B" },
  expedicao: { bg: "#00C64C15", color: "#00904C" },
  costureira: { bg: "#F6921E15", color: "#B25800" },
  repanol: { bg: "#9B59B615", color: "#6C3483" },
};

const TIPO_ACCENT: Record<string, string> = {
  coleta: "#004B9B",
  expedicao: "#00C64C",
  costureira: "#F6921E",
  repanol: "#9B59B6",
};

const TIPO_LABELS: Record<string, string> = {
  coleta: "Coleta",
  expedicao: "Expedição",
  costureira: "Costureira",
  repanol: "Repanol",
};

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

/* ─── Donut ─── */
function Donut({ segments, size = 130, strokeW = 14, center, hov, setHov, onClick }: {
  segments: { label: string; value: number; color: string; key: string }[];
  size?: number; strokeW?: number; center: React.ReactNode;
  hov: number | null; setHov: (i: number | null) => void;
  onClick?: (key: string) => void;
}) {
  const total = Math.max(segments.reduce((a, s) => a + s.value, 0), 1);
  const cx = size / 2, cy = size / 2, r = (size - strokeW) / 2 - 4;
  const circ = 2 * Math.PI * r; let acc = 0;
  return (
    <div style={{ position: "relative" }}>
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} style={{ transform: "rotate(-90deg)" }}>
        <circle cx={cx} cy={cy} r={r} fill="none" stroke={C.cardBorder} strokeWidth={strokeW} />
        {segments.map((s, i) => { const pct = s.value / total; const dash = pct * circ; const off = acc * circ; acc += pct;
          return <circle key={i} cx={cx} cy={cy} r={r} fill="none" stroke={s.color} strokeWidth={hov === i ? strokeW + 4 : strokeW} strokeDasharray={`${dash} ${circ - dash}`} strokeDashoffset={-off} strokeLinecap="round" style={{ transition: "all .15s", cursor: onClick ? "pointer" : "default" }} onClick={() => onClick?.(s.key)} onMouseEnter={() => setHov(i)} onMouseLeave={() => setHov(null)} />;
        })}
      </svg>
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
              {typeof r.value === "number" && <div style={{ width: 50, height: 4, borderRadius: 2, background: `${r.color || color}15`, flexShrink: 0 }}><div style={{ height: 4, borderRadius: 2, background: r.color || color, width: `${((r.value as number) / maxVal) * 100}%` }} /></div>}
              <span style={{ fontSize: 11, fontWeight: 700, color: r.color || color, fontFamily: Fn.mono, minWidth: 22, textAlign: "right" }}>{r.value}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

/* ─── Transform helpers ─── */
function daysDiff(isoDate: string | null, reference: Date): number {
  if (!isoDate) return 0;
  const d = new Date(isoDate + "T00:00:00");
  return Math.floor((reference.getTime() - d.getTime()) / 86400000);
}

function buildTasks(coletas: Coleta[], costureiras: CostureiraEnvio[], repanois: Repanol[], expedicoes: Expedicao[]): LogisticaTask[] {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const tasks: LogisticaTask[] = [];

  // Coletas (agendado with dataChegada)
  for (const c of coletas) {
    if (c.status !== "agendado" || !c.dataChegada) continue;
    const diff = daysDiff(c.dataChegada, today);
    let prioridade: LogisticaTask["prioridade"] = "baixa";
    if (diff >= 0) prioridade = "urgente";
    else if (diff >= -2) prioridade = "normal";
    tasks.push({
      id: c.id,
      tipo: "coleta",
      destino: c.nomeFantasia,
      peso: c.pesoTotalNF,
      statusLabel: "Buscar no fornecedor",
      prioridade,
      data: c.dataChegada,
      acaoLabel: "Iniciar Coleta",
      galpao: c.galpao,
    });
  }

  // Costureiras (enviado)
  for (const co of costureiras) {
    if (co.status !== "enviado") continue;
    const age = daysDiff(co.dataEnvio, today);
    let prioridade: LogisticaTask["prioridade"] = "baixa";
    if (age > 5) prioridade = "urgente";
    else if (age > 2) prioridade = "normal";
    tasks.push({
      id: co.id,
      tipo: "costureira",
      destino: co.costureira,
      material: co.tipoMaterial,
      peso: co.qtdsSaidaKg,
      statusLabel: "Buscar retorno costureira",
      prioridade,
      data: co.dataEnvio || "",
      acaoLabel: "Buscar Retorno",
      galpao: co.galpaoEnvio,
    });
  }

  // Repanois (enviado)
  for (const r of repanois) {
    if (r.status !== "enviado") continue;
    const age = daysDiff(r.dataEnvio, today);
    let prioridade: LogisticaTask["prioridade"] = "baixa";
    if (age > 5) prioridade = "urgente";
    else if (age > 2) prioridade = "normal";
    tasks.push({
      id: r.id,
      tipo: "repanol",
      destino: r.empresaFornecedor,
      material: r.tipoMaterial,
      peso: r.pesoManchadoEnvio + r.pesoMolhadoEnvio + r.pesoTingidoEnvio,
      statusLabel: "Buscar retorno repanol",
      prioridade,
      data: r.dataEnvio || "",
      acaoLabel: "Buscar Retorno",
      galpao: r.galpao,
    });
  }

  // Expedições (pronto_entrega)
  for (const e of expedicoes) {
    if (e.statusEntrega !== "pronto_entrega") continue;
    let prioridade: LogisticaTask["prioridade"] = "normal";
    if (e.prioridade === "Urgente") prioridade = "urgente";
    else if (e.prioridade === "Normal") prioridade = "normal";
    tasks.push({
      id: e.id,
      tipo: "expedicao",
      destino: e.nomeFantasia || "—",
      material: e.tipoMaterial,
      peso: e.kilo || 0,
      rota: e.rota,
      statusLabel: "Entregar ao cliente",
      prioridade,
      data: e.dataEntrega || e.createdAt,
      acaoLabel: "Iniciar Entrega",
      galpao: e.galpao,
    });
  }

  // Sort: urgente first, then normal, then baixa; within same priority, oldest date first
  const prioOrder: Record<string, number> = { urgente: 0, normal: 1, baixa: 2 };
  tasks.sort((a, b) => {
    const pa = prioOrder[a.prioridade] ?? 1;
    const pb = prioOrder[b.prioridade] ?? 1;
    if (pa !== pb) return pa - pb;
    return new Date(a.data).getTime() - new Date(b.data).getTime();
  });

  return tasks;
}

/* ═════════════════════════ MAIN ═════════════════════════ */
export function PainelLogistica({ coletas, costureiras, repanois, expedicoes }: Props) {
  const dark = useDark();
  C = dark ? DARK : LIGHT;

  const [hovKpiPt, setHovKpiPt] = useState<{ c: number; p: number } | null>(null);
  const [hovDonut, setHovDonut] = useState<number | null>(null);
  const [hovRow, setHovRow] = useState(-1);
  const [taskSelecionada, setTaskSelecionada] = useState<LogisticaTask | null>(null);
  const [tipoAtribuicao, setTipoAtribuicao] = useState<AtribuicaoTipo>("saida_rota");
  const [obsAtribuicao, setObsAtribuicao] = useState("");
  const [tipPos, setTipPos] = useState({ x: 0, y: 0 });
  const trackMouse = (e: React.MouseEvent) => setTipPos({ x: e.clientX, y: e.clientY });

  /* ═══ Build all tasks ═══ */
  const allTasks = useMemo(() => buildTasks(coletas, costureiras, repanois, expedicoes), [coletas, costureiras, repanois, expedicoes]);

  /* ═══ FILTROS ═══ */
  const [filter, setFilter] = useState<Record<string, string | null>>({ tipo: null, status: null, prioridade: null, rota: null });
  const hasFilter = Object.values(filter).some(v => v);
  const setF = (key: string, val: string | null) => setFilter(f => ({ ...f, [key]: val || null }));
  const clearAll = () => setFilter({ tipo: null, status: null, prioridade: null, rota: null });

  const allTipos = useMemo(() => ["Coleta", "Expedição", "Costureira", "Repanol"], []);
  const allStatuses = useMemo(() => [...new Set(allTasks.map(t => t.statusLabel))].sort(), [allTasks]);
  const allPrioridades = useMemo(() => ["Urgente", "Normal", "Baixa"], []);
  const allRotas = useMemo(() => [...new Set(allTasks.map(t => t.rota).filter(Boolean))].sort() as string[], [allTasks]);

  const filtered = useMemo(() => {
    return allTasks.filter(t => {
      if (filter.tipo && TIPO_LABELS[t.tipo] !== filter.tipo) return false;
      if (filter.status && t.statusLabel !== filter.status) return false;
      if (filter.prioridade && t.prioridade !== filter.prioridade.toLowerCase()) return false;
      if (filter.rota && (t.rota || "") !== filter.rota) return false;
      return true;
    });
  }, [allTasks, filter]);

  /* ─── Stats ─── */
  const totalTasks = filtered.length;
  const coletasAgendadas = filtered.filter(t => t.tipo === "coleta").length;
  const entregasProntas = filtered.filter(t => t.tipo === "expedicao").length;
  const emTransito = filtered.filter(t => t.tipo === "costureira" || t.tipo === "repanol").length;
  const pesoTotal = filtered.reduce((a, t) => a + t.peso, 0);
  const urgentTasks = filtered.filter(t => t.prioridade === "urgente");

  /* Urgent alerts per type */
  const urgentColetas = urgentTasks.filter(t => t.tipo === "coleta").length;
  const urgentExpedicoes = urgentTasks.filter(t => t.tipo === "expedicao").length;
  const urgentCostureiras = urgentTasks.filter(t => t.tipo === "costureira").length;
  const urgentRepanois = urgentTasks.filter(t => t.tipo === "repanol").length;

  /* Donut data */
  const donutData = useMemo(() => {
    const tipos: LogisticaTask["tipo"][] = ["coleta", "expedicao", "costureira", "repanol"];
    return tipos.map(tipo => ({
      key: tipo,
      label: TIPO_LABELS[tipo],
      value: filtered.filter(t => t.tipo === tipo).length,
      color: TIPO_ACCENT[tipo],
    })).filter(s => s.value > 0);
  }, [filtered]);

  /* KPIs */
  const kpis = [
    { label: "Saídas Pendentes", value: totalTasks, delta: `${urgentTasks.length} urgentes`, up: true, color: C.azulProfundo, pts: spark(totalTasks * 9 + 42, "up"), icon: Ic.truck },
    { label: "Coletas Agendadas", value: coletasAgendadas, delta: `${urgentColetas} urgentes`, up: coletasAgendadas > 0, color: C.azulCeu, pts: spark(coletasAgendadas * 11 + 17, coletasAgendadas > 0 ? "up" : "down"), icon: Ic.box },
    { label: "Entregas Prontas", value: entregasProntas, delta: `${urgentExpedicoes} urgentes`, up: entregasProntas > 0, color: C.verdeFloresta, pts: spark(entregasProntas * 7 + 23, entregasProntas > 0 ? "up" : "down"), icon: Ic.check },
    { label: "Em Trânsito", value: emTransito, delta: `costureira + repanol`, up: emTransito > 0, color: C.amareloEscuro, pts: spark(emTransito + 41, emTransito > 0 ? "up" : "down"), icon: Ic.clock },
  ];

  const cardStyle = (i?: number): React.CSSProperties => ({
    background: C.cardBg, border: `1px solid ${C.cardBorder}`, borderRadius: "12px 12px 12px 24px",
    boxShadow: "0 1px 3px rgba(0,75,155,.04)", animation: i !== undefined ? `fadeUp .35s ease ${(i) * 0.06}s both` : undefined,
  });

  const formatDateBr = (iso: string) => {
    if (!iso) return "—";
    try {
      const d = new Date(iso + (iso.length === 10 ? "T00:00:00" : ""));
      return d.toLocaleDateString("pt-BR", { day: "2-digit", month: "2-digit", year: "2-digit" });
    } catch { return "—"; }
  };

  const isOverdue = (iso: string) => {
    if (!iso) return false;
    const d = new Date(iso + (iso.length === 10 ? "T00:00:00" : ""));
    const today = new Date(); today.setHours(0, 0, 0, 0);
    return d.getTime() < today.getTime();
  };

  const prioColor = (p: LogisticaTask["prioridade"]) => {
    if (p === "urgente") return C.danger;
    if (p === "normal") return C.amareloEscuro;
    return C.textMuted;
  };

  const abrirPopupAtribuicao = (task: LogisticaTask) => {
    setTaskSelecionada(task);
    if (task.tipo === "coleta") setTipoAtribuicao("busca_coleta");
    else if (task.tipo === "costureira") setTipoAtribuicao("ida_costureira");
    else setTipoAtribuicao("saida_rota");
    setObsAtribuicao("");
  };

  const confirmarAtribuicao = () => {
    setTaskSelecionada(null);
    setObsAtribuicao("");
  };

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
            <span style={{ fontSize: 10, color: C.textMuted, fontFamily: Fn.body }}>{filtered.length} tarefas</span>
            {hasFilter && <button onClick={clearAll} style={{ display: "inline-flex", alignItems: "center", gap: 4, padding: "4px 10px", fontSize: 10, fontWeight: 600, color: C.cinzaChumbo, background: C.bg, border: `1px solid ${C.cardBorder}`, borderRadius: 6, cursor: "pointer", fontFamily: Fn.body }}>{Ic.x(10, C.cinzaChumbo)} Limpar</button>}
          </div>
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 12 }}>
          <DSSelect label="Tipo" value={filter.tipo} onChange={v => setF("tipo", v)} options={allTipos} icon={Ic.truck(14, C.cinzaChumbo)} />
          <DSSelect label="Status" value={filter.status} onChange={v => setF("status", v)} options={allStatuses} placeholder="Todos" icon={Ic.flag(14, C.cinzaChumbo)} />
          <DSSelect label="Prioridade" value={filter.prioridade} onChange={v => setF("prioridade", v)} options={allPrioridades} icon={Ic.send(14, C.cinzaChumbo)} />
          <DSSelect label="Rota" value={filter.rota} onChange={v => setF("rota", v)} options={allRotas} icon={Ic.truck(14, C.cinzaChumbo)} />
        </div>
      </div>

      {hasFilter && (
        <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 14, flexWrap: "wrap" }}>
          {filter.tipo && <span style={{ padding: "3px 8px", fontSize: 10, fontWeight: 600, color: C.azulProfundo, background: `${C.azulProfundo}10`, borderRadius: 4, fontFamily: Fn.body }}>Tipo: {filter.tipo}</span>}
          {filter.status && <span style={{ padding: "3px 8px", fontSize: 10, fontWeight: 600, color: C.verdeFloresta, background: `${C.verdeFloresta}10`, borderRadius: 4, fontFamily: Fn.body }}>Status: {filter.status}</span>}
          {filter.prioridade && <span style={{ padding: "3px 8px", fontSize: 10, fontWeight: 600, color: C.amareloEscuro, background: `${C.amareloEscuro}10`, borderRadius: 4, fontFamily: Fn.body }}>Prioridade: {filter.prioridade}</span>}
          {filter.rota && <span style={{ padding: "3px 8px", fontSize: 10, fontWeight: 600, color: C.azulCeu, background: `${C.azulCeu}10`, borderRadius: 4, fontFamily: Fn.body }}>Rota: {filter.rota}</span>}
        </div>
      )}

      {/* ═══ ALERTAS URGENTES ═══ */}
      {urgentTasks.length > 0 && (
        <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 16, flexWrap: "wrap" }}>
          {urgentColetas > 0 && <span style={{ padding: "5px 12px", fontSize: 11, fontWeight: 700, color: C.branco, background: TIPO_ACCENT.coleta, borderRadius: 20, fontFamily: Fn.body }}>{urgentColetas} coleta{urgentColetas > 1 ? "s" : ""} agendada{urgentColetas > 1 ? "s" : ""} para hoje</span>}
          {urgentExpedicoes > 0 && <span style={{ padding: "5px 12px", fontSize: 11, fontWeight: 700, color: C.branco, background: TIPO_ACCENT.expedicao, borderRadius: 20, fontFamily: Fn.body }}>{urgentExpedicoes} entrega{urgentExpedicoes > 1 ? "s" : ""} pronta{urgentExpedicoes > 1 ? "s" : ""}</span>}
          {urgentCostureiras > 0 && <span style={{ padding: "5px 12px", fontSize: 11, fontWeight: 700, color: C.branco, background: TIPO_ACCENT.costureira, borderRadius: 20, fontFamily: Fn.body }}>{urgentCostureiras} retorno{urgentCostureiras > 1 ? "s" : ""} costureira pendente{urgentCostureiras > 1 ? "s" : ""}</span>}
          {urgentRepanois > 0 && <span style={{ padding: "5px 12px", fontSize: 11, fontWeight: 700, color: C.branco, background: TIPO_ACCENT.repanol, borderRadius: 20, fontFamily: Fn.body }}>{urgentRepanois} retorno{urgentRepanois > 1 ? "s" : ""} repanol pendente{urgentRepanois > 1 ? "s" : ""}</span>}
        </div>
      )}

      {/* ═══ KPIs ═══ */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 16, marginBottom: 24 }}>
        {kpis.map((k, i) => {
          const max = Math.max(...k.pts), min = Math.min(...k.pts);
          const sw2 = 200, sh = 40;
          const points = k.pts.map((v, j) => ({ x: (j / (k.pts.length - 1)) * sw2, y: sh - ((v - min) / (max - min || 1)) * (sh - 8) + 4 }));
          const line = points.map(p => `${p.x},${p.y}`).join(" ");
          const uid = `lk${i}`;
          const hovPt = hovKpiPt && hovKpiPt.c === i ? hovKpiPt.p : -1;
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
                <svg width="100%" height={sh + 16} viewBox={`-2 -12 ${sw2 + 4} ${sh + 28}`} preserveAspectRatio="none" style={{ display: "block" }} onMouseLeave={() => setHovKpiPt(null)}>
                  <defs><linearGradient id={`g${uid}`} x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor={k.color} stopOpacity=".18" /><stop offset="100%" stopColor={k.color} stopOpacity="0" /></linearGradient></defs>
                  <polygon points={`0,${sh} ${line} ${sw2},${sh}`} fill={`url(#g${uid})`} />
                  <polyline points={line} fill="none" stroke={k.color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                  {points.map((p, j) => (<g key={j} onMouseEnter={() => setHovKpiPt({ c: i, p: j })} style={{ cursor: "pointer" }}><circle cx={p.x} cy={p.y} r="10" fill="transparent" /><circle cx={p.x} cy={p.y} r={hovPt === j ? 4 : 0} fill={k.color} />{hovPt === j && <><text x={p.x} y={p.y - 8} textAnchor="middle" fontSize="9" fontWeight="700" fill={k.color} fontFamily={Fn.mono}>{k.pts[j]}</text><text x={p.x} y={sh + 10} textAnchor="middle" fontSize="7" fill={C.cinzaChumbo} fontFamily={Fn.body}>{MONTHS[j]}</text></>}</g>))}
                  {points.map((p, j) => j % 2 === 0 && hovPt === -1 ? <text key={`m${j}`} x={p.x} y={sh + 10} textAnchor="middle" fontSize="7" fill={C.textLight} fontFamily={Fn.body}>{MONTHS[j]}</text> : null)}
                </svg>
              </div>
            </div>
          );
        })}
      </div>

      {/* ═══ TABELA INTEGRADA DE TAREFAS ═══ */}
      <div style={{ ...cardStyle(), padding: 20, marginBottom: 24 }} onMouseMove={trackMouse}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 16 }}>
          <div>
            <span style={{ fontSize: 13, fontWeight: 700, color: C.azulEscuro, fontFamily: Fn.title, display: "block" }}>Tarefas Logísticas</span>
            <span style={{ fontSize: 10, color: C.cinzaChumbo }}>Todas as pendências integradas · {filtered.length} tarefas</span>
          </div>
          <div style={{ width: 30, height: 30, borderRadius: 8, background: `${C.azulProfundo}0A`, display: "flex", alignItems: "center", justifyContent: "center" }}>{Ic.truck(14, C.azulProfundo)}</div>
        </div>

        {/* Header */}
        <div style={{ display: "grid", gridTemplateColumns: "70px 1fr 100px 70px 80px 140px 70px 80px 92px", gap: 8, padding: "0 12px 8px", borderBottom: `1px solid ${C.cardBorder}` }}>
          {["Tipo", "Destino", "Material", "Peso", "Rota", "Status", "Prior.", "Data", "Atribuir"].map(h => (
            <span key={h} style={{ fontSize: 9, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.06em", color: C.cinzaChumbo, fontFamily: Fn.title }}>{h}</span>
          ))}
        </div>

        {/* Rows */}
        <div style={{ display: "flex", flexDirection: "column" }}>
          {filtered.length === 0 && (
            <div style={{ padding: "24px 12px", textAlign: "center", fontSize: 12, color: C.textMuted }}>Nenhuma tarefa encontrada</div>
          )}
          {filtered.map((t, i) => {
            const tc = TIPO_COLORS[t.tipo];
            const isH = hovRow === i;
            return (
              <div key={t.id + t.tipo} onMouseEnter={() => setHovRow(i)} onMouseLeave={() => setHovRow(-1)} style={{ display: "grid", gridTemplateColumns: "70px 1fr 100px 70px 80px 140px 70px 80px 92px", gap: 8, alignItems: "center", padding: "10px 12px", borderBottom: `1px solid ${C.cardBorder}`, background: isH ? `${C.azulProfundo}06` : "transparent", transition: "background .15s", cursor: "default" }}>
                {/* Tipo badge */}
                <span style={{ fontSize: 10, fontWeight: 700, padding: "3px 8px", borderRadius: 4, background: tc.bg, color: tc.color, fontFamily: Fn.body, textAlign: "center", whiteSpace: "nowrap" }}>{TIPO_LABELS[t.tipo]}</span>
                {/* Destino */}
                <div style={{ minWidth: 0 }}>
                  <div style={{ fontSize: 12, fontWeight: 600, color: C.cinzaEscuro, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{t.destino}</div>
                </div>
                {/* Material */}
                <span style={{ fontSize: 11, color: C.cinzaEscuro, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{t.material || "—"}</span>
                {/* Peso */}
                <span style={{ fontSize: 12, fontFamily: Fn.mono, fontWeight: 700, color: C.cinzaEscuro }}>{formatKg(t.peso)}</span>
                {/* Rota */}
                <span style={{ fontSize: 11, color: C.cinzaEscuro, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{t.rota || "—"}</span>
                {/* Status */}
                <span style={{ fontSize: 11, fontWeight: 600, color: TIPO_ACCENT[t.tipo] }}>{t.statusLabel}</span>
                {/* Prioridade badge */}
                <span style={{ fontSize: 10, fontWeight: 700, padding: "3px 8px", borderRadius: 4, background: `${prioColor(t.prioridade)}15`, color: prioColor(t.prioridade), fontFamily: Fn.body, textAlign: "center", textTransform: "capitalize" }}>{t.prioridade}</span>
                {/* Data */}
                <span style={{ fontSize: 11, fontFamily: Fn.mono, fontWeight: 600, color: isOverdue(t.data) ? C.danger : C.cinzaEscuro }}>{formatDateBr(t.data)}</span>
                {/* Atribuição */}
                <button
                  onClick={() => abrirPopupAtribuicao(t)}
                  style={{ height: 26, borderRadius: 6, border: `1px solid ${TIPO_ACCENT[t.tipo]}55`, background: `${TIPO_ACCENT[t.tipo]}10`, color: TIPO_ACCENT[t.tipo], fontSize: 10, fontWeight: 700, cursor: "pointer" }}
                >
                  Atribuir
                </button>
              </div>
            );
          })}
        </div>

        {/* Row tooltip */}
        {hovRow >= 0 && filtered[hovRow] && (() => {
          const t = filtered[hovRow];
          return <ChartTooltip title={t.destino} color={TIPO_ACCENT[t.tipo]} x={tipPos.x} y={tipPos.y} rows={[
            { label: "Tipo", value: TIPO_LABELS[t.tipo], color: TIPO_ACCENT[t.tipo] },
            { label: "Status", value: t.statusLabel, color: C.azulProfundo },
            { label: "Prioridade", value: t.prioridade, color: prioColor(t.prioridade) },
            { label: "Peso", value: formatKg(t.peso), color: C.verdeFloresta },
            { label: "Ação", value: t.acaoLabel, color: C.amareloEscuro },
            ...(t.galpao ? [{ label: "Galpão", value: t.galpao, color: C.azulCeu }] : []),
            ...(t.rota ? [{ label: "Rota", value: t.rota, color: C.cinzaChumbo }] : []),
          ]} />;
        })()}
      </div>

      {/* ═══ DONUT POR TIPO + RESUMO ═══ */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 300px", gap: 16, marginBottom: 24 }}>
        <div style={{ ...cardStyle(), padding: 20 }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 16 }}>
            <div>
              <span style={{ fontSize: 13, fontWeight: 700, color: C.azulEscuro, fontFamily: Fn.title, display: "block" }}>Tarefas por Tipo</span>
              <span style={{ fontSize: 10, color: C.cinzaChumbo }}>Clique para filtrar · {totalTasks} tarefas</span>
            </div>
            <div style={{ width: 30, height: 30, borderRadius: 8, background: `${C.azulProfundo}0A`, display: "flex", alignItems: "center", justifyContent: "center" }}>{Ic.chart(14, C.azulProfundo)}</div>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 20, justifyContent: "center" }}>
            <Donut segments={donutData} hov={hovDonut} setHov={setHovDonut}
              onClick={(key) => {
                const label = TIPO_LABELS[key];
                setF("tipo", filter.tipo === label ? null : label);
              }}
              center={hovDonut !== null ? <><span style={{ fontSize: 16, fontWeight: 800, fontFamily: Fn.title, color: donutData[hovDonut]?.color, lineHeight: 1 }}>{donutData[hovDonut]?.value}</span><span style={{ fontSize: 8, color: C.cinzaChumbo }}>{Math.round((donutData[hovDonut]?.value || 0) / totalTasks * 100)}%</span></> : <><span style={{ fontSize: 20, fontWeight: 800, fontFamily: Fn.title, color: C.azulEscuro, lineHeight: 1 }}>{totalTasks}</span><span style={{ fontSize: 9, color: C.cinzaChumbo }}>total</span></>} />
            <div style={{ display: "flex", flexDirection: "column", gap: 5 }}>
              {donutData.map((s, i) => (
                <div key={s.key} onClick={() => { const label = TIPO_LABELS[s.key]; setF("tipo", filter.tipo === label ? null : label); }} style={{ display: "flex", alignItems: "center", gap: 8, cursor: "pointer", opacity: filter.tipo && filter.tipo !== TIPO_LABELS[s.key] ? 0.3 : 1, transition: "opacity .15s" }} onMouseEnter={() => setHovDonut(i)} onMouseLeave={() => setHovDonut(null)}>
                  <div style={{ width: 8, height: 8, borderRadius: "50%", background: s.color, flexShrink: 0 }} />
                  <span style={{ fontSize: 11, color: C.cinzaEscuro, fontFamily: Fn.body }}>{s.label}</span>
                  <span style={{ fontSize: 11, fontWeight: 700, color: s.color, fontFamily: Fn.mono, marginLeft: "auto" }}>{s.value}</span>
                </div>))}
            </div>
          </div>
        </div>

        <div style={{ ...cardStyle(), padding: 20 }}>
          <span style={{ fontSize: 13, fontWeight: 700, color: C.azulEscuro, fontFamily: Fn.title, display: "block", marginBottom: 16 }}>Resumo</span>
          {[
            { label: "Total tarefas", value: allTasks.length, color: C.azulProfundo },
            { label: "Peso total", value: formatKg(pesoTotal), color: C.verdeFloresta },
            { label: "Coletas agendadas", value: allTasks.filter(t => t.tipo === "coleta").length, color: TIPO_ACCENT.coleta },
            { label: "Entregas prontas", value: allTasks.filter(t => t.tipo === "expedicao").length, color: TIPO_ACCENT.expedicao },
            { label: "Costureira em trânsito", value: allTasks.filter(t => t.tipo === "costureira").length, color: TIPO_ACCENT.costureira },
            { label: "Repanol em trânsito", value: allTasks.filter(t => t.tipo === "repanol").length, color: TIPO_ACCENT.repanol },
            { label: "Tarefas urgentes", value: allTasks.filter(t => t.prioridade === "urgente").length, color: C.danger },
          ].map((r, i) => (
            <div key={i} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "6px 0", borderBottom: `1px solid ${C.cardBorder}` }}>
              <span style={{ fontSize: 12, color: C.cinzaEscuro }}>{r.label}</span>
              <span style={{ fontSize: 12, fontWeight: 700, color: r.color, fontFamily: Fn.mono }}>{r.value}</span>
            </div>))}
        </div>
      </div>

      {taskSelecionada && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,.42)", zIndex: 999, display: "flex", alignItems: "center", justifyContent: "center", padding: 16 }}>
          <div style={{ width: "100%", maxWidth: 560, background: C.cardBg, border: `1px solid ${C.cardBorder}`, borderRadius: 12, boxShadow: "0 12px 36px rgba(0,0,0,.24)" }}>
            <div style={{ padding: "14px 18px", borderBottom: `1px solid ${C.cardBorder}`, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
              <span style={{ fontSize: 14, fontWeight: 700, color: C.azulEscuro, fontFamily: Fn.title }}>Atribuir Serviço</span>
              <button onClick={() => setTaskSelecionada(null)} style={{ border: "none", background: "transparent", color: C.cinzaChumbo, fontWeight: 700, cursor: "pointer" }}>Fechar</button>
            </div>
            <div style={{ padding: 18 }}>
              <div style={{ marginBottom: 12, fontSize: 12, color: C.cinzaEscuro }}>
                <strong>{taskSelecionada.destino}</strong> · {TIPO_LABELS[taskSelecionada.tipo]} · {taskSelecionada.rota || "sem rota"}
              </div>
              <div style={{ display: "grid", gap: 8, marginBottom: 12 }}>
                {[
                  { id: "saida_rota", label: "Saida daquela rota" },
                  { id: "ida_costureira", label: "Ida para costureira" },
                  { id: "busca_coleta", label: "Busca da coleta" },
                ].map((opt) => (
                  <button
                    key={opt.id}
                    onClick={() => setTipoAtribuicao(opt.id as AtribuicaoTipo)}
                    style={{
                      textAlign: "left",
                      height: 34,
                      padding: "0 12px",
                      borderRadius: 8,
                      border: `1px solid ${tipoAtribuicao === opt.id ? C.azulProfundo : C.cardBorder}`,
                      background: tipoAtribuicao === opt.id ? `${C.azulProfundo}10` : C.cardBg,
                      color: tipoAtribuicao === opt.id ? C.azulProfundo : C.cinzaEscuro,
                      fontSize: 12,
                      fontWeight: 600,
                      cursor: "pointer",
                    }}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
              <textarea
                value={obsAtribuicao}
                onChange={(e) => setObsAtribuicao(e.target.value)}
                placeholder="Observação da saída (opcional)"
                style={{ width: "100%", minHeight: 84, resize: "vertical", borderRadius: 8, border: `1px solid ${C.cardBorder}`, padding: 10, fontSize: 12, fontFamily: Fn.body, color: C.cinzaEscuro, background: C.cardBg }}
              />
              <div style={{ marginTop: 12, display: "flex", justifyContent: "flex-end", gap: 8 }}>
                <button onClick={() => setTaskSelecionada(null)} style={{ height: 32, padding: "0 14px", borderRadius: 7, border: `1px solid ${C.cardBorder}`, background: C.cardBg, color: C.cinzaChumbo, fontSize: 12, fontWeight: 600, cursor: "pointer" }}>Cancelar</button>
                <button onClick={confirmarAtribuicao} style={{ height: 32, padding: "0 14px", borderRadius: 7, border: `1px solid ${C.azulProfundo}`, background: C.azulProfundo, color: C.branco, fontSize: 12, fontWeight: 700, cursor: "pointer" }}>Confirmar atribuicao</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
