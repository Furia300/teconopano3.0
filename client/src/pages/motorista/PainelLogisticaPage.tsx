import { useEffect, useState, useMemo, useCallback } from "react";
import { toast } from "sonner";
import {
  Truck,
  PackageCheck,
  Clock,
  Scissors,
  Droplets,
  Send,
  AlertTriangle,
  Eye,
  X,
  CheckCircle2,
} from "lucide-react";
import { PageHeader } from "@/components/domain/PageHeader";
import { StatsCard } from "@/components/domain/StatsCard";
import { DataListingToolbar } from "@/components/domain/DataListingToolbar";
import { DashboardPrintButton } from "@/components/domain/DashboardPrintButton";
import {
  DataListingTable,
  type DataListingColumn,
  CellMonoStrong,
  CellMonoMuted,
  CellMuted,
  CellActions,
  CellActionButton,
} from "@/components/domain/DataListingTable";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { RetornoCostureiraDialog } from "@/pages/costureira/RetornoCostureiraDialog";
import { NovoEnvioDialog } from "@/pages/costureira/NovoEnvioDialog";

/* ─── Cores FIPS DS canônicas ─── */
const FIPS_COLORS = {
  azulProfundo: "#004B9B",
  verdeFloresta: "#00C64C",
  amareloEscuro: "#F6921E",
  azulEscuro: "#002A68",
  danger: "#DC3545",
  roxo: "#9B59B6",
};

/* ─── Tipos crus das APIs ─── */
interface Coleta {
  id: string; numero: number; nomeFantasia: string; pesoTotalNF: number;
  pesoTotalAtual: number; dataPedido: string; dataChegada: string | null;
  status: string; galpao?: string;
}
interface CostureiraEnvio {
  id: string; coletaNumero: number; fornecedor: string; costureira: string;
  tipoMaterial: string; tipoMedida?: string; status: string; dataEnvio: string | null;
  dataRetorno?: string | null; motoristaEnvio: string; motoristaRetorno?: string;
  qtdsSaidaKg: number; qtdsRetornoKg?: number; qtdsPacotesRetorno?: number;
  totalDifKg?: number; residuos?: number; galpaoEnvio?: string;
  assCostEntrega?: string | null; assMotEntrega?: string | null;
  assCostDevolucao?: string | null; assMotDevolucao?: string | null;
  observacao?: string;
}
interface Repanol {
  id: string; coletaNumero: number; fornecedor: string; empresaFornecedor: string;
  tipoMaterial: string; status: string; dataEnvio: string | null;
  pesoManchadoEnvio: number; pesoMolhadoEnvio: number; pesoTingidoEnvio: number;
  galpao?: string;
}
interface Expedicao {
  id: string; nomeFantasia?: string; descricaoProduto?: string;
  tipoMaterial?: string; kilo?: number; statusEntrega?: string;
  rota?: string; prioridade?: string; dataEntrega?: string; createdAt: string;
}

/* ─── Tipo unificado ─── */
interface MotoristaTask {
  id: string;
  rawId: string;
  tipo: "coleta" | "expedicao" | "costureira" | "repanol";
  tipoLabel: string;
  destino: string;
  material: string;
  peso: number;
  rota: string;
  statusLabel: string;
  prioridade: "Urgente" | "Normal" | "Baixa";
  data: string;
  dataFormatted: string;
  isOverdue: boolean;
  /* Campos extras para detalhes */
  coletaNumero?: number;
  fornecedor?: string;
  motorista?: string;
  galpaoOrigem?: string;
  assCostEntrega?: string | null;
  assMotEntrega?: string | null;
  assCostDevolucao?: string | null;
  assMotDevolucao?: string | null;
  pesoRetorno?: number;
  residuos?: number;
  observacao?: string;
  endereco?: string;
}

