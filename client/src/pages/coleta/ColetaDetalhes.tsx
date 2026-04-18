import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Truck, FileText, Weight, Calendar, MapPin, QrCode } from "lucide-react";

interface Coleta {
  id: string;
  numero: number;
  nomeFantasia: string;
  cnpjFornecedor: string;
  notaFiscal: string;
  pesoTotalNF: number;
  pesoTotalAtual: number;
  dataPedido: string;
  dataChegada: string | null;
  galpao: string;
  status: string;
  statusServico: string;
  observacao: string;
}

interface ColetaDetalhesProps {
  coleta: Coleta;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const statusConfig: Record<string, { label: string; variant: "default" | "secondary" | "success" | "warning" | "danger" | "info" }> = {
  pendente: { label: "Pendente", variant: "warning" },
  agendado: { label: "Agendado", variant: "info" },
  em_rota: { label: "Em Rota", variant: "info" },
  recebido: { label: "Recebido", variant: "secondary" },
  em_separacao: { label: "Em Separação", variant: "default" },
  separado: { label: "Separado", variant: "secondary" },
  em_producao: { label: "Em Produção", variant: "info" },
  finalizado: { label: "Finalizado", variant: "success" },
  cancelado: { label: "Cancelado", variant: "danger" },
};

const etapas = ["pendente", "recebido", "em_separacao", "em_producao", "finalizado"];

export function ColetaDetalhes({ coleta, open, onOpenChange }: ColetaDetalhesProps) {
  const sc = statusConfig[coleta.status] || { label: coleta.status, variant: "secondary" as const };
  const etapaIdx = etapas.indexOf(coleta.status);
  const progressValue = etapaIdx >= 0 ? ((etapaIdx + 1) / etapas.length) * 100 : 0;

  const formatDate = (dateStr: string | null) => {
    if (!dateStr) return "—";
    return new Date(dateStr).toLocaleDateString("pt-BR", { day: "2-digit", month: "2-digit", year: "numeric", hour: "2-digit", minute: "2-digit" });
  };

  const diffPeso = coleta.pesoTotalNF && coleta.pesoTotalAtual
    ? coleta.pesoTotalNF - coleta.pesoTotalAtual
    : 0;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <DialogTitle className="flex items-center gap-2">
              <Truck className="h-5 w-5 text-primary" />
              Coleta #{coleta.numero}
            </DialogTitle>
            <Badge variant={sc.variant} dot>{sc.label}</Badge>
          </div>
        </DialogHeader>

        {/* Progress */}
        <div className="space-y-2">
          <div className="flex justify-between text-xs text-muted-foreground">
            {etapas.map((e, i) => (
              <span key={e} className={i <= etapaIdx ? "text-primary font-medium" : ""}>
                {statusConfig[e]?.label || e}
              </span>
            ))}
          </div>
          <Progress value={progressValue} />
        </div>

        {/* Info Grid */}
        <div className="grid grid-cols-2 gap-4 mt-4">
          <div className="space-y-3">
            <div className="flex items-start gap-3">
              <Truck className="h-4 w-4 text-muted-foreground mt-0.5" />
              <div>
                <p className="text-xs text-muted-foreground">Fornecedor</p>
                <p className="font-medium">{coleta.nomeFantasia}</p>
                <p className="text-xs text-muted-foreground">{coleta.cnpjFornecedor}</p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <FileText className="h-4 w-4 text-muted-foreground mt-0.5" />
              <div>
                <p className="text-xs text-muted-foreground">Nota Fiscal</p>
                <p className="font-medium">{coleta.notaFiscal || "Não informada"}</p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <MapPin className="h-4 w-4 text-muted-foreground mt-0.5" />
              <div>
                <p className="text-xs text-muted-foreground">Galpão</p>
                <p className="font-medium">{coleta.galpao}</p>
              </div>
            </div>
          </div>

          <div className="space-y-3">
            <div className="flex items-start gap-3">
              <Weight className="h-4 w-4 text-muted-foreground mt-0.5" />
              <div>
                <p className="text-xs text-muted-foreground">Peso NF / Atual</p>
                <p className="font-medium">
                  {coleta.pesoTotalNF ? `${coleta.pesoTotalNF} kg` : "—"} → {coleta.pesoTotalAtual ? `${coleta.pesoTotalAtual} kg` : "—"}
                </p>
                {diffPeso > 0 && (
                  <p className="text-xs font-semibold" style={{ color: "#ef4444" }}>Diferença: -{diffPeso} kg</p>
                )}
              </div>
            </div>

            <div className="flex items-start gap-3">
              <Calendar className="h-4 w-4 text-muted-foreground mt-0.5" />
              <div>
                <p className="text-xs text-muted-foreground">Data Pedido</p>
                <p className="font-medium">{formatDate(coleta.dataPedido)}</p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <Calendar className="h-4 w-4 text-muted-foreground mt-0.5" />
              <div>
                <p className="text-xs text-muted-foreground">Chegada</p>
                <p className="font-medium">{formatDate(coleta.dataChegada)}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Observação */}
        {coleta.observacao && (
          <div className="mt-4 p-3 bg-muted/50 rounded-lg">
            <p className="text-xs text-muted-foreground mb-1">Observação</p>
            <p className="text-sm">{coleta.observacao}</p>
          </div>
        )}

        {/* QR Code placeholder */}
        <div className="mt-4 p-4 border border-dashed rounded-lg flex items-center justify-center gap-3 text-muted-foreground">
          <QrCode className="h-8 w-8" />
          <div>
            <p className="font-medium text-sm">QR Codes das Trouxas</p>
            <p className="text-xs">Gerar QR Codes para rastreamento na separação e produção</p>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
