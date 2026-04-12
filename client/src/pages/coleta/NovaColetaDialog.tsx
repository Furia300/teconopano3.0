import { useState, useEffect } from "react";
import { toast } from "sonner";
import {
  Truck,
  Building2,
  FileText,
  Scale,
  CalendarDays,
  Warehouse,
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
import { Field, FieldLabel, FieldHint, type FieldInset } from "@/components/ui/field";
import { GALPOES } from "@/lib/galpoes";

interface Fornecedor {
  id: string;
  nome: string;
  cnpj: string;
}

interface NovaColetaDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
}

/* ─── helper canônico (1:1 com `ModalFormDemo.tsx` do FIPS DS) ─── */
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

export function NovaColetaDialog({ open, onOpenChange, onSuccess }: NovaColetaDialogProps) {
  const [fornecedores, setFornecedores] = useState<Fornecedor[]>([]);
  const [loading, setLoading] = useState(false);

  const [form, setForm] = useState({
    fornecedorId: "",
    notaFiscal: "",
    pesoTotalNF: "",
    dataChegada: "",
    galpao: "Vicente",
    observacao: "",
  });

  useEffect(() => {
    if (open) {
      fetch("/api/fornecedores")
        .then((r) => r.json())
        .then(setFornecedores)
        .catch(console.error);
    }
  }, [open]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.fornecedorId) {
      toast.error("Selecione um fornecedor");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch("/api/coletas", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });

      if (!res.ok) throw new Error("Erro ao criar coleta");

      toast.success("Pedido de coleta registrado.");
      setForm({ fornecedorId: "", notaFiscal: "", pesoTotalNF: "", dataChegada: "", galpao: "Vicente", observacao: "" });
      onOpenChange(false);
      onSuccess();
    } catch {
      toast.error("Erro ao cadastrar coleta");
    } finally {
      setLoading(false);
    }
  };

  const update = (field: string, value: string) =>
    setForm((f) => ({ ...f, [field]: value }));

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      {/* DialogContent canônico FIPS DS Modal Form: max-h-[90vh] max-w-4xl overflow-y-auto p-0 */}
      <DialogContent className="max-h-[90vh] max-w-2xl overflow-y-auto p-0">
        {/* ─── HEADER (border-b, padding 5/6, ícone azul circular + título + descrição) ─── */}
        <DialogHeader className="border-b border-[var(--fips-border)] px-6 pt-5 pb-4">
          <div className="flex items-start gap-3">
            <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-[var(--color-fips-blue-200)]">
              <Truck className="h-5 w-5 text-[var(--fips-secondary)]" aria-hidden />
            </div>
            <div className="min-w-0 flex-1">
              <DialogTitle>Pedido de coleta</DialogTitle>
              <DialogDescription>
                Início do fluxo: agende a retirada ou chegada da matéria-prima. Com data prevista,
                o status fica <strong className="font-semibold text-[var(--fips-fg)]">Agendado</strong> até
                o recebimento no galpão.
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        {/* ─── BODY ─── */}
        <form onSubmit={handleSubmit} id="form-nova-coleta" className="space-y-4 px-6 py-4">
          <div className="grid gap-x-5 gap-y-3 md:grid-cols-2">
            {/* ═══ COLUNA ESQUERDA ═══ */}
            <div className="space-y-3">
              {/* Fornecedor — full width na coluna */}
              <ModalField label="Fornecedor" required inset="icon">
                <Select
                  density="compact"
                  aria-label="Fornecedor"
                  leftIcon={<Building2 className="h-4 w-4" aria-hidden />}
                  value={form.fornecedorId}
                  onChange={(e) => update("fornecedorId", e.target.value)}
                >
                  <option value="">Selecione o fornecedor</option>
                  {fornecedores.map((f) => (
                    <option key={f.id} value={f.id}>
                      {f.nome}
                    </option>
                  ))}
                </Select>
              </ModalField>

              {/* Nota Fiscal */}
              <ModalField label="Nota Fiscal" inset="icon">
                <Input
                  density="compact"
                  placeholder="NF-000000"
                  leftIcon={<FileText className="h-4 w-4" aria-hidden />}
                  value={form.notaFiscal}
                  onChange={(e) => update("notaFiscal", e.target.value)}
                />
              </ModalField>

              {/* Peso Total NF */}
              <ModalField label="Peso Total NF (kg)" inset="icon">
                <Input
                  density="compact"
                  type="number"
                  placeholder="0"
                  leftIcon={<Scale className="h-4 w-4" aria-hidden />}
                  value={form.pesoTotalNF}
                  onChange={(e) => update("pesoTotalNF", e.target.value)}
                />
              </ModalField>
            </div>

            {/* ═══ COLUNA DIREITA ═══ */}
            <div className="space-y-3">
              {/* Data prevista */}
              <ModalField label="Data prevista" inset="icon">
                <Input
                  density="compact"
                  type="date"
                  leftIcon={<CalendarDays className="h-4 w-4" aria-hidden />}
                  value={form.dataChegada}
                  onChange={(e) => update("dataChegada", e.target.value)}
                />
                <FieldHint>
                  Opcional — sem data, o pedido fica pendente até alguém agendar.
                </FieldHint>
              </ModalField>

              {/* Galpão */}
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
            </div>
          </div>

          {/* Observação — linha inteira */}
          <div className="space-y-1">
            <p className="ml-1.5 text-xs font-semibold uppercase tracking-[0.02em] text-[var(--fips-fg-muted)]">
              Observação
            </p>
            <div className="relative">
              <AlignLeft
                className="absolute left-3 top-2.5 h-3.5 w-3.5 text-[var(--fips-fg-muted)]"
                aria-hidden
              />
              <Textarea
                density="compact"
                placeholder="Detalhes, contexto, instruções para o motorista..."
                value={form.observacao}
                onChange={(e) => update("observacao", e.target.value)}
                className="min-h-[72px] resize-none pl-9"
              />
            </div>
          </div>
        </form>

        {/* ─── FOOTER (border-t, shortcut hint à esquerda, botões à direita) ─── */}
        <DialogFooter className="border-t border-[var(--fips-border)] px-6 py-3">
          <div className="flex w-full items-center justify-between gap-3">
            <p className="hidden text-xs text-[var(--fips-fg-muted)] sm:block">
              ⌘ + Enter para salvar
            </p>
            <div className="flex flex-1 justify-end gap-2 sm:flex-none">
              <Button type="button" variant="secondary" onClick={() => onOpenChange(false)}>
                Cancelar
              </Button>
              <Button
                type="submit"
                form="form-nova-coleta"
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