const TIPO_BADGE: Record<string, { label: string; variant: "default" | "secondary" | "success" | "warning" | "danger" | "info" }> = {
  coleta: { label: "Coleta", variant: "info" },
  expedicao: { label: "Expedição", variant: "success" },
  costureira: { label: "Costureira", variant: "warning" },
  repanol: { label: "Repanol", variant: "secondary" },
};

const PRIO_BADGE: Record<string, { label: string; variant: "default" | "secondary" | "success" | "warning" | "danger" | "info" }> = {
  Urgente: { label: "Urgente", variant: "danger" },
  Normal: { label: "Normal", variant: "info" },
  Baixa: { label: "Baixa", variant: "secondary" },
};

/* ─── Helpers ─── */
const formatDateBR = (s: string | null | undefined) =>
  s ? new Date(s).toLocaleDateString("pt-BR") : "—";

const formatKg = (n: number | null | undefined) =>
  n && n > 0 ? (n >= 1000 ? `${(n / 1000).toFixed(1)}t` : `${Math.round(n)} kg`) : "—";

function daysDiff(isoDate: string | null, ref: Date): number {
  if (!isoDate) return -999;
  return Math.floor((ref.getTime() - new Date(isoDate).getTime()) / 86400000);
}

/* ─── Transformação unificada ─── */
function buildTasks(coletas: Coleta[], costureiras: CostureiraEnvio[], repanois: Repanol[], expedicoes: Expedicao[]): MotoristaTask[] {
  const today = new Date(); today.setHours(0, 0, 0, 0);
  const tasks: MotoristaTask[] = [];

  for (const c of coletas) {
    if (c.status !== "agendado" || !c.dataChegada) continue;
    const diff = daysDiff(c.dataChegada, today);
    tasks.push({
      id: `col-${c.id}`, rawId: c.id, tipo: "coleta", tipoLabel: "Coleta",
      destino: c.nomeFantasia, material: "Matéria-prima", peso: c.pesoTotalNF,
      rota: c.galpao || "—", statusLabel: "Buscar no fornecedor",
      coletaNumero: c.numero,
      prioridade: diff >= 0 ? "Urgente" : diff >= -2 ? "Normal" : "Baixa",
      data: c.dataChegada, dataFormatted: formatDateBR(c.dataChegada),
      isOverdue: diff > 0,
    });
  }

  for (const co of costureiras) {
    if (co.status !== "enviado") continue;
    const age = daysDiff(co.dataEnvio, today);
    tasks.push({
      id: `cos-${co.id}`, rawId: co.id, tipo: "costureira", tipoLabel: "Costureira",
      destino: co.costureira, material: co.tipoMaterial || "—", peso: co.qtdsSaidaKg,
      rota: co.galpaoEnvio || "—", statusLabel: "Buscar retorno costureira",
      prioridade: age > 5 ? "Urgente" : age > 2 ? "Normal" : "Baixa",
      data: co.dataEnvio || "", dataFormatted: formatDateBR(co.dataEnvio),
      isOverdue: age > 5,
      coletaNumero: co.coletaNumero, fornecedor: co.fornecedor,
      motorista: co.motoristaEnvio, galpaoOrigem: co.galpaoEnvio,
      assCostEntrega: co.assCostEntrega, assMotEntrega: co.assMotEntrega,
      assCostDevolucao: co.assCostDevolucao, assMotDevolucao: co.assMotDevolucao,
      observacao: co.observacao,
    });
  }

  for (const r of repanois) {
    if (r.status !== "enviado") continue;
    const age = daysDiff(r.dataEnvio, today);
    tasks.push({
      id: `rep-${r.id}`, rawId: r.id, tipo: "repanol", tipoLabel: "Repanol",
      destino: r.empresaFornecedor, material: r.tipoMaterial || "—",
      coletaNumero: r.coletaNumero, fornecedor: r.fornecedor,
      peso: r.pesoManchadoEnvio + r.pesoMolhadoEnvio + r.pesoTingidoEnvio,
      rota: r.galpao || "—", statusLabel: "Buscar retorno",
      prioridade: age > 5 ? "Urgente" : age > 2 ? "Normal" : "Baixa",
      data: r.dataEnvio || "", dataFormatted: formatDateBR(r.dataEnvio),
      isOverdue: age > 5,
    });
  }

  for (const e of expedicoes) {
    if (e.statusEntrega !== "pronto_entrega" && e.statusEntrega !== "em_rota") continue;
    tasks.push({
      id: `exp-${e.id}`, rawId: e.id, tipo: "expedicao", tipoLabel: "Expedição",
      destino: e.nomeFantasia || "—", material: e.tipoMaterial || e.descricaoProduto || "—",
      peso: e.kilo || 0, rota: e.rota || "—",
      statusLabel: e.statusEntrega === "em_rota" ? "Em rota" : "Entregar ao cliente",
      prioridade: e.prioridade === "Urgente" ? "Urgente" : e.prioridade === "Baixa" ? "Baixa" : "Normal",
      data: e.dataEntrega || e.createdAt, dataFormatted: formatDateBR(e.dataEntrega || e.createdAt),
      isOverdue: daysDiff(e.dataEntrega, today) > 0,
    });
  }

  const prioOrder: Record<string, number> = { Urgente: 0, Normal: 1, Baixa: 2 };
  tasks.sort((a, b) => {
    const pa = prioOrder[a.prioridade] ?? 1, pb = prioOrder[b.prioridade] ?? 1;
    if (pa !== pb) return pa - pb;
    return new Date(b.data).getTime() - new Date(a.data).getTime();
  });

  return tasks;
}

