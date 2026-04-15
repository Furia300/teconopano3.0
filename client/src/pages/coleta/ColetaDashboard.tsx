import { useState, useMemo, useEffect } from "react";

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

/* ─── SVG Icons (padrão DashboardAdmin) ─── */
const Ic = {
  truck: (s: number, c: string) => <svg width={s} height={s} viewBox="0 0 20 20" fill="none"><rect x="1" y="6" width="11" height="9" rx="1.5" stroke={c} strokeWidth="1.4"/><path d="M12 9h4l2.5 3v3h-6.5" stroke={c} strokeWidth="1.4" strokeLinejoin="round"/><circle cx="5" cy="16" r="1.5" stroke={c} strokeWidth="1.3"/><circle cx="15.5" cy="16" r="1.5" stroke={c} strokeWidth="1.3"/></svg>,
  scale: (s: number, c: string) => <svg width={s} height={s} viewBox="0 0 20 20" fill="none"><path d="M10 2v16M3 6l7-2 7 2M3 6l2 6h-4L3 6zM17 6l2 6h-4L17 6z" stroke={c} strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round"/></svg>,
  factory: (s: number, c: string) => <svg width={s} height={s} viewBox="0 0 20 20" fill="none"><path d="M2 18V8l4-3v5l4-3v5l4-3v8H2z" stroke={c} strokeWidth="1.4" strokeLinejoin="round"/><rect x="14" y="2" width="4" height="16" rx="1" stroke={c} strokeWidth="1.4"/></svg>,
  calendario: (s: number, c: string) => <svg width={s} height={s} viewBox="0 0 20 20" fill="none"><rect x="2" y="4" width="16" height="14" rx="2" stroke={c} strokeWidth="1.5"/><path d="M2 8h16M6 2v4M14 2v4" stroke={c} strokeWidth="1.5" strokeLinecap="round"/></svg>,
};

/* ─── Helpers ─── */
function formatKg(n: number) { return n >= 1000 ? `${(n / 1000).toFixed(1)}t` : `${Math.round(n)} kg`; }
function spark(seed: number, trend: "up" | "down") {
  const pts: number[] = []; let v = 40 + (seed % 30);
  for (let i = 0; i < 12; i++) { const d = trend === "up" ? 1.4 : -1.2; const n = Math.sin(seed * 0.31 + i * 0.7) * 8; v = Math.min(92, Math.max(8, v + d + n * 0.15)); pts.push(Math.round(v)); }
  return pts;
}
const MONTHS = ["Jan", "Fev", "Mar", "Abr", "Mai", "Jun", "Jul", "Ago", "Set", "Out", "Nov", "Dez"];

const STATUS_LABELS: Record<string, string> = { pendente: "Pendente", agendado: "Agendado", em_rota: "Em rota", recebido: "Recebido", em_separacao: "Em separação", separado: "Separado", em_producao: "Em produção", finalizado: "Concluído", cancelado: "Cancelado" };

