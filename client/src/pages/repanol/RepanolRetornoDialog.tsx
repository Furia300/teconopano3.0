import { useState } from "react";
import { toast } from "sonner";
import {
  ArrowLeft, ArrowRight, AlertTriangle, Scale, Maximize2, Minimize2, Check, Trash2,
} from "lucide-react";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Field, FieldLabel, FieldHint } from "@/components/ui/field";

/* --- Types --- */
interface Repanol {
  id: string;
  coletaNumero: number;
  fornecedor: string;
  empresaFornecedor: string;
  tipoMaterial: string;
  pesoManchadoEnvio: number;
  pesoMolhadoEnvio: number;
  pesoTingidoEnvio: number;
}

interface RepanolRetornoDialogProps {
  repanol: Repanol;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
}

/* --- Sizes --- */
type DialogSize = "normal" | "grande" | "tela-cheia";
const SIZES: Record<DialogSize, { maxW: string; maxH: string; label: string }> = {
  normal:       { maxW: "max-w-xl",     maxH: "max-h-[85vh]", label: "Normal" },
  grande:       { maxW: "max-w-3xl",    maxH: "max-h-[90vh]", label: "Grande" },
  "tela-cheia": { maxW: "max-w-[92vw]", maxH: "max-h-[95vh]", label: "Tela cheia" },
};
const SIZE_ORDER: DialogSize[] = ["normal", "grande", "tela-cheia"];

