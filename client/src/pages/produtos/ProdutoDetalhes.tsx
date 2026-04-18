import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Box, Layers, Palette, Scale, DollarSign } from "lucide-react";

interface Produto {
  id: string;
  codigo?: string | null;
  nome?: string | null;
  descricao: string;
  tipoMaterial?: string | null;
  cor?: string | null;
  medida?: string | null;
  acabamento?: string | null;
  pesoMedio?: number | null;
  unidadeMedida?: string | null;
  precoCusto?: number | null;
  precoVenda?: number | null;
  ativo?: boolean;
}

interface ProdutoDetalhesProps {
  produto: Produto;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const formatCurrency = (n: number | null | undefined) =>
  n != null ? `R$ ${n.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}` : "—";

export function ProdutoDetalhes({ produto, open, onOpenChange }: ProdutoDetalhesProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <DialogTitle className="flex items-center gap-2">
              <Box className="h-5 w-5 text-primary" />
              {produto.nome || produto.descricao}
            </DialogTitle>
            <Badge variant={produto.ativo !== false ? "success" : "secondary"} dot>
              {produto.ativo !== false ? "Ativo" : "Inativo"}
            </Badge>
          </div>
        </DialogHeader>

        {/* Info Grid */}
        <div className="grid grid-cols-2 gap-4 mt-4">
          <div className="space-y-3">
            {produto.codigo && (
              <div className="flex items-start gap-3">
                <Layers className="h-4 w-4 text-muted-foreground mt-0.5" />
                <div>
                  <p className="text-xs text-muted-foreground">Código</p>
                  <p className="font-medium font-mono">{produto.codigo}</p>
                </div>
              </div>
            )}

            <div className="flex items-start gap-3">
              <Box className="h-4 w-4 text-muted-foreground mt-0.5" />
              <div>
                <p className="text-xs text-muted-foreground">Descrição</p>
                <p className="font-medium">{produto.descricao}</p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <Layers className="h-4 w-4 text-muted-foreground mt-0.5" />
              <div>
                <p className="text-xs text-muted-foreground">Tipo Material</p>
                <p className="font-medium">{produto.tipoMaterial || "—"}</p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <Palette className="h-4 w-4 text-muted-foreground mt-0.5" />
              <div>
                <p className="text-xs text-muted-foreground">Cor / Medida / Acabamento</p>
                <p className="font-medium">
                  {[produto.cor, produto.medida, produto.acabamento].filter(Boolean).join(" · ") || "—"}
                </p>
              </div>
            </div>
          </div>

          <div className="space-y-3">
            <div className="flex items-start gap-3">
              <Scale className="h-4 w-4 text-muted-foreground mt-0.5" />
              <div>
                <p className="text-xs text-muted-foreground">Peso Médio</p>
                <p className="font-medium">{produto.pesoMedio ? `${produto.pesoMedio} kg` : "—"}</p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <Layers className="h-4 w-4 text-muted-foreground mt-0.5" />
              <div>
                <p className="text-xs text-muted-foreground">Unidade de Medida</p>
                <p className="font-medium">{produto.unidadeMedida || "—"}</p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <DollarSign className="h-4 w-4 text-muted-foreground mt-0.5" />
              <div>
                <p className="text-xs text-muted-foreground">Preço Custo</p>
                <p className="font-medium">{formatCurrency(produto.precoCusto)}</p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <DollarSign className="h-4 w-4 text-muted-foreground mt-0.5" />
              <div>
                <p className="text-xs text-muted-foreground">Preço Venda</p>
                <p className="font-medium" style={{ color: "var(--fips-success-strong)" }}>
                  {formatCurrency(produto.precoVenda)}
                </p>
              </div>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
