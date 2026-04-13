import { useEffect, useState } from "react";
import { Truck, Plus, Eye, Trash2, Package, Activity, CheckCircle2, Inbox, MoreHorizontal } from "lucide-react";
import { PageHeader } from "@/components/domain/PageHeader";
import { StatsCard } from "@/components/domain/StatsCard";
import { DataListingToolbar } from "@/components/domain/DataListingToolbar";
import { Avatar } from "@/components/domain/Avatar";
import {
  DataListingTable,
  type DataListingColumn,
  CellCodigo,
  CellMonoStrong,
  CellMonoMuted,
  CellMuted,
  CellActions,
  CellActionButton,
} from "@/components/domain/DataListingTable";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { NovaColetaDialog } from "./NovaColetaDialog";
import { ColetaDetalhes } from "./ColetaDetalhes";

// Cores FIPS DS canônicas para os Cards Relatório
const FIPS_COLORS = {
  azulProfundo: "#004B9B",
  verdeFloresta: "#00C64C",
  amareloEscuro: "#F6921E",
  azulEscuro: "#002A68",
};

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
  fornecedorId: string;
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

export default function ColetaList() {
  const [coletas, setColetas] = useState<Coleta[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [filterStatus, setFilterStatus] = useState("");
  const [periodo, setPeriodo] = useState("Últimos 30 dias");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [detalhesColeta, setDetalhesColeta] = useState<Coleta | null>(null);

  const fetchColetas = async () => {
    try {
      const res = await fetch("/api/coletas");
      const data = await res.json();
      setColetas(data);
    } catch (err) {
      console.error("Erro ao buscar coletas:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchColetas();
  }, []);

  const filtered = coletas.filter((c) => {
    const matchSearch =
      !search ||
      c.nomeFantasia.toLowerCase().includes(search.toLowerCase()) ||
      c.notaFiscal.toLowerCase().includes(search.toLowerCase()) ||
      String(c.numero).includes(search);
    const matchStatus = !filterStatus || c.status === filterStatus;
    return matchSearch && matchStatus;
  });

  const stats = {
    total: coletas.length,
    pendentes: coletas.filter((c) => c.status === "pendente" || c.status === "agendado").length,
    emAndamento: coletas.filter((c) => ["em_rota", "recebido", "em_separacao", "em_producao"].includes(c.status)).length,
    finalizados: coletas.filter((c) => c.status === "finalizado").length,
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Tem certeza que deseja excluir esta coleta?")) return;
    await fetch(`/api/coletas/${id}`, { method: "DELETE" });
    fetchColetas();
  };

  const formatDate = (dateStr: string | null) => {
    if (!dateStr) return "—";
    return new Date(dateStr).toLocaleDateString("pt-BR");
  };

  const formatWeight = (weight: number) => {
    if (!weight) return "—";
    return `${weight.toLocaleString("pt-BR")} kg`;
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Coleta"
        description="Início do fluxo: pedidos e agendamento de matéria-prima (retirada no fornecedor / chegada ao galpão)"
        icon={Truck}
        stats={[
          { label: "Total", value: stats.total, color: "#93BDE4" },
          { label: "Pendentes", value: stats.pendentes, color: "#FDC24E" },
          { label: "Em andamento", value: stats.emAndamento, color: "#00C64C" },
          { label: "Finalizados", value: stats.finalizados, color: "#ed1b24" },
        ]}
        actions={
          <Button onClick={() => setDialogOpen(true)}>
            <Plus className="h-4 w-4" />
            Pedido de coleta
          </Button>
        }
      />

      {/* Cards Relatório — padrão FIPS DS (`/docs/components/card` § 03 Card Relatório) */}
      <div className="grid grid-cols-1 gap-3 md:grid-cols-2 lg:grid-cols-4">
        <StatsCard
          label="Total Coletas"
          value={stats.total}
          subtitle="Cadastradas no sistema"
          icon={Truck}
          color={FIPS_COLORS.azulProfundo}
        />
        <StatsCard
          label="Pendentes"
          value={stats.pendentes}
          subtitle="Aguardando agendamento"
          icon={Package}
          color={FIPS_COLORS.amareloEscuro}
        />
        <StatsCard
          label="Em Andamento"
          value={stats.emAndamento}
          subtitle="Em rota / produção"
          icon={Activity}
          color={FIPS_COLORS.azulEscuro}
        />
        <StatsCard
          label="Finalizados"
          value={stats.finalizados}
          subtitle="Concluídos no período"
          icon={CheckCircle2}
          color={FIPS_COLORS.verdeFloresta}
        />
      </div>

      {/* Toolbar — padrão FIPS DS Data Listing */}
      <DataListingToolbar
        search={search}
        onSearchChange={setSearch}
        searchPlaceholder="Buscar por fornecedor, NF ou número..."
        activeFilters={filterStatus ? 1 : 0}
        filtersContent={
          <div className="px-4 py-3">
            <p className="mb-2 text-[9px] font-bold uppercase tracking-[1px] text-[var(--fips-fg-muted)]">Status</p>
            <div className="flex flex-col gap-1">
              {[
                { v: "", l: "Todos os status" },
                { v: "pendente", l: "Pendente" },
                { v: "agendado", l: "Agendado" },
                { v: "em_rota", l: "Em rota" },
                { v: "recebido", l: "Recebido" },
                { v: "em_separacao", l: "Em Separação" },
                { v: "em_producao", l: "Em Produção" },
                { v: "finalizado", l: "Finalizado" },
                { v: "cancelado", l: "Cancelado" },
              ].map((opt) => (
                <button
                  key={opt.v || "todos"}
                  onClick={() => setFilterStatus(opt.v)}
                  className={`flex items-center gap-2 rounded px-2 py-1.5 text-left text-[11px] transition-colors ${
                    filterStatus === opt.v
                      ? "bg-[var(--color-fips-blue-200)]/65 font-bold text-[var(--fips-primary)]"
                      : "text-[var(--fips-fg)] hover:bg-[var(--fips-surface-soft)]"
                  }`}
                >
                  {opt.l}
                </button>
              ))}
            </div>
          </div>
        }
        periodo={periodo}
        onPeriodoChange={setPeriodo}
        onExportExcel={() => alert("Export Excel — placeholder")}
        onExportPdf={() => alert("Export PDF — placeholder")}
      />

      {/* Tabela canônica DS-FIPS — Data Listing */}
      <DataListingTable<Coleta>
        icon={<Inbox className="h-[22px] w-[22px]" />}
        title="Coletas"
        subtitle={`${filtered.length} ${filtered.length === 1 ? "registro" : "registros"} ${
          search || filterStatus ? "filtrados" : "no total"
        } · Atualizado agora`}
        filtered={!!(search || filterStatus)}
        data={filtered}
        getRowId={(c) => c.id}
        emptyState={loading ? "Carregando..." : "Nenhuma coleta encontrada"}
        columns={coletaColumns({ onView: setDetalhesColeta, onDelete: handleDelete })}
      />

      {/* Modal Nova Coleta */}
      <NovaColetaDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        onSuccess={fetchColetas}
      />

      {/* Modal Detalhes */}
      {detalhesColeta && (
        <ColetaDetalhes
          coleta={detalhesColeta}
          open={!!detalhesColeta}
          onOpenChange={(open) => { if (!open) setDetalhesColeta(null); }}
        />
      )}
    </div>
  );
}

/* ──────────────────────────── COLUMNS DEFINITION ──────────────────────────── */

interface ColetaColumnActions {
  onView: (c: Coleta) => void;
  onDelete: (id: string) => void;
}

const formatDateBR = (s: string | null) =>
  s ? new Date(s).toLocaleDateString("pt-BR") : "—";
const formatKg = (n: number) => (n ? `${n.toLocaleString("pt-BR")} kg` : "—");

function coletaColumns({ onView, onDelete }: ColetaColumnActions): DataListingColumn<Coleta>[] {
  return [
    {
      id: "numero",
      label: "Nº",
      fixed: true,
      sortable: true,
      width: "64px",
      render: (c) => <CellCodigo>#{c.numero}</CellCodigo>,
    },
    {
      id: "fornecedor",
      label: "Fornecedor",
      sortable: true,
      width: "280px",
      render: (c, { density }) => (
        <div className="flex items-center gap-1.5 py-0.5">
          <Avatar
            name={c.nomeFantasia}
            size={density === "compact" ? 20 : density === "normal" ? 24 : 30}
          />
          <div className="min-w-0 leading-tight">
            <div className="font-semibold text-[var(--fips-fg)] text-[12px]">{c.nomeFantasia}</div>
            <div className="text-[9px] leading-none text-[var(--fips-fg-muted)]">{c.cnpjFornecedor}</div>
          </div>
        </div>
      ),
    },
    {
      id: "notaFiscal",
      label: "NF",
      sortable: true,
      width: "90px",
      render: (c) => <CellMuted>{c.notaFiscal || "—"}</CellMuted>,
    },
    {
      id: "pesoNF",
      label: "Peso NF",
      sortable: true,
      align: "right",
      width: "100px",
      render: (c) => <CellMonoMuted>{formatKg(c.pesoTotalNF)}</CellMonoMuted>,
    },
    {
      id: "pesoAtual",
      label: "Peso Atual",
      sortable: true,
      align: "right",
      width: "110px",
      render: (c) => <CellMonoStrong align="right">{formatKg(c.pesoTotalAtual)}</CellMonoStrong>,
    },
    {
      id: "dataPedido",
      label: "Pedido",
      sortable: true,
      width: "100px",
      render: (c) => <CellMonoMuted>{formatDateBR(c.dataPedido)}</CellMonoMuted>,
    },
    {
      id: "chegada",
      label: "Chegada",
      sortable: true,
      width: "100px",
      render: (c) => <CellMonoMuted>{formatDateBR(c.dataChegada)}</CellMonoMuted>,
    },
    {
      id: "status",
      label: "Status",
      sortable: true,
      width: "110px",
      render: (c) => {
        const sc = statusConfig[c.status] || { label: c.status, variant: "secondary" as const };
        return (
          <Badge variant={sc.variant} dot>
            {sc.label}
          </Badge>
        );
      },
    },
    {
      id: "actions",
      label: "Ações",
      fixed: true,
      align: "center",
      width: "80px",
      render: (c) => (
        <CellActions>
          <CellActionButton
            title="Ver detalhes"
            icon={<Eye className="h-3.5 w-3.5" />}
            onClick={() => onView(c)}
          />
          <CellActionButton
            title="Excluir coleta"
            icon={<Trash2 className="h-3.5 w-3.5 text-[var(--fips-danger)]" />}
            onClick={() => onDelete(c.id)}
          />
        </CellActions>
      ),
    },
  ];
}
