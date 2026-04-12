import { useState, useEffect, useMemo } from "react";
import { toast } from "sonner";
import {
  Send,
  Building2,
  Box,
  Warehouse,
  CalendarDays,
  Map as MapIcon,
  Hash,
  AlertCircle,
  Lock,
  CheckCircle2,
  Factory,
  AlignLeft,
  Check,
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Field, FieldLabel, type FieldInset } from "@/components/ui/field";

interface NovoPedidoDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
}

interface Cliente {
  id: string;
  nomeFantasia: string;
  cnpj?: string | null;
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

const ROTAS_LETRAS = "ABCDEFGHIJKLMNOPQRS".split("");
const ROTAS_ESPECIAIS = ["Rota Spot", "Rota Retire Aqui", "Rota VLI"];
const GALPOES = ["Vicente", "Oceânica", "Nova Mirim", "Goiânia"];

function ModalField({
  label,
  required = false,
  inset = "control",
  children,
}: {
  label: React.ReactNode;
  required?: boolean;
  inset?: FieldInset;
  children: React.ReactNode;
}) {
  return (
    <Field density="compact" inset={inset}>
      <FieldLabel required={required}>{label}</FieldLabel>
      {children}
    </Field>
  );
}

const EMPTY_FORM = {
  clienteId: "",
  produtoId: "",
  galpao: "Vicente",
  qtdePedido: "",
  rota: "A",
  prioridade: "Normal",
  periodicidade: "",
  dataEntrega: "",
  observacaoEscritorio: "",
};

export function NovoPedidoDialog({ open, onOpenChange, onSuccess }: NovoPedidoDialogProps) {
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState(EMPTY_FORM);
  const [clientes, setClientes] = useState<Cliente[]>([]);
  const [produtos, setProdutos] = useState<Produto[]>([]);
  const [disponibilidade, setDisponibilidade] = useState<Disponibilidade | null>(null);
  const [loadingDisp, setLoadingDisp] = useState(false);

  // Carrega listas auxiliares quando o modal abre
  useEffect(() => {
    if (!open) return;
    setForm(EMPTY_FORM);
    setDisponibilidade(null);
    Promise.all([
      fetch("/api/clientes").then((r) => r.json()),
      fetch("/api/produtos").then((r) => r.json()),
    ])
      .then(([cs, ps]) => {
        setClientes(cs);
        setProdutos(ps);
      })
      .catch(() => toast.error("Erro ao carregar listas auxiliares"));
  }, [open]);

  // REGRA R2: ao escolher produto+galpão, busca disponibilidade
  useEffect(() => {
    if (!form.produtoId || !form.galpao) {
      setDisponibilidade(null);
      return;
    }
    setLoadingDisp(true);
    fetch(
      `/api/expedicoes/disponibilidade?produtoId=${encodeURIComponent(form.produtoId)}&galpao=${encodeURIComponent(form.galpao)}`,
    )
      .then((r) => r.json())
      .then((d) => setDisponibilidade(d))
      .catch(() => setDisponibilidade(null))
      .finally(() => setLoadingDisp(false));
  }, [form.produtoId, form.galpao]);

  // Cálculo R2
  const r2 = useMemo(() => {
    const qtdePedido = Number(form.qtdePedido) || 0;
    const disponivel = disponibilidade?.unidadeDisponivel ?? 0;
    const reservado = disponibilidade?.reservado ?? 0;
    const total = disponibilidade?.unidadeTotal ?? 0;
    const reservadoNeste = Math.min(qtdePedido, disponivel);
    const aProduzir = Math.max(0, qtdePedido - disponivel);
    return { qtdePedido, total, reservado, disponivel, reservadoNeste, aProduzir };
  }, [form.qtdePedido, disponibilidade]);

  const update = (field: keyof typeof EMPTY_FORM, value: string) =>
    setForm((f) => ({ ...f, [field]: value }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.clienteId) {
      toast.error("Selecione um cliente");
      return;
    }
    if (!form.produtoId) {
      toast.error("Selecione um produto");
      return;
    }
    if (!form.qtdePedido || Number(form.qtdePedido) <= 0) {
      toast.error("Quantidade deve ser maior que zero");
      return;
    }
    setLoading(true);
    try {
      const cliente = clientes.find((c) => c.id === form.clienteId);
      const produto = produtos.find((p) => p.id === form.produtoId);
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
        dataEntrega: form.dataEntrega || null,
        observacaoEscritorio: form.observacaoEscritorio || null,
      };
      const res = await fetch("/api/expedicoes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (!res.ok) throw new Error();
      toast.success("Pedido registrado.");
      onOpenChange(false);
      onSuccess();
    } catch {
      toast.error("Erro ao criar pedido.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] max-w-3xl overflow-y-auto p-0">
        <DialogHeader className="border-b border-[var(--fips-border)] px-6 pt-5 pb-4">
          <div className="flex items-start gap-3">
            <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-[var(--color-fips-blue-200)]">
              <Send className="h-5 w-5 text-[var(--fips-secondary)]" aria-hidden />
            </div>
            <div className="min-w-0 flex-1">
              <DialogTitle>Novo pedido</DialogTitle>
              <DialogDescription>
                Pedido do cliente B2B. O sistema mostra automaticamente quanto está
                {" "}<strong className="font-semibold text-[var(--fips-fg)]">disponível</strong> no estoque vs
                {" "}<strong className="font-semibold text-[var(--fips-fg)]">reservado</strong>, e calcula
                quanto o galpão precisa produzir.
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <form id="form-pedido" onSubmit={handleSubmit} className="space-y-4 px-6 py-4">
          {/* CLIENTE + PRODUTO */}
          <div className="grid gap-x-5 gap-y-3 md:grid-cols-2">
            <ModalField label="Cliente" required inset="icon">
              <Select
                density="compact"
                aria-label="Cliente"
                leftIcon={<Building2 className="h-4 w-4" aria-hidden />}
                value={form.clienteId}
                onChange={(e) => update("clienteId", e.target.value)}
              >
                <option value="">Selecione o cliente</option>
                {clientes.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.nomeFantasia}
                  </option>
                ))}
              </Select>
            </ModalField>

            <ModalField label="Produto" required inset="icon">
              <Select
                density="compact"
                aria-label="Produto"
                leftIcon={<Box className="h-4 w-4" aria-hidden />}
                value={form.produtoId}
                onChange={(e) => update("produtoId", e.target.value)}
              >
                <option value="">Selecione o produto</option>
                {produtos.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.nome || p.descricao}
                    {p.cor ? ` · ${p.cor}` : ""}
                    {p.medida ? ` · ${p.medida}` : ""}
                  </option>
                ))}
              </Select>
            </ModalField>
          </div>

          <div className="grid gap-x-5 gap-y-3 md:grid-cols-[1fr_140px]">
            <ModalField label="Galpão" inset="icon">
              <Select
                density="compact"
                aria-label="Galpão"
                leftIcon={<Warehouse className="h-4 w-4" aria-hidden />}
                value={form.galpao}
                onChange={(e) => update("galpao", e.target.value)}
              >
                {GALPOES.map((g) => (
                  <option key={g} value={g}>
                    {g}
                  </option>
                ))}
              </Select>
            </ModalField>
            <ModalField label="Quantidade" required inset="icon">
              <Input
                density="compact"
                type="number"
                placeholder="0"
                leftIcon={<Hash className="h-4 w-4" aria-hidden />}
                value={form.qtdePedido}
                onChange={(e) => update("qtdePedido", e.target.value)}
              />
            </ModalField>
          </div>

          {/* ⚡ DISPONIBILIDADE — Regra R2 ⚡ */}
          {form.produtoId && (
            <div className="rounded-[10px_10px_10px_18px] border border-[var(--fips-border)] bg-[var(--fips-surface-soft)] p-4">
              <div className="mb-2 flex items-center gap-2">
                <AlertCircle className="h-3.5 w-3.5 text-[var(--fips-fg-muted)]" />
                <p className="text-[10px] font-bold uppercase tracking-[1px] text-[var(--fips-fg-muted)]">
                  Estoque do produto neste galpão (regra R2)
                </p>
              </div>
              {loadingDisp ? (
                <p className="text-xs text-[var(--fips-fg-muted)]">Calculando disponibilidade...</p>
              ) : (
                <>
                  <div className="grid grid-cols-3 gap-3">
                    {/* Total */}
                    <div className="rounded-lg border border-[var(--fips-border)] bg-[var(--fips-surface)] px-3 py-2">
                      <div className="flex items-center gap-1.5 text-[10px] font-semibold uppercase text-[var(--fips-fg-muted)]">
                        <Box className="h-3 w-3" /> Total
                      </div>
                      <div className="font-heading text-xl font-extrabold text-[var(--color-fips-blue-950)] dark:text-[var(--fips-fg)]">
                        {r2.total.toLocaleString("pt-BR")}
                      </div>
                    </div>
                    {/* Reservado */}
                    <div className="rounded-lg border border-[var(--fips-border)] bg-[var(--fips-surface)] px-3 py-2">
                      <div className="flex items-center gap-1.5 text-[10px] font-semibold uppercase text-[var(--fips-fg-muted)]">
                        <Lock className="h-3 w-3" /> Reservado
                      </div>
                      <div className="font-heading text-xl font-extrabold text-[var(--fips-warning)]">
                        {r2.reservado.toLocaleString("pt-BR")}
                      </div>
                    </div>
                    {/* Disponível */}
                    <div className="rounded-lg border border-[var(--fips-success-strong)]/30 bg-[var(--fips-success)]/[0.06] px-3 py-2">
                      <div className="flex items-center gap-1.5 text-[10px] font-semibold uppercase text-[var(--fips-success-strong)]">
                        <CheckCircle2 className="h-3 w-3" /> Disponível
                      </div>
                      <div className="font-heading text-xl font-extrabold text-[var(--fips-success-strong)]">
                        {r2.disponivel.toLocaleString("pt-BR")}
                      </div>
                    </div>
                  </div>

                  {/* Resolução R2 — só mostra se há quantidade pedida */}
                  {r2.qtdePedido > 0 && (
                    <div className="mt-3 grid grid-cols-2 gap-3 border-t border-[var(--fips-border)] pt-3">
                      <div className="rounded-lg border border-[var(--fips-success-strong)]/30 bg-[var(--fips-success)]/[0.06] px-3 py-2">
                        <div className="flex items-center gap-1.5 text-[10px] font-semibold uppercase text-[var(--fips-success-strong)]">
                          <Lock className="h-3 w-3" /> Reservado deste pedido
                        </div>
                        <div className="font-heading text-lg font-extrabold text-[var(--fips-success-strong)]">
                          {r2.reservadoNeste.toLocaleString("pt-BR")} un
                        </div>
                        <div className="text-[10px] text-[var(--fips-fg-muted)]">
                          Sai do estoque já existente
                        </div>
                      </div>
                      <div className="rounded-lg border border-[var(--fips-warning)]/30 bg-[var(--color-fips-orange-100)] px-3 py-2">
                        <div className="flex items-center gap-1.5 text-[10px] font-semibold uppercase text-[var(--fips-warning)]">
                          <Factory className="h-3 w-3" /> Galpão precisa produzir
                        </div>
                        <div className="font-heading text-lg font-extrabold text-[var(--fips-warning)]">
                          {r2.aProduzir.toLocaleString("pt-BR")} un
                        </div>
                        <div className="text-[10px] text-[var(--fips-fg-muted)]">
                          {r2.aProduzir > 0 ? "Ordem de produção será criada" : "Tudo do estoque"}
                        </div>
                      </div>
                    </div>
                  )}
                </>
              )}
            </div>
          )}

          {/* LOGÍSTICA */}
          <div className="pt-2">
            <p className="mb-2 ml-1.5 text-[10px] font-bold uppercase tracking-[1px] text-[var(--fips-fg-muted)]">
              Logística
            </p>
            <div className="grid gap-x-5 gap-y-3 md:grid-cols-[140px_140px_1fr]">
              <ModalField label="Rota" inset="icon">
                <Select
                  density="compact"
                  aria-label="Rota"
                  leftIcon={<MapIcon className="h-4 w-4" aria-hidden />}
                  value={form.rota}
                  onChange={(e) => update("rota", e.target.value)}
                >
                  {ROTAS_LETRAS.map((l) => (
                    <option key={l} value={l}>
                      {l}
                    </option>
                  ))}
                  {ROTAS_ESPECIAIS.map((r) => (
                    <option key={r} value={r}>
                      {r}
                    </option>
                  ))}
                </Select>
              </ModalField>
              <ModalField label="Prioridade" inset="icon">
                <Select
                  density="compact"
                  aria-label="Prioridade"
                  leftIcon={<AlertCircle className="h-4 w-4" aria-hidden />}
                  value={form.prioridade}
                  onChange={(e) => update("prioridade", e.target.value)}
                >
                  <option value="Baixa">Baixa</option>
                  <option value="Normal">Normal</option>
                  <option value="Alta">Alta</option>
                  <option value="Urgente">Urgente</option>
                </Select>
              </ModalField>
              <ModalField label="Data de entrega prevista" inset="icon">
                <Input
                  density="compact"
                  type="date"
                  leftIcon={<CalendarDays className="h-4 w-4" aria-hidden />}
                  value={form.dataEntrega}
                  onChange={(e) => update("dataEntrega", e.target.value)}
                />
              </ModalField>
            </div>
          </div>

          {/* PERIODICIDADE — R4 nota 69 */}
          <ModalField label="Periodicidade (opcional — R4)" inset="icon">
            <Select
              density="compact"
              aria-label="Periodicidade"
              leftIcon={<CalendarDays className="h-4 w-4" aria-hidden />}
              value={form.periodicidade}
              onChange={(e) => update("periodicidade", e.target.value)}
            >
              <option value="">Sem recorrência (pedido único)</option>
              <option value="3-dias">A cada 3 dias</option>
              <option value="semanal">Semanal (7 dias)</option>
              <option value="quinzenal">Quinzenal (15 dias)</option>
              <option value="mensal">Mensal (30 dias)</option>
            </Select>
          </ModalField>

          {/* OBSERVAÇÃO */}
          <div className="space-y-1">
            <p className="ml-1.5 text-[10px] font-bold uppercase tracking-[1px] text-[var(--fips-fg-muted)]">
              Observação ao escritório
            </p>
            <div className="relative">
              <AlignLeft
                className="absolute left-3 top-2.5 h-3.5 w-3.5 text-[var(--fips-fg-muted)]"
                aria-hidden
              />
              <Textarea
                density="compact"
                placeholder="Detalhes especiais, instruções de entrega..."
                value={form.observacaoEscritorio}
                onChange={(e) => update("observacaoEscritorio", e.target.value)}
                className="min-h-[60px] resize-none pl-9"
              />
            </div>
          </div>
        </form>

        <DialogFooter className="border-t border-[var(--fips-border)] px-6 py-3">
          <div className="flex w-full items-center justify-between gap-3">
            <p className="hidden text-xs text-[var(--fips-fg-muted)] sm:block">⌘ + Enter para salvar</p>
            <div className="flex flex-1 justify-end gap-2 sm:flex-none">
              <Button type="button" variant="secondary" onClick={() => onOpenChange(false)}>
                Cancelar
              </Button>
              <Button
                type="submit"
                form="form-pedido"
                variant="success"
                loading={loading}
                className="gap-2"
              >
                <Check className="h-4 w-4" aria-hidden />
                Registrar pedido
              </Button>
            </div>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