/* ─── Colunas da tabela ─── */
function motoristaColumns({ onView }: { onView: (t: MotoristaTask) => void }): DataListingColumn<MotoristaTask>[] {
  return [
    {
      id: "tipo", label: "Origem", fixed: true, sortable: true, width: "90px",
      render: (t) => {
        const b = TIPO_BADGE[t.tipo];
        return <Badge variant={b?.variant || "default"}>{b?.label || t.tipo}</Badge>;
      },
    },
    {
      id: "prioridade", label: "Prioridade", sortable: true, width: "80px",
      render: (t) => {
        const b = PRIO_BADGE[t.prioridade];
        return <Badge variant={b?.variant || "info"}>{b?.label || t.prioridade}</Badge>;
      },
    },
    {
      id: "destino", label: "Destino", fixed: true, sortable: true, width: "180px",
      render: (t) => (
        <div className="min-w-0 leading-tight">
          <div className="font-semibold text-[11px] text-[var(--fips-fg)] truncate max-w-[170px]">{t.destino}</div>
          <div className="text-[9px] leading-none text-[var(--fips-fg-muted)]">{t.statusLabel}</div>
        </div>
      ),
    },
    {
      id: "material", label: "Material", sortable: true, width: "120px",
      render: (t) => <CellMuted>{t.material}</CellMuted>,
    },
    {
      id: "peso", label: "Peso", sortable: true, align: "right", width: "80px",
      render: (t) => <CellMonoStrong align="right">{formatKg(t.peso)}</CellMonoStrong>,
    },
    {
      id: "rota", label: "Rota/Galpão", sortable: true, width: "90px",
      render: (t) => <CellMonoMuted>{t.rota}</CellMonoMuted>,
    },
    {
      id: "data", label: "Data", sortable: true, width: "90px",
      render: (t) => (
        <div className="text-right">
          <span className={`text-[11px] font-mono font-semibold ${t.isOverdue ? "text-[#DC3545]" : "text-[var(--fips-fg)]"}`}>
            {t.dataFormatted}
          </span>
          {t.isOverdue && <div className="text-[9px] font-bold text-[#DC3545]">atrasada</div>}
        </div>
      ),
    },
    {
      id: "actions", label: "Ações", fixed: true, align: "center", width: "60px",
      render: (t) => (
        <CellActions>
          <CellActionButton
            title="Ver detalhes"
            variant="primary"
            icon={<Eye className="h-3.5 w-3.5" />}
            onClick={() => onView(t)}
          />
        </CellActions>
      ),
    },
  ];
}

