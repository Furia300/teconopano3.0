import { useState } from "react";
import { usePermissions } from "@/hooks/usePermissions";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Truck, FileText, Weight, Calendar, QrCode, User, CheckCircle2, Maximize2, Minimize2 } from "lucide-react";

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
  em_producao: { label: "Em Produção", variant: "info" },
  finalizado: { label: "Finalizado", variant: "success" },
  cancelado: { label: "Cancelado", variant: "danger" },
};

/* Fluxo completo: Coleta → Triagem → Produção → Acabamento → Estoque → Finalizado */
const ETAPAS = [
  { key: "pendente",      label: "Coleta",      responsavel: "Michele (Escritório)" },
  { key: "em_separacao",  label: "Triagem",     responsavel: "Triagem (Galpão)" },
  { key: "em_producao",   label: "Produção",    responsavel: "Duplas + Supervisor" },
  { key: "acabamento",    label: "Acabamento",  responsavel: "Galpão" },
  { key: "estoque",       label: "Estoque",     responsavel: "Galpão" },
  { key: "finalizado",    label: "Finalizado",  responsavel: "Motorista (entregou)" },
];

/* Mapear status real para índice da etapa */
function getEtapaIdx(status: string): number {
  const map: Record<string, number> = {
    pendente: 0, agendado: 0, em_rota: 0, recebido: 0,
    em_separacao: 1, separado: 1,
    em_producao: 2,
    acabamento: 3,
    estoque: 4,
    finalizado: 5,
  };
  return map[status] ?? -1;
}

/* Sizes */
type DialogSize = "normal" | "grande" | "tela-cheia";
const SIZES: Record<DialogSize, string> = {
  normal: "max-w-2xl max-h-[85vh]",
  grande: "max-w-4xl max-h-[90vh]",
  "tela-cheia": "max-w-[92vw] max-h-[95vh]",
};
const SIZE_LABELS: Record<DialogSize, string> = { normal: "Normal", grande: "Grande", "tela-cheia": "Tela cheia" };
const SIZE_ORDER: DialogSize[] = ["normal", "grande", "tela-cheia"];