/* ─── Donut ─── */
function Donut({ segments, size = 130, strokeW = 14, center, hov, setHov, onClick }: {
  segments: { label: string; value: number; color: string; key: string }[];
  size?: number; strokeW?: number; center: React.ReactNode;
  hov: number | null; setHov: (i: number | null) => void;
  onClick?: (key: string) => void;
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
              strokeLinecap="round" style={{ transition: "all .15s", cursor: onClick ? "pointer" : "default" }}
              onClick={() => onClick?.(s.key)}
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

/* ─── Tooltip flutuante (padrão DS FIPS DashboardDemo) ─── */
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
  const [filterStatus, setFilterStatus] = useState<string | null>(null);

  const filtered = useMemo(() => {
    if (!filterStatus) return coletas;
    return coletas.filter(c => c.status === filterStatus);
  }, [coletas, filterStatus]);

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

      {/* ═══ FILTER BADGES ═══ */}
      {filterStatus && (
        <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 16 }}>
          <span style={{ fontSize: 11, color: C.textMuted }}>Filtrado por:</span>
          <span style={{ padding: "3px 10px", fontSize: 11, fontWeight: 600, color: C.azulProfundo, background: `${C.azulProfundo}10`, borderRadius: 6 }}>{STATUS_LABELS[filterStatus]}</span>
          <button onClick={() => setFilterStatus(null)} style={{ fontSize: 10, color: C.cinzaChumbo, background: C.bg, border: `1px solid ${C.cardBorder}`, borderRadius: 6, padding: "3px 8px", cursor: "pointer" }}>Limpar</button>
        </div>
      )}

      {/* ═══ KPIs ═══ */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 16, marginBottom: 24 }}>
        {kpis.map((k, i) => {
          const max = Math.max(...k.pts), min = Math.min(...k.pts);
          const sw2 = 200, sh = 40;
          const points = k.pts.map((v, j) => ({ x: (j / (k.pts.length - 1)) * sw2, y: sh - ((v - min) / (max - min || 1)) * (sh - 8) + 4 }));
          const line = points.map(p => `${p.x},${p.y}`).join(" ");
          const uid = `ck${i}`;
          const hovPt = hovKpiPt && hovKpiPt.c === i ? hovKpiPt.p : -1;
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
              <div style={{ overflow: "hidden", borderRadius: "0 0 12px 24px", marginLeft: -1, marginRight: -1, marginBottom: -1 }}>
                <svg width="100%" height={sh + 16} viewBox={`-2 -12 ${sw2 + 4} ${sh + 28}`} preserveAspectRatio="none" style={{ display: "block" }} onMouseLeave={() => setHovKpiPt(null)}>
                  <defs><linearGradient id={`g${uid}`} x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor={k.color} stopOpacity=".18" /><stop offset="100%" stopColor={k.color} stopOpacity="0" /></linearGradient></defs>
                  <polygon points={`0,${sh} ${line} ${sw2},${sh}`} fill={`url(#g${uid})`} />
                  <polyline points={line} fill="none" stroke={k.color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                  {points.map((p, j) => (
                    <g key={j} onMouseEnter={() => setHovKpiPt({ c: i, p: j })} style={{ cursor: "pointer" }}>
                      <circle cx={p.x} cy={p.y} r="10" fill="transparent" />
                      <circle cx={p.x} cy={p.y} r={hovPt === j ? 4 : 0} fill={k.color} />
                      {hovPt === j && <><text x={p.x} y={p.y - 8} textAnchor="middle" fontSize="9" fontWeight="700" fill={k.color} fontFamily={Fn.mono}>{k.pts[j]}</text><text x={p.x} y={sh + 10} textAnchor="middle" fontSize="7" fill={C.cinzaChumbo} fontFamily={Fn.body}>{MONTHS[j]}</text></>}
                    </g>
                  ))}
                  {points.map((p, j) => j % 2 === 0 && hovPt === -1 ? <text key={`m${j}`} x={p.x} y={sh + 10} textAnchor="middle" fontSize="7" fill={C.textLight} fontFamily={Fn.body}>{MONTHS[j]}</text> : null)}
                </svg>
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
              <span style={{ fontSize: 10, color: C.cinzaChumbo }}>Passe o mouse para detalhes{filterStatus ? " · filtrado" : ""}</span>
            </div>
          </div>
          <div style={{ display: "flex", justifyContent: "center" }}>
            {(() => {
              const bw = 48, gp = 16, chartW = monthlyData.length * (bw + gp) - gp, chartH = 120;
              return (
                <svg width={chartW + 20} height={chartH + 40} viewBox={`-10 -16 ${chartW + 20} ${chartH + 40}`}>
                  <line x1={0} y1={chartH} x2={chartW} y2={chartH} stroke={C.cardBorder} strokeWidth=".5" />
                  {monthlyData.map((m, i) => {
                    const bh = Math.max(6, (m.count / maxMonth) * chartH);
                    const x = i * (bw + gp);
                    const isH = hovBar === i;
                    return (
                      <g key={i} onMouseEnter={() => setHovBar(i)} onMouseLeave={() => setHovBar(-1)} style={{ cursor: "pointer" }}>
                        <rect x={x} y={-16} width={bw} height={chartH + 40} fill="transparent" />
                        <rect x={x} y={chartH - bh} width={bw} height={bh} rx={6} fill={C.azulProfundo} opacity={isH ? 1 : 0.82} style={{ transition: "all .15s" }} />
                        {isH && <rect x={x - 2} y={chartH - bh - 2} width={bw + 4} height={bh + 4} rx={7} fill="none" stroke={C.azulProfundo} strokeWidth="1.5" strokeDasharray="4 2" />}
                        <text x={x + bw / 2} y={chartH - bh - 6} textAnchor="middle" fontSize="11" fontWeight="700" fill={C.azulEscuro} fontFamily={Fn.mono}>{m.count}</text>
                        <text x={x + bw / 2} y={chartH + 16} textAnchor="middle" fontSize="9" fill={C.cinzaChumbo} fontFamily={Fn.body}>{m.label}</text>
                      </g>
                    );
                  })}
                </svg>
              );
            })()}
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
              onClick={(key) => setFilterStatus(f => f === key ? null : key)}
              center={
                hovStatus !== null
                  ? <><span style={{ fontSize: 16, fontWeight: 800, fontFamily: Fn.title, color: statusData[hovStatus]?.color, lineHeight: 1 }}>{statusData[hovStatus]?.value}</span><span style={{ fontSize: 8, color: C.cinzaChumbo }}>{Math.round((statusData[hovStatus]?.value || 0) / total * 100)}%</span></>
                  : <><span style={{ fontSize: 20, fontWeight: 800, fontFamily: Fn.title, color: C.azulEscuro, lineHeight: 1 }}>{total}</span><span style={{ fontSize: 9, color: C.cinzaChumbo }}>total</span></>
              }
            />
            <div style={{ display: "flex", flexDirection: "column", gap: 5 }}>
              {statusData.map((s, i) => (
                <div key={s.key} onClick={() => setFilterStatus(f => f === s.key ? null : s.key)}
                  style={{ display: "flex", alignItems: "center", gap: 8, cursor: "pointer", opacity: filterStatus && filterStatus !== s.key ? 0.3 : 1, transition: "opacity .15s" }}
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