/* ─── Indicador de assinatura ─── */
function SigBadge({ label, value }: { label: string; value?: string | null }) {
  const signed = !!value && value !== "null";
  return (
    <div className={`flex flex-col items-center gap-1 rounded-lg border p-2.5 text-center ${signed ? "border-[#00C64C40] bg-[#00C64C08]" : "border-dashed border-[var(--fips-border)] bg-[var(--fips-surface-soft)]"}`}>
      <div className={`flex h-7 w-7 items-center justify-center rounded-full text-[10px] font-bold ${signed ? "bg-[#00C64C] text-white" : "bg-[var(--fips-border)] text-[var(--fips-fg-muted)]"}`}>
        {signed ? "✓" : "?"}
      </div>
      <span className="text-[9px] font-semibold text-[var(--fips-fg-muted)] leading-tight">{label}</span>
      <span className={`text-[9px] font-bold ${signed ? "text-[#00C64C]" : "text-[var(--fips-fg-muted)]"}`}>
        {signed ? "Assinado" : "Pendente"}
      </span>
    </div>
  );
}

/* ─── Linha de detalhe (label: value) ─── */
function DetailRow({ label, value, danger }: { label: string; value: string; danger?: boolean }) {
  return (
    <div className="flex items-center justify-between py-1.5">
      <span className="text-[11px] text-[var(--fips-fg-muted)]">{label}</span>
      <span className={`text-[11px] font-semibold font-mono max-w-[250px] truncate text-right ${danger ? "text-[#DC3545]" : "text-[var(--fips-fg)]"}`}>{value}</span>
    </div>
  );
}

/* ─── Bloco com título ─── */
function DetailBlock({ title, subtitle, children }: { title: string; subtitle?: string; children: React.ReactNode }) {
  return (
    <div className="rounded-lg border border-[var(--fips-border)] overflow-hidden">
      <div className="bg-[var(--fips-surface-soft)] px-4 py-2 border-b border-[var(--fips-border)]">
        <span className="text-[11px] font-bold uppercase tracking-[0.06em] text-[var(--fips-fg)]">{title}</span>
        {subtitle && <span className="ml-2 text-[9px] text-[var(--fips-fg-muted)]">{subtitle}</span>}
      </div>
      <div className="px-4 py-2">{children}</div>
    </div>
  );
}

