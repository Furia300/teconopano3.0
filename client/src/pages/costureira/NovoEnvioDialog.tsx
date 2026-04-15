import { useState, useEffect } from "react";
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
import { Select } from "@/components/ui/select";
import { Field, FieldLabel, FieldHint } from "@/components/ui/field";
import { Scissors, Maximize2, Minimize2, Check, Truck, Weight } from "lucide-react";
import { SignaturePad } from "@/components/domain/SignaturePad";

type DialogSize = "normal" | "grande" | "tela-cheia";
const SIZES: Record<DialogSize, { maxW: string; maxH: string; label: string }> = {
  normal: { maxW: "max-w-xl", maxH: "max-h-[85vh]", label: "Normal" },
  grande: { maxW: "max-w-3xl", maxH: "max-h-[90vh]", label: "Grande" },
  "tela-cheia": { maxW: "max-w-[92vw]", maxH: "max-h-[95vh]", label: "Tela cheia" },
};
const SIZE_ORDER: DialogSize[] = ["normal", "grande", "tela-cheia"];

interface Coleta {
  id: string;
  numero: number;
  nomeFantasia: string;
  status: string;
}

interface CostureiraExterna {
  id: string;
  nome: string;
  telefone?: string;
  ativo: boolean;
}

interface NovoEnvioDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
}

const TIPOS_MATERIAL = [
  "TNT", "GSY", "TOALHA", "UNIFORME", "FRONHA", "FITILHO", "LISTRADO",
  "AVENTAL", "A9", "ESTOPA", "MALHA", "MANTA ABSORÇÃO", "PASTELÃO",
  "ATM", "A2", "ENXOVAL", "GRU", "MANTA FINA", "GR", "FUR", "BR",
  "EDREDON", "FAIXA", "LENÇOL",
];

