import { useState } from "react";
import { toast } from "sonner";
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
import { Badge } from "@/components/ui/badge";
import { Field, FieldLabel } from "@/components/ui/field";
import { ArrowLeft, AlertTriangle, Scissors, Truck, Maximize2, Minimize2, Check, Weight } from "lucide-react";
import { SignaturePad } from "@/components/domain/SignaturePad";

type DialogSize = "normal" | "grande" | "tela-cheia";
const SIZES: Record<DialogSize, { maxW: string; maxH: string; label: string }> = {
  normal: { maxW: "max-w-xl", maxH: "max-h-[85vh]", label: "Normal" },
  grande: { maxW: "max-w-3xl", maxH: "max-h-[90vh]", label: "Grande" },
  "tela-cheia": { maxW: "max-w-[92vw]", maxH: "max-h-[95vh]", label: "Tela cheia" },
};
const SIZE_ORDER: DialogSize[] = ["normal", "grande", "tela-cheia"];

interface CostureiraEnvio {
  id: string;
  coletaNumero: number;
  costureira: string;
  tipoMaterial: string;
  qtdsSaidaKg: number;
  motoristaEnvio: string;
  dataEnvio: string | null;
}

interface RetornoCostureiraDialogProps {
  envio: CostureiraEnvio;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
}

