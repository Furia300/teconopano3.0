import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Package, User, FileText, DollarSign, Truck, MapPin, Weight } from "lucide-react";

interface Expedicao {
  id: string;
  nomeFantasia?: string | null;
  razaoSocial?: string | null;
  cnpj?: string | null;
  contato?: string | null;
  descricaoProduto?: string | null;
  tipoMaterial?: string | null;
  cor?: string | null;
  medida?: string | null;
  kilo?: number | null;
  kiloSolicitada?: number | null;
  unidade?: number | null;
  qtdePedido?: number | null;
  unidadeMedida?: string | null;
  statusPedido?: string | null;
  statusEntrega?: string | null;
  statusFinanceiro?: string | null;
  statusNota?: string | null;
  galpao?: string | null;
  rota?: string | null;
  prioridade?: string | null;
  notaFiscal?: string | null;
  observacaoEscritorio?: string | null;
  observacaoGalpao?: string | null;
  createdAt?: string | null;
}

interface ExpedicaoDetalhesProps {
  expedicao: Expedicao;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const etapas = [
  { key: "pedido", label: "Pedido" },
  { key: "financeiro", label: "Financeiro" },
  { key: "nf", label: "Emissão NF" },
  { key: "entrega", label: "Entrega" },
];

function getEtapaAtual(exp: Expedicao): number {
  if (exp.statusEntrega === "entregue") return 4;
  if (exp.statusNota === "emitida") return 3;
  if (exp.statusFinanceiro === "aprovado") return 2;
  return 1;
}

export function ExpedicaoDetalhes({ expedicao, open, onOpenChange }: ExpedicaoDetalhesProps) {
  const etapaAtual = getEtapaAtual(expedicao);
  const progressValue = (etapaAtual / etapas.length) * 100;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <DialogTitle className="flex items-center gap-2">
              <Package className="h-5 w-5 text-primary" />
              Expedição — {expedicao.nomeFantasia || "Sem nome"}
            </DialogTitle>
            {expedicao.prioridade === "Urgente" && (
              <Badge variant="danger">Urgente</Badge>
            )}
          </div>
        </DialogHeader>

        {/* Cadeia de aprovação visual */}
        <div className="space-y-3">
          <div className="flex justify-between text-xs">
            {etapas.map((e, i) => (
              <div
                key={e.key}
                className={`flex items-center gap-1 ${i < etapaAtual ? "text-primary font-semibold" : "text-muted-foreground"}`}
              >
                <div className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold ${
                  i < etapaAtual
                    ? "bg-primary text-primary-foreground"
                    : "bg-muted text-muted-foreground"
                }`}>
                  {i + 1}
                </div>
                {e.label}
              </div>
            ))}
          </div>
          <Progress value={progressValue} />
        </div>

        {/* Status badges */}
        <div className="grid grid-cols-3 gap-3 mt-2">
          <div className="p-3 bg-muted/30 rounded-lg text-center">
            <DollarSign className="h-4 w-4 mx-auto mb-1 text-muted-foreground" />
            <p className="text-[10px] text-muted-foreground">Financeiro</p>
            <Badge
              variant={expedicao.statusFinanceiro === "aprovado" ? "success" : expedicao.statusFinanceiro === "rejeitado" ? "danger" : "warning"}
              className="mt-1"
            >
              {expedicao.statusFinanceiro === "aprovado" ? "Aprovado" : expedicao.statusFinanceiro === "rejeitado" ? "Rejeitado" : "Pendente"}
            </Badge>
          </div>
          <div className="p-3 bg-muted/30 rounded-lg text-center">
            <FileText className="h-4 w-4 mx-auto mb-1 text-muted-foreground" />
            <p className="text-[10px] text-muted-foreground">Nota Fiscal</p>
            <Badge
              variant={expedicao.statusNota === "emitida" ? "success" : "warning"}
              className="mt-1"
            >
              {expedicao.statusNota === "emitida" ? "Emitida" : "Pendente"}
            </Badge>
            {expedicao.notaFiscal && <p className="text-xs mt-1">{expedicao.notaFiscal}</p>}
          </div>
          <div className="p-3 bg-muted/30 rounded-lg text-center">
            <Truck className="h-4 w-4 mx-auto mb-1 text-muted-foreground" />
            <p className="text-[10px] text-muted-foreground">Entrega</p>
            <Badge
              variant={expedicao.statusEntrega === "entregue" ? "success" : expedicao.statusEntrega === "em_rota" ? "info" : "warning"}
              className="mt-1"
            >
              {expedicao.statusEntrega === "entregue" ? "Entregue" : expedicao.statusEntrega === "em_rota" ? "Em Rota" : "Pendente"}
            </Badge>
          </div>
        </div>

        {/* Info Grid */}
        <div className="grid grid-cols-2 gap-4 mt-4">
          <div className="space-y-3">
            <div className="flex items-start gap-3">
              <User className="h-4 w-4 text-muted-foreground mt-0.5" />
              <div>
                <p className="text-xs text-muted-foreground">Cliente</p>
                <p className="font-medium">{expedicao.nomeFantasia || "—"}</p>
                <p className="text-xs text-muted-foreground">{expedicao.cnpj || ""}</p>
                {expedicao.contato && <p className="text-xs">{expedicao.contato}</p>}
              </div>
            </div>

            <div className="flex items-start gap-3">
              <Package className="h-4 w-4 text-muted-foreground mt-0.5" />
              <div>
                <p className="text-xs text-muted-foreground">Produto</p>
                <p className="font-medium">{expedicao.descricaoProduto || "—"}</p>
                <div className="flex gap-1 mt-0.5">
                  {expedicao.tipoMaterial && <Badge variant="outline" className="text-[10px]">{expedicao.tipoMaterial}</Badge>}
                  {expedicao.cor && <Badge variant="outline" className="text-[10px]">{expedicao.cor}</Badge>}
                </div>
              </div>
            </div>
          </div>

          <div className="space-y-3">
            <div className="flex items-start gap-3">
              <Weight className="h-4 w-4 text-muted-foreground mt-0.5" />
              <div>
                <p className="text-xs text-muted-foreground">Quantidade</p>
                <p className="font-medium">{expedicao.kilo ?? 0} kg</p>
                {(expedicao.unidade ?? 0) > 0 && (
                  <p className="text-xs">{expedicao.unidade ?? 0} unidades</p>
                )}
              </div>
            </div>

            <div className="flex items-start gap-3">
              <MapPin className="h-4 w-4 text-muted-foreground mt-0.5" />
              <div>
                <p className="text-xs text-muted-foreground">Logística</p>
                <p className="font-medium">{expedicao.rota || "Sem rota definida"}</p>
                <p className="text-xs">Galpão: {expedicao.galpao || "—"}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Observações */}
        {(expedicao.observacaoEscritorio || expedicao.observacaoGalpao) && (
          <div className="space-y-2 mt-4">
            {expedicao.observacaoEscritorio && (
              <div className="p-3 bg-muted/50 rounded-lg">
                <p className="text-xs text-muted-foreground mb-1">Observação Escritório</p>
                <p className="text-sm">{expedicao.observacaoEscritorio}</p>
              </div>
            )}
            {expedicao.observacaoGalpao && (
              <div className="p-3 bg-muted/50 rounded-lg">
                <p className="text-xs text-muted-foreground mb-1">Observação Galpão</p>
                <p className="text-sm">{expedicao.observacaoGalpao}</p>
              </div>
            )}
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
