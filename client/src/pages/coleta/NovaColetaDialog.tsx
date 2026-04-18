import { useState, useEffect, useMemo, useRef } from "react";
import { toast } from "sonner";
import {
  Truck, Building2, CalendarDays, Clock, Scale,
  Check, Search, Repeat, MapPin,
  Maximize2, Minimize2, CalendarPlus, X,
} from "lucide-react";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Field, FieldLabel, FieldHint } from "@/components/ui/field";
import { gerarDatasRecorrentesDiasUteis } from "@/lib/diasUteis";

/* ─────────────────────── Types ─────────────────────── */

interface Fornecedor {
  id: string;
  nome: string;
  razaoSocial?: string;
  cnpj: string;
  endereco?: string;
  cidade?: string;
  estado?: string;
}

interface NovaColetaDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
  editingColeta?: any | null;
}

/** "ATMOSFERA — SP — DIADEMA" */
function fornecedorLabel(f: Fornecedor) {
  const parts = [f.nome];
  if (f.estado) parts.push(f.estado);
  if (f.cidade) parts.push(f.cidade);
  return parts.join(" — ");
}

/* ─────────────────────── Sizes ─────────────────────── */

type DialogSize = "normal" | "grande" | "tela-cheia";

const SIZES: Record<DialogSize, {
  maxW: string; maxH: string; label: string;
  ddH: number; ddMax: number;
  itemCls: string; subCls: string; iconPx: number;
}> = {
  normal: {
    maxW: "max-w-xl", maxH: "max-h-[85vh]", label: "Normal",
    ddH: 280, ddMax: 15,
    itemCls: "text-xs py-2 px-3 gap-2", subCls: "text-[10px]", iconPx: 14,
  },
  grande: {
    maxW: "max-w-3xl", maxH: "max-h-[90vh]", label: "Grande",
    ddH: 400, ddMax: 25,
    itemCls: "text-sm py-2.5 px-4 gap-3", subCls: "text-xs", iconPx: 16,
  },
  "tela-cheia": {
    maxW: "max-w-[92vw]", maxH: "max-h-[95vh]", label: "Tela cheia",
    ddH: 560, ddMax: 40,
    itemCls: "text-base py-3 px-4 gap-3", subCls: "text-sm", iconPx: 18,
  },
};

const SIZE_ORDER: DialogSize[] = ["normal", "grande", "tela-cheia"];

const FREQUENCIAS = [
  { value: "", label: "Sem recorrência" },
  { value: "3dias", label: "A cada 3 dias" },
  { value: "semanal", label: "Semanal" },
  { value: "quinzenal", label: "Quinzenal (15 dias)" },
  { value: "mensal", label: "Mensal" },
  { value: "trimestral", label: "Trimestral" },
  { value: "semestral", label: "Semestral" },
  { value: "anual", label: "Anual" },
];

/* ─────────────────────── Component ─────────────────────── */

