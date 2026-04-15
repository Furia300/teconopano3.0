import { useEffect, useMemo, useState, useCallback } from "react";
import { toast } from "sonner";
import {
  ClipboardList, Plus, Calendar, Clock, User, Factory,
  CheckCircle2, AlertTriangle, ChevronLeft, Play, Square, Weight,
} from "lucide-react";
import { PageHeader } from "@/components/domain/PageHeader";
import { StatsCard } from "@/components/domain/StatsCard";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Field, FieldLabel, FieldHint } from "@/components/ui/field";
import { useAppAuthMe } from "@/hooks/useAppUserPerfil";

/* ─── Constants ─── */
const FIPS = { azulProfundo: "#004B9B", verdeFloresta: "#00C64C", amareloEscuro: "#F6921E", azulEscuro: "#002A68", danger: "#DC3545" };

const SALAS = [
  { id: "O1", group: "Operação" }, { id: "O2", group: "Operação" }, { id: "O3", group: "Operação" }, { id: "O4", group: "Operação" },
  { id: "O5", group: "Operação" }, { id: "O6", group: "Operação" }, { id: "O7", group: "Operação" }, { id: "O8", group: "Operação" },
  { id: "COBERTORIO", group: "Especial" },
  { id: "CORTE 01", group: "Corte" }, { id: "CORTE 02", group: "Corte" }, { id: "CORTE 03", group: "Corte" },
  { id: "CORTE 04", group: "Corte" }, { id: "CORTE 05", group: "Corte" },
  { id: "FAIXA", group: "Especial" }, { id: "CORTE VLI", group: "Corte" },
];

const ENCARREGADOS = ["Wagner", "Marcos", "Nelson"];

/* ─── Types ─── */
interface Registro {
  id: string; data: string; nomeDupla: string; sala: string; material: string;
  horarioInicio: string; horarioFim: string | null; status: "completa" | "incompleta";
  assinatura: string; encarregado: string; observacao: string;
}

interface Produto {
  id: string; descricao: string; tipoMaterial: string; cor: string;
  medida: string; acabamento: string; pesoMedio: number;
}

/* ─── Sala Card ─── */
function SalaCard({ sala, count, operadores, isActive, onClick }: {
  sala: { id: string; group: string }; count: number; operadores: string[];
  isActive: boolean; onClick: () => void;
}) {
  const hasActivity = count > 0;
  return (
    <button onClick={onClick} className="group relative text-left transition-all duration-300" style={{
      background: isActive
        ? "linear-gradient(135deg, #004B9B 0%, #002A68 100%)"
        : hasActivity
          ? "var(--fips-surface)"
          : "var(--fips-surface-soft)",
      border: isActive ? "2px solid #004B9B" : hasActivity ? "2px solid var(--fips-border-strong)" : "2px solid var(--fips-border)",
      borderRadius: "12px 12px 12px 20px",
      padding: "16px",
      cursor: "pointer",
      boxShadow: isActive ? "0 8px 24px rgba(0,75,155,0.3)" : "0 1px 3px rgba(0,0,0,0.06)",
      transform: isActive ? "scale(1.02)" : "scale(1)",
      minHeight: 110,
    }}>
      {/* Indicador de atividade */}
      {hasActivity && !isActive && (
        <div className="absolute top-2 right-2 flex h-2.5 w-2.5">
          <span className="absolute inline-flex h-full w-full animate-ping rounded-full opacity-75" style={{ background: FIPS.verdeFloresta }} />
          <span className="relative inline-flex h-2.5 w-2.5 rounded-full" style={{ background: FIPS.verdeFloresta }} />
        </div>
      )}

      {/* Ícone + Nome */}
      <div className="flex items-center gap-2 mb-2">
        <Factory className="h-4 w-4" style={{ color: isActive ? "#fff" : "var(--fips-fg-muted)" }} />
        <span className="text-[13px] font-bold" style={{
          color: isActive ? "#fff" : "var(--fips-fg)",
          fontFamily: "'Saira Expanded', sans-serif",
        }}>{sala.id}</span>
      </div>

      {/* Count */}
      <div className="text-[28px] font-extrabold leading-none mb-1" style={{
        color: isActive ? "#FDC24E" : hasActivity ? FIPS.azulProfundo : "var(--fips-fg-muted)",
        fontFamily: "'Saira Expanded', sans-serif",
      }}>
        {count}
      </div>
      <span className="text-[9px] font-semibold uppercase tracking-[0.08em]" style={{
        color: isActive ? "rgba(255,255,255,0.6)" : "var(--fips-fg-muted)",
      }}>
        {count === 1 ? "registro" : "registros"} hoje
      </span>

      {/* Operadores ativos */}
      {operadores.length > 0 && (
        <div className="mt-2 flex flex-wrap gap-1">
          {operadores.slice(0, 2).map((op, i) => (
            <span key={i} className="rounded px-1.5 py-0.5 text-[8px] font-semibold truncate max-w-[80px]" style={{
              background: isActive ? "rgba(255,255,255,0.15)" : "var(--fips-surface-muted)",
              color: isActive ? "#fff" : "var(--fips-fg-muted)",
            }}>{op}</span>
          ))}
          {operadores.length > 2 && (
            <span className="text-[8px]" style={{ color: isActive ? "rgba(255,255,255,0.5)" : "var(--fips-fg-muted)" }}>+{operadores.length - 2}</span>
          )}
        </div>
      )}

      {/* Group badge */}
      <div className="absolute bottom-2 right-2">
        <span className="text-[7px] font-bold uppercase tracking-[0.1em]" style={{
          color: isActive ? "rgba(255,255,255,0.35)" : "var(--fips-fg-muted)",
          opacity: 0.5,
        }}>{sala.group}</span>
      </div>
    </button>
  );
}

