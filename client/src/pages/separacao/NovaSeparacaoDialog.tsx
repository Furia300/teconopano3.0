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
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { QrCode, AlertTriangle } from "lucide-react";

interface Coleta {
  id: string;
  numero: number;
  nomeFantasia: string;
  status: string;
}

interface NovaSeparacaoDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
  tiposMaterial: string[];
}

const CORES = ["Branco", "Colorido", "Escuro", "Azul", "Verde", "Variado", "Preto"];

export function NovaSeparacaoDialog({ open, onOpenChange, onSuccess, tiposMaterial }: NovaSeparacaoDialogProps) {
  const [coletas, setColetas] = useState<Coleta[]>([]);
  const [loading, setLoading] = useState(false);

  const [form, setForm] = useState({
    coletaId: "",
    tipoMaterial: "",
    cor: "",
    peso: "",
    destino: "producao",
    colaborador: "",
    observacao: "",
  });

  useEffect(() => {
    if (open) {
      fetch("/api/coletas")
        .then((r) => r.json())
        .then((data: Coleta[]) => {
          setColetas(data.filter((c) => ["recebido", "em_separacao"].includes(c.status)));
        })
        .catch(console.error);
    }
  }, [open]);

  const selectedColeta = coletas.find((c) => c.id === form.coletaId);

  // Auto-detect destino based on conditions
  const getAutoDestino = (material: string, cor: string) => {
    // Materials that typically go to repanol
    if (cor === "Escuro" || cor === "Preto") return "repanol";
    return "producao";
  };

  const handleMaterialChange = (material: string) => {
    const autoDestino = getAutoDestino(material, form.cor);
    setForm((f) => ({ ...f, tipoMaterial: material, destino: autoDestino }));
  };

  const handleCorChange = (cor: string) => {
    const autoDestino = getAutoDestino(form.tipoMaterial, cor);
    setForm((f) => ({ ...f, cor, destino: autoDestino }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.coletaId || !form.tipoMaterial || !form.peso) {
      toast.error("Preencha coleta, tipo de material e peso");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch("/api/separacoes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });

      if (!res.ok) throw new Error("Erro ao registrar separação");

      toast.success("Separação registrada com sucesso!");
      setForm({ coletaId: "", tipoMaterial: "", cor: "", peso: "", destino: "producao", colaborador: "", observacao: "" });
      onOpenChange(false);
      onSuccess();
    } catch {
      toast.error("Erro ao registrar separação");
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
            <QrCode className="h-5 w-5 text-primary" />
            Nova Separação
          </DialogTitle>
          <DialogDescription>
            Classifique o material recebido por tipo, cor e destino
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Coleta de origem */}
          <div className="space-y-2">
            <label className="text-sm font-medium">Coleta de Origem *</label>
            <Select value={form.coletaId} onChange={(e) => update("coletaId", e.target.value)}>
              <option value="">Selecione a coleta</option>
              {coletas.map((c) => (
                <option key={c.id} value={c.id}>#{c.numero} — {c.nomeFantasia}</option>
              ))}
            </Select>
            {selectedColeta && (
              <p className="text-xs text-muted-foreground">
                Fornecedor: {selectedColeta.nomeFantasia}
              </p>
            )}
          </div>

          {/* Material e Cor */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Tipo Material *</label>
              <Select value={form.tipoMaterial} onChange={(e) => handleMaterialChange(e.target.value)}>
                <option value="">Selecione</option>
                {tiposMaterial.map((m) => (
                  <option key={m} value={m}>{m}</option>
                ))}
              </Select>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Cor</label>
              <Select value={form.cor} onChange={(e) => handleCorChange(e.target.value)}>
                <option value="">Selecione</option>
                {CORES.map((c) => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </Select>
            </div>
          </div>

          {/* Peso e Destino */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Peso (kg) *</label>
              <Input
                type="number"
                step="0.01"
                placeholder="0.00"
                value={form.peso}
                onChange={(e) => update("peso", e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Destino *</label>
              <Select value={form.destino} onChange={(e) => update("destino", e.target.value)}>
                <option value="producao">Produção</option>
                <option value="repanol">Repanol (manchado/tingir)</option>
                <option value="costureira">Costureira</option>
                <option value="doacao">Doação</option>
                <option value="descarte">Descarte</option>
              </Select>
            </div>
          </div>

          {/* Aviso Repanol */}
          {form.destino === "repanol" && (
            <div className="flex items-start gap-2 p-3 bg-warning/10 border border-warning/20 rounded-lg">
              <AlertTriangle className="h-4 w-4 text-warning mt-0.5 shrink-0" />
              <div className="text-sm">
                <p className="font-medium text-warning">Material será enviado para Repanol</p>
                <p className="text-muted-foreground text-xs">Manchado, molhado ou precisa tingir. Será registrado no módulo Repanol.</p>
              </div>
            </div>
          )}

          {/* Colaborador */}
          <div className="space-y-2">
            <label className="text-sm font-medium">Colaborador</label>
            <Input
              placeholder="Nome do colaborador"
              value={form.colaborador}
              onChange={(e) => update("colaborador", e.target.value)}
            />
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancelar
            </Button>
            <Button type="submit" loading={loading}>
              Registrar Separação
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
