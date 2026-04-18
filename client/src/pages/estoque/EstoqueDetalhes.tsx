import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Warehouse, Package, Scale, MapPin, FileText, Calendar } from "lucide-react";

interface EstoqueItem {
  id: string;
  descricaoProduto: string;
  novaDescricao?: string | null;
  tipoMaterial?: string | null;
  cor?: string | null;
  medida?: string | null;
  acabamento?: string | null;
  kilo?: number | null;
  unidade?: number | null;
  qtdeReservadaPacote?: number | null;
  pesoMedioPct?: number | null;
  unidadeMedida?: string | null;
  galpao?: string | null;
  nomeFantasia?: string | null;
  notaFiscal?: string | null;
  status?: string | null;
  data?: string | null;
}

interface EstoqueDetalhesProps {
  item: EstoqueItem;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const statusVariant = (s: string): "success" | "warning" | "info" | "secondary" => {
  const sl = s.toLowerCase();
  if (sl === "disponivel" || sl === "disponível") return "success";
  if (sl === "reservado") return "warning";
  if (sl === "pendente") return "info";
  return "secondary";
};

export function EstoqueDetalhes({ item, open, onOpenChange }: EstoqueDetalhesProps) {
  const disp = (item.unidade ?? 0) - (item.qtdeReservadaPacote ?? 0);
  const formatDate = (s: string | null | undefined) =>
    s ? new Date(s).toLocaleDateString("pt-BR", { day: "2-digit", month: "2-digit", year: "numeric" }) : "—";

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <DialogTitle className="flex items-center gap-2">
              <Warehouse className="h-5 w-5 text-primary" />
              Estoque — {item.tipoMaterial || item.descricaoProduto}
            </DialogTitle>
            <Badge variant={statusVariant(item.status || "Pendente")} dot>
              {item.status || "Pendente"}
            </Badge>
          </div>
        </DialogHeader>

        {/* Info Grid */}
        <div className="grid grid-cols-2 gap-4 mt-4">
          <div className="space-y-3">
            <div className="flex items-start gap-3">
              <Package className="h-4 w-4 text-muted-foreground mt-0.5" />
              <div>
                <p className="text-xs text-muted-foreground">Produto</p>
                <p className="font-medium">{item.descricaoProduto}</p>
                {item.novaDescricao && item.novaDescricao !== item.descricaoProduto && (
                  <p className="text-xs text-muted-foreground">{item.novaDescricao}</p>
                )}
              </div>
            </div>

            <div className="flex items-start gap-3">
              <Package className="h-4 w-4 text-muted-foreground mt-0.5" />
              <div>
                <p className="text-xs text-muted-foreground">Material / Cor / Medida</p>
                <p className="font-medium">
                  {[item.tipoMaterial, item.cor, item.medida].filter(Boolean).join(" · ") || "—"}
                </p>
                {item.acabamento && (
                  <p className="text-xs text-muted-foreground">Acabamento: {item.acabamento}</p>
                )}
              </div>
            </div>

            <div className="flex items-start gap-3">
              <FileText className="h-4 w-4 text-muted-foreground mt-0.5" />
              <div>
                <p className="text-xs text-muted-foreground">Fornecedor</p>
                <p className="font-medium">{item.nomeFantasia || "—"}</p>
                {item.notaFiscal && (
                  <p className="text-xs text-muted-foreground">NF: {item.notaFiscal}</p>
                )}
              </div>
            </div>
          </div>

          <div className="space-y-3">
            <div className="flex items-start gap-3">
              <Scale className="h-4 w-4 text-muted-foreground mt-0.5" />
              <div>
                <p className="text-xs text-muted-foreground">Peso</p>
                <p className="font-medium">{item.kilo ? `${item.kilo.toLocaleString("pt-BR")} kg` : "—"}</p>
                {item.pesoMedioPct != null && (
                  <p className="text-xs text-muted-foreground">Peso médio/pct: {item.pesoMedioPct} kg</p>
                )}
              </div>
            </div>

            <div className="flex items-start gap-3">
              <Package className="h-4 w-4 text-muted-foreground mt-0.5" />
              <div>
                <p className="text-xs text-muted-foreground">Unidades</p>
                <p className="font-medium">{item.unidade ?? 0} {item.unidadeMedida || "un."}</p>
                <div className="flex gap-3 mt-0.5">
                  <span className="text-xs" style={{ color: "var(--fips-warning)" }}>
                    Reservado: {item.qtdeReservadaPacote ?? 0}
                  </span>
                  <span className="text-xs font-semibold" style={{ color: disp > 0 ? "var(--fips-success-strong)" : "var(--fips-fg-muted)" }}>
                    Disponível: {disp}
                  </span>
                </div>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <MapPin className="h-4 w-4 text-muted-foreground mt-0.5" />
              <div>
                <p className="text-xs text-muted-foreground">Galpão</p>
                <p className="font-medium">{item.galpao || "—"}</p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <Calendar className="h-4 w-4 text-muted-foreground mt-0.5" />
              <div>
                <p className="text-xs text-muted-foreground">Data</p>
                <p className="font-medium">{formatDate(item.data)}</p>
              </div>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