/* ─── Timeline Item ─── */
function TimelineItem({ reg, isLast }: { reg: Registro; isLast: boolean }) {
  const isComplete = reg.status === "completa";
  const color = isComplete ? FIPS.verdeFloresta : reg.horarioFim ? FIPS.danger : FIPS.amareloEscuro;
  return (
    <div className="flex gap-3">
      {/* Linha vertical + dot */}
      <div className="flex flex-col items-center">
        <div className="flex h-6 w-6 items-center justify-center rounded-full" style={{ background: `${color}18`, border: `2px solid ${color}` }}>
          {isComplete ? <CheckCircle2 className="h-3 w-3" style={{ color }} /> : <Clock className="h-3 w-3" style={{ color }} />}
        </div>
        {!isLast && <div className="w-0.5 flex-1 min-h-[20px]" style={{ background: "var(--fips-border)" }} />}
      </div>
      {/* Content */}
      <div className="flex-1 pb-4">
        <div className="rounded-lg border border-[var(--fips-border)] bg-[var(--fips-surface)] p-3">
          <div className="flex items-center justify-between mb-1">
            <span className="text-[12px] font-bold text-[var(--fips-fg)]" style={{ fontFamily: "'Saira Expanded', sans-serif" }}>{reg.material}</span>
            <Badge variant={isComplete ? "success" : "warning"} className="text-[9px]">
              {isComplete ? "Completa" : "Em andamento"}
            </Badge>
          </div>
          <div className="flex items-center gap-3 text-[10px] text-[var(--fips-fg-muted)]">
            <span className="flex items-center gap-1 font-mono"><Clock className="h-3 w-3" />{reg.horarioInicio}{reg.horarioFim ? ` — ${reg.horarioFim}` : " — ..."}</span>
            <span className="flex items-center gap-1"><User className="h-3 w-3" />{reg.nomeDupla}</span>
          </div>
          {reg.observacao && <p className="mt-1 text-[10px] text-[var(--fips-fg-muted)] italic">{reg.observacao}</p>}
        </div>
      </div>
    </div>
  );
}

