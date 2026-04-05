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
import { ArrowLeft, AlertTriangle, Scissors, Truck } from "lucide-react";

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
  const [form, setForm] = useState({
    motoristaRetorno: "",
    qtdsRetornoKg: "",
    qtdsPacotesRetorno: "",
    residuos: "",
  });

  const retornoKg = Number(form.qtdsRetornoKg) || 0;
  const diferenca = envio.qtdsSaidaKg - retornoKg;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    setLoading(true);
    try {
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
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <ArrowLeft className="h-5 w-5 text-primary" />
            Retorno Costureira — #{envio.coletaNumero}
          </DialogTitle>
          <DialogDescription>
            Registre o retorno do material costurado
          </DialogDescription>
        </DialogHeader>

        {/* Resumo envio */}
        <div className="p-3 bg-muted/50 rounded-lg space-y-2">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-2">
              <Scissors className="h-4 w-4 text-muted-foreground" />
              <span className="font-medium text-sm">{envio.costureira}</span>
            </div>
            <Badge variant="outline">{envio.tipoMaterial}</Badge>
          </div>
          <div className="grid grid-cols-3 gap-2 text-xs">
            <div>
              <p className="text-muted-foreground">Peso Envio</p>
              <p className="font-semibold">{envio.qtdsSaidaKg} kg</p>
            </div>
            <div>
              <p className="text-muted-foreground">Motorista Ida</p>
              <p className="font-semibold">{envio.motoristaEnvio || "—"}</p>
            </div>
            <div>
              <p className="text-muted-foreground">Data Envio</p>
              <p className="font-semibold">{envio.dataEnvio ? new Date(envio.dataEnvio).toLocaleDateString("pt-BR") : "—"}</p>
            </div>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Motorista Retorno</label>
              <Input
                placeholder="Nome do motorista"
                value={form.motoristaRetorno}
                onChange={(e) => update("motoristaRetorno", e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Peso Retorno (kg)</label>
              <Input
                type="number"
                step="0.01"
                placeholder={String(envio.qtdsSaidaKg)}
                value={form.qtdsRetornoKg}
                onChange={(e) => update("qtdsRetornoKg", e.target.value)}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Pacotes Retorno</label>
              <Input
                type="number"
                placeholder="0"
                value={form.qtdsPacotesRetorno}
                onChange={(e) => update("qtdsPacotesRetorno", e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Resíduos (kg)</label>
              <Input
                type="number"
                step="0.01"
                placeholder={diferenca > 0 ? String(diferenca) : "0.00"}
                value={form.residuos}
                onChange={(e) => update("residuos", e.target.value)}
              />
            </div>
          </div>

          {/* Comparação */}
          {retornoKg > 0 && (
            <div className={`p-3 rounded-lg border flex items-start gap-2 ${diferenca > 3 ? "bg-destructive/10 border-destructive/20" : "bg-success/10 border-success/20"}`}>
              <AlertTriangle className={`h-4 w-4 mt-0.5 shrink-0 ${diferenca > 3 ? "text-destructive" : "text-success"}`} />
              <div className="text-sm">
                <p className="font-medium">
                  Envio: {envio.qtdsSaidaKg} kg → Retorno: {retornoKg} kg
                </p>
                <p className="text-xs text-muted-foreground">
                  Diferença: {diferenca > 0 ? `-${diferenca}` : `+${Math.abs(diferenca)}`} kg
                  {diferenca > 3 && " — Resíduo de costura"}
                </p>
              </div>
            </div>
          )}

          {/* Assinaturas placeholder */}
          <div className="p-3 border border-dashed rounded-lg">
            <p className="text-sm font-medium text-center mb-2">Assinaturas de Devolução</p>
            <div className="grid grid-cols-2 gap-3">
              <div className="p-2 bg-muted/30 rounded text-center text-xs text-muted-foreground">
                <Scissors className="h-4 w-4 mx-auto mb-1" />
                Costureira
                <br />
                <span className="text-[10px]">(toque para assinar)</span>
              </div>
              <div className="p-2 bg-muted/30 rounded text-center text-xs text-muted-foreground">
                <Truck className="h-4 w-4 mx-auto mb-1" />
                Motorista
                <br />
                <span className="text-[10px]">(toque para assinar)</span>
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancelar
            </Button>
            <Button type="submit" loading={loading}>
              Registrar Retorno
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