/* --- Component --- */
export function RepanolRetornoDialog({ repanol, open, onOpenChange, onSuccess }: RepanolRetornoDialogProps) {
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    pesoManchadoRetorno: "",
    pesoMolhadoRetorno: "",
    pesoTingidoRetorno: "",
    repanolResiduo: "",
  });
  const [dialogSize, setDialogSize] = useState<DialogSize>("normal");

  const sz = SIZES[dialogSize];
  const isWide = dialogSize !== "normal";

  const totalEnvio = repanol.pesoManchadoEnvio + repanol.pesoMolhadoEnvio + repanol.pesoTingidoEnvio;
  const totalRetorno =
    (Number(form.pesoManchadoRetorno) || 0) +
    (Number(form.pesoMolhadoRetorno) || 0) +
    (Number(form.pesoTingidoRetorno) || 0);
  const diferenca = totalEnvio - totalRetorno;

  const cycleSize = () => {
    const i = SIZE_ORDER.indexOf(dialogSize);
    setDialogSize(SIZE_ORDER[(i + 1) % SIZE_ORDER.length]);
  };
  const update = (field: string, value: string) => setForm((f) => ({ ...f, [field]: value }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    setLoading(true);
    try {
      const res = await fetch(`/api/repanol/${repanol.id}/retorno`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...form,
          repanolResiduo: form.repanolResiduo || String(Math.max(diferenca, 0)),
        }),
      });

      if (!res.ok) throw new Error("Erro ao registrar retorno");

      toast.success("Retorno do Repanol registrado!");
      onOpenChange(false);
      onSuccess();
    } catch {
      toast.error("Erro ao registrar retorno");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className={`${sz.maxH} ${sz.maxW} overflow-y-auto p-0 transition-all duration-200`}>
        {/* === HEADER === */}
        <DialogHeader className="border-b border-[var(--fips-border)] px-6 pt-5 pb-4">
          <div className="flex items-start gap-3">
            <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-[var(--color-fips-blue-200)]">
              <ArrowLeft className="h-5 w-5 text-[var(--fips-secondary)]" />
            </div>
            <div className="min-w-0 flex-1">
              <DialogTitle>Retorno Repanol — Coleta #{repanol.coletaNumero}</DialogTitle>
              <DialogDescription>
                Registre os pesos de retorno do material tratado.
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

        {/* === BODY === */}
        <form id="form-retorno" onSubmit={handleSubmit} className="px-6 py-5">
          <div className={isWide ? "grid grid-cols-2 gap-x-8 gap-y-5" : "flex flex-col gap-5"}>

            {/* -- COL 1: Resumo do envio original -- */}
            <div className="flex flex-col gap-5">
              {/* Envio original card */}
              <div className="rounded-xl border border-[var(--fips-border)] bg-[var(--fips-surface-muted)] px-4 py-3 space-y-3">
                <div className="flex justify-between items-center">
                  <div className="flex items-center gap-2">
                    <ArrowRight className="h-3.5 w-3.5 text-[var(--fips-fg-muted)]" />
                    <span className="text-[10px] font-bold uppercase tracking-[1px] text-[var(--fips-fg-muted)]">Envio Original</span>
                  </div>
                  <Badge variant="info">{repanol.empresaFornecedor || "Repanol"}</Badge>
                </div>
                <div className="grid grid-cols-3 gap-3">
                  <div className="rounded-lg border border-[var(--fips-border)] bg-[var(--fips-surface)] px-3 py-2">
                    <div className="text-[10px] font-semibold uppercase text-[var(--fips-fg-muted)]">Manchado</div>
                    <div className="font-heading text-lg font-extrabold text-[var(--color-fips-blue-950)] dark:text-[var(--fips-fg)]">{repanol.pesoManchadoEnvio} kg</div>
                  </div>
                  <div className="rounded-lg border border-[var(--fips-border)] bg-[var(--fips-surface)] px-3 py-2">
                    <div className="text-[10px] font-semibold uppercase text-[var(--fips-fg-muted)]">Molhado</div>
                    <div className="font-heading text-lg font-extrabold text-[var(--color-fips-blue-950)] dark:text-[var(--fips-fg)]">{repanol.pesoMolhadoEnvio} kg</div>
                  </div>
                  <div className="rounded-lg border border-[var(--fips-border)] bg-[var(--fips-surface)] px-3 py-2">
                    <div className="text-[10px] font-semibold uppercase text-[var(--fips-fg-muted)]">Tingido</div>
                    <div className="font-heading text-lg font-extrabold text-[var(--color-fips-blue-950)] dark:text-[var(--fips-fg)]">{repanol.pesoTingidoEnvio} kg</div>
                  </div>
                </div>
                <div className="flex justify-end">
                  <span className="text-sm font-bold text-[var(--fips-fg)]">Total Envio: {totalEnvio} kg</span>
                </div>
              </div>
            </div>

            {/* -- COL 2: Pesos de retorno + comparação -- */}
            <div className="flex flex-col gap-5">
              {/* Pesos retorno */}
              <div>
                <FieldLabel className="mb-2 text-xs font-semibold text-[var(--fips-fg)]">Pesos de Retorno (kg)</FieldLabel>
                <div className="grid grid-cols-3 gap-3">
                  <Field density="compact" inset="icon">
                    <FieldLabel>Manchado</FieldLabel>
                    <Input density="compact" type="number" step="0.01"
                      placeholder={String(repanol.pesoManchadoEnvio)}
                      leftIcon={<Scale className="h-3.5 w-3.5" />}
                      value={form.pesoManchadoRetorno}
                      onChange={(e) => update("pesoManchadoRetorno", e.target.value)}
                    />
                  </Field>
                  <Field density="compact" inset="icon">
                    <FieldLabel>Molhado</FieldLabel>
                    <Input density="compact" type="number" step="0.01"
                      placeholder={String(repanol.pesoMolhadoEnvio)}
                      leftIcon={<Scale className="h-3.5 w-3.5" />}
                      value={form.pesoMolhadoRetorno}
                      onChange={(e) => update("pesoMolhadoRetorno", e.target.value)}
                    />
                  </Field>
                  <Field density="compact" inset="icon">
                    <FieldLabel>Tingido</FieldLabel>
                    <Input density="compact" type="number" step="0.01"
                      placeholder={String(repanol.pesoTingidoEnvio)}
                      leftIcon={<Scale className="h-3.5 w-3.5" />}
                      value={form.pesoTingidoRetorno}
                      onChange={(e) => update("pesoTingidoRetorno", e.target.value)}
                    />
                  </Field>
                </div>
              </div>

              {/* Comparison card */}
              {totalRetorno > 0 && (
                <div className={`rounded-xl border p-3 flex items-start gap-2 ${diferenca > 5 ? "border-[var(--fips-danger)]/30 bg-[var(--fips-danger)]/[0.06]" : "border-[var(--fips-success-strong)]/30 bg-[var(--fips-success)]/[0.06]"}`}>
                  <AlertTriangle className={`h-4 w-4 mt-0.5 shrink-0 ${diferenca > 5 ? "text-[var(--fips-danger)]" : "text-[var(--fips-success-strong)]"}`} />
                  <div className="text-sm">
                    <p className="font-medium text-[var(--fips-fg)]">
                      Total Retorno: {totalRetorno.toLocaleString("pt-BR")} kg
                    </p>
                    <p className="text-xs text-[var(--fips-fg-muted)]">
                      Diferença: {diferenca > 0 ? `-${diferenca.toLocaleString("pt-BR")}` : `+${Math.abs(diferenca).toLocaleString("pt-BR")}`} kg
                      {diferenca > 5 && " — Residuo significativo"}
                    </p>
                  </div>
                </div>
              )}

              {/* Residuo manual */}
              <Field density="compact" inset="icon">
                <FieldLabel>Residuo Repanol (kg)</FieldLabel>
                <Input density="compact" type="number" step="0.01"
                  placeholder={diferenca > 0 ? String(diferenca) : "0.00"}
                  leftIcon={<Trash2 className="h-3.5 w-3.5" />}
                  value={form.repanolResiduo}
                  onChange={(e) => update("repanolResiduo", e.target.value)}
                />
                <FieldHint>Peso perdido no processo de tratamento</FieldHint>
              </Field>
            </div>
          </div>
        </form>

        {/* === FOOTER === */}
        <DialogFooter className="border-t border-[var(--fips-border)] px-6 py-3">
          <div className="flex w-full items-center justify-between gap-3">
            <p className="hidden text-xs text-[var(--fips-fg-muted)] sm:block">⌘ + Enter para salvar</p>
            <div className="flex flex-1 justify-end gap-2 sm:flex-none">
              <Button type="button" variant="secondary" onClick={() => onOpenChange(false)}>Cancelar</Button>
              <Button type="submit" form="form-retorno" variant="success" loading={loading} className="gap-2">
                <Check className="h-4 w-4" /> Registrar Retorno
              </Button>
            </div>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