/* ─── Inline Form (Novo Registro) ─── */
function InlineForm({ sala, operador, produtos, onSave, onCancel }: {
  sala: string; operador: string; produtos: Produto[];
  onSave: (r: Omit<Registro, "id">) => Promise<void>; onCancel: () => void;
}) {
  const [material, setMaterial] = useState("");
  const [horarioInicio] = useState(() => { const n = new Date(); return `${String(n.getHours()).padStart(2, "0")}:${String(n.getMinutes()).padStart(2, "0")}`; });
  const [encarregado, setEncarregado] = useState("");
  const [observacao, setObservacao] = useState("");
  const [saving, setSaving] = useState(false);

  // Cascata: material → produto details
  const tiposUnicos = useMemo(() => [...new Set(produtos.map(p => p.tipoMaterial).filter(Boolean))].sort(), [produtos]);
  const produtoMatch = useMemo(() => produtos.find(p => p.tipoMaterial === material), [produtos, material]);

  const handleSubmit = async () => {
    if (!material) { toast.error("Selecione o material"); return; }
    setSaving(true);
    try {
      await onSave({
        data: new Date().toISOString().split("T")[0],
        nomeDupla: operador,
        sala,
        material: produtoMatch ? `${material} ${produtoMatch.cor || ""} ${produtoMatch.medida || ""}`.trim() : material,
        horarioInicio,
        horarioFim: null,
        status: "incompleta",
        assinatura: operador,
        encarregado,
        observacao,
      });
      toast.success("Registro iniciado!");
    } catch { toast.error("Erro ao salvar"); }
    finally { setSaving(false); }
  };

  return (
    <div className="rounded-[10px_10px_10px_18px] border-2 border-dashed border-[var(--fips-primary)] bg-[var(--fips-surface-soft)] p-4" style={{ animation: "fadeIn .2s ease" }}>
      <style>{`@keyframes fadeIn{from{opacity:0;transform:translateY(8px)}to{opacity:1;transform:translateY(0)}}`}</style>

      <div className="flex items-center gap-2 mb-3">
        <Play className="h-4 w-4 text-[var(--fips-primary)]" />
        <span className="text-[11px] font-bold uppercase tracking-[0.06em] text-[var(--fips-primary)]">Novo Registro — {sala}</span>
      </div>

      {/* Auto-preenchido */}
      <div className="mb-3 flex flex-wrap gap-2">
        <span className="rounded-lg bg-[var(--fips-primary)]/10 border border-[var(--fips-primary)]/20 px-2.5 py-1 text-[10px] font-semibold text-[var(--fips-primary)]">
          <User className="inline h-3 w-3 mr-1" />{operador}
        </span>
        <span className="rounded-lg bg-[var(--fips-surface-muted)] border border-[var(--fips-border)] px-2.5 py-1 text-[10px] font-semibold text-[var(--fips-fg-muted)]">
          <Clock className="inline h-3 w-3 mr-1" />Início: {horarioInicio}
        </span>
        <span className="rounded-lg bg-[var(--fips-surface-muted)] border border-[var(--fips-border)] px-2.5 py-1 text-[10px] font-semibold text-[var(--fips-fg-muted)]">
          <Calendar className="inline h-3 w-3 mr-1" />{new Date().toLocaleDateString("pt-BR")}
        </span>
      </div>

      {/* Material cascata */}
      <div className="grid grid-cols-2 gap-3 mb-3">
        <Field density="compact">
          <FieldLabel required>Material</FieldLabel>
          <Select value={material} onChange={e => setMaterial(e.target.value)}>
            <option value="">Selecione o tipo</option>
            {tiposUnicos.map(t => <option key={t} value={t}>{t}</option>)}
          </Select>
        </Field>
        <Field density="compact">
          <FieldLabel>Encarregado</FieldLabel>
          <Select value={encarregado} onChange={e => setEncarregado(e.target.value)}>
            <option value="">Selecione</option>
            {ENCARREGADOS.map(e => <option key={e} value={e}>{e}</option>)}
          </Select>
        </Field>
      </div>

      {/* Auto-fill do produto */}
      {produtoMatch && (
        <div className="mb-3 grid grid-cols-3 gap-2">
          {produtoMatch.cor && (
            <div className="rounded-lg border border-[var(--fips-border)] bg-[var(--fips-surface)] px-3 py-2">
              <div className="text-[9px] font-semibold uppercase text-[var(--fips-fg-muted)]">Cor</div>
              <div className="text-[12px] font-bold text-[var(--fips-fg)]">{produtoMatch.cor}</div>
            </div>
          )}
          {produtoMatch.medida && (
            <div className="rounded-lg border border-[var(--fips-border)] bg-[var(--fips-surface)] px-3 py-2">
              <div className="text-[9px] font-semibold uppercase text-[var(--fips-fg-muted)]">Medida</div>
              <div className="text-[12px] font-bold text-[var(--fips-fg)]">{produtoMatch.medida}</div>
            </div>
          )}
          {produtoMatch.pesoMedio > 0 && (
            <div className="rounded-lg border border-[var(--fips-border)] bg-[var(--fips-surface)] px-3 py-2">
              <div className="text-[9px] font-semibold uppercase text-[var(--fips-fg-muted)]">Peso Médio</div>
              <div className="text-[12px] font-bold text-[var(--fips-fg)]">{produtoMatch.pesoMedio} kg</div>
            </div>
          )}
        </div>
      )}

      <Field density="compact" className="mb-3">
        <FieldLabel>Observação</FieldLabel>
        <Input density="compact" placeholder="Opcional" value={observacao} onChange={e => setObservacao(e.target.value)} />
      </Field>

      <div className="flex gap-2 justify-end">
        <Button type="button" variant="secondary" size="sm" onClick={onCancel}>Cancelar</Button>
        <Button size="sm" onClick={handleSubmit} disabled={saving} className="gap-1">
          <Play className="h-3.5 w-3.5" />
          {saving ? "Salvando..." : "Iniciar Produção"}
        </Button>
      </div>
    </div>
  );
}