export function RetornoCostureiraDialog({ envio, open, onOpenChange, onSuccess }: RetornoCostureiraDialogProps) {
  const [loading, setLoading] = useState(false);
  const [dialogSize, setDialogSize] = useState<DialogSize>("normal");
  const sz = SIZES[dialogSize];
  const isWide = dialogSize !== "normal";
  const cycleSize = () => { const i = SIZE_ORDER.indexOf(dialogSize); setDialogSize(SIZE_ORDER[(i + 1) % SIZE_ORDER.length]); };
  const [form, setForm] = useState({
    motoristaRetorno: "",
    qtdsRetornoKg: "",
    qtdsPacotesRetorno: "",
    residuos: "",
    assCostDevolucao: null as string | null,
    assMotDevolucao: null as string | null,
  });

  const retornoKg = Number(form.qtdsRetornoKg) || 0;
  const diferenca = envio.qtdsSaidaKg - retornoKg;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    setLoading(true);
    try {
      if (!form.assCostDevolucao || !form.assMotDevolucao) {
        toast.error("Ambas assinaturas são obrigatórias para registrar o retorno");
        setLoading(false);
        return;
      }
      const res = await fetch(`/api/costureira/${envio.id}/retorno`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...form,
          totalDifKg: String(diferenca),
          residuos: form.residuos || String(Math.max(diferenca, 0)),
        }),
      });
      if (!res.ok) throw new Error("Erro");

      toast.success("Retorno da costureira registrado!");
      onOpenChange(false);
      onSuccess();
    } catch {
      toast.error("Erro ao registrar retorno");
    } finally {
      setLoading(false);
    }
  };

  const update = (field: string, value: string) => setForm((f) => ({ ...f, [field]: value }));

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className={`${sz.maxH} ${sz.maxW} overflow-y-auto p-0 transition-all duration-200`}>
        <DialogHeader className="border-b border-[var(--fips-border)] px-6 pt-5 pb-4">
          <div className="flex items-start gap-3">
            <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-[var(--color-fips-blue-200)]">
              <ArrowLeft className="h-5 w-5 text-[var(--fips-secondary)]" />
            </div>
            <div className="min-w-0 flex-1">
              <DialogTitle>Retorno Costureira — #{envio.coletaNumero}</DialogTitle>
              <DialogDescription>Costureira → Motorista → Galpão · Assinaturas obrigatórias</DialogDescription>
            </div>
            <button type="button" onClick={cycleSize}
              className="flex items-center gap-1.5 rounded-lg border border-[var(--fips-border)] px-2.5 py-1.5 text-[10px] font-semibold uppercase tracking-wider text-[var(--fips-fg-muted)] transition-colors hover:border-[var(--fips-border-strong)] hover:text-[var(--fips-fg)]"
              title={`Tamanho: ${sz.label}`}>
              {dialogSize === "tela-cheia" ? <Minimize2 size={13} /> : <Maximize2 size={13} />}
              {sz.label}
            </button>
          </div>
        </DialogHeader>

        {/* Resumo do envio original */}
        <div className="mx-6 mt-4 rounded-[10px_10px_10px_18px] border border-[var(--fips-border)] bg-[var(--fips-surface-muted)] p-4">
          <div className="flex justify-between items-center mb-2">
            <div className="flex items-center gap-2">
              <Scissors className="h-4 w-4 text-[var(--fips-fg-muted)]" />
              <span className="font-semibold text-sm text-[var(--fips-fg)]">{envio.costureira}</span>
            </div>
            <Badge variant="outline">{envio.tipoMaterial}</Badge>
          </div>
          <div className="grid grid-cols-3 gap-3 text-xs">
            <div><p className="text-[var(--fips-fg-muted)]">Peso Envio</p><p className="font-bold font-mono">{envio.qtdsSaidaKg} kg</p></div>
            <div><p className="text-[var(--fips-fg-muted)]">Motorista Ida</p><p className="font-semibold">{envio.motoristaEnvio || "—"}</p></div>
            <div><p className="text-[var(--fips-fg-muted)]">Data Envio</p><p className="font-semibold font-mono">{envio.dataEnvio ? new Date(envio.dataEnvio).toLocaleDateString("pt-BR") : "—"}</p></div>
          </div>
        </div>

        <form id="form-retorno" onSubmit={handleSubmit} className="px-6 py-5">
          <div className={isWide ? "grid grid-cols-2 gap-x-8 gap-y-5" : "flex flex-col gap-5"}>
            {/* Coluna 1: Dados retorno */}
            <div className="flex flex-col gap-4">
              <div className="rounded-[10px_10px_10px_18px] border border-[var(--fips-border)] bg-[var(--fips-surface-soft)] p-4">
                <div className="mb-3 flex items-center gap-2">
                  <Truck className="h-3.5 w-3.5 text-[var(--fips-fg-muted)]" />
                  <p className="text-[10px] font-bold uppercase tracking-[1px] text-[var(--fips-fg-muted)]">Dados da Devolução</p>
                </div>
                <div className="space-y-3">
                  <div className="grid grid-cols-2 gap-3">
                    <Field density="compact">
                      <FieldLabel>Motorista Retorno</FieldLabel>
                      <Input density="compact" placeholder="Nome do motorista" leftIcon={<Truck className="h-3.5 w-3.5" />}
                        value={form.motoristaRetorno} onChange={e => update("motoristaRetorno", e.target.value)} />
                    </Field>
                    <Field density="compact">
                      <FieldLabel required>Peso Retorno (kg)</FieldLabel>
                      <Input density="compact" type="number" step="0.01" placeholder={String(envio.qtdsSaidaKg)} leftIcon={<Weight className="h-3.5 w-3.5" />}
                        value={form.qtdsRetornoKg} onChange={e => update("qtdsRetornoKg", e.target.value)} />
                    </Field>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <Field density="compact">
                      <FieldLabel>Pacotes Retorno</FieldLabel>
                      <Input density="compact" type="number" placeholder="0"
                        value={form.qtdsPacotesRetorno} onChange={e => update("qtdsPacotesRetorno", e.target.value)} />
                    </Field>
                    <Field density="compact">
                      <FieldLabel>Resíduos (kg)</FieldLabel>
                      <Input density="compact" type="number" step="0.01" placeholder={diferenca > 0 ? String(diferenca) : "0.00"}
                        value={form.residuos} onChange={e => update("residuos", e.target.value)} />
                    </Field>
                  </div>
                </div>

                {retornoKg > 0 && (
                  <div className={`mt-3 p-3 rounded-lg border flex items-start gap-2 ${diferenca > 3 ? "bg-[var(--fips-danger)]/10 border-[var(--fips-danger)]/20" : "bg-[var(--fips-success)]/10 border-[var(--fips-success)]/20"}`}>
                    <AlertTriangle className={`h-4 w-4 mt-0.5 shrink-0 ${diferenca > 3 ? "text-[var(--fips-danger)]" : "text-[var(--fips-success)]"}`} />
                    <div className="text-sm">
                      <p className="font-medium">Envio: {envio.qtdsSaidaKg} kg → Retorno: {retornoKg} kg</p>
                      <p className="text-xs text-[var(--fips-fg-muted)]">Diferença: {diferenca > 0 ? `-${diferenca}` : `+${Math.abs(diferenca)}`} kg{diferenca > 3 && " — Resíduo de costura"}</p>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Coluna 2: Assinaturas */}
            <div className="flex flex-col gap-4">
              <div className="rounded-[10px_10px_10px_18px] border border-[var(--fips-border)] bg-[var(--fips-surface-soft)] p-4">
                <div className="mb-3 flex items-center gap-2">
                  <Check className="h-3.5 w-3.5 text-[var(--fips-fg-muted)]" />
                  <p className="text-[10px] font-bold uppercase tracking-[1px] text-[var(--fips-fg-muted)]">Assinaturas — Devolução</p>
                  <span className="text-[9px] text-[var(--fips-danger)]">obrigatório</span>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <SignaturePad label="Costureira" value={form.assCostDevolucao} onChange={v => update("assCostDevolucao", v as any)} />
                  <SignaturePad label="Motorista" value={form.assMotDevolucao} onChange={v => update("assMotDevolucao", v as any)} />
                </div>
              </div>
            </div>
          </div>
        </form>

        <DialogFooter className="border-t border-[var(--fips-border)] px-6 py-3">
          <div className="flex w-full items-center justify-between gap-3">
            <p className="hidden text-xs text-[var(--fips-fg-muted)] sm:block">⌘ + Enter para salvar</p>
            <div className="flex flex-1 justify-end gap-2 sm:flex-none">
              <Button type="button" variant="secondary" onClick={() => onOpenChange(false)}>Cancelar</Button>
              <Button type="submit" form="form-retorno" disabled={loading} className="gap-2">
                <Check className="h-4 w-4" />
                {loading ? "Registrando..." : "Registrar Retorno"}
              </Button>
            </div>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
