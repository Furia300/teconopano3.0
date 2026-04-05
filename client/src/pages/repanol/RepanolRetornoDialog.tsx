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
import { ArrowLeft, ArrowRight, AlertTriangle } from "lucide-react";

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

export function RepanolRetornoDialog({ repanol, open, onOpenChange, onSuccess }: RepanolRetornoDialogProps) {
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    pesoManchadoRetorno: "",
    pesoMolhadoRetorno: "",
    pesoTingidoRetorno: "",
    repanolResiduo: "",
  });

  const totalEnvio = repanol.pesoManchadoEnvio + repanol.pesoMolhadoEnvio + repanol.pesoTingidoEnvio;
  const totalRetorno =
    (Number(form.pesoManchadoRetorno) || 0) +
    (Number(form.pesoMolhadoRetorno) || 0) +
    (Number(form.pesoTingidoRetorno) || 0);
  const diferenca = totalEnvio - totalRetorno;

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

  const update = (field: string, value: string) => setForm((f) => ({ ...f, [field]: value }));

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <ArrowLeft className="h-5 w-5 text-primary" />
            Retorno Repanol — Coleta #{repanol.coletaNumero}
          </DialogTitle>
          <DialogDescription>
            Registre os pesos de retorno do material tratado
          </DialogDescription>
        </DialogHeader>

        {/* Resumo do envio */}
        <div className="p-3 bg-muted/50 rounded-lg space-y-2">
          <div className="flex justify-between items-center">
            <span className="text-sm font-medium">Envio Original</span>
            <Badge variant="info">{repanol.empresaFornecedor || "Repanol"}</Badge>
          </div>
          <div className="grid grid-cols-3 gap-2 text-xs">
            <div>
              <p className="text-muted-foreground">Manchado</p>
              <p className="font-semibold">{repanol.pesoManchadoEnvio} kg</p>
            </div>
            <div>
              <p className="text-muted-foreground">Molhado</p>
              <p className="font-semibold">{repanol.pesoMolhadoEnvio} kg</p>
            </div>
            <div>
              <p className="text-muted-foreground">Tingido</p>
              <p className="font-semibold">{repanol.pesoTingidoEnvio} kg</p>
            </div>
          </div>
          <p className="text-sm font-bold text-right">Total Envio: {totalEnvio} kg</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Pesos retorno */}
          <div className="space-y-3">
            <p className="text-sm font-medium flex items-center gap-2">
              <ArrowRight className="h-4 w-4" />
              Pesos de Retorno (kg)
            </p>
            <div className="grid grid-cols-3 gap-3">
              <div className="space-y-1">
                <label className="text-xs text-muted-foreground">Manchado</label>
                <Input
                  type="number"
                  step="0.01"
                  placeholder={String(repanol.pesoManchadoEnvio)}
                  value={form.pesoManchadoRetorno}
                  onChange={(e) => update("pesoManchadoRetorno", e.target.value)}
                />
              </div>
              <div className="space-y-1">
                <label className="text-xs text-muted-foreground">Molhado</label>
                <Input
                  type="number"
                  step="0.01"
                  placeholder={String(repanol.pesoMolhadoEnvio)}
                  value={form.pesoMolhadoRetorno}
                  onChange={(e) => update("pesoMolhadoRetorno", e.target.value)}
                />
              </div>
              <div className="space-y-1">
                <label className="text-xs text-muted-foreground">Tingido</label>
                <Input
                  type="number"
                  step="0.01"
                  placeholder={String(repanol.pesoTingidoEnvio)}
                  value={form.pesoTingidoRetorno}
                  onChange={(e) => update("pesoTingidoRetorno", e.target.value)}
                />
              </div>
            </div>
          </div>

          {/* Comparação */}
          {totalRetorno > 0 && (
            <div className={`p-3 rounded-lg border flex items-start gap-2 ${diferenca > 5 ? "bg-destructive/10 border-destructive/20" : "bg-success/10 border-success/20"}`}>
              <AlertTriangle className={`h-4 w-4 mt-0.5 shrink-0 ${diferenca > 5 ? "text-destructive" : "text-success"}`} />
              <div className="text-sm">
                <p className="font-medium">
                  Total Retorno: {totalRetorno.toLocaleString("pt-BR")} kg
                </p>
                <p className="text-xs text-muted-foreground">
                  Diferença: {diferenca > 0 ? `-${diferenca.toLocaleString("pt-BR")}` : `+${Math.abs(diferenca).toLocaleString("pt-BR")}`} kg
                  {diferenca > 5 && " — Resíduo significativo"}
                </p>
              </div>
            </div>
          )}

          {/* Resíduo manual */}
          <div className="space-y-2">
            <label className="text-sm font-medium">Resíduo Repanol (kg)</label>
            <Input
              type="number"
              step="0.01"
              placeholder={diferenca > 0 ? String(diferenca) : "0.00"}
              value={form.repanolResiduo}
              onChange={(e) => update("repanolResiduo", e.target.value)}
            />
            <p className="text-xs text-muted-foreground">Peso perdido no processo de tratamento</p>
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
