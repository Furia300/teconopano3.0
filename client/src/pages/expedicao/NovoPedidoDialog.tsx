import { useState, useEffect, useMemo, useRef, useCallback } from "react";
import { toast } from "sonner";
import {
  Send, Building2, Box, Warehouse, CalendarDays, Clock,
  Map as MapIcon, Hash, AlertCircle, Lock, CheckCircle2,
  Factory, Check, Search, MapPin, Maximize2, Minimize2,
  ChevronLeft, ChevronRight, Palette, Ruler, X, Repeat,
} from "lucide-react";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Field, FieldLabel, FieldHint } from "@/components/ui/field";

/* ─── Types ─── */
interface Cliente {
  id: string;
  codigoLegado?: string | number | null;
  nomeFantasia: string;
  razaoSocial?: string | null;
  cnpj?: string | null;
  endereco?: string | null;
  cidade?: string | null;
  estado?: string | null;
  empresa?: string | null;
  observacao?: string | null;
}
interface Produto {
  id: string;
  nome?: string | null;
  descricao: string;
  cor?: string | null;
  medida?: string | null;
  tipoMaterial?: string | null;
  pesoMedio?: number | null;
  observacao?: string | null;
}
interface Disponibilidade {
  kiloTotal: number;
  unidadeTotal: number;
  reservado: number;
  unidadeDisponivel: number;
}

interface NovoPedidoDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
  editingPedido?: any | null;
}

/* ─── Helpers ─── */
function clienteLabel(c: Cliente) {
  const parts = [c.nomeFantasia];
  if (c.estado) parts.push(c.estado);
  if (c.cidade) parts.push(c.cidade);
  return parts.join(" — ");
}

/* ─── Cor dot ─── */
const COR_HEX: Record<string, string> = {
  branco: "#FFFFFF", preto: "#1A1A1A", azul: "#2563EB", vermelho: "#DC2626",
  verde: "#16A34A", cinza: "#6B7280", variado: "conic-gradient(#DC2626,#2563EB,#16A34A,#FDC24E,#DC2626)",
  amarelo: "#EAB308", rosa: "#EC4899", laranja: "#F97316", escuro: "#374151",
};
function CorDot({ cor }: { cor?: string | null }) {
  if (!cor) return null;
  const c = COR_HEX[cor.toLowerCase()];
  if (!c) return null;
  const isGrad = c.includes("gradient");
  return <span style={{ width: 8, height: 8, borderRadius: "50%", flexShrink: 0, background: isGrad ? undefined : c, backgroundImage: isGrad ? c : undefined, border: cor.toLowerCase() === "branco" ? "1px solid var(--fips-border)" : "none" }} />;
}

/* ─── Sizes ─── */
type DialogSize = "normal" | "grande" | "tela-cheia";
const SIZES: Record<DialogSize, { maxW: string; maxH: string; label: string; ddH: number; ddMax: number }> = {
  normal:       { maxW: "max-w-xl",      maxH: "max-h-[85vh]", label: "Normal",     ddH: 260, ddMax: 12 },
  grande:       { maxW: "max-w-3xl",     maxH: "max-h-[90vh]", label: "Grande",     ddH: 360, ddMax: 20 },
  "tela-cheia": { maxW: "max-w-[92vw]",  maxH: "max-h-[95vh]", label: "Tela cheia", ddH: 500, ddMax: 30 },
};
const SIZE_ORDER: DialogSize[] = ["normal", "grande", "tela-cheia"];

const ROTAS_LETRAS = "ABCDEFGHIJKLMNOPQRS".split("");
const ROTAS_ESPECIAIS = ["Rota Spot", "Rota Retire Aqui", "Rota VLI"];
const FREQUENCIAS = [
  { value: "", label: "Nenhuma" },
  { value: "3-dias", label: "A cada 3 dias" },
  { value: "semanal", label: "Semanal" },
  { value: "quinzenal", label: "Quinzenal" },
  { value: "mensal", label: "Mensal" },
  { value: "personalizado", label: "Personalizar" },
];

const EMPTY_FORM = {
  clienteId: "",
  clienteNome: "",
  produtoId: "",
  produtoNome: "",
  galpao: "Vicente",
  qtdePedido: "",
  rota: "A",
  prioridade: "Normal",
  periodicidade: "",
  dataEntrega: "",
  horaEntrega: "",
  periodoInicio: "",
  periodoFim: "",
  medidaCustom: "",
  observacaoEscritorio: "",
  observacaoGalpao: "",
};

import {
  gerarDatasRecorrentesDiasUteis,
  isDiaUtil,
  isFeriado,
  isFimDeSemana,
  nomeFeriado,
  proximoDiaUtil,
} from "@/lib/diasUteis";

function formatDateLong(ds: string) {
  const d = new Date(ds + "T12:00:00");
  const dia = d.toLocaleDateString("pt-BR", { weekday: "short", day: "2-digit", month: "short", year: "numeric" });
  return dia.charAt(0).toUpperCase() + dia.slice(1);
}

