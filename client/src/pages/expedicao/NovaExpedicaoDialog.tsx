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
import { Package, Info } from "lucide-react";

interface EstoqueItem {
  id: string;
  descricaoProduto: string;
  tipoMaterial: string;
  cor: string;
  kilo: number;
  unidade: number;
  qtdeReservadaPacote: number;
  status: string;
}

interface Cliente {
  id: string;
  nome: string;
  cnpj: string;
}

interface NovaExpedicaoDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
}

const ROTAS = ["Spot", "Retire Aqui", "Rota Fixa", "Entrega Expressa"];
const PRIORIDADES = ["Normal", "Urgente", "Baixa"];

export function NovaExpedicaoDialog({ open, onOpenChange, onSuccess }: NovaExpedicaoDialogProps) {
  const [estoque, setEstoque] = useState<EstoqueItem[]>([]);
  const [clientes, setClientes] = useState<Cliente[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedEstoque, setSelectedEstoque] = useState<EstoqueItem | null>(null);

  const [form, setForm] = useState({
    clienteId: "",
    estoqueId: "",
    qtdeSolicitada: "",
    rota: "",
    prioridade: "Normal",
    observacaoEscritorio: "",
  });

  useEffect(() => {
    if (open) {
      fetch("/api/estoque")
        .then((r) => r.json())
        .then((data: EstoqueItem[]) => setEstoque(data.filter((e) => e.status === "Disponivel")))
        .catch(console.error);

      fetch("/api/clientes")
        .then((r) => r.json())
        .then(setClientes)
        .catch(console.error);
    }
  }, [open]);

  const handleEstoqueSelect = (estoqueId: string) => {
    const item = estoque.find((e) => e.id === estoqueId);
    setSelectedEstoque(item || null);
    setForm((f) => ({ ...f, estoqueId }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.clienteId || !form.estoqueId) {
      toast.error("Selecione cliente e produto do estoque");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch("/api/expedicoes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      if (!res.ok) throw new Error("Erro");

      toast.success("Expedição criada! Aguardando aprovação financeira.");
      setForm({ clienteId: "", estoqueId: "", qtdeSolicitada: "", rota: "", prioridade: "Normal", observacaoEscritorio: "" });
      setSelectedEstoque(null);
      onOpenChange(false);
      onSuccess();
    } catch {
      toast.error("Erro ao criar expedição");
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
            <Package className="h-5 w-5 text-primary" />
            Nova Expedição
          </DialogTitle>
          <DialogDescription>
            Monte o pedido do cliente a partir do estoque disponível
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Cliente */}
          <div className="space-y-2">
            <label className="text-sm font-medium">Cliente *</label>
            <Select value={form.clienteId} onChange={(e) => update("clienteId", e.target.value)}>
              <option value="">Selecione o cliente</option>
              {clientes.map((c) => (
                <option key={c.id} value={c.id}>{c.nome} — {c.cnpj}</option>
              ))}
            </Select>
          </div>

          {/* Produto do estoque */}
          <div className="space-y-2">
            <label className="text-sm font-medium">Produto do Estoque *</label>
            <Select value={form.estoqueId} onChange={(e) => handleEstoqueSelect(e.target.value)}>
              <option value="">Selecione o produto</option>
              {estoque.map((e) => {
                const disp = e.unidade > 0 ? `${e.unidade - e.qtdeReservadaPacote} un disp.` : `${e.kilo} kg`;
                return (
                  <option key={e.id} value={e.id}>
                    {e.descricaoProduto} ({disp})
                  </option>
                );
              })}
            </Select>
          </div>

          {/* Info estoque selecionado */}
          {selectedEstoque && (
            <div className="p-3 bg-muted/50 rounded-lg space-y-2">
              <div className="flex items-center gap-2">
                <Info className="h-4 w-4 text-info" />
                <span className="text-sm font-medium">Estoque Selecionado</span>
              </div>
              <div className="grid grid-cols-3 gap-2 text-xs">
                <div>
                  <p className="text-muted-foreground">Material</p>
                  <p className="font-semibold">{selectedEstoque.tipoMaterial}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Cor</p>
                  <p className="font-semibold">{selectedEstoque.cor || "—"}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Disponível</p>
                  <p className="font-semibold">
                    {selectedEstoque.unidade > 0
                      ? `${selectedEstoque.unidade - selectedEstoque.qtdeReservadaPacote} un`
                      : `${selectedEstoque.kilo} kg`
                    }
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Quantidade e logística */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Qtde Solicitada</label>
              <Input
                type="number"
                placeholder="Pacotes ou kg"
                value={form.qtdeSolicitada}
                onChange={(e) => update("qtdeSolicitada", e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Rota</label>
              <Select value={form.rota} onChange={(e) => update("rota", e.target.value)}>
                <option value="">Selecione</option>
                {ROTAS.map((r) => (
                  <option key={r} value={r}>{r}</option>
                ))}
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Prioridade</label>
            <Select value={form.prioridade} onChange={(e) => update("prioridade", e.target.value)}>
              {PRIORIDADES.map((p) => (
                <option key={p} value={p}>{p}</option>
              ))}
            </Select>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Observação</label>
            <Textarea
              placeholder="Observações do escritório..."
              value={form.observacaoEscritorio}
              onChange={(e) => update("observacaoEscritorio", e.target.value)}
              rows={2}
            />
          </div>

          {/* Cadeia de aprovação info */}
          <div className="p-3 bg-info/10 border border-info/20 rounded-lg text-sm">
            <p className="font-medium text-info">Cadeia de Aprovação</p>
            <p className="text-xs text-muted-foreground mt-1">
              Galpão separa → <strong>Financeiro aprova</strong> → <strong>NF emitida</strong> → Entrega liberada
            </p>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancelar
            </Button>
            <Button type="submit" loading={loading}>
              Criar Expedição
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