/* ─── Modal de detalhes ─── */
function TaskDetailDialog({ task, open, onClose, onRetorno, onNovoEnvio, onIniciarEntrega, onConfirmarEntrega }: {
  task: MotoristaTask | null; open: boolean; onClose: () => void;
  onRetorno: (envioData: any) => void; onNovoEnvio: () => void;
  onIniciarEntrega: (rawId: string) => void; onConfirmarEntrega: (rawId: string) => void;
}) {
  if (!task) return null;
  const b = TIPO_BADGE[task.tipo];
  const isCostureira = task.tipo === "costureira";
  const isRepanol = task.tipo === "repanol";
  const isColeta = task.tipo === "coleta";
  const isExpedicao = task.tipo === "expedicao";

  return (
    <Dialog open={open} onOpenChange={(v) => { if (!v) onClose(); }}>
      <DialogContent className="sm:max-w-[540px] max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-3">
            <Badge variant={b?.variant || "default"} className="text-xs">{b?.label}</Badge>
            <span className="truncate text-base">{task.destino}</span>
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-3 pt-1">

          {/* ═══ BLOCO ENTREGA (ida) — para costureira e repanol ═══ */}
          {(isCostureira || isRepanol) && (
            <DetailBlock title="Entrega" subtitle="Galpão → Motorista → Destino">
              {task.coletaNumero && <DetailRow label="ID Pedido" value={`#${task.coletaNumero}`} />}
              <DetailRow label="Data de Entrega" value={task.dataFormatted} />
              <DetailRow label="Destino" value={task.destino} />
              {task.fornecedor && <DetailRow label="Fornecedor" value={task.fornecedor} />}
              <DetailRow label="Tipo de Material" value={task.material} />
              <DetailRow label="Qtds KG" value={formatKg(task.peso)} />
              <DetailRow label="Motorista" value={task.motorista || "Não informado"} />
              {isCostureira && <DetailRow label="Costureira" value={task.destino} />}
              {task.galpaoOrigem && <DetailRow label="Galpão Envio" value={task.galpaoOrigem} />}
              {/* Assinaturas entrega */}
              <div className="grid grid-cols-2 gap-2 mt-2">
                <SigBadge label="Costureira" value={task.assCostEntrega} />
                <SigBadge label="Motorista" value={task.assMotEntrega} />
              </div>
            </DetailBlock>
          )}

          {/* ═══ BLOCO DEVOLUÇÃO (volta) — para costureira e repanol ═══ */}
          {(isCostureira || isRepanol) && (
            <DetailBlock title="Devolução" subtitle="Destino → Motorista → Galpão">
              <DetailRow label="Data Devolução" value={task.pesoRetorno ? "Registrada" : "Pendente"} danger={!task.pesoRetorno} />
              <DetailRow label="Qtds KG (retorno)" value={task.pesoRetorno ? formatKg(task.pesoRetorno) : "—"} />
              <DetailRow label="Resíduos" value={task.residuos ? `${task.residuos} kg` : "—"} />
              <DetailRow label="Motorista (volta)" value="Pendente" danger />
              {/* Assinaturas devolução */}
              <div className="grid grid-cols-2 gap-2 mt-2">
                <SigBadge label="Costureira" value={task.assCostDevolucao} />
                <SigBadge label="Motorista" value={task.assMotDevolucao} />
              </div>
            </DetailBlock>
          )}

          {/* ═══ BLOCO OBSERVAÇÃO GERAIS — para costureira ═══ */}
          {isCostureira && (
            <DetailBlock title="Observação Gerais">
              <DetailRow label="Status Serviço" value={task.statusLabel} />
              <DetailRow label="Total Dif. KG" value={task.pesoRetorno ? `${Math.round(task.peso - (task.pesoRetorno || 0))} kg` : "—"} />
              {task.observacao && <DetailRow label="Observação" value={task.observacao} />}
            </DetailBlock>
          )}

          {/* ═══ COLETA — dados simples ═══ */}
          {isColeta && (
            <DetailBlock title="Coleta" subtitle="Buscar matéria-prima no fornecedor">
              {task.coletaNumero && <DetailRow label="Coleta Nº" value={`#${task.coletaNumero}`} />}
              <DetailRow label="Fornecedor" value={task.destino} />
              <DetailRow label="Peso NF" value={formatKg(task.peso)} />
              <DetailRow label="Data Chegada" value={task.dataFormatted} />
              <DetailRow label="Galpão Destino" value={task.rota || "—"} />
              <DetailRow label="Ação" value={task.statusLabel} />
            </DetailBlock>
          )}

          {/* ═══ EXPEDIÇÃO — dados simples ═══ */}
          {isExpedicao && (
            <DetailBlock title="Expedição" subtitle="Entregar pedido ao cliente">
              <DetailRow label="Cliente" value={task.destino} />
              <DetailRow label="Material" value={task.material} />
              <DetailRow label="Peso" value={formatKg(task.peso)} />
              <DetailRow label="Rota" value={task.rota || "—"} />
              <DetailRow label="Data" value={task.dataFormatted} />
              <DetailRow label="Prioridade" value={task.prioridade} />
              <DetailRow label="Ação" value={task.statusLabel} />
            </DetailBlock>
          )}

          {/* Alerta atrasado */}
          {task.isOverdue && (
            <div className="flex items-center gap-2 rounded-lg bg-[#DC354510] border border-[#DC354530] px-4 py-2.5">
              <AlertTriangle className="h-4 w-4 text-[#DC3545] flex-shrink-0" />
              <span className="text-[11px] font-semibold text-[#DC3545]">Tarefa atrasada — requer atenção imediata</span>
            </div>
          )}

          {/* Info retorno pendente */}
          {(isCostureira || isRepanol) && (
            <div className="flex items-center gap-2 rounded-lg bg-[#F6921E10] border border-[#F6921E30] px-4 py-2.5">
              <Clock className="h-4 w-4 text-[#F6921E] flex-shrink-0" />
              <span className="text-[11px] text-[var(--fips-fg)]">
                Retorno pendente — material na {isCostureira ? "costureira" : "repanol"} desde <b>{task.dataFormatted}</b>
              </span>
            </div>
          )}
        </div>

        {/* ═══ BOTÕES DE AÇÃO ═══ */}
        <DialogFooter className="mt-4 flex gap-2">
          <Button variant="outline" onClick={onClose}>Fechar</Button>
          {isCostureira && (
            <Button
              className="bg-[#F6921E] hover:bg-[#D47B15] text-white"
              onClick={() => onRetorno({
                id: task.rawId,
                coletaNumero: task.coletaNumero || 0,
                costureira: task.destino,
                tipoMaterial: task.material,
                qtdsSaidaKg: task.peso,
                status: "enviado",
              })}
            >
              <Scissors className="h-4 w-4 mr-1" />
              Registrar Retorno
            </Button>
          )}
          {isColeta && (
            <Button className="bg-[#004B9B] hover:bg-[#003670] text-white">
              <Truck className="h-4 w-4 mr-1" />
              Iniciar Coleta
            </Button>
          )}
          {isExpedicao && task.statusLabel === "Entregar ao cliente" && (
            <Button className="bg-[#00C64C] hover:bg-[#009C3D] text-white"
              onClick={() => { onIniciarEntrega(task.rawId); onClose(); }}>
              <Send className="h-4 w-4 mr-1" />
              Iniciar Entrega
            </Button>
          )}
          {isExpedicao && task.statusLabel === "Em rota" && (
            <Button className="bg-[#004B9B] hover:bg-[#003670] text-white"
              onClick={() => { onConfirmarEntrega(task.rawId); onClose(); }}>
              <CheckCircle2 className="h-4 w-4 mr-1" />
              Confirmar Entrega
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

/* ═════════════════════════════ COMPONENTE ═════════════════════════════ */
export default function PainelLogisticaPage() {
  const [coletas, setColetas] = useState<Coleta[]>([]);
  const [costureiras, setCostureiras] = useState<CostureiraEnvio[]>([]);
  const [repanois, setRepanois] = useState<Repanol[]>([]);
  const [expedicoes, setExpedicoes] = useState<Expedicao[]>([]);
  const [loading, setLoading] = useState(true);

  const [search, setSearch] = useState("");
  const [periodo, setPeriodo] = useState("Últimos 30 dias");
  const [detailTask, setDetailTask] = useState<MotoristaTask | null>(null);
  const [retornoEnvio, setRetornoEnvio] = useState<any>(null);
  const [novoEnvioOpen, setNovoEnvioOpen] = useState(false);
  const [filterTipo, setFilterTipo] = useState("");
  const [filterPrio, setFilterPrio] = useState("");

  const fetchTasks = useCallback(() => {
    Promise.all([
      fetch("/api/coletas").then(r => r.json()).catch(() => []),
      fetch("/api/costureira").then(r => r.json()).catch(() => []),
      fetch("/api/repanol").then(r => r.json()).catch(() => []),
      fetch("/api/expedicoes").then(r => r.json()).catch(() => []),
    ])
      .then(([c, co, re, ex]) => { setColetas(c); setCostureiras(co); setRepanois(re); setExpedicoes(ex); })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => { fetchTasks(); }, [fetchTasks]);

  const allTasks = useMemo(() => buildTasks(coletas, costureiras, repanois, expedicoes), [coletas, costureiras, repanois, expedicoes]);

  const filtered = useMemo(() => {
    return allTasks.filter(t => {
      const q = search.trim().toLowerCase();
      const matchSearch = !q || t.destino.toLowerCase().includes(q) || t.material.toLowerCase().includes(q) || t.statusLabel.toLowerCase().includes(q);
      const matchTipo = !filterTipo || t.tipo === filterTipo;
      const matchPrio = !filterPrio || t.prioridade === filterPrio;
      return matchSearch && matchTipo && matchPrio;
    });
  }, [allTasks, search, filterTipo, filterPrio]);

  const activeFilters = [filterTipo, filterPrio].filter(Boolean).length;

  const stats = useMemo(() => ({
    total: allTasks.length,
    coletas: allTasks.filter(t => t.tipo === "coleta").length,
    entregas: allTasks.filter(t => t.tipo === "expedicao").length,
    transito: allTasks.filter(t => t.tipo === "costureira" || t.tipo === "repanol").length,
    urgentes: allTasks.filter(t => t.prioridade === "Urgente").length,
  }), [allTasks]);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Dashboard Motorista"
        description="Tabela integrada — coletas, costureira, repanol e saída de expedição"
        icon={Truck}
        actions={
          <div className="flex items-center gap-2">
            <Button
              onClick={() => setNovoEnvioOpen(true)}
              className="bg-[#F6921E] hover:bg-[#D47B15] text-white text-[12px] font-semibold h-9 px-4"
            >
              <Scissors className="h-4 w-4 mr-1.5" />
              Novo Envio Costureira
            </Button>
            <DashboardPrintButton title="Dashboard Motorista" />
          </div>
        }
        stats={[
          { label: "Tarefas", value: stats.total, color: "#93BDE4" },
          { label: "Coletas", value: stats.coletas, color: "#FDC24E" },
          { label: "Entregas", value: stats.entregas, color: "#00C64C" },
          { label: "Em Trânsito", value: stats.transito, color: "#ed1b24" },
        ]}
      />

      {/* Stats Cards */}
      <div className="grid grid-cols-1 gap-3 md:grid-cols-2 lg:grid-cols-4">
        <StatsCard label="Saídas Pendentes" value={stats.total} subtitle="Total de tarefas ativas" icon={Truck} color={FIPS_COLORS.azulProfundo} />
        <StatsCard label="Coletas Agendadas" value={stats.coletas} subtitle="Buscar no fornecedor" icon={PackageCheck} color={FIPS_COLORS.amareloEscuro} />
        <StatsCard label="Entregas Prontas" value={stats.entregas} subtitle="Expedição pronta p/ entrega" icon={Send} color={FIPS_COLORS.verdeFloresta} />
        <StatsCard label="Urgentes" value={stats.urgentes} subtitle={stats.urgentes > 0 ? "Requerem atenção imediata" : "Nenhum urgente"} icon={AlertTriangle} color={stats.urgentes > 0 ? FIPS_COLORS.danger : FIPS_COLORS.azulEscuro} />
      </div>

      {/* Toolbar */}
      <DataListingToolbar
        search={search}
        onSearchChange={setSearch}
        searchPlaceholder="Buscar por destino, material ou status..."
        activeFilters={activeFilters}
        filtersContent={
          <div className="px-4 py-3 space-y-4">
            <div>
              <p className="mb-2 text-[9px] font-bold uppercase tracking-[1px] text-[var(--fips-fg-muted)]">Tipo / Origem</p>
              <div className="flex flex-col gap-1">
                {[
                  { v: "", l: "Todas as origens" },
                  { v: "coleta", l: "Coleta" },
                  { v: "expedicao", l: "Expedição" },
                  { v: "costureira", l: "Costureira" },
                  { v: "repanol", l: "Repanol" },
                ].map(opt => (
                  <button key={opt.v || "t-all"} onClick={() => setFilterTipo(opt.v)}
                    className={`flex items-center gap-2 rounded px-2 py-1.5 text-left text-[11px] transition-colors ${filterTipo === opt.v ? "bg-[var(--fips-primary)]/10 font-bold text-[var(--fips-primary)]" : "text-[var(--fips-fg)] hover:bg-[var(--fips-surface-soft)]"}`}>
                    {opt.l}
                  </button>
                ))}
              </div>
            </div>
            <div>
              <p className="mb-2 text-[9px] font-bold uppercase tracking-[1px] text-[var(--fips-fg-muted)]">Prioridade</p>
              <div className="flex flex-col gap-1">
                {[
                  { v: "", l: "Todas" },
                  { v: "Urgente", l: "Urgente" },
                  { v: "Normal", l: "Normal" },
                  { v: "Baixa", l: "Baixa" },
                ].map(opt => (
                  <button key={opt.v || "p-all"} onClick={() => setFilterPrio(opt.v)}
                    className={`flex items-center gap-2 rounded px-2 py-1.5 text-left text-[11px] transition-colors ${filterPrio === opt.v ? "bg-[var(--fips-primary)]/10 font-bold text-[var(--fips-primary)]" : "text-[var(--fips-fg)] hover:bg-[var(--fips-surface-soft)]"}`}>
                    {opt.l}
                  </button>
                ))}
              </div>
            </div>
          </div>
        }
        periodo={periodo}
        onPeriodoChange={setPeriodo}
        onExportExcel={() => alert("Export Excel — placeholder")}
        onExportPdf={() => { document.body.classList.add("printing-dashboard"); document.title = "Dashboard Motorista — Tecnopano 2.0"; setTimeout(() => { window.print(); document.body.classList.remove("printing-dashboard"); document.title = "Tecnopano - Sistema de Gestão Industrial"; }, 100); }}
      />

      {/* Tabela */}
      <DataListingTable<MotoristaTask>
        icon={<Truck className="h-[22px] w-[22px]" />}
        title="Tarefas do Motorista"
        subtitle={`${filtered.length} ${filtered.length === 1 ? "tarefa" : "tarefas"} ${activeFilters || search ? "filtradas" : "pendentes"} · Atualizado agora`}
        filtered={!!(search || activeFilters)}
        data={filtered}
        getRowId={(t) => t.id}
        selectable={false}
        emptyState={loading ? "Carregando tarefas..." : "Nenhuma tarefa pendente — tudo em dia!"}
        columns={motoristaColumns({ onView: setDetailTask })}
      />

      {/* Modal de detalhes */}
      <TaskDetailDialog
        task={detailTask}
        open={!!detailTask}
        onClose={() => setDetailTask(null)}
        onRetorno={(envioData) => { setDetailTask(null); setRetornoEnvio(envioData); }}
        onNovoEnvio={() => { setDetailTask(null); setNovoEnvioOpen(true); }}
        onIniciarEntrega={async (rawId) => {
          try {
            await fetch(`/api/expedicoes/${rawId}/em-rota`, { method: "PUT" });
            toast.success("Entrega iniciada — em rota!");
            fetchTasks();
          } catch { toast.error("Erro ao iniciar entrega"); }
        }}
        onConfirmarEntrega={async (rawId) => {
          try {
            await fetch(`/api/expedicoes/${rawId}/entregar`, { method: "PUT" });
            toast.success("Entrega confirmada!");
            fetchTasks();
          } catch { toast.error("Erro ao confirmar entrega"); }
        }}
      />

      {/* Dialog de retorno costureira */}
      {retornoEnvio && (
        <RetornoCostureiraDialog
          envio={retornoEnvio}
          open={!!retornoEnvio}
          onOpenChange={(v) => { if (!v) setRetornoEnvio(null); }}
          onSuccess={() => { setRetornoEnvio(null); window.location.reload(); }}
        />
      )}

      {/* Dialog de novo envio costureira */}
      <NovoEnvioDialog
        open={novoEnvioOpen}
        onOpenChange={setNovoEnvioOpen}
        onSuccess={() => { setNovoEnvioOpen(false); window.location.reload(); }}
      />
    </div>
  );
}
