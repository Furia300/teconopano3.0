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
import { Scissors } from "lucide-react";

interface Coleta {
  id: string;
  numero: number;
  nomeFantasia: string;
  status: string;
}

interface NovoEnvioDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
}

const COSTUREIRAS = [
  "Maria Silva (CLT)",
  "Ana Santos",
  "Joana Costa",
  "Lucia Oliveira",
  "Carla Souza",
  "Teresa Lima",
  "Paula Ferreira",
  "Rita Almeida",
];

const TIPOS_MATERIAL = [
  "TNT", "GSY", "TOALHA", "UNIFORME", "FRONHA", "FITILHO", "LISTRADO",
  "AVENTAL", "A9", "ESTOPA", "MALHA", "MANTA ABSORÇÃO", "PASTELÃO",
  "ATM", "A2", "ENXOVAL", "GRU", "MANTA FINA", "GR", "FUR", "BR",
  "EDREDON", "FAIXA", "LENÇOL",
];

export function NovoEnvioDialog({ open, onOpenChange, onSuccess }: NovoEnvioDialogProps) {
  const [coletas, setColetas] = useState<Coleta[]>([]);
  const [loading, setLoading] = useState(false);

  const [form, setForm] = useState({
    coletaId: "",
    costureira: "",
    tipoMaterial: "",
    tipoMedida: "",
    motoristaEnvio: "",
    qtdsSaidaKg: "",
    galpaoEnvio: "Vicente",
    observacao: "",
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.coletaId || !form.costureira || !form.qtdsSaidaKg) {
      toast.error("Preencha coleta, costureira e peso de saída");
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

      toast.success(`Envio para ${form.costureira} registrado!`);
      setForm({ coletaId: "", costureira: "", tipoMaterial: "", tipoMedida: "", motoristaEnvio: "", qtdsSaidaKg: "", galpaoEnvio: "Vicente", observacao: "" });
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
            <Scissors className="h-5 w-5 text-primary" />
            Novo Envio Costureira
          </DialogTitle>
          <DialogDescription>
            Registre o envio de material para costura
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
              <label className="text-sm font-medium">Costureira *</label>
              <Select value={form.costureira} onChange={(e) => update("costureira", e.target.value)}>
                <option value="">Selecione</option>
                {COSTUREIRAS.map((c) => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </Select>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Motorista Envio</label>
              <Input
                placeholder="Nome do motorista"
                value={form.motoristaEnvio}
                onChange={(e) => update("motoristaEnvio", e.target.value)}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Tipo Material</label>
              <Select value={form.tipoMaterial} onChange={(e) => update("tipoMaterial", e.target.value)}>
                <option value="">Selecione</option>
                {TIPOS_MATERIAL.map((m) => (
                  <option key={m} value={m}>{m}</option>
                ))}
              </Select>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Peso Saída (kg) *</label>
              <Input
                type="number"
                step="0.01"
                placeholder="0.00"
                value={form.qtdsSaidaKg}
                onChange={(e) => update("qtdsSaidaKg", e.target.value)}
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Observação</label>
            <Input
              placeholder="Observações sobre o envio"
              value={form.observacao}
              onChange={(e) => update("observacao", e.target.value)}
            />
          </div>

          {/* Assinatura placeholder */}
          <div className="p-3 border border-dashed rounded-lg text-center text-muted-foreground text-sm">
            <p className="font-medium">Assinaturas Digitais</p>
            <p className="text-xs">Costureira e motorista assinarão na entrega (funcionalidade mobile)</p>
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
