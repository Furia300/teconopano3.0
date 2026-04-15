import { useState, useEffect, useMemo, useRef } from "react";
import { toast } from "sonner";
import {
  Send, Building2, Box, Warehouse, CalendarDays, Clock,
  Map as MapIcon, Hash, AlertCircle, Lock, CheckCircle2,
  Factory, Check, Search, MapPin, Maximize2, Minimize2,
} from "lucide-react";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Field, FieldLabel, FieldHint, type FieldInset } from "@/components/ui/field";

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
}
interface Produto {
  id: string;
  nome?: string | null;
  descricao: string;
  cor?: string | null;
  medida?: string | null;
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
}

/* ─── Helpers ─── */
function clienteLabel(c: Cliente) {
  const parts = [c.nomeFantasia];
  if (c.estado) parts.push(c.estado);
  if (c.cidade) parts.push(c.cidade);
  return parts.join(" — ");
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
const GALPOES = ["Vicente", "Oceânica", "Nova Mirim", "Goiânia"];
const FREQUENCIAS = [
  { value: "", label: "Sem recorrência" },
  { value: "3-dias", label: "A cada 3 dias" },
  { value: "semanal", label: "Semanal" },
  { value: "quinzenal", label: "Quinzenal (15 dias)" },
  { value: "mensal", label: "Mensal" },
];

const EMPTY_FORM = {
  clienteId: "",
  clienteNome: "",
  produtoId: "",
  galpao: "Vicente",
  qtdePedido: "",
  rota: "A",
  prioridade: "Normal",
  periodicidade: "",
  dataEntrega: "",
  horaEntrega: "",
  observacaoEscritorio: "",
};

/* ─── Component ─── */
export function NovoPedidoDialog({ open, onOpenChange, onSuccess }: NovoPedidoDialogProps) {
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState(EMPTY_FORM);
  const [clientes, setClientes] = useState<Cliente[]>([]);
  const [produtos, setProdutos] = useState<Produto[]>([]);
  const [disponibilidade, setDisponibilidade] = useState<Disponibilidade | null>(null);
  const [loadingDisp, setLoadingDisp] = useState(false);
  const [searchCli, setSearchCli] = useState("");
  const [showCliList, setShowCliList] = useState(false);
  const [dialogSize, setDialogSize] = useState<DialogSize>("grande");
  const searchRef = useRef<HTMLInputElement>(null);

  const sz = SIZES[dialogSize];
  const isWide = dialogSize !== "normal";

  useEffect(() => {
    if (!open) return;
    setForm(EMPTY_FORM);
    setDisponibilidade(null);
    setSearchCli("");
    setShowCliList(false);
    Promise.all([
      fetch("/api/clientes").then((r) => r.json()),
      fetch("/api/produtos").then((r) => r.json()),
    ]).then(([cs, ps]) => { setClientes(cs); setProdutos(ps); })
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

  const selectCliente = (c: Cliente) => {
    setForm((f) => ({ ...f, clienteId: c.id, clienteNome: clienteLabel(c) }));
    setSearchCli("");
    setShowCliList(false);
  };
  const clearCliente = () => {
    setForm((f) => ({ ...f, clienteId: "", clienteNome: "" }));
    setTimeout(() => searchRef.current?.focus(), 0);
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
      const payload = {
        clienteId: form.clienteId,
        produtoId: form.produtoId,
        nomeFantasia: cliente?.nomeFantasia,
        cnpj: cliente?.cnpj,
        descricaoProduto: produto?.descricao || produto?.nome,
        cor: produto?.cor,
        medida: produto?.medida,
        qtdePedido: Number(form.qtdePedido),
        qtdeEstoque: r2.reservadoNeste,
        galpao: form.galpao,
        rota: form.rota,
        prioridade: form.prioridade,
        periodicidade: form.periodicidade || null,
        dataEntrega,
        observacaoEscritorio: form.observacaoEscritorio || null,
      };
      const res = await fetch("/api/expedicoes", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload) });
      if (!res.ok) throw new Error();
      toast.success("Pedido registrado.");
      onOpenChange(false);
      onSuccess();
    } catch { toast.error("Erro ao criar pedido."); } finally { setLoading(false); }
  };

  const selectedCli = form.clienteId ? clientes.find((c) => c.id === form.clienteId) : null;

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
              <DialogTitle>Novo pedido</DialogTitle>
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
                  {showCliList && !form.clienteId && (
                    <div className="absolute z-50 mt-1 w-full overflow-hidden rounded-xl border border-[var(--fips-border)] bg-[var(--fips-surface)]"
                      style={{ boxShadow: "var(--shadow-elevated)", maxHeight: sz.ddH, overflowY: "auto" }}>
                      {filteredCli.length === 0 ? (
                        <div className="px-4 py-5 text-center text-sm text-[var(--fips-fg-muted)]">Nenhum cliente encontrado</div>
                      ) : filteredCli.slice(0, sz.ddMax).map((c) => {
                        return (
                          <button key={c.id} type="button" onClick={() => selectCliente(c)}
                            className="flex items-center gap-2.5 w-full px-3 py-2.5 text-left text-sm transition-colors border-b border-[var(--fips-border)] hover:bg-[var(--fips-surface-muted)]"
                            style={{ color: "var(--fips-fg)" }}>
                            {c.codigoLegado && (
                              <span className="flex-shrink-0 rounded bg-[var(--fips-primary)]/10 px-1.5 py-0.5 text-[10px] font-bold tabular-nums text-[var(--fips-primary)]" style={{ fontFamily: "'Fira Code',monospace" }}>
                                {c.codigoLegado}
                              </span>
                            )}
                            {!c.codigoLegado && <Building2 size={14} className="flex-shrink-0 text-[var(--fips-fg-muted)]" />}
                            <div className="flex-1 min-w-0">
                              <div className="font-medium truncate">{c.nomeFantasia}</div>
                              {(c.cnpj || c.razaoSocial) && (
                                <div className="flex items-center gap-2 mt-0.5 text-xs text-[var(--fips-fg-muted)]">
                                  {c.cnpj && <span>{c.cnpj}</span>}
                                  {c.razaoSocial && c.razaoSocial !== c.nomeFantasia && <span className="truncate">· {c.razaoSocial}</span>}
                                </div>
                              )}
                            </div>
                          </button>
                        );
                      })}
                    </div>
                  )}
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

              {/* Produto */}
              <Field density="compact" inset="icon">
                <FieldLabel required>Produto</FieldLabel>
                <Select density="compact" leftIcon={<Box className="h-3.5 w-3.5" />} value={form.produtoId} onChange={(e) => update("produtoId", e.target.value)}>
                  <option value="">Selecione o produto</option>
                  {produtos.map((p) => <option key={p.id} value={p.id}>{p.nome || p.descricao}{p.cor ? ` · ${p.cor}` : ""}{p.medida ? ` · ${p.medida}` : ""}</option>)}
                </Select>
              </Field>

              {/* Quantidade */}
              <Field density="compact" inset="icon">
                <FieldLabel required>Quantidade</FieldLabel>
                <Input density="compact" type="number" placeholder="0" leftIcon={<Hash className="h-3.5 w-3.5" />} value={form.qtdePedido} onChange={(e) => update("qtdePedido", e.target.value)} />
                <FieldHint>Galpão: Vicente</FieldHint>
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

              {/* Periodicidade — chips */}
              <div>
                <FieldLabel className="mb-2 text-xs font-semibold text-[var(--fips-fg)]">Periodicidade</FieldLabel>
                <div className="flex flex-wrap gap-1.5">
                  {FREQUENCIAS.map((fr) => {
                    const active = form.periodicidade === fr.value;
                    return (
                      <button key={fr.value} type="button" onClick={() => update("periodicidade", fr.value)}
                        className="rounded-lg px-3 py-1.5 text-xs font-medium transition-all"
                        style={{
                          background: active ? "var(--fips-primary)" : "var(--fips-surface-muted)",
                          color: active ? "#fff" : "var(--fips-fg)",
                          border: `1.5px solid ${active ? "var(--fips-primary)" : "var(--fips-border)"}`,
                          boxShadow: active ? "0 2px 8px rgba(0,75,155,0.25)" : "none",
                        }}>
                        {fr.value === "" ? "Nenhuma" : fr.label}
                      </button>
                    );
                  })}
                </div>
                {!form.periodicidade && <p className="mt-1.5 text-xs text-[var(--fips-fg-muted)]">Pedido único — selecione para recorrência</p>}
              </div>

              {/* Observação */}
              <Field density="compact" inset="none">
                <FieldLabel>Observação ao escritório</FieldLabel>
                <Textarea density="compact" placeholder="Detalhes especiais, instruções de entrega..."
                  value={form.observacaoEscritorio} onChange={(e) => update("observacaoEscritorio", e.target.value)}
                  className={isWide ? "min-h-[100px]" : ""} />
              </Field>
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
                <Check className="h-4 w-4" /> Registrar pedido
              </Button>
            </div>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