export function ColetaDetalhes({ coleta, open, onOpenChange }: ColetaDetalhesProps) {
  const { user } = usePermissions();
  const nomeUsuario = user?.nome || "Usuário";
  const [dialogSize, setDialogSize] = useState<DialogSize>("normal");
  const sc = statusConfig[coleta.status] || { label: coleta.status, variant: "secondary" as const };
  const etapaIdx = getEtapaIdx(coleta.status);
  const progressValue = etapaIdx >= 0 ? ((etapaIdx + 1) / ETAPAS.length) * 100 : 0;

  const cycleSize = () => {
    const i = SIZE_ORDER.indexOf(dialogSize);
    setDialogSize(SIZE_ORDER[(i + 1) % SIZE_ORDER.length]);
  };

  const formatDate = (dateStr: string | null) => {
    if (!dateStr) return "—";
    return new Date(dateStr).toLocaleDateString("pt-BR", { day: "2-digit", month: "2-digit", year: "numeric", hour: "2-digit", minute: "2-digit" });
  };

  const diffPeso = coleta.pesoTotalNF && coleta.pesoTotalAtual
    ? coleta.pesoTotalNF - coleta.pesoTotalAtual
    : 0;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className={`${SIZES[dialogSize]} overflow-y-auto`}>
        <DialogHeader>
          <div className="flex items-center justify-between">
            <DialogTitle className="flex items-center gap-2">
              <Truck className="h-5 w-5 text-primary" />
              Coleta #{coleta.numero}
            </DialogTitle>
            <div className="flex items-center gap-2">
              <Badge variant={sc.variant} dot>{sc.label}</Badge>
              <button type="button" onClick={cycleSize}
                className="flex items-center gap-1.5 rounded-lg border border-[var(--fips-border)] px-2.5 py-1.5 text-[10px] font-semibold uppercase tracking-wider text-[var(--fips-fg-muted)] transition-colors hover:border-[var(--fips-border-strong)] hover:text-[var(--fips-fg)]"
                title={`Tamanho: ${SIZE_LABELS[dialogSize]}`}>
                {dialogSize === "tela-cheia" ? <Minimize2 size={13} /> : <Maximize2 size={13} />}
                {SIZE_LABELS[dialogSize]}
              </button>
            </div>
          </div>
        </DialogHeader>

        {/* ═══ FLUXO COMPLETO: Coleta → Triagem → Produção → Acabamento → Estoque → Finalizado ═══ */}
        <div className="mt-2">
          <div className="flex items-center gap-0">
            {ETAPAS.map((etapa, i) => {
              const isActive = i === etapaIdx;
              const isDone = etapaIdx >= 0 && i < etapaIdx;

              return (
                <div key={etapa.key} className="flex-1 relative">
                  <div className="text-center pb-3">
                    <span className="text-[9px] font-semibold" style={{
                      color: isActive ? "var(--fips-primary)" : isDone ? "var(--fips-success)" : "var(--fips-fg-muted)",
                    }}>
                      {etapa.label}
                    </span>
                  </div>
                  <div className="h-1 rounded-full" style={{
                    background: isDone || isActive ? "var(--fips-primary)" : "var(--fips-border)",
                  }} />
                  <div className="absolute left-1/2 -translate-x-1/2 -bottom-1.5">
                    <div style={{
                      width: isActive ? 14 : 10, height: isActive ? 14 : 10, borderRadius: "50%",
                      background: isDone ? "var(--fips-success)" : isActive ? "var(--fips-primary)" : "var(--fips-border)",
                      border: isActive ? "3px solid var(--fips-surface)" : "none",
                      boxShadow: isActive ? "0 0 0 2px var(--fips-primary)" : "none",
                      display: "flex", alignItems: "center", justifyContent: "center",
                    }}>
                      {isDone && <CheckCircle2 size={7} color="#fff" />}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Responsável atual */}
          <div className="mt-4 flex items-center gap-2 rounded-lg px-3 py-2" style={{
            background: "linear-gradient(135deg, rgba(0,75,155,0.04), rgba(0,75,155,0.01))",
            border: "1px solid var(--fips-border)",
          }}>
            <User size={14} style={{ color: "var(--fips-primary)" }} />
            <span className="text-[10px]" style={{ color: "var(--fips-fg-muted)" }}>Responsável atual:</span>
            <span className="text-[11px] font-bold" style={{ color: "var(--fips-primary)" }}>
              {nomeUsuario}
            </span>
          </div>

          {/* Timeline de quem atuou */}
          <div className="mt-3 space-y-0">
            {ETAPAS.map((etapa, i) => {
              const isDone = etapaIdx >= 0 && i <= etapaIdx;
              if (!isDone) return null;
              return (
                <div key={etapa.key} className="flex items-center gap-3 py-1.5" style={{
                  borderLeft: `2px solid ${i < etapaIdx ? "var(--fips-success)" : "var(--fips-primary)"}`,
                  paddingLeft: 12, marginLeft: 6,
                }}>
                  <span className="text-[10px] font-semibold" style={{
                    color: i < etapaIdx ? "var(--fips-success)" : "var(--fips-primary)", minWidth: 75,
                  }}>{etapa.label}</span>
                  <span className="text-[10px]" style={{ color: "var(--fips-fg-muted)" }}>→</span>
                  <span className="text-[10px] font-semibold" style={{ color: "var(--fips-fg)" }}>
                    {i === etapaIdx ? nomeUsuario : etapa.responsavel}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        {/* ═══ INFO GRID ═══ */}
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
          </div>
          <div className="space-y-3">
            <div className="flex items-start gap-3">
              <Weight className="h-4 w-4 text-muted-foreground mt-0.5" />
              <div>
                <p className="text-xs text-muted-foreground">Peso NF / Atual</p>
                <p className="font-medium">
                  {coleta.pesoTotalNF ? `${coleta.pesoTotalNF} kg` : "—"} → {coleta.pesoTotalAtual ? `${coleta.pesoTotalAtual} kg` : "—"}
                </p>
                {diffPeso > 0 && <p className="text-xs font-semibold" style={{ color: "#ef4444" }}>Diferença: -{diffPeso} kg</p>}
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

        {coleta.observacao && (
          <div className="mt-4 p-3 bg-muted/50 rounded-lg">
            <p className="text-xs text-muted-foreground mb-1">Observação</p>
            <p className="text-sm">{coleta.observacao}</p>
          </div>
        )}

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