function AgendamentoResumo({ datas, tipo }: { datas: string[]; tipo: string }) {
  if (datas.length === 0) return null;
  const labels: Record<string, string> = { "3-dias": "A cada 3 dias", semanal: "Semanal", quinzenal: "Quinzenal", mensal: "Mensal" };
  return (
    <div className="mt-3 rounded-xl overflow-hidden" style={{
      border: "1px solid var(--fips-border)",
      background: "var(--fips-surface)",
    }}>
      <div className="px-3 py-2 flex items-center justify-between" style={{
        background: "linear-gradient(135deg, rgba(0,75,155,0.08), rgba(0,75,155,0.02))",
        borderBottom: "1px solid var(--fips-border)",
      }}>
        <div className="flex items-center gap-2">
          <CalendarDays size={13} style={{ color: "var(--fips-primary)" }} />
          <span className="text-[11px] font-bold" style={{ color: "var(--fips-fg)" }}>
            {labels[tipo] || tipo} — {datas.length} entregas
          </span>
        </div>
        <span className="text-[9px] px-2 py-0.5 rounded-full font-bold" style={{
          background: "var(--fips-primary)", color: "#fff",
        }}>Recorrente</span>
      </div>
      <div className="max-h-[200px] overflow-y-auto">
        {datas.map((ds, i) => {
          const isFirst = i === 0;
          const isLast = i === datas.length - 1;
          return (
            <div key={ds} className="flex items-center gap-3 px-3 py-2 transition-colors"
              style={{
                borderBottom: isLast ? "none" : "1px solid var(--fips-border)",
                background: isFirst ? "rgba(0,75,155,0.04)" : "transparent",
              }}>
              {/* Timeline dot + line */}
              <div className="flex flex-col items-center" style={{ width: 16 }}>
                <div style={{
                  width: 10, height: 10, borderRadius: "50%",
                  background: isFirst ? "var(--fips-primary)" : "var(--fips-border)",
                  border: isFirst ? "2px solid var(--fips-primary)" : "2px solid var(--fips-border)",
                  boxShadow: isFirst ? "0 0 8px rgba(0,75,155,0.3)" : "none",
                }} />
                {!isLast && <div style={{ width: 2, height: 16, background: "var(--fips-border)", marginTop: 2 }} />}
              </div>
              <div className="flex-1 flex items-center justify-between">
                <span className="text-[11px] font-semibold" style={{ color: isFirst ? "var(--fips-primary)" : "var(--fips-fg)" }}>
                  {formatDateLong(ds)}
                </span>
                <span className="text-[9px] font-bold tabular-nums px-1.5 py-0.5 rounded" style={{
                  background: isFirst ? "rgba(0,75,155,0.08)" : "var(--fips-surface-muted)",
                  color: isFirst ? "var(--fips-primary)" : "var(--fips-fg-muted)",
                  fontFamily: "'Fira Code', monospace",
                }}>#{i + 1}</span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════
   MINI RANGE CALENDAR — estilo booking/hotel
   ═══════════════════════════════════════════════════════════ */
function RangeCalendar({ start, end, onChange }: {
  start: string; end: string;
  onChange: (s: string, e: string) => void;
}) {
  const [viewMonth, setViewMonth] = useState(() => {
    const d = start ? new Date(start + "T12:00:00") : new Date();
    return { year: d.getFullYear(), month: d.getMonth() };
  });
  const [selecting, setSelecting] = useState<"start" | "end">("start");

  const daysInMonth = new Date(viewMonth.year, viewMonth.month + 1, 0).getDate();
  const firstDow = new Date(viewMonth.year, viewMonth.month, 1).getDay();
  const monthName = new Date(viewMonth.year, viewMonth.month).toLocaleDateString("pt-BR", { month: "long", year: "numeric" });

  const prevMonth = () => setViewMonth((v) => v.month === 0 ? { year: v.year - 1, month: 11 } : { ...v, month: v.month - 1 });
  const nextMonth = () => setViewMonth((v) => v.month === 11 ? { year: v.year + 1, month: 0 } : { ...v, month: v.month + 1 });

  const toStr = (d: number) => `${viewMonth.year}-${String(viewMonth.month + 1).padStart(2, "0")}-${String(d).padStart(2, "0")}`;

  const handleClick = (day: number) => {
    const ds = toStr(day);
    if (!isDiaUtil(ds)) return; // bloqueia fds e feriados
    if (selecting === "start") {
      onChange(ds, "");
      setSelecting("end");
    } else {
      if (ds < start) { onChange(ds, ""); setSelecting("end"); }
      else { onChange(start, ds); setSelecting("start"); }
    }
  };

  const isInRange = (day: number) => {
    if (!start || !end) return false;
    const ds = toStr(day);
    return ds >= start && ds <= end;
  };
  const isStart = (day: number) => toStr(day) === start;
  const isEnd = (day: number) => toStr(day) === end;
  const today = new Date().toISOString().slice(0, 10);
  const isToday = (day: number) => toStr(day) === today;
  const isPast = (day: number) => toStr(day) < today;
  const isDisabled = (day: number) => {
    const ds = toStr(day);
    return isPast(day) || !isDiaUtil(ds);
  };
  const getFeriadoName = (day: number) => nomeFeriado(toStr(day));

  const daysBetween = start && end ? Math.round((new Date(end).getTime() - new Date(start).getTime()) / 86400000) : 0;
  // Conta apenas dias úteis no range
  const diasUteisNoRange = useMemo(() => {
    if (!start || !end) return 0;
    let count = 0;
    const d = new Date(start + "T12:00:00");
    const endD = new Date(end + "T12:00:00");
    while (d <= endD) {
      if (isDiaUtil(d.toISOString().slice(0, 10))) count++;
      d.setDate(d.getDate() + 1);
    }
    return count;
  }, [start, end]);
  const formatBR = (s: string) => s ? new Date(s + "T12:00:00").toLocaleDateString("pt-BR", { day: "2-digit", month: "short", year: "numeric" }) : "—";

  return (
    <div className="rounded-2xl overflow-hidden" style={{
      background: "var(--fips-surface)",
      border: "1px solid var(--fips-border)",
      boxShadow: "0 4px 24px rgba(0,75,155,0.08)",
    }}>
      {/* Selected range display */}
      <div className="flex items-center justify-between px-4 py-3" style={{
        background: "linear-gradient(135deg, rgba(0,75,155,0.06), rgba(0,75,155,0.02))",
        borderBottom: "1px solid var(--fips-border)",
      }}>
        <div className="flex items-center gap-3">
          <div className="flex flex-col items-center">
            <span className="text-[8px] font-bold uppercase tracking-wider" style={{ color: "var(--fips-primary)" }}>Início</span>
            <span className="text-[11px] font-bold" style={{ color: start ? "var(--fips-fg)" : "var(--fips-fg-muted)" }}>{formatBR(start)}</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div style={{ width: 20, height: 2, background: "var(--fips-primary)", borderRadius: 1 }} />
            {daysBetween > 0 && <span className="text-[9px] font-bold px-1.5 py-0.5 rounded-full" style={{
              background: "var(--fips-primary)", color: "#fff",
            }}>{diasUteisNoRange} úteis</span>}
            <div style={{ width: 20, height: 2, background: "var(--fips-primary)", borderRadius: 1 }} />
          </div>
          <div className="flex flex-col items-center">
            <span className="text-[8px] font-bold uppercase tracking-wider" style={{ color: "var(--fips-primary)" }}>Fim</span>
            <span className="text-[11px] font-bold" style={{ color: end ? "var(--fips-fg)" : "var(--fips-fg-muted)" }}>{formatBR(end)}</span>
          </div>
        </div>
        <span className="text-[9px] px-2 py-1 rounded-lg" style={{
          background: selecting === "start" ? "rgba(0,75,155,0.1)" : "rgba(0,198,76,0.1)",
          color: selecting === "start" ? "var(--fips-primary)" : "var(--fips-success)",
          fontWeight: 700,
        }}>
          Selecione {selecting === "start" ? "início" : "fim"}
        </span>
      </div>

      {/* Month navigation */}
      <div className="flex items-center justify-between px-4 py-2.5">
        <button type="button" onClick={prevMonth} style={{ cursor: "pointer", color: "var(--fips-fg-muted)" }}><ChevronLeft size={16} /></button>
        <span className="text-[12px] font-bold capitalize" style={{ color: "var(--fips-fg)" }}>{monthName}</span>
        <button type="button" onClick={nextMonth} style={{ cursor: "pointer", color: "var(--fips-fg-muted)" }}><ChevronRight size={16} /></button>
      </div>

      {/* Day headers */}
      <div className="grid grid-cols-7 px-3">
        {["D", "S", "T", "Q", "Q", "S", "S"].map((d, i) => (
          <div key={i} className="text-center py-1" style={{ fontSize: 9, fontWeight: 700, color: "var(--fips-fg-muted)", letterSpacing: "0.05em" }}>{d}</div>
        ))}
      </div>

      {/* Days grid */}
      <div className="grid grid-cols-7 gap-y-0.5 px-3 pb-2">
        {Array.from({ length: firstDow }, (_, i) => <div key={`e${i}`} />)}
        {Array.from({ length: daysInMonth }, (_, i) => {
          const day = i + 1;
          const ds = toStr(day);
          const inRange = isInRange(day);
          const sStart = isStart(day);
          const sEnd = isEnd(day);
          const sToday = isToday(day);
          const disabled = isDisabled(day);
          const fds = isFimDeSemana(ds);
          const fer = isFeriado(ds);
          const ferName = getFeriadoName(day);

          return (
            <button key={day} type="button" onClick={() => !disabled && handleClick(day)}
              className="relative flex items-center justify-center transition-all"
              title={ferName || (fds ? "Fim de semana" : undefined)}
              style={{
                width: "100%", height: 32, fontSize: 11, fontWeight: (sStart || sEnd) ? 800 : inRange ? 600 : 500,
                borderRadius: sStart ? "16px 0 0 16px" : sEnd ? "0 16px 16px 0" : (sStart && sEnd) ? 16 : 0,
                background: (sStart || sEnd)
                  ? "var(--fips-primary)"
                  : inRange
                    ? "rgba(0,75,155,0.12)"
                    : fer
                      ? "rgba(220,38,38,0.06)"
                      : "transparent",
                color: (sStart || sEnd)
                  ? "#fff"
                  : disabled
                    ? fds || fer ? "rgba(220,38,38,0.35)" : "var(--fips-fg-muted)"
                    : inRange
                      ? "var(--fips-primary)"
                      : "var(--fips-fg)",
                cursor: disabled ? "default" : "pointer",
                opacity: disabled && !fer && !fds ? 0.4 : 1,
                textDecoration: fds || fer ? "line-through" : "none",
              }}>
              {day}
              {sToday && !sStart && !sEnd && (
                <span style={{ position: "absolute", bottom: 2, left: "50%", transform: "translateX(-50%)", width: 4, height: 4, borderRadius: "50%", background: "var(--fips-primary)" }} />
              )}
              {fer && !sStart && !sEnd && (
                <span style={{ position: "absolute", top: 1, right: 2, width: 4, height: 4, borderRadius: "50%", background: "#DC2626" }} />
              )}
            </button>
          );
        })}
      </div>

      {/* Legenda */}
      <div className="flex items-center gap-4 px-3 pb-3 text-[9px]" style={{ color: "var(--fips-fg-muted)" }}>
        <span className="flex items-center gap-1">
          <span style={{ width: 4, height: 4, borderRadius: "50%", background: "#DC2626" }} />
          Feriado
        </span>
        <span className="flex items-center gap-1">
          <span style={{ textDecoration: "line-through", color: "rgba(220,38,38,0.35)" }}>00</span>
          Fds / Feriado
        </span>
        <span className="flex items-center gap-1">
          <span style={{ width: 4, height: 4, borderRadius: "50%", background: "var(--fips-primary)" }} />
          Hoje
        </span>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════
   INSIGHTS DO CLIENTE — histórico, produtos favoritos, periodicidade
   ═══════════════════════════════════════════════════════════ */
interface HistoricoPedido {
  id: string;
  clienteId?: string | null;
  nomeFantasia?: string | null;
  descricaoProduto?: string | null;
  tipoMaterial?: string | null;
  cor?: string | null;
  qtdePedido?: number | null;
  kilo?: number | null;
  periodicidade?: string | null;
  createdAt?: string | null;
  statusEntrega?: string | null;
}

function ClienteInsights({ clienteId, historico }: { clienteId: string; historico: HistoricoPedido[] }) {
  const pedidosCliente = useMemo(() =>
    historico.filter((h) => h.clienteId === clienteId).sort((a, b) => (b.createdAt || "").localeCompare(a.createdAt || "")),
    [historico, clienteId],
  );

  if (pedidosCliente.length === 0) {
    return (
      <div className="rounded-xl px-4 py-3 text-xs flex items-center gap-2" style={{
        background: "linear-gradient(135deg, rgba(0,75,155,0.04), rgba(0,75,155,0.01))",
        border: "1px solid var(--fips-border)",
      }}>
        <span style={{ fontSize: 16 }}>✨</span>
        <span style={{ color: "var(--fips-fg-muted)" }}>Primeiro pedido deste cliente — sem histórico anterior</span>
      </div>
    );
  }

  // Produtos mais pedidos
  const prodCount: Record<string, { nome: string; count: number; lastDate: string }> = {};
  for (const p of pedidosCliente) {
    const key = p.descricaoProduto || p.tipoMaterial || "Outro";
    if (!prodCount[key]) prodCount[key] = { nome: key, count: 0, lastDate: "" };
    prodCount[key].count++;
    if ((p.createdAt || "") > prodCount[key].lastDate) prodCount[key].lastDate = p.createdAt || "";
  }
  const topProdutos = Object.values(prodCount).sort((a, b) => b.count - a.count).slice(0, 3);

  // Periodicidade detectada
  const datas = pedidosCliente.map((p) => new Date(p.createdAt || "").getTime()).filter(Boolean).sort((a, b) => a - b);
  let mediaDias = 0;
  if (datas.length >= 2) {
    const diffs: number[] = [];
    for (let i = 1; i < datas.length; i++) diffs.push((datas[i] - datas[i - 1]) / 86400000);
    mediaDias = Math.round(diffs.reduce((a, b) => a + b, 0) / diffs.length);
  }
  let freqSugerida = "";
  if (mediaDias > 0) {
    if (mediaDias <= 5) freqSugerida = "A cada 3 dias";
    else if (mediaDias <= 10) freqSugerida = "Semanal";
    else if (mediaDias <= 20) freqSugerida = "Quinzenal";
    else if (mediaDias <= 45) freqSugerida = "Mensal";
    else freqSugerida = `~${mediaDias} dias`;
  }

  const ultimoPedido = pedidosCliente[0];
  const diasDesdeUltimo = ultimoPedido?.createdAt
    ? Math.round((Date.now() - new Date(ultimoPedido.createdAt).getTime()) / 86400000)
    : null;

  return (
    <div className="rounded-xl overflow-hidden" style={{
      border: "1px solid var(--fips-border)",
      background: "linear-gradient(135deg, rgba(0,75,155,0.03), rgba(0,198,76,0.02))",
    }}>
      {/* Header */}
      <div className="px-3 py-2 flex items-center justify-between" style={{
        borderBottom: "1px solid var(--fips-border)",
        background: "rgba(0,75,155,0.04)",
      }}>
        <div className="flex items-center gap-1.5">
          <span style={{ fontSize: 13 }}>💡</span>
          <span className="text-[10px] font-bold uppercase tracking-wider" style={{ color: "var(--fips-primary)" }}>
            Insights do cliente
          </span>
        </div>
        <span className="text-[9px] font-bold px-2 py-0.5 rounded-full" style={{
          background: "rgba(0,75,155,0.08)", color: "var(--fips-primary)",
        }}>{pedidosCliente.length} pedidos</span>
      </div>

      <div className="px-3 py-2.5 space-y-2.5">
        {/* Último pedido + tempo */}
        <div className="flex items-center gap-2 text-[11px]">
          <Clock size={11} style={{ color: "var(--fips-fg-muted)", flexShrink: 0 }} />
          <span style={{ color: "var(--fips-fg-muted)" }}>Último pedido:</span>
          <span className="font-semibold" style={{ color: diasDesdeUltimo != null && diasDesdeUltimo > 30 ? "var(--fips-danger)" : "var(--fips-fg)" }}>
            {diasDesdeUltimo != null ? `há ${diasDesdeUltimo} dias` : "—"}
          </span>
          {diasDesdeUltimo != null && diasDesdeUltimo > 30 && (
            <span className="text-[9px] px-1.5 py-0.5 rounded" style={{ background: "rgba(220,38,38,0.08)", color: "var(--fips-danger)", fontWeight: 700 }}>
              Atrasado
            </span>
          )}
        </div>

        {/* Frequência detectada */}
        {freqSugerida && (
          <div className="flex items-center gap-2 text-[11px]">
            <Repeat size={11} style={{ color: "var(--fips-primary)", flexShrink: 0 }} />
            <span style={{ color: "var(--fips-fg-muted)" }}>Frequência habitual:</span>
            <span className="font-bold" style={{ color: "var(--fips-primary)" }}>{freqSugerida}</span>
            {mediaDias > 0 && <span className="text-[9px]" style={{ color: "var(--fips-fg-muted)" }}>({mediaDias}d média)</span>}
          </div>
        )}

        {/* Top produtos */}
        {topProdutos.length > 0 && (
          <div>
            <div className="flex items-center gap-1.5 mb-1.5">
              <Box size={11} style={{ color: "var(--fips-success)", flexShrink: 0 }} />
              <span className="text-[10px] font-bold uppercase tracking-wider" style={{ color: "var(--fips-fg-muted)" }}>Produtos favoritos</span>
            </div>
            <div className="flex flex-wrap gap-1.5">
              {topProdutos.map((p) => (
                <span key={p.nome} className="inline-flex items-center gap-1 px-2 py-1 rounded-lg text-[10px]" style={{
                  background: "var(--fips-surface)",
                  border: "1px solid var(--fips-border)",
                  color: "var(--fips-fg)",
                }}>
                  <span className="font-semibold truncate max-w-[120px]">{p.nome}</span>
                  <span className="font-bold tabular-nums" style={{ color: "var(--fips-primary)", fontFamily: "'Fira Code',monospace" }}>×{p.count}</span>
                </span>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════
   MAIN COMPONENT
   ═══════════════════════════════════════════════════════════ */
export function NovoPedidoDialog({ open, onOpenChange, onSuccess, editingPedido }: NovoPedidoDialogProps) {
  const isEditing = !!editingPedido;
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState(EMPTY_FORM);
  const [clientes, setClientes] = useState<Cliente[]>([]);
  const [produtos, setProdutos] = useState<Produto[]>([]);
  const [historico, setHistorico] = useState<HistoricoPedido[]>([]);
  const [disponibilidade, setDisponibilidade] = useState<Disponibilidade | null>(null);
  const [loadingDisp, setLoadingDisp] = useState(false);
  const [searchCli, setSearchCli] = useState("");
  const [searchProd, setSearchProd] = useState("");
  const [showCliList, setShowCliList] = useState(false);
  const [showProdList, setShowProdList] = useState(false);
  const [dialogSize, setDialogSize] = useState<DialogSize>("grande");
  const searchRef = useRef<HTMLInputElement>(null);
  const searchProdRef = useRef<HTMLInputElement>(null);

  const sz = SIZES[dialogSize];
  const isWide = dialogSize !== "normal";

  useEffect(() => {
    if (!open) return;
    setDisponibilidade(null);
    setSearchCli("");
    setSearchProd("");
    setShowCliList(false);
    setShowProdList(false);

    if (editingPedido) {
      setForm({
        clienteId: editingPedido.clienteId || "",
        clienteNome: editingPedido.nomeFantasia || "",
        produtoId: editingPedido.produtoId || "",
        produtoNome: editingPedido.descricaoProduto || "",
        galpao: editingPedido.galpao || "Vicente",
        qtdePedido: editingPedido.qtdePedido ? String(editingPedido.qtdePedido) : "",
        rota: editingPedido.rota || "A",
        prioridade: editingPedido.prioridade || "Normal",
        periodicidade: editingPedido.periodicidade || "",
        dataEntrega: editingPedido.dataEntrega ? editingPedido.dataEntrega.slice(0, 10) : "",
        horaEntrega: editingPedido.dataEntrega ? editingPedido.dataEntrega.slice(11, 16) : "",
        periodoInicio: "",
        periodoFim: "",
        medidaCustom: editingPedido.medida || "",
        observacaoEscritorio: editingPedido.observacaoEscritorio || "",
        observacaoGalpao: editingPedido.observacaoGalpao || "",
      });
    } else {
      setForm(EMPTY_FORM);
    }

    Promise.all([
      fetch("/api/clientes").then((r) => r.json()),
      fetch("/api/produtos").then((r) => r.json()),
      fetch("/api/expedicoes").then((r) => r.json()).catch(() => []),
    ]).then(([cs, ps, hs]) => { setClientes(cs); setProdutos(ps); setHistorico(hs); })
      .catch(() => toast.error("Erro ao carregar listas"));
  }, [open]);

  // R2: disponibilidade
  useEffect(() => {
    if (!form.produtoId || !form.galpao) { setDisponibilidade(null); return; }
    setLoadingDisp(true);
    fetch(`/api/expedicoes/disponibilidade?produtoId=${encodeURIComponent(form.produtoId)}&galpao=${encodeURIComponent(form.galpao)}`)
      .then((r) => r.json()).then(setDisponibilidade)
      .catch(() => setDisponibilidade(null)).finally(() => setLoadingDisp(false));
  }, [form.produtoId, form.galpao]);

  const r2 = useMemo(() => {
    const qtdePedido = Number(form.qtdePedido) || 0;
    const disponivel = disponibilidade?.unidadeDisponivel ?? 0;
    const reservado = disponibilidade?.reservado ?? 0;
    const total = disponibilidade?.unidadeTotal ?? 0;
    return { qtdePedido, total, reservado, disponivel, reservadoNeste: Math.min(qtdePedido, disponivel), aProduzir: Math.max(0, qtdePedido - disponivel) };
  }, [form.qtdePedido, disponibilidade]);

  /* ─── Filter clientes ─── */
  const filteredCli = useMemo(() => {
    const q = searchCli.trim().toLowerCase();
    if (!q) return clientes;
    const qDigits = q.replace(/\D/g, "");
    return clientes.filter((c) =>
      (c.nomeFantasia || "").toLowerCase().includes(q) ||
      (c.razaoSocial || "").toLowerCase().includes(q) ||
      (qDigits && (c.cnpj || "").replace(/\D/g, "").includes(qDigits)) ||
      (qDigits && String(c.codigoLegado || "").includes(qDigits)),
    );
  }, [clientes, searchCli]);

  /* ─── Filter produtos ─── */
  const filteredProd = useMemo(() => {
    const q = searchProd.trim().toLowerCase();
    if (!q) return produtos;
    return produtos.filter((p) =>
      (p.descricao || "").toLowerCase().includes(q) ||
      (p.nome || "").toLowerCase().includes(q) ||
      (p.cor || "").toLowerCase().includes(q) ||
      (p.medida || "").toLowerCase().includes(q) ||
      (p.tipoMaterial || "").toLowerCase().includes(q) ||
      (p.observacao || "").toLowerCase().includes(q),
    );
  }, [produtos, searchProd]);

  const selectCliente = (c: Cliente) => {
    setForm((f) => ({ ...f, clienteId: c.id, clienteNome: clienteLabel(c) }));
    setSearchCli("");
    setShowCliList(false);
  };
  const clearCliente = () => {
    setForm((f) => ({ ...f, clienteId: "", clienteNome: "" }));
    setTimeout(() => searchRef.current?.focus(), 0);
  };
  const selectProduto = (p: Produto) => {
    const label = `${p.descricao || p.nome || ""}${p.cor ? ` · ${p.cor}` : ""}${p.medida ? ` · ${p.medida}` : ""}`;
    setForm((f) => ({ ...f, produtoId: p.id, produtoNome: label }));
    setSearchProd("");
    setShowProdList(false);
  };
  const clearProduto = () => {
    setForm((f) => ({ ...f, produtoId: "", produtoNome: "" }));
    setTimeout(() => searchProdRef.current?.focus(), 0);
  };

  const cycleSize = () => { const i = SIZE_ORDER.indexOf(dialogSize); setDialogSize(SIZE_ORDER[(i + 1) % SIZE_ORDER.length]); };
  const update = (field: string, value: string) => setForm((f) => ({ ...f, [field]: value }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.clienteId) { toast.error("Selecione um cliente"); return; }
    if (!form.produtoId) { toast.error("Selecione um produto"); return; }
    if (!form.qtdePedido || Number(form.qtdePedido) <= 0) { toast.error("Quantidade deve ser maior que zero"); return; }
    setLoading(true);
    try {
      const cliente = clientes.find((c) => c.id === form.clienteId);
      const produto = produtos.find((p) => p.id === form.produtoId);
      let dataEntrega = form.dataEntrega || null;
      if (dataEntrega && form.horaEntrega) dataEntrega = `${dataEntrega}T${form.horaEntrega}`;
      const periodicidade = form.periodicidade === "personalizado"
        ? `${form.periodoInicio}|${form.periodoFim}`
        : form.periodicidade || null;

      // Gerar agendamento JSON
      let agendamento: string | null = null;
      if (form.periodicidade && form.periodicidade !== "personalizado" && form.dataEntrega) {
        const datas = gerarDatasRecorrentesDiasUteis(form.periodicidade, form.dataEntrega, 8);
        agendamento = JSON.stringify({ tipo: form.periodicidade, datas, inicio: datas[0], fim: datas[datas.length - 1] });
      } else if (form.periodicidade === "personalizado" && form.periodoInicio && form.periodoFim) {
        agendamento = JSON.stringify({ tipo: "personalizado", datas: [], inicio: form.periodoInicio, fim: form.periodoFim });
      }

      const payload = {
        clienteId: form.clienteId,
        produtoId: form.produtoId,
        nomeFantasia: cliente?.nomeFantasia,
        cnpj: cliente?.cnpj,
        empresa: cliente?.empresa && cliente.empresa !== "indefinido" ? cliente.empresa : "indefinido",
        descricaoProduto: produto?.descricao || produto?.nome,
        cor: produto?.cor,
        medida: form.medidaCustom || produto?.medida,
        qtdePedido: Number(form.qtdePedido),
        qtdeEstoque: r2.reservadoNeste,
        galpao: form.galpao,
        rota: form.rota,
        prioridade: form.prioridade,
        periodicidade,
        dataEntrega,
        agendamento,
        observacaoEscritorio: form.observacaoEscritorio || null,
        observacaoGalpao: form.observacaoGalpao || null,
      };
      const url = isEditing ? `/api/expedicoes/${editingPedido.id}` : "/api/expedicoes";
      const method = isEditing ? "PUT" : "POST";
      const res = await fetch(url, { method, headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload) });
      if (!res.ok) throw new Error();
      toast.success(isEditing ? "Pedido atualizado!" : "Pedido registrado.");
      onOpenChange(false);
      onSuccess();
    } catch { toast.error("Erro ao criar pedido."); } finally { setLoading(false); }
  };

  const selectedCli = form.clienteId ? clientes.find((c) => c.id === form.clienteId) : null;
  const selectedProd = form.produtoId ? produtos.find((p) => p.id === form.produtoId) : null;

  /* ─── Dropdown item renderer (shared) ─── */
  const renderDropdown = (items: any[], type: "cli" | "prod", maxH: number, maxItems: number) => (
    <div className="absolute z-50 mt-1 w-full overflow-hidden rounded-xl border border-[var(--fips-border)] bg-[var(--fips-surface)]"
      style={{ boxShadow: "0 8px 32px rgba(0,0,0,0.12)", maxHeight: maxH, overflowY: "auto" }}>
      {items.length === 0 ? (
        <div className="px-4 py-5 text-center text-sm text-[var(--fips-fg-muted)]">
          {type === "cli" ? "Nenhum cliente encontrado" : "Nenhum produto encontrado"}
        </div>
      ) : items.slice(0, maxItems).map((item) => type === "cli" ? (
        <button key={item.id} type="button" onClick={() => selectCliente(item)}
          className="flex items-center gap-2.5 w-full px-3 py-2.5 text-left text-sm transition-colors border-b border-[var(--fips-border)] last:border-b-0 hover:bg-[var(--fips-surface-muted)]"
          style={{ color: "var(--fips-fg)" }}>
          {item.codigoLegado ? (
            <span className="flex-shrink-0 rounded bg-[var(--fips-primary)]/10 px-1.5 py-0.5 text-[10px] font-bold tabular-nums text-[var(--fips-primary)]" style={{ fontFamily: "'Fira Code',monospace" }}>{item.codigoLegado}</span>
          ) : <Building2 size={14} className="flex-shrink-0 text-[var(--fips-fg-muted)]" />}
          <div className="flex-1 min-w-0">
            <div className="font-medium truncate">{item.nomeFantasia}</div>
            {(item.cnpj || item.razaoSocial) && (
              <div className="flex items-center gap-2 mt-0.5 text-xs text-[var(--fips-fg-muted)]">
                {item.cnpj && <span>{item.cnpj}</span>}
                {item.razaoSocial && item.razaoSocial !== item.nomeFantasia && <span className="truncate">· {item.razaoSocial}</span>}
              </div>
            )}
          </div>
        </button>
      ) : (
        <button key={item.id} type="button" onClick={() => selectProduto(item)}
          className="flex items-center gap-3 w-full px-3 py-2.5 text-left text-sm transition-colors border-b border-[var(--fips-border)] last:border-b-0 hover:bg-[var(--fips-surface-muted)]"
          style={{ color: "var(--fips-fg)" }}>
          <div className="flex items-center gap-1.5 flex-shrink-0">
            <CorDot cor={item.cor} />
            {item.observacao?.startsWith("ID Planilha:") && (
              <span className="rounded px-1.5 py-0.5 text-[9px] font-bold tabular-nums" style={{
                background: "rgba(0,75,155,0.08)", color: "var(--fips-primary)", fontFamily: "'Fira Code',monospace",
              }}>{item.observacao.replace("ID Planilha: ", "#")}</span>
            )}
          </div>
          <div className="flex-1 min-w-0">
            <div className="font-medium truncate">{item.descricao || item.nome}</div>
            <div className="flex items-center gap-2 mt-0.5 text-[10px] text-[var(--fips-fg-muted)]">
              {item.tipoMaterial && <span className="font-semibold">{item.tipoMaterial}</span>}
              {item.cor && <span>· {item.cor}</span>}
              {item.medida && <span>· {item.medida}</span>}
              {item.pesoMedio != null && <span>· {item.pesoMedio}kg</span>}
            </div>
          </div>
        </button>
      ))}
      {items.length > maxItems && (
        <div className="px-3 py-2 text-center text-[10px] font-semibold" style={{ color: "var(--fips-fg-muted)", background: "var(--fips-surface-muted)" }}>
          +{items.length - maxItems} resultados — refine a busca
        </div>
      )}
    </div>
  );

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className={`${sz.maxH} ${sz.maxW} overflow-y-auto p-0 transition-all duration-200`}>
        {/* ═══ HEADER ═══ */}
        <DialogHeader className="border-b border-[var(--fips-border)] px-6 pt-5 pb-4">
          <div className="flex items-start gap-3">
            <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-[var(--color-fips-blue-200)]">
              <Send className="h-5 w-5 text-[var(--fips-secondary)]" />
            </div>
            <div className="min-w-0 flex-1">
              <DialogTitle>{isEditing ? "Editar pedido" : "Novo pedido"}</DialogTitle>
              <DialogDescription>
                Pedido do cliente B2B. Estoque <strong className="font-semibold text-[var(--fips-fg)]">disponível</strong> vs <strong className="font-semibold text-[var(--fips-fg)]">reservado</strong> calculado automaticamente.
              </DialogDescription>
            </div>
            <button type="button" onClick={cycleSize}
              className="flex items-center gap-1.5 rounded-lg border border-[var(--fips-border)] px-2.5 py-1.5 text-[10px] font-semibold uppercase tracking-wider text-[var(--fips-fg-muted)] transition-colors hover:border-[var(--fips-border-strong)] hover:text-[var(--fips-fg)]"
              title={`Tamanho: ${sz.label}`}>
              {dialogSize === "tela-cheia" ? <Minimize2 size={13} /> : <Maximize2 size={13} />}
              {sz.label}
            </button>
          </div>
        </DialogHeader>

        {/* ═══ BODY ═══ */}
        <form id="form-pedido" onSubmit={handleSubmit} className="px-6 py-5">
          <div className={isWide ? "grid grid-cols-2 gap-x-8 gap-y-5" : "flex flex-col gap-5"}>

            {/* ── COL 1: Cliente + Produto + Estoque ── */}
            <div className="flex flex-col gap-5">
              {/* Cliente com busca */}
              <Field density="compact" inset="icon">
                <FieldLabel required>Cliente</FieldLabel>
                <div className="relative">
                  <Input ref={searchRef} density="compact"
                    leftIcon={form.clienteId ? <Check className="h-3.5 w-3.5" style={{ color: "var(--fips-success)" }} /> : <Search className="h-3.5 w-3.5" />}
                    placeholder="ID, nome fantasia, razão social ou CNPJ..."
                    value={form.clienteId ? form.clienteNome : searchCli}
                    readOnly={!!form.clienteId}
                    onClick={() => { if (form.clienteId) clearCliente(); }}
                    onChange={(e) => { setSearchCli(e.target.value); setShowCliList(true); if (form.clienteId) clearCliente(); }}
                    onFocus={() => { if (!form.clienteId) setShowCliList(true); }}
                    style={form.clienteId ? { borderColor: "var(--fips-success)", background: "rgba(0,198,76,0.05)" } : undefined}
                  />
                  {showCliList && !form.clienteId && renderDropdown(filteredCli, "cli", sz.ddH, sz.ddMax)}
                </div>
                <FieldHint>{form.clienteId ? "Clique no campo para trocar" : "Busque por ID, nome fantasia, razão social ou CNPJ"}</FieldHint>
              </Field>
              {showCliList && !form.clienteId && <div className="fixed inset-0 z-40" onClick={() => setShowCliList(false)} />}

              {/* Info do cliente selecionado */}
              {selectedCli && (selectedCli.razaoSocial || selectedCli.endereco || selectedCli.cnpj) && (
                <div className="rounded-xl border border-[var(--fips-border)] bg-[var(--fips-surface-muted)] px-4 py-3 text-xs space-y-1.5">
                  {selectedCli.razaoSocial && <div className="flex items-baseline gap-2"><span className="text-[var(--fips-fg-muted)]">Razão Social</span><span className="font-medium text-[var(--fips-fg)]">{selectedCli.razaoSocial}</span></div>}
                  {selectedCli.cnpj && <div className="flex items-baseline gap-2"><span className="text-[var(--fips-fg-muted)]">CNPJ</span><span className="font-medium text-[var(--fips-fg)]">{selectedCli.cnpj}</span></div>}
                  {selectedCli.endereco && <div className="flex items-center gap-2 text-[var(--fips-fg)]"><MapPin size={11} className="flex-shrink-0 text-[var(--fips-fg-muted)]" />{selectedCli.endereco}</div>}
                </div>
              )}

              {/* Insights do cliente */}
              {form.clienteId && <ClienteInsights clienteId={form.clienteId} historico={historico} />}

              {/* ═══ PRODUTO com busca (mesmo padrão do cliente) ═══ */}
              <Field density="compact" inset="icon">
                <FieldLabel required>Produto</FieldLabel>
                <div className="relative">
                  <Input ref={searchProdRef} density="compact"
                    leftIcon={form.produtoId ? <Check className="h-3.5 w-3.5" style={{ color: "var(--fips-success)" }} /> : <Search className="h-3.5 w-3.5" />}
                    placeholder="Buscar por nome, ID, cor, medida ou material..."
                    value={form.produtoId ? form.produtoNome : searchProd}
                    readOnly={!!form.produtoId}
                    onClick={() => { if (form.produtoId) clearProduto(); }}
                    onChange={(e) => { setSearchProd(e.target.value); setShowProdList(true); if (form.produtoId) clearProduto(); }}
                    onFocus={() => { if (!form.produtoId) setShowProdList(true); }}
                    style={form.produtoId ? { borderColor: "var(--fips-success)", background: "rgba(0,198,76,0.05)" } : undefined}
                  />
                  {showProdList && !form.produtoId && renderDropdown(filteredProd, "prod", sz.ddH, sz.ddMax)}
                </div>
                <FieldHint>{form.produtoId ? "Clique no campo para trocar" : "Busque por nome, #ID, cor, tamanho ou tipo"}</FieldHint>
              </Field>
              {showProdList && !form.produtoId && <div className="fixed inset-0 z-40" onClick={() => setShowProdList(false)} />}

              {/* Info do produto selecionado */}
              {selectedProd && (
                <div className="rounded-xl border border-[var(--fips-border)] bg-[var(--fips-surface-muted)] px-4 py-3 text-xs flex items-center gap-3">
                  <CorDot cor={selectedProd.cor} />
                  <div className="flex-1 space-y-0.5">
                    <div className="font-semibold text-[var(--fips-fg)]">{selectedProd.descricao || selectedProd.nome}</div>
                    <div className="flex items-center gap-2 text-[var(--fips-fg-muted)]">
                      {selectedProd.tipoMaterial && <span>{selectedProd.tipoMaterial}</span>}
                      {selectedProd.cor && <span>· {selectedProd.cor}</span>}
                      {selectedProd.medida && <span>· {selectedProd.medida}</span>}
                      {selectedProd.pesoMedio != null && <span>· {selectedProd.pesoMedio}kg</span>}
                    </div>
                  </div>
                </div>
              )}

              {/* Tamanho / Medida personalizada */}
              {form.produtoId && (() => {
                const sizes = ["P", "M", "G", "GG"];
                const prodMedida = selectedProd?.medida || "";
                const hasSizes = sizes.includes(prodMedida);
                // Check if same product has multiple sizes
                const sameProduct = produtos.filter((p) =>
                  p.descricao === selectedProd?.descricao && p.cor === selectedProd?.cor && sizes.includes(p.medida || ""),
                );
                const hasVariants = sameProduct.length > 1;

                return (
                  <div>
                    <FieldLabel className="mb-1.5 text-xs font-semibold text-[var(--fips-fg)]">
                      Tamanho / Medida
                    </FieldLabel>
                    {/* Size chips if product has size variants */}
                    {(hasSizes || hasVariants) && (
                      <div className="flex flex-wrap gap-1.5 mb-2">
                        {sizes.map((s) => {
                          const variant = sameProduct.find((p) => p.medida === s);
                          const active = form.medidaCustom === s;
                          return (
                            <button key={s} type="button"
                              onClick={() => {
                                update("medidaCustom", active ? "" : s);
                                if (variant) {
                                  const label = `${variant.descricao}${variant.cor ? ` · ${variant.cor}` : ""} · ${s}`;
                                  setForm((f) => ({ ...f, produtoId: variant.id, produtoNome: label, medidaCustom: active ? "" : s }));
                                }
                              }}
                              className="rounded-lg px-3 py-1.5 text-xs font-bold transition-all"
                              style={{
                                background: active ? "var(--fips-primary)" : variant ? "var(--fips-surface-muted)" : "var(--fips-surface)",
                                color: active ? "#fff" : variant ? "var(--fips-fg)" : "var(--fips-fg-muted)",
                                border: `1.5px solid ${active ? "var(--fips-primary)" : variant ? "var(--fips-border)" : "var(--fips-border)"}`,
                                opacity: variant ? 1 : 0.5,
                                cursor: variant ? "pointer" : "default",
                              }}
                              disabled={!variant}
                              title={variant ? `${s} — ${variant.pesoMedio ?? "?"}kg` : `${s} — não disponível`}
                            >
                              {s}
                              {variant?.pesoMedio != null && <span className="ml-1 font-normal opacity-70">{variant.pesoMedio}kg</span>}
                            </button>
                          );
                        })}
                      </div>
                    )}
                    {/* Custom size input */}
                    <Input density="compact" type="text"
                      leftIcon={<Ruler className="h-3.5 w-3.5" />}
                      placeholder="Medida personalizada (ex: 35x35 Cm)"
                      value={hasSizes || hasVariants ? form.medidaCustom : (form.medidaCustom || prodMedida)}
                      onChange={(e) => update("medidaCustom", e.target.value)}
                    />
                    <FieldHint>Informe medida específica se o cliente pedir tamanho diferente do padrão</FieldHint>
                  </div>
                );
              })()}

              {/* Quantidade */}
              <Field density="compact" inset="icon">
                <FieldLabel required>Quantidade</FieldLabel>
                <Input density="compact" type="number" placeholder="0" leftIcon={<Hash className="h-3.5 w-3.5" />} value={form.qtdePedido} onChange={(e) => update("qtdePedido", e.target.value)} />
                <FieldHint>Pacotes / unidades do pedido</FieldHint>
              </Field>

              {/* Disponibilidade R2 */}
              {form.produtoId && (
                <div className="rounded-[10px_10px_10px_18px] border border-[var(--fips-border)] bg-[var(--fips-surface-soft)] p-4">
                  <div className="mb-2 flex items-center gap-2">
                    <AlertCircle className="h-3.5 w-3.5 text-[var(--fips-fg-muted)]" />
                    <p className="text-[10px] font-bold uppercase tracking-[1px] text-[var(--fips-fg-muted)]">Estoque (regra R2)</p>
                  </div>
                  {loadingDisp ? <p className="text-xs text-[var(--fips-fg-muted)]">Calculando...</p> : (
                    <>
                      <div className="grid grid-cols-3 gap-3">
                        <div className="rounded-lg border border-[var(--fips-border)] bg-[var(--fips-surface)] px-3 py-2">
                          <div className="flex items-center gap-1.5 text-[10px] font-semibold uppercase text-[var(--fips-fg-muted)]"><Box className="h-3 w-3" /> Total</div>
                          <div className="font-heading text-xl font-extrabold text-[var(--color-fips-blue-950)] dark:text-[var(--fips-fg)]">{r2.total.toLocaleString("pt-BR")}</div>
                        </div>
                        <div className="rounded-lg border border-[var(--fips-border)] bg-[var(--fips-surface)] px-3 py-2">
                          <div className="flex items-center gap-1.5 text-[10px] font-semibold uppercase text-[var(--fips-fg-muted)]"><Lock className="h-3 w-3" /> Reservado</div>
                          <div className="font-heading text-xl font-extrabold text-[var(--fips-warning)]">{r2.reservado.toLocaleString("pt-BR")}</div>
                        </div>
                        <div className="rounded-lg border border-[var(--fips-success-strong)]/30 bg-[var(--fips-success)]/[0.06] px-3 py-2">
                          <div className="flex items-center gap-1.5 text-[10px] font-semibold uppercase text-[var(--fips-success-strong)]"><CheckCircle2 className="h-3 w-3" /> Disponível</div>
                          <div className="font-heading text-xl font-extrabold text-[var(--fips-success-strong)]">{r2.disponivel.toLocaleString("pt-BR")}</div>
                        </div>
                      </div>
                      {r2.qtdePedido > 0 && (
                        <div className="mt-3 grid grid-cols-2 gap-3 border-t border-[var(--fips-border)] pt-3">
                          <div className="rounded-lg border border-[var(--fips-success-strong)]/30 bg-[var(--fips-success)]/[0.06] px-3 py-2">
                            <div className="flex items-center gap-1.5 text-[10px] font-semibold uppercase text-[var(--fips-success-strong)]"><Lock className="h-3 w-3" /> Reservado</div>
                            <div className="font-heading text-lg font-extrabold text-[var(--fips-success-strong)]">{r2.reservadoNeste.toLocaleString("pt-BR")} un</div>
                            <div className="text-[10px] text-[var(--fips-fg-muted)]">Sai do estoque</div>
                          </div>
                          <div className="rounded-lg border border-[var(--fips-warning)]/30 bg-[var(--color-fips-orange-100)] px-3 py-2">
                            <div className="flex items-center gap-1.5 text-[10px] font-semibold uppercase text-[var(--fips-warning)]"><Factory className="h-3 w-3" /> Produzir</div>
                            <div className="font-heading text-lg font-extrabold text-[var(--fips-warning)]">{r2.aProduzir.toLocaleString("pt-BR")} un</div>
                            <div className="text-[10px] text-[var(--fips-fg-muted)]">{r2.aProduzir > 0 ? "Ordem de produção" : "Tudo do estoque"}</div>
                          </div>
                        </div>
                      )}
                    </>
                  )}
                </div>
              )}
            </div>

            {/* ── COL 2: Logística + Agendamento + Obs ── */}
            <div className="flex flex-col gap-5">
              {/* Rota + Prioridade */}
              <div className="grid grid-cols-2 gap-3">
                <Field density="compact" inset="icon">
                  <FieldLabel>Rota</FieldLabel>
                  <Select density="compact" leftIcon={<MapIcon className="h-3.5 w-3.5" />} value={form.rota} onChange={(e) => update("rota", e.target.value)}>
                    {ROTAS_LETRAS.map((l) => <option key={l} value={l}>{l}</option>)}
                    {ROTAS_ESPECIAIS.map((r) => <option key={r} value={r}>{r}</option>)}
                  </Select>
                </Field>
                <Field density="compact" inset="icon">
                  <FieldLabel>Prioridade</FieldLabel>
                  <Select density="compact" leftIcon={<AlertCircle className="h-3.5 w-3.5" />} value={form.prioridade} onChange={(e) => update("prioridade", e.target.value)}>
                    <option value="Baixa">Baixa</option>
                    <option value="Normal">Normal</option>
                    <option value="Alta">Alta</option>
                    <option value="Urgente">Urgente</option>
                  </Select>
                </Field>
              </div>

              {/* Data + Hora entrega */}
              <div>
                <FieldLabel className="mb-1 text-xs font-semibold text-[var(--fips-fg)]">Data e hora de entrega</FieldLabel>
                <div className="grid grid-cols-[1fr_auto] gap-2">
                  <Input density="compact" type="date" leftIcon={<CalendarDays className="h-3.5 w-3.5" />}
                    value={form.dataEntrega} onChange={(e) => update("dataEntrega", e.target.value)}
                    onClick={(e) => (e.target as HTMLInputElement).showPicker?.()}
                    className="hide-native-picker cursor-pointer" />
                  <Input density="compact" type="time" leftIcon={<Clock className="h-3.5 w-3.5" />}
                    value={form.horaEntrega} onChange={(e) => update("horaEntrega", e.target.value)}
                    onClick={(e) => (e.target as HTMLInputElement).showPicker?.()}
                    className="w-[130px] hide-native-picker cursor-pointer" />
                </div>
              </div>

              {/* ═══ PERIODICIDADE — chips + calendário ═══ */}
              <div>
                <FieldLabel className="mb-2 text-xs font-semibold text-[var(--fips-fg)]">Periodicidade</FieldLabel>
                <div className="flex flex-wrap gap-1.5">
                  {FREQUENCIAS.map((fr) => {
                    const active = form.periodicidade === fr.value;
                    return (
                      <button key={fr.value} type="button"
                        onClick={() => update("periodicidade", fr.value)}
                        className="rounded-lg px-3 py-1.5 text-xs font-medium transition-all"
                        style={{
                          background: active ? "var(--fips-primary)" : "var(--fips-surface-muted)",
                          color: active ? "#fff" : "var(--fips-fg)",
                          border: `1.5px solid ${active ? "var(--fips-primary)" : "var(--fips-border)"}`,
                          boxShadow: active ? "0 2px 8px rgba(0,75,155,0.25)" : "none",
                        }}>
                        {fr.label}
                      </button>
                    );
                  })}
                </div>
                {!form.periodicidade && <p className="mt-1.5 text-xs text-[var(--fips-fg-muted)]">Pedido único — selecione para recorrência</p>}

                {/* Lista de datas geradas para periodicidades pré-definidas */}
                {form.periodicidade && form.periodicidade !== "personalizado" && form.dataEntrega && (
                  <AgendamentoResumo
                    datas={gerarDatasRecorrentesDiasUteis(form.periodicidade, form.dataEntrega)}
                    tipo={form.periodicidade}
                  />
                )}
                {form.periodicidade && form.periodicidade !== "personalizado" && !form.dataEntrega && (
                  <p className="mt-1.5 text-xs" style={{ color: "var(--fips-warning)" }}>Selecione a data de entrega para gerar as datas recorrentes</p>
                )}

                {/* Calendário range quando personalizado */}
                {form.periodicidade === "personalizado" && (
                  <div className="mt-3">
                    <RangeCalendar
                      start={form.periodoInicio}
                      end={form.periodoFim}
                      onChange={(s, e) => setForm((f) => ({ ...f, periodoInicio: s, periodoFim: e }))}
                    />
                  </div>
                )}
              </div>

              {/* Observações removidas — fluxo simplificado */}
            </div>
          </div>
        </form>

        {/* ═══ FOOTER ═══ */}
        <DialogFooter className="border-t border-[var(--fips-border)] px-6 py-3">
          <div className="flex w-full items-center justify-between gap-3">
            <p className="hidden text-xs text-[var(--fips-fg-muted)] sm:block">⌘ + Enter para salvar</p>
            <div className="flex flex-1 justify-end gap-2 sm:flex-none">
              <Button type="button" variant="secondary" onClick={() => onOpenChange(false)}>Cancelar</Button>
              <Button type="submit" form="form-pedido" variant="success" loading={loading} className="gap-2">
                <Check className="h-4 w-4" /> {isEditing ? "Salvar alterações" : "Registrar pedido"}
              </Button>
            </div>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
