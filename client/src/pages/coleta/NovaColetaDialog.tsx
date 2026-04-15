import { useState, useEffect, useMemo, useRef } from "react";
import { toast } from "sonner";
import {
  Truck, Building2, CalendarDays, Clock,
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

export function NovaColetaDialog({ open, onOpenChange, onSuccess }: NovaColetaDialogProps) {
  const [fornecedores, setFornecedores] = useState<Fornecedor[]>([]);
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
      fetch("/api/fornecedores").then((r) => r.json()).then(setFornecedores);
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

      const res = await fetch("/api/coletas", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (!res.ok) throw new Error();
      toast.success("Pedido de coleta registrado.");
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
              <DialogTitle>Pedido de coleta</DialogTitle>
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

                {/* Preview da próxima data se recorrência + data selecionadas */}
                {form.recorrencia && form.dataChegada && (() => {
                  const base = new Date(form.dataChegada + "T12:00:00");
                  if (isNaN(base.getTime())) return null;
                  const next = new Date(base);
                  switch (form.recorrencia) {
                    case "3dias":     next.setDate(next.getDate() + 3); break;
                    case "semanal":   next.setDate(next.getDate() + 7); break;
                    case "quinzenal": next.setDate(next.getDate() + 15); break;
                    case "mensal":    next.setMonth(next.getMonth() + 1); break;
                    case "trimestral":next.setMonth(next.getMonth() + 3); break;
                    case "semestral": next.setMonth(next.getMonth() + 6); break;
                    case "anual":     next.setFullYear(next.getFullYear() + 1); break;
                    default: return null;
                  }
                  const fmt = next.toLocaleDateString("pt-BR", { day: "2-digit", month: "short", year: "numeric" });
                  return (
                    <div className="mt-2 flex items-center gap-2 rounded-lg border border-[var(--fips-border)] bg-[var(--fips-surface-muted)] px-3 py-2 text-xs">
                      <CalendarPlus size={13} className="flex-shrink-0 text-[var(--fips-primary)]" />
                      <span className="text-[var(--fips-fg-muted)]">Próxima coleta automática:</span>
                      <span className="font-semibold text-[var(--fips-fg)]">{fmt}</span>
                    </div>
                  );
                })()}

                {!form.recorrencia && (
                  <p className="mt-1.5 text-xs text-[var(--fips-fg-muted)]">Selecione para criar coletas automaticamente</p>
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
                <Check className="h-4 w-4" /> Registrar pedido
              </Button>
            </div>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