function FornecedorInsights({ fornecedorNome, coletas }: { fornecedorNome: string; coletas: any[] }) {
  const pedidosForn = useMemo(() =>
    coletas.filter((c: any) => (c.nomeFantasia || "").toLowerCase() === fornecedorNome.toLowerCase())
      .sort((a: any, b: any) => (b.createdAt || "").localeCompare(a.createdAt || "")),
    [coletas, fornecedorNome],
  );

  if (pedidosForn.length === 0) {
    return (
      <div className="rounded-xl px-4 py-3 text-xs flex items-center gap-2" style={{
        background: "linear-gradient(135deg, rgba(0,75,155,0.04), rgba(0,75,155,0.01))",
        border: "1px solid var(--fips-border)",
      }}>
        <span style={{ fontSize: 13 }}>✨</span>
        <span style={{ color: "var(--fips-fg-muted)" }}>Primeira coleta deste fornecedor</span>
      </div>
    );
  }

  const datas = pedidosForn.map((c: any) => new Date(c.createdAt || c.dataPedido || "").getTime()).filter(Boolean).sort((a, b) => a - b);
  let mediaDias = 0;
  if (datas.length >= 2) {
    const diffs: number[] = [];
    for (let i = 1; i < datas.length; i++) diffs.push((datas[i] - datas[i - 1]) / 86400000);
    mediaDias = Math.round(diffs.reduce((a, b) => a + b, 0) / diffs.length);
  }
  let freqDetectada = "";
  if (mediaDias > 0) {
    if (mediaDias <= 5) freqDetectada = "A cada 3 dias";
    else if (mediaDias <= 10) freqDetectada = "Semanal";
    else if (mediaDias <= 20) freqDetectada = "Quinzenal";
    else if (mediaDias <= 45) freqDetectada = "Mensal";
    else freqDetectada = `~${mediaDias} dias`;
  }

  const pesoTotal = pedidosForn.reduce((a: number, c: any) => a + (c.pesoTotalNF || 0), 0);
  const ultimo = pedidosForn[0];
  const diasDesde = ultimo?.createdAt ? Math.round((Date.now() - new Date(ultimo.createdAt).getTime()) / 86400000) : null;

  return (
    <div className="rounded-xl overflow-hidden" style={{
      border: "1px solid var(--fips-border)",
      background: "linear-gradient(135deg, rgba(0,75,155,0.03), rgba(0,198,76,0.02))",
    }}>
      <div className="px-3 py-2 flex items-center justify-between" style={{
        borderBottom: "1px solid var(--fips-border)", background: "rgba(0,75,155,0.04)",
      }}>
        <div className="flex items-center gap-1.5">
          <span style={{ fontSize: 13 }}>💡</span>
          <span className="text-[10px] font-bold uppercase tracking-wider" style={{ color: "var(--fips-primary)" }}>Insights do fornecedor</span>
        </div>
        <span className="text-[9px] font-bold px-2 py-0.5 rounded-full" style={{ background: "rgba(0,75,155,0.08)", color: "var(--fips-primary)" }}>{pedidosForn.length} coletas</span>
      </div>
      <div className="px-3 py-2.5 space-y-2">
        <div className="flex items-center gap-2 text-[11px]">
          <Clock size={11} style={{ color: "var(--fips-fg-muted)", flexShrink: 0 }} />
          <span style={{ color: "var(--fips-fg-muted)" }}>Última coleta:</span>
          <span className="font-semibold" style={{ color: diasDesde != null && diasDesde > 30 ? "var(--fips-danger)" : "var(--fips-fg)" }}>
            {diasDesde != null ? `há ${diasDesde} dias` : "—"}
          </span>
        </div>
        {freqDetectada && (
          <div className="flex items-center gap-2 text-[11px]">
            <Repeat size={11} style={{ color: "var(--fips-primary)", flexShrink: 0 }} />
            <span style={{ color: "var(--fips-fg-muted)" }}>Frequência habitual:</span>
            <span className="font-bold" style={{ color: "var(--fips-primary)" }}>{freqDetectada}</span>
          </div>
        )}
        <div className="flex items-center gap-2 text-[11px]">
          <Scale size={11} style={{ color: "var(--fips-success)", flexShrink: 0 }} />
          <span style={{ color: "var(--fips-fg-muted)" }}>Peso total recebido:</span>
          <span className="font-bold" style={{ color: "var(--fips-success)" }}>{pesoTotal.toLocaleString("pt-BR")} kg</span>
        </div>
      </div>
    </div>
  );
}