/* ═══════════════ MAIN PAGE ═══════════════ */
export default function ProducaoDiariaPage() {
  const me = useAppAuthMe();
  const [registros, setRegistros] = useState<Registro[]>([]);
  const [produtos, setProdutos] = useState<Produto[]>([]);
  const [loading, setLoading] = useState(true);
  const [salaAberta, setSalaAberta] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const hoje = new Date().toISOString().split("T")[0];

  useEffect(() => {
    Promise.all([
      fetch("/api/producao-diaria").then(r => r.json()).catch(() => []),
      fetch("/api/produtos").then(r => r.json()).catch(() => []),
    ]).then(([regs, prods]) => { setRegistros(regs); setProdutos(prods); }).finally(() => setLoading(false));
  }, []);

  const registrosHoje = useMemo(() => registros.filter(r => r.data === hoje), [registros, hoje]);

  const porSala = useMemo(() => {
    const map: Record<string, { count: number; operadores: Set<string>; registros: Registro[] }> = {};
    for (const s of SALAS) map[s.id] = { count: 0, operadores: new Set(), registros: [] };
    for (const r of registrosHoje) {
      if (!map[r.sala]) map[r.sala] = { count: 0, operadores: new Set(), registros: [] };
      map[r.sala].count++;
      map[r.sala].operadores.add(r.nomeDupla);
      map[r.sala].registros.push(r);
    }
    return map;
  }, [registrosHoje]);

  const resumo = useMemo(() => ({
    total: registrosHoje.length,
    duplas: new Set(registrosHoje.map(r => r.nomeDupla)).size,
    completas: registrosHoje.filter(r => r.status === "completa").length,
    emAndamento: registrosHoje.filter(r => r.status !== "completa").length,
    salasAtivas: Object.values(porSala).filter(s => s.count > 0).length,
  }), [registrosHoje, porSala]);

  const handleSave = useCallback(async (item: Omit<Registro, "id">) => {
    const res = await fetch("/api/producao-diaria", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(item) });
    if (!res.ok) throw new Error();
    const novo = await res.json();
    setRegistros(prev => [novo, ...prev]);
    setShowForm(false);
  }, []);

  const handleFinalizar = useCallback(async (id: string) => {
    const now = new Date();
    const horarioFim = `${String(now.getHours()).padStart(2, "0")}:${String(now.getMinutes()).padStart(2, "0")}`;
    // Optimistic update
    setRegistros(prev => prev.map(r => r.id === id ? { ...r, horarioFim, status: "completa" as const } : r));
    toast.success("Produção finalizada!");
  }, []);

  const salaData = salaAberta ? porSala[salaAberta] : null;

  if (loading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <div className="space-y-3 text-center">
          <div className="mx-auto h-12 w-12 animate-spin rounded-full border-4 border-[var(--fips-primary)] border-t-transparent" />
          <p className="text-sm text-[var(--fips-fg-muted)]">Carregando produção diária...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Produção Diária"
        description={`${me.nome} · ${new Date().toLocaleDateString("pt-BR", { weekday: "long", day: "numeric", month: "long" })}`}
        icon={ClipboardList}
        stats={[
          { label: "Registros", value: resumo.total, color: "#93BDE4" },
          { label: "Salas Ativas", value: resumo.salasAtivas, color: "#00C64C" },
          { label: "Completas", value: resumo.completas, color: "#FDC24E" },
          { label: "Em Andamento", value: resumo.emAndamento, color: "#ed1b24" },
        ]}
      />

      <div className="grid grid-cols-1 gap-3 md:grid-cols-2 lg:grid-cols-4">
        <StatsCard label="Total Registros" value={resumo.total} subtitle="Hoje" icon={ClipboardList} color={FIPS.azulProfundo} />
        <StatsCard label="Duplas/Operadores" value={resumo.duplas} subtitle="Ativos hoje" icon={User} color={FIPS.verdeFloresta} />
        <StatsCard label="Completas" value={resumo.completas} subtitle="Finalizadas" icon={CheckCircle2} color={FIPS.amareloEscuro} />
        <StatsCard label="Em Andamento" value={resumo.emAndamento} subtitle={resumo.emAndamento > 0 ? "Em produção agora" : "Nenhuma"} icon={AlertTriangle} color={FIPS.azulEscuro} />
      </div>

      {/* ═══ GRID DE SALAS ou PAINEL DA SALA ═══ */}
      {!salaAberta ? (
        <>
          {/* Título da seção */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Factory className="h-5 w-5 text-[var(--fips-fg-muted)]" />
              <h3 className="text-[14px] font-bold text-[var(--fips-fg)]" style={{ fontFamily: "'Saira Expanded', sans-serif" }}>
                Selecione sua sala
              </h3>
              <span className="text-[11px] text-[var(--fips-fg-muted)]">· Clique para registrar produção</span>
            </div>
          </div>

          {/* Grid de Salas */}
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-8">
            {SALAS.map((sala, i) => {
              const data = porSala[sala.id] || { count: 0, operadores: new Set(), registros: [] };
              return (
                <div key={sala.id} style={{ animation: `fadeIn .3s ease ${i * 0.03}s both` }}>
                  <SalaCard
                    sala={sala}
                    count={data.count}
                    operadores={[...data.operadores]}
                    isActive={false}
                    onClick={() => { setSalaAberta(sala.id); setShowForm(false); }}
                  />
                </div>
              );
            })}
          </div>
          <style>{`@keyframes fadeIn{from{opacity:0;transform:translateY(8px)}to{opacity:1;transform:translateY(0)}}`}</style>
        </>
      ) : (
        /* ═══ PAINEL DA SALA ABERTA ═══ */
        <div style={{ animation: "fadeIn .25s ease" }}>
          <style>{`@keyframes fadeIn{from{opacity:0;transform:translateY(8px)}to{opacity:1;transform:translateY(0)}}`}</style>

          {/* Header do painel */}
          <div className="flex items-center justify-between rounded-[12px_12px_12px_20px] border border-[var(--fips-border)] p-4 mb-4"
            style={{ background: "linear-gradient(135deg, #004B9B 0%, #002A68 100%)" }}>
            <div className="flex items-center gap-3">
              <button onClick={() => setSalaAberta(null)} className="flex h-8 w-8 items-center justify-center rounded-lg bg-white/10 hover:bg-white/20 transition-colors">
                <ChevronLeft className="h-5 w-5 text-white" />
              </button>
              <div>
                <h3 className="text-white text-[18px] font-bold" style={{ fontFamily: "'Saira Expanded', sans-serif" }}>
                  Sala {salaAberta}
                </h3>
                <p className="text-white/50 text-[11px]">
                  {me.nome} · {new Date().toLocaleDateString("pt-BR")} · {salaData?.count || 0} registros hoje
                </p>
              </div>
            </div>
            <Button onClick={() => setShowForm(true)} className="gap-1.5 bg-[#FDC24E] text-[#002A68] hover:bg-[#f0b83e] font-bold text-[12px]">
              <Plus className="h-4 w-4" />
              Novo Registro
            </Button>
          </div>

          {/* Form inline */}
          {showForm && (
            <div className="mb-4">
              <InlineForm
                sala={salaAberta}
                operador={me.nome}
                produtos={produtos}
                onSave={handleSave}
                onCancel={() => setShowForm(false)}
              />
            </div>
          )}

          {/* Timeline */}
          {salaData && salaData.registros.length > 0 ? (
            <div className="rounded-[12px_12px_12px_20px] border border-[var(--fips-border)] bg-[var(--fips-surface)] p-5">
              <div className="flex items-center gap-2 mb-4">
                <Clock className="h-4 w-4 text-[var(--fips-fg-muted)]" />
                <span className="text-[11px] font-bold uppercase tracking-[0.06em] text-[var(--fips-fg-muted)]">
                  Timeline — {salaData.registros.length} registro(s)
                </span>
              </div>
              {salaData.registros.map((reg, i) => (
                <div key={reg.id} className="flex items-start gap-2">
                  <div className="flex-1">
                    <TimelineItem reg={reg} isLast={i === salaData.registros.length - 1} />
                  </div>
                  {reg.status !== "completa" && (
                    <Button size="sm" variant="outline" onClick={() => handleFinalizar(reg.id)} className="mt-1 gap-1 text-[10px] shrink-0">
                      <Square className="h-3 w-3" />
                      Finalizar
                    </Button>
                  )}
                </div>
              ))}
            </div>
          ) : !showForm ? (
            <div className="rounded-[12px_12px_12px_20px] border border-dashed border-[var(--fips-border)] bg-[var(--fips-surface-soft)] p-10 text-center">
              <Factory className="h-10 w-10 mx-auto mb-3 text-[var(--fips-fg-muted)] opacity-40" />
              <p className="text-[13px] font-semibold text-[var(--fips-fg)]">Nenhum registro hoje nesta sala</p>
              <p className="text-[11px] text-[var(--fips-fg-muted)] mt-1">Clique em "Novo Registro" para começar</p>
            </div>
          ) : null}
        </div>
      )}
    </div>
  );
}
