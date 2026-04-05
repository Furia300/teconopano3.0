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
import { Droplets } from "lucide-react";

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

const TIPOS_MATERIAL = [
  "TNT", "GSY", "TOALHA", "UNIFORME", "FRONHA", "FITILHO", "LISTRADO",
  "AVENTAL", "A9", "ESTOPA", "MALHA", "MANTA ABSORÇÃO", "PASTELÃO",
  "ATM", "A2", "ENXOVAL", "GRU", "MANTA FINA", "GR", "FUR", "BR",
  "EDREDON", "FAIXA", "LENÇOL",
];

export function NovoRepanolDialog({ open, onOpenChange, onSuccess }: NovoRepanolDialogProps) {
  const [coletas, setColetas] = useState<Coleta[]>([]);
  const [loading, setLoading] = useState(false);

  const [form, setForm] = useState({
    coletaId: "",
    empresaFornecedor: "",
    tipoMaterial: "",
    pesoManchadoEnvio: "",
    pesoMolhadoEnvio: "",
    pesoTingidoEnvio: "",
  });

  useEffect(() => {
    if (open) {
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
      setForm({ coletaId: "", empresaFornecedor: "", tipoMaterial: "", pesoManchadoEnvio: "", pesoMolhadoEnvio: "", pesoTingidoEnvio: "" });
      onOpenChange(false);
      onSuccess();
    } catch {
      toast.error("Erro ao registrar envio");
    } finally {
      setLoading(false);
    }
  };

  const update = (field: string, value: string) => setForm((f) => ({ ...f, [field]: value }));

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Droplets className="h-5 w-5 text-primary" />
            Novo Envio Repanol
          </DialogTitle>
          <DialogDescription>
            Registre o envio de material para tratamento externo (tingimento/lavagem)
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <label className="text-sm font-medium">Coleta de Origem *</label>
            <Select value={form.coletaId} onChange={(e) => update("coletaId", e.target.value)}>
              <option value="">Selecione a coleta</option>
              {coletas.map((c) => (
                <option key={c.id} value={c.id}>#{c.numero} — {c.nomeFantasia}</option>
              ))}
            </Select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Empresa Repanol</label>
              <Input
                placeholder="Nome da empresa"
                value={form.empresaFornecedor}
                onChange={(e) => update("empresaFornecedor", e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Tipo Material</label>
              <Select value={form.tipoMaterial} onChange={(e) => update("tipoMaterial", e.target.value)}>
                <option value="">Selecione</option>
                {TIPOS_MATERIAL.map((m) => (
                  <option key={m} value={m}>{m}</option>
                ))}
              </Select>
            </div>
          </div>

          {/* 3 categorias de peso */}
          <div className="space-y-3">
            <p className="text-sm font-medium">Pesos de Envio (kg)</p>
            <div className="grid grid-cols-3 gap-3">
              <div className="space-y-1">
                <label className="text-xs text-muted-foreground">Manchado</label>
                <Input
                  type="number"
                  step="0.01"
                  placeholder="0.00"
                  value={form.pesoManchadoEnvio}
                  onChange={(e) => update("pesoManchadoEnvio", e.target.value)}
                />
              </div>
              <div className="space-y-1">
                <label className="text-xs text-muted-foreground">Molhado</label>
                <Input
                  type="number"
                  step="0.01"
                  placeholder="0.00"
                  value={form.pesoMolhadoEnvio}
                  onChange={(e) => update("pesoMolhadoEnvio", e.target.value)}
                />
              </div>
              <div className="space-y-1">
                <label className="text-xs text-muted-foreground">Tingido</label>
                <Input
                  type="number"
                  step="0.01"
                  placeholder="0.00"
                  value={form.pesoTingidoEnvio}
                  onChange={(e) => update("pesoTingidoEnvio", e.target.value)}
                />
              </div>
            </div>
            {totalEnvio > 0 && (
              <p className="text-sm font-semibold text-right">Total Envio: {totalEnvio.toLocaleString("pt-BR")} kg</p>
            )}
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancelar
            </Button>
            <Button type="submit" loading={loading}>
              Registrar Envio
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