export function NovaColetaDialog({ open, onOpenChange, onSuccess, editingColeta }: NovaColetaDialogProps) {
  const isEditing = !!editingColeta;
  const [fornecedores, setFornecedores] = useState<Fornecedor[]>([]);
  const [coletasHistorico, setColetasHistorico] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchForn, setSearchForn] = useState("");
  const [showFornList, setShowFornList] = useState(false);
  const [dialogSize, setDialogSize] = useState<DialogSize>("grande");
  const searchRef = useRef<HTMLInputElement>(null);

  const [form, setForm] = useState({
    fornecedorId: "",
    fornecedorNome: "",
    dataChegada: "",
    horaChegada: "",
    observacao: "",
    recorrencia: "",
  });

  const sz = SIZES[dialogSize];
  const isWide = dialogSize !== "normal";

  /* ─── Fetch ─── */
  useEffect(() => {
    if (open) {
      if (editingColeta) {
        setForm({
          fornecedorId: editingColeta.fornecedorId || "",
          fornecedorNome: editingColeta.nomeFantasia || "",
          dataChegada: editingColeta.dataChegada ? editingColeta.dataChegada.slice(0, 10) : "",
          horaChegada: editingColeta.dataChegada ? editingColeta.dataChegada.slice(11, 16) : "",
          observacao: editingColeta.observacao || "",
          recorrencia: editingColeta.recorrencia || "",
        });
      } else {
        setForm({ fornecedorId: "", fornecedorNome: "", dataChegada: "", horaChegada: "", observacao: "", recorrencia: "" });
      }
      Promise.all([
        fetch("/api/fornecedores").then((r) => r.json()),
        fetch("/api/coletas").then((r) => r.json()).catch(() => []),
      ]).then(([fs, cs]) => { setFornecedores(fs); setColetasHistorico(cs); });
    }
  }, [open]);

  /* ─── Filter ─── */
  const filteredForn = useMemo(() => {
    const q = searchForn.trim().toLowerCase();
    if (!q) return fornecedores;
    const qDigits = q.replace(/\D/g, "");
    return fornecedores.filter((f) =>
      (f.nome || "").toLowerCase().includes(q) ||
      (f.razaoSocial || "").toLowerCase().includes(q) ||
      (f.cidade || "").toLowerCase().includes(q) ||
      (f.estado || "").toLowerCase().includes(q) ||
      (f.endereco || "").toLowerCase().includes(q) ||
      (qDigits && (f.cnpj || "").replace(/\D/g, "").includes(qDigits)),
    );
  }, [fornecedores, searchForn]);

  const selectFornecedor = (f: Fornecedor) => {
    setForm((p) => ({ ...p, fornecedorId: f.id, fornecedorNome: fornecedorLabel(f) }));
    setSearchForn("");
    setShowFornList(false);
  };

  const clearFornecedor = () => {
    setForm((p) => ({ ...p, fornecedorId: "", fornecedorNome: "" }));
    setTimeout(() => searchRef.current?.focus(), 0);
  };

  const cycleSize = () => {
    const i = SIZE_ORDER.indexOf(dialogSize);
    setDialogSize(SIZE_ORDER[(i + 1) % SIZE_ORDER.length]);
  };

  /* ─── Submit ─── */
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.fornecedorId) { toast.error("Selecione um fornecedor"); return; }

    setLoading(true);
    try {
      // Combinar data + hora para enviar ao backend
      let dataChegada = form.dataChegada || "";
      if (dataChegada && form.horaChegada) {
        dataChegada = `${dataChegada}T${form.horaChegada}`;
      }
      const payload = { ...form, dataChegada };

      const url = isEditing ? `/api/coletas/${editingColeta.id}` : "/api/coletas";
      const method = isEditing ? "PUT" : "POST";
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (!res.ok) throw new Error();
      toast.success(isEditing ? "Coleta atualizada!" : "Pedido de coleta registrado.");
      setForm({ fornecedorId: "", fornecedorNome: "", dataChegada: "", horaChegada: "", observacao: "", recorrencia: "" });
      onOpenChange(false);
      onSuccess();
    } catch {
      toast.error("Erro ao cadastrar coleta");
    } finally {
      setLoading(false);
    }
  };

  /* ─── Fornecedor selecionado (card info) ─── */
  const selectedForn = form.fornecedorId ? fornecedores.find((f) => f.id === form.fornecedorId) : null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className={`${sz.maxH} ${sz.maxW} overflow-y-auto p-0 transition-all duration-200`}>

        {/* ═══ HEADER ═══ */}
        <DialogHeader className="border-b border-[var(--fips-border)] px-6 pt-5 pb-4">
          <div className="flex items-start gap-3">
            <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-[var(--color-fips-blue-200)]">
              <Truck className="h-5 w-5 text-[var(--fips-secondary)]" />
            </div>
            <div className="min-w-0 flex-1">
              <DialogTitle>{isEditing ? "Editar coleta" : "Pedido de coleta"}</DialogTitle>
              <DialogDescription>
                Escritório → Motorista → Galpão. NF e peso serão preenchidos pelo galpão na chegada.
              </DialogDescription>
            </div>
            <button
              type="button" onClick={cycleSize}
              className="flex items-center gap-1.5 rounded-lg border border-[var(--fips-border)] px-2.5 py-1.5 text-[10px] font-semibold uppercase tracking-wider text-[var(--fips-fg-muted)] transition-colors hover:border-[var(--fips-border-strong)] hover:text-[var(--fips-fg)]"
              title={`Tamanho: ${sz.label}`}
            >
              {dialogSize === "tela-cheia" ? <Minimize2 size={13} /> : <Maximize2 size={13} />}
              {sz.label}
            </button>
          </div>
        </DialogHeader>

        {/* ═══ BODY ═══ */}
        <form onSubmit={handleSubmit} id="form-nova-coleta" className="px-6 py-5">
          <div className={isWide ? "grid grid-cols-[1fr_1fr] gap-x-8 gap-y-5" : "flex flex-col gap-5"}>

            {/* ── Fornecedor ── */}
            <div className={isWide ? "" : ""}>
              <Field density="compact" inset="icon">
                <FieldLabel required>Fornecedor</FieldLabel>

                {/* Input de busca — usa componente FIPS */}
                <div className="relative">
                  <Input
                    ref={searchRef}
                    density="compact"
                    leftIcon={
                      form.fornecedorId
                        ? <Check className="h-3.5 w-3.5" style={{ color: "var(--fips-success)" }} />
                        : <Search className="h-3.5 w-3.5" />
                    }
                    placeholder="Nome, CNPJ, cidade, UF ou endereço..."
                    value={form.fornecedorId ? form.fornecedorNome : searchForn}
                    readOnly={!!form.fornecedorId}
                    onClick={() => { if (form.fornecedorId) clearFornecedor(); }}
                    onChange={(e) => {
                      setSearchForn(e.target.value);
                      setShowFornList(true);
                      if (form.fornecedorId) clearFornecedor();
                    }}
                    onFocus={() => { if (!form.fornecedorId) setShowFornList(true); }}
                    style={form.fornecedorId ? {
                      borderColor: "var(--fips-success)",
                      background: "rgba(0,198,76,0.05)",
                    } : undefined}
                  />

                  {/* ── Dropdown ── */}
                  {showFornList && !form.fornecedorId && (
                    <div
                      className="absolute z-50 mt-1 w-full overflow-hidden rounded-xl border border-[var(--fips-border)] bg-[var(--fips-surface)]"
                      style={{ boxShadow: "var(--shadow-elevated)", maxHeight: sz.ddH, overflowY: "auto" }}
                    >
                      {filteredForn.length === 0 ? (
                        <div className="px-4 py-5 text-center text-sm text-[var(--fips-fg-muted)]">
                          Nenhum fornecedor encontrado
                        </div>
                      ) : (
                        filteredForn.slice(0, sz.ddMax).map((f) => {
                          const loc = [f.estado, f.cidade].filter(Boolean).join(" · ");
                          return (
                            <button
                              key={f.id} type="button"
                              onClick={() => selectFornecedor(f)}
                              className={`flex items-center w-full text-left transition-colors border-b border-[var(--fips-border)] hover:bg-[var(--fips-surface-muted)] ${sz.itemCls}`}
                              style={{ color: "var(--fips-fg)" }}
                            >
                              <Building2 size={sz.iconPx} className="flex-shrink-0 text-[var(--fips-fg-muted)]" />
                              <div className="flex-1 min-w-0">
                                <div className="font-medium truncate">
                                  {f.nome}
                                  {loc && (
                                    <span className="ml-1.5 font-normal text-[var(--fips-fg-muted)]">— {loc}</span>
                                  )}
                                </div>
                                {(f.cnpj || f.endereco) && (
                                  <div className={`flex items-center gap-2 mt-0.5 text-[var(--fips-fg-muted)] ${sz.subCls}`}>
                                    {f.cnpj && <span>{f.cnpj}</span>}
                                    {f.endereco && (
                                      <span className="flex items-center gap-0.5 truncate">
                                        <MapPin size={sz.iconPx - 4} className="flex-shrink-0" />
                                        {f.endereco}
                                      </span>
                                    )}
                                  </div>
                                )}
                              </div>
                            </button>
                          );
                        })
                      )}
                    </div>
                  )}
                </div>

                <FieldHint>
                  {form.fornecedorId ? "Clique no campo para trocar" : "Busque e selecione o fornecedor"}
                </FieldHint>
              </Field>

              {/* Backdrop para fechar dropdown */}
              {showFornList && !form.fornecedorId && (
                <div className="fixed inset-0 z-40" onClick={() => setShowFornList(false)} />
              )}

              {/* Card info do fornecedor selecionado */}
              {selectedForn && (selectedForn.razaoSocial || selectedForn.endereco || selectedForn.cnpj) && (
                <div className="mt-3 rounded-xl border border-[var(--fips-border)] bg-[var(--fips-surface-muted)] px-4 py-3 text-xs space-y-1.5">
                  {selectedForn.razaoSocial && (
                    <div className="flex items-baseline gap-2">
                      <span className="text-[var(--fips-fg-muted)] whitespace-nowrap">Razão Social</span>
                      <span className="font-medium text-[var(--fips-fg)]">{selectedForn.razaoSocial}</span>
                    </div>
                  )}
                  {selectedForn.cnpj && (
                    <div className="flex items-baseline gap-2">
                      <span className="text-[var(--fips-fg-muted)]">CNPJ</span>
                      <span className="font-medium text-[var(--fips-fg)]">{selectedForn.cnpj}</span>
                    </div>
                  )}
                  {selectedForn.endereco && (
                    <div className="flex items-center gap-2 text-[var(--fips-fg)]">
                      <MapPin size={11} className="flex-shrink-0 text-[var(--fips-fg-muted)]" />
                      <span>{selectedForn.endereco}</span>
                    </div>
                  )}
                </div>
              )}

              {/* Insights do fornecedor */}
              {form.fornecedorId && selectedForn && (
                <FornecedorInsights fornecedorNome={selectedForn.nome} coletas={coletasHistorico} />
              )}
            </div>

            {/* ── Agendamento + Obs ── */}
            <div className="flex flex-col gap-5">

              {/* Data + Hora lado a lado */}
              <div>
                <FieldLabel className="mb-1 text-xs font-semibold text-[var(--fips-fg)]">
                  Data e hora prevista de chegada
                </FieldLabel>
                <div className="grid grid-cols-[1fr_auto] gap-2">
                  <Input
                    density="compact"
                    type="date"
                    leftIcon={<CalendarDays className="h-3.5 w-3.5" />}
                    value={form.dataChegada}
                    onChange={(e) => setForm((f) => ({ ...f, dataChegada: e.target.value }))}
                    onClick={(e) => (e.target as HTMLInputElement).showPicker?.()}
                    className="hide-native-picker cursor-pointer"
                  />
                  <Input
                    density="compact"
                    type="time"
                    leftIcon={<Clock className="h-3.5 w-3.5" />}
                    value={form.horaChegada}
                    onChange={(e) => setForm((f) => ({ ...f, horaChegada: e.target.value }))}
                    onClick={(e) => (e.target as HTMLInputElement).showPicker?.()}
                    className="w-[130px] hide-native-picker cursor-pointer"
                  />
                </div>
                <p className="mt-1 ml-9 text-xs text-[var(--fips-fg-muted)]">Sem data = fica pendente</p>
              </div>

              {/* Recorrência melhorada */}
              <div>
                <FieldLabel className="mb-2 text-xs font-semibold text-[var(--fips-fg)]">
                  Agendamento recorrente
                </FieldLabel>

                {/* Chips de frequência */}
                <div className="flex flex-wrap gap-1.5">
                  {FREQUENCIAS.map((fr) => {
                    const active = form.recorrencia === fr.value;
                    return (
                      <button
                        key={fr.value}
                        type="button"
                        onClick={() => setForm((f) => ({ ...f, recorrencia: fr.value }))}
                        className="rounded-lg px-3 py-1.5 text-xs font-medium transition-all"
                        style={{
                          background: active ? "var(--fips-primary)" : "var(--fips-surface-muted)",
                          color: active ? "#fff" : "var(--fips-fg)",
                          border: `1.5px solid ${active ? "var(--fips-primary)" : "var(--fips-border)"}`,
                          boxShadow: active ? "0 2px 8px rgba(0,75,155,0.25)" : "none",
                        }}
                      >
                        {fr.value === "" ? "Nenhuma" : fr.label}
                      </button>
                    );
                  })}
                </div>

                {/* Lista de datas em dias úteis */}
                {form.recorrencia && form.dataChegada && (() => {
                  const tipoMap: Record<string, string> = { "3dias": "3-dias", semanal: "semanal", quinzenal: "quinzenal", mensal: "mensal", trimestral: "mensal", semestral: "mensal", anual: "mensal" };
                  const tipo = tipoMap[form.recorrencia];
                  if (!tipo) return null;
                  const datas = gerarDatasRecorrentesDiasUteis(tipo, form.dataChegada, 6);
                  if (datas.length === 0) return null;
                  const labels: Record<string, string> = { "3dias": "A cada 3 dias", semanal: "Semanal", quinzenal: "Quinzenal", mensal: "Mensal", trimestral: "Trimestral", semestral: "Semestral", anual: "Anual" };
                  return (
                    <div className="mt-3 rounded-xl overflow-hidden" style={{ border: "1px solid var(--fips-border)", background: "var(--fips-surface)" }}>
                      <div className="px-3 py-2 flex items-center justify-between" style={{ background: "linear-gradient(135deg, rgba(0,75,155,0.08), rgba(0,75,155,0.02))", borderBottom: "1px solid var(--fips-border)" }}>
                        <div className="flex items-center gap-2">
                          <CalendarPlus size={13} style={{ color: "var(--fips-primary)" }} />
                          <span className="text-[11px] font-bold" style={{ color: "var(--fips-fg)" }}>{labels[form.recorrencia] || form.recorrencia} — {datas.length} coletas (dias úteis)</span>
                        </div>
                        <span className="text-[9px] px-2 py-0.5 rounded-full font-bold" style={{ background: "var(--fips-primary)", color: "#fff" }}>Recorrente</span>
                      </div>
                      <div className="max-h-[180px] overflow-y-auto">
                        {datas.map((ds, i) => {
                          const label = new Date(ds + "T12:00:00").toLocaleDateString("pt-BR", { weekday: "short", day: "2-digit", month: "short", year: "numeric" });
                          return (
                            <div key={ds} className="flex items-center gap-3 px-3 py-2" style={{ borderBottom: i < datas.length - 1 ? "1px solid var(--fips-border)" : "none", background: i === 0 ? "rgba(0,75,155,0.04)" : "transparent" }}>
                              <div style={{ width: 10, height: 10, borderRadius: "50%", background: i === 0 ? "var(--fips-primary)" : "var(--fips-border)", boxShadow: i === 0 ? "0 0 8px rgba(0,75,155,0.3)" : "none" }} />
                              <span className="flex-1 text-[11px] font-semibold capitalize" style={{ color: i === 0 ? "var(--fips-primary)" : "var(--fips-fg)" }}>{label}</span>
                              <span className="text-[9px] font-bold px-1.5 py-0.5 rounded" style={{ background: i === 0 ? "rgba(0,75,155,0.08)" : "var(--fips-surface-muted)", color: i === 0 ? "var(--fips-primary)" : "var(--fips-fg-muted)", fontFamily: "'Fira Code',monospace" }}>#{i + 1}</span>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  );
                })()}

                {!form.recorrencia && (
                  <p className="mt-1.5 text-xs text-[var(--fips-fg-muted)]">Selecione para criar coletas automaticamente (apenas dias úteis)</p>
                )}
              </div>

              {/* Observação */}
              <Field density="compact" inset="none">
                <FieldLabel>Observação</FieldLabel>
                <Textarea
                  density="compact"
                  placeholder="Instruções para o motorista, detalhes da retirada..."
                  value={form.observacao}
                  onChange={(e) => setForm((f) => ({ ...f, observacao: e.target.value }))}
                  className={isWide ? "min-h-[100px]" : ""}
                />
              </Field>
            </div>
          </div>
        </form>

        {/* ═══ FOOTER ═══ */}
        <DialogFooter className="border-t border-[var(--fips-border)] px-6 py-3">
          <div className="flex w-full items-center justify-between gap-3">
            <p className="hidden text-xs text-[var(--fips-fg-muted)] sm:block">⌘ + Enter para salvar</p>
            <div className="flex flex-1 justify-end gap-2 sm:flex-none">
              <Button type="button" variant="secondary" onClick={() => onOpenChange(false)}>
                Cancelar
              </Button>
              <Button type="submit" form="form-nova-coleta" variant="success" loading={loading} className="gap-2">
                <Check className="h-4 w-4" /> {isEditing ? "Salvar alterações" : "Registrar pedido"}
              </Button>
            </div>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
