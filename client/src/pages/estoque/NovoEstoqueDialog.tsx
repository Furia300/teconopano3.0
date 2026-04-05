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
import { ArrowDownToLine, Info } from "lucide-react";

interface Producao {
  id: string;
  coletaNumero: number;
  fornecedor: string;
  sala: string;
  tipoMaterial: string;
  cor: string;
  acabamento: string;
  medida: string;
  kilo: number;
  pesoMedio: number;
  qtdePacote: number;
  unidadeSaida: string;
  statusEstoque: string;
}

interface NovoEstoqueDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
}

export function NovoEstoqueDialog({ open, onOpenChange, onSuccess }: NovoEstoqueDialogProps) {
  const [producoes, setProducoes] = useState<Producao[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedProd, setSelectedProd] = useState<Producao | null>(null);

  const [form, setForm] = useState({
    producaoId: "",
    descricaoProduto: "",
    galpao: "Vicente",
    observacao: "",
  });

  useEffect(() => {
    if (open) {
      fetch("/api/producoes")
        .then((r) => r.json())
        .then((data: Producao[]) => {
          setProducoes(data.filter((p) => p.statusEstoque === "pendente"));
        })
        .catch(console.error);
    }
  }, [open]);

  const handleProducaoSelect = (prodId: string) => {
    const prod = producoes.find((p) => p.id === prodId);
    setSelectedProd(prod || null);
    setForm((f) => ({
      ...f,
      producaoId: prodId,
      descricaoProduto: prod ? `${prod.tipoMaterial} ${prod.cor} ${prod.medida} ${prod.acabamento}`.trim() : "",
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.producaoId) {
      toast.error("Selecione uma produção");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch("/api/estoque", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      if (!res.ok) throw new Error("Erro");

      toast.success("Entrada no estoque registrada!");
      setForm({ producaoId: "", descricaoProduto: "", galpao: "Vicente", observacao: "" });
      setSelectedProd(null);
      onOpenChange(false);
      onSuccess();
    } catch {
      toast.error("Erro ao registrar entrada");
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
            <ArrowDownToLine className="h-5 w-5 text-primary" />
            Entrada no Estoque
          </DialogTitle>
          <DialogDescription>
            Registre a entrada de produto acabado vindo da produção
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <label className="text-sm font-medium">Produção de Origem *</label>
            <Select value={form.producaoId} onChange={(e) => handleProducaoSelect(e.target.value)}>
              <option value="">Selecione a produção pendente</option>
              {producoes.map((p) => (
                <option key={p.id} value={p.id}>
                  #{p.coletaNumero} — {p.sala} — {p.tipoMaterial} {p.cor} ({p.kilo} kg)
                </option>
              ))}
            </Select>
            {producoes.length === 0 && (
              <p className="text-xs text-muted-foreground">Nenhuma produção pendente de entrada no estoque</p>
            )}
          </div>

          {/* Dados da produção selecionada */}
          {selectedProd && (
            <div className="p-3 bg-muted/50 rounded-lg space-y-2">
              <div className="flex items-center gap-2">
                <Info className="h-4 w-4 text-info" />
                <span className="text-sm font-medium">Dados da Produção</span>
              </div>
              <div className="grid grid-cols-2 gap-2 text-xs">
                <div>
                  <p className="text-muted-foreground">Material</p>
                  <p className="font-semibold">{selectedProd.tipoMaterial}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Cor</p>
                  <p className="font-semibold">{selectedProd.cor || "—"}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Sala / Acabamento</p>
                  <p className="font-semibold">{selectedProd.sala} / {selectedProd.acabamento || "—"}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Medida</p>
                  <p className="font-semibold">{selectedProd.medida || "—"}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Peso Total</p>
                  <p className="font-semibold">{selectedProd.kilo} kg</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Pacotes / Saída</p>
                  <p className="font-semibold">
                    {selectedProd.qtdePacote > 0 ? `${selectedProd.qtdePacote} pct` : "—"} / {selectedProd.unidadeSaida}
                  </p>
                </div>
              </div>
            </div>
          )}

          <div className="space-y-2">
            <label className="text-sm font-medium">Descrição do Produto</label>
            <Input
              placeholder="Descrição para identificar no estoque"
              value={form.descricaoProduto}
              onChange={(e) => update("descricaoProduto", e.target.value)}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
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
              placeholder="Observações sobre a entrada..."
              value={form.observacao}
              onChange={(e) => update("observacao", e.target.value)}
              rows={2}
            />
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancelar
            </Button>
            <Button type="submit" loading={loading}>
              Registrar Entrada
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