export function NovoEnvioDialog({ open, onOpenChange, onSuccess }: NovoEnvioDialogProps) {
  const [coletas, setColetas] = useState<Coleta[]>([]);
  const [costureiras, setCostureiras] = useState<CostureiraExterna[]>([]);
  const [motoristas, setMotoristas] = useState<{ id: string; nome: string }[]>([]);
  const [loading, setLoading] = useState(false);
  const [dialogSize, setDialogSize] = useState<DialogSize>("normal");
  const sz = SIZES[dialogSize];
  const isWide = dialogSize !== "normal";
  const cycleSize = () => { const i = SIZE_ORDER.indexOf(dialogSize); setDialogSize(SIZE_ORDER[(i + 1) % SIZE_ORDER.length]); };

  const [form, setForm] = useState({
    coletaId: "",
    costureira: "",
    tipoMaterial: "",
    tipoMedida: "",
    motoristaEnvio: "",
    qtdsSaidaKg: "",
    galpaoEnvio: "Vicente",
    observacao: "",
    assCostEntrega: null as string | null,
    assMotEntrega: null as string | null,
  });

  useEffect(() => {
    if (open) {
      fetch("/api/coletas").then(r => r.json())
        .then((data: Coleta[]) => setColetas(data.filter(c => !["finalizado", "cancelado", "pendente"].includes(c.status))))
        .catch(console.error);
      fetch("/api/costureiras-externas").then(r => r.json())
        .then((data: CostureiraExterna[]) => setCostureiras(data.filter(c => c.ativo)))
        .catch(console.error);
      fetch("/api/motoristas").then(r => r.json())
        .then((data: any[]) => setMotoristas(data.filter((m: any) => m.ativo !== false).map((m: any) => ({ id: m.id, nome: m.nome || m.name }))))
        .catch(console.error);
    }
  }, [open]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.coletaId || !form.costureira || !form.qtdsSaidaKg) {
      toast.error("Preencha coleta, costureira e peso de saída");
      return;
    }
    if (!form.assCostEntrega || !form.assMotEntrega) {
      toast.error("Ambas assinaturas (costureira e motorista) são obrigatórias");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch("/api/costureira", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      if (!res.ok) throw new Error("Erro");

      toast.success(`Envio para ${form.costureira} registrado com assinaturas!`);
      setForm({ coletaId: "", costureira: "", tipoMaterial: "", tipoMedida: "", motoristaEnvio: "", qtdsSaidaKg: "", galpaoEnvio: "Vicente", observacao: "", assCostEntrega: null, assMotEntrega: null });
      onOpenChange(false);
      onSuccess();
    } catch {
      toast.error("Erro ao registrar envio");
    } finally {
      setLoading(false);
    }
  };

  const update = (field: string, value: any) => setForm(f => ({ ...f, [field]: value }));

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className={`${sz.maxH} ${sz.maxW} overflow-y-auto p-0 transition-all duration-200`}>
        <DialogHeader className="border-b border-[var(--fips-border)] px-6 pt-5 pb-4">
          <div className="flex items-start gap-3">
            <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-[var(--color-fips-blue-200)]">
              <Scissors className="h-5 w-5 text-[var(--fips-secondary)]" />
            </div>
            <div className="min-w-0 flex-1">
              <DialogTitle>Envio para Costureira</DialogTitle>
              <DialogDescription>Galpão → Motorista → Costureira · Assinaturas obrigatórias</DialogDescription>
            </div>
            <button type="button" onClick={cycleSize}
              className="flex items-center gap-1.5 rounded-lg border border-[var(--fips-border)] px-2.5 py-1.5 text-[10px] font-semibold uppercase tracking-wider text-[var(--fips-fg-muted)] transition-colors hover:border-[var(--fips-border-strong)] hover:text-[var(--fips-fg)]"
              title={`Tamanho: ${sz.label}`}>
              {dialogSize === "tela-cheia" ? <Minimize2 size={13} /> : <Maximize2 size={13} />}
              {sz.label}
            </button>
          </div>
        </DialogHeader>

        <form id="form-envio" onSubmit={handleSubmit} className="px-6 py-5">
          <div className={isWide ? "grid grid-cols-2 gap-x-8 gap-y-5" : "flex flex-col gap-5"}>
            {/* Coluna 1: Dados do envio */}
            <div className="flex flex-col gap-4">
              <div className="rounded-[10px_10px_10px_18px] border border-[var(--fips-border)] bg-[var(--fips-surface-soft)] p-4">
                <div className="mb-3 flex items-center gap-2">
                  <Scissors className="h-3.5 w-3.5 text-[var(--fips-fg-muted)]" />
                  <p className="text-[10px] font-bold uppercase tracking-[1px] text-[var(--fips-fg-muted)]">Dados do Envio</p>
                </div>

                <div className="space-y-3">
                  <Field density="compact">
                    <FieldLabel required>Coleta de Origem</FieldLabel>
                    <Select value={form.coletaId} onChange={e => update("coletaId", e.target.value)}>
                      <option value="">Selecione a coleta</option>
                      {coletas.map(c => <option key={c.id} value={c.id}>#{c.numero} — {c.nomeFantasia}</option>)}
                    </Select>
                  </Field>

                  <div className="grid grid-cols-2 gap-3">
                    <Field density="compact">
                      <FieldLabel required>Costureira</FieldLabel>
                      <Select value={form.costureira} onChange={e => update("costureira", e.target.value)}>
                        <option value="">Selecione</option>
                        {costureiras.map(c => <option key={c.id} value={c.nome}>{c.nome}</option>)}
                      </Select>
                    </Field>
                    <Field density="compact">
                      <FieldLabel required>Motorista</FieldLabel>
                      <Select value={form.motoristaEnvio} onChange={e => update("motoristaEnvio", e.target.value)}>
                        <option value="">Selecione</option>
                        {motoristas.map(m => <option key={m.id} value={m.nome}>{m.nome}</option>)}
                      </Select>
                    </Field>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <Field density="compact">
                      <FieldLabel>Tipo Material</FieldLabel>
                      <Select value={form.tipoMaterial} onChange={e => update("tipoMaterial", e.target.value)}>
                        <option value="">Selecione</option>
                        {TIPOS_MATERIAL.map(m => <option key={m} value={m}>{m}</option>)}
                      </Select>
                    </Field>
                    <Field density="compact">
                      <FieldLabel required>Peso Saída (kg)</FieldLabel>
                      <Input density="compact" type="number" step="0.01" placeholder="0.00" leftIcon={<Weight className="h-3.5 w-3.5" />}
                        value={form.qtdsSaidaKg} onChange={e => update("qtdsSaidaKg", e.target.value)} />
                    </Field>
                  </div>

                  <Field density="compact">
                    <FieldLabel>Observação</FieldLabel>
                    <Input density="compact" placeholder="Observações sobre o envio"
                      value={form.observacao} onChange={e => update("observacao", e.target.value)} />
                  </Field>
                </div>
              </div>
            </div>

            {/* Coluna 2: Assinaturas */}
            <div className="flex flex-col gap-4">
              <div className="rounded-[10px_10px_10px_18px] border border-[var(--fips-border)] bg-[var(--fips-surface-soft)] p-4">
                <div className="mb-3 flex items-center gap-2">
                  <Check className="h-3.5 w-3.5 text-[var(--fips-fg-muted)]" />
                  <p className="text-[10px] font-bold uppercase tracking-[1px] text-[var(--fips-fg-muted)]">Assinaturas — Entrega</p>
                  <span className="text-[9px] text-[var(--fips-danger)]">obrigatório</span>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <SignaturePad label="Costureira" value={form.assCostEntrega} onChange={v => update("assCostEntrega", v)} />
                  <SignaturePad label="Motorista" value={form.assMotEntrega} onChange={v => update("assMotEntrega", v)} />
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
              <Button type="submit" form="form-envio" disabled={loading} className="gap-2">
                <Check className="h-4 w-4" />
                {loading ? "Registrando..." : "Registrar Envio"}
              </Button>
            </div>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
