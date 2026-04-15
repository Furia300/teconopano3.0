import { useState, useEffect } from "react";
import { toast } from "sonner";
import {
  Droplets, Truck, Box, Hash, Maximize2, Minimize2, Check, Scale,
} from "lucide-react";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Field, FieldLabel, FieldHint } from "@/components/ui/field";

/* --- Types --- */
interface Coleta {
  id: string;
  numero: number;
  nomeFantasia: string;
  status: string;
}

interface NovoRepanolDialogProps {
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

/* --- Constants --- */
const TIPOS_MATERIAL = [
  "TNT", "GSY", "TOALHA", "UNIFORME", "FRONHA", "FITILHO", "LISTRADO",
  "AVENTAL", "A9", "ESTOPA", "MALHA", "MANTA ABSORÇÃO", "PASTELÃO",
  "ATM", "A2", "ENXOVAL", "GRU", "MANTA FINA", "GR", "FUR", "BR",
  "EDREDON", "FAIXA", "LENÇOL",
];

const EMPTY_FORM = {
  coletaId: "",
  empresaFornecedor: "",
  tipoMaterial: "",
  pesoManchadoEnvio: "",
  pesoMolhadoEnvio: "",
  pesoTingidoEnvio: "",
};

/* --- Component --- */
export function NovoRepanolDialog({ open, onOpenChange, onSuccess }: NovoRepanolDialogProps) {
  const [coletas, setColetas] = useState<Coleta[]>([]);
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState(EMPTY_FORM);
  const [dialogSize, setDialogSize] = useState<DialogSize>("normal");

  const sz = SIZES[dialogSize];
  const isWide = dialogSize !== "normal";

  useEffect(() => {
    if (open) {
      setForm(EMPTY_FORM);
      fetch("/api/coletas")
        .then((r) => r.json())
        .then((data: Coleta[]) => {
          setColetas(data.filter((c) => !["finalizado", "cancelado", "pendente"].includes(c.status)));
        })
        .catch(console.error);
    }
  }, [open]);

  const totalEnvio =
    (Number(form.pesoManchadoEnvio) || 0) +
    (Number(form.pesoMolhadoEnvio) || 0) +
    (Number(form.pesoTingidoEnvio) || 0);

  const cycleSize = () => {
    const i = SIZE_ORDER.indexOf(dialogSize);
    setDialogSize(SIZE_ORDER[(i + 1) % SIZE_ORDER.length]);
  };
  const update = (field: string, value: string) => setForm((f) => ({ ...f, [field]: value }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.coletaId || totalEnvio === 0) {
      toast.error("Selecione a coleta e informe pelo menos um peso");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch("/api/repanol", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });

      if (!res.ok) throw new Error("Erro ao registrar envio");

      toast.success("Envio para Repanol registrado!");
      setForm(EMPTY_FORM);
      onOpenChange(false);
      onSuccess();
    } catch {
      toast.error("Erro ao registrar envio");
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
              <Droplets className="h-5 w-5 text-[var(--fips-secondary)]" />
            </div>
            <div className="min-w-0 flex-1">
              <DialogTitle>Novo Envio Repanol</DialogTitle>
              <DialogDescription>
                Registre o envio de material para tratamento externo (tingimento/lavagem).
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
        <form id="form-repanol" onSubmit={handleSubmit} className="px-6 py-5">
          <div className={isWide ? "grid grid-cols-2 gap-x-8 gap-y-5" : "flex flex-col gap-5"}>

            {/* -- COL 1: Coleta + Empresa + Material -- */}
            <div className="flex flex-col gap-5">
              {/* Coleta */}
              <Field density="compact" inset="icon">
                <FieldLabel required>Coleta de Origem</FieldLabel>
                <Select density="compact" leftIcon={<Truck className="h-3.5 w-3.5" />} value={form.coletaId} onChange={(e) => update("coletaId", e.target.value)}>
                  <option value="">Selecione a coleta</option>
                  {coletas.map((c) => (
                    <option key={c.id} value={c.id}>#{c.numero} — {c.nomeFantasia}</option>
                  ))}
                </Select>
                <FieldHint>Selecione a coleta vinculada ao envio</FieldHint>
              </Field>

              {/* Empresa Repanol */}
              <Field density="compact" inset="icon">
                <FieldLabel>Empresa Repanol</FieldLabel>
                <Input density="compact" leftIcon={<Box className="h-3.5 w-3.5" />}
                  placeholder="Nome da empresa"
                  value={form.empresaFornecedor}
                  onChange={(e) => update("empresaFornecedor", e.target.value)}
                />
              </Field>

              {/* Tipo Material */}
              <Field density="compact" inset="icon">
                <FieldLabel>Tipo Material</FieldLabel>
                <Select density="compact" leftIcon={<Hash className="h-3.5 w-3.5" />} value={form.tipoMaterial} onChange={(e) => update("tipoMaterial", e.target.value)}>
                  <option value="">Selecione</option>
                  {TIPOS_MATERIAL.map((m) => (
                    <option key={m} value={m}>{m}</option>
                  ))}
                </Select>
              </Field>
            </div>

            {/* -- COL 2: Pesos de envio -- */}
            <div className="flex flex-col gap-5">
              <div>
                <FieldLabel className="mb-2 text-xs font-semibold text-[var(--fips-fg)]">Pesos de Envio (kg)</FieldLabel>
                <div className="grid grid-cols-3 gap-3">
                  <Field density="compact" inset="icon">
                    <FieldLabel>Manchado</FieldLabel>
                    <Input density="compact" type="number" step="0.01" placeholder="0.00"
                      leftIcon={<Scale className="h-3.5 w-3.5" />}
                      value={form.pesoManchadoEnvio}
                      onChange={(e) => update("pesoManchadoEnvio", e.target.value)}
                    />
                  </Field>
                  <Field density="compact" inset="icon">
                    <FieldLabel>Molhado</FieldLabel>
                    <Input density="compact" type="number" step="0.01" placeholder="0.00"
                      leftIcon={<Scale className="h-3.5 w-3.5" />}
                      value={form.pesoMolhadoEnvio}
                      onChange={(e) => update("pesoMolhadoEnvio", e.target.value)}
                    />
                  </Field>
                  <Field density="compact" inset="icon">
                    <FieldLabel>Tingido</FieldLabel>
                    <Input density="compact" type="number" step="0.01" placeholder="0.00"
                      leftIcon={<Scale className="h-3.5 w-3.5" />}
                      value={form.pesoTingidoEnvio}
                      onChange={(e) => update("pesoTingidoEnvio", e.target.value)}
                    />
                  </Field>
                </div>
              </div>

              {/* Total card */}
              {totalEnvio > 0 && (
                <div className="rounded-xl border border-[var(--fips-border)] bg-[var(--fips-surface-soft)] px-4 py-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold uppercase tracking-wider text-[var(--fips-fg-muted)]">Total Envio</span>
                    <span className="font-heading text-xl font-extrabold text-[var(--color-fips-blue-950)] dark:text-[var(--fips-fg)]">
                      {totalEnvio.toLocaleString("pt-BR")} kg
                    </span>
                  </div>
                </div>
              )}
            </div>
          </div>
        </form>

        {/* === FOOTER === */}
        <DialogFooter className="border-t border-[var(--fips-border)] px-6 py-3">
          <div className="flex w-full items-center justify-between gap-3">
            <p className="hidden text-xs text-[var(--fips-fg-muted)] sm:block">⌘ + Enter para salvar</p>
            <div className="flex flex-1 justify-end gap-2 sm:flex-none">
              <Button type="button" variant="secondary" onClick={() => onOpenChange(false)}>Cancelar</Button>
              <Button type="submit" form="form-repanol" variant="success" loading={loading} className="gap-2">
                <Check className="h-4 w-4" /> Registrar Envio
              </Button>
            </div>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
