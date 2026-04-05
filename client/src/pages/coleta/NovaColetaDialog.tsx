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

      toast.success("Coleta cadastrada com sucesso!");
      setForm({ fornecedorId: "", notaFiscal: "", pesoTotalNF: "", dataChegada: "", galpao: "Vicente", observacao: "" });
      onOpenChange(false);
      onSuccess();
    } catch {
      toast.error("Erro ao cadastrar coleta");
    } finally {
      setLoading(false);
    }
  };

  const update = (field: string, value: string) => setForm((f) => ({ ...f, [field]: value }));

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>Nova Coleta</DialogTitle>
          <DialogDescription>
            Registre a entrada de matéria-prima de um fornecedor
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <label className="text-sm font-medium">Fornecedor *</label>
            <Select value={form.fornecedorId} onChange={(e) => update("fornecedorId", e.target.value)}>
              <option value="">Selecione o fornecedor</option>
              {fornecedores.map((f) => (
                <option key={f.id} value={f.id}>{f.nome}</option>
              ))}
            </Select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Nota Fiscal</label>
              <Input
                placeholder="NF-000000"
                value={form.notaFiscal}
                onChange={(e) => update("notaFiscal", e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Peso Total NF (kg)</label>
              <Input
                type="number"
                placeholder="0"
                value={form.pesoTotalNF}
                onChange={(e) => update("pesoTotalNF", e.target.value)}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Data de Chegada</label>
              <Input
                type="date"
                value={form.dataChegada}
                onChange={(e) => update("dataChegada", e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Galpão</label>
              <Select value={form.galpao} onChange={(e) => update("galpao", e.target.value)}>
                <option value="Vicente">Vicente</option>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Observação</label>
            <Textarea
              placeholder="Observações sobre a coleta..."
              value={form.observacao}
              onChange={(e) => update("observacao", e.target.value)}
              rows={3}
            />
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancelar
            </Button>
            <Button type="submit" loading={loading}>
              Cadastrar Coleta
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
